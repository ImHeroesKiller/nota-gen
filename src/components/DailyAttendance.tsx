import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  HardHat,
  MapPin,
  Plus,
  WalletCards,
} from 'lucide-react';
import {
  type AttendanceStatus,
  type ShiftType,
  useMiningWorkerLifecycle,
} from '../lib/miningWorkerLifecycle';

interface DailyAttendanceProps {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

const rupiah = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
const today = () => new Date().toISOString().slice(0, 10);
const statusMeta: Record<AttendanceStatus, { label: string; tone: string }> = {
  present: { label: 'Hadir', tone: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' },
  absent: { label: 'Tidak Hadir', tone: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300' },
  sick: { label: 'Sakit', tone: 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300' },
  leave: { label: 'Izin', tone: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300' },
  'off-duty': { label: 'Roster OFF', tone: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
};

export default function DailyAttendance(_props: DailyAttendanceProps) {
  const { store, addAttendance } = useMiningWorkerLifecycle();
  const activeWorkers = useMemo(() => store.workers.filter((worker) => worker.stage === 'active'), [store.workers]);
  const [selectedDate, setSelectedDate] = useState(today());
  const [selectedSite, setSelectedSite] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ workerId: '', shift: 'day' as ShiftType, status: 'present' as AttendanceStatus, checkIn: '06:00', checkOut: '18:00', overtimeHours: '0', remarks: '' });

  const sites = useMemo(() => Array.from(new Set(activeWorkers.map((worker) => worker.site))).sort(), [activeWorkers]);
  const records = useMemo(() => store.attendance.filter((record) => {
    const worker = activeWorkers.find((item) => item.id === record.workerId);
    return record.date === selectedDate && worker && (selectedSite === 'all' || worker.site === selectedSite);
  }), [activeWorkers, selectedDate, selectedSite, store.attendance]);

  const visibleWorkers = useMemo(() => activeWorkers.filter((worker) => selectedSite === 'all' || worker.site === selectedSite), [activeWorkers, selectedSite]);
  const present = records.filter((record) => record.status === 'present').length;
  const absent = records.filter((record) => record.status === 'absent').length;
  const overtime = records.reduce((sum, record) => sum + record.overtimeHours, 0);
  const payable = records.reduce((sum, record) => {
    const worker = activeWorkers.find((item) => item.id === record.workerId);
    return sum + (record.status === 'present' ? worker?.dailyRate || 0 : 0);
  }, 0);

  const monthlyPaidDays = (workerId: string, date: string) => {
    const month = date.slice(0, 7);
    return store.attendance.filter((record) => record.workerId === workerId && record.date.startsWith(month) && record.status === 'present').length;
  };

  const resetForm = () => {
    setForm({ workerId: '', shift: 'day', status: 'present', checkIn: '06:00', checkOut: '18:00', overtimeHours: '0', remarks: '' });
    setError(null);
    setShowForm(false);
  };

  const saveAttendance = () => {
    if (!form.workerId) {
      setError('Pilih pekerja aktif terlebih dahulu.');
      return;
    }
    const worker = activeWorkers.find((item) => item.id === form.workerId);
    if (!worker) {
      setError('Pekerja tidak aktif atau tidak ditemukan.');
      return;
    }
    const overtimeHours = Number(form.overtimeHours);
    if (!Number.isFinite(overtimeHours) || overtimeHours < 0 || overtimeHours > 12) {
      setError('Jam lembur harus 0–12 jam.');
      return;
    }
    const existing = store.attendance.find((record) => record.workerId === worker.id && record.date === selectedDate);
    const alreadyPaid = monthlyPaidDays(worker.id, selectedDate) - (existing?.status === 'present' ? 1 : 0);
    if (form.status === 'present' && alreadyPaid >= 20) {
      setError('Operational guard: pekerja ini sudah mencapai 20 hari hadir berbayar pada bulan tersebut. Review status hubungan kerja sebelum menambah hari hadir berikutnya.');
      return;
    }
    addAttendance({
      id: existing?.id || globalThis.crypto?.randomUUID?.() || `att-${Date.now()}`,
      workerId: worker.id,
      date: selectedDate,
      shift: form.shift,
      checkIn: form.status === 'present' ? form.checkIn : '-',
      checkOut: form.status === 'present' ? form.checkOut : '-',
      regularHours: form.status === 'present' ? 8 : 0,
      overtimeHours: form.status === 'present' ? overtimeHours : 0,
      status: form.status,
      remarks: form.remarks.trim(),
    });
    resetForm();
  };

  return (
    <div className="mx-auto max-w-[1500px] space-y-5 text-slate-900 dark:text-slate-100">
      <section className="flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-600 text-white"><HardHat size={18} /></span><div><p className="text-xs font-bold">Daily Attendance — PHL Tambang Aktif</p><p className="mt-1 text-[11px] leading-5 text-slate-600 dark:text-slate-300">Hanya pekerja berstatus Aktif PHL dari Deployment Planner yang dapat dicatat. Hari hadir menjadi sumber otomatis untuk Timesheet dan payroll berbasis rate harian.</p></div></div>
        <span className="rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-[10px] font-bold text-emerald-700 dark:border-emerald-500/20 dark:bg-slate-900 dark:text-emerald-300">{activeWorkers.length} PHL aktif</span>
      </section>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        {[
          ['PHL Aktif', visibleWorkers.length, HardHat, 'text-slate-900 dark:text-white'],
          ['Hadir', present, CheckCircle2, 'text-emerald-600'],
          ['Tidak Hadir', absent, AlertTriangle, 'text-red-600'],
          ['Total Lembur', `${overtime} jam`, Clock3, 'text-orange-600'],
          ['Upah Harian Tercatat', rupiah(payable), WalletCards, 'text-blue-600'],
        ].map(([label, value, Icon, tone]) => { const MetricIcon = Icon as typeof HardHat; return <article key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center justify-between gap-2"><div><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500">{String(label)}</p><strong className={`mt-2 block text-xl ${String(tone)}`}>{String(value)}</strong></div><span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-50 text-slate-500 dark:bg-slate-800"><MetricIcon size={17} /></span></div></article>; })}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-3 md:grid-cols-[220px_minmax(260px,1fr)_auto]">
          <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Tanggal<input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white" /></label>
          <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Site<select value={selectedSite} onChange={(event) => setSelectedSite(event.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"><option value="all">Semua Site</option>{sites.map((site) => <option key={site}>{site}</option>)}</select></label>
          <button onClick={() => { setShowForm(true); setError(null); }} className="mt-auto inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white"><Plus size={16} /> Catat Kehadiran</button>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800"><div><h2 className="text-sm font-bold">Attendance Register</h2><p className="mt-0.5 text-[10px] text-slate-500">{selectedDate} · {selectedSite === 'all' ? 'Semua Site' : selectedSite}</p></div><CalendarDays size={17} className="text-slate-400" /></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left text-xs"><thead className="bg-slate-50 text-[9px] uppercase tracking-[0.1em] text-slate-500 dark:bg-slate-800/60"><tr><th className="px-4 py-3">Pekerja</th><th className="px-4 py-3">Site</th><th className="px-4 py-3">Shift</th><th className="px-4 py-3">Check In/Out</th><th className="px-4 py-3">Regular</th><th className="px-4 py-3">OT</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Upah Hari</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{records.map((record) => { const worker = activeWorkers.find((item) => item.id === record.workerId); if (!worker) return null; return <tr key={record.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30"><td className="px-4 py-3"><strong>{worker.name}</strong><p className="mt-0.5 text-[10px] text-slate-500">{worker.workerCode} · {worker.position}</p></td><td className="px-4 py-3"><span className="inline-flex items-center gap-1"><MapPin size={12} /> {worker.site}</span><p className="mt-0.5 text-[10px] text-slate-500">{worker.project}</p></td><td className="px-4 py-3 font-semibold">{record.shift === 'day' ? 'Day' : 'Night'}</td><td className="px-4 py-3">{record.checkIn} — {record.checkOut}</td><td className="px-4 py-3">{record.regularHours} jam</td><td className="px-4 py-3 font-semibold text-orange-600">{record.overtimeHours} jam</td><td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-[9px] font-bold ${statusMeta[record.status].tone}`}>{statusMeta[record.status].label}</span></td><td className="px-4 py-3 text-right font-bold">{record.status === 'present' ? rupiah(worker.dailyRate) : rupiah(0)}</td></tr>; })}</tbody></table></div>
        {records.length === 0 && <div className="p-10 text-center text-sm text-slate-500">Belum ada attendance untuk tanggal dan site ini.</div>}
      </section>

      {showForm && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 p-4"><div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900"><div className="mb-4"><h2 className="text-lg font-bold">Catat Kehadiran PHL</h2><p className="mt-1 text-xs text-slate-500">Jika record pekerja pada tanggal yang sama sudah ada, penyimpanan akan memperbarui record tersebut.</p></div>{error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">{error}</div>}<div className="grid gap-3 md:grid-cols-2"><label className="text-xs font-semibold">Pekerja<select value={form.workerId} onChange={(event) => setForm({ ...form, workerId: event.target.value })} className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-950"><option value="">Pilih pekerja aktif</option>{visibleWorkers.map((worker) => <option key={worker.id} value={worker.id}>{worker.workerCode} · {worker.name} · {worker.position}</option>)}</select></label><label className="text-xs font-semibold">Shift<select value={form.shift} onChange={(event) => setForm({ ...form, shift: event.target.value as ShiftType })} className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-950"><option value="day">Day Shift</option><option value="night">Night Shift</option></select></label><label className="text-xs font-semibold">Status<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as AttendanceStatus })} className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-950">{Object.entries(statusMeta).map(([key, meta]) => <option key={key} value={key}>{meta.label}</option>)}</select></label><label className="text-xs font-semibold">Lembur (jam)<input type="number" min="0" max="12" step="0.25" value={form.overtimeHours} onChange={(event) => setForm({ ...form, overtimeHours: event.target.value })} className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-950" /></label><label className="text-xs font-semibold">Check In<input type="time" value={form.checkIn} onChange={(event) => setForm({ ...form, checkIn: event.target.value })} className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-950" /></label><label className="text-xs font-semibold">Check Out<input type="time" value={form.checkOut} onChange={(event) => setForm({ ...form, checkOut: event.target.value })} className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-950" /></label><label className="text-xs font-semibold md:col-span-2">Catatan<textarea value={form.remarks} onChange={(event) => setForm({ ...form, remarks: event.target.value })} className="mt-1.5 min-h-[80px] w-full rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-950" /></label></div><div className="mt-5 flex justify-end gap-2"><button onClick={resetForm} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold dark:border-slate-700">Batal</button><button onClick={saveAttendance} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">Simpan Attendance</button></div></div></div>}
    </div>
  );
}
