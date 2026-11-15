import React from 'react';
import Landing from '../components/Landing';
import { landingDemoHtml } from '../lib/landingDemo';

// Priekšskatījuma formulas tiek pārvērstas HTML būvēšanas laikā (KaTeX paliek serverī)
export async function getStaticProps() {
  return { props: { demo: landingDemoHtml() } };
}

// "Par Study Pilot": tā pati informācijas lapa, kas viesiem ir sākumlapa. Pieslēgtiem lietotājiem sākumlapa (/) ved uz paneli,
// tāpēc šo lapu var atvērt no lietotnes kājenes.
export default function ParPage({ demo }) {
  return <Landing info demo={demo} />;
}
