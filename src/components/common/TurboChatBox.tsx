import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, ArrowRight } from 'lucide-react';
import { turboService, TurboMessage } from '../../services/turboService';
import { UserRole, ServiceOrder } from '../../types';

interface TurboChatBoxProps {
  role: UserRole;
  orders: ServiceOrder[];
  onClose: () => void;
  onViewOrder: (orderId: string) => void;
}

export const TurboChatBox: React.FC<TurboChatBoxProps> = ({ role, orders, onClose, onViewOrder }) => {
  const [messages, setMessages] = useState<TurboMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Welcome Message
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        sender: 'turbo',
        text: turboService.getWelcomeMessage(role),
        timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [role]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage: TurboMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate network delay for AI feel
    setTimeout(async () => {
      const response = await turboService.processUserMessage(userMessage.text, role, orders);
      setMessages(prev => [...prev, response]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="fixed bottom-28 right-6 w-80 md:w-96 bg-black/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-[0_0_40px_rgba(0,229,255,0.15)] flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-8 fade-in duration-300">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-black p-4 border-b border-cyan-500/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-full bg-slate-100 border border-cyan-400 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-cyan-500/20 animate-pulse" />
            <svg viewBox="0 0 120 120" className="w-6 h-6 relative z-10" fill="none">
              <path d="M30 45 L42 20 L55 35 Z" fill="#94A3B8" />
              <path d="M90 45 L78 20 L65 35 Z" fill="#94A3B8" />
              <ellipse cx="60" cy="55" rx="38" ry="32" fill="#090D16" stroke="#00E5FF" strokeWidth="3" />
              <path d="M32 50 Q60 40 88 50 Q85 68 60 70 Q35 68 32 50 Z" fill="#00E5FF" opacity="0.95" />
            </svg>
          </div>
          <div>
            <h3 className="text-slate-900 font-display text-sm tracking-wide">TURBO ASSISTANT</h3>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-cyan-400 font-mono uppercase">En línea</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto h-96 flex flex-col gap-4 custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div 
              className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                msg.sender === 'user' 
                  ? 'bg-cyan-600 text-slate-900 rounded-tr-sm' 
                  : 'bg-slate-100 border border-slate-700 text-slate-200 rounded-tl-sm'
              }`}
            >
              <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              
              {/* Action Buttons inside message */}
              {msg.isActionable && msg.actionData?.type === 'view_order' && (
                <button 
                  onClick={() => onViewOrder(msg.actionData.orderId)}
                  className="mt-3 w-full bg-black/40 hover:bg-black/60 border border-cyan-500/30 py-2 px-3 rounded-xl flex items-center justify-between text-cyan-400 font-bold transition-colors text-xs"
                >
                  VER {msg.actionData.orderNumber} <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <span className="text-[9px] text-slate-500 mt-1 font-mono">{msg.timestamp}</span>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-start">
            <div className="bg-slate-100 border border-slate-700 p-3 rounded-2xl rounded-tl-sm flex gap-1">
              <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-white/5">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Pregunta o busca placas..."
            className="w-full bg-black border border-slate-700 focus:border-cyan-500 rounded-full py-2.5 pl-4 pr-12 text-sm text-slate-900 placeholder:text-slate-600 outline-none transition-colors font-mono"
          />
          <button 
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="absolute right-1.5 w-8 h-8 flex items-center justify-center bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 rounded-full text-black transition-colors"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
