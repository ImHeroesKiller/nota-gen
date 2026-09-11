import { useState } from 'react';

interface Employee {
  id: string;
  name: string;
  employeeId: string;
  clientName: string;
  bpjsNumber: string;
  status: 'active' | 'inactive';
  joinDate: string;
  resignDate: string;
  bpjsHealth: number;
  bpjsEmployment: number;
  totalContribution: number;
}

interface BpjsAdminManagerProps {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

export default function BpjsAdminManager({ onBack, darkMode, setDarkMode }: BpjsAdminManagerProps) {
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: '1',
      name: 'Ahmad Fauzi',
      employeeId: 'EMP001',
      clientName: 'PT ABC Manufacturing',
      bpjsNumber: '0001234567890',
      status: 'active',
      joinDate: '2025-01-15',
      resignDate: '',
      bpjsHealth: 150000,
      bpjsEmployment: 200000,
      totalContribution: 350000,
    },
    {
      id: '2',
      name: 'Budi Santoso',
      employeeId: 'EMP002',
      clientName: 'PT ABC Manufacturing',
      bpjsNumber: '0001234567891',
      status: 'active',
      joinDate: '2025-02-01',
      resignDate: '',
      bpjsHealth: 150000,
      bpjsEmployment: 200000,
      totalContribution: 350000,
    },
    {
      id: '3',
      name: 'Cahyo Widodo',
      employeeId: 'EMP003',
      clientName: 'PT XYZ Logistics',
      bpjsNumber: '0001234567892',
      status: 'inactive',
      joinDate: '2024-06-01',
      resignDate: '2025-12-31',
      bpjsHealth: 150000,
      bpjsEmployment: 200000,
      totalContribution: 350000,
    },
  ]);

  const [filterClient, setFilterClient] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const clients = Array.from(new Set(employees.map(e => e.clientName)));

  const filteredEmployees = employees.filter(emp => {
    const matchClient = filterClient === 'all' || emp.clientName === filterClient;
    const matchStatus = filterStatus === 'all' || emp.status === filterStatus;
    return matchClient && matchStatus;
  });

  const activeCount = employees.filter(e => e.status === 'active').length;
  const inactiveCount = employees.filter(e => e.status === 'inactive').length;
  const totalContribution = employees.filter(e => e.status === 'active').reduce((sum, e) => sum + e.totalContribution, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0A2540] to-[#1E3A5F] flex items-center justify-center">
          <span className="text-white text-xs font-bold">PA</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold">BPJS Admin Manager</h1>
          <p className="text-sm text-gray-600">PT Perdana Adi Yuda - Rekapitulasi Kepesertaan dan Iuran BPJS</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Total Employees</div>
          <div className="text-3xl font-bold text-blue-600">{employees.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Active Participants</div>
          <div className="text-3xl font-bold text-green-600">{activeCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Inactive Participants</div>
          <div className="text-3xl font-bold text-gray-600">{inactiveCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Monthly Contribution</div>
          <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalContribution)}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Filter by Client</label>
            <select
              value={filterClient}
              onChange={(e) => setFilterClient(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Clients</option>
              {clients.map(client => (
                <option key={client} value={client}>{client}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Employee Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">BPJS Number</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Join Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">BPJS Kesehatan</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">BPJS TK</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEmployees.map(emp => (
                <tr key={emp.id} className={`hover:bg-gray-50 ${emp.status === 'inactive' ? 'bg-gray-50' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">{emp.name}</div>
                    <div className="text-xs text-gray-500">{emp.employeeId}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{emp.clientName}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-mono">{emp.bpjsNumber}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      emp.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{emp.joinDate}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(emp.bpjsHealth)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(emp.bpjsEmployment)}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-blue-600">{formatCurrency(emp.totalContribution)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary by Client */}
      <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Summary by Client</h2>
        <div className="space-y-3">
          {clients.map(client => {
            const clientEmployees = employees.filter(e => e.clientName === client && e.status === 'active');
            const totalContribution = clientEmployees.reduce((sum, e) => sum + e.totalContribution, 0);
            
            return (
              <div key={client} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{client}</div>
                  <div className="text-xs text-gray-600">{clientEmployees.length} active participants</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">{formatCurrency(totalContribution)}</div>
                  <div className="text-xs text-gray-600">monthly contribution</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
