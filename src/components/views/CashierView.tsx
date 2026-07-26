import React, { useState } from 'react';
import { ServiceOrder, CashTransaction, Customer } from '../../types';
import { CurrencyDisplay } from '../common/CurrencyDisplay';
import { ReceiptPDF } from '../common/ReceiptPDF';
import { DollarSign, CreditCard, Plus, Receipt, FileText, ChevronDown, ChevronUp, User } from 'lucide-react';

interface CashierViewProps {
  orders: ServiceOrder[];
  transactions: CashTransaction[];
  customers: Customer[];
  onAddPayment: (orderId: string, amount: number, method: any, ref: string, notes: string) => void;
}

export const CashierView: React.FC<CashierViewProps> = ({ orders, transactions, customers, onAddPayment }) => {
  const [activeTab, setActiveTab] = useState<'payments' | 'accounts'>('payments');
  const [selectedReceiptTx, setSelectedReceiptTx] = useState<CashTransaction | null>(null);
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);

  // Form State
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
    
    // Register Payment
    onAddPayment(selectedOrderId, paymentAmount, paymentMethod, refNumber, notes);
    
    // Reset Form
    setPaymentAmount(0);
    setRefNumber('');
    setNotes('');

    // Ideally we would show the receipt immediately here, but since onAddPayment is sync, 
    // we can alert the user or they can just click "Ver Recibo" on the table.
  };

  // Group Accounts by Customer
  const customerAccounts = customers.map(customer => {
    const customerOrders = orders.filter(o => o.customerId === customer.id);
    const customerTxs = transactions.filter(t => t.customerName === customer.fullName);
    
    const totalBilled = customerOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalPaid = customerOrders.reduce((sum, o) => sum + o.paidAmount, 0);
    const totalDebt = totalBilled - totalPaid;

    return {
      customer,
      customerOrders,
      customerTxs,
      totalBilled,
      totalPaid,
      totalDebt
    };
  }).filter(acc => acc.customerOrders.length > 0 || acc.customerTxs.length > 0);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full relative">
      
      {/* Receipt Modal */}
      {selectedReceiptTx && (
        <ReceiptPDF 
          transaction={selectedReceiptTx} 
          order={orders.find(o => o.orderNumber === selectedReceiptTx.orderNumber || o.id === selectedReceiptTx.orderId)}
          customer={customers.find(c => c.fullName === selectedReceiptTx.customerName)}
          onClose={() => setSelectedReceiptTx(null)} 
        />
      )}

      {/* Header */}
      <div>
        <h2 className="font-display text-3xl text-white tracking-wide flex items-center gap-2">
          CONTROL DE CAJA Y COBROS <DollarSign className="w-6 h-6 text-[#00E5FF]" />
        </h2>
        <p className="text-xs text-slate-400">
          Registro de abonos, cuentas corrientes por cliente y emisión de recibos.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="nike-card p-5 border-emerald-500/30">
          <span className="text-[10px] font-mono text-slate-400 uppercase">RECAUDADO EN CAJA</span>
          <div className="font-display text-4xl text-emerald-400 font-mono"><CurrencyDisplay amount={totalCollected} size="lg" /></div>
          <span className="text-xs text-slate-400">Total recibido históricamente</span>
        </div>

        <div className="nike-card p-5 border-amber-500/30">
          <span className="text-[10px] font-mono text-slate-400 uppercase">CUENTAS POR COBRAR</span>
          <div className="font-display text-4xl text-amber-400 font-mono"><CurrencyDisplay amount={totalAccountsReceivable} size="lg" /></div>
          <span className="text-xs text-slate-400">Balance total pendiente en la calle</span>
        </div>

        <div className="nike-card p-5 border-cyan-500/30">
          <span className="text-[10px] font-mono text-slate-400 uppercase">ÓRDENES ACTIVAS</span>
          <div className="font-display text-4xl text-cyan-400 font-mono">{orders.length}</div>
          <span className="text-xs text-slate-400">ODS registradas en taller</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-2">
        <button 
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 text-sm font-bold tracking-wider uppercase flex items-center gap-2 rounded-t-lg transition-colors ${activeTab === 'payments' ? 'bg-[#00E5FF] text-black' : 'text-slate-400 hover:text-white'}`}
        >
          <CreditCard className="w-4 h-4" /> Registrar Pagos & Recibos
        </button>
        <button 
          onClick={() => setActiveTab('accounts')}
          className={`px-4 py-2 text-sm font-bold tracking-wider uppercase flex items-center gap-2 rounded-t-lg transition-colors ${activeTab === 'accounts' ? 'bg-[#00E5FF] text-black' : 'text-slate-400 hover:text-white'}`}
        >
          <User className="w-4 h-4" /> Cuentas Corrientes (Clientes)
        </button>
      </div>

      {activeTab === 'payments' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Register Payment Form */}
          <div className="nike-card p-6 flex flex-col gap-4">
            <h3 className="font-display text-2xl text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#00E5FF]" /> NUEVO INGRESO
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
                      {o.orderNumber} - {o.customerName} - Pendiente: ${o.totalAmount - o.paidAmount}
                    </option>
                  ))}
                </select>
              </div>

              {selectedOrder && (
                <div className="p-3 rounded-lg bg-black/40 border border-white/5 text-xs flex flex-col gap-1 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Facturado:</span>
                    <span className="text-white font-bold">${selectedOrder.totalAmount}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm bg-slate-900/50 p-3 rounded-lg border border-red-500/20 mt-1">
                    <span className="text-slate-400">Deuda Restante:</span>
                    <span className="font-bold text-red-400"><CurrencyDisplay amount={pendingBalance} size="md" /></span>
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs text-slate-400 mb-1 block">Monto a Abonar ($)</label>
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
                <label className="text-xs text-slate-400 mb-1 block">Referencia / Lote</label>
                <input
                  type="text"
                  placeholder="Ej. ZEL-992810"
                  value={refNumber}
                  onChange={(e) => setRefNumber(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-[#00E5FF] outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1 block">Concepto del Recibo</label>
                <input
                  type="text"
                  placeholder="Ej. Abono 50% inicio de trabajo"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#00E5FF] outline-none"
                />
              </div>

              <button type="submit" className="btn-nike-primary text-sm py-2.5 mt-2 justify-center">
                PROCESAR PAGO
              </button>
            </form>
          </div>

          {/* Transactions Table Feed */}
          <div className="lg:col-span-2 nike-card p-6 flex flex-col gap-4">
            <h3 className="font-display text-2xl text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-[#00E5FF]" /> HISTORIAL DE RECIBOS
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-black/60 font-display text-sm tracking-wider uppercase text-slate-400 border-b border-white/10">
                  <tr>
                    <th className="p-3">FECHA</th>
                    <th className="p-3">CLIENTE</th>
                    <th className="p-3">MÉTODO</th>
                    <th className="p-3 text-right">MONTO</th>
                    <th className="p-3 text-center">ACCIÓN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-3 font-mono text-slate-400">{new Date(tx.date).toLocaleDateString()}</td>
                      <td className="p-3 font-medium text-white">{tx.customerName}</td>
                      <td className="p-3 text-xs">
                        <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded uppercase tracking-wider">{tx.paymentMethod.replace('_',' ')}</span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-400">
                        +<CurrencyDisplay amount={tx.amount} size="sm" />
                      </td>
                      <td className="p-3 text-center">
                        <button 
                          onClick={() => setSelectedReceiptTx(tx)}
                          className="bg-slate-800 hover:bg-[#00E5FF] text-slate-300 hover:text-black px-3 py-1.5 rounded text-xs font-bold transition-colors inline-flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5" /> RECIBO
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'accounts' && (
        <div className="animate-fade-in flex flex-col gap-4">
          <div className="bg-slate-900 border border-white/10 rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-black/80 font-display text-sm tracking-wider uppercase text-slate-400 border-b border-white/10">
                <tr>
                  <th className="p-4">CLIENTE / IDENTIFICACIÓN</th>
                  <th className="p-4 text-center">FACTURADO</th>
                  <th className="p-4 text-center">PAGADO</th>
                  <th className="p-4 text-right">SALDO DEUDOR</th>
                  <th className="p-4 text-center">DETALLES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {customerAccounts.map((acc) => (
                  <React.Fragment key={acc.customer.id}>
                    <tr className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setExpandedCustomer(expandedCustomer === acc.customer.id ? null : acc.customer.id)}>
                      <td className="p-4">
                        <div className="font-bold text-white text-base">{acc.customer.fullName}</div>
                        <div className="font-mono text-xs text-slate-400">ID: {acc.customer.documentId}</div>
                      </td>
                      <td className="p-4 text-center font-mono">${acc.totalBilled.toFixed(2)}</td>
                      <td className="p-4 text-center font-mono text-emerald-400">${acc.totalPaid.toFixed(2)}</td>
                      <td className="p-4 text-right">
                        <span className={`font-mono font-bold px-3 py-1 rounded-full text-sm ${acc.totalDebt > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                          ${acc.totalDebt.toFixed(2)}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button className="text-slate-400 hover:text-white">
                          {expandedCustomer === acc.customer.id ? <ChevronUp /> : <ChevronDown />}
                        </button>
                      </td>
                    </tr>
                    
                    {/* Expanded Statement Details */}
                    {expandedCustomer === acc.customer.id && (
                      <tr className="bg-black/40 border-b border-white/10">
                        <td colSpan={5} className="p-6">
                          <div className="grid grid-cols-2 gap-8">
                            
                            {/* Cargos (ODS) */}
                            <div>
                              <h4 className="text-amber-400 text-xs font-bold tracking-widest uppercase mb-3 border-b border-white/10 pb-2">Cargos / Órdenes (Deuda)</h4>
                              <div className="flex flex-col gap-2">
                                {acc.customerOrders.map(o => (
                                  <div key={o.id} className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400 font-mono">{o.orderNumber} - {o.vehicleBrandModel}</span>
                                    <span className="text-white font-mono font-bold">${o.totalAmount.toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Abonos (Pagos) */}
                            <div>
                              <h4 className="text-emerald-400 text-xs font-bold tracking-widest uppercase mb-3 border-b border-white/10 pb-2">Abonos / Recibos (Pagos)</h4>
                              <div className="flex flex-col gap-2">
                                {acc.customerTxs.length === 0 && <span className="text-xs text-slate-500">Sin pagos registrados</span>}
                                {acc.customerTxs.map(t => (
                                  <div key={t.id} className="flex justify-between items-center text-xs">
                                    <div className="flex gap-2 items-center">
                                      <span className="text-slate-400 font-mono">{new Date(t.date).toLocaleDateString()}</span>
                                      <span className="text-slate-500">({t.paymentMethod})</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-emerald-400 font-mono font-bold">-${t.amount.toFixed(2)}</span>
                                      <button 
                                        onClick={() => setSelectedReceiptTx(t)}
                                        className="text-[#00E5FF] hover:underline text-[10px]"
                                      >
                                        Ver Recibo
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
