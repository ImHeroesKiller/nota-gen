import { useMemo } from 'react';
import {
  AlertTriangle,
  Banknote,
  Calendar,
  CheckCircle,
  ClipboardList,
  FileCheck2,
  Hash,
  ReceiptText,
  Shield,
  TrendingUp,
  Truck,
  Users,
} from 'lucide-react';
import {
  calculateComplianceReadiness,
  calculateDeploymentReadiness,
  useMiningWorkerLifecycle,
  type WorkerStage,
} from '../lib/miningWorkerLifecycle';
import { useLifecycleNumberRegistry } from '../lib/lifecycleNumberRegistry';
import { usePhlBillingAr } from '../lib/phlBillingAr';

const stageLabels: Record<WorkerStage, string> = {
  registration: 'Registrasi',
  screening: 'Screening',
  compliance: 'Compliance',
  mobilization: 'Mobilisasi',
  active: 'Aktif PHL',
  rejected: 'Tidak Lolos',
};

const stageTone: Record<WorkerStage, string> = {
  registration: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  screening: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300',
  compliance: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
  mobilization: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300',
  active: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
  rejected: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300',
};

const flow = [
  { title: 'Recruitment', detail: 'Registrasi & screening', Icon: Users },
  { title: 'Kontrak PHL', detail: 'Perjanjian kerja harian', Icon: FileCheck2 },
  { title: 'Onboarding', detail: 'Compliance & Fit to Work', Icon: Shield },
  { title: 'Mobilisasi', detail: 'Camp, APD & site access', Icon: Truck },
  { title: 'Attendance', detail: 'Hari kerja aktual', Icon: Calendar },
  { title: 'Timesheet', detail: 'Rekap hari & lembur', Icon: ClipboardList },
  { title: 'Payroll', detail: 'Hari hadir × rate harian', Icon: Banknote },
  { title: 'Invoice', detail: 'Payroll base → client billing', Icon: ReceiptText },
  { title: 'AR', detail: 'Outstanding, aging & collection', Icon: TrendingUp },
];

const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', {
  style: 'currency', currency: 'IDR', maximumFractionDigits: 0,
}).format(value);

const formatDate = (value: string) => new Date(value).toLocaleDateString('id-ID', {
  day: '2-digit', month: 'short', year: 'numeric',
});

