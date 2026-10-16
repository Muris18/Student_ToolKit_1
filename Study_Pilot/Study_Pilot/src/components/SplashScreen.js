import React, { useEffect, useState } from 'react';

const TITLE = 'Study Pilot'.split('');

export default function SplashScreen() {
  const [phase, setPhase] = useState('run'); // run -> out -> done
  const [device, setDevice] = useState('desktop');

  useEffect(() => {
    const root = document.documentElement;
    setDevice(root.dataset.device || 'desktop');
    if (root.dataset.splash === 'off') { setPhase('done'); return; }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t1 = setTimeout(() => setPhase('out'), reduce ? 400 : 2700);
    const t2 = setTimeout(() => finish(), reduce ? 700 : 3300);
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
      <div className="splash-glow" />
      <div className="splash-logo">SP</div>
      <h1 className="splash-title" aria-hidden="true">
        {TITLE.map((ch, i) => (
          <span key={i} className={i > 5 ? 'text-gradient' : ''} style={{ animationDelay: `${0.45 + i * 0.11}s` }}>
            {ch === ' ' ? '\u00A0' : ch}
          </span>
        ))}
      </h1>
      <p className="splash-sub">Eksāmenu sagatavošana vienuviet</p>
      <div className="splash-bar"><i /></div>
      <p className="splash-device">{device === 'mobile' ? '📱 Mobilā versija' : '💻 Datora versija'}</p>
    </div>
  );
}
