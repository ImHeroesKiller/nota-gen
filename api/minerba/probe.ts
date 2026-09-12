const BASE = 'https://minerbaone.esdm.go.id';
const BUNDLE = `${BASE}/assets/index-bf6e78b7.js`;
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36';

const headers = {
  'user-agent': UA,
  accept: 'application/json, text/plain, */*',
  'accept-language': 'id-ID,id;q=0.9,en-US;q=0.7,en;q=0.6',
  'x-api-key': 'qwe',
  referer: `${BASE}/publik/badan-usaha`,
};

const brief = async (url: string) => {
  try {
    const response = await fetch(url, { redirect: 'follow', headers });
    const text = await response.text();
    return { url, status: response.status, contentType: response.headers.get('content-type'), sample: text.slice(0, 5000) };
  } catch (error: any) {
    return { url, status: 0, sample: error?.message || String(error) };
  }
};

const contextAround = (text: string, needle: string, before = 1200, after = 1800) => {
  const index = text.toLowerCase().indexOf(needle.toLowerCase());
  if (index < 0) return '';
  return text.slice(Math.max(0, index - before), Math.min(text.length, index + needle.length + after));
};

export default async function handler(req: any, res: any) {
  const target = String(req.query?.target || 'variants');

  if (target === 'variants') {
    const q = encodeURIComponent('3G TRUST');
    const urls = [
      `${BASE}/api/common/v2/badan-usaha?search=${q}`,
      `${BASE}/api/common/v2/badan-usaha?search=${q}&page=1`,
      `${BASE}/api/common/v2/badan-usaha?search=${q}&page=1&per_page=25`,
      `${BASE}/api/common/v2/badan-usaha?search=${q}&page=1&page_size=25`,
      `${BASE}/api/common/v2/badan-usaha?search=${q}&page=1&length=25`,
      `${BASE}/api/common/v2/badan-usaha?filter[nama_badan_usaha]=${q}&page=1`,
      `${BASE}/api/common/v2/badan-usaha?q=${q}&page=1`,
      `${BASE}/api/common/v2/badan-usaha?nama_badan_usaha=${q}&page=1`,
    ];
    const results = [];
    for (const url of urls) results.push(await brief(url));
    return res.status(200).json({ results });
  }

  if (target === 'public-route') {
    const response = await fetch(BUNDLE, { headers: { ...headers, accept: '*/*' } });
    const text = await response.text();
    const needles = [
      '/publik/badan-usaha',
      'publik-badan-usaha',
      'nama_badan_usaha',
      'nomor_izin',
      'kode_wiup',
      'getListBadanUsaha',
    ];
    return res.status(200).json({
      status: response.status,
      contexts: Object.fromEntries(needles.map((needle) => [needle, contextAround(text, needle)])),
    });
  }

  return res.status(400).json({ error: 'Unknown target' });
}
