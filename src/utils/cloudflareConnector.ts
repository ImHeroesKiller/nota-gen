// Cloudflare Worker + D1 Connector
// User perlu deploy worker sendiri ke Cloudflare, lalu masukkan URL & API key di settings

export interface CloudflareConfig {
  workerUrl: string;
  apiKey: string;
}

export interface DocumentRecord {
  id?: number;
  doc_number: string;
  doc_type: string;
  title: string;
  description: string;
  reference: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentRegistryResponse {
  success: boolean;
  data?: DocumentRecord[] | DocumentRecord;
  error?: string;
  message?: string;
}

// SQL Schema untuk D1
export const D1_SCHEMA = `
CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  doc_number TEXT UNIQUE NOT NULL,
  doc_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  reference TEXT DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_doc_number ON documents(doc_number);
CREATE INDEX IF NOT EXISTS idx_doc_type ON documents(doc_type);
CREATE INDEX IF NOT EXISTS idx_created_at ON documents(created_at);
`;

// Cloudflare Worker code template (untuk di-deploy user)
export const WORKER_CODE_TEMPLATE = `
// === Cloudflare Worker Code ===
// Deploy ini ke Cloudflare Workers dengan binding D1 database bernama "DB"

export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // Test endpoint - no auth required for debugging
    if (path === '/test' && request.method === 'GET') {
      return Response.json({ 
        success: true, 
        message: 'Worker is running!',
        timestamp: new Date().toISOString(),
        hasDB: !!env.DB,
        hasAPIKey: !!env.API_KEY
      }, { headers: corsHeaders });
    }

    // API Key check for all other endpoints
    const apiKey = request.headers.get('X-API-Key');
    if (!apiKey || apiKey !== env.API_KEY) {
      return Response.json({ 
        success: false, 
        error: 'Unauthorized - Invalid or missing API Key' 
      }, { status: 401, headers: corsHeaders });
    }

    try {
      // GET /documents - List all
      if (path === '/documents' && request.method === 'GET') {
        const results = await env.DB.prepare('SELECT * FROM documents ORDER BY created_at DESC LIMIT 100').all();
        return Response.json({ success: true, data: results.results }, { headers: corsHeaders });
      }

      // GET /documents/:id
      if (path.match(/^\\/documents\\/\\d+$/) && request.method === 'GET') {
        const id = path.split('/').pop();
        const result = await env.DB.prepare('SELECT * FROM documents WHERE id = ?').bind(id).first();
        return Response.json({ success: true, data: result }, { headers: corsHeaders });
      }

      // POST /documents - Create
      if (path === '/documents' && request.method === 'POST') {
        const body = await request.json();
        const result = await env.DB.prepare(
          'INSERT INTO documents (doc_number, doc_type, title, description, reference) VALUES (?, ?, ?, ?, ?)'
        ).bind(body.doc_number, body.doc_type, body.title, body.description || '', body.reference || '').run();
        return Response.json({ success: true, data: { id: result.meta.last_row_id }, message: 'Created' }, { headers: corsHeaders });
      }

      // PUT /documents/:id - Update
      if (path.match(/^\\/documents\\/\\d+$/) && request.method === 'PUT') {
        const id = path.split('/').pop();
        const body = await request.json();
        await env.DB.prepare(
          'UPDATE documents SET doc_number=?, doc_type=?, title=?, description=?, reference=?, updated_at=CURRENT_TIMESTAMP WHERE id=?'
        ).bind(body.doc_number, body.doc_type, body.title, body.description || '', body.reference || '', id).run();
        return Response.json({ success: true, message: 'Updated' }, { headers: corsHeaders });
      }

      // DELETE /documents/:id
      if (path.match(/^\\/documents\\/\\d+$/) && request.method === 'DELETE') {
        const id = path.split('/').pop();
        await env.DB.prepare('DELETE FROM documents WHERE id = ?').bind(id).run();
        return Response.json({ success: true, message: 'Deleted' }, { headers: corsHeaders });
      }

      // POST /setup - Initialize database
      if (path === '/setup' && request.method === 'POST') {
        await env.DB.exec(\`${D1_SCHEMA}\`);
        return Response.json({ success: true, message: 'Database initialized' }, { headers: corsHeaders });
      }

      return Response.json({ success: false, error: 'Not found - Path: ' + path }, { status: 404, headers: corsHeaders });
    } catch (err) {
      console.error('Worker error:', err);
      return Response.json({ 
        success: false, 
        error: err.message || 'Internal server error',
        stack: err.stack 
      }, { status: 500, headers: corsHeaders });
    }
  }
};
`;

class CloudflareConnector {
  private config: CloudflareConfig | null = null;

