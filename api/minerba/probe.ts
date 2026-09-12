const TARGETS: Record<string, string> = {
  list: 'https://minerbaone.esdm.go.id/publik/badan-usaha',
  detail: 'https://minerbaone.esdm.go.id/publik/badan-usaha/14357/detail',
  bundle: 'https://minerbaone.esdm.go.id/assets/index-bf6e78b7.js',
  apiSearch: 'https://minerbaone.esdm.go.id/api/common/v2/badan-usaha?search=3G%20TRUST&page=1&limit=25',
  apiDetail: 'https://minerbaone.esdm.go.id/api/common/v2/badan-usaha/14357',
  apiDireksi: 'https://minerbaone.esdm.go.id/api/common/v3/badan-usaha/14357/direksi',
  apiSaham: 'https://minerbaone.esdm.go.id/api/common/v3/badan-usaha/14357/pemegang-saham',
  apiIzin: 'https://minerbaone.esdm.go.id/api/common/v3/badan-usaha/14357/izin',
  apiWiup: 'https://minerbaone.esdm.go.id/api/perizinan/v2/badan-usaha/14357/wiup',
};

const snippets = (text: string, pattern: RegExp, max = 60) => {
  const found: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) && found.length < max) {
    const start = Math.max(0, match.index - 300);
    const end = Math.min(text.length, match.index + match[0].length + 500);
    found.push(text.slice(start, end));
  }
  return found;
};

export default async function handler(req: any, res: any) {
  const target = String(req.query?.target || 'list');
  const url = TARGETS[target] || TARGETS.list;
  try {
    const isApi = target.startsWith('api');
    const response = await fetch(url, {
      redirect: 'follow',
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
        accept: isApi ? 'application/json, text/plain, */*' : target === 'bundle' ? '*/*' : 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'accept-language': 'id-ID,id;q=0.9,en-US;q=0.7,en;q=0.6',
        ...(isApi ? { 'x-api-key': 'qwe' } : {}),
        referer: 'https://minerbaone.esdm.go.id/publik/badan-usaha',
      },
    });
    const text = await response.text();
    const scripts = [...text.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)].map((m) => m[1]).slice(0, 30);
    const links = [...text.matchAll(/<link[^>]+href=["']([^"']+)["']/gi)].map((m) => m[1]).slice(0, 30);
    const routeSnippets = target === 'bundle'
      ? [
          ...snippets(text, /badan-usaha/gi, 30),
          ...snippets(text, /kode_wiup/gi, 10),
          ...snippets(text, /nomor_izin/gi, 10),
        ].slice(0, 50)
      : [];
    const configSnippets = target === 'bundle'
      ? [
          ...snippets(text, /cmn\s*:/gi, 20),
          ...snippets(text, /prz\s*:/gi, 20),
          ...snippets(text, /j0\s*=/gi, 20),
          ...snippets(text, /https:\/\/[A-Za-z0-9._:/?=&-]+/gi, 30),
        ].slice(0, 80)
      : [];
    return res.status(200).json({
      upstreamStatus: response.status,
      url: response.url,
      contentType: response.headers.get('content-type'),
      length: text.length,
      sample: text.slice(0, isApi ? 12000 : target === 'bundle' ? 300 : 3000),
      scripts,
      links,
      routeSnippets,
      configSnippets,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || String(error) });
  }
}
