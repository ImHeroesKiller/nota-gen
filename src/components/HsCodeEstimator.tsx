import React, { useState } from 'react';

interface HsCodeEstimatorProps {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

interface HsCode {
  code: string;
  description: string;
  category: string;
}

const dummyHsCodes: HsCode[] = [
  { code: '8471.30.10', description: 'Laptops', category: 'Electronics' },
  { code: '8517.12.00', description: 'Smartphones', category: 'Electronics' },
  { code: '6109.10.00', description: 'T-shirts', category: 'Textiles' },
  { code: '6204.62.00', description: 'Women\'s trousers', category: 'Textiles' },
  { code: '8703.23.40', description: 'Motor vehicles', category: 'Automotive' },
  { code: '8428.10.00', description: 'Elevators', category: 'Machinery' },
  { code: '3004.90.99', description: 'Pharmaceutical products', category: 'Pharmaceuticals' },
  { code: '0201.10.00', description: 'Fresh beef', category: 'Food' },
  { code: '2208.30.00', description: 'Whisky', category: 'Beverages' },
  { code: '3923.21.00', description: 'Plastic bags', category: 'Plastics' },
];

export default function HsCodeEstimator({ onBack, darkMode, setDarkMode }: HsCodeEstimatorProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCode, setSelectedCode] = useState<HsCode | null>(null);
  const [cifValue, setCifValue] = useState<string>('10000000');
  const [beaMasuk, setBeaMasuk] = useState<string>('10');
  const [ppn, setPpn] = useState<string>('11');
  const [pph, setPph] = useState<string>('2.5');

  const filteredCodes = dummyHsCodes.filter(code =>
    code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    code.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    code.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateTaxes = () => {
    const cif = parseFloat(cifValue) || 0;
    const bm = parseFloat(beaMasuk) || 0;
    const ppnRate = parseFloat(ppn) || 0;
    const pphRate = parseFloat(pph) || 0;

    const beaMasukAmount = cif * (bm / 100);
    const dpp = cif + beaMasukAmount;
    const ppnAmount = dpp * (ppnRate / 100);
    const pphAmount = dpp * (pphRate / 100);
    const totalImportDuty = beaMasukAmount + ppnAmount + pphAmount;
    const landedCost = cif + totalImportDuty;

    return {
      beaMasukAmount: beaMasukAmount.toFixed(0),
      ppnAmount: ppnAmount.toFixed(0),
      pphAmount: pphAmount.toFixed(0),
      totalImportDuty: totalImportDuty.toFixed(0),
      landedCost: landedCost.toFixed(0),
    };
  };

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount) || 0;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num);
  };

  const results = calculateTaxes();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">HS Code Estimator</h1>
        <p className="text-gray-600">Search HS codes and estimate import taxes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* HS Code Search */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">HS Code Search</h3>
          
          <div className="mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by code, description, or category..."
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredCodes.map((code, index) => (
              <div
                key={index}
                onClick={() => setSelectedCode(code)}
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  selectedCode?.code === code.code
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-mono font-bold text-sm">{code.code}</div>
                    <div className="text-sm text-gray-600 mt-1">{code.description}</div>
                  </div>
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                    {code.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tax Calculator */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">Import Tax Calculator</h3>
          
          {selectedCode && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-600">Selected HS Code:</div>
              <div className="font-mono font-bold">{selectedCode.code}</div>
              <div className="text-sm">{selectedCode.description}</div>
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">CIF Value (IDR)</label>
              <input
                type="number"
                value={cifValue}
                onChange={(e) => setCifValue(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter CIF value"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Bea Masuk (%)</label>
              <input
                type="number"
                value={beaMasuk}
                onChange={(e) => setBeaMasuk(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter import duty rate"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">PPN (%)</label>
              <input
                type="number"
                value={ppn}
                onChange={(e) => setPpn(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter VAT rate"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">PPh Impor (%)</label>
              <input
                type="number"
                value={pph}
                onChange={(e) => setPph(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter income tax rate"
              />
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Bea Masuk:</span>
              <span className="font-bold">{formatCurrency(results.beaMasukAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">PPN:</span>
              <span className="font-bold">{formatCurrency(results.ppnAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">PPh Impor:</span>
              <span className="font-bold">{formatCurrency(results.pphAmount)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="text-gray-600">Total Import Duty:</span>
              <span className="font-bold text-blue-600">{formatCurrency(results.totalImportDuty)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t-2 border-green-300">
              <span className="text-gray-700 font-semibold">Landed Cost:</span>
              <span className="text-xl font-bold text-green-600">{formatCurrency(results.landedCost)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
