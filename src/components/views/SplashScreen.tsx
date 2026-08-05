import React, { useState } from 'react';
import { FaviconLogo } from '../common/FaviconLogo';
import { MascotTurbo } from '../common/MascotTurbo';
import { ArrowRight, User, Lock, AlertTriangle } from 'lucide-react';
import { sanitizeInput, checkRateLimit } from '../../utils/security';

interface SplashScreenProps {
  onEnter: (username?: string, password?: string) => void;
  onTrack: (plate: string) => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onEnter, onTrack }) => {
  const [plate, setPlate] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleTrack = () => {
    if (plate.trim()) {
      onTrack(plate.trim());
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    // Protection against Brute Force Attacks
    if (!checkRateLimit('splash_login_rate', 5, 60000)) {
      setLoginError('⚠️ Límite de intentos excedido. Espera 1 minuto por seguridad.');
      return;
    }

    const cleanUsername = sanitizeInput(email);
    onEnter(cleanUsername, password);
  };

  return (
    <div className="min-h-screen w-full bg-[#040609] text-white flex flex-col items-center justify-between p-3 sm:p-6 md:p-12 overflow-y-auto select-none">
      {/* Background Cyber Glow & Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#00E5FF_1.5px,transparent_1.5px)] [background-size:32px_32px] opacity-15 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-cyan-500/10 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none animate-pulse-glow" />

      {/* Top Header */}
      <div className="relative z-10 w-full flex flex-row items-center justify-between gap-2">
        <FaviconLogo size={40} showText />
        <div className="px-3 py-1 rounded-full bg-slate-900/80 border border-white/15 text-[10px] sm:text-xs font-mono text-cyan-400 flex items-center gap-1.5 shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-ping" />
          <span className="hidden sm:inline">SISTEMA DE GESTIÓN TALLER EN VIVO</span>
          <span className="sm:hidden">TALLER EN VIVO</span>
        </div>
      </div>

      {/* Center Official Emblem & Ignition Graphic */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl my-auto py-2 sm:py-6 w-full px-2">
        <div className="relative mb-3 sm:mb-6 group cursor-pointer" onClick={() => onEnter(email, password)}>
          {/* Glowing Aura Ring */}
          <div className="absolute -inset-4 sm:-inset-6 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-400 rounded-full blur-xl sm:blur-2xl opacity-60 group-hover:opacity-100 transition-opacity animate-pulse-glow" />

          {/* Official Emblem Container - Scaled for Mobile */}
          <div className="relative w-28 h-28 sm:w-44 sm:h-44 md:w-52 md:h-52 rounded-full bg-black border-2 border-[#00E5FF]/40 shadow-2xl flex items-center justify-center overflow-hidden">
            <img
              src="/logo.png"
              alt="Super Wash Performance Emblem"
              className="w-full h-full object-cover rounded-full transform scale-[1.6] translate-y-2 group-hover:scale-[1.65] transition-transform duration-500"
            />
          </div>
        </div>

        {/* Athletic High-Impact Title */}
        <h1 className="font-display text-2xl sm:text-4xl md:text-6xl tracking-wider text-white mb-1 sm:mb-2">
          SUPER WASH <span className="text-[#00E5FF] drop-shadow-[0_0_25px_rgba(0,229,255,0.6)]">PERFORMANCE</span>
        </h1>
        <p className="font-heading text-xs sm:text-base md:text-lg text-slate-300 font-medium max-w-xl mb-3 sm:mb-4 px-2">
          Plataforma Enterprise de Estética Automotriz, Detailing, Pintura y Gestión 360° de Órdenes de Servicio.
        </p>

        {/* Formulario de Autenticación Centrado (Optimizado Mobile) */}
        <form
          onSubmit={handleLoginSubmit}
          className="flex flex-col gap-3 sm:gap-4 bg-[#0B0F19]/95 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-7 w-full max-w-xs sm:max-w-md shadow-2xl backdrop-blur-xl text-center my-2 sm:my-4"
        >
          <h2 className="font-display text-base sm:text-xl text-white font-bold tracking-wider uppercase mb-0.5 sm:mb-1">
            INICIAR SESIÓN EN SUPER WASH
          </h2>

          {loginError && (
            <div className="p-2 sm:p-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold text-center flex items-center justify-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <div>
            <input
              type="text"
              required
              placeholder="Correo electrónico o número de celular"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#050811] border border-slate-700/60 rounded-full px-4 sm:px-5 py-2.5 sm:py-3.5 text-xs text-white placeholder:text-slate-500 focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] outline-none transition-all"
            />
          </div>

          <div>
            <input
              type="password"
              required
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#050811] border border-slate-700/60 rounded-full px-4 sm:px-5 py-2.5 sm:py-3.5 text-xs text-white placeholder:text-slate-500 focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] outline-none transition-all font-mono"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#00E5FF] hover:bg-cyan-400 text-black font-bold py-2.5 sm:py-3.5 rounded-full text-xs font-display tracking-widest uppercase shadow-lg shadow-cyan-500/25 transition-all mt-1"
          >
            INICIAR SESIÓN
          </button>

          <a
            href="#forgot"
            onClick={(e) => {
              e.preventDefault();
              alert('🔑 Para recuperar tu contraseña, contacta al administrador del sistema.');
            }}
            className="text-[11px] sm:text-xs text-[#00E5FF] hover:underline font-medium text-center mt-1 block"
          >
            ¿Olvidaste tu contraseña?
          </a>
        </form>

        {/* Tracker Input Bar */}
        <div className="flex items-center bg-slate-900 border border-white/10 rounded-full p-1 sm:p-1.5 w-full max-w-xs sm:max-w-sm justify-between my-2">
          <input 
            type="text" 
            placeholder="Placa (ej. ABC-123)"
            className="bg-transparent border-none outline-none text-white px-3 sm:px-4 py-1.5 sm:py-2 w-full uppercase font-mono placeholder:text-slate-500 placeholder:normal-case text-xs"
            value={plate}
            onChange={(e) => setPlate(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleTrack();
              }
            }}
          />
          <button 
            onClick={handleTrack}
            disabled={!plate.trim()}
            className="bg-slate-800 text-cyan-400 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-bold text-[11px] sm:text-xs hover:bg-slate-700 disabled:opacity-50 transition-colors uppercase tracking-wider shrink-0"
          >
            Rastrear
          </button>
        </div>

        {/* Turbo Mascot Greeting Component */}
        <div className="w-full max-w-lg mt-3 sm:mt-4">
          <MascotTurbo message="¡Bienvenido a Super Wash Performance! Ingresa tus credenciales arriba para acceder al sistema." />
        </div>
      </div>

      {/* Footer Info & Centered Developer Badge */}
      <div className="relative z-10 w-full text-center text-[10px] sm:text-xs text-slate-400 font-mono flex flex-col items-center justify-center gap-1.5 sm:gap-2 border-t border-white/10 pt-3 pb-2 mt-2">
        <span className="uppercase tracking-wide font-bold text-slate-400 px-2">
          © 2026 SUPER WASH PERFORMANCE C.A. - TODOS LOS DERECHOS RESERVADOS.
        </span>

        {/* Centered Circular Developer Badge Image + Text */}
        <a
          href="#"
          onClick={(e) => {
            if (e.currentTarget.getAttribute('href') === '#') {
              e.preventDefault();
            }
          }}
          className="inline-flex flex-col items-center justify-center group transition-all duration-300 cursor-pointer mt-1"
          title="BY ARFENIXTECH"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-slate-950/90 border border-cyan-500/30 group-hover:border-cyan-400/70 p-1 shadow-[0_0_15px_rgba(0,229,255,0.2)] group-hover:shadow-[0_0_25px_rgba(0,229,255,0.4)] backdrop-blur-md overflow-hidden flex items-center justify-center">
            <img
              src="/arfenixtech-logo.png"
              alt="ARfenixTech"
              className="w-full h-full object-cover rounded-full mix-blend-lighten opacity-95 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 filter drop-shadow-[0_0_8px_rgba(0,229,255,0.5)]"
            />
          </div>
          <span className="text-[9px] sm:text-[10px] md:text-xs font-mono font-bold tracking-widest text-slate-400 group-hover:text-[#00E5FF] uppercase mt-1 transition-colors">
            BY ARFENIXTECH
          </span>
        </a>
      </div>
    </div>
  );
};
