import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Briefcase,
  Calendar,
  CheckCircle,
  ChevronRight,
  Grid2X2,
  List,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Shield,
  UserPlus,
  Users,
  X,
} from 'lucide-react';

interface RecruitmentPipelineProps {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

type ApplicantStage = 'registered' | 'screening' | 'compliance' | 'mobilization' | 'active' | 'rejected';
type ViewMode = 'board' | 'list';
type SortMode = 'newest' | 'readiness' | 'name';
type ComplianceKey = 'identity' | 'mcu' | 'induction' | 'competency' | 'sitePermit' | 'bank';

interface ComplianceItem {
  key: ComplianceKey;
  label: string;
  required: boolean;
  verified: boolean;
}

interface Applicant {
  id: string;
  name: string;
  nik: string;
  phone: string;
  position: string;
  site: string;
  project: string;
  domicile: string;
  appliedDate: string;
  stage: ApplicantStage;
  dailyRate: number;
  roster: string;
  experience: string;
  notes: string;
  compliance: ComplianceItem[];
}

const stageConfig: Record<ApplicantStage, {
  label: string;
  badge: string;
  dot: string;
  next?: ApplicantStage;
  action?: string;
}> = {
  registered: {
    label: 'Registrasi',
    badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    dot: 'bg-slate-400',
    next: 'screening',
    action: 'Lanjut Screening',
  },
  screening: {
    label: 'Screening',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
    dot: 'bg-blue-500',
    next: 'compliance',
    action: 'Masuk MCU & Compliance',
  },
  compliance: {
    label: 'MCU & Compliance',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
    dot: 'bg-amber-500',
    next: 'mobilization',
    action: 'Siap Mobilisasi',
  },
  mobilization: {
    label: 'Siap Mobilisasi',
    badge: 'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300',
    dot: 'bg-violet-500',
    next: 'active',
    action: 'Aktifkan sebagai PHL',
  },
  active: {
    label: 'Aktif PHL',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
    dot: 'bg-emerald-500',
  },
  rejected: {
    label: 'Tidak Lolos',
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
  { id: 'registered', title: 'Registrasi', subtitle: 'Kandidat harian masuk', stages: ['registered'], dot: 'bg-slate-400' },
  { id: 'screening', title: 'Screening', subtitle: 'Posisi, pengalaman, domisili', stages: ['screening'], dot: 'bg-blue-500' },
  { id: 'compliance', title: 'MCU & Compliance', subtitle: 'Fit-to-work & dokumen site', stages: ['compliance'], dot: 'bg-amber-500' },
  { id: 'mobilization', title: 'Siap Mobilisasi', subtitle: 'Rate, roster & site siap', stages: ['mobilization'], dot: 'bg-violet-500' },
  { id: 'active', title: 'Aktif PHL', subtitle: 'Pekerja harian aktif', stages: ['active'], dot: 'bg-emerald-500' },
  { id: 'rejected', title: 'Tidak Lolos', subtitle: 'Arsip kandidat', stages: ['rejected'], dot: 'bg-red-500' },
];

const makeId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const today = () => new Date().toISOString().split('T')[0];
const normalizePhone = (value: string) => value.replace(/[\s()-]/g, '');
const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

const createCompliance = (position: string): ComplianceItem[] => {
  const normalized = position.toLowerCase();
  const needsCompetency = /operator|driver|welder|mekanik|mechanic|rigger|electric|crane/.test(normalized);
  const needsSitePermit = /operator|driver/.test(normalized);
  return [
    { key: 'identity', label: 'KTP / Identitas', required: true, verified: false },
    { key: 'mcu', label: 'MCU / Fit-to-Work', required: true, verified: false },
    { key: 'induction', label: 'Safety Induction', required: true, verified: false },
    { key: 'competency', label: 'Sertifikat Kompetensi / SIO', required: needsCompetency, verified: !needsCompetency },
    { key: 'sitePermit', label: 'SIMPER / Site Permit', required: needsSitePermit, verified: !needsSitePermit },
    { key: 'bank', label: 'Rekening Pembayaran', required: true, verified: false },
  ];
};

const seededApplicants: Applicant[] = [
  {
    id: '1',
    name: 'Ahmad Wijaya',
    nik: '7204********0001',
    phone: '081245678901',
    position: 'Operator Dump Truck',
    site: 'Bahodopi',
    project: 'Nickel Hauling',
    domicile: 'Morowali',
    appliedDate: '2026-09-08',
    stage: 'compliance',
    dailyRate: 340000,
    roster: '20:10',
    experience: '4 tahun hauling tambang',
    notes: 'MCU selesai, SIMPER sedang diproses.',
    compliance: [
      { key: 'identity', label: 'KTP / Identitas', required: true, verified: true },
      { key: 'mcu', label: 'MCU / Fit-to-Work', required: true, verified: true },
      { key: 'induction', label: 'Safety Induction', required: true, verified: false },
      { key: 'competency', label: 'Sertifikat Kompetensi / SIO', required: true, verified: true },
      { key: 'sitePermit', label: 'SIMPER / Site Permit', required: true, verified: false },
      { key: 'bank', label: 'Rekening Pembayaran', required: true, verified: true },
    ],
  },
  {
    id: '2',
    name: 'Budi Santoso',
    nik: '7204********0002',
    phone: '082345678902',
    position: 'Helper Plant',
    site: 'IMIP',
    project: 'Plant Support',
    domicile: 'Kendari',
    appliedDate: '2026-09-09',
    stage: 'screening',
    dailyRate: 250000,
    roster: '20:10',
    experience: '2 tahun helper maintenance',
    notes: 'Siap penempatan Morowali, pengalaman kerja shift.',
    compliance: createCompliance('Helper Plant'),
  },
  {
    id: '3',
    name: 'Rizal Kurniawan',
    nik: '7204********0003',
    phone: '083456789013',
    position: 'Welder',
    site: 'Bahodopi',
    project: 'Workshop Maintenance',
    domicile: 'Makassar',
    appliedDate: '2026-09-06',
    stage: 'mobilization',
    dailyRate: 375000,
    roster: '20:10',
    experience: '5 tahun welding workshop tambang',
    notes: 'Dokumen lengkap, jadwal keberangkatan menunggu manifest.',
    compliance: createCompliance('Welder').map((item) => ({ ...item, verified: true })),
  },
  {
    id: '4',
    name: 'Andi Pratama',
    nik: '7204********0004',
    phone: '084567890124',
    position: 'General Worker',
    site: 'Morowali',
    project: 'Site Support',
    domicile: 'Kolaka',
    appliedDate: '2026-09-03',
    stage: 'active',
    dailyRate: 230000,
    roster: '20:10',
    experience: '1 tahun site support',
    notes: 'Aktif sebagai PHL, pembayaran berdasarkan hari hadir.',
    compliance: createCompliance('General Worker').map((item) => ({ ...item, verified: true })),
  },
];

export default function RecruitmentPipeline(_props: RecruitmentPipelineProps) {
  const [applicants, setApplicants] = useState<Applicant[]>(seededApplicants);
  const [showForm, setShowForm] = useState(false);
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [filterStage, setFilterStage] = useState<'all' | ApplicantStage>('all');
  const [filterSite, setFilterSite] = useState('all');
  const [query, setQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '', nik: '', phone: '', position: '', site: '', project: '', domicile: '', dailyRate: '', roster: '20:10', experience: '', notes: '',
  });

  const sites = useMemo(() => Array.from(new Set(applicants.map((item) => item.site))).sort(), [applicants]);

  const requiredCompliance = (applicant: Applicant) => applicant.compliance.filter((item) => item.required);
  const readiness = (applicant: Applicant) => {
    const required = requiredCompliance(applicant);
    if (!required.length) return 100;
    return Math.round((required.filter((item) => item.verified).length / required.length) * 100);
  };
  const isComplianceReady = (applicant: Applicant) => requiredCompliance(applicant).every((item) => item.verified);

  const stats = useMemo(() => ({
    total: applicants.length,
    mobilization: applicants.filter((item) => item.stage === 'mobilization').length,
    process: applicants.filter((item) => ['registered', 'screening', 'compliance'].includes(item.stage)).length,
    active: applicants.filter((item) => item.stage === 'active').length,
  }), [applicants]);

  const filteredApplicants = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = applicants.filter((applicant) => {
      const matchesStage = filterStage === 'all' || applicant.stage === filterStage;
      const matchesSite = filterSite === 'all' || applicant.site === filterSite;
      const haystack = `${applicant.name} ${applicant.nik} ${applicant.phone} ${applicant.position} ${applicant.site} ${applicant.project} ${applicant.domicile}`.toLowerCase();
      return matchesStage && matchesSite && (!needle || haystack.includes(needle));
    });

    return [...filtered].sort((a, b) => {
      if (sortMode === 'readiness') return readiness(b) - readiness(a) || b.appliedDate.localeCompare(a.appliedDate);
      if (sortMode === 'name') return a.name.localeCompare(b.name, 'id');
      return b.appliedDate.localeCompare(a.appliedDate);
    });
  }, [applicants, filterSite, filterStage, query, sortMode]);

  const selectedApplicant = useMemo(() => applicants.find((applicant) => applicant.id === selectedApplicantId) ?? null, [applicants, selectedApplicantId]);
  const visibleColumns = useMemo(() => filterStage === 'all' ? boardColumns : boardColumns.filter((column) => column.stages.includes(filterStage)), [filterStage]);

  const resetForm = () => {
    setFormData({ name: '', nik: '', phone: '', position: '', site: '', project: '', domicile: '', dailyRate: '', roster: '20:10', experience: '', notes: '' });
    setError(null);
    setShowForm(false);
  };

  const validateApplicant = () => {
    const name = formData.name.trim();
    const nik = formData.nik.trim();
    const phone = normalizePhone(formData.phone.trim());
    const position = formData.position.trim();
    const site = formData.site.trim();
    const project = formData.project.trim();
    const rate = Number(formData.dailyRate);

    if (!name || !nik || !phone || !position || !site || !project || !formData.domicile.trim()) return 'Nama, NIK, telepon, posisi, site, project, dan domisili wajib diisi.';
    if (!/^\d{12,18}$/.test(nik)) return 'NIK harus berupa 12–18 digit.';
    if (!/^\+?\d{9,15}$/.test(phone)) return 'Nomor telepon harus berisi 9–15 digit dan boleh diawali +.';
    if (!Number.isFinite(rate) || rate <= 0) return 'Rate harian harus lebih dari 0.';
    if (applicants.some((item) => item.nik === nik)) return 'NIK kandidat sudah terdaftar.';
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
      nik: formData.nik.trim(),
      phone: normalizePhone(formData.phone.trim()),
      position: formData.position.trim(),
      site: formData.site.trim(),
      project: formData.project.trim(),
      domicile: formData.domicile.trim(),
      appliedDate: today(),
      stage: 'registered',
      dailyRate: Number(formData.dailyRate),
      roster: formData.roster.trim() || '20:10',
      experience: formData.experience.trim(),
      notes: formData.notes.trim(),
      compliance: createCompliance(formData.position.trim()),
    };

    setApplicants((previous) => [applicant, ...previous]);
    resetForm();
  };

  const moveApplicant = (id: string, target: ApplicantStage) => {
    setError(null);
    setApplicants((previous) => previous.map((applicant) => {
      if (applicant.id !== id) return applicant;
      if (target === 'rejected') return applicant.stage === 'active' ? applicant : { ...applicant, stage: 'rejected' };
      if (applicant.stage === 'rejected' && target === 'registered') return { ...applicant, stage: 'registered' };
      if (applicant.stage === 'active' || applicant.stage === 'rejected') return applicant;
      const allowedNext = stageConfig[applicant.stage].next;
      if (allowedNext !== target) return applicant;
      if (applicant.stage === 'compliance' && target === 'mobilization' && !isComplianceReady(applicant)) {
        setError('Kandidat belum dapat dimobilisasi. Selesaikan seluruh compliance wajib terlebih dahulu.');
        return applicant;
      }
      return { ...applicant, stage: target };
    }));
    setOpenMenuId(null);
  };

  const toggleCompliance = (applicantId: string, key: ComplianceKey) => {
    setApplicants((previous) => previous.map((applicant) => {
      if (applicant.id !== applicantId) return applicant;
      return {
        ...applicant,
        compliance: applicant.compliance.map((item) => item.key === key && item.required ? { ...item, verified: !item.verified } : item),
      };
    }));
  };

  const formatDate = (value: string) => {
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');

  const Readiness = ({ applicant, compact = false }: { applicant: Applicant; compact?: boolean }) => {
    const percentage = readiness(applicant);
    const required = requiredCompliance(applicant);
    const verified = required.filter((item) => item.verified).length;
    const tone = percentage === 100 ? 'bg-emerald-500' : percentage >= 60 ? 'bg-blue-500' : 'bg-amber-500';
    return (
      <div className={compact ? 'min-w-[120px]' : 'min-w-[180px]'}>
        <div className="mb-1 flex items-center justify-between gap-2 text-[10px] text-[var(--erp-text-secondary)]">
          <span>Readiness</span><strong className="text-[var(--erp-text)]">{verified}/{required.length}</strong>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-[var(--erp-surface-muted)]"><div className={`h-full rounded-full ${tone}`} style={{ width: `${percentage}%` }} /></div>
      </div>
    );
  };

  const CandidateMenu = ({ applicant }: { applicant: Applicant }) => {
    const stage = stageConfig[applicant.stage];
    const isOpen = openMenuId === applicant.id;
    return (
      <div className="relative">
        <button type="button" onClick={(event) => { event.stopPropagation(); setOpenMenuId(isOpen ? null : applicant.id); }} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--erp-text-secondary)] hover:bg-[var(--erp-surface-muted)] hover:text-[var(--erp-text)]" aria-label={`Aksi untuk ${applicant.name}`}><MoreHorizontal size={17} /></button>
        {isOpen && (
          <div className="absolute right-0 top-9 z-30 w-52 overflow-hidden rounded-xl border border-[var(--erp-border)] bg-[var(--erp-surface)] p-1.5 shadow-xl">
            <button type="button" onClick={(event) => { event.stopPropagation(); setSelectedApplicantId(applicant.id); setOpenMenuId(null); }} className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-[var(--erp-surface-muted)]">Lihat detail & compliance</button>
            {stage.next && applicant.stage !== 'rejected' && (
              <button type="button" onClick={(event) => { event.stopPropagation(); moveApplicant(applicant.id, stage.next!); }} className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-[#2563eb] hover:bg-[#2563eb]/5">{stage.action}</button>
            )}
            {applicant.stage === 'rejected' ? (
              <button type="button" onClick={(event) => { event.stopPropagation(); moveApplicant(applicant.id, 'registered'); }} className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20">Buka kembali kandidat</button>
            ) : applicant.stage !== 'active' && (
              <button type="button" onClick={(event) => { event.stopPropagation(); moveApplicant(applicant.id, 'rejected'); }} className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20">Tandai tidak lolos</button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-4 text-[var(--erp-text)]">
      <section className="rounded-2xl border border-blue-200 bg-blue-50/70 px-4 py-3 dark:border-blue-500/20 dark:bg-blue-500/5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-600 text-white"><Users size={19} /></span>
            <div>
              <strong className="text-sm">Recruitment PHL Tambang</strong>
              <p className="mt-0.5 text-[11px] leading-5 text-[var(--erp-text-secondary)]">Fokus pada kesiapan pekerja harian: posisi, rate per hari, roster, MCU/Fit-to-Work, safety induction, kompetensi, site permit, dan mobilisasi.</p>
            </div>
          </div>
          <button type="button" onClick={() => setShowForm(true)} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#2563eb] px-4 text-sm font-bold text-white shadow-sm hover:bg-[#1d4ed8]"><Plus size={17} />Tambah Kandidat PHL</button>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          { label: 'Total Kandidat', value: stats.total, helper: 'Seluruh kandidat PHL', tone: 'text-blue-600' },
          { label: 'Siap Mobilisasi', value: stats.mobilization, helper: 'Compliance lengkap', tone: 'text-violet-600' },
          { label: 'Dalam Proses', value: stats.process, helper: 'Screening / MCU / dokumen', tone: 'text-amber-600' },
          { label: 'Aktif PHL', value: stats.active, helper: 'Sudah bekerja di site', tone: 'text-emerald-600' },
        ].map((metric) => (
          <article key={metric.label} className="rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-surface)] p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--erp-text-secondary)]">{metric.label}</p>
            <strong className={`mt-2 block text-2xl font-bold ${metric.tone}`}>{metric.value}</strong>
            <p className="mt-1 text-[11px] text-[var(--erp-text-secondary)]">{metric.helper}</p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-surface)] p-3 shadow-sm">
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1.35fr)_210px_210px_190px_auto] xl:items-end">
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold text-[var(--erp-text-secondary)]">Cari pekerja</span>
            <span className="relative block"><Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--erp-text-secondary)]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nama, NIK, posisi, project..." className="h-10 w-full rounded-xl border border-[var(--erp-border)] bg-[var(--erp-surface-muted)] pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" /></span>
          </label>
          <label className="block"><span className="mb-1.5 block text-[11px] font-semibold text-[var(--erp-text-secondary)]">Tahap</span><select value={filterStage} onChange={(event) => setFilterStage(event.target.value as 'all' | ApplicantStage)} className="h-10 w-full rounded-xl border border-[var(--erp-border)] bg-[var(--erp-surface-muted)] px-3 text-sm outline-none"><option value="all">Semua tahap</option>{Object.entries(stageConfig).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}</select></label>
          <label className="block"><span className="mb-1.5 block text-[11px] font-semibold text-[var(--erp-text-secondary)]">Site</span><select value={filterSite} onChange={(event) => setFilterSite(event.target.value)} className="h-10 w-full rounded-xl border border-[var(--erp-border)] bg-[var(--erp-surface-muted)] px-3 text-sm outline-none"><option value="all">Semua site</option>{sites.map((site) => <option key={site} value={site}>{site}</option>)}</select></label>
          <label className="block"><span className="mb-1.5 block text-[11px] font-semibold text-[var(--erp-text-secondary)]">Urutkan</span><select value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)} className="h-10 w-full rounded-xl border border-[var(--erp-border)] bg-[var(--erp-surface-muted)] px-3 text-sm outline-none"><option value="newest">Terbaru</option><option value="readiness">Readiness tertinggi</option><option value="name">Nama A-Z</option></select></label>
          <div className="flex h-10 rounded-xl border border-[var(--erp-border)] bg-[var(--erp-surface-muted)] p-1"><button type="button" onClick={() => setViewMode('board')} className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold ${viewMode === 'board' ? 'bg-[var(--erp-surface)] text-blue-600 shadow-sm' : 'text-[var(--erp-text-secondary)]'}`}><Grid2X2 size={14} />Board</button><button type="button" onClick={() => setViewMode('list')} className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold ${viewMode === 'list' ? 'bg-[var(--erp-surface)] text-blue-600 shadow-sm' : 'text-[var(--erp-text-secondary)]'}`}><List size={14} />List</button></div>
        </div>
      </section>

      {error && <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200"><AlertTriangle size={16} className="mt-0.5 shrink-0" /><span>{error}</span><button type="button" className="ml-auto" onClick={() => setError(null)}><X size={15} /></button></div>}

      {viewMode === 'list' ? (
        <section className="space-y-2.5">
          {filteredApplicants.map((applicant) => {
            const stage = stageConfig[applicant.stage];
            return (
              <article key={applicant.id} onClick={() => setSelectedApplicantId(applicant.id)} className="grid cursor-pointer gap-4 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-surface)] p-4 shadow-sm transition hover:border-blue-300 lg:grid-cols-[minmax(260px,1fr)_minmax(220px,.85fr)_minmax(220px,.85fr)_190px_auto] lg:items-center">
                <div className="flex min-w-0 items-center gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-500/10 text-sm font-bold text-blue-600">{initials(applicant.name)}</span><div className="min-w-0"><h3 className="truncate text-sm font-bold">{applicant.name}</h3><p className="mt-0.5 truncate text-[11px] text-[var(--erp-text-secondary)]">{applicant.position} · {applicant.project}</p></div></div>
                <div className="text-[11px] text-[var(--erp-text-secondary)]"><p className="font-semibold text-[var(--erp-text)]">NIK {applicant.nik}</p><p className="mt-1 inline-flex items-center gap-1.5"><Phone size={12} />{applicant.phone}</p></div>
                <div className="text-[11px] text-[var(--erp-text-secondary)]"><p className="font-semibold text-[var(--erp-text)]">{applicant.site} · Roster {applicant.roster}</p><p className="mt-1">Rate {formatCurrency(applicant.dailyRate)}/hari</p></div>
                <div><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${stage.badge}`}><span className={`h-1.5 w-1.5 rounded-full ${stage.dot}`} />{stage.label}</span><p className="mt-1.5 text-[10px] text-[var(--erp-text-secondary)]">Masuk {formatDate(applicant.appliedDate)}</p></div>
                <div className="flex items-center justify-between gap-3 lg:justify-end"><Readiness applicant={applicant} compact /><CandidateMenu applicant={applicant} /></div>
              </article>
            );
          })}
        </section>
      ) : (
        <section className="overflow-x-auto pb-2"><div className="grid min-w-[1500px] grid-cols-6 gap-3">{visibleColumns.map((column) => {
          const items = filteredApplicants.filter((applicant) => column.stages.includes(applicant.stage));
          return <div key={column.id} className="rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-surface-muted)] p-3"><div className="mb-3 flex items-start justify-between gap-2"><div><div className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${column.dot}`} /><h3 className="text-sm font-bold">{column.title}</h3></div><p className="mt-1 text-[10px] text-[var(--erp-text-secondary)]">{column.subtitle}</p></div><span className="rounded-full border border-[var(--erp-border)] bg-[var(--erp-surface)] px-2 py-0.5 text-[10px] font-bold">{items.length}</span></div><div className="space-y-2.5">{items.length === 0 ? <div className="rounded-xl border border-dashed border-[var(--erp-border)] p-4 text-center text-[10px] text-[var(--erp-text-secondary)]">Belum ada kandidat</div> : items.map((applicant) => { const stage = stageConfig[applicant.stage]; return <article key={applicant.id} onClick={() => setSelectedApplicantId(applicant.id)} className="cursor-pointer rounded-xl border border-[var(--erp-border)] bg-[var(--erp-surface)] p-3 shadow-sm hover:border-blue-300"><div className="flex items-start justify-between gap-2"><div className="flex min-w-0 gap-2"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blue-500/10 text-xs font-bold text-blue-600">{initials(applicant.name)}</span><div className="min-w-0"><h4 className="truncate text-xs font-bold">{applicant.name}</h4><p className="mt-0.5 truncate text-[10px] text-[var(--erp-text-secondary)]">{applicant.position}</p></div></div><CandidateMenu applicant={applicant} /></div><div className="mt-3 flex flex-wrap gap-1.5"><span className={`rounded-full px-2 py-1 text-[9px] font-bold ${stage.badge}`}>{stage.label}</span><span className="rounded-full bg-[var(--erp-surface-muted)] px-2 py-1 text-[9px] font-semibold">{applicant.site}</span></div><p className="mt-2 text-[10px] text-[var(--erp-text-secondary)]">{formatCurrency(applicant.dailyRate)}/hari · {applicant.roster}</p><div className="mt-3"><Readiness applicant={applicant} compact /></div></article>; })}</div></div>;
        })}</div></section>
      )}

      {filteredApplicants.length === 0 && <div className="rounded-2xl border border-dashed border-[var(--erp-border)] bg-[var(--erp-surface)] p-10 text-center"><Search size={22} className="mx-auto text-[var(--erp-text-secondary)]" /><strong className="mt-3 block text-sm">Tidak ada kandidat</strong><p className="mt-1 text-xs text-[var(--erp-text-secondary)]">Ubah filter atau kata kunci pencarian.</p></div>}

      {showForm && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) resetForm(); }}>
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-surface)] shadow-2xl">
            <div className="flex items-start justify-between border-b border-[var(--erp-border)] p-5"><div><h2 className="text-lg font-bold">Tambah Kandidat PHL Tambang</h2><p className="mt-1 text-xs text-[var(--erp-text-secondary)]">Data operasional untuk screening, rate harian, roster, compliance, dan mobilisasi.</p></div><button type="button" onClick={resetForm} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-[var(--erp-surface-muted)]"><X size={18} /></button></div>
            <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
              {[
                ['Nama lengkap','name','text','Contoh: Andi Saputra'], ['NIK','nik','text','16 digit NIK'], ['Nomor telepon','phone','tel','08...'], ['Posisi / Trade','position','text','Operator DT / Welder / Helper'], ['Site','site','text','Bahodopi / IMIP / Morowali'], ['Project','project','text','Nickel Hauling'], ['Domisili','domicile','text','Kendari'], ['Rate / Hari','dailyRate','number','340000'], ['Roster','roster','text','20:10'], ['Pengalaman','experience','text','3 tahun hauling tambang'],
              ].map(([label,key,type,placeholder]) => <label key={key} className="block"><span className="mb-1.5 block text-[11px] font-semibold text-[var(--erp-text-secondary)]">{label}</span><input type={type} value={(formData as any)[key]} onChange={(event) => setFormData((current) => ({ ...current, [key]: event.target.value }))} placeholder={placeholder} className="h-10 w-full rounded-xl border border-[var(--erp-border)] bg-[var(--erp-surface-muted)] px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" /></label>)}
              <label className="block md:col-span-2"><span className="mb-1.5 block text-[11px] font-semibold text-[var(--erp-text-secondary)]">Catatan</span><textarea value={formData.notes} onChange={(event) => setFormData((current) => ({ ...current, notes: event.target.value }))} rows={3} placeholder="Kesiapan kerja, jadwal, sertifikat, kondisi mobilisasi..." className="w-full rounded-xl border border-[var(--erp-border)] bg-[var(--erp-surface-muted)] px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" /></label>
              {error && <div className="md:col-span-2 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"><AlertTriangle size={15} className="mt-0.5 shrink-0" />{error}</div>}
            </div>
            <div className="flex justify-end gap-2 border-t border-[var(--erp-border)] p-4"><button type="button" onClick={resetForm} className="h-10 rounded-xl border border-[var(--erp-border)] px-4 text-sm font-semibold">Batal</button><button type="button" onClick={handleSubmit} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#2563eb] px-4 text-sm font-bold text-white hover:bg-[#1d4ed8]"><UserPlus size={16} />Simpan Kandidat</button></div>
          </div>
        </div>
      )}

      {selectedApplicant && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedApplicantId(null); }}>
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-surface)] shadow-2xl">
            <div className="flex items-start justify-between border-b border-[var(--erp-border)] p-5"><div className="flex items-start gap-3"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-blue-500/10 font-bold text-blue-600">{initials(selectedApplicant.name)}</span><div><h2 className="text-lg font-bold">{selectedApplicant.name}</h2><p className="mt-0.5 text-xs text-[var(--erp-text-secondary)]">{selectedApplicant.position} · {selectedApplicant.project} · {selectedApplicant.site}</p><div className="mt-2 flex flex-wrap gap-2"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${stageConfig[selectedApplicant.stage].badge}`}>{stageConfig[selectedApplicant.stage].label}</span><span className="rounded-full bg-[var(--erp-surface-muted)] px-2.5 py-1 text-[10px] font-semibold">PHL · {formatCurrency(selectedApplicant.dailyRate)}/hari</span><span className="rounded-full bg-[var(--erp-surface-muted)] px-2.5 py-1 text-[10px] font-semibold">Roster {selectedApplicant.roster}</span></div></div></div><button type="button" onClick={() => setSelectedApplicantId(null)} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-[var(--erp-surface-muted)]"><X size={18} /></button></div>
            <div className="grid gap-4 p-5 lg:grid-cols-[1fr_1.2fr]">
              <div className="space-y-4">
                <section className="rounded-xl border border-[var(--erp-border)] p-4"><h3 className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--erp-text-secondary)]">Data pekerja</h3><div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-xs"><div><span className="text-[var(--erp-text-secondary)]">NIK</span><strong className="mt-1 block">{selectedApplicant.nik}</strong></div><div><span className="text-[var(--erp-text-secondary)]">Telepon</span><strong className="mt-1 block">{selectedApplicant.phone}</strong></div><div><span className="text-[var(--erp-text-secondary)]">Domisili</span><strong className="mt-1 block">{selectedApplicant.domicile}</strong></div><div><span className="text-[var(--erp-text-secondary)]">Tanggal masuk</span><strong className="mt-1 block">{formatDate(selectedApplicant.appliedDate)}</strong></div><div><span className="text-[var(--erp-text-secondary)]">Pengalaman</span><strong className="mt-1 block">{selectedApplicant.experience || '-'}</strong></div><div><span className="text-[var(--erp-text-secondary)]">Project</span><strong className="mt-1 block">{selectedApplicant.project}</strong></div></div></section>
                <section className="rounded-xl border border-[var(--erp-border)] p-4"><h3 className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--erp-text-secondary)]">Kondisi kerja harian</h3><div className="mt-3 grid grid-cols-2 gap-3"><div className="rounded-lg bg-[var(--erp-surface-muted)] p-3"><span className="text-[10px] text-[var(--erp-text-secondary)]">Rate harian</span><strong className="mt-1 block text-sm">{formatCurrency(selectedApplicant.dailyRate)}</strong></div><div className="rounded-lg bg-[var(--erp-surface-muted)] p-3"><span className="text-[10px] text-[var(--erp-text-secondary)]">Roster</span><strong className="mt-1 block text-sm">{selectedApplicant.roster}</strong></div></div><p className="mt-3 text-[10px] leading-5 text-[var(--erp-text-secondary)]">Rate adalah upah per hari hadir. Aktivasi PHL dilakukan setelah compliance wajib selesai dan kandidat siap mobilisasi ke site.</p></section>
                {selectedApplicant.notes && <section className="rounded-xl border border-[var(--erp-border)] p-4"><h3 className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--erp-text-secondary)]">Catatan</h3><p className="mt-2 text-xs leading-5">{selectedApplicant.notes}</p></section>}
              </div>

              <section className="rounded-xl border border-[var(--erp-border)] p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="text-sm font-bold">Mining readiness & compliance</h3><p className="mt-1 text-[11px] text-[var(--erp-text-secondary)]">Admin verifikasi item yang diwajibkan sebelum mobilisasi.</p></div><Shield size={20} className={isComplianceReady(selectedApplicant) ? 'text-emerald-500' : 'text-amber-500'} /></div><div className="mt-4 space-y-2">{selectedApplicant.compliance.map((item) => <button type="button" key={item.key} disabled={!item.required} onClick={() => toggleCompliance(selectedApplicant.id, item.key)} className={`flex w-full items-center justify-between gap-3 rounded-xl border p-3 text-left transition ${!item.required ? 'cursor-default border-[var(--erp-border)] bg-[var(--erp-surface-muted)] opacity-55' : item.verified ? 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-500/20 dark:bg-emerald-500/10' : 'border-[var(--erp-border)] hover:border-blue-300 hover:bg-blue-50/50 dark:hover:bg-blue-500/5'}`}><div><strong className="text-xs">{item.label}</strong><p className="mt-0.5 text-[10px] text-[var(--erp-text-secondary)]">{item.required ? 'Wajib untuk posisi ini' : 'Tidak diwajibkan untuk posisi ini'}</p></div><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-bold ${!item.required ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' : item.verified ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'}`}>{item.verified ? <CheckCircle size={12} /> : null}{!item.required ? 'N/A' : item.verified ? 'Verified' : 'Belum'}</span></button>)}</div><div className="mt-4"><Readiness applicant={selectedApplicant} /></div>{selectedApplicant.stage === 'compliance' && !isComplianceReady(selectedApplicant) && <div className="mt-4 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[10px] leading-4 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200"><AlertTriangle size={15} className="mt-0.5 shrink-0" />Mobilisasi diblokir sampai semua item compliance wajib berstatus Verified.</div>}</section>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--erp-border)] p-4"><button type="button" onClick={() => setSelectedApplicantId(null)} className="h-10 rounded-xl border border-[var(--erp-border)] px-4 text-sm font-semibold">Tutup</button><div className="flex flex-wrap gap-2">{stageConfig[selectedApplicant.stage].next && selectedApplicant.stage !== 'rejected' && <button type="button" onClick={() => moveApplicant(selectedApplicant.id, stageConfig[selectedApplicant.stage].next!)} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#2563eb] px-4 text-sm font-bold text-white hover:bg-[#1d4ed8]">{stageConfig[selectedApplicant.stage].action}<ChevronRight size={16} /></button>}{selectedApplicant.stage !== 'active' && selectedApplicant.stage !== 'rejected' && <button type="button" onClick={() => moveApplicant(selectedApplicant.id, 'rejected')} className="h-10 rounded-xl border border-red-200 px-4 text-sm font-semibold text-red-600 hover:bg-red-50 dark:border-red-500/20 dark:hover:bg-red-500/10">Tidak Lolos</button>}</div></div>
          </div>
        </div>
      )}
    </div>
  );
}
