import { useState, useRef } from 'react';

interface ReportData {
  reportTitle: string;
  reportDate: string;
  reportPeriod: string;
  reportType: 'attendance' | 'incident' | 'performance' | 'custom';
  preparedBy: string;
  department: string;
  summary: string;
  dataRows: { id: string; [key: string]: string }[];
  columns: string[];
  conclusion: string;
  recommendations: string;
}

export default function ReportPdfGenerator() {
  const printRef = useRef<HTMLDivElement>(null);
  const [reportData, setReportData] = useState<ReportData>({
    reportTitle: '',
    reportDate: new Date().toISOString().split('T')[0],
    reportPeriod: '',
    reportType: 'attendance',
    preparedBy: '',
    department: '',
    summary: '',
    dataRows: [],
    columns: ['No', 'Data'],
    conclusion: '',
    recommendations: '',
  });

  const [newColumn, setNewColumn] = useState('');
  const [newRow, setNewRow] = useState<{ [key: string]: string }>({});

  const addColumn = () => {
    if (!newColumn) return;
    setReportData({
      ...reportData,
      columns: [...reportData.columns, newColumn],
    });
    setNewColumn('');
  };

  const removeColumn = (index: number) => {
    if (index === 0) return; // Cannot remove 'No' column
    const newColumns = reportData.columns.filter((_, i) => i !== index);
    const newRows = reportData.dataRows.map(row => {
      const newRow = { ...row };
      delete newRow[reportData.columns[index]];
      return newRow;
    });
    setReportData({ ...reportData, columns: newColumns, dataRows: newRows });
  };

  const addRow = () => {
    const newRowData = { id: Date.now().toString(), ...newRow };
    setReportData({
      ...reportData,
      dataRows: [...reportData.dataRows, newRowData],
    });
    setNewRow({});
  };

  const removeRow = (id: string) => {
    setReportData({
      ...reportData,
      dataRows: reportData.dataRows.filter(row => row.id !== id),
    });
  };

  const updateRow = (id: string, column: string, value: string) => {
    setReportData({
      ...reportData,
      dataRows: reportData.dataRows.map(row =>
        row.id === id ? { ...row, [column]: value } : row
      ),
    });
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Laporan ${reportData.reportTitle}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 3px double #0A2540; padding-bottom: 20px; }
            .company-name { font-size: 20px; font-weight: bold; color: #0A2540; }
            .company-address { font-size: 11px; color: #666; margin-top: 5px; }
            .report-title { font-size: 18px; font-weight: bold; text-align: center; margin: 30px 0 20px 0; text-decoration: underline; }
            .report-info { margin-bottom: 20px; }
            .report-info-row { display: flex; margin-bottom: 5px; }
            .report-info-label { width: 150px; font-weight: bold; }
            .summary { margin-bottom: 20px; text-align: justify; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; }
            th { background-color: #0A2540; color: white; }
            .conclusion { margin-top: 30px; text-align: justify; }
            .recommendations { margin-top: 20px; text-align: justify; }
            .signature { margin-top: 50px; text-align: right; }
            .signature-line { margin-top: 60px; border-top: 1px solid #000; width: 200px; display: inline-block; }
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

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0A2540] to-[#1E3A5F] flex items-center justify-center">
            <span className="text-white text-xs font-bold">PA</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">Report PDF Generator</h1>
            <p className="text-sm text-gray-600">PT Perdana Adi Yuda - Generator Laporan Formal</p>
          </div>
        </div>
        <button
          onClick={handlePrint}
          disabled={!reportData.reportTitle || reportData.dataRows.length === 0}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
        >
          🖨️ Print / Save PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Report Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Report Title</label>
              <input
                type="text"
                placeholder="Laporan Rekap Absensi Januari 2026"
                value={reportData.reportTitle}
                onChange={(e) => setReportData({ ...reportData, reportTitle: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Report Date</label>
                <input
                  type="date"
                  value={reportData.reportDate}
                  onChange={(e) => setReportData({ ...reportData, reportDate: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Report Period</label>
                <input
                  type="text"
                  placeholder="Januari 2026"
                  value={reportData.reportPeriod}
                  onChange={(e) => setReportData({ ...reportData, reportPeriod: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Report Type</label>
              <select
                value={reportData.reportType}
                onChange={(e) => setReportData({ ...reportData, reportType: e.target.value as any })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="attendance">Laporan Absensi</option>
                <option value="incident">Laporan Insiden</option>
                <option value="performance">Laporan Performa</option>
                <option value="custom">Laporan Custom</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Prepared By</label>
                <input
                  type="text"
                  placeholder="Nama Pembuat Laporan"
                  value={reportData.preparedBy}
                  onChange={(e) => setReportData({ ...reportData, preparedBy: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Department</label>
                <input
                  type="text"
                  placeholder="Departemen"
                  value={reportData.department}
                  onChange={(e) => setReportData({ ...reportData, department: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Summary</label>
              <textarea
                placeholder="Ringkasan laporan..."
                value={reportData.summary}
                onChange={(e) => setReportData({ ...reportData, summary: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Data Table</h3>
              
              {/* Columns */}
              <div className="mb-3">
                <label className="block text-xs font-medium mb-2">Columns</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {reportData.columns.map((col, index) => (
                    <div key={index} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                      <span className="text-xs">{col}</span>
                      {index > 0 && (
                        <button
                          onClick={() => removeColumn(index)}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="New column name"
                    value={newColumn}
                    onChange={(e) => setNewColumn(e.target.value)}
                    className="flex-1 px-3 py-1 border rounded text-sm"
                  />
                  <button
                    onClick={addColumn}
                    disabled={!newColumn}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm disabled:bg-gray-300"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Add Row */}
              <div className="mb-3">
                <label className="block text-xs font-medium mb-2">Add Data Row</label>
                <div className="space-y-2">
                  {reportData.columns.slice(1).map((col) => (
                    <div key={col} className="flex gap-2">
                      <span className="text-xs w-24 pt-1">{col}:</span>
                      <input
                        type="text"
                        value={newRow[col] || ''}
                        onChange={(e) => setNewRow({ ...newRow, [col]: e.target.value })}
                        className="flex-1 px-3 py-1 border rounded text-sm"
                      />
                    </div>
                  ))}
                  <button
                    onClick={addRow}
                    disabled={reportData.columns.length <= 1}
                    className="w-full px-3 py-1 bg-green-600 text-white rounded text-sm disabled:bg-gray-300"
                  >
                    Add Row
                  </button>
                </div>
              </div>

              {/* Data Rows */}
              {reportData.dataRows.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50">
                      <tr>
                        {reportData.columns.map((col, index) => (
                          <th key={index} className="px-2 py-1 text-left">{col}</th>
                        ))}
                        <th className="px-2 py-1 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {reportData.dataRows.map((row, rowIndex) => (
                        <tr key={row.id}>
                          <td className="px-2 py-1">{rowIndex + 1}</td>
                          {reportData.columns.slice(1).map((col) => (
                            <td key={col} className="px-2 py-1">{row[col] || '-'}</td>
                          ))}
                          <td className="px-2 py-1 text-center">
                            <button
                              onClick={() => removeRow(row.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              ×
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Conclusion & Recommendations</h3>
              <div className="space-y-3">
                <textarea
                  placeholder="Conclusion..."
                  value={reportData.conclusion}
                  onChange={(e) => setReportData({ ...reportData, conclusion: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
                <textarea
                  placeholder="Recommendations..."
                  value={reportData.recommendations}
                  onChange={(e) => setReportData({ ...reportData, recommendations: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Preview</h2>
          <div ref={printRef} className="border rounded-lg p-8 bg-gray-50">
            {/* Header */}
            <div className="header text-center mb-6 border-b-4 border-double border-[#0A2540] pb-4">
              <div className="text-xl font-bold text-[#0A2540]">PT PERDANA ADI YUDA</div>
              <div className="text-xs text-gray-600 mt-1">
                Jl. Contoh Alamat No. 123, Jakarta 12345<br />
                Telp: (021) 1234-5678 | Email: info@perada.net
              </div>
            </div>

            {/* Report Title */}
            <div className="report-title text-center text-lg font-bold my-6 underline">
              {reportData.reportTitle || '[Judul Laporan]'}
            </div>

            {/* Report Info */}
            <div className="report-info mb-6">
              <div className="report-info-row">
                <div className="report-info-label">Tanggal Laporan</div>
                <div>: {formatDate(reportData.reportDate)}</div>
              </div>
              <div className="report-info-row">
                <div className="report-info-label">Periode</div>
                <div>: {reportData.reportPeriod || '-'}</div>
              </div>
              <div className="report-info-row">
                <div className="report-info-label">Disusun Oleh</div>
                <div>: {reportData.preparedBy || '-'}</div>
              </div>
              <div className="report-info-row">
                <div className="report-info-label">Departemen</div>
                <div>: {reportData.department || '-'}</div>
              </div>
            </div>

            {/* Summary */}
            {reportData.summary && (
              <div className="summary mb-6">
                <div className="font-bold mb-2">Ringkasan:</div>
                <div className="text-sm text-justify">{reportData.summary}</div>
              </div>
            )}

            {/* Data Table */}
            {reportData.dataRows.length > 0 && (
              <table className="w-full border-collapse mb-6">
                <thead>
                  <tr className="bg-[#0A2540] text-white">
                    {reportData.columns.map((col, index) => (
                      <th key={index} className="border border-gray-300 p-2 text-left text-xs">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reportData.dataRows.map((row, rowIndex) => (
                    <tr key={row.id}>
                      <td className="border border-gray-300 p-2 text-xs">{rowIndex + 1}</td>
                      {reportData.columns.slice(1).map((col) => (
                        <td key={col} className="border border-gray-300 p-2 text-xs">
                          {row[col] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Conclusion */}
            {reportData.conclusion && (
              <div className="conclusion mb-6">
                <div className="font-bold mb-2">Kesimpulan:</div>
                <div className="text-sm text-justify">{reportData.conclusion}</div>
              </div>
            )}

            {/* Recommendations */}
            {reportData.recommendations && (
              <div className="recommendations mb-6">
                <div className="font-bold mb-2">Rekomendasi:</div>
                <div className="text-sm text-justify whitespace-pre-line">{reportData.recommendations}</div>
              </div>
            )}

            {/* Signature */}
            <div className="signature mt-12 text-right">
              <div>Jakarta, {formatDate(reportData.reportDate)}</div>
              <div className="font-semibold mt-1">{reportData.preparedBy || '[Nama Pembuat]'}</div>
              <div>{reportData.department || '[Departemen]'}</div>
            </div>

            {/* Footer */}
            <div className="footer mt-12 text-center text-xs text-gray-500 border-t border-gray-300 pt-3">
              Dokumen ini dicetak secara elektronik oleh PT Perdana Adi Yuda
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
