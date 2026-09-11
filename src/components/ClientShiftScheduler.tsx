import { useMemo, useState } from 'react';

type ShiftType = 'morning' | 'afternoon' | 'night';
type ShiftStatus = 'scheduled' | 'confirmed' | 'cancelled';

interface Shift {
  id: string;
  employeeName: string;
  employeeId: string;
  division: string;
  client: string;
  date: string;
  shiftStart: string;
  shiftEnd: string;
  shiftType: ShiftType;
  status: ShiftStatus;
}

interface ShiftForm {
  employeeName: string;
  employeeId: string;
  division: string;
  client: string;
  date: string;
  shiftType: ShiftType;
}

const shiftTimes: Record<ShiftType, { start: string; end: string; label: string }> = {
  morning: { start: '06:00', end: '14:00', label: 'Morning' },
  afternoon: { start: '14:00', end: '22:00', label: 'Afternoon' },
  night: { start: '22:00', end: '06:00', label: 'Night' },
};

const seedShifts: Shift[] = [
  { id: '1', employeeName: 'Ahmad Fauzi', employeeId: 'EMP001', division: 'Security', client: 'PT ABC Manufacturing', date: '2026-01-10', shiftStart: '06:00', shiftEnd: '14:00', shiftType: 'morning', status: 'confirmed' },
  { id: '2', employeeName: 'Budi Santoso', employeeId: 'EMP002', division: 'Security', client: 'PT ABC Manufacturing', date: '2026-01-10', shiftStart: '14:00', shiftEnd: '22:00', shiftType: 'afternoon', status: 'scheduled' },
  { id: '3', employeeName: 'Cahyo Widodo', employeeId: 'EMP003', division: 'Security', client: 'PT ABC Manufacturing', date: '2026-01-10', shiftStart: '22:00', shiftEnd: '06:00', shiftType: 'night', status: 'confirmed' },
  { id: '4', employeeName: 'Dedi Kurniawan', employeeId: 'EMP004', division: 'Cleaning Service', client: 'PT XYZ Tower', date: '2026-01-10', shiftStart: '07:00', shiftEnd: '15:00', shiftType: 'morning', status: 'confirmed' },
];

interface ClientShiftSchedulerProps {
  onBack?: () => void;
  darkMode?: boolean;
  setDarkMode?: (value: boolean) => void;
}

const emptyForm = (date: string): ShiftForm => ({
  employeeName: '', employeeId: '', division: '', client: '', date, shiftType: 'morning',
});

const minutes = (value: string) => {
  const [hour, minute] = value.split(':').map(Number);
  return hour * 60 + minute;
};

const interval = (shift: Pick<Shift, 'shiftStart' | 'shiftEnd'>) => {
  const start = minutes(shift.shiftStart);
  let end = minutes(shift.shiftEnd);
  if (end <= start) end += 24 * 60;
  return { start, end };
};

const overlaps = (left: Pick<Shift, 'shiftStart' | 'shiftEnd'>, right: Pick<Shift, 'shiftStart' | 'shiftEnd'>) => {
  const a = interval(left);
  const b = interval(right);
  const variants = [b, { start: b.start + 1440, end: b.end + 1440 }, { start: b.start - 1440, end: b.end - 1440 }];
  return variants.some((candidate) => a.start < candidate.end && candidate.start < a.end);
};

