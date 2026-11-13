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

// Lietotnes tēma (data-theme: night | paper), ko klients nosūta kopā ar pieprasījumu; nezināma vērtība = gaišais variants
export const emailTheme = (v) => (v === 'night' ? 'night' : 'light');

// Fiksētas krāsas (e-pasta klienti nelasa lietotnes CSS); smaragdzaļā sakrīt ar lietotnes akcentu
const PALETTE = {
  light: { page: '#f1f5f4', card: '#ffffff', border: '#e2e8e6', head: '#047857', headText: '#ffffff', title: '#111827', text: '#374151', muted: '#4b5563', faint: '#6b7280', btn: '#047857', btnText: '#ffffff', link: '#047857', foot: '#f8faf9' },
  night: { page: '#070b0a', card: '#101715', border: '#1f2b27', head: '#064e3b', headText: '#ecfdf5', title: '#f3f7f5', text: '#cdd8d3', muted: '#aab8b1', faint: '#8a9a93', btn: '#10b981', btnText: '#04120d', link: '#34d399', foot: '#0b110f' },
};

// Oficiāls HTML visiem e-pasta klientiem (tabulas un inline stili): galvene ar zīmolu, saturs, poga, drošības piezīme un kājene.
function layout({ title, intro, button, url, outro, theme }) {
  const c = PALETTE[emailTheme(theme)];
  const contact = 'jautajumi@studypilot.lv';
  const scheme = emailTheme(theme) === 'night' ? 'dark' : 'light';
  return `<!doctype html><html lang="lv"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="${scheme}"><meta name="supported-color-schemes" content="${scheme}"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:${c.page};font-family:Arial,Helvetica,sans-serif;color:${c.text}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${c.page};padding:32px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${c.card};border:1px solid ${c.border};border-radius:12px;overflow:hidden">
<tr><td style="background:${c.head};padding:20px 32px;font-size:20px;font-weight:bold;color:${c.headText};letter-spacing:.2px">Study Pilot</td></tr>
<tr><td style="padding:32px 32px 8px;font-size:22px;font-weight:bold;color:${c.title}">${esc(title)}</td></tr>
<tr><td style="padding:8px 32px 24px;font-size:15px;line-height:1.65;color:${c.text}">${esc(intro)}</td></tr>
<tr><td style="padding:0 32px 28px"><a href="${esc(url)}" style="display:inline-block;background:${c.btn};color:${c.btnText};text-decoration:none;font-weight:bold;font-size:15px;padding:14px 28px;border-radius:8px">${esc(button)}</a></td></tr>
<tr><td style="padding:0 32px 24px;font-size:13px;line-height:1.6;color:${c.muted}">${esc(outro)}</td></tr>
<tr><td style="padding:0 32px 28px;font-size:12px;line-height:1.6;color:${c.faint}">Ja poga nedarbojas, lūdzu, nokopējiet šo saiti pārlūka adreses joslā:<br><a href="${esc(url)}" style="word-break:break-all;color:${c.link}">${esc(url)}</a></td></tr>
<tr><td style="background:${c.foot};border-top:1px solid ${c.border};padding:20px 32px;font-size:12px;line-height:1.6;color:${c.faint}">Ar cieņu,<br>Study Pilot komanda<br><br>Šis ir automātisks ziņojums, kas nosūtīts uz Jūsu e-pasta adresi saistībā ar Study Pilot kontu.<br>Jautājumu gadījumā rakstiet uz <a href="mailto:${contact}" style="color:${c.link}">${contact}</a> &middot; <a href="${esc(appUrl())}/privacy" style="color:${c.link}">Privātuma politika</a></td></tr>
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

// theme: lietotnes tēma no klienta (skat. emailTheme); e-pasts tiek zīmēts tajā pašā tēmā
export function sendVerifyEmail(to, token, theme) {
  const url = `${appUrl()}/verify?token=${token}`;
  return send({
    to,
    subject: 'Study Pilot: e-pasta adreses apstiprināšana',
    html: layout({
      title: 'E-pasta adreses apstiprināšana',
      intro: 'Paldies par reģistrāciju Study Pilot. Lai pabeigtu konta izveidi un apstiprinātu, ka šī e-pasta adrese pieder Jums, lūdzu, nospiediet zemāk redzamo pogu.',
      button: 'Apstiprināt e-pasta adresi',
      url,
      outro: 'Saite ir derīga 48 stundas. Ja Jūs konta izveidi nepieprasījāt, nekādas darbības nav nepieciešamas un šo ziņojumu var ignorēt.',
      theme,
    }),
    text: `Study Pilot: e-pasta adreses apstiprināšana\n\nPaldies par reģistrāciju Study Pilot. Lai apstiprinātu e-pasta adresi, atveriet šo saiti:\n${url}\n\nSaite ir derīga 48 stundas. Ja Jūs konta izveidi nepieprasījāt, nekādas darbības nav nepieciešamas.\n\nAr cieņu,\nStudy Pilot komanda`,
  });
}

export function sendResetEmail(to, token, theme) {
  const url = `${appUrl()}/reset?token=${token}`;
  return send({
    to,
    subject: 'Study Pilot: paroles atjaunošanas pieprasījums',
    html: layout({
      title: 'Paroles atjaunošana',
      intro: 'Saņemts pieprasījums atjaunot paroli Study Pilot kontam, kas reģistrēts uz šo e-pasta adresi. Lai iestatītu jaunu paroli, lūdzu, nospiediet zemāk redzamo pogu.',
      button: 'Iestatīt jaunu paroli',
      url,
      outro: 'Saite ir derīga 1 stundu un izmantojama tikai vienu reizi. Ja Jūs šādu pieprasījumu neiesniedzāt, nekādas darbības nav nepieciešamas, un Jūsu parole nemainīsies. Drošības nolūkos nepārsūtiet šo saiti citiem.',
      theme,
    }),
    text: `Study Pilot: paroles atjaunošanas pieprasījums\n\nSaņemts pieprasījums atjaunot paroli Study Pilot kontam. Lai iestatītu jaunu paroli, atveriet šo saiti:\n${url}\n\nSaite ir derīga 1 stundu un izmantojama tikai vienu reizi. Ja Jūs šādu pieprasījumu neiesniedzāt, nekādas darbības nav nepieciešamas.\n\nAr cieņu,\nStudy Pilot komanda`,
  });
}
