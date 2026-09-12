import type {
  MinerbaDetail,
  MinerbaDireksi,
  MinerbaPerizinan,
  MinerbaSaham,
} from './minerba.js';
import { searchMinerbaPublic } from './minerbaPublic.js';

const BASE_URL = 'https://minerbaone.esdm.go.id';
const PUBLIC_API = '/api/common/v2/publik/badan-usaha';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const MIN_DELAY_MS = 2000;
const PAGE_SIZE = 25;
const MAX_PAGES = Number(process.env.MINERBA_MAX_DETAIL_PAGES || 20);

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
];

type JsonRecord = Record<string, any>;
type CacheEntry<T> = { value: T; expiresAt: number };
type MinerbaDetailGlobal = typeof globalThis & {
  __minerbaPublicLastRequestAt?: number;
  __minerbaDetailPublicV2Cache?: Map<string, CacheEntry<MinerbaDetail>>;
};

const state = globalThis as MinerbaDetailGlobal;
const cache = state.__minerbaDetailPublicV2Cache || new Map<string, CacheEntry<MinerbaDetail>>();
state.__minerbaDetailPublicV2Cache = cache;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const clean = (value: unknown) => String(value ?? '').replace(/\s+/g, ' ').trim();
const randomUserAgent = () => USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
const asRecord = (value: unknown): JsonRecord => value && typeof value === 'object' && !Array.isArray(value) ? value as JsonRecord : {};
const asArray = (value: unknown): JsonRecord[] => Array.isArray(value) ? value.map(asRecord) : [];
const nested = (row: JsonRecord, path: string) => path.split('.').reduce<any>((value, key) => value?.[key], row);

const pick = (row: JsonRecord, ...paths: string[]) => {
  for (const path of paths) {
    const value = nested(row, path);
    if (value !== undefined && value !== null && clean(value)) return clean(value);
  }
  return '';
};

const cacheGet = (key: string) => {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt <= Date.now()) {
    cache.delete(key);
    return undefined;
  }
  return entry.value;
};

const cacheSet = (key: string, value: MinerbaDetail) => {
  cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
};

const throttle = async () => {
  const elapsed = Date.now() - (state.__minerbaPublicLastRequestAt || 0);
  if (elapsed < MIN_DELAY_MS) await sleep(MIN_DELAY_MS - elapsed);
  state.__minerbaPublicLastRequestAt = Date.now();
};

const requestJson = async (path: string) => {
  await throttle();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent': randomUserAgent(),
        accept: 'application/json, text/plain, */*',
        'accept-language': 'id-ID,id;q=0.9,en-US;q=0.7,en;q=0.6',
        'x-api-key': 'qwe',
        referer: `${BASE_URL}/publik/badan-usaha`,
      },
    });
    const text = await response.text();
    let json: any = null;
    try { json = JSON.parse(text); } catch { /* handled below */ }
    if (!response.ok || !json || Number(json.code || response.status) >= 400) {
      const error = new Error(`MinerbaOne public API ${response.status}: ${clean(json?.message || text).slice(0, 180)}`) as Error & { status?: number };
      error.status = response.status;
      throw error;
    }
    return json;
  } finally {
    clearTimeout(timer);
  }
};

const unwrapRows = (payload: any): JsonRecord[] => {
  const root = asRecord(payload);
  if (Array.isArray(root.data)) return asArray(root.data);
  const data = asRecord(root.data);
  if (Array.isArray(data.data)) return asArray(data.data);
  if (Array.isArray(data.results)) return asArray(data.results);
  return [];
};

const unwrapObject = (payload: any): JsonRecord => {
  const root = asRecord(payload);
  const data = root.data;
  if (!data || typeof data !== 'object' || Array.isArray(data)) return {};
  const record = asRecord(data);
  if (record.data && typeof record.data === 'object' && !Array.isArray(record.data)) return asRecord(record.data);
  return record;
};

const totalFrom = (payload: any, fallback: number) => {
  const root = asRecord(payload);
  const data = asRecord(root.data);
  const values = [data.total, data.total_data, data.totalData, root.total, root.total_data]
    .map(Number)
    .filter((value) => Number.isFinite(value) && value >= 0);
  return values[0] ?? fallback;
};

const query = (page: number) => `limit=${PAGE_SIZE}&page=${page}`;

const getPaged = async (path: string): Promise<JsonRecord[]> => {
  const all: JsonRecord[] = [];
  let firstPayload: any;
  let querySupported = true;

  try {
    firstPayload = await requestJson(`${path}?${query(1)}`);
  } catch (error) {
    querySupported = false;
    firstPayload = await requestJson(path);
  }

  const firstRows = unwrapRows(firstPayload);
  all.push(...firstRows);
  if (!querySupported) return all;

  const total = totalFrom(firstPayload, firstRows.length);
  if (firstRows.length < PAGE_SIZE || total <= PAGE_SIZE) return all;

  for (let page = 2; page <= MAX_PAGES && all.length < total; page += 1) {
    const payload = await requestJson(`${path}?${query(page)}`);
    const rows = unwrapRows(payload);
    if (!rows.length) break;
    all.push(...rows);
    if (rows.length < PAGE_SIZE) break;
  }

  return all;
};

const safePaged = async (label: string, path: string) => {
  try {
    return await getPaged(path);
  } catch (error) {
    console.warn(`Minerba public ${label} endpoint unavailable`, error);
    return [] as JsonRecord[];
  }
};

