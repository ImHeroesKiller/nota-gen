import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Briefcase,
  Building,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  File,
  FileCheck,
  FileClock,
  FileX,
  Search,
  Shield,
  SlidersHorizontal,
  UserCheck,
  X,
} from 'lucide-react';

interface OnboardingChecklist {
  id: string;
  employeeName: string;
  employeeId: string;
  division: string;
  client: string;
  startDate: string;
  documents: {
    name: string;
    status: 'pending' | 'submitted' | 'verified' | 'rejected';
    notes: string;
  }[];
  overallStatus: 'in-progress' | 'completed' | 'pending-review';
}

type OverallStatus = OnboardingChecklist['overallStatus'];
type DocumentStatus = OnboardingChecklist['documents'][number]['status'];

const seedData: OnboardingChecklist[] = [
  {
    id: '1', employeeName: 'Ahmad Fauzi', employeeId: 'EMP001', division: 'Security', client: 'PT ABC Manufacturing', startDate: '2026-01-15', overallStatus: 'completed',
    documents: [
      { name: 'Kontrak Kerja', status: 'verified', notes: 'Ditandatangani 10 Jan 2026' },
      { name: 'KTP', status: 'verified', notes: 'Dokumen terverifikasi' },
      { name: 'NPWP', status: 'verified', notes: 'Dokumen terverifikasi' },
      { name: 'Sertifikat Gada Pratama', status: 'verified', notes: 'Berlaku sampai 2028' },
      { name: 'MCU (Medical Check-up)', status: 'verified', notes: 'Fit for duty' },
      { name: 'SKCK', status: 'verified', notes: 'Dokumen valid' },
      { name: 'Background Check', status: 'verified', notes: 'Lolos pemeriksaan' },
    ],
  },
  {
    id: '2', employeeName: 'Budi Santoso', employeeId: 'EMP002', division: 'Cleaning Service', client: 'PT XYZ Tower', startDate: '2026-01-20', overallStatus: 'in-progress',
    documents: [
      { name: 'Kontrak Kerja', status: 'submitted', notes: 'Menunggu tanda tangan' },
      { name: 'KTP', status: 'verified', notes: 'Dokumen terverifikasi' },
      { name: 'NPWP', status: 'pending', notes: 'Belum diserahkan' },
      { name: 'Sertifikat Kompetensi', status: 'pending', notes: 'Belum diserahkan' },
      { name: 'MCU (Medical Check-up)', status: 'submitted', notes: 'Sedang diproses' },
      { name: 'SKCK', status: 'pending', notes: 'Belum diserahkan' },
      { name: 'Background Check', status: 'pending', notes: 'Belum dimulai' },
    ],
  },
  {
    id: '3', employeeName: 'Cahyo Widodo', employeeId: 'EMP003', division: 'Customer Service', client: 'PT DEF Telecom', startDate: '2026-01-25', overallStatus: 'pending-review',
    documents: [
      { name: 'Kontrak Kerja', status: 'verified', notes: 'Sudah ditandatangani' },
      { name: 'KTP', status: 'verified', notes: 'Dokumen terverifikasi' },
      { name: 'NPWP', status: 'verified', notes: 'Dokumen terverifikasi' },
      { name: 'Sertifikat Service Excellence', status: 'verified', notes: 'Dokumen valid' },
      { name: 'MCU (Medical Check-up)', status: 'verified', notes: 'Fit for duty' },
      { name: 'SKCK', status: 'rejected', notes: 'Kedaluwarsa, perlu diperbarui' },
      { name: 'Background Check', status: 'submitted', notes: 'Sedang direview' },
    ],
  },
];

