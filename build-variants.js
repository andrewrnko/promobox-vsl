/* Emits the low-friction VSL variants into site/1 … site/10 + site/proof + site/quiz,
   plus site/variants.html (the chooser).
   Skeleton is fixed: announce bar, logo, headline, video, one button, footer. Nothing else.
   What changes per page: the headline and the offer on the button.
   Brand law: site/styles.css. Variant CSS: site/v.css. Engine: site/v.js (+ quiz.js). */
const fs = require('fs'), path = require('path');
const OUT = path.join(__dirname, 'site');
const TEL = '+14257379026', TELV = '425-737-9026';

/* ---------- the ten headline x offer combos ---------- */
const COMBOS = [
  { id: '1',  h1: 'Watch this video',                                  cta: 'Claim 10% Off',          offer: '10% off your next order' },
  { id: '2',  h1: 'Turn your sound <span class="em">on.</span>',        cta: 'Get My 10% Off',         offer: '10% off your next order' },
  { id: '3',  h1: 'Watch this before you put your <span class="em">phone away.</span>', cta: 'Yes, Send My 10% Off', offer: '10% off your next order' },
  { id: '4',  h1: 'Press <span class="em">play.</span>',                cta: '10% Off + Free Mockup',  offer: '10% off your next order plus a free mockup' },
  { id: '5',  h1: '35 seconds. <span class="em">That is it.</span>',    cta: 'Tap for 10% Off',        offer: '10% off your next order' },
  { id: '6',  h1: 'You found us. <span class="em">Watch this.</span>',  cta: 'Lock In My 10%',         offer: '10% off your next order' },
  { id: '7',  h1: 'Do not skip this one.',                              cta: 'Send Me My Discount',    offer: '10% off your next order' },
  { id: '8',  h1: 'Everything we make, in <span class="em">35 seconds.</span>', cta: 'Free Mockup + 10% Off', offer: 'a free mockup and 10% off your next order' },
  { id: '9',  h1: 'Watch this. Then tap the button.',                   cta: 'Claim It Before I Go',   offer: '10% off your next order' },
  { id: '10', h1: 'This is what we <span class="em">do.</span>',        cta: '10% Off, One Tap',       offer: '10% off your next order' },
];

/* ---------- extras ---------- */
const EXTRAS = [
  { id: 'proof', h1: 'Watch this video', cta: 'Claim 10% Off', offer: '10% off your next order', proof: true,
    note: 'Simple page plus a wall of work photos and reviews under the button. No copy.' },
  { id: 'quiz',  h1: 'Watch this video', offer: '10% off your next order', quiz: true,
    note: 'No button. Three multiple choice taps under the video, then the autofill sheet.' },
];

const PHOTOS = [
  ['wraps/holymoly-van', 'Holy Moly van wrap'], ['shop/embroidery-caps', 'Embroidered caps'],
  ['wraps/mayster-van', 'Mayster van wrap'], ['shop/sign-septic', 'Septic Solutions sign'],
  ['wraps/coolcat-truck', 'Cool Cat Fence truck wrap'], ['shop/apparel-hoodie', 'Custom printed hoodie'],
  ['wraps/legacy-decking-van', 'Legacy Decking van wrap'], ['shop/aframe-shop', 'A-frame sign'],
  ['wraps/productair-pickup', 'Product Air pickup wrap'], ['shop/embroidery-cap-fire', 'South County Fire cap'],
  ['wraps/stk-trailer', 'STK Construction trailer wrap'], ['shop/apparel-jacket', 'Embroidered work jacket'],
];
const REVIEWS = [
  ['PromoBox did an amazing job wrapping our plumbing truck. The quality of the wrap is outstanding, the installation was flawless, and the attention to detail really shows.', 'Stan'],
  ['We had Alta Group polos, T-shirts, button-down shirts, and hats embroidered. The quality of the embroidery is outstanding, the turnaround time was impressively fast.', 'Leonardo Leon'],
  ['These guys are amazing. They come through every time. Most recently I needed a banner made same day and they came through and saved my butt.', 'Chrystal Thompson'],
];
const QUIZ = [
  { q: 'What do you need?', k: 'need', a: ['Shirts &amp; apparel', 'Stickers &amp; decals', 'Signs or banners', 'Vehicle wrap or graphics', 'A few of these', 'Not sure yet'] },
  { q: 'How soon?',         k: 'when', a: ['This week', 'This month', 'Next few months', 'Just looking'] },
  { q: 'Who is it for?',    k: 'who',  a: ['My business', 'An event', 'A team or crew', 'Something personal'] },
];

