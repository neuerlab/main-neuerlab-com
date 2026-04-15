// ── NAV SCROLL ────────────────────────────────────────────────
var navbar  = document.getElementById('navbar');
var hasHero = !!document.getElementById('hero');
if (hasHero) {
  window.addEventListener('scroll', function () {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  });
}

// ── MOBILE DRAWER ─────────────────────────────────────────────
function toggleDrawer() {
  var d    = document.getElementById('navDrawer');
  var b    = document.getElementById('navBurger');
  var open = d.classList.toggle('open');
  b.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
}
function closeDrawer() {
  document.getElementById('navDrawer').classList.remove('open');
  document.getElementById('navBurger').classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('navBurger').addEventListener('click', toggleDrawer);
document.querySelectorAll('.nav-drawer a').forEach(function (a) {
  a.addEventListener('click', closeDrawer);
});
document.addEventListener('click', function (e) {
  if (!e.target.closest('nav') && !e.target.closest('.nav-drawer')) closeDrawer();
});

// ── SCROLL REVEAL ─────────────────────────────────────────────
var revObs = new IntersectionObserver(function (entries) {
  entries.forEach(function (e) {
    if (e.isIntersecting) { e.target.classList.add('visible'); revObs.unobserve(e.target); }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -32px 0px' });
document.querySelectorAll('.reveal').forEach(function (el) { revObs.observe(el); });
setTimeout(function () {
  document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('visible'); });
}, 300);

// ── TOOLS DROPDOWN ────────────────────────────────────────────
var toolsTrigger = document.getElementById('navToolsTrigger');
var toolsItem    = toolsTrigger && toolsTrigger.closest('.nav-tools-item');

function openTools()  { if (!toolsItem) return; toolsItem.classList.add('open');    toolsTrigger.setAttribute('aria-expanded','true');  }
function closeTools() { if (!toolsItem) return; toolsItem.classList.remove('open'); toolsTrigger.setAttribute('aria-expanded','false'); }
function toggleTools(e) { e.stopPropagation(); toolsItem.classList.contains('open') ? closeTools() : openTools(); }

if (toolsTrigger) toolsTrigger.addEventListener('click', toggleTools);
document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeTools(); });
document.addEventListener('click',   function(e) { if (toolsItem && !toolsItem.contains(e.target)) closeTools(); });
document.querySelectorAll('.nav-tool-featured, .nav-tool-item').forEach(function(a) {
  a.addEventListener('click', closeTools);
});

// ── ACTIVE NAV HIGHLIGHT ──────────────────────────────────────
var navLinks = document.querySelectorAll('.nav-links a:not(.nav-tools-trigger)');
var secObs   = new IntersectionObserver(function (entries) {
  entries.forEach(function (e) {
    if (e.isIntersecting) {
      navLinks.forEach(function (a) { a.style.color = ''; });
      var active = document.querySelector('.nav-links a[href="#' + e.target.id + '"]');
      if (active) active.style.color = 'var(--gold)';
    }
  });
}, { threshold: 0.35 });
document.querySelectorAll('section[id]').forEach(function (s) { secObs.observe(s); });
