import { useMemo, useState } from 'react';
import {
  Briefcase,
  CheckCircle2,
  Grid2X2,
  List,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  Truck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import {
  calculateComplianceReadiness,
  createCompliance,
  createDeployment,
  type MiningWorker,
  type WorkerStage,
  useMiningWorkerLifecycle,
} from '../lib/miningWorkerLifecycle';

interface RecruitmentPipelineProps {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

type ViewMode = 'board' | 'list';
type SortMode = 'newest' | 'readiness' | 'name';

const stageMeta: Record<WorkerStage, { label: string; tone: string; dot: string; next?: WorkerStage; action?: string }> = {
  registration: { label: 'Registrasi', tone: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300', dot: 'bg-slate-400', next: 'screening', action: 'Lanjut Screening' },
  screening: { label: 'Screening', tone: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300', dot: 'bg-blue-500', next: 'compliance', action: 'Masuk MCU & Compliance' },
  compliance: { label: 'MCU & Compliance', tone: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300', dot: 'bg-amber-500' },
  mobilization: { label: 'Siap Mobilisasi', tone: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300', dot: 'bg-violet-500' },
  active: { label: 'Aktif PHL', tone: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300', dot: 'bg-emerald-500' },
  rejected: { label: 'Tidak Lolos', tone: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300', dot: 'bg-red-500' },
};

const boardColumns: Array<{ stage: WorkerStage; title: string; helper: string }> = [
  { stage: 'registration', title: 'Registrasi', helper: 'Kandidat baru' },
  { stage: 'screening', title: 'Screening', helper: 'Verifikasi awal Admin' },
  { stage: 'compliance', title: 'MCU & Compliance', helper: 'Dokumen & fit to work' },
  { stage: 'mobilization', title: 'Siap Mobilisasi', helper: 'Menunggu deployment' },
  { stage: 'active', title: 'Aktif PHL', helper: 'Sudah bekerja di site' },
  { stage: 'rejected', title: 'Tidak Lolos', helper: 'Arsip kandidat' },
];

const rupiah = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
const formatDate = (value?: string) => value ? new Date(`${value}T00:00:00`).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');

export default function RecruitmentPipeline(_props: RecruitmentPipelineProps) {
  const { store, addWorker, updateWorker } = useMiningWorkerLifecycle();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [query, setQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<'all' | WorkerStage>('all');
  const [siteFilter, setSiteFilter] = useState('all');
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [showForm, setShowForm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', nik: '', phone: '', position: '', trade: '', site: 'IMIP Morowali', project: 'Project Tambang A', domicile: '', dailyRate: '0', roster: '20 ON / 10 OFF' });

  const workers = store.workers;
  const selectedWorker = workers.find((item) => item.id === selectedId) ?? null;
  const sites = useMemo(() => Array.from(new Set(workers.map((item) => item.site))).sort(), [workers]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return workers.filter((worker) => {
      const search = `${worker.name} ${worker.workerCode} ${worker.nik} ${worker.position} ${worker.trade} ${worker.site} ${worker.project}`.toLowerCase();
      return (stageFilter === 'all' || worker.stage === stageFilter)
        && (siteFilter === 'all' || worker.site === siteFilter)
        && (!needle || search.includes(needle));
    }).sort((a, b) => {
      if (sortMode === 'name') return a.name.localeCompare(b.name, 'id');
      if (sortMode === 'readiness') return calculateComplianceReadiness(b).percentage - calculateComplianceReadiness(a).percentage;
      return b.appliedDate.localeCompare(a.appliedDate);
    });
  }, [workers, query, stageFilter, siteFilter, sortMode]);

  const stats = useMemo(() => ({
    total: workers.length,
    screening: workers.filter((item) => ['registration', 'screening'].includes(item.stage)).length,
    compliance: workers.filter((item) => item.stage === 'compliance').length,
    mobilization: workers.filter((item) => item.stage === 'mobilization').length,
    active: workers.filter((item) => item.stage === 'active').length,
  }), [workers]);

  const progressStage = (worker: MiningWorker) => {
    const next = stageMeta[worker.stage].next;
    if (!next) return;
    updateWorker(worker.id, { stage: next });
    setMenuId(null);
  };

  const rejectWorker = (worker: MiningWorker) => {
    if (worker.stage === 'active') return;
    updateWorker(worker.id, { stage: 'rejected' });
    setMenuId(null);
  };

  const resetForm = () => {
    setForm({ name: '', nik: '', phone: '', position: '', trade: '', site: 'IMIP Morowali', project: 'Project Tambang A', domicile: '', dailyRate: '0', roster: '20 ON / 10 OFF' });
    setError(null);
    setShowForm(false);
  };

  const submitWorker = () => {
    const dailyRate = Number(form.dailyRate);
    if (!form.name.trim() || !form.nik.trim() || !form.position.trim() || !form.site.trim() || !form.project.trim() || !form.domicile.trim()) {
      setError('Nama, NIK, posisi, site, project, dan domisili wajib diisi.');
      return;
    }
    if (!Number.isFinite(dailyRate) || dailyRate <= 0) {
      setError('Rate harian harus lebih besar dari 0.');
      return;
    }
    if (workers.some((item) => item.nik.trim().toLowerCase() === form.nik.trim().toLowerCase())) {
      setError('NIK kandidat sudah terdaftar.');
      return;
    }
    const id = globalThis.crypto?.randomUUID?.() ?? `wrk-${Date.now()}`;
    const worker: MiningWorker = {
      id,
      workerCode: `PHL-${String(workers.length + 1).padStart(3, '0')}`,
      name: form.name.trim(), nik: form.nik.trim(), phone: form.phone.trim(), position: form.position.trim(), trade: form.trade.trim() || 'General',
      site: form.site.trim(), project: form.project.trim(), domicile: form.domicile.trim(), dailyRate, roster: form.roster.trim() || '20 ON / 10 OFF',
      stage: 'registration', appliedDate: new Date().toISOString().slice(0, 10),
      compliance: createCompliance(form.position), deployment: createDeployment(),
    };
    addWorker(worker);
    resetForm();
  };

  const Readiness = ({ worker }: { worker: MiningWorker }) => {
    const readiness = calculateComplianceReadiness(worker);
    return (
      <div className="min-w-[150px]">
        <div className="mb-1 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400"><span>Compliance</span><strong>{readiness.percentage}%</strong></div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-blue-500" style={{ width: `${readiness.percentage}%` }} /></div>
        <div className="mt-1 text-[9px] text-slate-400">{readiness.verified}/{readiness.required} wajib verified</div>
      </div>
    );
  };

  const WorkerMenu = ({ worker }: { worker: MiningWorker }) => (
    <div className="relative">
      <button type="button" className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={(event) => { event.stopPropagation(); setMenuId(menuId === worker.id ? null : worker.id); }}><MoreHorizontal size={16} /></button>
      {menuId === worker.id && (
        <div className="absolute right-0 top-9 z-30 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-700 dark:bg-slate-900">
          <button className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => { setSelectedId(worker.id); setMenuId(null); }}>Lihat detail</button>
          {stageMeta[worker.stage].next && <button className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10" onClick={() => progressStage(worker)}>{stageMeta[worker.stage].action}</button>}
          {worker.stage === 'compliance' && <p className="px-3 py-2 text-[10px] leading-4 text-amber-600">Lanjutkan verifikasi di Onboarding Checklist.</p>}
          {worker.stage === 'mobilization' && <p className="px-3 py-2 text-[10px] leading-4 text-violet-600">Aktivasi PHL dilakukan dari Deployment Planner.</p>}
          {worker.stage === 'rejected' ? <button className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10" onClick={() => updateWorker(worker.id, { stage: 'registration' })}>Buka kembali</button> : worker.stage !== 'active' && <button className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10" onClick={() => rejectWorker(worker)}>Tidak lolos</button>}
        </div>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-[1500px] space-y-5 p-1 text-slate-900 dark:text-slate-100">
      <section className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        {[
          ['Total Kandidat', stats.total, Users, 'text-blue-600'],
          ['Registrasi & Screening', stats.screening, UserPlus, 'text-sky-600'],
          ['MCU & Compliance', stats.compliance, ShieldCheck, 'text-amber-600'],
          ['Siap Mobilisasi', stats.mobilization, Truck, 'text-violet-600'],
          ['Aktif PHL', stats.active, CheckCircle2, 'text-emerald-600'],
        ].map(([label, value, Icon, tone]) => {
          const MetricIcon = Icon as typeof Users;
          return <article key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">{String(label)}</p><strong className={`mt-2 block text-2xl ${String(tone)}`}>{String(value)}</strong></div><span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-50 text-slate-500 dark:bg-slate-800"><MetricIcon size={17} /></span></div></article>;
        })}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-3 lg:grid-cols-[minmax(280px,1.6fr)_1fr_1fr_0.8fr_auto_auto]">
          <label className="relative"><Search size={16} className="absolute left-3 top-3 text-slate-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari nama, NIK, posisi, site..." className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-950" /></label>
          <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value as 'all' | WorkerStage)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950"><option value="all">Semua Tahap</option>{Object.entries(stageMeta).map(([key, meta]) => <option key={key} value={key}>{meta.label}</option>)}</select>
          <select value={siteFilter} onChange={(e) => setSiteFilter(e.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950"><option value="all">Semua Site</option>{sites.map((site) => <option key={site}>{site}</option>)}</select>
          <select value={sortMode} onChange={(e) => setSortMode(e.target.value as SortMode)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950"><option value="newest">Terbaru</option><option value="readiness">Readiness</option><option value="name">Nama</option></select>
          <div className="flex h-10 rounded-xl border border-slate-200 p-1 dark:border-slate-700"><button className={`flex items-center gap-1 rounded-lg px-2 text-xs font-semibold ${viewMode === 'board' ? 'bg-blue-600 text-white' : 'text-slate-500'}`} onClick={() => setViewMode('board')}><Grid2X2 size={14} /> Board</button><button className={`flex items-center gap-1 rounded-lg px-2 text-xs font-semibold ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-500'}`} onClick={() => setViewMode('list')}><List size={14} /> List</button></div>
          <button className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700" onClick={() => setShowForm(true)}><Plus size={16} /> Tambah</button>
        </div>
      </section>

      {viewMode === 'list' ? (
        <section className="space-y-2">
          {filtered.map((worker) => <article key={worker.id} onClick={() => setSelectedId(worker.id)} className="grid cursor-pointer gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-blue-300 dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-[minmax(240px,1.4fr)_1fr_1fr_170px_34px] lg:items-center">
            <div className="flex items-center gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-xs font-bold text-blue-600 dark:bg-blue-500/10">{initials(worker.name)}</span><div className="min-w-0"><strong className="block truncate text-sm">{worker.name}</strong><p className="mt-0.5 truncate text-xs text-slate-500">{worker.position} · {worker.trade}</p><p className="mt-1 text-[10px] text-slate-400">{worker.workerCode} · {worker.nik}</p></div></div>
            <div><p className="text-xs font-semibold">{worker.site}</p><p className="mt-1 text-[10px] text-slate-500">{worker.project} · {worker.roster}</p></div>
            <div><p className="text-xs font-semibold">{rupiah(worker.dailyRate)} / hari</p><span className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-bold ${stageMeta[worker.stage].tone}`}><span className={`h-1.5 w-1.5 rounded-full ${stageMeta[worker.stage].dot}`} />{stageMeta[worker.stage].label}</span></div>
            <Readiness worker={worker} />
            <WorkerMenu worker={worker} />
          </article>)}
        </section>
      ) : (
        <section className="overflow-x-auto pb-2"><div className="grid min-w-[1500px] grid-cols-6 gap-3">{boardColumns.map((column) => { const items = filtered.filter((worker) => worker.stage === column.stage); return <div key={column.stage} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-950/30"><div className="mb-3 flex items-start justify-between"><div><h3 className="text-xs font-bold">{column.title}</h3><p className="text-[10px] text-slate-500">{column.helper}</p></div><span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold dark:bg-slate-900">{items.length}</span></div><div className="space-y-2">{items.map((worker) => <button key={worker.id} onClick={() => setSelectedId(worker.id)} className="w-full rounded-xl border border-slate-200 bg-white p-3 text-left dark:border-slate-800 dark:bg-slate-900"><div className="flex items-start justify-between gap-2"><div><strong className="text-xs">{worker.name}</strong><p className="mt-1 text-[10px] text-slate-500">{worker.position}</p></div><Briefcase size={14} className="text-slate-400" /></div><p className="mt-2 text-[10px] text-slate-500">{worker.site} · {rupiah(worker.dailyRate)}/hari</p><div className="mt-3"><Readiness worker={worker} /></div></button>)}</div></div>; })}</div></section>
      )}

      {showForm && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 p-4"><div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-lg font-bold">Tambah Kandidat PHL Tambang</h2><p className="text-xs text-slate-500">Data ini akan mengalir ke Onboarding, Deployment, Attendance, Timesheet, dan Payroll.</p></div><button onClick={resetForm} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X size={18} /></button></div>{error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">{error}</div>}<div className="grid gap-3 md:grid-cols-2">{[
        ['name','Nama Lengkap'],['nik','NIK / ID'],['phone','No. HP'],['position','Posisi / Trade'],['trade','Area / Trade'],['domicile','Domisili'],['site','Site'],['project','Project'],['dailyRate','Rate / Hari'],['roster','Roster']
      ].map(([key,label]) => <label key={key} className="text-xs font-semibold text-slate-600 dark:text-slate-300">{label}<input type={key === 'dailyRate' ? 'number' : 'text'} value={form[key as keyof typeof form]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950" /></label>)}</div><div className="mt-5 flex justify-end gap-2"><button onClick={resetForm} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold dark:border-slate-700">Batal</button><button onClick={submitWorker} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">Simpan Kandidat</button></div></div></div>}

      {selectedWorker && <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/55"><aside className="h-full w-full max-w-xl overflow-y-auto border-l border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900"><div className="flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">{selectedWorker.workerCode}</p><h2 className="mt-1 text-xl font-bold">{selectedWorker.name}</h2><p className="mt-1 text-sm text-slate-500">{selectedWorker.position} · {selectedWorker.site}</p></div><button onClick={() => setSelectedId(null)} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X size={18} /></button></div><div className="mt-5 grid grid-cols-2 gap-3">{[['NIK',selectedWorker.nik],['Domisili',selectedWorker.domicile],['Project',selectedWorker.project],['Roster',selectedWorker.roster],['Rate Harian',rupiah(selectedWorker.dailyRate)],['Tanggal Apply',formatDate(selectedWorker.appliedDate)]].map(([label,value]) => <div key={label} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800"><p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 text-xs font-semibold">{value}</p></div>)}</div><div className="mt-5 rounded-2xl border border-slate-200 p-4 dark:border-slate-700"><div className="flex items-center justify-between"><h3 className="text-sm font-bold">Lifecycle PHL</h3><span className={`rounded-full px-2 py-1 text-[9px] font-bold ${stageMeta[selectedWorker.stage].tone}`}>{stageMeta[selectedWorker.stage].label}</span></div><p className="mt-2 text-xs leading-5 text-slate-500">Screening dilakukan di sini. Setelah masuk MCU & Compliance, Admin melanjutkan verifikasi di Onboarding Checklist. Setelah lolos, Deployment Planner mengaktifkan pekerja sebagai PHL aktif.</p><div className="mt-4"><Readiness worker={selectedWorker} /></div></div></aside></div>}
    </div>
  );
}
