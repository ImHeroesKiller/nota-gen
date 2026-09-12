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

type MinerbaGlobal = typeof globalThis & {
  __minerbaDetailCache?: Map<string, CacheEntry<MinerbaDetail>>;
  __minerbaSearchCache?: Map<string, CacheEntry<MinerbaSearchItem[]>>;
  __minerbaLastRequestAt?: number;
};

const globalState = globalThis as MinerbaGlobal;
const detailCache: Map<string, CacheEntry<MinerbaDetail>> = globalState.__minerbaDetailCache || new Map<string, CacheEntry<MinerbaDetail>>();
const searchCache: Map<string, CacheEntry<MinerbaSearchItem[]>> = globalState.__minerbaSearchCache || new Map<string, CacheEntry<MinerbaSearchItem[]>>();
globalState.__minerbaDetailCache = detailCache;
globalState.__minerbaSearchCache = searchCache;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const clean = (value: unknown) => String(value ?? '').replace(/\s+/g, ' ').trim();
const normalize = (value: unknown) => clean(value).toLowerCase().replace(/[^a-z0-9]+/g, '');
const randomUserAgent = () => USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

const cacheGet = <T>(cache: Map<string, CacheEntry<T>>, key: string): T | undefined => {
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
  const elapsed = Date.now() - (globalState.__minerbaLastRequestAt || 0);
  if (elapsed < MIN_DELAY_MS) await sleep(MIN_DELAY_MS - elapsed);
  globalState.__minerbaLastRequestAt = Date.now();
};

const fetchHtml = async (url: string) => {
  await throttle();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent': randomUserAgent(),
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'accept-language': 'id-ID,id;q=0.9,en-US;q=0.7,en;q=0.6',
        referer: `${BASE_URL}${LIST_PATH}`,
      },
    });
    if (!response.ok) throw new Error(`MinerbaOne responded ${response.status}`);
    return await response.text();
  } finally {
    clearTimeout(timer);
  }
};

const headerIndex = (headers: string[], aliases: string[]) => {
  const normalizedAliases = aliases.map(normalize);
  return headers.findIndex((header) => normalizedAliases.some((alias) => normalize(header).includes(alias)));
};

const tableRows = ($: ReturnType<typeof load>, table: any) => {
  const headers = $(table).find('thead th').map((_: number, th: any) => clean($(th).text())).get() as string[];
  const rows = $(table).find('tbody tr').map((_: number, tr: any) => ({
    row: tr,
    cells: $(tr).find('td').map((__: number, td: any) => clean($(td).text())).get() as string[],
  })).get() as Array<{ row: any; cells: string[] }>;
  return { headers, rows };
};

const parseSearchHtml = (html: string): MinerbaSearchItem[] => {
  const $ = load(html);
  const found = new Map<string, MinerbaSearchItem>();

  $('table').each((_: number, table: any) => {
    const { headers, rows } = tableRows($, table);
    const kodeIdx = headerIndex(headers, ['kode badan usaha', 'kode']);
    const namaIdx = headerIndex(headers, ['nama badan usaha', 'nama']);
    const jenisIdx = headerIndex(headers, ['jenis badan usaha', 'jenis']);

    rows.forEach(({ row, cells }) => {
      if (!cells.length || cells.join(' ').toLowerCase().includes('tidak ada data')) return;
      const anchor = $(row).find('a[href*="/publik/badan-usaha/"][href*="/detail"]').first();
      const href = anchor.attr('href') || '';
      const codeFromHref = href.match(/\/publik\/badan-usaha\/([^/]+)\/detail/i)?.[1] || '';
      const kode = clean(kodeIdx >= 0 ? cells[kodeIdx] : codeFromHref) || codeFromHref;
      const nama = clean(namaIdx >= 0 ? cells[namaIdx] : anchor.text()) || clean(cells.find((cell) => /[A-Za-z]/.test(cell)));
      const jenis = clean(jenisIdx >= 0 ? cells[jenisIdx] : cells.find((cell) => /^(PT|CV|Koperasi|Perum|Persero|Firma|BUMD|BUMN|Perorangan)$/i.test(cell)));
      if (kode && nama) found.set(kode, { kode_badan_usaha: kode, nama, jenis });
    });
  });

  return [...found.values()];
};

const maskNpwp = (raw: string) => {
  const value = clean(raw);
  if (!value || value.includes('*')) return value;
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 8) return value;
  return `${digits.slice(0, 8)}${'*'.repeat(digits.length - 8)}`;
};

const objectRow = (headers: string[], cells: string[]) => Object.fromEntries(headers.map((header, index) => [header || `col${index}`, clean(cells[index])]));

