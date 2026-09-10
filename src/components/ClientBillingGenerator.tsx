import { useState } from 'react';

interface ClientBillingGeneratorProps {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

interface Client {
  id: string;
  name: string;
  address: string;
  npwp: string;
  pic: string;
  email: string;
  phone: string;
}

interface Worker {
  id: string;
  name: string;
  position: string;
  baseSalary: number;
  overtimeHours: number;
  overtimeRate: number;
}

interface BillingItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export default function ClientBillingGenerator({ onBack, darkMode, setDarkMode }: ClientBillingGeneratorProps) {
  const [clients] = useState<Client[]>([
    { id: '1', name: 'PT ABC Manufacturing', address: 'Jl. Industri No. 123, Jakarta', npwp: '01.234.567.8-901.000', pic: 'John Doe', email: 'john@abc.com', phone: '021-12345678' },
    { id: '2', name: 'PT XYZ Tower', address: 'Jl. Sudirman No. 456, Jakarta', npwp: '02.345.678.9-012.000', pic: 'Jane Smith', email: 'jane@xyz.com', phone: '021-87654321' },
    { id: '3', name: 'PT DEF Telecom', address: 'Jl. Telekomunikasi No. 789, Jakarta', npwp: '03.456.789.0-123.000', pic: 'Ahmad Rahman', email: 'ahmad@def.com', phone: '021-98765432' },
  ]);

  const [selectedClient, setSelectedClient] = useState<string>('');
  const [billingPeriod, setBillingPeriod] = useState<string>('2026-01');
  const [workers, setWorkers] = useState<Worker[]>([
    { id: '1', name: 'Ahmad Fauzi', position: 'Security Guard', baseSalary: 4500000, overtimeHours: 20, overtimeRate: 25000 },
    { id: '2', name: 'Siti Rahayu', position: 'Cleaning Service', baseSalary: 3800000, overtimeHours: 15, overtimeRate: 22000 },
    { id: '3', name: 'Budi Santoso', position: 'Security Guard', baseSalary: 4500000, overtimeHours: 10, overtimeRate: 25000 },
  ]);

  const [managementFee, setManagementFee] = useState<number>(15);
  const [additionalCharges, setAdditionalCharges] = useState<BillingItem[]>([]);

  const [newCharge, setNewCharge] = useState({
    description: '',
    quantity: 0,
    unitPrice: 0,
  });

  const addAdditionalCharge = () => {
    if (!newCharge.description || newCharge.quantity <= 0 || newCharge.unitPrice <= 0) return;
    
    const charge: BillingItem = {
      ...newCharge,
      total: newCharge.quantity * newCharge.unitPrice,
    };
    setAdditionalCharges([...additionalCharges, charge]);
    setNewCharge({ description: '', quantity: 0, unitPrice: 0 });
  };

  const removeAdditionalCharge = (index: number) => {
    setAdditionalCharges(additionalCharges.filter((_, i) => i !== index));
  };

  const calculateTotalSalary = () => {
    return workers.reduce((sum, w) => sum + w.baseSalary, 0);
  };

  const calculateTotalOvertime = () => {
    return workers.reduce((sum, w) => sum + (w.overtimeHours * w.overtimeRate), 0);
  };

  const calculateSubtotal = () => {
    const totalSalary = calculateTotalSalary();
    const totalOvertime = calculateTotalOvertime();
    const totalAdditional = additionalCharges.reduce((sum, c) => sum + c.total, 0);
    return totalSalary + totalOvertime + totalAdditional;
  };

  const calculateManagementFee = () => {
    return calculateSubtotal() * (managementFee / 100);
  };

  const calculatePPN = () => {
    return (calculateSubtotal() + calculateManagementFee()) * 0.11;
  };

  const calculateGrandTotal = () => {
    return calculateSubtotal() + calculateManagementFee() + calculatePPN();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const generateInvoice = () => {
    alert('Invoice generated successfully!');
  };

  const client = clients.find(c => c.id === selectedClient);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0A2540] to-[#1E3A5F] flex items-center justify-center">
            <span className="text-white text-xs font-bold">PA</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">Client Billing Generator</h1>
            <p className="text-sm text-gray-600">PT Perdana Adi Yuda - Generator Tagihan Bulanan Klien</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Billing Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select Client *</label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select Client --</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Billing Period *</label>
            <input
              type="month"
              value={billingPeriod}
              onChange={(e) => setBillingPeriod(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {client && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div><span className="font-semibold">Client:</span> {client.name}</div>
              <div><span className="font-semibold">NPWP:</span> {client.npwp}</div>
              <div><span className="font-semibold">PIC:</span> {client.pic}</div>
              <div><span className="font-semibold">Email:</span> {client.email}</div>
              <div><span className="font-semibold">Phone:</span> {client.phone}</div>
              <div><span className="font-semibold">Address:</span> {client.address}</div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Active Workers</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Base Salary</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">OT Hours</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">OT Rate</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">OT Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {workers.map(worker => (
                <tr key={worker.id}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{worker.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{worker.position}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(worker.baseSalary)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{worker.overtimeHours} hrs</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(worker.overtimeRate)}/hr</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatCurrency(worker.overtimeHours * worker.overtimeRate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Additional Charges</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Description</label>
            <input
              type="text"
              value={newCharge.description}
              onChange={(e) => setNewCharge({ ...newCharge, description: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Charge description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Quantity</label>
            <input
              type="number"
              min="0"
              value={newCharge.quantity}
              onChange={(e) => setNewCharge({ ...newCharge, quantity: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Unit Price</label>
            <input
              type="number"
              min="0"
              value={newCharge.unitPrice}
              onChange={(e) => setNewCharge({ ...newCharge, unitPrice: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <button
          onClick={addAdditionalCharge}
          disabled={!newCharge.description || newCharge.quantity <= 0 || newCharge.unitPrice <= 0}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Add Charge
        </button>

        {additionalCharges.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {additionalCharges.map((charge, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-sm text-gray-900">{charge.description}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{charge.quantity}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(charge.unitPrice)}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatCurrency(charge.total)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => removeAdditionalCharge(index)}
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
        )}
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Billing Summary</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Base Salary ({workers.length} workers):</span>
            <span className="font-semibold">{formatCurrency(calculateTotalSalary())}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Overtime:</span>
            <span className="font-semibold">{formatCurrency(calculateTotalOvertime())}</span>
          </div>
          {additionalCharges.length > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Additional Charges:</span>
              <span className="font-semibold">{formatCurrency(additionalCharges.reduce((sum, c) => sum + c.total, 0))}</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-3 border-t">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-bold text-lg">{formatCurrency(calculateSubtotal())}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Management Fee ({managementFee}%):</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="100"
                value={managementFee}
                onChange={(e) => setManagementFee(parseInt(e.target.value) || 0)}
                className="w-20 px-2 py-1 border rounded text-right"
              />
              <span className="font-semibold">{formatCurrency(calculateManagementFee())}</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">PPN (11%):</span>
            <span className="font-semibold">{formatCurrency(calculatePPN())}</span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t-2 border-blue-500">
            <span className="text-lg font-bold">Grand Total:</span>
            <span className="text-2xl font-bold text-blue-600">{formatCurrency(calculateGrandTotal())}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={generateInvoice}
          disabled={!selectedClient}
          className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
        >
          Generate Invoice
        </button>
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
