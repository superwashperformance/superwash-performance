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
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'owner', 'sales', 'manager'] },
    { id: 'ods', label: 'Órdenes de Servicio', icon: ClipboardList, roles: ['admin', 'owner', 'sales', 'free_reception', 'manager', 'cashier'] },
    { id: 'kanban', label: 'Taller en Vivo', icon: Kanban, roles: ['admin', 'owner', 'sales', 'manager'] },
    { id: 'inventory', label: 'Inventario', icon: Package, roles: ['admin', 'owner', 'sales', 'manager'] },
    { id: 'cashier', label: 'Caja', icon: DollarSign, roles: ['admin', 'owner', 'sales', 'cashier', 'manager'] },
    { id: 'treasury', label: 'Tesorería', icon: ShieldCheck, roles: ['admin', 'owner', 'manager'] },
    { id: 'legacy_cash', label: 'Histórico', icon: ClipboardList, roles: ['admin', 'owner', 'sales', 'cashier', 'manager'] },
    { id: 'customers', label: 'Clientes', icon: Users, roles: ['admin', 'owner', 'sales', 'manager', 'cashier'] },
    { id: 'vehicles', label: 'Vehículos', icon: Car, roles: ['admin', 'owner', 'sales', 'free_reception', 'manager', 'cashier'] },
    { id: 'settings', label: 'Configuración', icon: Settings, roles: ['admin', 'owner'] },
  ];

  const visibleNavItems = navItems.filter((item) => item.roles.includes(currentRole));

  return (
    <aside className="w-16 md:w-64 bg-slate-50 border-r border-slate-200 flex flex-col py-6 shrink-0 transition-all shadow-sm z-20 h-full overflow-y-auto">
      {/* Top Logo Area */}
      <div className="px-6 pb-8 flex flex-col items-center justify-center">
        <FaviconLogo size={90} />
      </div>

      <div className="flex flex-col gap-1 px-3">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id as NavTab)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm text-left group ${
                isActive
                  ? 'bg-[#7A1B28] text-white font-bold shadow-sm'
                  : 'text-slate-600 hover:text-[#7A1B28] hover:bg-[#7A1B28]/5 font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-[#7A1B28]'}`} />
              <span className="hidden md:inline truncate">{item.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};
