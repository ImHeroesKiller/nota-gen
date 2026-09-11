import { useEffect, useState } from 'react';

export type WorkerStage = 'registration' | 'screening' | 'compliance' | 'mobilization' | 'active' | 'rejected';
export type ComplianceKey = 'identity' | 'contract' | 'mcu' | 'induction' | 'competency' | 'simper' | 'bank';
export type DeploymentKey = 'transport' | 'camp' | 'ppe' | 'siteAccess' | 'toolbox';
export type AttendanceStatus = 'present' | 'absent' | 'sick' | 'leave' | 'off-duty';
export type ShiftType = 'day' | 'night';

export interface ComplianceItem {
  label: string;
  required: boolean;
  verified: boolean;
  notes?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface DeploymentItem {
  label: string;
  completed: boolean;
  notes?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface MiningWorker {
  id: string;
  workerCode: string;
  name: string;
  nik: string;
  phone: string;
  position: string;
  trade: string;
  site: string;
  project: string;
  domicile: string;
  dailyRate: number;
  roster: string;
  stage: WorkerStage;
  appliedDate: string;
  startDate?: string;
  bankName?: string;
  accountNumber?: string;
  compliance: Record<ComplianceKey, ComplianceItem>;
  deployment: Record<DeploymentKey, DeploymentItem>;
}

export interface MiningAttendance {
  id: string;
  workerId: string;
  date: string;
  shift: ShiftType;
  checkIn: string;
  checkOut: string;
  regularHours: number;
  overtimeHours: number;
  status: AttendanceStatus;
  remarks: string;
}

export interface MiningLifecycleStore {
  workers: MiningWorker[];
  attendance: MiningAttendance[];
}

const STORAGE_KEY = 'perada-mining-phl-lifecycle-v1';
const CHANGE_EVENT = 'perada-mining-phl-lifecycle-change';
const ADMIN_NAME = 'Administrator';

const nowLabel = () => new Date().toLocaleString('id-ID', {
  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
});

const positionNeedsCompetency = (position: string) => /operator|driver|welder|mekanik|mechanic|electric|rigger|crane/i.test(position);
const positionNeedsSimper = (position: string) => /operator|driver|dump truck|dozer|excavator|loader|light vehicle/i.test(position);

export const createCompliance = (position: string): Record<ComplianceKey, ComplianceItem> => ({
  identity: { label: 'Identitas (KTP/NIK)', required: true, verified: false },
  contract: { label: 'Perjanjian Kerja Harian / PHL', required: true, verified: false },
  mcu: { label: 'MCU / Fit to Work', required: true, verified: false },
  induction: { label: 'Safety Induction', required: true, verified: false },
  competency: { label: 'Sertifikat Kompetensi / SIO', required: positionNeedsCompetency(position), verified: false },
  simper: { label: 'SIMPER / Site Permit', required: positionNeedsSimper(position), verified: false },
  bank: { label: 'Rekening Pembayaran', required: true, verified: false },
});

export const createDeployment = (): Record<DeploymentKey, DeploymentItem> => ({
  transport: { label: 'Transport / Mobilisasi ke Site', completed: false },
  camp: { label: 'Camp / Akomodasi', completed: false },
  ppe: { label: 'APD & Perlengkapan Kerja', completed: false },
  siteAccess: { label: 'Site Access / Badge', completed: false },
  toolbox: { label: 'Toolbox / Site Briefing', completed: false },
});

const verifiedCompliance = (position: string) => Object.fromEntries(
  Object.entries(createCompliance(position)).map(([key, item]) => [key, { ...item, verified: true, updatedBy: ADMIN_NAME, updatedAt: '01 Sep 2026, 08.00' }]),
) as Record<ComplianceKey, ComplianceItem>;

const completedDeployment = () => Object.fromEntries(
  Object.entries(createDeployment()).map(([key, item]) => [key, { ...item, completed: true, updatedBy: ADMIN_NAME, updatedAt: '01 Sep 2026, 08.30' }]),
) as Record<DeploymentKey, DeploymentItem>;

const seedWorkers: MiningWorker[] = [
  {
    id: 'wrk-001', workerCode: 'PHL-001', name: 'Budi Hartono', nik: 'NIK-DEMO-001', phone: '08xx-xxxx-0001',
    position: 'Operator Dump Truck', trade: 'Hauling', site: 'IMIP Morowali', project: 'Project Tambang A', domicile: 'Morowali',
    dailyRate: 340000, roster: '20 ON / 10 OFF', stage: 'active', appliedDate: '2026-08-22', startDate: '2026-09-01', bankName: 'Bank Demo', accountNumber: '****0001',
    compliance: verifiedCompliance('Operator Dump Truck'), deployment: completedDeployment(),
  },
  {
    id: 'wrk-002', workerCode: 'PHL-002', name: 'Andi Saputra', nik: 'NIK-DEMO-002', phone: '08xx-xxxx-0002',
    position: 'Helper Plant', trade: 'Plant Support', site: 'IMIP Morowali', project: 'Project Tambang A', domicile: 'Kendari',
    dailyRate: 285000, roster: '20 ON / 10 OFF', stage: 'mobilization', appliedDate: '2026-08-27', bankName: 'Bank Demo', accountNumber: '****0002',
    compliance: verifiedCompliance('Helper Plant'), deployment: {
      ...createDeployment(),
      transport: { label: 'Transport / Mobilisasi ke Site', completed: true, updatedBy: ADMIN_NAME, updatedAt: '10 Sep 2026, 09.10' },
      camp: { label: 'Camp / Akomodasi', completed: true, updatedBy: ADMIN_NAME, updatedAt: '10 Sep 2026, 09.15' },
      ppe: { label: 'APD & Perlengkapan Kerja', completed: true, updatedBy: ADMIN_NAME, updatedAt: '10 Sep 2026, 09.20' },
    },
  },
  {
    id: 'wrk-003', workerCode: 'PHL-003', name: 'Rudi Kurniawan', nik: 'NIK-DEMO-003', phone: '08xx-xxxx-0003',
    position: 'Welder', trade: 'Maintenance', site: 'IMIP Morowali', project: 'Project Tambang A', domicile: 'Makassar',
    dailyRate: 375000, roster: '18 ON / 12 OFF', stage: 'compliance', appliedDate: '2026-09-02', bankName: 'Bank Demo', accountNumber: '****0003',
    compliance: {
      ...createCompliance('Welder'),
      identity: { label: 'Identitas (KTP/NIK)', required: true, verified: true, updatedBy: ADMIN_NAME, updatedAt: '08 Sep 2026, 10.00' },
      contract: { label: 'Perjanjian Kerja Harian / PHL', required: true, verified: true, updatedBy: ADMIN_NAME, updatedAt: '08 Sep 2026, 10.10' },
      bank: { label: 'Rekening Pembayaran', required: true, verified: true, updatedBy: ADMIN_NAME, updatedAt: '08 Sep 2026, 10.15' },
    },
    deployment: createDeployment(),
  },
  {
    id: 'wrk-004', workerCode: 'PHL-004', name: 'Deni Pratama', nik: 'NIK-DEMO-004', phone: '08xx-xxxx-0004',
    position: 'General Worker', trade: 'General Support', site: 'IMIP Morowali', project: 'Project Tambang A', domicile: 'Palu',
    dailyRate: 250000, roster: '20 ON / 10 OFF', stage: 'screening', appliedDate: '2026-09-06',
    compliance: createCompliance('General Worker'), deployment: createDeployment(),
  },
];

const seedAttendance: MiningAttendance[] = [
  { id: 'att-001', workerId: 'wrk-001', date: '2026-09-01', shift: 'day', checkIn: '06:00', checkOut: '18:00', regularHours: 8, overtimeHours: 2, status: 'present', remarks: 'Hauling normal' },
  { id: 'att-002', workerId: 'wrk-001', date: '2026-09-02', shift: 'day', checkIn: '06:02', checkOut: '18:00', regularHours: 8, overtimeHours: 2, status: 'present', remarks: '' },
  { id: 'att-003', workerId: 'wrk-001', date: '2026-09-03', shift: 'day', checkIn: '05:58', checkOut: '18:15', regularHours: 8, overtimeHours: 2.25, status: 'present', remarks: '' },
  { id: 'att-004', workerId: 'wrk-001', date: '2026-09-04', shift: 'day', checkIn: '06:01', checkOut: '18:00', regularHours: 8, overtimeHours: 2, status: 'present', remarks: '' },
  { id: 'att-005', workerId: 'wrk-001', date: '2026-09-05', shift: 'day', checkIn: '06:00', checkOut: '18:10', regularHours: 8, overtimeHours: 2, status: 'present', remarks: '' },
  { id: 'att-006', workerId: 'wrk-001', date: '2026-09-06', shift: 'day', checkIn: '-', checkOut: '-', regularHours: 0, overtimeHours: 0, status: 'off-duty', remarks: 'Roster off' },
];

const seedStore: MiningLifecycleStore = { workers: seedWorkers, attendance: seedAttendance };
const cloneSeed = (): MiningLifecycleStore => JSON.parse(JSON.stringify(seedStore));

export const readMiningLifecycle = (): MiningLifecycleStore => {
  if (typeof window === 'undefined') return cloneSeed();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneSeed();
    const parsed = JSON.parse(raw) as MiningLifecycleStore;
    if (!Array.isArray(parsed.workers) || !Array.isArray(parsed.attendance)) return cloneSeed();
    return parsed;
  } catch {
    return cloneSeed();
  }
};

export const writeMiningLifecycle = (store: MiningLifecycleStore) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
};

