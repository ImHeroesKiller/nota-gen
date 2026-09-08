# Panduan Deploy Cloudflare Worker + D1 Database

## 🔴 Masalah Anda
Error: `HTTP 404: The page could not be found NOT_FOUND`

Ini berarti Worker **belum di-deploy** atau **ada error di code**.

---

## 📋 Langkah-langkah Deploy (WAJIB IKUTI SEMUA)

### Step 1: Login ke Cloudflare
1. Buka https://dash.cloudflare.com
2. Login dengan akun Anda

### Step 2: Buat D1 Database
1. Di sidebar kiri, klik **"Workers & Pages"**
2. Klik tab **"D1 SQL Database"**
3. Klik **"Create database"**
4. Nama database: `perada-documents` (atau bebas)
5. Klik **"Create database"**
6. **CATAT** nama database ini (akan dipakai di Step 4)

### Step 3: Buat Worker
1. Di sidebar kiri, klik **"Workers & Pages"**
2. Klik **"Create application"**
3. Klik **"Create Worker"**
4. Nama worker: `documents-api` (atau bebas)
5. Klik **"Deploy"** (deploy dulu yang default)
6. Setelah deploy, klik **"Edit code"**

### Step 4: Copy-Paste Kode Worker
**HAPUS SEMUA** kode yang ada di editor, lalu **COPY-PASTE** kode ini:

```javascript
export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // Test endpoint - no auth required
    if (path === '/test' && request.method === 'GET') {
      return Response.json({ 
        success: true, 
        message: 'Worker is running!',
        timestamp: new Date().toISOString(),
        hasDB: !!env.DB,
        hasAPIKey: !!env.API_KEY
      }, { headers: corsHeaders });
    }

    // API Key check
    const apiKey = request.headers.get('X-API-Key');
    if (!apiKey || apiKey !== env.API_KEY) {
      return Response.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401, headers: corsHeaders });
    }

    try {
      // GET /documents
      if (path === '/documents' && request.method === 'GET') {
        const results = await env.DB.prepare('SELECT * FROM documents ORDER BY created_at DESC LIMIT 100').all();
        return Response.json({ success: true, data: results.results }, { headers: corsHeaders });
      }

      // GET /documents/:id
      if (path.match(/^\/documents\/\d+$/) && request.method === 'GET') {
        const id = path.split('/').pop();
        const result = await env.DB.prepare('SELECT * FROM documents WHERE id = ?').bind(id).first();
        return Response.json({ success: true, data: result }, { headers: corsHeaders });
      }

      // POST /documents
      if (path === '/documents' && request.method === 'POST') {
        const body = await request.json();
        const result = await env.DB.prepare(
          'INSERT INTO documents (doc_number, doc_type, title, description, reference) VALUES (?, ?, ?, ?, ?)'
        ).bind(body.doc_number, body.doc_type, body.title, body.description || '', body.reference || '').run();
        return Response.json({ success: true, data: { id: result.meta.last_row_id }, message: 'Created' }, { headers: corsHeaders });
      }

      // PUT /documents/:id
      if (path.match(/^\/documents\/\d+$/) && request.method === 'PUT') {
        const id = path.split('/').pop();
        const body = await request.json();
        await env.DB.prepare(
          'UPDATE documents SET doc_number=?, doc_type=?, title=?, description=?, reference=?, updated_at=CURRENT_TIMESTAMP WHERE id=?'
        ).bind(body.doc_number, body.doc_type, body.title, body.description || '', body.reference || '', id).run();
        return Response.json({ success: true, message: 'Updated' }, { headers: corsHeaders });
      }

      // DELETE /documents/:id
      if (path.match(/^\/documents\/\d+$/) && request.method === 'DELETE') {
        const id = path.split('/').pop();
        await env.DB.prepare('DELETE FROM documents WHERE id = ?').bind(id).run();
        return Response.json({ success: true, message: 'Deleted' }, { headers: corsHeaders });
      }

      // POST /setup - Initialize database
      if (path === '/setup' && request.method === 'POST') {
        await env.DB.exec(`
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
        `);
        return Response.json({ success: true, message: 'Database initialized' }, { headers: corsHeaders });
      }

      return Response.json({ success: false, error: 'Not found' }, { status: 404, headers: corsHeaders });
    } catch (err) {
      return Response.json({ success: false, error: err.message }, { status: 500, headers: corsHeaders });
    }
  }
};
```

