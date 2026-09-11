import { useMemo, useState } from 'react';

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

const timesheets: TimesheetEntry[] = [
  { id: '1', employeeName: 'Ahmad Fauzi', employeeId: 'EMP001', clientName: 'PT ABC Manufacturing', date: '2026-01-05', checkIn: '08:00', checkOut: '17:00', regularHours: 8, overtimeHours: 2, status: 'present' },
  { id: '2', employeeName: 'Siti Nurhaliza', employeeId: 'EMP002', clientName: 'PT ABC Manufacturing', date: '2026-01-05', checkIn: '08:15', checkOut: '17:30', regularHours: 8, overtimeHours: 1.5, status: 'present' },
  { id: '3', employeeName: 'Budi Santoso', employeeId: 'EMP003', clientName: 'PT XYZ Logistics', date: '2026-01-05', checkIn: '07:45', checkOut: '16:45', regularHours: 8, overtimeHours: 0, status: 'present' },
  { id: '4', employeeName: 'Dewi Lestari', employeeId: 'EMP004', clientName: 'PT XYZ Logistics', date: '2026-01-05', checkIn: '-', checkOut: '-', regularHours: 0, overtimeHours: 0, status: 'sick' },
  { id: '5', employeeName: 'Ahmad Fauzi', employeeId: 'EMP001', clientName: 'PT ABC Manufacturing', date: '2026-01-06', checkIn: '08:00', checkOut: '18:00', regularHours: 8, overtimeHours: 3, status: 'present' },
  { id: '6', employeeName: 'Siti Nurhaliza', employeeId: 'EMP002', clientName: 'PT ABC Manufacturing', date: '2026-01-06', checkIn: '-', checkOut: '-', regularHours: 0, overtimeHours: 0, status: 'leave' },
];

interface TimesheetRekapProps {
  onBack?: () => void;
  darkMode?: boolean;
  setDarkMode?: (value: boolean) => void;
}

const statusClass: Record<TimesheetEntry['status'], string> = {
  present: 'bg-green-100 text-green-700',
  absent: 'bg-red-100 text-red-700',
  leave: 'bg-amber-100 text-amber-700',
  sick: 'bg-orange-100 text-orange-700',
};

export default function TimesheetRekap(_: TimesheetRekapProps) {
  const [selectedMonth, setSelectedMonth] = useState('2026-01');
  const [selectedClient, setSelectedClient] = useState('all');
  const [query, setQuery] = useState('');

  const clients = useMemo(() => Array.from(new Set(timesheets.map((entry) => entry.clientName))), []);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return timesheets.filter((entry) => {
      const monthMatches = !selectedMonth || entry.date.startsWith(selectedMonth);
      const clientMatches = selectedClient === 'all' || entry.clientName === selectedClient;
      const queryMatches = !normalizedQuery || `${entry.employeeName} ${entry.employeeId} ${entry.clientName}`.toLowerCase().includes(normalizedQuery);
      return monthMatches && clientMatches && queryMatches;
    });
  }, [query, selectedClient, selectedMonth]);

  const summary = useMemo(() => ({
    entries: filtered.length,
    present: filtered.filter((entry) => entry.status === 'present').length,
    regular: filtered.reduce((sum, entry) => sum + entry.regularHours, 0),
    overtime: filtered.reduce((sum, entry) => sum + entry.overtimeHours, 0),
  }), [filtered]);

  const attendanceRate = summary.entries ? Math.round((summary.present / summary.entries) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <section className="bg-white border rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1.4fr] gap-3">
          <label>Periode
            <input type="month" value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} />
          </label>
          <label>Klien
            <select value={selectedClient} onChange={(event) => setSelectedClient(event.target.value)}>
              <option value="all">Semua klien</option>{clients.map((client) => <option key={client} value={client}>{client}</option>)}
            </select>
          </label>
          <label>Cari
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nama, employee ID, atau klien" />
          </label>
        </div>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white border rounded-xl p-4"><p className="text-[10px] uppercase tracking-wide text-gray-500">Entries</p><strong className="block mt-1 text-xl">{summary.entries}</strong></div>
        <div className="bg-white border rounded-xl p-4"><p className="text-[10px] uppercase tracking-wide text-gray-500">Present</p><strong className="block mt-1 text-xl text-green-600">{summary.present}</strong></div>
        <div className="bg-white border rounded-xl p-4"><p className="text-[10px] uppercase tracking-wide text-gray-500">Attendance rate</p><strong className="block mt-1 text-xl text-blue-600">{attendanceRate}%</strong></div>
        <div className="bg-white border rounded-xl p-4"><p className="text-[10px] uppercase tracking-wide text-gray-500">Regular hours</p><strong className="block mt-1 text-xl">{summary.regular}</strong></div>
        <div className="bg-white border rounded-xl p-4 col-span-2 lg:col-span-1"><p className="text-[10px] uppercase tracking-wide text-gray-500">Overtime</p><strong className="block mt-1 text-xl text-orange-600">{summary.overtime}</strong></div>
      </section>

      <section className="bg-white border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between gap-3">
          <div><h2 className="text-sm font-semibold">Timesheet Detail</h2><p className="text-[11px] text-gray-500 mt-0.5">Rekap kehadiran dan jam kerja sesuai filter aktif.</p></div>
          <span className="text-[10px] text-gray-500">{selectedMonth || 'Semua periode'}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr><th>Tanggal</th><th>Karyawan</th><th>Klien</th><th>Check In</th><th>Check Out</th><th>Regular</th><th>Overtime</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.map((entry) => (
                <tr key={entry.id}>
                  <td>{new Date(`${entry.date}T00:00:00`).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td><strong>{entry.employeeName}</strong><div className="text-[10px] text-gray-500 mt-0.5">{entry.employeeId}</div></td>
                  <td>{entry.clientName}</td><td>{entry.checkIn}</td><td>{entry.checkOut}</td>
                  <td><strong>{entry.regularHours} jam</strong></td><td><strong className="text-orange-600">{entry.overtimeHours} jam</strong></td>
                  <td><span className={`rounded-full px-2 py-1 text-[9px] font-semibold ${statusClass[entry.status]}`}>{entry.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="p-10 text-center text-sm text-gray-500">Tidak ada data timesheet untuk filter yang dipilih.</div>}
      </section>
    </div>
  );
}
