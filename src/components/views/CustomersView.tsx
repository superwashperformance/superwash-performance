import React from 'react';
import { Customer, Vehicle } from '../../types';
import { Users, Phone, Mail, MapPin, Car, Plus } from 'lucide-react';

interface CustomersViewProps {
  customers: Customer[];
  vehicles: Vehicle[];
}

export const CustomersView: React.FC<CustomersViewProps> = ({ customers, vehicles }) => {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl text-white tracking-wide flex items-center gap-2">
            DIRECTORIO DE CLIENTES <Users className="w-6 h-6 text-[#00E5FF]" />
          </h2>
          <p className="text-xs text-slate-400">Base de datos centralizada de clientes y sus vehículos registrados.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customers.map((cust) => {
          const custVehicles = vehicles.filter((v) => v.customerId === cust.id);
          return (
            <div key={cust.id} className="nike-card p-5 flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-[#00E5FF] font-bold">{cust.documentId}</span>
                  <span className="text-[10px] text-slate-400 font-mono">Cliente desde {cust.createdAt}</span>
                </div>
                <h3 className="font-display text-2xl text-white">{cust.fullName}</h3>
                
                <div className="flex flex-col gap-1 mt-3 text-xs text-slate-300 font-mono">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{cust.phone}</span>
                  </div>
                  {cust.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{cust.email}</span>
                    </div>
                  )}
                  {cust.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{cust.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Registered Vehicles */}
              <div className="border-t border-white/10 pt-3">
                <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1.5">
                  Vehículos Asociados ({custVehicles.length})
                </span>
                <div className="flex flex-col gap-1.5">
                  {custVehicles.map((v) => (
                    <div key={v.id} className="p-2 rounded-lg bg-black/40 border border-white/5 text-xs flex items-center justify-between">
                      <span className="font-bold text-white">{v.brand} {v.model} ({v.year})</span>
                      <span className="font-mono text-[10px] text-[#00E5FF] font-bold">{v.plate}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
