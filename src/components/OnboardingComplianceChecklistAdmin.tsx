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

type DocumentStatus = 'pending' | 'submitted' | 'verified' | 'rejected';
type OverallStatus = 'in-progress' | 'pending-review' | 'completed';

interface ChecklistDocument {
  name: string;
  status: DocumentStatus;
  notes: string;
  updatedBy?: string;
  updatedAt?: string;
}

interface OnboardingChecklist {
  id: string;
  employeeName: string;
  employeeId: string;
  division: string;
  client: string;
  startDate: string;
  documents: ChecklistDocument[];
  overallStatus: OverallStatus;
  approvedBy?: string;
  approvedAt?: string;
}

const ADMIN_NAME = 'Administrator';

const nowLabel = () => new Date().toLocaleString('id-ID', {
  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
});

const seedData: OnboardingChecklist[] = [
  {
    id: '1', employeeName: 'Ahmad Fauzi', employeeId: 'EMP001', division: 'Security', client: 'PT ABC Manufacturing', startDate: '2026-01-15', overallStatus: 'completed', approvedBy: ADMIN_NAME, approvedAt: '15 Jan 2026, 09.10',
    documents: [
      { name: 'Kontrak Kerja', status: 'verified', notes: 'Ditandatangani dan dicek admin', updatedBy: ADMIN_NAME, updatedAt: '15 Jan 2026, 08.30' },
      { name: 'KTP', status: 'verified', notes: 'Identitas sesuai', updatedBy: ADMIN_NAME, updatedAt: '15 Jan 2026, 08.34' },
      { name: 'NPWP', status: 'verified', notes: 'Data sesuai', updatedBy: ADMIN_NAME, updatedAt: '15 Jan 2026, 08.35' },
      { name: 'Sertifikat Gada Pratama', status: 'verified', notes: 'Berlaku sampai 2028', updatedBy: ADMIN_NAME, updatedAt: '15 Jan 2026, 08.41' },
      { name: 'MCU (Medical Check-up)', status: 'verified', notes: 'Fit for duty', updatedBy: ADMIN_NAME, updatedAt: '15 Jan 2026, 08.44' },
      { name: 'SKCK', status: 'verified', notes: 'Dokumen valid', updatedBy: ADMIN_NAME, updatedAt: '15 Jan 2026, 08.48' },
      { name: 'Background Check', status: 'verified', notes: 'Lolos pemeriksaan', updatedBy: ADMIN_NAME, updatedAt: '15 Jan 2026, 08.55' },
    ],
  },
  {
    id: '2', employeeName: 'Budi Santoso', employeeId: 'EMP002', division: 'Cleaning Service', client: 'PT XYZ Tower', startDate: '2026-01-20', overallStatus: 'in-progress',
    documents: [
      { name: 'Kontrak Kerja', status: 'submitted', notes: 'Dokumen sudah diterima admin', updatedBy: ADMIN_NAME, updatedAt: '18 Jan 2026, 10.20' },
      { name: 'KTP', status: 'verified', notes: 'Identitas sesuai', updatedBy: ADMIN_NAME, updatedAt: '18 Jan 2026, 10.22' },
      { name: 'NPWP', status: 'pending', notes: 'Belum diterima admin' },
      { name: 'Sertifikat Kompetensi', status: 'pending', notes: 'Belum diterima admin' },
      { name: 'MCU (Medical Check-up)', status: 'submitted', notes: 'Hasil sudah diterima, perlu verifikasi', updatedBy: ADMIN_NAME, updatedAt: '18 Jan 2026, 10.30' },
      { name: 'SKCK', status: 'pending', notes: 'Belum diterima admin' },
      { name: 'Background Check', status: 'pending', notes: 'Belum diproses admin' },
    ],
  },
  {
    id: '3', employeeName: 'Cahyo Widodo', employeeId: 'EMP003', division: 'Customer Service', client: 'PT DEF Telecom', startDate: '2026-01-25', overallStatus: 'in-progress',
    documents: [
      { name: 'Kontrak Kerja', status: 'verified', notes: 'Sudah ditandatangani', updatedBy: ADMIN_NAME, updatedAt: '22 Jan 2026, 13.10' },
      { name: 'KTP', status: 'verified', notes: 'Dokumen terverifikasi', updatedBy: ADMIN_NAME, updatedAt: '22 Jan 2026, 13.12' },
      { name: 'NPWP', status: 'verified', notes: 'Dokumen terverifikasi', updatedBy: ADMIN_NAME, updatedAt: '22 Jan 2026, 13.14' },
      { name: 'Sertifikat Service Excellence', status: 'verified', notes: 'Dokumen valid', updatedBy: ADMIN_NAME, updatedAt: '22 Jan 2026, 13.17' },
      { name: 'MCU (Medical Check-up)', status: 'verified', notes: 'Fit for duty', updatedBy: ADMIN_NAME, updatedAt: '22 Jan 2026, 13.20' },
      { name: 'SKCK', status: 'rejected', notes: 'Kedaluwarsa, admin menunggu dokumen pengganti', updatedBy: ADMIN_NAME, updatedAt: '22 Jan 2026, 13.23' },
      { name: 'Background Check', status: 'submitted', notes: 'Sudah diterima admin dan menunggu verifikasi', updatedBy: ADMIN_NAME, updatedAt: '22 Jan 2026, 13.25' },
    ],
  },
];

