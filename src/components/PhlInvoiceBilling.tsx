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
  localToday,
  type InvoiceBalance,
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

const monthLabel = (period: string) => {
  const [year, month] = period.split('-').map(Number);
  if (!year || !month) return period;
  return new Date(year, month - 1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
};

const dateLabel = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return value || '-';
  return new Date(year, month - 1, day).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

const escapeHtml = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

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
    const values = Array.from(new Set(lifecycle.attendance.map((item) => item.date.slice(0, 7))))
      .filter(Boolean)
      .sort()
      .reverse();
    return values.length ? values : [localToday().slice(0, 7)];
  }, [lifecycle.attendance]);

  const projectOptions = useMemo(
    () => Array.from(new Set(lifecycle.workers.map((worker) => worker.project).filter(Boolean))).sort(),
    [lifecycle.workers],
  );

  const [period, setPeriod] = useState(() => periodOptions[0]);
  const [project, setProject] = useState(() => projectOptions[0] || '');
  const siteOptions = useMemo(
    () => Array.from(new Set(lifecycle.workers
      .filter((worker) => !project || worker.project === project)
      .map((worker) => worker.site)
      .filter(Boolean))).sort(),
    [lifecycle.workers, project],
  );
  const [site, setSite] = useState(() => siteOptions[0] || '');
  const [clientName, setClientName] = useState(() => projectOptions[0] || '');
  const [clientReference, setClientReference] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(localToday());
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
    if (!projectOptions.includes(project)) {
      const next = projectOptions[0] || '';
      setProject(next);
      setClientName(next);
    }
  }, [project, projectOptions]);

  useEffect(() => {
    if (!siteOptions.includes(site)) setSite(siteOptions[0] || '');
  }, [site, siteOptions]);

  const billingRows = useMemo(() => lifecycle.workers
    .filter((worker) => (!project || worker.project === project) && (!site || worker.site === site))
    .map((worker) => {
      const records = lifecycle.attendance.filter((record) => record.workerId === worker.id && record.date.startsWith(period));
      const paidRecords = records.filter((record) => record.status === 'present');
      const paidDays = paidRecords.length;
      const overtimeHours = paidRecords.reduce((sum, record) => sum + record.overtimeHours, 0);
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
    if (!/^\d{4}-\d{2}-\d{2}$/.test(invoiceDate)) {
      setMessage({ tone: 'error', text: 'Tanggal invoice tidak valid.' });
      return null;
    }
    if (!Number.isFinite(termsDays) || termsDays <= 0) {
      setMessage({ tone: 'error', text: 'TOP invoice harus lebih besar dari 0 hari.' });
      return null;
    }
    if (!billingRows.length || payrollBase <= 0) {
      setMessage({ tone: 'error', text: 'Tidak ada paid attendance days untuk project, site, dan periode ini.' });
      return null;
    }
    if (duplicate) {
      setMessage({ tone: 'error', text: `Invoice untuk kombinasi ini sudah ada: ${duplicate.invoiceNumber}. Gunakan invoice existing atau batalkan invoice lama terlebih dahulu.` });
      return null;
    }
    if (
      managementFeeRate < 0 || managementFeeRate > 100
      || taxRate < 0 || taxRate > 100
      || reimbursable < 0 || otherCharges < 0
    ) {
      setMessage({ tone: 'error', text: 'Fee dan pajak harus 0–100%; charge lain tidak boleh negatif.' });
      return null;
    }
    if (!Number.isFinite(grandTotal) || grandTotal <= 0) {
      setMessage({ tone: 'error', text: 'Total invoice harus lebih besar dari 0.' });
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
    setMessage(null);
    const invoice = buildInvoice(status);
    if (!invoice) return;
    createInvoice(invoice);
    setMessage({ tone: 'success', text: `${invoice.invoiceNumber} berhasil ${status === 'issued' ? 'diterbitkan dan masuk Monitoring AR' : 'disimpan sebagai draft'}.` });
  };

  const handleIssueExisting = (invoice: PhlInvoice) => {
    if (issueInvoice(invoice.id)) {
      setMessage({ tone: 'success', text: `${invoice.invoiceNumber} berhasil diterbitkan dan masuk Monitoring AR.` });
    } else {
      setMessage({ tone: 'error', text: 'Invoice tidak dapat diterbitkan. Pastikan status masih Draft.' });
    }
  };

  const handleCancel = (balance: InvoiceBalance) => {
    if (balance.paid > 0) {
      setMessage({ tone: 'error', text: 'Invoice yang sudah menerima pembayaran tidak dapat dibatalkan.' });
      return;
    }
    if (cancelInvoice(balance.invoice.id)) {
      setMessage({ tone: 'success', text: `${balance.invoice.invoiceNumber} dibatalkan.` });
    } else {
      setMessage({ tone: 'error', text: 'Invoice tidak dapat dibatalkan pada status saat ini.' });
    }
  };

  const printInvoice = (invoice: PhlInvoice) => {
    const printWindow = window.open('', '', 'width=980,height=780');
    if (!printWindow) {
      setMessage({ tone: 'error', text: 'Popup print diblokir browser. Izinkan pop-up untuk mencetak invoice.' });
      return;
    }

    const rows = [
      ['Payroll / paid attendance base', invoice.payrollBase],
      [`Management fee (${invoice.managementFeeRate}%)`, invoice.managementFee],
      ['Reimbursable', invoice.reimbursable],
      ['Other charges', invoice.otherCharges],
    ].filter(([, amount]) => Number(amount) !== 0);

    const safeInvoiceNumber = escapeHtml(invoice.invoiceNumber);
    const safeClient = escapeHtml(invoice.clientName);
    const safeProject = escapeHtml(invoice.project);
    const safeSite = escapeHtml(invoice.site);
    const safeReference = escapeHtml(invoice.clientReference);
    const safeNotes = escapeHtml(invoice.notes || '-').replaceAll('\n', '<br>');

    printWindow.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${safeInvoiceNumber}</title><style>
      *{box-sizing:border-box}body{margin:0;padding:30px;font-family:Arial,sans-serif;color:#0f172a;font-size:11px}.page{max-width:800px;margin:auto}.head{display:flex;justify-content:space-between;border-bottom:2px solid #2563eb;padding-bottom:18px}.brand{font-weight:800;color:#2563eb;font-size:13px}.title{font-size:28px;font-weight:800}.meta{margin-top:18px;display:grid;grid-template-columns:1fr 1fr;gap:8px 30px}.label{color:#64748b}.bill{margin-top:22px;padding:14px;background:#f8fafc;border-radius:8px}.bill strong{font-size:14px}table{width:100%;border-collapse:collapse;margin-top:22px}th,td{padding:9px;border-bottom:1px solid #e2e8f0;text-align:left}th:last-child,td:last-child{text-align:right}.totals{margin-left:auto;margin-top:18px;width:320px}.totals div{display:flex;justify-content:space-between;padding:5px}.grand{margin-top:5px;border-top:2px solid #0f172a;padding-top:10px!important;font-size:14px;font-weight:800}.notes{margin-top:28px;color:#475569;line-height:1.5}.foot{margin-top:38px;padding-top:10px;border-top:1px solid #e2e8f0;color:#94a3b8;font-size:9px}@page{size:A4;margin:15mm}
    </style></head><body><div class="page"><div class="head"><div><div class="brand">PERADA GROUP · PT Perdana Adi Yuda</div><div style="margin-top:5px;color:#64748b">PHL Mining Workforce Lifecycle</div></div><div class="title">INVOICE</div></div><div class="meta"><div><span class="label">Invoice No.</span><br><strong>${safeInvoiceNumber}</strong></div><div><span class="label">Invoice Date / Due Date</span><br><strong>${escapeHtml(invoice.invoiceDate)} / ${escapeHtml(invoice.dueDate)}</strong></div><div><span class="label">Period</span><br><strong>${escapeHtml(monthLabel(invoice.period))}</strong></div><div><span class="label">Terms</span><br><strong>Net ${invoice.termsDays}</strong></div></div><div class="bill"><span class="label">BILL TO</span><br><strong>${safeClient}</strong><br>${safeProject} · ${safeSite}${safeReference ? `<br>Ref: ${safeReference}` : ''}</div><table><thead><tr><th>Description</th><th>Amount</th></tr></thead><tbody>${rows.map(([label, amount]) => `<tr><td>${escapeHtml(String(label))}</td><td>${escapeHtml(rupiah(Number(amount)))}</td></tr>`).join('')}</tbody></table><div class="totals"><div><span>Subtotal</span><strong>${escapeHtml(rupiah(invoice.subtotal))}</strong></div><div><span>PPN efektif (${invoice.taxRate}%)</span><strong>${escapeHtml(rupiah(invoice.taxAmount))}</strong></div><div class="grand"><span>TOTAL</span><strong>${escapeHtml(rupiah(invoice.total))}</strong></div></div><div class="notes"><strong>Notes</strong><br>${safeNotes}</div><div class="foot">Generated from PHL Mining Workforce Lifecycle · ${invoice.workerCount} worker · ${invoice.paidDays} paid days</div></div></body></html>`);
    printWindow.document.close();
    printWindow.focus();
    window.setTimeout(() => printWindow.print(), 200);
  };

  const recent = balances.slice(0, 10);

  const onProjectChange = (nextProject: string) => {
    const previousProject = project;
    setProject(nextProject);
    if (!clientName.trim() || clientName === previousProject) setClientName(nextProject);
    setMessage(null);
  };

  return (
    <div className="phl-finance-page mx-auto max-w-[1560px] space-y-5 text-slate-900 dark:text-slate-100">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-600 text-white shadow-sm"><ReceiptText size={20} /></span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-300">Finance · Client Billing</p>
              <h2 className="mt-1 text-lg font-bold tracking-tight">Invoice & Billing</h2>
              <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500 dark:text-slate-400">Bangun invoice langsung dari paid attendance. Review payroll base, fee, charge, PPN, dan TOP sebelum diterbitkan ke Monitoring AR.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => saveInvoice('draft')} className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800">Save Draft</button>
            <button type="button" onClick={() => saveInvoice('issued')} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white transition hover:bg-blue-700"><Send size={14} /> Issue Invoice</button>
          </div>
        </div>
      </section>

      {message && (
        <div className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-xs ${message.tone === 'error' ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300' : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300'}`}>
          {message.tone === 'error' ? <AlertTriangle size={16} className="mt-0.5 shrink-0" /> : <CheckCircle2 size={16} className="mt-0.5 shrink-0" />}
          <span className="leading-5">{message.text}</span>
        </div>
      )}

      {duplicate && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>Invoice untuk periode/project/site ini sudah ada: <strong>{duplicate.invoiceNumber}</strong>. Gunakan register di bawah untuk Issue, Print, atau Cancel.</span>
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4">
          <h3 className="text-sm font-bold">Billing Context</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Tentukan sumber billing dan informasi invoice.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Period
            <select value={period} onChange={(e) => { setPeriod(e.target.value); setMessage(null); }} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-500/10">
              {periodOptions.map((item) => <option key={item} value={item}>{monthLabel(item)}</option>)}
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Project
            <select value={project} onChange={(e) => onProjectChange(e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-500/10">
              {projectOptions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Site
            <select value={site} onChange={(e) => { setSite(e.target.value); setMessage(null); }} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-500/10">
              {siteOptions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Invoice Date
            <input type="date" value={invoiceDate} onChange={(e) => { setInvoiceDate(e.target.value); setMessage(null); }} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-500/10" />
          </label>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Client Name
            <input value={clientName} onChange={(e) => setClientName(e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-500/10" />
          </label>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Client Reference / PO / BAST
            <input value={clientReference} onChange={(e) => setClientReference(e.target.value)} placeholder="Opsional" className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-500/10" />
          </label>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">TOP
            <select value={termsDays} onChange={(e) => setTermsDays(Number(e.target.value))} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-500/10">
              {[14, 21, 30, 60].map((day) => <option key={day} value={day}>Net {day} hari</option>)}
            </select>
          </label>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/60">
            <p className="text-[11px] font-semibold text-slate-500">Due Date</p>
            <strong className="mt-1 block text-sm">{dateLabel(dueDate)}</strong>
            <span className="mt-0.5 block text-[11px] text-slate-400">{dueDate}</span>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Worker Billed', workerCount, Users, 'text-blue-600'],
          ['Paid Days', paidDays, CalendarDays, 'text-emerald-600'],
          ['Payroll Base', rupiah(payrollBase), Banknote, 'text-violet-600'],
          ['Invoice Total', rupiah(grandTotal), ReceiptText, 'text-blue-600'],
        ].map(([label, value, Icon, tone]) => {
          const MetricIcon = Icon as typeof Users;
          return (
            <article key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-slate-500">{String(label)}</p>
                  <strong className={`mt-1.5 block truncate text-lg ${String(tone)}`}>{String(value)}</strong>
                </div>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-50 text-slate-500 dark:bg-slate-800"><MetricIcon size={18} /></span>
              </div>
            </article>
          );
        })}
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)] xl:items-start">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
            <h3 className="text-sm font-bold">Billing Support Detail</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Sumber perhitungan invoice dari attendance lifecycle.</p>
          </div>
          {billingRows.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">Belum ada paid attendance untuk filter ini.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left">
                <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 dark:bg-slate-950/50">
                  <tr><th className="px-5 py-3">Worker</th><th className="px-5 py-3">Position</th><th className="px-5 py-3 text-right">Paid Days</th><th className="px-5 py-3 text-right">OT Hours</th><th className="px-5 py-3 text-right">Rate / Day</th><th className="px-5 py-3 text-right">Payroll Base</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
                  {billingRows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                      <td className="px-5 py-3.5"><strong className="block text-slate-900 dark:text-white">{row.name}</strong><span className="mt-0.5 block text-[11px] text-slate-500">{row.workerCode}</span></td>
                      <td className="px-5 py-3.5 text-slate-500">{row.position}</td>
                      <td className="px-5 py-3.5 text-right font-semibold">{row.paidDays}</td>
                      <td className="px-5 py-3.5 text-right text-slate-500">{row.overtimeHours}</td>
                      <td className="px-5 py-3.5 text-right text-slate-500">{rupiah(row.dailyRate)}</td>
                      <td className="px-5 py-3.5 text-right font-bold">{rupiah(row.payrollBase)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2"><FileText size={16} className="text-blue-600" /><h3 className="text-sm font-bold">Invoice Components</h3></div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Review komponen sebelum invoice di-issue.</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <label className="text-xs font-semibold">Management Fee (%)
              <input type="number" min="0" max="100" step="0.1" value={managementFeeRate} onChange={(e) => setManagementFeeRate(Math.min(100, Math.max(0, Number(e.target.value) || 0)))} className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950" />
            </label>
            <label className="text-xs font-semibold">PPN efektif (%)
              <input type="number" min="0" max="100" step="0.1" value={taxRate} onChange={(e) => setTaxRate(Math.min(100, Math.max(0, Number(e.target.value) || 0)))} className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950" />
            </label>
            <label className="text-xs font-semibold">Reimbursable
              <input type="number" min="0" value={reimbursable} onChange={(e) => setReimbursable(Math.max(0, Number(e.target.value) || 0))} className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950" />
            </label>
            <label className="text-xs font-semibold">Other Charges
              <input type="number" min="0" value={otherCharges} onChange={(e) => setOtherCharges(Math.max(0, Number(e.target.value) || 0))} className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950" />
            </label>
          </div>
          <label className="mt-4 block text-xs font-semibold">Notes
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="mt-1.5 w-full resize-y rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-950" />
          </label>
          <div className="mt-4 space-y-2.5 rounded-xl bg-slate-50 p-4 text-xs dark:bg-slate-800/60">
            <div className="flex justify-between gap-3"><span className="text-slate-500">Payroll Base</span><strong>{rupiah(payrollBase)}</strong></div>
            <div className="flex justify-between gap-3"><span className="text-slate-500">Management Fee</span><strong>{rupiah(managementFee)}</strong></div>
            {reimbursable > 0 && <div className="flex justify-between gap-3"><span className="text-slate-500">Reimbursable</span><strong>{rupiah(reimbursable)}</strong></div>}
            {otherCharges > 0 && <div className="flex justify-between gap-3"><span className="text-slate-500">Other Charges</span><strong>{rupiah(otherCharges)}</strong></div>}
            <div className="flex justify-between gap-3 border-t border-slate-200 pt-2.5 dark:border-slate-700"><span className="text-slate-500">Subtotal</span><strong>{rupiah(subtotal)}</strong></div>
            <div className="flex justify-between gap-3"><span className="text-slate-500">PPN efektif ({taxRate}%)</span><strong>{rupiah(taxAmount)}</strong></div>
            <div className="flex justify-between gap-3 border-t border-slate-300 pt-3 text-sm dark:border-slate-600"><span className="font-bold">TOTAL</span><strong className="text-blue-600 dark:text-blue-300">{rupiah(grandTotal)}</strong></div>
          </div>
        </section>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <h3 className="text-sm font-bold">Invoice Register</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Draft, issued, outstanding, dan status AR dalam satu register.</p>
        </div>
        {recent.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">Belum ada invoice PHL.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 dark:bg-slate-950/50">
                <tr><th className="px-5 py-3">Invoice</th><th className="px-5 py-3">Client / Project</th><th className="px-5 py-3">Period</th><th className="px-5 py-3">Due</th><th className="px-5 py-3 text-right">Total</th><th className="px-5 py-3 text-right">Outstanding</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Action</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
                {recent.map((balance) => {
                  const invoice = balance.invoice;
                  return (
                    <tr key={invoice.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                      <td className="px-5 py-3.5"><strong className="text-blue-600 dark:text-blue-300">{invoice.invoiceNumber}</strong>{invoice.clientReference && <span className="mt-0.5 block text-[11px] text-slate-500">Ref: {invoice.clientReference}</span>}</td>
                      <td className="px-5 py-3.5"><strong className="block">{invoice.clientName}</strong><span className="mt-0.5 block text-[11px] text-slate-500">{invoice.project} · {invoice.site}</span></td>
                      <td className="px-5 py-3.5 text-slate-500">{monthLabel(invoice.period)}</td>
                      <td className="px-5 py-3.5 text-slate-500">{dateLabel(invoice.dueDate)}</td>
                      <td className="px-5 py-3.5 text-right font-semibold">{rupiah(invoice.total)}</td>
                      <td className="px-5 py-3.5 text-right font-bold">{rupiah(balance.outstanding)}</td>
                      <td className="px-5 py-3.5"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${statusTone[balance.effectiveStatus]}`}>{statusLabel[balance.effectiveStatus]}</span></td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => printInvoice(invoice)} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800" title="Print invoice"><Printer size={14} /></button>
                          {invoice.status === 'draft' && <button type="button" onClick={() => handleIssueExisting(invoice)} className="h-9 rounded-lg bg-blue-600 px-3 text-[11px] font-bold text-white hover:bg-blue-700">Issue</button>}
                          {!['paid', 'cancelled'].includes(invoice.status) && balance.paid <= 0 && <button type="button" onClick={() => handleCancel(balance)} className="h-9 rounded-lg px-3 text-[11px] font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10">Cancel</button>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
