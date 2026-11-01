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

// Vienkāršs, visos e-pasta klientos strādājošs HTML ar vienu pogu
function layout({ title, intro, button, url, outro }) {
  return `<!doctype html><html lang="lv"><body style="margin:0;background:#0b0d12;font-family:Arial,Helvetica,sans-serif;color:#e9ecf3">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b0d12;padding:32px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#141821;border:1px solid #262c3a;border-radius:16px;padding:32px">
<tr><td style="font-size:20px;font-weight:bold;color:#f5c542;padding-bottom:20px">Study Pilot</td></tr>
<tr><td style="font-size:22px;font-weight:bold;color:#ffffff;padding-bottom:12px">${esc(title)}</td></tr>
<tr><td style="font-size:15px;line-height:1.6;color:#c4cad6;padding-bottom:24px">${esc(intro)}</td></tr>
<tr><td style="padding-bottom:24px"><a href="${esc(url)}" style="display:inline-block;background:#f5c542;color:#0b0d12;text-decoration:none;font-weight:bold;padding:14px 22px;border-radius:12px">${esc(button)}</a></td></tr>
<tr><td style="font-size:12px;line-height:1.6;color:#8a93a6">${esc(outro)}<br><br>Ja poga nestrādā, atver šo saiti:<br><span style="word-break:break-all;color:#c4cad6">${esc(url)}</span></td></tr>
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
