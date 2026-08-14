import React from 'react';
import { CashTransaction } from '../../types';

interface LegacyCashViewProps {
  transactions: CashTransaction[];
}

export const LegacyCashView: React.FC<LegacyCashViewProps> = ({ transactions }) => {
  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 tracking-wider flex items-center gap-3">
            HISTÓRICO LEGACY
            <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded border border-red-200 uppercase tracking-widest">
              Solo Lectura
            </span>
          </h1>
          <p className="text-slate-500 mt-1 font-mono text-sm">
            Registro histórico de operaciones (v1). Esta información está congelada.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm text-left text-slate-700">
          <thead className="text-xs text-slate-900 uppercase bg-slate-50 border-b border-slate-200 font-display tracking-wider sticky top-0">
            <tr>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">ODS / Ref</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Método</th>
              <th className="px-4 py-3 text-right">Monto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-mono">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">{tx.date}</td>
                <td className="px-4 py-3 text-[#7A1B28]">{tx.orderNumber || tx.referenceNumber || '-'}</td>
                <td className="px-4 py-3 text-slate-900">{tx.customerName}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    tx.type === 'payment' ? 'bg-emerald-100 text-emerald-700' :
                    tx.type === 'expense' ? 'bg-rose-100 text-rose-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {tx.type}
                  </span>
                </td>
                <td className="px-4 py-3 capitalize">{tx.paymentMethod.replace('_', ' ')}</td>
                <td className={`px-4 py-3 text-right font-bold ${
                  tx.type === 'expense' || tx.type === 'refund' ? 'text-rose-600' : 'text-emerald-600'
                }`}>
                  {tx.type === 'expense' || tx.type === 'refund' ? '-' : '+'}${tx.amount.toFixed(2)}
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500 italic">
                  No hay registros históricos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
