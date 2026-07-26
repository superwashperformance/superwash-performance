import React, { useState } from 'react';
import { InventoryItem, InventoryCategory } from '../../types';
import { Package, AlertTriangle, Plus, ArrowUpRight, ArrowDownRight, RefreshCw, Sparkles, Droplet, Palette } from 'lucide-react';

interface InventoryViewProps {
  inventory: InventoryItem[];
  onUpdateStock: (itemId: string, newStock: number) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ inventory, onUpdateStock }) => {
  const [activeTab, setActiveTab] = useState<InventoryCategory>('detailing');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = inventory.filter(
    (item) => item.category === activeTab && item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockCount = inventory.filter((i) => i.stock <= i.minStock).length;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl text-white tracking-wide flex items-center gap-2">
            INVENTARIOS DUALES SEPARADOS <Package className="w-6 h-6 text-[#00E5FF]" />
          </h2>
          <p className="text-xs text-slate-400">
            Control de insumos de Detailing / Pulitura y Pintura / Latonería con Kárdex en tiempo real.
          </p>
        </div>

        {lowStockCount > 0 && (
          <div className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>Alerta: {lowStockCount} producto(s) en stock crítico.</span>
          </div>
        )}
      </div>

      {/* Dual Inventory Tabs */}
      <div className="flex items-center gap-2 bg-black/60 p-1.5 rounded-2xl border border-white/10 w-fit">
        <button
          onClick={() => setActiveTab('detailing')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-display text-base tracking-wider uppercase transition-all ${
            activeTab === 'detailing'
              ? 'bg-[#00E5FF] text-black font-bold shadow-lg shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Droplet className="w-5 h-5" /> 1. PULITURA / DETAILING
        </button>

        <button
          onClick={() => setActiveTab('paint')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-display text-base tracking-wider uppercase transition-all ${
            activeTab === 'paint'
              ? 'bg-amber-400 text-black font-bold shadow-lg shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Palette className="w-5 h-5" /> 2. PINTURA / LATONERÍA
        </button>
      </div>

      {/* Search & Action Bar */}
      <div className="flex items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Buscar producto por nombre o SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#00E5FF] outline-none"
        />

        <div className="text-xs text-slate-400 font-mono">
          Mostrando {filteredItems.length} insumos de {activeTab === 'detailing' ? 'Detailing' : 'Pintura'}
        </div>
      </div>

      {/* Inventory Items Table */}
      <div className="nike-card p-4 overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-black/60 font-display text-sm tracking-wider uppercase text-slate-400 border-b border-white/10">
            <tr>
              <th className="p-3">SKU</th>
              <th className="p-3">PRODUCTO / INSUMO</th>
              <th className="p-3">STOCK ACTUAL</th>
              <th className="p-3">STOCK MÍNIMO</th>
              <th className="p-3 text-right">COSTO UNITARIO</th>
              <th className="p-3">RESPONSABLE</th>
              <th className="p-3 text-center">AJUSTE DE STOCK</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-sans">
            {filteredItems.map((item) => {
              const isLow = item.stock <= item.minStock;
              return (
                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-3 font-mono text-cyan-400 font-bold">{item.sku}</td>
                  <td className="p-3 font-bold text-white">{item.name}</td>
                  <td className="p-3 font-mono font-bold">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs border ${
                        isLow
                          ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
                          : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      }`}
                    >
                      {item.stock} {item.unitOfMeasure}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-slate-400">
                    {item.minStock} {item.unitOfMeasure}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-white">${item.unitCost}</td>
                  <td className="p-3 text-slate-300">{item.responsiblePerson}</td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onUpdateStock(item.id, Math.max(0, item.stock - 1))}
                        className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center"
                        title="Restar 1 unidad"
                      >
                        -
                      </button>
                      <button
                        onClick={() => onUpdateStock(item.id, item.stock + 1)}
                        className="w-7 h-7 rounded-lg bg-[#00E5FF]/20 hover:bg-[#00E5FF] hover:text-black text-[#00E5FF] font-bold flex items-center justify-center transition-all"
                        title="Sumar 1 unidad"
                      >
                        +
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
