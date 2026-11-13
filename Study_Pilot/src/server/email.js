// E-pasta sūtīšana (apstiprināšana, paroles atjaunošana) caur Brevo vai Resend HTTP API.
// Ieslēdzas tikai tad, ja .env ir EMAIL_API_KEY. Bez tā e-pasta funkcijas ir izslēgtas,
// un jauni konti uzreiz skaitās apstiprināti.
//   EMAIL_PROVIDER=brevo | resend   (noklusēti brevo)
//   EMAIL_API_KEY=...
//   EMAIL_FROM=Study Pilot <jautajumi@studypilot.lv>
//   APP_URL=https://studypilot.lv   (docker-compose to aizpilda no DOMAIN)

export const emailEnabled = () => Boolean(process.env.EMAIL_API_KEY);

export function appUrl() {
  return (process.env.APP_URL || 'http://localhost:3000').replace(/\/+$/, '');
}

function parseFrom() {
  const raw = process.env.EMAIL_FROM || 'Study Pilot <jautajumi@studypilot.lv>';
  const m = raw.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  return m ? { name: m[1] || 'Study Pilot', email: m[2] } : { name: 'Study Pilot', email: raw.trim() };
}

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Gaišs, oficiāls HTML visiem e-pasta klientiem (tabulas un inline stili): galvene ar zīmolu, saturs, poga, drošības piezīme un kājene.
// Krāsas ir fiksētas (e-pasta klienti nelasa lietotnes CSS); smaragdzaļā sakrīt ar lietotnes akcentu.
function layout({ title, intro, button, url, outro }) {
  const contact = 'jautajumi@studypilot.lv';
  return `<!doctype html><html lang="lv"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:#f1f5f4;font-family:Arial,Helvetica,sans-serif;color:#1f2937">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f4;padding:32px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e2e8e6;border-radius:12px;overflow:hidden">
<tr><td style="background:#047857;padding:20px 32px;font-size:20px;font-weight:bold;color:#ffffff;letter-spacing:.2px">Study Pilot</td></tr>
<tr><td style="padding:32px 32px 8px;font-size:22px;font-weight:bold;color:#111827">${esc(title)}</td></tr>
<tr><td style="padding:8px 32px 24px;font-size:15px;line-height:1.65;color:#374151">${esc(intro)}</td></tr>
<tr><td style="padding:0 32px 28px"><a href="${esc(url)}" style="display:inline-block;background:#047857;color:#ffffff;text-decoration:none;font-weight:bold;font-size:15px;padding:14px 28px;border-radius:8px">${esc(button)}</a></td></tr>
<tr><td style="padding:0 32px 24px;font-size:13px;line-height:1.6;color:#4b5563">${esc(outro)}</td></tr>
<tr><td style="padding:0 32px 28px;font-size:12px;line-height:1.6;color:#6b7280">Ja poga nestrādā, nokopē šo saiti pārlūka adreses joslā:<br><a href="${esc(url)}" style="word-break:break-all;color:#047857">${esc(url)}</a></td></tr>
<tr><td style="background:#f8faf9;border-top:1px solid #e2e8e6;padding:20px 32px;font-size:12px;line-height:1.6;color:#6b7280">Šis ir automātisks ziņojums no Study Pilot, kas nosūtīts uz tavu e-pasta adresi saistībā ar tavu kontu.<br>Jautājumi: <a href="mailto:${contact}" style="color:#047857">${contact}</a> &middot; <a href="${esc(appUrl())}/privacy" style="color:#047857">Privātuma politika</a></td></tr>
</table></td></tr></table></body></html>`;
}

async function send({ to, subject, html, text }) {
  if (!emailEnabled()) {
    const e = new Error('E-pasta sūtīšana nav ieslēgta');
    e.code = 'EMAIL_OFF';
    throw e;
  }
  const provider = (process.env.EMAIL_PROVIDER || 'brevo').toLowerCase();
  const from = parseFrom();
  const key = process.env.EMAIL_API_KEY;
  let res;
  if (provider === 'resend') {
    res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: `${from.name} <${from.email}>`, to: [to], subject, html, text }),
    });
  } else {
    res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': key, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ sender: from, to: [{ email: to }], subject, htmlContent: html, textContent: text }),
    });
  }
  if (!res.ok) {
    console.error('E-pasta kļūda', provider, res.status, (await res.text().catch(() => '')).slice(0, 300));
    const e = new Error('E-pastu neizdevās nosūtīt');
    e.code = 'EMAIL_FAIL';
    throw e;
  }
}

export function sendVerifyEmail(to, token) {
  const url = `${appUrl()}/verify?token=${token}`;
  return send({
    to,
    subject: 'Apstiprini savu Study Pilot e-pastu',
    html: layout({
      title: 'Apstiprini e-pastu',
      intro: 'Paldies, ka pievienojies Study Pilot! Nospied pogu, lai apstiprinātu, ka šis e-pasts ir tavs.',
      button: 'Apstiprināt e-pastu',
      url,
      outro: 'Saite derīga 48 stundas. Ja tu neveidoji kontu, šo e-pastu vari ignorēt.',
    }),
    text: `Apstiprini savu Study Pilot e-pastu: ${url}\nSaite derīga 48 stundas.`,
  });
}

export function sendResetEmail(to, token) {
  const url = `${appUrl()}/reset?token=${token}`;
  return send({
    to,
    subject: 'Study Pilot paroles atjaunošana',
    html: layout({
      title: 'Jauna parole',
      intro: 'Kāds (cerams, tu) palūdza atjaunot Study Pilot paroli. Nospied pogu, lai izvēlētos jaunu paroli.',
      button: 'Izvēlēties jaunu paroli',
      url,
      outro: 'Saite derīga 1 stundu un der vienu reizi. Ja tu to neprasīji, neko nedari — tava parole paliek tā pati.',
    }),
    text: `Study Pilot paroles atjaunošana: ${url}\nSaite derīga 1 stundu.`,
  });
}
