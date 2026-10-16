import React, { useEffect, useRef, useState } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { useApp } from '../../lib/AppContext';
import { uid } from '../../lib/helpers';

// Tikai čata LOGS (UI). AI atbildes šeit netiek ģenerētas —
// to pieslēgs AI daļas komanda. Lietotāja ziņas saglabājas viņa datos.
export default function AiTutorChat({ draft = '' }) {
  const { data, update } = useApp();
  const [inputValue, setInputValue] = useState(draft);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const messages = data.chat;

  useEffect(() => { if (draft) { setInputValue(draft); inputRef.current?.focus(); } }, [draft]);
  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }); }, [messages.length]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text) return;
    update((d) => ({ ...d, chat: [...d.chat, { id: uid(), sender: 'user', text, date: new Date().toISOString() }].slice(-300) }));
    setInputValue('');
  };

  const clear = () => window.confirm('Notīrīt čata vēsturi?') && update((d) => ({ ...d, chat: [] }), { activity: false });

  return (
    <Card
      title="🤖 Study Pilot AI Skolotājs"
      subtitle="Uzdod jautājumu par eksāmena uzdevumu vai tēmu"
      className="flex flex-col h-[calc(100svh-15rem)] sm:h-[600px]"
      action={messages.length > 0 && <Button variant="ghost" onClick={clear} className="text-xs py-1.5 px-3">Notīrīt</Button>}
    >
      <div className="flex flex-col h-full justify-between">
        <div ref={listRef} className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
          <div className="flex justify-start">
            <div className="max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed bg-slate-100 text-slate-800 rounded-bl-xs border border-slate-200/60">
              Sveiks! Es esmu Study Pilot AI mācību palīgs. Kādu eksāmena uzdevumu vai tēmu šodien vēlies izskaidrot?
            </div>
          </div>

          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-br-xs' : 'bg-slate-100 text-slate-800 rounded-bl-xs border border-slate-200/60'}`}>
                {msg.text}
              </div>
            </div>
          ))}

          {messages.length > 0 && (
            <p className="text-center text-[11px] text-slate-400">AI vēl nav pieslēgts — atbildes šeit parādīsies, kad tas būs gatavs.</p>
          )}
        </div>

        <form onSubmit={handleSendMessage} className="flex gap-2 pt-3 border-t border-slate-100">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Uzdod jautājumu…"
            aria-label="Ziņa"
            className="flex-1 min-w-0 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-indigo-600 transition-colors"
          />
          <Button type="submit" disabled={!inputValue.trim()}>Sūtīt</Button>
        </form>
      </div>
    </Card>
  );
}
