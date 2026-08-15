import React, { useState } from 'react';
import { Vehicle } from '../../types';
import { Car, KeyRound, Edit3, Trash2, X, CheckCircle } from 'lucide-react';

interface VehiclesViewProps {
  vehicles: Vehicle[];
  onUpdateVehicle?: (vehicle: Vehicle) => void;
  onDeleteVehicle?: (id: string) => void;
}

export const VehiclesView: React.FC<VehiclesViewProps> = ({ vehicles, onUpdateVehicle, onDeleteVehicle }) => {
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [vehPlate, setVehPlate] = useState('');
  const [vehBrand, setVehBrand] = useState('');
  const [vehModel, setVehModel] = useState('');
  const [vehYear, setVehYear] = useState<number>(2024);
  const [vehColor, setVehColor] = useState('');
  const [vehVin, setVehVin] = useState('');

  const openEditVehicleModal = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setVehPlate(vehicle.plate);
    setVehBrand(vehicle.brand);
    setVehModel(vehicle.model);
    setVehYear(vehicle.year);
    setVehColor(vehicle.color || '');
    setVehVin(vehicle.vin || '');
  };

  const handleSaveVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicle || !onUpdateVehicle) return;

    const updatedVeh: Vehicle = {
      ...editingVehicle,
      plate: vehPlate.trim().toUpperCase(),
      brand: vehBrand.trim(),
      model: vehModel.trim(),
      year: vehYear,
      color: vehColor.trim() || 'Desconocido',
      vin: vehVin.trim() || undefined,
    };
    onUpdateVehicle(updatedVeh);
    setEditingVehicle(null);
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full relative">
      <div>
        <h2 className="font-display text-3xl text-slate-800 tracking-wide flex items-center gap-2">
          GARAJE DIGITAL DE VEHÍCULOS <Car className="w-6 h-6 text-[#7A1B28]" />
        </h2>
        <p className="text-xs text-slate-500">Histórico de vehículos atendidos en la sede.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles.map((v) => (
          <div key={v.id} className="glass-card p-5 flex flex-col justify-between gap-4 group relative">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-base text-[#7A1B28] font-bold tracking-widest">{v.plate}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-500">{v.year}</span>
                  {onUpdateVehicle && (
                    <button
                      onClick={() => openEditVehicleModal(v)}
                      className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition-colors border border-slate-200"
                      title="Editar Vehículo"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {onDeleteVehicle && (
                    <button
                      onClick={() => {
                        if (window.confirm(`¿Estás seguro de eliminar el vehículo ${v.plate}?`)) {
                          onDeleteVehicle(v.id);
                        }
                      }}
                      className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-900 rounded-lg transition-colors border border-red-200"
                      title="Eliminar Vehículo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <h3 className="font-display text-2xl text-slate-800">{v.brand} {v.model}</h3>
              <p className="text-xs text-slate-600">Color: {v.color}</p>
            </div>

            {v.vin && (
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[10px] font-mono text-slate-500 flex items-center gap-2">
                <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                <span>VIN: {v.vin}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Edit Vehicle Modal */}
      {editingVehicle && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="glass-card p-6 w-full max-w-md flex flex-col gap-4 border border-slate-200 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display text-xl text-slate-800 flex items-center gap-2">
                <Car className="w-5 h-5 text-[#7A1B28]" />
                MODIFICAR VEHÍCULO
              </h3>
              <button onClick={() => setEditingVehicle(null)} className="text-slate-400 hover:text-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVehicle} className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Placa / Matrícula *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. AB123CD"
                    value={vehPlate}
                    onChange={(e) => setVehPlate(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono focus:border-[#7A1B28] outline-none uppercase"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Año *</label>
                  <input
                    type="number"
                    required
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    value={vehYear}
                    onChange={(e) => setVehYear(parseInt(e.target.value) || new Date().getFullYear())}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:border-[#7A1B28] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Marca *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Toyota / Porsche"
                    value={vehBrand}
                    onChange={(e) => setVehBrand(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:border-[#7A1B28] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Modelo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Corolla / 911"
                    value={vehModel}
                    onChange={(e) => setVehModel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:border-[#7A1B28] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Color</label>
                  <input
                    type="text"
                    placeholder="Ej. Negro Zafiro"
                    value={vehColor}
                    onChange={(e) => setVehColor(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:border-[#7A1B28] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">VIN / Chasis</label>
                  <input
                    type="text"
                    placeholder="Opcional"
                    value={vehVin}
                    onChange={(e) => setVehVin(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono focus:border-[#7A1B28] outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingVehicle(null)}
                  className="flex-1 bg-white border border-slate-300 text-slate-700 py-2.5 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors uppercase tracking-wider"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary py-2.5 rounded-lg text-xs justify-center flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" /> GUARDAR CAMBIOS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
