import React from 'react';

interface FaviconLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export const FaviconLogo: React.FC<FaviconLogoProps> = ({ size = 48, className = '', showText = false }) => {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Official Super Wash Performance Logo Badge */}
      <div
        className="relative flex items-center justify-center rounded-full bg-black border border-white/20 shadow-2xl overflow-hidden shrink-0 group"
        style={{ width: size, height: size }}
      >
        <div className="absolute inset-0 bg-[#00E5FF]/20 rounded-full blur-md opacity-40 group-hover:opacity-80 transition-opacity" />
        {/* Scale-[1.6] con translate-y-1 ajusta el emblema circular negro centrándolo */}
        <img
          src="/logo.png"
          alt="Super Wash Performance Logo"
          className="w-full h-full object-cover relative z-10 scale-[1.6] translate-y-1 transition-transform group-hover:scale-[1.65]"
        />
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col">
          <span className="font-display text-2xl tracking-wider text-white leading-none">
            SUPER <span className="text-[#00E5FF]">WASH</span>
          </span>
          <span className="font-heading text-[10px] tracking-[0.35em] text-slate-400 font-bold uppercase -mt-0.5">
            PERFORMANCE
          </span>
        </div>
      )}
    </div>
  );
};
