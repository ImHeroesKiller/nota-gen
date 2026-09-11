import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Banknote,
  CalendarClock,
  CheckCircle2,
  Clock3,
  CreditCard,
  Search,
  TrendingUp,
} from 'lucide-react';
import {
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

const dateLabel = (value: string) => new Date(`${value}T00:00:00`).toLocaleDateString('id-ID', {
  day: '2-digit', month: 'short', year: 'numeric',
});

const today = () => new Date().toISOString().slice(0, 10);

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

export default function PhlArMonitoring(_props: Props) {
  const { store, balances, recordPayment } = usePhlBillingAr();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'overdue' | 'paid'>('open');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [paymentDate, setPaymentDate] = useState(today());
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
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
  const weightedDays = openBalances.reduce((sum, balance) => sum + (balance.outstanding * balance.daysOverdue), 0);
  const averageAging = totalOutstanding > 0 ? Math.round(weightedDays / totalOutstanding) : 0;

  const aging = useMemo(() => Object.fromEntries(agingOrder.map((bucket) => [bucket, openBalances
    .filter((balance) => balance.agingBucket === bucket)
    .reduce((sum, balance) => sum + balance.outstanding, 0)])) as Record<InvoiceBalance['agingBucket'], number>, [openBalances]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return balances.filter((balance) => {
      const invoice = balance.invoice;
      const search = `${invoice.invoiceNumber} ${invoice.clientName} ${invoice.project} ${invoice.site} ${invoice.clientReference}`.toLowerCase();
      const matchQuery = !needle || search.includes(needle);
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

  const openPayment = (balance: InvoiceBalance) => {
    setSelectedInvoiceId(balance.invoice.id);
    setPaymentAmount(balance.outstanding);
    setPaymentDate(today());
    setPaymentReference('');
    setPaymentNotes('');
    setMessage(null);
  };

  const submitPayment = () => {
    if (!selected) return;
    if (!paymentDate) {
      setMessage({ tone: 'error', text: 'Tanggal pembayaran wajib diisi.' });
      return;
    }
    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      setMessage({ tone: 'error', text: 'Nominal pembayaran harus lebih besar dari 0.' });
      return;
    }
    if (paymentAmount > selected.outstanding + 0.01) {
      setMessage({ tone: 'error', text: 'Nominal pembayaran tidak boleh melebihi outstanding invoice.' });
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
    recordPayment(payment);
    setSelectedInvoiceId(null);
    setMessage({ tone: 'success', text: `Pembayaran ${rupiah(payment.amount)} untuk ${selected.invoice.invoiceNumber} berhasil dicatat.` });
  };

  const upcoming = useMemo(() => openBalances.filter((balance) => {
    if (balance.daysOverdue > 0) return false;
    const due = new Date(`${balance.invoice.dueDate}T00:00:00`).getTime();
    const now = new Date(`${today()}T00:00:00`).getTime();
    const days = Math.ceil((due - now) / 86400000);
    return days >= 0 && days <= 7;
  }).sort((a, b) => a.invoice.dueDate.localeCompare(b.invoice.dueDate)), [openBalances]);

  const paymentLedger = useMemo(() => [...store.payments].sort((a, b) => b.paymentDate.localeCompare(a.paymentDate)).slice(0, 12), [store.payments]);

  const maxAging = Math.max(...agingOrder.map((bucket) => aging[bucket]), 1);

  return (
    <div className="mx-auto max-w-[1500px] space-y-5 text-slate-900 dark:text-slate-100">
      <section className="flex flex-col gap-3 rounded-2xl border border-blue-200 bg-blue-50/60 p-4 dark:border-blue-500/20 dark:bg-blue-500/10 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-600 text-white"><TrendingUp size={18} /></span><div><p className="text-xs font-bold">Accounts Receivable Monitoring</p><p className="mt-1 text-[11px] leading-5 text-slate-600 dark:text-slate-300">Monitor invoice issued, outstanding, jatuh tempo, overdue aging, dan pembayaran parsial/full dalam satu alur PHL.</p></div></div>
        <div className="rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-xs text-blue-700 dark:border-blue-500/20 dark:bg-slate-900 dark:text-blue-300"><strong>{collectionRate}%</strong> collection rate</div>
      </section>

      {message && <div className={`flex items-start gap-2 rounded-xl border p-3 text-xs ${message.tone === 'error' ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300' : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300'}`}>{message.tone === 'error' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}{message.text}</div>}

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        {[
          ['Total Billed', rupiah(totalBilled), Banknote, 'text-slate-900 dark:text-white'],
          ['Collected', rupiah(totalCollected), CreditCard, 'text-emerald-600'],
          ['Outstanding', rupiah(totalOutstanding), Clock3, 'text-blue-600'],
          ['Overdue', rupiah(totalOverdue), AlertTriangle, 'text-red-600'],
          ['Avg Aging', `${averageAging} hari`, CalendarClock, 'text-amber-600'],
        ].map(([label, value, Icon, tone]) => { const MetricIcon = Icon as typeof Banknote; return <article key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center justify-between gap-2"><div className="min-w-0"><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500">{String(label)}</p><strong className={`mt-2 block truncate text-xl ${String(tone)}`}>{String(value)}</strong></div><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-50 text-slate-500 dark:bg-slate-800"><MetricIcon size={17} /></span></div></article>; })}
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4"><h2 className="text-sm font-bold">AR Aging</h2><p className="mt-1 text-[10px] text-slate-500">Outstanding berdasarkan jumlah hari setelah due date.</p></div>
          <div className="grid gap-3 sm:grid-cols-5">
            {agingOrder.map((bucket) => {
              const amount = aging[bucket];
              const width = `${Math.max(4, (amount / maxAging) * 100)}%`;
              return <article key={bucket} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800"><div className="flex items-center justify-between"><strong className="text-xs">{bucket}</strong><span className="text-[9px] text-slate-400">{openBalances.filter((balance) => balance.agingBucket === bucket).length} inv</span></div><p className="mt-2 truncate text-sm font-bold">{rupiah(amount)}</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className={`h-full rounded-full ${bucket === 'Current' ? 'bg-blue-500' : bucket === '>90' ? 'bg-red-600' : 'bg-amber-500'}`} style={{ width }} /></div></article>;
            })}
          </div>
        </section>

        <aside className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2"><CalendarClock size={16} className="text-amber-500" /><h2 className="text-sm font-bold">Due ≤ 7 Hari</h2></div><p className="mt-1 text-[10px] text-slate-500">Invoice yang segera jatuh tempo.</p>
          <div className="mt-4 space-y-2">{upcoming.length === 0 ? <div className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500 dark:bg-slate-800">Tidak ada invoice yang jatuh tempo dalam 7 hari.</div> : upcoming.map((balance) => <div key={balance.invoice.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800"><div className="flex items-start justify-between gap-2"><div><strong className="block text-[11px]">{balance.invoice.invoiceNumber}</strong><span className="mt-1 block text-[9px] text-slate-500">{balance.invoice.clientName}</span></div><strong className="text-[10px] text-amber-600">{dateLabel(balance.invoice.dueDate)}</strong></div><p className="mt-2 text-xs font-bold">{rupiah(balance.outstanding)}</p></div>)}</div>
        </aside>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">
          <div><h2 className="text-sm font-bold">Invoice & Collection Register</h2><p className="mt-1 text-[10px] text-slate-500">Prioritas overdue ditampilkan paling atas.</p></div>
          <div className="flex flex-col gap-2 sm:flex-row"><label className="relative"><Search size={14} className="absolute left-3 top-2.5 text-slate-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari invoice, client, project..." className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 text-xs dark:border-slate-700 dark:bg-slate-950 sm:w-260px" /></label><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs dark:border-slate-700 dark:bg-slate-950"><option value="open">Open AR</option><option value="overdue">Overdue</option><option value="paid">Paid</option><option value="all">All</option></select></div>
        </div>
        {filtered.length === 0 ? <div className="p-10 text-center text-xs text-slate-500">Tidak ada invoice untuk filter ini.</div> : <div className="overflow-x-auto"><table className="w-full min-w-[1120px] text-left"><thead className="bg-slate-50 text-[9px] uppercase tracking-wide text-slate-400 dark:bg-slate-950/50"><tr><th className="px-4 py-2.5">Invoice</th><th className="px-4 py-2.5">Client / Project</th><th className="px-4 py-2.5">Invoice / Due</th><th className="px-4 py-2.5 text-right">Billed</th><th className="px-4 py-2.5 text-right">Paid</th><th className="px-4 py-2.5 text-right">Outstanding</th><th className="px-4 py-2.5">Aging</th><th className="px-4 py-2.5">Status</th><th className="px-4 py-2.5 text-right">Action</th></tr></thead><tbody className="divide-y divide-slate-100 text-[11px] dark:divide-slate-800">{filtered.map((balance) => <tr key={balance.invoice.id} className={balance.effectiveStatus === 'overdue' ? 'bg-red-50/30 dark:bg-red-500/5' : ''}><td className="px-4 py-3"><strong className="text-blue-600 dark:text-blue-300">{balance.invoice.invoiceNumber}</strong><span className="mt-0.5 block text-[9px] text-slate-500">{balance.invoice.period}</span></td><td className="px-4 py-3"><strong className="block">{balance.invoice.clientName}</strong><span className="mt-0.5 block text-[9px] text-slate-500">{balance.invoice.project} · {balance.invoice.site}</span></td><td className="px-4 py-3 text-slate-500"><span className="block">{dateLabel(balance.invoice.invoiceDate)}</span><span className={`mt-0.5 block text-[9px] ${balance.daysOverdue > 0 ? 'font-bold text-red-600' : ''}`}>Due {dateLabel(balance.invoice.dueDate)}</span></td><td className="px-4 py-3 text-right font-semibold">{rupiah(balance.invoice.total)}</td><td className="px-4 py-3 text-right text-emerald-600">{rupiah(balance.paid)}</td><td className="px-4 py-3 text-right font-bold">{rupiah(balance.outstanding)}</td><td className="px-4 py-3"><span className="font-semibold">{balance.agingBucket}</span>{balance.daysOverdue > 0 && <span className="mt-0.5 block text-[9px] text-red-600">{balance.daysOverdue} hari overdue</span>}</td><td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-[9px] font-bold ${statusTone[balance.effectiveStatus]}`}>{statusLabel[balance.effectiveStatus]}</span></td><td className="px-4 py-3 text-right">{balance.outstanding > 0 && !['draft', 'cancelled'].includes(balance.invoice.status) ? <button onClick={() => openPayment(balance)} className="rounded-lg bg-blue-600 px-3 py-2 text-[9px] font-bold text-white hover:bg-blue-700">Record Payment</button> : <span className="text-[9px] text-slate-400">—</span>}</td></tr>)}</tbody></table></div>}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800"><h2 className="text-sm font-bold">Payment Ledger</h2><p className="mt-1 text-[10px] text-slate-500">Riwayat pembayaran yang di-posting ke AR.</p></div>
        {paymentLedger.length === 0 ? <div className="p-8 text-center text-xs text-slate-500">Belum ada pembayaran tercatat.</div> : <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left"><thead className="bg-slate-50 text-[9px] uppercase tracking-wide text-slate-400 dark:bg-slate-950/50"><tr><th className="px-4 py-2.5">Date</th><th className="px-4 py-2.5">Invoice</th><th className="px-4 py-2.5">Reference</th><th className="px-4 py-2.5">Notes</th><th className="px-4 py-2.5 text-right">Amount</th></tr></thead><tbody className="divide-y divide-slate-100 text-[11px] dark:divide-slate-800">{paymentLedger.map((payment) => { const invoice = store.invoices.find((item) => item.id === payment.invoiceId); return <tr key={payment.id}><td className="px-4 py-3 text-slate-500">{dateLabel(payment.paymentDate)}</td><td className="px-4 py-3 font-bold text-blue-600 dark:text-blue-300">{invoice?.invoiceNumber || payment.invoiceId}</td><td className="px-4 py-3 text-slate-500">{payment.reference || '-'}</td><td className="px-4 py-3 text-slate-500">{payment.notes || '-'}</td><td className="px-4 py-3 text-right font-bold text-emerald-600">{rupiah(payment.amount)}</td></tr>; })}</tbody></table></div>}
      </section>

      {selected && <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm" onMouseDown={(e) => { if (e.target === e.currentTarget) setSelectedInvoiceId(null); }}><div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-wide text-blue-600">Record Payment</p><h3 className="mt-1 text-lg font-bold">{selected.invoice.invoiceNumber}</h3><p className="mt-1 text-xs text-slate-500">Outstanding {rupiah(selected.outstanding)} · {selected.invoice.clientName}</p></div><button onClick={() => setSelectedInvoiceId(null)} className="rounded-lg px-2 py-1 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">✕</button></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><label className="text-xs font-semibold">Payment Date<input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-950" /></label><label className="text-xs font-semibold">Amount<input type="number" min="0" max={selected.outstanding} value={paymentAmount} onChange={(e) => setPaymentAmount(Math.max(0, Number(e.target.value) || 0))} className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-950" /></label><label className="text-xs font-semibold sm:col-span-2">Bank / Payment Reference<input value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)} placeholder="Contoh: BI-FAST 123456 / Bank Ref" className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-950" /></label><label className="text-xs font-semibold sm:col-span-2">Notes<textarea value={paymentNotes} onChange={(e) => setPaymentNotes(e.target.value)} rows={2} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-950" /></label></div><div className="mt-5 flex justify-end gap-2"><button onClick={() => setSelectedInvoiceId(null)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold dark:border-slate-700">Cancel</button><button onClick={submitPayment} className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700">Post Payment</button></div></div></div>}
    </div>
  );
}
