// ── DATA ─────────────────────────────────────────────────────
const MOODS = {
  calm:     { label:'At Ease',   icon:'◇', affirmation:'I am at peace with this moment.',        guidance:'Stay here. Let this deepen within you.',                          tag:'Peace'    },
  anxious:  { label:'Unsettled', icon:'△', affirmation:'I am safe right now.',                   guidance:'Slow your breath. Nothing is urgent.',                            tag:'Safety'   },
  lost:     { label:'Unclear',   icon:'◎', affirmation:'Clarity unfolds step by step.',          guidance:"You don't need the full path — just the next step.",              tag:'Clarity'  },
  focused:  { label:'Clear',     icon:'◆', affirmation:'My energy is directed and clear.',       guidance:'Use this momentum wisely.',                                       tag:'Focus'    },
  grateful: { label:'Open',      icon:'♡', affirmation:'I appreciate everything that is here.',  guidance:'Let this expand gently within you.',                              tag:'Gratitude'}
};

const HABITS = [
  { key:'breathwork', icon:'○', label:'Breath'    },
  { key:'silence',    icon:'—', label:'Stillness'  },
  { key:'movement',   icon:'≈', label:'Movement'  },
  { key:'gratitude',  icon:'✦', label:'Gratitude' }
];

// ── STATE ─────────────────────────────────────────────────────
let alignMood           = null;
let alignHabits         = [false, false, false, false];
let completionTriggered = false;
let habitsRevealed      = false;

// ── INIT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Date without year — timeless, not transactional
  document.getElementById('alignDate').textContent = new Date().toLocaleDateString('en-US', {
    weekday:'long', month:'long', day:'numeric'
  });
  buildHabits();
  restoreSession();
});

// ── BUILD HABITS GRID ─────────────────────────────────────────
function buildHabits() {
  const grid = document.getElementById('alignHabitsGrid');
  HABITS.forEach((h, i) => {
    const el = document.createElement('label');
    el.className = 'habit-item';
    el.innerHTML =
      `<input type="checkbox" data-idx="${i}">` +
      `<span class="habit-icon">${h.icon}</span>` +
      `<span class="habit-name">${h.label}</span>` +
      `<span class="habit-check">✓</span>`;
    el.querySelector('input').addEventListener('change', () => onHabitChange(i));
    grid.appendChild(el);
  });
}

// ── SESSION RESTORE ───────────────────────────────────────────
function restoreSession() {
  const savedDate = localStorage.getItem('nl_align_date');
  if (savedDate !== new Date().toDateString()) return;

  const mood   = localStorage.getItem('nl_align_mood');
  const habits = JSON.parse(localStorage.getItem('nl_align_habits') || 'null');

  if (mood && MOODS[mood]) {
    selectMood(mood, false);
    if (habits) {
      alignHabits = habits;
      document.querySelectorAll('.habit-item input').forEach((cb, i) => {
        cb.checked = habits[i] || false;
        cb.closest('.habit-item').classList.toggle('checked', habits[i] || false);
      });
      renderStreak();
      const count = habits.filter(Boolean).length;
      if (count === 4) {
        completionTriggered = true;
        showCompletionSilent();
      } else if (count >= 2) {
        showPartialMsg();
      }
    }
  }
}

// ── MOOD SELECTION ────────────────────────────────────────────
function selectMood(mood, save) {
  if (save === undefined) save = true;
  alignMood = mood;
  const data = MOODS[mood];

  // Highlight selected, dim others
  const moodGrid = document.getElementById('moodGrid');
  moodGrid.classList.add('has-selection');
  document.querySelectorAll('.mood-btn').forEach(btn =>
    btn.classList.toggle('selected', btn.dataset.mood === mood)
  );

  // Populate card content before revealing
  document.getElementById('alignAff').textContent     = data.affirmation;
  document.getElementById('alignGuide').textContent   = data.guidance;
  document.getElementById('alignMoodTag').textContent = data.tag;

  // Reveal card with transition
  const resp = document.getElementById('alignResponse');
  resp.style.display = 'block';
  requestAnimationFrame(() =>
    requestAnimationFrame(() =>
      document.getElementById('alignCard').classList.add('visible')
    )
  );

  // Reveal habits section — staggered, only once
  if (!habitsRevealed) {
    habitsRevealed = true;
    setTimeout(revealHabitsSection, 650);
  }

  if (save) {
    localStorage.setItem('nl_align_mood', mood);
    localStorage.setItem('nl_align_date', new Date().toDateString());
  }
}

