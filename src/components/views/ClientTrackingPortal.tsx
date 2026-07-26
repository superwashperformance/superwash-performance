import React, { useEffect, useState } from 'react';
import { ServiceOrder } from '../../types';
import { FaviconLogo } from '../common/FaviconLogo';
import { odsService } from '../../services/odsService';
import { ArrowLeft, Loader2, Search, CheckCircle2, AlertCircle, Clock, MapPin, Car } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ClientTrackingPortalProps {
  initialPlate: string;
  onExit: () => void;
}

export const ClientTrackingPortal: React.FC<ClientTrackingPortalProps> = ({ initialPlate, onExit }) => {
  const [plate, setPlate] = useState(initialPlate);
  const [order, setOrder] = useState<ServiceOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async (searchPlate: string) => {
    if (!searchPlate.trim()) return;
    try {
      setLoading(true);
      setError(null);
      const data = await odsService.getTrackingByPlate(searchPlate);
      if (data) {
        setOrder(data);
      } else {
        setOrder(null);
        setError('No se encontró ninguna orden activa para esta placa.');
      }
    } catch (err) {
      console.error(err);
      setError('Error de conexión al buscar la orden.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialPlate) {
      fetchOrder(initialPlate);
    }
  }, [initialPlate]);

  // Realtime subscription for this specific plate
  useEffect(() => {
    if (!order) return;

    const channel = supabase
      .channel('public_tracking_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'service_orders' },
        (payload) => {
          // If the changed order matches our tracked order, refresh
          if (payload.new && (payload.new as any).id === order.id) {
            fetchOrder(plate);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [order?.id, plate]);

  const getProgressStep = (status: string) => {
    const steps = {
      received: 1,
      diagnosis: 1,
      quote_sent: 1,
      quote_approved: 2,
      in_progress: 3,
      waiting_parts: 3,
      quality_control: 4,
      completed: 4,
      delivered: 5,
    };
    return steps[status as keyof typeof steps] || 1;
  };

  const getStatusMessage = (status: string) => {
    const messages = {
      received: 'Vehículo recibido. En cola para diagnóstico.',
      diagnosis: 'En proceso de diagnóstico y evaluación.',
      quote_sent: 'Presupuesto enviado. Esperando tu aprobación.',
      quote_approved: 'Presupuesto aprobado. Iniciando preparativos.',
      in_progress: 'Vehículo en línea de trabajo. Los técnicos están operando.',
      waiting_parts: 'Trabajo pausado temporalmente (Esperando repuestos).',
      quality_control: 'Trabajo terminado. En fase de control de calidad (Detailing final).',
      completed: '¡Vehículo listo para retirar!',
      delivered: 'Vehículo entregado. ¡Gracias por preferirnos!',
    };
    return messages[status as keyof typeof messages] || 'Estado desconocido';
  };

  const currentStep = order ? getProgressStep(order.status) : 0;

  return (
    <div className="min-h-screen bg-[#040609] text-white flex flex-col font-sans selection:bg-[#00E5FF] selection:text-black">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[radial-gradient(#00E5FF_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.03] pointer-events-none" />
      <div className="fixed top-0 left-0 w-full h-96 bg-gradient-to-b from-cyan-900/20 to-transparent pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-4 md:px-8 border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <FaviconLogo size={32} />
          <span className="font-display tracking-widest text-sm md:text-lg text-white">SUPER WASH PERFORMANCE</span>
        </div>
        <button 
          onClick={onExit}
          className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> VOLVER
        </button>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center p-4 md:p-8">
        
        {/* Search Bar */}
        <div className="w-full max-w-2xl bg-slate-900/80 border border-white/10 rounded-2xl p-2 flex items-center gap-2 mb-8 shadow-2xl backdrop-blur-xl">
          <Search className="w-5 h-5 text-slate-500 ml-3" />
          <input
            type="text"
            placeholder="Ingresa tu Placa (ej. ABC-123)"
            value={plate}
            onChange={(e) => setPlate(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && fetchOrder(plate)}
            className="flex-1 bg-transparent border-none outline-none text-white px-2 uppercase font-mono placeholder:text-slate-600 placeholder:normal-case"
          />
          <button 
            onClick={() => fetchOrder(plate)}
            disabled={loading || !plate.trim()}
            className="btn-nike-primary px-6 py-2 rounded-xl text-xs disabled:opacity-50"
          >
            BUSCAR
          </button>
        </div>

        {/* Tracking Card */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-cyan-400">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="font-mono text-sm animate-pulse">Consultando estado del vehículo...</p>
          </div>
        ) : error ? (
          <div className="w-full max-w-2xl bg-red-950/30 border border-red-500/30 rounded-2xl p-8 text-center flex flex-col items-center gap-3">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <h3 className="text-xl font-display text-white">VEHÍCULO NO ENCONTRADO</h3>
            <p className="text-sm text-slate-400 font-mono">{error}</p>
          </div>
        ) : order ? (
          <div className="w-full max-w-2xl flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4">
            
            {/* Vehicle Info Badge */}
            <div className="nike-card p-6 flex flex-col md:flex-row items-center justify-between gap-4 border-cyan-500/30 bg-gradient-to-br from-slate-900 to-black">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-cyan-950 flex items-center justify-center border border-cyan-500/50 shadow-[0_0_15px_rgba(0,229,255,0.2)]">
                  <Car className="w-8 h-8 text-cyan-400" />
                </div>
                <div>
                  <h2 className="font-display text-2xl text-white">{order.vehicleBrandModel}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="bg-white text-black px-2 py-0.5 rounded font-mono text-xs font-bold tracking-widest">{order.vehiclePlate}</span>
                    <span className="text-slate-400 text-xs">• ODS: {order.orderNumber}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-mono text-slate-500 uppercase">Ingreso al taller</p>
                <p className="text-sm text-slate-300 flex items-center gap-1 justify-end"><Clock className="w-3.5 h-3.5" /> {order.entryDate.split(',')[0]}</p>
              </div>
            </div>

            {/* Status Pipeline */}
            <div className="nike-card p-6 md:p-8">
              <h3 className="font-display text-xl text-white mb-8 text-center">ESTADO ACTUAL</h3>
              
              <div className="relative">
                {/* Connecting Line */}
                <div className="absolute top-5 left-[10%] right-[10%] h-1 bg-slate-800 rounded-full z-0">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${(Math.max(1, currentStep) - 1) * 33.33}%` }} 
                  />
                </div>

                <div className="relative z-10 flex justify-between">
                  {/* Step 1: Recepción */}
                  <div className="flex flex-col items-center gap-2 w-1/4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${currentStep >= 1 ? 'bg-cyan-500 border-cyan-400 text-black shadow-[0_0_15px_rgba(0,229,255,0.5)]' : 'bg-slate-900 border-slate-700 text-slate-500'}`}>
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-display uppercase tracking-wider text-center ${currentStep >= 1 ? 'text-cyan-400' : 'text-slate-500'}`}>Recepción</span>
                  </div>

                  {/* Step 2: Aprobación */}
                  <div className="flex flex-col items-center gap-2 w-1/4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${currentStep >= 2 ? 'bg-cyan-500 border-cyan-400 text-black shadow-[0_0_15px_rgba(0,229,255,0.5)]' : 'bg-slate-900 border-slate-700 text-slate-500'}`}>
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-display uppercase tracking-wider text-center ${currentStep >= 2 ? 'text-cyan-400' : 'text-slate-500'}`}>Aprobación</span>
                  </div>

                  {/* Step 3: En Proceso */}
                  <div className="flex flex-col items-center gap-2 w-1/4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${currentStep >= 3 ? 'bg-cyan-500 border-cyan-400 text-black shadow-[0_0_15px_rgba(0,229,255,0.5)]' : 'bg-slate-900 border-slate-700 text-slate-500'}`}>
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-display uppercase tracking-wider text-center ${currentStep >= 3 ? 'text-cyan-400' : 'text-slate-500'}`}>En Proceso</span>
                  </div>

                  {/* Step 4: Finalizado */}
                  <div className="flex flex-col items-center gap-2 w-1/4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${currentStep >= 4 ? 'bg-cyan-500 border-cyan-400 text-black shadow-[0_0_15px_rgba(0,229,255,0.5)]' : 'bg-slate-900 border-slate-700 text-slate-500'}`}>
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-display uppercase tracking-wider text-center ${currentStep >= 4 ? 'text-cyan-400' : 'text-slate-500'}`}>Control / Listo</span>
                  </div>
                </div>
              </div>

              {/* Status Message */}
              <div className="mt-8 p-4 bg-slate-900/50 rounded-xl border border-white/5 text-center">
                <span className="font-mono text-cyan-400 block mb-1 uppercase tracking-widest text-xs">Fase Actual</span>
                <p className="text-white text-lg font-medium">{getStatusMessage(order.status)}</p>
              </div>

            </div>

            {/* Support / WhatsApp CTA */}
            <a 
              href="https://wa.me/584140000000" 
              target="_blank" 
              rel="noreferrer"
              className="mt-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl flex items-center justify-center gap-3 hover:bg-emerald-500 hover:text-black transition-colors"
            >
              <MapPin className="w-5 h-5" />
              <span className="font-bold text-sm">Contactar con Atención al Cliente (WhatsApp)</span>
            </a>

          </div>
        ) : null}
      </main>
    </div>
  );
};
