import React, { useState } from 'react';
import { CurrencyDisplay } from '../common/CurrencyDisplay';
import { ServiceOrder } from '../../types';
import { FaviconLogo } from '../common/FaviconLogo';
import { VehicleDiagram360 } from '../common/VehicleDiagram360';
import { X, Printer, Share2, Phone, CheckCircle, FileText, Camera, ShieldAlert, Sparkles, User, Car } from 'lucide-react';

interface ODSDetailModalProps {
  order: ServiceOrder | null;
  onClose: () => void;
}

export const ODSDetailModal: React.FC<ODSDetailModalProps> = ({ order, onClose }) => {
  const [activeTab, setActiveTab] = useState<'quote' | 'photos' | 'checklist' | 'damages'>('quote');

  if (!order) return null;

  // Generate WhatsApp Share Link for the client
  const generateWhatsAppLink = () => {
    const text = `*SUPER WASH PERFORMANCE*%0A` +
      `Hola ${order.customerName}, adjuntamos el presupuesto de tu vehículo *${order.vehicleBrandModel}* (Placa: ${order.vehiclePlate}):%0A%0A` +
      order.services.map(s => `- ${s.serviceName}: $${s.totalPrice}`).join('%0A') +
      `%0A%0A*TOTAL PRESUPUESTO:* $${order.totalAmount}%0A` +
      `*Abonado:* $${order.paidAmount}%0A` +
      `*Pendiente:* $${order.totalAmount - order.paidAmount}%0A%0A` +
      `Quedamos atentos a tu aprobación. ¡Gracias por confiar en Super Wash Performance!`;

    const cleanPhone = order.customerPhone.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanPhone}?text=${text}`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <div className="nike-card w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 border-cyan-500/30 shadow-2xl">
        {/* Modal Header */}
        <div className="p-4 md:p-6 border-b border-white/10 print:border-b-black/20 flex items-center justify-between bg-black/60 print:bg-transparent">
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

          <div className="flex items-center gap-2 print:hidden">

            {/* Print Button */}
            <button onClick={handlePrint} className="btn-nike-secondary text-xs py-2 px-3 flex items-center gap-1.5">
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimir PDF</span>
            </button>

            {/* Close Modal */}
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 py-3 bg-slate-950 border-b border-white/10 overflow-x-auto print:hidden">
          {[
            { id: 'quote', label: 'PRESUPUESTO & NOTA DE ENTREGA', icon: FileText },
            { id: 'photos', label: `FOTOGRAFÍAS (${order.photos.length})`, icon: Camera },
            { id: 'checklist', label: 'CHECKLIST 20 PUNTOS', icon: CheckCircle },
            { id: 'damages', label: `MAPA DAÑOS (${order.damageMarkers.length})`, icon: ShieldAlert },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-display text-xs tracking-wider uppercase transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#00E5FF] text-black font-bold shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: PRESUPUESTO & NOTA DE ENTREGA PRINTABLE VIEW */}
          <div id="printable-quote" className={`flex flex-col gap-6 bg-slate-950 print:bg-white p-6 print:p-8 print:pt-12 print:m-0 rounded-2xl border border-white/10 print:border-none print:shadow-none print:break-inside-avoid ${activeTab === 'quote' ? 'flex' : 'hidden print:flex'}`}>
            {/* Header Invoice Brand */}
              <div className="flex items-start justify-between border-b border-white/10 pb-4">
                <div>
                  <h1 className="font-display text-3xl text-white print:text-black">SUPER WASH PERFORMANCE</h1>
                  <p className="text-xs text-slate-400 print:text-black">Centro Especializado en Estética Automotriz, Detailing & Pintura</p>
                  <p className="text-xs text-slate-500 print:text-black font-mono">Sede Principal Las Mercedes | RIF: J-40199281-0</p>
                </div>
                <div className="text-right">
                  <div className="font-display text-2xl text-[#00E5FF] print:text-[#00E5FF]">ODS-{order.orderNumber}</div>
                  <div className="text-xs text-slate-400 print:text-black font-mono">Fecha: {order.entryDate}</div>
                </div>
              </div>

              {/* Customer & Vehicle Info Grid */}
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

              {/* Services Itemized Table */}
              <div>
                <span className="font-display text-lg text-white print:text-black mb-2 block">SERVICIOS SELECCIONADOS</span>
                <table className="w-full text-left text-xs text-slate-300 print:text-black">
                  <thead className="bg-black/60 print:bg-transparent font-display text-sm tracking-wider uppercase text-slate-400 print:text-black border-b border-white/10 print:border-black/20">
                    <tr>
                      <th className="p-2.5">DESCRIPCIÓN DEL SERVICIO</th>
                      <th className="p-2.5 text-center">CANT.</th>
                      <th className="p-2.5 text-right">PRECIO UNIT.</th>
                      <th className="p-2.5 text-right">TOTAL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 print:divide-black/10 font-sans">
                    {order.services.map((s, i) => (
                      <tr key={i}>
                        <td className="p-2.5 font-bold text-white print:text-black">{s.serviceName}</td>
                        <td className="p-2.5 text-center font-mono print:text-black">{s.quantity}</td>
                        <td className="p-2.5 text-right print:text-black">
                          <CurrencyDisplay amount={s.unitPrice} size="sm" />
                        </td>
                        <td className="p-2.5 text-right text-white print:text-black font-bold">
                          <CurrencyDisplay amount={s.totalPrice} size="sm" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Totals */}
              <div className="flex flex-col items-end border-t border-white/10 print:border-black/20 pt-4 text-xs font-mono space-y-1">
                <div className="flex justify-between p-2">
                  <span className="text-slate-400 print:text-black">Subtotal:</span>
                  <span className="text-white print:text-black font-bold ml-4">
                    <CurrencyDisplay amount={order.subtotalAmount} size="sm" />
                  </span>
                </div>
                <div className="flex justify-between p-2">
                  <span className="text-slate-400 print:text-black">Abonado:</span>
                  <span className="font-bold print:text-black ml-4">
                    <CurrencyDisplay amount={order.paidAmount} size="sm" />
                  </span>
                </div>
                <div className="flex justify-between p-2 border-t border-white/20 print:border-black/20 mt-2">
                  <span className="text-slate-400 print:text-black">Pendiente:</span>
                  <span className="font-bold text-red-400 print:text-red-600 ml-4">
                    <CurrencyDisplay amount={order.totalAmount - order.paidAmount} size="sm" />
                  </span>
                </div>
                {/* Observations & Print Textual Details */}
                <div className="p-3 rounded-xl bg-black/40 print:bg-transparent border border-white/5 print:border-black/20 text-xs w-full mt-4">
                  <span className="font-bold text-slate-400 print:text-black block mb-1">OBSERVACIONES:</span>
                  {order.observations ? (
                    <p className="text-slate-300 print:text-black italic">{order.observations}</p>
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

          {/* TAB 2: PHOTOGRAPHS */}
          <div className={activeTab === 'photos' ? 'block print:hidden' : 'hidden'}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {order.photos.map((p) => (
                <div key={p.id} className="relative rounded-xl overflow-hidden border border-white/10 aspect-video group">
                  <img src={p.photoUrl} alt={p.caption} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 flex flex-col justify-end">
                    <span className="font-mono text-[10px] text-[#00E5FF] uppercase">{p.category}</span>
                    <span className="text-xs font-bold text-white">{p.caption}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{p.createdAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TAB 3: CHECKLIST AUDIT */}
          <div className={activeTab === 'checklist' ? 'block print:hidden' : 'hidden'}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {order.checklist.map((item) => (
                <div key={item.id} className="p-3 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{item.label}</span>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-display uppercase tracking-wider ${
                      item.condition === 'ok'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : item.condition === 'damaged'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {item.condition}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* TAB 4: DAMAGES CANVAS */}
          <div className={activeTab === 'damages' ? 'block print:hidden' : 'hidden'}>
            <VehicleDiagram360 markers={order.damageMarkers} readOnly />
          </div>
        </div>
      </div>
    </div>
  );
};
