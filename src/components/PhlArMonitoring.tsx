import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Banknote,
  CalendarClock,
  CheckCircle2,
  Clock3,
  CreditCard,
  Search,
  TrendingUp,
  X,
} from 'lucide-react';
import {
  localToday,
  type InvoiceBalance,
  type PhlArPayment,
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

const parseDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
};

const dateLabel = (value: string) => {
  const date = parseDate(value);
  return date ? date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : value || '-';
};

const statusLabel: Record<string, string> = {
  draft: 'Draft', issued: 'Current', partially_paid: 'Partial', paid: 'Paid', overdue: 'Overdue', cancelled: 'Cancelled',
};

const statusTone: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  issued: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300',
  partially_paid: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
  paid: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
  overdue: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300',
  cancelled: 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500',
};

const agingOrder: InvoiceBalance['agingBucket'][] = ['Current', '1-30', '31-60', '61-90', '>90'];

const daysUntil = (dateValue: string) => {
  const due = parseDate(dateValue);
  const today = parseDate(localToday());
  if (!due || !today) return null;
  return Math.round((due.getTime() - today.getTime()) / 86400000);
};

export default function PhlArMonitoring(_props: Props) {
  const { store, balances, recordPayment } = usePhlBillingAr();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'overdue' | 'paid'>('open');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [paymentDate, setPaymentDate] = useState(localToday());
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ tone: 'error' | 'success'; text: string } | null>(null);

  const activeBalances = useMemo(
    () => balances.filter(({ invoice }) => !['draft', 'cancelled'].includes(invoice.status)),
    [balances],
  );

  const openBalances = useMemo(
    () => activeBalances.filter((balance) => balance.outstanding > 0),
    [activeBalances],
  );

  const totalBilled = activeBalances.reduce((sum, balance) => sum + balance.invoice.total, 0);
  const totalCollected = activeBalances.reduce((sum, balance) => sum + balance.paid, 0);
  const totalOutstanding = openBalances.reduce((sum, balance) => sum + balance.outstanding, 0);
  const overdueBalances = openBalances.filter((balance) => balance.effectiveStatus === 'overdue');
  const totalOverdue = overdueBalances.reduce((sum, balance) => sum + balance.outstanding, 0);
  const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;
  const weightedOverdueDays = overdueBalances.reduce((sum, balance) => sum + (balance.outstanding * balance.daysOverdue), 0);
  const averageOverdue = totalOverdue > 0 ? Math.round(weightedOverdueDays / totalOverdue) : 0;

  const aging = useMemo(() => Object.fromEntries(agingOrder.map((bucket) => [bucket, openBalances
    .filter((balance) => balance.agingBucket === bucket)
    .reduce((sum, balance) => sum + balance.outstanding, 0)])) as Record<InvoiceBalance['agingBucket'], number>, [openBalances]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return balances.filter((balance) => {
      const invoice = balance.invoice;
      const haystack = `${invoice.invoiceNumber} ${invoice.clientName} ${invoice.project} ${invoice.site} ${invoice.clientReference}`.toLowerCase();
      const matchQuery = !needle || haystack.includes(needle);
      const matchStatus = statusFilter === 'all'
        || (statusFilter === 'open' && !['draft', 'cancelled', 'paid'].includes(balance.effectiveStatus))
        || (statusFilter === 'overdue' && balance.effectiveStatus === 'overdue')
        || (statusFilter === 'paid' && balance.effectiveStatus === 'paid');
      return matchQuery && matchStatus;
    }).sort((a, b) => {
      if (a.effectiveStatus === 'overdue' && b.effectiveStatus !== 'overdue') return -1;
      if (b.effectiveStatus === 'overdue' && a.effectiveStatus !== 'overdue') return 1;
      return a.invoice.dueDate.localeCompare(b.invoice.dueDate);
    });
  }, [balances, query, statusFilter]);

  const selected = selectedInvoiceId ? balances.find((balance) => balance.invoice.id === selectedInvoiceId) : undefined;

  useEffect(() => {
    if (!selectedInvoiceId) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedInvoiceId(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedInvoiceId]);

  const openPayment = (balance: InvoiceBalance) => {
    setSelectedInvoiceId(balance.invoice.id);
    setPaymentAmount(balance.outstanding);
    setPaymentDate(localToday());
    setPaymentReference('');
    setPaymentNotes('');
    setPaymentError(null);
    setMessage(null);
  };

  const closePayment = () => {
    setSelectedInvoiceId(null);
    setPaymentError(null);
  };

  const submitPayment = () => {
    if (!selected) return;
    setPaymentError(null);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(paymentDate)) {
      setPaymentError('Tanggal pembayaran wajib diisi.');
      return;
    }
    if (paymentDate < selected.invoice.invoiceDate) {
      setPaymentError('Tanggal pembayaran tidak boleh lebih awal dari tanggal invoice.');
      return;
    }
    if (paymentDate > localToday()) {
      setPaymentError('Tanggal pembayaran tidak boleh berada di masa depan.');
      return;
    }
    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      setPaymentError('Nominal pembayaran harus lebih besar dari 0.');
      return;
    }
    if (paymentAmount > selected.outstanding + 0.01) {
      setPaymentError('Nominal pembayaran tidak boleh melebihi outstanding invoice.');
      return;
    }

    const payment: PhlArPayment = {
      id: globalThis.crypto?.randomUUID?.() ?? `pay-${Date.now()}`,
      invoiceId: selected.invoice.id,
      paymentDate,
      amount: paymentAmount,
      reference: paymentReference.trim(),
      notes: paymentNotes.trim(),
      createdAt: new Date().toISOString(),
    };

    if (!recordPayment(payment)) {
      setPaymentError('Pembayaran gagal diposting. Muat ulang data dan pastikan invoice masih memiliki outstanding.');
      return;
    }

    closePayment();
    setMessage({ tone: 'success', text: `Pembayaran ${rupiah(payment.amount)} untuk ${selected.invoice.invoiceNumber} berhasil dicatat.` });
  };

  const upcoming = useMemo(() => openBalances
    .map((balance) => ({ balance, days: daysUntil(balance.invoice.dueDate) }))
    .filter(({ days }) => days !== null && days >= 0 && days <= 7)
    .sort((a, b) => (a.days ?? 0) - (b.days ?? 0)), [openBalances]);

  const paymentLedger = useMemo(
    () => [...store.payments].sort((a, b) => b.paymentDate.localeCompare(a.paymentDate)).slice(0, 12),
    [store.payments],
  );

  const maxAging = Math.max(...agingOrder.map((bucket) => aging[bucket]), 1);

  return (
    <div className="phl-finance-page mx-auto max-w-[1560px] space-y-5 p-4 text-slate-900 dark:text-slate-100 md:p-5 xl:p-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-600 text-white shadow-sm"><TrendingUp size={20} /></span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-300">Finance · Accounts Receivable</p>
              <h2 className="mt-1 text-lg font-bold tracking-tight">Monitoring AR</h2>
              <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500 dark:text-slate-400">Pantau outstanding, aging, invoice jatuh tempo, overdue, dan pembayaran parsial/full dari satu register.</p>
            </div>
          </div>
          <div className="min-w-[220px] rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-500/20 dark:bg-blue-500/10">
            <div className="flex items-center justify-between gap-3 text-xs"><span className="font-semibold text-blue-700 dark:text-blue-300">Collection Rate</span><strong className="text-blue-700 dark:text-blue-300">{collectionRate}%</strong></div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-blue-100 dark:bg-blue-950"><div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${Math.min(100, collectionRate)}%` }} /></div>
          </div>
        </div>
      </section>

      {message && (
        <div className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-xs ${message.tone === 'error' ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300' : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300'}`}>
          {message.tone === 'error' ? <AlertTriangle size={16} className="mt-0.5 shrink-0" /> : <CheckCircle2 size={16} className="mt-0.5 shrink-0" />}
          <span className="leading-5">{message.text}</span>
        </div>
      )}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Total Billed', rupiah(totalBilled), Banknote, 'text-slate-900 dark:text-white'],
          ['Collected', rupiah(totalCollected), CreditCard, 'text-emerald-600'],
          ['Outstanding', rupiah(totalOutstanding), Clock3, 'text-blue-600'],
          ['Overdue', rupiah(totalOverdue), AlertTriangle, 'text-red-600'],
        ].map(([label, value, Icon, tone]) => {
          const MetricIcon = Icon as typeof Banknote;
          return (
            <article key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0"><p className="text-[11px] font-semibold text-slate-500">{String(label)}</p><strong className={`mt-1.5 block truncate text-lg ${String(tone)}`}>{String(value)}</strong></div>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-50 text-slate-500 dark:bg-slate-800"><MetricIcon size={18} /></span>
              </div>
            </article>
          );
        })}
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div><h3 className="text-sm font-bold">AR Aging</h3><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Outstanding berdasarkan jumlah hari setelah due date.</p></div>
            <div className="text-left sm:text-right"><span className="text-[11px] text-slate-500">Avg overdue</span><strong className="ml-2 text-sm text-amber-600">{averageOverdue} hari</strong></div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-5">
            {agingOrder.map((bucket) => {
              const amount = aging[bucket];
              const count = openBalances.filter((balance) => balance.agingBucket === bucket).length;
              const width = amount > 0 ? `${Math.max(6, (amount / maxAging) * 100)}%` : '0%';
              const barTone = bucket === 'Current' ? 'bg-blue-500' : bucket === '>90' ? 'bg-red-600' : 'bg-amber-500';
              return (
                <article key={bucket} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                  <div className="flex items-center justify-between gap-2"><strong className="text-xs">{bucket}</strong><span className="text-[10px] text-slate-400">{count} inv</span></div>
                  <p className="mt-2 truncate text-sm font-bold">{rupiah(amount)}</p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className={`h-full rounded-full ${barTone}`} style={{ width }} /></div>
                </article>
              );
            })}
          </div>
        </section>

        <aside className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2"><CalendarClock size={16} className="text-amber-500" /><h3 className="text-sm font-bold">Due ≤ 7 Hari</h3></div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Prioritas collection sebelum jatuh tempo.</p>
          <div className="mt-4 space-y-2.5">
            {upcoming.length === 0 ? (
              <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500 dark:bg-slate-800">Tidak ada invoice yang jatuh tempo dalam 7 hari.</div>
            ) : upcoming.map(({ balance, days }) => (
              <div key={balance.invoice.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0"><strong className="block truncate text-xs">{balance.invoice.invoiceNumber}</strong><span className="mt-1 block truncate text-[11px] text-slate-500">{balance.invoice.clientName}</span></div>
                  <span className="shrink-0 rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">{days === 0 ? 'Hari ini' : `${days} hari`}</span>
                </div>
                <div className="mt-2 flex items-end justify-between gap-3"><strong className="text-sm">{rupiah(balance.outstanding)}</strong><span className="text-[10px] text-slate-500">{dateLabel(balance.invoice.dueDate)}</span></div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">
          <div><h3 className="text-sm font-bold">Invoice & Collection Register</h3><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Overdue diprioritaskan paling atas. Gunakan Record Payment untuk posting penerimaan.</p></div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative block">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari invoice, client, project..." className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-blue-500/10 sm:w-[300px]" />
            </label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none transition focus:border-blue-400 dark:border-slate-700 dark:bg-slate-950">
              <option value="open">Open AR</option><option value="overdue">Overdue</option><option value="paid">Paid</option><option value="all">All</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">Tidak ada invoice untuk filter ini.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] text-left">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 dark:bg-slate-950/50">
                <tr><th className="px-5 py-3">Invoice</th><th className="px-5 py-3">Client / Project</th><th className="px-5 py-3">Invoice / Due</th><th className="px-5 py-3 text-right">Billed</th><th className="px-5 py-3 text-right">Paid</th><th className="px-5 py-3 text-right">Outstanding</th><th className="px-5 py-3">Aging</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Action</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
                {filtered.map((balance) => (
                  <tr key={balance.invoice.id} className={`${balance.effectiveStatus === 'overdue' ? 'bg-red-50/35 dark:bg-red-500/5' : ''} hover:bg-slate-50/70 dark:hover:bg-slate-800/40`}>
                    <td className="px-5 py-3.5"><strong className="text-blue-600 dark:text-blue-300">{balance.invoice.invoiceNumber}</strong><span className="mt-0.5 block text-[11px] text-slate-500">{balance.invoice.period}</span></td>
                    <td className="px-5 py-3.5"><strong className="block">{balance.invoice.clientName}</strong><span className="mt-0.5 block text-[11px] text-slate-500">{balance.invoice.project} · {balance.invoice.site}</span></td>
                    <td className="px-5 py-3.5 text-slate-500"><span className="block">{dateLabel(balance.invoice.invoiceDate)}</span><span className={`mt-0.5 block text-[11px] ${balance.daysOverdue > 0 ? 'font-bold text-red-600' : ''}`}>Due {dateLabel(balance.invoice.dueDate)}</span></td>
                    <td className="px-5 py-3.5 text-right font-semibold">{rupiah(balance.invoice.total)}</td>
                    <td className="px-5 py-3.5 text-right font-semibold text-emerald-600">{rupiah(balance.paid)}</td>
                    <td className="px-5 py-3.5 text-right font-bold">{rupiah(balance.outstanding)}</td>
                    <td className="px-5 py-3.5"><span className="font-semibold">{balance.agingBucket}</span>{balance.daysOverdue > 0 && <span className="mt-0.5 block text-[11px] text-red-600">{balance.daysOverdue} hari overdue</span>}</td>
                    <td className="px-5 py-3.5"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${statusTone[balance.effectiveStatus]}`}>{statusLabel[balance.effectiveStatus]}</span></td>
                    <td className="px-5 py-3.5 text-right">
                      {balance.outstanding > 0 && !['draft', 'cancelled'].includes(balance.invoice.status) ? (
                        <button type="button" onClick={() => openPayment(balance)} className="h-9 rounded-lg bg-blue-600 px-3 text-[11px] font-bold text-white transition hover:bg-blue-700">Record Payment</button>
                      ) : <span className="text-[11px] text-slate-400">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800"><h3 className="text-sm font-bold">Payment Ledger</h3><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Riwayat pembayaran yang sudah diposting ke AR.</p></div>
        {paymentLedger.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">Belum ada pembayaran tercatat.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 dark:bg-slate-950/50"><tr><th className="px-5 py-3">Date</th><th className="px-5 py-3">Invoice</th><th className="px-5 py-3">Reference</th><th className="px-5 py-3">Notes</th><th className="px-5 py-3 text-right">Amount</th></tr></thead>
              <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
                {paymentLedger.map((payment) => {
                  const invoice = store.invoices.find((item) => item.id === payment.invoiceId);
                  return (
                    <tr key={payment.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                      <td className="px-5 py-3.5 text-slate-500">{dateLabel(payment.paymentDate)}</td>
                      <td className="px-5 py-3.5 font-bold text-blue-600 dark:text-blue-300">{invoice?.invoiceNumber || payment.invoiceId}</td>
                      <td className="px-5 py-3.5 text-slate-500">{payment.reference || '-'}</td>
                      <td className="px-5 py-3.5 text-slate-500">{payment.notes || '-'}</td>
                      <td className="px-5 py-3.5 text-right font-bold text-emerald-600">{rupiah(payment.amount)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selected && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm" onMouseDown={(e) => { if (e.target === e.currentTarget) closePayment(); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="payment-dialog-title" className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-blue-600">Record Payment</p><h3 id="payment-dialog-title" className="mt-1 text-lg font-bold">{selected.invoice.invoiceNumber}</h3><p className="mt-1 text-xs text-slate-500">Outstanding {rupiah(selected.outstanding)} · {selected.invoice.clientName}</p></div>
              <button type="button" onClick={closePayment} className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Tutup"><X size={18} /></button>
            </div>

            {paymentError && <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"><AlertTriangle size={15} className="mt-0.5 shrink-0" /><span>{paymentError}</span></div>}

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-semibold">Payment Date
                <input type="date" max={localToday()} min={selected.invoice.invoiceDate} value={paymentDate} onChange={(e) => { setPaymentDate(e.target.value); setPaymentError(null); }} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950" />
              </label>
              <label className="text-xs font-semibold">Amount
                <input type="number" min="0" max={selected.outstanding} value={paymentAmount} onChange={(e) => { setPaymentAmount(Math.max(0, Number(e.target.value) || 0)); setPaymentError(null); }} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950" />
              </label>
              <label className="text-xs font-semibold sm:col-span-2">Bank / Payment Reference
                <input value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)} placeholder="Contoh: BI-FAST 123456 / Bank Ref" className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950" />
              </label>
              <label className="text-xs font-semibold sm:col-span-2">Notes
                <textarea value={paymentNotes} onChange={(e) => setPaymentNotes(e.target.value)} rows={3} className="mt-1.5 w-full resize-y rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-950" />
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={closePayment} className="h-10 rounded-xl border border-slate-200 px-4 text-xs font-bold dark:border-slate-700">Cancel</button>
              <button type="button" onClick={submitPayment} className="h-10 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white hover:bg-blue-700">Post Payment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
