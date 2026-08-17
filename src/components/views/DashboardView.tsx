import React, { useEffect, useState } from 'react';
import { ServiceOrder, UserRole } from '../../types';
import { CurrencyDisplay } from '../common/CurrencyDisplay';
import { MascotTurbo } from '../common/MascotTurbo';
import { treasuryService } from '../../services/treasuryService';
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
  transactions: any[]; // Deprecated CashTransaction array
  onNewODS: () => void;
  onSelectOrder: (order: ServiceOrder) => void;
  onNavigateTab: (tab: any) => void;
  currentRole: UserRole;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  orders,
  transactions,
  onNewODS,
  onSelectOrder,
  onNavigateTab,
  currentRole,
}) => {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalAccountsReceivable, setTotalAccountsReceivable] = useState(0);

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        // Fetch CC Debt
        const debtData = await treasuryService.getCustomersWithDebt();
        const totalDebt = debtData.reduce((acc, c) => acc + c.debt, 0);
        setTotalAccountsReceivable(totalDebt);

        // Fetch Total Revenue (All Incomes)
        const movements = await treasuryService.getTreasuryMovements(1000);
        const revenue = movements
          .filter(m => m.type === 'income')
          .reduce((acc, m) => acc + Number(m.amount), 0);
        setTotalRevenue(revenue);
      } catch (err) {
        console.error('Failed to fetch dashboard KPIs', err);
      }
    };
    fetchKPIs();
  }, []);

  // Compute KPIs
  const totalEntered = orders.length;
  const inProgressCount = orders.filter((o) => o.status === 'in_progress' || o.status === 'diagnosis').length;
  const completedCount = orders.filter((o) => o.status === 'quality_control' || o.status === 'completed').length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;

  const statusLabels: Record<string, { label: string; color: string }> = {
    received: { label: 'Recibido', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
    diagnosis: { label: 'Diagnóstico', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    quote_sent: { label: 'Presupuesto Enviado', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    quote_pending: { label: 'Presupuesto Pnte', color: 'bg-slate-100 text-slate-600 border-slate-200' },
    quote_approved: { label: 'Presupuesto Aprobado', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    in_progress: { label: 'En Proceso', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    waiting_parts: { label: 'Esperando Repuestos', color: 'bg-orange-100 text-orange-700 border-orange-200' },
    quality_control: { label: 'Control de Calidad', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    completed: { label: 'Finalizado', color: 'bg-green-100 text-green-700 border-green-200' },
    delivered: { label: 'Entregado', color: 'bg-slate-100 text-slate-700 border-slate-200' },
    archived: { label: 'Archivado (Historial)', color: 'bg-gray-100 text-gray-500 border-gray-200' },
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
        <div className="glass-card p-5 flex flex-col justify-between shrink-0 lg:w-80">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">ACCIONES RÁPIDAS</span>
            <h4 className="font-display text-xl text-slate-800">PANEL DE CONTROL</h4>
          </div>
          <div className="flex flex-col gap-2 mt-3">
            <button onClick={onNewODS} className="btn-primary text-xs py-2.5 justify-center">
              <Plus className="w-4 h-4 stroke-[3]" /> NUEVA ORDEN DE SERVICIO
            </button>
          </div>
        </div>
      </div>

      {/* 6 Main Metric KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* KPI 1 */}
        <div className="glass-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider">INGRESADOS</span>
            <Car className="w-4 h-4 text-slate-400" />
          </div>
          <div className="font-display text-3xl md:text-4xl text-slate-800">{totalEntered}</div>
          <span className="text-[10px] text-slate-500 mt-1 font-mono">Total ODS en sistema</span>
        </div>

        {/* KPI 2 */}
        <div className="glass-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-blue-500 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider">EN PROCESO</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="font-display text-3xl md:text-4xl text-blue-600">{inProgressCount}</div>
          <span className="text-[10px] text-slate-500 mt-1 font-mono">En taller en vivo</span>
        </div>

        {/* KPI 3 */}
        <div className="glass-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-yellow-500 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider">TERMINADOS</span>
            <CheckCircle2 className="w-4 h-4 text-yellow-500" />
          </div>
          <div className="font-display text-3xl md:text-4xl text-yellow-600">{completedCount}</div>
          <span className="text-[10px] text-slate-500 mt-1 font-mono">Control de calidad</span>
        </div>

        {/* KPI 4 */}
        <div className="glass-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-500 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider">ENTREGADOS</span>
            <PackageCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="font-display text-3xl md:text-4xl text-emerald-600">{deliveredCount}</div>
          <span className="text-[10px] text-slate-500 mt-1 font-mono">Completados y entregados</span>
        </div>

        {/* KPI 5 */}
        <div className="glass-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-500 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider">POR COBRAR</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="font-display text-amber-600 truncate">
            <CurrencyDisplay amount={totalAccountsReceivable} size="xl" />
          </div>
          <span className="text-[10px] text-slate-500 mt-1 font-mono">Cuentas pendientes</span>
        </div>

        {/* KPI 6 */}
        <div className="glass-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-green-500 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider">INGRESOS</span>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <div className="font-display text-green-600 truncate">
            <CurrencyDisplay amount={totalRevenue} size="xl" />
          </div>
          <span className="text-[10px] text-slate-500 mt-1 font-mono">Cobrado en caja</span>
        </div>
      </div>

      {/* Recent ODS Feed & Quick Workshop Monitor */}
      <div className="glass-card p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-xl tracking-wide text-slate-800">Órdenes de Servicio Recientes</h3>
            <p className="text-xs text-slate-500">Listado de vehículos procesados en el taller.</p>
          </div>
          <button
            onClick={() => onNavigateTab('ods')}
            className="text-xs text-[#7A1B28] hover:underline font-mono uppercase flex items-center gap-1"
          >
            Ver Todas las ODS <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* Table of Orders */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 font-display text-sm uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-3">Nº ODS</th>
                <th className="p-3">VEHÍCULO</th>
                <th className="p-3">CLIENTE</th>
                <th className="p-3">ESTADO</th>
                <th className="p-3">FECHA INGRESO</th>
                <th className="p-3 text-right">TOTAL</th>
                <th className="p-3 text-center">ACCIÓN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {orders.slice(0, 5).map((order) => {
                const statusInfo = statusLabels[order.status] || { label: order.status, color: 'bg-slate-100 text-slate-900' };
                return (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-[#7A1B28]">{order.orderNumber}</td>
                    <td className="p-3">
                      <div className="font-bold text-slate-800">{order.vehicleBrandModel}</div>
                      <div className="text-[10px] font-mono text-slate-500">Placa: {order.vehiclePlate} | {order.vehicleColor}</div>
                    </td>
                    <td className="p-3">
                      <div className="text-slate-800 font-medium">{order.customerName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{order.customerPhone}</div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-500">{order.entryDate}</td>
                    <td className="p-3 text-right text-slate-800">
                      <CurrencyDisplay amount={order.totalAmount} size="sm" />
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => onSelectOrder(order)}
                        className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 hover:bg-[#7A1B28] hover:text-white font-bold text-xs transition-all"
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
