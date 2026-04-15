// ── AFFIRMATIONS DATA ─────────────────────────────────────────
const AFFS = [
  {text:"I love and approve of myself exactly as I am.",cat:"Self-Love"},
  {text:"I am worthy of love, joy, and abundance.",cat:"Worthiness"},
  {text:"All is well in my world. Everything is working out for my highest good.",cat:"Trust"},
  {text:"I release the past and live fully in the present moment.",cat:"Release"},
  {text:"I forgive myself for all past mistakes and move forward with love.",cat:"Forgiveness"},
  {text:"My body is a beloved friend. I listen to its wisdom and treat it with care.",cat:"Body"},
  {text:"I am in the perfect place at the perfect time, doing the perfect thing.",cat:"Trust"},
  {text:"Life supports me in every way. I am safe.",cat:"Safety"},
  {text:"Infinite intelligence guides me and shows me the way.",cat:"Guidance"},
  {text:"I prosper wherever I turn. I live in a loving, abundant universe.",cat:"Abundance"},
  {text:"I choose to make the rest of my life the best of my life.",cat:"Empowerment"},
  {text:"I am willing to release the need to be unworthy.",cat:"Worthiness"},
  {text:"I deserve all that is good. I release any need for suffering or struggle.",cat:"Self-Love"},
  {text:"I am healthy, whole, and complete.",cat:"Health"},
  {text:"Every experience I have is perfect for my growth.",cat:"Growth"},
  {text:"I am deeply fulfilled by all that I do.",cat:"Fulfillment"},
  {text:"I attract only loving and supportive people into my world.",cat:"Relationships"},
  {text:"My income is constantly increasing. I deserve prosperity.",cat:"Abundance"},
  {text:"I am at peace with where I am and excited about where I am going.",cat:"Peace"},
  {text:"I am grateful for this moment. Life is a gift.",cat:"Gratitude"},
  {text:"I release all criticism. I only give out that which I wish to receive.",cat:"Release"},
  {text:"I lovingly take care of my body, my mind, and my soul.",cat:"Body"},
  {text:"I am free from the past. I live in the glorious now.",cat:"Freedom"},
  {text:"Love flows to me and through me in an endless stream.",cat:"Love"},
  {text:"I trust the process of life to bring only good to me.",cat:"Trust"},
  {text:"I am willing to change and to grow. Life supports all changes.",cat:"Growth"},
  {text:"I move through life with ease, joy, and grace.",cat:"Ease"},
  {text:"I am open and receptive to all the good life has to offer.",cat:"Abundance"},
  {text:"My heart is open. I speak with love. I am safe.",cat:"Safety"},
  {text:"I forgive everyone in my past for all perceived wrongs.",cat:"Forgiveness"},
  {text:"I am enough. I have always been enough. I always will be enough.",cat:"Self-Love"},
  {text:"I now create a wonderful new job. My talents are recognized.",cat:"Empowerment"},
  {text:"I am connected to the infinite intelligence of the universe.",cat:"Guidance"},
  {text:"Every cell in my body vibrates with energy and health.",cat:"Health"},
  {text:"I face the future with confidence and joy.",cat:"Trust"},
  {text:"My unique gifts and talents are valued by the world.",cat:"Worthiness"},
  {text:"I wake each morning grateful for another day of life.",cat:"Gratitude"},
  {text:"I am willing to release all resistance and live in the flow of life.",cat:"Release"},
  {text:"My relationships are harmonious. I give and receive love freely.",cat:"Relationships"},
  {text:"I create a life filled with love. My loving thoughts create miracles.",cat:"Love"},
  {text:"I now go beyond other people's fears and limitations.",cat:"Freedom"},
  {text:"I stand on my own and I love and approve of myself.",cat:"Self-Love"},
  {text:"Deep at the centre of my being, there is an infinite well of love.",cat:"Love"},
  {text:"I am whole and perfect just as I was created.",cat:"Worthiness"},
  {text:"I choose thoughts that make me feel good.",cat:"Empowerment"},
  {text:"Every day in every way I am getting better and better.",cat:"Growth"},
  {text:"I am safe in the universe and all life loves and supports me.",cat:"Safety"},
  {text:"I attract miracles into my life. I open my arms to receive.",cat:"Abundance"},
  {text:"My mind is clear. My heart is open. My body is at peace.",cat:"Peace"},
  {text:"I am the love I seek. I am complete within myself.",cat:"Self-Love"}
];

