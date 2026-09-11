import { useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Banknote,
  Moon,
  Printer,
  Sun,
} from 'lucide-react';

interface PayrollSlipGeneratorProps {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

interface PayrollData {
  employeeName: string;
  employeeId: string;
  position: string;
  department: string;
  period: string;
  basicSalary: number;
  overtimeHours: number;
  overtimeRate: number;
  allowance: number;
  bpjsHealth: number;
  bpjsEmployment: number;
  pph21: number;
  otherDeductions: number;
  bankName: string;
  accountNumber: string;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
}).format(Number.isFinite(amount) ? amount : 0);

export default function PayrollSlipGenerator({ onBack, darkMode, setDarkMode }: PayrollSlipGeneratorProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [payrollData, setPayrollData] = useState<PayrollData>({
    employeeName: '',
    employeeId: '',
    position: '',
    department: '',
    period: new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
    basicSalary: 0,
    overtimeHours: 0,
    overtimeRate: 0,
    allowance: 0,
    bpjsHealth: 0,
    bpjsEmployment: 0,
    pph21: 0,
    otherDeductions: 0,
    bankName: '',
    accountNumber: '',
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

  const totals = useMemo(() => {
    const overtimePay = payrollData.overtimeHours * payrollData.overtimeRate;
    const grossPay = payrollData.basicSalary + overtimePay + payrollData.allowance;
    const totalDeductions = payrollData.bpjsHealth
      + payrollData.bpjsEmployment
      + payrollData.pph21
      + payrollData.otherDeductions;
    const netPay = grossPay - totalDeductions;
    return { overtimePay, grossPay, totalDeductions, netPay };
  }, [payrollData]);

  const setNumeric = (field: keyof Pick<PayrollData,
    'basicSalary' | 'overtimeHours' | 'overtimeRate' | 'allowance' | 'bpjsHealth' | 'bpjsEmployment' | 'pph21' | 'otherDeductions'
  >, raw: string) => {
    const value = Number(raw);
    setPayrollData((previous) => ({
      ...previous,
      [field]: Number.isFinite(value) ? Math.max(0, value) : 0,
    }));
    setError(null);
  };

  const validate = () => {
    if (!payrollData.employeeName.trim()) return 'Nama karyawan wajib diisi.';
    if (!payrollData.employeeId.trim()) return 'ID karyawan wajib diisi.';
    if (!payrollData.period.trim()) return 'Periode payroll wajib diisi.';
    if (payrollData.basicSalary <= 0) return 'Basic salary harus lebih besar dari 0.';
    if (totals.netPay < 0) return 'Total potongan melebihi gross pay. Periksa kembali komponen payroll.';
    return null;
  };

  const handlePrint = () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    const printContent = printRef.current;
    if (!printContent) {
      setError('Preview slip belum siap dicetak.');
      return;
    }

    const printWindow = window.open('', '', 'width=900,height=720');
    if (!printWindow) {
      setError('Popup print diblokir browser. Izinkan pop-up untuk mencetak slip gaji.');
      return;
    }

    printWindow.document.write(`<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Slip Gaji - ${payrollData.employeeName.replace(/[<>]/g, '')}</title>
          <style>
            * { box-sizing: border-box; }
            body { font-family: Arial, sans-serif; color: #0f172a; margin: 0; padding: 28px; font-size: 11px; }
            .print-slip { max-width: 760px; margin: 0 auto; }
            .print-header { text-align: center; border-bottom: 3px double #0f172a; padding-bottom: 14px; margin-bottom: 18px; }
            .print-company { font-size: 18px; font-weight: 700; }
            .print-sub { color: #64748b; margin-top: 4px; font-size: 10px; }
            .print-title { text-align: center; font-size: 14px; font-weight: 700; margin: 18px 0; }
            .print-info { display: grid; grid-template-columns: 130px 1fr 130px 1fr; gap: 6px 10px; margin-bottom: 18px; }
            .print-label { font-weight: 700; }
            table { width: 100%; border-collapse: collapse; margin: 14px 0; }
            th, td { border: 1px solid #cbd5e1; padding: 7px; text-align: left; }
            th { background: #f1f5f9; }
            td:last-child, th:last-child { text-align: right; }
            .print-total td { font-weight: 700; background: #f8fafc; }
            .print-net { margin-top: 16px; padding: 12px 14px; border: 1px solid #93c5fd; background: #eff6ff; display: flex; justify-content: space-between; font-size: 14px; font-weight: 700; }
            .print-payment { margin-top: 18px; border-top: 1px solid #e2e8f0; padding-top: 12px; }
            .print-footer { margin-top: 28px; border-top: 1px solid #e2e8f0; padding-top: 10px; text-align: center; color: #94a3b8; font-size: 9px; }
            @page { size: A4; margin: 14mm; }
          </style>
        </head>
        <body>${printContent.innerHTML}</body>
      </html>`);
    printWindow.document.close();
    printWindow.focus();
    window.setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className={`min-h-full ${bg} ${text}`}>
      <header className={`sticky top-0 z-20 flex items-center justify-between gap-3 px-4 py-3 border-b ${surface} ${border}`}>
        <div className="flex items-center gap-3 min-w-0">
          <button type="button" onClick={onBack} className={`w-9 h-9 rounded-lg inline-flex items-center justify-center ${hover}`} aria-label="Kembali"><ArrowLeft size={18} /></button>
          <div className="w-9 h-9 rounded-lg bg-rose-500/10 text-rose-600 inline-flex items-center justify-center shrink-0"><Banknote size={20} /></div>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold truncate">Payroll Slip Generator</h1>
            <p className={`text-[11px] ${muted} truncate`}>Slip gaji dengan kalkulasi live dan print-safe layout</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={handlePrint} className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-[#2563eb] px-3 py-2 text-xs font-semibold text-white hover:bg-[#1d4ed8]"><Printer size={15} /> Print / PDF</button>
          <button type="button" onClick={() => setDarkMode(!darkMode)} className={`w-9 h-9 rounded-lg inline-flex items-center justify-center ${hover}`} aria-label="Ubah tema">{darkMode ? <Sun size={18} /> : <Moon size={18} />}</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-5">
        <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className={`text-[10px] font-bold tracking-[0.12em] uppercase ${muted}`}>Human Capital · Payroll & Benefits</p>
            <h2 className="text-2xl font-semibold mt-1">Slip Gaji Karyawan</h2>
            <p className={`text-sm mt-1 ${muted}`}>Nilai payroll dihitung otomatis saat input berubah; tidak perlu menunggu field kehilangan fokus.</p>
          </div>
          <button type="button" onClick={handlePrint} className="sm:hidden inline-flex items-center justify-center gap-2 rounded-lg bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white"><Printer size={16} /> Print / Save PDF</button>
        </section>

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
            <AlertTriangle size={17} className="shrink-0 mt-0.5" />
            <p className="text-xs leading-5">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(430px,0.95fr)] gap-5 items-start">
          <section className={`rounded-2xl border p-4 md:p-5 ${surface} ${border}`}>
            <h3 className="text-sm font-semibold">Payroll Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              <label className="text-xs font-medium">Employee Name *
                <input value={payrollData.employeeName} onChange={(e) => setPayrollData({ ...payrollData, employeeName: e.target.value })} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm ${input}`} />
              </label>
              <label className="text-xs font-medium">Employee ID *
                <input value={payrollData.employeeId} onChange={(e) => setPayrollData({ ...payrollData, employeeId: e.target.value })} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm ${input}`} />
              </label>
              <label className="text-xs font-medium">Position
                <input value={payrollData.position} onChange={(e) => setPayrollData({ ...payrollData, position: e.target.value })} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm ${input}`} />
              </label>
              <label className="text-xs font-medium">Department
                <input value={payrollData.department} onChange={(e) => setPayrollData({ ...payrollData, department: e.target.value })} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm ${input}`} />
              </label>
              <label className="text-xs font-medium md:col-span-2">Period *
                <input value={payrollData.period} onChange={(e) => setPayrollData({ ...payrollData, period: e.target.value })} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm ${input}`} />
              </label>
            </div>

            <div className={`mt-5 pt-5 border-t ${border}`}>
              <p className="text-xs font-semibold">Income</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <label className="text-xs font-medium">Basic Salary *
                  <input type="number" min={0} value={payrollData.basicSalary} onChange={(e) => setNumeric('basicSalary', e.target.value)} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm ${input}`} />
                </label>
                <label className="text-xs font-medium">Allowance
                  <input type="number" min={0} value={payrollData.allowance} onChange={(e) => setNumeric('allowance', e.target.value)} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm ${input}`} />
                </label>
                <label className="text-xs font-medium">Overtime Hours
                  <input type="number" min={0} step={0.5} value={payrollData.overtimeHours} onChange={(e) => setNumeric('overtimeHours', e.target.value)} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm ${input}`} />
                </label>
                <label className="text-xs font-medium">Overtime Rate / Hour
                  <input type="number" min={0} value={payrollData.overtimeRate} onChange={(e) => setNumeric('overtimeRate', e.target.value)} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm ${input}`} />
                </label>
              </div>
            </div>

            <div className={`mt-5 pt-5 border-t ${border}`}>
              <p className="text-xs font-semibold">Deductions</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <label className="text-xs font-medium">BPJS Kesehatan
                  <input type="number" min={0} value={payrollData.bpjsHealth} onChange={(e) => setNumeric('bpjsHealth', e.target.value)} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm ${input}`} />
                </label>
                <label className="text-xs font-medium">BPJS Ketenagakerjaan
                  <input type="number" min={0} value={payrollData.bpjsEmployment} onChange={(e) => setNumeric('bpjsEmployment', e.target.value)} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm ${input}`} />
                </label>
                <label className="text-xs font-medium">PPh 21
                  <input type="number" min={0} value={payrollData.pph21} onChange={(e) => setNumeric('pph21', e.target.value)} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm ${input}`} />
                </label>
                <label className="text-xs font-medium">Other Deductions
                  <input type="number" min={0} value={payrollData.otherDeductions} onChange={(e) => setNumeric('otherDeductions', e.target.value)} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm ${input}`} />
                </label>
              </div>
            </div>

            <div className={`mt-5 pt-5 border-t ${border}`}>
              <p className="text-xs font-semibold">Payment Information</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <label className="text-xs font-medium">Bank Name
                  <input value={payrollData.bankName} onChange={(e) => setPayrollData({ ...payrollData, bankName: e.target.value })} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm ${input}`} />
                </label>
                <label className="text-xs font-medium">Account Number
                  <input inputMode="numeric" value={payrollData.accountNumber} onChange={(e) => setPayrollData({ ...payrollData, accountNumber: e.target.value.replace(/[^0-9]/g, '') })} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm ${input}`} />
                </label>
              </div>
            </div>

            <div className={`mt-5 grid grid-cols-2 gap-2 rounded-xl p-3 ${surfaceMuted}`}>
              <div><p className={`text-[10px] ${muted}`}>Gross Pay</p><p className="text-sm font-semibold mt-1">{formatCurrency(totals.grossPay)}</p></div>
              <div><p className={`text-[10px] ${muted}`}>Total Deductions</p><p className="text-sm font-semibold mt-1 text-red-600">{formatCurrency(totals.totalDeductions)}</p></div>
              <div className="col-span-2 border-t border-slate-200 dark:border-slate-700 pt-3"><p className={`text-[10px] ${muted}`}>Net Pay</p><p className={`text-xl font-semibold mt-1 ${totals.netPay < 0 ? 'text-red-600' : 'text-[#2563eb]'}`}>{formatCurrency(totals.netPay)}</p></div>
            </div>
          </section>

          <section className={`rounded-2xl border p-4 md:p-5 ${surface} ${border} xl:sticky xl:top-[88px]`}>
            <div className="flex items-center justify-between gap-3 mb-3">
              <div><h3 className="text-sm font-semibold">Preview</h3><p className={`text-[11px] mt-0.5 ${muted}`}>A4 print preview</p></div>
              <button type="button" onClick={handlePrint} className="inline-flex items-center gap-2 rounded-lg border border-[#2563eb]/30 px-3 py-2 text-xs font-semibold text-[#2563eb] hover:bg-[#2563eb]/5"><Printer size={14} /> Print</button>
            </div>

            <div className="overflow-auto rounded-xl bg-slate-100 p-3 dark:bg-slate-950/40">
              <div ref={printRef} className="print-slip min-w-[420px] bg-white p-6 text-slate-900 shadow-sm">
                <div className="print-header text-center border-b-4 border-double border-slate-900 pb-3 mb-4">
                  <div className="print-company text-base font-bold">PT PERDANA ADI YUDA</div>
                  <div className="print-sub text-[9px] text-slate-500 mt-1">PERADA GROUP · Payroll Document</div>
                </div>
                <div className="print-title text-center text-sm font-bold my-4">SLIP GAJI KARYAWAN</div>
                <div className="print-info grid grid-cols-[110px_1fr] gap-y-1 text-[10px] mb-4">
                  <span className="print-label font-semibold">Nama</span><span>: {payrollData.employeeName || '-'}</span>
                  <span className="print-label font-semibold">ID Karyawan</span><span>: {payrollData.employeeId || '-'}</span>
                  <span className="print-label font-semibold">Jabatan</span><span>: {payrollData.position || '-'}</span>
                  <span className="print-label font-semibold">Departemen</span><span>: {payrollData.department || '-'}</span>
                  <span className="print-label font-semibold">Periode</span><span>: {payrollData.period || '-'}</span>
                </div>
                <table className="w-full border-collapse text-[9px]">
                  <thead><tr><th className="border p-2 text-left">Pendapatan</th><th className="border p-2 text-right">Jumlah</th></tr></thead>
                  <tbody>
                    <tr><td className="border p-2">Gaji Pokok</td><td className="border p-2 text-right">{formatCurrency(payrollData.basicSalary)}</td></tr>
                    <tr><td className="border p-2">Lembur ({payrollData.overtimeHours} jam)</td><td className="border p-2 text-right">{formatCurrency(totals.overtimePay)}</td></tr>
                    <tr><td className="border p-2">Tunjangan</td><td className="border p-2 text-right">{formatCurrency(payrollData.allowance)}</td></tr>
                    <tr className="print-total font-semibold bg-slate-50"><td className="border p-2">Gross Pay</td><td className="border p-2 text-right">{formatCurrency(totals.grossPay)}</td></tr>
                  </tbody>
                </table>
                <table className="w-full border-collapse text-[9px] mt-3">
                  <thead><tr><th className="border p-2 text-left">Potongan</th><th className="border p-2 text-right">Jumlah</th></tr></thead>
                  <tbody>
                    <tr><td className="border p-2">BPJS Kesehatan</td><td className="border p-2 text-right">{formatCurrency(payrollData.bpjsHealth)}</td></tr>
                    <tr><td className="border p-2">BPJS Ketenagakerjaan</td><td className="border p-2 text-right">{formatCurrency(payrollData.bpjsEmployment)}</td></tr>
                    <tr><td className="border p-2">PPh 21</td><td className="border p-2 text-right">{formatCurrency(payrollData.pph21)}</td></tr>
                    <tr><td className="border p-2">Potongan Lain</td><td className="border p-2 text-right">{formatCurrency(payrollData.otherDeductions)}</td></tr>
                    <tr className="print-total font-semibold bg-slate-50"><td className="border p-2">Total Potongan</td><td className="border p-2 text-right">{formatCurrency(totals.totalDeductions)}</td></tr>
                  </tbody>
                </table>
                <div className="print-net mt-4 flex justify-between rounded border border-blue-200 bg-blue-50 p-3 text-xs font-bold"><span>NET PAY</span><span>{formatCurrency(totals.netPay)}</span></div>
                <div className="print-payment mt-4 border-t pt-3 text-[9px]"><strong>Payment:</strong> {payrollData.bankName || '-'} · {payrollData.accountNumber || '-'}</div>
                <div className="print-footer mt-6 border-t pt-3 text-center text-[8px] text-slate-400">Dokumen internal PERADA Group · Generated by PERADA Tools</div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
