import React, { useState, useEffect } from 'react';
import { CurrencyDisplay } from '../common/CurrencyDisplay';
import { ServiceOrder } from '../../types';
import { FaviconLogo } from '../common/FaviconLogo';
import { VehicleDiagram360 } from '../common/VehicleDiagram360';
import { X, Printer, FileCheck, FileText, Camera, ShieldAlert } from 'lucide-react';

interface ODSDetailModalProps {
  order: ServiceOrder | null;
  onClose: () => void;
}

export const ODSDetailModal: React.FC<ODSDetailModalProps> = ({ order, onClose }) => {
  const [activeTab, setActiveTab] = useState<'quote' | 'photos' | 'checklist' | 'damages'>('quote');
  const [printMode, setPrintMode] = useState<'invoice' | 'inspection' | null>(null);

  if (!order) return null;

  const handlePrint = (mode: 'invoice' | 'inspection') => {
    setPrintMode(mode);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  useEffect(() => {
    const handleAfterPrint = () => setPrintMode(null);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

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
            <button onClick={() => handlePrint('invoice')} className="btn-nike-secondary text-xs py-2 px-3 flex items-center gap-1.5" title="Imprimir Recibo (Precios)">
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Recibo</span>
            </button>
            <button onClick={() => handlePrint('inspection')} className="btn-nike bg-white text-black text-xs py-2 px-3 flex items-center gap-1.5" title="Imprimir Formato de Inspección">
              <FileCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Formato</span>
            </button>

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
            { id: 'checklist', label: 'CHECKLIST 20 PUNTOS', icon: FileCheck },
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
          <div id="printable-quote" className={`flex flex-col gap-6 bg-slate-950 p-6 rounded-2xl border border-white/10 ${activeTab === 'quote' ? 'flex' : 'hidden'} ${printMode === 'invoice' || printMode === null ? (activeTab === 'quote' ? 'print:flex' : 'print:hidden') : 'print:hidden'}`}>
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

          {/* PRINT ONLY: FORMATO FÍSICO (INSPECCIÓN) */}
          <div id="printable-inspection" className={`hidden ${printMode === 'inspection' ? 'print:block' : 'print:hidden'} bg-white text-black p-8 font-sans`}>
            {/* Header */}
            <div className="flex justify-between items-start mb-6 border-b border-black pb-4">
              <div className="flex items-center gap-4">
                {/* Simulated Logo Area */}
                <div className="w-24 h-24 rounded-full border-4 border-black flex items-center justify-center font-bold text-center leading-tight">
                  <span className="font-display italic text-2xl">Super<br/>Wash</span>
                </div>
                <div>
                  <h1 className="font-bold text-4xl italic tracking-tighter">ODS</h1>
                  <p className="text-xs uppercase font-semibold">Orden de servicio<br/>Inspección del vehículo</p>
                </div>
              </div>
              <div className="text-xs uppercase font-bold space-y-2 text-right mt-4">
                <p>FECHA: <span className="underline ml-2 inline-block w-32">{order.entryDate.split(',')[0]}</span></p>
                <p>#ODS: <span className="underline ml-2 inline-block w-32">{order.orderNumber}</span></p>
                <p>TELÉFONO: <span className="underline ml-2 inline-block w-32">{order.customerPhone}</span></p>
              </div>
            </div>

            {/* Customer & Vehicle Info */}
            <div className="text-xs uppercase font-bold space-y-4 mb-6">
              <div className="flex">
                <span className="w-24">CLIENTE:</span>
                <span className="flex-1 border-b border-black">{order.customerName}</span>
              </div>
              <div className="flex">
                <span className="w-40">HORA DE RECEPCIÓN:</span>
                <span className="flex-1 border-b border-black">{order.entryDate.split(',')[1] || ''}</span>
              </div>
              <div className="flex gap-4">
                <div className="flex flex-1">
                  <span className="mr-2">MARCA:</span>
                  <span className="flex-1 border-b border-black">{order.vehicleBrandModel.split(' ')[0] || ''}</span>
                </div>
                <div className="flex flex-1">
                  <span className="mr-2">MODELO:</span>
                  <span className="flex-1 border-b border-black">{order.vehicleBrandModel.split(' ').slice(1).join(' ') || ''}</span>
                </div>
                <div className="flex flex-1">
                  <span className="mr-2">COLOR:</span>
                  <span className="flex-1 border-b border-black">{order.vehicleColor}</span>
                </div>
                <div className="flex flex-1">
                  <span className="mr-2">PLACA:</span>
                  <span className="flex-1 border-b border-black">{order.vehiclePlate}</span>
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div className="mb-6">
              <h2 className="text-3xl text-center font-serif italic mb-2">Chequeo general</h2>
              <div className="grid grid-cols-1 text-[10px] font-bold uppercase gap-y-0.5">
                {order.checklist && order.checklist.map(item => (
                  <div key={item.id} className="flex justify-between items-center">
                    <span className="w-1/2 border-b border-black border-dashed pb-0.5">{item.label}</span>
                    <div className="w-1/2 flex justify-end gap-4">
                      <div className="flex items-center gap-1">
                        <span>SIN NOVEDAD</span>
                        <div className="w-4 h-4 border border-black flex items-center justify-center font-bold">{item.condition === 'ok' ? 'X' : ''}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>NOVEDAD</span>
                        <div className="w-4 h-4 border border-black flex items-center justify-center font-bold">{item.condition !== 'ok' ? 'X' : ''}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Services Matrix Placeholder - Simplified for printing */}
            <div className="mb-6">
              <h2 className="text-3xl text-center font-serif italic mb-2">Servicios</h2>
              <div className="border border-black p-4 grid grid-cols-3 gap-4 text-[10px] font-bold uppercase">
                <div className="space-y-2">
                  <div className="flex justify-between"><span className="w-24">LAVADO:</span><span>BÁSICO <div className="inline-block w-4 h-4 border border-black ml-1 align-middle"></div></span></div>
                  <div className="flex justify-between"><span className="w-24">TAPICERÍA:</span><span>BÁSICO <div className="inline-block w-4 h-4 border border-black ml-1 align-middle"></div></span></div>
                  <div className="flex justify-between"><span className="w-24">PULITURA:</span><span>SINTÉTICA <div className="inline-block w-4 h-4 border border-black ml-1 align-middle"></div></span></div>
                  <div className="flex justify-between"><span className="w-32">PULITURA DE FAROS:</span><div className="inline-block w-4 h-4 border border-black align-middle"></div></div>
                  <div className="flex items-center gap-1">PPF: BÁSICO <div className="w-4 h-4 border border-black"></div> MEDIO <div className="w-4 h-4 border border-black"></div> PREMIUM <div className="w-4 h-4 border border-black"></div></div>
                  <div className="flex justify-between"><span className="w-24">PDR:</span><div className="inline-block w-4 h-4 border border-black align-middle"></div></div>
                  <div className="flex justify-between"><span className="w-24">PDA:</span><div className="inline-block w-4 h-4 border border-black align-middle"></div></div>
                  <div className="flex justify-between"><span className="w-24">PAPEL AHUMADO:</span><div className="inline-block w-4 h-4 border border-black align-middle"></div></div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between"><span className="w-24"></span><span>EXTREMO <div className="inline-block w-4 h-4 border border-black ml-1 align-middle"></div></span></div>
                  <div className="flex justify-between"><span className="w-24"></span><span>EXTREMO <div className="inline-block w-4 h-4 border border-black ml-1 align-middle"></div></span></div>
                  <div className="flex justify-between"><span className="w-24"></span><span>CERÁMICA <div className="inline-block w-4 h-4 border border-black ml-1 align-middle"></div></span></div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between"><span>PINTURA:</span><span>GENERAL <div className="inline-block w-4 h-4 border border-black ml-1 align-middle"></div> RETOQUE <div className="inline-block w-4 h-4 border border-black ml-1 align-middle"></div></span></div>
                  <div className="flex justify-between"><span>LAVADO:</span><span>CHASIS <div className="inline-block w-4 h-4 border border-black ml-1 align-middle"></div> MOTOR <div className="inline-block w-4 h-4 border border-black ml-1 align-middle"></div></span></div>
                  <div className="flex justify-between"><span>AIRE ACONDICIONADO:</span><div className="inline-block w-4 h-4 border border-black align-middle"></div></div>
                  <div className="flex justify-between"><span>ROTULADO O WRAPS:</span><div className="inline-block w-4 h-4 border border-black align-middle"></div></div>
                  <div className="flex justify-between"><span>TAPIZADO:</span><div className="inline-block w-4 h-4 border border-black align-middle"></div></div>
                  <div className="flex justify-between"><span>MOTO:</span><span>LAVADO <div className="inline-block w-4 h-4 border border-black ml-1 align-middle"></div> PULITURA <div className="inline-block w-4 h-4 border border-black ml-1 align-middle"></div></span></div>
                  <div className="flex justify-between"><span>PINTURA DE MOTOS:</span><span>GENERAL <div className="inline-block w-4 h-4 border border-black ml-1 align-middle"></div> RETOQUES <div className="inline-block w-4 h-4 border border-black ml-1 align-middle"></div></span></div>
                </div>
              </div>
            </div>

            {/* Observaciones y Pertenencias (Back Side logic) */}
            <div className="mt-12 space-y-6">
              <div>
                <h2 className="text-2xl text-center font-bold mb-2">Observaciones</h2>
                <div className="space-y-4">
                  <div className="border-b border-black w-full min-h-[20px]">{order.observations || ''}</div>
                  <div className="border-b border-black w-full min-h-[20px]"></div>
                  <div className="border-b border-black w-full min-h-[20px]"></div>
                  <div className="border-b border-black w-full min-h-[20px]"></div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl text-center font-bold mb-2">Pertenencias</h2>
                <div className="space-y-4">
                  <div className="border-b border-black w-full min-h-[20px]">{order.belongings && order.belongings.length > 0 ? order.belongings.join(', ') : ''}</div>
                  <div className="border-b border-black w-full min-h-[20px]"></div>
                  <div className="border-b border-black w-full min-h-[20px]"></div>
                </div>
              </div>

              <div className="pt-4">
                <h2 className="text-2xl text-center font-bold mb-2">Importante</h2>
                <div className="text-[10px] text-justify font-bold uppercase space-y-2">
                  <p>Nuestras condiciones y políticas son las siguientes:</p>
                  <p>El propietario del vehículo, debe verificar el mismo al momento de ingresar y retirar su automóvil, la empresa no se hace responsable por fallas, desperfectos, daños mecánicos o eléctricos que presente el vehículo, ya que solo nos encargamos única y exclusivamente de la parte de estética externa e interna de su vehículo. (embellecimiento automotriz)</p>
                  <p>Una vez el vehículo haya dejado las instalaciones la empresa asume que aceptó conforme todo el trabajo realizado.</p>
                </div>
              </div>

              <div className="pt-16 pb-8 flex items-center justify-center">
                <span className="font-bold uppercase mr-4">FIRMA CONFORME</span>
                <span className="inline-block w-64 border-b border-black"></span>
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
