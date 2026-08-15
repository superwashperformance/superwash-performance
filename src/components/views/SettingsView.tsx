import React, { useState } from 'react';
import { Settings, Shield, Building, Database, UserPlus, Trash2, Users, Wrench, Edit3, Check, X as XIcon, Plus, Package, Lock, ShieldCheck, Key, EyeOff, AlertTriangle, Save } from 'lucide-react';
import { Agent, CompanyData, ServiceItem, InventoryItem, Branch } from '../../types';
import { branchService } from '../../services/branchService';
import { agentService } from '../../services/agentService';
import { companyService } from '../../services/companyService';
interface SettingsViewProps {
  userRole?: string;
  technicians: Agent[];
  setTechnicians: React.Dispatch<React.SetStateAction<Agent[]>>;
  receptionAgents: Agent[];
  setReceptionAgents: React.Dispatch<React.SetStateAction<Agent[]>>;
  companyData: CompanyData;
  setCompanyData: React.Dispatch<React.SetStateAction<CompanyData>>;
  servicesCatalog: ServiceItem[];
  setServicesCatalog: React.Dispatch<React.SetStateAction<ServiceItem[]>>;
  inventory: InventoryItem[];
  branches: Branch[];
  setBranches: React.Dispatch<React.SetStateAction<Branch[]>>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ 
  userRole = 'admin',
  technicians, 
  setTechnicians, 
  receptionAgents,
  setReceptionAgents,
  companyData,
  setCompanyData,
  servicesCatalog,
  setServicesCatalog,
  inventory,
  branches,
  setBranches,
}) => {
  const [newTechName, setNewTechName] = useState('');
  const [newTechRole, setNewTechRole] = useState('');
  const [newAgentName, setNewAgentName] = useState('');

  // Password & User Management State (Migrated to Supabase Auth)
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState('');

  // Editing Company Data State
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [tempCompanyData, setTempCompanyData] = useState<CompanyData>(companyData);

  // Managing Services State
  const [isAddingService, setIsAddingService] = useState(false);
  const [isImportingFromInventory, setIsImportingFromInventory] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [tempService, setTempService] = useState<Partial<ServiceItem>>({});

  // Managing Branches State
  const [isAddingBranch, setIsAddingBranch] = useState(false);
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);
  const [tempBranch, setTempBranch] = useState<Partial<Branch>>({});

  const handleAddTechnician = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTechName) return;
    
    try {
      const newAgent = await agentService.createAgent({
        name: newTechName,
        role: 'technician',
        specialties: newTechRole ? [newTechRole] : []
      });
      setTechnicians([...technicians, newAgent]);
      setNewTechName('');
      setNewTechRole('');
    } catch (error) {
      alert('Error al añadir técnico');
    }
  };

  const handleAddAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentName) return;
    
    try {
      const newAgent = await agentService.createAgent({
        name: newAgentName,
        role: 'free_reception'
      });
      setReceptionAgents([...receptionAgents, newAgent]);
      setNewAgentName('');
    } catch (error) {
      alert('Error al añadir agente');
    }
  };

  // Company Data Handlers
  const handleSaveCompany = async () => {
    try {
      // Assuming we have only one company_settings record and its id is known or we just update the first one.
      // Wait, in App.tsx we just get the first one. Let's make sure companyService can just update the existing one.
      // Since companyService.updateCompanySettings requires an ID, we need to know the ID.
      // But companyData from App.tsx doesn't have an ID if it's the old type. Let's check CompanyData type.
      // I'll call a special function or we just re-insert. Actually, if it's the first time we should create.
      // Let's check if tempCompanyData has an id.
      // Let's implement a simpler "upsert" or just let the user save it locally for now? No, we need it in Supabase!
      // Let's add a `saveSettings` to companyService that just updates the first row.
      const saved = await companyService.updateFirstCompanySettings(tempCompanyData);
      if (saved) {
        setCompanyData({
          name: saved.name,
          documentId: saved.document_id,
          address: saved.address || '',
          phone: saved.phone || '',
          email: saved.email || ''
        });
        setIsEditingCompany(false);
      }
    } catch (error) {
      alert('Error guardando empresa');
    }
  };

  const handleCancelCompany = () => {
    setTempCompanyData(companyData);
    setIsEditingCompany(false);
  };

  const handleDeleteTechnician = async (id: string) => {
    if (!window.confirm('¿Eliminar este técnico?')) return;
    try {
      if (!id.startsWith('tech-')) {
        await agentService.deleteAgent(id);
      }
      setTechnicians(technicians.filter(t => t.id !== id));
    } catch (error) {
      alert('Error eliminando técnico');
    }
  };

  const handleDeleteReceptionAgent = async (id: string) => {
    if (!window.confirm('¿Eliminar este agente?')) return;
    try {
      if (!id.startsWith('recep-')) {
        await agentService.deleteAgent(id);
      }
      setReceptionAgents(receptionAgents.filter(a => a.id !== id));
    } catch (error) {
      alert('Error eliminando agente');
    }
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
  const handleSaveBranch = async () => {
    try {
      if (editingBranchId) {
        const updated = await branchService.updateBranch(editingBranchId, tempBranch);
        setBranches(branches.map(b => b.id === editingBranchId ? updated : b));
        setEditingBranchId(null);
      } else {
        if (!tempBranch.name || !tempBranch.address || !tempBranch.phone) {
          alert('Nombre, dirección y teléfono son obligatorios');
          return;
        }
        const created = await branchService.createBranch(tempBranch as Branch);
        setBranches([...branches, created]);
        setIsAddingBranch(false);
      }
      setTempBranch({});
    } catch (e: any) {
      alert('Error guardando sede: ' + e.message);
    }
  };

  const handleToggleBranchActive = async (branch: Branch) => {
    try {
      const updated = await branchService.updateBranch(branch.id, { is_active: !branch.is_active });
      setBranches(branches.map(b => b.id === branch.id ? updated : b));
    } catch (e: any) {
      alert('Error actualizando estado de sede: ' + e.message);
    }
  };


  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-5xl mx-auto w-full">
      <div>
        <h2 className="font-display text-3xl text-slate-800 tracking-wide flex items-center gap-2">
          <Settings className="w-8 h-8 text-[#7A1B28]" /> CONFIGURACIONES
        </h2>
        <p className="text-sm text-slate-500 mt-1">Administra los datos de tu empresa y preferencias del sistema</p>
      </div>

      {/* Sección de Gestión de Contraseñas (Solo para Administrador y Dueño) */}
      {(userRole === 'admin' || userRole === 'owner') && (
        <div className="glass-card p-5 flex flex-col gap-4 border-[#7A1B28]/20 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3 text-[#7A1B28]">
              <Key className="w-5 h-5" />
              <div>
                <h3 className="font-display text-xl text-slate-900">GESTIÓN DE CREDENCIALES Y CONTRASEÑAS</h3>
                <p className="text-[11px] text-slate-500 font-mono">Panel exclusivo para Administrador (CEO) y Dueño (Director)</p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-[#7A1B28] bg-[#7A1B28]/5 border border-[#7A1B28]/20 px-3 py-1 rounded-full flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" /> SUPABASE AUTH
            </span>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-center">
            <p className="text-sm font-mono text-slate-600">
              La gestión de credenciales y contraseñas ahora está delegada a <strong>Supabase Auth</strong>. Por favor, utiliza el panel de administración de Supabase para añadir o modificar usuarios.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Técnicos Asignados */}
        <div className="glass-card p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-emerald-600">
              <Users className="w-5 h-5" />
              <h3 className="font-display text-xl text-slate-800">TÉCNICOS</h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">{technicians.length} ACTIVOS</span>
          </div>
          
          <div className="flex flex-col gap-2 mt-2 max-h-48 overflow-y-auto pr-2">
            {technicians.map(tech => (
              <div key={tech.id} className="flex items-center justify-between bg-slate-50 border border-slate-200 p-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-[#7A1B28]/10 text-[#7A1B28] flex items-center justify-center font-display text-xs font-bold">
                    {tech.avatar}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{tech.name}</p>
                    <p className="text-[10px] text-slate-500">{tech.role}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleDeleteTechnician(tech.id)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddTechnician} className="mt-3 flex flex-col gap-2 pt-3 border-t border-slate-200">
            <input 
              type="text" 
              placeholder="Nombre del Técnico" 
              value={newTechName} 
              onChange={e => setNewTechName(e.target.value)}
              className="bg-white border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-[#7A1B28]"
            />
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Especialidad (ej. Pintura)" 
                value={newTechRole} 
                onChange={e => setNewTechRole(e.target.value)}
                className="bg-white border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-[#7A1B28] flex-1"
              />
              <button type="submit" className="bg-[#7A1B28]/10 text-[#7A1B28] px-3 py-1.5 rounded flex items-center gap-1 hover:bg-[#7A1B28] hover:text-white transition-colors">
                <UserPlus className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Agentes de Recepción */}
        <div className="glass-card p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-amber-500">
              <Shield className="w-5 h-5" />
              <h3 className="font-display text-xl text-slate-800">AGENTES DE RECEPCIÓN</h3>
            </div>
            <span className="text-[10px] font-mono text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">{receptionAgents.length} ACTIVOS</span>
          </div>

          <div className="flex flex-col gap-2 mt-2 max-h-48 overflow-y-auto pr-2">
            {receptionAgents.map(agent => (
              <div key={agent.id} className="flex items-center justify-between bg-slate-50 border border-slate-200 p-2 rounded-lg">
                <p className="text-xs font-bold text-slate-900 ml-2">{agent.name}</p>
                <button 
                  onClick={() => handleDeleteReceptionAgent(agent.id)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddAgent} className="mt-auto flex gap-2 pt-3 border-t border-slate-200">
            <input 
              type="text" 
              placeholder="Nombre del Agente" 
              value={newAgentName} 
              onChange={e => setNewAgentName(e.target.value)}
              className="bg-white border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-[#7A1B28] flex-1"
            />
            <button type="submit" className="bg-amber-100 text-amber-600 border border-amber-200 px-3 py-1.5 rounded flex items-center gap-1 hover:bg-amber-500 hover:text-white transition-colors">
              <UserPlus className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Datos de Empresa */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between mb-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3 text-[#7A1B28]">
            <Building className="w-5 h-5" />
            <h3 className="font-display text-lg text-slate-800">DATOS DE LA EMPRESA</h3>
          </div>
          {!isEditingCompany ? (
            <button onClick={() => { setTempCompanyData(companyData); setIsEditingCompany(true); }} className="text-xs flex items-center gap-1.5 text-[#7A1B28] font-bold hover:bg-[#7A1B28]/5 px-3 py-1.5 rounded transition-colors">
              <Edit3 className="w-3.5 h-3.5" /> EDITAR
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={handleCancelCompany} className="text-xs flex items-center gap-1 text-slate-500 hover:text-slate-900 transition-colors">
                <XIcon className="w-3.5 h-3.5" /> CANCELAR
              </button>
              <button onClick={handleSaveCompany} className="text-xs flex items-center gap-1 text-emerald-600 hover:text-emerald-700 transition-colors font-bold">
                <Check className="w-3.5 h-3.5" /> GUARDAR
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-500 font-mono">NOMBRE DE LA EMPRESA</label>
            {isEditingCompany ? (
              <input type="text" value={tempCompanyData.name} onChange={e => setTempCompanyData({...tempCompanyData, name: e.target.value})} className="bg-white border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-[#7A1B28]" />
            ) : (
              <p className="text-sm text-slate-900 font-bold">{companyData.name}</p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-500 font-mono">RIF / NIT</label>
            {isEditingCompany ? (
              <input type="text" value={tempCompanyData.documentId} onChange={e => setTempCompanyData({...tempCompanyData, documentId: e.target.value})} className="bg-white border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-[#7A1B28]" />
            ) : (
              <p className="text-sm text-slate-900 font-mono">{companyData.documentId}</p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-500 font-mono">DIRECCIÓN</label>
            {isEditingCompany ? (
              <input type="text" value={tempCompanyData.address} onChange={e => setTempCompanyData({...tempCompanyData, address: e.target.value})} className="bg-white border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-[#7A1B28]" />
            ) : (
              <p className="text-sm text-slate-700">{companyData.address}</p>
            )}
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-[10px] text-slate-500 font-mono">TELÉFONO</label>
              {isEditingCompany ? (
                <input type="text" value={tempCompanyData.phone} onChange={e => setTempCompanyData({...tempCompanyData, phone: e.target.value})} className="bg-white border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-[#7A1B28]" />
              ) : (
                <p className="text-sm text-slate-700 font-mono">{companyData.phone}</p>
              )}
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-[10px] text-slate-500 font-mono">EMAIL</label>
              {isEditingCompany ? (
                <input type="email" value={tempCompanyData.email} onChange={e => setTempCompanyData({...tempCompanyData, email: e.target.value})} className="bg-white border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-[#7A1B28]" />
              ) : (
                <p className="text-sm text-slate-700 font-mono">{companyData.email}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sedes (Company Branches) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between mb-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3 text-[#7A1B28]">
            <Building className="w-5 h-5" />
            <h3 className="font-display text-lg text-slate-800">SEDES (SUCURSALES)</h3>
          </div>
          {!isAddingBranch ? (
            <button onClick={() => setIsAddingBranch(true)} className="bg-[#7A1B28] text-white text-xs flex items-center gap-1.5 py-2 px-4 rounded-full hover:bg-[#5a141d] hover:shadow-md transition-all font-bold">
              <Plus className="w-4 h-4" /> AÑADIR SEDE
            </button>
          ) : (
            <button onClick={() => { setIsAddingBranch(false); setTempBranch({}); }} className="text-xs flex items-center gap-1 text-slate-500 hover:text-slate-900 transition-colors">
              <XIcon className="w-3.5 h-3.5" /> CANCELAR
            </button>
          )}
        </div>

        {/* Formulario Nueva/Editar Sede */}
        {(isAddingBranch || editingBranchId) && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-500 font-bold">NOMBRE DE LA SEDE *</label>
              <input type="text" value={tempBranch.name || ''} onChange={e => setTempBranch({...tempBranch, name: e.target.value})} className="bg-white border border-slate-300 rounded px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#7A1B28]" placeholder="Ej. Principal" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-500 font-bold">TELÉFONO *</label>
              <input type="text" value={tempBranch.phone || ''} onChange={e => setTempBranch({...tempBranch, phone: e.target.value})} className="bg-white border border-slate-300 rounded px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#7A1B28]" placeholder="Ej. 0412-1234567" />
            </div>
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs text-slate-500 font-bold">DIRECCIÓN *</label>
              <input type="text" value={tempBranch.address || ''} onChange={e => setTempBranch({...tempBranch, address: e.target.value})} className="bg-white border border-slate-300 rounded px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#7A1B28]" placeholder="Dirección completa" />
            </div>
            <div className="flex items-end justify-end md:col-span-2 mt-2">
              <button onClick={handleSaveBranch} className="bg-[#7A1B28] text-white text-sm flex items-center gap-2 py-2 px-6 rounded-lg hover:bg-[#5a141d] transition-colors font-bold w-full md:w-auto justify-center shadow-sm">
                <Save className="w-4 h-4" /> GUARDAR SEDE
              </button>
            </div>
          </div>
        )}

        {/* Listado de Sedes en Formato Tabla */}
        {branches.length > 0 ? (
          <div className="overflow-x-auto border border-slate-200 rounded-lg mt-2">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-xs font-bold text-slate-600">NOMBRE DE LA SEDE</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600">TELÉFONO</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600">DIRECCIÓN</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 w-32">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {branches.map((branch) => (
                  <tr key={branch.id} className={`border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors ${!branch.is_active ? 'opacity-60 bg-slate-50/50' : ''}`}>
                    <td className="px-4 py-3 text-sm font-bold text-slate-800">
                      {branch.name}
                      {!branch.is_active && (
                        <span className="ml-2 text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-medium">INACTIVA</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 font-mono">{branch.phone}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{branch.address}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => { setEditingBranchId(branch.id); setTempBranch(branch); setIsAddingBranch(false); }} 
                          className="p-1.5 text-[#7A1B28] hover:bg-[#7A1B28]/10 rounded transition-colors"
                          title="Editar"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleToggleBranchActive(branch)} 
                          className={`p-1.5 rounded transition-colors ${branch.is_active ? 'text-amber-500 hover:bg-amber-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                          title={branch.is_active ? 'Desactivar Sede' : 'Activar Sede'}
                        >
                          {branch.is_active ? <EyeOff className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="col-span-full py-12 text-center text-slate-500 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-lg mt-2 bg-slate-50">
            <Building className="w-8 h-8 text-slate-300 mb-1" />
            <p className="text-sm font-medium">Aún no tienes sedes configuradas.</p>
            <p className="text-xs text-slate-400">Agrega tu primera sede para comenzar.</p>
          </div>
        )}
      </div>

      {/* Catálogo de Servicios */}
      <div className="glass-card p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3 text-[#7A1B28]">
            <Wrench className="w-5 h-5" />
            <h3 className="font-display text-xl text-slate-800">CATÁLOGO DE SERVICIOS</h3>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                setIsImportingFromInventory(true);
                setIsAddingService(false);
                setEditingServiceId(null);
              }} 
              className="text-xs font-mono font-bold flex items-center gap-1 bg-[#7A1B28]/10 text-[#7A1B28] px-3 py-1.5 rounded hover:bg-[#7A1B28] hover:text-white transition-colors"
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
              className="text-xs font-mono font-bold flex items-center gap-1 bg-[#7A1B28]/10 text-[#7A1B28] px-3 py-1.5 rounded hover:bg-[#7A1B28] hover:text-white transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> AÑADIR SERVICIO
            </button>
          </div>
        </div>

        {/* Import from Inventory Form */}
        {isImportingFromInventory && (
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col gap-3 mb-4 shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Package className="w-4 h-4 text-[#7A1B28]" /> Seleccionar Insumo del Inventario
            </h4>
            <p className="text-xs text-slate-500">Selecciona un producto. El precio de venta empezará en 0 para que lo configures.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-[10px] text-slate-500 font-mono">INSUMO</label>
                <select 
                  className="bg-white border border-slate-200 rounded px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#7A1B28]"
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
              <button onClick={() => setIsImportingFromInventory(false)} className="text-xs bg-slate-200 text-slate-700 px-3 py-1.5 rounded hover:bg-slate-300 transition-colors font-bold">
                CANCELAR
              </button>
            </div>
          </div>
        )}

        {/* Add / Edit Form */}
        {(isAddingService || editingServiceId) && (
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col gap-3 mb-4 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-500 font-mono">NOMBRE DEL SERVICIO</label>
                <input type="text" value={tempService.name || ''} onChange={e => setTempService({...tempService, name: e.target.value})} className="bg-white border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-[#7A1B28]" placeholder="Ej. Detailing VIP" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-500 font-mono">PRECIO ($)</label>
                <input type="number" value={tempService.price || 0} onChange={e => setTempService({...tempService, price: Number(e.target.value)})} className="bg-white border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-[#7A1B28]" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-500 font-mono">CATEGORÍA</label>
                <select value={tempService.category || 'Detailing'} onChange={e => setTempService({...tempService, category: e.target.value as any})} className="bg-white border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-[#7A1B28]">
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
              <button onClick={() => { setIsAddingService(false); setEditingServiceId(null); }} className="text-xs bg-slate-200 text-slate-700 px-3 py-1.5 rounded hover:bg-slate-300 transition-colors font-bold">
                CANCELAR
              </button>
              <button onClick={handleSaveService} className="text-xs bg-[#7A1B28] text-white px-4 py-1.5 rounded hover:bg-[#5a141d] transition-colors font-bold">
                GUARDAR SERVICIO
              </button>
            </div>
          </div>
        )}

        {/* Services List */}
        <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-2">
          {servicesCatalog.map(service => (
            <div key={service.id} className="flex items-center justify-between bg-slate-50 border border-slate-200 p-3 rounded-lg hover:border-[#7A1B28]/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#7A1B28]/10 text-[#7A1B28] flex items-center justify-center font-display text-sm font-bold">
                  ${service.price}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{service.name}</p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">{service.category}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleEditService(service)}
                  className="p-1.5 text-[#7A1B28] hover:bg-[#7A1B28]/10 rounded transition-colors"
                  title="Editar"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDeleteService(service.id)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
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