7. Klik **"Deploy"** di pojok kanan atas
8. Tunggu sampai muncul "Successfully deployed"

### Step 5: Bind D1 Database ke Worker
1. Di halaman Worker, klik tab **"Settings"**
2. Scroll ke bagian **"Bindings"**
3. Klik **"Add binding"**
4. Pilih type: **"D1 Database"**
5. Variable name: **`DB`** (HARUS tepat seperti ini, case-sensitive!)
6. D1 database: Pilih database yang dibuat di Step 2
7. Klik **"Save"**

### Step 6: Set API Key
1. Masih di tab **"Settings"**
2. Scroll ke bagian **"Variables"**
3. Klik **"Add variable"**
4. Type: **"Secret"**
5. Name: **`API_KEY`** (HARUS tepat seperti ini)
6. Value: Masukkan API key yang Anda pakai di aplikasi (contoh: `my-secret-key-123`)
7. Klik **"Save"**

### Step 7: Test Worker
Buka URL ini di browser:
```
https://documents-api.indosatmobileagent.workers.dev/test
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Worker is running!",
  "timestamp": "2026-...",
  "hasDB": true,
  "hasAPIKey": true
}
```

Jika `hasDB: false` → Ulangi Step 5
Jika `hasAPIKey: false` → Ulangi Step 6
Jika masih 404 → Worker belum di-deploy, ulangi Step 4

### Step 8: Konfigurasi di Aplikasi
Di Document Registry:
- **Worker URL:** `https://documents-api.indosatmobileagent.workers.dev`
- **API Key:** `my-secret-key-123` (sama dengan yang di-set di Step 6)

Klik **"Test Koneksi"** → Harus muncul "✓ Worker aktif dan terkonfigurasi dengan benar!"

### Step 9: Initialize Database
Klik tombol **"Init Database"** untuk membuat tabel.

---

## 🔍 Troubleshooting

### Error 404 "The page could not be found"
**Penyebab:** Worker belum di-deploy atau ada error di code
**Solusi:**
- Pastikan sudah klik "Deploy" di Step 4
- Cek tab "Logs" di Worker untuk lihat error
- Re-deploy Worker

### Error "hasDB: false"
**Penyebab:** D1 database belum di-bind
**Solusi:** Ulangi Step 5

### Error "hasAPIKey: false"
**Penyebab:** Environment variable API_KEY belum di-set
**Solusi:** Ulangi Step 6

### Error "Unauthorized"
**Penyebab:** API Key di aplikasi tidak sama dengan di Worker
**Solusi:** Pastikan API Key di aplikasi sama persis dengan yang di-set di Step 6

---

## ✅ Checklist Final

- [ ] D1 Database sudah dibuat
- [ ] Worker sudah di-deploy dengan kode di atas
- [ ] D1 Database sudah di-bind dengan nama `DB`
- [ ] Environment variable `API_KEY` sudah di-set
- [ ] Test endpoint `/test` mengembalikan JSON valid
- [ ] Worker URL di aplikasi benar (tanpa trailing slash)
- [ ] API Key di aplikasi sama dengan di Worker
- [ ] Sudah klik "Init Database"

---

## 📞 Butuh Bantuan?

Jika masih error setelah mengikuti semua langkah:
1. Screenshot error dari browser console (F12 → Console)
2. Screenshot response dari `/test` endpoint
3. Screenshot Worker Settings → Bindings
4. Screenshot Worker Settings → Variables
