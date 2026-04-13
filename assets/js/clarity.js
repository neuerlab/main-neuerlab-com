/* ─── PRE-SESSION CLARITY TOOL ──────────────────────────────── */
var paths = {
  mental: {
    label: 'Path: Mental Clarity',
    title: 'Mental Clarity',
    desc: 'For those navigating mental fog, limiting beliefs, or performance plateaus. Together we dissolve what holds you back and install new ways of thinking, being, and achieving.',
    affirmation: '"My mind is clear, focused, and open to what is possible."',
    practice: 'Sit quietly for a moment. Place your hand on your chest. Ask yourself: What thought am I ready to release today? Simply breathe with whatever arises. No force. No analysis.',
    cta: 'https://calendar.app.google/biqbVJuuzFLTgKoy7',
    ctaLabel: 'Begin your work with me',
    ctaSecondary: 'mailto:office@neuerlab.com',
    ctaSecondaryLabel: "Let's connect"
  },
  emotional: {
    label: 'Path: Emotional Release',
    title: 'Emotional Release',
    desc: 'For those carrying stored grief, emotional weight, or a sense of being stuck in feeling. This work creates safe, held space for what needs to move through you.',
    affirmation: '"It is safe to feel. It is safe to release. I am held."',
    practice: 'Press both hands gently to your heart. Breathe into that space. Allow whatever emotion is present — without judgment — for just one minute. You do not need to solve anything.',
    cta: 'https://calendar.app.google/biqbVJuuzFLTgKoy7',
    ctaLabel: 'Begin your work with me',
    ctaSecondary: 'mailto:office@neuerlab.com',
    ctaSecondaryLabel: "Let's connect"
  },
  spiritual: {
    label: 'Path: Spiritual Connection',
    title: 'Spiritual Connection',
    desc: 'Spirit transcends geography. I call in the energies of those who have passed — for conversation, solace, and clarity. Evidence-based, deeply tender, and real.',
    affirmation: '"I am held by love that transcends all form."',
    practice: 'Bring to mind someone you love — living or passed. Feel the quality of that connection in your chest. Notice: that feeling is real. It has not gone anywhere. It is unbroken.',
    cta: 'mailto:office@neuerlab.com',
    ctaLabel: 'Write to Nicola',
    ctaSecondary: 'https://calendar.app.google/biqbVJuuzFLTgKoy7',
    ctaSecondaryLabel: 'Book a call first'
  }
};

var step1  = document.getElementById('step1');
var result = document.getElementById('result');

function selectPath(key) {
  var p = paths[key];
  document.getElementById('resultLabel').textContent    = p.label;
  document.getElementById('resultTitle').textContent    = p.title;
  document.getElementById('resultDesc').textContent     = p.desc;
  document.getElementById('resultAff').textContent      = p.affirmation;
  document.getElementById('resultPractice').textContent = p.practice;

  var cta = document.getElementById('resultCta');
  cta.href        = p.cta;
  cta.textContent = p.ctaLabel;
  if (p.cta.indexOf('http') === 0) cta.target = '_blank'; else cta.removeAttribute('target');

  var ctaS = document.getElementById('resultCtaSecondary');
  ctaS.href        = p.ctaSecondary;
  ctaS.textContent = p.ctaSecondaryLabel;
  if (p.ctaSecondary.indexOf('http') === 0) ctaS.target = '_blank'; else ctaS.removeAttribute('target');

  step1.classList.add('exit');
  setTimeout(function () {
    step1.style.display = 'none';
    result.style.display = 'block';
    setTimeout(function () {
      result.classList.add('visible');
    }, 30);
  }, 400);
}

function resetTool() {
  result.classList.remove('visible');
  setTimeout(function () {
    result.style.display = 'none';
    step1.style.display  = 'block';
    step1.classList.remove('exit');
  }, 400);
}

document.querySelectorAll('.clarity-choice').forEach(function (btn) {
  btn.addEventListener('click', function () {
    selectPath(this.dataset.path);
  });
});

document.getElementById('resultBack').addEventListener('click', resetTool);
