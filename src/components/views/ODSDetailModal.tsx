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
  const [activeTab, setActiveTab] = useState<'quote' | 'physical-form' | 'photos' | 'checklist' | 'damages'>('quote');

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
        <div className="p-4 md:p-6 border-b border-white/10 flex items-center justify-between bg-black/60">
          <div className="flex items-center gap-3">
            <FaviconLogo size={36} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-2xl text-[#00E5FF]">{order.orderNumber}</span>
                <span className="text-xs font-mono bg-white/10 text-white px-2 py-0.5 rounded-full uppercase">
                  {order.vehiclePlate}
                </span>
              </div>
              <span className="text-xs text-slate-400 font-medium">
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
            { id: 'physical-form', label: 'FORMATO FÍSICO (RECEPCIÓN)', icon: Printer },
            { id: 'photos', label: `FOTOGRAFÍAS (${order.photos.length})`, icon: Camera },
            { id: 'checklist', label: 'CHECKLIST 16 PUNTOS', icon: CheckCircle },
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
          <div id="printable-quote" className={`flex flex-col gap-6 bg-slate-950 p-6 rounded-2xl border border-white/10 ${activeTab === 'quote' ? 'flex print:flex' : 'hidden'}`}>
            {/* Header Invoice Brand */}
              <div className="flex items-start justify-between border-b border-white/10 pb-4">
                <div>
                  <h1 className="font-display text-3xl text-white print:text-black">SUPER WASH PERFORMANCE</h1>
                  <p className="text-xs text-slate-400 print:text-slate-700">Centro Especializado en Estética Automotriz, Detailing & Pintura</p>
                  <p className="text-xs text-slate-500 font-mono print:text-slate-800">Sede Principal Las Mercedes | RIF: J-40199281-0</p>
                </div>
                <div className="text-right">
                  <div className="font-display text-2xl text-[#00E5FF]">{order.orderNumber}</div>
                  <div className="text-xs text-slate-400 font-mono print:text-slate-800">Fecha: {order.entryDate}</div>
                </div>
              </div>

              {/* Customer & Vehicle Info Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-1">
                  <span className="font-display text-sm text-[#00E5FF]">DATOS DEL CLIENTE</span>
                  <span className="text-white font-bold print:text-black">{order.customerName}</span>
                  <span className="text-slate-400 font-mono print:text-slate-800">Teléfono: {order.customerPhone}</span>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-1">
                  <span className="font-display text-sm text-[#00E5FF]">DATOS DEL VEHÍCULO</span>
                  <span className="text-white font-bold print:text-black">{order.vehicleBrandModel} ({order.vehicleYear})</span>
                  <span className="text-slate-400 font-mono print:text-slate-800">Placa: {order.vehiclePlate} | Color: {order.vehicleColor}</span>
                </div>
              </div>

              {/* Services Itemized Table */}
              <div>
                <span className="font-display text-lg text-white print:text-black mb-2 block">SERVICIOS SELECCIONADOS</span>
                <table className="w-full text-left text-xs text-slate-300 print:text-slate-800">
                  <thead className="bg-black/60 print:bg-slate-200 font-display text-sm tracking-wider uppercase text-slate-400 print:text-black border-b border-white/10 print:border-slate-300">
                    <tr>
                      <th className="p-2.5">DESCRIPCIÓN DEL SERVICIO</th>
                      <th className="p-2.5 text-center">CANT.</th>
                      <th className="p-2.5 text-right">PRECIO UNIT.</th>
                      <th className="p-2.5 text-right">TOTAL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-sans">
                    {order.services.map((s, i) => (
                      <tr key={i} className="border-b border-white/5 print:border-slate-200">
                        <td className="p-2.5 font-bold text-white print:text-black">{s.serviceName}</td>
                        <td className="p-2.5 text-center font-mono print:text-black">{s.quantity}</td>
                        <td className="p-2.5 text-right print:text-black">
                          <CurrencyDisplay amount={s.unitPrice} size="sm" />
                        </td>
                        <td className="p-2.5 text-right text-white font-bold print:text-black">
                          <CurrencyDisplay amount={s.totalPrice} size="sm" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Totals */}
              <div className="flex flex-col items-end border-t border-white/10 print:border-slate-300 pt-4 text-xs font-mono space-y-1">
                <div className="flex justify-between p-2">
                  <span className="text-slate-400 print:text-black">Subtotal:</span>
                  <span className="text-white font-bold print:text-black">
                    <CurrencyDisplay amount={order.subtotalAmount} size="sm" />
                  </span>
                </div>
                <div className="flex justify-between p-2 text-emerald-400 print:text-emerald-700">
                  <span className="text-slate-400 print:text-black">Abonado:</span>
                  <span className="font-bold">
                    <CurrencyDisplay amount={order.paidAmount} size="sm" />
                  </span>
                </div>
                <div className="flex justify-between p-2 border-t border-white/20 print:border-slate-300 mt-2">
                  <span className="text-slate-400 print:text-black">Pendiente:</span>
                  <span className="font-bold text-red-400 print:text-black text-lg">
                    <CurrencyDisplay amount={order.totalAmount - order.paidAmount} size="sm" />
                  </span>
                </div>
                {/* Observations & Print Textual Details */}
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs w-full mt-4">
                  <span className="font-bold text-slate-400 print:text-black block mb-1">OBSERVACIONES:</span>
                  {order.observations ? (
                    <p className="text-slate-300 print:text-slate-800 italic">{order.observations}</p>
                  ) : (
                    <p className="text-slate-500 print:text-slate-800 italic">Sin observaciones iniciales.</p>
                  )}

                  {/* Print only: Detailed damages and FULL checklist */}
                  <div className="hidden print:block mt-4 pt-4 border-t border-slate-300 space-y-4 text-black">
                    {/* Checklist details for print */}
                    {order.checklist && order.checklist.length > 0 && (
                      <div>
                        <span className="font-bold text-black mb-2 block uppercase text-[10px] tracking-wider">ESTADO DE RECEPCIÓN DEL VEHÍCULO (CHECKLIST):</span>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-black">
                          {order.checklist.map(i => (
                            <div key={i.id} className="flex justify-between border-b border-slate-300 pb-1">
                              <span>{i.label}</span>
                              <span className={`font-bold uppercase text-black`}>
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
                        <span className="font-bold text-black mb-2 block uppercase text-[10px] tracking-wider">DETALLES DE CARROCERÍA REGISTRADOS:</span>
                        <ul className="list-disc ml-4 text-[10px] text-black">
                          {order.damageMarkers.map(m => (
                            <li key={m.id}>{m.label} <span className="text-black font-semibold">({m.type})</span></li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

          {/* TAB 1.5: FORMATO FÍSICO (RECEPCIÓN) PRINTABLE VIEW */}
          <div id="printable-physical" className={`flex flex-col bg-white text-black p-4 rounded-2xl ${activeTab === 'physical-form' ? 'flex print:flex' : 'hidden'} print:p-0 print:m-0`}>
            {/* --- PAGE 1 --- */}
            <div className="w-full relative bg-white pb-8">
              <div className="flex items-start justify-between mb-4">
                {/* Logo & Brand */}
                <div className="flex items-center gap-2 w-[35%]">
                  <FaviconLogo size={60} />
                  <div className="font-display font-black text-2xl italic leading-none tracking-tighter">
                    Super Wash<br/>
                    <span className="text-[9px] tracking-widest text-slate-500 uppercase not-italic">Performance</span>
                  </div>
                </div>
                {/* Center Title */}
                <div className="text-center w-[30%] pt-2">
                  <h2 className="text-4xl font-black italic tracking-tighter">ODS</h2>
                  <p className="text-[10px] uppercase font-bold leading-tight">Orden de servicio<br/>Inspección del vehículo</p>
                </div>
                {/* Right Fields */}
                <div className="w-[35%] flex flex-col gap-2 text-[10px] font-bold pl-8 pt-2">
                  <div className="flex border-b border-black pb-0.5"><span className="w-16">FECHA:</span><span className="flex-1 font-mono font-normal">{order.entryDate.split(',')[0]}</span></div>
                  <div className="flex border-b border-black pb-0.5"><span className="w-16">#ODS:</span><span className="flex-1 font-mono font-normal">{order.orderNumber}</span></div>
                  <div className="flex border-b border-black pb-0.5"><span className="w-16">TELEFONO:</span><span className="flex-1 font-mono font-normal">{order.customerPhone}</span></div>
                </div>
              </div>

              {/* Client & Vehicle */}
              <div className="space-y-3 text-[10px] font-bold mt-6">
                <div className="flex border-b border-black pb-0.5"><span className="mr-2">CLIENTE:</span><span className="font-mono font-normal flex-1">{order.customerName}</span></div>
                <div className="flex border-b border-black pb-0.5"><span className="mr-2">HORA DE RECEPCIÓN:</span><span className="font-mono font-normal flex-1">{order.entryDate.split(',')[1]?.trim() || ''}</span></div>
                <div className="flex gap-4">
                  <div className="flex flex-1 border-b border-black pb-0.5"><span className="mr-2">MARCA:</span><span className="font-mono font-normal flex-1 truncate">{order.vehicleBrandModel.split(' ')[0] || ''}</span></div>
                  <div className="flex flex-1 border-b border-black pb-0.5"><span className="mr-2">MODELO:</span><span className="font-mono font-normal flex-1 truncate">{order.vehicleBrandModel.split(' ').slice(1).join(' ') || ''}</span></div>
                  <div className="flex w-32 border-b border-black pb-0.5"><span className="mr-2">COLOR:</span><span className="font-mono font-normal flex-1 truncate">{order.vehicleColor}</span></div>
                  <div className="flex w-32 border-b border-black pb-0.5"><span className="mr-2">PLACA:</span><span className="font-mono font-normal flex-1 uppercase">{order.vehiclePlate}</span></div>
                </div>
              </div>

              {/* Chequeo general */}
              <div className="mt-4">
                <h3 className="text-3xl font-script text-center mb-2">Chequeo general</h3>
                <div className="flex flex-col gap-[2px] text-[8px] uppercase font-bold">
                  {order.checklist.map((item) => (
                    <div key={item.id} className="flex items-stretch border border-black">
                      <div className="flex-1 p-1 border-r border-black flex items-center">{item.label}</div>
                      <div className="w-28 p-1 border-r border-black flex items-center justify-between">
                        <span>SIN NOVEDAD</span>
                        <div className="w-3 h-3 border border-black flex items-center justify-center font-normal">{item.condition === 'ok' ? 'X' : ''}</div>
                      </div>
                      <div className="w-28 p-1 flex items-center justify-between">
                        <span>NOVEDAD</span>
                        <div className="w-3 h-3 border border-black flex items-center justify-center font-normal">{item.condition !== 'ok' ? 'X' : ''}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Servicios */}
              <div className="mt-4">
                <h3 className="text-3xl font-script text-center mb-2">Servicios</h3>
                <div className="border border-black p-2 text-[8px] font-bold uppercase grid grid-cols-2 gap-x-4 gap-y-2">
                  {/* Left Column */}
                  <div className="space-y-1.5 border-r border-black/20 pr-4">
                    <div className="flex items-center justify-between"><span className="w-24">LAVADO:</span><div className="flex gap-2"><div className="flex items-center gap-1"><span>BÁSICO</span><div className="w-3 h-3 border border-black flex items-center justify-center font-normal">{order.services.some(s => s.serviceName.toLowerCase().includes('lavado') && s.serviceName.toLowerCase().includes('básico')) ? 'X' : ''}</div></div><div className="flex items-center gap-1"><span>EXTREMO</span><div className="w-3 h-3 border border-black flex items-center justify-center font-normal">{order.services.some(s => s.serviceName.toLowerCase().includes('lavado') && s.serviceName.toLowerCase().includes('extremo')) ? 'X' : ''}</div></div></div></div>
                    <div className="flex items-center justify-between"><span className="w-24">TAPICERÍA:</span><div className="flex gap-2"><div className="flex items-center gap-1"><span>BÁSICO</span><div className="w-3 h-3 border border-black flex items-center justify-center font-normal">{order.services.some(s => s.serviceName.toLowerCase().includes('tapicería') && s.serviceName.toLowerCase().includes('básico')) ? 'X' : ''}</div></div><div className="flex items-center gap-1"><span>EXTREMO</span><div className="w-3 h-3 border border-black flex items-center justify-center font-normal">{order.services.some(s => s.serviceName.toLowerCase().includes('tapicería') && s.serviceName.toLowerCase().includes('extremo')) ? 'X' : ''}</div></div></div></div>
                    <div className="flex items-center justify-between"><span className="w-24">PULITURA:</span><div className="flex gap-2"><div className="flex items-center gap-1"><span>SINTÉTICA</span><div className="w-3 h-3 border border-black flex items-center justify-center font-normal">{order.services.some(s => s.serviceName.toLowerCase().includes('pulitura') && s.serviceName.toLowerCase().includes('sintética')) ? 'X' : ''}</div></div><div className="flex items-center gap-1"><span>CERÁMICA</span><div className="w-3 h-3 border border-black flex items-center justify-center font-normal">{order.services.some(s => s.serviceName.toLowerCase().includes('pulitura') && s.serviceName.toLowerCase().includes('cerámica')) ? 'X' : ''}</div></div></div></div>
                    <div className="flex items-center justify-between"><span className="w-24">PULITURA DE FAROS:</span><div className="w-3 h-3 border border-black flex items-center justify-center font-normal">{order.services.some(s => s.serviceName.toLowerCase().includes('faros')) ? 'X' : ''}</div></div>
                    <div className="flex items-center justify-between"><span className="w-12">PPF:</span><div className="flex gap-2"><div className="flex items-center gap-1"><span>BÁSICO</span><div className="w-3 h-3 border border-black flex items-center justify-center font-normal">{order.services.some(s => s.serviceName.toLowerCase().includes('ppf') && s.serviceName.toLowerCase().includes('básico')) ? 'X' : ''}</div></div><div className="flex items-center gap-1"><span>MEDIO</span><div className="w-3 h-3 border border-black flex items-center justify-center font-normal">{order.services.some(s => s.serviceName.toLowerCase().includes('ppf') && s.serviceName.toLowerCase().includes('medio')) ? 'X' : ''}</div></div><div className="flex items-center gap-1"><span>PREMIUM</span><div className="w-3 h-3 border border-black flex items-center justify-center font-normal">{order.services.some(s => s.serviceName.toLowerCase().includes('ppf') && s.serviceName.toLowerCase().includes('premium')) ? 'X' : ''}</div></div></div></div>
                    <div className="flex items-center justify-between"><span className="w-24">PDR:</span><div className="w-3 h-3 border border-black flex items-center justify-center font-normal">{order.services.some(s => s.serviceName.toLowerCase().includes('pdr')) ? 'X' : ''}</div></div>
                    <div className="flex items-center justify-between"><span className="w-24">PDA:</span><div className="w-3 h-3 border border-black flex items-center justify-center font-normal">{order.services.some(s => s.serviceName.toLowerCase().includes('pda')) ? 'X' : ''}</div></div>
                    <div className="flex items-center justify-between"><span className="w-24">PAPEL AHUMADO:</span><div className="w-3 h-3 border border-black flex items-center justify-center font-normal">{order.services.some(s => s.serviceName.toLowerCase().includes('papel')) ? 'X' : ''}</div></div>
                  </div>
                  {/* Right Column */}
                  <div className="space-y-1.5 pl-4">
                    <div className="flex items-center justify-between"><span className="w-28">PINTURA:</span><div className="flex gap-2"><div className="flex items-center gap-1"><span>GENERAL</span><div className="w-3 h-3 border border-black flex items-center justify-center font-normal">{order.services.some(s => s.serviceName.toLowerCase().includes('pintura') && s.serviceName.toLowerCase().includes('general')) ? 'X' : ''}</div></div><div className="flex items-center gap-1"><span>RETOQUE</span><div className="w-3 h-3 border border-black flex items-center justify-center font-normal">{order.services.some(s => s.serviceName.toLowerCase().includes('pintura') && s.serviceName.toLowerCase().includes('retoque')) ? 'X' : ''}</div></div></div></div>
                    <div className="flex items-center justify-between"><span className="w-28">LAVADO:</span><div className="flex gap-2"><div className="flex items-center gap-1"><span>CHASIS</span><div className="w-3 h-3 border border-black flex items-center justify-center font-normal">{order.services.some(s => s.serviceName.toLowerCase().includes('lavado') && s.serviceName.toLowerCase().includes('chasis')) ? 'X' : ''}</div></div><div className="flex items-center gap-1"><span>MOTOR</span><div className="w-3 h-3 border border-black flex items-center justify-center font-normal">{order.services.some(s => s.serviceName.toLowerCase().includes('lavado') && s.serviceName.toLowerCase().includes('motor')) ? 'X' : ''}</div></div></div></div>
                    <div className="flex items-center justify-between"><span className="w-28">AIRE ACONDICIONADO:</span><div className="w-3 h-3 border border-black flex items-center justify-center font-normal">{order.services.some(s => s.serviceName.toLowerCase().includes('aire')) ? 'X' : ''}</div></div>
                    <div className="flex items-center justify-between"><span className="w-28">ROTULADO O WRAPS:</span><div className="w-3 h-3 border border-black flex items-center justify-center font-normal">{order.services.some(s => s.serviceName.toLowerCase().includes('rotulado') || s.serviceName.toLowerCase().includes('wrap')) ? 'X' : ''}</div></div>
                    <div className="flex items-center justify-between"><span className="w-28">TAPIZADO:</span><div className="w-3 h-3 border border-black flex items-center justify-center font-normal">{order.services.some(s => s.serviceName.toLowerCase().includes('tapizado')) ? 'X' : ''}</div></div>
                    <div className="flex items-center justify-between"><span className="w-28">MOTO:</span><div className="flex gap-2"><div className="flex items-center gap-1"><span>LAVADO</span><div className="w-3 h-3 border border-black flex items-center justify-center font-normal">{order.services.some(s => s.serviceName.toLowerCase().includes('moto') && s.serviceName.toLowerCase().includes('lavado')) ? 'X' : ''}</div></div><div className="flex items-center gap-1"><span>PULITURA</span><div className="w-3 h-3 border border-black flex items-center justify-center font-normal">{order.services.some(s => s.serviceName.toLowerCase().includes('moto') && s.serviceName.toLowerCase().includes('pulitura')) ? 'X' : ''}</div></div></div></div>
                    <div className="flex items-center justify-between"><span className="w-28">PINTURA DE MOTOS:</span><div className="flex gap-2"><div className="flex items-center gap-1"><span>GENERAL</span><div className="w-3 h-3 border border-black flex items-center justify-center font-normal">{order.services.some(s => s.serviceName.toLowerCase().includes('moto') && s.serviceName.toLowerCase().includes('general')) ? 'X' : ''}</div></div><div className="flex items-center gap-1"><span>RETOQUES</span><div className="w-3 h-3 border border-black flex items-center justify-center font-normal">{order.services.some(s => s.serviceName.toLowerCase().includes('moto') && s.serviceName.toLowerCase().includes('retoque')) ? 'X' : ''}</div></div></div></div>
                  </div>
                </div>
                {order.services.length > 0 && (
                  <div className="mt-2 text-[9px] font-mono border border-dashed border-black/30 p-2">
                    <strong>Servicios ingresados en sistema:</strong> {order.services.map(s => s.serviceName).join(', ')}
                  </div>
                )}
              </div>
            </div>

            {/* --- PAGE 2 --- */}
            <div className="w-full relative bg-white print:break-before-page pt-8">
              <h3 className="text-2xl font-bold text-center mb-6">Observaciones</h3>
              <div className="space-y-6 mb-12">
                <div className="border-b border-black pb-1 min-h-[1.5rem] text-sm font-script text-center text-slate-800">
                  {order.observations || ' '}
                </div>
                {[...Array(9)].map((_,i) => <div key={i} className="border-b border-black pb-1 min-h-[1.5rem]" />)}
              </div>

              <h3 className="text-2xl font-bold text-center mb-6">Pertenencias</h3>
              <div className="space-y-6 mb-12">
                {[...Array(6)].map((_,i) => <div key={i} className="border-b border-black pb-1 min-h-[1.5rem]" />)}
              </div>

              <h3 className="text-2xl font-bold text-center mb-4">Importante</h3>
              <div className="text-[11px] font-bold leading-relaxed mb-16">
                <p>Nuestras condiciones y políticas son las siguientes:</p>
                <p className="font-normal mb-3">El propietario del vehículo, debe verificar el mismo al momento de ingresar y retirar su automóvil, la empresa no se hace responsable por fallas, desperfectos, daños mecánicos o eléctricos que presente el vehículo, ya que solo nos encargamos única y exclusivamente de la parte de estética externa e interna de su vehículo. (embellecimiento automotriz)</p>
                <p className="font-normal">Una vez el vehículo haya dejado las instalaciones la empresa asume que aceptó conforme todo el trabajo realizado</p>
              </div>

              <div className="flex justify-center mt-20 mb-8">
                <div className="flex flex-col items-center gap-1 text-sm font-bold">
                  <div className="w-64 border-b border-black"></div>
                  <span>FIRMA CONFORME</span>
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
