import React from 'react';
import { CashTransaction, ServiceOrder, Customer } from '../../types';
import { CurrencyDisplay } from './CurrencyDisplay';
import { FaviconLogo } from './FaviconLogo';
import { Printer, CheckCircle2 } from 'lucide-react';

interface ReceiptPDFProps {
  transaction: CashTransaction;
  order?: ServiceOrder;
  customer?: Customer;
  onClose: () => void;
}

export const ReceiptPDF: React.FC<ReceiptPDFProps> = ({ transaction, order, customer, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col relative printable-receipt">
        
        {/* Receipt Header */}
        <div className="bg-slate-900 p-6 flex flex-col items-center justify-center text-center border-b-[8px] border-[#00E5FF]">
          <FaviconLogo size={48} />
          <h2 className="text-white font-display text-xl mt-3 tracking-widest">SUPER WASH</h2>
          <p className="text-slate-400 text-xs font-mono mt-1">Enterprise Performance Center</p>
          <div className="mt-4 flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/30">
            <CheckCircle2 className="w-4 h-4" />
            PAGO PROCESADO
          </div>
        </div>

        {/* Receipt Body */}
        <div className="p-6 flex flex-col gap-5 text-slate-800">
          
          <div className="flex justify-between items-end border-b border-slate-200 pb-3">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Recibo N°</p>
              <p className="font-mono text-sm font-bold text-slate-700">REC-{transaction.id.split('-')[0].toUpperCase()}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Fecha</p>
              <p className="font-mono text-sm text-slate-700">{new Date(transaction.date).toLocaleDateString()} {new Date(transaction.date).toLocaleTimeString()}</p>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Cliente / Cuenta</p>
            <p className="font-bold text-slate-800">{transaction.customerName}</p>
            {customer && <p className="text-xs text-slate-500 font-mono">ID: {customer.documentId}</p>}
          </div>

          <div className="flex flex-col gap-3 bg-slate-50 p-4 rounded-lg border border-slate-100">
            <div className="flex justify-between items-center">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Concepto</p>
              <p className="text-xs font-bold text-slate-700">{transaction.notes || 'Abono a cuenta'}</p>
            </div>
            
            {order && (
              <div className="flex justify-between items-center">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Orden Asoc.</p>
                <p className="text-xs font-mono font-bold text-slate-700">{order.orderNumber}</p>
              </div>
            )}

            <div className="flex justify-between items-center">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Método de Pago</p>
              <p className="text-xs font-bold text-slate-700 uppercase">{transaction.paymentMethod.replace('_', ' ')}</p>
            </div>

            {transaction.referenceNumber && (
              <div className="flex justify-between items-center">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Referencia</p>
                <p className="text-xs font-mono text-slate-700">{transaction.referenceNumber}</p>
              </div>
            )}
          </div>

          {/* Amount Area */}
          <div className="flex flex-col items-center justify-center py-4 bg-slate-900 rounded-lg shadow-inner">
            <p className="text-[10px] text-[#00E5FF] uppercase font-bold tracking-widest mb-1">Total Abonado</p>
            <div className="font-display text-4xl text-white tracking-wider flex items-center">
              <span className="text-2xl mr-1 text-slate-400">$</span>
              {transaction.amount.toFixed(2)}
            </div>
          </div>

          <div className="text-center mt-2">
            <p className="text-[10px] text-slate-400">Atendido por: {transaction.receivedBy || 'Caja Principal'}</p>
            <p className="text-[10px] text-slate-400 mt-1">¡Gracias por preferir Super Wash!</p>
          </div>
        </div>

        {/* Action Buttons (Not printed) */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex gap-3 hide-on-print">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-slate-300 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-colors">
            CERRAR
          </button>
          <button onClick={handlePrint} className="flex-1 py-2.5 rounded-lg bg-[#00E5FF] text-black font-bold text-sm hover:bg-cyan-400 transition-colors shadow-lg flex items-center justify-center gap-2">
            <Printer className="w-4 h-4" /> IMPRIMIR RECIBO
          </button>
        </div>
      </div>
      
      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-receipt, .printable-receipt * {
            visibility: visible;
          }
          .printable-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            max-width: 80mm; /* Thermal printer width */
            box-shadow: none;
            border-radius: 0;
          }
          .hide-on-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
