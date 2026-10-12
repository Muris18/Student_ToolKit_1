import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import DashboardMain from '../features/dashboard/DashboardMain';
import ProgressSummaryWidget from '../features/dashboard/ProgressSummaryWidget';
import UpcomingDeadlinesWidget from '../features/dashboard/UpcomingDeadlinesWidget';
import QuickActions from '../features/dashboard/QuickActions';

export default function DashboardPage() {
  // Pagaidu lietotāja dati (vizināšanai, vēlāk tiks piesaistīti Supabase Auth)
  const currentUser = { name: "Markuss Bērziņš", className: "12. klase" };

  return (
    <div className="min-h-screen bg-page flex flex-col">
      {/* Augšējā josla */}
      <Navbar user={currentUser} />
      
      <div className="flex flex-1">
        {/* Sānu izvēlne */}
        <Sidebar currentPath="/dashboard" />
        
        {/* Galvenais satura laukums */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto space-y-6">
          
          {/* Sveiciena un galvenā informācijas daļa */}
          <DashboardMain user={currentUser} />
          
          {/* Sīkāki logrīki blakus izkārtojumā */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProgressSummaryWidget />
            <UpcomingDeadlinesWidget onViewAll={() => window.location.href = '/planner'} />
          </div>

          {/* Ātrās darbības apakšējā daļā */}
          <QuickActions />

        </main>
      </div>
    </div>
  );
}