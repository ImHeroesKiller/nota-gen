const BASE = 'https://minerbaone.esdm.go.id';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36';
const headers = {
  'user-agent': UA,
  accept: '*/*',
  'accept-language': 'id-ID,id;q=0.9,en-US;q=0.7,en;q=0.6',
  'x-api-key': 'qwe',
  referer: `${BASE}/publik/badan-usaha`,
};

const TARGETS: Record<string, string> = {
  listAsset: `${BASE}/assets/index-7f3a3e16.js`,
  detailAsset: `${BASE}/assets/index-67e3630e.js`,
  sharedAsset: `${BASE}/assets/badanUsaha-df85cf38.js`,
};

const contexts = (text: string) => {
  const needles = ['getListBadanUsaha', 'listBadanUsaha', 'badan-usaha', 'search', 'filter', 'page', 'limit', 'kode_badan_usaha', 'nomor_izin', 'kode_wiup', 'direksi', 'pemegang-saham', 'izin', '/api/'];
  const out: Record<string, string[]> = {};
  for (const needle of needles) {
    const values: string[] = [];
    let startAt = 0;
    while (values.length < 8) {
      const index = text.toLowerCase().indexOf(needle.toLowerCase(), startAt);
      if (index < 0) break;
      values.push(text.slice(Math.max(0, index - 800), Math.min(text.length, index + needle.length + 1400)));
      startAt = index + needle.length;
    }
    if (values.length) out[needle] = values;
  }
  return out;
};

export default async function handler(req: any, res: any) {
  const target = String(req.query?.target || 'listAsset');
  const url = TARGETS[target];
  if (!url) return res.status(400).json({ error: 'Unknown target' });
  try {
    const response = await fetch(url, { redirect: 'follow', headers });
    const text = await response.text();
    return res.status(200).json({
      upstreamStatus: response.status,
      url,
      length: text.length,
      sample: text.slice(0, 1000),
      contexts: contexts(text),
    });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || String(error) });
  }
}
