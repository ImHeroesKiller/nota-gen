import type { MinerbaSearchItem } from './minerba.js';

const BASE_URL = 'https://minerbaone.esdm.go.id';
const PUBLIC_API = '/api/common/v2/publik/badan-usaha';
const PAGE_SIZE = 25;
const MIN_DELAY_MS = 2000;
const CACHE_TTL_MS = 60 * 60 * 1000;

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
];

type CacheEntry = { value: MinerbaSearchItem[]; expiresAt: number };
type SearchGlobal = typeof globalThis & {
  __minerbaLiteSearchCache?: Map<string, CacheEntry>;
  __minerbaLiteLastRequestAt?: number;
};

type JsonRecord = Record<string, any>;

const state = globalThis as SearchGlobal;
const cache = state.__minerbaLiteSearchCache || new Map<string, CacheEntry>();
state.__minerbaLiteSearchCache = cache;

const clean = (value: unknown) => String(value ?? '').replace(/\s+/g, ' ').trim();
const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const randomUserAgent = () => USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
const asRecord = (value: unknown): JsonRecord => value && typeof value === 'object' && !Array.isArray(value) ? value as JsonRecord : {};

const throttle = async () => {
  const elapsed = Date.now() - (state.__minerbaLiteLastRequestAt || 0);
  if (elapsed < MIN_DELAY_MS) await sleep(MIN_DELAY_MS - elapsed);
  state.__minerbaLiteLastRequestAt = Date.now();
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

const cacheSet = (key: string, value: MinerbaSearchItem[]) => {
  cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
};

const unwrapRows = (payload: any): JsonRecord[] => {
  if (Array.isArray(payload?.data)) return payload.data.map(asRecord);
  if (Array.isArray(payload?.data?.data)) return payload.data.data.map(asRecord);
  if (Array.isArray(payload?.data?.results)) return payload.data.results.map(asRecord);
  return [];
};

const toItem = (row: JsonRecord): MinerbaSearchItem | null => {
  const kode = clean(row.kode_badan_usaha ?? row.kode ?? row.modi_id ?? row.id_badan_usaha ?? row.id);
  const nama = clean(row.nama_badan_usaha ?? row.nama);
  const jenis = clean(row.jenis_badan_usaha ?? row.jenis);
  if (!kode || !nama) return null;
  return { kode_badan_usaha: kode, nama, jenis };
};

const requestPage = async (query: string) => {
  await throttle();
  const params = new URLSearchParams();
  params.append('sort[]', 'nama_badan_usaha');
  params.set('page', '1');
  params.set('limit', String(PAGE_SIZE));
  params.set('search', query);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetch(`${BASE_URL}${PUBLIC_API}?${params.toString()}`, {
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
    let payload: any = null;
    try { payload = JSON.parse(text); } catch { /* handled below */ }
    if (!response.ok || !payload) throw new Error(`MinerbaOne public search ${response.status}`);
    return unwrapRows(payload);
  } finally {
    clearTimeout(timer);
  }
};

export const searchMinerbaPublicLite = async (rawQuery: string): Promise<MinerbaSearchItem[]> => {
  const query = clean(rawQuery);
  if (!query) return [];

  const key = query.toLowerCase();
  const cached = cacheGet(key);
  if (cached) return cached;

  // Intentionally fetch only page 1. Additional data is requested only when the
  // user explicitly selects a result and asks for its detail.
  const rows = await requestPage(query);
  const found = new Map<string, MinerbaSearchItem>();
  for (const row of rows) {
    const item = toItem(row);
    if (item) found.set(item.kode_badan_usaha, item);
  }

  const results = [...found.values()].slice(0, PAGE_SIZE);
  cacheSet(key, results);
  return results;
};
