import React, { useEffect, useState } from 'react';
import Button from '../../components/Button';

// Apstiprinājums pašā lapā (nevis pārlūka window.confirm, ko pārlūki var bloķēt vai nerādīt, un darbība tad klusi neizpildās).
// Pirmais klikšķis parāda jautājumu ar pogām "Jā" un "Atcelt"; bez atbildes 10 s laikā poga atgriežas sākotnējā stāvoklī.
// Izmanto: features/rooms/RoomView.js (iziet, aizvērt istabu, izmest dalībnieku) un RoomRounds.js (pabeigt kārtu).
// as="link": maza teksta saite (dalībnieku sarakstā); citādi poga.
export default function ConfirmButton({ children, question, yes = 'Jā', onConfirm, variant = 'secondary', className = '', as = 'button', ariaLabel }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return undefined;
    const t = setTimeout(() => setArmed(false), 10000);
    return () => clearTimeout(t);
  }, [armed]);

  if (!armed) {
    if (as === 'link') {
      return <button type="button" onClick={() => setArmed(true)} className={className} aria-label={ariaLabel}>{children}</button>;
    }
    return <Button variant={variant} onClick={() => setArmed(true)} className={className}>{children}</Button>;
  }
  return (
    <span role="alertdialog" aria-label={question} className="inline-flex flex-wrap items-center gap-2 p-1.5 rounded-xl border border-slate-200 bg-slate-50">
      <span className="text-xs font-semibold text-slate-700 px-1">{question}</span>
      <Button variant="danger" onClick={() => { setArmed(false); onConfirm(); }} className="text-xs py-1 px-3">{yes}</Button>
      <Button variant="ghost" onClick={() => setArmed(false)} className="text-xs py-1 px-3">Atcelt</Button>
    </span>
  );
}
