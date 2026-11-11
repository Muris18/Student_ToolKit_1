// Kopīgs serverim (AI materiālu sagatavošana) un klientam (jau saglabātu materiālu attēlošana).
// Rezerves formulu pārveide AI tekstam: ja AI uzrakstīja formulu kā vienkāršu tekstu ("log_3 81 = 4", "b^n = x"),
// to pārveido LaTeX formā starp $...$, lai MathText (KaTeX) to parādītu kā mācību grāmatā.
// Daļas, kas jau ir starp $...$, netiek aiztiktas. Teksts bez ^ un _ netiek mainīts.

// Vārdi, kas formulā drīkst būt (funkcijas un apzīmējumi); pārējie vairāk nekā 1 burta vārdi pārtrauc formulu
const FUNCS = new Set(['log', 'lg', 'ln', 'sin', 'cos', 'tg', 'tan', 'ctg', 'cot', 'sqrt', 'lim', 'max', 'min', 'pH', 'exp']);
const TRAIL = /[.,;:!?]+$/;

// Vai atstarpēm atdalīts vārds izskatās pēc formulas daļas
// Vārds, kurā ir vismaz 4 burti pēc kārtas un tas nav funkcija (piem., "snake_case"), nav formula
const longWord = (t) => (t.match(/[A-Za-zĀ-ž]{4,}/g) || []).some((w) => !FUNCS.has(w));
// Funkcijas, kuru dēļ posmu pārveido arī bez ^ un _ ("lg x", "ln x", "sin x")
const TRIGGER_FUNCS = new Set(['log', 'lg', 'ln', 'sin', 'cos', 'tg', 'tan', 'ctg', 'cot', 'sqrt']);

function isMathToken(tok) {
  const t = tok.replace(TRAIL, '');
  if (!t) return false;
  if (/[\^_{}]/.test(t)) return !longWord(t);               // b^n, log_3, e^{ln (bet ne snake_case)
  if (/^[=+\-−*/·×<>≤≥≈≠±]+$/.test(t)) return true;          // operatori (domuzīme "–" ir pieturzīme, ne mīnuss)
  if (/^[-−]?\d+([.,]\d+)?$/.test(t)) return true;           // skaitļi
  if (/^\(?[A-Za-z]\)?$/.test(t)) return true;               // viens mainīgais: x, (x)
  if (FUNCS.has(t)) return true;
  if (/^[A-Za-z0-9()[\]+\-−|]+$/.test(t) && /[()[\]|]/.test(t)) return true; // (xy), [H+], |x|
  return false;
}

// Teksta formula -> LaTeX
function toTex(expr) {
  return expr
    .replace(/(?<![A-Za-z\\])(log|lg|ln|sin|cos|tg|tan|ctg|cot|lim|max|min|exp)(?![A-Za-z])/g, (m) => ({ tg: '\\operatorname{tg}', ctg: '\\operatorname{ctg}', lg: '\\lg' }[m] || `\\${m}`))
    .replace(/\bsqrt\(([^)]*)\)/g, '\\sqrt{$1}')
    .replace(/\bpH\b/g, '\\mathrm{pH}')
    .replace(/_(?!\{)([A-Za-z0-9]+)/g, '_{$1}')               // log_10 -> log_{10}
    .replace(/\^(?!\{)([-−]?[A-Za-z0-9]+)/g, '^{$1}')        // b^n -> b^{n}, 3^-2 -> 3^{-2}
    .replace(/[−–]/g, '-')
    .replace(/·|×/g, '\\cdot ')
    .replace(/≠/g, '\\neq ')
    .replace(/≈/g, '\\approx ')
    .replace(/≤/g, '\\le ')
    .replace(/≥/g, '\\ge ')
    .replace(/±/g, '\\pm ')
    .replace(/(\d),(\d)/g, '$1{,}$2');                          // 2,718 (latviešu decimālkomats)
}

const HAS_TRIGGER = /[\^_]|(?<![A-Za-zĀ-ž])(log|lg|ln|sin|cos|tg|ctg|sqrt) [A-Za-z0-9(]/;

function convertPlain(part) {
  if (!HAS_TRIGGER.test(part)) return part;
  const tokens = part.split(/(\s+)/); // saglabā atstarpes
  let out = '';
  let i = 0;
  while (i < tokens.length) {
    const tok = tokens[i];
    if (/^\s+$/.test(tok) || !isMathToken(tok)) { out += tok; i++; continue; }
    // Formulas posms: secīgi formulas vārdi; beidzas pie pieturzīmes vārda beigās vai pie parasta vārda
    let j = i;
    let run = '';
    let trail = '';
    while (j < tokens.length) {
      const t = tokens[j];
      if (/^\s+$/.test(t)) {
        if (j + 1 < tokens.length && isMathToken(tokens[j + 1])) { run += t; j++; continue; }
        break;
      }
      if (!isMathToken(t)) break;
      const p = t.match(TRAIL);
      if (p) { run += t.slice(0, -p[0].length); trail = p[0]; j++; break; }
      run += t;
      j++;
    }
    // Pārveido tikai tad, ja posmā ir pakāpe, indekss vai funkcija ar argumentu (citādi "x = 5" paliek teksts)
    const words = run.trim().split(/\s+/);
    const hasFunc = words.some((w, k) => TRIGGER_FUNCS.has(w) && k + 1 < words.length);
    if (/[\^_]/.test(run) || hasFunc) out += `$${toTex(run.trim())}$${trail}`;
    else out += run + trail;
    i = j;
  }
  return out;
}

export function autoMath(text) {
  const s = String(text ?? '');
  if (!HAS_TRIGGER.test(s)) return s;
  // Atstāj neskartas jau esošās $...$ formulas
  return s.split(/(\$\$[\s\S]+?\$\$|\$[^$\n]+\$)/).map((part) => (part.startsWith('$') ? part : convertPlain(part))).join('');
}
