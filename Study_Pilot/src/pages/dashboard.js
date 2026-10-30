import React from 'react';
import { useRouter } from 'next/router';
import AppShell from '../components/AppShell';
import DashboardMain from '../features/dashboard/DashboardMain';
import ProgressSummaryWidget from '../features/dashboard/ProgressSummaryWidget';
import UpcomingDeadlinesWidget from '../features/dashboard/UpcomingDeadlinesWidget';
import QuickActions from '../features/dashboard/QuickActions';
import StudySpace from '../features/dashboard/StudySpace';

export default function DashboardPage() {
  const router = useRouter();
  return (
    <AppShell>
      <DashboardMain />
      <StudySpace />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProgressSummaryWidget />
        <UpcomingDeadlinesWidget onViewAll={() => router.push('/planner')} />
      </div>
      <QuickActions />
    </AppShell>
  );
}