const overallMeta: Record<OverallStatus, { label: string; tone: string }> = {
  'in-progress': { label: 'Dikerjakan Admin', tone: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300' },
  'pending-review': { label: 'Siap Disetujui', tone: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300' },
  completed: { label: 'Selesai', tone: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300' },
};

const documentMeta: Record<DocumentStatus, { label: string; tone: string }> = {
  pending: { label: 'Belum Diterima', tone: 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  submitted: { label: 'Diterima Admin', tone: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300' },
  verified: { label: 'Terverifikasi', tone: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300' },
  rejected: { label: 'Perlu Perbaikan', tone: 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300' },
};

const initials = (name: string) => name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');

const documentIcon = (status: DocumentStatus) => {
  if (status === 'verified') return FileCheck;
  if (status === 'rejected') return FileX;
  if (status === 'submitted') return FileClock;
  return File;
};

const deriveStatus = (documents: ChecklistDocument[], current: OverallStatus): OverallStatus => {
  if (current === 'completed' && documents.every((doc) => doc.status === 'verified')) return 'completed';
  if (documents.every((doc) => doc.status === 'verified')) return 'pending-review';
  return 'in-progress';
};

export default function OnboardingComplianceChecklistAdmin() {
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

  const updateDocumentStatus = (employeeId: string, documentName: string, status: DocumentStatus) => {
    setChecklists((current) => current.map((item) => {
      if (item.id !== employeeId) return item;
      const documents = item.documents.map((document) => document.name === documentName
        ? {
          ...document,
          status,
          notes: status === 'submitted'
            ? 'Dokumen diterima dan sedang diperiksa admin'
            : status === 'verified'
              ? 'Dokumen telah diverifikasi admin'
              : status === 'rejected'
                ? 'Perlu perbaikan / dokumen pengganti dari sumber dokumen'
                : 'Menunggu dokumen diterima admin',
          updatedBy: ADMIN_NAME,
          updatedAt: nowLabel(),
        }
        : document);
      const overallStatus = deriveStatus(documents, item.overallStatus);
      return {
        ...item,
        documents,
        overallStatus,
        approvedBy: overallStatus === 'completed' ? item.approvedBy : undefined,
        approvedAt: overallStatus === 'completed' ? item.approvedAt : undefined,
      };
    }));
  };

  const approve = (id: string) => {
    setChecklists((current) => current.map((item) => {
      if (item.id !== id || !item.documents.every((document) => document.status === 'verified')) return item;
      return { ...item, overallStatus: 'completed', approvedBy: ADMIN_NAME, approvedAt: nowLabel() };
    }));
  };

  const resetFilters = () => {
    setQuery('');
    setStatusFilter('all');
    setDivisionFilter('all');
  };

  const completed = checklists.filter((item) => item.overallStatus === 'completed').length;
  const ready = checklists.filter((item) => item.overallStatus === 'pending-review').length;
  const attention = checklists.filter((item) => item.documents.some((document) => document.status === 'rejected')).length;
  const hasFilters = Boolean(query.trim()) || statusFilter !== 'all' || divisionFilter !== 'all';

  const metrics = [
    { label: 'Total Onboarding', value: checklists.length, helper: 'Dikelola oleh Admin', Icon: UserCheck, iconTone: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300', valueTone: 'text-slate-950 dark:text-white' },
    { label: 'Selesai', value: completed, helper: 'Final approval Admin', Icon: CheckCircle, iconTone: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300', valueTone: 'text-emerald-600 dark:text-emerald-300' },
    { label: 'Siap Disetujui', value: ready, helper: 'Semua dokumen verified', Icon: Shield, iconTone: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300', valueTone: 'text-blue-600 dark:text-blue-300' },
    { label: 'Perlu Tindakan', value: attention, helper: 'Ada dokumen bermasalah', Icon: AlertTriangle, iconTone: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300', valueTone: 'text-red-600 dark:text-red-300' },
  ];

  return (
    <div className="mx-auto max-w-[1500px] space-y-4 text-slate-900 dark:text-slate-100">
      <section className="flex flex-col gap-3 rounded-2xl border border-blue-200 bg-blue-50/70 p-4 dark:border-blue-500/20 dark:bg-blue-500/10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-600 text-white"><Shield size={18} /></span>
          <div>
            <p className="text-xs font-bold text-slate-950 dark:text-white">Admin-managed onboarding</p>
            <p className="mt-1 text-[11px] leading-5 text-slate-600 dark:text-slate-300">Seluruh penerimaan, pengecekan, verifikasi, perbaikan status, dan final approval checklist dilakukan oleh Admin. Karyawan tidak melakukan checklist sendiri.</p>
          </div>
        </div>
        <span className="shrink-0 rounded-full border border-blue-200 bg-white px-3 py-1.5 text-[10px] font-bold text-blue-700 dark:border-blue-500/20 dark:bg-slate-900 dark:text-blue-300">Owner: {ADMIN_NAME}</span>
      </section>

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
              <option value="all">Semua status</option><option value="in-progress">Dikerjakan Admin</option><option value="pending-review">Siap Disetujui</option><option value="completed">Selesai</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold text-slate-600 dark:text-slate-300">Divisi</span>
            <select value={divisionFilter} onChange={(event) => setDivisionFilter(event.target.value)} className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
              <option value="all">Semua divisi</option>{divisions.map((division) => <option key={division} value={division}>{division}</option>)}
            </select>
          </label>

          <button type="button" onClick={resetFilters} disabled={!hasFilters} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"><SlidersHorizontal size={16} /> Reset</button>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-4 px-1">
          <div><h2 className="text-sm font-bold text-slate-900 dark:text-white">Checklist onboarding Admin</h2><p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{filtered.length} dari {checklists.length} karyawan ditampilkan</p></div>
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
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-500 dark:text-slate-400"><span>{counts.verified} verified</span><span>{openDocuments} terbuka</span>{counts.rejected > 0 && <span className="font-semibold text-red-600 dark:text-red-300">{counts.rejected} perlu perbaikan</span>}<span>{item.documents.length} total</span></div>
                  {item.approvedBy && <p className="mt-2 text-[10px] font-medium text-emerald-700 dark:text-emerald-300">Approved by {item.approvedBy} · {item.approvedAt}</p>}
                </div>

                <div className="flex items-center gap-2 lg:justify-end">
                  {item.overallStatus === 'pending-review' && <button type="button" disabled={!allVerified} onClick={() => approve(item.id)} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none dark:disabled:bg-slate-800 dark:disabled:text-slate-500"><CheckCircle size={16} />Final Approve</button>}
                  <button type="button" onClick={() => setExpandedId(expanded ? null : item.id)} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">{expanded ? 'Tutup' : 'Kelola Checklist'}{expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</button>
                </div>
              </div>

              {expanded && (
                <div className="border-t border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/45 lg:p-5">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div><h4 className="text-sm font-bold text-slate-950 dark:text-white">Checklist dokumen oleh Admin</h4><p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Admin menerima dokumen, melakukan verifikasi, menandai perbaikan bila diperlukan, lalu memberikan final approval.</p></div>
                    <span className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">PIC: {ADMIN_NAME}</span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {item.documents.map((document) => {
                      const docMeta = documentMeta[document.status];
                      const DocIcon = documentIcon(document.status);
                      const iconTone = document.status === 'verified' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300' : document.status === 'rejected' ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300' : document.status === 'submitted' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300';
                      return (
                        <div key={document.name} className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
                          <div className="flex items-start gap-3">
                            <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${iconTone}`}><DocIcon size={18} /></span>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-start justify-between gap-2"><strong className="text-xs font-bold text-slate-900 dark:text-white">{document.name}</strong><span className={`shrink-0 rounded-full border px-2 py-1 text-[9px] font-bold ${docMeta.tone}`}>{docMeta.label}</span></div>
                              <p className="mt-1.5 text-[10px] leading-4 text-slate-500 dark:text-slate-400">{document.notes || '-'}</p>
                              {document.updatedBy && <p className="mt-1 text-[9px] text-slate-400">{document.updatedBy} · {document.updatedAt}</p>}
                            </div>
                          </div>

                          {item.overallStatus !== 'completed' && (
                            <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                              {(document.status === 'pending' || document.status === 'rejected') && <button type="button" onClick={() => updateDocumentStatus(item.id, document.name, 'submitted')} className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-[10px] font-bold text-blue-700 hover:bg-blue-100 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">Tandai Diterima</button>}
                              {document.status === 'submitted' && <button type="button" onClick={() => updateDocumentStatus(item.id, document.name, 'verified')} className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">Verifikasi</button>}
                              {document.status === 'submitted' && <button type="button" onClick={() => updateDocumentStatus(item.id, document.name, 'rejected')} className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-[10px] font-bold text-red-700 hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">Perlu Perbaikan</button>}
                              {document.status === 'verified' && <button type="button" onClick={() => updateDocumentStatus(item.id, document.name, 'submitted')} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">Batalkan Verifikasi</button>}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {!allVerified && <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200"><AlertTriangle size={17} className="mt-0.5 shrink-0" /><div><strong className="text-[11px] font-bold">Final approval belum tersedia</strong><p className="mt-0.5 text-[10px] leading-4">Admin harus menandai seluruh dokumen sebagai Terverifikasi. Setelah 100%, status otomatis menjadi Siap Disetujui dan tombol Final Approve muncul.</p></div></div>}
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
