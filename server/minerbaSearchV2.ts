import { load } from 'cheerio';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

const BASE_URL = 'https://minerbaone.esdm.go.id';
const LIST_URL = `${BASE_URL}/publik/badan-usaha`;
const MIN_DELAY_MS = 2000;
const CACHE_TTL_MS = 60 * 60 * 1000;
const MAX_PAGES = Math.max(1, Math.min(20, Number(process.env.MINERBA_MAX_SEARCH_PAGES || 10)));

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
];

export interface MinerbaSearchItem {
  kode_badan_usaha: string;
  nama: string;
  jenis: string;
}

type CacheEntry = { value: MinerbaSearchItem[]; expiresAt: number };
type GlobalState = typeof globalThis & {
  __minerbaSearchV2Cache?: Map<string, CacheEntry>;
  __minerbaLastRequestAt?: number;
};

const globalState = globalThis as GlobalState;
const cache = globalState.__minerbaSearchV2Cache || new Map<string, CacheEntry>();
globalState.__minerbaSearchV2Cache = cache;

const clean = (value: unknown) => String(value ?? '').replace(/\s+/g, ' ').trim();
const normalize = (value: unknown) => clean(value).toLowerCase().replace(/[^a-z0-9]+/g, '');
const randomUa = () => USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const throttle = async () => {
  const elapsed = Date.now() - (globalState.__minerbaLastRequestAt || 0);
  if (elapsed < MIN_DELAY_MS) await sleep(MIN_DELAY_MS - elapsed);
  globalState.__minerbaLastRequestAt = Date.now();
};

const addCandidate = (map: Map<string, MinerbaSearchItem>, candidate: Partial<MinerbaSearchItem>) => {
  const code = clean(candidate.kode_badan_usaha);
  const name = clean(candidate.nama);
  if (!code || !name) return;
  map.set(code, { kode_badan_usaha: code, nama: name, jenis: clean(candidate.jenis) });
};

