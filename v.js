/* PROMO BOX VSL — shared engine for the low-friction variants.
   Page sets window.PB_CFG = { id, need, tag, offer } before this file loads.
   Lead capture is one tap: return visitors submit on the button press with no form at all;
   first-timers get a sheet that auto-submits the instant the browser autofills it. */
(function () {
  var CFG = window.PB_CFG || {};
  var ENDPOINT = 'https://promobox-lead.sirjarvisthethird.workers.dev/api/lead';
  var TEL = '+14257379026', TELV = '425-737-9026';
  var STORE = 'pb_lead_v1';

  function $(s, r) { return (r || document).querySelector(s); }
  function el(t, c) { var e = document.createElement(t); if (c) e.className = c; return e; }
  function saved() { try { return JSON.parse(localStorage.getItem(STORE) || 'null'); } catch (e) { return null; } }
  function save(d) { try { localStorage.setItem(STORE, JSON.stringify(d)); } catch (e) {} }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function ok(d) { return (d.phone || '').replace(/\D/g, '').length >= 10 || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email || ''); }

  /* ---------------- video: muted autoplay, one tap for loud sound ---------------- */
  var vidBox = $('#vid');
  if (vidBox) {
    var v = $('video', vidBox), veil = $('#veil', vidBox), label = $('.v-veil-label', vidBox), fired = false;
    v.muted = true; v.playsInline = true; v.setAttribute('playsinline', '');
    v.play().then(function () { label.textContent = 'Tap for sound'; })
            .catch(function () { label.textContent = 'Tap to play'; });
    veil.addEventListener('click', function () {
      vidBox.dataset.state = 'playing';
      v.muted = false; v.volume = 1; v.currentTime = 0; v.controls = true;
      var p = v.play(); if (p && p.catch) p.catch(function () {});
    });
    v.addEventListener('ended', function () {
      if (fired) return; fired = true;
      if (typeof window.PB_ON_END === 'function') window.PB_ON_END();
      var cta = $('#cta-zone');
      if (cta) {
        cta.scrollIntoView({ behavior: 'smooth', block: 'center' });
        var b = $('.btn', cta); if (b) { b.classList.remove('hot'); void b.offsetWidth; b.classList.add('hot'); }
      }
    });
  }

  /* ---------------- sheet ---------------- */
  var sheet = null, form = null, statusEl = null, ctx = {}, sending = false;

  function build() {
    sheet = el('div', 'sheet'); sheet.hidden = true;
    sheet.innerHTML = '<div class="sheet-card"><button class="sheet-close" type="button" aria-label="Close">&times;</button>' +
      '<div class="sheet-grab"></div><div class="sheet-body"></div></div>';
    document.body.appendChild(sheet);
    sheet.addEventListener('click', function (e) { if (e.target === sheet) close(); });
    $('.sheet-close', sheet).addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && sheet && !sheet.hidden) close(); });
  }
  function body() { if (!sheet) build(); return $('.sheet-body', sheet); }
  function show() { sheet.hidden = false; document.body.style.overflow = 'hidden'; }
  function close() { if (sheet) { sheet.hidden = true; document.body.style.overflow = ''; } }

  /* first-timer: three prefilled-by-browser fields that submit themselves */
  function askForm() {
    var pick = ('contacts' in navigator && 'ContactsManager' in window);
    body().innerHTML =
      '<h3>One tap and it is yours.</h3>' +
      '<p class="sheet-sub">' + esc(CFG.offer || '10% off your next order') + '. Tap the autofill bar on your keyboard.</p>' +
      (pick ? '<button class="pick-btn" type="button" id="pick">Use my contact card</button>' : '') +
      '<form id="pb-form" novalidate>' +
        '<label>Name<input type="text" name="name" autocomplete="name" enterkeyhint="next"></label>' +
        '<label>Mobile<input type="tel" name="phone" autocomplete="tel" inputmode="tel" enterkeyhint="next"></label>' +
        '<label><span class="lbl">Email <span class="opt">(optional)</span></span><input type="email" name="email" autocomplete="email" inputmode="email" enterkeyhint="send"></label>' +
        '<div class="hp" aria-hidden="true"><label>Website<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>' +
      '</form>' +
      '<button class="btn btn-primary btn-lg" type="button" id="pb-send">' + esc(CFG.cta || 'Send it') + '</button>' +
      '<p class="sheet-status" id="pb-status"></p>' +
      '<p class="sheet-micro">Or call <a href="tel:' + TEL + '">' + TELV + '</a>. No spam, no list.</p>';

    form = $('#pb-form', sheet); statusEl = $('#pb-status', sheet);
    $('#pb-send', sheet).addEventListener('click', function () { submit(read(), true); });
    form.addEventListener('submit', function (e) { e.preventDefault(); submit(read(), true); });
    form.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); submit(read(), true); } });
    var pb = $('#pick', sheet);
    if (pb) pb.addEventListener('click', contactPick);

    /* autofill watcher: a browser fills every field at once, a human cannot.
       Two or more fields changing inside 400ms means autofill, so send it without another tap. */
    var hits = 0, t = null;
    form.addEventListener('input', function () {
      hits++;
      clearTimeout(t);
      t = setTimeout(function () {
        var d = read();
        if (hits >= 2 && d.name && ok(d)) submit(d, false);
        hits = 0;
      }, 400);
    });
    setTimeout(function () { try { form.name.focus(); } catch (e) {} }, 280);
  }

  function read() {
    var d = {};
    Array.prototype.forEach.call(form.elements, function (i) { if (i.name) d[i.name] = (i.value || '').trim(); });
    return d;
  }

  function contactPick() {
    navigator.contacts.select(['name', 'tel', 'email'], { multiple: false }).then(function (r) {
      if (!r || !r.length) return;
      var c = r[0];
      if (c.name && c.name[0]) form.name.value = c.name[0];
      if (c.tel && c.tel[0]) form.phone.value = c.tel[0];
      if (c.email && c.email[0]) form.email.value = c.email[0];
      var d = read(); if (d.name && ok(d)) submit(d, false);
    }).catch(function () {});
  }

  function sendingState() {
    body().innerHTML = '<div class="sheet-done"><div class="done-mark spin"><svg viewBox="0 0 24 24" width="26" height="26">' +
      '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="40 20"/></svg></div>' +
      '<h3>Sending…</h3></div>';
  }

  function doneState() {
    body().innerHTML = '<div class="sheet-done">' +
      '<div class="done-mark"><svg viewBox="0 0 24 24" width="30" height="30"><path d="M4 12.5l5.2 5.2L20 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>' +
      '<h3>Submitted.</h3>' +
      '<p>' + esc(CFG.offer || '10% off your next order') + '. We will call or text within one business day.<br>Need it faster? <a href="tel:' + TEL + '">' + TELV + '</a>.</p>' +
      '<button class="sheet-edit" type="button" id="pb-reset">Wrong details?</button></div>';
    var r = $('#pb-reset', sheet);
    if (r) r.addEventListener('click', function () { try { localStorage.removeItem(STORE); } catch (e) {} askForm(); });
  }

  function submit(d, manual) {
    if (sending) return;
    if (!d.name || !ok(d)) {
      if (statusEl) { statusEl.textContent = 'A name and a mobile number is all we need.'; try { form.phone.focus(); } catch (e) {} }
      return;
    }
    sending = true;
    var btn = $('#pb-send', sheet);
    if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
    if (!manual) sendingState();

    var payload = {
      name: d.name, phone: d.phone, email: d.email, website: d.website || '',
      need: ctx.need || CFG.need || 'Not sure yet',
      description: '[' + (CFG.tag || 'Promo Box VSL') + ' · ' + (CFG.offer || '10% off') + ']' + (ctx.note ? ' ' + ctx.note : ''),
      page: location.href, ref: document.referrer, source: 'promobox-vsl-' + (CFG.id || 'v')
    };
    fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      .then(function (r) { if (!r.ok) throw new Error(r.status); })
      .then(function () { sending = false; save({ name: d.name, phone: d.phone, email: d.email }); doneState(); })
      .catch(function () {
        sending = false;
        askForm();
        form.name.value = d.name || ''; form.phone.value = d.phone || ''; form.email.value = d.email || '';
        statusEl.innerHTML = 'That did not go through. Tap send again, or call <a href="tel:' + TEL + '">' + TELV + '</a>.';
      });
  }

  /* the button: known visitor goes straight through, everyone else gets the sheet */
  function open(extra) {
    ctx = extra || {};
    if (!sheet) build();
    var s = saved();
    show();
    if (s && s.name && ok(s)) { submit(s, false); } else { askForm(); }
  }

  window.PB = { open: open, close: close };

  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('[data-pb]') : null;
    if (!t) return;
    e.preventDefault();
    open({ need: t.getAttribute('data-need') || undefined, note: t.getAttribute('data-note') || undefined });
  });
})();
