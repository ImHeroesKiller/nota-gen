import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Moon,
  Plus,
  Search,
  Star,
  Sun,
  Users,
} from 'lucide-react';

interface RecruitmentPipelineProps {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

type ApplicantStage = 'applied' | 'screening' | 'interview' | 'test' | 'offered' | 'hired' | 'rejected';

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
  next?: ApplicantStage;
  action?: string;
}> = {
  applied: { label: 'Applied', badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300', next: 'screening', action: 'Move to Screening' },
  screening: { label: 'Screening', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300', next: 'interview', action: 'Schedule Interview' },
  interview: { label: 'Interview', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300', next: 'test', action: 'Move to Test' },
  test: { label: 'Test', badge: 'bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300', next: 'offered', action: 'Make Offer' },
  offered: { label: 'Offered', badge: 'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300', next: 'hired', action: 'Mark as Hired' },
  hired: { label: 'Hired', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' },
  rejected: { label: 'Rejected', badge: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300' },
};

const makeId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const today = () => new Date().toISOString().split('T')[0];
const normalizePhone = (value: string) => value.replace(/[\s()-]/g, '');

export default function RecruitmentPipeline({ onBack, darkMode, setDarkMode }: RecruitmentPipelineProps) {
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
  const [filterStage, setFilterStage] = useState<'all' | ApplicantStage>('all');
  const [filterDivision, setFilterDivision] = useState('all');
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    division: '',
    notes: '',
  });

  const bg = darkMode ? 'bg-[#0b1220]' : 'bg-[#f6f8fb]';
  const surface = darkMode ? 'bg-[#111827]' : 'bg-white';
  const surfaceMuted = darkMode ? 'bg-[#172033]' : 'bg-[#f8fafc]';
  const border = darkMode ? 'border-[#273449]' : 'border-[#e5eaf1]';
  const text = darkMode ? 'text-[#e5edf8]' : 'text-[#0f172a]';
  const muted = darkMode ? 'text-[#92a3ba]' : 'text-[#64748b]';
  const input = darkMode
    ? 'bg-[#0b1220] border-[#334155] text-[#e5edf8]'
    : 'bg-white border-[#dbe3ee] text-[#0f172a]';
  const hover = darkMode ? 'hover:bg-[#172033]' : 'hover:bg-[#f8fafc]';

  const divisions = useMemo(() => Array.from(new Set(applicants.map((item) => item.division))).sort(), [applicants]);

  const stats = useMemo(() => ({
    total: applicants.length,
    new: applicants.filter((item) => item.stage === 'applied').length,
    active: applicants.filter((item) => !['hired', 'rejected'].includes(item.stage)).length,
    hired: applicants.filter((item) => item.stage === 'hired').length,
  }), [applicants]);

  const filteredApplicants = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return applicants.filter((applicant) => {
      const matchesStage = filterStage === 'all' || applicant.stage === filterStage;
      const matchesDivision = filterDivision === 'all' || applicant.division === filterDivision;
      const haystack = `${applicant.name} ${applicant.email} ${applicant.phone} ${applicant.position} ${applicant.division}`.toLowerCase();
      return matchesStage && matchesDivision && (!needle || haystack.includes(needle));
    });
  }, [applicants, filterDivision, filterStage, query]);

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

    if (!name || !email || !phone || !position || !division) return 'Nama, email, telepon, posisi, dan divisi wajib diisi.';
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
      if (applicant.stage === 'hired' || applicant.stage === 'rejected') return applicant;
      if (target === 'rejected') return { ...applicant, stage: 'rejected' };
      const allowedNext = stageConfig[applicant.stage].next;
      return allowedNext === target ? { ...applicant, stage: target } : applicant;
    }));
  };

  const updateRating = (id: string, rating: number) => {
    const safeRating = Math.max(0, Math.min(5, Math.round(rating)));
    setApplicants((previous) => previous.map((applicant) => (
      applicant.id === id ? { ...applicant, rating: safeRating } : applicant
    )));
  };

  const formatDate = (value: string) => {
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className={`min-h-full ${bg} ${text}`}>
      <header className={`sticky top-0 z-20 flex items-center justify-between gap-3 px-4 py-3 border-b ${surface} ${border}`}>
        <div className="flex items-center gap-3 min-w-0">
          <button type="button" onClick={onBack} className={`w-9 h-9 rounded-lg inline-flex items-center justify-center ${hover}`} aria-label="Kembali">
            <ArrowLeft size={18} />
          </button>
          <div className="w-9 h-9 rounded-lg bg-[#2563eb]/10 text-[#2563eb] inline-flex items-center justify-center shrink-0">
            <Users size={20} />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold truncate">Recruitment Pipeline</h1>
            <p className={`text-[11px] ${muted} truncate`}>Applicant Tracking System dengan stage transition terkontrol</p>
          </div>
        </div>
        <button type="button" onClick={() => setDarkMode(!darkMode)} className={`w-9 h-9 rounded-lg inline-flex items-center justify-center ${hover}`} aria-label="Ubah tema">
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-5">
        <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className={`text-[10px] font-bold tracking-[0.12em] uppercase ${muted}`}>Human Capital · Recruitment</p>
            <h2 className="text-2xl font-semibold mt-1">Kandidat & Pipeline</h2>
            <p className={`text-sm mt-1 ${muted}`}>Kelola kandidat dari application hingga hired dengan transisi tahap yang konsisten.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (showForm) resetForm();
              else {
                setShowForm(true);
                setError(null);
              }
            }}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1d4ed8]"
          >
            <Plus size={16} /> {showForm ? 'Batal Tambah' : 'Tambah Kandidat'}
          </button>
        </section>

        <section className={`grid grid-cols-2 lg:grid-cols-4 gap-2 rounded-xl border p-3 ${surface} ${border}`}>
          {[
            ['Total Kandidat', stats.total, 'text-[#2563eb]'],
            ['Baru', stats.new, 'text-slate-600 dark:text-slate-300'],
            ['Dalam Proses', stats.active, 'text-amber-600'],
            ['Hired', stats.hired, 'text-emerald-600'],
          ].map(([label, value, valueClass]) => (
            <div key={String(label)} className={`rounded-lg px-3 py-2.5 ${surfaceMuted}`}>
              <p className={`text-[10px] uppercase tracking-wide ${muted}`}>{label}</p>
              <p className={`text-lg font-semibold mt-0.5 ${valueClass}`}>{value}</p>
            </div>
          ))}
        </section>

        {showForm && (
          <section className={`rounded-2xl border p-4 md:p-5 ${surface} ${border}`}>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-semibold">Kandidat Baru</h3>
                <p className={`text-[11px] mt-0.5 ${muted}`}>Duplikasi email dan nomor telepon akan ditolak.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="text-xs font-medium">Nama Lengkap *
                <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm ${input}`} placeholder="Nama kandidat" />
              </label>
              <label className="text-xs font-medium">Email *
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm ${input}`} placeholder="nama@email.com" />
              </label>
              <label className="text-xs font-medium">Nomor Telepon *
                <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm ${input}`} placeholder="081234567890" />
              </label>
              <label className="text-xs font-medium">Posisi Dilamar *
                <input value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm ${input}`} placeholder="Security Guard" />
              </label>
              <label className="text-xs font-medium">Divisi *
                <input value={formData.division} onChange={(e) => setFormData({ ...formData, division: e.target.value })} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm ${input}`} placeholder="Security" />
              </label>
              <label className="text-xs font-medium md:col-span-2">Catatan
                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm resize-y ${input}`} placeholder="Catatan kandidat" />
              </label>
            </div>
            {error && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <p className="text-xs leading-5">{error}</p>
              </div>
            )}
            <div className="flex gap-2 mt-4">
              <button type="button" onClick={handleSubmit} className="rounded-lg bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1d4ed8]">Simpan Kandidat</button>
              <button type="button" onClick={resetForm} className={`rounded-lg border px-4 py-2.5 text-sm font-semibold ${border} ${hover}`}>Batal</button>
            </div>
          </section>
        )}

        <section className={`rounded-2xl border ${surface} ${border} overflow-hidden`}>
          <div className={`p-4 md:p-5 border-b ${border}`}>
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(240px,1fr)_180px_210px] gap-3">
              <label className={`flex items-center gap-2 rounded-lg border px-3 ${input}`}>
                <Search size={16} className={muted} />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari kandidat, email, posisi..." className="w-full bg-transparent py-2.5 text-sm outline-none" />
              </label>
              <select value={filterStage} onChange={(e) => setFilterStage(e.target.value as 'all' | ApplicantStage)} className={`rounded-lg border px-3 py-2.5 text-sm ${input}`}>
                <option value="all">Semua Stage</option>
                {(Object.keys(stageConfig) as ApplicantStage[]).map((stage) => <option key={stage} value={stage}>{stageConfig[stage].label}</option>)}
              </select>
              <select value={filterDivision} onChange={(e) => setFilterDivision(e.target.value)} className={`rounded-lg border px-3 py-2.5 text-sm ${input}`}>
                <option value="all">Semua Divisi</option>
                {divisions.map((division) => <option key={division} value={division}>{division}</option>)}
              </select>
            </div>
          </div>

          <div className="p-4 md:p-5 space-y-3">
            {filteredApplicants.length === 0 ? (
              <div className={`rounded-xl border border-dashed p-10 text-center ${border}`}>
                <Users size={28} className={`mx-auto ${muted}`} />
                <p className="text-sm font-semibold mt-3">Tidak ada kandidat ditemukan</p>
                <p className={`text-[11px] mt-1 ${muted}`}>Ubah filter atau kata pencarian.</p>
              </div>
            ) : filteredApplicants.map((applicant) => {
              const stage = stageConfig[applicant.stage];
              return (
                <article key={applicant.id} className={`rounded-xl border p-4 ${surfaceMuted} ${border}`}>
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-semibold">{applicant.name}</h4>
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${stage.badge}`}>{stage.label}</span>
                      </div>
                      <p className={`text-xs mt-1 ${muted}`}>{applicant.position} · {applicant.division}</p>
                      <p className={`text-[11px] mt-1 ${muted}`}>{applicant.email} · {applicant.phone}</p>
                      <p className={`text-[10px] mt-1 ${muted}`}>Applied {formatDate(applicant.appliedDate)}</p>
                      {applicant.notes && <p className="text-xs mt-3 leading-5">{applicant.notes}</p>}
                    </div>

                    <div className="lg:text-right shrink-0">
                      <p className={`text-[10px] uppercase tracking-wide ${muted}`}>Rating</p>
                      <div className="flex lg:justify-end gap-0.5 mt-1">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <button type="button" key={value} onClick={() => updateRating(applicant.id, value)} aria-label={`Rating ${value}`} className="p-0.5">
                            <Star size={17} className={value <= applicant.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {applicant.stage !== 'hired' && applicant.stage !== 'rejected' && (
                    <div className={`flex flex-wrap gap-2 mt-4 pt-3 border-t ${border}`}>
                      {stage.next && stage.action && (
                        <button type="button" onClick={() => moveApplicant(applicant.id, stage.next!)} className="rounded-lg bg-[#2563eb] px-3 py-2 text-xs font-semibold text-white hover:bg-[#1d4ed8]">{stage.action}</button>
                      )}
                      <button type="button" onClick={() => moveApplicant(applicant.id, 'rejected')} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/30">Reject</button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