const codeFromText = (value: string) => {
  const direct = value.match(/\/publik\/badan-usaha\/([^/?#]+)(?:\/detail)?/i)?.[1];
  if (direct) return decodeURIComponent(direct);
  const attr = value.match(/(?:kode|id)[_\s-]*(?:badan[_\s-]*usaha)?[=:"'\s]+([A-Za-z0-9._-]{2,64})/i)?.[1];
  return attr || '';
};

const extractFromJson = (value: unknown, out: Map<string, MinerbaSearchItem>, depth = 0) => {
  if (depth > 12 || value == null) return;
  if (Array.isArray(value)) {
    value.forEach((item) => extractFromJson(item, out, depth + 1));
    return;
  }
  if (typeof value !== 'object') return;

  const record = value as Record<string, unknown>;
  const entries = Object.entries(record);
  const byAliases = (aliases: string[]) => {
    const hit = entries.find(([key]) => aliases.some((alias) => normalize(key) === normalize(alias) || normalize(key).includes(normalize(alias))));
    return hit ? clean(hit[1]) : '';
  };

  const name = byAliases(['nama_badan_usaha', 'namaBadanUsaha', 'nama perusahaan', 'nama']);
  let code = byAliases(['kode_badan_usaha', 'kodeBadanUsaha', 'id_badan_usaha', 'idBadanUsaha']);
  if (!code && name) {
    const id = entries.find(([key, item]) => ['id', 'kode'].includes(normalize(key)) && /^[A-Za-z0-9._-]{2,64}$/.test(clean(item)));
    if (id) code = clean(id[1]);
  }
  const type = byAliases(['jenis_badan_usaha', 'jenisBadanUsaha', 'bentuk_badan_usaha', 'jenis']);
  if (name && code) addCandidate(out, { kode_badan_usaha: code, nama: name, jenis: type });

  entries.forEach(([, item]) => extractFromJson(item, out, depth + 1));
};

const parseHtml = (html: string) => {
  const $ = load(html);
  const out = new Map<string, MinerbaSearchItem>();

  $('table tbody tr').each((_: number, tr: any) => {
    const cells = $(tr).find('td').map((__: number, td: any) => clean($(td).text())).get() as string[];
    if (!cells.length || normalize(cells.join(' ')).includes('tidakadata')) return;

    const table = $(tr).closest('table');
    const headers = table.find('thead th').map((__: number, th: any) => clean($(th).text())).get() as string[];
    const indexFor = (aliases: string[]) => headers.findIndex((header) => aliases.some((alias) => normalize(header).includes(normalize(alias))));
    const nameIndex = indexFor(['nama badan usaha', 'nama perusahaan', 'nama']);
    const typeIndex = indexFor(['jenis badan usaha', 'jenis']);
    const codeIndex = indexFor(['kode badan usaha', 'kode']);

    const linksAndAttrs = $(tr).find('a,button').map((__: number, el: any) => [
      $(el).attr('href'), $(el).attr('data-id'), $(el).attr('data-kode'), $(el).attr('onclick'), $(el).attr('to'),
    ].filter(Boolean).join(' ')).get().join(' ');

    const code = clean(codeIndex >= 0 ? cells[codeIndex] : '')
      || codeFromText(linksAndAttrs)
      || clean(cells.find((cell) => /^\d{2,}$/.test(cell)));
    const type = clean(typeIndex >= 0 ? cells[typeIndex] : cells.find((cell) => /^(PT|CV|Koperasi|Perum|Persero|Firma|BUMD|BUMN|Perorangan)$/i.test(cell)));
    const name = clean(nameIndex >= 0 ? cells[nameIndex] : '')
      || clean(cells.filter((cell) => /[A-Za-z]/.test(cell) && !/^(PT|CV)$/i.test(cell)).sort((a, b) => b.length - a.length)[0]);

    addCandidate(out, { kode_badan_usaha: code, nama: name, jenis: type });
  });

  $('a[href*="/publik/badan-usaha/"]').each((_: number, anchor: any) => {
    const href = clean($(anchor).attr('href'));
    const code = codeFromText(href);
    const name = clean($(anchor).text());
    if (code && name && !normalize(name).includes('detail')) addCandidate(out, { kode_badan_usaha: code, nama: name, jenis: '' });
  });

  return [...out.values()];
};

const requestHtml = async (query: string) => {
  await throttle();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetch(`${LIST_URL}?q=${encodeURIComponent(query)}`, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent': randomUa(),
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'accept-language': 'id-ID,id;q=0.9,en-US;q=0.7',
      },
    });
    if (!response.ok) throw new Error(`MinerbaOne responded ${response.status}`);
    return response.text();
  } finally {
    clearTimeout(timer);
  }
};

const searchWithBrowser = async (query: string): Promise<MinerbaSearchItem[]> => {
  chromium.setGraphicsMode = false;
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: { width: 1440, height: 1000 },
    executablePath: await chromium.executablePath(),
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(randomUa());
    const captured = new Map<string, MinerbaSearchItem>();
    const jsonUrls = new Set<string>();

    page.on('response', async (response) => {
      try {
        const url = response.url();
        const contentType = response.headers()['content-type'] || '';
        if (!url.startsWith(BASE_URL) || !contentType.toLowerCase().includes('json')) return;
        jsonUrls.add(url.split('?')[0]);
        const data = await response.json();
        extractFromJson(data, captured);
      } catch {
        // Not every JSON-looking response is safe to consume twice; DOM parsing remains the fallback.
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
        await handle.click({ clickCount: 3 });
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

    const all = new Map<string, MinerbaSearchItem>();
    captured.forEach((item, code) => all.set(code, item));
    let previousSignature = '';

    for (let pageNo = 0; pageNo < MAX_PAGES; pageNo += 1) {
      parseHtml(await page.content()).forEach((item) => all.set(item.kode_badan_usaha, item));
      captured.forEach((item, code) => all.set(code, item));

      const signature = [...all.keys()].join('|');
      if (pageNo > 0 && signature === previousSignature) break;
      previousSignature = signature;

      const clicked = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('a,button')) as HTMLElement[];
        const next = elements.find((element) => {
          const text = (element.textContent || '').trim().toLowerCase();
          const aria = (element.getAttribute('aria-label') || '').trim().toLowerCase();
          const className = String(element.className || '').toLowerCase();
          const disabled = element.hasAttribute('disabled') || element.getAttribute('aria-disabled') === 'true' || Boolean(element.closest('.disabled'));
          if (disabled) return false;
          return aria.includes('next') || text === 'next' || text === 'selanjutnya' || text === '›' || text === '»' || className.includes('pagination-next') || className.split(/\s+/).includes('next');
        });
        if (!next) return false;
        next.click();
        return true;
      });
      if (!clicked) break;
      await throttle();
      await sleep(1300);
    }

    if (!all.size) {
      const diagnostics = await page.evaluate(() => ({
        url: location.href,
        inputs: Array.from(document.querySelectorAll('input')).slice(0, 8).map((input) => ({ type: input.type, placeholder: input.placeholder, name: input.name, id: input.id })),
        tables: Array.from(document.querySelectorAll('table')).slice(0, 5).map((table) => ({
          headers: Array.from(table.querySelectorAll('thead th')).map((th) => (th.textContent || '').trim()).slice(0, 12),
          rows: table.querySelectorAll('tbody tr').length,
        })),
        detailLinks: Array.from(document.querySelectorAll('a')).map((a) => a.getAttribute('href') || '').filter((href) => href.includes('badan-usaha')).slice(0, 8),
        bodySample: (document.body?.innerText || '').replace(/\s+/g, ' ').slice(0, 500),
      }));
      console.warn('[minerba-search] no parsed results', { ...diagnostics, jsonUrls: [...jsonUrls].slice(0, 10) });
    }

    return [...all.values()];
  } finally {
    await browser.close();
  }
};

export const searchMinerbaV2 = async (query: string): Promise<MinerbaSearchItem[]> => {
  const q = clean(query);
  if (!q) return [];
  const cacheKey = normalize(q);
  const hit = cache.get(cacheKey);
  if (hit && hit.expiresAt > Date.now()) return hit.value;
  if (hit) cache.delete(cacheKey);

  let results: MinerbaSearchItem[] = [];
  try {
    results = parseHtml(await requestHtml(q));
    const normalizedQuery = normalize(q);
    results = results.filter((item) => normalize(`${item.nama} ${item.kode_badan_usaha} ${item.jenis}`).includes(normalizedQuery));
  } catch {
    // Browser fallback handles JS-rendered pages and interactive filtering.
  }

  if (!results.length) results = await searchWithBrowser(q);
  cache.set(cacheKey, { value: results, expiresAt: Date.now() + CACHE_TTL_MS });
  return results;
};
