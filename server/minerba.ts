import { load } from 'cheerio';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

const BASE_URL = 'https://minerbaone.esdm.go.id';
const LIST_PATH = '/publik/badan-usaha';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const SEARCH_CACHE_TTL_MS = 60 * 60 * 1000;
const MAX_SEARCH_PAGES = Number(process.env.MINERBA_MAX_SEARCH_PAGES || 10);
const MIN_DELAY_MS = 2000;

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
];

type CacheEntry<T> = { value: T; expiresAt: number };
type GlobalMinerbaCache = typeof globalThis & {
  __minerbaDetailCache?: Map<string, CacheEntry<MinerbaDetail>>;
  __minerbaSearchCache?: Map<string, CacheEntry<MinerbaSearchItem[]>>;
  __minerbaLastRequestAt?: number;
};

const globalCache = globalThis as GlobalMinerbaCache;
const detailCache = globalCache.__minerbaDetailCache ??= new Map();
const searchCache = globalCache.__minerbaSearchCache ??= new Map();

export interface MinerbaSearchItem {
  kode_badan_usaha: string;
  nama: string;
  jenis: string;
}

export interface MinerbaDireksi {
  nama: string;
  jabatan: string;
  mulai_menjabat: string;
  akhir_menjabat: string;
}

export interface MinerbaSaham {
  jenis_kepemilikan?: string;
  nama: string;
  kewarganegaraan?: string;
  persentase_saham: string;
}

export interface MinerbaPerizinan {
  nomor_izin: string;
  jenis_izin: string;
  tahap_kegiatan: string;
  golongan?: string;
  komoditas: string;
  luas_ha: string;
  tanggal_berlaku: string;
  tanggal_berakhir: string;
  status_cnc: string;
  status_cnc_badge: { color: 'green' | 'red'; label: string };
  lokasi: string;
  kode_wiup: string;
}

