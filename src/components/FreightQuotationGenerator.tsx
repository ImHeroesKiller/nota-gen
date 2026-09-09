import { useState } from 'react';
import { jsPDF } from 'jspdf';

interface FreightQuotationGeneratorProps {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

interface QuotationItem {
  id: number;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
}

export default function FreightQuotationGenerator({ onBack, darkMode, setDarkMode }: FreightQuotationGeneratorProps) {
  const [quotationData, setQuotationData] = useState({
    quotationNumber: `QT-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    clientName: '',
    clientAddress: '',
    clientPhone: '',
    clientEmail: '',
    origin: '',
    destination: '',
    shippingMode: 'Sea Freight',
    transitTime: '',
    items: [] as QuotationItem[],
    notes: '',
    paymentTerms: '50% in advance, 50% before delivery',
    preparedBy: '',
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
    setQuotationData({
      ...quotationData,
      items: [...quotationData.items, { id: Date.now(), description: '', quantity: 1, unit: 'Unit', rate: 0, amount: 0 }],
    });
  };

  const updateItem = (id: number, field: keyof QuotationItem, value: any) => {
    const updatedItems = quotationData.items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'rate') {
          updated.amount = updated.quantity * updated.rate;
        }
        return updated;
      }
      return item;
    });
    setQuotationData({ ...quotationData, items: updatedItems });
  };

  const removeItem = (id: number) => {
    setQuotationData({ ...quotationData, items: quotationData.items.filter(item => item.id !== id) });
  };

  const subtotal = quotationData.items.reduce((sum, item) => sum + item.amount, 0);
  const tax = subtotal * 0.11;
  const total = subtotal + tax;

  const generatePDF = () => {
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(24);
    doc.setTextColor(10, 37, 64);
    doc.text('FREIGHT QUOTATION', 20, y);
    y += 10;

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Quotation No.: ${quotationData.quotationNumber}`, 20, y);
    y += 5;
    doc.text(`Date: ${quotationData.date}`, 20, y);
    y += 5;
    doc.text(`Valid Until: ${quotationData.validUntil}`, 20, y);
    y += 15;

    doc.setFontSize(12);
    doc.setTextColor(10, 37, 64);
    doc.text('Client:', 20, y);
    y += 7;
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(quotationData.clientName || '-', 20, y);
    y += 5;
    doc.text(quotationData.clientAddress || '-', 20, y);
    y += 5;
    doc.text(quotationData.clientPhone || '-', 20, y);
    y += 5;
    doc.text(quotationData.clientEmail || '-', 20, y);
    y += 15;

    doc.setFontSize(10);
    doc.setTextColor(10, 37, 64);
    doc.text('Shipping Details:', 20, y);
    y += 7;
    doc.setTextColor(0);
    doc.text(`Origin: ${quotationData.origin || '-'}`, 20, y);
    y += 5;
    doc.text(`Destination: ${quotationData.destination || '-'}`, 20, y);
    y += 5;
    doc.text(`Shipping Mode: ${quotationData.shippingMode}`, 20, y);
    y += 5;
    doc.text(`Transit Time: ${quotationData.transitTime || '-'}`, 20, y);
    y += 15;

    doc.setTextColor(10, 37, 64);
    doc.text('Description', 20, y);
    doc.text('Qty', 110, y);
    doc.text('Unit', 130, y);
    doc.text('Rate', 150, y);
    doc.text('Amount', 175, y);
    y += 2;
    doc.setLineWidth(0.5);
    doc.line(20, y, 190, y);
    y += 5;

    doc.setTextColor(0);
    quotationData.items.forEach(item => {
      doc.text(item.description || '-', 20, y);
      doc.text(item.quantity.toString(), 110, y);
      doc.text(item.unit, 130, y);
      doc.text(`Rp ${item.rate.toLocaleString('id-ID')}`, 150, y);
      doc.text(`Rp ${item.amount.toLocaleString('id-ID')}`, 175, y);
      y += 7;
    });

    y += 5;
    doc.line(20, y, 190, y);
    y += 7;

    doc.text('Subtotal:', 140, y);
    doc.text(`Rp ${subtotal.toLocaleString('id-ID')}`, 175, y);
    y += 7;
    doc.text('Tax (11%):', 140, y);
    doc.text(`Rp ${tax.toLocaleString('id-ID')}`, 175, y);
    y += 2;
    doc.setLineWidth(0.5);
    doc.line(140, y, 190, y);
    y += 7;
    doc.setFontSize(12);
    doc.setTextColor(10, 37, 64);
    doc.text('Total:', 140, y);
    doc.text(`Rp ${total.toLocaleString('id-ID')}`, 175, y);
    y += 15;

    if (quotationData.notes) {
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('Notes:', 20, y);
      y += 5;
      doc.setTextColor(0);
      const lines = doc.splitTextToSize(quotationData.notes, 170);
      doc.text(lines, 20, y);
      y += lines.length * 5;
    }

    y += 5;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Payment Terms:', 20, y);
    y += 5;
    doc.setTextColor(0);
    doc.text(quotationData.paymentTerms, 20, y);
    y += 15;

    if (quotationData.preparedBy) {
      doc.setLineWidth(0.3);
      doc.line(20, y, 80, y);
      y += 5;
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text('Prepared by:', 20, y);
      doc.setTextColor(0);
      doc.text(quotationData.preparedBy, 20, y + 4);
    }

    y = 280;
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('PERADA GROUP - PT Perdana Adi Yuda', 20, y);
    doc.text('perada.net', 20, y + 4);

    doc.save(`${quotationData.quotationNumber}.pdf`);
  };

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${bg} ${textPrimary}`}>
      <header className={`flex items-center justify-between px-4 py-2.5 border-b shrink-0 ${sidebarBg} ${borderColor}`}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className={`w-7 h-7 rounded-lg flex items-center justify-center ${hoverBg}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight">Freight Quotation Generator</h1>
            <p className={`text-[10px] ${textSecondary}`}>Buat quotation pengiriman profesional</p>
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
          <div className={`rounded-xl border p-4 ${borderColor} ${sidebarBg}`}>
            <h3 className={`text-xs font-semibold uppercase tracking-wider ${textSecondary} mb-3`}>Quotation Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Quotation Number</label>
                <input value={quotationData.quotationNumber} onChange={e => setQuotationData({ ...quotationData, quotationNumber: e.target.value })} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`} />
              </div>
              <div>
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Date</label>
                <input type="date" value={quotationData.date} onChange={e => setQuotationData({ ...quotationData, date: e.target.value })} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`} />
              </div>
              <div className="col-span-2">
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Valid Until</label>
                <input type="date" value={quotationData.validUntil} onChange={e => setQuotationData({ ...quotationData, validUntil: e.target.value })} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`} />
              </div>
            </div>
          </div>

          <div className={`rounded-xl border p-4 ${borderColor} ${sidebarBg}`}>
            <h3 className={`text-xs font-semibold uppercase tracking-wider ${textSecondary} mb-3`}>Client Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Client Name</label>
                <input value={quotationData.clientName} onChange={e => setQuotationData({ ...quotationData, clientName: e.target.value })} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`} placeholder="PT Client" />
              </div>
              <div className="col-span-2">
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Client Address</label>
                <input value={quotationData.clientAddress} onChange={e => setQuotationData({ ...quotationData, clientAddress: e.target.value })} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`} placeholder="Jl. Example No. 123, Jakarta" />
              </div>
              <div>
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Phone</label>
                <input value={quotationData.clientPhone} onChange={e => setQuotationData({ ...quotationData, clientPhone: e.target.value })} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`} placeholder="021-12345678" />
              </div>
              <div>
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Email</label>
                <input type="email" value={quotationData.clientEmail} onChange={e => setQuotationData({ ...quotationData, clientEmail: e.target.value })} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`} placeholder="client@example.com" />
              </div>
            </div>
          </div>

          <div className={`rounded-xl border p-4 ${borderColor} ${sidebarBg}`}>
            <h3 className={`text-xs font-semibold uppercase tracking-wider ${textSecondary} mb-3`}>Shipping Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Origin</label>
                <input value={quotationData.origin} onChange={e => setQuotationData({ ...quotationData, origin: e.target.value })} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`} placeholder="Jakarta" />
              </div>
              <div>
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Destination</label>
                <input value={quotationData.destination} onChange={e => setQuotationData({ ...quotationData, destination: e.target.value })} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`} placeholder="Surabaya" />
              </div>
              <div>
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Shipping Mode</label>
                <select value={quotationData.shippingMode} onChange={e => setQuotationData({ ...quotationData, shippingMode: e.target.value })} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`}>
                  <option value="Sea Freight">Sea Freight</option>
                  <option value="Air Freight">Air Freight</option>
                  <option value="Land Freight">Land Freight</option>
                  <option value="Multimodal">Multimodal</option>
                </select>
              </div>
              <div>
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Transit Time</label>
                <input value={quotationData.transitTime} onChange={e => setQuotationData({ ...quotationData, transitTime: e.target.value })} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`} placeholder="5-7 days" />
              </div>
            </div>
          </div>

          <div className={`rounded-xl border p-4 ${borderColor} ${sidebarBg}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>Charges</h3>
              <button onClick={addItem} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white">+ Add Charge</button>
            </div>

            {quotationData.items.length === 0 ? (
              <div className={`text-center py-8 ${textSecondary}`}>
                <p className="text-sm">Belum ada charges</p>
                <p className="text-xs mt-1">Klik "Add Charge" untuk menambahkan</p>
              </div>
            ) : (
              <div className="space-y-2">
                {quotationData.items.map(item => (
                  <div key={item.id} className={`grid grid-cols-12 gap-2 p-2 rounded-lg ${cardBg}`}>
                    <div className="col-span-4">
                      <input value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)} placeholder="Description" className={`w-full px-2 py-1 rounded text-xs border ${inputBg} ${textPrimary}`} />
                    </div>
                    <div className="col-span-1">
                      <input type="number" value={item.quantity} onChange={e => updateItem(item.id, 'quantity', Number(e.target.value))} placeholder="Qty" className={`w-full px-2 py-1 rounded text-xs border ${inputBg} ${textPrimary}`} />
                    </div>
                    <div className="col-span-2">
                      <input value={item.unit} onChange={e => updateItem(item.id, 'unit', e.target.value)} placeholder="Unit" className={`w-full px-2 py-1 rounded text-xs border ${inputBg} ${textPrimary}`} />
                    </div>
                    <div className="col-span-2">
                      <input type="number" value={item.rate} onChange={e => updateItem(item.id, 'rate', Number(e.target.value))} placeholder="Rate" className={`w-full px-2 py-1 rounded text-xs border ${inputBg} ${textPrimary}`} />
                    </div>
                    <div className="col-span-2 flex items-center">
                      <span className={`text-xs font-medium ${textPrimary}`}>Rp {item.amount.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="col-span-1 flex items-center justify-end">
                      <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {quotationData.items.length > 0 && (
              <div className={`mt-4 pt-4 border-t ${borderColor}`}>
                <div className={`space-y-1 text-sm ${textPrimary}`}>
                  <div className="flex justify-between"><span>Subtotal:</span><span>Rp {subtotal.toLocaleString('id-ID')}</span></div>
                  <div className="flex justify-between"><span>Tax (11%):</span><span>Rp {tax.toLocaleString('id-ID')}</span></div>
                  <div className={`flex justify-between pt-2 border-t ${borderColor} font-bold text-base`}>
                    <span>Total:</span><span className="text-indigo-600">Rp {total.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className={`rounded-xl border p-4 ${borderColor} ${sidebarBg}`}>
            <label className={`text-xs font-semibold uppercase tracking-wider ${textSecondary} block mb-2`}>Notes</label>
            <textarea value={quotationData.notes} onChange={e => setQuotationData({ ...quotationData, notes: e.target.value })} rows={3} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`} placeholder="Additional notes..." />
          </div>

          <div className={`rounded-xl border p-4 ${borderColor} ${sidebarBg}`}>
            <h3 className={`text-xs font-semibold uppercase tracking-wider ${textSecondary} mb-3`}>Additional Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Payment Terms</label>
                <input value={quotationData.paymentTerms} onChange={e => setQuotationData({ ...quotationData, paymentTerms: e.target.value })} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`} />
              </div>
              <div className="col-span-2">
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Prepared By</label>
                <input value={quotationData.preparedBy} onChange={e => setQuotationData({ ...quotationData, preparedBy: e.target.value })} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`} placeholder="Name of preparer" />
              </div>
            </div>
          </div>

          <button onClick={generatePDF} disabled={quotationData.items.length === 0} className="w-full py-3 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed">
            Generate Freight Quotation PDF
          </button>
        </div>
      </div>

      <footer className={`px-4 py-2 border-t shrink-0 flex items-center justify-between ${sidebarBg} ${borderColor}`}>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#0A2540] flex items-center justify-center"><span className="text-white text-[6px] font-bold">PA</span></div>
          <span className={`text-[10px] ${textSecondary}`}><span className="font-medium text-[#0A2540] dark:text-[#58a6ff]">PT Perdana Adi Yuda</span> — PERADA GROUP</span>
        </div>
        <span className={`text-[10px] ${textSecondary}`}>© 2026</span>
      </footer>
    </div>
  );
}
