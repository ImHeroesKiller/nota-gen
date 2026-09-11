import { useEffect, useMemo, useState } from 'react';
import { readMiningLifecycle, type MiningWorker } from './miningWorkerLifecycle';

export const PHL_LIFECYCLE_SUITE_ID = 'phl-mining-lifecycle';
export const PHL_LIFECYCLE_REGISTER_PREFIX = 'PHL-LC';

const STORAGE_KEY = 'perada-phl-lifecycle-number-register-v1';
const REGISTER_EVENT = 'perada-phl-lifecycle-number-register-change';
const LIFECYCLE_CHANGE_EVENT = 'perada-mining-phl-lifecycle-change';
const SOURCE_TOOL_ID = 'recruitment-pipeline';

export interface LifecycleNumberRecord {
  id: string;
  registerNumber: string;
  suiteId: string;
  workerId: string;
  workerCode: string;
  workerName: string;
  site: string;
  project: string;
  sourceToolId: string;
  createdAt: string;
  updatedAt: string;
}

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

const safeDate = (value?: string) => {
  const candidate = value ? new Date(`${value}T00:00:00`) : new Date();
  return Number.isNaN(candidate.getTime()) ? new Date() : candidate;
};

const parseSequence = (registerNumber: string, year: number) => {
  const match = registerNumber.match(/^PHL-LC\/(\d{4})\/PAY\/(\d{2})\/(\d{4})$/);
  if (!match || Number(match[3]) !== year) return 0;
  return Number(match[1]) || 0;
};

export const generateLifecycleRegisterNumber = (
  records: LifecycleNumberRecord[],
  date = new Date(),
) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const maxSequence = records.reduce(
    (max, record) => Math.max(max, parseSequence(record.registerNumber, year)),
    0,
  );
  const sequence = String(maxSequence + 1).padStart(4, '0');
  return `${PHL_LIFECYCLE_REGISTER_PREFIX}/${sequence}/PAY/${month}/${year}`;
};

export const readLifecycleNumberRegistry = (): LifecycleNumberRecord[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeLifecycleNumberRegistry = (records: LifecycleNumberRecord[]) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  window.dispatchEvent(new CustomEvent(REGISTER_EVENT));
};

const recordFromWorker = (
  worker: MiningWorker,
  records: LifecycleNumberRecord[],
): LifecycleNumberRecord => {
  const date = safeDate(worker.appliedDate);
  const timestamp = date.toISOString();
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `reg-${worker.id}-${Date.now()}`,
    registerNumber: generateLifecycleRegisterNumber(records, date),
    suiteId: PHL_LIFECYCLE_SUITE_ID,
    workerId: worker.id,
    workerCode: worker.workerCode,
    workerName: worker.name,
    site: worker.site,
    project: worker.project,
    sourceToolId: SOURCE_TOOL_ID,
    createdAt: timestamp,
    updatedAt: new Date().toISOString(),
  };
};

export const ensureLifecycleNumberRegistry = (
  workers: MiningWorker[],
): LifecycleNumberRecord[] => {
  if (typeof window === 'undefined') return [];

  const current = readLifecycleNumberRegistry();
  const next = clone(current);
  let changed = false;

  const sortedWorkers = [...workers].sort((a, b) => {
    const dateCompare = (a.appliedDate || '').localeCompare(b.appliedDate || '');
    if (dateCompare !== 0) return dateCompare;
    return a.workerCode.localeCompare(b.workerCode, 'id');
  });

  for (const worker of sortedWorkers) {
    const existingIndex = next.findIndex((record) => record.workerId === worker.id);
    if (existingIndex === -1) {
      next.push(recordFromWorker(worker, next));
      changed = true;
      continue;
    }

    const existing = next[existingIndex];
    if (
      existing.workerCode !== worker.workerCode
      || existing.workerName !== worker.name
      || existing.site !== worker.site
      || existing.project !== worker.project
      || existing.suiteId !== PHL_LIFECYCLE_SUITE_ID
      || existing.sourceToolId !== SOURCE_TOOL_ID
    ) {
      next[existingIndex] = {
        ...existing,
        suiteId: PHL_LIFECYCLE_SUITE_ID,
        workerCode: worker.workerCode,
        workerName: worker.name,
        site: worker.site,
        project: worker.project,
        sourceToolId: SOURCE_TOOL_ID,
        updatedAt: new Date().toISOString(),
      };
      changed = true;
    }
  }

  if (changed) writeLifecycleNumberRegistry(next);
  return next;
};

let registryActivated = false;

export const activateLifecycleNumberRegistry = () => {
  if (typeof window === 'undefined' || registryActivated) return;
  registryActivated = true;

  const sync = () => {
    const { workers } = readMiningLifecycle();
    ensureLifecycleNumberRegistry(workers);
  };

  sync();
  window.addEventListener(LIFECYCLE_CHANGE_EVENT, sync as EventListener);
};

export const useLifecycleNumberRegistry = (workers: MiningWorker[]) => {
  const [records, setRecords] = useState<LifecycleNumberRecord[]>(() => (
    typeof window === 'undefined' ? [] : ensureLifecycleNumberRegistry(workers)
  ));

  useEffect(() => {
    const sync = () => setRecords(ensureLifecycleNumberRegistry(workers));
    sync();
    window.addEventListener(REGISTER_EVENT, sync as EventListener);
    return () => window.removeEventListener(REGISTER_EVENT, sync as EventListener);
  }, [workers]);

  const byWorkerId = useMemo(
    () => new Map(records.map((record) => [record.workerId, record])),
    [records],
  );

  return { records, byWorkerId };
};