export interface MinerbaDetail {
  informasi: {
    nama_badan_usaha: string;
    kode_badan_usaha: string;
    jenis_badan_usaha: string;
    alamat: string;
    npwp?: string;
  };
  direksi: MinerbaDireksi[];
  saham: MinerbaSaham[];
  perizinan: MinerbaPerizinan[];
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const clean = (value: string | undefined | null) => String(value ?? '').replace(/\s+/g, ' ').trim();
const normalize = (value: string) => clean(value).toLowerCase().replace(/[^a-z0-9]+/g, '');
const randomUserAgent = () => USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

const cacheGet = <T>(cache: Map<string, CacheEntry<T>>, key: string): T | undefined => {
  const hit = cache.get(key);
  if (!hit) return undefined;
  if (hit.expiresAt <= Date.now()) {
    cache.delete(key);
    return undefined;
  }
  return hit.value;
};

const cacheSet = <T>(cache: Map<string, CacheEntry<T>>, key: string, value: T, ttl: number) => {
  cache.set(key, { value, expiresAt: Date.now() + ttl });
};

const throttle = async () => {
  const last = globalCache.__minerbaLastRequestAt ?? 0;
  const wait = Math.max(0, MIN_DELAY_MS - (Date.now() - last));
  if (wait > 0) await sleep(wait);
  globalCache.__minerbaLastRequestAt = Date.now();
};

const fetchHtml = async (url: string) => {
  await throttle();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetch(url, {
      headers: {
        'user-agent': randomUserAgent(),
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'accept-language': 'id-ID,id;q=0.9,en-US;q=0.7,en;q=0.6',
        referer: `${BASE_URL}${LIST_PATH}`,
      },
      redirect: 'follow',
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`MinerbaOne responded ${response.status}`);
    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
};

const findHeaderIndex = (headers: string[], aliases: string[]) => {
  const normalizedAliases = aliases.map(normalize);
  return headers.findIndex((header) => normalizedAliases.some((alias) => normalize(header).includes(alias)));
};

const parseTableRows = ($: ReturnType<typeof load>, table: any) => {
  const headers = $(table).find('thead th').map((_: number, th: any) => clean($(th).text())).get();
  const rows = $(table).find('tbody tr').map((_: number, tr: any) => {
    const cells = $(tr).find('td').map((__: number, td: any) => clean($(td).text())).get();
    return { row: tr, cells };
  }).get();
  return { headers, rows };
};

const inferSearchRow = ($: ReturnType<typeof load>, tr: any, headers: string[], cells: string[]): MinerbaSearchItem | null => {
  if (!cells.length || cells.join(' ').toLowerCase().includes('tidak ada data')) return null;
  const anchor = $(tr).find('a[href*="/publik/badan-usaha/"][href*="/detail"]').first();
  const href = anchor.attr('href') || '';
  const kodeFromHref = href.match(/\/publik\/badan-usaha\/([^/]+)\/detail/i)?.[1] || '';
  const kodeIndex = findHeaderIndex(headers, ['kode badan usaha', 'kode']);
  const namaIndex = findHeaderIndex(headers, ['nama badan usaha', 'nama']);
  const jenisIndex = findHeaderIndex(headers, ['jenis badan usaha', 'jenis']);
  const kode = clean(kodeIndex >= 0 ? cells[kodeIndex] : kodeFromHref) || kodeFromHref;
  const nama = clean(namaIndex >= 0 ? cells[namaIndex] : anchor.text()) || clean(cells.find((cell) => /[a-z]/i.test(cell)));
  const knownTypes = /^(pt|cv|koperasi|perum|persero|firma|bumd|bumn|perorangan)$/i;
  const jenis = clean(jenisIndex >= 0 ? cells[jenisIndex] : cells.find((cell) => knownTypes.test(cell)));
  if (!kode || !nama) return null;
  return { kode_badan_usaha: kode, nama, jenis };
};

const parseSearchHtml = (html: string): MinerbaSearchItem[] => {
  const $ = load(html);
  const results: MinerbaSearchItem[] = [];
  $('table').each((_: number, table: any) => {
    const { headers, rows } = parseTableRows($, table);
    rows.forEach(({ row, cells }: any) => {
      const item = inferSearchRow($, row, headers, cells);
      if (item) results.push(item);
    });
  });
  const dedup = new Map(results.map((item) => [item.kode_badan_usaha, item]));
  return [...dedup.values()];
};

const maskNpwp = (raw: string) => {
  const value = clean(raw);
  if (!value) return '';
  if (value.includes('*')) return value;
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 8) return value;
  return `${digits.slice(0, 8)}${'*'.repeat(digits.length - 8)}`;
};

const valueByAliases = (row: Record<string, string>, aliases: string[]) => {
  for (const alias of aliases) {
    const normalizedAlias = normalize(alias);
    const found = Object.entries(row).find(([key]) => normalize(key).includes(normalizedAlias));
    if (found) return clean(found[1]);
  }
  return '';
};

const rowObject = (headers: string[], cells: string[]) => Object.fromEntries(
  headers.map((header, index) => [header || `col${index}`, clean(cells[index])]),
);

const parseDetailHtml = (html: string, requestedCode: string): MinerbaDetail | null => {
  const $ = load(html);
  const infoMap: Record<string, string> = {};
  const direksi: MinerbaDireksi[] = [];
  const saham: MinerbaSaham[] = [];
  const perizinan: MinerbaPerizinan[] = [];

  $('table').each((_: number, table: any) => {
    const { headers, rows } = parseTableRows($, table);
    const headerText = headers.join(' ').toLowerCase();

    if (!headers.length || headers.length <= 2) {
      $(table).find('tr').each((__: number, tr: any) => {
        const cells = $(tr).find('th,td').map((___: number, cell: any) => clean($(cell).text())).get();
        if (cells.length >= 2 && cells[0]) infoMap[normalize(cells[0])] = cells.slice(1).join(' ').trim();
      });
    }

    if (headerText.includes('direksi') || (headerText.includes('jabatan') && headerText.includes('menjabat'))) {
      rows.forEach(({ cells }: any) => {
        const row = rowObject(headers, cells);
        const nama = valueByAliases(row, ['nama direksi', 'nama']);
        if (!nama || nama.toLowerCase().includes('tidak ada data')) return;
        direksi.push({
          nama,
          jabatan: valueByAliases(row, ['jabatan']),
          mulai_menjabat: valueByAliases(row, ['mulai menjabat', 'mulai']),
          akhir_menjabat: valueByAliases(row, ['akhir menjabat', 'akhir']),
        });
      });
    }

    if (headerText.includes('kepemilikan') || headerText.includes('persentase saham')) {
      rows.forEach(({ cells }: any) => {
        const row = rowObject(headers, cells);
        const nama = valueByAliases(row, ['nama']);
        if (!nama || nama.toLowerCase().includes('tidak ada data')) return;
        saham.push({
          jenis_kepemilikan: valueByAliases(row, ['jenis kepemilikan']),
          nama,
          kewarganegaraan: valueByAliases(row, ['kewarganegaraan']),
          persentase_saham: valueByAliases(row, ['persentase saham', 'persentase']),
        });
      });
    }

    if (headerText.includes('nomor izin') || headerText.includes('kode wiup')) {
      rows.forEach(({ cells }: any) => {
        const row = rowObject(headers, cells);
        const nomorIzin = valueByAliases(row, ['nomor izin']);
        if (!nomorIzin || nomorIzin.toLowerCase().includes('tidak ada data')) return;
        const status = valueByAliases(row, ['status cnc', 'cnc']);
        const cncValid = status.trim().toUpperCase() === 'CNC';
        perizinan.push({
          nomor_izin: nomorIzin,
          jenis_izin: valueByAliases(row, ['jenis izin']),
          tahap_kegiatan: valueByAliases(row, ['tahap kegiatan']),
          golongan: valueByAliases(row, ['golongan']),
          komoditas: valueByAliases(row, ['komoditas']),
          luas_ha: valueByAliases(row, ['luas ha', 'luas']),
          tanggal_berlaku: valueByAliases(row, ['tanggal berlaku', 'berlaku']),
          tanggal_berakhir: valueByAliases(row, ['tanggal berakhir', 'berakhir']),
          status_cnc: status,
          status_cnc_badge: cncValid
            ? { color: 'green', label: 'CnC Valid' }
            : { color: 'red', label: 'Non-CnC' },
          lokasi: valueByAliases(row, ['lokasi']),
          kode_wiup: valueByAliases(row, ['kode wiup', 'wiup']),
        });
      });
    }
  });

  // Some MinerbaOne detail cards render label/value blocks without a table.
  $('dt, .label, .form-label, strong').each((_: number, label: any) => {
    const key = normalize($(label).text());
    if (!['namabadanusaha', 'kodebadanusaha', 'jenisbadanusaha', 'alamat', 'npwp'].some((known) => key.includes(known))) return;
    const candidate = clean($(label).next('dd, span, div, p').first().text()) || clean($(label).parent().children().last().text());
    if (candidate) infoMap[key] = candidate;
  });

  const infoValue = (aliases: string[]) => {
    for (const alias of aliases) {
      const normalizedAlias = normalize(alias);
      const found = Object.entries(infoMap).find(([key]) => key.includes(normalizedAlias));
      if (found) return clean(found[1]);
    }
    return '';
  };

  const nama = infoValue(['nama badan usaha', 'nama']);
  const kode = infoValue(['kode badan usaha', 'kode']) || requestedCode;
  const jenis = infoValue(['jenis badan usaha', 'jenis']);
  const alamat = infoValue(['alamat']);
  const npwp = maskNpwp(infoValue(['npwp']));

  const bodyText = clean($('body').text()).toLowerCase();
  if (!nama && !direksi.length && !saham.length && !perizinan.length) {
    if (bodyText.includes('tidak ada data') || bodyText.includes('data tidak ditemukan')) return null;
    return null;
  }

  return {
    informasi: {
      nama_badan_usaha: nama,
      kode_badan_usaha: kode,
      jenis_badan_usaha: jenis,
      alamat,
      ...(npwp ? { npwp } : {}),
    },
    direksi,
    saham,
    perizinan,
  };
};

const launchBrowser = async () => {
  chromium.setGraphicsMode = false;
  return puppeteer.launch({
    args: chromium.args,
    defaultViewport: { width: 1440, height: 1200 },
    executablePath: await chromium.executablePath(),
    headless: true,
  });
};

const scrapeSearchWithBrowser = async (query: string) => {
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setUserAgent(randomUserAgent());
    await throttle();
    await page.goto(`${BASE_URL}${LIST_PATH}?q=${encodeURIComponent(query)}`, { waitUntil: 'networkidle2', timeout: 35_000 });
    await sleep(1200);

    // Support both query-string filtering and a client-side search input.
    const inputSelector = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input')) as HTMLInputElement[];
      const input = inputs.find((element) => {
        const haystack = `${element.placeholder} ${element.name} ${element.id}`.toLowerCase();
        return haystack.includes('badan usaha') || haystack.includes('nomor izin') || haystack.includes('wiup') || haystack.includes('search');
      });
      if (!input) return '';
      return input.id ? `#${CSS.escape(input.id)}` : input.name ? `input[name="${input.name}"]` : '';
    });
    if (inputSelector) {
      await page.focus(inputSelector).catch(() => undefined);
      await page.evaluate((selector, value) => {
        const input = document.querySelector(selector) as HTMLInputElement | null;
        if (!input) return;
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }, inputSelector, query);
      await page.keyboard.press('Enter').catch(() => undefined);
      await sleep(2000);
    }

    const all = new Map<string, MinerbaSearchItem>();
    let previousSignature = '';
    for (let pageNo = 0; pageNo < MAX_SEARCH_PAGES; pageNo += 1) {
      const html = await page.content();
      const items = parseSearchHtml(html);
      items.forEach((item) => all.set(item.kode_badan_usaha, item));
      const signature = items.map((item) => item.kode_badan_usaha).join('|');
      if (pageNo > 0 && signature && signature === previousSignature) break;
      previousSignature = signature;

      const clicked = await page.evaluate(() => {
        const candidates = Array.from(document.querySelectorAll('a,button')) as HTMLElement[];
        const next = candidates.find((element) => {
          const text = (element.textContent || '').trim().toLowerCase();
          const aria = (element.getAttribute('aria-label') || '').toLowerCase();
          const cls = element.className || '';
          const disabled = element.getAttribute('disabled') !== null
            || element.getAttribute('aria-disabled') === 'true'
            || element.closest('.disabled');
          if (disabled) return false;
          return aria.includes('next') || text === 'next' || text === 'selanjutnya' || text === '›' || text === '»' || String(cls).includes('next');
        });
        if (!next) return false;
        next.click();
        return true;
      });
      if (!clicked) break;
      await throttle();
      await sleep(1200);
    }
    return [...all.values()];
  } finally {
    await browser.close();
  }
};

