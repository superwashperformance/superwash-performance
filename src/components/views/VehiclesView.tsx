import React, { useState } from 'react';
import { Vehicle, ServiceOrder } from '../../types';
import { Car, KeyRound, Search, Calendar, Wrench, CheckCircle2, FileText, ChevronRight, Eye } from 'lucide-react';

interface VehiclesViewProps {
  vehicles: Vehicle[];
  orders: ServiceOrder[];
  onSelectOrder?: (order: ServiceOrder) => void;
}

export const VehiclesView: React.FC<VehiclesViewProps> = ({ vehicles, orders, onSelectOrder }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlate, setSelectedPlate] = useState<string | null>(null);

  // Combine vehicles from props with any vehicles found in orders to ensure 100% coverage by plate
  const allPlates = Array.from(
    new Set([
      ...vehicles.map((v) => v.plate.toUpperCase()),
      ...orders.map((o) => o.vehiclePlate.toUpperCase()),
    ])
  ).filter(Boolean);

  const vehicleList = allPlates.map((plate) => {
    const existingVehicle = vehicles.find((v) => v.plate.toUpperCase() === plate);
    const vehicleOrders = orders.filter((o) => o.vehiclePlate.toUpperCase() === plate);
    const deliveredOrders = vehicleOrders.filter((o) => o.status === 'delivered');
    const latestOrder = vehicleOrders[0];

    const brand = existingVehicle?.brand || latestOrder?.vehicleBrandModel.split(' ')[0] || 'Vehículo';
    const model = existingVehicle?.model || latestOrder?.vehicleBrandModel.split(' ').slice(1).join(' ') || '';
    const year = existingVehicle?.year || latestOrder?.vehicleYear || 2024;
    const color = existingVehicle?.color || latestOrder?.vehicleColor || 'No especificado';
    const customerName = latestOrder?.customerName || 'Cliente Registrado';

    const lastVisit =
      existingVehicle?.lastVisit ||
      deliveredOrders[0]?.entryDate ||
      latestOrder?.entryDate ||
      'Sin visitas registradas';

    const lastService =
      existingVehicle?.lastService ||
      deliveredOrders[0]?.services.map((s) => s.serviceName).join(', ') ||
      latestOrder?.services.map((s) => s.serviceName).join(', ') ||
      'N/A';

    return {
      id: existingVehicle?.id || `veh-${plate}`,
      plate,
      brand,
      model,
      year,
      color,
      vin: existingVehicle?.vin,
      customerName,
      lastVisit,
      lastService,
      vehicleOrders,
      deliveredOrders,
    };
  });

  const filteredVehicles = vehicleList.filter(
    (v) =>
      v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl text-white tracking-wide flex items-center gap-2">
            GARAJE DIGITAL POR PLACA <Car className="w-6 h-6 text-[#00E5FF]" />
          </h2>
          <p className="text-xs text-slate-400">
            Registro automático e historial de vehículos y Órdenes de Servicio (ODS) entregadas por placa.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por placa (ej. AA991GT), marca o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:border-[#00E5FF] outline-none"
          />
        </div>
      </div>

      {/* Grid of Vehicles by Plate */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredVehicles.map((v) => {
          const isSelected = selectedPlate === v.plate;
          return (
            <div
              key={v.plate}
              className="nike-card p-5 flex flex-col justify-between gap-4 border border-white/10 hover:border-[#00E5FF]/50 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-base bg-[#00E5FF]/10 text-[#00E5FF] px-2.5 py-1 rounded-lg border border-[#00E5FF]/30 font-bold tracking-widest">
                    {v.plate}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{v.year}</span>
                </div>
                <h3 className="font-display text-2xl text-white truncate">
                  {v.brand} {v.model}
                </h3>
                <p className="text-xs text-slate-400">Cliente: <span className="text-slate-200 font-semibold">{v.customerName}</span> | Color: {v.color}</p>
              </div>

              {v.vin && (
                <div className="p-2 rounded-lg bg-black/40 border border-white/5 text-[10px] font-mono text-slate-400 flex items-center gap-2">
                  <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                  <span>VIN: {v.vin}</span>
                </div>
              )}

              {/* Delivery Stats for this Plate */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 flex flex-col gap-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#00E5FF]" /> Última Visita:
                  </span>
                  <span className="font-mono text-white text-[11px]">{v.lastVisit}</span>
                </div>

                <div className="flex items-start justify-between text-slate-400">
                  <span className="flex items-center gap-1 shrink-0">
                    <Wrench className="w-3.5 h-3.5 text-amber-400" /> Último Servicio:
                  </span>
                  <span className="text-slate-300 text-right truncate text-[11px] max-w-[160px]" title={v.lastService}>
                    {v.lastService}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-white/5">
                  <span className="flex items-center gap-1 text-[#00E5FF] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> ODS Entregadas:
                  </span>
                  <span className="font-mono font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
                    {v.deliveredOrders.length}
                  </span>
                </div>
              </div>

              {/* Action Button: View ODS History for this Plate */}
              <button
                onClick={() => setSelectedPlate(isSelected ? null : v.plate)}
                className="w-full btn-nike-secondary text-xs py-2 flex items-center justify-center gap-2"
              >
                <FileText className="w-3.5 h-3.5 text-[#00E5FF]" />
                <span>{isSelected ? 'Ocultar Historial' : `Ver Historial (${v.vehicleOrders.length} ODS)`}</span>
                <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
              </button>

              {/* Expanded ODS History per Plate */}
              {isSelected && (
                <div className="mt-2 pt-3 border-t border-white/10 flex flex-col gap-2">
                  <h4 className="text-xs font-display text-[#00E5FF] uppercase tracking-wider">
                    Historial de ODS (Placa: {v.plate})
                  </h4>
                  {v.vehicleOrders.length === 0 ? (
                    <p className="text-[11px] text-slate-500 italic">No hay órdenes registradas para esta placa.</p>
                  ) : (
                    v.vehicleOrders.map((o) => (
                      <div
                        key={o.id}
                        className="p-2.5 rounded-lg bg-slate-900 border border-white/5 flex flex-col gap-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-white">{o.orderNumber}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-display uppercase ${
                              o.status === 'delivered'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {o.status === 'delivered' ? 'ENTREGADO' : o.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300">
                          Servicios: {o.services.map((s) => s.serviceName).join(', ')}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span>Fecha: {o.entryDate}</span>
                          <span>Total: ${o.totalAmount}</span>
                        </div>
                        {onSelectOrder && (
                          <button
                            onClick={() => onSelectOrder(o)}
                            className="mt-1 text-[11px] text-[#00E5FF] hover:underline flex items-center gap-1 justify-end font-bold"
                          >
                            <Eye className="w-3 h-3" /> Ver Detalle de ODS
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredVehicles.length === 0 && (
        <div className="p-12 text-center border border-dashed border-white/10 rounded-2xl bg-slate-900/30">
          <Car className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No se encontraron vehículos registrados para el criterio de búsqueda.</p>
        </div>
      )}
    </div>
  );
};
