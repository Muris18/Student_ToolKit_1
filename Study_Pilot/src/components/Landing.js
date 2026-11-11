import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import MathText from './MathText';
import { useApp } from '../lib/AppContext';
import { premiumFeatures, FREE_LIMITS } from '../lib/plans';

const I = {
  spark: <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />,
  doc: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13l2 2 4-4" /></>,
  cal: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  chart: <><path d="m22 7-8.5 8.5-5-5L2 17" /><path d="M16 7h6v6" /></>,
  grad: <><path d="M22 10 12 5 2 10l10 5 10-5z" /><path d="M6 12v5c3 2 9 2 12 0v-5" /></>,
  target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
  quiz: <><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M8 9h8M8 13h5M8 17h3" /></>,
  chat: <path d="M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.4A8 8 0 1 1 21 12z" />,
  flag: <><path d="M4 22V4" /><path d="M4 4h13l-2 4 2 4H4" /></>,
};
const Ico = ({ n, size = 22 }) => (
  <span className="cx-icon"><svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{I[n]}</svg></span>
);

// Ceļš līdz eksāmenam: tā ir īstā Study Pilot plūsma
const PATH = [
  ['grad', 'Izvēlies klasi un priekšmetus', '9. vai 12. klase, matemātika, latviešu vai angļu valoda. Saturs pielāgojas tavam eksāmenam.'],
  ['doc', 'Risini īstus VIAA eksāmenus', 'Iepriekšējo gadu uzdevumi ar tūlītēju atbilžu pārbaudi. Pie katra redzams gads un uzdevuma numurs.'],
  ['target', 'Study Pilot atrod tavas kļūdas', 'Katra nepareizā atbilde tiek piefiksēta pa tēmām, lai redzi, kur tieši vajag vairāk laika.'],
  ['quiz', 'Tests no tavām kļūdām', 'AI izveido jaunus jautājumus tieši par tām prasmēm, kurās kļūdījies. Nevis vispārīgs tests, bet tavs.'],
  ['chat', 'AI skolotājs ar mājieniem', 'Iestrēgsti? AI vada tevi pa vienam solim un neatklāj atbildi, tāpēc eksāmenā vari to izdarīt pats.'],
  ['cal', 'Plāns līdz eksāmena dienai', 'Termiņu radars un fokusa taimeris palīdz katru dienu izdarīt mazu, bet pareizu soli.'],
];

const FAQ = [
  ['Vai AI vienkārši pateiks atbildi?', 'Nē. Study Pilot AI skolotājs apzināti dod mājienus un vadošus jautājumus pa vienam solim. Tā tu saproti, kā uzdevums risināms, un eksāmenā vari to izdarīt pats.'],
  ['No kurienes ir eksāmenu uzdevumi?', 'No Valsts izglītības attīstības aģentūras (VIAA) publicētajiem iepriekšējo gadu eksāmeniem un paraugiem. Pie katra uzdevuma redzams, no kura gada un eksāmena tas ir.'],
  ['Vai tas aizstāj skolotāju?', 'Nē. Study Pilot ir palīgs patstāvīgām mācībām. AI var kļūdīties, tāpēc svarīgas lietas pārbaudi mācību grāmatā vai pie skolotāja.'],
  ['Kas notiek ar maniem datiem?', 'Mēs glabājam tikai to, kas vajadzīgs mācību rīkiem, nerādām reklāmas un datus nepārdodam. AI jautājumi tiek sūtīti uz DeepSeek tikai pēc tavas piekrišanas. Visus savus datus vari jebkurā brīdī lejupielādēt vai izdzēst profilā.'],
  ['Cik tas maksā?', 'Pamata funkcijas ir bez maksas. Premium dod vairāk AI jautājumu dienā un neierobežotus savus testus un uzdevumus. Abonementu var atcelt jebkurā brīdī.'],
  ['No cik gadiem var lietot?', 'No 13 gadiem. Premium iegādei vajag būt pilngadīgam vai ar vecāku atļauju.'],
];

// Ritinot: kartītes parādās pa vienai, un gatavības josla pildās
function usePathProgress(count) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(0);
  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) { setSeen(count); return undefined; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setSeen((s) => Math.max(s, Number(e.target.dataset.step) + 1)); });
    }, { rootMargin: '0px 0px -30% 0px', threshold: 0.5 });
    root.querySelectorAll('[data-step]').forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [count]);
  return [ref, seen];
}

