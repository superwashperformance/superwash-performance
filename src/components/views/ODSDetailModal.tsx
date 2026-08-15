import React, { useState, useRef } from 'react';
import { CurrencyDisplay } from '../common/CurrencyDisplay';
import { ServiceOrder, CompanyData, OrderPhoto } from '../../types';
import { FaviconLogo } from '../common/FaviconLogo';
import { WorkshopOrderPrintTemplate } from './WorkshopOrderPrintTemplate';
import { storageService } from '../../services/storageService';
import { X, Printer, Share2, Phone, CheckCircle, FileText, Camera, ShieldAlert, Sparkles, User, Car, Plus, Pencil, Check, Trash2 } from 'lucide-react';

interface ODSDetailModalProps {
  order: ServiceOrder | null;
  onClose: () => void;
  companyData: CompanyData;
  onAddPhoto?: (orderId: string, photo: OrderPhoto) => void;
  onAddExtraService?: (orderId: string, serviceName: string, price: number) => void;
  onEditService?: (orderId: string, serviceId: string, serviceName: string, unitPrice: number, quantity: number) => void;
  onDeletePhoto?: (orderId: string, photoId: string) => void;
}

export const ODSDetailModal: React.FC<ODSDetailModalProps> = ({ order, onClose, companyData, onAddPhoto, onAddExtraService, onEditService, onDeletePhoto }) => {
  const [activeTab, setActiveTab] = useState<'quote' | 'photos' | 'checklist' | 'damages'>('quote');
  const [printMode, setPrintMode] = useState<'quote' | 'taller'>('quote');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadCategory, setUploadCategory] = useState<OrderPhoto['category']>('general');
  const [showExtraServiceForm, setShowExtraServiceForm] = useState(false);
  const [extraServiceName, setExtraServiceName] = useState('');
  const [extraServicePrice, setExtraServicePrice] = useState('');
  
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editServiceName, setEditServiceName] = useState('');
  const [editServiceQuantity, setEditServiceQuantity] = useState('');
  const [editServiceUnitPrice, setEditServiceUnitPrice] = useState('');

  const startEditing = (service: any) => {
    setEditingServiceId(service.serviceId);
    setEditServiceName(service.serviceName);
    setEditServiceQuantity(service.quantity.toString());
    setEditServiceUnitPrice(service.unitPrice.toString());
  };

  const handleSaveEdit = () => {
    if (!order || !onEditService || !editingServiceId) return;
    const price = parseFloat(editServiceUnitPrice);
    const qty = parseInt(editServiceQuantity, 10);
    if (isNaN(price) || price < 0 || isNaN(qty) || qty < 1 || !editServiceName.trim()) return;

    onEditService(order.id, editingServiceId, editServiceName.trim(), price, qty);
    setEditingServiceId(null);
  };

  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);

  const handleAddExtraService = () => {
    if (!order || !onAddExtraService || !extraServiceName.trim() || !extraServicePrice) return;
    const price = parseFloat(extraServicePrice);
    if (isNaN(price) || price <= 0) return;

    onAddExtraService(order.id, extraServiceName.trim(), price);
    setExtraServiceName('');
    setExtraServicePrice('');
    setShowExtraServiceForm(false);
  };

  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onAddPhoto || !order) return;

    setIsUploadingPhoto(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64Data = reader.result as string;
        const publicUrl = await storageService.uploadPhotoBase64(base64Data, file.name);

        const newPhoto: OrderPhoto = {
          id: `photo-${Date.now()}`,
          photoUrl: publicUrl,
          category: uploadCategory,
          caption: file.name,
          createdAt: new Date().toLocaleString('es-ES')
        };
        onAddPhoto(order.id, newPhoto);
      } catch (error) {
        console.error('Error uploading photo:', error);
        alert('Hubo un error al subir la fotografía a Supabase.');
      } finally {
        setIsUploadingPhoto(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerUpload = (category: OrderPhoto['category']) => {
    setUploadCategory(category);
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 50);
  };

  if (!order) return null;

  // Generate WhatsApp Share Link for the client
  const generateWhatsAppLink = () => {
    const text = `*${companyData.name}*%0A` +
      `Hola ${order.customerName}, adjuntamos el presupuesto de tu vehículo *${order.vehicleBrandModel}* (Placa: ${order.vehiclePlate}):%0A%0A` +
      order.services.map(s => `- ${s.serviceName}: $${s.totalPrice}`).join('%0A') +
      `%0A%0A*TOTAL PRESUPUESTO:* $${order.totalAmount}%0A` +
      `*Abonado:* $${order.paidAmount}%0A` +
      `*Pendiente:* $${order.totalAmount - order.paidAmount}%0A%0A` +
      `Quedamos atentos a tu aprobación. ¡Gracias por confiar en ${companyData.name}!`;

    const cleanPhone = order.customerPhone.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanPhone}?text=${text}`;
  };

  const handlePrint = (mode: 'quote' | 'taller') => {
    setPrintMode(mode);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:absolute print:inset-0 print:w-full print:bg-transparent print:p-0 print:block print:overflow-visible">
      <div className="glass-card w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 border-slate-200 shadow-2xl print:max-h-none print:shadow-none print:border-none print:max-w-full print:w-full print:block print:overflow-visible bg-white">
        {/* Modal Header */}
        <div className={`p-4 md:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50 ${printMode === 'taller' ? 'print:hidden' : 'print:border-b-slate-200 print:bg-transparent print:pb-2'}`}>
          <div className="flex items-center gap-3">
            <div className="print:scale-125 origin-left">
              <FaviconLogo size={48} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-2xl text-[#7A1B28] print:text-black">{order.orderNumber}</span>
                <span className="text-xs font-mono bg-white print:bg-transparent text-slate-900 print:text-black px-2 py-0.5 rounded-full uppercase border border-slate-200 print:border-slate-300">
                  {order.vehiclePlate}
                </span>
              </div>
              <span className="text-xs text-slate-600 print:text-black font-medium">
                {order.vehicleBrandModel} ({order.vehicleColor}) - {order.customerName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">

            {/* Print Buttons */}
            <button onClick={() => handlePrint('quote')} className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 shadow-sm">
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimir Presupuesto</span>
            </button>
            <button onClick={() => handlePrint('taller')} className="btn-primary text-xs py-2 px-3 flex items-center gap-1.5 shadow-sm">
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimir Taller</span>
            </button>

            {/* Close Modal */}
            <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-full ml-2 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 py-3 bg-slate-50 border-b border-slate-200 overflow-x-auto print:hidden">
          {[
            { id: 'quote', label: 'PRESUPUESTO Y ODS DEL TALLER', icon: FileText },
            { id: 'damages', label: `FOTOS DAÑOS (${order.photos.filter(p => p.category.startsWith('damage')).length})`, icon: ShieldAlert },
            { id: 'checklist', label: 'CHECKLIST 20 PUNTOS', icon: CheckCircle },
            { id: 'photos', label: `FOTOS REGISTRO FINAL (${order.photos.filter(p => p.category === 'general').length})`, icon: Camera },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-display text-xs tracking-wider uppercase transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#7A1B28] text-white font-bold shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200 bg-white border border-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Tab Content */}
        <div className={`flex-1 overflow-y-auto p-6 space-y-6 print:p-0 print:space-y-0 print:overflow-visible ${printMode === 'taller' ? 'print:hidden' : ''}`}>
          {/* TAB 1: PRESUPUESTO & NOTA DE ENTREGA PRINTABLE VIEW */}
          <div id="printable-quote" className={`flex flex-col gap-6 bg-slate-50 print:bg-white p-6 print:p-4 print:m-0 rounded-2xl border border-slate-200 print:border-none print:shadow-none print:break-inside-avoid print:gap-4 ${activeTab === 'quote' ? 'flex' : 'hidden print:flex'}`}>
            {/* Header Invoice Brand */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-4 print:pb-2">
                <div>
                  <h1 className="font-display text-3xl text-slate-900 print:text-black">{companyData.name.toUpperCase()}</h1>
                  <p className="text-xs text-slate-500 print:text-black">Centro Especializado en Estética Automotriz, Detailing & Pintura</p>
                  <p className="text-xs text-slate-500 print:text-black font-mono">{companyData.address} | RIF: {companyData.documentId}</p>
                </div>
                <div className="text-right">
                  <div className="font-display text-2xl text-[#7A1B28] print:text-black">ODS-{order.orderNumber}</div>
                  <div className="text-xs text-slate-500 print:text-black font-mono">Fecha: {order.entryDate}</div>
                </div>
              </div>

              {/* Customer & Vehicle Info Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 print:bg-transparent border border-slate-200 print:border-slate-300 flex flex-col gap-1">
                  <span className="font-display text-sm text-[#7A1B28] print:text-black">DATOS DEL CLIENTE</span>
                  <span className="text-slate-900 print:text-black font-bold">{order.customerName}</span>
                  <span className="text-slate-600 print:text-black font-mono">Teléfono: {order.customerPhone}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 print:bg-transparent border border-slate-200 print:border-slate-300 flex flex-col gap-1">
                  <span className="font-display text-sm text-[#7A1B28] print:text-black">DATOS DEL VEHÍCULO</span>
                  <span className="text-slate-900 print:text-black font-bold">{order.vehicleBrandModel} ({order.vehicleYear})</span>
                  <span className="text-slate-600 print:text-black font-mono">Placa: {order.vehiclePlate} | Color: {order.vehicleColor}</span>
                </div>
              </div>

              {/* Services Itemized Table */}
              <div>
                <span className="font-display text-lg text-[#7A1B28] print:text-black mb-2 block">SERVICIOS SELECCIONADOS</span>
                <table className="w-full text-left text-xs text-slate-700 print:text-black bg-white rounded-xl overflow-hidden border border-slate-200">
                  <thead className="bg-slate-100 print:bg-transparent font-display text-sm tracking-wider uppercase text-slate-600 print:text-black border-b border-slate-200 print:border-slate-300">
                    <tr>
                      <th className="p-2.5 font-bold">DESCRIPCIÓN DEL SERVICIO</th>
                      <th className="p-2.5 text-center font-bold">CANT.</th>
                      <th className="p-2.5 text-right font-bold">PRECIO UNIT.</th>
                      <th className="p-2.5 text-right font-bold">TOTAL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 print:divide-slate-300 font-sans">
                    {order.services.map((s, i) => (
                      <tr key={i} className="group">
                        {editingServiceId === s.serviceId ? (
                          <>
                            <td className="p-2.5">
                              <input
                                type="text"
                                value={editServiceName}
                                onChange={e => setEditServiceName(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs text-slate-900 focus:border-[#7A1B28] outline-none"
                              />
                            </td>
                            <td className="p-2.5 text-center">
                              <input
                                type="number"
                                value={editServiceQuantity}
                                onChange={e => setEditServiceQuantity(e.target.value)}
                                className="w-16 bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs text-center text-slate-900 focus:border-[#7A1B28] outline-none font-mono"
                              />
                            </td>
                            <td className="p-2.5 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <span className="text-slate-500 text-xs">$</span>
                                <input
                                  type="number"
                                  value={editServiceUnitPrice}
                                  onChange={e => setEditServiceUnitPrice(e.target.value)}
                                  className="w-20 bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs text-right text-slate-900 focus:border-[#7A1B28] outline-none font-mono"
                                />
                              </div>
                            </td>
                            <td className="p-2.5 text-right whitespace-nowrap">
                              <button onClick={handleSaveEdit} className="text-[#7A1B28] hover:text-white p-1.5 rounded hover:bg-[#7A1B28] mr-1 transition-colors">
                                <Check className="w-4 h-4" />
                              </button>
                              <button onClick={() => setEditingServiceId(null)} className="text-slate-500 hover:text-white p-1.5 rounded hover:bg-red-500 transition-colors">
                                <X className="w-4 h-4" />
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-2.5 font-bold text-slate-900 print:text-black flex items-center gap-2">
                              {s.serviceName}
                              {onEditService && (
                                <button
                                  onClick={() => startEditing(s)}
                                  className="print:hidden text-slate-400 hover:text-[#7A1B28] transition-opacity ml-2"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>
                            <td className="p-2.5 text-center font-mono print:text-black">{s.quantity}</td>
                            <td className="p-2.5 text-right print:text-black">
                              <CurrencyDisplay amount={s.unitPrice} size="sm" />
                            </td>
                            <td className="p-2.5 text-right text-slate-900 print:text-black font-bold">
                              <CurrencyDisplay amount={s.totalPrice} size="sm" />
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Add Extra Service Section (Hidden in print) */}
                {onAddExtraService && (
                  <div className="mt-4 print:hidden border-t border-slate-200 pt-4">
                    {!showExtraServiceForm ? (
                      <button 
                        onClick={() => setShowExtraServiceForm(true)}
                        className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 text-slate-700 hover:text-[#7A1B28]"
                      >
                        <Plus className="w-3.5 h-3.5" /> Agregar Servicio Adicional
                      </button>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <input
                          type="text"
                          placeholder="Nombre del servicio (Ej. Encerado)"
                          value={extraServiceName}
                          onChange={e => setExtraServiceName(e.target.value)}
                          className="w-full sm:flex-1 bg-white border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-900 focus:border-[#7A1B28] outline-none"
                        />
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <span className="text-slate-500 text-xs">$</span>
                          <input
                            type="number"
                            placeholder="0.00"
                            value={extraServicePrice}
                            onChange={e => setExtraServicePrice(e.target.value)}
                            className="w-24 bg-white border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-900 focus:border-[#7A1B28] outline-none font-mono"
                          />
                          <button 
                            onClick={handleAddExtraService}
                            disabled={!extraServiceName.trim() || !extraServicePrice}
                            className="btn-primary text-xs py-1.5 px-3 whitespace-nowrap ml-2 disabled:opacity-50"
                          >
                            Añadir
                          </button>
                          <button 
                            onClick={() => {
                              setShowExtraServiceForm(false);
                              setExtraServiceName('');
                              setExtraServicePrice('');
                            }}
                            className="p-1.5 text-slate-500 hover:text-red-500 rounded-full hover:bg-slate-200 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Financial Totals */}
              <div className="flex flex-col items-end border-t border-slate-200 print:border-black/20 pt-4 text-xs font-mono space-y-1">
                <div className="flex justify-between p-2">
                  <span className="text-slate-500 print:text-black">Subtotal:</span>
                  <span className="text-slate-900 print:text-black font-bold ml-4">
                    <CurrencyDisplay amount={order.subtotalAmount} size="sm" />
                  </span>
                </div>
                <div className="flex justify-between p-2">
                  <span className="text-slate-500 print:text-black">Abonado:</span>
                  <span className="font-bold print:text-black ml-4">
                    <CurrencyDisplay amount={order.paidAmount} size="sm" />
                  </span>
                </div>
                <div className="flex justify-between p-2 border-t border-slate-300 print:border-black/20 mt-2">
                  <span className="text-slate-500 print:text-black">Pendiente:</span>
                  <span className="font-bold text-red-400 print:text-red-600 ml-4">
                    <CurrencyDisplay amount={order.totalAmount - order.paidAmount} size="sm" />
                  </span>
                </div>
                {/* Observations & Print Textual Details */}
                <div className="p-3 rounded-xl bg-slate-50 print:bg-transparent border border-slate-200 print:border-black/20 text-xs w-full mt-4 print:mt-2">
                  <span className="font-bold text-slate-700 print:text-black block mb-1">OBSERVACIONES:</span>
                  {order.observations ? (
                    <p className="text-slate-800 print:text-black italic">{order.observations}</p>
                  ) : (
                    <p className="text-slate-500 print:text-black italic">Sin observaciones iniciales.</p>
                  )}

                  {/* Print only: Detailed damages and FULL checklist */}
                  <div className="hidden print:block mt-4 pt-4 border-t border-slate-200/20 print:border-black/20 space-y-4">
                    {/* Checklist details for print */}
                    {order.checklist && order.checklist.length > 0 && (
                      <div>
                        <span className="font-bold text-slate-800 print:text-black mb-2 block uppercase text-[10px] tracking-wider">ESTADO DE RECEPCIÓN DEL VEHÍCULO (CHECKLIST):</span>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-slate-700 print:text-black">
                          {order.checklist.map(i => (
                            <div key={i.id} className="flex justify-between border-b border-slate-200/50 print:border-black/10 pb-1">
                              <span>{i.label}</span>
                              <span className={`font-bold uppercase ${i.condition === 'ok' ? 'text-slate-600 print:text-black' : 'text-slate-900 print:text-black'}`}>
                                {i.condition === 'ok' ? 'Correcto' : i.condition}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Damage Markers summary for print */}
                    {order.damageMarkers && order.damageMarkers.length > 0 && (
                      <div className="mt-4">
                        <span className="font-bold text-slate-800 print:text-black mb-2 block uppercase text-[10px] tracking-wider">DETALLES DE CARROCERÍA REGISTRADOS:</span>
                        <ul className="list-disc ml-4 text-[10px] text-slate-700 print:text-black">
                          {order.damageMarkers.map(m => (
                            <li key={m.id}>{m.description || 'Daño'} <span className="text-slate-500 print:text-black">({m.type} en {m.view})</span></li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

          <div className={activeTab === 'photos' ? 'block print:hidden' : 'hidden'}>
            <div className="flex justify-end mb-4">
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
              <button 
                onClick={() => triggerUpload('general')}
                disabled={isUploadingPhoto}
                className="btn-primary text-xs py-2 px-4 flex items-center gap-2 disabled:opacity-50"
              >
                <Camera className="w-4 h-4" /> {isUploadingPhoto ? 'Subiendo...' : 'Agregar Fotografía'}
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {order.photos.filter(p => p.category === 'general').map((p) => (
                <div key={p.id} className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video group cursor-pointer" onClick={() => setSelectedPhotoUrl(p.photoUrl)}>
                  <img src={p.photoUrl} alt={p.caption} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 flex flex-col justify-end">
                    <span className="font-mono text-[10px] text-white/80 uppercase">{p.category}</span>
                    <span className="text-xs font-bold text-white">{p.caption}</span>
                    <span className="text-[10px] text-slate-300 font-mono">{p.createdAt}</span>
                  </div>
                  {onDeletePhoto && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDeletePhoto(order.id, p.id); }}
                      className="absolute top-2 right-2 p-2 bg-red-500/90 text-white rounded-full transition-all hover:bg-red-600 hover:text-white"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* TAB 3: CHECKLIST AUDIT */}
          <div className={activeTab === 'checklist' ? 'block print:hidden' : 'hidden'}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(order.checklist || []).map((item) => (
                <div key={item.id} className="p-3 rounded-xl bg-white border border-slate-200 flex flex-col gap-2 text-xs shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{item.label}</span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-display uppercase tracking-wider ${
                        item.condition === 'ok'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : item.condition === 'damaged'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : item.condition === 'missing'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}
                    >
                      {item.condition === 'ok' ? 'EN ORDEN' : item.condition === 'damaged' ? 'DAÑADO' : item.condition === 'missing' ? 'NO POSEE' : 'OBSERVACIÓN'}
                    </span>
                  </div>
                  {item.notes && (
                    <div className="mt-1 text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="font-bold text-slate-700 block mb-0.5">Detalle / Observación:</span>
                      {item.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {order.photos.filter(p => p.category === 'belonging').length > 0 && (
              <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="font-display text-sm text-[#7A1B28] uppercase tracking-wider mb-4">Fotos de Pertenencias</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {order.photos.filter(p => p.category === 'belonging').map(p => (
                    <div key={p.id} className="relative rounded-lg overflow-hidden border border-slate-200 aspect-square group cursor-pointer" onClick={() => setSelectedPhotoUrl(p.photoUrl)}>
                      <img src={p.photoUrl} alt="Pertenencias" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      {onDeletePhoto && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); onDeletePhoto(order.id, p.id); }}
                          className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full transition-all hover:bg-red-600 shadow-sm"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* TAB 4: DAMAGES PHOTOS */}
          <div className={activeTab === 'damages' ? 'block print:hidden' : 'hidden'}>
            <div className="grid grid-cols-1 gap-6">
              {[
                { title: 'Evidencia de Daños', cat: 'damage' },
              ].map(view => {
                const viewPhotos = order.photos.filter(p => p.category === view.cat || p.category.startsWith('damage_'));
                return (
                  <div key={view.cat} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-display text-sm text-[#7A1B28] uppercase tracking-wider">{view.title}</h4>
                      {viewPhotos.length < 10 && (
                        <button 
                          onClick={() => triggerUpload(view.cat as any)}
                          disabled={isUploadingPhoto}
                          className="btn-primary text-[10px] py-1.5 px-3 flex items-center gap-2 shadow-sm disabled:opacity-50"
                        >
                          <Camera className="w-3.5 h-3.5" /> {isUploadingPhoto ? 'Subiendo...' : 'Añadir Foto'}
                        </button>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      {viewPhotos.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {viewPhotos.map(p => (
                            <div key={p.id} className="relative rounded-lg overflow-hidden border border-slate-200 aspect-square group cursor-pointer" onClick={() => setSelectedPhotoUrl(p.photoUrl)}>
                              <img src={p.photoUrl} alt={view.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                              {onDeletePhoto && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); onDeletePhoto(order.id, p.id); }}
                                  className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full transition-all hover:bg-red-600 shadow-sm"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="aspect-[3/1] md:aspect-[4/1] w-full border border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-500 text-xs">
                          Sin fotos registradas
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* BOTÓN GLOBAL DE GUARDAR Y CERRAR */}
            <div className="p-4 md:p-6 border-t border-slate-200 bg-slate-100">
              <div className="flex justify-end">
                <button 
                  onClick={() => {
                    if (isUploadingPhoto) {
                      alert('Espera a que termine de subir la foto actual.');
                    } else {
                      onClose();
                    }
                  }}
                  disabled={isUploadingPhoto}
                  className="btn-primary px-8 py-3 flex items-center gap-2 shadow-lg disabled:opacity-50"
                >
                  <CheckCircle className="w-5 h-5" /> Guardar y Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* WORKSHOP ORDER PRINT TEMPLATE (HIDDEN IN UI, SHOWN IN PRINT MODE 'TALLER') */}
        {printMode === 'taller' && (
          <div className="hidden print:block w-full">
            <WorkshopOrderPrintTemplate order={order} />
          </div>
        )}

      </div>
      
      {/* LIGHTBOX FOR FULL SCREEN PHOTO PREVIEW */}
      {selectedPhotoUrl && (
        <div 
          className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm print:hidden"
          onClick={() => setSelectedPhotoUrl(null)}
        >
          <button 
            className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-900 bg-white/10 rounded-full transition-colors"
            onClick={(e) => { e.stopPropagation(); setSelectedPhotoUrl(null); }}
          >
            <X className="w-6 h-6" />
          </button>
          <img 
            src={selectedPhotoUrl} 
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()} 
            alt="Vista Previa"
          />
        </div>
      )}
    </div>
  );
};
