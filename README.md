# Promo Box VSL funnel

Single-page video sales letter for promoboxllc.com vehicle wraps. No nav, one exit: the quote form.

- `site/` static page (mobile first). Brand tokens mirror `~/promobox-store/site/styles.css`.
- Hosting: GitHub Pages from the `gh-pages` branch (contents of `site/`). Deploy: `./deploy.sh`.
- Lead API: Cloudflare Worker `promobox-lead` (`worker/lead.js`), uploaded via the cloudflare-api MCP.
  Form → `https://promobox-lead.sirjarvisthethird.workers.dev/api/lead` → AgentMail → `LEAD_TO` var on the Worker.
  The AgentMail key lives in the Worker's KV (one-time `/setup`), never in this repo.
- **Add the video:** drop the 16:9 file at `site/assets/vsl.mp4` (+ `vsl-poster.jpg`) and set `VSL.src`/`VSL.poster`
  in `site/app.js`, or set `VSL.embed` to a YouTube/Vimeo embed URL. Then `./deploy.sh`.
  Files over ~50 MB should go to YouTube/Vimeo unlisted and use `VSL.embed`.
- Local: `cd site && python3 -m http.server 4896 --bind 127.0.0.1`
