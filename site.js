/* Loads site-config.json so the shop owner can change notices without touching code.
   If the file can't be loaded, every page simply keeps the text already in its HTML. */
(function () {
  function applyConfig(cfg) {
    document.querySelectorAll('[data-cms]').forEach(function (el) {
      var value = cfg[el.getAttribute('data-cms')];
      if (typeof value === 'string' && value.trim() !== '') {
        el.textContent = value;
      }
    });

    var text = typeof cfg.banner_text === 'string' ? cfg.banner_text.trim() : '';
    if (cfg.banner_enabled === true && text) {
      var bar = document.createElement('div');
      bar.id = 'site-banner';
      bar.setAttribute('role', 'status');
      bar.textContent = text;
      bar.style.cssText =
        'position:fixed;top:67px;left:0;right:0;z-index:95;background:#FFF4ED;' +
        'color:#111;border-bottom:3px solid #FF5213;text-align:center;' +
        'font:700 15px/1.4 "DM Sans",system-ui,sans-serif;padding:12px 16px;';
      document.body.appendChild(bar);
      var pad = function () { document.body.style.paddingTop = bar.offsetHeight + 'px'; };
      pad();
      window.addEventListener('resize', pad);
    }
  }

  fetch('site-config.json', { cache: 'no-cache' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (cfg) { if (cfg) applyConfig(cfg); })
    .catch(function () { /* keep default HTML text */ });
})();
