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
    { key: 'gato_hidraulico', label: 'Gato Hidráulico y Palanca' },
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
    <div className="bg-white text-black w-full text-sm font-sans break-words print-taller-container hidden print:block">
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
            <div className="flex items-end border-b border-black">
              <span className="w-20">FECHA:</span>
              <span className="flex-1 pb-0.5 font-normal">{order.entryDate.substring(0, 10)}</span>
            </div>
            <div className="flex items-end border-b border-black">
              <span className="w-20">#ODS:</span>
              <span className="flex-1 pb-0.5 font-normal">{order.orderNumber}</span>
            </div>
            <div className="flex items-end border-b border-black">
              <span className="w-20">TELÉFONO:</span>
              <span className="flex-1 pb-0.5 font-normal">{order.customerPhone}</span>
            </div>
          </div>
        </div>

        {/* Customer & Vehicle Info */}
        <div className="flex flex-col gap-3 mb-4 text-xs font-bold uppercase">
          <div className="flex items-end border-b border-black w-full">
            <span className="w-20">CLIENTE:</span>
            <span className="flex-1 pb-0.5 font-normal">{order.customerName}</span>
          </div>
          <div className="flex items-end border-b border-black w-3/4">
            <span className="w-40">HORA DE RECEPCIÓN:</span>
            <span className="flex-1 pb-0.5 font-normal">{order.entryDate.substring(11, 16)}</span>
          </div>
          <div className="flex items-end gap-2 w-full">
            <div className="flex items-end border-b border-black flex-1">
              <span className="mr-2">MARCA:</span>
              <span className="flex-1 pb-0.5 font-normal">{order.vehicleBrandModel.split(' ')[0]}</span>
            </div>
            <div className="flex items-end border-b border-black flex-1">
              <span className="mr-2">MODELO:</span>
              <span className="flex-1 pb-0.5 font-normal">{order.vehicleBrandModel.split(' ').slice(1).join(' ')}</span>
            </div>
            <div className="flex items-end border-b border-black w-1/4">
              <span className="mr-2">COLOR:</span>
              <span className="flex-1 pb-0.5 font-normal">{order.vehicleColor}</span>
            </div>
            <div className="flex items-end border-b border-black w-1/4">
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
        
        <div className="border border-black p-3 grid grid-cols-2 gap-2 text-[10px] font-bold uppercase bg-black/5">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="w-24">LAVADO:</span>
              <div className="flex items-center gap-2"><span>BÁSICO</span> <CheckBox checked={hasService(['lavado básico', 'lavado basico'])} /></div>
              <div className="flex items-center gap-2"><span>EXTREMO</span> <CheckBox checked={hasService(['lavado extremo', 'lavado premium', 'lavado profundo'])} /></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="w-24">TAPICERÍA:</span>
              <div className="flex items-center gap-2"><span>BÁSICO</span> <CheckBox checked={hasService(['tapicería', 'tapiceria'])} /></div>
              <div className="flex items-center gap-2"><span>EXTREMO</span> <CheckBox checked={hasService(['tapicería extrema', 'tapiceria profunda', 'limpieza extrema'])} /></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="w-24">PULITURA:</span>
              <div className="flex items-center gap-2"><span>SINTÉTICA</span> <CheckBox checked={hasService(['pulitura sintetica', 'pulitura sintética'])} /></div>
              <div className="flex items-center gap-2"><span>CERÁMICA</span> <CheckBox checked={hasService(['cerámica', 'ceramica', 'pulitura ceramica'])} /></div>
            </div>
            <div className="flex items-center justify-between pr-4">
              <span className="w-32">PULITURA DE FAROS:</span>
              <CheckBox checked={hasService(['faros'])} />
            </div>
            <div className="flex items-center justify-between">
              <span className="w-12">PPF:</span>
              <div className="flex items-center gap-2"><span>BÁSICO</span> <CheckBox checked={hasService(['ppf básico', 'ppf basico'])} /></div>
              <div className="flex items-center gap-2"><span>MEDIO</span> <CheckBox checked={hasService(['ppf medio'])} /></div>
              <div className="flex items-center gap-2"><span>PREMIUM</span> <CheckBox checked={hasService(['ppf premium', 'ppf completo'])} /></div>
            </div>
            <div className="flex items-center justify-between pr-4">
              <span className="w-12">PDR:</span>
              <CheckBox checked={hasService(['pdr', 'abolladura'])} />
            </div>
            <div className="flex items-center justify-between pr-4">
              <span className="w-12">PDA:</span>
              <CheckBox checked={hasService(['pda'])} />
            </div>
            <div className="flex items-center justify-between pr-4">
              <span className="w-28">PAPEL AHUMADO:</span>
              <CheckBox checked={hasService(['papel ahumado', 'polarizado'])} />
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="w-24">PINTURA:</span>
              <div className="flex items-center gap-2"><span>GENERAL</span> <CheckBox checked={hasService(['pintura general', 'pintura completa'])} /></div>
              <div className="flex items-center gap-2"><span>RETOQUE</span> <CheckBox checked={hasService(['retoque', 'pintura parcial'])} /></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="w-24">LAVADO:</span>
              <div className="flex items-center gap-2"><span>CHASIS</span> <CheckBox checked={hasService(['chasis'])} /></div>
              <div className="flex items-center gap-2"><span>MOTOR</span> <CheckBox checked={hasService(['motor'])} /></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="w-36">AIRE ACONDICIONADO:</span>
              <CheckBox checked={hasService(['aire acondicionado', 'a/c'])} />
            </div>
            <div className="flex items-center justify-between">
              <span className="w-36">ROTULADO O WRAPS:</span>
              <CheckBox checked={hasService(['rotulado', 'wrap', 'vinil'])} />
            </div>
            <div className="flex items-center justify-between">
              <span className="w-36">TAPIZADO:</span>
              <CheckBox checked={hasService(['tapizado', 'restauración de tapicería'])} />
            </div>
            <div className="flex items-center justify-between">
              <span className="w-16">MOTO:</span>
              <div className="flex items-center gap-2"><span>LAVADO</span> <CheckBox checked={hasService(['moto', 'lavado moto'])} /></div>
              <div className="flex items-center gap-2"><span>PULITURA</span> <CheckBox checked={hasService(['pulitura moto'])} /></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="w-24 text-transparent">PINTURA</span>
              <div className="flex items-center gap-2"><span>PINTURA GENERAL</span> <CheckBox checked={hasService(['pintura moto general'])} /></div>
              <div className="flex items-center gap-2"><span>RETOQUES</span> <CheckBox checked={hasService(['retoque moto'])} /></div>
            </div>
          </div>
        </div>
      </div>

      {/* PAGE 2 */}
      <div className="p-4 sm:p-6 flex flex-col" style={{ pageBreakBefore: 'always' }}>
        
        <h2 className="text-center text-2xl font-bold mb-3 mt-2">Observaciones</h2>
        <div className="flex flex-col gap-4 mb-4">
          {order.observations ? (
            <div className="border-b border-black text-sm italic h-6 px-2">{order.observations}</div>
          ) : (
            <div className="border-b border-black h-6 w-full"></div>
          )}
          <div className="border-b border-black h-6 w-full"></div>
          <div className="border-b border-black h-6 w-full"></div>
          <div className="border-b border-black h-6 w-full"></div>
          <div className="border-b border-black h-6 w-full"></div>
          <div className="border-b border-black h-6 w-full"></div>
        </div>

        <h2 className="text-center text-2xl font-bold mb-3">Pertenencias</h2>
        <div className="flex flex-col gap-4 mb-4">
          {order.belongingsList && order.belongingsList.length > 0 ? (
            <div className="border-b border-black text-sm italic h-6 px-2">{order.belongingsList.join(', ')}</div>
          ) : (
            <div className="border-b border-black h-6 w-full"></div>
          )}
          <div className="border-b border-black h-6 w-full"></div>
          <div className="border-b border-black h-6 w-full"></div>
          <div className="border-b border-black h-6 w-full"></div>
        </div>

        <h2 className="text-center text-xl font-bold mb-2">Importante</h2>
        <div className="text-xs font-bold leading-snug mb-4 px-2">
          <p>Nuestras condiciones y políticas son las siguientes:</p>
          <p className="mt-1 text-justify">El propietario del vehículo, debe verificar el mismo al momento de ingresar y retirar su automóvil, la empresa no se hace responsable por fallas, desperfectos, daños mecánicos o eléctricos que presente el vehículo, ya que solo nos encargamos única y exclusivamente de la parte de estética externa e interna de su vehículo. (embellecimiento automotriz).</p>
          <p className="mt-2 text-justify">Una vez el vehículo haya dejado las instalaciones la empresa asume que aceptó conforme todo el trabajo realizado.</p>
        </div>

        <div className="mt-6 flex flex-col items-center mb-4">
          <div className="border-t border-black w-80 text-center pt-2 font-bold text-lg">
            FIRMA CONFORME
          </div>
        </div>
      </div>
    </div>
  );
};
