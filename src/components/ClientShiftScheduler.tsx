import { useState } from 'react';

interface Shift {
  id: string;
  employeeName: string;
  employeeId: string;
  division: string;
  client: string;
  date: string;
  shiftStart: string;
  shiftEnd: string;
  shiftType: 'morning' | 'afternoon' | 'night';
  status: 'scheduled' | 'confirmed' | 'cancelled';
}

interface ScheduleConflict {
  id: string;
  employeeName: string;
  conflictDate: string;
  shift1: string;
  shift2: string;
  severity: 'warning' | 'error';
}

interface ClientShiftSchedulerProps {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

export default function ClientShiftScheduler({ onBack, darkMode, setDarkMode }: ClientShiftSchedulerProps) {
  const [shifts] = useState<Shift[]>([
    {
      id: '1',
      employeeName: 'Ahmad Fauzi',
      employeeId: 'EMP001',
      division: 'Security',
      client: 'PT ABC Manufacturing',
      date: '2026-01-10',
      shiftStart: '06:00',
      shiftEnd: '14:00',
      shiftType: 'morning',
      status: 'confirmed',
    },
    {
      id: '2',
      employeeName: 'Budi Santoso',
      employeeId: 'EMP002',
      division: 'Security',
      client: 'PT ABC Manufacturing',
      date: '2026-01-10',
      shiftStart: '14:00',
      shiftEnd: '22:00',
      shiftType: 'afternoon',
      status: 'scheduled',
    },
    {
      id: '3',
      employeeName: 'Cahyo Widodo',
      employeeId: 'EMP003',
      division: 'Security',
      client: 'PT ABC Manufacturing',
      date: '2026-01-10',
      shiftStart: '22:00',
      shiftEnd: '06:00',
      shiftType: 'night',
      status: 'confirmed',
    },
    {
      id: '4',
      employeeName: 'Dedi Kurniawan',
      employeeId: 'EMP004',
      division: 'Cleaning Service',
      client: 'PT XYZ Tower',
      date: '2026-01-10',
      shiftStart: '07:00',
      shiftEnd: '15:00',
      shiftType: 'morning',
      status: 'confirmed',
    },
  ]);

  const [conflicts] = useState<ScheduleConflict[]>([
    {
      id: '1',
      employeeName: 'Ahmad Fauzi',
      conflictDate: '2026-01-12',
      shift1: '06:00 - 14:00 (PT ABC)',
      shift2: '13:00 - 21:00 (PT DEF)',
      severity: 'error',
    },
    {
      id: '2',
      employeeName: 'Budi Santoso',
      conflictDate: '2026-01-15',
      shift1: '14:00 - 22:00 (PT ABC)',
      shift2: '21:00 - 05:00 (PT GHI)',
      severity: 'warning',
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [filterDate, setFilterDate] = useState<string>('2026-01-10');
  const [filterClient, setFilterClient] = useState<string>('all');
  const [filterDivision, setFilterDivision] = useState<string>('all');

  const clients = Array.from(new Set(shifts.map(s => s.client)));
  const divisions = Array.from(new Set(shifts.map(s => s.division)));

  const filteredShifts = shifts.filter(s => {
    const matchDate = s.date === filterDate;
    const matchClient = filterClient === 'all' || s.client === filterClient;
    const matchDivision = filterDivision === 'all' || s.division === filterDivision;
    return matchDate && matchClient && matchDivision;
  });

  const getShiftTypeBadge = (type: string) => {
    const styles = {
      morning: 'bg-yellow-100 text-yellow-800',
      afternoon: 'bg-orange-100 text-orange-800',
      night: 'bg-blue-100 text-blue-800',
    };
    return styles[type as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      scheduled: 'bg-gray-100 text-gray-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const getConflictBadge = (severity: string) => {
    const styles = {
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
    };
    return styles[severity as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const morningCount = filteredShifts.filter(s => s.shiftType === 'morning').length;
  const afternoonCount = filteredShifts.filter(s => s.shiftType === 'afternoon').length;
  const nightCount = filteredShifts.filter(s => s.shiftType === 'night').length;
  const confirmedCount = filteredShifts.filter(s => s.status === 'confirmed').length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0A2540] to-[#1E3A5F] flex items-center justify-center">
            <span className="text-white text-xs font-bold">PA</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">Client Shift & Scheduling Hub</h1>
            <p className="text-sm text-gray-600">PT Perdana Adi Yuda - Perencana Jadwal Kerja 24/7</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Morning Shift</div>
          <div className="text-3xl font-bold text-yellow-600">{morningCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Afternoon Shift</div>
          <div className="text-3xl font-bold text-orange-600">{afternoonCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Night Shift</div>
          <div className="text-3xl font-bold text-blue-600">{nightCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Confirmed</div>
          <div className="text-3xl font-bold text-green-600">{confirmedCount}</div>
        </div>
      </div>

      {/* Conflict Alerts */}
      {conflicts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-red-800 mb-3">⚠️ Schedule Conflicts Detected</h3>
          <div className="space-y-2">
            {conflicts.map((conflict) => (
              <div key={conflict.id} className="flex items-center justify-between bg-white p-3 rounded">
                <div>
                  <div className="font-medium">{conflict.employeeName}</div>
                  <div className="text-sm text-gray-600">
                    {conflict.conflictDate}: {conflict.shift1} vs {conflict.shift2}
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getConflictBadge(conflict.severity)}`}>
                  {conflict.severity === 'error' ? 'Conflict' : 'Warning'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Date</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Client</label>
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
            <label className="block text-sm font-medium mb-2">Division</label>
            <select
              value={filterDivision}
              onChange={(e) => setFilterDivision(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Divisions</option>
              {divisions.map(div => (
                <option key={div} value={div}>{div}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setShowForm(!showForm)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {showForm ? 'Batal' : '+ Add Shift'}
            </button>
          </div>
        </div>
      </div>

      {/* Add Shift Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-bold mb-4">Add New Shift</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Employee</label>
              <input type="text" className="w-full px-3 py-2 border rounded-lg" placeholder="Employee name" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Employee ID</label>
              <input type="text" className="w-full px-3 py-2 border rounded-lg" placeholder="EMP001" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Client</label>
              <input type="text" className="w-full px-3 py-2 border rounded-lg" placeholder="Client name" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Division</label>
              <input type="text" className="w-full px-3 py-2 border rounded-lg" placeholder="Security" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <input type="date" className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Shift Type</label>
              <select className="w-full px-3 py-2 border rounded-lg">
                <option value="morning">Morning (06:00 - 14:00)</option>
                <option value="afternoon">Afternoon (14:00 - 22:00)</option>
                <option value="night">Night (22:00 - 06:00)</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Save Shift
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Shift Schedule Table */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Shift Schedule - {filterDate}</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Division</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shift Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shift Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredShifts.map((shift) => (
                <tr key={shift.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">{shift.employeeName}</div>
                    <div className="text-xs text-gray-500">{shift.employeeId}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{shift.division}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{shift.client}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                    {shift.shiftStart} - {shift.shiftEnd}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getShiftTypeBadge(shift.shiftType)}`}>
                      {shift.shiftType === 'morning' ? 'Morning' : shift.shiftType === 'afternoon' ? 'Afternoon' : 'Night'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(shift.status)}`}>
                      {shift.status === 'scheduled' ? 'Scheduled' : shift.status === 'confirmed' ? 'Confirmed' : 'Cancelled'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {shift.status === 'scheduled' && (
                        <button className="text-green-600 hover:text-green-700 text-sm">
                          Confirm
                        </button>
                      )}
                      <button className="text-blue-600 hover:text-blue-700 text-sm">
                        Edit
                      </button>
                      <button className="text-red-600 hover:text-red-700 text-sm">
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredShifts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Tidak ada shift untuk tanggal dan filter yang dipilih
          </div>
        )}
      </div>
    </div>
  );
}
