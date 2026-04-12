/* ─── SHARED FOOTER ──────────────────────────────────────────── */
(function () {
  const footer = document.createElement('footer');
  footer.innerHTML = `
    <div class="footer-inner">
      <div class="footer-brand">
        <a href="index.html">
          <img src="assets/images/logo.avif" alt="Neuer Lab" class="footer-logo">
        </a>
      </div>
      <nav class="footer-nav">
        <a href="index.html#mission">Mission</a>
        <a href="index.html#offerings">Offerings</a>
        <a href="index.html#about">About</a>
        <a href="affirmations.html">Affirmations</a>
        <a href="index.html#contact">Connect</a>
      </nav>
      <div class="footer-legal">
        <div class="footer-links">
          <a href="https://www.neuerlab.com/terms-and-conditions">Terms</a>
          <a href="https://www.neuerlab.com/privacy-policy">Privacy</a>
        </div>
        <div class="footer-copy">&copy; 2025 Neuer Lab &middot; All rights reserved</div>
      </div>
    </div>
  `;
  document.body.appendChild(footer);
})();
