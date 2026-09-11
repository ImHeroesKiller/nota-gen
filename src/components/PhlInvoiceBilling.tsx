import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Banknote,
  CalendarDays,
  CheckCircle2,
  FileText,
  Printer,
  ReceiptText,
  Send,
  Users,
} from 'lucide-react';
import { useMiningWorkerLifecycle } from '../lib/miningWorkerLifecycle';
import {
  addDays,
  generatePhlInvoiceNumber,
  getInvoiceBalance,
  type PhlInvoice,
  usePhlBillingAr,
} from '../lib/phlBillingAr';

interface Props {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

const rupiah = (value: number) => new Intl.NumberFormat('id-ID', {
  style: 'currency', currency: 'IDR', maximumFractionDigits: 0,
}).format(Number.isFinite(value) ? value : 0);

const today = () => new Date().toISOString().slice(0, 10);
const monthLabel = (period: string) => {
  const [year, month] = period.split('-').map(Number);
  if (!year || !month) return period;
  return new Date(year, month - 1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
};

const statusLabel: Record<string, string> = {
  draft: 'Draft', issued: 'Issued', partially_paid: 'Partial', paid: 'Paid', overdue: 'Overdue', cancelled: 'Cancelled',
};

const statusTone: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  issued: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300',
  partially_paid: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
  paid: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
  overdue: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300',
  cancelled: 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500',
};

export default function PhlInvoiceBilling(_props: Props) {
  const { store: lifecycle } = useMiningWorkerLifecycle();
  const { store, balances, createInvoice, issueInvoice, cancelInvoice } = usePhlBillingAr();

  const periodOptions = useMemo(() => {
    const periods = Array.from(new Set(lifecycle.attendance.map((item) => item.date.slice(0, 7)))).filter(Boolean).sort().reverse();
    return periods.length ? periods : [new Date().toISOString().slice(0, 7)];
  }, [lifecycle.attendance]);

  const projectOptions = useMemo(
    () => Array.from(new Set(lifecycle.workers.map((worker) => worker.project).filter(Boolean))).sort(),
    [lifecycle.workers],
  );

  const [period, setPeriod] = useState(() => periodOptions[0]);
  const [project, setProject] = useState(() => projectOptions[0] || '');
  const siteOptions = useMemo(
    () => Array.from(new Set(lifecycle.workers.filter((worker) => !project || worker.project === project).map((worker) => worker.site).filter(Boolean))).sort(),
    [lifecycle.workers, project],
  );
  const [site, setSite] = useState(() => siteOptions[0] || '');
  const [clientName, setClientName] = useState(() => projectOptions[0] || '');
  const [clientReference, setClientReference] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(today());
  const [termsDays, setTermsDays] = useState(30);
  const [managementFeeRate, setManagementFeeRate] = useState(3);
  const [taxRate, setTaxRate] = useState(11);
  const [reimbursable, setReimbursable] = useState(0);
  const [otherCharges, setOtherCharges] = useState(0);
  const [notes, setNotes] = useState('Billing PHL berdasarkan paid attendance days periode berjalan.');
  const [message, setMessage] = useState<{ tone: 'error' | 'success'; text: string } | null>(null);

  useEffect(() => {
    if (!periodOptions.includes(period)) setPeriod(periodOptions[0]);
  }, [period, periodOptions]);

  useEffect(() => {
    if (project && !projectOptions.includes(project)) setProject(projectOptions[0] || '');
  }, [project, projectOptions]);

  useEffect(() => {
    if (!siteOptions.includes(site)) setSite(siteOptions[0] || '');
  }, [site, siteOptions]);

  useEffect(() => {
    if (!clientName || projectOptions.includes(clientName)) setClientName(project);
  }, [project]); // intentionally preserve manually typed client names

  const billingRows = useMemo(() => lifecycle.workers
    .filter((worker) => (!project || worker.project === project) && (!site || worker.site === site))
    .map((worker) => {
      const records = lifecycle.attendance.filter((record) => record.workerId === worker.id && record.date.startsWith(period));
      const paidDays = records.filter((record) => record.status === 'present').length;
      const overtimeHours = records.reduce((sum, record) => sum + (record.status === 'present' ? record.overtimeHours : 0), 0);
      return {
        id: worker.id,
        workerCode: worker.workerCode,
        name: worker.name,
        position: worker.position,
        dailyRate: worker.dailyRate,
        paidDays,
        overtimeHours,
        payrollBase: paidDays * worker.dailyRate,
      };
    })
    .filter((row) => row.paidDays > 0), [lifecycle.attendance, lifecycle.workers, period, project, site]);

  const workerCount = billingRows.length;
  const paidDays = billingRows.reduce((sum, row) => sum + row.paidDays, 0);
  const payrollBase = billingRows.reduce((sum, row) => sum + row.payrollBase, 0);
  const managementFee = payrollBase * (managementFeeRate / 100);
  const subtotal = payrollBase + managementFee + reimbursable + otherCharges;
  const taxAmount = subtotal * (taxRate / 100);
  const grandTotal = subtotal + taxAmount;
  const dueDate = addDays(invoiceDate, termsDays);

  const duplicate = store.invoices.find((invoice) =>
    invoice.period === period
    && invoice.project === project
    && invoice.site === site
    && invoice.status !== 'cancelled',
  );

  const buildInvoice = (status: 'draft' | 'issued'): PhlInvoice | null => {
    if (!project || !site) {
      setMessage({ tone: 'error', text: 'Project dan site wajib dipilih.' });
      return null;
    }
    if (!clientName.trim()) {
      setMessage({ tone: 'error', text: 'Nama client wajib diisi.' });
      return null;
    }
    if (!billingRows.length || payrollBase <= 0) {
      setMessage({ tone: 'error', text: 'Tidak ada paid attendance days untuk project, site, dan periode ini.' });
      return null;
    }
    if (duplicate) {
      setMessage({ tone: 'error', text: `Invoice untuk kombinasi ini sudah ada: ${duplicate.invoiceNumber}. Batalkan invoice lama jika ingin membuat ulang.` });
      return null;
    }
    if (managementFeeRate < 0 || taxRate < 0 || reimbursable < 0 || otherCharges < 0) {
      setMessage({ tone: 'error', text: 'Komponen billing tidak boleh bernilai negatif.' });
      return null;
    }

    const now = new Date().toISOString();
    return {
      id: globalThis.crypto?.randomUUID?.() ?? `inv-${Date.now()}`,
      invoiceNumber: generatePhlInvoiceNumber(store.invoices, invoiceDate),
      period,
      project,
      site,
      clientName: clientName.trim(),
      clientReference: clientReference.trim(),
      invoiceDate,
      dueDate,
      termsDays,
      workerCount,
      paidDays,
      payrollBase,
      managementFeeRate,
      managementFee,
      reimbursable,
      otherCharges,
      subtotal,
      taxRate,
      taxAmount,
      total: grandTotal,
      status,
      notes: notes.trim(),
      createdAt: now,
      updatedAt: now,
      ...(status === 'issued' ? { issuedAt: now } : {}),
    };
  };

  const saveInvoice = (status: 'draft' | 'issued') => {
    const invoice = buildInvoice(status);
    if (!invoice) return;
    createInvoice(invoice);
    setMessage({ tone: 'success', text: `${invoice.invoiceNumber} berhasil ${status === 'issued' ? 'diterbitkan dan masuk Monitoring AR' : 'disimpan sebagai draft'}.` });
  };

  const printInvoice = (invoice: PhlInvoice) => {
    const printWindow = window.open('', '', 'width=980,height=780');
    if (!printWindow) {
      setMessage({ tone: 'error', text: 'Popup print diblokir browser.' });
      return;
    }
    const rows = [
      ['Payroll / paid attendance base', invoice.payrollBase],
      [`Management fee (${invoice.managementFeeRate}%)`, invoice.managementFee],
      ['Reimbursable', invoice.reimbursable],
      ['Other charges', invoice.otherCharges],
    ].filter(([, amount]) => Number(amount) !== 0);
    printWindow.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${invoice.invoiceNumber}</title><style>
      *{box-sizing:border-box}body{margin:0;padding:30px;font-family:Arial,sans-serif;color:#0f172a;font-size:11px}.page{max-width:800px;margin:auto}.head{display:flex;justify-content:space-between;border-bottom:2px solid #2563eb;padding-bottom:18px}.brand{font-weight:800;color:#2563eb;font-size:13px}.title{font-size:28px;font-weight:800}.meta{margin-top:18px;display:grid;grid-template-columns:1fr 1fr;gap:6px 30px}.label{color:#64748b}.bill{margin-top:22px;padding:14px;background:#f8fafc}.bill strong{font-size:14px}table{width:100%;border-collapse:collapse;margin-top:22px}th,td{padding:9px;border-bottom:1px solid #e2e8f0;text-align:left}th:last-child,td:last-child{text-align:right}.totals{margin-left:auto;margin-top:18px;width:320px}.totals div{display:flex;justify-content:space-between;padding:5px}.grand{margin-top:5px;border-top:2px solid #0f172a;padding-top:10px!important;font-size:14px;font-weight:800}.notes{margin-top:28px;color:#475569}.foot{margin-top:38px;padding-top:10px;border-top:1px solid #e2e8f0;color:#94a3b8;font-size:9px}@page{size:A4;margin:15mm}
    </style></head><body><div class="page"><div class="head"><div><div class="brand">PERADA GROUP · PT Perdana Adi Yuda</div><div style="margin-top:5px;color:#64748b">PHL Mining Workforce Lifecycle</div></div><div class="title">INVOICE</div></div><div class="meta"><div><span class="label">Invoice No.</span><br><strong>${invoice.invoiceNumber}</strong></div><div><span class="label">Invoice Date / Due Date</span><br><strong>${invoice.invoiceDate} / ${invoice.dueDate}</strong></div><div><span class="label">Period</span><br><strong>${monthLabel(invoice.period)}</strong></div><div><span class="label">Terms</span><br><strong>Net ${invoice.termsDays}</strong></div></div><div class="bill"><span class="label">BILL TO</span><br><strong>${invoice.clientName}</strong><br>${invoice.project} · ${invoice.site}${invoice.clientReference ? `<br>Ref: ${invoice.clientReference}` : ''}</div><table><thead><tr><th>Description</th><th>Amount</th></tr></thead><tbody>${rows.map(([label, amount]) => `<tr><td>${label}</td><td>${rupiah(Number(amount))}</td></tr>`).join('')}</tbody></table><div class="totals"><div><span>Subtotal</span><strong>${rupiah(invoice.subtotal)}</strong></div><div><span>PPN efektif (${invoice.taxRate}%)</span><strong>${rupiah(invoice.taxAmount)}</strong></div><div class="grand"><span>TOTAL</span><strong>${rupiah(invoice.total)}</strong></div></div><div class="notes"><strong>Notes</strong><br>${invoice.notes || '-'}</div><div class="foot">Generated from PHL Mining Workforce Lifecycle · ${invoice.workerCount} worker · ${invoice.paidDays} paid days</div></div></body></html>`);
    printWindow.document.close();
    printWindow.focus();
    window.setTimeout(() => { printWindow.print(); }, 200);
  };

  const recent = balances.slice(0, 8);

  return (
    <div className="mx-auto max-w-[1500px] space-y-5 text-slate-900 dark:text-slate-100">
      <section className="flex flex-col gap-3 rounded-2xl border border-blue-200 bg-blue-50/60 p-4 dark:border-blue-500/20 dark:bg-blue-500/10 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-600 text-white"><ReceiptText size={18} /></span>
          <div><p className="text-xs font-bold">PHL Invoice — payroll to billing</p><p className="mt-1 text-[11px] leading-5 text-slate-600 dark:text-slate-300">Billing base ditarik langsung dari paid attendance days × rate harian. Management fee, reimbursable, charge lain, dan PPN efektif tetap dapat dikontrol Admin sebelum invoice diterbitkan.</p></div>
        </div>
        <div className="flex gap-2"><button onClick={() => saveInvoice('draft')} className="rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-xs font-bold text-blue-700 hover:bg-blue-50 dark:border-blue-500/20 dark:bg-slate-900 dark:text-blue-300">Save Draft</button><button onClick={() => saveInvoice('issued')} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700"><Send size={14} /> Issue Invoice</button></div>
      </section>

      {message && <div className={`flex items-start gap-2 rounded-xl border p-3 text-xs ${message.tone === 'error' ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300' : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300'}`}>{message.tone === 'error' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}{message.text}</div>}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-3 lg:grid-cols-3 xl:grid-cols-6">
          <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Period<select value={period} onChange={(e) => setPeriod(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-normal text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white">{periodOptions.map((item) => <option key={item} value={item}>{monthLabel(item)}</option>)}</select></label>
          <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Project<select value={project} onChange={(e) => setProject(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-normal text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white">{projectOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Site<select value={site} onChange={(e) => setSite(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-normal text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white">{siteOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Invoice Date<input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-normal text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white" /></label>
          <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">TOP<select value={termsDays} onChange={(e) => setTermsDays(Number(e.target.value))} className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-normal text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white">{[14, 21, 30, 60].map((day) => <option key={day} value={day}>Net {day}</option>)}</select></label>
          <div className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800"><p className="text-[9px] font-bold uppercase text-slate-400">Due Date</p><strong className="mt-1 block text-xs">{dueDate}</strong></div>
        </div>
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Client Name<input value={clientName} onChange={(e) => setClientName(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-normal text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white" /></label>
          <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Client Reference / PO / BAST<input value={clientReference} onChange={(e) => setClientReference(e.target.value)} placeholder="Opsional" className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-normal text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white" /></label>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        {[
          ['Worker Billed', workerCount, Users, 'text-blue-600'],
          ['Paid Days', paidDays, CalendarDays, 'text-emerald-600'],
          ['Payroll Base', rupiah(payrollBase), Banknote, 'text-violet-600'],
          ['Management Fee', rupiah(managementFee), FileText, 'text-orange-600'],
          ['Invoice Total', rupiah(grandTotal), ReceiptText, 'text-blue-600'],
        ].map(([label, value, Icon, tone]) => { const MetricIcon = Icon as typeof Users; return <article key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center justify-between gap-2"><div className="min-w-0"><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500">{String(label)}</p><strong className={`mt-2 block truncate text-xl ${String(tone)}`}>{String(value)}</strong></div><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-50 text-slate-500 dark:bg-slate-800"><MetricIcon size={17} /></span></div></article>; })}
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_420px]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800"><h2 className="text-sm font-bold">Billing Support Detail</h2><p className="mt-1 text-[10px] text-slate-500">Snapshot dasar billing dari attendance lifecycle.</p></div>
          {billingRows.length === 0 ? <div className="p-8 text-center text-xs text-slate-500">Belum ada paid attendance untuk filter ini.</div> : <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead className="bg-slate-50 text-[9px] uppercase tracking-wide text-slate-400 dark:bg-slate-950/50"><tr><th className="px-4 py-2.5">Worker</th><th className="px-4 py-2.5">Position</th><th className="px-4 py-2.5 text-right">Paid Days</th><th className="px-4 py-2.5 text-right">Rate / Day</th><th className="px-4 py-2.5 text-right">Payroll Base</th></tr></thead><tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800">{billingRows.map((row) => <tr key={row.id}><td className="px-4 py-3"><strong>{row.name}</strong><span className="mt-0.5 block text-[10px] text-slate-500">{row.workerCode}</span></td><td className="px-4 py-3 text-slate-500">{row.position}</td><td className="px-4 py-3 text-right font-semibold">{row.paidDays}</td><td className="px-4 py-3 text-right text-slate-500">{rupiah(row.dailyRate)}</td><td className="px-4 py-3 text-right font-semibold">{rupiah(row.payrollBase)}</td></tr>)}</tbody></table></div>}
        </section>

        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div><h2 className="text-sm font-bold">Invoice Components</h2><p className="mt-1 text-[10px] text-slate-500">Persentase dan charge dapat disesuaikan sebelum issue.</p></div>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs font-semibold">Management Fee (%)<input type="number" min="0" step="0.1" value={managementFeeRate} onChange={(e) => setManagementFeeRate(Math.max(0, Number(e.target.value) || 0))} className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-950" /></label>
            <label className="text-xs font-semibold">PPN efektif (%)<input type="number" min="0" step="0.1" value={taxRate} onChange={(e) => setTaxRate(Math.max(0, Number(e.target.value) || 0))} className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-950" /></label>
            <label className="text-xs font-semibold">Reimbursable<input type="number" min="0" value={reimbursable} onChange={(e) => setReimbursable(Math.max(0, Number(e.target.value) || 0))} className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-950" /></label>
            <label className="text-xs font-semibold">Other Charges<input type="number" min="0" value={otherCharges} onChange={(e) => setOtherCharges(Math.max(0, Number(e.target.value) || 0))} className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-950" /></label>
          </div>
          <label className="block text-xs font-semibold">Notes<textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3 text-xs dark:border-slate-700 dark:bg-slate-950" /></label>
          <div className="space-y-2 rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-800/60"><div className="flex justify-between"><span className="text-slate-500">Payroll Base</span><strong>{rupiah(payrollBase)}</strong></div><div className="flex justify-between"><span className="text-slate-500">Management Fee</span><strong>{rupiah(managementFee)}</strong></div>{reimbursable > 0 && <div className="flex justify-between"><span className="text-slate-500">Reimbursable</span><strong>{rupiah(reimbursable)}</strong></div>}{otherCharges > 0 && <div className="flex justify-between"><span className="text-slate-500">Other Charges</span><strong>{rupiah(otherCharges)}</strong></div>}<div className="flex justify-between border-t border-slate-200 pt-2 dark:border-slate-700"><span className="text-slate-500">Subtotal</span><strong>{rupiah(subtotal)}</strong></div><div className="flex justify-between"><span className="text-slate-500">PPN efektif</span><strong>{rupiah(taxAmount)}</strong></div><div className="flex justify-between border-t border-slate-300 pt-2 text-sm dark:border-slate-600"><span className="font-bold">TOTAL</span><strong className="text-blue-600">{rupiah(grandTotal)}</strong></div></div>
        </section>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800"><h2 className="text-sm font-bold">Invoice Register</h2><p className="mt-1 text-[10px] text-slate-500">Nomor invoice otomatis dan status sinkron ke Monitoring AR.</p></div>
        {recent.length === 0 ? <div className="p-8 text-center text-xs text-slate-500">Belum ada invoice PHL.</div> : <div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left"><thead className="bg-slate-50 text-[9px] uppercase tracking-wide text-slate-400 dark:bg-slate-950/50"><tr><th className="px-4 py-2.5">Invoice</th><th className="px-4 py-2.5">Client / Project</th><th className="px-4 py-2.5">Period</th><th className="px-4 py-2.5">Due</th><th className="px-4 py-2.5 text-right">Total</th><th className="px-4 py-2.5 text-right">Outstanding</th><th className="px-4 py-2.5">Status</th><th className="px-4 py-2.5 text-right">Action</th></tr></thead><tbody className="divide-y divide-slate-100 text-[11px] dark:divide-slate-800">{recent.map((balance) => { const invoice = balance.invoice; return <tr key={invoice.id}><td className="px-4 py-3 font-bold text-blue-600 dark:text-blue-300">{invoice.invoiceNumber}</td><td className="px-4 py-3"><strong className="block">{invoice.clientName}</strong><span className="text-[9px] text-slate-500">{invoice.project} · {invoice.site}</span></td><td className="px-4 py-3 text-slate-500">{monthLabel(invoice.period)}</td><td className="px-4 py-3 text-slate-500">{invoice.dueDate}</td><td className="px-4 py-3 text-right font-semibold">{rupiah(invoice.total)}</td><td className="px-4 py-3 text-right font-semibold">{rupiah(balance.outstanding)}</td><td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-[9px] font-bold ${statusTone[balance.effectiveStatus]}`}>{statusLabel[balance.effectiveStatus]}</span></td><td className="px-4 py-3"><div className="flex justify-end gap-1.5"><button onClick={() => printInvoice(invoice)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" title="Print"><Printer size={14} /></button>{invoice.status === 'draft' && <button onClick={() => issueInvoice(invoice.id)} className="rounded-lg bg-blue-50 px-2.5 text-[9px] font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">Issue</button>}{!['paid', 'cancelled'].includes(invoice.status) && <button onClick={() => cancelInvoice(invoice.id)} className="rounded-lg px-2.5 text-[9px] font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10">Cancel</button>}</div></td></tr>; })}</tbody></table></div>}
      </section>
    </div>
  );
}
