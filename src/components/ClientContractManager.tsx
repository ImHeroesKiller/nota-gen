import { useState } from 'react';

interface Contract {
  id: string;
  contractNumber: string;
  contractType: 'MoU' | 'SPK' | 'Contract';
  clientName: string;
  contractValue: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'expiring' | 'expired';
  daysRemaining: number;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  notes: string;
  autoRenewal: boolean;
}

interface ClientContractManagerProps {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

export default function ClientContractManager({ onBack, darkMode, setDarkMode }: ClientContractManagerProps) {
  const [contracts, setContracts] = useState<Contract[]>([
    {
      id: '1',
      contractNumber: 'MoU-2025-001',
      contractType: 'MoU',
      clientName: 'PT ABC Manufacturing',
      contractValue: 5000000000,
      startDate: '2025-01-01',
      endDate: '2026-12-31',
      status: 'active',
      daysRemaining: 356,
      contactPerson: 'John Doe',
      contactEmail: 'john@abc.com',
      contactPhone: '021-12345678',
      notes: 'Kontrak outsourcing jasa logistik',
      autoRenewal: true,
    },
    {
      id: '2',
      contractNumber: 'SPK-2025-015',
      contractType: 'SPK',
      clientName: 'PT XYZ Logistics',
      contractValue: 2500000000,
      startDate: '2025-06-01',
      endDate: '2026-03-31',
      status: 'expiring',
      daysRemaining: 82,
      contactPerson: 'Jane Smith',
      contactEmail: 'jane@xyz.com',
      contactPhone: '021-87654321',
      notes: 'Perpanjangan perlu dibicarakan',
      autoRenewal: false,
    },
    {
      id: '3',
      contractNumber: 'CON-2024-008',
      contractType: 'Contract',
      clientName: 'PT DEF Trading',
      contractValue: 1500000000,
      startDate: '2024-01-01',
      endDate: '2025-12-31',
      status: 'expired',
      daysRemaining: 0,
      contactPerson: 'Ahmad Rahman',
      contactEmail: 'ahmad@def.com',
      contactPhone: '021-98765432',
      notes: 'Perlu follow up untuk perpanjangan',
      autoRenewal: false,
    },
  ]);

  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredContracts = filterStatus === 'all'
    ? contracts
    : contracts.filter(c => c.status === filterStatus);

  const getStatusBadge = (status: string) => {
    const styles = {
      'active': 'bg-green-100 text-green-800',
      'expiring': 'bg-yellow-100 text-yellow-800',
      'expired': 'bg-red-100 text-red-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const activeCount = contracts.filter(c => c.status === 'active').length;
  const expiringCount = contracts.filter(c => c.status === 'expiring').length;
  const expiredCount = contracts.filter(c => c.status === 'expired').length;
  const totalValue = contracts.filter(c => c.status === 'active' || c.status === 'expiring').reduce((sum, c) => sum + c.contractValue, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0A2540] to-[#1E3A5F] flex items-center justify-center">
          <span className="text-white text-xs font-bold">PA</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold">Client Contract Manager</h1>
          <p className="text-sm text-gray-600">PT Perdana Adi Yuda - Tracker Kontrak Kerja Sama B2B dengan Pengingat Perpanjangan</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Active Contracts</div>
          <div className="text-3xl font-bold text-green-600">{activeCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Expiring Soon</div>
          <div className="text-3xl font-bold text-yellow-600">{expiringCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Expired</div>
          <div className="text-3xl font-bold text-red-600">{expiredCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Total Contract Value</div>
          <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalValue)}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
        <div className="flex gap-3">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg font-semibold ${
              filterStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-4 py-2 rounded-lg font-semibold ${
              filterStatus === 'active' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilterStatus('expiring')}
            className={`px-4 py-2 rounded-lg font-semibold ${
              filterStatus === 'expiring' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Expiring
          </button>
          <button
            onClick={() => setFilterStatus('expired')}
            className={`px-4 py-2 rounded-lg font-semibold ${
              filterStatus === 'expired' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Expired
          </button>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contract No</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days Left</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredContracts.map(contract => (
                <tr key={contract.id} className={`hover:bg-gray-50 ${
                  contract.status === 'expired' ? 'bg-red-50' : 
                  contract.status === 'expiring' ? 'bg-yellow-50' : ''
                }`}>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">{contract.contractNumber}</div>
                    {contract.autoRenewal && (
                      <div className="text-xs text-blue-600">Auto-renewal</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {contract.contractType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{contract.clientName}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatCurrency(contract.contractValue)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <div>{contract.startDate}</div>
                    <div className="text-xs text-gray-500">to {contract.endDate}</div>
                  </td>
                  <td className="px-4 py-3">
                    {contract.daysRemaining > 0 ? (
                      <div className="text-sm font-semibold">
                        <span className={
                          contract.daysRemaining <= 30 ? 'text-red-600' :
                          contract.daysRemaining <= 90 ? 'text-yellow-600' : 'text-green-600'
                        }>
                          {contract.daysRemaining} days
                        </span>
                      </div>
                    ) : (
                      <div className="text-sm font-semibold text-red-600">Expired</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">{contract.contactPerson}</div>
                    <div className="text-xs text-gray-500">{contract.contactEmail}</div>
                    <div className="text-xs text-gray-500">{contract.contactPhone}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(contract.status)}`}>
                      {contract.status === 'active' ? '✓ Active' : 
                       contract.status === 'expiring' ? '⚠ Expiring' : '✗ Expired'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alerts */}
      {expiringCount > 0 && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-sm font-semibold text-yellow-900 mb-2">⚠️ Peringatan: Kontrak Segera Berakhir</div>
          <p className="text-xs text-yellow-800">
            Terdapat {expiringCount} kontrak yang akan berakhir dalam 90 hari ke depan. Segera lakukan negosiasi perpanjangan.
          </p>
        </div>
      )}

      {expiredCount > 0 && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-sm font-semibold text-red-900 mb-2">⚠️ Peringatan: Kontrak Kadaluarsa</div>
          <p className="text-xs text-red-800">
            Terdapat {expiredCount} kontrak yang sudah kadaluarsa. Segera follow up klien untuk perpanjangan atau kontrak baru.
          </p>
        </div>
      )}
    </div>
  );
}