const photoGrid = () => '<div class="grid">\n' + PHOTOS.map(([f, a]) =>
  `      <figure><img src="../assets/${f}-640.webp" srcset="../assets/${f}-640.webp 640w, ../assets/${f}-1200.webp 1200w" sizes="(min-width:720px) 25vw, 50vw" alt="${a}" loading="lazy" width="1200" height="900"></figure>`
).join('\n') + '\n    </div>';

const reviewStrip = () => '<div class="review-strip">\n' + REVIEWS.map(([q, n]) =>
  `      <blockquote><span class="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span><p>${q}</p><cite>${n}</cite></blockquote>`
).join('\n') + '\n    </div>';

const videoBlock = () => `<div class="v-video" id="vid" data-state="idle">
      <video src="../assets/vsl.mp4" poster="../assets/vsl-poster.jpg" preload="auto" playsinline muted></video>
      <button class="v-veil" id="veil" type="button" aria-label="Play the video with sound">
        <span class="v-veil-play"><svg viewBox="0 0 24 24" width="34" height="34" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg></span>
        <span class="v-veil-label">Tap for sound</span>
      </button>
    </div>`;

const ARROW = '<svg class="arrow" viewBox="0 0 24 32" aria-hidden="true"><path d="M12 2v26M4 20l8 9 8-9" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const quizBlock = () => `<section class="quiz" id="cta-zone">
    <div class="quiz-bar">${QUIZ.map((_, i) => `<span${i === 0 ? ' class="on"' : ''}></span>`).join('')}</div>
