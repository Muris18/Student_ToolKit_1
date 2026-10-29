import React, { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [phase, setPhase] = useState('run'); // run -> out -> done

  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.splash === 'off') { setPhase('done'); return; }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t1 = setTimeout(() => setPhase('out'), reduce ? 300 : 1300);
    const t2 = setTimeout(() => finish(), reduce ? 500 : 1700);
    function finish() {
      try { sessionStorage.setItem('sp-splash', '1'); } catch (e) {}
      root.dataset.splash = 'off';
      setPhase('done');
    }
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (phase === 'done') return null;

  const skip = () => {
    try { sessionStorage.setItem('sp-splash', '1'); } catch (e) {}
    document.documentElement.dataset.splash = 'off';
    setPhase('done');
  };

  return (
    <div className={`splash ${phase === 'out' ? 'splash-out' : ''}`} onClick={skip} role="status" aria-label="Study Pilot ielādējas">
      <div className="splash-logo">SP</div>
      <h1 className="splash-title">Study Pilot</h1>
      <p className="splash-sub">Eksāmenu sagatavošana vienuviet</p>
    </div>
  );
}