export default function ClientShiftScheduler(_: ClientShiftSchedulerProps) {
  const [shifts, setShifts] = useState<Shift[]>(seedShifts);
  const [filterDate, setFilterDate] = useState('2026-01-10');
  const [filterClient, setFilterClient] = useState('all');
  const [filterDivision, setFilterDivision] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ShiftForm>(emptyForm('2026-01-10'));
  const [formError, setFormError] = useState('');

  const clients = useMemo(() => Array.from(new Set(shifts.map((shift) => shift.client))), [shifts]);
  const divisions = useMemo(() => Array.from(new Set(shifts.map((shift) => shift.division))), [shifts]);

  const filteredShifts = useMemo(() => shifts.filter((shift) => {
    const dateMatches = !filterDate || shift.date === filterDate;
    const clientMatches = filterClient === 'all' || shift.client === filterClient;
    const divisionMatches = filterDivision === 'all' || shift.division === filterDivision;
    return dateMatches && clientMatches && divisionMatches;
  }), [filterClient, filterDate, filterDivision, shifts]);

  const conflicts = useMemo(() => {
    const active = shifts.filter((shift) => shift.status !== 'cancelled');
    const result: Array<{ id: string; employeeName: string; date: string; first: Shift; second: Shift }> = [];
    for (let index = 0; index < active.length; index += 1) {
      for (let cursor = index + 1; cursor < active.length; cursor += 1) {
        const first = active[index];
        const second = active[cursor];
        if (first.employeeId === second.employeeId && first.date === second.date && overlaps(first, second)) {
          result.push({ id: `${first.id}-${second.id}`, employeeName: first.employeeName, date: first.date, first, second });
        }
      }
    }
    return result;
  }, [shifts]);

  const counts = {
    morning: filteredShifts.filter((shift) => shift.shiftType === 'morning' && shift.status !== 'cancelled').length,
    afternoon: filteredShifts.filter((shift) => shift.shiftType === 'afternoon' && shift.status !== 'cancelled').length,
    night: filteredShifts.filter((shift) => shift.shiftType === 'night' && shift.status !== 'cancelled').length,
    confirmed: filteredShifts.filter((shift) => shift.status === 'confirmed').length,
  };

  const openForm = () => {
    setForm(emptyForm(filterDate || new Date().toISOString().slice(0, 10)));
    setFormError('');
    setShowForm(true);
  };

  const saveShift = () => {
    const required = form.employeeName.trim() && form.employeeId.trim() && form.division.trim() && form.client.trim() && form.date;
    if (!required) {
      setFormError('Lengkapi employee, ID, client, division, dan tanggal shift.');
      return;
    }

    const time = shiftTimes[form.shiftType];
    const candidate: Shift = {
      id: `shift-${Date.now()}`,
      employeeName: form.employeeName.trim(),
      employeeId: form.employeeId.trim(),
      division: form.division.trim(),
      client: form.client.trim(),
      date: form.date,
      shiftType: form.shiftType,
      shiftStart: time.start,
      shiftEnd: time.end,
      status: 'scheduled',
    };

    const duplicateOrConflict = shifts.some((shift) =>
      shift.status !== 'cancelled' &&
      shift.employeeId.toLowerCase() === candidate.employeeId.toLowerCase() &&
      shift.date === candidate.date &&
      overlaps(shift, candidate)
    );

    if (duplicateOrConflict) {
      setFormError('Shift bentrok dengan jadwal aktif karyawan pada tanggal yang sama.');
      return;
    }

    setShifts((current) => [...current, candidate]);
    setFilterDate(candidate.date);
    setFilterClient('all');
    setFilterDivision('all');
    setShowForm(false);
    setFormError('');
  };

  const updateStatus = (id: string, status: ShiftStatus) => {
    setShifts((current) => current.map((shift) => shift.id === id ? { ...shift, status } : shift));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border rounded-xl p-4"><p className="text-[10px] uppercase tracking-wide text-gray-500">Morning</p><strong className="block mt-1 text-xl text-amber-600">{counts.morning}</strong></div>
        <div className="bg-white border rounded-xl p-4"><p className="text-[10px] uppercase tracking-wide text-gray-500">Afternoon</p><strong className="block mt-1 text-xl text-orange-600">{counts.afternoon}</strong></div>
        <div className="bg-white border rounded-xl p-4"><p className="text-[10px] uppercase tracking-wide text-gray-500">Night</p><strong className="block mt-1 text-xl text-blue-600">{counts.night}</strong></div>
        <div className="bg-white border rounded-xl p-4"><p className="text-[10px] uppercase tracking-wide text-gray-500">Confirmed</p><strong className="block mt-1 text-xl text-green-600">{counts.confirmed}</strong></div>
      </section>

      {conflicts.length > 0 && (
        <section className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-center justify-between gap-3"><div><h2 className="text-sm font-semibold text-red-800">Schedule conflict</h2><p className="text-[11px] text-red-700 mt-0.5">Konflik dihitung dari data shift aktual, bukan daftar alert statis.</p></div><span className="rounded-full bg-red-100 text-red-700 px-2 py-1 text-[10px] font-semibold">{conflicts.length} conflict</span></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mt-3">
            {conflicts.map((conflict) => <div key={conflict.id} className="rounded-lg border border-red-100 bg-white p-3 text-xs"><strong>{conflict.employeeName}</strong><p className="text-[10px] text-gray-500 mt-1">{conflict.date} · {conflict.first.shiftStart}-{conflict.first.shiftEnd} vs {conflict.second.shiftStart}-{conflict.second.shiftEnd}</p></div>)}
          </div>
        </section>
      )}

      <section className="bg-white border rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end">
          <label>Tanggal
            <input type="date" value={filterDate} onChange={(event) => setFilterDate(event.target.value)} />
          </label>
          <label>Client
            <select value={filterClient} onChange={(event) => setFilterClient(event.target.value)}><option value="all">Semua client</option>{clients.map((client) => <option key={client} value={client}>{client}</option>)}</select>
          </label>
          <label>Division
            <select value={filterDivision} onChange={(event) => setFilterDivision(event.target.value)}><option value="all">Semua division</option>{divisions.map((division) => <option key={division} value={division}>{division}</option>)}</select>
          </label>
          <button type="button" onClick={showForm ? () => setShowForm(false) : openForm} className="px-4 py-2.5 bg-blue-600 text-white rounded-lg">{showForm ? 'Tutup Form' : '+ Add Shift'}</button>
        </div>
      </section>

      {showForm && (
        <section className="bg-white border rounded-xl p-4">
          <div className="mb-4"><h2 className="text-sm font-semibold">Add Shift</h2><p className="text-[11px] text-gray-500 mt-1">Sistem akan menolak overlap untuk employee dan tanggal yang sama.</p></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <label>Employee name *<input value={form.employeeName} onChange={(event) => setForm({ ...form, employeeName: event.target.value })} placeholder="Nama karyawan" /></label>
            <label>Employee ID *<input value={form.employeeId} onChange={(event) => setForm({ ...form, employeeId: event.target.value })} placeholder="EMP001" /></label>
            <label>Client *<input value={form.client} onChange={(event) => setForm({ ...form, client: event.target.value })} placeholder="PT ABC" /></label>
            <label>Division *<input value={form.division} onChange={(event) => setForm({ ...form, division: event.target.value })} placeholder="Security" /></label>
            <label>Date *<input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></label>
            <label>Shift type
              <select value={form.shiftType} onChange={(event) => setForm({ ...form, shiftType: event.target.value as ShiftType })}>
                {Object.entries(shiftTimes).map(([key, value]) => <option key={key} value={key}>{value.label} ({value.start}-{value.end})</option>)}
              </select>
            </label>
          </div>
          {formError && <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-[11px] text-red-700">{formError}</div>}
          <div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => setShowForm(false)} className="px-3 py-2 border rounded-lg">Cancel</button><button type="button" onClick={saveShift} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Save Shift</button></div>
        </section>
      )}

      <section className="bg-white border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between gap-3"><div><h2 className="text-sm font-semibold">Shift Schedule</h2><p className="text-[11px] text-gray-500 mt-0.5">{filteredShifts.length} shift pada filter aktif</p></div><span className="text-[10px] text-gray-500">{filterDate || 'Semua tanggal'}</span></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr><th>Employee</th><th>Division</th><th>Client</th><th>Shift</th><th>Type</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {filteredShifts.map((shift) => (
                <tr key={shift.id}>
                  <td><strong>{shift.employeeName}</strong><div className="text-[10px] text-gray-500 mt-0.5">{shift.employeeId}</div></td>
                  <td>{shift.division}</td><td>{shift.client}</td><td><strong>{shift.shiftStart}–{shift.shiftEnd}</strong></td>
                  <td><span className={`rounded-full px-2 py-1 text-[9px] font-semibold ${shift.shiftType === 'morning' ? 'bg-amber-100 text-amber-700' : shift.shiftType === 'afternoon' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>{shiftTimes[shift.shiftType].label}</span></td>
                  <td><span className={`rounded-full px-2 py-1 text-[9px] font-semibold ${shift.status === 'confirmed' ? 'bg-green-100 text-green-700' : shift.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>{shift.status}</span></td>
                  <td><div className="flex gap-2">{shift.status === 'scheduled' && <button type="button" onClick={() => updateStatus(shift.id, 'confirmed')} className="text-green-600">Confirm</button>}{shift.status !== 'cancelled' && <button type="button" onClick={() => updateStatus(shift.id, 'cancelled')} className="text-red-600">Cancel</button>}{shift.status === 'cancelled' && <button type="button" onClick={() => updateStatus(shift.id, 'scheduled')} className="text-blue-600">Restore</button>}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredShifts.length === 0 && <div className="p-10 text-center text-sm text-gray-500">Tidak ada shift pada filter yang dipilih.</div>}
      </section>
    </div>
  );
}
