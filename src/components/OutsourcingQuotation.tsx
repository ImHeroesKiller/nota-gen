import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Calculator,
  Moon,
  Sun,
  Users,
} from 'lucide-react';

interface OutsourcingQuotationProps {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
}).format(Number.isFinite(amount) ? amount : 0);

export default function OutsourcingQuotation({ onBack, darkMode, setDarkMode }: OutsourcingQuotationProps) {
  const [headcount, setHeadcount] = useState(10);
  const [umk, setUmk] = useState(5_000_000);
  const [bpjsPercentage, setBpjsPercentage] = useState(11);
  const [thrPercentage, setThrPercentage] = useState(8.33);
  const [allowance, setAllowance] = useState(500_000);
  const [managementFee, setManagementFee] = useState(15);

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

  const results = useMemo(() => {
    const safeHeadcount = Math.max(1, Math.floor(Number(headcount) || 1));
    const safeUmk = Math.max(0, Number(umk) || 0);
    const safeAllowance = Math.max(0, Number(allowance) || 0);
    const safeBpjs = Math.min(100, Math.max(0, Number(bpjsPercentage) || 0));
    const safeThr = Math.min(100, Math.max(0, Number(thrPercentage) || 0));
    const safeFee = Math.min(100, Math.max(0, Number(managementFee) || 0));

    const fixedCompensation = safeUmk + safeAllowance;
    const bpjsPerHead = fixedCompensation * (safeBpjs / 100);
    const thrPerHead = fixedCompensation * (safeThr / 100);
    const subtotalPerHead = fixedCompensation + bpjsPerHead + thrPerHead;
    const managementFeeAmount = subtotalPerHead * (safeFee / 100);
    const totalPerHead = subtotalPerHead + managementFeeAmount;
    const grandTotal = totalPerHead * safeHeadcount;

    return {
      safeHeadcount,
      fixedCompensation,
      bpjsPerHead,
      thrPerHead,
      subtotalPerHead,
      managementFeeAmount,
      totalPerHead,
      grandTotal,
    };
  }, [allowance, bpjsPercentage, headcount, managementFee, thrPercentage, umk]);

  const setNonNegative = (setter: (value: number) => void, raw: string, max?: number) => {
    const parsed = Number(raw);
    const safe = Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
    setter(max === undefined ? safe : Math.min(max, safe));
  };

  return (
    <div className={`min-h-full ${bg} ${text}`}>
      <header className={`sticky top-0 z-20 flex items-center justify-between gap-3 px-4 py-3 border-b ${surface} ${border}`}>
        <div className="flex items-center gap-3 min-w-0">
          <button type="button" onClick={onBack} className={`w-9 h-9 rounded-lg inline-flex items-center justify-center ${hover}`} aria-label="Kembali"><ArrowLeft size={18} /></button>
          <div className="w-9 h-9 rounded-lg bg-rose-500/10 text-rose-600 inline-flex items-center justify-center shrink-0"><Users size={20} /></div>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold truncate">Outsourcing Quotation</h1>
            <p className={`text-[11px] ${muted} truncate`}>Monthly cost build-up per head & total headcount</p>
          </div>
        </div>
        <button type="button" onClick={() => setDarkMode(!darkMode)} className={`w-9 h-9 rounded-lg inline-flex items-center justify-center ${hover}`} aria-label="Ubah tema">{darkMode ? <Sun size={18} /> : <Moon size={18} />}</button>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-6 space-y-5">
        <section>
          <p className={`text-[10px] font-bold tracking-[0.12em] uppercase ${muted}`}>Human Capital · Payroll & Benefits</p>
          <h2 className="text-2xl font-semibold mt-1">Outsourcing Cost Simulation</h2>
          <p className={`text-sm mt-1 ${muted}`}>Fixed allowance dimasukkan ke basis biaya tetap. BPJS, THR accrual, dan management fee tetap dapat disesuaikan sesuai kontrak.</p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)] gap-5 items-start">
          <section className={`rounded-2xl border p-4 md:p-5 ${surface} ${border}`}>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-9 h-9 rounded-lg bg-rose-500/10 text-rose-600 inline-flex items-center justify-center"><Calculator size={18} /></span>
              <div><h3 className="text-sm font-semibold">Input Parameters</h3><p className={`text-[11px] mt-0.5 ${muted}`}>Nilai negatif ditolak dan persentase dibatasi 0–100%.</p></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="text-xs font-medium">Headcount
                <input type="number" min={1} step={1} value={headcount} onChange={(e) => setHeadcount(Math.max(1, Math.floor(Number(e.target.value) || 1)))} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm ${input}`} />
              </label>
              <label className="text-xs font-medium">UMK / Base Wage per Month
                <input type="number" min={0} step={1000} value={umk} onChange={(e) => setNonNegative(setUmk, e.target.value)} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm ${input}`} />
              </label>
              <label className="text-xs font-medium">Fixed Allowance per Month
                <input type="number" min={0} step={1000} value={allowance} onChange={(e) => setNonNegative(setAllowance, e.target.value)} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm ${input}`} />
              </label>
              <label className="text-xs font-medium">BPJS Employer Cost Rate (%)
                <input type="number" min={0} max={100} step={0.1} value={bpjsPercentage} onChange={(e) => setNonNegative(setBpjsPercentage, e.target.value, 100)} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm ${input}`} />
              </label>
              <label className="text-xs font-medium">THR Monthly Accrual (%)
                <input type="number" min={0} max={100} step={0.01} value={thrPercentage} onChange={(e) => setNonNegative(setThrPercentage, e.target.value, 100)} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm ${input}`} />
              </label>
              <label className="text-xs font-medium">Management Fee on Cost (%)
                <input type="number" min={0} max={100} step={0.1} value={managementFee} onChange={(e) => setNonNegative(setManagementFee, e.target.value, 100)} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm ${input}`} />
              </label>
            </div>
          </section>

          <aside className={`rounded-2xl border p-4 md:p-5 ${surface} ${border} lg:sticky lg:top-[88px]`}>
            <p className={`text-[10px] font-bold tracking-[0.12em] uppercase ${muted}`}>Monthly Quotation</p>
            <div className="space-y-2.5 mt-4 text-sm">
              <div className={`flex justify-between gap-3 rounded-lg px-3 py-2.5 ${surfaceMuted}`}><span className={muted}>Fixed Compensation</span><strong>{formatCurrency(results.fixedCompensation)}</strong></div>
              <div className={`flex justify-between gap-3 rounded-lg px-3 py-2.5 ${surfaceMuted}`}><span className={muted}>BPJS / Head</span><strong>{formatCurrency(results.bpjsPerHead)}</strong></div>
              <div className={`flex justify-between gap-3 rounded-lg px-3 py-2.5 ${surfaceMuted}`}><span className={muted}>THR Accrual / Head</span><strong>{formatCurrency(results.thrPerHead)}</strong></div>
              <div className="flex justify-between gap-3 px-3 py-2.5"><span className="font-medium">Subtotal Cost / Head</span><strong className="text-[#2563eb]">{formatCurrency(results.subtotalPerHead)}</strong></div>
              <div className="flex justify-between gap-3 px-3 py-2.5"><span className={muted}>Management Fee ({managementFee}%)</span><strong>{formatCurrency(results.managementFeeAmount)}</strong></div>
              <div className={`border-t pt-4 mt-2 ${border}`}>
                <div className="flex justify-between gap-3"><span className="font-semibold">Total / Head</span><strong className="text-lg text-emerald-600">{formatCurrency(results.totalPerHead)}</strong></div>
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-[#2563eb] p-4 text-white">
              <p className="text-[10px] uppercase tracking-wide opacity-75">Grand Total · {results.safeHeadcount} HC / month</p>
              <p className="text-2xl font-semibold mt-1">{formatCurrency(results.grandTotal)}</p>
            </div>

            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
              <p className="text-[11px] font-semibold">Assumption check required</p>
              <p className="text-[10px] leading-4 mt-1">Validasi basis upah, batas upah BPJS, komponen THR, lembur, seragam/alat kerja, replacement cost, PPN, dan biaya lain sesuai project sebelum quotation digunakan.</p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
