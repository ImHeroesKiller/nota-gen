import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Calculator,
  Moon,
  Ship,
  Sun,
} from 'lucide-react';

interface FreightRateCalculatorProps {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

type Currency = 'USD' | 'IDR' | 'EUR' | 'SGD';

const money = (value: number, currency: Currency) => new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency,
  maximumFractionDigits: currency === 'IDR' ? 0 : 2,
}).format(Number.isFinite(value) ? value : 0);

export default function FreightRateCalculator({ onBack, darkMode, setDarkMode }: FreightRateCalculatorProps) {
  const [baseRate, setBaseRate] = useState('1000');
  const [baf, setBaf] = useState('150');
  const [caf, setCaf] = useState('50');
  const [thc, setThc] = useState('200');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [exchangeRate, setExchangeRate] = useState('15500');
  const [profitMargin, setProfitMargin] = useState('20');

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

  const safeNumber = (value: string) => Math.max(0, Number.parseFloat(value) || 0);

  const results = useMemo(() => {
    const totalCost = safeNumber(baseRate) + safeNumber(baf) + safeNumber(caf) + safeNumber(thc);
    const rate = currency === 'IDR' ? 1 : safeNumber(exchangeRate);
    const totalCostIDR = totalCost * rate;
    const margin = Math.min(95, Math.max(0, safeNumber(profitMargin)));
    const quotationPrice = margin >= 100 ? 0 : totalCostIDR / (1 - margin / 100);
    const profit = Math.max(0, quotationPrice - totalCostIDR);
    const markup = totalCostIDR > 0 ? (profit / totalCostIDR) * 100 : 0;
    return { totalCost, rate, totalCostIDR, margin, quotationPrice, profit, markup };
  }, [baf, baseRate, caf, currency, exchangeRate, profitMargin, thc]);

  const setCost = (setter: (value: string) => void, raw: string) => {
    if (raw !== '' && Number(raw) < 0) return;
    setter(raw);
  };

  const changeCurrency = (next: Currency) => {
    setCurrency(next);
    if (next === 'IDR') setExchangeRate('1');
    else if (currency === 'IDR') setExchangeRate('');
  };

  return (
    <div className={`min-h-full ${bg} ${text}`}>
      <header className={`sticky top-0 z-20 flex items-center justify-between gap-3 px-4 py-3 border-b ${surface} ${border}`}>
        <div className="flex items-center gap-3 min-w-0">
          <button type="button" onClick={onBack} className={`w-9 h-9 rounded-lg inline-flex items-center justify-center ${hover}`} aria-label="Kembali"><ArrowLeft size={18} /></button>
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 text-cyan-600 inline-flex items-center justify-center shrink-0"><Ship size={20} /></div>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold truncate">Freight Rate Calculator</h1>
            <p className={`text-[11px] ${muted} truncate`}>Cost build-up, FX conversion, dan target gross margin</p>
          </div>
        </div>
        <button type="button" onClick={() => setDarkMode(!darkMode)} className={`w-9 h-9 rounded-lg inline-flex items-center justify-center ${hover}`} aria-label="Ubah tema">{darkMode ? <Sun size={18} /> : <Moon size={18} />}</button>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-6 space-y-5">
        <section>
          <p className={`text-[10px] font-bold tracking-[0.12em] uppercase ${muted}`}>Logistics · Freight Pricing</p>
          <h2 className="text-2xl font-semibold mt-1">Freight Quotation</h2>
          <p className={`text-sm mt-1 ${muted}`}>Semua komponen biaya menggunakan mata uang yang dipilih. Target margin dihitung sebagai gross margin, bukan markup.</p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] gap-5 items-start">
          <section className={`rounded-2xl border p-4 md:p-5 ${surface} ${border}`}>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-9 h-9 rounded-lg bg-cyan-500/10 text-cyan-600 inline-flex items-center justify-center"><Calculator size={18} /></span>
              <div><h3 className="text-sm font-semibold">Cost Components</h3><p className={`text-[11px] mt-0.5 ${muted}`}>Masukkan biaya dalam satu mata uang yang sama.</p></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="text-xs font-medium">Currency
                <select value={currency} onChange={(e) => changeCurrency(e.target.value as Currency)} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm ${input}`}>
                  <option value="USD">USD · US Dollar</option>
                  <option value="IDR">IDR · Indonesian Rupiah</option>
                  <option value="EUR">EUR · Euro</option>
                  <option value="SGD">SGD · Singapore Dollar</option>
                </select>
              </label>
              <label className="text-xs font-medium">Exchange Rate to IDR
                <input type="number" min={currency === 'IDR' ? 1 : 0} step="any" disabled={currency === 'IDR'} value={currency === 'IDR' ? '1' : exchangeRate} onChange={(e) => setCost(setExchangeRate, e.target.value)} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm disabled:opacity-60 ${input}`} placeholder={currency === 'IDR' ? '1' : `1 ${currency} = ? IDR`} />
              </label>
              <label className="text-xs font-medium">Base Rate ({currency})
                <input type="number" min={0} step="any" value={baseRate} onChange={(e) => setCost(setBaseRate, e.target.value)} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm ${input}`} />
              </label>
              <label className="text-xs font-medium">BAF ({currency})
                <input type="number" min={0} step="any" value={baf} onChange={(e) => setCost(setBaf, e.target.value)} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm ${input}`} />
              </label>
              <label className="text-xs font-medium">CAF ({currency})
                <input type="number" min={0} step="any" value={caf} onChange={(e) => setCost(setCaf, e.target.value)} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm ${input}`} />
              </label>
              <label className="text-xs font-medium">THC ({currency})
                <input type="number" min={0} step="any" value={thc} onChange={(e) => setCost(setThc, e.target.value)} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm ${input}`} />
              </label>
            </div>

            <div className={`mt-5 rounded-xl border p-4 ${surfaceMuted} ${border}`}>
              <div className="flex items-center justify-between gap-3">
                <div><p className="text-xs font-semibold">Target Gross Margin</p><p className={`text-[10px] mt-0.5 ${muted}`}>Quotation = cost ÷ (1 − margin)</p></div>
                <strong className="text-lg text-[#2563eb]">{results.margin.toFixed(1)}%</strong>
              </div>
              <input type="range" min={0} max={95} step={0.5} value={results.margin} onChange={(e) => setProfitMargin(e.target.value)} className="w-full mt-4 accent-[#2563eb]" />
              <div className={`flex justify-between text-[9px] mt-1 ${muted}`}><span>0%</span><span>50%</span><span>95%</span></div>
            </div>
          </section>

          <aside className={`rounded-2xl border p-4 md:p-5 ${surface} ${border} lg:sticky lg:top-[88px]`}>
            <p className={`text-[10px] font-bold tracking-[0.12em] uppercase ${muted}`}>Quotation Result</p>
            <div className={`mt-3 rounded-xl p-4 ${surfaceMuted}`}>
              <p className={`text-[10px] ${muted}`}>Total Cost ({currency})</p>
              <p className="text-xl font-semibold mt-1">{money(results.totalCost, currency)}</p>
              {currency !== 'IDR' && <p className={`text-[10px] mt-1 ${muted}`}>FX: 1 {currency} = {results.rate.toLocaleString('id-ID')} IDR</p>}
            </div>

            <div className="space-y-3 mt-4 text-sm">
              <div className="flex justify-between gap-3"><span className={muted}>Total Cost IDR</span><strong>{money(results.totalCostIDR, 'IDR')}</strong></div>
              <div className="flex justify-between gap-3"><span className={muted}>Profit</span><strong className="text-emerald-600">{money(results.profit, 'IDR')}</strong></div>
              <div className="flex justify-between gap-3"><span className={muted}>Gross Margin</span><strong>{results.margin.toFixed(1)}%</strong></div>
              <div className="flex justify-between gap-3"><span className={muted}>Equivalent Markup</span><strong>{results.markup.toFixed(1)}%</strong></div>
              <div className={`border-t pt-4 ${border}`}>
                <p className={`text-[10px] uppercase tracking-wide ${muted}`}>Client Quotation Price</p>
                <p className="text-2xl font-semibold text-[#2563eb] mt-1">{money(results.quotationPrice, 'IDR')}</p>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
              <p className="text-[11px] font-semibold">FX rate bersifat manual</p>
              <p className="text-[10px] leading-4 mt-1">Pastikan kurs, surcharge, THC, dan biaya carrier yang digunakan sesuai quotation aktual sebelum diteruskan ke klien.</p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
