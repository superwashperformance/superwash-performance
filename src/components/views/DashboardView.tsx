import React from 'react';
import { ServiceOrder, UserRole } from '../../types';
import { CurrencyDisplay } from '../common/CurrencyDisplay';
import { MascotTurbo } from '../common/MascotTurbo';
import {
  BarChart3,
  Clock,
  DollarSign,
  PenTool,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Activity,
  Car,
  PackageCheck,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  Kanban,
  FileText,
} from 'lucide-react';

interface DashboardViewProps {
  orders: ServiceOrder[];
  onNewODS: () => void;
  onSelectOrder: (order: ServiceOrder) => void;
  onNavigateTab: (tab: any) => void;
  currentRole: UserRole;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  orders,
  onNewODS,
  onSelectOrder,
  onNavigateTab,
  currentRole,
}) => {
  // Compute KPIs
  const totalEntered = orders.length;
  const inProgressCount = orders.filter((o) => o.status === 'in_progress' || o.status === 'diagnosis').length;
  const completedCount = orders.filter((o) => o.status === 'quality_control' || o.status === 'completed').length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;

  const totalRevenue = orders.reduce((sum, o) => sum + o.paidAmount, 0);
  const totalAccountsReceivable = orders.reduce((sum, o) => sum + (o.totalAmount - o.paidAmount), 0);

  const statusLabels: Record<string, { label: string; color: string }> = {
    received: { label: 'Recibido', color: 'bg-[#00E5FF]/20 text-[#00E5FF] border-cyan-500/30' },
    diagnosis: { label: 'Diagnóstico', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    quote_sent: { label: 'Presupuesto Enviado', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    quote_approved: { label: 'Presupuesto Aprobado', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    in_progress: { label: 'En Proceso', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    waiting_parts: { label: 'Esperando Repuestos', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
    quality_control: { label: 'Control de Calidad', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    completed: { label: 'Finalizado', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    delivered: { label: 'Entregado', color: 'bg-slate-700/40 text-slate-300 border-slate-600/30' },
    archived: { label: 'Archivado (Historial)', color: 'bg-zinc-900/60 text-zinc-500 border-zinc-800' },
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full">
      {/* Top Banner & Turbo Assistant Message */}
      <div className="flex flex-col lg:flex-row items-stretch gap-6">
        <div className="flex-1">
          <MascotTurbo
            message={`¡Buen día! Hay ${inProgressCount} vehículos activos en la línea de trabajo del taller. Se registran $${totalAccountsReceivable} en cuentas por cobrar pendientes.`}
          />
        </div>

        {/* Quick Launcher Card */}
        <div className="nike-card p-5 flex flex-col justify-between shrink-0 lg:w-80">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">ACCIONES RÁPIDAS</span>
            <h4 className="font-display text-xl text-white">PANEL DE CONTROL</h4>
          </div>
          <div className="flex flex-col gap-2 mt-3">
            <button onClick={onNewODS} className="btn-nike-primary text-xs py-2.5 justify-center">
              <Plus className="w-4 h-4 stroke-[3]" /> NUEVA ORDEN DE SERVICIO
            </button>
            <button
              onClick={() => onNavigateTab('kanban')}
              className="btn-nike-secondary text-xs py-2 justify-center"
            >
              <Kanban className="w-4 h-4 text-[#00E5FF]" /> TABLERO EN VIVO
            </button>
          </div>
        </div>
      </div>

      {/* 6 Main Metric KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* KPI 1 */}
        <div className="nike-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider">INGRESADOS</span>
            <Car className="w-4 h-4 text-[#00E5FF]" />
          </div>
          <div className="font-display text-3xl md:text-4xl text-white">{totalEntered}</div>
          <span className="text-[10px] text-slate-400 mt-1 font-mono">Total ODS en sistema</span>
        </div>

        {/* KPI 2 */}
        <div className="nike-card p-4 flex flex-col justify-between border-cyan-500/30">
          <div className="flex items-center justify-between text-cyan-400 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider">EN PROCESO</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="font-display text-3xl md:text-4xl text-cyan-400">{inProgressCount}</div>
          <span className="text-[10px] text-cyan-400/70 mt-1 font-mono">En taller en vivo</span>
        </div>

        {/* KPI 3 */}
        <div className="nike-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-yellow-400 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider">TERMINADOS</span>
            <CheckCircle2 className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="font-display text-3xl md:text-4xl text-yellow-400">{completedCount}</div>
          <span className="text-[10px] text-slate-400 mt-1 font-mono">Control de calidad</span>
        </div>

        {/* KPI 4 */}
        <div className="nike-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider">ENTREGADOS</span>
            <PackageCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-display text-3xl md:text-4xl text-emerald-400">{deliveredCount}</div>
          <span className="text-[10px] text-slate-400 mt-1 font-mono">Completados y entregados</span>
        </div>

        {/* KPI 5 */}
        <div className="nike-card p-4 flex flex-col justify-between border-amber-500/30">
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider">POR COBRAR</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-display text-amber-400">
            <CurrencyDisplay amount={totalAccountsReceivable} size="2xl" />
          </div>
          <span className="text-[10px] text-amber-400/70 mt-1 font-mono">Cuentas pendientes</span>
        </div>

        {/* KPI 6 */}
        <div className="nike-card p-4 flex flex-col justify-between border-green-500/30">
          <div className="flex items-center justify-between text-green-400 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider">INGRESOS</span>
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <div className="font-display text-green-400">
            <CurrencyDisplay amount={totalRevenue} size="2xl" />
          </div>
          <span className="text-[10px] text-green-400/70 mt-1 font-mono">Cobrado en caja</span>
        </div>
      </div>

      {/* Recent ODS Feed & Quick Workshop Monitor */}
      <div className="nike-card p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-2xl tracking-wide text-white">ÓRDENES DE SERVICIO RECIENTES</h3>
            <p className="text-xs text-slate-400">Listado de vehículos procesados en el taller.</p>
          </div>
          <button
            onClick={() => onNavigateTab('ods')}
            className="text-xs text-[#00E5FF] hover:underline font-mono uppercase flex items-center gap-1"
          >
            Ver Todas las ODS <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* Table of Orders */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-black/60 font-display text-sm tracking-wider uppercase text-slate-400 border-b border-white/10">
              <tr>
                <th className="p-3">N° ODS</th>
                <th className="p-3">VEHÍCULO</th>
                <th className="p-3">CLIENTE</th>
                <th className="p-3">ESTADO</th>
                <th className="p-3">FECHA INGRESO</th>
                <th className="p-3 text-right">TOTAL</th>
                <th className="p-3 text-center">ACCIÓN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {orders.slice(0, 5).map((order) => {
                const statusInfo = statusLabels[order.status] || { label: order.status, color: 'bg-slate-800 text-white' };
                return (
                  <tr key={order.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 font-mono font-bold text-[#00E5FF]">{order.orderNumber}</td>
                    <td className="p-3">
                      <div className="font-bold text-white">{order.vehicleBrandModel}</div>
                      <div className="text-[10px] font-mono text-slate-400">Placa: {order.vehiclePlate} | {order.vehicleColor}</div>
                    </td>
                    <td className="p-3">
                      <div className="text-white font-medium">{order.customerName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{order.customerPhone}</div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-display uppercase tracking-wider border ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-400">{order.entryDate}</td>
                    <td className="p-3 text-right text-white">
                      <CurrencyDisplay amount={order.totalAmount} size="sm" />
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => onSelectOrder(order)}
                        className="px-3 py-1 rounded-full bg-[#00E5FF]/10 text-[#00E5FF] hover:bg-[#00E5FF] hover:text-black font-display text-xs transition-all"
                      >
                        VER FICHA
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
