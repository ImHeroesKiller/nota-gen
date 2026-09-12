import type {
  MinerbaDetail,
  MinerbaDireksi,
  MinerbaPerizinan,
  MinerbaSaham,
  MinerbaSearchItem,
} from './minerba.js';

const BASE_URL = 'https://minerbaone.esdm.go.id';
const PUBLIC_API = '/api/common/v2/publik/badan-usaha';
const DETAIL_TTL_MS = 24 * 60 * 60 * 1000;
const SEARCH_TTL_MS = 60 * 60 * 1000;
const MIN_DELAY_MS = 2000;
const MAX_SEARCH_PAGES = Number(process.env.MINERBA_MAX_SEARCH_PAGES || 10);
const MAX_DETAIL_PAGES = Number(process.env.MINERBA_MAX_DETAIL_PAGES || 20);

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
];

type JsonRecord = Record<string, any>;
type CacheEntry<T> = { value: T; expiresAt: number };
type MinerbaPublicGlobal = typeof globalThis & {
  __minerbaPublicLastRequestAt?: number;
  __minerbaPublicSearchCache?: Map<string, CacheEntry<MinerbaSearchItem[]>>;
  __minerbaPublicDetailCache?: Map<string, CacheEntry<MinerbaDetail>>;
};

const state = globalThis as MinerbaPublicGlobal;
const searchCache = state.__minerbaPublicSearchCache || new Map<string, CacheEntry<MinerbaSearchItem[]>>();
const detailCache = state.__minerbaPublicDetailCache || new Map<string, CacheEntry<MinerbaDetail>>();
state.__minerbaPublicSearchCache = searchCache;
state.__minerbaPublicDetailCache = detailCache;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const clean = (value: unknown) => String(value ?? '').replace(/\s+/g, ' ').trim();
const randomUserAgent = () => USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
const asRecord = (value: unknown): JsonRecord => value && typeof value === 'object' && !Array.isArray(value) ? value as JsonRecord : {};
const asArray = (value: unknown): JsonRecord[] => Array.isArray(value) ? value.map(asRecord) : [];

const cacheGet = <T>(cache: Map<string, CacheEntry<T>>, key: string) => {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt <= Date.now()) {
    cache.delete(key);
    return undefined;
  }
  return entry.value;
};

const cacheSet = <T>(cache: Map<string, CacheEntry<T>>, key: string, value: T, ttl: number) => {
  cache.set(key, { value, expiresAt: Date.now() + ttl });
};

const throttle = async () => {
  const elapsed = Date.now() - (state.__minerbaPublicLastRequestAt || 0);
  if (elapsed < MIN_DELAY_MS) await sleep(MIN_DELAY_MS - elapsed);
  state.__minerbaPublicLastRequestAt = Date.now();
};

const maskNpwp = (raw: unknown) => {
  const value = clean(raw);
  if (!value || value.includes('*')) return value;
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 8) return value;
  return `${digits.slice(0, 8)}${'*'.repeat(digits.length - 8)}`;
};

const nested = (row: JsonRecord, path: string) => path.split('.').reduce<any>((value, key) => value?.[key], row);
const pick = (row: JsonRecord, ...paths: string[]) => {
  for (const path of paths) {
    const value = nested(row, path);
    if (value !== undefined && value !== null && clean(value)) return clean(value);
  }
  return '';
};

const unwrapRows = (payload: any): JsonRecord[] => {
  const root = asRecord(payload);
  const data = root.data;
  if (Array.isArray(data)) return asArray(data);
  const dataRecord = asRecord(data);
  if (Array.isArray(dataRecord.data)) return asArray(dataRecord.data);
  if (Array.isArray(dataRecord.results)) return asArray(dataRecord.results);
  return [];
};

const unwrapObject = (payload: any): JsonRecord => {
  const root = asRecord(payload);
  const data = root.data;
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const dataRecord = asRecord(data);
    if (dataRecord.data && typeof dataRecord.data === 'object' && !Array.isArray(dataRecord.data)) return asRecord(dataRecord.data);
    return dataRecord;
  }
  return {};
};

