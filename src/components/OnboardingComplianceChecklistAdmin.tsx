import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  Search,
  ShieldCheck,
  Truck,
  UserCheck,
} from 'lucide-react';
import {
  calculateComplianceReadiness,
  type ComplianceKey,
  type MiningWorker,
  useMiningWorkerLifecycle,
} from '../lib/miningWorkerLifecycle';

const rupiah = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

export default function OnboardingComplianceChecklistAdmin() {
  const { store, updateWorker, adminName, nowLabel } = useMiningWorkerLifecycle();
  const [query, setQuery] = useState('');
  const [siteFilter, setSiteFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const workers = useMemo(
    () => store.workers.filter((worker) => ['compliance', 'mobilization', 'active'].includes(worker.stage)),
    [store.workers],
  );
  const sites = useMemo(() => Array.from(new Set(workers.map((worker) => worker.site))).sort(), [workers]);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return workers.filter((worker) => (siteFilter === 'all' || worker.site === siteFilter)
      && (!needle || `${worker.name} ${worker.workerCode} ${worker.nik} ${worker.position} ${worker.site} ${worker.project}`.toLowerCase().includes(needle)));
  }, [workers, query, siteFilter]);

  const toggleCompliance = (worker: MiningWorker, key: ComplianceKey) => {
    if (worker.stage === 'active') return;
    updateWorker(worker.id, (current) => ({
      ...current,
      compliance: {
        ...current.compliance,
        [key]: {
          ...current.compliance[key],
          verified: !current.compliance[key].verified,
          updatedBy: adminName,
          updatedAt: nowLabel(),
        },
      },
    }));
  };

  const markReady = (worker: MiningWorker) => {
    const readiness = calculateComplianceReadiness(worker);
    if (readiness.percentage !== 100) return;
    updateWorker(worker.id, { stage: 'mobilization' });
  };

  const metrics = {
    total: workers.length,
    compliance: workers.filter((worker) => worker.stage === 'compliance').length,
    ready: workers.filter((worker) => worker.stage === 'mobilization').length,
    active: workers.filter((worker) => worker.stage === 'active').length,
    attention: workers.filter((worker) => worker.stage === 'compliance' && calculateComplianceReadiness(worker).percentage < 100).length,
  };

  return (
    <div className="mx-auto max-w-[1500px] space-y-5 text-slate-900 dark:text-slate-100">
      <section className="flex flex-col gap-3 rounded-2xl border border-blue-200 bg-blue-50/70 p-4 dark:border-blue-500/20 dark:bg-blue-500/10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-600 text-white"><ShieldCheck size={18} /></span>
          <div><p className="text-xs font-bold">Onboarding PHL Tambang — dikelola Admin</p><p className="mt-1 text-[11px] leading-5 text-slate-600 dark:text-slate-300">Admin memverifikasi kontrak PHL, identitas, MCU/Fit to Work, induction, kompetensi/SIO, SIMPER bila diperlukan, dan rekening pembayaran. Setelah 100% verified, pekerja masuk Siap Mobilisasi.</p></div>
        </div>
        <span className="rounded-full border border-blue-200 bg-white px-3 py-1.5 text-[10px] font-bold text-blue-700 dark:border-blue-500/20 dark:bg-slate-900 dark:text-blue-300">Owner: {adminName}</span>
      </section>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        {[
          ['Total Onboarding', metrics.total, UserCheck, 'text-slate-900 dark:text-white'],
          ['MCU & Compliance', metrics.compliance, FileCheck2, 'text-amber-600'],
          ['Siap Mobilisasi', metrics.ready, Truck, 'text-violet-600'],
          ['Aktif PHL', metrics.active, CheckCircle2, 'text-emerald-600'],
          ['Perlu Tindakan', metrics.attention, AlertTriangle, 'text-red-600'],
        ].map(([label, value, Icon, tone]) => { const MetricIcon = Icon as typeof UserCheck; return <article key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">{String(label)}</p><strong className={`mt-2 block text-2xl ${String(tone)}`}>{String(value)}</strong></div><span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-50 text-slate-500 dark:bg-slate-800"><MetricIcon size={17} /></span></div></article>; })}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-3 md:grid-cols-[minmax(300px,1fr)_240px]">
          <label className="relative"><Search size={16} className="absolute left-3 top-3 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari pekerja, NIK, posisi, project..." className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-950" /></label>
          <select value={siteFilter} onChange={(event) => setSiteFilter(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950"><option value="all">Semua Site</option>{sites.map((site) => <option key={site}>{site}</option>)}</select>
        </div>
      </section>

      <section className="space-y-3">
        {filtered.map((worker) => {
          const readiness = calculateComplianceReadiness(worker);
          const open = expandedId === worker.id;
          const stageLabel = worker.stage === 'active' ? 'Aktif PHL' : worker.stage === 'mobilization' ? 'Siap Mobilisasi' : 'MCU & Compliance';
          const stageTone = worker.stage === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' : worker.stage === 'mobilization' ? 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300';
          return (
            <article key={worker.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <button type="button" onClick={() => setExpandedId(open ? null : worker.id)} className="grid w-full gap-4 p-4 text-left lg:grid-cols-[minmax(280px,1.5fr)_1fr_1fr_240px_auto] lg:items-center">
                <div><div className="flex flex-wrap items-center gap-2"><strong className="text-sm">{worker.name}</strong><span className={`rounded-full px-2 py-1 text-[9px] font-bold ${stageTone}`}>{stageLabel}</span></div><p className="mt-1 text-xs text-slate-500">{worker.workerCode} · {worker.position} · {worker.trade}</p><p className="mt-1 text-[10px] text-slate-400">{worker.nik}</p></div>
                <div><p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Site / Project</p><p className="mt-1 text-xs font-semibold">{worker.site}</p><p className="text-[10px] text-slate-500">{worker.project}</p></div>
                <div><p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Rate / Roster</p><p className="mt-1 text-xs font-semibold">{rupiah(worker.dailyRate)} / hari</p><p className="text-[10px] text-slate-500">{worker.roster}</p></div>
                <div><div className="flex items-center justify-between text-[10px]"><span className="text-slate-500">Compliance readiness</span><strong>{readiness.percentage}%</strong></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className={`h-full rounded-full ${readiness.percentage === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${readiness.percentage}%` }} /></div><p className="mt-1 text-[9px] text-slate-400">{readiness.verified}/{readiness.required} wajib verified</p></div>
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-50 text-slate-500 dark:bg-slate-800">{open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</span>
              </button>

              {open && <div className="border-t border-slate-200 p-4 dark:border-slate-800"><div className="grid gap-3 lg:grid-cols-2">{(Object.entries(worker.compliance) as Array<[ComplianceKey, MiningWorker['compliance'][ComplianceKey]]>).map(([key, item]) => {
                if (!item.required) return <div key={key} className="rounded-xl border border-dashed border-slate-200 p-3 opacity-60 dark:border-slate-700"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-semibold">{item.label}</p><p className="mt-1 text-[10px] text-slate-500">Tidak diwajibkan untuk posisi ini.</p></div><span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-bold text-slate-500 dark:bg-slate-800">N/A</span></div></div>;
                return <div key={key} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700"><div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2"><span className={`grid h-8 w-8 place-items-center rounded-lg ${item.verified ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10'}`}>{item.verified ? <CheckCircle2 size={16} /> : <AlertTriangle size={15} />}</span><div><p className="text-xs font-semibold">{item.label}</p><p className="mt-0.5 text-[10px] text-slate-500">{item.verified ? `Verified oleh ${item.updatedBy || adminName}` : 'Menunggu verifikasi Admin'}</p></div></div></div>{worker.stage !== 'active' && <button type="button" onClick={() => toggleCompliance(worker, key)} className={`rounded-lg px-3 py-2 text-[10px] font-bold ${item.verified ? 'border border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300' : 'bg-blue-600 text-white'}`}>{item.verified ? 'Batalkan' : 'Verifikasi'}</button>}</div>{item.updatedAt && <p className="mt-2 text-[9px] text-slate-400">Update: {item.updatedAt}</p>}</div>;
              })}</div><div className="mt-4 flex flex-col gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold">Gate ke Deployment</p><p className="mt-1 text-[10px] text-slate-500">Tombol aktif hanya jika semua compliance wajib sudah verified.</p></div>{worker.stage === 'compliance' ? <button disabled={readiness.percentage !== 100} onClick={() => markReady(worker)} className="rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">Tandai Siap Mobilisasi</button> : <span className="rounded-full bg-white px-3 py-2 text-[10px] font-bold text-slate-600 dark:bg-slate-900 dark:text-slate-300">{stageLabel}</span>}</div></div>}
            </article>
          );
        })}
      </section>

      {filtered.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-slate-700">Belum ada pekerja pada tahap onboarding yang sesuai filter.</div>}
    </div>
  );
}
