import { useState } from 'react';
import { jsPDF } from 'jspdf';

interface DOItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  remarks: string;
}

interface DOData {
  doNumber: string;
  date: string;
  poNumber: string;
  clientName: string;
  clientAddress: string;
  clientPhone: string;
  items: DOItem[];
  driverName: string;
  vehicleNumber: string;
  notes: string;
  receivedBy: string;
  receivedDate: string;
}

export default function DeliveryOrderGenerator({ onBack, darkMode, setDarkMode }: any) {
  const [doData, setDoData] = useState<DOData>({
    doNumber: `DO-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    poNumber: '',
    clientName: '',
    clientAddress: '',
    clientPhone: '',
    items: [],
    driverName: '',
    vehicleNumber: '',
    notes: '',
    receivedBy: '',
    receivedDate: '',
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
    setDoData({
      ...doData,
      items: [
        ...doData.items,
        {
          id: Date.now().toString(),
          description: '',
          quantity: 1,
          unit: 'pcs',
          remarks: '',
        },
      ],
    });
  };

  const updateItem = (id: string, field: keyof DOItem, value: any) => {
    const updatedItems = doData.items.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    setDoData({ ...doData, items: updatedItems });
  };

  const removeItem = (id: string) => {
    setDoData({
      ...doData,
      items: doData.items.filter((item) => item.id !== id),
    });
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    let y = 20;

    // Header
    doc.setFontSize(20);
    doc.setTextColor(10, 37, 64);
    doc.text('DELIVERY ORDER', 20, y);
    y += 10;

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`DO #: ${doData.doNumber}`, 20, y);
    y += 5;
    doc.text(`Date: ${doData.date}`, 20, y);
    y += 5;
    if (doData.poNumber) {
      doc.text(`PO #: ${doData.poNumber}`, 20, y);
      y += 5;
    }
    y += 10;

    // Client Info
    doc.setFontSize(12);
    doc.setTextColor(10, 37, 64);
    doc.text('Deliver To:', 20, y);
    y += 7;
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(doData.clientName || '-', 20, y);
    y += 5;
    doc.text(doData.clientAddress || '-', 20, y);
    y += 5;
    doc.text(doData.clientPhone || '-', 20, y);
    y += 15;

    // Items Table
    doc.setFontSize(10);
    doc.setTextColor(10, 37, 64);
    doc.text('No', 20, y);
    doc.text('Description', 30, y);
    doc.text('Qty', 120, y);
    doc.text('Unit', 140, y);
    doc.text('Remarks', 160, y);
    y += 2;
    doc.setLineWidth(0.5);
    doc.line(20, y, 190, y);
    y += 5;

    doc.setTextColor(0);
    doData.items.forEach((item, index) => {
      doc.text((index + 1).toString(), 20, y);
      doc.text(item.description || '-', 30, y);
      doc.text(item.quantity.toString(), 120, y);
      doc.text(item.unit, 140, y);
      doc.text(item.remarks || '-', 160, y);
      y += 7;
    });

    y += 5;
    doc.line(20, y, 190, y);
    y += 15;

    // Driver Info
    if (doData.driverName || doData.vehicleNumber) {
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('Driver:', 20, y);
      doc.setTextColor(0);
      doc.text(doData.driverName || '-', 40, y);
      y += 5;
      doc.setTextColor(100);
      doc.text('Vehicle:', 20, y);
      doc.setTextColor(0);
      doc.text(doData.vehicleNumber || '-', 40, y);
      y += 15;
    }

    // Notes
    if (doData.notes) {
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('Notes:', 20, y);
      y += 5;
      doc.setTextColor(0);
      const lines = doc.splitTextToSize(doData.notes, 170);
      doc.text(lines, 20, y);
      y += lines.length * 5 + 10;
    }

    // Signature Section
    y = 240;
    doc.setLineWidth(0.3);
    
    // Left signature
    doc.line(20, y, 80, y);
    y += 5;
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text('Received By', 20, y);
    y += 4;
    doc.setTextColor(0);
    doc.text(doData.receivedBy || '_________________', 20, y);
    if (doData.receivedDate) {
      y += 4;
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(`Date: ${doData.receivedDate}`, 20, y);
    }

    // Right signature
    y = 240;
    doc.line(120, y, 190, y);
    y += 5;
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text('Delivered By', 120, y);
    y += 4;
    doc.setTextColor(0);
    doc.text(doData.driverName || '_________________', 120, y);

    // Footer
    y = 280;
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('PERADA GROUP - PT Perdana Adi Yuda', 20, y);
    doc.text('perada.net', 20, y + 4);

    doc.save(`${doData.doNumber}.pdf`);
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
          <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center shadow-sm">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight">Delivery Order Generator</h1>
            <p className={`text-[10px] ${textSecondary}`}>Buat dokumen pengiriman</p>
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
          {/* DO Info */}
          <div className={`rounded-xl border p-4 ${borderColor} ${sidebarBg}`}>
            <h3 className={`text-xs font-semibold uppercase tracking-wider ${textSecondary} mb-3`}>Delivery Order Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`text-[10px] ${textSecondary} block mb-1`}>DO Number</label>
                <input
                  value={doData.doNumber}
                  onChange={(e) => setDoData({ ...doData, doNumber: e.target.value })}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`}
                />
              </div>
              <div>
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Date</label>
                <input
                  type="date"
                  value={doData.date}
                  onChange={(e) => setDoData({ ...doData, date: e.target.value })}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`}
                />
              </div>
              <div className="col-span-2">
                <label className={`text-[10px] ${textSecondary} block mb-1`}>PO Number (Optional)</label>
                <input
                  value={doData.poNumber}
                  onChange={(e) => setDoData({ ...doData, poNumber: e.target.value })}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`}
                  placeholder="PO-2026-001"
                />
              </div>
            </div>
          </div>

          {/* Client Info */}
          <div className={`rounded-xl border p-4 ${borderColor} ${sidebarBg}`}>
            <h3 className={`text-xs font-semibold uppercase tracking-wider ${textSecondary} mb-3`}>Delivery To</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Client Name</label>
                <input
                  value={doData.clientName}
                  onChange={(e) => setDoData({ ...doData, clientName: e.target.value })}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`}
                  placeholder="PT Example"
                />
              </div>
              <div className="col-span-2">
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Address</label>
                <input
                  value={doData.clientAddress}
                  onChange={(e) => setDoData({ ...doData, clientAddress: e.target.value })}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`}
                  placeholder="Jl. Example No. 123, Jakarta"
                />
              </div>
              <div className="col-span-2">
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Phone</label>
                <input
                  value={doData.clientPhone}
                  onChange={(e) => setDoData({ ...doData, clientPhone: e.target.value })}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`}
                  placeholder="021-12345678"
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
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-600 hover:bg-orange-700 text-white"
              >
                + Add Item
              </button>
            </div>

            {doData.items.length === 0 ? (
              <div className={`text-center py-8 ${textSecondary}`}>
                <p className="text-sm">Belum ada item</p>
                <p className="text-xs mt-1">Klik "Add Item" untuk menambahkan</p>
              </div>
            ) : (
              <div className="space-y-2">
                {doData.items.map((item, index) => (
                  <div key={item.id} className={`grid grid-cols-12 gap-2 p-2 rounded-lg ${cardBg}`}>
                    <div className="col-span-1 flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                    <div className="col-span-4">
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
                        value={item.unit}
                        onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                        placeholder="Unit"
                        className={`w-full px-2 py-1 rounded text-xs border ${inputBg} ${textPrimary}`}
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        value={item.remarks}
                        onChange={(e) => updateItem(item.id, 'remarks', e.target.value)}
                        placeholder="Remarks"
                        className={`w-full px-2 py-1 rounded text-xs border ${inputBg} ${textPrimary}`}
                      />
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
          </div>

          {/* Driver Info */}
          <div className={`rounded-xl border p-4 ${borderColor} ${sidebarBg}`}>
            <h3 className={`text-xs font-semibold uppercase tracking-wider ${textSecondary} mb-3`}>Driver & Vehicle</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Driver Name</label>
                <input
                  value={doData.driverName}
                  onChange={(e) => setDoData({ ...doData, driverName: e.target.value })}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Vehicle Number</label>
                <input
                  value={doData.vehicleNumber}
                  onChange={(e) => setDoData({ ...doData, vehicleNumber: e.target.value })}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`}
                  placeholder="B 1234 ABC"
                />
              </div>
            </div>
          </div>

          {/* Notes & Received */}
          <div className={`rounded-xl border p-4 ${borderColor} ${sidebarBg}`}>
            <h3 className={`text-xs font-semibold uppercase tracking-wider ${textSecondary} mb-3`}>Additional Info</h3>
            <div className="space-y-3">
              <div>
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Notes</label>
                <textarea
                  value={doData.notes}
                  onChange={(e) => setDoData({ ...doData, notes: e.target.value })}
                  rows={2}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary} resize-none`}
                  placeholder="Additional notes..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`text-[10px] ${textSecondary} block mb-1`}>Received By</label>
                  <input
                    value={doData.receivedBy}
                    onChange={(e) => setDoData({ ...doData, receivedBy: e.target.value })}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`}
                    placeholder="Name of receiver"
                  />
                </div>
                <div>
                  <label className={`text-[10px] ${textSecondary} block mb-1`}>Received Date</label>
                  <input
                    type="date"
                    value={doData.receivedDate}
                    onChange={(e) => setDoData({ ...doData, receivedDate: e.target.value })}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generatePDF}
            disabled={doData.items.length === 0}
            className="w-full py-3 rounded-lg text-sm font-medium bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate Delivery Order PDF
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
