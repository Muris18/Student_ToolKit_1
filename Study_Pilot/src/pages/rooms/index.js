import React from 'react';
import Head from 'next/head';
import AppShell from '../../components/AppShell';
import RoomsHome from '../../features/rooms/RoomsHome';

// Mācību istabas: /rooms
export default function RoomsPage() {
  return (
    <AppShell>
      <Head><title>Mācību istabas — Study Pilot</title></Head>
      <RoomsHome />
    </AppShell>
  );
}
