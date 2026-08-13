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
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { FaviconLogo } from '../common/FaviconLogo';

export type NavTab = 'dashboard' | 'ods' | 'kanban' | 'inventory' | 'cashier' | 'treasury' | 'legacy_cash' | 'customers' | 'vehicles' | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  currentRole: UserRole;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, currentRole }) => {
  const navItems = [
    { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard, roles: ['admin', 'owner', 'sales', 'manager'] },
    { id: 'ods', label: 'ÓRDENES DE SERVICIO (ODS)', icon: ClipboardList, roles: ['admin', 'owner', 'sales', 'free_reception', 'manager', 'cashier'] },
    { id: 'kanban', label: 'TALLER EN VIVO', icon: Kanban, roles: ['admin', 'owner', 'sales', 'manager'] },
    { id: 'inventory', label: 'INVENTARIO DUAL', icon: Package, roles: ['admin', 'owner', 'sales', 'manager'] },
    { id: 'cashier', label: 'CAJA Y COBRANZA', icon: DollarSign, roles: ['admin', 'owner', 'sales', 'cashier', 'manager'] },
    { id: 'treasury', label: 'TESORERÍA Y MAYOR', icon: ShieldCheck, roles: ['admin', 'owner', 'manager'] },
    { id: 'legacy_cash', label: 'HISTÓRICO LEGACY', icon: ClipboardList, roles: ['admin', 'owner', 'sales', 'cashier', 'manager'] },
    { id: 'customers', label: 'DIRECTORIO CLIENTES', icon: Users, roles: ['admin', 'owner', 'sales', 'manager', 'cashier'] },
    { id: 'vehicles', label: 'GARAJE DE VEHÍCULOS', icon: Car, roles: ['admin', 'owner', 'sales', 'free_reception', 'manager', 'cashier'] },
    { id: 'settings', label: 'CONFIGURACIÓN', icon: Settings, roles: ['admin', 'owner'] },
  ];

  const visibleNavItems = navItems.filter((item) => item.roles.includes(currentRole));

  return (
    <aside className="w-16 md:w-64 bg-black/90 border-r border-slate-200 flex flex-col justify-between py-4 shrink-0 transition-all">
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
                  : 'text-slate-500 hover:text-slate-900 hover:bg-white/5'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-black' : 'group-hover:text-cyan-600'}`} />
              <span className="hidden md:inline truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Footer Logo Area */}
      <div className="px-6 pt-6 pb-2 border-t border-white/5 mt-4">
        <div className="flex items-center gap-3">
          <FaviconLogo size={40} />
          <div className="hidden md:block">
            <h1 className="font-display font-bold text-lg tracking-widest text-slate-900 leading-tight">SUPER WASH</h1>
            <p className="text-[10px] font-mono text-cyan-500 font-bold uppercase tracking-widest mt-0.5">v2.4 Enterprise SaaS</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
