import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Calculator,
  Fuel,
  MapPin,
  Moon,
  Sun,
  Truck,
} from 'lucide-react';

interface RouteData {
  origin: string;
  destination: string;
  distance: number;
  vehicleType: string;
  fuelConsumption: number;
  fuelPrice: number;
  tollCost: number;
  driverAllowance: number;
}

type Props = {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
};

const vehicleTypes = [
  { name: 'Motorcycle', consumption: 2 },
  { name: 'Car', consumption: 10 },
  { name: 'Pickup', consumption: 12 },
  { name: 'Truck', consumption: 8 },
  { name: 'Bus', consumption: 15 },
  { name: 'Excavator', consumption: 20 },
  { name: 'Dump Truck', consumption: 25 },
];

const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
}).format(Number.isFinite(amount) ? amount : 0);

export default function UangJalanCalculator({ onBack, darkMode, setDarkMode }: Props) {
  const [data, setData] = useState<RouteData>({
    origin: '',
    destination: '',
    distance: 0,
    vehicleType: 'Truck',
    fuelConsumption: 8,
    fuelPrice: 10000,
    tollCost: 0,
    driverAllowance: 150000,
  });

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

  const result = useMemo(() => {
    const distance = Math.max(0, Number(data.distance) || 0);
    const consumption = Math.max(0, Number(data.fuelConsumption) || 0);
    const fuelPrice = Math.max(0, Number(data.fuelPrice) || 0);
    const tollCost = Math.max(0, Number(data.tollCost) || 0);
    const driverAllowance = Math.max(0, Number(data.driverAllowance) || 0);

    // fuelConsumption is expressed in L/100km, therefore divide distance by 100.
    const totalFuel = (distance / 100) * consumption;
    const fuelCost = totalFuel * fuelPrice;
    const totalCost = fuelCost + tollCost + driverAllowance;

    return { totalFuel, fuelCost, totalCost };
  }, [data.distance, data.driverAllowance, data.fuelConsumption, data.fuelPrice, data.tollCost]);

  const setNumber = (field: 'distance' | 'fuelConsumption' | 'fuelPrice' | 'tollCost' | 'driverAllowance', value: string) => {
    const parsed = Number(value);
    setData((previous) => ({ ...previous, [field]: Number.isFinite(parsed) ? Math.max(0, parsed) : 0 }));
  };

  const handleVehicleTypeChange = (vehicleType: string) => {
    const vehicle = vehicleTypes.find((item) => item.name === vehicleType);
    if (!vehicle) return;
    setData((previous) => ({ ...previous, vehicleType, fuelConsumption: vehicle.consumption }));
  };

  return (
    <div className={`min-h-full ${bg} ${text}`}>
      <header className={`sticky top-0 z-20 flex items-center justify-between gap-3 px-4 py-3 border-b ${surface} ${border}`}>
        <div className="flex items-center gap-3 min-w-0">
          <button type="button" onClick={onBack} className={`w-9 h-9 rounded-lg inline-flex items-center justify-center ${hover}`} aria-label="Kembali">
            <ArrowLeft size={18} />
          </button>
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 inline-flex items-center justify-center shrink-0">
            <Truck size={20} />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold truncate">Uang Jalan Calculator</h1>
            <p className={`text-[11px] ${muted} truncate`}>Estimasi BBM, tol, dan allowance driver</p>
          </div>
        </div>
        <button type="button" onClick={() => setDarkMode(!darkMode)} className={`w-9 h-9 rounded-lg inline-flex items-center justify-center ${hover}`} aria-label="Ubah tema">
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-6 space-y-5">
        <section>
          <p className={`text-[10px] font-bold tracking-[0.12em] uppercase ${muted}`}>Logistics · Fleet Management</p>
          <h2 className="text-2xl font-semibold mt-1">Estimasi Uang Jalan</h2>
          <p className={`text-sm mt-1 ${muted}`}>Perhitungan BBM menggunakan konsumsi liter per 100 km dan diperbarui otomatis.</p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] gap-5 items-start">
          <section className={`rounded-2xl border p-4 md:p-5 ${surface} ${border}`}>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 inline-flex items-center justify-center"><MapPin size={18} /></span>
              <div>
                <h3 className="text-sm font-semibold">Route & Cost Inputs</h3>
                <p className={`text-[11px] mt-0.5 ${muted}`}>Semua nilai negatif otomatis dinormalisasi menjadi 0.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="text-xs font-medium">Origin
                <input value={data.origin} onChange={(e) => setData({ ...data, origin: e.target.value })} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm ${input}`} placeholder="Jakarta" />
              </label>
              <label className="text-xs font-medium">Destination
                <input value={data.destination} onChange={(e) => setData({ ...data, destination: e.target.value })} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm ${input}`} placeholder="Bandung" />
              </label>
              <label className="text-xs font-medium">Distance (km)
                <input type="number" min={0} step={1} value={data.distance} onChange={(e) => setNumber('distance', e.target.value)} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm ${input}`} />
              </label>
              <label className="text-xs font-medium">Vehicle Type
                <select value={data.vehicleType} onChange={(e) => handleVehicleTypeChange(e.target.value)} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm ${input}`}>
                  {vehicleTypes.map((vehicle) => <option key={vehicle.name} value={vehicle.name}>{vehicle.name} · {vehicle.consumption} L/100km</option>)}
                </select>
              </label>
              <label className="text-xs font-medium">Fuel Consumption (L/100km)
                <input type="number" min={0} step={0.1} value={data.fuelConsumption} onChange={(e) => setNumber('fuelConsumption', e.target.value)} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm ${input}`} />
              </label>
              <label className="text-xs font-medium">Fuel Price (IDR/Liter)
                <input type="number" min={0} step={100} value={data.fuelPrice} onChange={(e) => setNumber('fuelPrice', e.target.value)} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm ${input}`} />
              </label>
              <label className="text-xs font-medium">Toll Cost (IDR)
                <input type="number" min={0} step={1000} value={data.tollCost} onChange={(e) => setNumber('tollCost', e.target.value)} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm ${input}`} />
              </label>
              <label className="text-xs font-medium">Driver Allowance (IDR)
                <input type="number" min={0} step={1000} value={data.driverAllowance} onChange={(e) => setNumber('driverAllowance', e.target.value)} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm ${input}`} />
              </label>
            </div>
          </section>

          <aside className={`rounded-2xl border p-4 md:p-5 ${surface} ${border} lg:sticky lg:top-[88px]`}>
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 inline-flex items-center justify-center"><Calculator size={18} /></span>
              <div>
                <h3 className="text-sm font-semibold">Estimation Result</h3>
                <p className={`text-[11px] mt-0.5 ${muted}`}>{data.origin || 'Origin'} → {data.destination || 'Destination'}</p>
              </div>
            </div>

            <div className={`mt-4 rounded-xl p-4 ${surfaceMuted}`}>
              <div className="flex items-center gap-2 text-xs font-semibold"><Fuel size={15} className="text-blue-500" /> Fuel Calculation</div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div><p className={`text-[10px] ${muted}`}>Distance</p><p className="text-sm font-semibold mt-0.5">{data.distance.toLocaleString('id-ID')} km</p></div>
                <div><p className={`text-[10px] ${muted}`}>Consumption</p><p className="text-sm font-semibold mt-0.5">{data.fuelConsumption} L/100km</p></div>
                <div><p className={`text-[10px] ${muted}`}>Fuel Needed</p><p className="text-sm font-semibold mt-0.5">{result.totalFuel.toLocaleString('id-ID', { maximumFractionDigits: 2 })} L</p></div>
                <div><p className={`text-[10px] ${muted}`}>Fuel Cost</p><p className="text-sm font-semibold mt-0.5">{formatCurrency(result.fuelCost)}</p></div>
              </div>
            </div>

            <div className="space-y-2.5 mt-4 text-sm">
              <div className="flex justify-between gap-3"><span className={muted}>BBM</span><strong>{formatCurrency(result.fuelCost)}</strong></div>
              <div className="flex justify-between gap-3"><span className={muted}>Tol</span><strong>{formatCurrency(data.tollCost)}</strong></div>
              <div className="flex justify-between gap-3"><span className={muted}>Driver Allowance</span><strong>{formatCurrency(data.driverAllowance)}</strong></div>
              <div className={`border-t pt-4 mt-4 ${border}`}>
                <div className="flex items-end justify-between gap-3"><span className="text-sm font-semibold">Total Uang Jalan</span><strong className="text-xl text-[#2563eb]">{formatCurrency(result.totalCost)}</strong></div>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
              <p className="text-[11px] font-semibold">Catatan estimasi</p>
              <p className="text-[10px] leading-4 mt-1">Belum termasuk parkir, makan driver, biaya bongkar/muat, dan perubahan konsumsi akibat beban atau kondisi jalan.</p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
