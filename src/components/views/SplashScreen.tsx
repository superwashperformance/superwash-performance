import React, { useState } from 'react';
import { FaviconLogo } from '../common/FaviconLogo';
import { MascotTurbo } from '../common/MascotTurbo';
import { ArrowRight, User, Lock, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { sanitizeInput, checkRateLimit } from '../../utils/security';
import { supabase } from '../../lib/supabase';

interface SplashScreenProps {
  onEnter: () => void;
  onTrack: (plate: string) => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onEnter, onTrack }) => {
  const [plate, setPlate] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleTrack = () => {
    if (plate.trim()) {
      onTrack(plate.trim());
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    // Protection against Brute Force Attacks
    if (!checkRateLimit('splash_login_rate', 5, 60000)) {
      setLoginError('⚠️ Límite de intentos excedido. Espera 1 minuto por seguridad.');
      return;
    }

    const cleanUsername = sanitizeInput(email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanUsername,
        password: password,
      });

      if (error) {
        setLoginError('❌ Usuario o contraseña no autorizados. Acceso denegado.');
        console.error(error);
        return;
      }

      if (data.session && data.user) {
        onEnter();
      }
    } catch (err: any) {
      setLoginError('Error al conectar con el servidor.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen w-full bg-slate-50 text-slate-900 flex flex-col items-center justify-between p-3 sm:p-4 md:p-6 overflow-y-auto select-none">
      {/* Background Cyber Glow & Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#7A1B28_1.5px,transparent_1.5px)] [background-size:32px_32px] opacity-15 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-slate-200/50 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 w-full flex flex-row items-center justify-between gap-2">
        <FaviconLogo size={36} showText />
        <div className="px-3 py-1 rounded-full bg-white border border-slate-200 text-[10px] sm:text-xs font-mono text-[#7A1B28] flex items-center gap-1.5 shrink-0 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#7A1B28] animate-ping" />
          <span className="hidden sm:inline">SISTEMA DE GESTIÓN TALLER EN VIVO</span>
          <span className="sm:hidden">TALLER EN VIVO</span>
        </div>
      </div>

      {/* Center Official Emblem & Ignition Graphic */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl my-auto py-1 sm:py-2 w-full px-2">
        <div className="relative mb-2 sm:mb-3 group cursor-pointer" onClick={() => {}}>
          {/* Glowing Aura Ring */}
          <div className="absolute -inset-3 sm:-inset-5 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded-full blur-lg sm:blur-xl opacity-60 group-hover:opacity-100 transition-opacity" />

          {/* Official Emblem Container - Compact for Full Screen View */}
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full bg-black border-2 border-slate-200 shadow-sm flex items-center justify-center overflow-hidden">
            <img
              src="/logo.png"
              alt="Super Wash Performance Emblem"
              className="w-full h-full object-cover rounded-full transform scale-[1.6] translate-y-2 group-hover:scale-[1.65] transition-transform duration-500"
            />
          </div>
        </div>

        {/* Athletic High-Impact Title */}
        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl tracking-wider text-slate-900 mb-1">
          SUPER WASH <span className="text-[#7A1B28] drop-shadow-sm">PERFORMANCE</span>
        </h1>
        <p className="font-heading text-xs sm:text-sm text-slate-700 font-medium max-w-lg mb-2 px-2 leading-snug">
          Plataforma Enterprise de Estética Automotriz, Detailing, Pintura y Gestión 360° de Órdenes de Servicio.
        </p>

        {/* Formulario de Autenticación Centrado (Ultracompacto) */}
        <form
          onSubmit={handleLoginSubmit}
          className="flex flex-col gap-2.5 sm:gap-3 bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 w-full max-w-xs sm:max-w-sm shadow-sm backdrop-blur-xl text-center my-1.5 sm:my-2"
        >
          <h2 className="font-display text-sm sm:text-base text-slate-900 font-bold tracking-wider uppercase mb-0.5">
            INICIAR SESIÓN EN SUPER WASH
          </h2>

          {loginError && (
            <div className="p-1.5 sm:p-2 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-[11px] font-semibold text-center flex items-center justify-center gap-1.5">
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
              className="w-full bg-slate-50 border border-slate-300 rounded-full px-4 py-2 sm:py-2.5 text-xs text-slate-900 placeholder:text-slate-500 focus:border-[#7A1B28] focus:ring-1 focus:ring-[#7A1B28] outline-none transition-all"
            />
          </div>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-full px-4 py-2 sm:py-2.5 pr-10 text-xs text-slate-900 placeholder:text-slate-500 focus:border-[#7A1B28] focus:ring-1 focus:ring-[#7A1B28] outline-none transition-all font-mono"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#7A1B28] transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-[#7A1B28] hover:bg-[#9c2233] text-white font-bold py-2.5 sm:py-3 rounded-full text-xs font-display tracking-widest uppercase shadow-md shadow-[#7A1B28]/25 transition-all mt-0.5"
          >
            INICIAR SESIÓN
          </button>
        </form>

        {/* Tracker Input Bar */}
        <div className="flex items-center bg-white border border-slate-200 rounded-full p-1 w-full max-w-xs sm:max-w-sm justify-between my-1">
          <input 
            type="text" 
            placeholder="Placa (ej. ABC-123)"
            className="bg-transparent border-none outline-none text-slate-900 px-3 sm:px-4 py-1.5 w-full uppercase font-mono placeholder:text-slate-500 placeholder:normal-case text-xs"
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
            className="bg-slate-100 text-[#7A1B28] px-3 py-1.5 rounded-full font-bold text-[11px] hover:bg-slate-200 disabled:opacity-50 transition-colors uppercase tracking-wider shrink-0"
          >
            Rastrear
          </button>
        </div>

        {/* Turbo Mascot Greeting Component (Minimizado) */}
        <div className="w-full max-w-xs sm:max-w-md mt-2">
          <MascotTurbo 
            size="sm" 
            message="¡Bienvenido a Super Wash Performance! Ingresa tus credenciales arriba para acceder al sistema." 
          />
        </div>
      </div>

      {/* Footer Info & Centered Developer Badge */}
      <div className="relative z-10 w-full text-center text-[10px] sm:text-xs text-slate-500 font-mono flex flex-col items-center justify-center gap-1 sm:gap-1.5 border-t border-slate-200 pt-2 pb-1 mt-1 shrink-0">
        <span className="uppercase tracking-wide font-bold text-slate-500 px-2">
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
          className="inline-flex flex-col items-center justify-center group transition-all duration-300 cursor-pointer"
          title="BY ARFENIXTECH"
        >
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-slate-50 border border-slate-200 group-hover:border-slate-300 p-0.5 shadow-sm group-hover:shadow-md backdrop-blur-md overflow-hidden flex items-center justify-center">
            <img
              src="/arfenixtech-logo.png"
              alt="ARfenixTech"
              className="w-full h-full object-cover rounded-full opacity-95 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 filter drop-shadow-none"
            />
          </div>
          <span className="text-[9px] font-mono font-bold tracking-widest text-slate-500 group-hover:text-[#7A1B28] uppercase mt-0.5 transition-colors">
            BY ARFENIXTECH
          </span>
        </a>
      </div>
    </div>
  );
};
