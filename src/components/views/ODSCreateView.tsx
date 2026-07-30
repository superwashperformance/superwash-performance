import React, { useState } from 'react';
import { ServiceOrder, ChecklistItem, DamageMarker, PresupuestoServiceItem, Agent } from '../../types';
import { VehicleDiagram360 } from '../common/VehicleDiagram360';
import { SignatureCanvas } from '../common/SignatureCanvas';
import { mockServicesCatalog } from '../../data/mockData';
import {
  ClipboardCheck,
  User,
  Car,
  ShieldCheck,
  Camera,
  DollarSign,
  CheckCircle,
  CheckCircle2,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  PenTool,
} from 'lucide-react';

interface ODSCreateViewProps {
  onSaveODS: (ods: ServiceOrder) => void;
  onCancel: () => void;
  technicians: Agent[];
  receptionAgents: Agent[];
}

export const ODSCreateView: React.FC<ODSCreateViewProps> = ({ onSaveODS, onCancel, technicians, receptionAgents }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Step 1: Customer & Vehicle Data
  const [customerName, setCustomerName] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [plate, setPlate] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState<number>(2024);
  const [color, setColor] = useState('');
  const [vin, setVin] = useState('');
  const [observations, setObservations] = useState('');

  // Step 1: Responsables
  const [receptionAgent, setReceptionAgent] = useState(receptionAgents.length > 0 ? receptionAgents[0].name : '');
  const [assignedTechnicianId, setAssignedTechnicianId] = useState('');
  const [priorityLevel, setPriorityLevel] = useState<'normal' | 'urgente' | 'vip'>('normal');

  // Step 2: 360° Damage Markers
  const [damageMarkers, setDamageMarkers] = useState<DamageMarker[]>([]);

  // Step 3: 20-Point Checklist & Belongings
  const defaultChecklist: ChecklistItem[] = [
    { id: 'chk-1', key: 'bateria', label: 'BATERÍA', condition: 'ok' },
    { id: 'chk-2', key: 'luces_internas', label: 'LUCES INTERNAS', condition: 'ok' },
    { id: 'chk-3', key: 'luces_externas', label: 'LUCES EXTERNAS', condition: 'ok' },
    { id: 'chk-4', key: 'luces_tablero', label: 'LUCES EN EL TABLERO', condition: 'ok' },
    { id: 'chk-5', key: 'aire_acondicionado', label: 'AIRE ACONDICIONADO', condition: 'ok' },
    { id: 'chk-6', key: 'bocina', label: 'BOCINA', condition: 'ok' },
    { id: 'chk-7', key: 'alfombras', label: 'ALFOMBRAS', condition: 'ok' },
    { id: 'chk-8', key: 'limpiaparabrisas', label: 'CEPILLOS LIMPIA PARABRISAS', condition: 'ok' },
    { id: 'chk-9', key: 'caucho_repuesto', label: 'CAUCHO DE RESPUESTO', condition: 'ok' },
    { id: 'chk-10', key: 'gato_triangulo', label: 'GATO HIDRÁULICO Y TRIÁNGULO DE SEGURIDAD', condition: 'ok' },
    { id: 'chk-11', key: 'estereo', label: 'ESTÉREO', condition: 'ok' },
    { id: 'chk-12', key: 'rociadores', label: 'ROCIADORES (PARABRISAS)', condition: 'ok' },
    { id: 'chk-13', key: 'ventanillas_parabrisas', label: 'CHEQUEO DE VENTANILLAS Y PARABRISAS (DELANTERO Y TRASERO)', condition: 'ok' },
    { id: 'chk-14', key: 'tuerca_cauchos', label: 'TUERCA DE LOS CAUCHOS', condition: 'ok' },
    { id: 'chk-15', key: 'accesorios_internos', label: 'ACCESORIOS INTERNOS DEL VEHÍCULO (MANILLAS, PALANCAS)', condition: 'ok' },
    { id: 'chk-16', key: 'accesorios_otros', label: 'ACCESORIOS U OTRO', condition: 'ok' },
  ];

  const [checklist, setChecklist] = useState<ChecklistItem[]>(defaultChecklist);
  const [belongingsInput, setBelongingsInput] = useState('');
  const [belongingsList, setBelongingsList] = useState<string[]>(['Llave inteligente', 'Documentos de propiedad']);

  // Step 4: Services & Presupuesto
  const [selectedServices, setSelectedServices] = useState<PresupuestoServiceItem[]>([]);

  // Step 5: Photos & Signature
  const [clientSignature, setClientSignature] = useState('');
  const [photos, setPhotos] = useState<{ url: string; caption: string; category: any }[]>([
    {
      url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=800&auto=format&fit=crop',
      caption: 'Fotografía de Ingreso Frontal',
      category: 'general',
    },
  ]);

  const handleAddBelonging = () => {
    if (!belongingsInput.trim()) return;
    setBelongingsList([...belongingsList, belongingsInput.trim()]);
    setBelongingsInput('');
  };

  const handleRemoveBelonging = (index: number) => {
    setBelongingsList(belongingsList.filter((_, i) => i !== index));
  };

  const handleAddService = (serviceId: string) => {
    const catalogItem = mockServicesCatalog.find((s) => s.id === serviceId);
    if (!catalogItem) return;

    const existing = selectedServices.find((s) => s.serviceId === serviceId);
    if (existing) {
      setSelectedServices(
        selectedServices.map((s) =>
          s.serviceId === serviceId
            ? { ...s, quantity: s.quantity + 1, totalPrice: (s.quantity + 1) * s.unitPrice }
            : s
        )
      );
    } else {
      setSelectedServices([
        ...selectedServices,
        {
          serviceId: catalogItem.id,
          serviceName: catalogItem.name,
          category: catalogItem.category,
          unitPrice: catalogItem.price,
          quantity: 1,
          totalPrice: catalogItem.price,
        },
      ]);
    }
  };

  const handleRemoveService = (serviceId: string) => {
    setSelectedServices(selectedServices.filter((s) => s.serviceId !== serviceId));
  };

  const subtotal = selectedServices.reduce((sum, s) => sum + s.totalPrice, 0);

  const handleCompleteODS = () => {
    const nextNumber = `ODS-${Math.floor(1000 + Math.random() * 9000)}`;
    const newODS: ServiceOrder = {
      id: `ods-${Date.now()}`,
      orderNumber: nextNumber,
      customerId: `cust-${Date.now()}`,
      customerName: customerName || 'Cliente General',
      customerPhone: phone || '+58 414-0000000',
      vehicleId: `veh-${Date.now()}`,
      vehiclePlate: plate.toUpperCase() || 'ABC123X',
      vehicleBrandModel: `${brand} ${model}` || 'Vehículo Deportivo',
      vehicleColor: color || 'Negro',
      vehicleYear: year || 2024,
      branchName: 'Sede Principal (Las Mercedes)',
      receptionAgent: receptionAgent || 'Agente Recepción',
      assignedTechnician: assignedTechnicianId
        ? technicians.find((t) => t.id === assignedTechnicianId)?.name
        : undefined,
      priority: priorityLevel,
      status: 'received',
      entryDate: new Date().toLocaleString('es-ES'),
      observations: observations,
      belongingsList: belongingsList,
      checklist: checklist,
      damageMarkers: damageMarkers,
      photos: photos.map((p, i) => ({
        id: `ph-${i}`,
        photoUrl: p.url,
        caption: p.caption,
        category: p.category,
        createdAt: new Date().toLocaleTimeString(),
      })),
      services: selectedServices,
      subtotalAmount: subtotal,
      taxAmount: 0,
      totalAmount: subtotal,
      paidAmount: 0,
      statusHistory: [
        {
          status: 'received',
          changedAt: new Date().toLocaleString(),
          changedBy: 'Agente Recepción Patio',
        },
      ],
    };

    onSaveODS(newODS);
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-5xl mx-auto w-full">
      {/* Wizard Step Progress Indicator */}
      <div className="nike-card p-4 flex items-center justify-between overflow-x-auto gap-2">
        {[
          { num: 1, label: '1. Cliente y Vehículo', icon: User },
          { num: 2, label: '2. Inspección 360°', icon: Car },
          { num: 3, label: '3. Checklist (16 Puntos)', icon: ClipboardCheck },
          { num: 4, label: '4. Servicios & Presupuesto', icon: DollarSign },
          { num: 5, label: '5. Fotos & Firma Digital', icon: Camera },
        ].map((s) => {
          const Icon = s.icon;
          const isDone = step > s.num;
          const isCurrent = step === s.num;
          return (
            <div
              key={s.num}
              onClick={() => setStep(s.num as any)}
              className={`flex items-center gap-2 cursor-pointer transition-all px-3 py-1.5 rounded-full ${
                isCurrent
                  ? 'bg-[#00E5FF] text-black font-bold font-display shadow-lg'
                  : isDone
                  ? 'text-cyan-400 font-mono text-xs'
                  : 'text-slate-500 font-mono text-xs'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="whitespace-nowrap">{s.label}</span>
            </div>
          );
        })}
      </div>

      {/* STEP 1: CUSTOMER & VEHICLE DATA */}
      {step === 1 && (
        <div className="nike-card p-6 flex flex-col gap-6 animate-in fade-in">
          <div className="border-b border-white/10 pb-4">
            <h2 className="font-display text-3xl text-white">PASO 1: DATOS DEL CLIENTE Y VEHÍCULO</h2>
            <p className="text-xs text-slate-400">Ingresa la información básica para aperturear la ODS.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Information */}
            <div className="flex flex-col gap-3 p-4 rounded-xl bg-black/40 border border-white/5">
              <span className="font-display text-lg text-[#00E5FF]">DATOS DEL CLIENTE</span>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Nombre Completo *</label>
                <input
                  type="text"
                  placeholder="Ej. Gustavo Cisneros"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#00E5FF] outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Cédula / Documento ID *</label>
                <input
                  type="text"
                  placeholder="Ej. V-14892011"
                  value={documentId}
                  onChange={(e) => setDocumentId(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#00E5FF] outline-none font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Teléfono Móvil (WhatsApp) *</label>
                <input
                  type="text"
                  placeholder="Ej. +58 414-9982311"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#00E5FF] outline-none font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Correo Electrónico</label>
                <input
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#00E5FF] outline-none"
                />
              </div>
            </div>

            {/* Vehicle Information */}
            <div className="flex flex-col gap-3 p-4 rounded-xl bg-black/40 border border-white/5">
              <span className="font-display text-lg text-[#00E5FF]">DATOS DEL VEHÍCULO</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Placa *</label>
                  <input
                    type="text"
                    placeholder="Ej. AA991GT"
                    value={plate}
                    onChange={(e) => setPlate(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#00E5FF] outline-none font-mono font-bold uppercase"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Año</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#00E5FF] outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Marca *</label>
                  <input
                    type="text"
                    placeholder="Ej. Porsche / BMW"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#00E5FF] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Modelo *</label>
                  <input
                    type="text"
                    placeholder="Ej. 911 GT3 RS"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#00E5FF] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Color</label>
                  <input
                    type="text"
                    placeholder="Ej. Gris Nardo / Negro"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#00E5FF] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">VIN / Chasis</label>
                  <input
                    type="text"
                    placeholder="WP0ZZZ..."
                    value={vin}
                    onChange={(e) => setVin(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#00E5FF] outline-none font-mono text-xs uppercase"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sección Responsable del Trabajo */}
          <div className="p-4 rounded-xl bg-black/40 border border-[#00E5FF]/20 flex flex-col gap-4">
            <span className="font-display text-lg text-[#00E5FF] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              RESPONSABLE DEL TRABAJO
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Agente que recibe */}
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Agente que Recibe *</label>
                <select
                  value={receptionAgent}
                  onChange={(e) => setReceptionAgent(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#00E5FF] outline-none"
                >
                  {receptionAgents.map((a) => (
                    <option key={a.id} value={a.name}>{a.name}</option>
                  ))}
                </select>
              </div>

              {/* Técnico asignado */}
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Técnico Asignado</label>
                <select
                  value={assignedTechnicianId}
                  onChange={(e) => setAssignedTechnicianId(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#00E5FF] outline-none"
                >
                  <option value="">— Sin asignar aún —</option>
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} {t.role ? `(${t.role})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Prioridad */}
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Nivel de Prioridad</label>
                <div className="flex gap-2">
                  {(['normal', 'urgente', 'vip'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriorityLevel(p)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold font-mono uppercase transition-all border ${
                        priorityLevel === p
                          ? p === 'vip'
                            ? 'bg-yellow-500/20 border-yellow-400 text-yellow-300'
                            : p === 'urgente'
                            ? 'bg-red-500/20 border-red-400 text-red-300'
                            : 'bg-[#00E5FF]/20 border-[#00E5FF] text-[#00E5FF]'
                          : 'bg-transparent border-white/10 text-slate-500'
                      }`}
                    >
                      {p === 'vip' ? '⭐ VIP' : p === 'urgente' ? '🔴 Urgente' : '🔵 Normal'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Mostrar técnico seleccionado */}
            {assignedTechnicianId && (() => {
              const tech = technicians.find((t) => t.id === assignedTechnicianId);
              return tech ? (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#00E5FF]/5 border border-[#00E5FF]/20">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-display text-sm text-black">
                    {tech.avatar || 'T'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{tech.name}</p>
                    <p className="text-xs text-slate-400">{tech.role || 'Técnico'}</p>
                  </div>
                  <span className="ml-auto text-xs text-[#00E5FF] font-mono">ASIGNADO ✔</span>
                </div>
              ) : null;
            })()}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-white/10">
            <button onClick={onCancel} className="btn-nike-secondary text-sm">
              Cancelar
            </button>
            <button onClick={() => setStep(2)} className="btn-nike-primary text-sm">
              Siguiente: Inspección 360° <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: 360° INSPECTION CANVAS */}
      {step === 2 && (
        <div className="flex flex-col gap-4 animate-in fade-in">
          <VehicleDiagram360
            markers={damageMarkers}
            onAddMarker={(newMarker) =>
              setDamageMarkers([...damageMarkers, { ...newMarker, id: `dm-${Date.now()}` }])
            }
            onRemoveMarker={(id) => setDamageMarkers(damageMarkers.filter((m) => m.id !== id))}
          />

          <div className="nike-card p-4 flex justify-between items-center">
            <button onClick={() => setStep(1)} className="btn-nike-secondary text-sm">
              <ArrowLeft className="w-4 h-4" /> Anterior
            </button>
            <button onClick={() => setStep(3)} className="btn-nike-primary text-sm">
              Siguiente: Checklist 16 Puntos <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: CHECKLIST & BELONGINGS */}
      {step === 3 && (
        <div className="nike-card p-6 flex flex-col gap-6 animate-in fade-in">
          <div>
            <h2 className="font-display text-3xl text-white">PASO 3: CHECKLIST OBLIGATORIO Y PERTENENCIAS</h2>
            <p className="text-xs text-slate-400">Verificación puntual del vehículo antes de ingresar al taller.</p>
          </div>

          {/* Belongings */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-3">
            <span className="font-display text-lg text-[#00E5FF]">PERTENENCIAS EN EL VEHÍCULO</span>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ej. Control de garage, anteojos de sol..."
                value={belongingsInput}
                onChange={(e) => setBelongingsInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddBelonging()}
                className="flex-1 bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#00E5FF] outline-none"
              />
              <button onClick={handleAddBelonging} className="btn-nike-secondary text-xs">
                <Plus className="w-4 h-4" /> Agregar
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {belongingsList.map((item, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full bg-slate-800 border border-white/10 text-xs text-white flex items-center gap-2"
                >
                  {item}
                  <button onClick={() => handleRemoveBelonging(idx)} className="text-red-400 hover:text-red-300">
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* 16-Point Mandatory Checklist Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {checklist.map((item) => (
              <div key={item.id} className="p-3 rounded-xl bg-black/30 border border-white/5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{item.label}</span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { val: 'ok', label: 'Correcto', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
                    { val: 'damaged', label: 'Dañado', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
                    { val: 'missing', label: 'No Posee', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
                    { val: 'observation', label: 'Observ.', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
                  ].map((btn) => (
                    <button
                      key={btn.val}
                      onClick={() =>
                        setChecklist(
                          checklist.map((c) => (c.id === item.id ? { ...c, condition: btn.val as any } : c))
                        )
                      }
                      className={`py-1 rounded text-[10px] font-display uppercase tracking-wider border transition-all ${
                        item.condition === btn.val
                          ? `${btn.color} font-bold shadow-md`
                          : 'bg-slate-900/60 text-slate-500 border-white/5 hover:text-slate-300'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-white/10">
            <button onClick={() => setStep(2)} className="btn-nike-secondary text-sm">
              <ArrowLeft className="w-4 h-4" /> Anterior
            </button>
            <button onClick={() => setStep(4)} className="btn-nike-primary text-sm">
              Siguiente: Presupuesto & Servicios <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: SERVICES & PRESUPUESTO */}
      {step === 4 && (
        <div className="nike-card p-6 flex flex-col gap-6 animate-in fade-in">
          <div>
            <h2 className="font-display text-3xl text-white">PASO 4: SELECCIÓN DE SERVICIOS Y PRESUPUESTO</h2>
            <p className="text-xs text-slate-400">Selecciona los servicios requeridos para este vehículo.</p>
          </div>

          {/* Catalog Services Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {mockServicesCatalog.map((service) => (
              <div
                key={service.id}
                className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between gap-3 hover:border-cyan-500/40 transition-all"
              >
                <div>
                  <span className="text-[10px] font-mono text-[#00E5FF] uppercase">{service.category}</span>
                  <div className="font-bold text-white text-xs">{service.name}</div>
                  <div className="text-[10px] text-slate-400">Aproximado: {service.estimatedHours} horas de taller</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-white text-sm">${service.price}</span>
                  <button onClick={() => handleAddService(service.id)} className="btn-nike-primary text-xs py-1.5 px-3">
                    + Agregar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Presupuesto Summary */}
          {selectedServices.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/30 flex flex-col gap-3">
              <span className="font-display text-xl text-white">RESUMEN DEL PRESUPUESTO</span>
              <div className="divide-y divide-white/5">
                {selectedServices.map((s) => (
                  <div key={s.serviceId} className="py-2 flex items-center justify-between text-xs">
                    <span className="text-white font-medium">{s.serviceName}</span>
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-slate-400 font-bold">${s.unitPrice}</span>
                      <button onClick={() => handleRemoveService(s.serviceId)} className="text-red-400 hover:text-red-300">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/10 pt-3 flex items-center justify-between font-display text-2xl text-[#00E5FF]">
                <span>TOTAL ESTIMADO:</span>
                <span className="font-mono">${subtotal}</span>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-white/10">
            <button onClick={() => setStep(3)} className="btn-nike-secondary text-sm">
              <ArrowLeft className="w-4 h-4" /> Anterior
            </button>
            <button onClick={() => setStep(5)} className="btn-nike-primary text-sm">
              Siguiente: Fotos & Firma Digital <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: PHOTOS & DIGITAL SIGNATURE */}
      {step === 5 && (
        <div className="nike-card p-6 flex flex-col gap-6 animate-in fade-in">
          <div>
            <h2 className="font-display text-3xl text-white">PASO 5: FOTOGRAFÍAS Y FIRMA DE CONFORMIDAD</h2>
            <p className="text-xs text-slate-400">Verifica las evidencias y captura la firma del cliente.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Photos */}
            <div className="flex flex-col gap-3">
              <span className="font-display text-lg text-[#00E5FF]">EVIDENCIAS FOTOGRÁFICAS</span>
              <div className="grid grid-cols-1 gap-3">
                {photos.map((p, idx) => (
                  <div key={idx} className="relative rounded-xl overflow-hidden border border-white/10 aspect-video group">
                    <img src={p.url} alt={p.caption} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 flex flex-col justify-end">
                      <span className="font-mono text-[10px] text-[#00E5FF] uppercase">{p.category}</span>
                      <span className="text-xs font-bold text-white">{p.caption}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Digital Signature Canvas */}
            <div className="flex flex-col gap-3">
              <SignatureCanvas onSaveSignature={setClientSignature} />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#00E5FF]/10 border border-cyan-500/30 flex items-center gap-4">
            <CheckCircle className="w-8 h-8 text-[#00E5FF] shrink-0" />
            <div>
              <div className="font-display text-lg text-white">LISTO PARA REGISTRAR EN EL TALLER</div>
              <div className="text-xs text-slate-300">
                La ODS se guardará en estado <strong>RECIBIDO</strong> y aparecerá en el tablero en tiempo real.
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-white/10">
            <button onClick={() => setStep(4)} className="btn-nike-secondary text-sm">
              <ArrowLeft className="w-4 h-4" /> Anterior
            </button>
            <button onClick={handleCompleteODS} className="btn-nike-primary text-base py-3 px-8 shadow-2xl">
              <CheckCircle2 className="w-5 h-5" /> GENERAR ORDEN DE SERVICIO OFICIAL
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
