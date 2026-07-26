import React, { useState } from 'react';
import { DamageMarker } from '../../types';
import { ShieldAlert, Plus, Trash2, AlertTriangle, Sparkles } from 'lucide-react';

interface VehicleDiagram360Props {
  markers: DamageMarker[];
  onAddMarker?: (marker: Omit<DamageMarker, 'id'>) => void;
  onRemoveMarker?: (id: string) => void;
  readOnly?: boolean;
}

export const VehicleDiagram360: React.FC<VehicleDiagram360Props> = ({
  markers,
  onAddMarker,
  onRemoveMarker,
  readOnly = false,
}) => {
  const [activeView, setActiveView] = useState<'front' | 'rear' | 'left' | 'right' | 'top'>('front');
  const [selectedDamageType, setSelectedDamageType] = useState<DamageMarker['type']>('scratch');
  const [selectedSeverity, setSelectedSeverity] = useState<DamageMarker['severity']>('low');
  const [damageDescription, setDamageDescription] = useState('');
  const [pendingCoords, setPendingCoords] = useState<{ x: number; y: number } | null>(null);

  const viewLabels = {
    front: 'Vista Frontal',
    rear: 'Vista Trasera',
    left: 'Lateral Izquierdo',
    right: 'Lateral Derecho',
    top: 'Techo y Capó (Superior)',
  };

  const damageTypes = [
    { type: 'scratch', label: 'Rayón / Micro-rayón', color: 'bg-amber-500' },
    { type: 'dent', label: 'Abolladura / Golpe', color: 'bg-red-500' },
    { type: 'paint_chip', label: 'Pintura Saltada', color: 'bg-cyan-400' },
    { type: 'crack', label: 'Grieta / Fisura', color: 'bg-purple-500' },
    { type: 'other', label: 'Otro Detalle', color: 'bg-slate-400' },
  ];

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (readOnly) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setPendingCoords({ x, y });
  };

  const handleConfirmMarker = () => {
    if (!pendingCoords || !onAddMarker) return;
    onAddMarker({
      x: pendingCoords.x,
      y: pendingCoords.y,
      view: activeView,
      type: selectedDamageType,
      severity: selectedSeverity,
      description: damageDescription.trim() || `Daño registrado en ${viewLabels[activeView]}`,
    });
    setPendingCoords(null);
    setDamageDescription('');
  };

  const filteredMarkers = markers.filter((m) => m.view === activeView);

  return (
    <div className="nike-card p-6 flex flex-col gap-6">
      {/* Header & View Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-2xl tracking-wide text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-[#00E5FF]" /> CANVA INTERACTIVO DE INSPECCIÓN 360°
          </h3>
          <p className="text-xs text-slate-400">
            Haz clic directamente sobre el diagrama del vehículo para registrar rayones, golpes o detalles.
          </p>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-1 bg-black/50 p-1.5 rounded-full border border-white/10 overflow-x-auto">
          {(['front', 'rear', 'left', 'right', 'top'] as const).map((view) => {
            const count = markers.filter((m) => m.view === view).length;
            return (
              <button
                key={view}
                onClick={() => {
                  setActiveView(view);
                  setPendingCoords(null);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-display tracking-wider uppercase transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeView === view
                    ? 'bg-[#00E5FF] text-black font-bold shadow-lg shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {viewLabels[view]}
                {count > 0 && (
                  <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-mono">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Diagram Canvas */}
      <div className="relative w-full aspect-[2/1] min-h-[300px] max-h-[420px] bg-gradient-to-b from-slate-950 to-slate-900 rounded-2xl border border-white/10 flex items-center justify-center p-6 overflow-hidden select-none">
        {/* Background Grid Accent */}
        <div className="absolute inset-0 bg-[radial-gradient(#00E5FF_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />

        {/* Interactive Surface */}
        <div
          onClick={handleCanvasClick}
          className={`relative w-full h-full max-w-2xl flex items-center justify-center ${
            !readOnly ? 'cursor-crosshair' : ''
          }`}
        >
          {/* Vector Car Outline Render for Active View */}
          <svg viewBox="0 0 600 300" className="w-full h-full drop-shadow-[0_0_20px_rgba(0,229,255,0.15)]">
            <defs>
              <linearGradient id="carGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1E293B" />
                <stop offset="100%" stopColor="#0F172A" />
              </linearGradient>
            </defs>

            {/* Front View */}
            {activeView === 'front' && (
              <g fill="none" stroke="#00E5FF" strokeWidth="2.5" opacity="0.85">
                <rect x="120" y="80" width="360" height="150" rx="35" fill="url(#carGrad)" stroke="#475569" strokeWidth="3" />
                <path d="M160 120 C 220 90, 380 90, 440 120" stroke="#00E5FF" strokeWidth="3" />
                <rect x="150" y="140" width="80" height="40" rx="8" fill="#00E5FF" fillOpacity="0.2" />
                <rect x="370" y="140" width="80" height="40" rx="8" fill="#00E5FF" fillOpacity="0.2" />
                <rect x="220" y="190" width="160" height="30" rx="6" stroke="#475569" fill="#090D16" />
                <circle cx="200" cy="230" r="24" fill="#0F172A" stroke="#475569" strokeWidth="4" />
                <circle cx="400" cy="230" r="24" fill="#0F172A" stroke="#475569" strokeWidth="4" />
              </g>
            )}

            {/* Rear View */}
            {activeView === 'rear' && (
              <g fill="none" stroke="#FF1744" strokeWidth="2.5" opacity="0.85">
                <rect x="120" y="80" width="360" height="150" rx="35" fill="url(#carGrad)" stroke="#475569" strokeWidth="3" />
                <path d="M170 120 C 240 95, 360 95, 430 120" stroke="#94A3B8" strokeWidth="3" />
                <rect x="140" y="140" width="90" height="30" rx="6" fill="#FF1744" fillOpacity="0.3" />
                <rect x="370" y="140" width="90" height="30" rx="6" fill="#FF1744" fillOpacity="0.3" />
                <rect x="240" y="180" width="120" height="25" rx="4" stroke="#475569" fill="#090D16" />
                <circle cx="210" cy="210" r="12" fill="#00E5FF" fillOpacity="0.2" stroke="#00E5FF" />
                <circle cx="390" cy="210" r="12" fill="#00E5FF" fillOpacity="0.2" stroke="#00E5FF" />
              </g>
            )}

            {/* Side Views (Left / Right) */}
            {(activeView === 'left' || activeView === 'right') && (
              <g fill="none" stroke="#00E5FF" strokeWidth="2.5" opacity="0.85">
                <path d="M 60 180 L 120 130 L 220 90 L 400 90 L 480 130 L 540 180 L 540 220 L 60 220 Z" fill="url(#carGrad)" stroke="#475569" strokeWidth="3" />
                <path d="M 135 130 L 220 98 L 380 98 L 430 130 Z" fill="#00E5FF" fillOpacity="0.15" stroke="#00E5FF" strokeWidth="2" />
                <circle cx="160" cy="220" r="32" fill="#090D16" stroke="#00E5FF" strokeWidth="5" />
                <circle cx="440" cy="220" r="32" fill="#090D16" stroke="#00E5FF" strokeWidth="5" />
                <line x1="280" y1="130" x2="280" y2="210" stroke="#475569" strokeWidth="2" />
                <line x1="260" y1="145" x2="275" y2="145" stroke="#00E5FF" strokeWidth="3" />
              </g>
            )}

            {/* Top View */}
            {activeView === 'top' && (
              <g fill="none" stroke="#00E5FF" strokeWidth="2.5" opacity="0.85">
                <rect x="150" y="40" width="300" height="220" rx="60" fill="url(#carGrad)" stroke="#475569" strokeWidth="3" />
                <rect x="200" y="80" width="200" height="70" rx="15" fill="#00E5FF" fillOpacity="0.2" stroke="#00E5FF" />
                <rect x="200" y="170" width="200" height="60" rx="15" fill="#00E5FF" fillOpacity="0.2" stroke="#00E5FF" />
              </g>
            )}
          </svg>

          {/* Render Existing Markers */}
          {filteredMarkers.map((marker) => (
            <div
              key={marker.id}
              style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 group z-20"
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-black font-bold text-xs shadow-lg animate-bounce ${
                  marker.severity === 'high'
                    ? 'bg-red-500 shadow-red-500/50'
                    : marker.severity === 'medium'
                    ? 'bg-amber-400 shadow-amber-400/50'
                    : 'bg-cyan-400 shadow-cyan-400/50'
                }`}
              >
                !
              </div>

              {/* Tooltip Popup */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:flex flex-col bg-slate-900 border border-white/20 p-2.5 rounded-xl shadow-2xl w-48 text-left z-30 pointer-events-auto">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] font-display tracking-wider uppercase text-cyan-400 font-bold">
                    {marker.type}
                  </span>
                  {!readOnly && onRemoveMarker && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveMarker(marker.id);
                      }}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-white leading-snug">{marker.description}</p>
              </div>
            </div>
          ))}

          {/* Pending Marker Indicator */}
          {pendingCoords && (
            <div
              style={{ left: `${pendingCoords.x}%`, top: `${pendingCoords.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-30"
            >
              <div className="w-8 h-8 rounded-full bg-[#00E5FF] text-black font-extrabold text-sm flex items-center justify-center shadow-2xl animate-ping" />
            </div>
          )}
        </div>
      </div>

      {/* Adding Damage Modal Form */}
      {pendingCoords && (
        <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/30 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <span className="font-display text-lg text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#00E5FF]" /> REGISTRAR DETALLE EN {viewLabels[activeView].toUpperCase()}
            </span>
            <button
              onClick={() => setPendingCoords(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Type selector */}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Tipo de Daño</label>
              <select
                value={selectedDamageType}
                onChange={(e) => setSelectedDamageType(e.target.value as DamageMarker['type'])}
                className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#00E5FF] outline-none"
              >
                {damageTypes.map((dt) => (
                  <option key={dt.type} value={dt.type}>
                    {dt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Severity selector */}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Gravedad</label>
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value as DamageMarker['severity'])}
                className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#00E5FF] outline-none"
              >
                <option value="low">Leve (Micro-rayón / Superficial)</option>
                <option value="medium">Moderado (Rayón visible / Pequeño golpe)</option>
                <option value="high">Grave (Abolladura profunda / Descascarado)</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Observación / Nota</label>
              <input
                type="text"
                placeholder="Ej. Rayón de 4cm en puerta..."
                value={damageDescription}
                onChange={(e) => setDamageDescription(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#00E5FF] outline-none"
              />
            </div>
          </div>

          <button onClick={handleConfirmMarker} className="btn-nike-primary self-end text-sm py-2">
            Guardar Detalle en Mapa
          </button>
        </div>
      )}

      {/* Markers Summary Table */}
      {markers.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-display tracking-widest text-slate-400 uppercase">
            Detalles Registrados en Carrocería ({markers.length})
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {markers.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-2.5 rounded-lg bg-black/40 border border-white/5 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      m.severity === 'high' ? 'bg-red-500' : m.severity === 'medium' ? 'bg-amber-400' : 'bg-cyan-400'
                    }`}
                  />
                  <span className="font-bold text-white truncate">{m.description}</span>
                </div>
                {!readOnly && onRemoveMarker && (
                  <button onClick={() => onRemoveMarker(m.id)} className="text-slate-500 hover:text-red-400 ml-2">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
