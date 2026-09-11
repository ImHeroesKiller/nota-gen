import { useMemo, useState } from 'react';
import {
  BedDouble,
  CheckCircle2,
  HardHat,
  MapPin,
  ShieldCheck,
  Truck,
  UserCheck,
} from 'lucide-react';
import {
  calculateComplianceReadiness,
  calculateDeploymentReadiness,
  type DeploymentKey,
  type MiningWorker,
  useMiningWorkerLifecycle,
} from '../lib/miningWorkerLifecycle';

const rupiah = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

const itemIcons: Record<DeploymentKey, typeof Truck> = {
  transport: Truck,
  camp: BedDouble,
  ppe: HardHat,
  siteAccess: MapPin,
  toolbox: ShieldCheck,
};

export default function DeploymentPlanner() {
  const { store, updateWorker, adminName, nowLabel } = useMiningWorkerLifecycle();
  const deployable = useMemo(() => store.workers.filter((worker) => ['mobilization', 'active'].includes(worker.stage)), [store.workers]);
  const [selectedId, setSelectedId] = useState<string>(() => deployable[0]?.id || '');
  const current = deployable.find((worker) => worker.id === selectedId) ?? deployable[0];

  const toggleItem = (worker: MiningWorker, key: DeploymentKey) => {
    if (worker.stage === 'active') return;
    updateWorker(worker.id, (item) => ({
      ...item,
      deployment: {
        ...item.deployment,
        [key]: {
          ...item.deployment[key],
          completed: !item.deployment[key].completed,
          updatedBy: adminName,
          updatedAt: nowLabel(),
        },
      },
    }));
  };

  const updateNotes = (worker: MiningWorker, key: DeploymentKey, notes: string) => {
    if (worker.stage === 'active') return;
    updateWorker(worker.id, (item) => ({
      ...item,
      deployment: { ...item.deployment, [key]: { ...item.deployment[key], notes, updatedBy: adminName, updatedAt: nowLabel() } },
    }));
  };

  const activate = (worker: MiningWorker) => {
    const compliance = calculateComplianceReadiness(worker);
    const deployment = calculateDeploymentReadiness(worker);
    if (compliance.percentage !== 100 || deployment.percentage !== 100) return;
    updateWorker(worker.id, { stage: 'active', startDate: worker.startDate || new Date().toISOString().slice(0, 10) });
  };

  if (!current) {
    return <div className="mx-auto max-w-6xl rounded-2xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500 dark:border-slate-700">Belum ada pekerja yang berstatus Siap Mobilisasi. Selesaikan Onboarding Checklist terlebih dahulu.</div>;
  }

  const readiness = calculateDeploymentReadiness(current);
  const compliance = calculateComplianceReadiness(current);
  const active = current.stage === 'active';

  return (
    <div className="mx-auto max-w-[1400px] space-y-5 text-slate-900 dark:text-slate-100">
      <section className="rounded-2xl border border-violet-200 bg-violet-50/70 p-4 dark:border-violet-500/20 dark:bg-violet-500/10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-600 text-white"><Truck size={18} /></span><div><p className="text-xs font-bold">Deployment PHL ke Site</p><p className="mt-1 text-[11px] leading-5 text-slate-600 dark:text-slate-300">Admin memastikan transport, camp, APD, site access, dan toolbox briefing selesai. Aktivasi PHL hanya dapat dilakukan setelah onboarding compliance dan deployment 100%.</p></div></div>
          <span className="rounded-full border border-violet-200 bg-white px-3 py-1.5 text-[10px] font-bold text-violet-700 dark:border-violet-500/20 dark:bg-slate-900 dark:text-violet-300">Owner: {adminName}</span>
        </div>
      </section>

      <section className="grid gap-3 lg:grid-cols-[minmax(320px,1fr)_auto] lg:items-end">
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Pekerja
          <select value={current.id} onChange={(event) => setSelectedId(event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900">
            {deployable.map((worker) => <option key={worker.id} value={worker.id}>{worker.workerCode} · {worker.name} · {worker.position} · {worker.site}</option>)}
          </select>
        </label>
        <span className={`rounded-full px-3 py-2 text-[10px] font-bold ${active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300'}`}>{active ? 'Aktif PHL' : 'Siap Mobilisasi'}</span>
      </section>

      <section className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_320px]">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              ['Pekerja', `${current.name}\n${current.workerCode}`],
              ['Posisi', `${current.position}\n${current.trade}`],
              ['Site / Project', `${current.site}\n${current.project}`],
              ['Rate / Roster', `${rupiah(current.dailyRate)} / hari\n${current.roster}`],
            ].map(([label, value]) => <div key={label}><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">{label}</p>{String(value).split('\n').map((line, index) => <p key={line} className={`${index === 0 ? 'mt-1 text-xs font-semibold' : 'mt-0.5 text-[10px] text-slate-500'}`}>{line}</p>)}</div>)}
          </div>
        </article>
        <aside className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between"><div><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">Deployment Readiness</p><strong className="mt-1 block text-2xl">{readiness.percentage}%</strong></div><span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-500/10"><Truck size={18} /></span></div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className={`h-full rounded-full ${readiness.percentage === 100 ? 'bg-emerald-500' : 'bg-violet-500'}`} style={{ width: `${readiness.percentage}%` }} /></div>
          <p className="mt-2 text-[10px] text-slate-500">{readiness.completed}/{readiness.total} item selesai · Compliance {compliance.percentage}%</p>
        </aside>
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        {(Object.entries(current.deployment) as Array<[DeploymentKey, MiningWorker['deployment'][DeploymentKey]]>).map(([key, item]) => {
          const Icon = itemIcons[key];
          return <article key={key} className={`rounded-2xl border p-4 ${item.completed ? 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-500/20 dark:bg-emerald-500/5' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'}`}><div className="flex items-start justify-between gap-4"><div className="flex items-start gap-3"><span className={`grid h-10 w-10 place-items-center rounded-xl ${item.completed ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}><Icon size={18} /></span><div><p className="text-xs font-bold">{item.label}</p><p className="mt-1 text-[10px] text-slate-500">{item.completed ? `Selesai · ${item.updatedBy || adminName}` : 'Belum selesai'}</p>{item.updatedAt && <p className="mt-0.5 text-[9px] text-slate-400">{item.updatedAt}</p>}</div></div>{!active && <button onClick={() => toggleItem(current, key)} className={`rounded-xl px-3 py-2 text-[10px] font-bold ${item.completed ? 'border border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300' : 'bg-violet-600 text-white'}`}>{item.completed ? 'Batalkan' : 'Tandai Selesai'}</button>}</div><textarea disabled={active} value={item.notes || ''} onChange={(event) => updateNotes(current, key, event.target.value)} placeholder="Catatan deployment..." className="mt-3 min-h-[70px] w-full rounded-xl border border-slate-200 bg-white p-3 text-xs disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950" /></article>;
        })}
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3"><span className={`grid h-10 w-10 place-items-center rounded-xl ${active ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10' : 'bg-blue-50 text-blue-600 dark:bg-blue-500/10'}`}>{active ? <UserCheck size={18} /> : <ShieldCheck size={18} />}</span><div><p className="text-xs font-bold">{active ? 'Pekerja sudah aktif sebagai PHL' : 'Final Activation Gate'}</p><p className="mt-1 text-[10px] leading-5 text-slate-500">{active ? `Mulai bekerja ${current.startDate || '-'}. Pekerja sekarang tersedia di Daily Attendance, Timesheet, dan Payroll.` : 'Aktifkan hanya setelah Compliance 100% dan Deployment 100%. Setelah aktif, pekerja otomatis tersedia di Daily Attendance.'}</p></div></div>
        {!active && <button disabled={readiness.percentage !== 100 || compliance.percentage !== 100} onClick={() => activate(current)} className="rounded-xl bg-emerald-600 px-5 py-3 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"><CheckCircle2 size={15} className="mr-1 inline" /> Aktifkan PHL</button>}
      </section>
    </div>
  );
}
