import { useState, useRef } from 'react';

interface ContractData {
  contractNumber: string;
  contractDate: string;
  contractType: 'PKWT' | 'SPK';
  employeeName: string;
  employeeId: string;
  employeeAddress: string;
  employeePhone: string;
  position: string;
  department: string;
  startDate: string;
  endDate: string;
  salary: number;
  workLocation: string;
  workHours: string;
  responsibilities: string;
  benefits: string;
  terminationClause: string;
  additionalTerms: string;
  signatoryName: string;
  signatoryPosition: string;
}

interface ContractGeneratorProps {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

export default function ContractGenerator({ onBack, darkMode, setDarkMode }: ContractGeneratorProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [contractData, setContractData] = useState<ContractData>({
    contractNumber: `CTR-${Date.now()}`,
    contractDate: new Date().toISOString().split('T')[0],
    contractType: 'PKWT',
    employeeName: '',
    employeeId: '',
    employeeAddress: '',
    employeePhone: '',
    position: '',
    department: '',
    startDate: '',
    endDate: '',
    salary: 0,
    workLocation: '',
    workHours: 'Senin - Jumat, 08:00 - 17:00',
    responsibilities: '',
    benefits: '',
    terminationClause: '',
    additionalTerms: '',
    signatoryName: '',
    signatoryPosition: '',
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Contract ${contractData.contractNumber}</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 40px; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 3px double #0A2540; padding-bottom: 20px; }
            .company-name { font-size: 20px; font-weight: bold; color: #0A2540; }
            .company-address { font-size: 11px; color: #666; margin-top: 5px; }
            .contract-title { font-size: 16px; font-weight: bold; text-align: center; margin: 30px 0 20px 0; text-decoration: underline; }
            .section { margin-bottom: 20px; }
            .section-title { font-weight: bold; margin-bottom: 10px; }
            .content { text-align: justify; margin-bottom: 15px; }
            .signature-section { margin-top: 50px; }
            .signature-box { display: inline-block; width: 45%; vertical-align: top; }
            .signature-line { margin-top: 60px; border-top: 1px solid #000; width: 200px; }
            .signature-name { margin-top: 5px; font-weight: bold; }
            .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #ddd; padding-top: 10px; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0A2540] to-[#1E3A5F] flex items-center justify-center">
            <span className="text-white text-xs font-bold">PA</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">Contract Generator</h1>
            <p className="text-sm text-gray-600">PT Perdana Adi Yuda - Generator Kontrak PKWT/SPK</p>
          </div>
        </div>
        <button
          onClick={handlePrint}
          disabled={!contractData.employeeName || !contractData.position}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
        >
          🖨️ Print / Save PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Contract Details</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Contract Number</label>
                <input
                  type="text"
                  value={contractData.contractNumber}
                  onChange={(e) => setContractData({ ...contractData, contractNumber: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Contract Date</label>
                <input
                  type="date"
                  value={contractData.contractDate}
                  onChange={(e) => setContractData({ ...contractData, contractDate: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Contract Type</label>
              <select
                value={contractData.contractType}
                onChange={(e) => setContractData({ ...contractData, contractType: e.target.value as 'PKWT' | 'SPK' })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="PKWT">PKWT (Perjanjian Kerja Waktu Tertentu)</option>
                <option value="SPK">SPK (Surat Perintah Kerja)</option>
              </select>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Employee Information</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Employee Name"
                  value={contractData.employeeName}
                  onChange={(e) => setContractData({ ...contractData, employeeName: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Employee ID"
                  value={contractData.employeeId}
                  onChange={(e) => setContractData({ ...contractData, employeeId: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  placeholder="Employee Address"
                  value={contractData.employeeAddress}
                  onChange={(e) => setContractData({ ...contractData, employeeAddress: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={contractData.employeePhone}
                  onChange={(e) => setContractData({ ...contractData, employeePhone: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Position Details</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Position"
                  value={contractData.position}
                  onChange={(e) => setContractData({ ...contractData, position: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Department"
                  value={contractData.department}
                  onChange={(e) => setContractData({ ...contractData, department: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Work Location"
                  value={contractData.workLocation}
                  onChange={(e) => setContractData({ ...contractData, workLocation: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Work Hours"
                  value={contractData.workHours}
                  onChange={(e) => setContractData({ ...contractData, workHours: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Contract Period & Salary</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Start Date</label>
                    <input
                      type="date"
                      value={contractData.startDate}
                      onChange={(e) => setContractData({ ...contractData, startDate: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">End Date</label>
                    <input
                      type="date"
                      value={contractData.endDate}
                      onChange={(e) => setContractData({ ...contractData, endDate: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <input
                  type="number"
                  placeholder="Monthly Salary"
                  value={contractData.salary}
                  onChange={(e) => setContractData({ ...contractData, salary: Number(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Terms & Conditions</h3>
              <div className="space-y-3">
                <textarea
                  placeholder="Responsibilities"
                  value={contractData.responsibilities}
                  onChange={(e) => setContractData({ ...contractData, responsibilities: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
                <textarea
                  placeholder="Benefits"
                  value={contractData.benefits}
                  onChange={(e) => setContractData({ ...contractData, benefits: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
                <textarea
                  placeholder="Termination Clause"
                  value={contractData.terminationClause}
                  onChange={(e) => setContractData({ ...contractData, terminationClause: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
                <textarea
                  placeholder="Additional Terms"
                  value={contractData.additionalTerms}
                  onChange={(e) => setContractData({ ...contractData, additionalTerms: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Signatory</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Signatory Name"
                  value={contractData.signatoryName}
                  onChange={(e) => setContractData({ ...contractData, signatoryName: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Signatory Position"
                  value={contractData.signatoryPosition}
                  onChange={(e) => setContractData({ ...contractData, signatoryPosition: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Preview</h2>
          <div ref={printRef} className="border rounded-lg p-8 bg-gray-50 font-serif">
            <div className="header text-center mb-8 border-b-4 border-double border-[#0A2540] pb-4">
              <div className="text-xl font-bold text-[#0A2540]">PT PERDANA ADI YUDA</div>
              <div className="text-xs text-gray-600 mt-1">
                Plaza Summarecon Bekasi Lt. 7, Jl. Boulevard Ahmad Yani, Bekasi 17145<br />
                Telp: (021) 1234-5678 | Email: info@perada.net
              </div>
            </div>

            <div className="text-center text-lg font-bold my-6 underline">
              {contractData.contractType === 'PKWT' ? 'PERJANJIAN KERJA WAKTU TERTENTU' : 'SURAT PERINTAH KERJA'}
              <br />
              <span className="text-sm">No. {contractData.contractNumber}</span>
            </div>

            <div className="text-justify mb-4">
              Perjanjian ini dibuat dan ditandatangani pada tanggal {contractData.contractDate} antara:
            </div>

            <div className="mb-4">
              <div className="font-bold">1. PT PERDANA ADI YUDA</div>
              <div className="text-sm ml-4">
                Bertindak sebagai Pihak Pertama<br />
                Diwakili oleh: {contractData.signatoryName || '[Nama Penandatangan]'}<br />
                Jabatan: {contractData.signatoryPosition || '[Jabatan]'}
              </div>
            </div>

            <div className="mb-4">
              <div className="font-bold">2. {contractData.employeeName || '[Nama Karyawan]'}</div>
              <div className="text-sm ml-4">
                ID: {contractData.employeeId || '[ID Karyawan]'}<br />
                Alamat: {contractData.employeeAddress || '[Alamat]'}<br />
                Telepon: {contractData.employeePhone || '[Telepon]'}<br />
                Bertindak sebagai Pihak Kedua
              </div>
            </div>

            <div className="mb-4">
              <div className="font-bold mb-2">Pasal 1 - Posisi dan Penempatan</div>
              <div className="text-sm text-justify">
                Pihak Kedua akan bekerja sebagai <strong>{contractData.position || '[Posisi]'}</strong> di departemen <strong>{contractData.department || '[Departemen]'}</strong> dan akan ditempatkan di <strong>{contractData.workLocation || '[Lokasi Kerja]'}</strong>.
              </div>
            </div>

            <div className="mb-4">
              <div className="font-bold mb-2">Pasal 2 - Jangka Waktu</div>
              <div className="text-sm text-justify">
                Perjanjian ini berlaku mulai tanggal <strong>{contractData.startDate || '[Tanggal Mulai]'}</strong> sampai dengan <strong>{contractData.endDate || '[Tanggal Selesai]'}</strong>.
              </div>
            </div>

            <div className="mb-4">
              <div className="font-bold mb-2">Pasal 3 - Waktu Kerja</div>
              <div className="text-sm text-justify">
                Waktu kerja Pihak Kedua adalah <strong>{contractData.workHours || '[Jam Kerja]'}</strong>.
              </div>
            </div>

            <div className="mb-4">
              <div className="font-bold mb-2">Pasal 4 - Remunerasi</div>
              <div className="text-sm text-justify">
                Pihak Pertama akan membayar gaji kepada Pihak Kedua sebesar <strong>{formatCurrency(contractData.salary)}</strong> per bulan.
              </div>
            </div>

            {contractData.responsibilities && (
              <div className="mb-4">
                <div className="font-bold mb-2">Pasal 5 - Tanggung Jawab</div>
                <div className="text-sm text-justify whitespace-pre-line">{contractData.responsibilities}</div>
              </div>
            )}

            {contractData.benefits && (
              <div className="mb-4">
                <div className="font-bold mb-2">Pasal 6 - Fasilitas dan Benefit</div>
                <div className="text-sm text-justify whitespace-pre-line">{contractData.benefits}</div>
              </div>
            )}

            {contractData.terminationClause && (
              <div className="mb-4">
                <div className="font-bold mb-2">Pasal 7 - Pengakhiran Perjanjian</div>
                <div className="text-sm text-justify whitespace-pre-line">{contractData.terminationClause}</div>
              </div>
            )}

            {contractData.additionalTerms && (
              <div className="mb-4">
                <div className="font-bold mb-2">Pasal 8 - Ketentuan Tambahan</div>
                <div className="text-sm text-justify whitespace-pre-line">{contractData.additionalTerms}</div>
              </div>
            )}

            <div className="signature-section mt-12">
              <div className="flex justify-between">
                <div className="w-[45%]">
                  <div className="text-sm text-center mb-16">Pihak Pertama</div>
                  <div className="border-t border-black w-48 mx-auto"></div>
                  <div className="text-sm text-center mt-2 font-bold">{contractData.signatoryName || '[Nama]'}</div>
                  <div className="text-xs text-center">{contractData.signatoryPosition || '[Jabatan]'}</div>
                </div>
                <div className="w-[45%]">
                  <div className="text-sm text-center mb-16">Pihak Kedua</div>
                  <div className="border-t border-black w-48 mx-auto"></div>
                  <div className="text-sm text-center mt-2 font-bold">{contractData.employeeName || '[Nama]'}</div>
                  <div className="text-xs text-center">{contractData.position || '[Posisi]'}</div>
                </div>
              </div>
            </div>

            <div className="footer mt-12 text-center text-xs text-gray-500 border-t border-gray-300 pt-3">
              Dokumen ini dicetak secara elektronik oleh PT Perdana Adi Yuda
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
