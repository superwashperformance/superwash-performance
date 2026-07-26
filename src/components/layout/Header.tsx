import React from 'react';
import { FaviconLogo } from '../common/FaviconLogo';
import { UserRole, UserProfile } from '../../types';
import { mockUsers } from '../../data/mockData';
import { Search, Plus, Shield, User, Bell, ChevronDown } from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onNewODS: () => void;
  onSearchOpen: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  onNewODS,
  onSearchOpen,
}) => {
  const currentUser = mockUsers.find((u) => u.role === currentRole) || mockUsers[0];

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

        {/* Role Switcher for Demonstration */}
        <div className="relative group">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-white/10 text-xs hover:border-cyan-500/40">
            <Shield className="w-4 h-4 text-[#00E5FF]" />
            <div className="text-left hidden sm:block">
              <div className="text-[10px] text-slate-400 font-mono uppercase leading-none">Rol Activo</div>
              <div className="text-xs font-bold text-white font-heading">{roleLabels[currentRole]}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Role Selector Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-56 bg-slate-900 border border-white/15 rounded-xl shadow-2xl p-2 hidden group-hover:block z-50">
            <div className="text-[10px] uppercase tracking-widest font-mono text-slate-400 px-3 py-1 border-b border-white/10 mb-1">
              Cambiar Rol de Demostración
            </div>
            {Object.entries(roleLabels).map(([roleKey, label]) => (
              <button
                key={roleKey}
                onClick={() => onRoleChange(roleKey as UserRole)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                  currentRole === roleKey
                    ? 'bg-[#00E5FF] text-black font-bold'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span>{label}</span>
                {currentRole === roleKey && <span className="w-1.5 h-1.5 rounded-full bg-black" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
