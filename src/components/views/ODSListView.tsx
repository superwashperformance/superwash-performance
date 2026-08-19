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
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.vehicleBrandModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entryDateStr.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    // Date filter
    let matchesDate = true;
    const now = new Date();
    
    let orderDateObj = new Date(entryDateStr);
    if (isNaN(orderDateObj.getTime()) && entryDateStr.includes('/')) {
      const [datePart, timePart] = entryDateStr.split(', ');
      if (datePart) {
        const parts = datePart.split('/');
        if (parts.length === 3) {
          const [day, month, year] = parts;
          orderDateObj = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${timePart || '00:00:00'}`);
        }
      }
    }

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
    received: { label: 'Recibido', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
    diagnosis: { label: 'Diagnóstico', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    quote_sent: { label: 'Presupuesto Enviado', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    quote_pending: { label: 'Presupuesto Pnte', color: 'bg-slate-100 text-[var(--color-text-secondary)] border-[var(--color-border-primary)]' },
    quote_approved: { label: 'Presupuesto Aprobado', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    in_progress: { label: 'En Proceso', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    waiting_parts: { label: 'Esperando Repuestos', color: 'bg-orange-100 text-orange-700 border-orange-200' },
    quality_control: { label: 'Control de Calidad', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    completed: { label: 'Finalizado', color: 'bg-green-100 text-green-700 border-green-200' },
    delivered: { label: 'Entregado', color: 'bg-slate-100 text-[var(--color-text-secondary)] border-[var(--color-border-primary)]' },
    archived: { label: 'Archivado (Historial)', color: 'bg-gray-100 text-gray-500 border-gray-200' },
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl text-[var(--color-text-primary)] tracking-wide flex items-center gap-2">
            Órdenes de Servicio <ClipboardList className="w-6 h-6 text-[#7A1B28]" />
          </h2>
          <p className="text-xs text-[var(--color-text-muted)]">
            Registro histórico e inspección 360° de todas las ODS creadas en la plataforma.
          </p>
        </div>

        <button onClick={onNewODS} className="btn-primary text-xs md:text-sm py-2.5 px-6">
          <Plus className="w-4 h-4 stroke-[3]" /> NUEVA ODS
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col gap-3 bg-[var(--color-bg-surface)] p-4 rounded-2xl border border-[var(--color-border-primary)] shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Text Search */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-[var(--color-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por ODS, Placa, Cliente, Fecha (ej. 24/7/2026)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)] rounded-xl pl-9 pr-4 py-2 text-xs text-[var(--color-text-primary)] focus:border-[#7A1B28] outline-none"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[var(--color-text-muted)]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)] rounded-xl px-3 py-2 text-xs text-[var(--color-text-primary)] focus:border-[#7A1B28] outline-none font-mono"
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
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--color-border-subtle)] text-xs">
          <span className="text-[var(--color-text-muted)] font-mono flex items-center gap-1.5 mr-2">
            <Calendar className="w-3.5 h-3.5 text-[var(--color-text-muted)]" /> Filtrar Fecha:
          </span>

          <button
            onClick={() => setDatePeriod('all')}
            className={`px-3 py-1 rounded-lg font-mono text-[11px] uppercase tracking-wider transition-all ${
              datePeriod === 'all' ? 'bg-[#7A1B28] text-white font-bold' : 'bg-[var(--color-bg-primary)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] border border-[var(--color-border-primary)]'
            }`}
          >
            Todas
          </button>

          <button
            onClick={() => setDatePeriod('today')}
            className={`px-3 py-1 rounded-lg font-mono text-[11px] uppercase tracking-wider transition-all ${
              datePeriod === 'today' ? 'bg-[#7A1B28] text-white font-bold' : 'bg-[var(--color-bg-primary)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] border border-[var(--color-border-primary)]'
            }`}
          >
            Hoy
          </button>

          <button
            onClick={() => setDatePeriod('week')}
            className={`px-3 py-1 rounded-lg font-mono text-[11px] uppercase tracking-wider transition-all ${
              datePeriod === 'week' ? 'bg-[#7A1B28] text-white font-bold' : 'bg-[var(--color-bg-primary)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] border border-[var(--color-border-primary)]'
            }`}
          >
            Esta Semana
          </button>

          <button
            onClick={() => setDatePeriod('month')}
            className={`px-3 py-1 rounded-lg font-mono text-[11px] uppercase tracking-wider transition-all ${
              datePeriod === 'month' ? 'bg-[#7A1B28] text-white font-bold' : 'bg-[var(--color-bg-primary)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] border border-[var(--color-border-primary)]'
            }`}
          >
            Este Mes
          </button>

          <button
            onClick={() => setDatePeriod('year')}
            className={`px-3 py-1 rounded-lg font-mono text-[11px] uppercase tracking-wider transition-all ${
              datePeriod === 'year' ? 'bg-[#7A1B28] text-white font-bold' : 'bg-[var(--color-bg-primary)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] border border-[var(--color-border-primary)]'
            }`}
          >
            Este Año
          </button>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-[var(--color-text-muted)] text-[10px] font-mono uppercase">Fecha Exacta:</span>
            <input
              type="date"
              value={customDate}
              onChange={(e) => {
                setCustomDate(e.target.value);
                setDatePeriod('custom');
              }}
              className="bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)] rounded-lg px-2 py-1 text-xs text-[var(--color-text-primary)] outline-none focus:border-[#7A1B28] font-mono"
            />
            {customDate && (
              <button
                onClick={() => {
                  setCustomDate('');
                  setDatePeriod('all');
                }}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[var(--color-text-secondary)]">
            <thead className="bg-[var(--color-bg-primary)] font-display text-sm uppercase text-[var(--color-text-muted)] border-b border-[var(--color-border-primary)]">
              <tr>
                <th className="p-4">Nº ODS</th>
                <th className="p-4">VEHÍCULO</th>
                <th className="p-4">CLIENTE</th>
                <th className="p-4">ESTADO ACTUAL</th>
                <th className="p-4">FECHA INGRESO</th>
                <th className="p-4">ASESOR</th>
                <th className="p-4 text-center">ACCIÓN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[var(--color-text-muted)] font-mono">
                    No se encontraron órdenes de servicio con los filtros actuales.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const statusInfo = statusLabels[order.status] || { label: order.status, color: 'bg-slate-100 text-[var(--color-text-primary)]' };

                  return (
                    <tr key={order.id} className="hover:bg-[var(--color-bg-primary)] transition-colors">
                      <td className="p-4 font-mono font-bold text-[#7A1B28] text-sm">{order.orderNumber}</td>
                      <td className="p-4">
                        <div className="font-bold text-[var(--color-text-primary)] text-sm">{order.vehicleBrandModel}</div>
                        <div className="text-xs font-mono text-[var(--color-text-muted)] mt-0.5">Placa: {order.vehiclePlate} | {order.vehicleColor}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-[var(--color-text-primary)] font-medium text-sm">{order.customerName}</div>
                        <div className="text-xs text-[var(--color-text-muted)] font-mono mt-0.5">{order.customerPhone}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-[var(--color-text-muted)]">{order.entryDate}</td>
                      <td className="p-4 text-[var(--color-text-secondary)]">{order.receptionAgent}</td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => onSelectOrder(order)}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 text-[var(--color-text-secondary)] hover:bg-[#7A1B28] hover:text-white font-bold text-xs transition-all"
                          >
                            FICHA 360°
                          </button>
                          {onDeleteODS && (
                             <button 
                                onClick={() => {
                                  if(window.confirm('¿Estás seguro de eliminar esta ODS? Esta acción no se puede deshacer.')) {
                                    onDeleteODS(order.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-50 transition-colors"
                                title="Eliminar ODS"
                             >
                                <Trash2 className="w-4 h-4" />
                             </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
