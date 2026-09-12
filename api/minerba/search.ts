import { minerbaCors } from '../../server/minerba.js';
import { searchMinerbaPublic } from '../../server/minerbaPublic.js';
import { searchMinerbaV2 } from '../../server/minerbaSearchV2.js';

export default async function handler(req: any, res: any) {
  minerbaCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const q = Array.isArray(req.query?.q) ? req.query.q[0] : req.query?.q;
  const query = String(q || '').trim();
  if (query.length < 2) return res.status(200).json([]);
  if (query.length > 120) return res.status(400).json({ error: 'Query too long' });

  try {
    const publicResults = await searchMinerbaPublic(query);
    if (publicResults.length) return res.status(200).json(publicResults);

    // Public API returned a valid empty result. Keep the requested JS-rendered
    // page fallback, but do not turn a browser-runtime failure into a 502.
    try {
      const browserResults = await searchMinerbaV2(query);
      return res.status(200).json(browserResults);
    } catch (browserError) {
      console.warn('Minerba browser fallback unavailable', browserError);
      return res.status(200).json([]);
    }
  } catch (publicError) {
    console.warn('Minerba public API search failed, using browser fallback', publicError);
    try {
      const browserResults = await searchMinerbaV2(query);
      return res.status(200).json(browserResults);
    } catch (browserError) {
      console.error('Minerba search failed', browserError);
      return res.status(502).json({ error: 'Gagal mengambil data publik MinerbaOne.' });
    }
  }
}
