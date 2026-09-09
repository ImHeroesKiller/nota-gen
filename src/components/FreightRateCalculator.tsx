import React, { useState } from 'react';

interface FreightRateCalculatorProps {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

export default function FreightRateCalculator({ onBack, darkMode, setDarkMode }: FreightRateCalculatorProps) {
  const [baseRate, setBaseRate] = useState<string>('1000');
  const [baf, setBaf] = useState<string>('150');
  const [caf, setCaf] = useState<string>('50');
  const [thc, setThc] = useState<string>('200');
  const [currency, setCurrency] = useState<string>('USD');
  const [exchangeRate, setExchangeRate] = useState<string>('15500');
  const [profitMargin, setProfitMargin] = useState<string>('20');

  const calculateCosts = () => {
    const base = parseFloat(baseRate) || 0;
    const bafAmount = parseFloat(baf) || 0;
    const cafAmount = parseFloat(caf) || 0;
    const thcAmount = parseFloat(thc) || 0;
    const rate = parseFloat(exchangeRate) || 1;
    const margin = parseFloat(profitMargin) || 0;

    const totalCost = base + bafAmount + cafAmount + thcAmount;
    const totalCostIDR = totalCost * rate;
    const profit = totalCostIDR * (margin / 100);
    const quotationPrice = totalCostIDR + profit;

    return {
      totalCost: totalCost.toFixed(2),
      totalCostIDR: totalCostIDR.toFixed(0),
      profit: profit.toFixed(0),
      quotationPrice: quotationPrice.toFixed(0),
    };
  };

  const formatCurrency = (amount: string, currency: string = 'IDR') => {
    const num = parseFloat(amount) || 0;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(num);
  };

  const results = calculateCosts();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Freight Rate Calculator</h1>
        <p className="text-gray-600">Calculate total shipping costs and client quotation</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-xl font-bold mb-4">Cost Components</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Base Rate (USD)</label>
            <input
              type="number"
              value={baseRate}
              onChange={(e) => setBaseRate(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter base rate"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">BAF - Bunker Adjustment Factor (USD)</label>
            <input
              type="number"
              value={baf}
              onChange={(e) => setBaf(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter BAF"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">CAF - Currency Adjustment Factor (USD)</label>
            <input
              type="number"
              value={caf}
              onChange={(e) => setCaf(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter CAF"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">THC - Terminal Handling Charge (USD)</label>
            <input
              type="number"
              value={thc}
              onChange={(e) => setThc(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter THC"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="IDR">IDR - Indonesian Rupiah</option>
              <option value="EUR">EUR - Euro</option>
              <option value="SGD">SGD - Singapore Dollar</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Exchange Rate (to IDR)</label>
            <input
              type="number"
              value={exchangeRate}
              onChange={(e) => setExchangeRate(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter exchange rate"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Target Profit Margin: {profitMargin}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={profitMargin}
            onChange={(e) => setProfitMargin(e.target.value)}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4">Calculation Results</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Cost (USD):</span>
            <span className="text-lg font-bold">${results.totalCost}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Cost (IDR):</span>
            <span className="text-lg font-bold">{formatCurrency(results.totalCostIDR)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Profit ({profitMargin}%):</span>
            <span className="text-lg font-bold text-green-600">{formatCurrency(results.profit)}</span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t-2 border-blue-300">
            <span className="text-gray-700 font-semibold">Client Quotation Price:</span>
            <span className="text-2xl font-bold text-blue-600">{formatCurrency(results.quotationPrice)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
