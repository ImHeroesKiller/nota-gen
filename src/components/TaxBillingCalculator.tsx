import { useState } from 'react';

interface TaxData {
  transactionType: 'ppn' | 'pph23';
  baseAmount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  clientName: string;
  invoiceNumber: string;
  description: string;
}

interface TaxBillingCalculatorProps {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

export default function TaxBillingCalculator({ onBack, darkMode, setDarkMode }: TaxBillingCalculatorProps) {
  const [data, setData] = useState<TaxData>({
    transactionType: 'ppn',
    baseAmount: 0,
    taxRate: 11,
    taxAmount: 0,
    totalAmount: 0,
    clientName: '',
    invoiceNumber: '',
    description: '',
  });

  const calculate = () => {
    const taxAmount = data.baseAmount * (data.taxRate / 100);
    const totalAmount = data.baseAmount + taxAmount;
    setData({ ...data, taxAmount, totalAmount });
  };

  const handleTypeChange = (type: 'ppn' | 'pph23') => {
    const rate = type === 'ppn' ? 11 : 2;
    setData({ ...data, transactionType: type, taxRate: rate });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0A2540] to-[#1E3A5F] flex items-center justify-center">
          <span className="text-white text-xs font-bold">PA</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold">Tax Billing Calculator</h1>
          <p className="text-sm text-gray-600">PT Perdana Adi Yuda - Kalkulator PPN 11% & PPh 23</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Transaction Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Transaction Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleTypeChange('ppn')}
                  className={`px-4 py-3 rounded-lg font-semibold ${
                    data.transactionType === 'ppn'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  PPN 11%
                </button>
                <button
                  onClick={() => handleTypeChange('pph23')}
                  className={`px-4 py-3 rounded-lg font-semibold ${
                    data.transactionType === 'pph23'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  PPh 23 (2%)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Client Name</label>
              <input
                type="text"
                value={data.clientName}
                onChange={(e) => setData({ ...data, clientName: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="PT ABC Manufacturing"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Invoice Number</label>
              <input
                type="text"
                value={data.invoiceNumber}
                onChange={(e) => setData({ ...data, invoiceNumber: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="INV-2026-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={data.description}
                onChange={(e) => setData({ ...data, description: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Jasa outsourcing bulan Januari 2026"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Base Amount (DPP)</label>
              <input
                type="number"
                value={data.baseAmount}
                onChange={(e) => setData({ ...data, baseAmount: Number(e.target.value) })}
                onBlur={calculate}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tax Rate (%)</label>
              <input
                type="number"
                value={data.taxRate}
                onChange={(e) => setData({ ...data, taxRate: Number(e.target.value) })}
                onBlur={calculate}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={calculate}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              Calculate
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Tax Calculation</h2>
          
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Transaction Type</div>
              <div className="text-lg font-bold">
                {data.transactionType === 'ppn' ? 'PPN 11%' : 'PPh 23 (2%)'}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Client</div>
              <div className="text-lg font-bold">{data.clientName || '-'}</div>
              {data.invoiceNumber && (
                <div className="text-sm text-gray-600 mt-1">Invoice: {data.invoiceNumber}</div>
              )}
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Calculation Breakdown</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Amount (DPP):</span>
                  <span className="font-semibold">{formatCurrency(data.baseAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax Rate:</span>
                  <span className="font-semibold">{data.taxRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax Amount:</span>
                  <span className="font-semibold text-blue-600">{formatCurrency(data.taxAmount)}</span>
                </div>
              </div>
            </div>

            <div className="border-t-2 border-blue-500 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">Total Amount:</span>
                <span className="text-2xl font-bold text-blue-600">{formatCurrency(data.totalAmount)}</span>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="text-sm font-semibold text-yellow-900 mb-2">💡 Informasi:</div>
              <ul className="text-xs text-yellow-800 space-y-1">
                <li>• PPN 11% dikenakan pada penyerahan barang/jasa</li>
                <li>• PPh 23 (2%) dikenakan atas jasa outsourcing/logistik</li>
                <li>• Pastikan NPWP klien valid untuk pemotongan PPh</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
