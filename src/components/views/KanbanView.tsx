import React from 'react';
import { ServiceOrder, ODSStatus, UserRole } from '../../types';
import {
  Clock,
  User,
  Car,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface KanbanViewProps {
  orders: ServiceOrder[];
  onUpdateStatus: (orderId: string, newStatus: ODSStatus) => void;
  onSelectOrder: (order: ServiceOrder) => void;
  currentRole: UserRole;
}

export const KanbanView: React.FC<KanbanViewProps> = ({
  orders,
  onUpdateStatus,
  onSelectOrder,
  currentRole,
}) => {
  const columns: { id: ODSStatus; label: string; color: string }[] = [
    { id: 'received', label: '1. RECIBIDO', color: 'border-[#00E5FF] text-[#00E5FF]' },
    { id: 'diagnosis', label: '2. DIAGNÓSTICO', color: 'border-amber-500 text-amber-400' },
    { id: 'quote_sent', label: '3. PRESUPUESTO ENVIADO', color: 'border-purple-500 text-purple-400' },
    { id: 'quote_approved', label: '4. PRESUPUESTO APROBADO', color: 'border-emerald-500 text-emerald-400' },
    { id: 'in_progress', label: '5. EN PROCESO', color: 'border-blue-500 text-blue-400' },
    { id: 'waiting_parts', label: '6. ESPERANDO REPUESTOS', color: 'border-orange-500 text-orange-400' },
    { id: 'quality_control', label: '7. CONTROL DE CALIDAD', color: 'border-yellow-500 text-yellow-400' },
    { id: 'completed', label: '8. FINALIZADO', color: 'border-green-500 text-green-400' },
    { id: 'delivered', label: '9. ENTREGADO', color: 'border-slate-600 text-slate-400' },
  ];

  const getNextStatus = (current: ODSStatus): ODSStatus | null => {
    const sequence: ODSStatus[] = [
      'received',
      'diagnosis',
      'quote_sent',
      'quote_approved',
      'in_progress',
      'waiting_parts',
      'quality_control',
      'completed',
      'delivered',
    ];
    const idx = sequence.indexOf(current);
    return idx >= 0 && idx < sequence.length - 1 ? sequence[idx + 1] : null;
  };

  const getPrevStatus = (current: ODSStatus): ODSStatus | null => {
    const sequence: ODSStatus[] = [
      'received',
      'diagnosis',
      'quote_sent',
      'quote_approved',
      'in_progress',
      'waiting_parts',
      'quality_control',
      'completed',
      'delivered',
    ];
    const idx = sequence.indexOf(current);
    return idx > 0 ? sequence[idx - 1] : null;
  };

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 w-full h-[calc(100vh-80px)] overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="font-display text-3xl text-white tracking-wide flex items-center gap-2">
            TABLERO EN VIVO <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] animate-pulse" />
          </h2>
          <p className="text-xs text-slate-400">
            Control operativo de flujos por estaciones de trabajo. Sincronizado en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
          <span>Arrastra o avanza los estados con los botones direccionales.</span>
        </div>
      </div>

      {/* Horizontal Kanban Columns Container */}
      <div className="flex-1 flex gap-4 overflow-x-auto pb-4 custom-scrollbar select-none">
        {columns.map((col) => {
          const colOrders = orders.filter((o) => o.status === col.id);
          return (
            <div
              key={col.id}
              className="w-72 shrink-0 flex flex-col bg-slate-950/70 border border-white/10 rounded-2xl p-3 h-full"
            >
              {/* Column Header */}
              <div className={`flex items-center justify-between border-b pb-2 mb-3 ${col.color}`}>
                <span className="font-display text-sm tracking-wider uppercase">{col.label}</span>
                <span className="w-5 h-5 rounded-full bg-white/10 text-white font-mono text-xs flex items-center justify-center font-bold">
                  {colOrders.length}
                </span>
              </div>

              {/* Column Cards Feed */}
              <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1">
                {colOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 border border-dashed border-white/10 rounded-xl text-center p-4">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Sin ODS en este estado</span>
                  </div>
                ) : (
                  colOrders.map((order) => {
                    const prev = getPrevStatus(order.status);
                    const next = getNextStatus(order.status);
                    return (
                      <div
                        key={order.id}
                        onClick={() => onSelectOrder(order)}
                        className="nike-card p-4 flex flex-col gap-3 cursor-pointer border-white/10 hover:border-cyan-500/50 transition-all group"
                      >
                        {/* Order Number & Vehicle Header */}
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-xs text-[#00E5FF]">{order.orderNumber}</span>
                          <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">
                            {order.vehiclePlate}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-bold text-white text-sm line-clamp-1 group-hover:text-[#00E5FF] transition-colors">
                            {order.vehicleBrandModel}
                          </h4>
                          <span className="text-xs text-slate-400 truncate block">{order.customerName}</span>
                        </div>

                        {/* Services preview */}
                        {order.services.length > 0 && (
                          <div className="text-[10px] text-slate-400 bg-black/40 p-2 rounded-lg border border-white/5 truncate">
                            {order.services[0].serviceName}
                            {order.services.length > 1 && ` (+${order.services.length - 1} más)`}
                          </div>
                        )}

                        {/* Assigned Techs & Delivery Time */}
                        <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-white/5 pt-2">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3 text-cyan-400" />
                            <span>{order.assignedStaff?.[0]?.name || 'Por Asignar'}</span>
                          </div>
                          <span className="font-mono text-white font-bold">${order.totalAmount}</span>
                        </div>

                        {/* Stage Advancement Quick Controls */}
                        <div className="flex items-center justify-between gap-1 pt-1" onClick={(e) => e.stopPropagation()}>
                          {prev ? (
                            <button
                              onClick={() => onUpdateStatus(order.id, prev)}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors"
                              title="Retroceder estado"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                          ) : <div />}

                          {next && (
                            <button
                              onClick={() => onUpdateStatus(order.id, next)}
                              className="px-2.5 py-1 rounded-lg bg-[#00E5FF] text-black font-display text-xs font-bold hover:bg-[#33EBFF] flex items-center gap-1 transition-colors ml-auto shadow-md"
                              title="Avanzar siguiente estado"
                            >
                              <span>Avanzar</span>
                              <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
