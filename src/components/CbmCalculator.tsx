import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Box,
  Container,
  Moon,
  Plus,
  Sun,
  Trash2,
} from 'lucide-react';

interface CbmCalculatorProps {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

interface CargoItem {
  id: string;
  length: string;
  width: string;
  height: string;
  weight: string;
  quantity: string;
}

type Unit = 'cm' | 'm' | 'inch';

const makeId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const positive = (value: string) => Math.max(0, Number.parseFloat(value) || 0);

const containerSpecs = [
  { type: 'LCL', maxCbm: 15, maxWeight: 10000, description: 'Less than Container Load' },
  { type: '20ft', maxCbm: 33, maxWeight: 28000, description: '20-foot Dry Container' },
  { type: '40ft', maxCbm: 67, maxWeight: 26500, description: '40-foot Dry Container' },
  { type: '40HC', maxCbm: 76, maxWeight: 26500, description: '40-foot High Cube' },
] as const;

export default function CbmCalculator({ onBack, darkMode, setDarkMode }: CbmCalculatorProps) {
  const [items, setItems] = useState<CargoItem[]>([
    { id: '1', length: '100', width: '80', height: '120', weight: '50', quantity: '10' },
  ]);
  const [unit, setUnit] = useState<Unit>('cm');

  const bg = darkMode ? 'bg-[#0b1220]' : 'bg-[#f6f8fb]';
  const surface = darkMode ? 'bg-[#111827]' : 'bg-white';
  const surfaceMuted = darkMode ? 'bg-[#172033]' : 'bg-[#f8fafc]';
  const border = darkMode ? 'border-[#273449]' : 'border-[#e5eaf1]';
  const text = darkMode ? 'text-[#e5edf8]' : 'text-[#0f172a]';
  const muted = darkMode ? 'text-[#92a3ba]' : 'text-[#64748b]';
  const input = darkMode
    ? 'bg-[#0b1220] border-[#334155] text-[#e5edf8]'
    : 'bg-white border-[#dbe3ee] text-[#0f172a]';
  const hover = darkMode ? 'hover:bg-[#172033]' : 'hover:bg-[#f8fafc]';

  const addItem = () => {
    setItems((previous) => [...previous, { id: makeId(), length: '', width: '', height: '', weight: '', quantity: '1' }]);
  };

  const updateItem = (id: string, field: keyof Omit<CargoItem, 'id'>, value: string) => {
    if (field !== 'quantity' && value !== '' && Number(value) < 0) return;
    if (field === 'quantity' && value !== '' && Number(value) < 1) return;
    setItems((previous) => previous.map((item) => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeItem = (id: string) => {
    setItems((previous) => previous.length > 1 ? previous.filter((item) => item.id !== id) : previous);
  };

  const results = useMemo(() => {
    const cubicMeterFactor: Record<Unit, number> = {
      cm: 1 / 1_000_000,
      m: 1,
      inch: 0.000016387064,
    };

    return items.reduce((totals, item) => {
      const length = positive(item.length);
      const width = positive(item.width);
      const height = positive(item.height);
      const weight = positive(item.weight);
      const quantity = Math.max(0, Math.floor(positive(item.quantity)));
      const volumeEach = length * width * height * cubicMeterFactor[unit];

      totals.totalCbm += volumeEach * quantity;
      totals.totalWeight += weight * quantity;
      totals.totalCartons += quantity;
      return totals;
    }, { totalCbm: 0, totalWeight: 0, totalCartons: 0 });
  }, [items, unit]);

  const recommendation = useMemo(() => {
    if (results.totalCbm <= 0 || results.totalCartons <= 0) return null;

    const fitting = containerSpecs.find((spec) => (
      results.totalCbm <= spec.maxCbm && results.totalWeight <= spec.maxWeight
    ));

    if (fitting) {
      const volumeUtilization = (results.totalCbm / fitting.maxCbm) * 100;
      const weightUtilization = fitting.maxWeight > 0 ? (results.totalWeight / fitting.maxWeight) * 100 : 0;
      return {
        type: fitting.type,
        description: fitting.description,
        volumeUtilization,
        weightUtilization,
        containers: 1,
      };
    }

    const largest = containerSpecs[containerSpecs.length - 1];
    const containersByVolume = Math.ceil(results.totalCbm / largest.maxCbm);
    const containersByWeight = Math.ceil(results.totalWeight / largest.maxWeight);
    return {
      type: 'MULTIPLE',
      description: `Estimasi minimal ${Math.max(1, containersByVolume, containersByWeight)} × ${largest.type}`,
      volumeUtilization: 0,
      weightUtilization: 0,
      containers: Math.max(1, containersByVolume, containersByWeight),
    };
  }, [results]);

  const density = results.totalCbm > 0 ? results.totalWeight / results.totalCbm : 0;

  return (
    <div className={`min-h-full ${bg} ${text}`}>
      <header className={`sticky top-0 z-20 flex items-center justify-between gap-3 px-4 py-3 border-b ${surface} ${border}`}>
        <div className="flex items-center gap-3 min-w-0">
          <button type="button" onClick={onBack} className={`w-9 h-9 rounded-lg inline-flex items-center justify-center ${hover}`} aria-label="Kembali"><ArrowLeft size={18} /></button>
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 text-cyan-600 inline-flex items-center justify-center shrink-0"><Box size={20} /></div>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold truncate">CBM Calculator</h1>
            <p className={`text-[11px] ${muted} truncate`}>Volume cargo, berat, dan rekomendasi container</p>
          </div>
        </div>
        <button type="button" onClick={() => setDarkMode(!darkMode)} className={`w-9 h-9 rounded-lg inline-flex items-center justify-center ${hover}`} aria-label="Ubah tema">{darkMode ? <Sun size={18} /> : <Moon size={18} />}</button>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-6 space-y-5">
        <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className={`text-[10px] font-bold tracking-[0.12em] uppercase ${muted}`}>Logistics · Cargo Planning</p>
            <h2 className="text-2xl font-semibold mt-1">Cargo Volume Calculator</h2>
            <p className={`text-sm mt-1 ${muted}`}>Rekomendasi container mempertimbangkan kapasitas volume dan payload sekaligus.</p>
          </div>
          <div className="flex items-center gap-2">
            <select value={unit} onChange={(e) => setUnit(e.target.value as Unit)} className={`rounded-lg border px-3 py-2.5 text-sm ${input}`}>
              <option value="cm">Centimeter (cm)</option>
              <option value="m">Meter (m)</option>
              <option value="inch">Inch (in)</option>
            </select>
            <button type="button" onClick={addItem} className="inline-flex items-center gap-2 rounded-lg bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1d4ed8]"><Plus size={16} /> Add Item</button>
          </div>
        </section>

        <section className={`rounded-2xl border ${surface} ${border} overflow-hidden`}>
          <div className={`px-4 md:px-5 py-4 border-b ${border}`}>
            <h3 className="text-sm font-semibold">Cargo Items</h3>
            <p className={`text-[11px] mt-0.5 ${muted}`}>Dimensi menggunakan unit {unit}; berat per unit menggunakan kilogram.</p>
          </div>
          <div className="p-4 md:p-5 space-y-3">
            {items.map((item, index) => (
              <div key={item.id} className={`grid grid-cols-2 md:grid-cols-[40px_repeat(5,minmax(90px,1fr))_40px] gap-2 items-end rounded-xl border p-3 ${surfaceMuted} ${border}`}>
                <div className={`hidden md:block text-xs font-semibold self-center ${muted}`}>#{index + 1}</div>
                <label className="text-[10px] font-medium">Length
                  <input type="number" min={0} step="any" value={item.length} onChange={(e) => updateItem(item.id, 'length', e.target.value)} className={`mt-1 w-full rounded-lg border px-2.5 py-2 text-xs ${input}`} />
                </label>
                <label className="text-[10px] font-medium">Width
                  <input type="number" min={0} step="any" value={item.width} onChange={(e) => updateItem(item.id, 'width', e.target.value)} className={`mt-1 w-full rounded-lg border px-2.5 py-2 text-xs ${input}`} />
                </label>
                <label className="text-[10px] font-medium">Height
                  <input type="number" min={0} step="any" value={item.height} onChange={(e) => updateItem(item.id, 'height', e.target.value)} className={`mt-1 w-full rounded-lg border px-2.5 py-2 text-xs ${input}`} />
                </label>
                <label className="text-[10px] font-medium">Weight / unit (kg)
                  <input type="number" min={0} step="any" value={item.weight} onChange={(e) => updateItem(item.id, 'weight', e.target.value)} className={`mt-1 w-full rounded-lg border px-2.5 py-2 text-xs ${input}`} />
                </label>
                <label className="text-[10px] font-medium">Quantity
                  <input type="number" min={1} step={1} value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', e.target.value)} className={`mt-1 w-full rounded-lg border px-2.5 py-2 text-xs ${input}`} />
                </label>
                <div className="col-span-2 md:col-span-1">
                  <p className={`text-[10px] font-medium ${muted}`}>CBM item</p>
                  <p className="text-xs font-semibold mt-2">
                    {(() => {
                      const factor: Record<Unit, number> = { cm: 1 / 1_000_000, m: 1, inch: 0.000016387064 };
                      const cbm = positive(item.length) * positive(item.width) * positive(item.height) * factor[unit] * Math.max(0, Math.floor(positive(item.quantity)));
                      return `${cbm.toFixed(3)} m³`;
                    })()}
                  </p>
                </div>
                <button type="button" onClick={() => removeItem(item.id)} disabled={items.length === 1} className="w-9 h-9 rounded-lg inline-flex items-center justify-center text-red-500 hover:bg-red-50 disabled:opacity-25 dark:hover:bg-red-950/30" aria-label="Remove item"><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <section className={`rounded-2xl border p-4 md:p-5 ${surface} ${border}`}>
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 inline-flex items-center justify-center"><Box size={18} /></span>
              <div><h3 className="text-sm font-semibold">Cargo Summary</h3><p className={`text-[11px] mt-0.5 ${muted}`}>Akumulasi seluruh item</p></div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className={`rounded-xl p-3 ${surfaceMuted}`}><p className={`text-[10px] ${muted}`}>Total CBM</p><p className="text-xl font-semibold text-[#2563eb] mt-1">{results.totalCbm.toFixed(3)} m³</p></div>
              <div className={`rounded-xl p-3 ${surfaceMuted}`}><p className={`text-[10px] ${muted}`}>Total Weight</p><p className="text-xl font-semibold mt-1">{results.totalWeight.toLocaleString('id-ID', { maximumFractionDigits: 2 })} kg</p></div>
              <div className={`rounded-xl p-3 ${surfaceMuted}`}><p className={`text-[10px] ${muted}`}>Total Units</p><p className="text-lg font-semibold mt-1">{results.totalCartons.toLocaleString('id-ID')}</p></div>
              <div className={`rounded-xl p-3 ${surfaceMuted}`}><p className={`text-[10px] ${muted}`}>Cargo Density</p><p className="text-lg font-semibold mt-1">{density.toLocaleString('id-ID', { maximumFractionDigits: 1 })} kg/m³</p></div>
            </div>
          </section>

          <section className={`rounded-2xl border p-4 md:p-5 ${surface} ${border}`}>
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 inline-flex items-center justify-center"><Container size={18} /></span>
              <div><h3 className="text-sm font-semibold">Container Recommendation</h3><p className={`text-[11px] mt-0.5 ${muted}`}>Volume dan payload dicek bersama</p></div>
            </div>

            {!recommendation ? (
              <div className={`mt-4 rounded-xl border border-dashed p-8 text-center ${border}`}><p className={`text-sm ${muted}`}>Isi dimensi dan quantity untuk melihat rekomendasi.</p></div>
            ) : (
              <div className="mt-4 space-y-4">
                <div className={`rounded-xl p-4 ${surfaceMuted}`}>
                  <p className={`text-[10px] uppercase tracking-wide ${muted}`}>Recommended</p>
                  <p className="text-2xl font-semibold text-emerald-600 mt-1">{recommendation.type}</p>
                  <p className={`text-xs mt-1 ${muted}`}>{recommendation.description}</p>
                </div>
                {recommendation.type !== 'MULTIPLE' && (
                  <>
                    <div>
                      <div className="flex justify-between text-[11px] mb-1.5"><span className={muted}>Volume utilization</span><span>{recommendation.volumeUtilization.toFixed(1)}%</span></div>
                      <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, recommendation.volumeUtilization)}%` }} /></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] mb-1.5"><span className={muted}>Weight utilization</span><span>{recommendation.weightUtilization.toFixed(1)}%</span></div>
                      <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden"><div className="h-full bg-blue-500" style={{ width: `${Math.min(100, recommendation.weightUtilization)}%` }} /></div>
                    </div>
                  </>
                )}
                <p className={`text-[10px] leading-4 ${muted}`}>Kapasitas container bersifat perkiraan. Validasi payload, internal dimension, axle limit, dan regulasi carrier sebelum booking.</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
