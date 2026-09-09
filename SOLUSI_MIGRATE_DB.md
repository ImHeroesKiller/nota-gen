# Solusi Error "no such column: file_key"

## 🔴 Masalah

Error yang muncul:
```
HTTP 500 Error Detail: D1_ERROR: no such column: file_key at offset 7: SQLITE_ERROR
```

## 💡 Penyebab

Database D1 sudah ada tapi **belum punya kolom-kolom baru** yang ditambahkan di versi terbaru:
- `file_key`
- `file_name`
- `file_size`
- `file_type`

Ini terjadi karena database dibuat dengan schema lama sebelum fitur upload PDF ditambahkan.

## ✅ Solusi

### Cara 1: Gunakan Tombol "Migrate DB" (RECOMMENDED) ⭐

1. Buka aplikasi → **Document Registry**
2. Klik tombol **"Setup"** di header
3. Klik tombol **"🔄 Migrate DB"** (warna purple)
4. Tunggu sampai muncul pesan sukses
5. Refresh halaman
6. Error sudah hilang! ✅

**Apa yang dilakukan Migrate DB:**
- Menambahkan kolom `file_key` (TEXT)
- Menambahkan kolom `file_name` (TEXT)
- Menambahkan kolom `file_size` (INTEGER)
- Menambahkan kolom `file_type` (TEXT)
- **TIDAK menghapus data yang sudah ada**
- Aman untuk database yang sudah ada data

### Cara 2: Deploy Ulang Worker + Init Database

1. Buka aplikasi → **Document Registry**
2. Klik tombol **"Kode Worker"** di header
3. Klik **"Copy Semua Kode"**
4. Buka Cloudflare Dashboard → Workers → `documents-api`
5. Klik **"Edit Code"**
6. **Hapus semua** kode lama
7. **Paste** kode baru
8. Klik **"Deploy"**
9. Kembali ke aplikasi
10. Klik tombol **"Setup"**
11. Klik **"Init Database"**
12. Refresh halaman

**Catatan:** Cara ini akan membuat tabel baru. Jika tabel sudah ada, tidak akan menghapus data.

## 🔍 Verifikasi

Setelah migrate, test dengan:
1. Buka detail dokumen
2. Upload file PDF
3. Harusnya berhasil tanpa error!

## 📊 Endpoint Baru di Worker

### POST /migrate
Menambahkan kolom yang missing ke database.

**Response:**
```json
{
  "success": true,
  "message": "Migration completed",
  "results": [
    { "sql": "ALTER TABLE documents ADD COLUMN file_key TEXT DEFAULT ''", "status": "success" },
    { "sql": "ALTER TABLE documents ADD COLUMN file_name TEXT DEFAULT ''", "status": "already_exists" },
    { "sql": "ALTER TABLE documents ADD COLUMN file_size INTEGER DEFAULT 0", "status": "success" },
    { "sql": "ALTER TABLE documents ADD COLUMN file_type TEXT DEFAULT ''", "status": "success" }
  ]
}
```

**Status:**
- `success` = Kolom berhasil ditambahkan
- `already_exists` = Kolom sudah ada (OK, tidak masalah)
- `error` = Ada error (lihat detail di `error` field)

## 🎯 Kapan Harus Migrate?

Migrate diperlukan jika:
- ✅ Error "no such column: file_key" muncul
- ✅ Error "no such column: file_name" muncul
- ✅ Error "no such column: file_size" muncul
- ✅ Error "no such column: file_type" muncul
- ✅ Upload PDF gagal dengan error database
- ✅ Database dibuat sebelum fitur upload PDF ditambahkan

## 🛡️ Keamanan

**Migrate DB aman karena:**
- ✅ Tidak menghapus data yang sudah ada
- ✅ Tidak mengubah data yang sudah ada
- ✅ Hanya menambahkan kolom baru dengan default value
- ✅ Bisa dijalankan berkali-kali (idempotent)
- ✅ Jika kolom sudah ada, akan skip dengan status "already_exists"

## 📝 Technical Details

### Schema Lama (sebelum migrate):
```sql
CREATE TABLE documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  doc_number TEXT UNIQUE NOT NULL,
  doc_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  reference TEXT DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Schema Baru (setelah migrate):
```sql
CREATE TABLE documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  doc_number TEXT UNIQUE NOT NULL,
  doc_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  reference TEXT DEFAULT '',
  file_key TEXT DEFAULT '',        -- BARU
  file_name TEXT DEFAULT '',       -- BARU
  file_size INTEGER DEFAULT 0,     -- BARU
  file_type TEXT DEFAULT '',       -- BARU
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 Langkah-langkah Lengkap

### Step 1: Deploy Ulang Worker (WAJIB)
1. Buka aplikasi → Document Registry
2. Klik "Kode Worker" → "Copy Semua Kode"
3. Deploy ke Cloudflare Worker

### Step 2: Migrate Database
1. Klik "Setup" di header
2. Klik "🔄 Migrate DB"
3. Tunggu sampai selesai

### Step 3: Test
1. Buka detail dokumen
2. Upload file PDF
3. Harusnya berhasil!

## 💡 Tips

- **Selalu deploy Worker terbaru** sebelum migrate
- **Backup data** sebelum migrate (jaga-jaga)
- **Test di staging** dulu jika ada environment staging
- **Check logs** di Cloudflare jika ada error

## 📞 Butuh Bantuan?

Jika masih error setelah migrate:
1. Screenshot error message
2. Screenshot hasil "🔍 Debug"
3. Screenshot hasil "🔄 Migrate DB"
4. Hubungi IT Support

---

**Dibuat:** 2026-01-09  
**Versi:** 1.0  
**Status:** Production Ready ✅
