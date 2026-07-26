import React, { useState } from 'react';
import { ServiceOrder, CashTransaction } from '../../types';
import { DollarSign, ArrowDownLeft, CreditCard, Wallet, Plus, CheckCircle, Receipt } from 'lucide-react';

interface CashierViewProps {
  orders: ServiceOrder[];
  transactions: CashTransaction[];
  onAddPayment: (orderId: string, amount: number, method: any, ref: string, notes: string) => void;
}

export const CashierView: React.FC<CashierViewProps> = ({ orders, transactions, onAddPayment }) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string>(orders[0]?.id || '');
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'zelle' | 'pago_movil' | 'tarjeta' | 'transferencia'>('zelle');
  const [refNumber, setRefNumber] = useState('');
  const [notes, setNotes] = useState('');

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);
  const pendingBalance = selectedOrder ? selectedOrder.totalAmount - selectedOrder.paidAmount : 0;

  const totalCollected = transactions.reduce((sum, t) => sum + t.amount, 0);
  const totalAccountsReceivable = orders.reduce((sum, o) => sum + (o.totalAmount - o.paidAmount), 0);

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || paymentAmount <= 0) return;
    onAddPayment(selectedOrderId, paymentAmount, paymentMethod, refNumber, notes);
    setPaymentAmount(0);
    setRefNumber('');
    setNotes('');
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div>
        <h2 className="font-display text-3xl text-white tracking-wide flex items-center gap-2">
          CONTROL DE CAJA Y COBROS <DollarSign className="w-6 h-6 text-[#00E5FF]" />
        </h2>
        <p className="text-xs text-slate-400">
          Registro de abonos, pagos totales, cuentas por cobrar y balance de caja chica diaria.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="nike-card p-5 border-emerald-500/30">
          <span className="text-[10px] font-mono text-slate-400 uppercase">RECAUDADO EN CAJA</span>
          <div className="font-display text-4xl text-emerald-400 font-mono">${totalCollected}</div>
          <span className="text-xs text-slate-400">Total recibido en la jornada</span>
        </div>

        <div className="nike-card p-5 border-amber-500/30">
          <span className="text-[10px] font-mono text-slate-400 uppercase">CUENTAS POR COBRAR</span>
          <div className="font-display text-4xl text-amber-400 font-mono">${totalAccountsReceivable}</div>
          <span className="text-xs text-slate-400">Balance pendiente por cobrar</span>
        </div>

        <div className="nike-card p-5 border-cyan-500/30">
          <span className="text-[10px] font-mono text-slate-400 uppercase">ÓRDENES ACTIVAS</span>
          <div className="font-display text-4xl text-cyan-400 font-mono">{orders.length}</div>
          <span className="text-xs text-slate-400">ODS registradas en taller</span>
        </div>
      </div>

      {/* Payment Registrar & History split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Register Payment Form */}
        <div className="nike-card p-6 flex flex-col gap-4">
          <h3 className="font-display text-2xl text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-[#00E5FF]" /> REGISTRAR PAGO / ABONO
          </h3>

          <form onSubmit={handleSubmitPayment} className="flex flex-col gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Seleccionar ODS de Cliente</label>
              <select
                value={selectedOrderId}
                onChange={(e) => {
                  setSelectedOrderId(e.target.value);
                  const ord = orders.find((o) => o.id === e.target.value);
                  if (ord) setPaymentAmount(ord.totalAmount - ord.paidAmount);
                }}
                className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#00E5FF] outline-none"
              >
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.orderNumber} - {o.customerName} ({o.vehicleBrandModel}) - Pendiente: ${o.totalAmount - o.paidAmount}
                  </option>
                ))}
              </select>
            </div>

            {selectedOrder && (
              <div className="p-3 rounded-lg bg-black/40 border border-white/5 text-xs flex flex-col gap-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Monto Total ODS:</span>
                  <span className="text-white font-bold">${selectedOrder.totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Monto Pagado:</span>
                  <span className="text-emerald-400 font-bold">${selectedOrder.paidAmount}</span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-1 text-amber-400">
                  <span>Monto Pendiente:</span>
                  <span className="font-bold">${pendingBalance}</span>
                </div>
              </div>
            )}

            <div>
              <label className="text-xs text-slate-400 mb-1 block">Monto a Ingresar ($)</label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono font-bold focus:border-[#00E5FF] outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1 block">Método de Pago</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#00E5FF] outline-none"
              >
                <option value="zelle">Zelle</option>
                <option value="pago_movil">Pago Móvil</option>
                <option value="efectivo">Efectivo ($ USD / BS)</option>
                <option value="transferencia">Transferencia Bancaria</option>
                <option value="tarjeta">Punto de Venta / Tarjeta</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1 block">Número de Referencia</label>
              <input
                type="text"
                placeholder="Ej. ZEL-992810"
                value={refNumber}
                onChange={(e) => setRefNumber(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-[#00E5FF] outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1 block">Notas / Concepto</label>
              <input
                type="text"
                placeholder="Ej. Abono 50% inicio de trabajo"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#00E5FF] outline-none"
              />
            </div>

            <button type="submit" className="btn-nike-primary text-sm py-2.5 mt-2 justify-center">
              REGISTRAR PAGO EN CAJA
            </button>
          </form>
        </div>

        {/* Transactions Table Feed */}
        <div className="lg:col-span-2 nike-card p-6 flex flex-col gap-4">
          <h3 className="font-display text-2xl text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#00E5FF]" /> HISTORIAL DE TRANSACCIONES Y RECIBOS
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-black/60 font-display text-sm tracking-wider uppercase text-slate-400 border-b border-white/10">
                <tr>
                  <th className="p-3">ODS</th>
                  <th className="p-3">CLIENTE</th>
                  <th className="p-3">MÉTODO</th>
                  <th className="p-3">REFERENCIA</th>
                  <th className="p-3">FECHA</th>
                  <th className="p-3 text-right">MONTO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 font-mono font-bold text-[#00E5FF]">{tx.orderNumber}</td>
                    <td className="p-3 font-bold text-white">{tx.customerName}</td>
                    <td className="p-3 uppercase text-[10px] font-mono text-slate-400">{tx.paymentMethod}</td>
                    <td className="p-3 font-mono text-slate-400">{tx.referenceNumber || 'N/A'}</td>
                    <td className="p-3 font-mono text-slate-400">{tx.date}</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-400">+${tx.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