  constructor() {
    this.loadConfig();
  }

  private loadConfig() {
    const saved = localStorage.getItem('cloudflare_config');
    if (saved) {
      try {
        this.config = JSON.parse(saved);
      } catch {
        this.config = null;
      }
    }
  }

  saveConfig(config: CloudflareConfig) {
    this.config = config;
    localStorage.setItem('cloudflare_config', JSON.stringify(config));
  }

  getConfig(): CloudflareConfig | null {
    return this.config;
  }

  clearConfig() {
    this.config = null;
    localStorage.removeItem('cloudflare_config');
  }

  isConfigured(): boolean {
    return !!this.config?.workerUrl && !!this.config?.apiKey;
  }

  private async request(endpoint: string, method: string = 'GET', body?: unknown): Promise<DocumentRegistryResponse> {
    if (!this.config) {
      throw new Error('Cloudflare belum dikonfigurasi');
    }

    // Bersihkan URL - hapus trailing slash dan spasi
    const cleanBaseUrl = this.config.workerUrl.trim().replace(/\/+$/, '');
    const url = `${cleanBaseUrl}${endpoint}`;
    
    console.log('Cloudflare Request:', { url, method, endpoint });
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-API-Key': this.config.apiKey,
    };

    const options: RequestInit = { method, headers };
    if (body) {
      options.body = JSON.stringify(body);
    }

    let response: Response;
    try {
      response = await fetch(url, options);
    } catch (err) {
      throw new Error(`Gagal terhubung ke Cloudflare Worker: ${err instanceof Error ? err.message : 'Unknown error'}.\nURL: ${url}\nPastikan URL Worker benar dan Worker aktif.`);
    }

    const responseText = await response.text();
    console.log('Cloudflare Response:', { status: response.status, text: responseText.substring(0, 200) });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${responseText.substring(0, 200)}\n\nURL: ${url}`);
    }

    let data: DocumentRegistryResponse;
    try {
      data = JSON.parse(responseText);
    } catch (err) {
      console.error('Response dari Worker bukan JSON:', responseText);
      throw new Error(`Response tidak valid (bukan JSON). Response: "${responseText.substring(0, 100)}..."`);
    }

    if (!data.success) {
      throw new Error(data.error || 'Request gagal');
    }

    return data;
  }

  // Setup database
  async setup(): Promise<DocumentRegistryResponse> {
    return this.request('/setup', 'POST');
  }

  // Get all documents
  async getDocuments(): Promise<DocumentRecord[]> {
    const res = await this.request('/documents');
    return (res.data as DocumentRecord[]) || [];
  }

  // Get single document
  async getDocument(id: number): Promise<DocumentRecord | null> {
    const res = await this.request(`/documents/${id}`);
    return (res.data as DocumentRecord) || null;
  }

  // Create document
  async createDocument(doc: Omit<DocumentRecord, 'id' | 'created_at' | 'updated_at'>): Promise<DocumentRecord> {
    const res = await this.request('/documents', 'POST', doc);
    return { ...doc, id: (res.data as { id: number }).id, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  }

  // Update document
  async updateDocument(id: number, doc: Omit<DocumentRecord, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    await this.request(`/documents/${id}`, 'PUT', doc);
  }

  // Delete document
  async deleteDocument(id: number): Promise<void> {
    await this.request(`/documents/${id}`, 'DELETE');
  }

  // Generate next document number
  async generateDocNumber(prefix: string, type: string): Promise<string> {
    const docs = await this.getDocuments();
    const sameTypeDocs = docs.filter(d => d.doc_type === type && d.doc_number.startsWith(prefix));
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    
    let maxNum = 0;
    sameTypeDocs.forEach(d => {
      const match = d.doc_number.match(/\/(\d+)\/(\d{4})$/);
      if (match && Number(match[2]) === year) {
        maxNum = Math.max(maxNum, Number(match[1]));
      }
    });

    const nextNum = String(maxNum + 1).padStart(4, '0');
    return `${prefix}/${nextNum}/PAY/${month}/${year}`;
  }
}

export const cloudflareConnector = new CloudflareConnector();
