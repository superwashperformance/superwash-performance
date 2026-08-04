import React, { useState } from 'react';
import { ServiceOrder, CashTransaction, Customer } from '../../types';
import { CurrencyDisplay } from '../common/CurrencyDisplay';
import { ReceiptPDF } from '../common/ReceiptPDF';
import { DollarSign, CreditCard, Plus, Receipt, FileText, ChevronDown, ChevronUp, User, Search } from 'lucide-react';

interface CashierViewProps {
  orders: ServiceOrder[];
  transactions: CashTransaction[];
  customers: Customer[];
  onAddPayment: (orderId: string, amount: number, method: any, ref: string, notes: string, condition: 'contado' | 'cuenta_corriente') => void;
  onAccountPayment: (customerId: string, amount: number, method: any, ref: string, notes: string) => CashTransaction | void;
  registerState: { isOpen: boolean; openedAt: string | null; initialAmount: number };
  setRegisterState: (state: any) => void;
}

export const CashierView: React.FC<CashierViewProps> = ({ orders, transactions, customers, onAddPayment, onAccountPayment, registerState, setRegisterState }) => {
  const [activeTab, setActiveTab] = useState<'payments' | 'accounts'>('payments');
  const [selectedReceiptTx, setSelectedReceiptTx] = useState<CashTransaction | null>(null);
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);
  const [accountSearchTerm, setAccountSearchTerm] = useState('');
  const [accountDateFilter, setAccountDateFilter] = useState('');

  // Form State
  const [selectedOrderId, setSelectedOrderId] = useState<string>(orders[0]?.id || '');
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'zelle' | 'pago_movil' | 'tarjeta' | 'transferencia'>('zelle');
  const [paymentCondition, setPaymentCondition] = useState<'contado' | 'cuenta_corriente'>('contado');
  const [refNumber, setRefNumber] = useState('');
  const [notes, setNotes] = useState('');

  const [showCloseModal, setShowCloseModal] = useState(false);
  const [initialAmountInput, setInitialAmountInput] = useState(0);

  // Set of order IDs that have already been transferred to Cuenta Corriente
  const ccOrderIds = new Set(
    transactions
      .filter((t) => t.paymentCondition === 'cuenta_corriente' && t.orderId)
      .map((t) => t.orderId)
  );

  // Available ODS for initial payment / transfer (pending balance AND not yet in Cuenta Corriente)
  const availableOrders = orders.filter(
    (o) => o.totalAmount - o.paidAmount > 0 && !ccOrderIds.has(o.id)
  );

  // Keep selectedOrderId in sync with availableOrders
  React.useEffect(() => {
    if (availableOrders.length > 0) {
      if (!availableOrders.some((o) => o.id === selectedOrderId)) {
        setSelectedOrderId(availableOrders[0].id);
        setPaymentAmount(availableOrders[0].totalAmount - availableOrders[0].paidAmount);
      }
    } else {
      setSelectedOrderId('');
      setPaymentAmount(0);
    }
  }, [availableOrders, selectedOrderId]);

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);
  const pendingBalance = selectedOrder ? selectedOrder.totalAmount - selectedOrder.paidAmount : 0;

  const totalCollected = transactions.filter(t => t.paymentCondition !== 'cuenta_corriente').reduce((sum, t) => sum + t.amount, 0);
  const totalAccountsReceivable = orders.reduce((sum, o) => sum + (o.totalAmount - o.paidAmount), 0);

  // Highest Cash (Contado) Ticket
  const contadoTxs = transactions.filter(t => t.type === 'payment' && (t.paymentCondition === 'contado' || !t.paymentCondition));
  const maxContadoTicket = contadoTxs.length > 0 ? Math.max(...contadoTxs.map(t => t.amount)) : 0;

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    const finalAmount = paymentAmount > 0 ? paymentAmount : pendingBalance;
    if (finalAmount <= 0) return;
    
    // Register Payment
    onAddPayment(selectedOrderId, finalAmount, paymentMethod, refNumber, notes, paymentCondition);
    
    // Reset Form
    setPaymentAmount(0);
    setRefNumber('');
    setNotes('');
  };

  const handleOpenRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterState({
      isOpen: true,
      openedAt: new Date().toISOString(),
      initialAmount: initialAmountInput
    });
  };

  const handleCloseRegister = () => {
    setRegisterState({
      isOpen: false,
      openedAt: null,
      initialAmount: 0
    });
    setShowCloseModal(false);
  };

  // Extract unique customers from orders and transactions
  const uniqueCustomersMap = new Map<string, { id: string; fullName: string; documentId: string }>();
  
  orders.forEach(o => {
    if (o.customerName) {
      // Use customerName as fallback key if id is missing
      const key = o.customerId || o.customerName;
      if (!uniqueCustomersMap.has(key)) {
        uniqueCustomersMap.set(key, {
          id: o.customerId || key,
          fullName: o.customerName,
          documentId: 'N/A' // Not available directly in order unless fetched, but we can just show N/A
        });
      }
    }
  });

  transactions.forEach(t => {
    if (t.customerName) {
      const key = t.customerName; // Transactions currently only store name
      if (!uniqueCustomersMap.has(key)) {
        uniqueCustomersMap.set(key, {
          id: key,
          fullName: t.customerName,
          documentId: 'N/A'
        });
      }
    }
  });

  // Group Accounts by Customer
  const customerAccounts = Array.from(uniqueCustomersMap.values()).map(customer => {
    const customerOrders = orders.filter(o => (o.customerId === customer.id || o.customerName === customer.fullName) && ccOrderIds.has(o.id));
    const customerTxs = transactions.filter(t => t.customerName === customer.fullName && t.paymentCondition === 'abono_cuenta' as any);
    
    const totalBilled = customerOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalPaid = customerTxs.reduce((sum, t) => sum + t.amount, 0);
    const totalDebt = Math.max(0, totalBilled - totalPaid);

    return {
      customer,
      customerOrders,
      customerTxs,
      totalBilled,
      totalPaid,
      totalDebt
    };
  }).filter(acc => acc.totalDebt > 0 || acc.customerTxs.length > 0 || acc.customerOrders.length > 0);

  const filteredCustomerAccounts = customerAccounts.filter(acc => {
    const matchesSearch = acc.customer.fullName.toLowerCase().includes(accountSearchTerm.toLowerCase()) || 
                          acc.customer.documentId.toLowerCase().includes(accountSearchTerm.toLowerCase());
    
    const matchesDate = !accountDateFilter || 
                        acc.customerTxs.some(t => t.date.includes(accountDateFilter)) ||
                        acc.customerOrders.some(o => o.entryDate.includes(accountDateFilter));

    return matchesSearch && matchesDate;
  });

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl text-white tracking-wide flex items-center gap-2">
            CONTROL DE CAJA Y COBROS <DollarSign className="w-6 h-6 text-[#00E5FF]" />
          </h2>
          <p className="text-xs text-slate-400">
            Registro de abonos, cuentas corrientes por cliente y emisión de recibos.
          </p>
        </div>
        {registerState.isOpen && (
          <button 
            onClick={() => setShowCloseModal(true)}
            className="bg-red-500/20 text-red-500 border border-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors uppercase tracking-wider"
          >
            Cerrar Caja
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="nike-card p-5 border-emerald-500/30">
          <span className="text-[10px] font-mono text-slate-400 uppercase">RECAUDADO EN CAJA</span>
          <div className="font-display text-3xl text-emerald-400 font-mono"><CurrencyDisplay amount={totalCollected} size="lg" /></div>
          <span className="text-xs text-slate-400">Total recibido en efectivo/transferencias</span>
        </div>

        <div className="nike-card p-5 border-amber-500/30">
          <span className="text-[10px] font-mono text-slate-400 uppercase">CUENTAS POR COBRAR</span>
          <div className="font-display text-3xl text-amber-400 font-mono"><CurrencyDisplay amount={totalAccountsReceivable} size="lg" /></div>
          <span className="text-xs text-slate-400">Balance total pendiente en crédito</span>
        </div>

        <div className="nike-card p-5 border-cyan-500/30">
          <span className="text-[10px] font-mono text-slate-400 uppercase">MAYOR TICKET CONTADO</span>
          <div className="font-display text-3xl text-[#00E5FF] font-mono"><CurrencyDisplay amount={maxContadoTicket} size="lg" /></div>
          <span className="text-xs text-slate-400">Venta más alta procesada a contado</span>
        </div>

        <div className="nike-card p-5 border-purple-500/30">
          <span className="text-[10px] font-mono text-slate-400 uppercase">ÓRDENES ACTIVAS</span>
          <div className="font-display text-3xl text-purple-400 font-mono">{orders.length}</div>
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
          <div className="nike-card p-6 flex flex-col gap-4 relative overflow-hidden">
            <h3 className="font-display text-2xl text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#00E5FF]" /> NUEVO INGRESO
            </h3>

            {!registerState.isOpen ? (
              <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center border border-white/10 rounded-2xl">
                <DollarSign className="w-12 h-12 text-slate-500 mb-4" />
                <h4 className="text-white font-display text-xl mb-2">CAJA CERRADA</h4>
                <p className="text-xs text-slate-400 mb-6">Debes abrir la caja para poder procesar pagos o abonos.</p>
                
                <form onSubmit={handleOpenRegister} className="w-full flex flex-col gap-3">
                  <div className="text-left">
                    <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 block">Fondo de Caja / Monto Inicial ($)</label>
                    <input 
                      type="number" 
                      min="0"
                      step="0.01"
                      value={initialAmountInput}
                      onChange={(e) => setInitialAmountInput(Number(e.target.value))}
                      className="w-full bg-black border border-white/10 rounded px-3 py-2 text-sm text-white font-mono outline-none focus:border-[#00E5FF] text-center"
                    />
                  </div>
                  <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-lg transition-colors uppercase tracking-widest text-sm">
                    Aperturar Caja
                  </button>
                </form>
              </div>
            ) : null}

            <form onSubmit={handleSubmitPayment} className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Seleccionar ODS de Cliente</label>
                <select
                  value={selectedOrderId}
                  onChange={(e) => {
                    setSelectedOrderId(e.target.value);
                    const ord = availableOrders.find((o) => o.id === e.target.value);
                    if (ord) setPaymentAmount(ord.totalAmount - ord.paidAmount);
                  }}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#00E5FF] outline-none"
                >
                  {availableOrders.length === 0 ? (
                    <option value="">No hay ODS pendientes por ingresar</option>
                  ) : (
                    availableOrders.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.orderNumber} - {o.customerName} - Pendiente: ${o.totalAmount - o.paidAmount}
                      </option>
                    ))
                  )}
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
                <label className="text-xs text-slate-400 mb-1 block">Condición de Pago</label>
                <select
                  value={paymentCondition}
                  onChange={(e) => setPaymentCondition(e.target.value as any)}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#00E5FF] outline-none mb-3"
                >
                  <option value="contado">Contado (Caja del Día)</option>
                  <option value="cuenta_corriente">Cuenta Corriente (Crédito/Deuda)</option>
                </select>

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
                      <td className="p-3 text-xs flex flex-col gap-1 items-start">
                        <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded uppercase tracking-wider">{tx.paymentMethod.replace('_',' ')}</span>
                        {tx.paymentCondition && (
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                            tx.paymentCondition === 'contado' ? 'bg-[#00E5FF]/20 text-[#00E5FF]' : 'bg-purple-500/20 text-purple-400'
                          }`}>
                            {tx.paymentCondition.replace('_', ' ')}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-400">
                        +<CurrencyDisplay amount={tx.amount} size="sm" />
                      </td>
                      <td className="p-3 text-center">
                        {tx.paymentCondition === 'cuenta_corriente' ? (
                          <span className="bg-amber-500/20 text-amber-400 px-3 py-1.5 rounded text-[10px] font-bold tracking-wider inline-flex items-center justify-center">
                            PENDIENTE
                          </span>
                        ) : (
                          <button 
                            onClick={() => setSelectedReceiptTx(tx)}
                            className="bg-slate-800 hover:bg-[#00E5FF] text-slate-300 hover:text-black px-3 py-1.5 rounded text-xs font-bold transition-colors inline-flex items-center gap-1"
                          >
                            <FileText className="w-3.5 h-3.5" /> RECIBO
                          </button>
                        )}
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
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-4 bg-slate-900 border border-white/10 rounded-xl px-4 py-2 flex-1 max-w-md">
              <Search className="w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar por Nombre o Documento..." 
                value={accountSearchTerm}
                onChange={(e) => setAccountSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none text-white w-full text-sm placeholder:text-slate-500"
              />
            </div>

            <div className="flex items-center gap-2 bg-slate-900 border border-white/10 rounded-xl px-4 py-2">
              <span className="text-xs text-slate-400 uppercase font-mono">Filtrar Fecha:</span>
              <input 
                type="date"
                value={accountDateFilter}
                onChange={(e) => setAccountDateFilter(e.target.value)}
                className="bg-black border border-white/10 text-white rounded px-2 py-1 text-xs outline-none focus:border-[#00E5FF]"
              />
              {accountDateFilter && (
                <button 
                  onClick={() => setAccountDateFilter('')}
                  className="text-xs text-red-400 hover:underline font-bold ml-1"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

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
                {filteredCustomerAccounts.map((acc) => (
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
                              <div className="flex flex-col gap-2 mb-6">
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
                                        className="view-latest-receipt text-[#00E5FF] hover:underline text-[10px]"
                                        data-customer={acc.customer.id}
                                      >
                                        Ver Recibo
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Formulario de Pago */}
                              {acc.totalDebt > 0 && (
                                <div className="bg-slate-900/50 p-4 rounded-xl border border-white/10 relative overflow-hidden">
                                  {!registerState.isOpen && (
                                    <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm z-10 flex items-center justify-center p-4 text-center">
                                      <p className="text-xs text-amber-400 font-bold tracking-widest uppercase">ABRE LA CAJA PARA PROCESAR ABONOS</p>
                                    </div>
                                  )}
                                  <h4 className="text-white text-xs font-bold mb-3 flex items-center gap-2">
                                    <Plus className="w-4 h-4 text-[#00E5FF]" /> NUEVO ABONO A CUENTA
                                  </h4>
                                  <form 
                                    className="flex flex-col gap-3"
                                    onSubmit={(e) => {
                                      e.preventDefault();
                                      const formData = new FormData(e.currentTarget);
                                      const amount = Number(formData.get('amount'));
                                      const method = formData.get('method');
                                      const ref = formData.get('ref') as string;
                                      const notes = formData.get('notes') as string;
                                      
                                      if (amount > 0 && amount <= acc.totalDebt) {
                                        const createdTx = onAccountPayment(acc.customer.id, amount, method, ref, notes);
                                        e.currentTarget.reset();
                                        if (createdTx) {
                                          setSelectedReceiptTx(createdTx);
                                        }
                                      }
                                    }}
                                  >
                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <label className="text-[10px] text-slate-400 block mb-1">Monto ($)</label>
                                        <input name="amount" type="number" max={acc.totalDebt} step="0.01" required className="w-full bg-black border border-white/10 rounded px-2 py-1.5 text-xs text-white outline-none focus:border-[#00E5FF]" />
                                      </div>
                                      <div>
                                        <label className="text-[10px] text-slate-400 block mb-1">Método</label>
                                        <select name="method" className="w-full bg-black border border-white/10 rounded px-2 py-1.5 text-xs text-white outline-none focus:border-[#00E5FF]">
                                          <option value="zelle">Zelle</option>
                                          <option value="pago_movil">Pago Móvil</option>
                                          <option value="efectivo">Efectivo</option>
                                          <option value="transferencia">Transferencia</option>
                                          <option value="tarjeta">Punto de Venta</option>
                                        </select>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <label className="text-[10px] text-slate-400 block mb-1">Referencia</label>
                                        <input name="ref" type="text" className="w-full bg-black border border-white/10 rounded px-2 py-1.5 text-xs text-white outline-none focus:border-[#00E5FF]" />
                                      </div>
                                      <div>
                                        <label className="text-[10px] text-slate-400 block mb-1">Concepto</label>
                                        <input name="notes" type="text" defaultValue="Abono a deuda" className="w-full bg-black border border-white/10 rounded px-2 py-1.5 text-xs text-white outline-none focus:border-[#00E5FF]" />
                                      </div>
                                    </div>
                                    <button type="submit" className="w-full bg-[#00E5FF] text-black font-bold text-xs py-2 rounded mt-1 hover:bg-[#00E5FF]/80 transition-colors">
                                      PROCESAR ABONO
                                    </button>
                                  </form>
                                </div>
                              )}
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

      {/* Close Register Modal */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full flex flex-col gap-6 animate-scale-up shadow-2xl shadow-[#00E5FF]/10">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30">
                <DollarSign className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="font-display text-2xl text-white mb-2">CERRAR CAJA</h3>
              <p className="text-xs text-slate-400">
                Al cerrar la caja ya no podrás recibir más pagos hasta volver a aperturarla.
              </p>
            </div>

            <div className="bg-black/50 rounded-lg p-4 flex flex-col gap-2 font-mono text-sm">
              <div className="flex justify-between border-b border-white/10 pb-2 mb-2">
                <span className="text-slate-400">Fondo Inicial:</span>
                <span className="text-white">${registerState.initialAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-lg">
                <span className="text-slate-400 font-sans text-xs uppercase tracking-widest">Total en Caja:</span>
                <span className="text-emerald-400 font-bold">${totalCollected.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowCloseModal(false)}
                className="flex-1 bg-transparent border border-white/20 text-white py-3 rounded-xl font-bold text-sm hover:bg-white/5 transition-colors"
              >
                CANCELAR
              </button>
              <button 
                onClick={handleCloseRegister}
                className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold text-sm hover:bg-red-400 transition-colors uppercase tracking-wider"
              >
                CERRAR CAJA
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
