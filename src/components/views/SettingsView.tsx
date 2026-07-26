import React from 'react';
import { Settings, Shield, Building, Printer, Database } from 'lucide-react';

export const SettingsView: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-5xl mx-auto w-full">
      <div>
        <h2 className="font-display text-3xl text-white tracking-wide flex items-center gap-2">
          CONFIGURACIÓN DEL SISTEMA <Settings className="w-6 h-6 text-[#00E5FF]" />
        </h2>
        <p className="text-xs text-slate-400">Ajustes globales de sede, impresoras, roles y base de datos Supabase.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="nike-card p-5 flex flex-col gap-3">
          <div className="flex items-center gap-3 text-[#00E5FF]">
            <Building className="w-5 h-5" />
            <h3 className="font-display text-xl text-white">SEDE Y EMPRESA</h3>
          </div>
          <p className="text-xs text-slate-400">Super Wash Performance C.A. - Sede Principal Las Mercedes</p>
          <div className="text-xs text-slate-300 font-mono">RIF: J-40199281-0</div>
        </div>

        <div className="nike-card p-5 flex flex-col gap-3">
          <div className="flex items-center gap-3 text-cyan-400">
            <Database className="w-5 h-5" />
            <h3 className="font-display text-xl text-white">CONEXIÓN SUPABASE BACKEND</h3>
          </div>
          <p className="text-xs text-slate-400">PostgreSQL Engine + RLS Policies + Realtime Sockets Activos</p>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full w-fit">
            ● CONECTADO EN TIEMPO REAL
          </span>
        </div>
      </div>
    </div>
  );
};
