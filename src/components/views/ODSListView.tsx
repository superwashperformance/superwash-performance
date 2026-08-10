import React, { useState } from 'react';
import { ServiceOrder, ODSStatus } from '../../types';
import { ClipboardList, Search, Plus, Filter, ArrowUpRight, Eye, Trash2, Calendar, X } from 'lucide-react';

interface ODSListViewProps {
  orders: ServiceOrder[];
  onSelectOrder: (order: ServiceOrder) => void;
  onNewODS: () => void;
  onDeleteODS?: (orderId: string) => void;
}

export const ODSListView: React.FC<ODSListViewProps> = ({ orders, onSelectOrder, onNewODS, onDeleteODS }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Date Filter State
  const [datePeriod, setDatePeriod] = useState<'all' | 'today' | 'week' | 'month' | 'year' | 'custom'>('all');
  const [customDate, setCustomDate] = useState<string>(''); // YYYY-MM-DD

  const filteredOrders = orders.filter((order) => {
    // Convert order.entryDate to standard format
    const entryDateStr = order.entryDate || '';
    
    // Text search
    const matchesSearch =
      (order.orderNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.vehiclePlate || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.vehicleBrandModel || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      entryDateStr.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    // Date filter
    let matchesDate = true;
    const now = new Date();
    const orderDateObj = new Date(entryDateStr);

    if (datePeriod === 'custom' && customDate) {
      matchesDate = entryDateStr.includes(customDate);
    } else if (datePeriod === 'today') {
      const todayISO = now.toISOString().split('T')[0]; // YYYY-MM-DD
      const todayShort = now.toLocaleDateString('es-ES');
      matchesDate = entryDateStr.includes(todayISO) || entryDateStr.includes(todayShort);
    } else if (datePeriod === 'week') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      matchesDate = !isNaN(orderDateObj.getTime()) && orderDateObj >= oneWeekAgo && orderDateObj <= now;
    } else if (datePeriod === 'month') {
      const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      matchesDate = entryDateStr.includes(monthPrefix) || (orderDateObj.getMonth() === now.getMonth() && orderDateObj.getFullYear() === now.getFullYear());
    } else if (datePeriod === 'year') {
      const yearStr = `${now.getFullYear()}`;
      matchesDate = entryDateStr.includes(yearStr);
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl text-white tracking-wide flex items-center gap-2">
            LISTA MAESTRA DE ÓRDENES DE SERVICIO <ClipboardList className="w-6 h-6 text-[#00E5FF]" />
          </h2>
          <p className="text-xs text-slate-400">
            Registro histórico e inspección 360° de todas las ODS creadas en la plataforma.
          </p>
        </div>

        <button onClick={onNewODS} className="btn-nike-primary text-xs md:text-sm py-2.5 px-6">
          <Plus className="w-4 h-4 stroke-[3]" /> NUEVA ODS
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col gap-3 bg-black/50 p-4 rounded-2xl border border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Text Search */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por ODS, Placa, Cliente, Fecha (ej. 24/7/2026)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:border-[#00E5FF] outline-none"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#00E5FF]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-[#00E5FF] outline-none font-mono"
            >
              <option value="all">TODOS LOS ESTADOS</option>
              <option value="received">1. Recibido</option>
              <option value="diagnosis">2. Diagnóstico</option>
              <option value="quote_sent">3. Presupuesto Enviado</option>
              <option value="quote_approved">4. Presupuesto Aprobado</option>
              <option value="in_progress">5. En Proceso</option>
              <option value="waiting_parts">6. Esperando Repuestos</option>
              <option value="quality_control">7. Control de Calidad</option>
              <option value="completed">8. Finalizado</option>
              <option value="delivered">9. Entregado</option>
              <option value="archived">10. Archivado (Historial)</option>
            </select>
          </div>
        </div>

        {/* Date Filter Quick Selector */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5 text-xs">
          <span className="text-slate-400 font-mono flex items-center gap-1.5 mr-2">
            <Calendar className="w-3.5 h-3.5 text-[#00E5FF]" /> Filtrar Fecha:
          </span>

          <button
            onClick={() => setDatePeriod('all')}
            className={`px-3 py-1 rounded-lg font-mono text-[11px] uppercase tracking-wider transition-all ${
              datePeriod === 'all' ? 'bg-[#00E5FF] text-black font-bold' : 'bg-slate-900 text-slate-400 hover:text-white border border-white/10'
            }`}
          >
            Todas
          </button>

          <button
            onClick={() => setDatePeriod('today')}
            className={`px-3 py-1 rounded-lg font-mono text-[11px] uppercase tracking-wider transition-all ${
              datePeriod === 'today' ? 'bg-[#00E5FF] text-black font-bold' : 'bg-slate-900 text-slate-400 hover:text-white border border-white/10'
            }`}
          >
            Hoy
          </button>

          <button
            onClick={() => setDatePeriod('week')}
            className={`px-3 py-1 rounded-lg font-mono text-[11px] uppercase tracking-wider transition-all ${
              datePeriod === 'week' ? 'bg-[#00E5FF] text-black font-bold' : 'bg-slate-900 text-slate-400 hover:text-white border border-white/10'
            }`}
          >
            Esta Semana
          </button>

          <button
            onClick={() => setDatePeriod('month')}
            className={`px-3 py-1 rounded-lg font-mono text-[11px] uppercase tracking-wider transition-all ${
              datePeriod === 'month' ? 'bg-[#00E5FF] text-black font-bold' : 'bg-slate-900 text-slate-400 hover:text-white border border-white/10'
            }`}
          >
            Este Mes
          </button>

          <button
            onClick={() => setDatePeriod('year')}
            className={`px-3 py-1 rounded-lg font-mono text-[11px] uppercase tracking-wider transition-all ${
              datePeriod === 'year' ? 'bg-[#00E5FF] text-black font-bold' : 'bg-slate-900 text-slate-400 hover:text-white border border-white/10'
            }`}
          >
            Este Año
          </button>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-slate-500 text-[10px] font-mono uppercase">Fecha Exacta:</span>
            <input
              type="date"
              value={customDate}
              onChange={(e) => {
                setCustomDate(e.target.value);
                setDatePeriod('custom');
              }}
              className="bg-black border border-white/10 rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-[#00E5FF] font-mono"
            />
            {customDate && (
              <button
                onClick={() => {
                  setCustomDate('');
                  setDatePeriod('all');
                }}
                className="text-xs text-red-400 hover:underline font-mono font-bold"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Master Orders Table */}
      <div className="nike-card p-4 overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-black/60 font-display text-sm tracking-wider uppercase text-slate-400 border-b border-white/10">
            <tr>
              <th className="p-3">N° ODS</th>
              <th className="p-3">VEHÍCULO</th>
              <th className="p-3">CLIENTE</th>
              <th className="p-3">SEDE / ASESOR</th>
              <th className="p-3">ESTADO</th>
              <th className="p-3 text-right">TOTAL PRESUPUESTO</th>
              <th className="p-3 text-right">PAGADO</th>
              <th className="p-3 text-center">ACCIÓN</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-sans">
            {filteredOrders.map((order) => {
              const statusInfo = statusLabels[order.status] || { label: order.status, color: 'bg-slate-800 text-white' };
              return (
                <tr key={order.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-3 font-mono font-bold text-[#00E5FF]">{order.orderNumber}</td>
                  <td className="p-3">
                    <div className="font-bold text-white">{order.vehicleBrandModel}</div>
                    <div className="text-[10px] font-mono text-slate-400">
                      Placa: <span className="text-white uppercase font-bold">{order.vehiclePlate}</span> | {order.vehicleColor}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="text-white font-medium">{order.customerName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{order.customerPhone}</div>
                  </td>
                  <td className="p-3">
                    <div className="text-slate-300">{order.branchName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">Agente: {order.receptionAgent}</div>
                  </td>
                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-display uppercase tracking-wider border ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-white">${order.totalAmount}</td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-400">${order.paidAmount}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onSelectOrder(order)}
                        className="px-3 py-1.5 rounded-full bg-[#00E5FF]/10 text-[#00E5FF] hover:bg-[#00E5FF] hover:text-black font-display text-xs transition-all flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> VER
                      </button>
                      
                      {onDeleteODS && (
                        <button
                          onClick={() => onDeleteODS(order.id)}
                          className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-full transition-colors border border-red-500/30"
                          title="Eliminar ODS"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
