import React from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';

export default function QuickActions() {
  // Ātro darbību saraksts ar ikonām un aprakstiem
  const actions = [
    {
      title: 'Sākt AI čatu',
      description: 'Uzdod jautājumu par neskaidru eksāmena uzdevumu',
      icon: '🤖',
      variant: 'primary',
      onClick: () => window.location.href = '/exams?mode=ai'
    },
    {
      title: 'Pievienot termiņu',
      description: 'Ievadi jaunu kontroldarbu vai ieskaiti plānotājā',
      icon: '⏳',
      variant: 'secondary',
      onClick: () => window.location.href = '/planner'
    },
    {
      title: 'Pildīt testa režīmu',
      description: 'Ātri pārbaudi zināšanas par izvēlēto tēmu',
      icon: '⚡',
      variant: 'secondary',
      onClick: () => window.location.href = '/exams?mode=quiz'
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