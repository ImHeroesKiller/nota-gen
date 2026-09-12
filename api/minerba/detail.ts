import { minerbaCors } from '../../server/minerbaHttp.js';
import { getMinerbaDetailPublicV2 } from '../../server/minerbaDetailPublic.js';

const browserFallback = async (kode: string) => {
  const { getMinerbaDetail } = await import('../../server/minerba.js');
  return getMinerbaDetail(kode);
};

export default async function handler(req: any, res: any) {
  minerbaCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const raw = Array.isArray(req.query?.kode) ? req.query.kode[0] : req.query?.kode;
  const kode = String(raw || '').trim();
  if (!kode) return res.status(400).json({ error: 'Parameter kode wajib diisi.' });
  if (!/^[A-Za-z0-9._-]{1,64}$/.test(kode)) return res.status(400).json({ error: 'Kode badan usaha tidak valid.' });

  try {
    // Normal path: public JSON only. Chromium/Puppeteer stays unloaded unless the
    // public detail adapter cannot resolve the company selected by the user.
    const publicDetail = await getMinerbaDetailPublicV2(kode);
    if (publicDetail) return res.status(200).json(publicDetail);

    try {
      const browserDetail = await browserFallback(kode);
      if (!browserDetail) return res.status(404).json({ error: 'Tidak ada data.' });
      return res.status(200).json(browserDetail);
    } catch (browserError) {
      console.warn('Minerba detail browser fallback unavailable', browserError);
      return res.status(404).json({ error: 'Tidak ada data.' });
    }
  } catch (publicError) {
    console.warn('Minerba public detail API failed, using browser fallback', publicError);
    try {
      const browserDetail = await browserFallback(kode);
      if (!browserDetail) return res.status(404).json({ error: 'Tidak ada data.' });
      return res.status(200).json(browserDetail);
    } catch (browserError) {
      console.error('Minerba detail failed', browserError);
      return res.status(502).json({ error: 'Gagal mengambil detail publik MinerbaOne.' });
    }
  }
}
