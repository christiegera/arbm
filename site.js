/* Loads the shop's editable content files so the owner can change them without touching code.
   If anything fails to load, every page simply keeps the text already written in its HTML. */
(function () {
  var FILES = [
    'site-config.json',
    'content/shop-info.json',
    'content/services.json',
    'content/reviews.json',
    'content/about.json'
  ];

  function clean(v) { return typeof v === 'string' ? v.trim() : ''; }

  function setText(el, value) {
    el.textContent = value;
    if (value.indexOf('\n') !== -1) el.style.whiteSpace = 'pre-line';
  }

  function fillTemplate(tpl, vars) {
    var ok = true;
    var out = tpl.replace(/\\n/g, '\n').replace(/\{(\w+)\}/g, function (_, key) {
      var v = clean(vars[key]);
      if (!v) ok = false;
      return v;
    });
    return ok ? out : null;
  }

  function addPhoneVars(cfg, vars) {
    var digits = String(cfg.phone || '').replace(/\D/g, '');
    if (digits.length === 11 && digits.charAt(0) === '1') digits = digits.slice(1);
    if (digits.length !== 10) return;
    vars.phone_display = '(' + digits.slice(0, 3) + ') ' + digits.slice(3, 6) + '-' + digits.slice(6);
    vars.phone_href = 'sms:+1' + digits;
  }

  function showBanner(cfg) {
    var text = clean(cfg.banner_text);
    if (cfg.banner_enabled !== true || !text) return;
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

  function renderReviews(cfg) {
    var box = document.querySelector('[data-cms-reviews]');
    var list = cfg.reviews;
    if (!box || !Array.isArray(list)) return;
    var items = list.filter(function (r) { return r && clean(r.text); });
    if (!items.length) return;
    box.textContent = '';
    items.forEach(function (r) {
      var card = document.createElement('div');
      card.className = 'review-card';
      var stars = document.createElement('div');
      stars.className = 'review-stars';
      for (var i = 0; i < 5; i++) {
        var s = document.createElement('span');
        s.textContent = '★';
        stars.appendChild(s);
      }
      var p = document.createElement('p');
      p.className = 'review-text';
      p.textContent = '"' + clean(r.text) + '"';
      var who = document.createElement('div');
      who.className = 'review-author';
      who.textContent = clean(r.name) ? '— ' + clean(r.name) : '';
      var src = document.createElement('div');
      src.className = 'review-source';
      src.textContent = clean(r.source) || 'Google Review';
      card.appendChild(stars); card.appendChild(p); card.appendChild(who); card.appendChild(src);
      box.appendChild(card);
    });
  }

  function applyConfig(cfg) {
    var vars = {};
    Object.keys(cfg).forEach(function (k) { vars[k] = cfg[k]; });
    addPhoneVars(cfg, vars);

    document.querySelectorAll('[data-cms]').forEach(function (el) {
      var v = clean(cfg[el.getAttribute('data-cms')]);
      if (v) setText(el, v);
    });

    document.querySelectorAll('[data-cms-tpl]').forEach(function (el) {
      var v = fillTemplate(el.getAttribute('data-cms-tpl'), vars);
      if (v) setText(el, v);
    });

    if (vars.phone_href) {
      document.querySelectorAll('[data-cms-phone]').forEach(function (el) {
        el.setAttribute('href', vars.phone_href);
      });
    }

    document.querySelectorAll('[data-cms-list]').forEach(function (box) {
      var items = cfg[box.getAttribute('data-cms-list')];
      if (!Array.isArray(items)) return;
      items = items.map(function (x) { return clean(String(x == null ? '' : x)); })
                   .filter(function (x) { return x; });
      if (!items.length) return;
      var cls = box.getAttribute('data-cms-class') || '';
      box.textContent = '';
      items.forEach(function (text) {
        var d = document.createElement('div');
        d.className = cls;
        d.textContent = text;
        box.appendChild(d);
      });
    });

    renderReviews(cfg);
    showBanner(cfg);
  }

  Promise.all(FILES.map(function (f) {
    return fetch(f, { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : {}; })
      .catch(function () { return {}; });
  })).then(function (parts) {
    applyConfig(Object.assign.apply(null, [{}].concat(parts)));
  });
})();
