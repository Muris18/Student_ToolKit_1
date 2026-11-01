import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import MathText from '../components/MathText';
import { useApp } from '../lib/AppContext';
import { premiumFeatures, FREE_LIMITS } from '../lib/plans';

const I = {
  spark: <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />,
  doc: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13l2 2 4-4" /></>,
  bolt: <path d="M13 2 3 14h9l-1 8 10-12h-9z" />,
  cal: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  chart: <><path d="m22 7-8.5 8.5-5-5L2 17" /><path d="M16 7h6v6" /></>,
};
const Ico = ({ n }) => (
  <span className="np-icon"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{I[n]}</svg></span>
);

const FAQ = [
  ['Vai AI vienkārši pateiks atbildi?', 'Nē. Study Pilot AI skolotājs apzināti dod mājienus un vadošus jautājumus pa vienam solim. Tā tu saproti, kā uzdevums risināms, un eksāmenā vari to izdarīt pats.'],
  ['No kurienes ir eksāmenu uzdevumi?', 'No Valsts izglītības attīstības aģentūras (VIAA) publicētajiem iepriekšējo gadu eksāmeniem un paraugiem. Pie katra uzdevuma redzams, no kura gada un eksāmena tas ir.'],
  ['Vai tas aizstāj skolotāju?', 'Nē. Study Pilot ir palīgs patstāvīgām mācībām. AI var kļūdīties, tāpēc svarīgas lietas pārbaudi mācību grāmatā vai pie skolotāja.'],
  ['Kas notiek ar maniem datiem?', 'Mēs glabājam tikai to, kas vajadzīgs mācību rīkiem, nerādām reklāmas un datus nepārdodam. AI jautājumi tiek sūtīti uz DeepSeek tikai pēc tavas piekrišanas. Visus savus datus vari jebkurā brīdī lejupielādēt vai izdzēst profilā.'],
  ['Cik tas maksā?', 'Pamata funkcijas ir bez maksas. Premium dod vairāk AI jautājumu dienā un neierobežotus savus testus un uzdevumus. Abonementu var atcelt jebkurā brīdī.'],
  ['No cik gadiem var lietot?', 'No 13 gadiem. Premium iegādei vajag būt pilngadīgam vai ar vecāku atļauju.'],
];

