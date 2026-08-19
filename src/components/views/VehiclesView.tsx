import React from 'react';
import { Vehicle } from '../../types';
import { Car, ShieldCheck, KeyRound } from 'lucide-react';

interface VehiclesViewProps {
  vehicles: Vehicle[];
}

export const VehiclesView: React.FC<VehiclesViewProps> = ({ vehicles }) => {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full">
      <div>
        <h2 className="font-display text-3xl text-[var(--color-text-primary)] tracking-wide flex items-center gap-2">
          GARAJE DIGITAL DE VEHÍCULOS <Car className="w-6 h-6 text-[#7A1B28]" />
        </h2>
        <p className="text-xs text-[var(--color-text-muted)]">Histórico de vehículos atendidos en la sede.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles.map((v) => (
          <div key={v.id} className="glass-card p-5 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-base text-[#7A1B28] font-bold tracking-widest">{v.plate}</span>
                <span className="text-xs font-mono text-[var(--color-text-muted)]">{v.year}</span>
              </div>
              <h3 className="font-display text-2xl text-[var(--color-text-primary)]">{v.brand} {v.model}</h3>
              <p className="text-xs text-[var(--color-text-secondary)]">Color: {v.color}</p>
            </div>

            {v.vin && (
              <div className="p-2.5 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)] text-[10px] font-mono text-[var(--color-text-muted)] flex items-center gap-2">
                <KeyRound className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                <span>VIN: {v.vin}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
