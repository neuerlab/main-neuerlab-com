// ── DATA ─────────────────────────────────────────────────────
const MOODS = {
  calm:     { icon:'◇', affirmation:'I am at peace with this moment.',              guidance:'Stay here. Let this deepen.',                         tag:'Peace'    },
  anxious:  { icon:'△', affirmation:'I am safe right now.',                         guidance:'Slow your breath. Nothing is urgent.',                tag:'Safety'   },
  lost:     { icon:'◎', affirmation:'Clarity unfolds step by step.',                guidance:"You don't need the full path — just the next step.",  tag:'Clarity'  },
  focused:  { icon:'◆', affirmation:'My energy is directed and clear.',             guidance:'Use this momentum wisely.',                           tag:'Focus'    },
  grateful: { icon:'♡', affirmation:'I appreciate everything that is here.',        guidance:'Let gratitude expand through you.',                   tag:'Gratitude'}
};

const HABITS = [
  { key:'breathwork', icon:'○',  label:'Breathwork' },
  { key:'silence',    icon:'—',  label:'Silence'    },
  { key:'movement',   icon:'≈',  label:'Movement'   },
  { key:'gratitude',  icon:'✦',  label:'Gratitude'  }
];

// ── STATE ─────────────────────────────────────────────────────
let alignMood   = null;
let alignHabits = [false, false, false, false];

// ── INIT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('alignDate').textContent = new Date().toLocaleDateString('en-US', {
    weekday:'long', year:'numeric', month:'long', day:'numeric'
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
    }
  }
}

// ── MOOD SELECTION ────────────────────────────────────────────
function selectMood(mood, save) {
  if (save === undefined) save = true;
  alignMood = mood;
  const data = MOODS[mood];

  // Update button states
  document.querySelectorAll('.mood-btn').forEach(btn =>
    btn.classList.toggle('selected', btn.dataset.mood === mood)
  );

  // Fill response card
  document.getElementById('alignAff').textContent    = data.affirmation;
  document.getElementById('alignGuide').textContent  = data.guidance;
  document.getElementById('alignMoodTag').textContent = data.tag;

  // Reveal panels
  const resp = document.getElementById('alignResponse');
  const wrap = document.getElementById('alignHabitsWrap');
  const foot = document.getElementById('alignFoot');
  resp.style.display = 'block';
  wrap.style.display = 'block';
  foot.style.display = 'block';

  // Trigger transition on next paint
  requestAnimationFrame(() =>
    requestAnimationFrame(() =>
      document.getElementById('alignCard').classList.add('visible')
    )
  );

  if (save) {
    localStorage.setItem('nl_align_mood', mood);
    localStorage.setItem('nl_align_date', new Date().toDateString());
  }
}

// ── HABIT CHANGE ──────────────────────────────────────────────
function onHabitChange(idx) {
  const cb = document.querySelector(`.habit-item input[data-idx="${idx}"]`);
  alignHabits[idx] = cb.checked;
  cb.closest('.habit-item').classList.toggle('checked', cb.checked);
  localStorage.setItem('nl_align_habits', JSON.stringify(alignHabits));
  updateStreakCount();
  renderStreak();
}

// ── STREAK LOGIC ──────────────────────────────────────────────
function updateStreakCount() {
  if (!alignHabits.every(v => v)) return;
  const today     = new Date().toDateString();
  const lastDate  = localStorage.getItem('nl_align_streakDate');
  if (lastDate === today) return; // already awarded today
  const streak = parseInt(localStorage.getItem('nl_align_streak') || '0') + 1;
  localStorage.setItem('nl_align_streak', streak);
  localStorage.setItem('nl_align_streakDate', today);
}

function renderStreak() {
  const streak    = parseInt(localStorage.getItem('nl_align_streak') || '0');
  const completed = alignHabits.filter(Boolean).length;
  const el        = document.getElementById('alignStreak');
  if (streak > 0) {
    const dayWord = streak === 1 ? 'day' : 'days';
    el.innerHTML  = `Streak: <strong>${streak}</strong> ${dayWord} ✦`;
  } else if (completed === HABITS.length) {
    el.innerHTML  = 'All habits complete — your streak begins tomorrow ✦';
  } else {
    el.innerHTML  = `Complete all ${HABITS.length} habits to build your streak`;
  }
}
