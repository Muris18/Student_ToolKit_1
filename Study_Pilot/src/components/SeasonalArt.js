import React from 'react';

// A contained decoration: never intercepts clicks or appears over learning controls.
export default function SeasonalArt() {
  return <div className="pilot-art" aria-hidden="true">
    <div className="pilot-star">✦</div>
    <span className="pilot-art-message">TEV<br />IZDOSIES.</span>
    <span className="pilot-pumpkin pumpkin-one">🎃</span>
    <span className="pilot-pumpkin pumpkin-two">🎃</span>
    <span className="pilot-bat bat-one">🦇</span>
    <span className="pilot-bat bat-two">🦇</span>
    <span className="pilot-spark spark-one">✧</span>
    <span className="pilot-spark spark-two">✧</span>
  </div>;
}
