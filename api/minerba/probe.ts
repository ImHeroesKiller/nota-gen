const TARGETS: Record<string, string> = {
  list: 'https://minerbaone.esdm.go.id/publik/badan-usaha',
  detail: 'https://minerbaone.esdm.go.id/publik/badan-usaha/14357/detail',
};

export default async function handler(req: any, res: any) {
  const target = String(req.query?.target || 'list');
  const url = TARGETS[target] || TARGETS.list;
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'accept-language': 'id-ID,id;q=0.9,en-US;q=0.7,en;q=0.6',
      },
    });
    const text = await response.text();
    const scripts = [...text.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)].map((m) => m[1]).slice(0, 30);
    const links = [...text.matchAll(/<link[^>]+href=["']([^"']+)["']/gi)].map((m) => m[1]).slice(0, 30);
    return res.status(200).json({
      status: response.status,
      url: response.url,
      contentType: response.headers.get('content-type'),
      length: text.length,
      sample: text.slice(0, 3000),
      scripts,
      links,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || String(error) });
  }
}