const overallMeta: Record<OverallStatus, { label: string; tone: string }> = {
  'in-progress': { label: 'Dalam Proses', tone: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300' },
  completed: { label: 'Selesai', tone: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300' },
  'pending-review': { label: 'Menunggu Review', tone: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300' },
};

const documentMeta: Record<DocumentStatus, { label: string; tone: string }> = {
  pending: { label: 'Menunggu', tone: 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  submitted: { label: 'Diajukan', tone: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300' },
  verified: { label: 'Terverifikasi', tone: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300' },
  rejected: { label: 'Ditolak', tone: 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300' },
};

const initials = (name: string) => name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');

const documentIcon = (status: DocumentStatus) => {
  if (status === 'verified') return FileCheck;
  if (status === 'rejected') return FileX;
  if (status === 'submitted') return FileClock;
  return File;
};

export default function OnboardingComplianceChecklist() {
  const [checklists, setChecklists] = useState(seedData);
  const [statusFilter, setStatusFilter] = useState<'all' | OverallStatus>('all');
  const [divisionFilter, setDivisionFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const divisions = useMemo(() => Array.from(new Set(checklists.map((item) => item.division))), [checklists]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return checklists.filter((item) => {
      const matchesStatus = statusFilter === 'all' || item.overallStatus === statusFilter;
      const matchesDivision = divisionFilter === 'all' || item.division === divisionFilter;
      const matchesQuery = !normalized || `${item.employeeName} ${item.employeeId} ${item.client} ${item.division}`.toLowerCase().includes(normalized);
      return matchesStatus && matchesDivision && matchesQuery;
    });
  }, [checklists, divisionFilter, query, statusFilter]);

  const getCounts = (item: OnboardingChecklist) => item.documents.reduce(
    (acc, document) => ({ ...acc, [document.status]: acc[document.status] + 1 }),
    { pending: 0, submitted: 0, verified: 0, rejected: 0 } as Record<DocumentStatus, number>,
  );

  const getProgress = (item: OnboardingChecklist) => item.documents.length
    ? Math.round((item.documents.filter((document) => document.status === 'verified').length / item.documents.length) * 100)
    : 0;

  const approve = (id: string) => {
    setChecklists((current) => current.map((item) => {
      if (item.id !== id) return item;
      const allVerified = item.documents.every((document) => document.status === 'verified');
      return allVerified ? { ...item, overallStatus: 'completed' } : item;
    }));
  };

  const resetFilters = () => {
    setQuery('');
    setStatusFilter('all');
    setDivisionFilter('all');
  };

  const completed = checklists.filter((item) => item.overallStatus === 'completed').length;
  const open = checklists.length - completed;
  const attention = checklists.filter((item) => item.documents.some((document) => document.status === 'rejected')).length;
  const hasFilters = Boolean(query.trim()) || statusFilter !== 'all' || divisionFilter !== 'all';

  const metrics = [
    { label: 'Total Onboarding', value: checklists.length, helper: 'Seluruh kandidat aktif', Icon: UserCheck, iconTone: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300', valueTone: 'text-slate-950 dark:text-white' },
    { label: 'Selesai', value: completed, helper: 'Siap deployment', Icon: CheckCircle, iconTone: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300', valueTone: 'text-emerald-600 dark:text-emerald-300' },
    { label: 'Sedang Berjalan', value: open, helper: 'Dokumen masih terbuka', Icon: FileClock, iconTone: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300', valueTone: 'text-blue-600 dark:text-blue-300' },
    { label: 'Perlu Tindakan', value: attention, helper: 'Ada dokumen ditolak', Icon: AlertTriangle, iconTone: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300', valueTone: 'text-red-600 dark:text-red-300' },
  ];

  return (
    <div className="mx-auto max-w-[1500px] space-y-4 text-slate-900 dark:text-slate-100">
      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {metrics.map(({ label, value, helper, Icon, iconTone, valueTone }) => (
          <article key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/30 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">{label}</p>
                <strong className={`mt-2 block text-2xl font-bold tracking-tight ${valueTone}`}>{value}</strong>
                <p className="mt-1 hidden text-[11px] text-slate-500 dark:text-slate-400 sm:block">{helper}</p>
              </div>
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${iconTone}`}><Icon size={18} /></span>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm shadow-slate-200/20 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1.5fr)_220px_220px_auto] lg:items-end">
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold text-slate-600 dark:text-slate-300">Cari karyawan</span>
            <span className="relative block">
              <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nama, employee ID, klien..." className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500" />
            </span>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold text-slate-600 dark:text-slate-300">Status onboarding</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'all' | OverallStatus)} className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
              <option value="all">Semua status</option><option value="in-progress">Dalam Proses</option><option value="pending-review">Menunggu Review</option><option value="completed">Selesai</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold text-slate-600 dark:text-slate-300">Divisi</span>
            <select value={divisionFilter} onChange={(event) => setDivisionFilter(event.target.value)} className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
              <option value="all">Semua divisi</option>{divisions.map((division) => <option key={division} value={division}>{division}</option>)}
            </select>
          </label>

          <button type="button" onClick={resetFilters} disabled={!hasFilters} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">
            <SlidersHorizontal size={16} /> Reset
          </button>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-4 px-1">
          <div><h2 className="text-sm font-bold text-slate-900 dark:text-white">Daftar onboarding</h2><p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{filtered.length} dari {checklists.length} karyawan ditampilkan</p></div>
          {hasFilters && <button type="button" onClick={resetFilters} className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">Filter aktif <X size={12} /></button>}
        </div>

        {filtered.map((item) => {
          const counts = getCounts(item);
          const progress = getProgress(item);
          const openDocuments = counts.pending + counts.submitted;
          const allVerified = item.documents.every((document) => document.status === 'verified');
          const expanded = expandedId === item.id;
          const meta = overallMeta[item.overallStatus];
          const progressTone = progress === 100 ? 'bg-emerald-500' : counts.rejected > 0 ? 'bg-red-500' : 'bg-blue-500';

          return (
            <article key={item.id} className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition dark:bg-slate-900 ${counts.rejected > 0 ? 'border-red-200 shadow-red-100/40 dark:border-red-500/20 dark:shadow-none' : 'border-slate-200 shadow-slate-200/30 dark:border-slate-800 dark:shadow-none'}`}>
              <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,.75fr)_auto] lg:items-center lg:p-5">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-sm font-bold text-blue-700 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20">{initials(item.employeeName)}</span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2"><h3 className="truncate text-sm font-bold text-slate-950 dark:text-white">{item.employeeName}</h3><span className={`rounded-full border px-2.5 py-1 text-[9px] font-bold ${meta.tone}`}>{meta.label}</span></div>
                    <p className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">{item.employeeId}</p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                      <span className="inline-flex items-center gap-1.5"><Briefcase size={13} className="text-slate-400" />{item.division}</span>
                      <span className="inline-flex items-center gap-1.5"><Building size={13} className="text-slate-400" />{item.client}</span>
                      <span className="inline-flex items-center gap-1.5"><Calendar size={13} className="text-slate-400" />Mulai {new Date(`${item.startDate}T00:00:00`).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/70">
                  <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><Shield size={16} className={counts.rejected > 0 ? 'text-red-500' : progress === 100 ? 'text-emerald-500' : 'text-blue-500'} /><span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">Kesiapan dokumen</span></div><strong className="text-sm text-slate-950 dark:text-white">{progress}%</strong></div>
                  <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"><div className={`h-full rounded-full transition-all ${progressTone}`} style={{ width: `${progress}%` }} /></div>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-500 dark:text-slate-400"><span>{counts.verified} verified</span><span>{openDocuments} terbuka</span>{counts.rejected > 0 && <span className="font-semibold text-red-600 dark:text-red-300">{counts.rejected} ditolak</span>}<span>{item.documents.length} total</span></div>
                </div>

                <div className="flex items-center gap-2 lg:justify-end">
                  {item.overallStatus === 'pending-review' && <button type="button" disabled={!allVerified} onClick={() => approve(item.id)} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none dark:disabled:bg-slate-800 dark:disabled:text-slate-500" title={!allVerified ? 'Semua dokumen harus terverifikasi sebelum approval' : 'Approve onboarding'}><CheckCircle size={16} />Approve</button>}
                  <button type="button" onClick={() => setExpandedId(expanded ? null : item.id)} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">{expanded ? 'Tutup' : 'Review'}{expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</button>
                </div>
              </div>

              {expanded && (
                <div className="border-t border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/45 lg:p-5">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div><h4 className="text-sm font-bold text-slate-950 dark:text-white">Dokumen onboarding</h4><p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Pastikan seluruh dokumen terverifikasi sebelum kandidat disetujui untuk deployment.</p></div>
                    <div className="flex flex-wrap gap-2 text-[10px] font-semibold"><span className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">{counts.verified} Verified</span><span className="rounded-lg border border-blue-200 bg-blue-50 px-2 py-1 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">{counts.submitted} Diajukan</span><span className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">{counts.pending} Menunggu</span>{counts.rejected > 0 && <span className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">{counts.rejected} Ditolak</span>}</div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {item.documents.map((document) => {
                      const docMeta = documentMeta[document.status];
                      const DocIcon = documentIcon(document.status);
                      const iconTone = document.status === 'verified' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300' : document.status === 'rejected' ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300' : document.status === 'submitted' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300';
                      return <div key={document.name} className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900"><div className="flex items-start gap-3"><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${iconTone}`}><DocIcon size={18} /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><strong className="text-xs font-bold text-slate-900 dark:text-white">{document.name}</strong><span className={`shrink-0 rounded-full border px-2 py-1 text-[9px] font-bold ${docMeta.tone}`}>{docMeta.label}</span></div><p className="mt-1.5 text-[10px] leading-4 text-slate-500 dark:text-slate-400">{document.notes || '-'}</p></div></div></div>;
                    })}
                  </div>

                  {item.overallStatus === 'pending-review' && !allVerified && <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200"><AlertTriangle size={17} className="mt-0.5 shrink-0" /><div><strong className="text-[11px] font-bold">Approval masih diblokir</strong><p className="mt-0.5 text-[10px] leading-4">Selesaikan dokumen yang masih menunggu, diajukan, atau ditolak. Approval hanya aktif ketika seluruh dokumen berstatus Terverifikasi.</p></div></div>}
                </div>
              )}
            </article>
          );
        })}
      </section>

      {filtered.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900"><span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300"><Search size={20} /></span><strong className="mt-3 block text-sm text-slate-900 dark:text-white">Tidak ada onboarding yang cocok</strong><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Coba ubah kata kunci atau reset filter yang sedang aktif.</p><button type="button" onClick={resetFilters} className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Reset filter</button></div>}
    </div>
  );
}
