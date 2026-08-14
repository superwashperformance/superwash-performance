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
    admin: 'Administrador',
    owner: 'Propietario',
    sales: 'Vendedor',
    free_reception: 'Recepción',
    cashier: 'Cajero',
    manager: 'Gerente'
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 px-4 md:px-8 py-3 flex items-center justify-between gap-4 shadow-sm">
      {/* Brand & Branch Selector */}
      <div className="flex items-center gap-6">
        <FaviconLogo size={42} showText />

        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs">
          <span className="w-2 h-2 rounded-full bg-[#7A1B28] animate-pulse" />
          <span className="text-slate-500 font-medium">Sede Principal:</span>
          <span className="text-slate-800 font-bold font-heading uppercase">Las Mercedes</span>
        </div>
      </div>

      {/* Global Action Bar */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Search Command Palette Button */}
        <button
          onClick={onSearchOpen}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-xs transition-all"
        >
          <Search className="w-4 h-4 text-slate-400" />
          <span className="hidden sm:inline font-sans">Buscar ODS, Placa, Cliente...</span>
          <kbd className="hidden sm:inline font-mono text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500">
            Ctrl+K
          </kbd>
        </button>

        {/* Quick ODS Creation Pill Button */}
        <button onClick={onNewODS} className="btn-primary text-xs md:text-sm shadow-md">
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>NUEVA ODS</span>
        </button>

        {/* User Session & Role Card */}
        {userSession ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs shadow-sm">
              <div className="w-7 h-7 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center font-display text-xs">
                {userSession.avatar || 'U'}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-slate-800 leading-tight">{userSession.fullName}</div>
                <div className="text-[10px] text-slate-500 font-mono leading-none">{roleLabels[userSession.role]}</div>
              </div>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-2 rounded-full bg-slate-50 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                title="Cerrar Sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-slate-900 font-bold text-xs transition-all uppercase tracking-wider"
          >
            <User className="w-4 h-4" /> INICIAR SESIÓN
          </button>
        )}
      </div>
    </header>
  );
};
