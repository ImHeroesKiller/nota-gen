import { useState, useRef } from 'react';

interface POItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

interface POData {
  poNumber: string;
  poDate: string;
  vendorName: string;
  vendorAddress: string;
  vendorContact: string;
  deliveryDate: string;
  paymentTerms: string;
  items: POItem[];
  subtotal: number;
  tax: number;
  taxRate: number;
  total: number;
  notes: string;
  requestedBy: string;
  approvedBy: string;
}

export default function PoBuilder() {
  const printRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<POData>({
    poNumber: `PO-${Date.now()}`,
    poDate: new Date().toISOString().split('T')[0],
    vendorName: '',
    vendorAddress: '',
    vendorContact: '',
    deliveryDate: '',
    paymentTerms: 'Net 30',
    items: [],
    subtotal: 0,
    tax: 0,
    taxRate: 11,
    total: 0,
    notes: '',
    requestedBy: '',
    approvedBy: '',
  });

  const [newItem, setNewItem] = useState({
    description: '',
    quantity: 1,
    unit: 'pcs',
    unitPrice: 0,
  });

  const addItem = () => {
    if (!newItem.description || newItem.quantity <= 0 || newItem.unitPrice <= 0) return;
    const item: POItem = {
      id: Date.now().toString(),
      ...newItem,
      total: newItem.quantity * newItem.unitPrice,
    };
    const updatedItems = [...data.items, item];
    calculateTotals(updatedItems);
    setNewItem({ description: '', quantity: 1, unit: 'pcs', unitPrice: 0 });
  };

  const removeItem = (id: string) => {
    const updatedItems = data.items.filter(item => item.id !== id);
    calculateTotals(updatedItems);
  };

  const calculateTotals = (items: POItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * (data.taxRate / 100);
    const total = subtotal + tax;
    setData({ ...data, items, subtotal, tax, total });
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
          <title>Purchase Order ${data.poNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; line-height: 1.4; font-size: 11px; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 3px double #0A2540; padding-bottom: 15px; }
            .company-name { font-size: 18px; font-weight: bold; color: #0A2540; }
            .company-address { font-size: 10px; color: #666; margin-top: 5px; }
            .doc-title { font-size: 16px; font-weight: bold; text-align: center; margin: 20px 0; text-decoration: underline; }
            .info-section { margin-bottom: 15px; }
            .info-row { display: flex; margin-bottom: 5px; }
            .info-label { width: 120px; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { border: 1px solid #000; padding: 6px; }
            th { background-color: #0A2540; color: white; }
            .total-section { text-align: right; margin-top: 20px; }
            .total-row { font-weight: bold; }
            .grand-total { font-size: 14px; color: #0A2540; }
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
            <h1 className="text-3xl font-bold">PO Builder</h1>
            <p className="text-sm text-gray-600">PT Perdana Adi Yuda - Purchase Order Generator</p>
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
          <h2 className="text-xl font-bold mb-4">PO Details</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">PO Number</label>
                <input
                  type="text"
                  value={data.poNumber}
                  onChange={(e) => setData({ ...data, poNumber: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">PO Date</label>
                <input
                  type="date"
                  value={data.poDate}
                  onChange={(e) => setData({ ...data, poDate: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Vendor Information</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Vendor Name"
                  value={data.vendorName}
                  onChange={(e) => setData({ ...data, vendorName: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  placeholder="Vendor Address"
                  value={data.vendorAddress}
                  onChange={(e) => setData({ ...data, vendorAddress: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
                <input
                  type="text"
                  placeholder="Contact Person / Phone"
                  value={data.vendorContact}
                  onChange={(e) => setData({ ...data, vendorContact: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Delivery Date</label>
                <input
                  type="date"
                  value={data.deliveryDate}
                  onChange={(e) => setData({ ...data, deliveryDate: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Payment Terms</label>
                <select
                  value={data.paymentTerms}
                  onChange={(e) => setData({ ...data, paymentTerms: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Net 30">Net 30</option>
                  <option value="Net 60">Net 60</option>
                  <option value="COD">COD</option>
                  <option value="Advance">Advance</option>
                </select>
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
                    type="number"
                    placeholder="Unit Price"
                    value={newItem.unitPrice}
                    onChange={(e) => setNewItem({ ...newItem, unitPrice: Number(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={addItem}
                  disabled={!newItem.description || newItem.quantity <= 0 || newItem.unitPrice <= 0}
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
                  placeholder="Notes / Special Instructions"
                  value={data.notes}
                  onChange={(e) => setData({ ...data, notes: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Requested By"
                    value={data.requestedBy}
                    onChange={(e) => setData({ ...data, requestedBy: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Approved By"
                    value={data.approvedBy}
                    onChange={(e) => setData({ ...data, approvedBy: e.target.value })}
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
                Jl. Contoh Alamat No. 123, Jakarta 12345<br />
                Telp: (021) 1234-5678 | Email: procurement@perada.net
              </div>
            </div>

            <div className="doc-title text-center text-base font-bold my-4 underline">
              PURCHASE ORDER
            </div>

            <div className="info-section mb-4">
              <div className="info-row">
                <div className="info-label">PO Number</div>
                <div>: {data.poNumber}</div>
              </div>
              <div className="info-row">
                <div className="info-label">PO Date</div>
                <div>: {data.poDate}</div>
              </div>
              <div className="info-row">
                <div className="info-label">Delivery Date</div>
                <div>: {data.deliveryDate || '-'}</div>
              </div>
              <div className="info-row">
                <div className="info-label">Payment Terms</div>
                <div>: {data.paymentTerms}</div>
              </div>
            </div>

            <div className="info-section mb-4">
              <div className="font-bold mb-1">Vendor:</div>
              <div>{data.vendorName || '-'}</div>
              <div className="text-[10px]">{data.vendorAddress || '-'}</div>
              <div className="text-[10px]">{data.vendorContact || '-'}</div>
            </div>

            {data.items.length > 0 && (
              <table className="w-full border-collapse mb-4">
                <thead>
                  <tr className="bg-[#0A2540] text-white">
                    <th className="border border-gray-300 p-2 text-left">No</th>
                    <th className="border border-gray-300 p-2 text-left">Description</th>
                    <th className="border border-gray-300 p-2 text-center">Qty</th>
                    <th className="border border-gray-300 p-2 text-center">Unit</th>
                    <th className="border border-gray-300 p-2 text-right">Unit Price</th>
                    <th className="border border-gray-300 p-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item, index) => (
                    <tr key={item.id}>
                      <td className="border border-gray-300 p-2">{index + 1}</td>
                      <td className="border border-gray-300 p-2">{item.description}</td>
                      <td className="border border-gray-300 p-2 text-center">{item.quantity}</td>
                      <td className="border border-gray-300 p-2 text-center">{item.unit}</td>
                      <td className="border border-gray-300 p-2 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="border border-gray-300 p-2 text-right">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="total-section">
              <div className="total-row mb-1">
                <span className="inline-block w-32">Subtotal:</span>
                <span>{formatCurrency(data.subtotal)}</span>
              </div>
              <div className="total-row mb-1">
                <span className="inline-block w-32">Tax ({data.taxRate}%):</span>
                <span>{formatCurrency(data.tax)}</span>
              </div>
              <div className="grand-total border-t-2 border-[#0A2540] pt-2 mt-2">
                <span className="inline-block w-32">Total:</span>
                <span>{formatCurrency(data.total)}</span>
              </div>
            </div>

            {data.notes && (
              <div className="notes mt-4">
                <strong>Notes:</strong> {data.notes}
              </div>
            )}

            <div className="signature mt-6">
              <div className="signature-box">
                <div className="text-[10px]">Requested By,</div>
                <div className="signature-line"></div>
                <div className="text-[10px] font-bold mt-1">{data.requestedBy || '[Name]'}</div>
              </div>
              <div className="signature-box">
                <div className="text-[10px]">Approved By,</div>
                <div className="signature-line"></div>
                <div className="text-[10px] font-bold mt-1">{data.approvedBy || '[Name]'}</div>
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
                        {item.quantity} {item.unit} × {formatCurrency(item.unitPrice)} = {formatCurrency(item.total)}
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
