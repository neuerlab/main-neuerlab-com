/* ─── SHARED NAVBAR ──────────────────────────────────────────── */
(function () {
  var isAff = window.location.pathname.indexOf('affirmations') !== -1;
  var p     = isAff ? 'index.html' : '';

  var nav = document.createElement('nav');
  nav.id  = 'navbar';
  if (isAff) nav.classList.add('scrolled');
  nav.innerHTML =
    '<a href="index.html" class="nav-logo" id="navLogo">' +
      '<img src="assets/images/logo.avif" alt="Neuer Lab" class="nav-logo-img">' +
    '</a>' +
    '<ul class="nav-links">' +
      '<li><a href="' + p + '#mission">Mission</a></li>' +
      '<li><a href="' + p + '#offerings">Offerings</a></li>' +
      '<li><a href="' + p + '#about">About</a></li>' +
      '<li><a href="' + p + '#testimonials">Voices</a></li>' +
      '<li><a href="' + p + '#contact">Connect</a></li>' +
      '<li><a href="affirmations.html" class="nav-aff-link">✦ Affirmations</a></li>' +
    '</ul>' +
    '<button class="nav-burger" id="navBurger" aria-label="Menu">' +
      '<span></span><span></span><span></span>' +
    '</button>';

  var drawer    = document.createElement('div');
  drawer.className = 'nav-drawer';
  drawer.id        = 'navDrawer';
  drawer.innerHTML =
    '<a href="' + p + '#mission">Mission</a>' +
    '<a href="' + p + '#offerings">Offerings</a>' +
    '<a href="' + p + '#about">About</a>' +
    '<a href="' + p + '#testimonials">Voices</a>' +
    '<a href="' + p + '#contact">Connect</a>' +
    '<a href="affirmations.html" class="nav-aff-link">✦ Affirmations</a>';

  document.body.insertAdjacentElement('afterbegin', drawer);
  document.body.insertAdjacentElement('afterbegin', nav);
})();
