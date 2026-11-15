// Sākumlapas priekšskatījumu (čatu) formulas, pārvērstas HTML būvēšanas laikā.
// Izsauc tikai getStaticProps (src/pages/index.js un src/pages/par.js), tāpēc KaTeX (~80 KB) nenonāk sākumlapas JavaScript.
// Secība ir svarīga: src/components/Landing.js tos rāda pēc indeksa (demo[0]…demo[5]).
import { mathToHtml } from './mathHtml';

const DEMO = [
  'Kā atrisināt $x^2 - 5x + 6 = 0$?',
  'Sāksim ar mājienu: kuri divi skaitļi reizinājumā dod $6$, bet summā $5$? Pamēģini!',
  '$2$ un $3$!',
  'Tieši tā. Tagad uzraksti vienādojumu formā $(x - a)(x - b) = 0$. Kas ir $a$ un $b$?',
  'Nesaprotu, kā vienkāršot $\\sqrt{50}$',
  'Sadali $50$ reizinājumā, kur viens skaitlis ir pilns kvadrāts. Kurš pilns kvadrāts dala $50$?',
];

export const landingDemoHtml = () => DEMO.map((t) => mathToHtml(t));
