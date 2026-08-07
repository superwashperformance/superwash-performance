import React, { useState, useRef } from 'react';
import { ServiceOrder, ChecklistItem, DamageMarker, PresupuestoServiceItem, Agent, ServiceItem, Customer, Vehicle } from '../../types';
import { SignatureCanvas } from '../common/SignatureCanvas';
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
  Search,
  UserCheck,
  X,
  Image as ImageIcon,
  FileText,
} from 'lucide-react';

interface ODSCreateViewProps {
  onSaveODS: (ods: ServiceOrder) => void;
  onCancel: () => void;
  technicians: Agent[];
  receptionAgents: Agent[];
  servicesCatalog: ServiceItem[];
  customers?: Customer[];
  vehicles?: Vehicle[];
  orders?: ServiceOrder[];
  onAddCustomer?: (customer: Customer) => void;
  onAddVehicle?: (vehicle: Vehicle) => void;
  onAddCustomService?: (service: ServiceItem) => void;
}

export const ODSCreateView: React.FC<ODSCreateViewProps> = ({
  onSaveODS,
  onCancel,
  technicians,
  receptionAgents,
  servicesCatalog,
  customers = [],
  vehicles = [],
  orders = [],
  onAddCustomer,
  onAddVehicle,
  onAddCustomService,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Selected customer & vehicle IDs
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');

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
  const [mileage, setMileage] = useState('');
  const [observations, setObservations] = useState('');

  // In-situ Modals
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [showAddCustomServiceModal, setShowAddCustomServiceModal] = useState(false);

  // Commercial Sales Condition State
  const [paymentCondition, setPaymentCondition] = useState<'CONTADO' | 'CTA_CTE'>('CONTADO');
  const [initialPaidAmount, setInitialPaidAmount] = useState<number>(0);

  // Custom Service Form State
  const [customServiceName, setCustomServiceName] = useState('');
  const [customServiceCategory, setCustomServiceCategory] = useState<any>('Detailing');
  const [customServicePrice, setCustomServicePrice] = useState<number>(0);
  const [customServiceHours, setCustomServiceHours] = useState<number>(1);

  // New Customer Form State
  const [newCustName, setNewCustName] = useState('');
  const [newCustDoc, setNewCustDoc] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');

  // New Vehicle Form State
  const [newVehPlate, setNewVehPlate] = useState('');
  const [newVehBrand, setNewVehBrand] = useState('');
  const [newVehModel, setNewVehModel] = useState('');
  const [newVehYear, setNewVehYear] = useState<number>(new Date().getFullYear());
  const [newVehColor, setNewVehColor] = useState('');
  const [newVehVin, setNewVehVin] = useState('');
  const [newVehMileage, setNewVehMileage] = useState('');

  // Step 1: Responsables
  const [receptionAgent, setReceptionAgent] = useState(receptionAgents.length > 0 ? receptionAgents[0].name : '');
  const [assignedTechnicianId, setAssignedTechnicianId] = useState('');
  const [priorityLevel, setPriorityLevel] = useState<'normal' | 'urgente' | 'vip'>('normal');

  // Step 2: 360° Damage Markers
  const [damageMarkers, setDamageMarkers] = useState<DamageMarker[]>([]);

  // Step 3: 20-Point Checklist & Belongings
  const defaultChecklist: ChecklistItem[] = [
    { id: 'chk-1', key: 'bateria', label: 'Batería y Carga de Voltaje', condition: 'ok' },
    { id: 'chk-2', key: 'luces_internas', label: 'Luces Internas y de Ambiente', condition: 'ok' },
    { id: 'chk-3', key: 'luces_externas', label: 'Luces Externas / Faros', condition: 'ok' },
    { id: 'chk-4', key: 'luces_tablero', label: 'Indicadores de Tablero / Alertas', condition: 'ok' },
    { id: 'chk-5', key: 'aire_acondicionado', label: 'Aire Acondicionado', condition: 'ok' },
    { id: 'chk-6', key: 'bocina', label: 'Bocina / Claxon', condition: 'ok' },
    { id: 'chk-7', key: 'alfombras', label: 'Alfombras de Habitáculo', condition: 'ok' },
    { id: 'chk-8', key: 'limpiaparabrisas', label: 'Limpiaparabrisas / Plumas', condition: 'ok' },
    { id: 'chk-9', key: 'caucho_repuesto', label: 'Caucho de Repuesto', condition: 'ok' },
    { id: 'chk-10', key: 'gato_hidraulico', label: 'Gato Hidráulico', condition: 'ok' },
    { id: 'chk-11', key: 'triangulo', label: 'Triángulo de Seguridad', condition: 'ok' },
    { id: 'chk-12', key: 'estereo', label: 'Estéreo / Multimedia', condition: 'ok' },
    { id: 'chk-13', key: 'rociadores', label: 'Rociadores de Agua', condition: 'ok' },
    { id: 'chk-14', key: 'ventanas', label: 'Ventanas y Elevalunas', condition: 'ok' },
    { id: 'chk-15', key: 'parabrisas', label: 'Parabrisas Frontal y Trasero', condition: 'ok' },
    { id: 'chk-16', key: 'tuercas', label: 'Tuercas de Rines / Seguridad', condition: 'ok' },
    { id: 'chk-17', key: 'manillas', label: 'Manillas de Puertas', condition: 'ok' },
    { id: 'chk-18', key: 'puertas', label: 'Puertas y Capó', condition: 'ok' },
    { id: 'chk-19', key: 'accesorios', label: 'Accesorios Especiales / Cámaras', condition: 'ok' },
    { id: 'chk-20', key: 'otros', label: 'Otros Detalles Mecánicos / Escape', condition: 'ok' },
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

  const [uploadCategory, setUploadCategory] = useState<'general' | 'damage_front' | 'damage_rear' | 'damage_left' | 'damage_right' | 'belonging'>('general');

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const newPhoto = {
        url: reader.result as string,
        caption: file.name,
        category: uploadCategory,
      };
      
      const placeholderUrl = 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=800&auto=format&fit=crop';
      
      setPhotos(prevPhotos => {
        if (uploadCategory === 'general' && prevPhotos.some(p => p.url === placeholderUrl)) {
          return [newPhoto, ...prevPhotos.filter(p => p.url !== placeholderUrl)];
        }
        return [...prevPhotos, newPhoto];
      });

      if (galleryInputRef.current) galleryInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    setPhotos(photos.filter((_, idx) => idx !== indexToRemove));
  };

  const triggerGalleryUpload = (category: typeof uploadCategory) => {
    setUploadCategory(category);
    setTimeout(() => {
      galleryInputRef.current?.click();
    }, 50);
  };

  const triggerCameraUpload = (category: typeof uploadCategory) => {
    setUploadCategory(category);
    setTimeout(() => {
      cameraInputRef.current?.click();
    }, 50);
  };

  const handleAddBelonging = () => {
    if (!belongingsInput.trim()) return;
    setBelongingsList([...belongingsList, belongingsInput.trim()]);
    setBelongingsInput('');
  };

  const handleRemoveBelonging = (index: number) => {
    setBelongingsList(belongingsList.filter((_, i) => i !== index));
  };

  const handleSaveAndAddCustomService = () => {
    if (!customServiceName.trim()) {
      alert('Por favor escribe el nombre del servicio adicional.');
      return;
    }

    const newService: ServiceItem = {
      id: `svc-${Date.now()}`,
      name: customServiceName.trim(),
      category: customServiceCategory,
      price: customServicePrice || 0,
      estimatedHours: customServiceHours || 1,
      assignedRole: 'sales',
    };

    if (onAddCustomService) {
      onAddCustomService(newService);
    } else {
      servicesCatalog.push(newService);
    }

    const newPresupuestoItem: PresupuestoServiceItem = {
      serviceId: newService.id,
      serviceName: newService.name,
      category: newService.category,
      unitPrice: newService.price,
      quantity: 1,
      totalPrice: newService.price,
    };

    setSelectedServices((prev) => [...prev, newPresupuestoItem]);

    setCustomServiceName('');
    setCustomServicePrice(0);
    setCustomServiceHours(1);
    setShowAddCustomServiceModal(false);
  };

  const handleAddService = (serviceId: string) => {
    const catalogItem = servicesCatalog.find((s) => s.id === serviceId);
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

  const handleUpdateService = (serviceId: string, updates: Partial<PresupuestoServiceItem>) => {
    setSelectedServices(
      selectedServices.map((s) =>
        s.serviceId === serviceId
          ? {
              ...s,
              ...updates,
              totalPrice: (updates.unitPrice ?? s.unitPrice) * (updates.quantity ?? s.quantity),
            }
          : s
      )
    );
  };

  const subtotalAmount = selectedServices.reduce((sum, s) => sum + s.totalPrice, 0);

  const handleFinalSave = () => {
    if (!customerName || !documentId || !phone || !plate || !brand || !model) {
      alert('Por favor completa todos los datos obligatorios del cliente y del vehículo.');
      return;
    }

    const finalPaid = paymentCondition === 'CONTADO' ? subtotalAmount : initialPaidAmount;
    const finalPending = Math.max(0, subtotalAmount - finalPaid);

    const newODS: ServiceOrder = {
      id: `ods-${Date.now()}`,
      orderNumber: `ODS-${1000 + (orders?.length || 0) + 1}`,
      customerId: selectedCustomerId || `cust-${Date.now()}`,
      customerName,
      customerPhone: phone,
      vehicleId: selectedVehicleId || `veh-${Date.now()}`,
      vehiclePlate: plate.toUpperCase(),
      vehicleBrandModel: `${brand} ${model}`,
      vehicleColor: color,
      vehicleYear: year,
      branchName: 'Sede Principal (Las Mercedes)',
      receptionAgent: receptionAgent || 'Recepción',
      assignedTechnician: assignedTechnicianId || undefined,
      priority: priorityLevel,
      status: 'received',
      entryDate: new Date().toLocaleString('es-ES'),
      observations,
      belongingsList,
      checklist,
      damageMarkers,
      photos: photos.map((p, i) => ({
        id: `ph-${Date.now()}-${i}`,
        photoUrl: p.url,
        caption: p.caption,
        category: p.category,
        createdAt: new Date().toLocaleTimeString(),
      })),
      services: selectedServices,
      subtotalAmount,
      taxAmount: 0,
      totalAmount: subtotalAmount,
      paidAmount: finalPaid,
      paymentCondition,
      pendingBalance: finalPending,
      statusHistory: [
        {
          status: 'received',
          changedAt: new Date().toLocaleString(),
          changedBy: receptionAgent || 'Recepción Patio',
        },
      ],
    };

    onSaveODS(newODS);
  };

  const changeStep = (nextStep: 1 | 2 | 3 | 4 | 5) => {
    setStep(nextStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCustomer = (custId: string) => {
    setSelectedCustomerId(custId);
    const cust = customers.find((c) => c.id === custId);
    if (cust) {
      setCustomerName(cust.fullName);
      setDocumentId(cust.documentId);
      setPhone(cust.phone);
      setEmail(cust.email || '');
      if (cust.defaultPaymentCondition) {
        setPaymentCondition(cust.defaultPaymentCondition);
        if (cust.defaultPaymentCondition === 'CTA_CTE') {
          setInitialPaidAmount(0);
        }
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-5xl mx-auto w-full">
      {/* Global Hidden File Inputs for Gallery and Direct Camera */}
      <input type="file" accept="image/*" className="hidden" ref={galleryInputRef} onChange={handleFileUpload} />
      <input type="file" accept="image/*" capture="environment" className="hidden" ref={cameraInputRef} onChange={handleFileUpload} />
      {/* Wizard Step Progress Indicator */}
      <div className="nike-card p-4 flex items-center justify-between overflow-x-auto gap-2">
        {[
          { num: 1, label: '1. Cliente y Vehículo', icon: User },
          { num: 2, label: '2. Fotos Daños', icon: Camera },
          { num: 3, label: '3. Checklist (20 Puntos)', icon: ClipboardCheck },
          { num: 4, label: '4. Servicios & Presupuesto', icon: DollarSign },
          { num: 5, label: '5. Fotos & Firma Digital', icon: Camera },
        ].map((s) => {
          const Icon = s.icon;
          const isDone = step > s.num;
          const isCurrent = step === s.num;
          return (
            <div
              key={s.num}
              onClick={() => changeStep(s.num as any)}
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
            <p className="text-xs text-slate-400">Selecciona o crea el cliente y haz clic en la tarjeta de su vehículo para cargar sus datos automáticamente.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Section */}
            <div className="flex flex-col gap-4 p-5 rounded-xl bg-black/40 border border-white/5">
              <div className="flex items-center justify-between">
                <span className="font-display text-lg text-[#00E5FF]">1. CLIENTE</span>
                <button
                  type="button"
                  onClick={() => {
                    setNewCustName('');
                    setNewCustDoc('');
                    setNewCustPhone('');
                    setNewCustEmail('');
                    setShowAddCustomerModal(true);
                  }}
                  className="text-xs font-mono font-bold text-[#00E5FF] hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Crear Nuevo Cliente
                </button>
              </div>

              {/* Customer Search / Select */}
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Buscar o Seleccionar Cliente del Directorio</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => handleSelectCustomer(e.target.value)}
                  className="w-full bg-slate-900 border border-cyan-500/30 rounded-lg px-3 py-2.5 text-sm text-white focus:border-[#00E5FF] outline-none font-medium"
                >
                  <option value="" disabled>-- Selecciona un cliente del directorio --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} — {c.documentId} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/5">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Nombre Completo *</label>
                  <input
                    type="text"
                    placeholder="Ej. Gustavo Cisneros"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#00E5FF] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Cédula / Documento ID *</label>
                  <input
                    type="text"
                    placeholder="Ej. V-14892011"
                    value={documentId}
                    onChange={(e) => setDocumentId(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#00E5FF] outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Teléfono (WhatsApp) *</label>
                  <input
                    type="text"
                    placeholder="Ej. +58 414-9982311"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#00E5FF] outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Correo Electrónico</label>
                  <input
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#00E5FF] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Vehicle Section */}
            <div className="flex flex-col gap-4 p-5 rounded-xl bg-black/40 border border-white/5">
              <div className="flex items-center justify-between">
                <span className="font-display text-lg text-[#00E5FF]">2. SELECCIÓN DE VEHÍCULO</span>
                <button
                  type="button"
                  onClick={() => {
                    setNewVehPlate('');
                    setNewVehBrand('');
                    setNewVehModel('');
                    setNewVehYear(new Date().getFullYear());
                    setNewVehColor('');
                    setNewVehVin('');
                    setNewVehMileage('');
                    setShowAddVehicleModal(true);
                  }}
                  className="text-xs font-mono font-bold text-[#00E5FF] hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Registrar Vehículo
                </button>
              </div>

              {/* Customer Vehicles Cards List */}
              {selectedCustomerId ? (
                (() => {
                  const custVehs = vehicles.filter((v) => v.customerId === selectedCustomerId);
                  if (custVehs.length === 0) {
                    return (
                      <div className="p-4 rounded-xl bg-slate-900/60 border border-dashed border-white/10 text-center flex flex-col items-center gap-2">
                        <Car className="w-8 h-8 text-slate-600" />
                        <p className="text-xs text-slate-400">Este cliente aún no posee vehículos registrados.</p>
                        <button
                          type="button"
                          onClick={() => {
                            setNewVehPlate('');
                            setNewVehBrand('');
                            setNewVehModel('');
                            setNewVehYear(new Date().getFullYear());
                            setNewVehColor('');
                            setNewVehVin('');
                            setNewVehMileage('');
                            setShowAddVehicleModal(true);
                          }}
                          className="btn-nike-secondary text-xs py-1.5 px-3 flex items-center gap-1 mt-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Registrar Vehículo
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                      <span className="text-[10px] font-mono text-slate-400 uppercase">Vehículos Asociados (Haz clic para elegir):</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {custVehs.map((v) => {
                          const isSelected = selectedVehicleId === v.id || plate.toUpperCase() === v.plate.toUpperCase();
                          const pastOrder = orders.find((o) => o.vehiclePlate === v.plate || o.vehicleId === v.id);
                          const lastVisit = v.lastVisit || pastOrder?.entryDate || 'Sin visitas previas';
                          const lastService = v.lastService || pastOrder?.services.map((s) => s.serviceName).join(', ') || 'N/A';

                          return (
                            <div
                              key={v.id}
                              onClick={() => {
                                setSelectedVehicleId(v.id);
                                setPlate(v.plate);
                                setBrand(v.brand);
                                setModel(v.model);
                                setYear(v.year);
                                setColor(v.color);
                                setVin(v.vin || '');
                                setMileage(v.mileage || '');
                              }}
                              className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 relative overflow-hidden ${
                                isSelected
                                  ? 'bg-[#00E5FF]/10 border-[#00E5FF] shadow-lg shadow-cyan-500/10 ring-1 ring-[#00E5FF]'
                                  : 'bg-slate-900/80 border-white/10 hover:border-white/30'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-white text-xs">{v.brand} {v.model}</span>
                                <span className="font-mono text-[10px] text-[#00E5FF] font-bold">{v.plate}</span>
                              </div>

                              <div className="text-[10px] text-slate-400 font-mono flex flex-col gap-0.5">
                                <div>Año: <span className="text-white">{v.year}</span> | Color: <span className="text-white">{v.color}</span></div>
                                <div>VIN: <span className="text-slate-300">{v.vin || 'N/A'}</span></div>
                                <div>Km Registrado: <span className="text-slate-300">{v.mileage || 'Por ingresar'}</span></div>
                                <div className="truncate">Última Visita: <span className="text-cyan-400">{lastVisit}</span></div>
                                <div className="truncate">Último Servicio: <span className="text-slate-300">{lastService}</span></div>
                              </div>

                              {isSelected && (
                                <span className="absolute top-1 right-1 text-[#00E5FF]">
                                  <CheckCircle className="w-3.5 h-3.5 fill-[#00E5FF] text-black" />
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()
              ) : (
                <p className="text-xs text-slate-500 italic">Selecciona primero un cliente para ver sus vehículos.</p>
              )}

              {/* Form Fields for Vehicle */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Placa *</label>
                  <input
                    type="text"
                    placeholder="Ej. AA991GT"
                    value={plate}
                    onChange={(e) => setPlate(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#00E5FF] outline-none font-mono font-bold uppercase"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Año</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#00E5FF] outline-none font-mono"
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
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#00E5FF] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Modelo *</label>
                  <input
                    type="text"
                    placeholder="Ej. 911 GT3 RS"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#00E5FF] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Color</label>
                  <input
                    type="text"
                    placeholder="Ej. Negro"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#00E5FF] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">VIN / Chasis</label>
                  <input
                    type="text"
                    placeholder="Opcional"
                    value={vin}
                    onChange={(e) => setVin(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#00E5FF] outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Kilometraje</label>
                  <input
                    type="text"
                    placeholder="Ej. 45.200 km"
                    value={mileage}
                    onChange={(e) => setMileage(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#00E5FF] outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center pt-4 border-t border-white/10">
            <button onClick={onCancel} className="btn-nike-secondary text-sm">
              Cancelar
            </button>
            <button onClick={() => changeStep(2)} className="btn-nike-primary text-sm">
              Siguiente: Fotos Daños <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: DAMAGES PHOTOS */}
      {step === 2 && (
        <div className="nike-card p-6 flex flex-col gap-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 className="font-display text-3xl text-white">PASO 2: FOTO DE DAÑOS Y ESTADO</h2>
              <p className="text-xs text-slate-400">
                Selecciona la fuente para adjuntar la foto del vehículo: tómala directamente con la cámara del teléfono o elígela desde tus imágenes guardadas.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => triggerCameraUpload('damage_front')}
                className="btn-nike-primary text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-lg shadow-[#00E5FF]/20"
              >
                <Camera className="w-4 h-4" />
                <span>Tomar con Cámara</span>
              </button>

              <button
                type="button"
                onClick={() => triggerGalleryUpload('damage_front')}
                className="btn-nike-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 border border-white/20 hover:border-[#00E5FF]"
              >
                <ImageIcon className="w-4 h-4 text-[#00E5FF]" />
                <span>Imágenes Guardadas</span>
              </button>
            </div>
          </div>

          {photos.filter((p) => p && p.category && String(p.category).startsWith('damage')).length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {photos
                .filter((p) => p && p.category && String(p.category).startsWith('damage'))
                .map((p, idx) => (
                  <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-white/10 group bg-black">
                    <img src={p.url} alt="Foto de Daño" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotos(photos.filter((img) => img.url !== p.url))}
                      className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white p-1.5 rounded-lg opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Eliminar foto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
            </div>
          ) : (
            <div className="min-h-[220px] w-full border border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center gap-4 p-8 bg-black/30 text-center">
              <p className="text-sm font-bold text-white">Sin foto de daños registrada</p>
              <p className="text-xs text-slate-400 -mt-2">
                Selecciona cómo deseas adjuntar la fotografía del vehículo:
              </p>
              
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => triggerCameraUpload('damage_front')}
                  className="btn-nike-primary text-xs py-2.5 px-4 flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>Abrir Cámara del Teléfono</span>
                </button>

                <button
                  type="button"
                  onClick={() => triggerGalleryUpload('damage_front')}
                  className="btn-nike-secondary text-xs py-2.5 px-4 flex items-center gap-2 border border-white/20"
                >
                  <ImageIcon className="w-4 h-4 text-[#00E5FF]" />
                  <span>Elegir de Imágenes Guardadas</span>
                </button>
              </div>
            </div>
          )}

          {/* OBSERVACIONES Y NOTAS DE DAÑOS */}
          <div className="flex flex-col gap-2 pt-4 border-t border-white/10 mt-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#00E5FF]" /> Observaciones y Detalle de Daños / Novedades
            </label>
            <textarea
              rows={3}
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Escribe aquí cualquier rayón, abolladura, detalle de pintura u observación previa del vehículo..."
              className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-slate-500 focus:border-[#00E5FF] outline-none resize-none font-sans"
            />
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-white/10">
            <button onClick={() => changeStep(1)} className="btn-nike-secondary text-sm">
              <ArrowLeft className="w-4 h-4" /> Anterior
            </button>
            <button onClick={() => changeStep(3)} className="btn-nike-primary text-sm">
              Siguiente: Checklist 20 Puntos <ArrowRight className="w-4 h-4" />
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

          {/* Belongings & Belonging Photos Section */}
          <div className="p-5 rounded-2xl bg-black/40 border border-white/10 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <span className="font-display text-lg text-[#00E5FF]">PERTENENCIAS Y OBJETOS EN EL VEHÍCULO</span>
                <p className="text-xs text-slate-400">Registra pertenecencias en texto o adjunta fotografías de los objetos dejados dentro del vehículo.</p>
              </div>

              {/* Dual Upload Buttons for Belongings */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => triggerCameraUpload('belonging')}
                  className="btn-nike-primary text-xs py-1.5 px-3 flex items-center gap-1.5 shadow-lg shadow-[#00E5FF]/20"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Tomar Foto Pertenencia</span>
                </button>
                <button
                  type="button"
                  onClick={() => triggerGalleryUpload('belonging')}
                  className="btn-nike-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 border border-white/20 hover:border-[#00E5FF]"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span>Galería</span>
                </button>
              </div>
            </div>

            {/* Belonging Tags Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ej. Control de garage, anteojos de sol, laptop..."
                value={belongingsInput}
                onChange={(e) => setBelongingsInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddBelonging()}
                className="flex-1 bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#00E5FF] outline-none font-sans"
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

            {/* Display Uploaded Belongings Photos Grid */}
            {photos.filter((p) => p && p.category === 'belonging').length > 0 && (
              <div className="flex flex-col gap-2 pt-3 border-t border-white/5">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase">FOTOS DE PERTENENCIAS REGISTRADAS ({photos.filter((p) => p && p.category === 'belonging').length}):</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {photos
                    .filter((p) => p && p.category === 'belonging')
                    .map((p, idx) => (
                      <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-white/10 group bg-black">
                        <img src={p.url} alt="Foto Pertenencia" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setPhotos(photos.filter((img) => img.url !== p.url))}
                          className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white p-1 rounded-lg opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Eliminar foto de pertenencia"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 text-[10px] text-slate-300 font-mono truncate px-2">
                          {p.caption}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* 20-Point Mandatory Checklist Grid */}
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

                <div className="mt-1">
                  <input
                    type="text"
                    value={item.notes || ''}
                    onChange={(e) =>
                      setChecklist(
                        checklist.map((c) => (c.id === item.id ? { ...c, notes: e.target.value } : c))
                      )
                    }
                    placeholder="Escribir detalle / observación (opcional)..."
                    className="w-full bg-slate-900/90 border border-white/10 rounded-lg px-2.5 py-1 text-[11px] text-white placeholder:text-slate-500 outline-none focus:border-[#00E5FF] font-sans"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-white/10">
            <button onClick={() => setStep(2)} className="btn-nike-secondary text-sm">
              <ArrowLeft className="w-4 h-4" /> Anterior
            </button>
            <button onClick={() => setStep(4)} className="btn-nike-primary text-sm bg-[#00E5FF] hover:bg-cyan-400 text-black font-bold">
              Guardar Checklist y Continuar <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: SERVICES & PRESUPUESTO */}
      {step === 4 && (
        <div className="nike-card p-6 flex flex-col gap-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <h2 className="font-display text-3xl text-white">PASO 4: SELECCIÓN DE SERVICIOS Y PRESUPUESTO</h2>
              <p className="text-xs text-slate-400">Selecciona los servicios requeridos para este vehículo o agrega uno nuevo en caliente.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setCustomServiceName('');
                setCustomServicePrice(0);
                setCustomServiceHours(1);
                setShowAddCustomServiceModal(true);
              }}
              className="btn-nike-primary text-xs py-2 px-4 flex items-center gap-2 shrink-0 bg-[#00E5FF] hover:bg-cyan-400 text-black font-bold shadow-lg shadow-[#00E5FF]/20"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Crear Servicio Adicional</span>
            </button>
          </div>

          {/* Catalog Services Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {servicesCatalog.map((service) => (
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
                  <div key={s.serviceId} className="py-2 flex items-center justify-between text-xs gap-4">
                    <input
                      type="text"
                      value={s.serviceName}
                      onChange={(e) => handleUpdateService(s.serviceId, { serviceName: e.target.value })}
                      className="flex-1 bg-black/30 border border-white/5 rounded px-2 py-1 text-white focus:border-[#00E5FF] outline-none"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-mono">$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={s.unitPrice}
                        onChange={(e) => handleUpdateService(s.serviceId, { unitPrice: Number(e.target.value) })}
                        className="w-20 bg-black/30 border border-white/5 rounded px-2 py-1 text-white font-mono focus:border-[#00E5FF] outline-none text-right"
                      />
                      <button onClick={() => handleRemoveService(s.serviceId)} className="text-red-400 hover:text-red-300 ml-2">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/10 pt-3 flex items-center justify-between font-display text-2xl text-[#00E5FF]">
                <span>TOTAL ESTIMADO:</span>
                <span className="font-mono">${subtotalAmount}</span>
              </div>
            </div>
          )}

          {/* Condición Comercial Selector */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="font-display text-sm text-[#00E5FF] uppercase block">CONDICIÓN COMERCIAL DE VENTA</span>
              <p className="text-xs text-slate-400">Define si la venta es a Contado (cobro en caja) o a Cuenta Corriente (crédito al cliente).</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setPaymentCondition('CONTADO');
                  setInitialPaidAmount(subtotalAmount);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-display uppercase tracking-wider transition-all border ${
                  paymentCondition === 'CONTADO'
                    ? 'bg-emerald-500 text-black font-bold border-emerald-400 shadow-lg shadow-emerald-500/20'
                    : 'bg-slate-900/60 text-slate-400 border-white/10 hover:text-white'
                }`}
              >
                [ CONTADO ]
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentCondition('CTA_CTE');
                  setInitialPaidAmount(0);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-display uppercase tracking-wider transition-all border ${
                  paymentCondition === 'CTA_CTE'
                    ? 'bg-[#00E5FF] text-black font-bold border-cyan-400 shadow-lg shadow-cyan-500/20'
                    : 'bg-slate-900/60 text-slate-400 border-white/10 hover:text-white'
                }`}
              >
                [ CUENTA CORRIENTE ]
              </button>
            </div>
          </div>

          {paymentCondition === 'CTA_CTE' && (
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between text-xs">
              <span className="text-slate-300">Abono Inicial Inmediato (Opcional):</span>
              <div className="flex items-center gap-1">
                <span className="text-slate-400">$</span>
                <input
                  type="number"
                  min="0"
                  max={subtotalAmount}
                  value={initialPaidAmount}
                  onChange={(e) => setInitialPaidAmount(Math.min(subtotalAmount, Number(e.target.value)))}
                  className="w-24 bg-slate-900 border border-white/10 rounded px-2 py-1 text-right text-white font-mono outline-none focus:border-[#00E5FF]"
                />
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button 
                    type="button"
                    onClick={() => triggerCameraUpload('general')}
                    className="btn-nike-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5" /> <span>Cámara</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => triggerGalleryUpload('general')}
                    className="btn-nike-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 border border-white/20"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-[#00E5FF]" /> <span>Galería</span>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {photos.map((p, idx) => {
                  if (p.category !== 'general') return null;
                  return (
                    <div key={idx} className="relative rounded-xl overflow-hidden border border-white/10 aspect-video group">
                      <img src={p.url} alt={p.caption} className="w-full h-full object-cover" />
                      <button 
                        onClick={() => handleRemovePhoto(idx)}
                        className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 flex flex-col justify-end pointer-events-none">
                        <span className="font-mono text-[10px] text-[#00E5FF] uppercase">{p.category}</span>
                        <span className="text-xs font-bold text-white">{p.caption}</span>
                      </div>
                    </div>
                  );
                })}
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
            <button onClick={handleFinalSave} className="btn-nike-primary text-base py-3 px-8 shadow-2xl">
              <CheckCircle2 className="w-5 h-5" /> GENERAR ORDEN DE SERVICIO OFICIAL
            </button>
          </div>
        </div>
      )}

      {/* Modal: In-situ Add Customer */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="nike-card p-6 w-full max-w-md flex flex-col gap-4 border-white/20 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-display text-xl text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#00E5FF]" /> CREAR NUEVO CLIENTE
              </h3>
              <button onClick={() => setShowAddCustomerModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newCustName.trim() || !newCustDoc.trim() || !newCustPhone.trim()) return;

                const newCust: Customer = {
                  id: `cust-${Date.now()}`,
                  fullName: newCustName.trim(),
                  documentId: newCustDoc.trim(),
                  phone: newCustPhone.trim(),
                  email: newCustEmail.trim() || undefined,
                  createdAt: new Date().toLocaleDateString('es-ES'),
                };

                if (onAddCustomer) {
                  onAddCustomer(newCust);
                }

                setSelectedCustomerId(newCust.id);
                setCustomerName(newCust.fullName);
                setDocumentId(newCust.documentId);
                setPhone(newCust.phone);
                setEmail(newCust.email || '');

                setShowAddCustomerModal(false);
              }}
              className="flex flex-col gap-3"
            >
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Gustavo Cisneros"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#00E5FF] outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1 block">Cédula / Documento ID *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. V-18940293"
                  value={newCustDoc}
                  onChange={(e) => setNewCustDoc(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-[#00E5FF] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Teléfono Móvil *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. +58 412-1234567"
                    value={newCustPhone}
                    onChange={(e) => setNewCustPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-[#00E5FF] outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Correo Electrónico</label>
                  <input
                    type="email"
                    placeholder="cliente@email.com"
                    value={newCustEmail}
                    onChange={(e) => setNewCustEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#00E5FF] outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="flex-1 bg-transparent border border-white/20 text-white py-2.5 rounded-lg text-xs font-bold hover:bg-white/5 transition-colors uppercase tracking-wider"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#00E5FF] text-black py-2.5 rounded-lg text-xs font-bold hover:bg-cyan-400 transition-colors uppercase tracking-wider flex items-center justify-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" /> GUARDAR CLIENTE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: In-situ Add Vehicle */}
      {showAddVehicleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="nike-card p-6 w-full max-w-md flex flex-col gap-4 border-white/20 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-display text-xl text-white flex items-center gap-2">
                  <Car className="w-5 h-5 text-[#00E5FF]" /> REGISTRAR NUEVO VEHÍCULO
                </h3>
                {customerName && <p className="text-xs text-slate-400">Para: <strong className="text-white">{customerName}</strong></p>}
              </div>
              <button onClick={() => setShowAddVehicleModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newVehPlate.trim() || !newVehBrand.trim() || !newVehModel.trim()) return;

                const custId = selectedCustomerId || `cust-${Date.now()}`;

                const newVeh: Vehicle = {
                  id: `veh-${Date.now()}`,
                  customerId: custId,
                  plate: newVehPlate.trim().toUpperCase(),
                  brand: newVehBrand.trim(),
                  model: newVehModel.trim(),
                  year: newVehYear,
                  color: newVehColor.trim() || 'Desconocido',
                  vin: newVehVin.trim() || undefined,
                  mileage: newVehMileage.trim() || undefined,
                };

                if (onAddVehicle) {
                  onAddVehicle(newVeh);
                }

                setSelectedVehicleId(newVeh.id);
                setPlate(newVeh.plate);
                setBrand(newVeh.brand);
                setModel(newVeh.model);
                setYear(newVeh.year);
                setColor(newVeh.color);
                setVin(newVeh.vin || '');
                setMileage(newVeh.mileage || '');

                setShowAddVehicleModal(false);
              }}
              className="flex flex-col gap-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Placa / Matrícula *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. AB123CD"
                    value={newVehPlate}
                    onChange={(e) => setNewVehPlate(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono uppercase font-bold focus:border-[#00E5FF] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Año *</label>
                  <input
                    type="number"
                    required
                    value={newVehYear}
                    onChange={(e) => setNewVehYear(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-[#00E5FF] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Marca *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Toyota / Porsche"
                    value={newVehBrand}
                    onChange={(e) => setNewVehBrand(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#00E5FF] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Modelo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Corolla / 911"
                    value={newVehModel}
                    onChange={(e) => setNewVehModel(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#00E5FF] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Color</label>
                  <input
                    type="text"
                    placeholder="Ej. Negro"
                    value={newVehColor}
                    onChange={(e) => setNewVehColor(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#00E5FF] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">VIN / Chasis</label>
                  <input
                    type="text"
                    placeholder="Opcional"
                    value={newVehVin}
                    onChange={(e) => setNewVehVin(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-[#00E5FF] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Kilometraje</label>
                  <input
                    type="text"
                    placeholder="Ej. 45.000 km"
                    value={newVehMileage}
                    onChange={(e) => setNewVehMileage(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-[#00E5FF] outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddVehicleModal(false)}
                  className="flex-1 bg-transparent border border-white/20 text-white py-2.5 rounded-lg text-xs font-bold hover:bg-white/5 transition-colors uppercase tracking-wider"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#00E5FF] text-black py-2.5 rounded-lg text-xs font-bold hover:bg-cyan-400 transition-colors uppercase tracking-wider flex items-center justify-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" /> GUARDAR VEHÍCULO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal: Crear Servicio Adicional en caliente */}
      {showAddCustomServiceModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="nike-card p-6 w-full max-w-md flex flex-col gap-4 border-cyan-500/40 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-display text-xl text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#00E5FF]" /> CREAR SERVICIO ADICIONAL
              </h3>
              <button
                type="button"
                onClick={() => setShowAddCustomServiceModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div>
                <label className="text-slate-300 font-bold mb-1 block">Nombre del Servicio *</label>
                <input
                  type="text"
                  placeholder="Ej. Cambio de Filtro de Cabina, Reparación de Rin..."
                  value={customServiceName}
                  onChange={(e) => setCustomServiceName(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#00E5FF] font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold mb-1 block">Categoría</label>
                  <select
                    value={customServiceCategory}
                    onChange={(e) => setCustomServiceCategory(e.target.value as any)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-[#00E5FF]"
                  >
                    <option value="Detailing">Detailing</option>
                    <option value="Pulitura">Pulitura</option>
                    <option value="Pintura">Pintura</option>
                    <option value="Latonería">Latonería</option>
                    <option value="PPF">PPF</option>
                    <option value="Polarizado">Polarizado</option>
                    <option value="Lavado Premium">Lavado Premium</option>
                    <option value="Reparación Menor">Reparación Menor</option>
                    <option value="Servicio Especial">Servicio Especial</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold mb-1 block">Precio ($ USD) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Ej. 45"
                    value={customServicePrice}
                    onChange={(e) => setCustomServicePrice(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-white font-mono outline-none focus:border-[#00E5FF]"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold mb-1 block">Horas Estimadas de Taller</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={customServiceHours}
                  onChange={(e) => setCustomServiceHours(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-white font-mono outline-none focus:border-[#00E5FF]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10 mt-2">
              <button
                type="button"
                onClick={() => setShowAddCustomServiceModal(false)}
                className="btn-nike-secondary text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveAndAddCustomService}
                className="btn-nike-primary text-xs py-2 px-4 bg-[#00E5FF] hover:bg-cyan-400 text-black font-bold"
              >
                Guardar y Agregar a ODS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
