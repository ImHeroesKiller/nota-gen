import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import type { MinerbaSearchItem } from './minerba.js';

const BASE_URL = 'https://minerbaone.esdm.go.id';
const LIST_URL = `${BASE_URL}/publik/badan-usaha`;
const MAX_SEARCH_PAGES = Number(process.env.MINERBA_MAX_SEARCH_PAGES || 10);
const MIN_DELAY_MS = 2000;

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
];

type CacheEntry<T> = { value: T; expiresAt: number };
type SearchGlobal = typeof globalThis & {
  __minerbaSearchV2Cache?: Map<string, CacheEntry<MinerbaSearchItem[]>>;
  __minerbaSearchV2LastRequestAt?: number;
};

const state = globalThis as SearchGlobal;
const searchCache = state.__minerbaSearchV2Cache || new Map<string, CacheEntry<MinerbaSearchItem[]>>();
state.__minerbaSearchV2Cache = searchCache;
const SEARCH_TTL_MS = 60 * 60 * 1000;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const clean = (value: unknown) => String(value ?? '').replace(/\s+/g, ' ').trim();
const randomUserAgent = () => USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

const cacheGet = (key: string) => {
  const entry = searchCache.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt <= Date.now()) {
    searchCache.delete(key);
    return undefined;
  }
  return entry.value;
};

const cacheSet = (key: string, value: MinerbaSearchItem[]) => searchCache.set(key, { value, expiresAt: Date.now() + SEARCH_TTL_MS });

const throttle = async () => {
  const elapsed = Date.now() - (state.__minerbaSearchV2LastRequestAt || 0);
  if (elapsed < MIN_DELAY_MS) await sleep(MIN_DELAY_MS - elapsed);
  state.__minerbaSearchV2LastRequestAt = Date.now();
};

const normalizeSearchItem = (row: any): MinerbaSearchItem | null => {
  const kode = clean(row?.kode_badan_usaha ?? row?.kode ?? row?.id_badan_usaha ?? row?.id);
  const nama = clean(row?.nama_badan_usaha ?? row?.nama ?? row?.name);
  const jenis = clean(row?.jenis_badan_usaha ?? row?.jenis ?? row?.type);
  if (!kode || !nama) return null;
  return { kode_badan_usaha: kode, nama, jenis };
};

const extractFromJson = (payload: any): MinerbaSearchItem[] => {
  const candidates: any[] = [];
  const visit = (value: any, depth = 0) => {
    if (depth > 7 || value === null || value === undefined) return;
    if (Array.isArray(value)) {
      value.forEach((item) => visit(item, depth + 1));
      return;
    }
    if (typeof value !== 'object') return;
    const normalized = normalizeSearchItem(value);
    if (normalized) candidates.push(normalized);
    Object.values(value).forEach((item) => visit(item, depth + 1));
  };
  visit(payload);
  return candidates;
};