${QUIZ.map((s, i) => `    <div class="quiz-step${i === 0 ? ' on' : ''}" data-step="${i}" data-key="${s.k}">
      <p class="quiz-q">${s.q}</p>
      <div class="quiz-opts">
${s.a.map(a => `        <button class="opt-btn" type="button" data-val="${a}"><i>&#43;</i>${a}</button>`).join('\n')}
      </div>
${i > 0 ? '      <button class="quiz-back" type="button">Back</button>\n' : ''}    </div>`).join('\n')}
  </section>`;

const plain = s => s.replace(/<[^>]+>/g, '');

function page(v) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${plain(v.h1)} | Promo Box</title>
<meta name="description" content="One short video from the Promo Box shop in Everett. ${v.offer}.">
<meta name="robots" content="noindex, nofollow">
<meta property="og:title" content="${plain(v.h1)}">
<meta property="og:description" content="Vehicle wraps, embroidery, apparel, signs, banners, print. One Everett shop since 2008.">
<meta property="og:image" content="../assets/vsl-poster.jpg">
<link rel="icon" type="image/png" href="../assets/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;700;800;900&family=Instrument+Serif:ital@0;1&display=swap">
<link rel="stylesheet" href="../styles.css?v=2">
<link rel="stylesheet" href="../v.css?v=2">
</head>
<body class="v">

<div class="cmyk-bar" aria-hidden="true"><span></span><span></span><span></span><span></span></div>

<div class="announce"><div class="announce-inner">
  <span>Scanned at Lakeside Surf</span><span class="dot">&bull;</span><span>Everett, WA</span><span class="dot">&bull;</span><span>4.9 &#9733;</span>
</div></div>

<header class="v-head"><img src="../assets/logo.svg" alt="Promo Box Apparel &amp; Graphics" width="299" height="65"></header>

<main>
  <section class="stage">
    <h1>${v.h1}</h1>
    ${ARROW}
    ${videoBlock()}
  </section>
${v.quiz ? quizBlock() : `
  <section class="v-cta" id="cta-zone">
    <button class="btn btn-primary" type="button" data-pb>${v.cta}</button>
    <p class="v-fine">Or call <a href="tel:${TEL}">${TELV}</a>.</p>
  </section>`}
${v.proof ? `
  <section class="proof">
    ${photoGrid()}
    ${reviewStrip()}
    <p class="proof-stars"><b>&#9733;&#9733;&#9733;&#9733;&#9733;</b> 4.9 from 114 Google reviews &middot; Everett, WA since 2008</p>
  </section>` : ''}
</main>

<footer class="v-foot">
  <div class="cmyk-bar" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
  <p>Promo Box LLC &middot; 909 SE Everett Mall Way B280, Everett, WA 98208</p>
  <p><a href="tel:${TEL}">${TELV}</a> &middot; <a href="mailto:info@promoboxllc.com">info@promoboxllc.com</a></p>
</footer>

<script>window.PB_CFG={id:'${v.id}',need:'Not sure yet',offer:'${v.offer}',cta:'${(v.cta || 'Send it').replace(/'/g, "\\'")}',tag:'Lakeside Surf QR \\u00b7 ${v.id}'};</script>
<script src="../v.js?v=3" defer></script>${v.quiz ? '\n<script src="../quiz.js?v=3" defer></script>' : ''}
</body>
</html>
`;
}

const ALL = COMBOS.concat(EXTRAS);
ALL.forEach(v => {
  const d = path.join(OUT, v.id);
  fs.mkdirSync(d, { recursive: true });
  fs.writeFileSync(path.join(d, 'index.html'), page(v));
});
console.log('wrote', ALL.length, 'variant pages');

/* ---------------- chooser ---------------- */
const rows = [
  `  <a class="vrow" href="./"><strong>V1 &middot; full page</strong><span>The one you already have. Video, services, work, reviews, why, form.</span><em>Open</em></a>`,
].concat(COMBOS.map(c =>
  `  <a class="vrow" href="${c.id}/"><strong>${c.id} &middot; ${plain(c.h1)}</strong><span>Button: ${c.cta}</span><em>Open</em></a>`
)).concat(EXTRAS.map(e =>
  `  <a class="vrow" href="${e.id}/"><strong>${e.id} &middot; ${plain(e.h1)}</strong><span>${e.note}</span><em>Open</em></a>`
));

fs.writeFileSync(path.join(OUT, 'variants.html'), `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Promo Box VSL &middot; variants</title><meta name="robots" content="noindex, nofollow">
<link rel="icon" type="image/png" href="assets/favicon.png">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;700;800;900&family=Instrument+Serif:ital@0;1&display=swap">
<link rel="stylesheet" href="styles.css?v=2">
<style>
 body{background:var(--canvas)}
 .vx{max-width:620px;margin:0 auto;padding:30px 20px 60px}
 .vx h1{font-size:clamp(1.9rem,7vw,2.5rem);margin-bottom:8px}
 .vx .sub{margin-bottom:24px;font-size:.9375rem}
 .vrow{display:block;text-decoration:none;background:var(--white);border:1.5px solid var(--line);border-radius:16px;padding:16px 16px;margin-bottom:9px;transition:all .15s var(--ease)}
 .vrow:hover{border-color:var(--ink);transform:translateY(-1px)}
 .vrow strong{display:block;font-size:1.0625rem;font-weight:900;letter-spacing:-.01em}
 .vrow span{display:block;font-size:.8125rem;color:var(--ink-2);margin-top:4px;line-height:1.45}
 .vrow em{font-style:normal;display:inline-block;margin-top:9px;font-size:.625rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;background:var(--yellow);color:var(--yellow-ink);border-radius:99px;padding:4px 10px}
</style></head>
<body>
<div class="cmyk-bar" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
<div class="vx">
  <img src="assets/logo.svg" alt="Promo Box" width="299" height="65" style="height:28px;width:auto;margin-bottom:20px">
  <h1>VSL variants</h1>
  <p class="sub">Same video, same brand, same skeleton. Different headline and different offer on the button. Open them on your phone.</p>
${rows.join('\n')}
</div>
</body></html>
`);
console.log('wrote site/variants.html');
