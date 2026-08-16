import React, { useState, useEffect } from 'react';
import { ServiceOrder, Customer, CashSession, TreasuryMovement } from '../../types';
import { treasuryService } from '../../services/treasuryService';
import { DollarSign, Plus, Receipt, AlertTriangle, ArrowDownCircle, ArrowUpCircle, X, Check, Lock, RefreshCw, HandCoins } from 'lucide-react';

interface CashierViewProps {
  orders: ServiceOrder[];
  customers: Customer[];
}

type SessionMovement = TreasuryMovement & { customerName?: string, userName?: string };

export const CashierView: React.FC<CashierViewProps> = ({ orders, customers }) => {
  const [session, setSession] = useState<CashSession | null>(null);
  const [movements, setMovements] = useState<SessionMovement[]>([]);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  
  const [showCloseModal, setShowCloseModal] = useState(false);
  
  // Payment Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState<number>('' as any);
  const [paymentMethod, setPaymentMethod] = useState<string>('efectivo');
  const [paymentCondition, setPaymentCondition] = useState<string>('contado');
  const [isProcessing, setIsProcessing] = useState(false);

  // Close Register State
  const [declaredCashUSD, setDeclaredCashUSD] = useState<number>('' as any);
  const [declaredCashBs, setDeclaredCashBs] = useState<number>('' as any); // Stored in DB as 'efectivo' but maybe we just sum them? For phase 1, we just provide the inputs. The backend expects a JSON.
  const [declaredZelle, setDeclaredZelle] = useState<number>('' as any);
  const [declaredPagoMovil, setDeclaredPagoMovil] = useState<number>('' as any);
  const [declaredTransfer, setDeclaredTransfer] = useState<number>('' as any);
  const [declaredCard, setDeclaredCard] = useState<number>('' as any);
  const [declaredBinance, setDeclaredBinance] = useState<number>('' as any);

  useEffect(() => {
    fetchSession();
  }, []);

  const fetchSession = async () => {
    setIsLoadingSession(true);
    try {
      const activeSession = await treasuryService.getActiveSession();
      setSession(activeSession);
      if (activeSession) {
        const movs = await treasuryService.getSessionMovements(activeSession.id);
        setMovements(movs);
      } else {
        setMovements([]);
      }
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
    } catch (err: any) {
      console.error(err);
      alert('Error al abrir la caja: ' + (err.message || 'Error desconocido'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseRegister = async () => {
    if (!session) return;
    setIsProcessing(true);
    try {
      const declared = {
        'efectivo': Number(declaredCashUSD || 0),
        'efectivo_bs': Number(declaredCashBs || 0), // Not in enum, but can be passed in JSON
        'zelle': Number(declaredZelle || 0),
        'pago_movil': Number(declaredPagoMovil || 0),
        'transferencia': Number(declaredTransfer || 0),
        'tarjeta': Number(declaredCard || 0),
        'binance': Number(declaredBinance || 0)
      };
      await treasuryService.closeCashSession(session.id, declared);
      await fetchSession();
      setShowCloseModal(false);
    } catch (err: any) {
      console.error(err);
      alert('Error al cerrar la caja: ' + (err.message || 'Error desconocido'));
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
      const accounts = await treasuryService.getTreasuryAccounts();
      let targetAccount = accounts[0];
      if (paymentMethod === 'efectivo') {
        targetAccount = accounts.find(a => a.type === 'cash') || accounts[0];
      } else if (paymentMethod === 'binance') {
        targetAccount = accounts.find(a => a.type === 'digital_wallet') || accounts[0];
      } else {
        targetAccount = accounts.find(a => a.type === 'bank_account') || accounts[0];
      }
      
      if (!targetAccount) {
         alert('No hay cuentas de tesorería configuradas.');
         return;
      }

      const payments = [{
        account_id: targetAccount.id,
        amount: Number(paymentAmount),
        method: paymentMethod
      }];

      await treasuryService.processCollection(selectedCustomerId, Number(paymentAmount), payments);
      
      alert('Cobranza registrada exitosamente.');
      setPaymentAmount('' as any);
      setSelectedCustomerId('');
      await fetchSession(); // Refresh summary and movements
      
    } catch (err: any) {
      console.error('Error procesando cobranza:', err);
      alert('Error al procesar el pago: ' + (err.message || 'Error desconocido'));
    } finally {
      setIsProcessing(false);
    }
  };

  // Calculations for Summary
  const incomeMovements = movements.filter(m => m.type === 'income' || m.type === 'internal_transfer_in');
  const expenseMovements = movements.filter(m => m.type === 'expense' || m.type === 'internal_transfer_out');
  
  const totalIncome = incomeMovements.reduce((sum, m) => sum + Number(m.amount), 0);
  const totalExpense = expenseMovements.reduce((sum, m) => sum + Number(m.amount), 0);
  const currentBalance = totalIncome - totalExpense;

  const getMethodTotal = (method: string) => {
    const inc = incomeMovements.filter(m => m.payment_method === method).reduce((s, m) => s + Number(m.amount), 0);
    const exp = expenseMovements.filter(m => m.payment_method === method).reduce((s, m) => s + Number(m.amount), 0);
    return inc - exp;
  };

  if (isLoadingSession) {
    return <div className="p-8 text-slate-900 font-mono flex items-center gap-3"><RefreshCw className="w-5 h-5 animate-spin" /> Cargando estado de caja...</div>;
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full relative">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl text-slate-900 tracking-wide flex items-center gap-2">
            CAJA Y COBRANZA <DollarSign className="w-6 h-6 text-[#7A1B28]" />
          </h2>
          <p className="text-sm text-slate-500">
            Apertura/Cierre de sesión, cobros, y movimientos de tesorería.
          </p>
        </div>
        {session ? (
          <div className="flex items-center gap-3">
             <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-lg text-emerald-800 text-sm flex items-center gap-2 shadow-sm">
                <Check className="w-4 h-4" />
                <span className="font-bold">Sesión Abierta</span>
                <span className="opacity-70 font-mono text-xs">({new Date(session.opened_at).toLocaleTimeString()})</span>
             </div>
            <button 
              onClick={() => setShowCloseModal(true)}
              className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors uppercase tracking-wider flex items-center gap-2 shadow-sm"
            >
              <Lock className="w-4 h-4" /> Cerrar Caja
            </button>
          </div>
        ) : (
          <span className="px-4 py-2 bg-slate-100 text-slate-500 font-bold rounded-lg uppercase tracking-wider text-sm border border-slate-300 flex items-center gap-2 w-max">
            <Lock className="w-4 h-4" /> Caja Cerrada
          </span>
        )}
      </div>

      {session && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-2">
          <div className="glass-card p-4 border-l-4 border-l-emerald-500 rounded-xl bg-white shadow-sm">
            <p className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-wider">Total Ingresos</p>
            <p className="text-xl font-display text-emerald-600">${totalIncome.toFixed(2)}</p>
          </div>
          <div className="glass-card p-4 border-l-4 border-l-rose-500 rounded-xl bg-white shadow-sm">
            <p className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-wider">Total Egresos</p>
            <p className="text-xl font-display text-rose-600">${totalExpense.toFixed(2)}</p>
          </div>
          <div className="glass-card p-4 border-l-4 border-l-[#7A1B28] rounded-xl bg-slate-50 shadow-sm md:col-span-2">
            <p className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-wider">Saldo Actual (Total)</p>
            <p className="text-2xl font-display font-bold text-slate-900">${currentBalance.toFixed(2)}</p>
          </div>
          <div className="glass-card p-3 border border-slate-200 rounded-xl bg-white flex flex-col justify-center">
            <p className="text-[10px] text-slate-500 font-bold uppercase">Efectivo USD</p>
            <p className="text-sm font-mono font-bold">${getMethodTotal('efectivo').toFixed(2)}</p>
          </div>
          <div className="glass-card p-3 border border-slate-200 rounded-xl bg-white flex flex-col justify-center">
             <p className="text-[10px] text-slate-500 font-bold uppercase">Zelle</p>
             <p className="text-sm font-mono font-bold">${getMethodTotal('zelle').toFixed(2)}</p>
          </div>
          <div className="glass-card p-3 border border-slate-200 rounded-xl bg-white flex flex-col justify-center">
             <p className="text-[10px] text-slate-500 font-bold uppercase">Pago Móvil</p>
             <p className="text-sm font-mono font-bold">${getMethodTotal('pago_movil').toFixed(2)}</p>
          </div>
          <div className="glass-card p-3 border border-slate-200 rounded-xl bg-white flex flex-col justify-center">
             <p className="text-[10px] text-slate-500 font-bold uppercase">Punto / Tarjeta</p>
             <p className="text-sm font-mono font-bold">${getMethodTotal('tarjeta').toFixed(2)}</p>
          </div>
          <div className="glass-card p-3 border border-slate-200 rounded-xl bg-white flex flex-col justify-center">
             <p className="text-[10px] text-slate-500 font-bold uppercase">Transferencia</p>
             <p className="text-sm font-mono font-bold">${getMethodTotal('transferencia').toFixed(2)}</p>
          </div>
          <div className="glass-card p-3 border border-slate-200 rounded-xl bg-white flex flex-col justify-center">
             <p className="text-[10px] text-slate-500 font-bold uppercase">Binance</p>
             <p className="text-sm font-mono font-bold">${getMethodTotal('binance').toFixed(2)}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Actions */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          {/* Register Payment Form */}
          <div className="glass-card p-6 flex flex-col gap-4 relative overflow-hidden border-slate-200 rounded-2xl shadow-sm bg-white">
            <h3 className="font-display text-xl text-slate-900 flex items-center gap-2">
              <HandCoins className="w-5 h-5 text-emerald-600" /> NUEVA COBRANZA
            </h3>

            {!session ? (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center">
                <Lock className="w-12 h-12 text-slate-300 mb-4" />
                <h4 className="text-slate-900 font-display text-xl mb-2">CAJA CERRADA</h4>
                <p className="text-xs text-slate-500 mb-6">Debes abrir una sesión de caja para procesar cobranzas.</p>
                
                <form onSubmit={handleOpenRegister} className="w-full flex flex-col gap-3">
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600 mb-2">
                    <p className="font-bold mb-1">Apertura (Fase 1)</p>
                    El fondo inicial manual se incluirá en una fase posterior. La caja iniciará en cero.
                  </div>
                  <button type="submit" disabled={isProcessing} className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 rounded-lg transition-colors uppercase tracking-widest text-sm disabled:opacity-50">
                    {isProcessing ? 'APERTURANDO...' : 'APERTURAR CAJA'}
                  </button>
                </form>
              </div>
            ) : null}

            <form onSubmit={handleSubmitPayment} className="flex flex-col gap-4">
              
              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-700 font-mono flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>Generará un CRÉDITO en la cuenta corriente del cliente y un ingreso a Tesorería.</p>
              </div>

              <div>
                <label className="text-xs text-slate-500 mb-1 block font-bold">Cliente</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:border-[#7A1B28] focus:ring-1 focus:ring-[#7A1B28] outline-none transition-all"
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
                <label className="text-xs text-slate-500 mb-1 block font-bold">Condición de Pago</label>
                <select
                  value={paymentCondition}
                  onChange={(e) => setPaymentCondition(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:border-[#7A1B28] focus:ring-1 focus:ring-[#7A1B28] outline-none transition-all"
                >
                  <option value="contado">Contado</option>
                  <option value="cuenta_corriente">Cuenta Corriente</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-500 mb-1 block font-bold">Monto a Cobrar ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xl text-slate-900 font-mono font-bold focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 mb-1 block font-bold">Método de Pago</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:border-[#7A1B28] focus:ring-1 focus:ring-[#7A1B28] outline-none mb-2 transition-all"
                >
                  <option value="efectivo">Efectivo ($ USD)</option>
                  <option value="zelle">Zelle</option>
                  <option value="pago_movil">Pago Móvil (Bs)</option>
                  <option value="transferencia">Transferencia Bancaria</option>
                  <option value="tarjeta">Punto de Venta / Tarjeta</option>
                  <option value="binance">Binance</option>
                </select>
              </div>

              <button type="submit" disabled={isProcessing} className="w-full bg-[#7A1B28] text-white font-bold text-sm py-3 rounded-lg hover:bg-[#5a141d] transition-colors uppercase tracking-wider disabled:opacity-50">
                {isProcessing ? 'PROCESANDO...' : 'REGISTRAR COBRANZA'}
              </button>
            </form>
          </div>

          {/* Egresos (Placeholder) */}
          <div className="glass-card p-6 flex flex-col gap-4 border-slate-200 rounded-2xl shadow-sm bg-slate-50 opacity-80">
             <h3 className="font-display text-xl text-slate-700 flex items-center gap-2">
               <ArrowUpCircle className="w-5 h-5 text-rose-500" /> REGISTRAR EGRESO
             </h3>
             <p className="text-xs text-slate-500">
               El registro de gastos, vales y pagos a proveedores requiere actualizaciones en la base de datos (SQL).
             </p>
             <button disabled className="w-full bg-slate-200 text-slate-500 font-bold text-sm py-3 rounded-lg uppercase tracking-wider cursor-not-allowed border border-slate-300">
               Próximamente (Fase 2)
             </button>
          </div>
        </div>

        {/* Right Column: Movements Table */}
        <div className="lg:col-span-2 glass-card flex flex-col border-slate-200 rounded-2xl shadow-sm bg-white overflow-hidden h-[600px]">
           <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
             <h3 className="font-display text-xl text-slate-900 flex items-center gap-2">
               <Receipt className="w-5 h-5 text-[#7A1B28]" /> MOVIMIENTOS DE LA CAJA ACTIVA
             </h3>
             <button onClick={fetchSession} className="p-2 hover:bg-slate-200 rounded-full transition-colors" title="Refrescar">
                <RefreshCw className="w-4 h-4 text-slate-500" />
             </button>
           </div>
           
           <div className="flex-1 overflow-auto p-0">
             <table className="w-full text-sm text-left text-slate-700">
               <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100 font-display tracking-wider sticky top-0 z-10 shadow-sm">
                 <tr>
                   <th className="px-4 py-3">Hora</th>
                   <th className="px-4 py-3">Tipo</th>
                   <th className="px-4 py-3">Cliente / Origen</th>
                   <th className="px-4 py-3">Método</th>
                   <th className="px-4 py-3 text-right">Monto</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 font-mono text-xs">
                 {movements.map((tx) => (
                   <tr key={tx.id} className="hover:bg-slate-50 transition-colors group">
                     <td className="px-4 py-3 text-slate-500">
                       {new Date(tx.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                     </td>
                     <td className="px-4 py-3">
                       <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider ${
                         tx.type === 'income' || tx.type === 'internal_transfer_in' ? 'bg-emerald-100 text-emerald-700' :
                         'bg-rose-100 text-rose-700'
                       }`}>
                         {tx.type.replace('internal_transfer_', 'Transfer ')}
                       </span>
                     </td>
                     <td className="px-4 py-3">
                       <div className="font-sans font-medium text-slate-900">{tx.customerName}</div>
                       <div className="text-[10px] text-slate-400 capitalize">{tx.source_type.replace('_', ' ')}</div>
                     </td>
                     <td className="px-4 py-3 uppercase text-slate-500">
                       {tx.payment_method.replace('_', ' ')}
                     </td>
                     <td className={`px-4 py-3 text-right font-bold text-sm ${
                       tx.type === 'income' || tx.type === 'internal_transfer_in' ? 'text-emerald-600' : 'text-rose-600'
                     }`}>
                       {tx.type === 'income' || tx.type === 'internal_transfer_in' ? '+' : '-'}${Number(tx.amount).toFixed(2)}
                     </td>
                   </tr>
                 ))}
                 {movements.length === 0 && (
                   <tr>
                     <td colSpan={5} className="px-4 py-12 text-center text-slate-400 italic font-sans">
                       No hay movimientos en esta sesión.
                     </td>
                   </tr>
                 )}
               </tbody>
             </table>
           </div>
        </div>
      </div>

      {/* Close Register Modal */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full flex flex-col overflow-hidden animate-scale-up shadow-2xl">
            
            <div className="bg-[#7A1B28] text-white p-5 flex justify-between items-center">
              <div>
                <h3 className="font-display text-2xl mb-1">CERRAR CAJA</h3>
                <p className="text-xs text-white/70">Declara los montos físicos contados para el arqueo final.</p>
              </div>
              <button onClick={() => setShowCloseModal(false)} className="text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {/* Inputs */}
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-2 mb-3">Dinero Físico (Billetes)</h4>
                  
                  <div>
                    <label className="text-xs text-slate-500 font-bold block mb-1">Efectivo ($ USD)</label>
                    <input type="number" step="0.01" min="0" value={declaredCashUSD} onChange={(e) => setDeclaredCashUSD(e.target.value as any)}
                      className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-[#7A1B28] outline-none" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-bold block mb-1">Efectivo (Bs)</label>
                    <input type="number" step="0.01" min="0" value={declaredCashBs} onChange={(e) => setDeclaredCashBs(e.target.value as any)}
                      className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-[#7A1B28] outline-none" placeholder="0.00" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-2 mb-3">Saldos Digitales</h4>
                  
                  <div>
                    <label className="text-xs text-slate-500 font-bold block mb-1">Zelle</label>
                    <input type="number" step="0.01" min="0" value={declaredZelle} onChange={(e) => setDeclaredZelle(e.target.value as any)}
                      className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-[#7A1B28] outline-none" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-bold block mb-1">Pago Móvil</label>
                    <input type="number" step="0.01" min="0" value={declaredPagoMovil} onChange={(e) => setDeclaredPagoMovil(e.target.value as any)}
                      className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-[#7A1B28] outline-none" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-bold block mb-1">Punto / Tarjeta</label>
                    <input type="number" step="0.01" min="0" value={declaredCard} onChange={(e) => setDeclaredCard(e.target.value as any)}
                      className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-[#7A1B28] outline-none" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-bold block mb-1">Transferencia</label>
                    <input type="number" step="0.01" min="0" value={declaredTransfer} onChange={(e) => setDeclaredTransfer(e.target.value as any)}
                      className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-[#7A1B28] outline-none" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-bold block mb-1">Binance</label>
                    <input type="number" step="0.01" min="0" value={declaredBinance} onChange={(e) => setDeclaredBinance(e.target.value as any)}
                      className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-[#7A1B28] outline-none" placeholder="0.00" />
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center text-sm font-bold text-slate-700 mb-2">
                  <span>Total Esperado Sistema:</span>
                  <span className="font-mono">${currentBalance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold text-[#7A1B28] mb-2">
                  <span>Total Declarado:</span>
                  <span className="font-mono">
                    ${(
                      Number(declaredCashUSD || 0) + 
                      Number(declaredCashBs || 0) + 
                      Number(declaredZelle || 0) + 
                      Number(declaredPagoMovil || 0) + 
                      Number(declaredTransfer || 0) + 
                      Number(declaredCard || 0) +
                      Number(declaredBinance || 0)
                    ).toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 border-t border-slate-200 pt-2 mt-2">
                  El sistema calculará las diferencias por cada método de pago automáticamente y quedarán registradas en la auditoría de caja.
                </p>
              </div>

            </div>

            <div className="p-5 border-t border-slate-200 bg-slate-50 flex gap-3 justify-end">
              <button 
                onClick={() => setShowCloseModal(false)}
                className="px-6 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-50 transition-colors"
                disabled={isProcessing}
              >
                Cancelar
              </button>
              <button 
                onClick={handleCloseRegister}
                disabled={isProcessing}
                className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 transition-colors uppercase tracking-wider disabled:opacity-50 flex items-center gap-2"
              >
                {isProcessing ? 'Procesando...' : 'Confirmar Cierre'} <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
