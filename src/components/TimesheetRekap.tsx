import { useState } from 'react';

interface TimesheetEntry {
  id: string;
  employeeName: string;
  employeeId: string;
  clientName: string;
  date: string;
  checkIn: string;
  checkOut: string;
  regularHours: number;
  overtimeHours: number;
  status: 'present' | 'absent' | 'leave' | 'sick';
}

interface TimesheetRekapProps {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

export default function TimesheetRekap({ onBack, darkMode, setDarkMode }: TimesheetRekapProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-01');
  const [selectedClient, setSelectedClient] = useState<string>('all');

  // Dummy data
  const [timesheets] = useState<TimesheetEntry[]>([
    {
      id: '1',
      employeeName: 'Ahmad Fauzi',
      employeeId: 'EMP001',
      clientName: 'PT ABC Manufacturing',
      date: '2026-01-05',
      checkIn: '08:00',
      checkOut: '17:00',
      regularHours: 8,
      overtimeHours: 2,
      status: 'present',
    },
    {
      id: '2',
      employeeName: 'Siti Nurhaliza',
      employeeId: 'EMP002',
      clientName: 'PT ABC Manufacturing',
      date: '2026-01-05',
      checkIn: '08:15',
      checkOut: '17:30',
      regularHours: 8,
      overtimeHours: 1.5,
      status: 'present',
    },
    {
      id: '3',
      employeeName: 'Budi Santoso',
      employeeId: 'EMP003',
      clientName: 'PT XYZ Logistics',
      date: '2026-01-05',
      checkIn: '07:45',
      checkOut: '16:45',
      regularHours: 8,
      overtimeHours: 0,
      status: 'present',
    },
    {
      id: '4',
      employeeName: 'Dewi Lestari',
      employeeId: 'EMP004',
      clientName: 'PT XYZ Logistics',
      date: '2026-01-05',
      checkIn: '-',
      checkOut: '-',
      regularHours: 0,
      overtimeHours: 0,
      status: 'sick',
    },
    {
      id: '5',
      employeeName: 'Ahmad Fauzi',
      employeeId: 'EMP001',
      clientName: 'PT ABC Manufacturing',
      date: '2026-01-06',
      checkIn: '08:00',
      checkOut: '18:00',
      regularHours: 8,
      overtimeHours: 3,
      status: 'present',
    },
    {
      id: '6',
      employeeName: 'Siti Nurhaliza',
      employeeId: 'EMP002',
      clientName: 'PT ABC Manufacturing',
      date: '2026-01-06',
      checkIn: '-',
      checkOut: '-',
      regularHours: 0,
      overtimeHours: 0,
      status: 'leave',
    },
  ]);

  const filteredTimesheets = timesheets.filter(entry => {
    const matchesMonth = entry.date.startsWith(selectedMonth);
    const matchesClient = selectedClient === 'all' || entry.clientName === selectedClient;
    return matchesMonth && matchesClient;
  });

  const clients = Array.from(new Set(timesheets.map(t => t.clientName)));

  const getStatusBadge = (status: string) => {
    const styles = {
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
      leave: 'bg-yellow-100 text-yellow-800',
      sick: 'bg-orange-100 text-orange-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const totalRegularHours = filteredTimesheets.reduce((sum, t) => sum + t.regularHours, 0);
  const totalOvertimeHours = filteredTimesheets.reduce((sum, t) => sum + t.overtimeHours, 0);
  const presentCount = filteredTimesheets.filter(t => t.status === 'present').length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0A2540] to-[#1E3A5F] flex items-center justify-center">
            <span className="text-white text-xs font-bold">PA</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">Timesheet Rekapitulasi</h1>
            <p className="text-sm text-gray-600">PT Perdana Adi Yuda - Rekap Kehadiran & Lembur Karyawan</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Bulan</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
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
          <div className="text-sm text-gray-600 mb-1">Total Entries</div>
          <div className="text-2xl font-bold text-blue-600">{filteredTimesheets.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Hadir</div>
          <div className="text-2xl font-bold text-green-600">{presentCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Total Jam Regular</div>
          <div className="text-2xl font-bold text-purple-600">{totalRegularHours} jam</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Total Jam Lembur</div>
          <div className="text-2xl font-bold text-orange-600">{totalOvertimeHours} jam</div>
        </div>
      </div>

      {/* Timesheet Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Karyawan</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Klien</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check In</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check Out</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jam Regular</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jam Lembur</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTimesheets.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{entry.date}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">{entry.employeeName}</div>
                    <div className="text-xs text-gray-500">{entry.employeeId}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{entry.clientName}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{entry.checkIn}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{entry.checkOut}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-purple-600">{entry.regularHours} jam</td>
                  <td className="px-4 py-3 text-sm font-semibold text-orange-600">{entry.overtimeHours} jam</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(entry.status)}`}>
                      {entry.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredTimesheets.length === 0 && (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <p className="text-gray-500">Tidak ada data timesheet untuk periode yang dipilih</p>
        </div>
      )}
    </div>
  );
}
