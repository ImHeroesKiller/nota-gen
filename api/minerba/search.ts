import { minerbaCors, searchMinerba } from '../../server/minerba';

export default async function handler(req: any, res: any) {
  minerbaCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const q = Array.isArray(req.query?.q) ? req.query.q[0] : req.query?.q;
  const query = String(q || '').trim();
  if (query.length < 2) return res.status(200).json([]);
  if (query.length > 120) return res.status(400).json({ error: 'Query too long' });

  try {
    const results = await searchMinerba(query);
    return res.status(200).json(results);
  } catch (error) {
    console.error('Minerba search failed', error);
    return res.status(502).json({ error: 'Gagal mengambil data publik MinerbaOne.' });
  }
}