export default function LandingPage() {
  const { status, config } = useApp();
  const loggedIn = status === 'ready';
  const start = loggedIn ? '/dashboard' : '/register';
  return (
    <div className="flex-1 flex flex-col">
      <Head>
        <title>Study Pilot — AI skolotājs 9. un 12. klases eksāmeniem</title>
      </Head>
      <main className="np flex-1">
        <section className="np-hero">
          <div>
            <span className="np-pill"><i />9. un 12. klases valsts eksāmeniem</span>
            <h1>Saproti, nevis <span className="np-gold">iekalies.</span></h1>
            <p className="np-lead">
              AI skolotājs, kas māca ar mājieniem, iepriekšējo gadu VIAA eksāmenu uzdevumi ar atbilžu pārbaudi un plāns līdz pašam eksāmenam. Viss latviski un vienuviet.
            </p>
            <div className="np-cta">
              <Link href={start} className="np-btn np-btn-gold">{loggedIn ? 'Turpināt mācīties' : 'Sākt bez maksas'} <span aria-hidden="true">→</span></Link>
              {!loggedIn && <Link href="/login" className="np-btn np-btn-ghost">Man jau ir konts</Link>}
            </div>
            <div className="np-trust"><span>Bez kartes</span><span>Latviešu valodā</span><span>Mājieni, nevis špikeri</span></div>
          </div>
          <div className="np-stage" aria-hidden="true">
            <div className="np-orb" />
            <div className="np-bubble np-bubble-q">
              <small>Tu</small>
              <MathText as="span" text="Kā atrisināt $x^2 - 5x + 6 = 0$?" />
            </div>
            <div className="np-bubble np-bubble-a">
              <small>AI skolotājs</small>
              <MathText as="span" text={'Sāksim ar mājienu: kuri divi skaitļi reizinājumā dod $6$, bet summā $5$? Pamēģini!'} />
            </div>
            <span className="np-chip np-chip-1">VIAA eksāmens · 2.3. uzd.</span>
            <span className="np-chip np-chip-2"><b>✓</b> Pareizi! +1 punkts</span>
          </div>
        </section>

        <section className="np-section" id="ka-strada">
          <span className="np-kicker">Kā tas strādā</span>
          <h2 className="np-h2">Trīs soļi līdz mierīgam eksāmenam.</h2>
          <div className="np-steps">
            <div className="np-step"><h3>Izvēlies eksāmenu</h3><p>Norādi klasi un priekšmetus. Study Pilot parāda iepriekšējo gadu valsts eksāmenu uzdevumus.</p></div>
            <div className="np-step"><h3>Risini un pārbaudi</h3><p>Atbildi uz testa jautājumiem un uzreiz redzi, vai pareizi. Atvērtajiem uzdevumiem palīdz AI.</p></div>
            <div className="np-step"><h3>Saproti kļūdas</h3><p>Ja iestrēgsti, AI skolotājs dod nākamo mājienu. Progress parāda, kurām tēmām vajag vēl laiku.</p></div>
          </div>
        </section>

        <section className="np-section" id="funkcijas">
          <span className="np-kicker">Viss, kas vajadzīgs</span>
          <h2 className="np-h2">Tavs mācību pilots no pirmās dienas līdz eksāmenam.</h2>
          <div className="np-features">
            <article className="np-feature is-big">
              <Ico n="spark" />
              <h3>AI skolotājs, kas māca domāt</h3>
              <p>Uzdod jautājumu par jebkuru uzdevumu. AI atrod līdzīgus eksāmenu uzdevumus un vada tevi pa soļiem — formulas parādās tieši tā, kā mācību grāmatā.</p>
              <div className="np-mini-chat" aria-hidden="true">
                <div className="me"><MathText as="span" text={'Nesaprotu, kā vienkāršot $\\sqrt{50}$'} /></div>
                <div className="ai"><MathText as="span" text={'Sadali $50$ reizinājumā, kur viens skaitlis ir pilns kvadrāts. Kurš pilns kvadrāts dala $50$?'} /></div>
              </div>
            </article>
            <article className="np-feature"><Ico n="doc" /><h3>Valsts eksāmenu uzdevumi</h3><p>Iepriekšējo gadu VIAA eksāmeni ar automātisku atbilžu pārbaudi un norādi, no kura gada ir katrs uzdevums.</p></article>
            <article className="np-feature"><Ico n="bolt" /><h3>Savi testi</h3><p>Izveido testus no savām piezīmēm un pārbaudi sevi pirms kontroldarba.</p></article>
            <article className="np-feature"><Ico n="cal" /><h3>Termiņu radars</h3><p>Kontroldarbi, projekti un eksāmeni kalendārā — redzi, kam pievērsties šodien.</p></article>
            <article className="np-feature"><Ico n="clock" /><h3>Fokusa režīms</h3><p>15, 25 vai 45 minūšu taimeris vienam uzdevumam bez traucēkļiem.</p></article>
          </div>
        </section>

        <section className="np-section" id="cenas">
          <span className="np-kicker">Cenas</span>
          <h2 className="np-h2">Sāc bez maksas. Pārej uz Premium, kad vajag vairāk.</h2>
          <div className="np-pricing">
            <div className="np-plan">
              <h3>Bezmaksas</h3>
              <div className="np-price">0 €</div>
              <ul>
                <li>{config.aiLimitFree} AI skolotāja jautājumi dienā</li>
                <li>Valsts eksāmenu uzdevumi ar pārbaudi</li>
                <li>Plānotājs, termiņu radars un fokusa režīms</li>
                <li>Līdz {FREE_LIMITS.quizzes} saviem testiem un {FREE_LIMITS.exercises} uzdevumiem</li>
              </ul>
              <Link href={start} className="np-btn np-btn-ghost">{loggedIn ? 'Atvērt paneli' : 'Izveidot kontu'}</Link>
            </div>
            <div className="np-plan is-gold">
              <span className="np-tag">Vairāk iespēju</span>
              <h3>Premium</h3>
              <div className="np-price">{config.premiumPrice || <small>Cena tiks paziņota drīzumā</small>}</div>
              <ul>{premiumFeatures(config).map((f) => <li key={f}>{f}</li>)}</ul>
              <Link href={loggedIn ? '/premium' : '/register?next=%2Fpremium'} className="np-btn np-btn-gold">Iegūt Premium</Link>
            </div>
          </div>
        </section>

        <section className="np-section" id="jautajumi">
          <span className="np-kicker">Biežāk uzdotie jautājumi</span>
          <h2 className="np-h2">Jautājumi un atbildes</h2>
          <div className="np-faq">
            {FAQ.map(([q, a]) => (
              <details key={q}><summary>{q}</summary><p>{a}</p></details>
            ))}
          </div>
        </section>

        <section className="np-final">
          <span className="np-kicker">Eksāmens tuvojas</span>
          <h2 className="np-h2">Sāc šodien ar vienu uzdevumu.</h2>
          <p className="np-sub" style={{ margin: '0 auto' }}>Konta izveide aizņem minūti. Bez kartes, bez saistībām.</p>
          <div className="np-cta">
            <Link href={start} className="np-btn np-btn-gold">{loggedIn ? 'Turpināt mācīties' : 'Sākt bez maksas'} <span aria-hidden="true">→</span></Link>
          </div>
        </section>

        <footer className="np-footer">
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
