# PERADA Tools - Fitur Baru

## 🎉 4 Fitur Baru Telah Ditambahkan!

Aplikasi PERADA Tools sekarang memiliki **9 tools** yang siap digunakan untuk meningkatkan produktivitas bisnis logistik dan administrasi PERADA GROUP.

---

## 📋 Daftar Lengkap Tools

### 1. **Nota ke PDF** (Blue)
Gabungkan banyak gambar nota ke dalam PDF multi-halaman dengan layout grid.

### 2. **Batch Renamer** (Emerald)
Ganti nama ratusan file sekaligus dengan pola otomatis.

### 3. **PDF Splitter** (Purple)
Pecah PDF besar menjadi beberapa file kecil atau extract halaman tertentu.

### 4. **Label Generator** (Orange)
Generate label pengiriman dengan barcode dan QR code untuk paket.

### 5. **Document Registry** (Teal)
Register dan kelola nomor dokumen/surat dengan Cloudflare D1 database.

### 6. **Invoice Generator** (Green) 🆕
Buat invoice profesional dengan auto-calculate dan export PDF.

**Fitur:**
- Input data invoice (nomor, tanggal, due date, payment terms)
- Data klien (nama, alamat, email, telepon)
- Multiple items dengan auto-calculate total
- Tax rate yang dapat disesuaikan (default 11%)
- Notes dan payment terms
- Export ke PDF profesional
- Format mata uang Rupiah

**Cara Penggunaan:**
1. Isi informasi invoice (nomor, tanggal, due date)
2. Isi data klien
3. Tambahkan items (deskripsi, qty, harga)
4. Sistem akan auto-calculate subtotal, tax, dan total
5. Klik "Generate Invoice PDF"

---

### 7. **Client Database** (Purple) 🆕
Kelola database klien dengan fitur search dan export.

**Fitur:**
- CRUD klien (Create, Read, Update, Delete)
- Data lengkap: nama, company, email, telepon, alamat, NPWP, notes
- Search/filter klien
- Export ke CSV
- Penyimpanan lokal (localStorage)
- Responsive design

**Cara Penggunaan:**
1. Klik "Add Client" untuk menambah klien baru
2. Isi form data klien
3. Klik "Add Client" untuk menyimpan
4. Gunakan search box untuk mencari klien
5. Klik "Export CSV" untuk export data

---

### 8. **Barcode & QR Generator** (Indigo) 🆕
Generate barcode dan QR code untuk tracking dan labeling.

**Fitur:**
- QR Code generator (untuk URL, text, data)
- Code 128 barcode generator
- Adjustable size (100-500px)
- Real-time preview
- Download sebagai PNG
- Support untuk text dan URL

**Cara Penggunaan:**
1. Pilih tipe barcode (QR Code atau Code 128)
2. Masukkan text atau URL
3. Adjust size sesuai kebutuhan
4. Klik "Generate"
5. Klik "Download PNG" untuk menyimpan

**Use Cases:**
- QR Code untuk tracking paket
- Barcode untuk label produk
- QR Code untuk URL website
- Barcode untuk nomor seri

---

### 9. **Delivery Order Generator** (Orange) 🆕
Buat dokumen delivery order profesional untuk pengiriman.

**Fitur:**
- Input data DO (nomor, tanggal, PO number)
- Data penerima (nama, alamat, telepon)
- Multiple items dengan qty dan unit
- Data driver dan kendaraan
- Notes dan tanda tangan
- Export ke PDF profesional
- Format dokumen standar logistik

**Cara Penggunaan:**
1. Isi informasi DO (nomor, tanggal, PO number)
2. Isi data penerima
3. Tambahkan items yang akan dikirim
4. Isi data driver dan kendaraan
5. Tambahkan notes jika perlu
6. Klik "Generate Delivery Order PDF"

**Use Cases:**
- Delivery order untuk pengiriman barang
- Bukti pengiriman ke klien
- Dokumen untuk driver
- Arsip pengiriman

---

## 🎨 Design System

Semua tools menggunakan design system yang konsisten:
- **Dark mode** sebagai default
- **Light mode** toggle
- **Responsive design** untuk desktop dan mobile
- **Color-coded** untuk setiap tool
- **Consistent UI/UX** across all tools

---

## 🚀 Cara Akses

1. Buka aplikasi PERADA Tools
2. Lihat semua tools di halaman utama
3. Klik tool yang ingin digunakan
4. Gunakan fitur sesuai kebutuhan
5. Klik tombol "Back" (←) untuk kembali ke hub

---

## 💡 Tips Penggunaan

### Untuk Tim Admin:
- Gunakan **Document Registry** untuk register semua surat/dokumen penting
- Gunakan **Client Database** untuk maintain database klien
- Gunakan **Invoice Generator** untuk buat invoice ke klien

### Untuk Tim Logistik:
- Gunakan **Label Generator** untuk buat label pengiriman
- Gunakan **Delivery Order Generator** untuk buat DO
- Gunakan **Barcode Generator** untuk tracking

### Untuk Tim Finance:
- Gunakan **Invoice Generator** untuk buat invoice
- Gunakan **Client Database** untuk manage data billing
- Gunakan **Nota ke PDF** untuk arsip nota

### Untuk Tim Umum:
- Gunakan **Batch Renamer** untuk rename file massal
- Gunakan **PDF Splitter** untuk split PDF besar
- Gunakan **Barcode Generator** untuk berbagai kebutuhan

---

## 🔧 Technical Details

### Teknologi yang Digunakan:
- **React** + **TypeScript** + **Vite**
- **Tailwind CSS** untuk styling
- **jsPDF** untuk PDF generation
- **pdf-lib** untuk PDF manipulation
- **qrcode** untuk QR code generation
- **Cloudflare Workers + D1** untuk Document Registry
- **Cloudflare R2** untuk file storage

### Browser Support:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

### Performance:
- Client-side processing (no server required)
- Fast PDF generation
- Responsive UI
- Offline capable (except Document Registry)

---

## 📞 Support

Untuk bantuan atau pertanyaan:
- Hubungi IT Support PERADA GROUP
- Check dokumentasi di setiap tool
- Lihat tutorial di menu Help

---

## 🎯 Next Steps

1. **Explore semua tools** - Coba setiap tool untuk familiarisasi
2. **Customize workflow** - Sesuaikan dengan kebutuhan tim
3. **Train tim** - Share knowledge ke tim lain
4. **Feedback** - Berikan feedback untuk improvement

---

**Dikembangkan oleh:** IT Support PERADA GROUP  
**Versi:** 2.0  
**Tanggal:** 2026  
**Status:** Production Ready ✅
