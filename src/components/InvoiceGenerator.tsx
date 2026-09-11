import { useMemo, useState } from 'react';
import { jsPDF } from 'jspdf';
import {
  AlertTriangle,
  ArrowLeft,
  Download,
  FileText,
  Moon,
  Plus,
  Sun,
  Trash2,
} from 'lucide-react';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  clientName: string;
  clientAddress: string;
  clientPhone: string;
  clientEmail: string;
  items: InvoiceItem[];
  notes: string;
  paymentTerms: string;
  taxRate: number;
}

type Props = {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
};

const makeId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const today = () => new Date().toISOString().split('T')[0];
const plusDays = (days: number) => new Date(Date.now() + days * 86400000).toISOString().split('T')[0];
const rupiah = (value: number) => `Rp ${Math.round(value).toLocaleString('id-ID')}`;

export default function InvoiceGenerator({ onBack, darkMode, setDarkMode }: Props) {
  const [invoice, setInvoice] = useState<InvoiceData>({
    invoiceNumber: `INV-${Date.now()}`,
    date: today(),
    dueDate: plusDays(30),
    clientName: '',
    clientAddress: '',
    clientPhone: '',
    clientEmail: '',
    items: [],
    notes: '',
    paymentTerms: 'Net 30',
    taxRate: 11,
  });
  const [error, setError] = useState<string | null>(null);

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

  const subtotal = useMemo(() => invoice.items.reduce((sum, item) => sum + item.total, 0), [invoice.items]);
  const tax = useMemo(() => (subtotal * invoice.taxRate) / 100, [invoice.taxRate, subtotal]);
  const total = subtotal + tax;

  const addItem = () => {
    setInvoice((previous) => ({
      ...previous,
      items: [...previous.items, { id: makeId(), description: '', quantity: 1, unitPrice: 0, total: 0 }],
    }));
    setError(null);
  };

  const updateItem = (id: string, field: 'description' | 'quantity' | 'unitPrice', value: string | number) => {
    setInvoice((previous) => ({
      ...previous,
      items: previous.items.map((item) => {
        if (item.id !== id) return item;
        if (field === 'description') return { ...item, description: String(value) };
        if (field === 'quantity') {
          const quantity = Math.max(1, Math.floor(Number(value) || 1));
          return { ...item, quantity, total: quantity * item.unitPrice };
        }
        const unitPrice = Math.max(0, Number(value) || 0);
        return { ...item, unitPrice, total: item.quantity * unitPrice };
      }),
    }));
    setError(null);
  };

  const removeItem = (id: string) => {
    setInvoice((previous) => ({ ...previous, items: previous.items.filter((item) => item.id !== id) }));
  };

  const validateInvoice = () => {
    if (!invoice.invoiceNumber.trim()) return 'Nomor invoice wajib diisi.';
    if (!invoice.date || !invoice.dueDate) return 'Tanggal invoice dan jatuh tempo wajib diisi.';
    if (invoice.dueDate < invoice.date) return 'Tanggal jatuh tempo tidak boleh lebih awal dari tanggal invoice.';
    if (!invoice.clientName.trim()) return 'Nama klien wajib diisi.';
    if (invoice.clientEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invoice.clientEmail.trim())) return 'Format email klien tidak valid.';
    if (invoice.taxRate < 0 || invoice.taxRate > 100 || !Number.isFinite(invoice.taxRate)) return 'Tarif pajak harus berada di antara 0% dan 100%.';
    if (invoice.items.length === 0) return 'Tambahkan minimal satu item invoice.';
    if (invoice.items.some((item) => !item.description.trim())) return 'Setiap item wajib memiliki deskripsi.';
    if (invoice.items.some((item) => item.quantity < 1 || !Number.isFinite(item.quantity))) return 'Quantity item minimal 1.';
    if (invoice.items.some((item) => item.unitPrice < 0 || !Number.isFinite(item.unitPrice))) return 'Harga item tidak valid.';
    return null;
  };

  const generatePDF = () => {
    const validationError = validateInvoice();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const left = 18;
    const right = pageWidth - 18;
    const bottomLimit = pageHeight - 24;
    let y = 18;

    const addPage = () => {
      doc.addPage();
      y = 20;
    };

    const ensureSpace = (height: number) => {
      if (y + height > bottomLimit) addPage();
    };

    const drawTableHeader = () => {
      ensureSpace(12);
      doc.setFillColor(245, 247, 250);
      doc.rect(left, y - 4, right - left, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text('Description', left + 2, y + 1);
      doc.text('Qty', 124, y + 1, { align: 'right' });
      doc.text('Unit Price', 157, y + 1, { align: 'right' });
      doc.text('Total', right - 2, y + 1, { align: 'right' });
      y += 8;
    };

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(23);
    doc.setTextColor(15, 23, 42);
    doc.text('INVOICE', left, y);
    doc.setFontSize(10);
    doc.setTextColor(37, 99, 235);
    doc.text('PERADA GROUP', right, y, { align: 'right' });
    y += 11;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Invoice #: ${invoice.invoiceNumber.trim()}`, left, y);
    doc.text(`Date: ${invoice.date}`, right, y, { align: 'right' });
    y += 5;
    doc.text(`Payment Terms: ${invoice.paymentTerms}`, left, y);
    doc.text(`Due: ${invoice.dueDate}`, right, y, { align: 'right' });
    y += 8;
    doc.setDrawColor(226, 232, 240);
    doc.line(left, y, right, y);
    y += 9;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('BILL TO', left, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(invoice.clientName.trim(), left, y);
    y += 5;

    const addressLines = doc.splitTextToSize(invoice.clientAddress.trim() || '-', 105) as string[];
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    addressLines.slice(0, 4).forEach((line) => {
      doc.text(line, left, y);
      y += 4.5;
    });
    if (invoice.clientPhone.trim()) {
      doc.text(invoice.clientPhone.trim(), left, y);
      y += 4.5;
    }
    if (invoice.clientEmail.trim()) {
      doc.text(invoice.clientEmail.trim(), left, y);
      y += 4.5;
    }
    y += 5;

    drawTableHeader();

    invoice.items.forEach((item) => {
      const descriptionLines = doc.splitTextToSize(item.description.trim(), 88) as string[];
      const rowHeight = Math.max(8, descriptionLines.length * 4.2 + 4);
      if (y + rowHeight > bottomLimit) {
        addPage();
        drawTableHeader();
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      descriptionLines.forEach((line, index) => doc.text(line, left + 2, y + 3.5 + index * 4.2));
      doc.text(String(item.quantity), 124, y + 3.5, { align: 'right' });
      doc.text(rupiah(item.unitPrice), 157, y + 3.5, { align: 'right' });
      doc.text(rupiah(item.total), right - 2, y + 3.5, { align: 'right' });
      y += rowHeight;
      doc.setDrawColor(241, 245, 249);
      doc.line(left, y, right, y);
    });

    y += 6;
    ensureSpace(34);
    const totalsX = 137;
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text('Subtotal', totalsX, y);
    doc.setTextColor(15, 23, 42);
    doc.text(rupiah(subtotal), right, y, { align: 'right' });
    y += 6;
    doc.setTextColor(71, 85, 105);
    doc.text(`Tax (${invoice.taxRate}%)`, totalsX, y);
    doc.setTextColor(15, 23, 42);
    doc.text(rupiah(tax), right, y, { align: 'right' });
    y += 3;
    doc.setDrawColor(203, 213, 225);
    doc.line(totalsX, y, right, y);
    y += 7;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('TOTAL', totalsX, y);
    doc.setTextColor(37, 99, 235);
    doc.text(rupiah(total), right, y, { align: 'right' });
    y += 12;

    if (invoice.notes.trim()) {
      ensureSpace(14);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text('NOTES', left, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      const noteLines = doc.splitTextToSize(invoice.notes.trim(), right - left) as string[];
      noteLines.forEach((line) => {
        if (y + 5 > bottomLimit) addPage();
        doc.text(line, left, y);
        y += 4.5;
      });
    }

    const pages = doc.getNumberOfPages();
    for (let page = 1; page <= pages; page += 1) {
      doc.setPage(page);
      doc.setDrawColor(226, 232, 240);
      doc.line(left, pageHeight - 16, right, pageHeight - 16);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text('PERADA GROUP · PT Perdana Adi Yuda', left, pageHeight - 10);
      doc.text(`Page ${page} / ${pages}`, right, pageHeight - 10, { align: 'right' });
    }

    const safeName = invoice.invoiceNumber.trim().replace(/[^a-z0-9-_]/gi, '_');
    doc.save(`${safeName || 'invoice'}.pdf`);
  };

  return (
    <div className={`min-h-full ${bg} ${text}`}>
      <header className={`sticky top-0 z-20 flex items-center justify-between gap-3 px-4 py-3 border-b ${surface} ${border}`}>
        <div className="flex items-center gap-3 min-w-0">
          <button type="button" onClick={onBack} className={`w-9 h-9 rounded-lg inline-flex items-center justify-center ${hover}`} aria-label="Kembali">
            <ArrowLeft size={18} />
          </button>
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 inline-flex items-center justify-center shrink-0">
            <FileText size={20} />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold truncate">Invoice Generator</h1>
            <p className={`text-[11px] ${muted} truncate`}>Invoice profesional dengan validasi dan pagination PDF</p>
          </div>
        </div>
        <button type="button" onClick={() => setDarkMode(!darkMode)} className={`w-9 h-9 rounded-lg inline-flex items-center justify-center ${hover}`} aria-label="Ubah tema">
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-6 space-y-5">
        <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className={`text-[10px] font-bold tracking-[0.12em] uppercase ${muted}`}>Finance · Billing & Invoicing</p>
            <h2 className="text-2xl font-semibold mt-1">Buat Invoice</h2>
            <p className={`text-sm mt-1 ${muted}`}>Form ringkas dengan validasi tanggal, item, pajak, dan layout PDF multi-halaman.</p>
          </div>
          <button type="button" onClick={generatePDF} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1d4ed8]">
            <Download size={16} /> Generate PDF
          </button>
        </section>

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
            <AlertTriangle size={17} className="shrink-0 mt-0.5" />
            <p className="text-xs leading-5">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.5fr)_360px] gap-5 items-start">
          <div className="space-y-5">
            <section className={`rounded-2xl border p-4 md:p-5 ${surface} ${border}`}>
              <h3 className="text-sm font-semibold">Informasi Invoice</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                <label className="text-xs font-medium">Nomor Invoice *
                  <input value={invoice.invoiceNumber} onChange={(e) => setInvoice({ ...invoice, invoiceNumber: e.target.value })} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm ${input}`} />
                </label>
                <label className="text-xs font-medium">Payment Terms
                  <select value={invoice.paymentTerms} onChange={(e) => setInvoice({ ...invoice, paymentTerms: e.target.value })} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm ${input}`}>
                    <option value="Net 14">Net 14</option>
                    <option value="Net 30">Net 30</option>
                    <option value="Net 60">Net 60</option>
                    <option value="Net 90">Net 90</option>
                    <option value="COD">COD</option>
                  </select>
                </label>
                <label className="text-xs font-medium">Tanggal *
                  <input type="date" value={invoice.date} onChange={(e) => setInvoice({ ...invoice, date: e.target.value })} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm ${input}`} />
                </label>
                <label className="text-xs font-medium">Jatuh Tempo *
                  <input type="date" min={invoice.date} value={invoice.dueDate} onChange={(e) => setInvoice({ ...invoice, dueDate: e.target.value })} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm ${input}`} />
                </label>
              </div>
            </section>

            <section className={`rounded-2xl border p-4 md:p-5 ${surface} ${border}`}>
              <h3 className="text-sm font-semibold">Informasi Klien</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                <label className="text-xs font-medium">Nama Klien *
                  <input value={invoice.clientName} onChange={(e) => setInvoice({ ...invoice, clientName: e.target.value })} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm ${input}`} placeholder="PT Example" />
                </label>
                <label className="text-xs font-medium">Telepon
                  <input value={invoice.clientPhone} onChange={(e) => setInvoice({ ...invoice, clientPhone: e.target.value })} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm ${input}`} placeholder="021-12345678" />
                </label>
                <label className="text-xs font-medium md:col-span-2">Alamat
                  <textarea value={invoice.clientAddress} onChange={(e) => setInvoice({ ...invoice, clientAddress: e.target.value })} rows={2} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm resize-y ${input}`} placeholder="Alamat klien" />
                </label>
                <label className="text-xs font-medium md:col-span-2">Email
                  <input type="email" value={invoice.clientEmail} onChange={(e) => setInvoice({ ...invoice, clientEmail: e.target.value })} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm ${input}`} placeholder="finance@client.com" />
                </label>
              </div>
            </section>

            <section className={`rounded-2xl border ${surface} ${border} overflow-hidden`}>
              <div className={`flex items-center justify-between gap-3 px-4 md:px-5 py-4 border-b ${border}`}>
                <div>
                  <h3 className="text-sm font-semibold">Item Invoice</h3>
                  <p className={`text-[11px] mt-0.5 ${muted}`}>{invoice.items.length} item</p>
                </div>
                <button type="button" onClick={addItem} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"><Plus size={14} /> Tambah Item</button>
              </div>

              <div className="p-4 md:p-5 space-y-3">
                {invoice.items.length === 0 ? (
                  <div className={`rounded-xl border border-dashed p-8 text-center ${border}`}>
                    <FileText size={26} className={`mx-auto ${muted}`} />
                    <p className="text-sm font-semibold mt-3">Belum ada item</p>
                    <p className={`text-[11px] mt-1 ${muted}`}>Tambahkan minimal satu item sebelum membuat PDF.</p>
                  </div>
                ) : invoice.items.map((item, index) => (
                  <div key={item.id} className={`grid grid-cols-1 md:grid-cols-[36px_minmax(180px,1fr)_90px_150px_130px_36px] gap-2 items-end rounded-xl border p-3 ${surfaceMuted} ${border}`}>
                    <span className={`text-xs font-semibold self-center ${muted}`}>#{index + 1}</span>
                    <label className="text-[10px] font-medium">Deskripsi
                      <input value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} className={`mt-1 w-full rounded-lg border px-2.5 py-2 text-xs ${input}`} placeholder="Jasa / produk" />
                    </label>
                    <label className="text-[10px] font-medium">Qty
                      <input type="number" min={1} step={1} value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', e.target.value)} className={`mt-1 w-full rounded-lg border px-2.5 py-2 text-xs ${input}`} />
                    </label>
                    <label className="text-[10px] font-medium">Harga Satuan
                      <input type="number" min={0} step={1000} value={item.unitPrice} onChange={(e) => updateItem(item.id, 'unitPrice', e.target.value)} className={`mt-1 w-full rounded-lg border px-2.5 py-2 text-xs ${input}`} />
                    </label>
                    <div>
                      <p className={`text-[10px] font-medium ${muted}`}>Total</p>
                      <p className="text-xs font-semibold mt-2">{rupiah(item.total)}</p>
                    </div>
                    <button type="button" onClick={() => removeItem(item.id)} className="w-9 h-9 rounded-lg inline-flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30" aria-label="Hapus item"><Trash2 size={15} /></button>
                  </div>
                ))}
              </div>
            </section>

            <section className={`rounded-2xl border p-4 md:p-5 ${surface} ${border}`}>
              <h3 className="text-sm font-semibold">Catatan</h3>
              <textarea value={invoice.notes} onChange={(e) => setInvoice({ ...invoice, notes: e.target.value })} rows={4} className={`mt-3 w-full rounded-lg border px-3 py-2.5 text-sm resize-y ${input}`} placeholder="Catatan pembayaran atau informasi tambahan" />
            </section>
          </div>

          <aside className={`xl:sticky xl:top-[88px] rounded-2xl border p-4 md:p-5 ${surface} ${border}`}>
            <p className={`text-[10px] font-bold tracking-[0.12em] uppercase ${muted}`}>Invoice Summary</p>
            <div className="space-y-3 mt-4">
              <div className="flex items-center justify-between text-sm"><span className={muted}>Subtotal</span><strong>{rupiah(subtotal)}</strong></div>
              <label className="flex items-center justify-between gap-4 text-sm">
                <span className={muted}>Pajak</span>
                <span className="flex items-center gap-1">
                  <input type="number" min={0} max={100} step={0.1} value={invoice.taxRate} onChange={(e) => setInvoice({ ...invoice, taxRate: Math.min(100, Math.max(0, Number(e.target.value) || 0)) })} className={`w-20 rounded-lg border px-2 py-1.5 text-right text-xs ${input}`} />
                  <span className={muted}>%</span>
                </span>
              </label>
              <div className="flex items-center justify-between text-sm"><span className={muted}>Nilai Pajak</span><strong>{rupiah(tax)}</strong></div>
              <div className={`border-t pt-4 ${border}`}>
                <div className="flex items-end justify-between gap-3"><span className="text-sm font-semibold">Total</span><strong className="text-xl text-[#2563eb]">{rupiah(total)}</strong></div>
              </div>
            </div>
            <div className={`mt-5 rounded-xl p-3 ${surfaceMuted}`}>
              <p className={`text-[10px] uppercase tracking-wide ${muted}`}>Output</p>
              <p className="text-xs font-medium mt-1">A4 PDF · multi-page safe</p>
              <p className={`text-[10px] mt-1 leading-4 ${muted}`}>Deskripsi panjang dan banyak item akan otomatis dipaginasi agar tidak terpotong.</p>
            </div>
            <button type="button" onClick={generatePDF} className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1d4ed8]"><Download size={16} /> Generate PDF</button>
          </aside>
        </div>
      </main>
    </div>
  );
}
