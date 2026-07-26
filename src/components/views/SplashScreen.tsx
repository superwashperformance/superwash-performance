import React from 'react';
import { FaviconLogo } from '../common/FaviconLogo';
import { MascotTurbo } from '../common/MascotTurbo';
import { ArrowRight, Play } from 'lucide-react';

interface SplashScreenProps {
  onEnter: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onEnter }) => {
  return (
    <div className="fixed inset-0 z-50 bg-[#040609] text-white flex flex-col items-center justify-between p-6 md:p-12 overflow-hidden select-none">
      {/* Background Cyber Glow & Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#00E5FF_1.5px,transparent_1.5px)] [background-size:32px_32px] opacity-15 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />

      {/* Top Header */}
      <div className="relative z-10 w-full flex items-center justify-between">
        <FaviconLogo size={52} showText />
        <div className="px-4 py-1.5 rounded-full bg-slate-900/80 border border-white/15 text-xs font-mono text-cyan-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-ping" />
          <span>SISTEMA DE GESTIÓN TALLER EN VIVO</span>
        </div>
      </div>

      {/* Center Official Emblem & Ignition Graphic */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-3xl my-auto">
        <div className="relative mb-8 group cursor-pointer" onClick={onEnter}>
          {/* Glowing Aura Ring */}
          <div className="absolute -inset-6 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-400 rounded-full blur-2xl opacity-60 group-hover:opacity-100 transition-opacity animate-pulse-glow" />

          {/* Official Emblem Container - Scaled to fit 100% full circle */}
          <div className="relative w-56 h-56 md:w-64 md:h-64 rounded-full bg-black border-2 border-[#00E5FF]/40 shadow-2xl flex items-center justify-center overflow-hidden">
            <img
              src="/logo.png"
              alt="Super Wash Performance Emblem"
              className="w-full h-full object-cover rounded-full transform scale-[1.6] translate-y-2 group-hover:scale-[1.65] transition-transform duration-500"
            />
            {/* Center Play Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
              <div className="w-16 h-16 rounded-full bg-[#00E5FF] text-black flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform">
                <Play className="w-8 h-8 fill-black ml-1" />
              </div>
            </div>
          </div>
        </div>

        {/* Athletic High-Impact Title */}
        <h1 className="font-display text-5xl md:text-7xl tracking-wider text-white mb-3">
          SUPER WASH <span className="text-[#00E5FF] drop-shadow-[0_0_25px_rgba(0,229,255,0.6)]">PERFORMANCE</span>
        </h1>
        <p className="font-heading text-lg md:text-xl text-slate-300 font-medium max-w-xl mb-6">
          Plataforma Enterprise de Estética Automotriz, Detailing, Pintura y Gestión 360° de Órdenes de Servicio.
        </p>

        {/* Turbo Mascot Greeting Component */}
        <div className="w-full max-w-lg mb-8">
          <MascotTurbo message="¡Bienvenido a Super Wash Performance! El logo oficial encaja ahora perfectamente al 100% dentro del marco circular. Presiona Iniciar para entrar." />
        </div>

        {/* Enter Button */}
        <button
          onClick={onEnter}
          className="btn-nike-primary text-xl py-4 px-10 shadow-2xl flex items-center gap-3 group"
        >
          <span>INICIAR SISTEMA TALLER 360°</span>
          <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Footer Info */}
      <div className="relative z-10 w-full text-center text-xs text-slate-500 font-mono flex flex-col md:flex-row items-center justify-between gap-2 border-t border-white/10 pt-4">
        <span>© 2026 SUPER WASH PERFORMANCE C.A. Todos los derechos reservados.</span>
        <span className="text-slate-400">Diseño Oficial de Marca Integrado</span>
      </div>
    </div>
  );
};
