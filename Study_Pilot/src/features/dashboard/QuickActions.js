import React from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { useRouter } from 'next/router';

export default function QuickActions() {
  const router = useRouter();
  // Ātro darbību saraksts ar ikonām un aprakstiem
  const actions = [
    {
      title: 'Atvērt AI čatu',
      description: 'Pieraksti jautājumu par neskaidru eksāmena uzdevumu',
      icon: '🤖',
      variant: 'primary',
      onClick: () => router.push('/exams?mode=ai')
    },
    {
      title: 'Pievienot termiņu',
      description: 'Ievadi jaunu kontroldarbu vai ieskaiti plānotājā',
      icon: '⏳',
      variant: 'secondary',
      onClick: () => router.push('/planner')
    },
    {
      title: 'Testa režīms',
      description: 'Izveido savu testu vai pārbaudi zināšanas',
      icon: '⚡',
      variant: 'secondary',
      onClick: () => router.push('/exams?mode=quiz')
    }
  ];

  return (
    <Card 
      title="⚡ Ātrās darbības" 
      subtitle="Kas šodien ir padomā?"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {actions.map((action, index) => (
          <div 
            key={index} 
            className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col justify-between gap-4"
          >
            <div>
              <span className="text-2xl mb-2 inline-block">{action.icon}</span>
              <h4 className="font-semibold text-slate-800 text-sm">{action.title}</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{action.description}</p>
            </div>
            
            <Button 
              variant={action.variant} 
              onClick={action.onClick}
              className="w-full text-xs py-2"
            >
              Atvērt
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}