export const calculateComplianceReadiness = (worker: MiningWorker) => {
  const required = Object.values(worker.compliance).filter((item) => item.required);
  const verified = required.filter((item) => item.verified).length;
  return { required: required.length, verified, percentage: required.length ? Math.round((verified / required.length) * 100) : 100 };
};

export const calculateDeploymentReadiness = (worker: MiningWorker) => {
  const items = Object.values(worker.deployment);
  const completed = items.filter((item) => item.completed).length;
  return { total: items.length, completed, percentage: items.length ? Math.round((completed / items.length) * 100) : 100 };
};

export const useMiningWorkerLifecycle = () => {
  const [store, setStore] = useState<MiningLifecycleStore>(() => readMiningLifecycle());

  useEffect(() => {
    const sync = () => setStore(readMiningLifecycle());
    window.addEventListener('storage', sync);
    window.addEventListener(CHANGE_EVENT, sync as EventListener);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(CHANGE_EVENT, sync as EventListener);
    };
  }, []);

  const commit = (updater: (current: MiningLifecycleStore) => MiningLifecycleStore) => {
    const next = updater(readMiningLifecycle());
    writeMiningLifecycle(next);
    setStore(next);
  };

  const addWorker = (worker: MiningWorker) => commit((current) => ({ ...current, workers: [worker, ...current.workers] }));
  const updateWorker = (id: string, updater: Partial<MiningWorker> | ((worker: MiningWorker) => MiningWorker)) => commit((current) => ({
    ...current,
    workers: current.workers.map((worker) => worker.id !== id ? worker : typeof updater === 'function' ? updater(worker) : { ...worker, ...updater }),
  }));
  const addAttendance = (record: MiningAttendance) => commit((current) => ({
    ...current,
    attendance: [record, ...current.attendance.filter((item) => !(item.workerId === record.workerId && item.date === record.date))],
  }));
  const resetDemo = () => {
    const next = cloneSeed();
    writeMiningLifecycle(next);
    setStore(next);
  };

  return { store, addWorker, updateWorker, addAttendance, resetDemo, adminName: ADMIN_NAME, nowLabel };
};