const maskNpwp = (raw: unknown) => {
  const value = clean(raw);
  if (!value || value.includes('*')) return value;
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 8) return value;
  return `${digits.slice(0, 8)}${'*'.repeat(digits.length - 8)}`;
};

const mapDireksi = (row: JsonRecord): MinerbaDireksi => ({
  nama: pick(row, 'nama_direksi', 'nama_pengurus', 'nama'),
  jabatan: pick(row, 'jabatan.nama_jabatan', 'jabatan.jabatan', 'nama_jabatan', 'jabatan'),
  mulai_menjabat: pick(row, 'mulai_menjabat', 'tanggal_mulai_menjabat', 'tanggal_mulai', 'mulai'),
  akhir_menjabat: pick(row, 'akhir_menjabat', 'tanggal_akhir_menjabat', 'tanggal_akhir', 'akhir'),
});

const mapSaham = (row: JsonRecord): MinerbaSaham => ({
  jenis_kepemilikan: pick(row, 'jenis_kepemilikan.jenis_kepemilikan', 'jenis_kepemilikan', 'tipe_kepemilikan'),
  nama: pick(row, 'nama_pemegang_saham', 'nama_pemilik', 'nama'),
  kewarganegaraan: pick(row, 'kewarganegaraan.nama_negara', 'kewarganegaraan', 'negara'),
  persentase_saham: pick(row, 'persentase_saham', 'persentase', 'persen_saham'),
});

const mapPerizinan = (row: JsonRecord): MinerbaPerizinan => {
  const status = pick(row, 'status_cnc.status_cnc', 'status_cnc', 'cnc');
  const valid = status.toUpperCase() === 'CNC';
  return {
    nomor_izin: pick(row, 'nomor_izin'),
    jenis_izin: pick(row, 'jenis_perizinan.jenis_perizinan', 'jenis_izin', 'jenis_perizinan'),
    tahap_kegiatan: pick(row, 'tahap_kegiatan.nama_tahap_kegiatan', 'tahap_kegiatan'),
    golongan: pick(row, 'komoditas.golongan.nama_golongan', 'golongan.nama_golongan', 'golongan'),
    komoditas: pick(row, 'komoditas.nama_komoditas', 'nama_komoditas', 'komoditas'),
    luas_ha: pick(row, 'luas_ha', 'luas'),
    tanggal_berlaku: pick(row, 'tanggal_berlaku', 'tanggal_penetapan'),
    tanggal_berakhir: pick(row, 'tanggal_berakhir'),
    status_cnc: status,
    status_cnc_badge: valid ? { color: 'green', label: 'CnC Valid' } : { color: 'red', label: 'Non-CnC' },
    lokasi: pick(row, 'lokasi_perizinan', 'lokasi'),
    kode_wiup: pick(row, 'wiup.nomor_wiup', 'wiup.kode_wiup', 'nomor_wiup', 'kode_wiup'),
  };
};

const resolveBusiness = async (code: string) => {
  try {
    const payload = await requestJson(`${PUBLIC_API}/${encodeURIComponent(code)}`);
    const row = unwrapObject(payload);
    if (Object.keys(row).length) return { id: pick(row, 'id_badan_usaha', 'id') || code, row };
  } catch (error: any) {
    if (error?.status && error.status !== 404) throw error;
  }

  const matches = await searchMinerbaPublic(code);
  const exact = matches.find((item) => item.kode_badan_usaha === code || item.nama.toLowerCase() === code.toLowerCase());
  if (!exact) return null;
  const id = exact.kode_badan_usaha;
  const payload = await requestJson(`${PUBLIC_API}/${encodeURIComponent(id)}`);
  return { id, row: unwrapObject(payload) };
};

export const getMinerbaDetailPublicV2 = async (rawCode: string): Promise<MinerbaDetail | null> => {
  const code = clean(rawCode).replace(/[^A-Za-z0-9._-]/g, '');
  if (!code) return null;
  const cached = cacheGet(code);
  if (cached) return cached;

  const business = await resolveBusiness(code);
  if (!business) return null;
  const { id, row } = business;
  const base = `${PUBLIC_API}/${encodeURIComponent(id)}`;

  const direksiRaw = await safePaged('direksi', `${base}/list-direksi`);
  const sahamRaw = await safePaged('kepemilikan saham', `${base}/list-kepemilikan-saham`);
  const izinRaw = await safePaged('perizinan', `${base}/list-perizinan`);

  const detail: MinerbaDetail = {
    informasi: {
      nama_badan_usaha: pick(row, 'nama_badan_usaha', 'nama'),
      kode_badan_usaha: pick(row, 'kode_badan_usaha', 'kode', 'modi_id', 'id_badan_usaha', 'id') || code,
      jenis_badan_usaha: pick(row, 'jenis_badan_usaha', 'jenis'),
      alamat: pick(row, 'alamat', 'alamat_badan_usaha'),
      ...(pick(row, 'npwp') ? { npwp: maskNpwp(pick(row, 'npwp')) } : {}),
    },
    direksi: direksiRaw.map(mapDireksi).filter((item) => item.nama),
    saham: sahamRaw.map(mapSaham).filter((item) => item.nama),
    perizinan: izinRaw.map(mapPerizinan).filter((item) => item.nomor_izin),
  };

  if (!detail.informasi.nama_badan_usaha && !detail.direksi.length && !detail.saham.length && !detail.perizinan.length) return null;
  cacheSet(code, detail);
  if (id !== code) cacheSet(id, detail);
  return detail;
};