// ── HABITS SECTION REVEAL (staggered) ────────────────────────
function revealHabitsSection() {
  const wrap  = document.getElementById('alignHabitsWrap');
  const label = document.getElementById('alignHabitsLabel');
  const foot  = document.getElementById('alignFoot');

  wrap.style.display = 'block';
  foot.style.display = 'block';

  // Expand the label divider line
  requestAnimationFrame(() =>
    requestAnimationFrame(() => label && label.classList.add('expand'))
  );

  // Stagger each habit card in
  document.querySelectorAll('.habit-item').forEach((item, i) =>
    setTimeout(() => item.classList.add('visible'), 80 + i * 90)
  );
}

// ── HABIT INTERACTION ─────────────────────────────────────────
function onHabitChange(idx) {
  const cb   = document.querySelector(`.habit-item input[data-idx="${idx}"]`);
  const item = cb.closest('.habit-item');

  alignHabits[idx] = cb.checked;
  item.classList.toggle('checked', cb.checked);

  // Subtle pulse on any toggle
  item.classList.remove('pulse');
  void item.offsetWidth; // force reflow to restart animation
  item.classList.add('pulse');
  item.addEventListener('animationend', () => item.classList.remove('pulse'), { once:true });

  localStorage.setItem('nl_align_habits', JSON.stringify(alignHabits));
  updateStreakCount();
  renderStreak();
  checkCompletionState();
}

// ── COMPLETION STATES ─────────────────────────────────────────
function checkCompletionState() {
  const count = alignHabits.filter(Boolean).length;

  if (count === 4) {
    hidePartialMsg();
    if (!completionTriggered) {
      completionTriggered = true;
      triggerFullCompletion();
    }
  } else if (count >= 2) {
    showPartialMsg();
  } else {
    hidePartialMsg();
  }
}

function showPartialMsg() {
  const el = document.getElementById('alignPartial');
  if (!el || el.classList.contains('visible')) return;
  el.style.display = 'block';
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('visible')));
}

function hidePartialMsg() {
  const el = document.getElementById('alignPartial');
  if (el) el.classList.remove('visible');
}

// Full completion: cascade of moments with intentional delays
function triggerFullCompletion() {
  // Soften everything above
  document.getElementById('alignInner').classList.add('all-done');

  const reveal = (id, delay) => setTimeout(() => {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.display = 'block';
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('visible')));
  }, delay);

  reveal('alignCompletion',  300);   // container appears (no visual)
  reveal('alignMoment',      600);   // "Take a moment. Notice how you feel now."
  reveal('alignReflection',  2600);  // "What feels different?"
  reveal('alignPhilosophy',  4400);  // philosophy lines
  reveal('alignReturnText',  6000);  // "Return tomorrow."
  reveal('alignDeeper',      7400);  // soft CTA
}

// Restore: show final state instantly, no cascade
function showCompletionSilent() {
  document.getElementById('alignInner').classList.add('all-done');
  ['alignCompletion','alignMoment','alignReflection','alignPhilosophy','alignReturnText','alignDeeper']
    .forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.style.display = 'block';
      el.classList.add('visible');
    });
}

// ── STREAK ────────────────────────────────────────────────────
function updateStreakCount() {
  if (!alignHabits.every(Boolean)) return;
  const today   = new Date().toDateString();
  const last    = localStorage.getItem('nl_align_streakDate');
  if (last === today) return;
  const streak  = parseInt(localStorage.getItem('nl_align_streak') || '0') + 1;
  localStorage.setItem('nl_align_streak', streak);
  localStorage.setItem('nl_align_streakDate', today);
}

function renderStreak() {
  const streak    = parseInt(localStorage.getItem('nl_align_streak') || '0');
  const completed = alignHabits.filter(Boolean).length;
  const el        = document.getElementById('alignStreak');
  if (!el) return;

  if (streak > 0) {
    const d = streak === 1 ? 'day' : 'days';
    el.innerHTML = `Streak: <strong>${streak}</strong> ${d} ✦`;
  } else if (completed === HABITS.length) {
    el.innerHTML = 'All practices complete ✦';
  } else {
    el.innerHTML = `Complete all ${HABITS.length} to begin your streak`;
  }
}