const valueFrom = (row: Record<string, string>, aliases: string[]) => {
  for (const alias of aliases) {
    const match = Object.entries(row).find(([key]) => normalize(key).includes(normalize(alias)));
    if (match) return clean(match[1]);
  }
  return '';
};

const parseDetailHtml = (html: string, requestedCode: string): MinerbaDetail | null => {
  const $ = load(html);
  const infoMap: Record<string, string> = {};
  const direksi: MinerbaDireksi[] = [];
  const saham: MinerbaSaham[] = [];
  const perizinan: MinerbaPerizinan[] = [];

  $('table').each((_: number, table: any) => {
    const { headers, rows } = tableRows($, table);
    const headerText = normalize(headers.join(' '));

    if (!headers.length || headers.length <= 2) {
      $(table).find('tr').each((__: number, tr: any) => {
        const cells = $(tr).find('th,td').map((___: number, cell: any) => clean($(cell).text())).get() as string[];
        if (cells.length >= 2 && cells[0]) infoMap[normalize(cells[0])] = clean(cells.slice(1).join(' '));
      });
    }

    if (headerText.includes('direksi') || (headerText.includes('jabatan') && headerText.includes('menjabat'))) {
      rows.forEach(({ cells }) => {
        const row = objectRow(headers, cells);
        const nama = valueFrom(row, ['nama direksi', 'nama']);
        if (!nama || normalize(nama).includes('tidakadata')) return;
        direksi.push({
          nama,
          jabatan: valueFrom(row, ['jabatan']),
          mulai_menjabat: valueFrom(row, ['mulai menjabat', 'mulai']),
          akhir_menjabat: valueFrom(row, ['akhir menjabat', 'akhir']),
        });
      });
    }

    if (headerText.includes('kepemilikan') || headerText.includes('persentasesaham')) {
      rows.forEach(({ cells }) => {
        const row = objectRow(headers, cells);
        const nama = valueFrom(row, ['nama']);
        if (!nama || normalize(nama).includes('tidakadata')) return;
        saham.push({
          jenis_kepemilikan: valueFrom(row, ['jenis kepemilikan']),
          nama,
          kewarganegaraan: valueFrom(row, ['kewarganegaraan']),
          persentase_saham: valueFrom(row, ['persentase saham', 'persentase']),
        });
      });
    }

    if (headerText.includes('nomorizin') || headerText.includes('kodewiup')) {
      rows.forEach(({ cells }) => {
        const row = objectRow(headers, cells);
        const nomor = valueFrom(row, ['nomor izin']);
        if (!nomor || normalize(nomor).includes('tidakadata')) return;
        const status = valueFrom(row, ['status cnc', 'cnc']);
        const valid = status.trim().toUpperCase() === 'CNC';
        perizinan.push({
          nomor_izin: nomor,
          jenis_izin: valueFrom(row, ['jenis izin']),
          tahap_kegiatan: valueFrom(row, ['tahap kegiatan']),
          golongan: valueFrom(row, ['golongan']),
          komoditas: valueFrom(row, ['komoditas']),
          luas_ha: valueFrom(row, ['luas ha', 'luas']),
          tanggal_berlaku: valueFrom(row, ['tanggal berlaku', 'berlaku']),
          tanggal_berakhir: valueFrom(row, ['tanggal berakhir', 'berakhir']),
          status_cnc: status,
          status_cnc_badge: valid ? { color: 'green', label: 'CnC Valid' } : { color: 'red', label: 'Non-CnC' },
          lokasi: valueFrom(row, ['lokasi']),
          kode_wiup: valueFrom(row, ['kode wiup', 'wiup']),
        });
      });
    }
  });

  $('dt, .label, .form-label, strong').each((_: number, element: any) => {
    const key = normalize($(element).text());
    if (!['namabadanusaha', 'kodebadanusaha', 'jenisbadanusaha', 'alamat', 'npwp'].some((known) => key.includes(known))) return;
    const next = clean($(element).next('dd, span, div, p').first().text()) || clean($(element).parent().children().last().text());
    if (next) infoMap[key] = next;
  });

  const info = (aliases: string[]) => {
    for (const alias of aliases) {
      const match = Object.entries(infoMap).find(([key]) => key.includes(normalize(alias)));
      if (match) return clean(match[1]);
    }
    return '';
  };

  const nama = info(['nama badan usaha', 'nama']);
  const kode = info(['kode badan usaha', 'kode']) || requestedCode;
  const jenis = info(['jenis badan usaha', 'jenis']);
  const alamat = info(['alamat']);
  const npwp = maskNpwp(info(['npwp']));

  if (!nama && !direksi.length && !saham.length && !perizinan.length) return null;

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

const scrapeSearchWithBrowser = async (query: string): Promise<MinerbaSearchItem[]> => {
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setUserAgent(randomUserAgent());
    await throttle();
    await page.goto(`${BASE_URL}${LIST_PATH}?q=${encodeURIComponent(query)}`, { waitUntil: 'networkidle2', timeout: 35_000 });
    await sleep(1200);

    const selector = await page.evaluate(() => {
      const input = Array.from(document.querySelectorAll('input')).find((element) => {
        const haystack = `${element.getAttribute('placeholder') || ''} ${element.getAttribute('name') || ''} ${element.id || ''}`.toLowerCase();
        return haystack.includes('badan usaha') || haystack.includes('nomor izin') || haystack.includes('wiup') || haystack.includes('search');
      }) as HTMLInputElement | undefined;
      if (!input) return '';
      if (input.id) return `#${CSS.escape(input.id)}`;
      if (input.name) return `input[name="${input.name}"]`;
      return '';
    });

    if (selector) {
      await page.evaluate((cssSelector, value) => {
        const input = document.querySelector(cssSelector) as HTMLInputElement | null;
        if (!input) return;
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }, selector, query);
      await page.focus(selector).catch(() => undefined);
      await page.keyboard.press('Enter').catch(() => undefined);
      await sleep(2000);
    }

    const results = new Map<string, MinerbaSearchItem>();
    let previous = '';

    for (let pageNo = 0; pageNo < MAX_SEARCH_PAGES; pageNo += 1) {
      const items = parseSearchHtml(await page.content());
      items.forEach((item) => results.set(item.kode_badan_usaha, item));
      const signature = items.map((item) => item.kode_badan_usaha).join('|');
      if (pageNo > 0 && signature && signature === previous) break;
      previous = signature;

      const clicked = await page.evaluate(() => {
        const nodes = Array.from(document.querySelectorAll('a,button')) as HTMLElement[];
        const next = nodes.find((element) => {
          const text = cleanDom(element.textContent);
          const aria = cleanDom(element.getAttribute('aria-label'));
          const className = String(element.className || '').toLowerCase();
          const disabled = element.hasAttribute('disabled') || element.getAttribute('aria-disabled') === 'true' || Boolean(element.closest('.disabled'));
          if (disabled) return false;
          return aria.includes('next') || text === 'next' || text === 'selanjutnya' || text === '›' || text === '»' || className.includes('next');
        });
        if (!next) return false;
        next.click();
        return true;

        function cleanDom(value: string | null) {
          return String(value || '').trim().toLowerCase();
        }
      });

      if (!clicked) break;
      await throttle();
      await sleep(1200);
    }

    return [...results.values()];
  } finally {
    await browser.close();
  }
};

