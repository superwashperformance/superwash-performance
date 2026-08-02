import React, { useState } from 'react';
import { Settings, Shield, Building, Database, UserPlus, Trash2, Users, Wrench, Edit3, Check, X as XIcon, Plus, Package } from 'lucide-react';
import { Agent, CompanyData, ServiceItem, InventoryItem } from '../../types';

interface SettingsViewProps {
  technicians: Agent[];
  setTechnicians: React.Dispatch<React.SetStateAction<Agent[]>>;
  receptionAgents: Agent[];
  setReceptionAgents: React.Dispatch<React.SetStateAction<Agent[]>>;
  companyData: CompanyData;
  setCompanyData: React.Dispatch<React.SetStateAction<CompanyData>>;
  servicesCatalog: ServiceItem[];
  setServicesCatalog: React.Dispatch<React.SetStateAction<ServiceItem[]>>;
  inventory: InventoryItem[];
}

export const SettingsView: React.FC<SettingsViewProps> = ({ 
  technicians, 
  setTechnicians, 
  receptionAgents, 
  setReceptionAgents,
  companyData,
  setCompanyData,
  servicesCatalog,
  setServicesCatalog,
  inventory
}) => {
  const [newTechName, setNewTechName] = useState('');
  const [newTechRole, setNewTechRole] = useState('');
  const [newAgentName, setNewAgentName] = useState('');

  // Editing Company Data State
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [tempCompanyData, setTempCompanyData] = useState<CompanyData>(companyData);

  // Managing Services State
  const [isAddingService, setIsAddingService] = useState(false);
  const [isImportingFromInventory, setIsImportingFromInventory] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [tempService, setTempService] = useState<Partial<ServiceItem>>({});

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

  // Company Data Handlers
  const handleSaveCompany = () => {
    setCompanyData(tempCompanyData);
    setIsEditingCompany(false);
  };

  const handleCancelCompany = () => {
    setTempCompanyData(companyData);
    setIsEditingCompany(false);
  };

  // Services Handlers
  const handleEditService = (service: ServiceItem) => {
    setEditingServiceId(service.id);
    setTempService(service);
  };

  const handleSaveService = () => {
    if (editingServiceId) {
      setServicesCatalog(servicesCatalog.map(s => s.id === editingServiceId ? tempService as ServiceItem : s));
    } else {
      setServicesCatalog([{ ...tempService, id: `srv-${Date.now()}` } as ServiceItem, ...servicesCatalog]);
      setIsAddingService(false);
    }
    setEditingServiceId(null);
    setTempService({});
  };

  const handleDeleteService = (id: string) => {
    if (window.confirm('¿Eliminar este servicio del catálogo?')) {
      setServicesCatalog(servicesCatalog.filter(s => s.id !== id));
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-5xl mx-auto w-full">
      <div>
        <h2 className="font-display text-3xl text-white tracking-wide flex items-center gap-2">
          CONFIGURACIÓN DEL SISTEMA <Settings className="w-6 h-6 text-[#00E5FF]" />
        </h2>
        <p className="text-xs text-slate-400">Ajustes globales de sede, roles, técnicos, servicios y base de datos.</p>
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

      {/* Datos de Empresa */}
      <div className="nike-card p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3 text-purple-400">
            <Building className="w-5 h-5" />
            <h3 className="font-display text-xl text-white">DATOS DE LA EMPRESA</h3>
          </div>
          {!isEditingCompany ? (
            <button onClick={() => { setTempCompanyData(companyData); setIsEditingCompany(true); }} className="text-xs flex items-center gap-1 text-[#00E5FF] hover:text-white transition-colors">
              <Edit3 className="w-3.5 h-3.5" /> EDITAR
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={handleCancelCompany} className="text-xs flex items-center gap-1 text-slate-400 hover:text-white transition-colors">
                <XIcon className="w-3.5 h-3.5" /> CANCELAR
              </button>
              <button onClick={handleSaveCompany} className="text-xs flex items-center gap-1 text-emerald-400 hover:text-white transition-colors">
                <Check className="w-3.5 h-3.5" /> GUARDAR
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-400 font-mono">NOMBRE DE LA EMPRESA</label>
            {isEditingCompany ? (
              <input type="text" value={tempCompanyData.name} onChange={e => setTempCompanyData({...tempCompanyData, name: e.target.value})} className="bg-slate-900 border border-white/10 rounded px-3 py-1.5 text-xs text-white outline-none focus:border-[#00E5FF]" />
            ) : (
              <p className="text-sm text-white font-bold">{companyData.name}</p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-400 font-mono">RIF / NIT</label>
            {isEditingCompany ? (
              <input type="text" value={tempCompanyData.documentId} onChange={e => setTempCompanyData({...tempCompanyData, documentId: e.target.value})} className="bg-slate-900 border border-white/10 rounded px-3 py-1.5 text-xs text-white outline-none focus:border-[#00E5FF]" />
            ) : (
              <p className="text-sm text-white font-mono">{companyData.documentId}</p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-400 font-mono">DIRECCIÓN</label>
            {isEditingCompany ? (
              <input type="text" value={tempCompanyData.address} onChange={e => setTempCompanyData({...tempCompanyData, address: e.target.value})} className="bg-slate-900 border border-white/10 rounded px-3 py-1.5 text-xs text-white outline-none focus:border-[#00E5FF]" />
            ) : (
              <p className="text-sm text-slate-300">{companyData.address}</p>
            )}
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-[10px] text-slate-400 font-mono">TELÉFONO</label>
              {isEditingCompany ? (
                <input type="text" value={tempCompanyData.phone} onChange={e => setTempCompanyData({...tempCompanyData, phone: e.target.value})} className="bg-slate-900 border border-white/10 rounded px-3 py-1.5 text-xs text-white outline-none focus:border-[#00E5FF]" />
              ) : (
                <p className="text-sm text-slate-300 font-mono">{companyData.phone}</p>
              )}
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-[10px] text-slate-400 font-mono">EMAIL</label>
              {isEditingCompany ? (
                <input type="email" value={tempCompanyData.email} onChange={e => setTempCompanyData({...tempCompanyData, email: e.target.value})} className="bg-slate-900 border border-white/10 rounded px-3 py-1.5 text-xs text-white outline-none focus:border-[#00E5FF]" />
              ) : (
                <p className="text-sm text-slate-300 font-mono">{companyData.email}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Catálogo de Servicios */}
      <div className="nike-card p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3 text-pink-400">
            <Wrench className="w-5 h-5" />
            <h3 className="font-display text-xl text-white">CATÁLOGO DE SERVICIOS</h3>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                setIsImportingFromInventory(true);
                setIsAddingService(false);
                setEditingServiceId(null);
              }} 
              className="text-xs font-mono font-bold flex items-center gap-1 bg-purple-500/20 text-purple-400 px-3 py-1.5 rounded hover:bg-purple-500 hover:text-white transition-colors"
            >
              <Package className="w-3.5 h-3.5" /> IMPORTAR DE STOCK
            </button>
            <button 
              onClick={() => {
                setIsAddingService(true);
                setIsImportingFromInventory(false);
                setEditingServiceId(null);
                setTempService({ name: '', price: 0, category: 'Detailing', estimatedHours: 1, assignedRole: 'free_reception' });
              }} 
              className="text-xs font-mono font-bold flex items-center gap-1 bg-pink-500/20 text-pink-400 px-3 py-1.5 rounded hover:bg-pink-500 hover:text-white transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> AÑADIR SERVICIO
            </button>
          </div>
        </div>

        {/* Import from Inventory Form */}
        {isImportingFromInventory && (
          <div className="bg-black/60 border border-purple-500/30 p-4 rounded-xl flex flex-col gap-3 mb-4 shadow-xl">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-purple-400" /> Seleccionar Insumo del Inventario
            </h4>
            <p className="text-xs text-slate-400">Selecciona un producto. El precio de venta empezará en 0 para que lo configures.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-[10px] text-slate-400 font-mono">INSUMO</label>
                <select 
                  className="bg-slate-900 border border-white/10 rounded px-3 py-2 text-xs text-white outline-none focus:border-purple-500"
                  onChange={(e) => {
                    const selectedItem = inventory.find(i => i.id === e.target.value);
                    if (selectedItem) {
                      setTempService({ 
                        name: selectedItem.name, 
                        price: 0, // Starts at 0 for manual config
                        category: selectedItem.category === 'detailing' ? 'Detailing' : 'Pintura', 
                        estimatedHours: 1, 
                        assignedRole: 'free_reception' 
                      });
                      setIsImportingFromInventory(false);
                      setIsAddingService(true);
                    }
                  }}
                >
                  <option value="">-- Selecciona un insumo --</option>
                  {inventory.map(item => (
                    <option key={item.id} value={item.id}>
                      [{item.sku}] {item.name} (Costo: ${item.unitCost})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end mt-2">
              <button onClick={() => setIsImportingFromInventory(false)} className="text-xs bg-slate-800 text-white px-3 py-1.5 rounded hover:bg-slate-700 transition-colors">
                CANCELAR
              </button>
            </div>
          </div>
        )}

        {/* Add / Edit Form */}
        {(isAddingService || editingServiceId) && (
          <div className="bg-black/60 border border-pink-500/30 p-4 rounded-xl flex flex-col gap-3 mb-4 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-mono">NOMBRE DEL SERVICIO</label>
                <input type="text" value={tempService.name || ''} onChange={e => setTempService({...tempService, name: e.target.value})} className="bg-slate-900 border border-white/10 rounded px-3 py-1.5 text-xs text-white outline-none focus:border-pink-500" placeholder="Ej. Detailing VIP" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-mono">PRECIO ($)</label>
                <input type="number" value={tempService.price || 0} onChange={e => setTempService({...tempService, price: Number(e.target.value)})} className="bg-slate-900 border border-white/10 rounded px-3 py-1.5 text-xs text-white outline-none focus:border-pink-500" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-mono">CATEGORÍA</label>
                <select value={tempService.category || 'Detailing'} onChange={e => setTempService({...tempService, category: e.target.value as any})} className="bg-slate-900 border border-white/10 rounded px-3 py-1.5 text-xs text-white outline-none focus:border-pink-500">
                  <option value="Detailing">Detailing</option>
                  <option value="Pulitura">Pulitura</option>
                  <option value="Pintura">Pintura</option>
                  <option value="Latonería">Latonería</option>
                  <option value="PPF">PPF</option>
                  <option value="Polarizado">Polarizado</option>
                  <option value="Lavado Premium">Lavado Premium</option>
                  <option value="Reparación Menor">Reparación Menor</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <button onClick={() => { setIsAddingService(false); setEditingServiceId(null); }} className="text-xs bg-slate-800 text-white px-3 py-1.5 rounded hover:bg-slate-700 transition-colors">
                CANCELAR
              </button>
              <button onClick={handleSaveService} className="text-xs bg-pink-600 text-white px-4 py-1.5 rounded hover:bg-pink-500 transition-colors font-bold">
                GUARDAR SERVICIO
              </button>
            </div>
          </div>
        )}

        {/* Services List */}
        <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-2">
          {servicesCatalog.map(service => (
            <div key={service.id} className="flex items-center justify-between bg-black/40 border border-white/5 p-3 rounded-lg hover:border-white/10 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center font-display text-sm">
                  ${service.price}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{service.name}</p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                    <span className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">{service.category}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleEditService(service)}
                  className="p-1.5 text-[#00E5FF] hover:bg-[#00E5FF]/20 rounded transition-colors"
                  title="Editar"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDeleteService(service.id)}
                  className="p-1.5 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
