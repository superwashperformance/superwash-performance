import React, { useState } from 'react';
import { UserRole } from '../../types';
import { FaviconLogo } from '../common/FaviconLogo';
import { sanitizeInput, checkRateLimit, validateUserCredentials } from '../../utils/security';
import { Lock, Mail, User, Shield, CheckCircle, AlertTriangle, ArrowRight, X, Eye, EyeOff } from 'lucide-react';

export interface UserSession {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatar?: string;
  token?: string;
}

interface AuthModalProps {
  onLoginSuccess: (session: UserSession) => void;
  onCancel?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onLoginSuccess, onCancel }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Pre-configured Demo Credentials
  const demoUsers: { email: string; pass: string; name: string; role: UserRole }[] = [
    { email: 'admin@superwash.com', pass: 'admin123', name: 'Gustavo Cisneros (CEO)', role: 'admin' },
    { email: 'gerente@superwash.com', pass: 'gerente123', name: 'Carlos Mendoza (Director)', role: 'owner' },
    { email: 'ventas@superwash.com', pass: 'ventas123', name: 'Valeria Rivas (Ventas & Cobros)', role: 'sales' },
    { email: 'recepcion@superwash.com', pass: 'recep123', name: 'Agente Recepción', role: 'free_reception' },
  ];

  const handleDemoLogin = (user: typeof demoUsers[0]) => {
    setErrorMsg('');
    const session: UserSession = {
      id: `usr-${Date.now()}`,
      email: user.email,
      fullName: user.name,
      role: user.role,
      avatar: user.name.substring(0, 2).toUpperCase(),
      token: `jwt-${Date.now()}-${Math.random().toString(36).substring(2)}`,
    };
    onLoginSuccess(session);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Check rate limit against Brute Force
    if (!checkRateLimit('login_attempts', 5, 60000)) {
      setErrorMsg('⚠️ Demasiados intentos fallidos. Intente en 1 minuto por seguridad.');
      return;
    }

    const cleanEmail = sanitizeInput(email);

    if (!cleanEmail || !password) {
      setErrorMsg('Por favor ingrese su correo electrónico o celular y contraseña.');
      return;
    }

    const validUser = validateUserCredentials(cleanEmail, password);

    if (!validUser) {
      setErrorMsg('❌ Usuario o contraseña no autorizados. Acceso denegado.');
      return;
    }

    const session: UserSession = {
      id: `usr-${Date.now()}`,
      email: validUser.email,
      fullName: validUser.name,
      role: validUser.role as any,
      avatar: validUser.name.substring(0, 2).toUpperCase(),
      token: `jwt-${Date.now()}-${Math.random().toString(36).substring(2)}`,
    };
    onLoginSuccess(session);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="nike-card p-8 w-full max-w-md flex flex-col gap-6 border-white/20 shadow-2xl relative overflow-hidden bg-slate-900/95 rounded-3xl">
        
        {/* Close Modal Button if present */}
        {onCancel && (
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Clean Header */}
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-2xl text-white font-bold tracking-tight">
            Iniciar sesión en Super Wash
          </h2>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Clean Form Matching Requested Layout */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <input
              type="text"
              required
              placeholder="Correo electrónico o número de celular"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950/80 border border-white/20 rounded-2xl px-4 py-3.5 text-sm text-white placeholder:text-slate-400 focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] outline-none transition-all"
            />
          </div>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950/80 border border-white/20 rounded-2xl px-4 py-3.5 pr-12 text-sm text-white placeholder:text-slate-400 focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] outline-none transition-all font-mono"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#00E5FF] transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-[#00E5FF] hover:bg-cyan-400 text-black font-bold py-3.5 rounded-full text-base font-display tracking-wide shadow-lg shadow-cyan-500/20 transition-all mt-2"
          >
            Iniciar sesión
          </button>

          <a
            href="#forgot"
            onClick={(e) => {
              e.preventDefault();
              alert('🔑 Para recuperar tu contraseña, contacta al administrador del sistema.');
            }}
            className="text-xs text-[#00E5FF] hover:underline font-medium text-center mt-2 block"
          >
            ¿Olvidaste tu contraseña?
          </a>
        </form>

        {/* Quick Demo Accounts Footer */}
        <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
          <span className="text-[10px] font-mono text-slate-400 uppercase text-center">Cuentas de prueba rápidas:</span>
          <div className="grid grid-cols-2 gap-2">
            {demoUsers.map((u) => (
              <button
                key={u.email}
                type="button"
                onClick={() => handleDemoLogin(u)}
                className="p-2 rounded-xl bg-slate-950 border border-white/10 hover:border-[#00E5FF] hover:bg-[#00E5FF]/10 text-left transition-all group flex flex-col"
              >
                <span className="text-xs font-bold text-white group-hover:text-[#00E5FF] truncate">{u.name}</span>
                <span className="text-[10px] font-mono text-slate-400 truncate">{u.email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
