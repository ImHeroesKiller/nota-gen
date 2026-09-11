import { useEffect, useMemo, useState } from 'react';

export type PhlInvoiceStatus = 'draft' | 'issued' | 'partially_paid' | 'paid' | 'cancelled';

export interface PhlInvoice {
  id: string;
  invoiceNumber: string;
  period: string;
  project: string;
  site: string;
  clientName: string;
  clientReference: string;
  invoiceDate: string;
  dueDate: string;
  termsDays: number;
  workerCount: number;
  paidDays: number;
  payrollBase: number;
  managementFeeRate: number;
  managementFee: number;
  reimbursable: number;
  otherCharges: number;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: PhlInvoiceStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
  issuedAt?: string;
}

export interface PhlArPayment {
  id: string;
  invoiceId: string;
  paymentDate: string;
  amount: number;
  reference: string;
  notes: string;
  createdAt: string;
}

export interface PhlBillingArStore {
  invoices: PhlInvoice[];
  payments: PhlArPayment[];
}

export interface InvoiceBalance {
  invoice: PhlInvoice;
  paid: number;
  outstanding: number;
  effectiveStatus: PhlInvoiceStatus | 'overdue';
  daysOverdue: number;
  agingBucket: 'Current' | '1-30' | '31-60' | '61-90' | '>90';
}

const STORAGE_KEY = 'perada-phl-billing-ar-v1';
const CHANGE_EVENT = 'perada-phl-billing-ar-change';

const emptyStore = (): PhlBillingArStore => ({ invoices: [], payments: [] });
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

export const readPhlBillingAr = (): PhlBillingArStore => {
  if (typeof window === 'undefined') return emptyStore();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as PhlBillingArStore;
    if (!Array.isArray(parsed.invoices) || !Array.isArray(parsed.payments)) return emptyStore();
    return parsed;
  } catch {
    return emptyStore();
  }
};

export const writePhlBillingAr = (store: PhlBillingArStore) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
};

const parseSequence = (invoiceNumber: string, year: number) => {
  const match = invoiceNumber.match(/^PHL-INV\/(\d{4})\/PAY\/(\d{2})\/(\d{4})$/);
  if (!match || Number(match[3]) !== year) return 0;
  return Number(match[1]) || 0;
};

export const generatePhlInvoiceNumber = (
  invoices: PhlInvoice[],
  invoiceDate: string,
) => {
  const date = new Date(`${invoiceDate}T00:00:00`);
  const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;
  const year = safeDate.getFullYear();
  const month = String(safeDate.getMonth() + 1).padStart(2, '0');
  const maxSequence = invoices.reduce(
    (max, invoice) => Math.max(max, parseSequence(invoice.invoiceNumber, year)),
    0,
  );
  return `PHL-INV/${String(maxSequence + 1).padStart(4, '0')}/PAY/${month}/${year}`;
};

export const addDays = (dateValue: string, days: number) => {
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateValue;
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

export const getInvoicePaidAmount = (
  invoiceId: string,
  payments: PhlArPayment[],
) => payments
  .filter((payment) => payment.invoiceId === invoiceId)
  .reduce((sum, payment) => sum + payment.amount, 0);

export const getInvoiceBalance = (
  invoice: PhlInvoice,
  payments: PhlArPayment[],
  asOf = new Date(),
): InvoiceBalance => {
  const paid = Math.min(invoice.total, getInvoicePaidAmount(invoice.id, payments));
  const outstanding = Math.max(0, invoice.total - paid);
  const due = new Date(`${invoice.dueDate}T23:59:59`);
  const today = new Date(asOf.getFullYear(), asOf.getMonth(), asOf.getDate(), 23, 59, 59);
  const rawDaysOverdue = Math.floor((today.getTime() - due.getTime()) / 86400000);
  const daysOverdue = outstanding > 0 && rawDaysOverdue > 0 ? rawDaysOverdue : 0;

  let effectiveStatus: InvoiceBalance['effectiveStatus'] = invoice.status;
  if (invoice.status !== 'cancelled' && invoice.status !== 'draft') {
    if (outstanding <= 0) effectiveStatus = 'paid';
    else if (daysOverdue > 0) effectiveStatus = 'overdue';
    else if (paid > 0) effectiveStatus = 'partially_paid';
    else effectiveStatus = 'issued';
  }

  const agingBucket: InvoiceBalance['agingBucket'] = daysOverdue === 0
    ? 'Current'
    : daysOverdue <= 30
      ? '1-30'
      : daysOverdue <= 60
        ? '31-60'
        : daysOverdue <= 90
          ? '61-90'
          : '>90';

  return { invoice, paid, outstanding, effectiveStatus, daysOverdue, agingBucket };
};

export const usePhlBillingAr = () => {
  const [store, setStore] = useState<PhlBillingArStore>(() => readPhlBillingAr());

  useEffect(() => {
    const sync = () => setStore(readPhlBillingAr());
    window.addEventListener('storage', sync);
    window.addEventListener(CHANGE_EVENT, sync as EventListener);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(CHANGE_EVENT, sync as EventListener);
    };
  }, []);

  const commit = (updater: (current: PhlBillingArStore) => PhlBillingArStore) => {
    const next = updater(readPhlBillingAr());
    writePhlBillingAr(next);
    setStore(next);
    return next;
  };

  const createInvoice = (invoice: PhlInvoice) => {
    commit((current) => ({ ...current, invoices: [invoice, ...current.invoices] }));
  };

  const updateInvoice = (id: string, patch: Partial<PhlInvoice>) => {
    commit((current) => ({
      ...current,
      invoices: current.invoices.map((invoice) => invoice.id === id
        ? { ...invoice, ...patch, updatedAt: new Date().toISOString() }
        : invoice),
    }));
  };

  const issueInvoice = (id: string) => {
    const now = new Date().toISOString();
    updateInvoice(id, { status: 'issued', issuedAt: now });
  };

  const cancelInvoice = (id: string) => updateInvoice(id, { status: 'cancelled' });

  const recordPayment = (payment: PhlArPayment) => {
    const next = commit((current) => ({
      ...current,
      payments: [payment, ...current.payments],
    }));
    const invoice = next.invoices.find((item) => item.id === payment.invoiceId);
    if (!invoice || invoice.status === 'cancelled') return;
    const paid = getInvoicePaidAmount(invoice.id, next.payments);
    updateInvoice(invoice.id, { status: paid >= invoice.total ? 'paid' : 'partially_paid' });
  };

  const balances = useMemo(
    () => store.invoices.map((invoice) => getInvoiceBalance(invoice, store.payments)),
    [store.invoices, store.payments],
  );

  return {
    store: clone(store),
    balances,
    createInvoice,
    updateInvoice,
    issueInvoice,
    cancelInvoice,
    recordPayment,
  };
};
