import React from 'react';
import Head from 'next/head';
import AppShell from '../components/AppShell';
import StudyTests from '../features/study/StudyTests';

// Pārbaudes darbi (kontroldarbi) parastajos priekšmetos: /parbaudes un /parbaudes?id=<plānotāja ieraksta id>
export default function ParbaudesPage() {
  return (
    <AppShell>
      <Head><title>Pārbaudes darbi — Study Pilot</title></Head>
      <StudyTests />
    </AppShell>
  );
}
