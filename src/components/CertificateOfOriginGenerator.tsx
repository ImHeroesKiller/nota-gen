import { useState } from 'react';
import { jsPDF } from 'jspdf';

interface CertificateOfOriginGeneratorProps {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

export default function CertificateOfOriginGenerator({ onBack, darkMode, setDarkMode }: CertificateOfOriginGeneratorProps) {
  const [cooData, setCooData] = useState({
    certificateNumber: `COO-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    exporterName: '',
    exporterAddress: '',
    importerName: '',
    importerAddress: '',
    countryOfOrigin: 'Indonesia',
    descriptionOfGoods: '',
    hsCode: '',
    quantity: '',
    weight: '',
    invoiceNumber: '',
    invoiceDate: '',
    transportDetails: '',
    remarks: '',
    issuedBy: 'PERADA GROUP',
    authorizedSignature: '',
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
    doc.text('CERTIFICATE OF ORIGIN', 20, y);
    y += 10;

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Certificate No.: ${cooData.certificateNumber}`, 20, y);
    y += 5;
    doc.text(`Date: ${cooData.date}`, 20, y);
    y += 15;

    doc.setFontSize(12);
    doc.setTextColor(10, 37, 64);
    doc.text('Exporter:', 20, y);
    y += 7;
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(cooData.exporterName || '-', 20, y);
    y += 5;
    doc.text(cooData.exporterAddress || '-', 20, y);
    y += 10;

    doc.setFontSize(12);
    doc.setTextColor(10, 37, 64);
    doc.text('Importer:', 20, y);
    y += 7;
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(cooData.importerName || '-', 20, y);
    y += 5;
    doc.text(cooData.importerAddress || '-', 20, y);
    y += 15;

    doc.setFontSize(10);
    doc.setTextColor(10, 37, 64);
    doc.text('Country of Origin:', 20, y);
    doc.setTextColor(0);
    doc.text(cooData.countryOfOrigin, 70, y);
    y += 10;

    doc.setLineWidth(0.5);
    doc.line(20, y, 190, y);
    y += 5;

    doc.setFontSize(10);
    doc.setTextColor(10, 37, 64);
    doc.text('Description of Goods', 20, y);
    doc.text('HS Code', 120, y);
    doc.text('Quantity', 150, y);
    doc.text('Weight', 175, y);
    y += 2;
    doc.line(20, y, 190, y);
    y += 5;

    doc.setTextColor(0);
    doc.text(cooData.descriptionOfGoods || '-', 20, y);
    doc.text(cooData.hsCode || '-', 120, y);
    doc.text(cooData.quantity || '-', 150, y);
    doc.text(`${cooData.weight || '-'} kg`, 175, y);
    y += 15;

    doc.line(20, y, 190, y);
    y += 10;

    doc.setTextColor(10, 37, 64);
    doc.text('Invoice Information:', 20, y);
    y += 7;
    doc.setTextColor(0);
    doc.text(`Invoice No.: ${cooData.invoiceNumber || '-'}`, 20, y);
    y += 5;
    doc.text(`Invoice Date: ${cooData.invoiceDate || '-'}`, 20, y);
    y += 10;

    if (cooData.transportDetails) {
      doc.setTextColor(10, 37, 64);
      doc.text('Transport Details:', 20, y);
      y += 5;
      doc.setTextColor(0);
      const lines = doc.splitTextToSize(cooData.transportDetails, 170);
      doc.text(lines, 20, y);
      y += lines.length * 5;
    }

    if (cooData.remarks) {
      y += 5;
      doc.setTextColor(100);
      doc.text('Remarks:', 20, y);
      y += 5;
      doc.setTextColor(0);
      const lines = doc.splitTextToSize(cooData.remarks, 170);
      doc.text(lines, 20, y);
      y += lines.length * 5;
    }

    y += 10;
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text('Issued by:', 20, y);
    y += 5;
    doc.setTextColor(0);
    doc.text(cooData.issuedBy, 20, y);
    y += 15;

    doc.setLineWidth(0.3);
    doc.line(20, y, 80, y);
    y += 5;
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text('Authorized Signature', 20, y);
    doc.text(cooData.authorizedSignature || '_________________', 20, y + 4);

    y = 280;
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('PERADA GROUP - PT Perdana Adi Yuda', 20, y);
    doc.text('perada.net', 20, y + 4);

    doc.save(`${cooData.certificateNumber}.pdf`);
  };

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${bg} ${textPrimary}`}>
      <header className={`flex items-center justify-between px-4 py-2.5 border-b shrink-0 ${sidebarBg} ${borderColor}`}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className={`w-7 h-7 rounded-lg flex items-center justify-center ${hoverBg}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center shadow-sm">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight">Certificate of Origin Generator</h1>
            <p className={`text-[10px] ${textSecondary}`}>Buat Certificate of Origin profesional</p>
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
            <h3 className={`text-xs font-semibold uppercase tracking-wider ${textSecondary} mb-3`}>Certificate Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Certificate Number</label>
                <input value={cooData.certificateNumber} onChange={e => setCooData({ ...cooData, certificateNumber: e.target.value })} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`} />
              </div>
              <div>
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Date</label>
                <input type="date" value={cooData.date} onChange={e => setCooData({ ...cooData, date: e.target.value })} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`} />
              </div>
              <div className="col-span-2">
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Country of Origin</label>
                <input value={cooData.countryOfOrigin} onChange={e => setCooData({ ...cooData, countryOfOrigin: e.target.value })} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`} />
              </div>
            </div>
          </div>

          <div className={`rounded-xl border p-4 ${borderColor} ${sidebarBg}`}>
            <h3 className={`text-xs font-semibold uppercase tracking-wider ${textSecondary} mb-3`}>Exporter Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Exporter Name</label>
                <input value={cooData.exporterName} onChange={e => setCooData({ ...cooData, exporterName: e.target.value })} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`} placeholder="PT Exporter" />
              </div>
              <div className="col-span-2">
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Exporter Address</label>
                <input value={cooData.exporterAddress} onChange={e => setCooData({ ...cooData, exporterAddress: e.target.value })} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`} placeholder="Jl. Example No. 123, Jakarta" />
              </div>
            </div>
          </div>

          <div className={`rounded-xl border p-4 ${borderColor} ${sidebarBg}`}>
            <h3 className={`text-xs font-semibold uppercase tracking-wider ${textSecondary} mb-3`}>Importer Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Importer Name</label>
                <input value={cooData.importerName} onChange={e => setCooData({ ...cooData, importerName: e.target.value })} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`} placeholder="PT Importer" />
              </div>
              <div className="col-span-2">
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Importer Address</label>
                <input value={cooData.importerAddress} onChange={e => setCooData({ ...cooData, importerAddress: e.target.value })} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`} placeholder="Jl. Example No. 456, Surabaya" />
              </div>
            </div>
          </div>

          <div className={`rounded-xl border p-4 ${borderColor} ${sidebarBg}`}>
            <h3 className={`text-xs font-semibold uppercase tracking-wider ${textSecondary} mb-3`}>Goods Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Description of Goods</label>
                <textarea value={cooData.descriptionOfGoods} onChange={e => setCooData({ ...cooData, descriptionOfGoods: e.target.value })} rows={3} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`} placeholder="Detailed description of goods..." />
              </div>
              <div>
                <label className={`text-[10px] ${textSecondary} block mb-1`}>HS Code</label>
                <input value={cooData.hsCode} onChange={e => setCooData({ ...cooData, hsCode: e.target.value })} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`} placeholder="1234.56.78" />
              </div>
              <div>
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Quantity</label>
                <input value={cooData.quantity} onChange={e => setCooData({ ...cooData, quantity: e.target.value })} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`} placeholder="100 pcs" />
              </div>
              <div>
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Weight (kg)</label>
                <input type="number" value={cooData.weight} onChange={e => setCooData({ ...cooData, weight: e.target.value })} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`} placeholder="1000" />
              </div>
            </div>
          </div>

          <div className={`rounded-xl border p-4 ${borderColor} ${sidebarBg}`}>
            <h3 className={`text-xs font-semibold uppercase tracking-wider ${textSecondary} mb-3`}>Invoice Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Invoice Number</label>
                <input value={cooData.invoiceNumber} onChange={e => setCooData({ ...cooData, invoiceNumber: e.target.value })} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`} placeholder="INV-2026-001" />
              </div>
              <div>
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Invoice Date</label>
                <input type="date" value={cooData.invoiceDate} onChange={e => setCooData({ ...cooData, invoiceDate: e.target.value })} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`} />
              </div>
            </div>
          </div>

          <div className={`rounded-xl border p-4 ${borderColor} ${sidebarBg}`}>
            <h3 className={`text-xs font-semibold uppercase tracking-wider ${textSecondary} mb-3`}>Additional Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Transport Details</label>
                <textarea value={cooData.transportDetails} onChange={e => setCooData({ ...cooData, transportDetails: e.target.value })} rows={2} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`} placeholder="By sea, vessel name, etc..." />
              </div>
              <div className="col-span-2">
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Remarks</label>
                <textarea value={cooData.remarks} onChange={e => setCooData({ ...cooData, remarks: e.target.value })} rows={2} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`} placeholder="Additional remarks..." />
              </div>
              <div>
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Issued By</label>
                <input value={cooData.issuedBy} onChange={e => setCooData({ ...cooData, issuedBy: e.target.value })} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`} />
              </div>
              <div>
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Authorized Signature</label>
                <input value={cooData.authorizedSignature} onChange={e => setCooData({ ...cooData, authorizedSignature: e.target.value })} className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`} placeholder="Name of signatory" />
              </div>
            </div>
          </div>

          <button onClick={generatePDF} className="w-full py-3 rounded-lg text-sm font-medium bg-amber-600 hover:bg-amber-700 text-white">
            Generate Certificate of Origin PDF
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
