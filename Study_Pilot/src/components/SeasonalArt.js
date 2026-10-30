import React, { useEffect, useState } from 'react';
import { seasonFor } from '../lib/designHelpers';
export function useSeason() {
  const [season, setSeason] = useState(null);
  useEffect(() => {
    const refresh = () => setSeason(seasonFor(new Date()));
    refresh(); const id = setInterval(refresh, 60000); return () => clearInterval(id);
  }, []);
  return season;
}
export function SeasonalBadge() {
  const season = useSeason();
  return <span className="pilot-season-badge">✦ {season?.message || 'Mazi soļi. Liels progress.'}</span>;
}
export function SeasonalNote() {
  const season = useSeason();
  return <div className="pilot-season-note"><span aria-hidden="true">{season?.symbols[0] || '✦'}</span>{season?.note || 'Viens solis tuvāk tavam mērķim.'}</div>;
}
export default function SeasonalArt() {
  const season = useSeason();
  return <div className="pilot-art" aria-hidden="true"><div className="pilot-star">✦</div><span className="pilot-art-message">TEV<br />IZDOSIES.</span>{season && <><span className="pilot-pumpkin pumpkin-one">{season.symbols[0]}</span><span className="pilot-pumpkin pumpkin-two">{season.symbols[1]}</span><span className="pilot-bat bat-one">{season.symbols[2]}</span><span className="pilot-bat bat-two">{season.symbols[3]}</span></>}<span className="pilot-spark spark-one">✧</span><span className="pilot-spark spark-two">✧</span></div>;
}