const extractFromDom = async (page: any): Promise<MinerbaSearchItem[]> => page.evaluate(() => {
  const cleanText = (value: unknown) => String(value ?? '').replace(/\s+/g, ' ').trim();
  const found = new Map<string, { kode_badan_usaha: string; nama: string; jenis: string }>();
  const kindPattern = /^(PT|CV|Koperasi|Perum|Persero|Firma|BUMD|BUMN|Perorangan)$/i;

  for (const row of Array.from(document.querySelectorAll('table tbody tr'))) {
    const cells = Array.from(row.querySelectorAll('td')).map((cell) => cleanText(cell.textContent));
    if (!cells.length || cells.join(' ').toLowerCase().includes('tidak ada data')) continue;
    const link = row.querySelector('a[href*="badan-usaha"]') as HTMLAnchorElement | null;
    const href = link?.getAttribute('href') || '';
    const fromHref = href.match(/badan-usaha\/(?:detail\/)?([^/?#]+)/i)?.[1] || '';
    const possibleKind = cells.find((cell) => kindPattern.test(cell)) || '';
    const possibleName = cells.find((cell) => /[A-Za-z]/.test(cell) && !kindPattern.test(cell)) || cleanText(link?.textContent);
    const codeCell = cells.find((cell) => /^[A-Za-z0-9._/-]+$/.test(cell) && !kindPattern.test(cell)) || '';
    const code = cleanText(fromHref || codeCell);
    const name = cleanText(possibleName);
    if (code && name) found.set(code, { kode_badan_usaha: code, nama: name, jenis: cleanText(possibleKind) });
  }

  return Array.from(found.values());
});

const launchBrowser = async () => {
  chromium.setGraphicsMode = false;
  return puppeteer.launch({
    args: chromium.args,
    defaultViewport: { width: 1440, height: 1000 },
    executablePath: await chromium.executablePath(),
    headless: true,
  });
};

export const searchMinerbaV2 = async (rawQuery: string): Promise<MinerbaSearchItem[]> => {
  const query = clean(rawQuery);
  if (!query) return [];
  const key = query.toLowerCase();
  const cached = cacheGet(key);
  if (cached) return cached;

  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setUserAgent(randomUserAgent());
    const apiResults = new Map<string, MinerbaSearchItem>();
    const jsonUrls = new Set<string>();

    page.on('response', async (response: any) => {
      try {
        const contentType = String(response.headers()?.['content-type'] || '').toLowerCase();
        if (!contentType.includes('json')) return;
        jsonUrls.add(response.url());
        const payload = await response.json();
        for (const item of extractFromJson(payload)) apiResults.set(item.kode_badan_usaha, item);
      } catch {
        // Best-effort diagnostic/fallback capture only.
      }
    });

    await throttle();
    await page.goto(LIST_URL, { waitUntil: 'networkidle2', timeout: 40_000 });
    await sleep(1000);

    const inputs = await page.evaluate(() => Array.from(document.querySelectorAll('input')).map((input, index) => ({
      index,
      type: input.type,
      placeholder: input.placeholder || '',
      name: input.name || '',
      id: input.id || '',
      aria: input.getAttribute('aria-label') || '',
    })));
    const target = inputs.find((input) => {
      const text = `${input.placeholder} ${input.name} ${input.id} ${input.aria}`.toLowerCase();
      return input.type !== 'hidden' && (text.includes('badan usaha') || text.includes('nomor izin') || text.includes('wiup') || text.includes('cari') || text.includes('search'));
    }) || inputs.find((input) => input.type === 'search') || inputs.find((input) => input.type === 'text');

    if (target) {
      const handles = await page.$$('input');
      const handle = handles[target.index];
      if (handle) {
        await handle.click({ count: 3 });
        await page.keyboard.press('Backspace');
        await page.keyboard.type(query, { delay: 35 });
        await page.keyboard.press('Enter').catch(() => undefined);
      }

      await sleep(800);
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button,input[type="submit"]')) as HTMLElement[];
        const button = buttons.find((element) => {
          const label = `${element.textContent || ''} ${element.getAttribute('aria-label') || ''} ${(element as HTMLInputElement).value || ''}`.trim().toLowerCase();
          return label === 'cari' || label === 'search' || label.includes('cari data');
        });
        button?.click();
      });
      await sleep(2400);
    }

    for (let pageIndex = 0; pageIndex < MAX_SEARCH_PAGES; pageIndex += 1) {
      for (const item of await extractFromDom(page)) apiResults.set(item.kode_badan_usaha, item);
      if (apiResults.size >= 25 && pageIndex > 0) break;

      const clicked = await page.evaluate(() => {
        const candidates = Array.from(document.querySelectorAll('button,a')) as HTMLElement[];
        const next = candidates.find((element) => {
          const text = `${element.textContent || ''} ${element.getAttribute('aria-label') || ''}`.trim().toLowerCase();
          const disabled = element.getAttribute('disabled') !== null || element.getAttribute('aria-disabled') === 'true' || element.classList.contains('disabled');
          return !disabled && (text === 'next' || text === 'berikutnya' || text === '›' || text === '»' || text.includes('next'));
        });
        if (!next) return false;
        next.click();
        return true;
      });
      if (!clicked) break;
      await throttle();
      await sleep(1600);
    }

    const results = [...apiResults.values()].filter((item) => {
      const haystack = `${item.kode_badan_usaha} ${item.nama} ${item.jenis}`.toLowerCase();
      return haystack.includes(query.toLowerCase()) || apiResults.size <= 25;
    });

    if (!results.length) {
      const diagnostics = await page.evaluate(() => ({
        url: location.href,
        inputs: Array.from(document.querySelectorAll('input')).map((input) => ({ placeholder: input.placeholder, value: input.value, type: input.type })),
        tables: Array.from(document.querySelectorAll('table')).map((table) => table.innerText.slice(0, 500)),
        detailLinks: Array.from(document.querySelectorAll('a')).map((a) => a.getAttribute('href')).filter((href) => href?.includes('badan-usaha')).slice(0, 10),
        bodySample: document.body.innerText.slice(0, 1000),
      }));
      console.warn('[minerba-search] no parsed results', { ...diagnostics, jsonUrls: [...jsonUrls].slice(0, 20) });
    }

    cacheSet(key, results);
    return results;
  } finally {
    await browser.close();
  }
};
