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
  file_key?: string; // R2 storage key
  file_name?: string;
  file_size?: number;
  file_type?: string;
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
  file_key TEXT DEFAULT '',
  file_name TEXT DEFAULT '',
  file_size INTEGER DEFAULT 0,
  file_type TEXT DEFAULT '',
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
// Deploy ini ke Cloudflare Workers dengan binding:
// - D1 database bernama "DB"
// - R2 bucket bernama "DOCS"

export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
      'Access-Control-Max-Age': '86400',
    };

    // Handle CORS preflight - HARUS return 200 OK
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: corsHeaders });
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
        hasR2: !!env.DOCS,
        hasAPIKey: !!env.API_KEY
      }, { headers: corsHeaders });
    }

    // Debug endpoint - test R2 and DB operations
    if (path === '/debug' && request.method === 'GET') {
      const results = {
        timestamp: new Date().toISOString(),
        hasDB: !!env.DB,
        hasR2: !!env.DOCS,
        hasAPIKey: !!env.API_KEY,
        dbTest: null,
        r2Test: null,
      };
      
      // Test DB
      if (env.DB) {
        try {
          const test = await env.DB.prepare('SELECT 1 as test').first();
          results.dbTest = { success: true, result: test };
        } catch (e) {
          results.dbTest = { success: false, error: e.message };
        }
      }
      
      // Test R2
      if (env.DOCS) {
        try {
          const testKey = 'debug/test.txt';
          await env.DOCS.put(testKey, 'test', { httpMetadata: { contentType: 'text/plain' } });
          const obj = await env.DOCS.get(testKey);
          await env.DOCS.delete(testKey);
          results.r2Test = { success: true, message: 'R2 read/write OK' };
        } catch (e) {
          results.r2Test = { success: false, error: e.message };
        }
      }
      
      return Response.json({ success: true, data: results }, { headers: corsHeaders });
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
          'INSERT INTO documents (doc_number, doc_type, title, description, reference, file_key, file_name, file_size, file_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        ).bind(
          body.doc_number, 
          body.doc_type, 
          body.title, 
          body.description || '', 
          body.reference || '',
          body.file_key || '',
          body.file_name || '',
          body.file_size || 0,
          body.file_type || ''
        ).run();
        return Response.json({ success: true, data: { id: result.meta.last_row_id }, message: 'Created' }, { headers: corsHeaders });
      }

      // PUT /documents/:id - Update
      if (path.match(/^\\/documents\\/\\d+$/) && request.method === 'PUT') {
        const id = path.split('/').pop();
        const body = await request.json();
        await env.DB.prepare(
          'UPDATE documents SET doc_number=?, doc_type=?, title=?, description=?, reference=?, file_key=?, file_name=?, file_size=?, file_type=?, updated_at=CURRENT_TIMESTAMP WHERE id=?'
        ).bind(
          body.doc_number, 
          body.doc_type, 
          body.title, 
          body.description || '', 
          body.reference || '',
          body.file_key || '',
          body.file_name || '',
          body.file_size || 0,
          body.file_type || '',
          id
        ).run();
        return Response.json({ success: true, message: 'Updated' }, { headers: corsHeaders });
      }

      // DELETE /documents/:id
      if (path.match(/^\\/documents\\/\\d+$/) && request.method === 'DELETE') {
        const id = path.split('/').pop();
        
        // Get document to delete file from R2
        const doc = await env.DB.prepare('SELECT file_key FROM documents WHERE id = ?').bind(id).first();
        if (doc && doc.file_key && env.DOCS) {
          try {
            await env.DOCS.delete(doc.file_key);
          } catch (e) {
            console.error('Failed to delete file from R2:', e);
          }
        }
        
        await env.DB.prepare('DELETE FROM documents WHERE id = ?').bind(id).run();
        return Response.json({ success: true, message: 'Deleted' }, { headers: corsHeaders });
      }

      // POST /upload/:id/:filename - Upload file to R2 (filename in URL to avoid CORS issues)
      if (path.match(/^\\/upload\\/\\d+\\/.+$/) && request.method === 'POST') {
        try {
          const parts = path.split('/');
          const id = parts[2];
          const fileName = decodeURIComponent(parts.slice(3).join('/')) || 'document.pdf';
          const contentType = request.headers.get('Content-Type') || 'application/octet-stream';
          
          // Read file from request body
          const fileBuffer = await request.arrayBuffer();
          
          // Generate unique key
          const timestamp = Date.now();
          const fileKey = 'docs/' + id + '/' + timestamp + '.pdf';
          
          // Upload to R2
          if (!env.DOCS) {
            return Response.json({ success: false, error: 'R2 bucket not configured. Please bind R2 bucket with variable name "DOCS"' }, { status: 500, headers: corsHeaders });
          }
          
          await env.DOCS.put(fileKey, fileBuffer, {
            httpMetadata: { contentType: contentType }
          });
          
          // Update document with file info
          await env.DB.prepare(
            'UPDATE documents SET file_key=?, file_name=?, file_size=?, file_type=?, updated_at=CURRENT_TIMESTAMP WHERE id=?'
          ).bind(
            fileKey,
            fileName,
            fileBuffer.byteLength,
            contentType,
            id
          ).run();
          
          return Response.json({ 
            success: true, 
            message: 'File uploaded successfully',
            data: { fileKey: fileKey, size: fileBuffer.byteLength, fileName: fileName }
          }, { headers: corsHeaders });
        } catch (uploadErr) {
          console.error('Upload error:', uploadErr);
          return Response.json({ 
            success: false, 
            error: 'Upload failed: ' + (uploadErr.message || 'Unknown error'),
            details: uploadErr.toString()
          }, { status: 500, headers: corsHeaders });
        }
      }

      // GET /download/:id - Download file from R2
      if (path.match(/^\\/download\\/\\d+$/) && request.method === 'GET') {
        const id = path.split('/').pop();
        
        const doc = await env.DB.prepare('SELECT file_key, file_name, file_type FROM documents WHERE id = ?').bind(id).first();
        
        if (!doc || !doc.file_key) {
          return Response.json({ success: false, error: 'File not found' }, { status: 404, headers: corsHeaders });
        }
        
        if (!env.DOCS) {
          return Response.json({ success: false, error: 'R2 bucket not configured' }, { status: 500, headers: corsHeaders });
        }
        
        const object = await env.DOCS.get(doc.file_key);
        
        if (!object) {
          return Response.json({ success: false, error: 'File not found in storage' }, { status: 404, headers: corsHeaders });
        }
        
        return new Response(object.body, {
          headers: {
            ...corsHeaders,
            'Content-Type': doc.file_type || 'application/pdf',
            'Content-Disposition': 'inline; filename="' + doc.file_name + '"',
          }
        });
      }

      // POST /setup - Initialize database
      if (path === '/setup' && request.method === 'POST') {
        const schema = [
          'CREATE TABLE IF NOT EXISTS documents (',
          '  id INTEGER PRIMARY KEY AUTOINCREMENT,',
          '  doc_number TEXT UNIQUE NOT NULL,',
          '  doc_type TEXT NOT NULL,',
          '  title TEXT NOT NULL,',
          "  description TEXT DEFAULT '',",
          "  reference TEXT DEFAULT '',",
          "  file_key TEXT DEFAULT '',",
          "  file_name TEXT DEFAULT '',",
          '  file_size INTEGER DEFAULT 0,',
          "  file_type TEXT DEFAULT '',",
          '  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,',
          '  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP',
          ');',
          'CREATE INDEX IF NOT EXISTS idx_doc_number ON documents(doc_number);',
          'CREATE INDEX IF NOT EXISTS idx_doc_type ON documents(doc_type);',
          'CREATE INDEX IF NOT EXISTS idx_created_at ON documents(created_at);'
        ].join(' ');
        await env.DB.exec(schema);
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
      response = await fetch(url, { ...options, mode: 'cors' });
    } catch (err) {
      throw new Error(`Gagal terhubung ke Cloudflare Worker: ${err instanceof Error ? err.message : 'Unknown error'}.\nURL: ${url}\n\nKemungkinan penyebab:\n1. CORS error - Worker perlu di-deploy ulang dengan kode terbaru\n2. Worker URL salah\n3. Worker belum aktif\n\nSolusi: Copy ulang kode Worker dari tombol "Kode Worker" dan deploy ulang.`);
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

  // Upload file to R2
  async uploadFile(id: number, file: File): Promise<{ fileKey: string; size: number }> {
    if (!this.config) {
      throw new Error('Cloudflare belum dikonfigurasi');
    }

    // Include filename in URL path to avoid CORS header issues
    const fileName = encodeURIComponent(file.name);
    const url = `${this.config.workerUrl.replace(/\/+$/, '')}/upload/${id}/${fileName}`;
    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
        'X-API-Key': this.config.apiKey,
      },
      body: file,
    });

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error(`Response tidak valid: ${responseText.substring(0, 100)}`);
    }

    if (!data.success) {
      throw new Error(data.error || 'Upload gagal');
    }

    return data.data;
  }

  // Get download URL
  getDownloadUrl(id: number): string {
    if (!this.config) {
      throw new Error('Cloudflare belum dikonfigurasi');
    }
    return `${this.config.workerUrl.replace(/\/+$/, '')}/download/${id}`;
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
