# Panduan Setup Cloudflare R2 untuk Document Storage

## 🎯 Tujuan
Setup R2 bucket untuk menyimpan file PDF dokumen yang diupload dari aplikasi Document Registry.

---

## 📋 Langkah-langkah Setup R2

### Step 1: Login ke Cloudflare Dashboard
1. Buka https://dash.cloudflare.com
2. Login dengan akun Anda

### Step 2: Buat R2 Bucket
1. Di sidebar kiri, klik **"R2 Object Storage"**
2. Klik tombol **"Create bucket"**
3. Isi form:
   - **Bucket name:** `perada-docs` (atau nama bebas)
   - **Location:** Pilih **APAC** (Asia Pacific) untuk performa terbaik di Indonesia
   - **Object versioning:** **Disable** (tidak perlu untuk use case ini)
4. Klik **"Create bucket"**

### Step 3: Bind R2 Bucket ke Worker
1. Di sidebar kiri, klik **"Workers & Pages"**
2. Klik Worker Anda: `documents-api`
3. Klik tab **"Settings"**
4. Scroll ke bagian **"Bindings"**
5. Klik **"Add binding"**
6. Isi form:
   - **Variable name:** `DOCS` (HARUS persis seperti ini, case-sensitive!)
   - **R2 Bucket:** Pilih bucket `perada-docs` yang baru dibuat
7. Klik **"Save"**

### Step 4: Deploy Ulang Worker
1. Masih di halaman Worker, klik tab **"Quick edit"** atau **"Edit code"**
2. **HAPUS SEMUA** kode yang ada
3. **COPY-PASTE** kode Worker terbaru dari aplikasi Document Registry
4. Klik **"Deploy"** di pojok kanan atas
5. Tunggu sampai muncul "Successfully deployed"

### Step 5: Test Koneksi
1. Kembali ke aplikasi Document Registry
2. Klik tombol **"Test Koneksi"**
3. Pastikan response menampilkan:
   ```json
   {
     "success": true,
     "message": "Worker is running!",
     "timestamp": "...",
     "hasDB": true,
     "hasR2": true,
     "hasAPIKey": true
   }
   ```
4. Jika `hasR2: true` → R2 sudah ter-bind dengan benar ✓

---

## 🔍 Verifikasi Setup

### Cek di Browser
Buka URL ini:
```
https://documents-api.indosatmobileagent.workers.dev/test
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Worker is running!",
  "timestamp": "2026-01-09T...",
  "hasDB": true,
  "hasR2": true,
  "hasAPIKey": true
}
```

### Cek di Cloudflare Dashboard
1. Buka R2 bucket `perada-docs`
2. Upload file manual untuk test (opsional)
3. Setelah upload dari aplikasi, file akan muncul di R2 dengan path:
   ```
   docs/{document_id}/{timestamp}.pdf
   ```

---

## 🚀 Cara Menggunakan Fitur Upload

### 1. Register Dokumen Baru
- Klik "Register Baru" di Document Registry
- Isi form (nomor, tipe, judul, dll)
- Klik "Register"

### 2. Upload File PDF
- Klik tombol "Lihat Detail" (ikon mata 👁️) di dokumen
- Di modal detail, klik "Upload File PDF"
- Pilih file PDF (max 10MB)
- Tunggu upload selesai

### 3. Download/View PDF
- Buka detail dokumen
- Klik "Download PDF"
- PDF akan terbuka di tab baru browser

### 4. Ganti File
- Buka detail dokumen
- Klik "Ganti File"
- Pilih file PDF baru
- File lama akan otomatis dihapus dari R2

---

## 💰 Biaya Cloudflare R2

### Free Tier (Setiap Bulan):
- ✅ **10 GB** storage
- ✅ **10 juta** Class A operations (upload)
- ✅ **10 juta** Class B operations (download)
- ✅ **Egress (download) GRATIS** tanpa biaya!

### Estimasi untuk PERADA:
Dengan 1000 dokumen PDF (rata-rata 500KB):
- Total storage: ~500MB
- **Biaya: $0** (masih dalam free tier)

