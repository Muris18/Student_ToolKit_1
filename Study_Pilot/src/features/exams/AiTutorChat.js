import React, { useState } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';

export default function AiTutorChat() {
  const [messages, setMessages] = useState([
    { 
      sender: 'ai', 
      text: 'Sveiks! Es esmu tavs Study Pilot AI mācību palīgs. Kādu eksāmenu uzdevumu vai tēmu šodien vēlies izskaidrot?' 
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Funkcija ziņas nosūtīšanai
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = { sender: 'user', text: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Imitējam atbildi no servera (virsraksts/RAG service)
    setTimeout(() => {
      const aiResponse = { 
        sender: 'ai', 
        text: `Paldies par jautājumu! Analizējot valsts eksāmenu standartus, šajā tēmā visbiežāk jāpievērš uzmanība nosacījumiem. Pamēģināsim to izskaidrot sol pas solim...` 
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <Card 
      title="🤖 Study Pilot AI Skolotājs" 
      subtitle="Balstīts uz oficiālajiem 9. un 12. klašu eksāmenu materiāliem"
      className="flex flex-col h-[600px]"
    >
      <div className="flex flex-col h-full justify-between">
        
        {/* Četa ziņu logs */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                msg.sender === 'user' 
                  ? 'bg-indigo-600 text-white rounded-br-xs' 
                  : 'bg-slate-100 text-slate-800 rounded-bl-xs border border-slate-200/60'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 text-slate-400 p-4 rounded-2xl text-sm animate-pulse">
                AI domā un meklē materiālos...
              </div>
            </div>
          )}
        </div>

        {/* Ievades forma ziņas rakstīšanai */}
        <form onSubmit={handleSendMessage} className="flex gap-2 pt-3 border-t border-slate-100">
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Uzdod jautājumu par matemātiku, latviešu valodu..." 
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-indigo-600 transition-colors"
          />
          <Button type="submit" variant="primary" disabled={isLoading}>
            Sūtīt
          </Button>
        </form>

      </div>
    </Card>
  );
}