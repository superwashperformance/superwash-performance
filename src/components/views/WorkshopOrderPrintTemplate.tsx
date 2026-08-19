import React from 'react';
import { ServiceOrder } from '../../types';
import { FaviconLogo } from '../common/FaviconLogo';

interface WorkshopOrderPrintTemplateProps {
  order: ServiceOrder;
}

export const WorkshopOrderPrintTemplate: React.FC<WorkshopOrderPrintTemplateProps> = ({ order }) => {
  // Utility to check if any keyword exists in the services list
  const hasService = (keywords: string[]) => {
    if (!order.services) return false;
    return order.services.some((s) =>
      keywords.some((k) => s.serviceName.toLowerCase().includes(k.toLowerCase()))
    );
  };

  const getConditionMark = (key: string, targetCondition: 'ok' | 'damaged') => {
    const item = order.checklist?.find((c) => c.key === key);
    if (!item) return ' ';
    // We map 'ok' to SIN NOVEDAD (targetCondition 'ok')
    // We map 'damaged', 'missing', 'observation' to NOVEDAD (targetCondition 'damaged')
    if (targetCondition === 'ok') {
      return item.condition === 'ok' ? 'X' : ' ';
    } else {
      return item.condition !== 'ok' ? 'X' : ' ';
    }
  };

  // We use the 20 checklist points from ODSCreateView
  const checklistData = [
    { key: 'bateria', label: 'Batería y Carga de Voltaje' },
    { key: 'luces_internas', label: 'Luces Internas y de Ambiente' },
    { key: 'luces_externas', label: 'Luces Externas / Faros' },
    { key: 'luces_tablero', label: 'Indicadores de Tablero / Alertas' },
    { key: 'aire_acondicionado', label: 'Aire Acondicionado' },
    { key: 'bocina', label: 'Bocina / Claxon' },
    { key: 'alfombras', label: 'Alfombras de Habitáculo' },
    { key: 'limpiaparabrisas', label: 'Limpiaparabrisas / Plumas' },
    { key: 'caucho_repuesto', label: 'Caucho de Repuesto' },
    { key: 'gato_hidraulico', label: 'Gato Hidráulico' },
    { key: 'triangulo', label: 'Triángulo de Seguridad' },
    { key: 'estereo', label: 'Estéreo / Multimedia' },
    { key: 'rociadores', label: 'Rociadores de Agua' },
    { key: 'ventanas', label: 'Ventanas y Elevalunas' },
    { key: 'parabrisas', label: 'Parabrisas Frontal y Trasero' },
    { key: 'tuercas', label: 'Tuercas de Rines / Seguridad' },
    { key: 'manillas', label: 'Manillas de Puertas' },
    { key: 'puertas', label: 'Puertas y Capó' },
    { key: 'accesorios', label: 'Accesorios Especiales / Cámaras' },
    { key: 'otros', label: 'Otros Detalles Mecánicos / Escape' },
  ];

  // Helper to render a checkbox square
  const CheckBox = ({ checked }: { checked: boolean }) => (
    <div className="w-4 h-4 border border-black flex items-center justify-center text-xs font-bold shrink-0">
      {checked ? 'X' : ' '}
    </div>
  );

  return (
    <div className="bg-[var(--color-bg-surface)] text-black w-full text-sm font-sans break-words print-taller-container hidden print:block">
      {/* PAGE 1 */}
      <div className="p-4 sm:p-6 flex flex-col" style={{ pageBreakAfter: 'always' }}>
        {/* Header Section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <FaviconLogo size={64} className="text-black" />
          </div>
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-4xl font-black italic tracking-tighter">ODS</h1>
            <p className="text-xs">Orden de servicio</p>
            <p className="text-xs">Inspección del vehículo</p>
          </div>
          <div className="flex flex-col gap-2 w-64 text-xs font-bold">
            <div className="flex items-end">
              <span className="w-20">FECHA:</span>
              <span className="flex-1 pb-0.5 font-normal">{order.entryDate.substring(0, 10)}</span>
            </div>
            <div className="flex items-end">
              <span className="w-20">#ODS:</span>
              <span className="flex-1 pb-0.5 font-normal">{order.orderNumber}</span>
            </div>
            <div className="flex items-end">
              <span className="w-20">TELÉFONO:</span>
              <span className="flex-1 pb-0.5 font-normal">{order.customerPhone}</span>
            </div>
            {order.branchName && (
              <div className="flex items-end mt-1 text-[#7A1B28]">
                <span className="w-20">SEDE:</span>
                <span className="flex-1 pb-0.5 font-bold">{order.branchName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Customer & Vehicle Info */}
        <div className="flex flex-col gap-3 mb-4 text-xs font-bold uppercase">
          <div className="flex items-end w-full">
            <span className="w-20">CLIENTE:</span>
            <span className="flex-1 pb-0.5 font-normal">{order.customerName}</span>
          </div>
          <div className="flex items-end w-3/4">
            <span className="w-40">HORA DE RECEPCIÓN:</span>
            <span className="flex-1 pb-0.5 font-normal">{order.entryDate.substring(11, 16)}</span>
          </div>
          <div className="flex items-end gap-2 w-full">
            <div className="flex items-end flex-1">
              <span className="mr-2">MARCA:</span>
              <span className="flex-1 pb-0.5 font-normal">{order.vehicleBrandModel.split(' ')[0]}</span>
            </div>
            <div className="flex items-end flex-1">
              <span className="mr-2">MODELO:</span>
              <span className="flex-1 pb-0.5 font-normal">{order.vehicleBrandModel.split(' ').slice(1).join(' ')}</span>
            </div>
            <div className="flex items-end w-1/4">
              <span className="mr-2">COLOR:</span>
              <span className="flex-1 pb-0.5 font-normal">{order.vehicleColor}</span>
            </div>
            <div className="flex items-end w-1/4">
              <span className="mr-2">PLACA:</span>
              <span className="flex-1 pb-0.5 font-normal">{order.vehiclePlate}</span>
            </div>
          </div>
        </div>

        {/* Chequeo General */}
        <h2 className="text-center text-2xl font-bold mb-2" style={{ fontFamily: 'cursive' }}>Chequeo general</h2>
        
        <div className="grid grid-cols-2 gap-x-8 gap-y-0.5 mb-4">
          {checklistData.map((item, index) => (
            <div key={item.key} className="flex items-center justify-between border-b border-black/20 pb-1">
              <span className="text-[10px] font-bold uppercase flex-1">{item.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold border border-black/20 px-1 py-0.5">SIN NOVEDAD</span>
                <CheckBox checked={getConditionMark(item.key, 'ok') === 'X'} />
                <span className="text-[10px] font-bold border border-black/20 px-1 py-0.5 ml-2">NOVEDAD</span>
                <CheckBox checked={getConditionMark(item.key, 'damaged') === 'X'} />
              </div>
            </div>
          ))}
        </div>

        {/* Servicios */}
        <h2 className="text-center text-2xl font-bold mb-2 mt-2" style={{ fontFamily: 'cursive' }}>Servicios</h2>
        <div className="border border-black p-3 grid grid-cols-2 gap-x-6 gap-y-2 text-[10px] font-bold uppercase bg-black/5">
          {/* Left Column */}
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-[120px_1fr_1fr] items-center">
              <span>LAVADO:</span>
              <div className="flex items-center justify-end gap-2"><span>BÁSICO</span> <CheckBox checked={hasService(['lavado básico', 'lavado basico'])} /></div>
              <div className="flex items-center justify-end gap-2"><span>EXTREMO</span> <CheckBox checked={hasService(['lavado extremo', 'lavado premium', 'lavado profundo'])} /></div>
            </div>
            <div className="grid grid-cols-[120px_1fr_1fr] items-center">
              <span>TAPICERÍA:</span>
              <div className="flex items-center justify-end gap-2"><span>BÁSICO</span> <CheckBox checked={hasService(['tapicería', 'tapiceria'])} /></div>
              <div className="flex items-center justify-end gap-2"><span>EXTREMO</span> <CheckBox checked={hasService(['tapicería extrema', 'tapiceria profunda', 'limpieza extrema'])} /></div>
            </div>
            <div className="grid grid-cols-[120px_1fr_1fr] items-center">
              <span>PULITURA:</span>
              <div className="flex items-center justify-end gap-2"><span>SINTÉTICA</span> <CheckBox checked={hasService(['pulitura sintetica', 'pulitura sintética'])} /></div>
              <div className="flex items-center justify-end gap-2"><span>CERÁMICA</span> <CheckBox checked={hasService(['cerámica', 'ceramica', 'pulitura ceramica'])} /></div>
            </div>
            <div className="grid grid-cols-[120px_1fr_1fr] items-center">
              <span className="truncate">PULITURA DE FAROS:</span>
              <div></div>
              <div className="flex items-center justify-end"><CheckBox checked={hasService(['faros'])} /></div>
            </div>
            <div className="grid grid-cols-[120px_1fr_1fr] items-center">
              <span>PPF:</span>
              <div className="flex items-center justify-end gap-2"><span>BÁSICO</span> <CheckBox checked={hasService(['ppf básico', 'ppf basico'])} /></div>
              <div className="flex items-center justify-end gap-2"><span>PREMIUM</span> <CheckBox checked={hasService(['ppf premium', 'ppf completo'])} /></div>
            </div>
            <div className="grid grid-cols-[120px_1fr_1fr] items-center">
              <span>PDR:</span>
              <div></div>
              <div className="flex items-center justify-end"><CheckBox checked={hasService(['pdr', 'abolladura'])} /></div>
            </div>
            <div className="grid grid-cols-[120px_1fr_1fr] items-center">
              <span>PDA:</span>
              <div></div>
              <div className="flex items-center justify-end"><CheckBox checked={hasService(['pda'])} /></div>
            </div>
            <div className="grid grid-cols-[120px_1fr_1fr] items-center">
              <span>PAPEL AHUMADO:</span>
              <div></div>
              <div className="flex items-center justify-end"><CheckBox checked={hasService(['papel ahumado', 'polarizado'])} /></div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-[130px_1fr_1fr] items-center">
              <span>PINTURA:</span>
              <div className="flex items-center justify-end gap-2"><span>GENERAL</span> <CheckBox checked={hasService(['pintura general', 'pintura completa'])} /></div>
              <div className="flex items-center justify-end gap-2"><span>RETOQUE</span> <CheckBox checked={hasService(['retoque', 'pintura parcial'])} /></div>
            </div>
            <div className="grid grid-cols-[130px_1fr_1fr] items-center">
              <span>LAVADO:</span>
              <div className="flex items-center justify-end gap-2"><span>CHASIS</span> <CheckBox checked={hasService(['chasis'])} /></div>
              <div className="flex items-center justify-end gap-2"><span>MOTOR</span> <CheckBox checked={hasService(['motor'])} /></div>
            </div>
            <div className="grid grid-cols-[130px_1fr_1fr] items-center">
              <span className="truncate">AIRE ACONDICIONADO:</span>
              <div></div>
              <div className="flex items-center justify-end"><CheckBox checked={hasService(['aire acondicionado', 'a/c'])} /></div>
            </div>
            <div className="grid grid-cols-[130px_1fr_1fr] items-center">
              <span className="truncate">ROTULADO O WRAPS:</span>
              <div></div>
              <div className="flex items-center justify-end"><CheckBox checked={hasService(['rotulado', 'wrap', 'vinil'])} /></div>
            </div>
            <div className="grid grid-cols-[130px_1fr_1fr] items-center">
              <span>TAPIZADO:</span>
              <div></div>
              <div className="flex items-center justify-end"><CheckBox checked={hasService(['tapizado', 'restauración de tapicería'])} /></div>
            </div>
            <div className="grid grid-cols-[130px_1fr_1fr] items-center">
              <span>MOTO:</span>
              <div className="flex items-center justify-end gap-2"><span>LAVADO</span> <CheckBox checked={hasService(['moto', 'lavado moto'])} /></div>
              <div className="flex items-center justify-end gap-2"><span>PULITURA</span> <CheckBox checked={hasService(['pulitura moto'])} /></div>
            </div>
            <div className="grid grid-cols-[130px_1fr_1fr] items-center">
              <span className="text-transparent">PINTURA</span>
              <div className="flex items-center justify-end gap-2"><span>PINTURA GRAL</span> <CheckBox checked={hasService(['pintura moto general'])} /></div>
              <div className="flex items-center justify-end gap-2"><span>RETOQUES</span> <CheckBox checked={hasService(['retoque moto'])} /></div>
            </div>
          </div>
        </div>
      </div>

      {/* PAGE 2 */}
      <div className="p-4 sm:p-6 flex flex-col" style={{ pageBreakBefore: 'always' }}>
        
        <h2 className="text-center text-2xl font-bold mb-4 mt-4">Observaciones</h2>
        <div className="flex flex-col gap-6 mb-6">
          {order.observations ? (
            <div className="border-b border-black text-sm italic h-8 px-2">{order.observations}</div>
          ) : (
            <div className="border-b border-black h-8 w-full"></div>
          )}
          <div className="border-b border-black h-8 w-full"></div>
          <div className="border-b border-black h-8 w-full"></div>
          <div className="border-b border-black h-8 w-full"></div>
          <div className="border-b border-black h-8 w-full"></div>
          <div className="border-b border-black h-8 w-full"></div>
        </div>

        <h2 className="text-center text-2xl font-bold mb-4 mt-2">Pertenencias</h2>
        <div className="flex flex-col gap-6 mb-8">
          {order.belongingsList && order.belongingsList.length > 0 ? (
            <div className="border-b border-black text-sm italic h-8 px-2">{order.belongingsList.join(', ')}</div>
          ) : (
            <div className="border-b border-black h-8 w-full"></div>
          )}
          <div className="border-b border-black h-8 w-full"></div>
          <div className="border-b border-black h-8 w-full"></div>
          <div className="border-b border-black h-8 w-full"></div>
        </div>

        <h2 className="text-center text-xl font-bold mb-2">Importante</h2>
        <div className="text-xs font-bold leading-relaxed mb-6 px-2">
          <p>Nuestras condiciones y políticas son las siguientes:</p>
          <p className="mt-1 text-justify">El propietario del vehículo, debe verificar el mismo al momento de ingresar y retirar su automóvil, la empresa no se hace responsable por fallas, desperfectos, daños mecánicos o eléctricos que presente el vehículo, ya que solo nos encargamos única y exclusivamente de la parte de estética externa e interna de su vehículo. (embellecimiento automotriz).</p>
          <p className="mt-2 text-justify">Una vez el vehículo haya dejado las instalaciones la empresa asume que aceptó conforme todo el trabajo realizado.</p>
        </div>

        <div className="mt-8 flex flex-col items-center mb-8">
          {order.clientSignature ? (
            <img src={order.clientSignature} alt="Firma del cliente" className="h-24 object-contain mb-2" />
          ) : (
            <div className="h-24"></div>
          )}
          <div className="border-t border-black w-80 text-center pt-2">
            <div className="font-bold text-lg">FIRMA CONFORME</div>
            <div className="text-sm font-semibold uppercase mt-1">{order.customerName}</div>
            {order.customerDocumentId && <div className="text-xs uppercase">{order.customerDocumentId}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};