export default function PhlLifecycleControlCenter() {
  const { store } = useMiningWorkerLifecycle();
  const { records, byWorkerId } = useLifecycleNumberRegistry(store.workers);
  const { balances } = usePhlBillingAr();

  const summary = useMemo(() => {
    const active = store.workers.filter((worker) => worker.stage === 'active').length;
    const mobilization = store.workers.filter((worker) => worker.stage === 'mobilization').length;
    const compliance = store.workers.filter((worker) => worker.stage === 'compliance').length;
    const attendanceDays = store.attendance.filter((record) => record.status === 'present').length;
    const payrollExposure = store.workers.reduce((sum, worker) => {
      const days = store.attendance.filter((record) => record.workerId === worker.id && record.status === 'present').length;
      return sum + (days * worker.dailyRate);
    }, 0);
    return { active, mobilization, compliance, attendanceDays, payrollExposure };
  }, [store]);

  const arSummary = useMemo(() => {
    const open = balances.filter(({ invoice, outstanding }) => !['draft', 'cancelled'].includes(invoice.status) && outstanding > 0);
    return {
      outstanding: open.reduce((sum, balance) => sum + balance.outstanding, 0),
      overdue: open.filter((balance) => balance.effectiveStatus === 'overdue').length,
    };
  }, [balances]);

  const attention = useMemo(() => store.workers.filter((worker) => {
    const compliance = calculateComplianceReadiness(worker).percentage;
    const deployment = calculateDeploymentReadiness(worker).percentage;
    return worker.stage !== 'active' && (compliance < 100 || (worker.stage === 'mobilization' && deployment < 100));
  }), [store.workers]);

  const registerRows = useMemo(
    () => [...records].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [records],
  );

  return (
    <div className="mx-auto max-w-[1500px] space-y-5 text-slate-900 dark:text-slate-100">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-300">PHL Mining Workforce</p>
            <h2 className="mt-1 text-xl font-bold tracking-tight">End-to-End Lifecycle Control Center</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Satu alur operasional dari kandidat, payroll, invoice, sampai collection.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
              <strong>{records.length}</strong> register number
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
              <strong>{summary.active}</strong> pekerja aktif PHL · <strong>{summary.attendanceDays}</strong> paid attendance days
            </div>
            <div className={`rounded-xl border px-4 py-2.5 text-xs ${arSummary.overdue > 0 ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300' : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
              AR <strong>{formatCurrency(arSummary.outstanding)}</strong>{arSummary.overdue > 0 ? ` · ${arSummary.overdue} overdue` : ''}
            </div>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto pb-1">
          <div className="grid min-w-[1260px] grid-cols-9 gap-2">
            {flow.map(({ title, detail, Icon }, index) => {
              const no = String(index + 1).padStart(2, '0');
              return (
                <div key={title} className="relative rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/60">
                  {index < flow.length - 1 && <span className="absolute -right-2 top-1/2 z-10 hidden h-px w-2 bg-slate-300 lg:block dark:bg-slate-700" />}
                  <div className="flex items-center justify-between gap-2">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-600 text-white"><Icon size={15} /></span>
                    <span className="text-[10px] font-bold text-slate-400">{no}</span>
                  </div>
                  <strong className="mt-3 block text-xs">{title}</strong>
                  <span className="mt-1 block text-[10px] leading-4 text-slate-500 dark:text-slate-400">{detail}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        {[
          ['Total Worker', store.workers.length, Users, 'text-slate-950 dark:text-white'],
          ['Register Number', records.length, Hash, 'text-blue-600 dark:text-blue-300'],
          ['Compliance', summary.compliance, Shield, 'text-amber-600 dark:text-amber-300'],
          ['Aktif PHL', summary.active, CheckCircle, 'text-emerald-600 dark:text-emerald-300'],
          ['Gross Hari Hadir', formatCurrency(summary.payrollExposure), Banknote, 'text-blue-600 dark:text-blue-300'],
        ].map(([label, value, Icon, tone]) => {
          const MetricIcon = Icon as typeof Users;
          return (
            <article key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p><strong className={`mt-2 block truncate text-xl ${tone}`}>{value}</strong></div>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"><MetricIcon size={17} /></span>
              </div>
            </article>
          );
        })}
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
              <h3 className="text-sm font-semibold">Worker Lifecycle</h3>
              <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">Progress setiap pekerja pada satu master record yang sama, termasuk register number otomatis.</p>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {store.workers.map((worker) => {
                const compliance = calculateComplianceReadiness(worker).percentage;
                const deployment = calculateDeploymentReadiness(worker).percentage;
                const paidDays = store.attendance.filter((record) => record.workerId === worker.id && record.status === 'present').length;
                const register = byWorkerId.get(worker.id);
                return (
                  <div key={worker.id} className="grid gap-3 px-4 py-3 md:grid-cols-[minmax(0,1.7fr)_145px_130px_105px_105px_105px] md:items-center">
                    <div className="min-w-0">
                      <strong className="block truncate text-xs">{worker.name}</strong>
                      <span className="mt-0.5 block truncate text-[10px] text-slate-500">{worker.workerCode} · {worker.position} · {worker.site}</span>
                    </div>
                    <div className="min-w-0">
                      <span className="block text-[9px] font-bold uppercase tracking-[0.08em] text-slate-400">Register No.</span>
                      <strong className="mt-0.5 block truncate text-[10px] text-blue-600 dark:text-blue-300" title={register?.registerNumber}>{register?.registerNumber || 'Generating...'}</strong>
                    </div>
                    <span className={`w-fit rounded-full px-2 py-1 text-[9px] font-bold ${stageTone[worker.stage]}`}>{stageLabels[worker.stage]}</span>
                    <span className="text-[10px] text-slate-500">Compliance <strong className="text-slate-900 dark:text-white">{compliance}%</strong></span>
                    <span className="text-[10px] text-slate-500">Mobilisasi <strong className="text-slate-900 dark:text-white">{deployment}%</strong></span>
                    <span className="text-[10px] text-slate-500">Paid days <strong className="text-slate-900 dark:text-white">{paidDays}</strong></span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2"><Hash size={15} className="text-blue-600" /><h3 className="text-sm font-semibold">Lifecycle Register Number</h3></div>
                <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">Otomatis dibuat saat worker masuk lifecycle. Format: PHL-LC/####/PAY/MM/YYYY.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{registerRows.length} registered</span>
            </div>
            {registerRows.length === 0 ? (
              <div className="p-4 text-xs text-slate-500">Belum ada register number.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left">
                  <thead className="bg-slate-50 text-[9px] uppercase tracking-[0.08em] text-slate-400 dark:bg-slate-950/50">
                    <tr><th className="px-4 py-2.5">Register Number</th><th className="px-4 py-2.5">Worker</th><th className="px-4 py-2.5">Project / Site</th><th className="px-4 py-2.5">Source</th><th className="px-4 py-2.5">Registered</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[10px] dark:divide-slate-800">
                    {registerRows.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-3 font-bold text-blue-600 dark:text-blue-300">{record.registerNumber}</td>
                        <td className="px-4 py-3"><strong className="block text-slate-900 dark:text-white">{record.workerName}</strong><span className="text-slate-500">{record.workerCode}</span></td>
                        <td className="px-4 py-3 text-slate-500">{record.project} · {record.site}</td>
                        <td className="px-4 py-3 text-slate-500">Recruitment & Screening</td>
                        <td className="px-4 py-3 text-slate-500">{formatDate(record.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2"><AlertTriangle size={16} className="text-amber-500" /><h3 className="text-sm font-semibold">Perlu Tindakan Admin</h3></div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Pekerja yang belum memenuhi gate untuk tahap berikutnya.</p>
          <div className="mt-4 space-y-2">
            {attention.length === 0 ? <div className="rounded-xl bg-emerald-50 p-3 text-[11px] text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">Tidak ada bottleneck aktif.</div> : attention.map((worker) => {
              const compliance = calculateComplianceReadiness(worker).percentage;
              const deployment = calculateDeploymentReadiness(worker).percentage;
              const register = byWorkerId.get(worker.id);
              return <div key={worker.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800"><strong className="block text-xs">{worker.name}</strong><span className="mt-1 block text-[10px] text-slate-500">{register?.registerNumber || worker.workerCode}</span><span className="mt-1 block text-[10px] text-slate-500">{stageLabels[worker.stage]} · Compliance {compliance}% · Mobilisasi {deployment}%</span></div>;
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}
