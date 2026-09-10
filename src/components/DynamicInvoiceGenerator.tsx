import { useState, useRef } from 'react';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  clientName: string;
  clientAddress: string;
  clientEmail: string;
  clientPhone: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  taxRate: number;
  total: number;
  notes: string;
  paymentTerms: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export default function DynamicInvoiceGenerator() {
  const printRef = useRef<HTMLDivElement>(null);
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber: `INV-${Date.now()}`,
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    clientName: '',
    clientAddress: '',
    clientEmail: '',
    clientPhone: '',
    items: [],
    subtotal: 0,
    tax: 0,
    taxRate: 11,
    total: 0,
    notes: '',
    paymentTerms: 'Net 30',
    bankName: 'Bank Central Asia',
    accountNumber: '1234567890',
    accountName: 'PT Perdana Adi Yuda',
  });

  const [newItem, setNewItem] = useState({
    description: '',
    quantity: 1,
    unitPrice: 0,
  });

  const addItem = () => {
    if (!newItem.description || newItem.quantity <= 0 || newItem.unitPrice <= 0) return;

    const item: InvoiceItem = {
      id: Date.now().toString(),
      description: newItem.description,
      quantity: newItem.quantity,
      unitPrice: newItem.unitPrice,
      total: newItem.quantity * newItem.unitPrice,
    };

    setInvoiceData({
      ...invoiceData,
      items: [...invoiceData.items, item],
    });

    setNewItem({ description: '', quantity: 1, unitPrice: 0 });
    calculateTotals([...invoiceData.items, item]);
  };

  const removeItem = (id: string) => {
    const updatedItems = invoiceData.items.filter(item => item.id !== id);
    setInvoiceData({ ...invoiceData, items: updatedItems });
    calculateTotals(updatedItems);
  };

  const calculateTotals = (items: InvoiceItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * (invoiceData.taxRate / 100);
    const total = subtotal + tax;

    setInvoiceData({
      ...invoiceData,
      subtotal,
      tax,
      total,
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
          <title>Invoice ${invoiceData.invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .company-name { font-size: 24px; font-weight: bold; color: #0A2540; }
            .company-address { font-size: 12px; color: #666; }
            .invoice-title { font-size: 20px; font-weight: bold; margin: 20px 0; }
            .info-section { margin-bottom: 20px; }
            .info-label { font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #0A2540; color: white; }
            .total-section { text-align: right; margin-top: 20px; }
            .total-row { font-weight: bold; font-size: 14px; }
            .grand-total { font-size: 18px; color: #0A2540; }
            .payment-info { margin-top: 30px; padding: 15px; background-color: #f5f5f5; }
            .notes { margin-top: 20px; font-size: 12px; color: #666; }
            .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #999; }
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
            <h1 className="text-3xl font-bold">Dynamic Invoice Generator</h1>
            <p className="text-sm text-gray-600">PT Perdana Adi Yuda - Generator Invoice Profesional</p>
          </div>
        </div>
        <button
          onClick={handlePrint}
          disabled={invoiceData.items.length === 0}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
        >
          🖨️ Print / Save PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Invoice Details</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Invoice Number</label>
                <input
                  type="text"
                  value={invoiceData.invoiceNumber}
                  onChange={(e) => setInvoiceData({ ...invoiceData, invoiceNumber: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Invoice Date</label>
                <input
                  type="date"
                  value={invoiceData.invoiceDate}
                  onChange={(e) => setInvoiceData({ ...invoiceData, invoiceDate: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Due Date</label>
              <input
                type="date"
                value={invoiceData.dueDate}
                onChange={(e) => setInvoiceData({ ...invoiceData, dueDate: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Client Information</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Client Name"
                  value={invoiceData.clientName}
                  onChange={(e) => setInvoiceData({ ...invoiceData, clientName: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  placeholder="Client Address"
                  value={invoiceData.clientAddress}
                  onChange={(e) => setInvoiceData({ ...invoiceData, clientAddress: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="email"
                    placeholder="Email"
                    value={invoiceData.clientEmail}
                    onChange={(e) => setInvoiceData({ ...invoiceData, clientEmail: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={invoiceData.clientPhone}
                    onChange={(e) => setInvoiceData({ ...invoiceData, clientPhone: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
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
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
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
              <h3 className="font-semibold mb-3">Payment Information</h3>
              <div className="space-y-3">
                <select
                  value={invoiceData.paymentTerms}
                  onChange={(e) => setInvoiceData({ ...invoiceData, paymentTerms: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Net 30">Net 30</option>
                  <option value="Net 60">Net 60</option>
                  <option value="Net 90">Net 90</option>
                  <option value="COD">COD</option>
                </select>
                <input
                  type="text"
                  placeholder="Bank Name"
                  value={invoiceData.bankName}
                  onChange={(e) => setInvoiceData({ ...invoiceData, bankName: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Account Number"
                  value={invoiceData.accountNumber}
                  onChange={(e) => setInvoiceData({ ...invoiceData, accountNumber: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Account Name"
                  value={invoiceData.accountName}
                  onChange={(e) => setInvoiceData({ ...invoiceData, accountName: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <label className="block text-sm font-medium mb-2">Notes</label>
              <textarea
                placeholder="Additional notes..."
                value={invoiceData.notes}
                onChange={(e) => setInvoiceData({ ...invoiceData, notes: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Preview</h2>
          <div ref={printRef} className="border rounded-lg p-6 bg-gray-50">
            <div className="header text-center mb-6">
              <div className="company-name text-2xl font-bold text-[#0A2540]">PT PERDANA ADI YUDA</div>
              <div className="company-address text-xs text-gray-600">
                Jl. Contoh Alamat No. 123, Jakarta 12345<br />
                Telp: (021) 1234-5678 | Email: info@perada.net
              </div>
            </div>

            <div className="invoice-title text-xl font-bold text-center mb-4">INVOICE</div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <div className="info-label text-sm font-bold">Invoice No:</div>
                <div className="text-sm">{invoiceData.invoiceNumber}</div>
                <div className="info-label text-sm font-bold mt-2">Date:</div>
                <div className="text-sm">{invoiceData.invoiceDate}</div>
                <div className="info-label text-sm font-bold mt-2">Due Date:</div>
                <div className="text-sm">{invoiceData.dueDate}</div>
              </div>
              <div>
                <div className="info-label text-sm font-bold">Bill To:</div>
                <div className="text-sm font-semibold">{invoiceData.clientName || '-'}</div>
                <div className="text-xs text-gray-600">{invoiceData.clientAddress || '-'}</div>
                <div className="text-xs text-gray-600">{invoiceData.clientEmail || '-'}</div>
                <div className="text-xs text-gray-600">{invoiceData.clientPhone || '-'}</div>
              </div>
            </div>

            <table className="w-full border-collapse mb-4">
              <thead>
                <tr className="bg-[#0A2540] text-white">
                  <th className="border border-gray-300 p-2 text-left text-xs">Description</th>
                  <th className="border border-gray-300 p-2 text-center text-xs">Qty</th>
                  <th className="border border-gray-300 p-2 text-right text-xs">Unit Price</th>
                  <th className="border border-gray-300 p-2 text-right text-xs">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.items.map(item => (
                  <tr key={item.id}>
                    <td className="border border-gray-300 p-2 text-xs">{item.description}</td>
                    <td className="border border-gray-300 p-2 text-center text-xs">{item.quantity}</td>
                    <td className="border border-gray-300 p-2 text-right text-xs">{formatCurrency(item.unitPrice)}</td>
                    <td className="border border-gray-300 p-2 text-right text-xs">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="total-section text-right">
              <div className="total-row mb-1">
                <span className="inline-block w-32">Subtotal:</span>
                <span>{formatCurrency(invoiceData.subtotal)}</span>
              </div>
              <div className="total-row mb-1">
                <span className="inline-block w-32">Tax ({invoiceData.taxRate}%):</span>
                <span>{formatCurrency(invoiceData.tax)}</span>
              </div>
              <div className="grand-total border-t-2 border-[#0A2540] pt-2 mt-2">
                <span className="inline-block w-32">Total:</span>
                <span>{formatCurrency(invoiceData.total)}</span>
              </div>
            </div>

            <div className="payment-info mt-6 p-4 bg-gray-100 rounded">
              <div className="font-bold text-sm mb-2">Payment Information:</div>
              <div className="text-xs">Payment Terms: {invoiceData.paymentTerms}</div>
              <div className="text-xs">Bank: {invoiceData.bankName}</div>
              <div className="text-xs">Account No: {invoiceData.accountNumber}</div>
              <div className="text-xs">Account Name: {invoiceData.accountName}</div>
            </div>

            {invoiceData.notes && (
              <div className="notes mt-4">
                <div className="font-bold text-xs mb-1">Notes:</div>
                <div className="text-xs">{invoiceData.notes}</div>
              </div>
            )}

            <div className="footer mt-8 text-center text-xs text-gray-500">
              Thank you for your business!<br />
              PT Perdana Adi Yuda
            </div>
          </div>
        </div>
      </div>

      {/* Items List */}
      {invoiceData.items.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">Invoice Items</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoiceData.items.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-center">{item.quantity}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(item.unitPrice)}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">{formatCurrency(item.total)}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
