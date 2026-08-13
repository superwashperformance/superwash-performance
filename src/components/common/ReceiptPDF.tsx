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
    const printContent = document.getElementById('receipt-print-area');
    if (!printContent) return;

    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (iframeDoc) {
      // Clona los estilos de Tailwind del documento actual
      const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
        .map((node) => node.outerHTML)
        .join('');

      iframeDoc.write(`
        <html>
          <head>
            <title>Recibo ${transaction.id}</title>
            ${styles}
            <style>
              @page { margin: 0; size: 80mm auto; }
              body { 
                background: white !important; 
                color: black !important; 
                padding: 10px;
                font-family: monospace;
              }
              /* Forzar modo claro para ticketeras térmicas */
              #receipt-print-area {
                width: 100%;
                max-width: 80mm;
                margin: 0 auto;
              }
              .bg-white { background: white !important; color: black !important; border-bottom: 2px dashed black !important; }
              .text-slate-900, .text-slate-500, .text-slate-700, .text-slate-800, .text-cyan-600 { color: black !important; }
              .bg-slate-50 { background: transparent !important; border: 1px solid black !important; }
              .border-b-\\[8px\\] { border-bottom: 2px solid black !important; }
              .shadow-inner { box-shadow: none !important; border: 1px solid black !important; }
              svg { color: black !important; stroke: black !important; }
              .hide-on-print { display: none !important; }
            </style>
          </head>
          <body>
            ${printContent.outerHTML}
          </body>
        </html>
      `);
      iframeDoc.close();

      // Esperar a que los estilos se apliquen
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col relative" id="receipt-print-area">
        
        {/* Receipt Header */}
        <div className="bg-white p-6 flex flex-col items-center justify-center text-center border-b-[8px] border-[#00E5FF]">
          <FaviconLogo size={48} />
          <h2 className="text-slate-900 font-display text-xl mt-3 tracking-widest">SUPER WASH</h2>
          <p className="text-slate-500 text-xs font-mono mt-1">Enterprise Performance Center</p>
          <div className="mt-4 flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/30">
            <CheckCircle2 className="w-4 h-4" />
            PAGO PROCESADO
          </div>
        </div>

        {/* Receipt Body */}
        <div className="p-6 flex flex-col gap-5 text-slate-800">
          
          <div className="flex justify-between items-end border-b border-slate-200 pb-3">
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Recibo N°</p>
              <p className="font-mono text-sm font-bold text-slate-700">REC-{transaction.id.split('-')[0].toUpperCase()}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Fecha</p>
              <p className="font-mono text-sm text-slate-700">{new Date(transaction.date).toLocaleDateString()} {new Date(transaction.date).toLocaleTimeString()}</p>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Cliente / Cuenta</p>
            <p className="font-bold text-slate-800">{transaction.customerName}</p>
            {customer && <p className="text-xs text-slate-500 font-mono">ID: {customer.documentId}</p>}
          </div>

          <div className="flex flex-col gap-3 bg-slate-50 p-4 rounded-lg border border-slate-100">
            <div className="flex justify-between items-center">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Concepto</p>
              <p className="text-xs font-bold text-slate-700">{transaction.notes || 'Abono a cuenta'}</p>
            </div>
            
            {order && (
              <div className="flex justify-between items-center">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Orden Asoc.</p>
                <p className="text-xs font-mono font-bold text-slate-700">{order.orderNumber}</p>
              </div>
            )}

            <div className="flex justify-between items-center">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Método de Pago</p>
              <p className="text-xs font-bold text-slate-700 uppercase">{transaction.paymentMethod.replace('_', ' ')}</p>
            </div>

            {transaction.referenceNumber && (
              <div className="flex justify-between items-center">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Referencia</p>
                <p className="text-xs font-mono text-slate-700">{transaction.referenceNumber}</p>
              </div>
            )}
          </div>

          {/* Amount Area */}
          <div className="flex flex-col items-center justify-center py-4 bg-white rounded-lg shadow-inner">
            <p className="text-[10px] text-cyan-600 uppercase font-bold tracking-widest mb-1">Total Abonado</p>
            <div className="font-display text-4xl text-slate-900 tracking-wider flex items-center">
              <span className="text-2xl mr-1 text-slate-500">$</span>
              {transaction.amount.toFixed(2)}
            </div>
          </div>

          <div className="text-center mt-2">
            <p className="text-[10px] text-slate-500">Atendido por: {transaction.receivedBy || 'Caja Principal'}</p>
            <p className="text-[10px] text-slate-500 mt-1">¡Gracias por preferir Super Wash!</p>
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
      {/* Eliminated global print styles because we now use iframe isolation */}
    </div>
  );
};
