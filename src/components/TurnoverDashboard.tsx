import React, { useState } from 'react';

interface EmployeeMovement {
  id: string;
  employeeName: string;
  clientName: string;
  position: string;
  type: 'join' | 'resign';
  date: string;
  reason?: string;
}

export default function TurnoverDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2026');
  const [selectedClient, setSelectedClient] = useState<string>('all');

  // Dummy data
  const [movements] = useState<EmployeeMovement[]>([
    { id: '1', employeeName: 'Ahmad Fauzi', clientName: 'PT ABC Manufacturing', position: 'Staff Admin', type: 'join', date: '2026-01-05' },
    { id: '2', employeeName: 'Siti Nurhaliza', clientName: 'PT ABC Manufacturing', position: 'Operator', type: 'join', date: '2026-01-10' },
    { id: '3', employeeName: 'Budi Santoso', clientName: 'PT XYZ Logistics', position: 'Driver', type: 'resign', date: '2026-01-15', reason: 'Pindah domisili' },
    { id: '4', employeeName: 'Dewi Lestari', clientName: 'PT XYZ Logistics', position: 'Warehouse', type: 'join', date: '2026-01-20' },
    { id: '5', employeeName: 'Eko Prasetyo', clientName: 'PT ABC Manufacturing', position: 'Security', type: 'resign', date: '2026-02-01', reason: 'Kontrak habis' },
    { id: '6', employeeName: 'Fitri Handayani', clientName: 'PT DEF Services', position: 'Cleaner', type: 'join', date: '2026-02-05' },
    { id: '7', employeeName: 'Gunawan Wibowo', clientName: 'PT DEF Services', position: 'Gardener', type: 'resign', date: '2026-02-10', reason: 'Alasan pribadi' },
    { id: '8', employeeName: 'Hadi Sucipto', clientName: 'PT ABC Manufacturing', position: 'Staff Admin', type: 'join', date: '2026-02-15' },
  ]);

  const filteredMovements = movements.filter(m => {
    const matchesPeriod = m.date.startsWith(selectedPeriod);
    const matchesClient = selectedClient === 'all' || m.clientName === selectedClient;
    return matchesPeriod && matchesClient;
  });

  const clients = Array.from(new Set(movements.map(m => m.clientName)));

  const joinCount = filteredMovements.filter(m => m.type === 'join').length;
  const resignCount = filteredMovements.filter(m => m.type === 'resign').length;
  const turnoverRate = joinCount + resignCount > 0 
    ? ((resignCount / (joinCount + resignCount)) * 100).toFixed(1)
    : '0';

  // Monthly data for chart
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = String(i + 1).padStart(2, '0');
    const monthMovements = filteredMovements.filter(m => m.date.includes(`-${month}-`));
    return {
      month: new Date(2026, i).toLocaleDateString('id-ID', { month: 'short' }),
      joins: monthMovements.filter(m => m.type === 'join').length,
      resigns: monthMovements.filter(m => m.type === 'resign').length,
    };
  });

  const maxCount = Math.max(...monthlyData.map(d => Math.max(d.joins, d.resigns)), 1);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0A2540] to-[#1E3A5F] flex items-center justify-center">
            <span className="text-white text-xs font-bold">PA</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">Turnover Dashboard</h1>
            <p className="text-sm text-gray-600">PT Perdana Adi Yuda - Monitoring Keluar-Masuk Karyawan</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Periode</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Klien</label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Klien</option>
              {clients.map(client => (
                <option key={client} value={client}>{client}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Total Masuk (Join)</div>
          <div className="text-3xl font-bold text-green-600">{joinCount}</div>
          <div className="text-xs text-gray-500 mt-1">Karyawan baru</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Total Keluar (Resign)</div>
          <div className="text-3xl font-bold text-red-600">{resignCount}</div>
          <div className="text-xs text-gray-500 mt-1">Karyawan keluar</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Turnover Rate</div>
          <div className="text-3xl font-bold text-orange-600">{turnoverRate}%</div>
          <div className="text-xs text-gray-500 mt-1">Rasio keluar/masuk</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Net Movement</div>
          <div className={`text-3xl font-bold ${joinCount - resignCount >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {joinCount - resignCount >= 0 ? '+' : ''}{joinCount - resignCount}
          </div>
          <div className="text-xs text-gray-500 mt-1">Selisih masuk-keluar</div>
        </div>
      </div>

      {/* Monthly Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Monthly Movement</h2>
        <div className="space-y-2">
          {monthlyData.map((data, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="w-12 text-sm font-medium text-gray-600">{data.month}</div>
              <div className="flex-1 flex items-center gap-2">
                <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden relative">
                  <div
                    className="h-full bg-green-500 flex items-center justify-end pr-2 text-white text-xs font-semibold transition-all"
                    style={{ width: `${(data.joins / maxCount) * 100}%` }}
                  >
                    {data.joins > 0 && data.joins}
                  </div>
                </div>
                <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden relative">
                  <div
                    className="h-full bg-red-500 flex items-center justify-end pr-2 text-white text-xs font-semibold transition-all"
                    style={{ width: `${(data.resigns / maxCount) * 100}%` }}
                  >
                    {data.resigns > 0 && data.resigns}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Join</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Resign</span>
          </div>
        </div>
      </div>

      {/* Movement List */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">Employee Movement Log</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Karyawan</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Klien</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Posisi</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipe</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alasan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMovements.map((movement) => (
                <tr key={movement.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{movement.date}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{movement.employeeName}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{movement.clientName}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{movement.position}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      movement.type === 'join' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {movement.type === 'join' ? '↑ Join' : '↓ Resign'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{movement.reason || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredMovements.length === 0 && (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center mt-6">
          <p className="text-gray-500">Tidak ada data movement untuk periode yang dipilih</p>
        </div>
      )}
    </div>
  );
}
