// ── DATA ─────────────────────────────────────────────────────
const MOODS = {
  calm: {
    label:'At Ease', icon:'◇', tag:'Peace',
    affirmation:'I am at peace with this moment.',
    guidance:'Stay here. Let this deepen within you.',
    habits:{
      breathwork: "Breathe in gently… and out, just as soft.",
      silence:    "Feel the steadiness in your body… the quiet balance.",
      movement:   "Let yourself arrive here.",
      gratitude:  "Nothing to fix, nothing to change."
    }
  },
  anxious: {
    label:'Unsettled', icon:'△', tag:'Safety',
    affirmation:'I am safe right now.',
    guidance:'Slow your breath. Nothing is urgent.',
    habits:{
      breathwork: "Take a slow breath in… and a longer breath out.",
      silence:    "Pause for a moment.",
      movement:   "Notice what feels restless… without naming it.",
      gratitude:  "You don't need to solve this right now… just soften around it."
    }
  },
  lost: {
    label:'Unclear', icon:'◎', tag:'Clarity',
    affirmation:'Clarity unfolds step by step.',
    guidance:"You don't need the full path — just the next step.",
    habits:{
      breathwork: "Breathe in… and out… without searching for answers.",
      silence:    "Notice the space between thoughts… even if it's brief.",
      movement:   "Gently slow things down.",
      gratitude:  "It's okay not to know yet."
    }
  },
  focused: {
    label:'Clear', icon:'◆', tag:'Focus',
    affirmation:'My energy is directed and clear.',
    guidance:'Use this momentum wisely.',
    habits:{
      breathwork: "Take a calm breath in… and out.",
      silence:    "Notice the sense of knowing… the steadiness of it.",
      movement:   "Feel how your body responds to this clarity.",
      gratitude:  "Trust what feels true right now."
    }
  },
  grateful: {
    label:'Open', icon:'♡', tag:'Gratitude',
    affirmation:'I appreciate everything that is here.',
    guidance:'Let this expand gently within you.',
    habits:{
      breathwork: "Breathe in… inviting… and out… releasing.",
      silence:    "Notice the space within you… wide and available.",
      movement:   "Bring awareness to your chest… soft and receptive.",
      gratitude:  "Rest in this openness… and let it expand."
    }
  }
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
      `<span class="habit-circle"></span>` +
      `<input type="checkbox" data-idx="${i}">` +
      `<span class="habit-icon">${h.icon}</span>` +
      `<span class="habit-name">${h.label}</span>` +
      `<span class="habit-hint" data-key="${h.key}"></span>`;
    el.querySelector('input').addEventListener('change', () => onHabitChange(i));
    grid.appendChild(el);
  });
}

// ── SESSION RESTORE ───────────────────────────────────────────
function restoreSession() {
  // Visual state always starts fresh — only streak persists across days
  renderStreak();
}

// ── HABIT RESET (on mood change) ─────────────────────────────
function resetHabits() {
  alignHabits         = [false, false, false, false];
  completionTriggered = false;

  // Uncheck all habit tiles
  document.querySelectorAll('.habit-item').forEach(item => {
    item.querySelector('input').checked = false;
    item.classList.remove('checked', 'pulse');
  });

  // Hide partial + completion sections
  hidePartialMsg();
  ['alignCompletion','alignMoment','alignReflection','alignPhilosophy','alignReturnText','alignDeeper']
    .forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.classList.remove('visible'); el.style.display = 'none'; }
    });

  // Lift the all-done softening
  document.getElementById('alignInner').classList.remove('all-done');

  // Reset progress counter
  renderProgress();

  // Clear saved habit state for today
  localStorage.removeItem('nl_align_habits');
}

// ── MOOD SELECTION ────────────────────────────────────────────
function selectMood(mood, save) {
  if (save === undefined) save = true;

  // If switching moods after habits are visible, reset habit state
  if (habitsRevealed && mood !== alignMood) resetHabits();

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

  // Per-habit hints — update each time mood changes
  document.querySelectorAll('.habit-hint').forEach(el => {
    el.textContent = data.habits[el.dataset.key] || '';
  });

  // Reveal (or re-animate) card
  const card = document.getElementById('alignCard');
  const resp = document.getElementById('alignResponse');
  resp.style.display = 'block';
  // Remove visible first so CSS animations replay on mood switch
  card.classList.remove('visible');
  requestAnimationFrame(() =>
    requestAnimationFrame(() => card.classList.add('visible'))
  );

  // Reveal bridge + habits — only once
  if (!habitsRevealed) {
    habitsRevealed = true;
    // Bridge appears after affirmation settles
    setTimeout(() => {
      const bridge = document.getElementById('alignBridge');
      if (bridge) {
        bridge.style.display = 'block';
        requestAnimationFrame(() => requestAnimationFrame(() => bridge.classList.add('visible')));
      }
      // Habits follow immediately after bridge paints
      setTimeout(revealHabitsSection, 120);
    }, 700);
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
  renderProgress();

  // Double-rAF: let display:block paint before triggering transitions
  requestAnimationFrame(() => requestAnimationFrame(() => {
    label && label.classList.add('expand');
    // Stagger each habit card in
    document.querySelectorAll('.habit-item').forEach((item, i) =>
      setTimeout(() => item.classList.add('visible'), i * 90)
    );
  }));
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
  renderProgress();
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
  renderProgress();
  ['alignCompletion','alignMoment','alignReflection','alignPhilosophy','alignReturnText','alignDeeper']
    .forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.style.display = 'block';
      el.classList.add('visible');
    });
}

// ── PROGRESS COUNTER ──────────────────────────────────────────
function renderProgress() {
  const el = document.getElementById('alignProgress');
  if (!el) return;
  const count = alignHabits.filter(Boolean).length;
  const total = HABITS.length;

  if (count === 0) {
    el.innerHTML = 'Tap each practice to mark it complete';
  } else if (count < total) {
    el.innerHTML = `<span class="progress-num">${count}</span> of ${total} complete`;
  } else {
    el.innerHTML = `<span class="progress-num">${total} of ${total}</span> — loop closed ✦`;
  }
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
  const streak = parseInt(localStorage.getItem('nl_align_streak') || '0');
  const el     = document.getElementById('alignStreak');
  if (!el) return;
  // Only show streak when it exists — progress counter handles the rest
  el.innerHTML = streak > 0
    ? `Streak: <strong>${streak}</strong> ${streak === 1 ? 'day' : 'days'} ✦`
    : '';
}
