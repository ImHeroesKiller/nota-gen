import { useState } from 'react';
import { jsPDF } from 'jspdf';

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

export default function InvoiceGenerator({ onBack, darkMode, setDarkMode }: any) {
  const [invoice, setInvoice] = useState<InvoiceData>({
    invoiceNumber: `INV-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    clientName: '',
    clientAddress: '',
    clientPhone: '',
    clientEmail: '',
    items: [],
    notes: '',
    paymentTerms: 'Net 30',
    taxRate: 11,
  });

  const bg = darkMode ? 'bg-[#0f1419]' : 'bg-[#f8f9fb]';
  const sidebarBg = darkMode ? 'bg-[#161b22]' : 'bg-white';
  const borderColor = darkMode ? 'border-[#21262d]' : 'border-[#e2e5e9]';
  const cardBg = darkMode ? 'bg-[#1c2128]' : 'bg-[#f3f4f6]';
  const textPrimary = darkMode ? 'text-[#e6edf3]' : 'text-[#1a1a2e]';
  const textSecondary = darkMode ? 'text-[#8b949e]' : 'text-[#57606a]';
  const inputBg = darkMode ? 'bg-[#0d1117] border-[#30363d]' : 'bg-white border-[#d0d7de]';
  const hoverBg = darkMode ? 'hover:bg-[#21262d]' : 'hover:bg-[#f0f1f3]';

  const addItem = () => {
    setInvoice({
      ...invoice,
      items: [
        ...invoice.items,
        {
          id: Date.now().toString(),
          description: '',
          quantity: 1,
          unitPrice: 0,
          total: 0,
        },
      ],
    });
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    const updatedItems = invoice.items.map((item) => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updated.total = updated.quantity * updated.unitPrice;
        }
        return updated;
      }
      return item;
    });
    setInvoice({ ...invoice, items: updatedItems });
  };

  const removeItem = (id: string) => {
    setInvoice({
      ...invoice,
      items: invoice.items.filter((item) => item.id !== id),
    });
  };

  const subtotal = invoice.items.reduce((sum, item) => sum + item.total, 0);
  const tax = (subtotal * invoice.taxRate) / 100;
  const total = subtotal + tax;

  const generatePDF = () => {
    const doc = new jsPDF();
    let y = 20;

    // Header
    doc.setFontSize(24);
    doc.setTextColor(10, 37, 64);
    doc.text('INVOICE', 20, y);
    y += 10;

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Invoice #: ${invoice.invoiceNumber}`, 20, y);
    y += 5;
    doc.text(`Date: ${invoice.date}`, 20, y);
    y += 5;
    doc.text(`Due Date: ${invoice.dueDate}`, 20, y);
    y += 15;

    // Client Info
    doc.setFontSize(12);
    doc.setTextColor(10, 37, 64);
    doc.text('Bill To:', 20, y);
    y += 7;
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(invoice.clientName || '-', 20, y);
    y += 5;
    doc.text(invoice.clientAddress || '-', 20, y);
    y += 5;
    doc.text(invoice.clientPhone || '-', 20, y);
    y += 5;
    doc.text(invoice.clientEmail || '-', 20, y);
    y += 15;

    // Items Table
    doc.setFontSize(10);
    doc.setTextColor(10, 37, 64);
    doc.text('Description', 20, y);
    doc.text('Qty', 120, y);
    doc.text('Unit Price', 140, y);
    doc.text('Total', 170, y);
    y += 2;
    doc.setLineWidth(0.5);
    doc.line(20, y, 190, y);
    y += 5;

    doc.setTextColor(0);
    invoice.items.forEach((item) => {
      doc.text(item.description || '-', 20, y);
      doc.text(item.quantity.toString(), 120, y);
      doc.text(`Rp ${item.unitPrice.toLocaleString('id-ID')}`, 140, y);
      doc.text(`Rp ${item.total.toLocaleString('id-ID')}`, 170, y);
      y += 7;
    });

    y += 5;
    doc.line(20, y, 190, y);
    y += 7;

    // Totals
    doc.text('Subtotal:', 140, y);
    doc.text(`Rp ${subtotal.toLocaleString('id-ID')}`, 170, y);
    y += 7;
    doc.text(`Tax (${invoice.taxRate}%):`, 140, y);
    doc.text(`Rp ${tax.toLocaleString('id-ID')}`, 170, y);
    y += 2;
    doc.setLineWidth(0.5);
    doc.line(140, y, 190, y);
    y += 7;
    doc.setFontSize(12);
    doc.setTextColor(10, 37, 64);
    doc.text('Total:', 140, y);
    doc.text(`Rp ${total.toLocaleString('id-ID')}`, 170, y);
    y += 15;

    // Notes
    if (invoice.notes) {
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('Notes:', 20, y);
      y += 5;
      doc.setTextColor(0);
      const lines = doc.splitTextToSize(invoice.notes, 170);
      doc.text(lines, 20, y);
      y += lines.length * 5;
    }

    // Payment Terms
    y += 5;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Payment Terms:', 20, y);
    y += 5;
    doc.setTextColor(0);
    doc.text(invoice.paymentTerms, 20, y);

    // Footer
    y = 280;
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('PERADA GROUP - PT Perdana Adi Yuda', 20, y);
    doc.text('perada.net', 20, y + 4);

    doc.save(`${invoice.invoiceNumber}.pdf`);
  };

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${bg} ${textPrimary}`}>
      <header className={`flex items-center justify-between px-4 py-2.5 border-b shrink-0 ${sidebarBg} ${borderColor}`}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className={`w-7 h-7 rounded-lg flex items-center justify-center ${hoverBg}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center shadow-sm">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight">Invoice Generator</h1>
            <p className={`text-[10px] ${textSecondary}`}>Buat invoice profesional</p>
          </div>
        </div>
        <button onClick={() => setDarkMode(!darkMode)} className={`w-8 h-8 rounded-lg flex items-center justify-center ${hoverBg}`}>
          {darkMode ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          )}
        </button>
      </header>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Invoice Info */}
          <div className={`rounded-xl border p-4 ${borderColor} ${sidebarBg}`}>
            <h3 className={`text-xs font-semibold uppercase tracking-wider ${textSecondary} mb-3`}>Invoice Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Invoice Number</label>
                <input
                  value={invoice.invoiceNumber}
                  onChange={(e) => setInvoice({ ...invoice, invoiceNumber: e.target.value })}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`}
                />
              </div>
              <div>
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Date</label>
                <input
                  type="date"
                  value={invoice.date}
                  onChange={(e) => setInvoice({ ...invoice, date: e.target.value })}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`}
                />
              </div>
              <div>
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Due Date</label>
                <input
                  type="date"
                  value={invoice.dueDate}
                  onChange={(e) => setInvoice({ ...invoice, dueDate: e.target.value })}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`}
                />
              </div>
              <div>
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Payment Terms</label>
                <select
                  value={invoice.paymentTerms}
                  onChange={(e) => setInvoice({ ...invoice, paymentTerms: e.target.value })}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`}
                >
                  <option value="Net 30">Net 30</option>
                  <option value="Net 60">Net 60</option>
                  <option value="Net 90">Net 90</option>
                  <option value="COD">COD</option>
                </select>
              </div>
            </div>
          </div>

          {/* Client Info */}
          <div className={`rounded-xl border p-4 ${borderColor} ${sidebarBg}`}>
            <h3 className={`text-xs font-semibold uppercase tracking-wider ${textSecondary} mb-3`}>Client Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Client Name</label>
                <input
                  value={invoice.clientName}
                  onChange={(e) => setInvoice({ ...invoice, clientName: e.target.value })}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`}
                  placeholder="PT Example"
                />
              </div>
              <div>
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Phone</label>
                <input
                  value={invoice.clientPhone}
                  onChange={(e) => setInvoice({ ...invoice, clientPhone: e.target.value })}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`}
                  placeholder="021-12345678"
                />
              </div>
              <div className="col-span-2">
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Address</label>
                <input
                  value={invoice.clientAddress}
                  onChange={(e) => setInvoice({ ...invoice, clientAddress: e.target.value })}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`}
                  placeholder="Jl. Example No. 123, Jakarta"
                />
              </div>
              <div className="col-span-2">
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Email</label>
                <input
                  type="email"
                  value={invoice.clientEmail}
                  onChange={(e) => setInvoice({ ...invoice, clientEmail: e.target.value })}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`}
                  placeholder="client@example.com"
                />
              </div>
            </div>
          </div>

          {/* Items */}
          <div className={`rounded-xl border p-4 ${borderColor} ${sidebarBg}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>Items</h3>
              <button
                onClick={addItem}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-600 hover:bg-green-700 text-white"
              >
                + Add Item
              </button>
            </div>

            {invoice.items.length === 0 ? (
              <div className={`text-center py-8 ${textSecondary}`}>
                <p className="text-sm">Belum ada item</p>
                <p className="text-xs mt-1">Klik "Add Item" untuk menambahkan</p>
              </div>
            ) : (
              <div className="space-y-2">
                {invoice.items.map((item, index) => (
                  <div key={item.id} className={`grid grid-cols-12 gap-2 p-2 rounded-lg ${cardBg}`}>
                    <div className="col-span-5">
                      <input
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        placeholder="Description"
                        className={`w-full px-2 py-1 rounded text-xs border ${inputBg} ${textPrimary}`}
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                        placeholder="Qty"
                        className={`w-full px-2 py-1 rounded text-xs border ${inputBg} ${textPrimary}`}
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                        placeholder="Price"
                        className={`w-full px-2 py-1 rounded text-xs border ${inputBg} ${textPrimary}`}
                      />
                    </div>
                    <div className="col-span-2 flex items-center">
                      <span className={`text-xs font-medium ${textPrimary}`}>
                        Rp {item.total.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="col-span-1 flex items-center justify-end">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Totals */}
            {invoice.items.length > 0 && (
              <div className={`mt-4 pt-4 border-t ${borderColor}`}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <label className={`text-[10px] ${textSecondary} block mb-1`}>Tax Rate (%)</label>
                    <input
                      type="number"
                      value={invoice.taxRate}
                      onChange={(e) => setInvoice({ ...invoice, taxRate: Number(e.target.value) })}
                      className={`w-20 px-2 py-1 rounded text-xs border ${inputBg} ${textPrimary}`}
                    />
                  </div>
                </div>
                <div className={`space-y-1 text-sm ${textPrimary}`}>
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax ({invoice.taxRate}%):</span>
                    <span>Rp {tax.toLocaleString('id-ID')}</span>
                  </div>
                  <div className={`flex justify-between pt-2 border-t ${borderColor} font-bold text-base`}>
                    <span>Total:</span>
                    <span className="text-green-600">Rp {total.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className={`rounded-xl border p-4 ${borderColor} ${sidebarBg}`}>
            <label className={`text-xs font-semibold uppercase tracking-wider ${textSecondary} block mb-2`}>Notes</label>
            <textarea
              value={invoice.notes}
              onChange={(e) => setInvoice({ ...invoice, notes: e.target.value })}
              rows={3}
              className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`}
              placeholder="Additional notes..."
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={generatePDF}
            disabled={invoice.items.length === 0}
            className="w-full py-3 rounded-lg text-sm font-medium bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate Invoice PDF
          </button>
        </div>
      </div>

      <footer className={`px-4 py-2 border-t shrink-0 flex items-center justify-between ${sidebarBg} ${borderColor}`}>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#0A2540] flex items-center justify-center">
            <span className="text-white text-[6px] font-bold">PA</span>
          </div>
          <span className={`text-[10px] ${textSecondary}`}>
            <span className="font-medium text-[#0A2540] dark:text-[#58a6ff]">PT Perdana Adi Yuda</span> — PERADA GROUP
          </span>
        </div>
        <span className={`text-[10px] ${textSecondary}`}>© 2026</span>
      </footer>
    </div>
  );
}
