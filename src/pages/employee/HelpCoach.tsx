import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { MessageCircle, Send, Info } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { fallbackEmployeeDashboard } from '../../data/fallbackData';
import { useAsyncData } from '../../hooks/useAsyncData';
import { getActiveEmployeeAssignment, getEmployeeDashboard } from '../../lib/api';

export default function HelpCoach() {
  const { libraryResources } = useStore();
  const { data: activeAssignment } = useAsyncData(getActiveEmployeeAssignment, null, []);
  const { data: employeeDashboard } = useAsyncData(getEmployeeDashboard, fallbackEmployeeDashboard, []);
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [input, setInput] = useState('');
  const firstName = activeAssignment?.employeeName?.split(' ')[0];
  const frictionPoint = [...employeeDashboard.strengths].sort((a, b) => Number(a.A) - Number(b.A))[0];
  const recommendedResource = libraryResources.find((resource) => resource.category === 'Guide') ?? libraryResources[0];

  React.useEffect(() => {
    if (messages.length > 0) return;

    setMessages([{
      role: 'system',
      content: `Hi${firstName ? ` ${firstName}` : ''}. I am your Help Coach. I can help you understand your wellbeing stats, suggest resources, or guide you to organizational support. How can I help today?`,
    }]);
  }, [firstName, messages.length]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');

    setTimeout(() => {
      setMessages([...newMessages, { 
        role: 'system', 
        content: `Based on your latest profile, ${frictionPoint?.subject ?? 'your lowest-scoring support area'} is the area that may need the most attention right now. I recommend checking "${recommendedResource?.title ?? 'the recommended guide'}" in the Library.`
      }]);
    }, 1000);
  };

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Help Coach</h2>
        <p className="text-slate-500">Your personal guide to wellbeing resources.</p>
      </div>

      <Card className="flex-1 flex flex-col bg-white border-slate-100 shadow-sm rounded-3xl overflow-hidden">
        <div className="bg-teal-50 p-4 border-b border-teal-100 flex items-start space-x-3">
          <Info className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-teal-800">
            <strong>Note:</strong> This coach provides organizational wellbeing insights and resource recommendations. It is not a medical professional and does not provide clinical diagnosis or therapy.
          </p>
        </div>

        <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-4 ${
                msg.role === 'user' 
                  ? 'bg-slate-900 text-white rounded-tr-sm' 
                  : 'bg-slate-100 text-slate-800 rounded-tl-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
        </CardContent>

        <div className="p-4 border-t border-slate-100 bg-white">
          <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
            <button className="whitespace-nowrap px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-sm rounded-full border border-slate-200 transition-colors" onClick={() => setInput("Why is my stress score high?")}>
              Why is my stress score high?
            </button>
            <button className="whitespace-nowrap px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-sm rounded-full border border-slate-200 transition-colors" onClick={() => setInput("Show me recovery tips")}>
              Show me recovery tips
            </button>
            <button className="whitespace-nowrap px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-sm rounded-full border border-slate-200 transition-colors" onClick={() => setInput("Explain my profile")}>
              Explain my profile
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..." 
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <Button size="icon" className="h-12 w-12 rounded-xl bg-teal-600 hover:bg-teal-700 text-white" onClick={handleSend}>
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
