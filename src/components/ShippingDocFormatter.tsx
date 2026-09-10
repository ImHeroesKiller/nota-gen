import { useState, useRef } from 'react';

interface PackageItem {
  id: string;
  description: string;
  quantity: number;
  weight: number;
  dimensions: string;
  hsCode: string;
  unitValue: number;
  totalValue: number;
  origin: string;
}

interface ShippingData {
  documentType: 'packing-list' | 'commercial-invoice';
  documentNumber: string;
  documentDate: string;
  shipperName: string;
  shipperAddress: string;
  shipperContact: string;
  consigneeName: string;
  consigneeAddress: string;
  consigneeContact: string;
  invoiceNumber: string;
  poNumber: string;
  blNumber: string;
  vesselName: string;
  voyageNumber: string;
  portOfLoading: string;
  portOfDischarge: string;
  placeOfDelivery: string;
  shippingMarks: string;
  packages: PackageItem[];
  totalPackages: number;
  totalWeight: number;
  totalVolume: string;
  totalValue: number;
  currency: string;
  paymentTerms: string;
  incoterms: string;
  notes: string;
}

export default function ShippingDocFormatter() {
  const printRef = useRef<HTMLDivElement>(null);
  const [shippingData, setShippingData] = useState<ShippingData>({
    documentType: 'packing-list',
    documentNumber: `PL-${Date.now()}`,
    documentDate: new Date().toISOString().split('T')[0],
    shipperName: '',
    shipperAddress: '',
    shipperContact: '',
    consigneeName: '',
    consigneeAddress: '',
    consigneeContact: '',
    invoiceNumber: '',
    poNumber: '',
    blNumber: '',
    vesselName: '',
    voyageNumber: '',
    portOfLoading: '',
    portOfDischarge: '',
    placeOfDelivery: '',
    shippingMarks: '',
    packages: [],
    totalPackages: 0,
    totalWeight: 0,
    totalVolume: '',
    totalValue: 0,
    currency: 'USD',
    paymentTerms: 'T/T',
    incoterms: 'FOB',
    notes: '',
  });

  const [newPackage, setNewPackage] = useState<Omit<PackageItem, 'id' | 'totalValue'>>({
    description: '',
    quantity: 1,
    weight: 0,
    dimensions: '',
    hsCode: '',
    unitValue: 0,
    origin: '',
  });

  const addPackage = () => {
    if (!newPackage.description || newPackage.quantity <= 0) return;

    const pkg: PackageItem = {
      id: Date.now().toString(),
      ...newPackage,
      totalValue: newPackage.quantity * newPackage.unitValue,
    };

    const updatedPackages = [...shippingData.packages, pkg];
    const totalPackages = updatedPackages.reduce((sum, p) => sum + p.quantity, 0);
    const totalWeight = updatedPackages.reduce((sum, p) => sum + (p.quantity * p.weight), 0);
    const totalValue = updatedPackages.reduce((sum, p) => sum + p.totalValue, 0);

    setShippingData({
      ...shippingData,
      packages: updatedPackages,
      totalPackages,
      totalWeight,
      totalValue,
    });

    setNewPackage({
      description: '',
      quantity: 1,
      weight: 0,
      dimensions: '',
      hsCode: '',
      unitValue: 0,
      origin: '',
    });
  };

  const removePackage = (id: string) => {
    const updatedPackages = shippingData.packages.filter(p => p.id !== id);
    const totalPackages = updatedPackages.reduce((sum, p) => sum + p.quantity, 0);
    const totalWeight = updatedPackages.reduce((sum, p) => sum + (p.quantity * p.weight), 0);
    const totalValue = updatedPackages.reduce((sum, p) => sum + p.totalValue, 0);

    setShippingData({
      ...shippingData,
      packages: updatedPackages,
      totalPackages,
      totalWeight,
      totalValue,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: shippingData.currency,
      minimumFractionDigits: 2,
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
          <title>${shippingData.documentType === 'packing-list' ? 'Packing List' : 'Commercial Invoice'} ${shippingData.documentNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; line-height: 1.4; font-size: 11px; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #0A2540; padding-bottom: 15px; }
            .company-name { font-size: 16px; font-weight: bold; color: #0A2540; }
            .company-address { font-size: 10px; color: #666; margin-top: 3px; }
            .doc-title { font-size: 14px; font-weight: bold; text-align: center; margin: 20px 0; text-decoration: underline; }
            .info-section { display: flex; justify-content: space-between; margin-bottom: 15px; }
            .info-box { width: 48%; }
            .info-label { font-weight: bold; font-size: 10px; }
            .info-content { font-size: 11px; margin-top: 3px; }
            .shipping-info { margin-bottom: 15px; font-size: 10px; }
            .shipping-info-row { display: inline-block; margin-right: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 10px; }
            th, td { border: 1px solid #000; padding: 5px; text-align: left; }
            th { background-color: #0A2540; color: white; font-size: 9px; }
            .total-row { font-weight: bold; background-color: #f0f0f0; }
            .summary { margin-top: 15px; font-size: 10px; }
            .summary-row { margin-bottom: 3px; }
            .notes { margin-top: 15px; font-size: 10px; font-style: italic; }
            .footer { margin-top: 30px; text-align: center; font-size: 9px; color: #999; border-top: 1px solid #ddd; padding-top: 8px; }
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
            <h1 className="text-3xl font-bold">Shipping Document Formatter</h1>
            <p className="text-sm text-gray-600">PT Perdana Adi Yuda - Generator Packing List & Commercial Invoice</p>
          </div>
        </div>
        <button
          onClick={handlePrint}
          disabled={shippingData.packages.length === 0}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
        >
          🖨️ Print / Save PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Document Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Document Type</label>
              <select
                value={shippingData.documentType}
                onChange={(e) => setShippingData({ ...shippingData, documentType: e.target.value as any })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="packing-list">Packing List</option>
                <option value="commercial-invoice">Commercial Invoice</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Document Number</label>
                <input
                  type="text"
                  value={shippingData.documentNumber}
                  onChange={(e) => setShippingData({ ...shippingData, documentNumber: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Document Date</label>
                <input
                  type="date"
                  value={shippingData.documentDate}
                  onChange={(e) => setShippingData({ ...shippingData, documentDate: e.target.value })}
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
                  value={shippingData.shipperName}
                  onChange={(e) => setShippingData({ ...shippingData, shipperName: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  placeholder="Shipper Address"
                  value={shippingData.shipperAddress}
                  onChange={(e) => setShippingData({ ...shippingData, shipperAddress: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
                <input
                  type="text"
                  placeholder="Contact (Phone/Email)"
                  value={shippingData.shipperContact}
                  onChange={(e) => setShippingData({ ...shippingData, shipperContact: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Consignee Information</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Consignee Name"
                  value={shippingData.consigneeName}
                  onChange={(e) => setShippingData({ ...shippingData, consigneeName: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  placeholder="Consignee Address"
                  value={shippingData.consigneeAddress}
                  onChange={(e) => setShippingData({ ...shippingData, consigneeAddress: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
                <input
                  type="text"
                  placeholder="Contact (Phone/Email)"
                  value={shippingData.consigneeContact}
                  onChange={(e) => setShippingData({ ...shippingData, consigneeContact: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {shippingData.documentType === 'commercial-invoice' && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Invoice Details</h3>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Invoice Number"
                    value={shippingData.invoiceNumber}
                    onChange={(e) => setShippingData({ ...shippingData, invoiceNumber: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="PO Number"
                    value={shippingData.poNumber}
                    onChange={(e) => setShippingData({ ...shippingData, poNumber: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Shipping Details</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Vessel Name"
                    value={shippingData.vesselName}
                    onChange={(e) => setShippingData({ ...shippingData, vesselName: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Voyage Number"
                    value={shippingData.voyageNumber}
                    onChange={(e) => setShippingData({ ...shippingData, voyageNumber: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <input
                  type="text"
                  placeholder="B/L Number"
                  value={shippingData.blNumber}
                  onChange={(e) => setShippingData({ ...shippingData, blNumber: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Port of Loading"
                    value={shippingData.portOfLoading}
                    onChange={(e) => setShippingData({ ...shippingData, portOfLoading: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Port of Discharge"
                    value={shippingData.portOfDischarge}
                    onChange={(e) => setShippingData({ ...shippingData, portOfDischarge: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Place of Delivery"
                    value={shippingData.placeOfDelivery}
                    onChange={(e) => setShippingData({ ...shippingData, placeOfDelivery: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <select
                    value={shippingData.currency}
                    onChange={(e) => setShippingData({ ...shippingData, currency: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="USD">USD</option>
                    <option value="IDR">IDR</option>
                    <option value="EUR">EUR</option>
                    <option value="SGD">SGD</option>
                  </select>
                  <select
                    value={shippingData.paymentTerms}
                    onChange={(e) => setShippingData({ ...shippingData, paymentTerms: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="T/T">T/T</option>
                    <option value="L/C">L/C</option>
                    <option value="D/P">D/P</option>
                    <option value="D/A">D/A</option>
                  </select>
                  <select
                    value={shippingData.incoterms}
                    onChange={(e) => setShippingData({ ...shippingData, incoterms: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="EXW">EXW</option>
                    <option value="FOB">FOB</option>
                    <option value="CFR">CFR</option>
                    <option value="CIF">CIF</option>
                    <option value="DAP">DAP</option>
                    <option value="DDP">DDP</option>
                  </select>
                </div>
                <textarea
                  placeholder="Shipping Marks"
                  value={shippingData.shippingMarks}
                  onChange={(e) => setShippingData({ ...shippingData, shippingMarks: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Add Package</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Description"
                  value={newPackage.description}
                  onChange={(e) => setNewPackage({ ...newPackage, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={newPackage.quantity}
                    onChange={(e) => setNewPackage({ ...newPackage, quantity: Number(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Weight (kg)"
                    value={newPackage.weight}
                    onChange={(e) => setNewPackage({ ...newPackage, weight: Number(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Dimensions"
                    value={newPackage.dimensions}
                    onChange={(e) => setNewPackage({ ...newPackage, dimensions: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="HS Code"
                    value={newPackage.hsCode}
                    onChange={(e) => setNewPackage({ ...newPackage, hsCode: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Unit Value"
                    value={newPackage.unitValue}
                    onChange={(e) => setNewPackage({ ...newPackage, unitValue: Number(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Origin"
                    value={newPackage.origin}
                    onChange={(e) => setNewPackage({ ...newPackage, origin: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={addPackage}
                  disabled={!newPackage.description || newPackage.quantity <= 0}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Add Package
                </button>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Notes</h3>
              <textarea
                placeholder="Additional notes..."
                value={shippingData.notes}
                onChange={(e) => setShippingData({ ...shippingData, notes: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Preview</h2>
          <div ref={printRef} className="border rounded-lg p-6 bg-gray-50 text-xs">
            {/* Header */}
            <div className="header text-center mb-4 border-b-2 border-[#0A2540] pb-3">
              <div className="text-base font-bold text-[#0A2540]">PT PERDANA ADI YUDA</div>
              <div className="text-[10px] text-gray-600 mt-1">
                Jl. Contoh Alamat No. 123, Jakarta 12345, Indonesia<br />
                Telp: (021) 1234-5678 | Email: export@perada.net
              </div>
            </div>

            {/* Document Title */}
            <div className="doc-title text-center text-sm font-bold my-4 underline">
              {shippingData.documentType === 'packing-list' ? 'PACKING LIST' : 'COMMERCIAL INVOICE'}
            </div>

            {/* Document Info */}
            <div className="flex justify-between mb-3 text-[10px]">
              <div>
                <div><strong>No:</strong> {shippingData.documentNumber}</div>
                <div><strong>Date:</strong> {shippingData.documentDate}</div>
              </div>
              {shippingData.documentType === 'commercial-invoice' && (
                <div className="text-right">
                  {shippingData.invoiceNumber && <div><strong>Invoice No:</strong> {shippingData.invoiceNumber}</div>}
                  {shippingData.poNumber && <div><strong>PO No:</strong> {shippingData.poNumber}</div>}
                </div>
              )}
            </div>

            {/* Shipper & Consignee */}
            <div className="info-section mb-3">
              <div className="info-box">
                <div className="info-label">SHIPPER:</div>
                <div className="info-content">
                  <div className="font-semibold">{shippingData.shipperName || '-'}</div>
                  <div>{shippingData.shipperAddress || '-'}</div>
                  <div>{shippingData.shipperContact || '-'}</div>
                </div>
              </div>
              <div className="info-box">
                <div className="info-label">CONSIGNEE:</div>
                <div className="info-content">
                  <div className="font-semibold">{shippingData.consigneeName || '-'}</div>
                  <div>{shippingData.consigneeAddress || '-'}</div>
                  <div>{shippingData.consigneeContact || '-'}</div>
                </div>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="shipping-info mb-3 text-[10px]">
              {shippingData.vesselName && <span className="shipping-info-row"><strong>Vessel:</strong> {shippingData.vesselName}</span>}
              {shippingData.voyageNumber && <span className="shipping-info-row"><strong>Voy:</strong> {shippingData.voyageNumber}</span>}
              {shippingData.blNumber && <span className="shipping-info-row"><strong>B/L:</strong> {shippingData.blNumber}</span>}
              {shippingData.portOfLoading && <span className="shipping-info-row"><strong>POL:</strong> {shippingData.portOfLoading}</span>}
              {shippingData.portOfDischarge && <span className="shipping-info-row"><strong>POD:</strong> {shippingData.portOfDischarge}</span>}
              {shippingData.placeOfDelivery && <span className="shipping-info-row"><strong>DEL:</strong> {shippingData.placeOfDelivery}</span>}
            </div>

            {/* Package Table */}
            {shippingData.packages.length > 0 && (
              <table className="w-full border-collapse mb-3">
                <thead>
                  <tr className="bg-[#0A2540] text-white">
                    <th className="border border-gray-300 p-1 text-left text-[9px]">No</th>
                    <th className="border border-gray-300 p-1 text-left text-[9px]">Description</th>
                    <th className="border border-gray-300 p-1 text-center text-[9px]">Qty</th>
                    <th className="border border-gray-300 p-1 text-center text-[9px]">Weight</th>
                    <th className="border border-gray-300 p-1 text-center text-[9px]">Dimensions</th>
                    {shippingData.documentType === 'commercial-invoice' && (
                      <>
                        <th className="border border-gray-300 p-1 text-center text-[9px]">HS Code</th>
                        <th className="border border-gray-300 p-1 text-center text-[9px]">Origin</th>
                        <th className="border border-gray-300 p-1 text-right text-[9px]">Unit Price</th>
                        <th className="border border-gray-300 p-1 text-right text-[9px]">Total</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {shippingData.packages.map((pkg, index) => (
                    <tr key={pkg.id}>
                      <td className="border border-gray-300 p-1 text-[10px]">{index + 1}</td>
                      <td className="border border-gray-300 p-1 text-[10px]">{pkg.description}</td>
                      <td className="border border-gray-300 p-1 text-center text-[10px]">{pkg.quantity}</td>
                      <td className="border border-gray-300 p-1 text-center text-[10px]">{pkg.weight} kg</td>
                      <td className="border border-gray-300 p-1 text-center text-[10px]">{pkg.dimensions || '-'}</td>
                      {shippingData.documentType === 'commercial-invoice' && (
                        <>
                          <td className="border border-gray-300 p-1 text-center text-[10px]">{pkg.hsCode || '-'}</td>
                          <td className="border border-gray-300 p-1 text-center text-[10px]">{pkg.origin || '-'}</td>
                          <td className="border border-gray-300 p-1 text-right text-[10px]">{formatCurrency(pkg.unitValue)}</td>
                          <td className="border border-gray-300 p-1 text-right text-[10px]">{formatCurrency(pkg.totalValue)}</td>
                        </>
                      )}
                    </tr>
                  ))}
                  <tr className="total-row">
                    <td colSpan={2} className="border border-gray-300 p-1 text-[10px] font-bold">TOTAL</td>
                    <td className="border border-gray-300 p-1 text-center text-[10px] font-bold">{shippingData.totalPackages}</td>
                    <td className="border border-gray-300 p-1 text-center text-[10px] font-bold">{shippingData.totalWeight} kg</td>
                    <td className="border border-gray-300 p-1 text-center text-[10px]">-</td>
                    {shippingData.documentType === 'commercial-invoice' && (
                      <>
                        <td colSpan={2} className="border border-gray-300 p-1"></td>
                        <td className="border border-gray-300 p-1 text-right text-[10px] font-bold">{formatCurrency(shippingData.totalValue)}</td>
                      </>
                    )}
                  </tr>
                </tbody>
              </table>
            )}

            {/* Summary */}
            <div className="summary mb-3 text-[10px]">
              <div className="summary-row"><strong>Total Packages:</strong> {shippingData.totalPackages} pcs</div>
              <div className="summary-row"><strong>Total Weight:</strong> {shippingData.totalWeight} kg</div>
              {shippingData.totalVolume && <div className="summary-row"><strong>Total Volume:</strong> {shippingData.totalVolume}</div>}
              {shippingData.shippingMarks && <div className="summary-row"><strong>Shipping Marks:</strong> {shippingData.shippingMarks}</div>}
            </div>

            {/* Payment Terms */}
            {shippingData.documentType === 'commercial-invoice' && (
              <div className="text-[10px] mb-3">
                <div><strong>Payment Terms:</strong> {shippingData.paymentTerms}</div>
                <div><strong>Incoterms:</strong> {shippingData.incoterms}</div>
                <div><strong>Currency:</strong> {shippingData.currency}</div>
              </div>
            )}

            {/* Notes */}
            {shippingData.notes && (
              <div className="notes text-[10px] italic">
                {shippingData.notes}
              </div>
            )}

            {/* Footer */}
            <div className="footer mt-6 text-center text-[9px] text-gray-500 border-t border-gray-300 pt-2">
              PT Perdana Adi Yuda - Export Documentation
            </div>
          </div>

          {/* Package List */}
          {shippingData.packages.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Packages ({shippingData.packages.length})</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {shippingData.packages.map((pkg, index) => (
                  <div key={pkg.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex-1">
                      <div className="text-xs font-medium">{index + 1}. {pkg.description}</div>
                      <div className="text-[10px] text-gray-600">
                        Qty: {pkg.quantity} | Weight: {pkg.weight}kg | {pkg.dimensions || '-'}
                      </div>
                    </div>
                    <button
                      onClick={() => removePackage(pkg.id)}
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