// Reklāmas/info lapa. home: sākumlapa "/" (pieslēgtiem lietotājiem tā tiek paslēpta, kamēr notiek pārvirzīšana uz paneli);
// info: lapa "/par" pieslēgtiem lietotājiem (tikai informācija).
export default function Landing({ home = false, info = false }) {
  const { status, config } = useApp();
  const loggedIn = status === 'ready';
  const start = loggedIn ? '/dashboard' : '/register';
  const [pathRef, seen] = usePathProgress(PATH.length);
  const pct = Math.round((seen / PATH.length) * 100);
  const mood = pct >= 100 ? '😎' : pct >= 50 ? '🙂' : pct > 0 ? '🤔' : '😰';

  return (
    <div className={`flex-1 flex flex-col cx-page${home ? ' cx-home' : ''}`}>
      <Head>
        <title>{info ? 'Par Study Pilot' : 'Study Pilot — AI skolotājs 9. un 12. klases eksāmeniem'}</title>
      </Head>
      <div className="cx-stars" aria-hidden="true" />
      <main className="cx flex-1">
        {/* ---------- HERO ---------- */}
        <section className="cx-hero">
          <div className="cx-proof">
            <span><b>VIAA</b> eksāmeni 2023–2026</span>
            <i aria-hidden="true" />
            <span><b>9.</b> un <b>12.</b> klase</span>
            <i aria-hidden="true" />
            <span>100% latviski</span>
          </div>
          <h1>
            Gatavojies <span className="cx-mono">eksāmenam</span>
            <br />
            ar AI skolotāju<span className="cx-h1-spark" aria-hidden="true">✦</span>
          </h1>
          <p className="cx-lead">
            Īsti iepriekšējo gadu VIAA uzdevumi, testi no tavām kļūdām un AI, kas māca ar mājieniem, nevis špikeriem. Saproti, nevis iekalies.
          </p>
          <div className="cx-cta">
            <Link href={start} className="cx-btn cx-btn-primary">{loggedIn ? 'Turpināt mācīties' : 'Sākt bez maksas'}</Link>
            {!loggedIn && <Link href="/login" className="cx-btn cx-btn-ghost">Man jau ir konts <span aria-hidden="true">✦</span></Link>}
          </div>
          <p className="cx-note">Bez kartes · Konts minūtē</p>

          {/* Produkta priekšskatījums */}
          <div className="cx-device" aria-hidden="true">
            <div className="cx-device-glow" />
            <div className="cx-window">
              <div className="cx-window-bar">
                <span /><span /><span />
                <em>AI mācību palīgs</em>
              </div>
              <div className="cx-chat">
                <div className="cx-msg cx-msg-me">
                  <MathText as="span" text="Kā atrisināt $x^2 - 5x + 6 = 0$?" />
                </div>
                <div className="cx-msg cx-msg-ai">
                  <small>AI skolotājs</small>
                  <MathText as="span" text={'Sāksim ar mājienu: kuri divi skaitļi reizinājumā dod $6$, bet summā $5$? Pamēģini!'} />
                </div>
                <div className="cx-msg cx-msg-me">
                  <MathText as="span" text="$2$ un $3$!" />
                </div>
                <div className="cx-msg cx-msg-ai">
                  <small>AI skolotājs</small>
                  <MathText as="span" text={'Tieši tā. Tagad uzraksti vienādojumu formā $(x - a)(x - b) = 0$. Kas ir $a$ un $b$?'} />
                </div>
                <div className="cx-sources">
                  <span>Avots</span> līdzīgs uzdevums VIAA 9. kl. matemātikas eksāmenā
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- CEĻŠ LĪDZ EKSĀMENAM ---------- */}
        <section className="cx-section" id="ka-strada">
          <div className="cx-head">
            <span className="cx-badge"><Ico n="flag" size={18} />Eksāmena sagatavošanās</span>
            <h2 className="cx-h2">Tavs ceļš līdz <span className="cx-mono">eksāmenam</span></h2>
            <p className="cx-sub">Seši soļi no „nezinu, ar ko sākt” līdz mierīgai eksāmena dienai.</p>
          </div>

          <div className="cx-path" ref={pathRef}>
            <div className="cx-meter" aria-hidden="true">
              <span className="cx-meter-face">{mood}</span>
              <div className="cx-meter-bar"><div style={{ width: `${pct}%` }} /></div>
              <span className="cx-meter-label">{pct}% gatavs</span>
            </div>
            <ol className="cx-steps">
              {PATH.map(([icon, title, text], i) => (
                <li key={title} data-step={i} className={`cx-step ${i < seen ? 'is-on' : ''}`}>
                  <Ico n={icon} />
                  <div>
                    <span className="cx-step-no">Solis {String(i + 1).padStart(2, '0')}</span>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------- FUNKCIJAS ---------- */}
        <section className="cx-section" id="funkcijas">
          <div className="cx-head">
            <span className="cx-kicker">Viss vienuviet</span>
            <h2 className="cx-h2">Viss, kas vajadzīgs,<br />lai eksāmenā justos droši</h2>
          </div>
          <div className="cx-bento">
            <article className="cx-card cx-card-wide">
              <Ico n="spark" />
              <h3>AI skolotājs, kas māca domāt</h3>
              <p>Uzdod jautājumu par jebkuru uzdevumu. AI atrod līdzīgus eksāmenu uzdevumus un vada tevi pa soļiem. Formulas izskatās tieši kā mācību grāmatā.</p>
              <div className="cx-mini" aria-hidden="true">
                <div className="me"><MathText as="span" text={'Nesaprotu, kā vienkāršot $\\sqrt{50}$'} /></div>
                <div className="ai"><MathText as="span" text={'Sadali $50$ reizinājumā, kur viens skaitlis ir pilns kvadrāts. Kurš pilns kvadrāts dala $50$?'} /></div>
              </div>
            </article>
            <article className="cx-card">
              <Ico n="quiz" />
              <h3>Testi no tavām kļūdām</h3>
              <p>Katrs tests trenē tieši to, kur kļūdījies. Ja kļūdu vēl nav, sāc ar diagnostikas testu.</p>
              <div className="cx-bars" aria-hidden="true">
                <div><span>Funkcijas</span><i style={{ '--w': '38%' }} /></div>
                <div><span>Ģeometrija</span><i style={{ '--w': '64%' }} /></div>
                <div><span>Varbūtība</span><i style={{ '--w': '86%' }} /></div>
              </div>
            </article>
            <article className="cx-card"><Ico n="doc" /><h3>Valsts eksāmenu uzdevumi</h3><p>VIAA eksāmeni pa priekšmetiem, līmeņiem un gadiem ar automātisku atbilžu pārbaudi.</p></article>
            <article className="cx-card"><Ico n="cal" /><h3>Termiņu radars</h3><p>Kontroldarbi, projekti un eksāmeni kalendārā. Redzi, kam pievērsties šodien.</p></article>
            <article className="cx-card"><Ico n="clock" /><h3>Fokusa režīms</h3><p>15, 25 vai 45 minūšu taimeris vienam uzdevumam bez traucēkļiem.</p></article>
            <article className="cx-card"><Ico n="chart" /><h3>Progresa pārskats</h3><p>Aktivitātes dienas, testu rezultāti un eksāmenu mēģinājumi vienā skatā.</p></article>
          </div>
        </section>

        {/* ---------- CENAS ---------- */}
        <section className="cx-section" id="cenas">
          <div className="cx-head">
            <span className="cx-kicker">Cenas</span>
            <h2 className="cx-h2">Sāc bez maksas.<br />Pārej uz Premium, kad vajag vairāk.</h2>
          </div>
          <div className="cx-pricing">
            <div className="cx-plan">
              <span className="cx-plan-name">Bezmaksas</span>
              <div className="cx-price">0 €</div>
              <ul>
                <li>{config.aiLimitFree} AI skolotāja jautājumi dienā</li>
                <li>Valsts eksāmenu uzdevumi ar pārbaudi</li>
                <li>Plānotājs, termiņu radars un fokusa režīms</li>
                <li>Līdz {FREE_LIMITS.exercises} saviem uzdevumiem</li>
              </ul>
              <Link href={start} className="cx-btn cx-btn-ghost">{loggedIn ? 'Atvērt paneli' : 'Izveidot kontu'}</Link>
            </div>
            <div className="cx-plan is-pro">
              <span className="cx-plan-name">Premium <em>Vairāk iespēju</em></span>
              <div className="cx-price">{config.premiumPrice || <small>Cena tiks paziņota drīzumā</small>}</div>
              <ul>{premiumFeatures(config).map((f) => <li key={f}>{f}</li>)}</ul>
              <Link href={loggedIn ? '/premium' : '/register?next=%2Fpremium'} className="cx-btn cx-btn-primary">Iegūt Premium</Link>
            </div>
          </div>
        </section>

        {/* ---------- BUJ ---------- */}
        <section className="cx-section" id="jautajumi">
          <div className="cx-head">
            <span className="cx-kicker">Biežāk uzdotie jautājumi</span>
            <h2 className="cx-h2">Jautājumi un atbildes</h2>
          </div>
          <div className="cx-faq">
            {FAQ.map(([q, a]) => (
              <details key={q}><summary>{q}</summary><p>{a}</p></details>
            ))}
          </div>
        </section>

        {/* ---------- NOSLĒGUMS ---------- */}
        <section className="cx-final">
          <span className="cx-kicker">Eksāmens tuvojas</span>
          <h2 className="cx-h2">Sāc šodien<br />ar vienu uzdevumu.</h2>
          <p className="cx-sub">Konta izveide aizņem minūti. Bez kartes, bez saistībām.</p>
          <div className="cx-cta">
            <Link href={start} className="cx-btn cx-btn-primary">{loggedIn ? 'Turpināt mācīties' : 'Sākt bez maksas'}</Link>
          </div>
        </section>

        <footer className="cx-footer">
          <span>© {new Date().getFullYear()} Study Pilot · Veidots Latvijas skolēniem</span>
          <nav>
            <a href="#ka-strada">Kā strādā</a>
            <a href="#cenas">Cenas</a>
            <Link href="/privacy">Privātuma politika</Link>
            <Link href="/terms">Lietošanas noteikumi</Link>
            <a href="mailto:jautajumi@studypilot.lv">jautajumi@studypilot.lv</a>
          </nav>
        </footer>
      </main>
    </div>
  );
}
