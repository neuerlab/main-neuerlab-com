/* ─── SHARED FOOTER ──────────────────────────────────────────── */
(function () {
  var inSub = /\/journal\//.test(window.location.pathname);
  var base = inSub ? '../' : '';

  var footer = document.createElement('footer');
  footer.innerHTML =
    '<div class="footer-inner">' +
      '<div class="footer-top">' +
        '<div class="footer-brand">' +
          '<a href="' + base + 'index.html" class="footer-logo-link">' +
            '<span class="nav-logo-name">Neuer Lab</span>' +
            '<span class="nav-logo-sub">Mindset \u00b7 Spirituality \u00b7 Longevity</span>' +
          '</a>' +
        '</div>' +
        '<div class="footer-cols">' +
          '<div class="footer-col">' +
            '<div class="footer-col-label">Navigate</div>' +
            '<nav class="footer-nav footer-nav-col">' +
              '<a href="' + base + 'index.html#mission">Mission</a>' +
              '<a href="' + base + 'clarity.html">Pathways</a>' +
              '<a href="' + base + 'journal.html">Journal</a>' +
              '<a href="' + base + 'about.html">About</a>' +
              '<a href="' + base + 'index.html#contact">Connect</a>' +
            '</nav>' +
          '</div>' +
          '<div class="footer-col">' +
            '<div class="footer-col-label">Pathways</div>' +
            '<nav class="footer-nav footer-nav-col">' +
              '<a href="' + base + 'clarity.html">Mental Clarity</a>' +
              '<a href="' + base + 'clarity.html">Emotional Release</a>' +
              '<a href="' + base + 'clarity.html">Spiritual Connection</a>' +
              '<a href="' + base + 'clarity.html">Leadership Workshop</a>' +
            '</nav>' +
          '</div>' +
          '<div class="footer-col">' +
            '<div class="footer-col-label">Tools</div>' +
            '<nav class="footer-nav footer-nav-col">' +
              '<a href="' + base + 'affirmations.html">Daily Affirmations</a>' +
              '<a href="' + base + 'clarity.html">Find Your Path</a>' +
            '</nav>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="footer-bottom">' +
        '<div class="footer-copy">&copy; 2025 Neuer Lab &middot; All rights reserved</div>' +
        '<div class="footer-links">' +
          '<a href="' + base + 'terms.html">Terms</a>' +
          '<a href="' + base + 'privacy.html">Privacy</a>' +
        '</div>' +
      '</div>' +
    '</div>';

  document.body.appendChild(footer);
})();
