import { minerbaCors } from '../../server/minerba.js';
import type { MinerbaSearchItem } from '../../server/minerba.js';
import { searchMinerbaPublicLite } from '../../server/minerbaSearchPublicLite.js';
import { searchMinerbaV2 } from '../../server/minerbaSearchV2.js';

const normalize = (value: unknown) => String(value ?? '')
  .trim()
  .toLowerCase()
  .replace(/\s+/g, ' ');

const sanitize = (item: MinerbaSearchItem): MinerbaSearchItem => ({
  kode_badan_usaha: String(item.kode_badan_usaha || '').trim(),
  nama: String(item.nama || '').trim(),
  jenis: String(item.jenis || '').trim(),
});

const rankPublicResults = (items: MinerbaSearchItem[], query: string) => {
  const q = normalize(query);
  return items
    .map(sanitize)
    .filter((item) => {
      const nama = normalize(item.nama);
      const kode = normalize(item.kode_badan_usaha);
      return nama.includes(q) || kode.includes(q);
    })
    .sort((a, b) => {
      const aName = normalize(a.nama);
      const bName = normalize(b.nama);
      const aCode = normalize(a.kode_badan_usaha);
      const bCode = normalize(b.kode_badan_usaha);
      const score = (name: string, code: string) => {
        if (name === q || code === q) return 0;
        if (name.startsWith(q) || code.startsWith(q)) return 1;
        return 2;
      };
      return score(aName, aCode) - score(bName, bCode) || a.nama.localeCompare(b.nama, 'id');
    })
    .slice(0, 25);
};

const sanitizeBrowserResults = (items: MinerbaSearchItem[]) => items
  .map(sanitize)
  .filter((item) => item.kode_badan_usaha && item.nama)
  .slice(0, 25);

export default async function handler(req: any, res: any) {
  minerbaCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const q = Array.isArray(req.query?.q) ? req.query.q[0] : req.query?.q;
  const query = String(q || '').trim();
  if (query.length < 2) return res.status(200).json([]);
  if (query.length > 120) return res.status(400).json({ error: 'Query too long' });

  try {
    // One lightweight public page only. No background pagination while typing.
    const publicResults = await searchMinerbaPublicLite(query);
    const relevantPublicResults = rankPublicResults(publicResults, query);
    if (relevantPublicResults.length) return res.status(200).json(relevantPublicResults);

    // Only run the JS-rendered fallback after an explicit Search action and only
    // when the lightweight public response cannot resolve the query.
    try {
      const browserResults = await searchMinerbaV2(query);
      return res.status(200).json(sanitizeBrowserResults(browserResults));
    } catch (browserError) {
      console.warn('Minerba browser fallback unavailable', browserError);
      return res.status(200).json([]);
    }
  } catch (publicError) {
    console.warn('Minerba public API search failed, using browser fallback', publicError);
    try {
      const browserResults = await searchMinerbaV2(query);
      return res.status(200).json(sanitizeBrowserResults(browserResults));
    } catch (browserError) {
      console.error('Minerba search failed', browserError);
      return res.status(502).json({ error: 'Gagal mengambil data publik MinerbaOne.' });
    }
  }
}
