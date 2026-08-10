import React, { useState, useRef } from 'react';
import { CurrencyDisplay } from '../common/CurrencyDisplay';
import { ServiceOrder, CompanyData, OrderPhoto, ODSStatus, ServiceItem, PresupuestoServiceItem } from '../../types';
import { defaultChecklistItems } from '../../data/mockData';
import { FaviconLogo } from '../common/FaviconLogo';
import { WorkshopOrderPrintTemplate } from './WorkshopOrderPrintTemplate';
import { X, Printer, Camera, ShieldAlert, CheckCircle, CheckCircle2, FileText, Trash2, Image as ImageIcon, Plus, Sparkles } from 'lucide-react';

interface ODSDetailModalProps {
  order: ServiceOrder | null;
  onClose: () => void;
  companyData: CompanyData;
  onAddPhoto?: (orderId: string, photo: OrderPhoto) => void;
  onDeletePhoto?: (orderId: string, photoId: string) => void;
  onUpdateStatus?: (orderId: string, newStatus: ODSStatus) => void;
  servicesCatalog?: ServiceItem[];
  onUpdateOrderServices?: (orderId: string, newServices: PresupuestoServiceItem[]) => void;
}

export const ODSDetailModal: React.FC<ODSDetailModalProps> = ({
  order,
  onClose,
  companyData,
  onAddPhoto,
  onDeletePhoto,
  onUpdateStatus,
  servicesCatalog = [],
  onUpdateOrderServices,
}) => {
  const [activeTab, setActiveTab] = useState<'quote' | 'photos' | 'checklist' | 'damages'>('quote');
  const [printMode, setPrintMode] = useState<'quote' | 'taller'>('quote');
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [uploadCategory, setUploadCategory] = useState<OrderPhoto['category']>('general');
  const [obsText, setObsText] = useState(order?.observations || '');

  // Custom Service in Modal State
  const [showModalCustomService, setShowModalCustomService] = useState(false);
  const [modalCustomName, setModalCustomName] = useState('');
  const [modalCustomPrice, setModalCustomPrice] = useState<number>(0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onAddPhoto) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const newPhoto: OrderPhoto = {
        id: `photo-${Date.now()}`,
        photoUrl: reader.result as string,
        category: uploadCategory,
        caption: file.name,
        createdAt: new Date().toLocaleString('es-ES')
      };
      if (order) {
        onAddPhoto(order.id, newPhoto);
      }
      if (galleryInputRef.current) galleryInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  const triggerGalleryUpload = (category: OrderPhoto['category']) => {
    setUploadCategory(category);
    setTimeout(() => {
      galleryInputRef.current?.click();
    }, 50);
  };

  const triggerCameraUpload = (category: OrderPhoto['category']) => {
    setUploadCategory(category);
    setTimeout(() => {
      cameraInputRef.current?.click();
    }, 50);
  };

  const handleMarkDeliveredNoIssues = () => {
    if (!order || !onUpdateStatus) return;
    const nowStr = new Date().toLocaleString('es-ES');
    
    // Add delivery note
    const note = `[${nowStr}] REVISADO Y ENTREGADO SIN NOVEDAD DE CONFORMIDAD CON EL CLIENTE.`;
    order.observations = order.observations ? `${order.observations}\n${note}` : note;
    setObsText(order.observations);

    // Call update status handler
    onUpdateStatus(order.id, 'delivered');
  };

  const handleAddCatalogServiceToModal = (svcId: string) => {
    if (!order || !onUpdateOrderServices) return;
    const catItem = servicesCatalog.find((s) => s.id === svcId);
    if (!catItem) return;

    const existingIdx = order.services.findIndex((s) => s.serviceId === svcId || s.serviceName === catItem.name);
    let updated: PresupuestoServiceItem[];

    if (existingIdx !== -1) {
      updated = order.services.map((s, idx) =>
        idx === existingIdx
          ? {
              ...s,
              quantity: s.quantity + 1,
              totalPrice: (s.quantity + 1) * s.unitPrice,
            }
          : s
      );
    } else {
      const newItem: PresupuestoServiceItem = {
        serviceId: catItem.id,
        serviceName: catItem.name,
        category: catItem.category,
        unitPrice: catItem.price,
        quantity: 1,
        totalPrice: catItem.price,
      };
      updated = [...order.services, newItem];
    }

    onUpdateOrderServices(order.id, updated);
  };

  const handleUpdateServiceItemInModal = (index: number, changes: Partial<PresupuestoServiceItem>) => {
    if (!order || !onUpdateOrderServices) return;
    const updated = order.services.map((s, idx) => {
      if (idx === index) {
        const qty = changes.quantity !== undefined ? changes.quantity : s.quantity;
        const price = changes.unitPrice !== undefined ? changes.unitPrice : s.unitPrice;
        return {
          ...s,
          ...changes,
          quantity: qty,
          unitPrice: price,
          totalPrice: qty * price,
        };
      }
      return s;
    });

    onUpdateOrderServices(order.id, updated);
  };

  const handleRemoveServiceItemFromModal = (index: number) => {
    if (!order || !onUpdateOrderServices) return;
    const updated = order.services.filter((_, idx) => idx !== index);
    onUpdateOrderServices(order.id, updated);
  };

  const handleSaveModalCustomService = () => {
    if (!order || !onUpdateOrderServices || !modalCustomName.trim()) return;

    const newItem: PresupuestoServiceItem = {
      serviceId: `svc-${Date.now()}`,
      serviceName: modalCustomName.trim(),
      category: 'Servicio Especial',
      unitPrice: modalCustomPrice || 0,
      quantity: 1,
      totalPrice: modalCustomPrice || 0,
    };

    const updated = [...order.services, newItem];
    onUpdateOrderServices(order.id, updated);

    setModalCustomName('');
    setModalCustomPrice(0);
    setShowModalCustomService(false);
  };

  const handlePrint = (mode: 'quote' | 'taller') => {
    setPrintMode(mode);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  if (!order) return null;

  const photosList = order.photos || [];
  const damagePhotos = photosList.filter((p) => p && p.category && String(p.category).startsWith('damage'));
  const generalPhotos = photosList.filter((p) => p && (p.category === 'general' || !p.category));
  const belongingPhotos = photosList.filter((p) => p && p.category === 'belonging');
  const checklistList = (order.checklist && order.checklist.length > 0) ? order.checklist : defaultChecklistItems;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto print:absolute print:inset-0 print:w-full print:bg-transparent print:p-0 print:block print:overflow-visible">
      {/* Hidden File Inputs for Gallery and Direct Camera */}
      <input type="file" accept="image/*" className="hidden" ref={galleryInputRef} onChange={handleFileUpload} />
      <input type="file" accept="image/*" capture="environment" className="hidden" ref={cameraInputRef} onChange={handleFileUpload} />
      <div className="nike-card w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 border-cyan-500/30 shadow-2xl print:max-h-none print:shadow-none print:border-none print:max-w-full print:w-full print:block print:overflow-visible">
        
        <div className={`p-4 md:p-6 border-b border-white/10 flex items-center justify-between bg-black/60 ${printMode === 'taller' ? 'print:hidden' : 'print:border-b-black/20 print:bg-transparent print:pb-2'}`}>
          <div className="flex items-center gap-3">
            <div className="print:scale-125 origin-left">
              <FaviconLogo size={48} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-2xl text-[#00E5FF] print:text-[#00E5FF]">{order.orderNumber}</span>
                <span className="text-xs font-mono bg-white/10 print:bg-black/5 text-white print:text-black px-2 py-0.5 rounded-full uppercase border border-transparent print:border-black/20">
                  {order.vehiclePlate}
                </span>
              </div>
              <span className="text-xs text-slate-400 print:text-black font-medium">
                {order.vehicleBrandModel} ({order.vehicleColor}) - {order.customerName}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 print:hidden">
            {onUpdateStatus && order.status !== 'delivered' && (
              <button
                onClick={handleMarkDeliveredNoIssues}
                className="btn-nike-primary bg-emerald-500 hover:bg-emerald-400 text-black text-xs py-2 px-3.5 flex items-center gap-1.5 font-bold shadow-lg shadow-emerald-500/20"
                title="Marcar ODS como entregada sin novedad de conformidad"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>ENTREGADO SIN NOVEDAD</span>
              </button>
            )}

            {order.status === 'delivered' && (
              <span className="px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-display font-bold uppercase flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>ENTREGADO SIN NOVEDAD</span>
              </span>
            )}

            <button onClick={() => handlePrint('quote')} className="btn-nike-secondary text-xs py-2 px-3 flex items-center gap-1.5">
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimir Presupuesto</span>
            </button>
            <button onClick={() => handlePrint('taller')} className="btn-nike-primary text-xs py-2 px-3 flex items-center gap-1.5">
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimir Taller</span>
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full ml-2">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 px-6 py-3 bg-slate-950 border-b border-white/10 overflow-x-auto print:hidden">
          {[
            { id: 'quote', label: 'PRESUPUESTO Y ODS DEL TALLER', icon: FileText },
            { id: 'damages', label: `FOTOS DAÑOS (${damagePhotos.length})`, icon: ShieldAlert },
            { id: 'checklist', label: `CHECKLIST 20 PUNTOS (${checklistList.length})`, icon: CheckCircle },
            { id: 'photos', label: `FOTOS REGISTRO FINAL (${generalPhotos.length})`, icon: Camera },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-display text-xs tracking-wider uppercase transition-all whitespace-nowrap ${
                  isActive ? 'bg-[#00E5FF] text-black font-bold shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className={`flex-1 overflow-y-auto p-6 space-y-6 print:p-0 print:space-y-0 print:overflow-visible ${printMode === 'taller' ? 'print:hidden' : ''}`}>
          <div id="printable-quote" className={`flex flex-col gap-6 bg-slate-950 print:bg-white p-6 print:p-4 print:m-0 rounded-2xl border border-white/10 print:border-none print:shadow-none print:break-inside-avoid print:gap-4 ${activeTab === 'quote' ? 'flex' : 'hidden print:flex'}`}>
            <div className="flex items-start justify-between border-b border-white/10 pb-4 print:pb-2">
              <div>
                <h1 className="font-display text-3xl text-white print:text-black">{companyData.name.toUpperCase()}</h1>
                <p className="text-xs text-slate-400 print:text-black">Centro Especializado en Estética Automotriz, Detailing & Pintura</p>
                <p className="text-xs text-slate-500 print:text-black font-mono">{companyData.address} | RIF: {companyData.documentId}</p>
              </div>
              <div className="text-right">
                <div className="font-display text-2xl text-[#00E5FF] print:text-[#00E5FF]">ODS-{order.orderNumber}</div>
                <div className="text-xs text-slate-400 print:text-black font-mono">Fecha: {order.entryDate}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-black/40 print:bg-transparent border border-white/5 print:border-black/20 flex flex-col gap-1">
                <span className="font-display text-sm text-[#00E5FF] print:text-black">DATOS DEL CLIENTE</span>
                <span className="text-white print:text-black font-bold">{order.customerName}</span>
                <span className="text-slate-400 print:text-black font-mono">Teléfono: {order.customerPhone}</span>
              </div>
              <div className="p-3 rounded-xl bg-black/40 print:bg-transparent border border-white/5 print:border-black/20 flex flex-col gap-1">
                <span className="font-display text-sm text-[#00E5FF] print:text-black">DATOS DEL VEHÍCULO</span>
                <span className="text-white print:text-black font-bold">{order.vehicleBrandModel} ({order.vehicleYear})</span>
                <span className="text-slate-400 print:text-black font-mono">Placa: {order.vehiclePlate} | Color: {order.vehicleColor}</span>
              </div>
            </div>
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 print:hidden">
                <span className="font-display text-lg text-white uppercase">SERVICIOS SELECCIONADOS EN PRESUPUESTO</span>
                
                <div className="flex flex-wrap items-center gap-2">
                  {/* Select service from catalog */}
                  {servicesCatalog && servicesCatalog.length > 0 && (
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleAddCatalogServiceToModal(e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="bg-slate-900 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white outline-none font-sans"
                    >
                      <option value="">+ Agregar del Catálogo...</option>
                      {servicesCatalog.map((svc) => (
                        <option key={svc.id} value={svc.id}>
                          {svc.name} (${svc.price})
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Add custom service button */}
                  <button
                    type="button"
                    onClick={() => {
                      setModalCustomName('');
                      setModalCustomPrice(0);
                      setShowModalCustomService(true);
                    }}
                    className="btn-nike-primary text-xs py-1.5 px-3 flex items-center gap-1.5 bg-[#00E5FF] hover:bg-cyan-400 text-black font-bold"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>+ Servicio Personalizado</span>
                  </button>
                </div>
              </div>

              <table className="w-full text-left text-xs text-slate-300 print:text-black">
                <thead className="bg-black/60 print:bg-transparent font-display text-sm tracking-wider uppercase text-slate-400 print:text-black border-b border-white/10 print:border-black/20">
                  <tr>
                    <th className="p-2.5">DESCRIPCIÓN DEL SERVICIO</th>
                    <th className="p-2.5 text-center">CANT.</th>
                    <th className="p-2.5 text-right">PRECIO UNIT.</th>
                    <th className="p-2.5 text-right">TOTAL</th>
                    <th className="p-2.5 text-center print:hidden">ACCIONES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 print:divide-black/10 font-sans">
                  {order.services.map((s, i) => (
                    <tr key={i} className="hover:bg-white/5">
                      <td className="p-2.5 font-bold text-white print:text-black">{s.serviceName}</td>
                      <td className="p-2.5 text-center font-mono print:text-black">
                        <span className="print:inline hidden">{s.quantity}</span>
                        <input
                          type="number"
                          min="1"
                          value={s.quantity}
                          onChange={(e) => handleUpdateServiceItemInModal(i, { quantity: Math.max(1, Number(e.target.value)) })}
                          className="w-12 bg-black/40 border border-white/10 rounded px-1.5 py-0.5 text-center text-white font-mono outline-none focus:border-[#00E5FF] print:hidden"
                        />
                      </td>
                      <td className="p-2.5 text-right print:text-black">
                        <span className="print:inline hidden">${s.unitPrice}</span>
                        <div className="inline-flex items-center gap-1 print:hidden">
                          <span className="text-slate-500">$</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={s.unitPrice}
                            onChange={(e) => handleUpdateServiceItemInModal(i, { unitPrice: Math.max(0, Number(e.target.value)) })}
                            className="w-20 bg-black/40 border border-white/10 rounded px-2 py-0.5 text-right text-white font-mono outline-none focus:border-[#00E5FF]"
                          />
                        </div>
                      </td>
                      <td className="p-2.5 text-right text-white print:text-black font-bold">
                        <CurrencyDisplay amount={s.totalPrice || s.quantity * s.unitPrice} size="sm" />
                      </td>
                      <td className="p-2.5 text-center print:hidden">
                        <button
                          type="button"
                          onClick={() => handleRemoveServiceItemFromModal(i)}
                          className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                          title="Eliminar este servicio del presupuesto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col items-end border-t border-white/10 print:border-black/20 pt-4 text-xs font-mono space-y-1">
              <div className="flex justify-between p-2">
                <span className="text-slate-400 print:text-black">Subtotal:</span>
                <span className="text-white print:text-black font-bold ml-4"><CurrencyDisplay amount={order.subtotalAmount} size="sm" /></span>
              </div>
              <div className="flex justify-between p-2">
                <span className="text-slate-400 print:text-black">Abonado:</span>
                <span className="font-bold print:text-black ml-4"><CurrencyDisplay amount={order.paidAmount} size="sm" /></span>
              </div>
              <div className="flex justify-between p-2 border-t border-white/20 print:border-black/20 mt-2">
                <span className="text-slate-400 print:text-black">Pendiente:</span>
                <span className="font-bold text-red-400 print:text-red-600 ml-4"><CurrencyDisplay amount={order.totalAmount - order.paidAmount} size="sm" /></span>
              </div>
              <div className="p-3 rounded-xl bg-black/40 print:bg-transparent border border-white/5 print:border-black/20 text-xs w-full mt-4 print:mt-2">
                <span className="font-bold text-slate-400 print:text-black block mb-1">OBSERVACIONES:</span>
                {order.observations ? <p className="text-slate-300 print:text-black italic">{order.observations}</p> : <p className="text-slate-500 print:text-black italic">Sin observaciones iniciales.</p>}
              </div>
            </div>
          </div>

          <div className={activeTab === 'photos' ? 'block print:hidden' : 'hidden'}>
            <div className="flex justify-end gap-2 mb-4">
              <button onClick={() => triggerCameraUpload('general')} className="btn-nike-primary text-xs py-2 px-3.5 flex items-center gap-1.5">
                <Camera className="w-4 h-4" /> <span>Tomar con Cámara</span>
              </button>
              <button onClick={() => triggerGalleryUpload('general')} className="btn-nike-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 border border-white/20">
                <ImageIcon className="w-4 h-4 text-[#00E5FF]" /> <span>Imágenes Guardadas</span>
              </button>
            </div>
            {generalPhotos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {generalPhotos.map((p) => (
                  <div key={p.id} className="relative rounded-xl overflow-hidden border border-white/10 aspect-video group">
                    <img src={p.photoUrl} alt={p.caption} className="w-full h-full object-cover" />
                    <button onClick={() => onDeletePhoto?.(order.id, p.id)} className="absolute top-2 right-2 bg-red-600/80 p-1.5 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 flex flex-col justify-end">
                      <span className="font-mono text-[10px] text-[#00E5FF] uppercase">{p.category || 'general'}</span>
                      <span className="text-xs font-bold text-white">{p.caption}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-black/40 rounded-xl border border-white/5 text-xs text-slate-500 font-mono italic">
                Sin fotografías registradas aún. Usa los botones superiores para capturar con la cámara o desde tus archivos.
              </div>
            )}
          </div>

          <div className={activeTab === 'checklist' ? 'block print:hidden' : 'hidden'}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {checklistList.map((item) => (
                <div key={item.id} className="p-3 rounded-xl bg-slate-900 border border-white/5 flex flex-col gap-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{item.label}</span>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-display uppercase tracking-wider ${item.condition === 'ok' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                      {item.condition === 'ok' ? 'Sin Novedad (OK)' : item.condition === 'damaged' ? 'Dañado' : item.condition === 'missing' ? 'No Posee' : 'Observación'}
                    </span>
                  </div>
                  {item.notes && (
                    <div className="text-[11px] text-slate-300 font-sans italic bg-black/40 px-2.5 py-1 rounded border border-white/5">
                      Obs: {item.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Belonging Photos Section */}
            <div className="p-4 rounded-xl bg-slate-900 border border-white/10 flex flex-col gap-3 mt-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2">
                <span className="font-display text-sm text-[#00E5FF] uppercase">FOTOS DE PERTENENCIAS Y OBJETOS REGISTRADOS</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => triggerCameraUpload('belonging')} className="btn-nike-primary text-xs py-1 px-2.5 flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5" /> <span>Cámara</span>
                  </button>
                  <button onClick={() => triggerGalleryUpload('belonging')} className="btn-nike-secondary text-xs py-1 px-2.5 flex items-center gap-1 border border-white/20">
                    <ImageIcon className="w-3.5 h-3.5 text-[#00E5FF]" /> <span>Galería</span>
                  </button>
                </div>
              </div>

              {belongingPhotos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {belongingPhotos.map((p) => (
                    <div key={p.id} className="relative rounded-xl overflow-hidden border border-white/10 aspect-video group bg-black">
                      <img src={p.photoUrl} alt={p.caption} className="w-full h-full object-cover" />
                      <button onClick={() => onDeletePhoto?.(order.id, p.id)} className="absolute top-1.5 right-1.5 bg-red-600/80 p-1 rounded-full text-white opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-500 font-mono italic text-center py-2">
                  Sin fotos de pertenencias registradas para esta ODS.
                </div>
              )}
            </div>
          </div>

          <div className={activeTab === 'damages' ? 'block print:hidden' : 'hidden'}>
            <div className="p-6 rounded-2xl bg-slate-900 border border-white/10 flex flex-col gap-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <h4 className="font-display text-lg text-white uppercase tracking-wider flex items-center gap-2">REGISTRO DE DAÑOS Y NOVEDADES <ShieldAlert className="w-5 h-5 text-[#00E5FF]" /></h4>
                <div className="flex items-center gap-2">
                  <button onClick={() => triggerCameraUpload('damage_front')} className="btn-nike-primary text-xs py-2 px-3 flex items-center gap-1.5">
                    <Camera className="w-4 h-4" /> <span>Tomar con Cámara</span>
                  </button>
                  <button onClick={() => triggerGalleryUpload('damage_front')} className="btn-nike-secondary text-xs py-2 px-3 flex items-center gap-1.5 border border-white/20">
                    <ImageIcon className="w-4 h-4 text-[#00E5FF]" /> <span>Imágenes Guardadas</span>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {damagePhotos.length > 0 ? (
                  damagePhotos.map((p) => (
                    <div key={p.id} className="relative aspect-video rounded-xl overflow-hidden border border-white/10 group bg-black">
                      <img src={p.photoUrl} alt={p.caption} className="w-full h-full object-cover" />
                      <button onClick={() => onDeletePhoto?.(order.id, p.id)} className="absolute top-2 right-2 bg-red-600/80 p-1.5 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full p-6 text-center bg-black/40 rounded-xl border border-white/5 text-xs text-slate-500 font-mono italic">
                    Sin fotografías de daños registradas para esta ODS.
                  </div>
                )}
              </div>
              <textarea
                rows={3}
                value={obsText}
                onChange={(e) => { setObsText(e.target.value); if (order) order.observations = e.target.value; }}
                placeholder="Observaciones de daños..."
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white"
              />
            </div>
          </div>
        </div>

        {printMode === 'taller' && (
          <WorkshopOrderPrintTemplate order={order} />
        )}
      </div>

      {/* Modal: Crear Servicio Personalizado dentro de ODS Detail */}
      {showModalCustomService && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="nike-card p-6 w-full max-w-md flex flex-col gap-4 border-cyan-500/40 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-display text-xl text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#00E5FF]" /> AGREGAR TRABAJO ADICIONAL
              </h3>
              <button
                type="button"
                onClick={() => setShowModalCustomService(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div>
                <label className="text-slate-300 font-bold mb-1 block">Descripción del Trabajo / Servicio *</label>
                <input
                  type="text"
                  placeholder="Ej. Pulitura de Faros, Reparación de Rin..."
                  value={modalCustomName}
                  onChange={(e) => setModalCustomName(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#00E5FF] font-sans"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold mb-1 block">Precio ($ USD) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Ej. 35"
                  value={modalCustomPrice}
                  onChange={(e) => setModalCustomPrice(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-white font-mono outline-none focus:border-[#00E5FF]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10 mt-2">
              <button
                type="button"
                onClick={() => setShowModalCustomService(false)}
                className="btn-nike-secondary text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveModalCustomService}
                className="btn-nike-primary text-xs py-2 px-4 bg-[#00E5FF] hover:bg-cyan-400 text-black font-bold"
              >
                Agregar al Presupuesto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
