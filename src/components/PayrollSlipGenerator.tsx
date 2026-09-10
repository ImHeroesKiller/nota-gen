import { useState, useRef } from 'react';

interface PayrollData {
  employeeName: string;
  employeeId: string;
  position: string;
  department: string;
  period: string;
  basicSalary: number;
  overtimeHours: number;
  overtimeRate: number;
  overtimePay: number;
  allowance: number;
  bpjsHealth: number;
  bpjsEmployment: number;
  pph21: number;
  otherDeductions: number;
  netPay: number;
  bankName: string;
  accountNumber: string;
}

export default function PayrollSlipGenerator() {
  const printRef = useRef<HTMLDivElement>(null);
  const [payrollData, setPayrollData] = useState<PayrollData>({
    employeeName: '',
    employeeId: '',
    position: '',
    department: '',
    period: new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
    basicSalary: 0,
    overtimeHours: 0,
    overtimeRate: 0,
    overtimePay: 0,
    allowance: 0,
    bpjsHealth: 0,
    bpjsEmployment: 0,
    pph21: 0,
    otherDeductions: 0,
    netPay: 0,
    bankName: '',
    accountNumber: '',
  });

  const calculateTotals = () => {
    const overtimePay = payrollData.overtimeHours * payrollData.overtimeRate;
    const grossPay = payrollData.basicSalary + overtimePay + payrollData.allowance;
    const totalDeductions = payrollData.bpjsHealth + payrollData.bpjsEmployment + payrollData.pph21 + payrollData.otherDeductions;
    const netPay = grossPay - totalDeductions;

    setPayrollData({
      ...payrollData,
      overtimePay,
      netPay,
    });
  };

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
          <title>Slip Gaji - ${payrollData.employeeName}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; line-height: 1.4; font-size: 11px; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 3px double #0A2540; padding-bottom: 15px; }
            .company-name { font-size: 18px; font-weight: bold; color: #0A2540; }
            .company-address { font-size: 10px; color: #666; margin-top: 5px; }
            .slip-title { font-size: 14px; font-weight: bold; text-align: center; margin: 20px 0; text-decoration: underline; }
            .info-section { margin-bottom: 15px; }
            .info-row { display: flex; margin-bottom: 5px; }
            .info-label { width: 150px; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { border: 1px solid #000; padding: 6px; }
            th { background-color: #0A2540; color: white; }
            .total-row { font-weight: bold; background-color: #f0f0f0; }
            .signature { margin-top: 40px; display: flex; justify-content: space-between; }
            .signature-box { width: 45%; text-align: center; }
            .signature-line { margin-top: 50px; border-top: 1px solid #000; }
            .footer { margin-top: 30px; text-align: center; font-size: 9px; color: #999; border-top: 1px solid #ddd; padding-top: 10px; }
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
            <h1 className="text-3xl font-bold">Payroll Slip Generator</h1>
            <p className="text-sm text-gray-600">PT Perdana Adi Yuda - Generator Slip Gaji Karyawan</p>
          </div>
        </div>
        <button
          onClick={handlePrint}
          disabled={!payrollData.employeeName || payrollData.netPay <= 0}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
        >
          🖨️ Print / Save PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Payroll Details</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Employee Name</label>
                <input
                  type="text"
                  value={payrollData.employeeName}
                  onChange={(e) => setPayrollData({ ...payrollData, employeeName: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Employee ID</label>
                <input
                  type="text"
                  value={payrollData.employeeId}
                  onChange={(e) => setPayrollData({ ...payrollData, employeeId: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Position</label>
                <input
                  type="text"
                  value={payrollData.position}
                  onChange={(e) => setPayrollData({ ...payrollData, position: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Department</label>
                <input
                  type="text"
                  value={payrollData.department}
                  onChange={(e) => setPayrollData({ ...payrollData, department: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Period</label>
              <input
                type="text"
                value={payrollData.period}
                onChange={(e) => setPayrollData({ ...payrollData, period: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Income</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Basic Salary</label>
                  <input
                    type="number"
                    value={payrollData.basicSalary}
                    onChange={(e) => setPayrollData({ ...payrollData, basicSalary: Number(e.target.value) })}
                    onBlur={calculateTotals}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Overtime Hours</label>
                    <input
                      type="number"
                      value={payrollData.overtimeHours}
                      onChange={(e) => setPayrollData({ ...payrollData, overtimeHours: Number(e.target.value) })}
                      onBlur={calculateTotals}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Overtime Rate/Hour</label>
                    <input
                      type="number"
                      value={payrollData.overtimeRate}
                      onChange={(e) => setPayrollData({ ...payrollData, overtimeRate: Number(e.target.value) })}
                      onBlur={calculateTotals}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Allowance</label>
                  <input
                    type="number"
                    value={payrollData.allowance}
                    onChange={(e) => setPayrollData({ ...payrollData, allowance: Number(e.target.value) })}
                    onBlur={calculateTotals}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Deductions</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium mb-1">BPJS Kesehatan</label>
                  <input
                    type="number"
                    value={payrollData.bpjsHealth}
                    onChange={(e) => setPayrollData({ ...payrollData, bpjsHealth: Number(e.target.value) })}
                    onBlur={calculateTotals}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">BPJS Ketenagakerjaan</label>
                  <input
                    type="number"
                    value={payrollData.bpjsEmployment}
                    onChange={(e) => setPayrollData({ ...payrollData, bpjsEmployment: Number(e.target.value) })}
                    onBlur={calculateTotals}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">PPh 21</label>
                  <input
                    type="number"
                    value={payrollData.pph21}
                    onChange={(e) => setPayrollData({ ...payrollData, pph21: Number(e.target.value) })}
                    onBlur={calculateTotals}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Other Deductions</label>
                  <input
                    type="number"
                    value={payrollData.otherDeductions}
                    onChange={(e) => setPayrollData({ ...payrollData, otherDeductions: Number(e.target.value) })}
                    onBlur={calculateTotals}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Payment Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={payrollData.bankName}
                    onChange={(e) => setPayrollData({ ...payrollData, bankName: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Account Number</label>
                  <input
                    type="text"
                    value={payrollData.accountNumber}
                    onChange={(e) => setPayrollData({ ...payrollData, accountNumber: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4 bg-blue-50 p-4 rounded-lg">
              <div className="text-lg font-bold text-blue-900">
                Net Pay: {formatCurrency(payrollData.netPay)}
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Preview</h2>
          <div ref={printRef} className="border rounded-lg p-6 bg-gray-50 text-xs">
            <div className="header text-center mb-4 border-b-4 border-double border-[#0A2540] pb-3">
              <div className="text-base font-bold text-[#0A2540]">PT PERDANA ADI YUDA</div>
              <div className="text-[10px] text-gray-600 mt-1">
                Jl. Contoh Alamat No. 123, Jakarta 12345<br />
                Telp: (021) 1234-5678 | Email: hr@perada.net
              </div>
            </div>

            <div className="slip-title text-center text-sm font-bold my-4 underline">
              SLIP GAJI KARYAWAN
            </div>

            <div className="info-section mb-4">
              <div className="info-row">
                <div className="info-label">Nama Karyawan</div>
                <div>: {payrollData.employeeName || '-'}</div>
              </div>
              <div className="info-row">
                <div className="info-label">ID Karyawan</div>
                <div>: {payrollData.employeeId || '-'}</div>
              </div>
              <div className="info-row">
                <div className="info-label">Jabatan</div>
                <div>: {payrollData.position || '-'}</div>
              </div>
              <div className="info-row">
                <div className="info-label">Departemen</div>
                <div>: {payrollData.department || '-'}</div>
              </div>
              <div className="info-row">
                <div className="info-label">Periode</div>
                <div>: {payrollData.period}</div>
              </div>
            </div>

            <table className="w-full border-collapse mb-4">
              <thead>
                <tr className="bg-[#0A2540] text-white">
                  <th className="border border-gray-300 p-2 text-left">Pendapatan</th>
                  <th className="border border-gray-300 p-2 text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-2">Gaji Pokok</td>
                  <td className="border border-gray-300 p-2 text-right">{formatCurrency(payrollData.basicSalary)}</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2">Lembur ({payrollData.overtimeHours} jam × {formatCurrency(payrollData.overtimeRate)})</td>
                  <td className="border border-gray-300 p-2 text-right">{formatCurrency(payrollData.overtimePay)}</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2">Tunjangan</td>
                  <td className="border border-gray-300 p-2 text-right">{formatCurrency(payrollData.allowance)}</td>
                </tr>
                <tr className="total-row">
                  <td className="border border-gray-300 p-2 font-bold">Total Pendapatan</td>
                  <td className="border border-gray-300 p-2 text-right font-bold">
                    {formatCurrency(payrollData.basicSalary + payrollData.overtimePay + payrollData.allowance)}
                  </td>
                </tr>
              </tbody>
            </table>

            <table className="w-full border-collapse mb-4">
              <thead>
                <tr className="bg-[#0A2540] text-white">
                  <th className="border border-gray-300 p-2 text-left">Potongan</th>
                  <th className="border border-gray-300 p-2 text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-2">BPJS Kesehatan</td>
                  <td className="border border-gray-300 p-2 text-right">{formatCurrency(payrollData.bpjsHealth)}</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2">BPJS Ketenagakerjaan</td>
                  <td className="border border-gray-300 p-2 text-right">{formatCurrency(payrollData.bpjsEmployment)}</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2">PPh 21</td>
                  <td className="border border-gray-300 p-2 text-right">{formatCurrency(payrollData.pph21)}</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2">Potongan Lainnya</td>
                  <td className="border border-gray-300 p-2 text-right">{formatCurrency(payrollData.otherDeductions)}</td>
                </tr>
                <tr className="total-row">
                  <td className="border border-gray-300 p-2 font-bold">Total Potongan</td>
                  <td className="border border-gray-300 p-2 text-right font-bold">
                    {formatCurrency(payrollData.bpjsHealth + payrollData.bpjsEmployment + payrollData.pph21 + payrollData.otherDeductions)}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="bg-blue-100 p-3 rounded font-bold text-center text-sm">
              GAJI BERSIH (Net Pay): {formatCurrency(payrollData.netPay)}
            </div>

            <div className="mt-4 text-[10px]">
              <div><strong>Transfer ke:</strong> {payrollData.bankName || '-'}</div>
              <div><strong>No. Rekening:</strong> {payrollData.accountNumber || '-'}</div>
            </div>

            <div className="signature mt-6">
              <div className="signature-box">
                <div className="text-[10px]">Jakarta, {new Date().toLocaleDateString('id-ID')}</div>
                <div className="signature-line"></div>
                <div className="text-[10px] font-bold mt-1">HRD Manager</div>
              </div>
              <div className="signature-box">
                <div className="text-[10px]">Penerima,</div>
                <div className="signature-line"></div>
                <div className="text-[10px] font-bold mt-1">{payrollData.employeeName || '[Nama Karyawan]'}</div>
              </div>
            </div>

            <div className="footer mt-6 text-center text-[9px] text-gray-500 border-t border-gray-300 pt-2">
              Dokumen ini dicetak secara elektronik oleh PT Perdana Adi Yuda
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
