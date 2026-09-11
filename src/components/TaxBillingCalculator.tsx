import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Calculator,
  Moon,
  ReceiptText,
  Sun,
} from 'lucide-react';

interface TaxBillingCalculatorProps {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

type TaxType = 'ppn' | 'pph23';

interface TaxData {
  transactionType: TaxType;
  baseAmount: number;
  taxRate: number;
  clientName: string;
  invoiceNumber: string;
  description: string;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
}).format(Number.isFinite(amount) ? amount : 0);

export default function TaxBillingCalculator({ onBack, darkMode, setDarkMode }: TaxBillingCalculatorProps) {
  const [data, setData] = useState<TaxData>({
    transactionType: 'ppn',
    baseAmount: 0,
    taxRate: 11,
    clientName: '',
    invoiceNumber: '',
    description: '',
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
    const base = Math.max(0, Number(data.baseAmount) || 0);
    const rate = Math.min(100, Math.max(0, Number(data.taxRate) || 0));
    const taxAmount = base * (rate / 100);

    if (data.transactionType === 'pph23') {
      return {
        taxAmount,
        totalAmount: Math.max(0, base - taxAmount),
        totalLabel: 'Net Payable Setelah Potongan',
        formula: `${formatCurrency(base)} − ${formatCurrency(taxAmount)}`,
      };
    }

    return {
      taxAmount,
      totalAmount: base + taxAmount,
      totalLabel: 'Total Setelah Pajak',
      formula: `${formatCurrency(base)} + ${formatCurrency(taxAmount)}`,
    };
  }, [data.baseAmount, data.taxRate, data.transactionType]);

  const handleTypeChange = (type: TaxType) => {
    setData((previous) => ({
      ...previous,
      transactionType: type,
      taxRate: type === 'ppn' ? 11 : 2,
    }));
  };

  const setNonNegativeNumber = (field: 'baseAmount' | 'taxRate', raw: string) => {
    const value = Number(raw);
    const safe = Number.isFinite(value) ? Math.max(0, value) : 0;
    setData((previous) => ({
      ...previous,
      [field]: field === 'taxRate' ? Math.min(100, safe) : safe,
    }));
  };

  return (
    <div className={`min-h-full ${bg} ${text}`}>
      <header className={`sticky top-0 z-20 flex items-center justify-between gap-3 px-4 py-3 border-b ${surface} ${border}`}>
        <div className="flex items-center gap-3 min-w-0">
          <button type="button" onClick={onBack} className={`w-9 h-9 rounded-lg inline-flex items-center justify-center ${hover}`} aria-label="Kembali"><ArrowLeft size={18} /></button>
          <div className="w-9 h-9 rounded-lg bg-orange-500/10 text-orange-600 inline-flex items-center justify-center shrink-0"><ReceiptText size={20} /></div>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold truncate">Tax Billing Calculator</h1>
            <p className={`text-[11px] ${muted} truncate`}>Simulasi PPN dan withholding PPh 23</p>
          </div>
        </div>
        <button type="button" onClick={() => setDarkMode(!darkMode)} className={`w-9 h-9 rounded-lg inline-flex items-center justify-center ${hover}`} aria-label="Ubah tema">{darkMode ? <Sun size={18} /> : <Moon size={18} />}</button>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-6 space-y-5">
        <section>
          <p className={`text-[10px] font-bold tracking-[0.12em] uppercase ${muted}`}>Finance · Tax Utility</p>
          <h2 className="text-2xl font-semibold mt-1">Tax Billing Simulation</h2>
          <p className={`text-sm mt-1 ${muted}`}>PPN ditambahkan ke DPP, sedangkan PPh 23 diperlakukan sebagai potongan dari nilai yang dibayarkan.</p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] gap-5 items-start">
          <section className={`rounded-2xl border p-4 md:p-5 ${surface} ${border}`}>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-9 h-9 rounded-lg bg-orange-500/10 text-orange-600 inline-flex items-center justify-center"><Calculator size={18} /></span>
              <div><h3 className="text-sm font-semibold">Transaction Details</h3><p className={`text-[11px] mt-0.5 ${muted}`}>Tarif default dapat disesuaikan bila transaksi memiliki ketentuan berbeda.</p></div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <button type="button" onClick={() => handleTypeChange('ppn')} className={`rounded-xl border px-4 py-3 text-left transition ${data.transactionType === 'ppn' ? 'border-[#2563eb] bg-[#2563eb]/[0.06]' : `${border} ${hover}`}`}>
                <p className={`text-xs font-semibold ${data.transactionType === 'ppn' ? 'text-[#2563eb]' : text}`}>PPN</p>
                <p className={`text-[10px] mt-1 ${muted}`}>Default 11% · ditambahkan ke DPP</p>
              </button>
              <button type="button" onClick={() => handleTypeChange('pph23')} className={`rounded-xl border px-4 py-3 text-left transition ${data.transactionType === 'pph23' ? 'border-[#2563eb] bg-[#2563eb]/[0.06]' : `${border} ${hover}`}`}>
                <p className={`text-xs font-semibold ${data.transactionType === 'pph23' ? 'text-[#2563eb]' : text}`}>PPh 23</p>
                <p className={`text-[10px] mt-1 ${muted}`}>Default 2% · dipotong dari pembayaran</p>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="text-xs font-medium">Client Name
                <input value={data.clientName} onChange={(e) => setData({ ...data, clientName: e.target.value })} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm ${input}`} placeholder="PT ABC Manufacturing" />
              </label>
              <label className="text-xs font-medium">Invoice Number
                <input value={data.invoiceNumber} onChange={(e) => setData({ ...data, invoiceNumber: e.target.value })} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm ${input}`} placeholder="INV-2026-001" />
              </label>
              <label className="text-xs font-medium">Base Amount / DPP
                <input type="number" min={0} step={1000} value={data.baseAmount} onChange={(e) => setNonNegativeNumber('baseAmount', e.target.value)} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm ${input}`} />
              </label>
              <label className="text-xs font-medium">Tax Rate (%)
                <input type="number" min={0} max={100} step={0.1} value={data.taxRate} onChange={(e) => setNonNegativeNumber('taxRate', e.target.value)} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm ${input}`} />
              </label>
              <label className="text-xs font-medium md:col-span-2">Description
                <textarea value={data.description} onChange={(e) => setData({ ...data, description: e.target.value })} rows={3} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm resize-y ${input}`} placeholder="Jasa outsourcing / logistik" />
              </label>
            </div>
          </section>

          <aside className={`rounded-2xl border p-4 md:p-5 ${surface} ${border} lg:sticky lg:top-[88px]`}>
            <p className={`text-[10px] font-bold tracking-[0.12em] uppercase ${muted}`}>Calculation Result</p>
            <div className={`mt-3 rounded-xl p-4 ${surfaceMuted}`}>
              <p className="text-xs font-semibold">{data.transactionType === 'ppn' ? `PPN ${data.taxRate}%` : `PPh 23 ${data.taxRate}%`}</p>
              <p className={`text-[10px] mt-1 ${muted}`}>{data.transactionType === 'ppn' ? 'Tax addition' : 'Withholding deduction'}</p>
            </div>

            <div className="space-y-3 mt-4 text-sm">
              <div className="flex justify-between gap-3"><span className={muted}>DPP / Base Amount</span><strong>{formatCurrency(data.baseAmount)}</strong></div>
              <div className="flex justify-between gap-3"><span className={muted}>Tax Rate</span><strong>{data.taxRate}%</strong></div>
              <div className="flex justify-between gap-3"><span className={muted}>{data.transactionType === 'ppn' ? 'Tax Amount' : 'Withholding Amount'}</span><strong className={data.transactionType === 'pph23' ? 'text-red-600' : 'text-[#2563eb]'}>{formatCurrency(result.taxAmount)}</strong></div>
              <div className={`border-t pt-4 ${border}`}>
                <p className={`text-[10px] uppercase tracking-wide ${muted}`}>{result.totalLabel}</p>
                <p className="text-2xl font-semibold text-[#2563eb] mt-1">{formatCurrency(result.totalAmount)}</p>
                <p className={`text-[10px] mt-1 ${muted}`}>{result.formula}</p>
              </div>
            </div>

            {(data.clientName || data.invoiceNumber) && (
              <div className={`mt-5 rounded-xl p-3 ${surfaceMuted}`}>
                <p className={`text-[10px] uppercase tracking-wide ${muted}`}>Reference</p>
                <p className="text-xs font-medium mt-1">{data.clientName || '-'}</p>
                {data.invoiceNumber && <p className={`text-[10px] mt-1 ${muted}`}>{data.invoiceNumber}</p>}
              </div>
            )}

            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
              <p className="text-[11px] font-semibold">Perlu verifikasi pajak</p>
              <p className="text-[10px] leading-4 mt-1">Tool ini hanya simulasi aritmetika. Pastikan tarif, objek pajak, dasar pengenaan, status PKP/NPWP, dan ketentuan transaksi sesuai aturan yang berlaku sebelum digunakan untuk billing.</p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
