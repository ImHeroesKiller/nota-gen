import { useState } from 'react';
import { jsPDF } from 'jspdf';

interface BillOfLadingGeneratorProps {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

export default function BillOfLadingGenerator({ onBack, darkMode, setDarkMode }: BillOfLadingGeneratorProps) {
  const [blData, setBlData] = useState({
    blNumber: `BL-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    shipper: '',
    shipperAddress: '',
    consignee: '',
    consigneeAddress: '',
    notifyParty: '',
    vesselName: '',
    voyageNumber: '',
    portOfLoading: '',
    portOfDischarge: '',
    placeOfDelivery: '',
    marksAndNumbers: '',
    descriptionOfGoods: '',
    grossWeight: '',
    measurement: '',
    freightCharges: 'Prepaid',
    numberOfOriginalBL: '3',
    placeOfIssue: '',
    dateOfIssue: new Date().toISOString().split('T')[0],
    signedForCarrier: '',
  });

  const bg = darkMode ? 'bg-[#0f1419]' : 'bg-[#f8f9fb]';
  const sidebarBg = darkMode ? 'bg-[#161b22]' : 'bg-white';
  const borderColor = darkMode ? 'border-[#21262d]' : 'border-[#e2e5e9]';
  const textPrimary = darkMode ? 'text-[#e6edf3]' : 'text-[#1a1a2e]';
  const textSecondary = darkMode ? 'text-[#8b949e]' : 'text-[#57606a]';
  const inputBg = darkMode ? 'bg-[#0d1117] border-[#30363d]' : 'bg-white border-[#d0d7de]';
  const hoverBg = darkMode ? 'hover:bg-[#21262d]' : 'hover:bg-[#f0f1f3]';

  const generatePDF = () => {
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(24);
    doc.setTextColor(10, 37, 64);
    doc.text('BILL OF LADING', 20, y);
    y += 10;

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`B/L No.: ${blData.blNumber}`, 20, y);
    y += 5;
    doc.text(`Date: ${blData.date}`, 20, y);
    y += 15;

    doc.setFontSize(12);
    doc.setTextColor(10, 37, 64);
    doc.text('Shipper:', 20, y);
    y += 7;
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(blData.shipper || '-', 20, y);
    y += 5;
    doc.text(blData.shipperAddress || '-', 20, y);
    y += 10;

    doc.setFontSize(12);
    doc.setTextColor(10, 37, 64);
    doc.text('Consignee:', 20, y);
    y += 7;
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(blData.consignee || '-', 20, y);
    y += 5;
    doc.text(blData.consigneeAddress || '-', 20, y);
    y += 10;

    if (blData.notifyParty) {
      doc.setFontSize(12);
      doc.setTextColor(10, 37, 64);
      doc.text('Notify Party:', 20, y);
      y += 7;
      doc.setFontSize(10);
      doc.setTextColor(0);
      doc.text(blData.notifyParty, 20, y);
      y += 10;
    }

    doc.setFontSize(10);
    doc.setTextColor(10, 37, 64);
    doc.text('Vessel/Voyage:', 20, y);
    doc.setTextColor(0);
    doc.text(`${blData.vesselName || '-'} / ${blData.voyageNumber || '-'}`, 60, y);
    y += 7;

    doc.setTextColor(10, 37, 64);
    doc.text('Port of Loading:', 20, y);
    doc.setTextColor(0);
    doc.text(blData.portOfLoading || '-', 60, y);
    y += 7;

    doc.setTextColor(10, 37, 64);
    doc.text('Port of Discharge:', 20, y);
    doc.setTextColor(0);
    doc.text(blData.portOfDischarge || '-', 60, y);
    y += 7;

    doc.setTextColor(10, 37, 64);
    doc.text('Place of Delivery:', 20, y);
    doc.setTextColor(0);
    doc.text(blData.placeOfDelivery || '-', 60, y);
    y += 15;

    doc.setLineWidth(0.5);
    doc.line(20, y, 190, y);
    y += 5;

    doc.setFontSize(10);
    doc.setTextColor(10, 37, 64);
    doc.text('Marks & Numbers', 20, y);
    doc.text('Description of Goods', 70, y);
    doc.text('Gross Weight', 140, y);
    doc.text('Measurement', 170, y);
    y += 2;
    doc.line(20, y, 190, y);
    y += 5;

    doc.setTextColor(0);
    doc.text(blData.marksAndNumbers || '-', 20, y);
    doc.text(blData.descriptionOfGoods || '-', 70, y);
    doc.text(`${blData.grossWeight || '-'} kg`, 140, y);
    doc.text(blData.measurement || '-', 170, y);
    y += 15;

    doc.line(20, y, 190, y);
    y += 10;

    doc.setTextColor(10, 37, 64);
    doc.text('Freight & Charges:', 20, y);
    doc.setTextColor(0);
    doc.text(blData.freightCharges, 60, y);
    y += 7;

    doc.setTextColor(10, 37, 64);
    doc.text('Number of Original B/L:', 20, y);
    doc.setTextColor(0);
    doc.text(blData.numberOfOriginalBL, 80, y);
    y += 15;

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text('Place of Issue:', 20, y);
    doc.setTextColor(0);
    doc.text(blData.placeOfIssue || '-', 50, y);
    y += 7;

    doc.setTextColor(100);
    doc.text('Date of Issue:', 20, y);
    doc.setTextColor(0);
    doc.text(blData.dateOfIssue, 50, y);
    y += 15;

    doc.setLineWidth(0.3);
    doc.line(20, y, 80, y);
    y += 5;
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text('Signed for the Carrier', 20, y);
    doc.text(blData.signedForCarrier || '_________________', 20, y + 4);

    y = 280;
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('PERADA GROUP - PT Perdana Adi Yuda', 20, y);
    doc.text('perada.net', 20, y + 4);

    doc.save(`${blData.blNumber}.pdf`);
  };

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${bg} ${textPrimary}`}>
      <header className={`flex items-center justify-between px-4 py-2.5 border-b shrink-0 ${sidebarBg} ${borderColor}`}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className={`w-7 h-7 rounded-lg flex items-center justify-center ${hoverBg}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center shadow-sm">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight">Bill of Lading Generator</h1>
            <p className={`text-[10px] ${textSecondary}`}>Buat Bill of Lading profesional</p>
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
            <h3 className={`text-xs font-semibold uppercase tracking-wider ${textSecondary} mb-3`}>B/L Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`text-[10px] ${textSecondary} block mb-1`}>B/L Number</label>
                <input value={blData.blNumber} onChange={e => setBlData({ ...blData, blNumber: e.target.value })} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`} />
              </div>
              <div>
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Date</label>
                <input type="date" value={blData.date} onChange={e => setBlData({ ...blData, date: e.target.value })} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`} />
              </div>
            </div>
          </div>

          <div className={`rounded-xl border p-4 ${borderColor} ${sidebarBg}`}>
            <h3 className={`text-xs font-semibold uppercase tracking-wider ${textSecondary} mb-3`}>Shipper Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Shipper Name</label>
                <input value={blData.shipper} onChange={e => setBlData({ ...blData, shipper: e.target.value })} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`} placeholder="PT Shipper" />
              </div>
              <div className="col-span-2">
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Shipper Address</label>
                <input value={blData.shipperAddress} onChange={e => setBlData({ ...blData, shipperAddress: e.target.value })} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`} placeholder="Jl. Example No. 123, Jakarta" />
              </div>
            </div>
          </div>

          <div className={`rounded-xl border p-4 ${borderColor} ${sidebarBg}`}>
            <h3 className={`text-xs font-semibold uppercase tracking-wider ${textSecondary} mb-3`}>Consignee Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Consignee Name</label>
                <input value={blData.consignee} onChange={e => setBlData({ ...blData, consignee: e.target.value })} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`} placeholder="PT Consignee" />
              </div>
              <div className="col-span-2">
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Consignee Address</label>
                <input value={blData.consigneeAddress} onChange={e => setBlData({ ...blData, consigneeAddress: e.target.value })} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`} placeholder="Jl. Example No. 456, Surabaya" />
              </div>
            </div>
          </div>

          <div className={`rounded-xl border p-4 ${borderColor} ${sidebarBg}`}>
            <h3 className={`text-xs font-semibold uppercase tracking-wider ${textSecondary} mb-3`}>Vessel & Voyage Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Vessel Name</label>
                <input value={blData.vesselName} onChange={e => setBlData({ ...blData, vesselName: e.target.value })} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`} placeholder="MV Example" />
              </div>
              <div>
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Voyage Number</label>
                <input value={blData.voyageNumber} onChange={e => setBlData({ ...blData, voyageNumber: e.target.value })} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`} placeholder="V.001" />
              </div>
              <div>
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Port of Loading</label>
                <input value={blData.portOfLoading} onChange={e => setBlData({ ...blData, portOfLoading: e.target.value })} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`} placeholder="Tanjung Priok" />
              </div>
              <div>
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Port of Discharge</label>
                <input value={blData.portOfDischarge} onChange={e => setBlData({ ...blData, portOfDischarge: e.target.value })} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`} placeholder="Surabaya" />
              </div>
              <div className="col-span-2">
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Place of Delivery</label>
                <input value={blData.placeOfDelivery} onChange={e => setBlData({ ...blData, placeOfDelivery: e.target.value })} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`} placeholder="Surabaya" />
              </div>
            </div>
          </div>

          <div className={`rounded-xl border p-4 ${borderColor} ${sidebarBg}`}>
            <h3 className={`text-xs font-semibold uppercase tracking-wider ${textSecondary} mb-3`}>Goods Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Marks & Numbers</label>
                <textarea value={blData.marksAndNumbers} onChange={e => setBlData({ ...blData, marksAndNumbers: e.target.value })} rows={2} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`} placeholder="Shipping marks..." />
              </div>
              <div className="col-span-2">
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Description of Goods</label>
                <textarea value={blData.descriptionOfGoods} onChange={e => setBlData({ ...blData, descriptionOfGoods: e.target.value })} rows={3} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`} placeholder="Detailed description of goods..." />
              </div>
              <div>
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Gross Weight (kg)</label>
                <input type="number" value={blData.grossWeight} onChange={e => setBlData({ ...blData, grossWeight: e.target.value })} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`} placeholder="1000" />
              </div>
              <div>
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Measurement (CBM)</label>
                <input value={blData.measurement} onChange={e => setBlData({ ...blData, measurement: e.target.value })} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`} placeholder="10.5" />
              </div>
            </div>
          </div>

          <div className={`rounded-xl border p-4 ${borderColor} ${sidebarBg}`}>
            <h3 className={`text-xs font-semibold uppercase tracking-wider ${textSecondary} mb-3`}>Additional Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Freight & Charges</label>
                <select value={blData.freightCharges} onChange={e => setBlData({ ...blData, freightCharges: e.target.value })} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`}>
                  <option value="Prepaid">Prepaid</option>
                  <option value="Collect">Collect</option>
                </select>
              </div>
              <div>
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Number of Original B/L</label>
                <input value={blData.numberOfOriginalBL} onChange={e => setBlData({ ...blData, numberOfOriginalBL: e.target.value })} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`} />
              </div>
              <div>
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Place of Issue</label>
                <input value={blData.placeOfIssue} onChange={e => setBlData({ ...blData, placeOfIssue: e.target.value })} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`} placeholder="Jakarta" />
              </div>
              <div>
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Date of Issue</label>
                <input type="date" value={blData.dateOfIssue} onChange={e => setBlData({ ...blData, dateOfIssue: e.target.value })} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`} />
              </div>
              <div className="col-span-2">
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Notify Party</label>
                <input value={blData.notifyParty} onChange={e => setBlData({ ...blData, notifyParty: e.target.value })} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`} placeholder="PT Notify Party" />
              </div>
              <div className="col-span-2">
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Signed for Carrier</label>
                <input value={blData.signedForCarrier} onChange={e => setBlData({ ...blData, signedForCarrier: e.target.value })} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`} placeholder="Name of signatory" />
              </div>
            </div>
          </div>

          <button onClick={generatePDF} className="w-full py-3 rounded-lg text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white">
            Generate Bill of Lading PDF
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
