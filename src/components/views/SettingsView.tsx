import React, { useState } from 'react';
import { Settings, Shield, Building, Printer, Database, UserPlus, Trash2, Users } from 'lucide-react';
import { Agent } from '../../types';

interface SettingsViewProps {
  technicians: Agent[];
  setTechnicians: React.Dispatch<React.SetStateAction<Agent[]>>;
  receptionAgents: Agent[];
  setReceptionAgents: React.Dispatch<React.SetStateAction<Agent[]>>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ 
  technicians, 
  setTechnicians, 
  receptionAgents, 
  setReceptionAgents 
}) => {
  const [newTechName, setNewTechName] = useState('');
  const [newTechRole, setNewTechRole] = useState('');
  const [newAgentName, setNewAgentName] = useState('');

  const handleAddTechnician = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTechName) return;
    
    const initials = newTechName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    setTechnicians([...technicians, { 
      id: `tech-${Date.now()}`, 
      name: newTechName, 
      role: newTechRole || 'Técnico General', 
      avatar: initials 
    }]);
    setNewTechName('');
    setNewTechRole('');
  };

  const handleAddAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentName) return;
    
    setReceptionAgents([...receptionAgents, { 
      id: `recep-${Date.now()}`, 
      name: newAgentName 
    }]);
    setNewAgentName('');
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-5xl mx-auto w-full">
      <div>
        <h2 className="font-display text-3xl text-white tracking-wide flex items-center gap-2">
          CONFIGURACIÓN DEL SISTEMA <Settings className="w-6 h-6 text-[#00E5FF]" />
        </h2>
        <p className="text-xs text-slate-400">Ajustes globales de sede, roles, técnicos y base de datos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Técnicos Asignados */}
        <div className="nike-card p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-emerald-400">
              <Users className="w-5 h-5" />
              <h3 className="font-display text-xl text-white">TÉCNICOS</h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">{technicians.length} ACTIVOS</span>
          </div>
          
          <div className="flex flex-col gap-2 mt-2 max-h-48 overflow-y-auto pr-2">
            {technicians.map(tech => (
              <div key={tech.id} className="flex items-center justify-between bg-black/40 border border-white/5 p-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-[#00E5FF]/10 text-[#00E5FF] flex items-center justify-center font-display text-xs">
                    {tech.avatar}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{tech.name}</p>
                    <p className="text-[10px] text-slate-400">{tech.role}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setTechnicians(technicians.filter(t => t.id !== tech.id))}
                  className="p-1.5 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddTechnician} className="mt-3 flex flex-col gap-2 pt-3 border-t border-white/10">
            <input 
              type="text" 
              placeholder="Nombre del Técnico" 
              value={newTechName} 
              onChange={e => setNewTechName(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded px-3 py-1.5 text-xs text-white outline-none focus:border-[#00E5FF]"
            />
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Especialidad (ej. Pintura)" 
                value={newTechRole} 
                onChange={e => setNewTechRole(e.target.value)}
                className="bg-slate-900 border border-white/10 rounded px-3 py-1.5 text-xs text-white outline-none focus:border-[#00E5FF] flex-1"
              />
              <button type="submit" className="bg-[#00E5FF]/20 text-[#00E5FF] px-3 py-1.5 rounded flex items-center gap-1 hover:bg-[#00E5FF] hover:text-black transition-colors">
                <UserPlus className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Agentes de Recepción */}
        <div className="nike-card p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-amber-400">
              <Shield className="w-5 h-5" />
              <h3 className="font-display text-xl text-white">AGENTES DE RECEPCIÓN</h3>
            </div>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">{receptionAgents.length} ACTIVOS</span>
          </div>

          <div className="flex flex-col gap-2 mt-2 max-h-48 overflow-y-auto pr-2">
            {receptionAgents.map(agent => (
              <div key={agent.id} className="flex items-center justify-between bg-black/40 border border-white/5 p-2 rounded-lg">
                <p className="text-xs font-bold text-white ml-2">{agent.name}</p>
                <button 
                  onClick={() => setReceptionAgents(receptionAgents.filter(a => a.id !== agent.id))}
                  className="p-1.5 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddAgent} className="mt-auto flex gap-2 pt-3 border-t border-white/10">
            <input 
              type="text" 
              placeholder="Nombre del Agente" 
              value={newAgentName} 
              onChange={e => setNewAgentName(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded px-3 py-1.5 text-xs text-white outline-none focus:border-[#00E5FF] flex-1"
            />
            <button type="submit" className="bg-amber-500/20 text-amber-400 px-3 py-1.5 rounded flex items-center gap-1 hover:bg-amber-500 hover:text-black transition-colors">
              <UserPlus className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        <div className="nike-card p-5 flex flex-col gap-3 opacity-70">
          <div className="flex items-center gap-3 text-slate-400">
            <Building className="w-5 h-5" />
            <h3 className="font-display text-xl text-white">SEDE Y EMPRESA</h3>
          </div>
          <p className="text-xs text-slate-400">Super Wash Performance C.A. - Sede Principal Las Mercedes</p>
          <div className="text-xs text-slate-300 font-mono">RIF: J-40199281-0</div>
        </div>

        <div className="nike-card p-5 flex flex-col gap-3 opacity-70">
          <div className="flex items-center gap-3 text-cyan-400">
            <Database className="w-5 h-5" />
            <h3 className="font-display text-xl text-white">CONEXIÓN SUPABASE</h3>
          </div>
          <p className="text-xs text-slate-400">PostgreSQL Engine + RLS Policies + Realtime Sockets Activos</p>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full w-fit">
            ✓ CONECTADO
          </span>
        </div>
      </div>
    </div>
  );
};
