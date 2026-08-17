import React, { useState, useEffect } from 'react';
import { treasuryService } from '../../services/treasuryService';
import { TreasuryAccount, TreasuryMovement, CashSession } from '../../types';
import { CurrencyDisplay } from '../common/CurrencyDisplay';
import { ShieldCheck, ArrowRightLeft, Landmark, List, Plus, X } from 'lucide-react';

export const TreasuryView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'accounts' | 'mayor' | 'cc' | 'cajas'>('accounts');
  
  const [accounts, setAccounts] = useState<TreasuryAccount[]>([]);
  const [movements, setMovements] = useState<TreasuryMovement[]>([]);
  const [cashSessions, setCashSessions] = useState<CashSession[]>([]);
  const [debtors, setDebtors] = useState<{ customer: any, debt: number, pendingInvoices: any[] }[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Transfer Form State
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [transferAmount, setTransferAmount] = useState(0);
  const [transferMethod, setTransferMethod] = useState('transferencia');

  // Collection Modal State
  const [isColModalOpen, setIsColModalOpen] = useState(false);
  const [colDocId, setColDocId] = useState('');
  const [colDebt, setColDebt] = useState(0);
  const [colAmount, setColAmount] = useState<number | ''>('');
  const [colMethod, setColMethod] = useState('transferencia');
  const [colAccountId, setColAccountId] = useState('');

  // NC Modal State
  const [isNCModalOpen, setIsNCModalOpen] = useState(false);
  const [ncDoc, setNcDoc] = useState<any>(null);
  const [ncAmount, setNcAmount] = useState<number | ''>('');
  const [ncRefundAccountId, setNcRefundAccountId] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [accs, movs, debts, docs, sessions] = await Promise.all([
        treasuryService.getTreasuryAccounts(),
        treasuryService.getTreasuryMovements(100),
        treasuryService.getCustomersWithDebt(),
        treasuryService.getCommercialDocuments(),
        treasuryService.getAllCashSessions(50)
      ]);
      setAccounts(accs || []);
      setMovements(movs || []);
      setDebtors(debts || []);
      setDocuments(docs || []);
      setCashSessions(sessions || []);
      
      if (accs && accs.length > 0) {
        setColAccountId(accs[0].id);
        setNcRefundAccountId(accs[0].id);
      }
    } catch (err) {
      console.error('Error fetching treasury data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const openCollectionModal = (docId: string, debt: number) => {
    setColDocId(docId);
    setColDebt(debt);
    setColAmount(debt);
    setIsColModalOpen(true);
  };

  const handleCollectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!colAmount || colAmount <= 0 || colAmount > colDebt) {
      alert('Monto inválido.');
      return;
    }
    if (!colAccountId) {
      alert('Debe seleccionar una cuenta destino.');
      return;
    }

    try {
      setIsProcessing(true);
      await treasuryService.processCollectionReceipt(colDocId, Number(colAmount), [{ account_id: colAccountId, amount: Number(colAmount), method: colMethod }]);
      alert('Cobranza registrada exitosamente.');
      setIsColModalOpen(false);
      await fetchData();
    } catch (err: any) {
      console.error(err);
      alert('Error en cobranza: ' + (err.message || ''));
    } finally {
      setIsProcessing(false);
    }
  };

  const openNCModal = (doc: any) => {
    setNcDoc(doc);
    setNcAmount(doc.total_amount);
    setIsNCModalOpen(true);
  };

  const handleNCSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ncDoc) return;
    if (!ncAmount || ncAmount <= 0 || ncAmount > ncDoc.total_amount) {
      alert('Monto inválido.');
      return;
    }
    
    try {
      setIsProcessing(true);
      let refunds: any[] = [];
      if (ncDoc.payment_condition === 'CONTADO' && ncRefundAccountId) {
         // Si es contado, el sistema pide origen de fondos para devolver
         refunds = [{ account_id: ncRefundAccountId, amount: Number(ncAmount), method: 'efectivo' }];
      }

      await treasuryService.createCreditNote(ncDoc.id, Number(ncAmount), refunds);
      alert('Nota de Crédito generada exitosamente.');
      setIsNCModalOpen(false);
      await fetchData();
    } catch (err: any) {
      console.error(err);
      alert('Error al generar nota de crédito: ' + (err.message || ''));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromAccount || !toAccount || transferAmount <= 0) {
      alert('Datos de transferencia inválidos.');
      return;
    }
    if (fromAccount === toAccount) {
      alert('Las cuentas de origen y destino deben ser distintas.');
      return;
    }

    setIsProcessing(true);
    try {
      await treasuryService.internalTransfer(fromAccount, toAccount, transferAmount, transferMethod);
      alert('Transferencia realizada exitosamente.');
      setTransferAmount(0);
      setFromAccount('');
      setToAccount('');
      await fetchData();
    } catch (err: any) {
      console.error(err);
      alert('Error en transferencia: ' + (err.message || ''));
    } finally {
      setIsProcessing(false);
    }
  };

  const totalBalance = accounts.reduce((acc, a) => acc + a.balance, 0);

  if (isLoading) {
    return <div className="p-8 text-slate-900 font-mono">Cargando tesorería...</div>;
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full relative">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl text-slate-900 tracking-wide flex items-center gap-2">
            TESORERÍA Y MAYOR <ShieldCheck className="w-6 h-6 text-[#7A1B28]" />
          </h2>
          <p className="text-xs text-slate-500">
            Control central de liquidez, cuentas bancarias y transferencias internas.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5 border-slate-200 col-span-1 md:col-span-3 lg:col-span-1 shadow-sm">
          <span className="text-[10px] font-mono text-slate-500 uppercase">LIQUIDEZ TOTAL</span>
          <div className="font-display text-4xl text-[#7A1B28] font-mono">
            <CurrencyDisplay amount={totalBalance} size="lg" />
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button 
          onClick={() => setActiveTab('accounts')}
          className={`px-4 py-2 text-sm font-bold tracking-wider uppercase flex items-center gap-2 rounded-t-lg transition-colors ${activeTab === 'accounts' ? 'bg-[#7A1B28] text-white' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <Landmark className="w-4 h-4" /> Cuentas
        </button>
        <button 
          onClick={() => setActiveTab('mayor')}
          className={`px-4 py-2 text-sm font-bold tracking-wider uppercase flex items-center gap-2 rounded-t-lg transition-colors ${activeTab === 'mayor' ? 'bg-[#7A1B28] text-white' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <List className="w-4 h-4" /> Mayor (Movimientos)
        </button>
        <button 
          onClick={() => setActiveTab('cc')}
          className={`px-4 py-2 text-sm font-bold tracking-wider uppercase flex items-center gap-2 rounded-t-lg transition-colors ${activeTab === 'cc' ? 'bg-[#7A1B28] text-white' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <List className="w-4 h-4" /> Cuentas Corrientes
        </button>
        <button 
          onClick={() => setActiveTab('cajas')}
          className={`px-4 py-2 text-sm font-bold tracking-wider uppercase flex items-center gap-2 rounded-t-lg transition-colors ${activeTab === 'cajas' ? 'bg-[#7A1B28] text-white' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <List className="w-4 h-4" /> Historial de Cajas
        </button>
      </div>

      {activeTab === 'accounts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
          {accounts.map(acc => (
            <div key={acc.id} className="glass-card p-5 flex flex-col gap-2 border-slate-200">
              <div className="flex justify-between items-start">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  acc.type === 'cash' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                }`}>
                  {acc.type === 'cash' ? 'caja' : 'banco'}
                </span>
                <span className="text-slate-500 font-mono text-[10px]">{acc.currency}</span>
              </div>
              <h4 className="text-slate-900 font-display text-xl">{acc.name}</h4>
              <p className="text-slate-500 text-xs font-mono">Sin descripción</p>
              
              <div className="mt-4 pt-4 border-t border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase">Saldo Actual</span>
                <div className="text-2xl font-mono text-emerald-700">
                  <CurrencyDisplay amount={acc.balance} size="md" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'mayor' && (
        <div className="glass-card p-0 overflow-hidden animate-fade-in border-slate-200">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-100 font-display text-sm tracking-wider uppercase text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-4">FECHA</th>
                <th className="p-4">CUENTA</th>
                <th className="p-4">TIPO</th>
                <th className="p-4">MÉTODO</th>
                <th className="p-4 text-right">MONTO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {movements.map(m => (
                <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-mono text-xs text-slate-500">
                    {new Date(m.created_at || '').toLocaleString()}
                  </td>
                  <td className="p-4 font-bold text-slate-900">
                    {m.treasury_accounts?.name || m.treasury_account_id}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      (m.type === 'income' || m.type === 'internal_transfer_in') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {(m.type === 'income' || m.type === 'internal_transfer_in') ? 'INGRESO' : 'EGRESO'}
                    </span>
                  </td>
                  <td className="p-4 text-xs capitalize">{m.payment_method?.replace('_', ' ') || ''}</td>
                  <td className={`p-4 text-right font-mono font-bold ${
                    (m.type === 'income' || m.type === 'internal_transfer_in') ? 'text-emerald-700' : 'text-rose-700'
                  }`}>
                    {(m.type === 'income' || m.type === 'internal_transfer_in') ? '+' : '-'}${Math.abs(m.amount).toFixed(2)}
                  </td>
                </tr>
              ))}
              {movements.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No hay movimientos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'cc' && (
        <div className="glass-card p-0 overflow-hidden animate-fade-in border-slate-200">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-100 font-display text-sm tracking-wider uppercase text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-4">CLIENTE</th>
                <th className="p-4">DOCUMENTO (CC002)</th>
                <th className="p-4 text-right">SALDO PENDIENTE</th>
                <th className="p-4 text-center">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {debtors.flatMap(d => d.pendingInvoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-bold text-slate-900">
                    {d.customer?.full_name || d.customer?.fullName || 'Cliente'}
                  </td>
                  <td className="p-4 font-mono text-xs text-slate-500 flex flex-col">
                    <span className="font-bold text-slate-700">{inv.document_number}</span>
                    <span>Total Orig: ${inv.total_amount}</span>
                  </td>
                  <td className="p-4 text-right font-mono font-bold text-rose-700">
                    <CurrencyDisplay amount={inv.balance} size="md" />
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => openCollectionModal(inv.id, inv.balance)}
                      disabled={isProcessing}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold uppercase disabled:opacity-50"
                    >
                      Cobrar a Ticket
                    </button>
                  </td>
                </tr>
              )))}
              {debtors.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    No hay tickets de cuenta corriente pendientes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Cajas (Cash Sessions) */}
      {activeTab === 'cajas' && (
        <div className="glass-card p-0 overflow-hidden animate-fade-in border-slate-200">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4 border-b border-slate-200">Apertura</th>
                <th className="p-4 border-b border-slate-200">Cierre</th>
                <th className="p-4 border-b border-slate-200">Estado</th>
                <th className="p-4 border-b border-slate-200 text-right">Faltantes/Sobrantes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cashSessions.map(session => {
                const hasDiffs = session.differences && Object.values(session.differences).some(d => d !== 0);
                return (
                <tr key={session.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-mono">{new Date(session.opened_at).toLocaleString('es-VE')}</td>
                  <td className="p-4 font-mono">{session.closed_at ? new Date(session.closed_at).toLocaleString('es-VE') : '-'}</td>
                  <td className="p-4">
                    {session.status === 'open' && <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded font-bold">ABIERTA</span>}
                    {session.status === 'counting' && <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded font-bold">EN ARQUEO</span>}
                    {session.status === 'closed' && <span className="bg-slate-100 text-slate-800 text-xs px-2 py-1 rounded font-bold">CERRADA</span>}
                    {session.status === 'reconciled' && <span className="bg-slate-200 text-slate-500 text-xs px-2 py-1 rounded font-bold">CONCILIADA</span>}
                  </td>
                  <td className="p-4 text-right">
                    {session.status === 'closed' || session.status === 'reconciled' ? (
                      hasDiffs ? (
                        <div className="flex flex-col items-end gap-1 text-xs">
                          {Object.entries(session.differences || {}).filter(([k,v]) => v !== 0).map(([k,v]) => (
                            <span key={k} className={v > 0 ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>
                              {k}: {v > 0 ? '+' : ''}{v.toFixed(2)}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-emerald-600 font-bold text-xs">OK (Sin dif)</span>
                      )
                    ) : (
                      <span className="text-slate-400 text-xs">-</span>
                    )}
                  </td>
                </tr>
              )})}
              {cashSessions.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500 font-mono">
                    No hay sesiones de caja registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL COBRANZA (REC004) */}
      {isColModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center">
              <h3 className="font-display font-bold text-lg text-slate-900">Registrar Cobranza</h3>
              <button onClick={() => setIsColModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCollectionSubmit} className="p-6 flex flex-col gap-4">
              <div className="bg-emerald-50 text-emerald-800 p-3 rounded-lg border border-emerald-100 flex justify-between items-center">
                <span className="text-sm font-bold">Deuda Pendiente:</span>
                <span className="font-mono font-bold text-lg">${colDebt.toFixed(2)}</span>
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Monto a Cobrar ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={colDebt}
                  value={colAmount}
                  onChange={e => setColAmount(e.target.value ? Number(e.target.value) : '')}
                  className="w-full border-2 border-slate-200 rounded-lg px-4 py-3 text-lg font-mono font-bold text-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Método de Pago</label>
                <select
                  value={colMethod}
                  onChange={e => setColMethod(e.target.value)}
                  className="w-full border-2 border-slate-200 rounded-lg px-4 py-3 text-sm font-bold text-slate-700 focus:border-emerald-500 outline-none"
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="punto">Punto de Venta</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="pago_movil">Pago Móvil</option>
                  <option value="zelle">Zelle</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Cuenta Destino</label>
                <select
                  value={colAccountId}
                  onChange={e => setColAccountId(e.target.value)}
                  className="w-full border-2 border-slate-200 rounded-lg px-4 py-3 text-sm font-bold text-slate-700 focus:border-emerald-500 outline-none"
                  required
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>

              <button type="submit" disabled={isProcessing} className="btn-primary bg-emerald-600 hover:bg-emerald-700 border-none text-white py-3 mt-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50">
                {isProcessing ? 'PROCESANDO...' : 'EMITIR RECIBO'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NOTA DE CRÉDITO (NC003) */}
      {isNCModalOpen && ncDoc && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center">
              <h3 className="font-display font-bold text-lg text-slate-900">Emitir Nota de Crédito</h3>
              <button onClick={() => setIsNCModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleNCSubmit} className="p-6 flex flex-col gap-4">
              <div className="bg-rose-50 text-rose-800 p-3 rounded-lg border border-rose-100 flex justify-between items-center">
                <span className="text-sm font-bold">Monto Máx. Permitido:</span>
                <span className="font-mono font-bold text-lg">${(Number(ncDoc.total_amount) - Number(ncDoc.paid_amount || 0) - Number(ncDoc.annulled_amount || 0)).toFixed(2)}</span>
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Monto a Anular/Reembolsar ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={(Number(ncDoc.total_amount) - Number(ncDoc.paid_amount || 0) - Number(ncDoc.annulled_amount || 0))}
                  value={ncAmount}
                  onChange={e => setNcAmount(e.target.value ? Number(e.target.value) : '')}
                  className="w-full border-2 border-slate-200 rounded-lg px-4 py-3 text-lg font-mono font-bold text-slate-900 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none"
                  required
                />
              </div>

              {ncDoc.payment_condition === 'CONTADO' && (
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Cuenta Origen (Para Reembolso)</label>
                  <p className="text-[10px] text-slate-500 mb-2">Este ticket es de CONTADO, se debe extraer dinero de una caja/banco para devolver al cliente.</p>
                  <select
                    value={ncRefundAccountId}
                    onChange={e => setNcRefundAccountId(e.target.value)}
                    className="w-full border-2 border-slate-200 rounded-lg px-4 py-3 text-sm font-bold text-slate-700 focus:border-rose-500 outline-none"
                    required
                  >
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
              )}
              {ncDoc.payment_condition === 'CUENTA_CORRIENTE' && (
                <div className="bg-slate-100 p-3 rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-600">Este ticket es de CC. La Nota de Crédito solo disminuirá el saldo de la deuda del cliente. No se extrae dinero de caja.</p>
                </div>
              )}

              <button type="submit" disabled={isProcessing} className="btn-primary bg-rose-600 hover:bg-rose-700 border-none text-white py-3 mt-2 shadow-lg shadow-rose-600/20 disabled:opacity-50">
                {isProcessing ? 'PROCESANDO...' : 'EMITIR NOTA DE CRÉDITO'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
