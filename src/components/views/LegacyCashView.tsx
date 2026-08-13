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
            <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded border border-red-500/30 uppercase tracking-widest">
              Solo Lectura
            </span>
          </h1>
          <p className="text-slate-500 mt-1 font-mono text-sm">
            Registro histórico de operaciones (v1). Esta información está congelada.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-auto rounded-xl border border-white/5 bg-[#090C12]">
        <table className="w-full text-sm text-left text-slate-700">
          <thead className="text-xs text-slate-900 uppercase bg-black/50 border-b border-slate-200 font-display tracking-wider sticky top-0">
            <tr>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">ODS / Ref</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Método</th>
              <th className="px-4 py-3 text-right">Monto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3">{tx.date}</td>
                <td className="px-4 py-3 text-cyan-600">{tx.orderNumber || tx.referenceNumber || '-'}</td>
                <td className="px-4 py-3 text-slate-900">{tx.customerName}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    tx.type === 'payment' ? 'bg-emerald-500/20 text-emerald-400' :
                    tx.type === 'expense' ? 'bg-rose-500/20 text-rose-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {tx.type}
                  </span>
                </td>
                <td className="px-4 py-3 capitalize">{tx.paymentMethod.replace('_', ' ')}</td>
                <td className={`px-4 py-3 text-right font-bold ${
                  tx.type === 'expense' || tx.type === 'refund' ? 'text-rose-400' : 'text-emerald-400'
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
