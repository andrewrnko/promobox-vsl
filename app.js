/* PROMO BOX VSL funnel. Video slot config + quote form + sticky CTA. */

// ---- VSL slot ------------------------------------------------------------
// Set ONE of these when the 16:9 video arrives:
//   src:    '/assets/vsl.mp4'   (self-hosted mp4, plus a poster jpg)
//   embed:  'https://www.youtube.com/embed/XXXX' or a Vimeo/Wistia embed URL
const VSL = { src: '', poster: '', embed: '' };

const FORM_ENDPOINT = 'https://promobox-lead.sirjarvisthethird.workers.dev/api/lead';

(function vsl() {
  const box = document.getElementById('vsl');
  if (!box) return;
  const play = box.querySelector('.vsl-play');
  if (VSL.embed) {
    box.dataset.state = 'ready';
    play.addEventListener('click', () => {
      const f = document.createElement('iframe');
      f.src = VSL.embed + (VSL.embed.includes('?') ? '&' : '?') + 'autoplay=1&rel=0&playsinline=1';
      f.allow = 'autoplay; fullscreen; picture-in-picture';
      f.setAttribute('allowfullscreen', '');
      f.title = 'Promo Box video';
      box.appendChild(f);
      box.dataset.state = 'playing';
    });
    return;
  }
  if (VSL.src) {
    box.dataset.state = 'ready';
    const v = document.createElement('video');
    v.src = VSL.src; if (VSL.poster) v.poster = VSL.poster;
    v.playsInline = true; v.setAttribute('playsinline', ''); v.muted = true; v.loop = false; v.preload = 'auto';
    box.appendChild(v);
    const sound = document.getElementById('vsl-sound');
    if (VSL.poster) box.querySelector('.vsl-placeholder').style.background = `center/cover url("${VSL.poster}")`;
    const withSound = () => { v.muted = false; v.currentTime = 0; v.controls = true; sound.hidden = true; v.play(); };
    // QR visitors: try a muted autoplay so the video is already moving when the page opens.
    v.play().then(() => { box.dataset.state = 'playing'; sound.hidden = false; }).catch(() => { /* blocked: play button stays */ });
    play.addEventListener('click', () => { box.dataset.state = 'playing'; withSound(); });
    sound.addEventListener('click', withSound);
    v.addEventListener('click', () => { if (v.muted) withSound(); });
    v.addEventListener('ended', () => { document.getElementById('hero-cta').scrollIntoView({ behavior: 'smooth', block: 'center' }); });
    return;
  }
  // No video yet: the slot stays visible and labelled; the play button is inert.
  play.disabled = true; play.style.opacity = '.55'; play.style.cursor = 'default';
})();

// ---- sticky CTA (mobile) -------------------------------------------------
(function sticky() {
  const bar = document.getElementById('sticky-cta');
  const hero = document.getElementById('hero-cta');
  const quote = document.getElementById('quote');
  if (!bar || !hero || !quote || !('IntersectionObserver' in window)) return;
  let heroOut = false, quoteIn = false;
  const apply = () => { bar.hidden = !(heroOut && !quoteIn); };
  new IntersectionObserver(([e]) => { heroOut = !e.isIntersecting && e.boundingClientRect.top < 0; apply(); }, { threshold: 0 }).observe(hero);
  new IntersectionObserver(([e]) => { quoteIn = e.isIntersecting; apply(); }, { threshold: 0.15 }).observe(quote);
})();

// ---- quote form ----------------------------------------------------------
(function form() {
  const f = document.getElementById('quote-form');
  if (!f) return;
  const status = document.getElementById('form-status');
  const done = document.getElementById('form-done');
  const btn = f.querySelector('button[type=submit]');

  const need = (el, ok) => { el.setAttribute('aria-invalid', ok ? 'false' : 'true'); return ok; };

  f.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    status.textContent = '';
    const d = Object.fromEntries(new FormData(f).entries());
    let ok = true;
    ok = need(f.name, d.name.trim().length > 1) && ok;
    ok = need(f.phone, d.phone.replace(/\D/g, '').length >= 10) && ok;
    ok = need(f.need, !!d.need) && ok;
    if (!ok) { status.textContent = 'Name, a 10 digit phone number, and what you need are required.'; return; }

    btn.disabled = true; btn.textContent = 'Sending…';
    const payload = { ...d, page: location.href, ref: document.referrer, source: 'promobox-vsl' };
    try {
      const r = await fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!r.ok) throw new Error('http ' + r.status);
      f.hidden = true; done.hidden = false;
      done.scrollIntoView({ block: 'center', behavior: 'smooth' });
    } catch (e) {
      btn.disabled = false; btn.textContent = 'Send';
      status.innerHTML = 'That did not go through. Call or text <a href="tel:+14257379026">425-737-9026</a> and we will take it by phone.';
    }
  });
})();