const totalFrom = (payload: any, fallback = 0) => {
  const root = asRecord(payload);
  const data = asRecord(root.data);
  const candidates = [data.total, data.total_data, data.totalData, root.total, root.total_data];
  const found = candidates.map(Number).find((value) => Number.isFinite(value) && value >= 0);
  return found ?? fallback;
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

const queryString = (params: Array<[string, string | number]>) => params
  .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
  .join('&');

const mapSearchItem = (row: JsonRecord): MinerbaSearchItem & { id_badan_usaha?: string } => {
  const id = pick(row, 'id_badan_usaha', 'id');
  const code = pick(row, 'kode_badan_usaha', 'kode', 'modi_id', 'id_badan_usaha', 'id');
  return {
    kode_badan_usaha: code,
    nama: pick(row, 'nama_badan_usaha', 'nama'),
    jenis: pick(row, 'jenis_badan_usaha', 'jenis'),
    ...(id ? { id_badan_usaha: id } : {}),
  };
};

const searchPage = async (query: string, page: number, limit: number) => {
  // MinerbaOne's public SPA pre-encodes the search value before serializing it.
  // Try that exact transport first, then a conventional encoding for resilience.
  const encodedSearch = encodeURIComponent(query);
  const variants = [
    queryString([['sort[]', 'nama_badan_usaha'], ['page', page], ['limit', limit], ['search', encodedSearch]]),
    queryString([['sort[]', 'nama_badan_usaha'], ['page', page], ['limit', limit], ['search', query]]),
    queryString([['page', page], ['limit', limit], ['search', query]]),
  ];

  let lastError: unknown;
  for (const qs of variants) {
    try {
      const payload = await requestJson(`${PUBLIC_API}?${qs}`);
      const rows = unwrapRows(payload);
      if (rows.length || page > 1 || totalFrom(payload, 0) === 0) return { payload, rows };
    } catch (error) {
      lastError = error;
    }
  }
  if (lastError) throw lastError;
  return { payload: { data: { data: [], total: 0 } }, rows: [] };
};

const searchByFilter = async (query: string, page: number, limit: number) => {
  const filterVariants: Array<Array<[string, string | number]>> = [
    [['page', page], ['limit', limit], ['filter[nomor_izin][like]', encodeURIComponent(query)]],
    [['page', page], ['limit', limit], ['filter[kode_wiup][like]', encodeURIComponent(query)]],
    [['page', page], ['limit', limit], ['filter[wiup.nomor_wiup][like]', encodeURIComponent(query)]],
  ];
  const rows: JsonRecord[] = [];
  for (const params of filterVariants) {
    try {
      const payload = await requestJson(`${PUBLIC_API}?${queryString(params)}`);
      rows.push(...unwrapRows(payload));
    } catch {
      // The public endpoint may not support these optional filters; continue.
    }
  }
  return rows;
};

export const searchMinerbaPublic = async (rawQuery: string): Promise<MinerbaSearchItem[]> => {
  const query = clean(rawQuery);
  if (!query) return [];
  const cacheKey = query.toLowerCase();
  const cached = cacheGet(searchCache, cacheKey);
  if (cached) return cached;

  const found = new Map<string, MinerbaSearchItem>();
  const limit = 25;
  let total = 0;

  for (let page = 1; page <= MAX_SEARCH_PAGES; page += 1) {
    const { payload, rows } = await searchPage(query, page, limit);
    if (page === 1) total = totalFrom(payload, rows.length);
    for (const row of rows) {
      const item = mapSearchItem(row);
      if (item.kode_badan_usaha && item.nama) found.set(item.kode_badan_usaha, item);
    }
    if (!rows.length || rows.length < limit || (total > 0 && page * limit >= total)) break;
  }

  if (!found.size) {
    const filteredRows = await searchByFilter(query, 1, limit);
    for (const row of filteredRows) {
      const item = mapSearchItem(row);
      if (item.kode_badan_usaha && item.nama) found.set(item.kode_badan_usaha, item);
    }
  }

  const results = [...found.values()];
  cacheSet(searchCache, cacheKey, results, SEARCH_TTL_MS);
  return results;
};

const resolveBusiness = async (code: string) => {
  // The current public route uses id_badan_usaha in the URL. First try the supplied
  // value directly; if it is a display code, resolve it through public search.
  try {
    const payload = await requestJson(`${PUBLIC_API}/${encodeURIComponent(code)}`);
    const row = unwrapObject(payload);
    if (Object.keys(row).length) return { id: pick(row, 'id_badan_usaha', 'id') || code, row };
  } catch (error: any) {
    if (error?.status && error.status !== 404) throw error;
  }

  const matches = await searchMinerbaPublic(code);
  for (const item of matches as Array<MinerbaSearchItem & { id_badan_usaha?: string }>) {
    if (item.kode_badan_usaha === code || item.nama.toLowerCase() === code.toLowerCase()) {
      const id = item.id_badan_usaha || item.kode_badan_usaha;
      const payload = await requestJson(`${PUBLIC_API}/${encodeURIComponent(id)}`);
      return { id, row: unwrapObject(payload) };
    }
  }
  return null;
};

const getAllPaged = async (path: string, baseParams: Array<[string, string | number]> = []) => {
  const limit = 25;
  const rows: JsonRecord[] = [];
  let total = 0;
  for (let page = 1; page <= MAX_DETAIL_PAGES; page += 1) {
    const qs = queryString([...baseParams, ['limit', limit], ['page', page]]);
    const payload = await requestJson(`${path}?${qs}`);
    const pageRows = unwrapRows(payload);
    if (page === 1) total = totalFrom(payload, pageRows.length);
    rows.push(...pageRows);
    if (!pageRows.length || pageRows.length < limit || (total > 0 && page * limit >= total)) break;
  }
  return rows;
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

export const getMinerbaDetailPublic = async (rawCode: string): Promise<MinerbaDetail | null> => {
  const code = clean(rawCode).replace(/[^A-Za-z0-9._-]/g, '');
  if (!code) return null;
  const cached = cacheGet(detailCache, code);
  if (cached) return cached;

  const business = await resolveBusiness(code);
  if (!business) return null;
  const { id, row } = business;

  const direksiRaw = await getAllPaged(`${PUBLIC_API}/${encodeURIComponent(id)}/list-direksi`);
  const sahamRaw = await getAllPaged(`${PUBLIC_API}/${encodeURIComponent(id)}/list-kepemilikan-saham`);
  const permitParams: Array<[string, string | number]> = [
    ['sort[]', '-updated_at'],
    ['filter[status][]', 'disetujui'],
    ['filter[status][]', 'diterima'],
    ['filter[status][]', 'disuspensi'],
  ];
  const izinRaw = await getAllPaged(`${PUBLIC_API}/${encodeURIComponent(id)}/list-perizinan`, permitParams);

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

  if (!detail.informasi.nama_badan_usaha && !detail.perizinan.length && !detail.direksi.length && !detail.saham.length) return null;
  cacheSet(detailCache, code, detail, DETAIL_TTL_MS);
  if (id !== code) cacheSet(detailCache, id, detail, DETAIL_TTL_MS);
  return detail;
};
