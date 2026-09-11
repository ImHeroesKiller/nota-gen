import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Briefcase,
  Calendar,
  ChevronRight,
  Grid2X2,
  List,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Star,
  UserPlus,
  Users,
  X,
} from 'lucide-react';

interface RecruitmentPipelineProps {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

type ApplicantStage = 'applied' | 'screening' | 'interview' | 'test' | 'offered' | 'hired' | 'rejected';
type ViewMode = 'board' | 'list';
type SortMode = 'newest' | 'rating' | 'name';

interface Applicant {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  division: string;
  appliedDate: string;
  stage: ApplicantStage;
  notes: string;
  rating: number;
}

const stageConfig: Record<ApplicantStage, {
  label: string;
  badge: string;
  dot: string;
  next?: ApplicantStage;
  action?: string;
}> = {
  applied: {
    label: 'Applied',
    badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    dot: 'bg-slate-400',
    next: 'screening',
    action: 'Move to Screening',
  },
  screening: {
    label: 'Screening',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
    dot: 'bg-blue-500',
    next: 'interview',
    action: 'Schedule Interview',
  },
  interview: {
    label: 'Interview',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
    dot: 'bg-amber-500',
    next: 'test',
    action: 'Move to Test',
  },
  test: {
    label: 'Test',
    badge: 'bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300',
    dot: 'bg-orange-500',
    next: 'offered',
    action: 'Make Offer',
  },
  offered: {
    label: 'Offered',
    badge: 'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300',
    dot: 'bg-violet-500',
    next: 'hired',
    action: 'Mark as Hired',
  },
  hired: {
    label: 'Hired',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
    dot: 'bg-emerald-500',
  },
  rejected: {
    label: 'Rejected',
    badge: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300',
    dot: 'bg-red-500',
  },
};

const boardColumns: Array<{
  id: string;
  title: string;
  subtitle: string;
  stages: ApplicantStage[];
  dot: string;
}> = [
  { id: 'applied', title: 'Applied', subtitle: 'Kandidat baru masuk', stages: ['applied'], dot: 'bg-slate-400' },
  { id: 'screening', title: 'Screening', subtitle: 'Verifikasi awal', stages: ['screening'], dot: 'bg-blue-500' },
  { id: 'assessment', title: 'Interview & Test', subtitle: 'Assessment kandidat', stages: ['interview', 'test'], dot: 'bg-amber-500' },
  { id: 'decision', title: 'Offer & Hired', subtitle: 'Keputusan akhir', stages: ['offered', 'hired'], dot: 'bg-emerald-500' },
  { id: 'rejected', title: 'Rejected', subtitle: 'Arsip kandidat', stages: ['rejected'], dot: 'bg-red-500' },
];

const makeId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const today = () => new Date().toISOString().split('T')[0];
const normalizePhone = (value: string) => value.replace(/[\s()-]/g, '');

export default function RecruitmentPipeline(_props: RecruitmentPipelineProps) {
  const [applicants, setApplicants] = useState<Applicant[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '081234567890',
      position: 'Security Guard',
      division: 'Security',
      appliedDate: '2026-01-05',
      stage: 'interview',
      notes: 'Berpengalaman 3 tahun, memiliki sertifikat Gada Pratama',
      rating: 4,
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@email.com',
      phone: '082345678901',
      position: 'Cleaning Service',
      division: 'Cleaning Service',
      appliedDate: '2026-01-07',
      stage: 'screening',
      notes: 'Fresh graduate, motivasi tinggi',
      rating: 3,
    },
    {
      id: '3',
      name: 'Ahmad Wijaya',
      email: 'ahmad.w@email.com',
      phone: '083456789012',
      position: 'Customer Service',
      division: 'Customer Service',
      appliedDate: '2026-01-08',
      stage: 'test',
      notes: 'Lulus screening, sedang menjalani tes psikologi',
      rating: 5,
    },
    {
      id: '4',
      name: 'Siti Nurhaliza',
      email: 'siti.n@email.com',
      phone: '084567890123',
      position: 'Admin Staff',
      division: 'Administration',
      appliedDate: '2026-01-03',
      stage: 'hired',
      notes: 'Diterima, mulai bekerja 15 Januari 2026',
      rating: 5,
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [filterStage, setFilterStage] = useState<'all' | ApplicantStage>('all');
  const [filterDivision, setFilterDivision] = useState('all');
  const [query, setQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('board');
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    division: '',
    notes: '',
  });

  const divisions = useMemo(
    () => Array.from(new Set(applicants.map((item) => item.division))).sort(),
    [applicants]
  );

  const stats = useMemo(() => ({
    total: applicants.length,
    new: applicants.filter((item) => item.stage === 'applied').length,
    active: applicants.filter((item) => !['hired', 'rejected'].includes(item.stage)).length,
    hired: applicants.filter((item) => item.stage === 'hired').length,
  }), [applicants]);

  const filteredApplicants = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = applicants.filter((applicant) => {
      const matchesStage = filterStage === 'all' || applicant.stage === filterStage;
      const matchesDivision = filterDivision === 'all' || applicant.division === filterDivision;
      const haystack = `${applicant.name} ${applicant.email} ${applicant.phone} ${applicant.position} ${applicant.division}`.toLowerCase();
      return matchesStage && matchesDivision && (!needle || haystack.includes(needle));
    });

    return [...filtered].sort((a, b) => {
      if (sortMode === 'rating') return b.rating - a.rating || b.appliedDate.localeCompare(a.appliedDate);
      if (sortMode === 'name') return a.name.localeCompare(b.name, 'id');
      return b.appliedDate.localeCompare(a.appliedDate);
    });
  }, [applicants, filterDivision, filterStage, query, sortMode]);

  const selectedApplicant = useMemo(
    () => applicants.find((applicant) => applicant.id === selectedApplicantId) ?? null,
    [applicants, selectedApplicantId]
  );

  const visibleColumns = useMemo(
    () => filterStage === 'all'
      ? boardColumns
      : boardColumns.filter((column) => column.stages.includes(filterStage)),
    [filterStage]
  );

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', position: '', division: '', notes: '' });
    setError(null);
    setShowForm(false);
  };

  const validateApplicant = () => {
    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();
    const phone = normalizePhone(formData.phone.trim());
    const position = formData.position.trim();
    const division = formData.division.trim();

    if (!name || !email || !phone || !position || !division) {
      return 'Nama, email, telepon, posisi, dan divisi wajib diisi.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Format email tidak valid.';
    if (!/^\+?\d{9,15}$/.test(phone)) return 'Nomor telepon harus berisi 9–15 digit dan boleh diawali +.';
    if (applicants.some((item) => item.email.toLowerCase() === email)) return 'Email kandidat sudah terdaftar.';
    if (applicants.some((item) => normalizePhone(item.phone) === phone)) return 'Nomor telepon kandidat sudah terdaftar.';
    return null;
  };

  const handleSubmit = () => {
    const validationError = validateApplicant();
    if (validationError) {
      setError(validationError);
      return;
    }

    const applicant: Applicant = {
      id: makeId(),
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: normalizePhone(formData.phone.trim()),
      position: formData.position.trim(),
      division: formData.division.trim(),
      notes: formData.notes.trim(),
      appliedDate: today(),
      stage: 'applied',
      rating: 0,
    };

    setApplicants((previous) => [applicant, ...previous]);
    resetForm();
  };

  const moveApplicant = (id: string, target: ApplicantStage) => {
    setError(null);
    setApplicants((previous) => previous.map((applicant) => {
      if (applicant.id !== id) return applicant;
      if (target === 'rejected') return applicant.stage === 'hired' ? applicant : { ...applicant, stage: 'rejected' };
      if (applicant.stage === 'rejected' && target === 'applied') return { ...applicant, stage: 'applied' };
      if (applicant.stage === 'hired' || applicant.stage === 'rejected') return applicant;
      const allowedNext = stageConfig[applicant.stage].next;
      return allowedNext === target ? { ...applicant, stage: target } : applicant;
    }));
    setOpenMenuId(null);
  };

  const updateRating = (id: string, rating: number) => {
    const safeRating = Math.max(0, Math.min(5, Math.round(rating)));
    setApplicants((previous) => previous.map((applicant) => (
      applicant.id === id ? { ...applicant, rating: safeRating } : applicant
    )));
  };

  const formatDate = (value: string) => {
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime())
      ? '-'
      : date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const initials = (name: string) => name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  const Rating = ({ applicant, compact = false }: { applicant: Applicant; compact?: boolean }) => (
    <div className="flex items-center gap-0.5" aria-label={`Rating ${applicant.rating} dari 5`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          type="button"
          key={value}
          onClick={(event) => {
            event.stopPropagation();
            updateRating(applicant.id, value);
          }}
          aria-label={`Beri rating ${value}`}
          className="rounded p-0.5 hover:bg-[var(--erp-surface-muted)]"
        >
          <Star
            size={compact ? 14 : 16}
            className={value <= applicant.rating
              ? 'fill-amber-400 text-amber-400'
              : 'text-slate-300 dark:text-slate-600'}
          />
        </button>
      ))}
    </div>
  );

  const CandidateMenu = ({ applicant }: { applicant: Applicant }) => {
    const stage = stageConfig[applicant.stage];
    const isOpen = openMenuId === applicant.id;

    return (
      <div className="relative">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setOpenMenuId(isOpen ? null : applicant.id);
          }}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--erp-text-secondary)] hover:bg-[var(--erp-surface-muted)] hover:text-[var(--erp-text)]"
          aria-label={`Aksi untuk ${applicant.name}`}
        >
          <MoreHorizontal size={17} />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-9 z-30 w-48 overflow-hidden rounded-xl border border-[var(--erp-border)] bg-[var(--erp-surface)] p-1.5 shadow-xl">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setSelectedApplicantId(applicant.id);
                setOpenMenuId(null);
              }}
              className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-[var(--erp-surface-muted)]"
            >
              Lihat detail
            </button>
            {stage.next && applicant.stage !== 'rejected' && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  moveApplicant(applicant.id, stage.next!);
                }}
                className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-[#2563eb] hover:bg-[#2563eb]/5"
              >
                {stage.action}
              </button>
            )}
            {applicant.stage === 'rejected' ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  moveApplicant(applicant.id, 'applied');
                }}
                className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
              >
                Reopen kandidat
              </button>
            ) : applicant.stage !== 'hired' && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  moveApplicant(applicant.id, 'rejected');
                }}
                className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                Reject kandidat
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  const CandidateCard = ({ applicant }: { applicant: Applicant }) => {
    const stage = stageConfig[applicant.stage];

    return (
      <article
        onClick={() => setSelectedApplicantId(applicant.id)}
        className="group cursor-pointer rounded-xl border border-[var(--erp-border)] bg-[var(--erp-surface)] p-4 shadow-[0_1px_3px_rgba(15,23,42,0.035)] transition hover:-translate-y-px hover:border-[#2563eb]/25 hover:shadow-[0_8px_22px_rgba(15,23,42,0.07)]"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2563eb]/10 text-xs font-bold text-[#2563eb]">
            {initials(applicant.name)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h4 className="truncate text-sm font-semibold text-[var(--erp-text)]">{applicant.name}</h4>
                <p className="mt-0.5 truncate text-xs text-[var(--erp-text-secondary)]">{applicant.position}</p>
              </div>
              <CandidateMenu applicant={applicant} />
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${stage.badge}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${stage.dot}`} />
            {stage.label}
          </span>
          <span className="text-[10px] font-medium text-[var(--erp-text-secondary)]">{applicant.division}</span>
        </div>

        <p className="mt-3 min-h-[40px] text-xs leading-5 text-[var(--erp-text-secondary)]">
          {applicant.notes || 'Belum ada catatan kandidat.'}
        </p>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--erp-border)] pt-3">
          <span className="inline-flex items-center gap-1.5 text-[10px] text-[var(--erp-text-secondary)]">
            <Calendar size={13} />
            {formatDate(applicant.appliedDate)}
          </span>
          <Rating applicant={applicant} compact />
        </div>
      </article>
    );
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-5 px-4 pb-8 pt-5 md:px-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="grid flex-1 grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            ['Total Kandidat', stats.total, 'text-[#2563eb]', 'bg-[#2563eb]/8'],
            ['Baru', stats.new, 'text-slate-700 dark:text-slate-200', 'bg-slate-500/8'],
            ['Dalam Proses', stats.active, 'text-amber-600', 'bg-amber-500/10'],
            ['Hired', stats.hired, 'text-emerald-600', 'bg-emerald-500/10'],
          ].map(([label, value, valueClass, accentClass]) => (
            <div
              key={String(label)}
              className="rounded-xl border border-[var(--erp-border)] bg-[var(--erp-surface)] p-4 shadow-[0_1px_3px_rgba(15,23,42,0.035)]"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--erp-text-secondary)]">{label}</p>
                <span className={`h-2 w-2 rounded-full ${accentClass}`} />
              </div>
              <p className={`mt-2 text-2xl font-bold ${valueClass}`}>{value}</p>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            setShowForm(true);
            setError(null);
            setOpenMenuId(null);
          }}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#2563eb] px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#1d4ed8]"
        >
          <Plus size={17} /> Tambah Kandidat
        </button>
      </section>

      <section className="rounded-xl border border-[var(--erp-border)] bg-[var(--erp-surface)] p-3 shadow-[0_1px_3px_rgba(15,23,42,0.035)] md:p-4">
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(280px,1fr)_180px_190px_160px_auto]">
          <label className="flex h-10 items-center gap-2 rounded-lg border border-[var(--erp-border)] bg-[var(--erp-surface-muted)] px-3 focus-within:border-[#2563eb]/50 focus-within:bg-[var(--erp-surface)] focus-within:ring-4 focus-within:ring-[#2563eb]/8">
            <Search size={16} className="text-[var(--erp-text-secondary)]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari kandidat, email, posisi..."
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--erp-text-secondary)]"
            />
          </label>

          <select
            value={filterStage}
            onChange={(event) => setFilterStage(event.target.value as 'all' | ApplicantStage)}
            className="h-10 rounded-lg border border-[var(--erp-border)] bg-[var(--erp-surface)] px-3 text-sm"
          >
            <option value="all">Semua Stage</option>
            {(Object.keys(stageConfig) as ApplicantStage[]).map((stage) => (
              <option key={stage} value={stage}>{stageConfig[stage].label}</option>
            ))}
          </select>

          <select
            value={filterDivision}
            onChange={(event) => setFilterDivision(event.target.value)}
            className="h-10 rounded-lg border border-[var(--erp-border)] bg-[var(--erp-surface)] px-3 text-sm"
          >
            <option value="all">Semua Divisi</option>
            {divisions.map((division) => <option key={division} value={division}>{division}</option>)}
          </select>

          <select
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value as SortMode)}
            className="h-10 rounded-lg border border-[var(--erp-border)] bg-[var(--erp-surface)] px-3 text-sm"
          >
            <option value="newest">Terbaru</option>
            <option value="rating">Rating Tertinggi</option>
            <option value="name">Nama A–Z</option>
          </select>

          <div className="inline-flex h-10 items-center rounded-lg border border-[var(--erp-border)] bg-[var(--erp-surface-muted)] p-1">
            <button
              type="button"
              onClick={() => setViewMode('board')}
              className={`inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-semibold ${
                viewMode === 'board'
                  ? 'bg-[var(--erp-surface)] text-[#2563eb] shadow-sm'
                  : 'text-[var(--erp-text-secondary)] hover:text-[var(--erp-text)]'
              }`}
            >
              <Grid2X2 size={14} /> Board
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-semibold ${
                viewMode === 'list'
                  ? 'bg-[var(--erp-surface)] text-[#2563eb] shadow-sm'
                  : 'text-[var(--erp-text-secondary)] hover:text-[var(--erp-text)]'
              }`}
            >
              <List size={14} /> List
            </button>
          </div>
        </div>
      </section>

      {filteredApplicants.length === 0 ? (
        <section className="rounded-xl border border-dashed border-[var(--erp-border)] bg-[var(--erp-surface)] px-6 py-14 text-center">
          <Users size={30} className="mx-auto text-[var(--erp-text-secondary)]" />
          <h3 className="mt-3 text-sm font-semibold">Tidak ada kandidat ditemukan</h3>
          <p className="mt-1 text-xs text-[var(--erp-text-secondary)]">Ubah filter atau kata pencarian.</p>
        </section>
      ) : viewMode === 'board' ? (
        <section className="overflow-x-auto pb-2">
          <div className="flex min-w-max gap-3 xl:min-w-0">
            {visibleColumns.map((column) => {
              const columnApplicants = filteredApplicants.filter((applicant) => column.stages.includes(applicant.stage));
              return (
                <div
                  key={column.id}
                  className="w-[300px] shrink-0 rounded-xl border border-[var(--erp-border)] bg-[var(--erp-surface-muted)] p-3 xl:min-w-[250px] xl:flex-1"
                >
                  <div className="mb-3 flex items-start justify-between gap-3 px-1">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${column.dot}`} />
                        <h3 className="text-xs font-bold text-[var(--erp-text)]">{column.title}</h3>
                      </div>
                      <p className="mt-1 text-[10px] text-[var(--erp-text-secondary)]">{column.subtitle}</p>
                    </div>
                    <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-[var(--erp-border)] bg-[var(--erp-surface)] px-2 text-[10px] font-bold text-[var(--erp-text-secondary)]">
                      {columnApplicants.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {columnApplicants.length > 0 ? (
                      columnApplicants.map((applicant) => <CandidateCard key={applicant.id} applicant={applicant} />)
                    ) : (
                      <div className="rounded-xl border border-dashed border-[var(--erp-border)] bg-[var(--erp-surface)] px-4 py-8 text-center text-[10px] text-[var(--erp-text-secondary)]">
                        Belum ada kandidat
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <section className="space-y-2">
          {filteredApplicants.map((applicant) => {
            const stage = stageConfig[applicant.stage];
            return (
              <article
                key={applicant.id}
                onClick={() => setSelectedApplicantId(applicant.id)}
                className="group grid cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-[var(--erp-border)] bg-[var(--erp-surface)] p-4 shadow-[0_1px_3px_rgba(15,23,42,0.03)] transition hover:border-[#2563eb]/25 hover:shadow-[0_6px_18px_rgba(15,23,42,0.06)] md:grid-cols-[auto_minmax(190px,1.1fr)_minmax(170px,0.9fr)_minmax(150px,0.8fr)_auto_auto]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2563eb]/10 text-xs font-bold text-[#2563eb]">
                  {initials(applicant.name)}
                </div>

                <div className="min-w-0">
                  <h4 className="truncate text-sm font-semibold">{applicant.name}</h4>
                  <p className="mt-0.5 truncate text-xs text-[var(--erp-text-secondary)]">{applicant.position} · {applicant.division}</p>
                </div>

                <div className="hidden min-w-0 md:block">
                  <p className="truncate text-xs text-[var(--erp-text-secondary)]">{applicant.email}</p>
                  <p className="mt-0.5 truncate text-[10px] text-[var(--erp-text-secondary)]">{applicant.phone}</p>
                </div>

                <div className="hidden md:block">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${stage.badge}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${stage.dot}`} /> {stage.label}
                  </span>
                  <p className="mt-1.5 text-[10px] text-[var(--erp-text-secondary)]">Applied {formatDate(applicant.appliedDate)}</p>
                </div>

                <div className="hidden md:flex"><Rating applicant={applicant} compact /></div>
                <CandidateMenu applicant={applicant} />
              </article>
            );
          })}
        </section>
      )}

      {showForm && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <section className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-surface)] shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-[var(--erp-border)] px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2563eb]/10 text-[#2563eb]">
                  <UserPlus size={19} />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Tambah Kandidat</h3>
                  <p className="mt-0.5 text-[11px] text-[var(--erp-text-secondary)]">Tambahkan kandidat baru ke tahap Applied.</p>
                </div>
              </div>
              <button type="button" onClick={resetForm} className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--erp-text-secondary)] hover:bg-[var(--erp-surface-muted)]">
                <X size={18} />
              </button>
            </div>

            <div className="grid max-h-[70vh] grid-cols-1 gap-4 overflow-y-auto p-5 md:grid-cols-2">
              <label className="text-xs font-semibold">Nama Lengkap *
                <input value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} className="mt-1.5 w-full" placeholder="Nama kandidat" />
              </label>
              <label className="text-xs font-semibold">Email *
                <input type="email" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} className="mt-1.5 w-full" placeholder="nama@email.com" />
              </label>
              <label className="text-xs font-semibold">Nomor Telepon *
                <input type="tel" value={formData.phone} onChange={(event) => setFormData({ ...formData, phone: event.target.value })} className="mt-1.5 w-full" placeholder="081234567890" />
              </label>
              <label className="text-xs font-semibold">Posisi Dilamar *
                <input value={formData.position} onChange={(event) => setFormData({ ...formData, position: event.target.value })} className="mt-1.5 w-full" placeholder="Security Guard" />
              </label>
              <label className="text-xs font-semibold md:col-span-2">Divisi *
                <input value={formData.division} onChange={(event) => setFormData({ ...formData, division: event.target.value })} className="mt-1.5 w-full" placeholder="Security" />
              </label>
              <label className="text-xs font-semibold md:col-span-2">Catatan
                <textarea value={formData.notes} onChange={(event) => setFormData({ ...formData, notes: event.target.value })} rows={3} className="mt-1.5 w-full resize-y" placeholder="Catatan kandidat" />
              </label>

              {error && (
                <div className="md:col-span-2 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                  <p className="text-xs leading-5">{error}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-[var(--erp-border)] bg-[var(--erp-surface-muted)] px-5 py-4">
              <button type="button" onClick={resetForm} className="rounded-lg border border-[var(--erp-border)] bg-[var(--erp-surface)] px-4 py-2 text-xs font-semibold">Batal</button>
              <button type="button" onClick={handleSubmit} className="rounded-lg bg-[#2563eb] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1d4ed8]">Simpan Kandidat</button>
            </div>
          </section>
        </div>
      )}

      {selectedApplicant && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm" onClick={() => setSelectedApplicantId(null)}>
          <section
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-surface)] shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-[var(--erp-border)] px-5 py-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#2563eb]/10 text-sm font-bold text-[#2563eb]">
                  {initials(selectedApplicant.name)}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-base font-bold">{selectedApplicant.name}</h3>
                  <p className="mt-0.5 truncate text-xs text-[var(--erp-text-secondary)]">{selectedApplicant.position} · {selectedApplicant.division}</p>
                </div>
              </div>
              <button type="button" onClick={() => setSelectedApplicantId(null)} className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--erp-text-secondary)] hover:bg-[var(--erp-surface-muted)]">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${stageConfig[selectedApplicant.stage].badge}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${stageConfig[selectedApplicant.stage].dot}`} />
                  {stageConfig[selectedApplicant.stage].label}
                </span>
                <Rating applicant={selectedApplicant} />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-[var(--erp-border)] bg-[var(--erp-surface-muted)] p-3">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-[var(--erp-text-secondary)]"><Mail size={13} /> Email</div>
                  <p className="mt-1.5 break-all text-xs font-semibold">{selectedApplicant.email}</p>
                </div>
                <div className="rounded-xl border border-[var(--erp-border)] bg-[var(--erp-surface-muted)] p-3">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-[var(--erp-text-secondary)]"><Phone size={13} /> Telepon</div>
                  <p className="mt-1.5 text-xs font-semibold">{selectedApplicant.phone}</p>
                </div>
                <div className="rounded-xl border border-[var(--erp-border)] bg-[var(--erp-surface-muted)] p-3">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-[var(--erp-text-secondary)]"><Briefcase size={13} /> Posisi</div>
                  <p className="mt-1.5 text-xs font-semibold">{selectedApplicant.position}</p>
                </div>
                <div className="rounded-xl border border-[var(--erp-border)] bg-[var(--erp-surface-muted)] p-3">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-[var(--erp-text-secondary)]"><Calendar size={13} /> Applied</div>
                  <p className="mt-1.5 text-xs font-semibold">{formatDate(selectedApplicant.appliedDate)}</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--erp-text-secondary)]">Catatan Kandidat</p>
                <p className="mt-2 rounded-xl border border-[var(--erp-border)] bg-[var(--erp-surface-muted)] p-3 text-xs leading-5 text-[var(--erp-text-secondary)]">
                  {selectedApplicant.notes || 'Belum ada catatan kandidat.'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[var(--erp-border)] bg-[var(--erp-surface-muted)] px-5 py-4">
              {selectedApplicant.stage === 'rejected' ? (
                <button type="button" onClick={() => moveApplicant(selectedApplicant.id, 'applied')} className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300">Reopen Kandidat</button>
              ) : selectedApplicant.stage !== 'hired' && (
                <button type="button" onClick={() => moveApplicant(selectedApplicant.id, 'rejected')} className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">Reject</button>
              )}
              {stageConfig[selectedApplicant.stage].next && (
                <button
                  type="button"
                  onClick={() => moveApplicant(selectedApplicant.id, stageConfig[selectedApplicant.stage].next!)}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#2563eb] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1d4ed8]"
                >
                  {stageConfig[selectedApplicant.stage].action} <ChevronRight size={14} />
                </button>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
