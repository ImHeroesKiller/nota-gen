import React, { useState } from 'react';

export default function OutsourcingQuotation() {
  const [headcount, setHeadcount] = useState<number>(10);
  const [umk, setUmk] = useState<number>(5000000);
  const [bpjsPercentage, setBpjsPercentage] = useState<number>(11);
  const [thrPercentage, setThrPercentage] = useState<number>(8.33);
  const [allowance, setAllowance] = useState<number>(500000);
  const [managementFee, setManagementFee] = useState<number>(15);

  const calculateQuotation = () => {
    const bpjsPerHead = umk * (bpjsPercentage / 100);
    const thrPerHead = umk * (thrPercentage / 100);
    const baseSalary = umk + allowance;
    const subtotalPerHead = baseSalary + bpjsPerHead + thrPerHead;
    const managementFeeAmount = subtotalPerHead * (managementFee / 100);
    const totalPerHead = subtotalPerHead + managementFeeAmount;
    const grandTotal = totalPerHead * headcount;

    return {
      bpjsPerHead,
      thrPerHead,
      baseSalary,
      subtotalPerHead,
      managementFeeAmount,
      totalPerHead,
      grandTotal,
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const results = calculateQuotation();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0A2540] to-[#1E3A5F] flex items-center justify-center">
            <span className="text-white text-xs font-bold">PA</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">Outsourcing Quotation Calculator</h1>
            <p className="text-sm text-gray-600">PT Perdana Adi Yuda - Human Capital & Outsourcing</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Input Parameters</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Headcount (Jumlah Pekerja)
              </label>
              <input
                type="number"
                value={headcount}
                onChange={(e) => setHeadcount(Number(e.target.value))}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                UMK (Upah Minimum Kota) per Bulan
              </label>
              <input
                type="number"
                value={umk}
                onChange={(e) => setUmk(Number(e.target.value))}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                BPJS (%) - Kesehatan & Ketenagakerjaan
              </label>
              <input
                type="number"
                value={bpjsPercentage}
                onChange={(e) => setBpjsPercentage(Number(e.target.value))}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                step="0.1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                THR (%) - Tunjangan Hari Raya
              </label>
              <input
                type="number"
                value={thrPercentage}
                onChange={(e) => setThrPercentage(Number(e.target.value))}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Tunjangan Lainnya per Bulan
              </label>
              <input
                type="number"
                value={allowance}
                onChange={(e) => setAllowance(Number(e.target.value))}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Management Fee (%)
              </label>
              <input
                type="number"
                value={managementFee}
                onChange={(e) => setManagementFee(Number(e.target.value))}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                step="0.1"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Quotation Results</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-sm">Base Salary (UMK + Tunjangan):</span>
              <span className="font-semibold">{formatCurrency(results.baseSalary)}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-sm">BPJS per Head:</span>
              <span className="font-semibold">{formatCurrency(results.bpjsPerHead)}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-sm">THR per Head:</span>
              <span className="font-semibold">{formatCurrency(results.thrPerHead)}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-blue-50 rounded border-2 border-blue-200">
              <span className="text-sm font-medium">Subtotal per Head:</span>
              <span className="font-bold text-blue-700">{formatCurrency(results.subtotalPerHead)}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-sm">Management Fee ({managementFee}%):</span>
              <span className="font-semibold">{formatCurrency(results.managementFeeAmount)}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-green-50 rounded border-2 border-green-300">
              <span className="text-sm font-medium">Total per Head:</span>
              <span className="font-bold text-green-700 text-lg">{formatCurrency(results.totalPerHead)}</span>
            </div>

            <div className="mt-4 p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white">
              <div className="text-sm mb-1">Grand Total ({headcount} Headcount):</div>
              <div className="text-3xl font-bold">{formatCurrency(results.grandTotal)}</div>
              <div className="text-xs mt-2 opacity-90">per bulan</div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              <strong>Note:</strong> Perhitungan ini adalah estimasi awal. Quotation final akan disesuaikan dengan kebutuhan spesifik klien dan ketentuan yang berlaku.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
