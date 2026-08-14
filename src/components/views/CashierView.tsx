import React, { useState, useEffect } from 'react';
import { ServiceOrder, Customer, CashSession } from '../../types';
import { treasuryService } from '../../services/treasuryService';
import { CurrencyDisplay } from '../common/CurrencyDisplay';
import { DollarSign, CreditCard, Plus, Receipt, User, Search, Calendar, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface CashierViewProps {
  orders: ServiceOrder[];
  customers: Customer[];
}

export const CashierView: React.FC<CashierViewProps> = ({ orders, customers }) => {
  const [activeTab, setActiveTab] = useState<'payments' | 'accounts'>('payments');
  const [session, setSession] = useState<CashSession | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [initialAmountInput, setInitialAmountInput] = useState(0);
  
  // Payment Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('efectivo');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchSession();
  }, []);

  const fetchSession = async () => {
    setIsLoadingSession(true);
    try {
      const activeSession = await treasuryService.getActiveSession();
      setSession(activeSession);
    } catch (err) {
      console.error('Error fetching session:', err);
    } finally {
      setIsLoadingSession(false);
    }
  };

  const handleOpenRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      await treasuryService.openCashSession();
      await fetchSession();
    } catch (err) {
      console.error(err);
      alert('Error al abrir la caja');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseRegister = async () => {
    if (!session) return;
    setIsProcessing(true);
    try {
      // In a real scenario, we would collect declared amounts per method.
      const declared = {
        'efectivo': 0,
        'zelle': 0,
        'tarjeta': 0
      };
      await treasuryService.closeCashSession(session.id, declared);
      await fetchSession();
      setShowCloseModal(false);
    } catch (err) {
      console.error(err);
      alert('Error al cerrar la caja');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || paymentAmount <= 0) {
      alert('Seleccione un cliente y un monto mayor a 0');
      return;
    }

    setIsProcessing(true);
    try {
      // Get the current user's default box or find one.
      // For this implementation we'll pass a default account_id or fetch it.
      // We need treasury accounts to get the corresponding box account id.
      const accounts = await treasuryService.getTreasuryAccounts();
      const cashAccount = accounts.find(a => a.is_cash_drawer) || accounts[0];
      
      if (!cashAccount) {
         alert('No hay cuentas de tesorería configuradas.');
         return;
      }

      await treasuryService.processCollection(selectedCustomerId, paymentAmount, [
        {
          account_id: cashAccount.id,
          amount: paymentAmount,
          method: paymentMethod
        }
      ]);
      
      alert('Cobranza registrada exitosamente.');
      setPaymentAmount(0);
      setSelectedCustomerId('');
      
    } catch (err) {
      console.error('Error procesando cobranza:', err);
      alert('Error al procesar el pago.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Build a list of customers who actually have orders or are in the DB.
  // Using the new architectural flow: Cobranza credits Cuenta Corriente.
  
  if (isLoadingSession) {
    return <div className="p-8 text-slate-900 font-mono">Cargando estado de caja...</div>;
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full relative">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl text-slate-900 tracking-wide flex items-center gap-2">
            CAJA Y COBRANZA <DollarSign className="w-6 h-6 text-[#7A1B28]" />
          </h2>
          <p className="text-xs text-slate-500">
            Apertura/Cierre de sesión y registro de cobranzas de clientes.
          </p>
        </div>
        {session ? (
          <button 
            onClick={() => setShowCloseModal(true)}
            className="bg-red-500/20 text-red-500 border border-red-500 hover:bg-red-500 hover:text-slate-900 px-4 py-2 rounded-lg font-bold text-sm transition-colors uppercase tracking-wider"
          >
            Cerrar Caja
          </button>
        ) : (
          <span className="px-4 py-2 bg-slate-100 text-slate-500 font-bold rounded uppercase tracking-wider text-sm border border-slate-700">
            Caja Cerrada
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Register Payment Form */}
        <div className="lg:col-span-1 glass-card p-6 flex flex-col gap-4 relative overflow-hidden border-slate-200">
          <h3 className="font-display text-2xl text-slate-900 flex items-center gap-2">
            <Plus className="w-5 h-5 text-[#7A1B28]" /> NUEVA COBRANZA
          </h3>

          {!session ? (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center border border-slate-200 rounded-2xl">
              <DollarSign className="w-12 h-12 text-slate-500 mb-4" />
              <h4 className="text-slate-900 font-display text-xl mb-2">CAJA CERRADA</h4>
              <p className="text-xs text-slate-500 mb-6">Debes abrir una sesión de caja para procesar cobranzas.</p>
              
              <form onSubmit={handleOpenRegister} className="w-full flex flex-col gap-3">
                <button type="submit" disabled={isProcessing} className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-lg transition-colors uppercase tracking-widest text-sm disabled:opacity-50">
                  {isProcessing ? 'APERTURANDO...' : 'APERTURAR CAJA'}
                </button>
              </form>
            </div>
          ) : null}

          <form onSubmit={handleSubmitPayment} className="flex flex-col gap-4">
            
            <div className="bg-amber-500/10 border border-amber-500/30 rounded p-3 text-xs text-amber-400 font-mono flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>Esta cobranza generará un CRÉDITO en la cuenta corriente del cliente y un ingreso a Tesorería. Posteriormente debe imputarse a un Documento Comercial (ODS).</p>
            </div>

            <div>
              <label className="text-xs text-slate-500 mb-1 block">Cliente</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:border-[#7A1B28] outline-none"
              >
                <option value="">Seleccione un cliente...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} - {c.documentId}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-500 mb-1 block">Monto a Cobrar ($)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-lg text-slate-900 font-mono font-bold focus:border-[#7A1B28] outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-500 mb-1 block">Método de Pago Principal</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:border-[#7A1B28] outline-none mb-3"
              >
                <option value="efectivo">Efectivo ($ USD)</option>
                <option value="zelle">Zelle</option>
                <option value="pago_movil">Pago Móvil (Bs)</option>
                <option value="transferencia">Transferencia Bancaria</option>
                <option value="tarjeta">Punto de Venta / Tarjeta</option>
              </select>
            </div>

            <button type="submit" disabled={isProcessing} className="btn-primary text-sm py-3 mt-2 justify-center disabled:opacity-50">
              {isProcessing ? 'PROCESANDO...' : 'PROCESAR COBRANZA'}
            </button>
          </form>
        </div>

        {/* Current State & Recent Transactions (Placeholder for brevity) */}
        <div className="lg:col-span-2 glass-card p-6 flex flex-col gap-4 border-slate-200">
           <h3 className="font-display text-2xl text-slate-900 flex items-center gap-2">
             <Receipt className="w-5 h-5 text-[#7A1B28]" /> SESIÓN ACTUAL
           </h3>
           
           {session ? (
             <div className="font-mono text-sm text-slate-700">
               <p><strong className="text-slate-500">ID Sesión:</strong> {session.id}</p>
               <p><strong className="text-slate-500">Estado:</strong> {session.status.toUpperCase()}</p>
               <p><strong className="text-slate-500">Abierta el:</strong> {new Date(session.opened_at).toLocaleString()}</p>
             </div>
           ) : (
             <p className="text-slate-500 italic">No hay una sesión de caja activa.</p>
           )}
           
           <hr className="border-slate-200 my-4" />
           <p className="text-slate-500 text-sm">
             La imputación a facturas/ODS y la gestión de la cuenta corriente detallada se realizan en el Módulo de Cuenta Corriente (Próximamente / En construcción).
           </p>
        </div>
      </div>

      {/* Close Register Modal */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm w-full flex flex-col gap-6 animate-scale-up shadow-xl shadow-slate-200/50">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30">
                <DollarSign className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="font-display text-2xl text-slate-900 mb-2">CERRAR CAJA</h3>
              <p className="text-xs text-slate-500">
                Declara los montos físicos para cerrar la sesión.
              </p>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowCloseModal(false)}
                className="flex-1 bg-transparent border border-slate-300 text-slate-900 py-3 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors"
                disabled={isProcessing}
              >
                CANCELAR
              </button>
              <button 
                onClick={handleCloseRegister}
                disabled={isProcessing}
                className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold text-sm hover:bg-red-600 transition-colors uppercase tracking-wider disabled:opacity-50"
              >
                {isProcessing ? '...' : 'CERRAR CAJA'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
