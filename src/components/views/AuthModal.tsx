import React, { useState } from 'react';
import { UserRole } from '../../types';
import { supabase } from '../../lib/supabase';
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
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!email || !password) {
      setErrorMsg('Por favor ingrese su correo y contraseña.');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg('Credenciales inválidas o error de red.');
        console.error(error);
        return;
      }

      if (data.session && data.user) {
        // Obtenemos el perfil para el rol
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        const role = profileError || !profileData ? 'admin' : profileData.role;
        const fullName = profileError || !profileData ? data.user.email?.split('@')[0] || 'Usuario' : profileData.full_name;

        const session: UserSession = {
          id: data.user.id,
          email: data.user.email || '',
          fullName: fullName,
          role: role as UserRole,
          avatar: fullName.substring(0, 2).toUpperCase(),
          token: data.session.access_token,
        };
        onLoginSuccess(session);
      }
    } catch (err: any) {
      setErrorMsg('Error al conectar con Supabase.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/ backdrop-blur-sm p-4 animate-fade-in">
      <div className="nike-card p-8 w-full max-w-md flex flex-col gap-6 shadow-2xl relative overflow-hidden bg-white rounded-3xl border border-slate-200">
        
        {onCancel && (
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="flex flex-col gap-1">
          <h2 className="font-display text-2xl text-slate-900 font-bold tracking-tight">
            Iniciar sesión en Super Wash
          </h2>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <input
              type="email"
              required
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-500 focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] outline-none transition-all"
            />
          </div>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3.5 pr-12 text-sm text-slate-900 placeholder:text-slate-500 focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] outline-none transition-all font-mono"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#00E5FF] hover:bg-cyan-400 text-slate-900 font-bold py-3.5 rounded-full text-base font-display tracking-wide shadow-lg shadow-cyan-500/20 transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Iniciando...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  );
};
