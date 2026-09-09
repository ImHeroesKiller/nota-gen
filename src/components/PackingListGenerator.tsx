import { useState } from 'react';
import { jsPDF } from 'jspdf';

interface PackingListGeneratorProps {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

interface PackingItem {
  id: number;
  description: string;
  quantity: number;
  weight: number;
  dimensions: string;
  packageType: string;
}

export default function PackingListGenerator({ onBack, darkMode, setDarkMode }: PackingListGeneratorProps) {
  const [packingData, setPackingData] = useState({
    packingListNumber: `PL-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    invoiceNumber: '',
    shipperName: '',
    shipperAddress: '',
    consigneeName: '',
    consigneeAddress: '',
    items: [] as PackingItem[],
    totalPackages: 0,
    grossWeight: 0,
    netWeight: 0,
    measurement: '',
    shippingMarks: '',
    notes: '',
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
    setPackingData({
      ...packingData,
      items: [...packingData.items, { id: Date.now(), description: '', quantity: 1, weight: 0, dimensions: '', packageType: 'Carton' }],
    });
  };

  const updateItem = (id: number, field: keyof PackingItem, value: any) => {
    const updatedItems = packingData.items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setPackingData({ ...packingData, items: updatedItems });
  };

  const removeItem = (id: number) => {
    setPackingData({ ...packingData, items: packingData.items.filter(item => item.id !== id) });
  };

  const totalQuantity = packingData.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalWeight = packingData.items.reduce((sum, item) => sum + (item.weight * item.quantity), 0);

  const generatePDF = () => {
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(24);
    doc.setTextColor(10, 37, 64);
    doc.text('PACKING LIST', 20, y);
    y += 10;

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Packing List #: ${packingData.packingListNumber}`, 20, y);
    y += 5;
    doc.text(`Date: ${packingData.date}`, 20, y);
    y += 5;
    doc.text(`Invoice No.: ${packingData.invoiceNumber || '-'}`, 20, y);
    y += 15;

    doc.setFontSize(12);
    doc.setTextColor(10, 37, 64);
    doc.text('Shipper:', 20, y);
    y += 7;
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(packingData.shipperName || '-', 20, y);
    y += 5;
    doc.text(packingData.shipperAddress || '-', 20, y);
    y += 10;

    doc.setFontSize(12);
    doc.setTextColor(10, 37, 64);
    doc.text('Consignee:', 20, y);
    y += 7;
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(packingData.consigneeName || '-', 20, y);
    y += 5;
    doc.text(packingData.consigneeAddress || '-', 20, y);
    y += 15;

    doc.setFontSize(10);
    doc.setTextColor(10, 37, 64);
    doc.text('Description', 20, y);
    doc.text('Qty', 100, y);
    doc.text('Weight', 120, y);
    doc.text('Dimensions', 140, y);
    doc.text('Package', 170, y);
    y += 2;
    doc.setLineWidth(0.5);
    doc.line(20, y, 190, y);
    y += 5;

    doc.setTextColor(0);
    packingData.items.forEach(item => {
      doc.text(item.description || '-', 20, y);
      doc.text(item.quantity.toString(), 100, y);
      doc.text(`${item.weight} kg`, 120, y);
      doc.text(item.dimensions || '-', 140, y);
      doc.text(item.packageType, 170, y);
      y += 7;
    });

    y += 5;
    doc.line(20, y, 190, y);
    y += 7;

    doc.setFontSize(10);
    doc.setTextColor(10, 37, 64);
    doc.text('Summary:', 20, y);
    y += 7;
    doc.setTextColor(0);
    doc.text(`Total Packages: ${totalQuantity}`, 20, y);
    y += 5;
    doc.text(`Total Gross Weight: ${totalWeight.toFixed(2)} kg`, 20, y);
    y += 10;

    if (packingData.shippingMarks) {
      doc.setTextColor(10, 37, 64);
      doc.text('Shipping Marks:', 20, y);
      y += 5;
      doc.setTextColor(0);
      const lines = doc.splitTextToSize(packingData.shippingMarks, 170);
      doc.text(lines, 20, y);
      y += lines.length * 5;
    }

    if (packingData.notes) {
      y += 5;
      doc.setTextColor(100);
      doc.text('Notes:', 20, y);
      y += 5;
      doc.setTextColor(0);
      const lines = doc.splitTextToSize(packingData.notes, 170);
      doc.text(lines, 20, y);
    }

    y = 280;
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('PERADA GROUP - PT Perdana Adi Yuda', 20, y);
    doc.text('perada.net', 20, y + 4);

    doc.save(`${packingData.packingListNumber}.pdf`);
  };

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${bg} ${textPrimary}`}>
      <header className={`flex items-center justify-between px-4 py-2.5 border-b shrink-0 ${sidebarBg} ${borderColor}`}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className={`w-7 h-7 rounded-lg flex items-center justify-center ${hoverBg}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center shadow-sm">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight">Packing List Generator</h1>
            <p className={`text-[10px] ${textSecondary}`}>Buat packing list profesional</p>
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
            <h3 className={`text-xs font-semibold uppercase tracking-wider ${textSecondary} mb-3`}>Packing List Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Packing List Number</label>
                <input value={packingData.packingListNumber} onChange={e => setPackingData({ ...packingData, packingListNumber: e.target.value })} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`} />
              </div>
              <div>
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Date</label>
                <input type="date" value={packingData.date} onChange={e => setPackingData({ ...packingData, date: e.target.value })} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`} />
              </div>
              <div className="col-span-2">
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Invoice Number</label>
                <input value={packingData.invoiceNumber} onChange={e => setPackingData({ ...packingData, invoiceNumber: e.target.value })} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`} placeholder="INV-2026-001" />
              </div>
            </div>
          </div>

          <div className={`rounded-xl border p-4 ${borderColor} ${sidebarBg}`}>
            <h3 className={`text-xs font-semibold uppercase tracking-wider ${textSecondary} mb-3`}>Shipper Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Shipper Name</label>
                <input value={packingData.shipperName} onChange={e => setPackingData({ ...packingData, shipperName: e.target.value })} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`} placeholder="PT Shipper" />
              </div>
              <div className="col-span-2">
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Shipper Address</label>
                <input value={packingData.shipperAddress} onChange={e => setPackingData({ ...packingData, shipperAddress: e.target.value })} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`} placeholder="Jl. Example No. 123, Jakarta" />
              </div>
            </div>
          </div>

          <div className={`rounded-xl border p-4 ${borderColor} ${sidebarBg}`}>
            <h3 className={`text-xs font-semibold uppercase tracking-wider ${textSecondary} mb-3`}>Consignee Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Consignee Name</label>
                <input value={packingData.consigneeName} onChange={e => setPackingData({ ...packingData, consigneeName: e.target.value })} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`} placeholder="PT Consignee" />
              </div>
              <div className="col-span-2">
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Consignee Address</label>
                <input value={packingData.consigneeAddress} onChange={e => setPackingData({ ...packingData, consigneeAddress: e.target.value })} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`} placeholder="Jl. Example No. 456, Surabaya" />
              </div>
            </div>
          </div>

          <div className={`rounded-xl border p-4 ${borderColor} ${sidebarBg}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>Items</h3>
              <button onClick={addItem} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-600 hover:bg-green-700 text-white">+ Add Item</button>
            </div>

            {packingData.items.length === 0 ? (
              <div className={`text-center py-8 ${textSecondary}`}>
                <p className="text-sm">Belum ada item</p>
                <p className="text-xs mt-1">Klik "Add Item" untuk menambahkan</p>
              </div>
            ) : (
              <div className="space-y-2">
                {packingData.items.map(item => (
                  <div key={item.id} className={`grid grid-cols-12 gap-2 p-2 rounded-lg ${cardBg}`}>
                    <div className="col-span-4">
                      <input value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)} placeholder="Description" className={`w-full px-2 py-1 rounded text-xs border ${inputBg} ${textPrimary}`} />
                    </div>
                    <div className="col-span-2">
                      <input type="number" value={item.quantity} onChange={e => updateItem(item.id, 'quantity', Number(e.target.value))} placeholder="Qty" className={`w-full px-2 py-1 rounded text-xs border ${inputBg} ${textPrimary}`} />
                    </div>
                    <div className="col-span-2">
                      <input type="number" value={item.weight} onChange={e => updateItem(item.id, 'weight', Number(e.target.value))} placeholder="Weight" className={`w-full px-2 py-1 rounded text-xs border ${inputBg} ${textPrimary}`} />
                    </div>
                    <div className="col-span-2">
                      <input value={item.dimensions} onChange={e => updateItem(item.id, 'dimensions', e.target.value)} placeholder="Dimensions" className={`w-full px-2 py-1 rounded text-xs border ${inputBg} ${textPrimary}`} />
                    </div>
                    <div className="col-span-1">
                      <select value={item.packageType} onChange={e => updateItem(item.id, 'packageType', e.target.value)} className={`w-full px-1 py-1 rounded text-xs border ${inputBg} ${textPrimary}`}>
                        <option value="Carton">Carton</option>
                        <option value="Pallet">Pallet</option>
                        <option value="Bag">Bag</option>
                        <option value="Drum">Drum</option>
                      </select>
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

            {packingData.items.length > 0 && (
              <div className={`mt-4 pt-4 border-t ${borderColor}`}>
                <div className={`space-y-1 text-sm ${textPrimary}`}>
                  <div className="flex justify-between"><span>Total Packages:</span><span>{totalQuantity}</span></div>
                  <div className="flex justify-between"><span>Total Weight:</span><span>{totalWeight.toFixed(2)} kg</span></div>
                </div>
              </div>
            )}
          </div>

          <div className={`rounded-xl border p-4 ${borderColor} ${sidebarBg}`}>
            <label className={`text-xs font-semibold uppercase tracking-wider ${textSecondary} block mb-2`}>Shipping Marks</label>
            <textarea value={packingData.shippingMarks} onChange={e => setPackingData({ ...packingData, shippingMarks: e.target.value })} rows={2} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`} placeholder="Shipping marks..." />
          </div>

          <div className={`rounded-xl border p-4 ${borderColor} ${sidebarBg}`}>
            <label className={`text-xs font-semibold uppercase tracking-wider ${textSecondary} block mb-2`}>Notes</label>
            <textarea value={packingData.notes} onChange={e => setPackingData({ ...packingData, notes: e.target.value })} rows={2} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`} placeholder="Additional notes..." />
          </div>

          <button onClick={generatePDF} disabled={packingData.items.length === 0} className="w-full py-3 rounded-lg text-sm font-medium bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed">
            Generate Packing List PDF
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
