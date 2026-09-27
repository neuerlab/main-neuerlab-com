// ─── AGENT VIEW ────────────────────────────────────────────────
// Human/Agent audience toggle. When Agent mode is active, the page's human
// content is hidden and a Markdown view of /neuer-lab.md is shown instead.
// #agent in the URL opens Agent view directly, and is the only thing that does; the
// choice is never stored, so it never outlives the visit.

(function () {
  'use strict';

  var KEY = 'nl-mode'; // legacy key, only read to delete it
  var mdLoaded = false;
  var mdText = '';

  // Build the agent-view section and insert it right after the <body> opening,
  // so it sits beneath the navbar when active.
  function buildAgentView() {
    if (document.getElementById('agent-view')) return;

    var section = document.createElement('section');
    section.id = 'agent-view';
    section.className = 'agent-view';
    section.setAttribute('aria-labelledby', 'agent-title-h');
    section.innerHTML =
      '<div class="agent-wrap">' +
        '<div class="agent-eyebrow"><span aria-hidden="true">&gt;_</span> Agent view</div>' +
        '<h1 class="agent-title" id="agent-title-h">Neuer Lab,<br><em>in Markdown.</em></h1>' +
        '<p class="agent-explain">A factual summary of the entire site in plain text, for people and AI systems. No hidden instructions, just reference material.</p>' +
        '<div class="agent-actions">' +
          '<button type="button" class="agent-copy" id="agentCopyBtn">Copy Markdown</button>' +
          '<a class="agent-download" href="/neuer-lab.md" download>Download .md</a>' +
          '<button type="button" class="agent-back" id="agentBackBtn">Back to human view</button>' +
        '</div>' +
        '<pre class="md-view" id="md-view" tabindex="0" aria-label="Neuer Lab in Markdown"></pre>' +
      '</div>';

    document.body.insertBefore(section, document.body.firstChild);
  }

  function loadMarkdown(cb) {
    if (mdLoaded) { cb(); return; }
    var req = new XMLHttpRequest();
    req.open('GET', '/neuer-lab.md', true);
    req.onload = function () {
      if (req.status >= 200 && req.status < 300) {
        mdText = req.responseText;
      } else {
        mdText = 'Error loading neuer-lab.md (HTTP ' + req.status + ')';
      }
      mdLoaded = true;
      var view = document.getElementById('md-view');
      if (view) view.textContent = mdText;
      cb();
    };
    req.onerror = function () {
      mdText = 'Network error loading neuer-lab.md';
      mdLoaded = true;
      var view = document.getElementById('md-view');
      if (view) view.textContent = mdText;
      cb();
    };
    req.send();
  }

  function apply(mode) {
    if (mode === 'agent') {
      loadMarkdown(function () {
        document.body.classList.add('agent-active');
        window.scrollTo(0, 0);
      });
    } else {
      document.body.classList.remove('agent-active');
    }
  }

  function setMode(mode, opts) {
    opts = opts || {};
    apply(mode);
    // Deliberately not persisted across visits. The URL is the state, so a shared #agent link
    // keeps working and a reload stays put, while a fresh visit always opens the human site.
    if (window.history.replaceState) {
      if (mode === 'agent' && location.hash !== '#agent') {
        window.history.replaceState(null, '', location.pathname + location.search + '#agent');
      } else if (mode !== 'agent' && location.hash === '#agent') {
        window.history.replaceState(null, '', location.pathname + location.search);
      }
    }
    if (opts.scroll) window.scrollTo(0, 0);
  }

  // Buttons
  document.addEventListener('click', function (e) {
    if (e.target && e.target.id === 'agentCopyBtn') {
      var view = document.getElementById('md-view');
      var text = view ? view.textContent.trim() : '';
      var btn = e.target;
      var label = btn.textContent;
      var done = function () {
        btn.textContent = 'Copied';
        setTimeout(function () { btn.textContent = label; }, 2000);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, done);
      } else {
        done();
      }
    }
    if (e.target && e.target.id === 'agentBackBtn') {
      setMode('human', { scroll: true });
    }
    // Footer link
    if (e.target && e.target.classList && e.target.classList.contains('footer-agent-link')) {
      e.preventDefault();
      setMode('agent', { scroll: true });
    }
  });

  // Hash-based activation
  window.addEventListener('hashchange', function () {
    if (location.hash === '#agent') setMode('agent', { scroll: true });
  });

  // Init on DOMContentLoaded
  function init() {
    buildAgentView();

    // Clear the preference this script used to store, so anyone still carrying it is released
    // from agent view on their next visit.
    try { localStorage.removeItem(KEY); } catch (e) {}
    apply(location.hash === '#agent' ? 'agent' : 'human');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
