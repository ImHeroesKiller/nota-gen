import { useState, useRef } from 'react';

interface SuratJalanItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  remarks: string;
}

interface SuratJalanData {
  documentNumber: string;
  documentDate: string;
  vehicleNumber: string;
  driverName: string;
  shipperName: string;
  shipperAddress: string;
  consigneeName: string;
  consigneeAddress: string;
  consigneeContact: string;
  items: SuratJalanItem[];
  notes: string;
  receivedBy: string;
  receivedDate: string;
}

export default function SuratJalanMaker() {
  const printRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<SuratJalanData>({
    documentNumber: `SJ-${Date.now()}`,
    documentDate: new Date().toISOString().split('T')[0],
    vehicleNumber: '',
    driverName: '',
    shipperName: '',
    shipperAddress: '',
    consigneeName: '',
    consigneeAddress: '',
    consigneeContact: '',
    items: [],
    notes: '',
    receivedBy: '',
    receivedDate: '',
  });

  const [newItem, setNewItem] = useState({
    description: '',
    quantity: 1,
    unit: 'pcs',
    remarks: '',
  });

  const addItem = () => {
    if (!newItem.description || newItem.quantity <= 0) return;
    const item: SuratJalanItem = {
      id: Date.now().toString(),
      ...newItem,
    };
    setData({ ...data, items: [...data.items, item] });
    setNewItem({ description: '', quantity: 1, unit: 'pcs', remarks: '' });
  };

  const removeItem = (id: string) => {
    setData({ ...data, items: data.items.filter(item => item.id !== id) });
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Surat Jalan ${data.documentNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; line-height: 1.4; font-size: 11px; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 3px double #0A2540; padding-bottom: 15px; }
            .company-name { font-size: 18px; font-weight: bold; color: #0A2540; }
            .company-address { font-size: 10px; color: #666; margin-top: 5px; }
            .doc-title { font-size: 14px; font-weight: bold; text-align: center; margin: 20px 0; text-decoration: underline; }
            .info-section { margin-bottom: 15px; }
            .info-row { display: flex; margin-bottom: 5px; }
            .info-label { width: 120px; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { border: 1px solid #000; padding: 6px; }
            th { background-color: #0A2540; color: white; }
            .signature { margin-top: 40px; display: flex; justify-content: space-between; }
            .signature-box { width: 45%; text-align: center; }
            .signature-line { margin-top: 50px; border-top: 1px solid #000; }
            .notes { margin-top: 20px; font-style: italic; }
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
            <h1 className="text-3xl font-bold">Surat Jalan Maker</h1>
            <p className="text-sm text-gray-600">PT Perdana Adi Yuda - Generator Surat Jalan / Delivery Order</p>
          </div>
        </div>
        <button
          onClick={handlePrint}
          disabled={data.items.length === 0}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
        >
          🖨️ Print / Save PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Surat Jalan Details</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Document Number</label>
                <input
                  type="text"
                  value={data.documentNumber}
                  onChange={(e) => setData({ ...data, documentNumber: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <input
                  type="date"
                  value={data.documentDate}
                  onChange={(e) => setData({ ...data, documentDate: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Vehicle Number</label>
                <input
                  type="text"
                  value={data.vehicleNumber}
                  onChange={(e) => setData({ ...data, vehicleNumber: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="B 1234 ABC"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Driver Name</label>
                <input
                  type="text"
                  value={data.driverName}
                  onChange={(e) => setData({ ...data, driverName: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Shipper Information</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Shipper Name"
                  value={data.shipperName}
                  onChange={(e) => setData({ ...data, shipperName: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  placeholder="Shipper Address"
                  value={data.shipperAddress}
                  onChange={(e) => setData({ ...data, shipperAddress: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Consignee Information</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Consignee Name"
                  value={data.consigneeName}
                  onChange={(e) => setData({ ...data, consigneeName: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  placeholder="Consignee Address"
                  value={data.consigneeAddress}
                  onChange={(e) => setData({ ...data, consigneeAddress: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
                <input
                  type="text"
                  placeholder="Contact Person / Phone"
                  value={data.consigneeContact}
                  onChange={(e) => setData({ ...data, consigneeContact: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Add Item</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Description"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Unit"
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Remarks"
                    value={newItem.remarks}
                    onChange={(e) => setNewItem({ ...newItem, remarks: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={addItem}
                  disabled={!newItem.description || newItem.quantity <= 0}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Add Item
                </button>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Additional Information</h3>
              <div className="space-y-3">
                <textarea
                  placeholder="Notes"
                  value={data.notes}
                  onChange={(e) => setData({ ...data, notes: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Received By"
                    value={data.receivedBy}
                    onChange={(e) => setData({ ...data, receivedBy: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="date"
                    value={data.receivedDate}
                    onChange={(e) => setData({ ...data, receivedDate: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
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
                Plaza Summarecon Bekasi Lt. 7, Jl. Boulevard Ahmad Yani, Bekasi 17145<br />
                Telp: (021) 1234-5678 | Email: logistics@perada.net
              </div>
            </div>

            <div className="doc-title text-center text-sm font-bold my-4 underline">
              SURAT JALAN
            </div>

            <div className="info-section mb-4">
              <div className="info-row">
                <div className="info-label">No. Surat Jalan</div>
                <div>: {data.documentNumber}</div>
              </div>
              <div className="info-row">
                <div className="info-label">Tanggal</div>
                <div>: {data.documentDate}</div>
              </div>
              <div className="info-row">
                <div className="info-label">No. Kendaraan</div>
                <div>: {data.vehicleNumber || '-'}</div>
              </div>
              <div className="info-row">
                <div className="info-label">Nama Driver</div>
                <div>: {data.driverName || '-'}</div>
              </div>
            </div>

            <div className="info-section mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="font-bold mb-1">Pengirim:</div>
                  <div>{data.shipperName || '-'}</div>
                  <div className="text-[10px]">{data.shipperAddress || '-'}</div>
                </div>
                <div>
                  <div className="font-bold mb-1">Penerima:</div>
                  <div>{data.consigneeName || '-'}</div>
                  <div className="text-[10px]">{data.consigneeAddress || '-'}</div>
                  <div className="text-[10px]">{data.consigneeContact || '-'}</div>
                </div>
              </div>
            </div>

            {data.items.length > 0 && (
              <table className="w-full border-collapse mb-4">
                <thead>
                  <tr className="bg-[#0A2540] text-white">
                    <th className="border border-gray-300 p-2 text-left">No</th>
                    <th className="border border-gray-300 p-2 text-left">Description</th>
                    <th className="border border-gray-300 p-2 text-center">Qty</th>
                    <th className="border border-gray-300 p-2 text-center">Unit</th>
                    <th className="border border-gray-300 p-2 text-left">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item, index) => (
                    <tr key={item.id}>
                      <td className="border border-gray-300 p-2">{index + 1}</td>
                      <td className="border border-gray-300 p-2">{item.description}</td>
                      <td className="border border-gray-300 p-2 text-center">{item.quantity}</td>
                      <td className="border border-gray-300 p-2 text-center">{item.unit}</td>
                      <td className="border border-gray-300 p-2">{item.remarks || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {data.notes && (
              <div className="notes mb-4">
                <strong>Catatan:</strong> {data.notes}
              </div>
            )}

            <div className="signature mt-6">
              <div className="signature-box">
                <div className="text-[10px]">Hormat Kami,</div>
                <div className="signature-line"></div>
                <div className="text-[10px] font-bold mt-1">PT Perdana Adi Yuda</div>
              </div>
              <div className="signature-box">
                <div className="text-[10px]">Penerima,</div>
                <div className="signature-line"></div>
                <div className="text-[10px] font-bold mt-1">{data.receivedBy || '[Nama Penerima]'}</div>
                {data.receivedDate && <div className="text-[10px]">{data.receivedDate}</div>}
              </div>
            </div>

            <div className="footer mt-6 text-center text-[9px] text-gray-500 border-t border-gray-300 pt-2">
              Dokumen ini dicetak secara elektronik oleh PT Perdana Adi Yuda
            </div>
          </div>

          {/* Items List */}
          {data.items.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Items ({data.items.length})</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {data.items.map((item, index) => (
                  <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex-1">
                      <div className="text-xs font-medium">{index + 1}. {item.description}</div>
                      <div className="text-[10px] text-gray-600">
                        {item.quantity} {item.unit} {item.remarks && `• ${item.remarks}`}
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
