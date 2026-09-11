import { useMemo, useRef, useState } from 'react';
import { AlertTriangle, Banknote, CalendarDays, Clock3, Printer, WalletCards } from 'lucide-react';
import { useDocumentTemplateSettings } from '../lib/documentTemplate';
import { useMiningWorkerLifecycle } from '../lib/miningWorkerLifecycle';

interface PayrollSlipGeneratorProps {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

const rupiah = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number.isFinite(value) ? value : 0);

export default function PayrollSlipGenerator(_props: PayrollSlipGeneratorProps) {
  const { store } = useMiningWorkerLifecycle();
  const template = useDocumentTemplateSettings();
  const activeWorkers = useMemo(() => store.workers.filter((worker) => worker.stage === 'active'), [store.workers]);
  const [workerId, setWorkerId] = useState(() => activeWorkers[0]?.id || '');
  const [period, setPeriod] = useState('2026-09');
  const [overtimeRate, setOvertimeRate] = useState(0);
  const [allowance, setAllowance] = useState(0);
  const [bpjsHealth, setBpjsHealth] = useState(0);
  const [bpjsEmployment, setBpjsEmployment] = useState(0);
  const [pph21, setPph21] = useState(0);
  const [otherDeductions, setOtherDeductions] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const worker = activeWorkers.find((item) => item.id === workerId) ?? activeWorkers[0];
  const records = useMemo(() => worker ? store.attendance.filter((record) => record.workerId === worker.id && record.date.startsWith(period)) : [], [period, store.attendance, worker]);
  const presentDays = records.filter((record) => record.status === 'present').length;
  const regularHours = records.reduce((sum, record) => sum + record.regularHours, 0);
  const overtimeHours = records.reduce((sum, record) => sum + record.overtimeHours, 0);
  const absentDays = records.filter((record) => ['absent', 'sick', 'leave'].includes(record.status)).length;
  const offDays = records.filter((record) => record.status === 'off-duty').length;
  const basePay = (worker?.dailyRate || 0) * presentDays;
  const overtimePay = overtimeHours * overtimeRate;
  const grossPay = basePay + overtimePay + allowance;
  const totalDeductions = bpjsHealth + bpjsEmployment + pph21 + otherDeductions;
  const netPay = grossPay - totalDeductions;

  const handlePrint = () => {
    if (!worker) {
      setError('Belum ada pekerja PHL aktif untuk payroll.');
      return;
    }
    if (!presentDays) {
      setError('Tidak ada hari hadir berbayar pada periode yang dipilih.');
      return;
    }
    if (netPay < 0) {
      setError('Total potongan melebihi penghasilan bruto.');
      return;
    }
    const content = printRef.current;
    if (!content) return;
    const printWindow = window.open('', '', 'width=900,height=760');
    if (!printWindow) {
      setError('Popup print diblokir browser. Izinkan pop-up untuk mencetak slip.');
      return;
    }
    printWindow.document.write(`<!doctype html><html><head><meta charset="utf-8"/><title>Slip Upah PHL - ${worker.name.replace(/[<>]/g, '')}</title><style>
      *{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#0f172a;margin:0;padding:24px;font-size:11px}.slip{max-width:780px;margin:0 auto}.head{display:flex;justify-content:space-between;gap:20px;border-bottom:2px solid ${template.accentColor};padding-bottom:14px}.brand{display:flex;gap:12px;align-items:center}.logo{width:52px;height:52px;object-fit:contain}.fallback{width:52px;height:52px;border:1px solid ${template.accentColor};display:grid;place-items:center;font-weight:700;color:${template.accentColor}}h1{font-size:17px;margin:0;color:${template.accentColor}}.muted{color:#64748b}.title{text-align:center;font-size:15px;font-weight:700;margin:22px 0}.grid{display:grid;grid-template-columns:130px 1fr 130px 1fr;gap:6px 12px}.label{font-weight:700}.summary{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:18px 0}.box{border:1px solid #cbd5e1;padding:10px}.box small{display:block;color:#64748b;margin-bottom:5px}.box strong{font-size:13px}table{width:100%;border-collapse:collapse;margin-top:14px}th,td{border:1px solid #cbd5e1;padding:8px;text-align:left}th{background:#f8fafc}td:last-child,th:last-child{text-align:right}.total td{font-weight:700;background:#f8fafc}.net{display:flex;justify-content:space-between;margin-top:16px;padding:12px 14px;border:1px solid #93c5fd;background:#eff6ff;font-size:14px;font-weight:700}.foot{margin-top:24px;padding-top:10px;border-top:1px solid #e2e8f0;text-align:center;color:#94a3b8;font-size:9px}@page{size:A4;margin:14mm}
    </style></head><body>${content.innerHTML}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    window.setTimeout(() => { printWindow.print(); printWindow.close(); }, 200);
  };

  if (!worker) {
    return <div className="mx-auto max-w-5xl rounded-2xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500 dark:border-slate-700">Belum ada pekerja Aktif PHL. Aktifkan pekerja melalui Deployment Planner terlebih dahulu.</div>;
  }

  return (
    <div className="mx-auto max-w-[1450px] space-y-5 text-slate-900 dark:text-slate-100">
      <section className="flex flex-col gap-3 rounded-2xl border border-blue-200 bg-blue-50/60 p-4 dark:border-blue-500/20 dark:bg-blue-500/10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-white"><Banknote size={18} /></span><div><p className="text-xs font-bold">Payroll PHL — attendance driven</p><p className="mt-1 text-[11px] leading-5 text-slate-600 dark:text-slate-300">Upah dasar dihitung otomatis dari jumlah hari Hadir × Rate Harian pekerja. Jam lembur berasal dari Daily Attendance; rate lembur tetap diisi Admin sesuai kebijakan payroll yang berlaku.</p></div></div>
        <button onClick={handlePrint} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white"><Printer size={15} /> Print / Save PDF</button>
      </section>

      {error && <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"><AlertTriangle size={16} className="mt-0.5 shrink-0" />{error}</div>}
      {presentDays > 20 && <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300"><AlertTriangle size={16} className="mt-0.5 shrink-0" />Periode ini memiliki lebih dari 20 hari hadir berbayar. Lakukan review hubungan kerja sebelum finalisasi payroll PHL.</div>}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-3 lg:grid-cols-[minmax(320px,1.4fr)_210px]">
          <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Pekerja Aktif<select value={worker.id} onChange={(event) => { setWorkerId(event.target.value); setError(null); }} className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white">{activeWorkers.map((item) => <option key={item.id} value={item.id}>{item.workerCode} · {item.name} · {item.position} · {item.site}</option>)}</select></label>
          <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Periode<input type="month" value={period} onChange={(event) => { setPeriod(event.target.value); setError(null); }} className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white" /></label>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        {[
          ['Hari Hadir', presentDays, CalendarDays, 'text-emerald-600'],
          ['Rate / Hari', rupiah(worker.dailyRate), WalletCards, 'text-blue-600'],
          ['Regular Hours', `${regularHours} jam`, Clock3, 'text-slate-900 dark:text-white'],
          ['Overtime', `${overtimeHours} jam`, Clock3, 'text-orange-600'],
          ['Upah Dasar', rupiah(basePay), Banknote, 'text-violet-600'],
        ].map(([label, value, Icon, tone]) => { const MetricIcon = Icon as typeof Banknote; return <article key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center justify-between"><div><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500">{String(label)}</p><strong className={`mt-2 block text-xl ${String(tone)}`}>{String(value)}</strong></div><span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-50 text-slate-500 dark:bg-slate-800"><MetricIcon size={17} /></span></div></article>; })}
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(520px,1.1fr)] xl:items-start">
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div><h2 className="text-sm font-bold">Komponen Payroll</h2><p className="mt-1 text-[10px] text-slate-500">Hari hadir dan rate harian terkunci dari lifecycle. Komponen lain dapat diisi Admin.</p></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold">Hari Hadir<input value={presentDays} disabled className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm dark:border-slate-700 dark:bg-slate-800" /></label>
            <label className="text-xs font-semibold">Rate Harian<input value={worker.dailyRate} disabled className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm dark:border-slate-700 dark:bg-slate-800" /></label>
            <label className="text-xs font-semibold">Jam Lembur<input value={overtimeHours} disabled className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm dark:border-slate-700 dark:bg-slate-800" /></label>
            <label className="text-xs font-semibold">Rate Lembur / Jam<input type="number" min="0" value={overtimeRate} onChange={(event) => setOvertimeRate(Math.max(0, Number(event.target.value) || 0))} className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950" /></label>
            <label className="text-xs font-semibold">Allowance<input type="number" min="0" value={allowance} onChange={(event) => setAllowance(Math.max(0, Number(event.target.value) || 0))} className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950" /></label>
            <label className="text-xs font-semibold">BPJS Kesehatan<input type="number" min="0" value={bpjsHealth} onChange={(event) => setBpjsHealth(Math.max(0, Number(event.target.value) || 0))} className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950" /></label>
            <label className="text-xs font-semibold">BPJS Ketenagakerjaan<input type="number" min="0" value={bpjsEmployment} onChange={(event) => setBpjsEmployment(Math.max(0, Number(event.target.value) || 0))} className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950" /></label>
            <label className="text-xs font-semibold">PPh 21<input type="number" min="0" value={pph21} onChange={(event) => setPph21(Math.max(0, Number(event.target.value) || 0))} className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950" /></label>
            <label className="text-xs font-semibold sm:col-span-2">Potongan Lain<input type="number" min="0" value={otherDeductions} onChange={(event) => setOtherDeductions(Math.max(0, Number(event.target.value) || 0))} className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950" /></label>
          </div>
          <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60"><div><p className="text-[9px] font-bold uppercase text-slate-400">Gross</p><strong className="mt-1 block text-lg">{rupiah(grossPay)}</strong></div><div><p className="text-[9px] font-bold uppercase text-slate-400">Net Pay</p><strong className={`mt-1 block text-lg ${netPay < 0 ? 'text-red-600' : 'text-emerald-600'}`}>{rupiah(netPay)}</strong></div></div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-slate-100 p-3 dark:border-slate-800 dark:bg-slate-950">
          <div ref={printRef} className="slip rounded-xl bg-white p-7 text-slate-900 shadow-sm">
            <div className="head flex items-start justify-between gap-5 border-b-2 pb-4" style={{ borderColor: template.accentColor }}><div className="brand flex items-center gap-3">{template.logoDataUrl ? <img src={template.logoDataUrl} className="logo h-12 w-12 object-contain" alt="Logo" /> : <div className="fallback grid h-12 w-12 place-items-center rounded-lg border text-xs font-bold" style={{ color: template.accentColor, borderColor: template.accentColor }}>PA</div>}<div><h1 className="text-base font-bold" style={{ color: template.accentColor }}>{template.companyName}</h1><p className="muted mt-1 text-[10px] text-slate-500">{template.businessUnit}</p><p className="muted mt-0.5 text-[9px] text-slate-400">{[template.companyAddress, template.phone, template.email].filter(Boolean).join(' • ')}</p></div></div><div className="text-right"><p className="text-[9px] uppercase text-slate-400">Periode</p><strong className="text-xs">{period}</strong></div></div>
            <div className="title my-5 text-center text-sm font-bold">SLIP UPAH PEKERJA HARIAN LEPAS</div>
            <div className="grid grid-cols-[110px_1fr_110px_1fr] gap-x-3 gap-y-1.5 text-[10px]"><span className="label font-bold">Nama</span><span>{worker.name}</span><span className="label font-bold">ID PHL</span><span>{worker.workerCode}</span><span className="label font-bold">Posisi</span><span>{worker.position}</span><span className="label font-bold">Site</span><span>{worker.site}</span><span className="label font-bold">Project</span><span>{worker.project}</span><span className="label font-bold">Roster</span><span>{worker.roster}</span></div>
            <div className="summary my-4 grid grid-cols-4 gap-2">{[['Hari Hadir',`${presentDays}`],['Non-Paid',`${absentDays}`],['Roster OFF',`${offDays}`],['OT',`${overtimeHours}h`]].map(([label,value]) => <div key={label} className="box rounded-lg border border-slate-200 p-2"><small className="block text-[8px] text-slate-400">{label}</small><strong className="text-xs">{value}</strong></div>)}</div>
            <table className="w-full border-collapse text-[10px]"><thead><tr><th className="border border-slate-200 p-2 text-left">Komponen</th><th className="border border-slate-200 p-2 text-right">Nilai</th></tr></thead><tbody><tr><td className="border border-slate-200 p-2">Upah harian ({presentDays} × {rupiah(worker.dailyRate)})</td><td className="border border-slate-200 p-2 text-right">{rupiah(basePay)}</td></tr><tr><td className="border border-slate-200 p-2">Lembur ({overtimeHours} jam × {rupiah(overtimeRate)})</td><td className="border border-slate-200 p-2 text-right">{rupiah(overtimePay)}</td></tr><tr><td className="border border-slate-200 p-2">Allowance</td><td className="border border-slate-200 p-2 text-right">{rupiah(allowance)}</td></tr><tr className="total bg-slate-50 font-bold"><td className="border border-slate-200 p-2">Gross Pay</td><td className="border border-slate-200 p-2 text-right">{rupiah(grossPay)}</td></tr><tr><td className="border border-slate-200 p-2">BPJS + PPh 21 + Potongan Lain</td><td className="border border-slate-200 p-2 text-right">({rupiah(totalDeductions)})</td></tr></tbody></table>
            <div className="net mt-4 flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm font-bold"><span>NET PAY</span><span>{rupiah(netPay)}</span></div>
            <div className="mt-4 text-[9px] text-slate-500"><p>Rekening: {worker.bankName || '-'} · {worker.accountNumber || '-'}</p><p className="mt-1">Sumber hari kerja: Daily Attendance PERADA Tools.</p></div>
            {template.showFooter && <div className="foot mt-6 border-t border-slate-200 pt-3 text-center text-[8px] text-slate-400">{template.footerText}</div>}
          </div>
        </section>
      </div>
    </div>
  );
}
