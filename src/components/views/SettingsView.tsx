import React, { useState } from 'react';
import { 
  Settings, Shield, Building, Database, UserPlus, Trash2, Users, Wrench, 
  Edit3, Check, X as XIcon, Plus, Package, Palette, Moon, Sun, Monitor, 
  Sparkles, CheckCircle2, RotateCcw, Eye, Layers, Type, Sliders
} from 'lucide-react';
import { Agent, CompanyData, ServiceItem, InventoryItem, PrimaryColorName, ThemeMode, InterfaceSize, FontScale } from '../../types';
import { useTheme } from '../../context/ThemeContext';

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
  const [activeSettingsTab, setActiveSettingsTab] = useState<'general' | 'appearance'>('general');

  const { settings, updateSettings, resetSettings, effectiveMode } = useTheme();

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

  const colorPresets: { name: PrimaryColorName; label: string; hex: string }[] = [
    { name: 'cyan', label: 'Turquesa', hex: '#00E5FF' },
    { name: 'blue', label: 'Azul', hex: '#3B82F6' },
    { name: 'green', label: 'Verde', hex: '#10B981' },
    { name: 'orange', label: 'Naranja', hex: '#F97316' },
    { name: 'purple', label: 'Morado', hex: '#A855F7' },
    { name: 'red', label: 'Rojo', hex: '#EF4444' },
  ];

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl text-white tracking-wide flex items-center gap-2">
            CONFIGURACIÓN DEL SISTEMA <Settings className="w-6 h-6 text-[#00E5FF]" />
          </h2>
          <p className="text-xs text-slate-400">Ajustes globales de sede, roles, apariencia, temas y servicios.</p>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-1 bg-black/40 p-1 rounded-xl border border-white/10 self-start sm:self-auto">
          <button
            onClick={() => setActiveSettingsTab('general')}
            className={`px-4 py-2 rounded-lg text-xs font-bold font-display uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeSettingsTab === 'general'
                ? 'bg-[#00E5FF] text-black font-bold shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Settings className="w-4 h-4" /> General & Operaciones
          </button>
          <button
            onClick={() => setActiveSettingsTab('appearance')}
            className={`px-4 py-2 rounded-lg text-xs font-bold font-display uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeSettingsTab === 'appearance'
                ? 'bg-[#00E5FF] text-black font-bold shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Palette className="w-4 h-4" /> Apariencia
          </button>
        </div>
      </div>

      {/* TAB 2: APARIENCIA */}
      {activeSettingsTab === 'appearance' && (
        <div className="flex flex-col gap-6 animate-fade-in">
          {/* Main Controls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Modo de Tema */}
            <div className="nike-card p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-[#00E5FF]">
                <Moon className="w-5 h-5" />
                <h3 className="font-display text-xl text-white">TEMA DE LA INTERFAZ</h3>
              </div>
              <p className="text-xs text-slate-400">Selecciona el modo visual o sincroniza con tu sistema operativo.</p>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'dark', label: 'Oscuro', icon: Moon, desc: 'Predeterminado' },
                  { id: 'light', label: 'Claro', icon: Sun, desc: 'Enterprise Light' },
                  { id: 'system', label: 'Sistema', icon: Monitor, desc: 'Auto' },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = settings.mode === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => updateSettings({ mode: item.id as ThemeMode })}
                      className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#00E5FF]/10 border-[#00E5FF] ring-1 ring-[#00E5FF]'
                          : 'bg-slate-900/60 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${isSelected ? 'text-[#00E5FF]' : 'text-slate-400'}`} />
                      <div className="text-center">
                        <p className="text-xs font-bold text-white">{item.label}</p>
                        <span className="text-[9px] text-slate-400 font-mono">{item.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Color Principal (Acento) */}
            <div className="nike-card p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-[#00E5FF]">
                <Palette className="w-5 h-5" />
                <h3 className="font-display text-xl text-white">COLOR PRINCIPAL (ACENTO)</h3>
              </div>
              <p className="text-xs text-slate-400">Selecciona el color distintivo para botones, activos y resaltados.</p>

              <div className="grid grid-cols-3 gap-3">
                {colorPresets.map((preset) => {
                  const isSelected = settings.primaryColor === preset.name;
                  return (
                    <button
                      key={preset.name}
                      onClick={() => updateSettings({ primaryColor: preset.name })}
                      className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white/10 border-white ring-1 ring-white'
                          : 'bg-slate-900/60 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full shrink-0 shadow-md" style={{ backgroundColor: preset.hex }} />
                      <span className="text-xs font-bold text-white">{preset.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Tamaño de Interfaz */}
            <div className="nike-card p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-[#00E5FF]">
                <Layers className="w-5 h-5" />
                <h3 className="font-display text-xl text-white">TAMAÑO DE INTERFAZ (DENSIDAD)</h3>
              </div>
              <p className="text-xs text-slate-400">Ajusta el nivel de espaciado y relleno de los paneles.</p>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'compact', label: 'Compacto' },
                  { id: 'normal', label: 'Normal' },
                  { id: 'spacious', label: 'Amplio' },
                ].map((item) => {
                  const isSelected = settings.interfaceSize === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => updateSettings({ interfaceSize: item.id as InterfaceSize })}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#00E5FF]/10 border-[#00E5FF] text-white font-bold'
                          : 'bg-slate-900/60 border-white/10 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <span className="text-xs">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Escala de Fuente */}
            <div className="nike-card p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-[#00E5FF]">
                <Type className="w-5 h-5" />
                <h3 className="font-display text-xl text-white">ESCALA DE FUENTE</h3>
              </div>
              <p className="text-xs text-slate-400">Tamaño del texto general para mejorar la legibilidad.</p>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'small', label: 'Pequeña' },
                  { id: 'normal', label: 'Normal' },
                  { id: 'large', label: 'Grande' },
                ].map((item) => {
                  const isSelected = settings.fontScale === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => updateSettings({ fontScale: item.id as FontScale })}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#00E5FF]/10 border-[#00E5FF] text-white font-bold'
                          : 'bg-slate-900/60 border-white/10 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <span className="text-xs">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 5. Opciones Visuales Avanzadas */}
          <div className="nike-card p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-[#00E5FF]">
                <Sliders className="w-5 h-5" />
                <h3 className="font-display text-xl text-white">OPCIONES VISUALES</h3>
              </div>
              <button
                onClick={resetSettings}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-mono"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Restablecer Valores
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { key: 'showAnimations', label: 'Mostrar Animaciones', desc: 'Efectos suaves de transición' },
                { key: 'showShadows', label: 'Mostrar Sombras', desc: 'Sombras de profundidad' },
                { key: 'allowTransparencies', label: 'Transparencias', desc: 'Efecto cristal (Glassmorphism)' },
                { key: 'roundedCorners', label: 'Bordes Redondeados', desc: 'Esquinas suaves en paneles' },
                { key: 'highContrast', label: 'Alto Contraste', desc: 'Mayor visibilidad de bordes' },
                { key: 'reduceMotion', label: 'Reducir Movimiento', desc: 'Desactiva animaciones de bucle' },
              ].map((opt) => {
                const isChecked = (settings as any)[opt.key];
                return (
                  <label
                    key={opt.key}
                    className="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-white/5 cursor-pointer hover:border-white/20 transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => updateSettings({ [opt.key]: e.target.checked })}
                      className="mt-0.5 w-4 h-4 accent-[#00E5FF] cursor-pointer rounded"
                    />
                    <div>
                      <p className="text-xs font-bold text-white">{opt.label}</p>
                      <p className="text-[10px] text-slate-400">{opt.desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 6. Vista Previa en Vivo */}
          <div className="nike-card p-6 flex flex-col gap-4 border-[#00E5FF]/30">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-display text-xl text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#00E5FF]" /> VISTA PREVIA EN TIEMPO REAL
              </h3>
              <span className="text-xs font-mono text-[#00E5FF] font-bold uppercase">
                Modo Activo: {effectiveMode.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Dark Demo Preview */}
              <div className="p-4 rounded-xl bg-[#06080C] border border-white/10 text-white flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="font-display text-xs text-[#00E5FF]">DEMO TEMA OSCURO</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">ACTIVO</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-white/10 flex flex-col gap-2">
                  <p className="text-xs font-bold">Tarjeta de Muestra (Dark)</p>
                  <p className="text-[11px] text-slate-400">Texto secundario y elementos informativos.</p>
                  <div className="flex gap-2 mt-1">
                    <button className="btn-nike-primary text-xs py-1 px-3">Boton Primario</button>
                    <button className="btn-nike-secondary text-xs py-1 px-3">Boton Secundario</button>
                  </div>
                </div>
              </div>

              {/* Light Demo Preview */}
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-300 text-slate-900 flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-slate-300 pb-2">
                  <span className="font-display text-xs text-blue-600">DEMO TEMA CLARO</span>
                  <span className="text-[10px] font-mono text-slate-700 bg-slate-200 px-2 py-0.5 rounded">ENTERPRISE</span>
                </div>
                <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-sm flex flex-col gap-2">
                  <p className="text-xs font-bold text-slate-900">Tarjeta de Muestra (Light)</p>
                  <p className="text-[11px] text-slate-600">Texto secundario y contraste en fondo blanco.</p>
                  <div className="flex gap-2 mt-1">
                    <button className="btn-nike-primary text-xs py-1 px-3">Boton Primario</button>
                    <button className="bg-slate-100 border border-slate-300 text-slate-800 text-xs py-1 px-3 rounded-full font-bold">Boton Secundario</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: GENERAL & OPERACIONES */}
      {activeSettingsTab === 'general' && (
        <div className="flex flex-col gap-6 animate-fade-in">
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

          {/* Configuración de Sede / Empresa */}
          <div className="nike-card p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3 text-[#00E5FF]">
                <Building className="w-5 h-5" />
                <h3 className="font-display text-xl text-white">DATOS OFICIALES DE LA EMPRESA</h3>
              </div>
              {!isEditingCompany ? (
                <button 
                  onClick={() => setIsEditingCompany(true)}
                  className="btn-nike-secondary text-xs py-1 px-3 flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Editar Datos
                </button>
              ) : (
                <div className="flex gap-2">
                  <button 
                    onClick={handleCancelCompany}
                    className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded hover:bg-slate-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleSaveCompany}
                    className="text-xs bg-[#00E5FF] text-black font-bold px-3 py-1 rounded hover:bg-cyan-300 transition-colors flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Guardar
                  </button>
                </div>
              )}
            </div>

            {!isEditingCompany ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                  <span className="text-[10px] text-slate-400 block mb-0.5">RAZÓN SOCIAL / NOMBRE</span>
                  <span className="text-white font-bold">{companyData.name}</span>
                </div>
                <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                  <span className="text-[10px] text-slate-400 block mb-0.5">DOCUMENTO RIF / DNI</span>
                  <span className="text-[#00E5FF] font-bold">{companyData.documentId || companyData.rif}</span>
                </div>
                <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                  <span className="text-[10px] text-slate-400 block mb-0.5">TELÉFONO DE CONTACTO</span>
                  <span className="text-white">{companyData.phone}</span>
                </div>
                <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                  <span className="text-[10px] text-slate-400 block mb-0.5">DIRECCIÓN FÍSICA</span>
                  <span className="text-white truncate block">{companyData.address}</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Nombre / Razón Social</label>
                  <input 
                    type="text" 
                    value={tempCompanyData.name}
                    onChange={e => setTempCompanyData({ ...tempCompanyData, name: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded px-2.5 py-1.5 text-white outline-none focus:border-[#00E5FF]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">RIF / Cédula / DNI</label>
                  <input 
                    type="text" 
                    value={tempCompanyData.documentId || tempCompanyData.rif || ''}
                    onChange={e => setTempCompanyData({ ...tempCompanyData, documentId: e.target.value, rif: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded px-2.5 py-1.5 text-white font-mono outline-none focus:border-[#00E5FF]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Teléfono</label>
                  <input 
                    type="text" 
                    value={tempCompanyData.phone}
                    onChange={e => setTempCompanyData({ ...tempCompanyData, phone: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded px-2.5 py-1.5 text-white font-mono outline-none focus:border-[#00E5FF]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Dirección</label>
                  <input 
                    type="text" 
                    value={tempCompanyData.address}
                    onChange={e => setTempCompanyData({ ...tempCompanyData, address: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded px-2.5 py-1.5 text-white outline-none focus:border-[#00E5FF]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Catálogo de Servicios */}
          <div className="nike-card p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3 text-pink-400">
                <Wrench className="w-5 h-5" />
                <h3 className="font-display text-xl text-white">CATÁLOGO DE SERVICIOS</h3>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    setIsAddingService(true);
                    setEditingServiceId(null);
                    setTempService({ category: 'Detailing', price: 50, estimatedHours: 2, assignedRole: 'sales' });
                  }}
                  className="btn-nike-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar Servicio
                </button>
              </div>
            </div>

            {/* Form Modal for Service Add/Edit */}
            {(isAddingService || editingServiceId) && (
              <div className="p-4 rounded-xl bg-slate-900 border border-pink-500/30 flex flex-col gap-3 animate-fade-in">
                <h4 className="font-display text-sm text-pink-400 uppercase">
                  {editingServiceId ? 'EDITAR SERVICIO' : 'NUEVO SERVICIO'}
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Nombre del Servicio</label>
                    <input 
                      type="text" 
                      placeholder="Ej. Lavado de Chasis" 
                      value={tempService.name || ''}
                      onChange={e => setTempService({ ...tempService, name: e.target.value })}
                      className="w-full bg-black border border-white/10 rounded px-2.5 py-1.5 text-white outline-none focus:border-pink-500"
                    />
                  </div>
                  
                  <div>
                    <label className="text-slate-400 block mb-1">Categoría</label>
                    <select
                      value={tempService.category || 'Detailing'}
                      onChange={e => setTempService({ ...tempService, category: e.target.value as any })}
                      className="w-full bg-black border border-white/10 rounded px-2.5 py-1.5 text-white outline-none focus:border-pink-500"
                    >
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

                  <div>
                    <label className="text-slate-400 block mb-1">Precio ($)</label>
                    <input 
                      type="number" 
                      value={tempService.price || 0}
                      onChange={e => setTempService({ ...tempService, price: Number(e.target.value) })}
                      className="w-full bg-black border border-white/10 rounded px-2.5 py-1.5 text-white font-mono outline-none focus:border-pink-500"
                    />
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
      )}
    </div>
  );
};
