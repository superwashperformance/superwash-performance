import React, { useState, useEffect } from 'react';
import { treasuryService } from '../../services/treasuryService';
import { TreasuryAccount, TreasuryMovement } from '../../types';
import { CurrencyDisplay } from '../common/CurrencyDisplay';
import { ShieldCheck, ArrowRightLeft, Landmark, List, Plus } from 'lucide-react';

export const TreasuryView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'accounts' | 'transfers' | 'mayor'>('accounts');
  
  const [accounts, setAccounts] = useState<TreasuryAccount[]>([]);
  const [movements, setMovements] = useState<TreasuryMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Transfer Form State
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [transferAmount, setTransferAmount] = useState(0);
  const [transferMethod, setTransferMethod] = useState('transferencia');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [accs, movs] = await Promise.all([
        treasuryService.getTreasuryAccounts(),
        treasuryService.getTreasuryMovements(100)
      ]);
      setAccounts(accs);
      setMovements(movs);
    } catch (err) {
      console.error('Error fetching treasury data:', err);
    } finally {
      setIsLoading(false);
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
            TESORERÍA Y MAYOR <ShieldCheck className="w-6 h-6 text-cyan-600" />
          </h2>
          <p className="text-xs text-slate-500">
            Control central de liquidez, cuentas bancarias y transferencias internas.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="nike-card p-5 border-[#00E5FF]/30 col-span-1 md:col-span-3 lg:col-span-1">
          <span className="text-[10px] font-mono text-slate-500 uppercase">LIQUIDEZ TOTAL</span>
          <div className="font-display text-4xl text-cyan-600 font-mono">
            <CurrencyDisplay amount={totalBalance} size="lg" />
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button 
          onClick={() => setActiveTab('accounts')}
          className={`px-4 py-2 text-sm font-bold tracking-wider uppercase flex items-center gap-2 rounded-t-lg transition-colors ${activeTab === 'accounts' ? 'bg-[#00E5FF] text-black' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <Landmark className="w-4 h-4" /> Cuentas
        </button>
        <button 
          onClick={() => setActiveTab('transfers')}
          className={`px-4 py-2 text-sm font-bold tracking-wider uppercase flex items-center gap-2 rounded-t-lg transition-colors ${activeTab === 'transfers' ? 'bg-[#00E5FF] text-black' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <ArrowRightLeft className="w-4 h-4" /> Transferencias Internas
        </button>
        <button 
          onClick={() => setActiveTab('mayor')}
          className={`px-4 py-2 text-sm font-bold tracking-wider uppercase flex items-center gap-2 rounded-t-lg transition-colors ${activeTab === 'mayor' ? 'bg-[#00E5FF] text-black' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <List className="w-4 h-4" /> Mayor (Movimientos)
        </button>
      </div>

      {activeTab === 'accounts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
          {accounts.map(acc => (
            <div key={acc.id} className="nike-card p-5 flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  acc.is_cash_drawer ? 'bg-amber-500/20 text-amber-400' : 'bg-indigo-500/20 text-indigo-400'
                }`}>
                  {acc.is_cash_drawer ? 'caja' : 'banco'}
                </span>
                <span className="text-slate-500 font-mono text-[10px]">{acc.currency}</span>
              </div>
              <h4 className="text-slate-900 font-display text-xl">{acc.name}</h4>
              <p className="text-slate-500 text-xs font-mono">Sin descripción</p>
              
              <div className="mt-4 pt-4 border-t border-white/5">
                <span className="text-[10px] text-slate-500 uppercase">Saldo Actual</span>
                <div className="text-2xl font-mono text-emerald-400">
                  <CurrencyDisplay amount={acc.balance} size="md" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'transfers' && (
        <div className="nike-card p-6 max-w-2xl animate-fade-in">
          <h3 className="font-display text-xl text-slate-900 flex items-center gap-2 mb-4">
            <ArrowRightLeft className="w-5 h-5 text-cyan-600" /> NUEVA TRANSFERENCIA INTERNA
          </h3>
          <form onSubmit={handleTransfer} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Cuenta Origen</label>
                <select
                  value={fromAccount}
                  onChange={(e) => setFromAccount(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:border-[#00E5FF] outline-none"
                >
                  <option value="">Seleccione origen...</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name} (Saldo: ${a.balance})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Cuenta Destino</label>
                <select
                  value={toAccount}
                  onChange={(e) => setToAccount(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:border-[#00E5FF] outline-none"
                >
                  <option value="">Seleccione destino...</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Monto a Transferir ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-lg text-slate-900 font-mono font-bold focus:border-[#00E5FF] outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Medio</label>
                <select
                  value={transferMethod}
                  onChange={(e) => setTransferMethod(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:border-[#00E5FF] outline-none"
                >
                  <option value="transferencia">Transferencia / Depósito</option>
                  <option value="efectivo">Efectivo (Físico)</option>
                  <option value="zelle">Zelle</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={isProcessing} className="btn-nike-primary text-sm py-3 mt-2 justify-center disabled:opacity-50">
              {isProcessing ? 'TRANSFIRIENDO...' : 'EJECUTAR TRANSFERENCIA'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'mayor' && (
        <div className="nike-card p-0 overflow-hidden animate-fade-in">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-black/80 font-display text-sm tracking-wider uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-4">FECHA</th>
                <th className="p-4">CUENTA</th>
                <th className="p-4">TIPO</th>
                <th className="p-4">MÉTODO</th>
                <th className="p-4 text-right">MONTO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {movements.map(m => (
                <tr key={m.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-mono text-xs text-slate-500">
                    {new Date(m.created_at || '').toLocaleString()}
                  </td>
                  <td className="p-4 font-bold text-slate-900">
                    {m.treasury_account_id}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      (m.type === 'income' || m.type === 'internal_transfer_in') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {(m.type === 'income' || m.type === 'internal_transfer_in') ? 'INGRESO' : 'EGRESO'}
                    </span>
                  </td>
                  <td className="p-4 text-xs capitalize">{m.payment_method?.replace('_', ' ') || ''}</td>
                  <td className={`p-4 text-right font-mono font-bold ${
                    (m.type === 'income' || m.type === 'internal_transfer_in') ? 'text-emerald-400' : 'text-rose-400'
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

    </div>
  );
};
