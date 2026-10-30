import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Button from '../components/Button';
import SeasonalArt, { SeasonalBadge, SeasonalNote } from '../components/SeasonalArt';
import { useApp } from '../lib/AppContext';

export default function LandingPage() {
  const { status } = useApp();
  const router = useRouter();
  const loggedIn = status === 'ready';
  const enter = (href) => () => router.push(loggedIn ? href : `/register?next=${encodeURIComponent(href)}`);
  return <div className="pilot-landing flex-1 flex flex-col">
    <main className="pilot-home">
      <section className="pilot-hero">
        <div className="pilot-hero-copy">
          <SeasonalBadge />
          <h1>Mazāk haosa.<br />Vairāk <span>“gatavs!”</span></h1>
          <p>Tavi priekšmeti, eksāmeni un nākamais solis — vienā vietā. Paņem vienu uzdevumu un dodamies uz priekšu.</p>
          <div className="pilot-hero-actions">
            <Button onClick={() => router.push(loggedIn ? '/dashboard' : '/register')} className="pilot-primary">{loggedIn ? 'Uz manu studiju telpu' : 'Izveidot savu studiju telpu'} <span aria-hidden="true">↗</span></Button>
            {!loggedIn && <Link href="/login" className="pilot-login">Man jau ir konts →</Link>}
          </div>
          <span className="pilot-hero-caption">9. un 12. klasei · Studentiem · Tavam ritmam</span>
        </div>
        <SeasonalArt />
      </section>
      <div className="pilot-section-heading"><h2>Tava telpa labām idejām.</h2><span>MAZI SOĻI. LIELS PROGRESS.</span></div>
      <section className="pilot-feature-grid" aria-label="Studiju rīki">
        <article className="pilot-feature pilot-feature-blue"><span className="pilot-eyebrow">01 / TAVS NĀKAMAIS SOLIS</span><h2>Pieradini<br />eksāmenus.</h2><p>Krāj materiālus, risini uzdevumus un pārbaudi sevi ar testiem.</p><button type="button" onClick={enter('/exams')}>Atvērt eksāmenus <span aria-hidden="true">↗</span></button></article>
        <article className="pilot-feature"><span className="pilot-eyebrow">02 / VIETA SKAIDRAI GALVAI</span><h2>Viss ieplānots.<br />Vari uzelpot.</h2><p>Saliec termiņus kalendārā un zini, kam pievērsties šodien.</p><button type="button" onClick={enter('/planner')}>Atvērt plānotāju <span aria-hidden="true">↗</span></button></article>
        <article className="pilot-feature pilot-feature-goal"><span className="pilot-goal-icon" aria-hidden="true">⚑</span><span className="pilot-eyebrow">03 / TAVAS MAZĀS UZVARAS</span><h2>Progress,<br />ko vari redzēt.</h2><p>Seko paveiktajam un atrodi tēmas, kurām vajag vēl mazliet uzmanības.</p><button type="button" onClick={enter('/progress')}>Apskatīt progresu <span aria-hidden="true">↗</span></button></article>
      </section>
      <SeasonalNote />
    </main>
    <footer className="pilot-footer"><span>© 2026 Study Pilot · Izveidots Latvijas skolēniem.</span><div><Link href="/privacy">Privātuma politika</Link><Link href="/terms">Lietošanas noteikumi</Link><Link href="/admin">Administrēšana</Link></div></footer>
  </div>;
}
