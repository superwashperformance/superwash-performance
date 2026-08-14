import React from 'react';
import { Sparkles, CheckCircle2, Zap } from 'lucide-react';

interface MascotTurboProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const MascotTurbo: React.FC<MascotTurboProps> = ({
  message = "¡Hola! Soy Turbo, el asistente de Super Wash. Todas las ODS están listas.",
  size = 'md',
  className = ''
}) => {
  const avatarSizes = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20'
  };

  const containerPadding = size === 'sm' ? 'py-3' : 'py-5';

  return (
    <div className={`flex items-center gap-4 ${containerPadding} border-y border-slate-100 bg-transparent ${className}`}>
      {/* Turbo Mascot Avatar */}
      <div className={`relative shrink-0 ${avatarSizes[size]} rounded-full bg-black p-1 border-2 border-transparent flex items-center justify-center overflow-hidden group`}>
        <div className="absolute inset-0 bg-cyan-500/10 animate-pulse-glow" />
        
        {/* Vector Mascot Graphic */}
        <svg viewBox="0 0 120 120" className="w-full h-full relative z-10" fill="none">
          <defs>
            <linearGradient id="mascotMetal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="50%" stopColor="#94A3B8" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
            <linearGradient id="turboCyan" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00E5FF" />
              <stop offset="100%" stopColor="#0072FF" />
            </linearGradient>
          </defs>

          {/* Cyber Helmet & Ears */}
          <path d="M30 45 L42 20 L55 35 Z" fill="url(#mascotMetal)" stroke="#000" strokeWidth="2" />
          <path d="M90 45 L78 20 L65 35 Z" fill="url(#mascotMetal)" stroke="#000" strokeWidth="2" />
          
          {/* Cyber Mask Head */}
          <ellipse cx="60" cy="55" rx="38" ry="32" fill="#090D16" stroke="url(#turboCyan)" strokeWidth="3" />
          
          {/* High Tech Visor */}
          <path d="M32 50 Q60 40 88 50 Q85 68 60 70 Q35 68 32 50 Z" fill="url(#turboCyan)" opacity="0.95" />
          <path d="M40 52 L55 48 M65 48 L80 52" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
          
          {/* Snout & Chrome Grill Detail */}
          <path d="M52 74 L68 74 L60 84 Z" fill="url(#mascotMetal)" />
          <circle cx="60" cy="80" r="3" fill="#00E5FF" />

          {/* Detailing Collar Badge */}
          <rect x="42" y="92" width="36" height="16" rx="8" fill="#1E293B" stroke="url(#turboCyan)" strokeWidth="1.5" />
          <circle cx="60" cy="100" r="4" fill="#00E5FF" />
        </svg>

        <div className="absolute bottom-0 right-0 bg-[#00E5FF] text-black rounded-full p-0.5 shadow-md">
          <Zap className="w-2.5 h-2.5 fill-black" />
        </div>
      </div>

      {/* Speech Bubble */}
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center gap-2 mb-1">
          <span className={`font-display font-bold tracking-wide text-slate-900 uppercase ${size === 'sm' ? 'text-sm' : 'text-base'}`}>TURBO</span>
          <span className={`uppercase font-bold tracking-wider rounded-full bg-transparent text-cyan-500 border border-cyan-200 flex items-center gap-1 ${size === 'sm' ? 'text-[9px] px-1.5 py-0.5' : 'text-[10px] px-2 py-0.5'}`}>
            <CheckCircle2 className="w-3 h-3" /> ASISTENTE 360°
          </span>
        </div>
        <p className={`text-slate-500 font-sans leading-snug ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
          {message}
        </p>
      </div>
    </div>
  );
};