// ── STATE ─────────────────────────────────────────────────────
let affIdx      = 0;
let affFavs     = JSON.parse(localStorage.getItem('nl_favs') || '[]');
let affSeen     = JSON.parse(localStorage.getItem('nl_seen') || '[]');
let affDaily    = [];
let affDotStart = 0;   // persistent dot-window start position
let affTimer    = null; // animation timeout handle

// ── SEEDED RNG ────────────────────────────────────────────────
function affSeeded(s) {
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}
function affGetDaily() {
  const d = new Date();
  const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  const rand = affSeeded(seed), pool = [...Array(50).keys()], out = [];
  while (out.length < 3) { const i = Math.floor(rand() * pool.length); out.push(pool.splice(i, 1)[0]); }
  return out;
}

// ── DISPLAY ───────────────────────────────────────────────────
// jump=true  → re-center dot window (Inspire Me / direct clicks)
// jump=false → scroll dot window only at edges (PREV / NEXT)
function affShow(idx, animate, jump) {
  affIdx = idx; // update immediately so rapid clicks chain correctly
  const card = document.getElementById('affCard'), a = AFFS[idx];
  const run = () => {
    document.getElementById('affNum').textContent = String(idx + 1).padStart(2, '0') + ' / 50';
    document.getElementById('affText').textContent = a.text;
    document.getElementById('affCat').textContent  = a.cat;
    if (!affSeen.includes(idx)) { affSeen.push(idx); localStorage.setItem('nl_seen', JSON.stringify(affSeen)); }
    affDots(jump); affMiniUpdate(); affFavUpdate();
    if (animate) card.classList.remove('out');
  };
  if (animate) {
    if (affTimer) clearTimeout(affTimer);
    card.classList.add('out');
    affTimer = setTimeout(() => { affTimer = null; run(); }, 360);
  } else run();
}

function affNav(dir)    { affShow((affIdx + dir + 50) % 50, true, false); }
function affRandom()    { let n; do { n = Math.floor(Math.random() * 50); } while (n === affIdx); affShow(n, true, true); }

function affToggleFav() {
  affFavs = affFavs.includes(affIdx) ? affFavs.filter(f => f !== affIdx) : [...affFavs, affIdx];
  localStorage.setItem('nl_favs', JSON.stringify(affFavs));
  affFavUpdate();
}
function affFavUpdate() {
  const b = document.getElementById('affFav');
  b.textContent = affFavs.includes(affIdx) ? '♥' : '♡';
  b.classList.toggle('active', affFavs.includes(affIdx));
}

function affDots(jump) {
  const W = 9;
  if (jump) {
    // Re-center window on affIdx (big jumps: Inspire Me, direct click)
    affDotStart = Math.max(0, Math.min(50 - W, affIdx - Math.floor(W / 2)));
  } else {
    // Lazy-scroll: only shift window when affIdx leaves the current range
    if (affIdx < affDotStart) affDotStart = affIdx;
    else if (affIdx >= affDotStart + W) affDotStart = affIdx - W + 1;
    affDotStart = Math.max(0, Math.min(50 - W, affDotStart));
  }
  const c = document.getElementById('affDots'); c.innerHTML = '';
  for (let i = affDotStart; i < affDotStart + W; i++) {
    const d = document.createElement('div');
    d.className = 'aff-dot' + (i === affIdx ? ' active' : '') + (affSeen.includes(i) && i !== affIdx ? ' viewed' : '');
    d.onclick = ((x) => () => affShow(x, true, true))(i);
    c.appendChild(d);
  }
}

function affMiniRender() {
  const c = document.getElementById('affMini'); c.innerHTML = '';
  affDaily.forEach(idx => {
    const a = AFFS[idx], el = document.createElement('div');
    el.className = 'aff-mini' + (idx === affIdx ? ' active' : '');
    el.innerHTML = '<div class="aff-mini-cat">' + a.cat + '</div><div class="aff-mini-text">' + a.text + '</div>';
    el.onclick = () => affShow(idx, true, true);
    c.appendChild(el);
  });
}
function affMiniUpdate() {
  document.querySelectorAll('.aff-mini').forEach((el, i) => el.classList.toggle('active', affDaily[i] === affIdx));
}

// ── INIT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('affDate').textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  affDaily = affGetDaily();
  affIdx   = affDaily[0];
  affShow(affIdx, false, true);
  affMiniRender();
});

// ── KEYBOARD ──────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft')  affNav(-1);
  if (e.key === 'ArrowRight') affNav(1);
});
