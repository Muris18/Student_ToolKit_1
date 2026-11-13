import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AppShell from '../../components/AppShell';
import RoomView from '../../features/rooms/RoomView';

// Mācību istaba: /rooms/<kods>
export default function RoomPage() {
  const { query, isReady } = useRouter();
  const code = typeof query.code === 'string' ? query.code : '';
  return (
    <AppShell>
      <Head><title>Mācību istaba — Study Pilot</title></Head>
      {isReady && code && <RoomView key={code} code={code} />}
    </AppShell>
  );
}
