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
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  const containerPadding = size === 'sm' ? 'py-3' : 'py-5';

  return (
    <div className={`flex items-center gap-4 ${containerPadding} border-y border-[var(--color-border-subtle)] bg-transparent ${className}`}>
      {/* Turbo Mascot Avatar */}
      <div className={`relative shrink-0 ${avatarSizes[size]} rounded-full bg-black p-1 border-2 border-transparent flex items-center justify-center overflow-hidden group shadow-md`}>
        <div className="absolute inset-0 bg-cyan-500/10 animate-pulse-glow" />
        
        {/* Funko Pop Mascot Image framed to the face */}
        <img 
          src="/turbo-mascot.png" 
          alt="Turbo Mascot" 
          className="w-full h-full relative z-10 object-cover object-[center_20%] scale-[1.3] rounded-full" 
        />

        <div className="absolute bottom-0 right-0 bg-[#00E5FF] text-black rounded-full p-0.5 shadow-md">
          <Zap className="w-2.5 h-2.5 fill-black" />
        </div>
      </div>

      {/* Speech Bubble */}
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center gap-2 mb-1">
          <span className={`font-display font-bold tracking-wide text-[var(--color-text-primary)] uppercase ${size === 'sm' ? 'text-sm' : 'text-base'}`}>TURBO</span>
          <span className={`uppercase font-bold tracking-wider rounded-full bg-transparent text-cyan-500 border border-cyan-200 flex items-center gap-1 ${size === 'sm' ? 'text-[9px] px-1.5 py-0.5' : 'text-[10px] px-2 py-0.5'}`}>
            <CheckCircle2 className="w-3 h-3" /> ASISTENTE 360°
          </span>
        </div>
        <p className={`text-[var(--color-text-muted)] font-sans leading-snug ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
          {message}
        </p>
      </div>
    </div>
  );
};