Bahkan dengan 10,000 dokumen:
- Total storage: ~5GB
- **Biaya: $0** (masih dalam free tier)

---

## 🛠️ Troubleshooting

### Error "hasR2: false"
**Penyebab:** R2 bucket belum di-bind ke Worker
**Solusi:**
1. Buka Worker Settings → Bindings
2. Pastikan ada binding dengan:
   - Variable name: `DOCS`
   - Type: R2 Bucket
   - Bucket: `perada-docs`

### Error "R2 bucket not configured" saat upload
**Penyebab:** Worker code belum di-update
**Solusi:**
1. Copy ulang kode Worker dari aplikasi
2. Deploy ulang Worker

### Error "File not found in storage" saat download
**Penyebab:** File sudah dihapus dari R2 atau path salah
**Solusi:**
1. Upload ulang file dari detail dokumen
2. Cek di R2 bucket apakah file ada

### Upload gagal / timeout
**Penyebab:** File terlalu besar atau koneksi lambat
**Solusi:**
1. Pastikan file < 10MB
2. Coba compress PDF sebelum upload
3. Gunakan koneksi internet yang stabil

---

## 📊 Monitoring R2 Usage

### Cek di Cloudflare Dashboard:
1. Buka R2 bucket `perada-docs`
2. Tab **"Usage"** untuk lihat:
   - Total storage used
   - Number of objects
   - Bandwidth usage

### Cek File yang Tersimpan:
1. Buka R2 bucket `perada-docs`
2. Tab **"Objects"**
3. Lihat daftar file dengan path: `docs/{id}/{timestamp}.pdf`

---

## 🔐 Keamanan R2

### Akses File:
- File di R2 **TIDAK** bisa diakses langsung via URL publik
- Harus lewat Worker endpoint `/download/:id`
- Worker melakukan autentikasi dengan API Key
- Hanya user yang punya API Key yang bisa download

### Best Practices:
- ✅ Gunakan API Key yang kuat (min 32 karakter)
- ✅ Jangan share API Key ke publik
- ✅ Rotate API Key secara berkala
- ✅ Monitor usage di Cloudflare Dashboard

---

## 📝 Contoh Struktur File di R2

Setelah upload beberapa dokumen, struktur di R2 akan seperti ini:
```
perada-docs/
├── docs/
│   ├── 1/
│   │   └── 1704123456789.pdf
│   ├── 2/
│   │   └── 1704123789012.pdf
│   └── 3/
│       └── 1704124123456.pdf
```

Format: `docs/{document_id}/{timestamp}.pdf`

---

## ✅ Checklist Final

- [ ] R2 bucket `perada-docs` sudah dibuat
- [ ] R2 bucket sudah di-bind ke Worker dengan nama `DOCS`
- [ ] Worker sudah di-deploy ulang dengan kode terbaru
- [ ] Test endpoint `/test` menampilkan `hasR2: true`
- [ ] Bisa upload file PDF dari aplikasi
- [ ] Bisa download/view file PDF dari aplikasi
- [ ] File muncul di R2 bucket setelah upload

---

## 🎉 Selesai!

Setelah semua langkah di atas, fitur upload PDF sudah siap digunakan!

### Fitur yang Tersedia:
✅ Register dokumen dengan nomor otomatis
✅ Upload file PDF ke Cloudflare R2
✅ Download/view file PDF
✅ Ganti file (auto-delete file lama)
✅ Hapus dokumen (auto-delete file dari R2)
✅ Storage gratis 10GB + egress gratis

### Next Steps:
- Train user cara menggunakan fitur upload
- Monitor usage R2 di Cloudflare Dashboard
- Backup strategy (R2 sudah auto-replicate)

---

## 📞 Butuh Bantuan?

Jika masih ada masalah:
1. Screenshot error dari browser console (F12)
2. Screenshot response dari `/test` endpoint
3. Screenshot Worker Settings → Bindings
4. Screenshot R2 bucket → Objects

**Hubungi:** IT Support PERADA GROUP
