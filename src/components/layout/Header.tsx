import React from 'react';
import { FaviconLogo } from '../common/FaviconLogo';
import { UserRole } from '../../types';
import { mockUsers } from '../../data/mockData';
import { UserSession } from '../views/AuthModal';
import { Search, Plus, Shield, User, Bell, ChevronDown, LogOut } from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onNewODS: () => void;
  onSearchOpen: () => void;
  userSession?: UserSession | null;
  onLogout?: () => void;
  onOpenAuth?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  onNewODS,
  onSearchOpen,
  userSession,
  onLogout,
  onOpenAuth,
}) => {
  const currentUser = userSession
    ? { name: userSession.fullName, role: userSession.role, avatar: userSession.avatar || 'U' }
    : mockUsers.find((u) => u.role === currentRole) || mockUsers[0];

  const roleLabels: Record<UserRole, string> = {
    admin: 'Administrador General',
    owner: 'Dueño / Director',
    sales: 'Ventas & Asesor',
    free_reception: 'Agente Recepción Libre',
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-black/85 backdrop-blur-xl border-b border-white/10 px-4 md:px-8 py-3 flex items-center justify-between gap-4">
      {/* Brand & Branch Selector */}
      <div className="flex items-center gap-6">
        <FaviconLogo size={42} showText />

        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs">
          <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse" />
          <span className="text-slate-300 font-medium">Sede Principal:</span>
          <span className="text-white font-bold font-heading uppercase">Las Mercedes</span>
        </div>
      </div>

      {/* Global Action Bar */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Search Command Palette Button */}
        <button
          onClick={onSearchOpen}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-white/10 text-slate-400 hover:text-white hover:border-[#00E5FF]/40 text-xs transition-all"
        >
          <Search className="w-4 h-4 text-[#00E5FF]" />
          <span className="hidden sm:inline font-sans">Buscar ODS, Placa, Cliente...</span>
          <kbd className="hidden sm:inline font-mono text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-slate-300">
            Ctrl+K
          </kbd>
        </button>

        {/* Quick ODS Creation Pill Button */}
        <button onClick={onNewODS} className="btn-nike-primary text-xs md:text-sm py-2 px-4 shadow-lg">
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>NUEVA ODS</span>
        </button>

        {/* User Session & Role Card */}
        {userSession ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-cyan-500/30 text-xs">
              <div className="w-6 h-6 rounded-full bg-[#00E5FF] text-black font-bold flex items-center justify-center font-display text-xs">
                {userSession.avatar || 'U'}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-white leading-tight">{userSession.fullName}</div>
                <div className="text-[10px] text-[#00E5FF] font-mono leading-none">{roleLabels[userSession.role]}</div>
              </div>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                title="Cerrar Sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40 hover:bg-[#00E5FF] hover:text-black font-bold text-xs transition-all uppercase tracking-wider"
          >
            <User className="w-4 h-4" /> INICIAR SESIÓN
          </button>
        )}
      </div>
    </header>
  );
};
