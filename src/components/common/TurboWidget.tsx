import React, { useState } from 'react';
import { MascotTurbo } from './MascotTurbo';
import { TurboChatBox } from './TurboChatBox';
import { MessageSquare, X } from 'lucide-react';
import { UserRole, ServiceOrder } from '../../types';

interface TurboWidgetProps {
  role: UserRole;
  orders: ServiceOrder[];
  onViewOrder: (orderId: string) => void;
}

export const TurboWidget: React.FC<TurboWidgetProps> = ({ role, orders, onViewOrder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <TurboChatBox 
          role={role}
          orders={orders}
          onClose={() => setIsOpen(false)}
          onViewOrder={(orderId) => {
            setIsOpen(false);
            onViewOrder(orderId);
          }}
        />
      )}

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50 print:hidden">
        <button
          onClick={toggleChat}
          className="relative group flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
        >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-cyan-500 rounded-full blur-xl opacity-40 group-hover:opacity-70 animate-pulse-glow" />
          
          <div className="relative w-16 h-16 rounded-full bg-slate-900 border-2 border-cyan-500 shadow-2xl flex items-center justify-center overflow-hidden">
            {isOpen ? (
              <X className="w-8 h-8 text-cyan-400" />
            ) : (
              <div className="relative w-full h-full p-2">
                <svg viewBox="0 0 120 120" className="w-full h-full" fill="none">
                  <defs>
                    <linearGradient id="mascotMetalBtn" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFFFFF" />
                      <stop offset="50%" stopColor="#94A3B8" />
                      <stop offset="100%" stopColor="#0F172A" />
                    </linearGradient>
                    <linearGradient id="turboCyanBtn" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#00E5FF" />
                      <stop offset="100%" stopColor="#0072FF" />
                    </linearGradient>
                  </defs>
                  <path d="M30 45 L42 20 L55 35 Z" fill="url(#mascotMetalBtn)" stroke="#000" strokeWidth="2" />
                  <path d="M90 45 L78 20 L65 35 Z" fill="url(#mascotMetalBtn)" stroke="#000" strokeWidth="2" />
                  <ellipse cx="60" cy="55" rx="38" ry="32" fill="#090D16" stroke="url(#turboCyanBtn)" strokeWidth="3" />
                  <path d="M32 50 Q60 40 88 50 Q85 68 60 70 Q35 68 32 50 Z" fill="url(#turboCyanBtn)" opacity="0.95" />
                  <path d="M40 52 L55 48 M65 48 L80 52" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
                </svg>
              </div>
            )}
          </div>

          {/* Unread Badge */}
          {!isOpen && unreadCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-black animate-bounce">
              {unreadCount}
            </div>
          )}
        </button>
      </div>
    </>
  );
};