const scrapeDetailWithBrowser = async (code: string) => {
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setUserAgent(randomUserAgent());
    await throttle();
    const url = `${BASE_URL}${LIST_PATH}/${encodeURIComponent(code)}/detail`;
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 35_000 });
    await sleep(1500);
    return parseDetailHtml(await page.content(), code);
  } finally {
    await browser.close();
  }
};

export const searchMinerba = async (query: string): Promise<MinerbaSearchItem[]> => {
  const q = clean(query);
  if (!q) return [];
  const cacheKey = q.toLowerCase();
  const cached = cacheGet(searchCache, cacheKey);
  if (cached) return cached;

  const url = `${BASE_URL}${LIST_PATH}?q=${encodeURIComponent(q)}`;
  let results: MinerbaSearchItem[] = [];
  try {
    results = parseSearchHtml(await fetchHtml(url));
  } catch {
    // Browser fallback below.
  }
  if (!results.length) results = await scrapeSearchWithBrowser(q);

  cacheSet(searchCache, cacheKey, results, SEARCH_CACHE_TTL_MS);
  return results;
};

export const getMinerbaDetail = async (code: string): Promise<MinerbaDetail | null> => {
  const safeCode = clean(code).replace(/[^a-zA-Z0-9._-]/g, '');
  if (!safeCode) return null;
  const cached = cacheGet(detailCache, safeCode);
  if (cached) return cached;

  const url = `${BASE_URL}${LIST_PATH}/${encodeURIComponent(safeCode)}/detail`;
  let detail: MinerbaDetail | null = null;
  try {
    detail = parseDetailHtml(await fetchHtml(url), safeCode);
  } catch {
    // Browser fallback below.
  }
  if (!detail) detail = await scrapeDetailWithBrowser(safeCode);
  if (detail) cacheSet(detailCache, safeCode, detail, CACHE_TTL_MS);
  return detail;
};

export const minerbaCors = (req: any, res: any) => {
  const allowed = (process.env.MINERBA_ALLOWED_ORIGINS || '*').split(',').map((item) => item.trim()).filter(Boolean);
  const origin = String(req.headers?.origin || '');
  const allowOrigin = allowed.includes('*') ? '*' : allowed.includes(origin) ? origin : allowed[0] || '';
  if (allowOrigin) res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=3600');
};
