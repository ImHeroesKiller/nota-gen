import { useState } from 'react';

interface DailyAttendanceProps {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

interface Employee {
  id: string;
  name: string;
  employeeId: string;
  position: string;
  site: string;
  shiftPattern: string;
}

interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  shift: 'day' | 'night' | 'fifo-in' | 'fifo-out';
  checkIn: string;
  checkOut: string;
  regularHours: number;
  overtimeHours: number;
  status: 'present' | 'absent' | 'leave' | 'sick' | 'off-duty';
  remarks: string;
}

interface RosterEntry {
  id: string;
  employeeId: string;
  weekStart: string;
  weekEnd: string;
  day1: string;
  day2: string;
  day3: string;
  day4: string;
  day5: string;
  day6: string;
  day7: string;
}

export default function DailyAttendance() {
  const [employees] = useState<Employee[]>([
    { id: '1', name: 'Ahmad Fauzi', employeeId: 'EMP001', position: 'Heavy Equipment Operator', site: 'Site A - Kalimantan', shiftPattern: 'FIFO 8:4' },
    { id: '2', name: 'Budi Santoso', employeeId: 'EMP002', position: 'Dump Truck Driver', site: 'Site A - Kalimantan', shiftPattern: 'FIFO 8:4' },
    { id: '3', name: 'Cahyo Widodo', employeeId: 'EMP003', position: 'Excavator Operator', site: 'Site B - Sulawesi', shiftPattern: 'Day/Night Rotation' },
    { id: '4', name: 'Dedi Kurniawan', employeeId: 'EMP004', position: 'Maintenance Mechanic', site: 'Site A - Kalimantan', shiftPattern: 'Day/Night Rotation' },
  ]);

  const [attendance, setAttendance] = useState<AttendanceRecord[]>([
    {
      id: '1',
      employeeId: 'EMP001',
      date: '2026-01-15',
      shift: 'day',
      checkIn: '06:00',
      checkOut: '18:00',
      regularHours: 12,
      overtimeHours: 2,
      status: 'present',
      remarks: 'Normal operation',
    },
    {
      id: '2',
      employeeId: 'EMP002',
      date: '2026-01-15',
      shift: 'night',
      checkIn: '18:00',
      checkOut: '06:00',
      regularHours: 12,
      overtimeHours: 0,
      status: 'present',
      remarks: '',
    },
    {
      id: '3',
      employeeId: 'EMP003',
      date: '2026-01-15',
      shift: 'day',
      checkIn: '06:00',
      checkOut: '18:00',
      regularHours: 12,
      overtimeHours: 3,
      status: 'present',
      remarks: 'Equipment breakdown - extra hours',
    },
  ]);

  const [rosters] = useState<RosterEntry[]>([
    {
      id: '1',
      employeeId: 'EMP001',
      weekStart: '2026-01-13',
      weekEnd: '2026-01-19',
      day1: 'Day',
      day2: 'Day',
      day3: 'Day',
      day4: 'Day',
      day5: 'OFF',
      day6: 'OFF',
      day7: 'OFF',
    },
    {
      id: '2',
      employeeId: 'EMP002',
      weekStart: '2026-01-13',
      weekEnd: '2026-01-19',
      day1: 'Night',
      day2: 'Night',
      day3: 'Night',
      day4: 'Night',
      day5: 'OFF',
      day6: 'OFF',
      day7: 'OFF',
    },
  ]);

  const [selectedDate, setSelectedDate] = useState<string>('2026-01-15');
  const [selectedSite, setSelectedSite] = useState<string>('all');
  const [showAttendanceForm, setShowAttendanceForm] = useState(false);

  const sites = Array.from(new Set(employees.map(e => e.site)));

  const filteredAttendance = attendance.filter(a => {
    const emp = employees.find(e => e.employeeId === a.employeeId);
    const matchSite = selectedSite === 'all' || emp?.site === selectedSite;
    const matchDate = a.date === selectedDate;
    return matchSite && matchDate;
  });

  const getShiftBadge = (shift: string) => {
    const styles = {
      day: 'bg-yellow-100 text-yellow-800',
      night: 'bg-blue-100 text-blue-800',
      'fifo-in': 'bg-green-100 text-green-800',
      'fifo-out': 'bg-red-100 text-red-800',
    };
    return styles[shift as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
      leave: 'bg-blue-100 text-blue-800',
      sick: 'bg-orange-100 text-orange-800',
      'off-duty': 'bg-gray-100 text-gray-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const calculateTotalOvertime = () => {
    return filteredAttendance.reduce((sum, a) => sum + a.overtimeHours, 0);
  };

  const presentCount = filteredAttendance.filter(a => a.status === 'present').length;
  const totalOvertime = calculateTotalOvertime();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0A2540] to-[#1E3A5F] flex items-center justify-center">
            <span className="text-white text-xs font-bold">PA</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">Daily Attendance & Rotational Rosters</h1>
            <p className="text-sm text-gray-600">PT Perdana Adi Yuda - Absensi & Jadwal Shift Tambang</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Present Today</div>
          <div className="text-3xl font-bold text-green-600">{presentCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Total Employees</div>
          <div className="text-3xl font-bold text-blue-600">{employees.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Total Overtime Hours</div>
          <div className="text-3xl font-bold text-orange-600">{totalOvertime}h</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Sites Active</div>
          <div className="text-3xl font-bold text-purple-600">{sites.length}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Site</label>
            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Sites</option>
              {sites.map(site => (
                <option key={site} value={site}>{site}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setShowAttendanceForm(!showAttendanceForm)}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
            >
              {showAttendanceForm ? 'Cancel' : '+ Record Attendance'}
            </button>
          </div>
        </div>
      </div>

      {/* Attendance Form */}
      {showAttendanceForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Record Attendance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Employee</label>
              <select className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="">-- Select Employee --</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.employeeId}>{emp.name} - {emp.employeeId}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Shift</label>
              <select className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="day">Day Shift (06:00 - 18:00)</option>
                <option value="night">Night Shift (18:00 - 06:00)</option>
                <option value="fifo-in">FIFO In</option>
                <option value="fifo-out">FIFO Out</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Check In</label>
              <input type="time" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Check Out</label>
              <input type="time" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="leave">Leave</option>
                <option value="sick">Sick</option>
                <option value="off-duty">Off Duty</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Overtime Hours</label>
              <input type="number" min="0" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Remarks</label>
              <textarea className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" rows={2} />
            </div>
          </div>
          <div className="mt-4 flex gap-4">
            <button className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 font-semibold">
              Save Attendance
            </button>
            <button
              onClick={() => setShowAttendanceForm(false)}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Attendance Table */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Attendance Records - {selectedDate}</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Site</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shift</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check In</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check Out</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Regular</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">OT</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAttendance.map(record => {
                const emp = employees.find(e => e.employeeId === record.employeeId);
                return (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{emp?.name}</div>
                      <div className="text-xs text-gray-500">{emp?.employeeId}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{emp?.site}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getShiftBadge(record.shift)}`}>
                        {record.shift === 'day' ? 'Day' : record.shift === 'night' ? 'Night' : record.shift === 'fifo-in' ? 'FIFO In' : 'FIFO Out'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{record.checkIn}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{record.checkOut}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{record.regularHours}h</td>
                    <td className="px-4 py-3 text-sm font-semibold text-orange-600">{record.overtimeHours}h</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(record.status)}`}>
                        {record.status === 'present' ? 'Present' : record.status === 'absent' ? 'Absent' : record.status === 'leave' ? 'Leave' : record.status === 'sick' ? 'Sick' : 'Off Duty'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredAttendance.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No attendance records for selected date and site
          </div>
        )}
      </div>

      {/* Rotational Roster */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Rotational Roster - Week of {rosters[0]?.weekStart}</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Mon</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Tue</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Wed</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Thu</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Fri</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Sat</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Sun</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rosters.map(roster => {
                const emp = employees.find(e => e.employeeId === roster.employeeId);
                return (
                  <tr key={roster.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{emp?.name}</div>
                      <div className="text-xs text-gray-500">{emp?.shiftPattern}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getShiftBadge(roster.day1.toLowerCase())}`}>
                        {roster.day1}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getShiftBadge(roster.day2.toLowerCase())}`}>
                        {roster.day2}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getShiftBadge(roster.day3.toLowerCase())}`}>
                        {roster.day3}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getShiftBadge(roster.day4.toLowerCase())}`}>
                        {roster.day4}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getShiftBadge(roster.day5.toLowerCase())}`}>
                        {roster.day5}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getShiftBadge(roster.day6.toLowerCase())}`}>
                        {roster.day6}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getShiftBadge(roster.day7.toLowerCase())}`}>
                        {roster.day7}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
