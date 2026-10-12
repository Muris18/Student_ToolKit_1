import React, { useMemo } from 'react';

export default function Confetti() {
  const pieces = useMemo(() => Array.from({ length: 40 }, (_, i) => ({
    x: (Math.random() - 0.5) * 380, y: -(40 + Math.random() * 170), r: Math.random() * 540 - 270,
    d: Math.random() * 0.3, c: ['rgb(var(--acc))', 'rgb(var(--acc2))', '#fbbf24'][i % 3],
  })), []);
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p, i) => (
        <i key={i} style={{ '--x': `${p.x}px`, '--y': `${p.y}px`, '--r': `${p.r}deg`, animationDelay: `${p.d}s`, background: p.c }} />
      ))}
    </div>
  );
}
