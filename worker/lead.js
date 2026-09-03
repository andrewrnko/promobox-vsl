// Promo Box VSL lead capture (Cloudflare Worker). POST /api/lead → AgentMail → LEAD_TO.
// AgentMail key is stored in KV by a one-time POST /setup (x-setup-token), so it never sits in a repo.
const AGENTMAIL = 'https://api.agentmail.to/v0/inboxes';
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,x-setup-token' };
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json', ...CORS } });
const clean = (v, n) => (v == null ? '' : String(v)).replace(/[\r\n]+/g, ' ').trim().slice(0, n);

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

    if (url.pathname === '/setup' && req.method === 'POST') {
      if (!env.SETUP_TOKEN || req.headers.get('x-setup-token') !== env.SETUP_TOKEN) return json({ ok: false }, 401);
      if (await env.KV.get('AGENTMAIL_KEY')) return json({ ok: false, error: 'already_set' }, 409);
      let b = {}; try { b = await req.json(); } catch {}
      if (!b.key || String(b.key).length < 20) return json({ ok: false, error: 'bad_key' }, 400);
      await env.KV.put('AGENTMAIL_KEY', String(b.key));
      return json({ ok: true });
    }

    if (url.pathname !== '/api/lead' || req.method !== 'POST') return json({ ok: false }, 404);
    let b = {}; try { b = await req.json(); } catch {}
    if (clean(b.website, 80)) return json({ ok: true }); // honeypot

    const lead = {
      name: clean(b.name, 80), phone: clean(b.phone, 40), email: clean(b.email, 120),
      company: clean(b.company_name, 120), need: clean(b.need, 60),
      description: clean(b.description, 2000), page: clean(b.page, 200), ref: clean(b.ref, 200),
    };
    if (!lead.phone && !lead.email) return json({ ok: false, error: 'empty' }, 400);

    const key = await env.KV.get('AGENTMAIL_KEY');
    const inbox = env.AGENTMAIL_INBOX || 'larchmont-growth@agentmail.to';
    const to = env.LEAD_TO;
    if (!key || !to) return json({ ok: false, error: 'unconfigured' }, 500);

    const text = [
      'New wrap quote request, Promo Box VSL funnel', '',
      `Name:     ${lead.name || '-'}`, `Phone:    ${lead.phone || '-'}`, `Email:    ${lead.email || '-'}`,
      `Company:  ${lead.company || '-'}`, `Need:     ${lead.need || '-'}`, '',
      'Details:', lead.description || '-', '',
      `Page:     ${lead.page || '-'}`, `Referrer: ${lead.ref || '-'}`, `Received: ${new Date().toISOString()}`,
    ].join('\n');

    try {
      const r = await fetch(`${AGENTMAIL}/${encodeURIComponent(inbox)}/messages/send`, {
        method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject: `Promo Box quote: ${lead.name || lead.phone}${lead.need ? ' (' + lead.need + ')' : ''}`, text, ...(lead.email ? { reply_to: [lead.email] } : {}) }),
      });
      if (!r.ok) return json({ ok: false, error: 'send_failed' }, 502);
    } catch { return json({ ok: false, error: 'send_failed' }, 502); }
    return json({ ok: true });
  },
};
