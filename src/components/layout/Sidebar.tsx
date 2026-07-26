import React from 'react';
import { UserRole } from '../../types';
import {
  LayoutDashboard,
  ClipboardList,
  Kanban,
  Package,
  DollarSign,
  Users,
  Car,
  Settings,
  Sparkles,
} from 'lucide-react';

export type NavTab = 'dashboard' | 'ods' | 'kanban' | 'inventory' | 'cashier' | 'customers' | 'vehicles' | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  currentRole: UserRole;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, currentRole }) => {
  const navItems = [
    { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard, roles: ['admin', 'owner', 'sales'] },
    { id: 'ods', label: 'ÓRDENES DE SERVICIO (ODS)', icon: ClipboardList, roles: ['admin', 'owner', 'sales', 'free_reception', 'polisher', 'painter', 'ppf_installer'] },
    { id: 'kanban', label: 'TALLER EN VIVO (KANBAN)', icon: Kanban, roles: ['admin', 'owner', 'sales', 'polisher', 'dismantler', 'painter', 'prep_tech', 'ppf_installer'] },
    { id: 'inventory', label: 'INVENTARIO DUAL', icon: Package, roles: ['admin', 'owner', 'sales', 'polisher', 'painter'] },
    { id: 'cashier', label: 'CAJA & COBROS', icon: DollarSign, roles: ['admin', 'owner', 'sales'] },
    { id: 'customers', label: 'DIRECTORIO CLIENTES', icon: Users, roles: ['admin', 'owner', 'sales'] },
    { id: 'vehicles', label: 'GARAJE DE VEHÍCULOS', icon: Car, roles: ['admin', 'owner', 'sales', 'free_reception'] },
    { id: 'settings', label: 'CONFIGURACIÓN', icon: Settings, roles: ['admin', 'owner'] },
  ];

  const visibleNavItems = navItems.filter((item) => item.roles.includes(currentRole));

  return (
    <aside className="w-16 md:w-64 bg-black/90 border-r border-white/10 flex flex-col justify-between py-4 shrink-0 transition-all">
      <div className="flex flex-col gap-1 px-2 md:px-3">
        <div className="px-3 py-2 text-[10px] font-mono tracking-widest text-slate-500 uppercase hidden md:block">
          Módulos Principales
        </div>

        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id as NavTab)}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-display text-sm tracking-wider uppercase text-left group ${
                isActive
                  ? 'bg-[#00E5FF] text-black font-bold shadow-lg shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-black' : 'group-hover:text-[#00E5FF]'}`} />
              <span className="hidden md:inline truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Footer Branding Badge */}
      <div className="px-3 py-3 border-t border-white/10 hidden md:block">
        <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#00E5FF]/10 text-[#00E5FF] flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white font-heading">SUPER WASH</span>
            <span className="text-[9px] text-slate-400 font-mono">v2.4 Enterprise SaaS</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
