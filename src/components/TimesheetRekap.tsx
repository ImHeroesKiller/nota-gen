import { useMemo, useState } from 'react';
import { CalendarDays, Clock3, HardHat, Search, WalletCards } from 'lucide-react';
import { type AttendanceStatus, useMiningWorkerLifecycle } from '../lib/miningWorkerLifecycle';

interface TimesheetRekapProps {
  onBack?: () => void;
  darkMode?: boolean;
  setDarkMode?: (value: boolean) => void;
}

const rupiah = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
const statusMeta: Record<AttendanceStatus, { label: string; tone: string }> = {
  present: { label: 'Hadir', tone: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' },
  absent: { label: 'Tidak Hadir', tone: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300' },
  sick: { label: 'Sakit', tone: 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300' },
  leave: { label: 'Izin', tone: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300' },
  'off-duty': { label: 'Roster OFF', tone: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
};

export default function TimesheetRekap(_: TimesheetRekapProps) {
  const { store } = useMiningWorkerLifecycle();
  const [selectedMonth, setSelectedMonth] = useState('2026-09');
  const [selectedSite, setSelectedSite] = useState('all');
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'summary' | 'detail'>('summary');

  const workers = useMemo(() => store.workers.filter((worker) => worker.stage === 'active'), [store.workers]);
  const sites = useMemo(() => Array.from(new Set(workers.map((worker) => worker.site))).sort(), [workers]);

  const filteredRecords = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return store.attendance.filter((record) => {
      const worker = workers.find((item) => item.id === record.workerId);
      if (!worker) return false;
      const monthMatches = !selectedMonth || record.date.startsWith(selectedMonth);
      const siteMatches = selectedSite === 'all' || worker.site === selectedSite;
      const queryMatches = !needle || `${worker.name} ${worker.workerCode} ${worker.position} ${worker.site} ${worker.project}`.toLowerCase().includes(needle);
      return monthMatches && siteMatches && queryMatches;
    });
  }, [query, selectedMonth, selectedSite, store.attendance, workers]);

  const workerSummary = useMemo(() => workers.filter((worker) => {
    const needle = query.trim().toLowerCase();
    return (selectedSite === 'all' || worker.site === selectedSite)
      && (!needle || `${worker.name} ${worker.workerCode} ${worker.position} ${worker.site} ${worker.project}`.toLowerCase().includes(needle));
  }).map((worker) => {
    const records = filteredRecords.filter((record) => record.workerId === worker.id);
    const presentDays = records.filter((record) => record.status === 'present').length;
    const nonPaidDays = records.filter((record) => ['absent', 'sick', 'leave'].includes(record.status)).length;
    const offDays = records.filter((record) => record.status === 'off-duty').length;
    const regularHours = records.reduce((sum, record) => sum + record.regularHours, 0);
    const overtimeHours = records.reduce((sum, record) => sum + record.overtimeHours, 0);
    return { worker, records, presentDays, nonPaidDays, offDays, regularHours, overtimeHours, basePay: presentDays * worker.dailyRate };
  }).filter((item) => item.records.length > 0), [filteredRecords, query, selectedSite, workers]);

  const totals = useMemo(() => workerSummary.reduce((acc, item) => ({
    presentDays: acc.presentDays + item.presentDays,
    regularHours: acc.regularHours + item.regularHours,
    overtimeHours: acc.overtimeHours + item.overtimeHours,
    basePay: acc.basePay + item.basePay,
  }), { presentDays: 0, regularHours: 0, overtimeHours: 0, basePay: 0 }), [workerSummary]);

  return (
    <div className="mx-auto max-w-[1500px] space-y-5 text-slate-900 dark:text-slate-100">
      <section className="flex flex-col gap-3 rounded-2xl border border-blue-200 bg-blue-50/60 p-4 dark:border-blue-500/20 dark:bg-blue-500/10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-white"><CalendarDays size={18} /></span><div><p className="text-xs font-bold">Timesheet Rekap — sumber dari Daily Attendance</p><p className="mt-1 text-[11px] leading-5 text-slate-600 dark:text-slate-300">Tidak ada input timesheet terpisah. Rekap otomatis mengambil attendance PHL aktif, jumlah hari hadir, jam kerja, lembur, dan estimasi upah harian.</p></div></div>
        <span className="rounded-full border border-blue-200 bg-white px-3 py-1.5 text-[10px] font-bold text-blue-700 dark:border-blue-500/20 dark:bg-slate-900 dark:text-blue-300">Single source: Attendance</span>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-3 lg:grid-cols-[190px_240px_minmax(280px,1fr)_auto]">
          <label className="text-[9px] font-bold uppercase tracking-wide text-slate-500">Periode<input type="month" value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white" /></label>
          <label className="text-[9px] font-bold uppercase tracking-wide text-slate-500">Site<select value={selectedSite} onChange={(event) => setSelectedSite(event.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"><option value="all">Semua Site</option>{sites.map((site) => <option key={site}>{site}</option>)}</select></label>
          <label className="relative mt-auto"><Search size={16} className="absolute left-3 top-3 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari pekerja, posisi, site, project..." className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-950" /></label>
          <div className="mt-auto flex h-10 rounded-xl border border-slate-200 p-1 dark:border-slate-700"><button onClick={() => setView('summary')} className={`rounded-lg px-3 text-xs font-bold ${view === 'summary' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>Summary</button><button onClick={() => setView('detail')} className={`rounded-lg px-3 text-xs font-bold ${view === 'detail' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>Detail</button></div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          ['PHL dengan aktivitas', workerSummary.length, HardHat, 'text-slate-900 dark:text-white'],
          ['Total Hari Hadir', totals.presentDays, CalendarDays, 'text-emerald-600'],
          ['Regular / OT', `${totals.regularHours}h / ${totals.overtimeHours}h`, Clock3, 'text-orange-600'],
          ['Upah Harian Dasar', rupiah(totals.basePay), WalletCards, 'text-blue-600'],
        ].map(([label, value, Icon, tone]) => { const MetricIcon = Icon as typeof HardHat; return <article key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center justify-between"><div><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500">{String(label)}</p><strong className={`mt-2 block text-xl ${String(tone)}`}>{String(value)}</strong></div><span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-50 text-slate-500 dark:bg-slate-800"><MetricIcon size={17} /></span></div></article>; })}
      </section>

      {view === 'summary' ? (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800"><h2 className="text-sm font-bold">Rekap PHL per Pekerja</h2><p className="mt-0.5 text-[10px] text-slate-500">Basis payroll = hari hadir × rate harian. Komponen lembur dihitung pada Payroll Slip.</p></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left text-xs"><thead className="bg-slate-50 text-[9px] uppercase tracking-[0.1em] text-slate-500 dark:bg-slate-800/60"><tr><th className="px-4 py-3">Pekerja</th><th className="px-4 py-3">Site / Project</th><th className="px-4 py-3">Roster</th><th className="px-4 py-3">Hari Hadir</th><th className="px-4 py-3">Non-Paid</th><th className="px-4 py-3">Regular</th><th className="px-4 py-3">OT</th><th className="px-4 py-3 text-right">Upah Dasar</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{workerSummary.map(({ worker, presentDays, nonPaidDays, offDays, regularHours, overtimeHours, basePay }) => <tr key={worker.id}><td className="px-4 py-3"><strong>{worker.name}</strong><p className="mt-0.5 text-[10px] text-slate-500">{worker.workerCode} · {worker.position}</p></td><td className="px-4 py-3"><strong className="font-semibold">{worker.site}</strong><p className="mt-0.5 text-[10px] text-slate-500">{worker.project}</p></td><td className="px-4 py-3">{worker.roster}<p className="mt-0.5 text-[10px] text-slate-500">OFF tercatat: {offDays}</p></td><td className="px-4 py-3"><strong className="text-emerald-600">{presentDays} hari</strong><p className="mt-0.5 text-[10px] text-slate-500">{rupiah(worker.dailyRate)}/hari</p></td><td className="px-4 py-3">{nonPaidDays} hari</td><td className="px-4 py-3">{regularHours} jam</td><td className="px-4 py-3 font-semibold text-orange-600">{overtimeHours} jam</td><td className="px-4 py-3 text-right font-bold">{rupiah(basePay)}</td></tr>)}</tbody></table></div>
        </section>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800"><h2 className="text-sm font-bold">Detail Attendance → Timesheet</h2><p className="mt-0.5 text-[10px] text-slate-500">Setiap baris berasal langsung dari Daily Attendance.</p></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[1100px] text-left text-xs"><thead className="bg-slate-50 text-[9px] uppercase tracking-[0.1em] text-slate-500 dark:bg-slate-800/60"><tr><th className="px-4 py-3">Tanggal</th><th className="px-4 py-3">Pekerja</th><th className="px-4 py-3">Site</th><th className="px-4 py-3">Shift</th><th className="px-4 py-3">Check</th><th className="px-4 py-3">Regular</th><th className="px-4 py-3">OT</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Rate Hari</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{filteredRecords.map((record) => { const worker = workers.find((item) => item.id === record.workerId); if (!worker) return null; return <tr key={record.id}><td className="px-4 py-3">{new Date(`${record.date}T00:00:00`).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</td><td className="px-4 py-3"><strong>{worker.name}</strong><p className="mt-0.5 text-[10px] text-slate-500">{worker.workerCode} · {worker.position}</p></td><td className="px-4 py-3">{worker.site}</td><td className="px-4 py-3">{record.shift === 'day' ? 'Day' : 'Night'}</td><td className="px-4 py-3">{record.checkIn}–{record.checkOut}</td><td className="px-4 py-3">{record.regularHours}h</td><td className="px-4 py-3 font-semibold text-orange-600">{record.overtimeHours}h</td><td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-[9px] font-bold ${statusMeta[record.status].tone}`}>{statusMeta[record.status].label}</span></td><td className="px-4 py-3 text-right font-bold">{record.status === 'present' ? rupiah(worker.dailyRate) : rupiah(0)}</td></tr>; })}</tbody></table></div>
        </section>
      )}

      {filteredRecords.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-slate-700">Tidak ada data attendance untuk filter periode ini.</div>}
    </div>
  );
}
