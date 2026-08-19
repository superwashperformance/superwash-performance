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
      archived: 5,
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
      archived: 'Servicio finalizado y guardado en historial. ¡Gracias por tu confianza!',
    };
    return messages[status as keyof typeof messages] || 'Estado desconocido';
  };

  const currentStep = order ? getProgressStep(order.status) : 0;

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] flex flex-col font-sans selection:bg-[#7A1B28] selection:text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[radial-gradient(#7A1B28_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.03] pointer-events-none" />
      <div className="fixed top-0 left-0 w-full h-96 bg-gradient-to-b from-slate-200/50 to-transparent pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-4 md:px-8 border-b border-[var(--color-border-primary)] bg-[var(--color-bg-surface)]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <FaviconLogo size={32} />
          <span className="font-display tracking-widest text-sm md:text-lg text-[var(--color-text-primary)]">SUPER WASH PERFORMANCE</span>
        </div>
        <button 
          onClick={onExit}
          className="text-xs font-mono text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> VOLVER
        </button>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center p-4 md:p-8">
        
        {/* Search Bar */}
        <div className="w-full max-w-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)] rounded-2xl p-2 flex items-center gap-2 mb-8 shadow-sm">
          <Search className="w-5 h-5 text-[var(--color-text-muted)] ml-3" />
          <input
            type="text"
            placeholder="Ingresa tu Placa (ej. ABC-123)"
            value={plate}
            onChange={(e) => setPlate(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && fetchOrder(plate)}
            className="flex-1 bg-transparent border-none outline-none text-[var(--color-text-primary)] px-2 uppercase font-mono placeholder:text-[var(--color-text-secondary)] placeholder:normal-case"
          />
          <button 
            onClick={() => fetchOrder(plate)}
            disabled={loading || !plate.trim()}
            className="btn-primary px-6 py-2 rounded-xl text-xs disabled:opacity-50"
          >
            BUSCAR
          </button>
        </div>

        {/* Tracking Card */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#7A1B28]">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="font-mono text-sm animate-pulse">Consultando estado del vehículo...</p>
          </div>
        ) : error ? (
          <div className="w-full max-w-2xl bg-red-950/30 border border-red-500/30 rounded-2xl p-8 text-center flex flex-col items-center gap-3">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <h3 className="text-xl font-display text-[var(--color-text-primary)]">VEHÍCULO NO ENCONTRADO</h3>
            <p className="text-sm text-[var(--color-text-muted)] font-mono">{error}</p>
          </div>
        ) : order ? (
          <div className="w-full max-w-2xl flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4">
            
            {/* Vehicle Info Badge */}
            <div className="glass-card p-6 flex flex-col md:flex-row items-center justify-between gap-4 border-[var(--color-border-primary)] bg-[var(--color-bg-surface)]">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center border border-[var(--color-border-primary)] shadow-sm">
                  <Car className="w-8 h-8 text-[#7A1B28]" />
                </div>
                <div>
                  <h2 className="font-display text-2xl text-[var(--color-text-primary)]">{order.vehicleBrandModel}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="bg-slate-100 text-[var(--color-text-primary)] border border-[var(--color-border-primary)] px-2 py-0.5 rounded font-mono text-xs font-bold tracking-widest">{order.vehiclePlate}</span>
                    <span className="text-[var(--color-text-muted)] text-xs">• ODS: {order.orderNumber}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase">Ingreso al taller</p>
                <p className="text-sm text-[var(--color-text-secondary)] flex items-center gap-1 justify-end"><Clock className="w-3.5 h-3.5" /> {order.entryDate.split(',')[0]}</p>
              </div>
            </div>

            {/* Status Pipeline */}
            <div className="glass-card p-6 md:p-8 border-[var(--color-border-primary)] bg-[var(--color-bg-surface)] mt-2">
              <h3 className="font-display text-xl text-[var(--color-text-primary)] mb-8 text-center">ESTADO ACTUAL</h3>
              
              <div className="relative">
                {/* Connecting Line */}
                <div className="absolute top-5 left-[10%] right-[10%] h-1 bg-slate-200 rounded-full z-0">
                  <div 
                    className="h-full bg-[#7A1B28] rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${Math.min(100, (Math.max(1, currentStep) - 1) * 33.33)}%` }} 
                  />
                </div>

                <div className="relative z-10 flex justify-between">
                  {/* Step 1: Recepción */}
                  <div className="flex flex-col items-center gap-2 w-1/4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${currentStep >= 1 ? 'bg-[#7A1B28] border-[#7A1B28] text-white shadow-md' : 'bg-[var(--color-bg-surface)] border-[var(--color-border-primary)] text-[var(--color-text-muted)]'}`}>
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-display uppercase tracking-wider text-center ${currentStep >= 1 ? 'text-[#7A1B28] font-bold' : 'text-[var(--color-text-muted)]'}`}>Recepción</span>
                  </div>

                  {/* Step 2: Aprobación */}
                  <div className="flex flex-col items-center gap-2 w-1/4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${currentStep >= 2 ? 'bg-[#7A1B28] border-[#7A1B28] text-white shadow-md' : 'bg-[var(--color-bg-surface)] border-[var(--color-border-primary)] text-[var(--color-text-muted)]'}`}>
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-display uppercase tracking-wider text-center ${currentStep >= 2 ? 'text-[#7A1B28] font-bold' : 'text-[var(--color-text-muted)]'}`}>Aprobación</span>
                  </div>

                  {/* Step 3: En Proceso */}
                  <div className="flex flex-col items-center gap-2 w-1/4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${currentStep >= 3 ? 'bg-[#7A1B28] border-[#7A1B28] text-white shadow-md' : 'bg-[var(--color-bg-surface)] border-[var(--color-border-primary)] text-[var(--color-text-muted)]'}`}>
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-display uppercase tracking-wider text-center ${currentStep >= 3 ? 'text-[#7A1B28] font-bold' : 'text-[var(--color-text-muted)]'}`}>En Proceso</span>
                  </div>

                  {/* Step 4: Finalizado */}
                  <div className="flex flex-col items-center gap-2 w-1/4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${currentStep >= 4 ? 'bg-[#7A1B28] border-[#7A1B28] text-white shadow-md' : 'bg-[var(--color-bg-surface)] border-[var(--color-border-primary)] text-[var(--color-text-muted)]'}`}>
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-display uppercase tracking-wider text-center ${currentStep >= 4 ? 'text-[#7A1B28] font-bold' : 'text-[var(--color-text-muted)]'}`}>Control / Listo</span>
                  </div>
                </div>
              </div>

              {/* Status Message */}
              <div className="mt-8 p-4 bg-[var(--color-bg-primary)] rounded-xl border border-[var(--color-border-primary)] text-center">
                <span className="font-mono text-[#7A1B28] block mb-1 uppercase tracking-widest text-xs">Fase Actual</span>
                <p className="text-[var(--color-text-primary)] text-lg font-medium">{getStatusMessage(order.status)}</p>
              </div>

              {/* Final Photo if Archived/Completed */}
              {(order.status === 'archived' || order.status === 'delivered') && order.photos && order.photos.length > 0 && (
                <div className="mt-6 border-t border-[var(--color-border-subtle)] pt-6">
                  <span className="font-mono text-[var(--color-text-muted)] block mb-3 uppercase tracking-widest text-xs text-center">Ficha del Registro Final</span>
                  <div className="rounded-xl overflow-hidden shadow-sm border border-[var(--color-border-primary)]">
                    <img 
                      src={order.photos.slice().reverse().find(p => p.category === 'final')?.photoUrl || order.photos[order.photos.length - 1].photoUrl} 
                      alt="Registro Final" 
                      className="w-full h-auto object-cover max-h-64"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Support / WhatsApp CTA */}
            <a 
              href="https://wa.me/584140000000" 
              target="_blank" 
              rel="noreferrer"
              className="mt-4 bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl flex items-center justify-center gap-3 hover:bg-emerald-600 hover:text-white transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
              <span className="font-bold text-sm">Contactar con Atención al Cliente (WhatsApp)</span>
            </a>

          </div>
        ) : null}
      </main>
    </div>
  );
};
