import React, { useState } from 'react';
import { X, Send, Sparkles, MessageSquare, Bot, AlertCircle } from 'lucide-react';
import { MRIAnalysisResult } from '../types/radiology';

interface RadiologyConsultDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: MRIAnalysisResult;
  imageBase64?: string;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

const PRESET_QUESTIONS = [
  'What imaging features differentiate this from a solitary brain metastasis?',
  'Assess the mass effect and risk of uncal or subfalcine herniation.',
  'What molecular markers (IDH1, MGMT, 1p/19q) are critical for this lesion?',
  'What pre-operative functional MRI or tractography studies are indicated?',
];

export const RadiologyConsultDrawer: React.FC<RadiologyConsultDrawerProps> = ({
  isOpen,
  onClose,
  analysis,
  imageBase64,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: `Hello Doctor. I am your Neuroradiology AI Assistant. I have reviewed the active scan classified as **${analysis.subType}** (${analysis.whoGrade}) with **${analysis.confidenceScore.toFixed(1)}% confidence**. How can I assist with your diagnostic review, differential analysis, or surgical planning?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/radiology-consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: query,
          diagnosisContext: analysis,
          imageBase64: imageBase64 || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to consult AI service');
      }

      const data = await response.json();
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.answer || 'Consultation response not generated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: 'The consultation service encountered an issue. In general, clinical correlation with biopsy histopathology and multidisciplinary neuro-oncology tumor board review is advised.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-indigo-600 border-l border-slate-200 shadow-2xl z-50 flex flex-col text-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-slate-950 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">AI Neuroradiology Consult</h3>
            <p className="text-[11px] text-slate-500">Interactive case reasoning & differential inquiry</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-slate-100"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Case Context pill */}
      <div className="px-4 py-2 bg-slate-950/70 border-b border-slate-200/80 text-xs font-mono flex items-center justify-between text-slate-500">
        <span className="truncate">Active Case: <strong className="text-cyan-400">{analysis.subType}</strong></span>
        <span>{analysis.whoGrade}</span>
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[88%] p-3.5 rounded-xl text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-cyan-600 text-white rounded-tr-none'
                  : 'bg-slate-950 border border-slate-200 text-slate-700 rounded-tl-none whitespace-pre-line'
              }`}
            >
              {m.text}
            </div>
            <span className="text-[10px] text-slate-500 font-mono mt-1 px-1">{m.timestamp}</span>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 p-2">
            <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <span>Consulting deep neuroradiology knowledge base...</span>
          </div>
        )}
      </div>

      {/* Preset Questions Drawer */}
      <div className="p-3 bg-slate-950/60 border-t border-slate-200 space-y-1.5">
        <span className="text-[11px] font-mono text-slate-500 block">Suggested Clinical Inquiries:</span>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="text-[11px] text-left px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md border border-slate-300 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input bar */}
      <div className="p-3 bg-slate-950 border-t border-slate-200 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask a neuroradiology or surgical question..."
          className="flex-1 bg-indigo-600 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-cyan-500"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={!input.trim() || isLoading}
          className="p-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white rounded-lg transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