const scrapeDetailWithBrowser = async (code: string): Promise<MinerbaDetail | null> => {
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setUserAgent(randomUserAgent());
    await throttle();
    await page.goto(`${BASE_URL}${LIST_PATH}/${encodeURIComponent(code)}/detail`, { waitUntil: 'networkidle2', timeout: 35_000 });
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
  const cached = cacheGet<MinerbaSearchItem[]>(searchCache, cacheKey);
  if (cached) return cached;

  let results: MinerbaSearchItem[] = [];
  try {
    results = parseSearchHtml(await fetchHtml(`${BASE_URL}${LIST_PATH}?q=${encodeURIComponent(q)}`));
  } catch {
    // Browser fallback below.
  }
  if (!results.length) results = await scrapeSearchWithBrowser(q);

  cacheSet<MinerbaSearchItem[]>(searchCache, cacheKey, results, SEARCH_CACHE_TTL_MS);
  return results;
};

export const getMinerbaDetail = async (code: string): Promise<MinerbaDetail | null> => {
  const safeCode = clean(code).replace(/[^a-zA-Z0-9._-]/g, '');
  if (!safeCode) return null;
  const cached = cacheGet<MinerbaDetail>(detailCache, safeCode);
  if (cached) return cached;

  let detail: MinerbaDetail | null = null;
  try {
    detail = parseDetailHtml(await fetchHtml(`${BASE_URL}${LIST_PATH}/${encodeURIComponent(safeCode)}/detail`), safeCode);
  } catch {
    // Browser fallback below.
  }
  if (!detail) detail = await scrapeDetailWithBrowser(safeCode);
  if (detail) cacheSet<MinerbaDetail>(detailCache, safeCode, detail, CACHE_TTL_MS);
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
