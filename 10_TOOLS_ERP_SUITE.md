# 10 Tools ERP Suite - Dokumentasi Lengkap

## Ringkasan

10 komponen tools React baru telah berhasil dibuat untuk kategori **ERP Suite** dengan fokus pada Enterprise Resource Planning dan administrasi bisnis PERADA GROUP.

---

## 🏢 ERP Suite Structure

**Suite:** ERP Suite  
**Total Modules:** 4  
**Total Tools:** 10

### Module 1: Payroll & Finance 💰
- Payroll Slip Generator
- Tax Billing Calculator
- Uang Jalan Calculator

### Module 2: Procurement & Logistics 📦
- PO Builder
- Surat Jalan Maker

### Module 3: HR & Compliance 👥
- Medical Checkup Tracker
- BPJS Admin Manager

### Module 4: Asset & Customs 🏭
- Tyre Maintenance Log
- Customs Vault
- Client Contract Manager

---

## 📋 Daftar 10 Tools Baru

### 1. **PayrollSlipGenerator.tsx** 💵
**Module:** Payroll & Finance  
**Fungsi:** Generator Slip Gaji karyawan outsourcing/lapangan

**Fitur Utama:**
- Input data karyawan (nama, ID, posisi, departemen)
- Periode gaji bulanan
- Komponen pendapatan:
  - Gaji Pokok
  - Lembur (jam × rate)
  - Tunjangan
- Komponen potongan:
  - BPJS Kesehatan
  - BPJS Ketenagakerjaan
  - PPh 21
  - Potongan lainnya
- Auto-calculate Net Pay
- Informasi rekening bank
- Preview slip gaji real-time
- Print/Save PDF dengan format profesional
- Kop surat PT Perdana Adi Yuda

**Use Cases:**
- Pembuatan slip gaji bulanan
- Slip gaji untuk karyawan outsourcing
- Dokumentasi pembayaran gaji

---

### 2. **SuratJalanMaker.tsx** 🚚
**Module:** Procurement & Logistics  
**Fungsi:** Tool pembuat Surat Jalan / Delivery Order pengiriman barang/armada resmi

**Fitur Utama:**
- Nomor surat jalan otomatis
- Data pengirim dan penerima
- Informasi armada (nomor kendaraan, driver)
- Multiple items dengan quantity dan unit
- Catatan khusus pengiriman
- Tanda tangan penerima
- Preview real-time
- Print/Save PDF dengan kop surat
- Format profesional

**Use Cases:**
- Surat jalan pengiriman barang
- Delivery order untuk klien
- Dokumentasi pengiriman armada

---

### 3. **UangJalanCalculator.tsx** 🚛
**Module:** Payroll & Finance  
**Fungsi:** Kalkulator perhitungan estimasi Uang Jalan, Bensin, dan Tol untuk driver

**Fitur Utama:**
- Input rute (origin → destination)
- Jarak tempuh (km)
- Jenis kendaraan (Motorcycle, Car, Pickup, Truck, Bus, Excavator, Dump Truck)
- Konsumsi BBM otomatis per jenis kendaraan
- Harga BBM per liter
- Biaya tol
- Uang makan driver
- Auto-calculate:
  - Total BBM yang dibutuhkan
  - Biaya BBM
  - Total uang jalan
- Preview estimasi biaya
- Catatan dan asumsi

**Use Cases:**
- Estimasi uang jalan untuk driver
- Perhitungan biaya operasional armada
- Budgeting pengiriman

---

### 4. **TaxBillingCalculator.tsx** 🧾
**Module:** Payroll & Finance  
**Fungsi:** Kalkulator pajak PPN 11% & PPh 23 khusus penagihan jasa alih daya & logistik

**Fitur Utama:**
- 2 jenis pajak:
  - PPN 11% (Pertambahan Nilai)
  - PPh 23 (2%) (Penghasilan)
- Input data transaksi:
  - Nama klien
  - Nomor invoice
  - Deskripsi jasa
  - Dasar Pengenaan Pajak (DPP)
- Auto-calculate:
  - Jumlah pajak
  - Total tagihan
- Preview kalkulasi
- Informasi pajak
- Format currency IDR

**Use Cases:**
- Perhitungan PPN untuk jasa outsourcing
- Perhitungan PPh 23 untuk jasa logistik
- Penagihan pajak ke klien
- Dokumentasi perpajakan

---

### 5. **PoBuilder.tsx** 📋
**Module:** Procurement & Logistics  
**Fungsi:** Generator dokumen Purchase Order (PO) resmi untuk pengadaan barang/jasa ke vendor

**Fitur Utama:**
- Nomor PO otomatis
- Tanggal PO dan delivery date
- Data vendor lengkap
- Multiple items dengan quantity, unit, dan harga
- Payment terms (Net 30, Net 60, COD, Advance)
- Auto-calculate subtotal, tax, dan total
- Catatan dan instruksi khusus
- Tanda tangan requester dan approver
- Preview PO real-time
- Print/Save PDF dengan format profesional
- Kop surat PT Perdana Adi Yuda

**Use Cases:**
- Purchase order untuk pengadaan barang
- PO untuk jasa outsourcing
- Dokumentasi pengadaan
- Approval workflow

---

### 6. **MedicalCheckupTracker.tsx** 🏥
**Module:** HR & Compliance  
**Fungsi:** Sistem pemantauan MCU, sertifikasi K3, dan izin kelaikan kerja pekerja lapangan/tambang

**Fitur Utama:**
- Data karyawan lengkap
- Tracking MCU (Medical Check-up):
  - Tanggal MCU terakhir
  - Tanggal MCU berikutnya
  - Status (valid, expired, upcoming)
- Tracking sertifikasi K3:
  - Jenis sertifikasi
  - Tanggal expired
  - Status
- Tracking izin kelaikan kerja:
  - Jenis izin (SIO, SIM, dll)
  - Tanggal expired
  - Status
- Filter by status (valid, upcoming, expired)
- Summary cards:
  - Valid certifications
  - Upcoming renewals
  - Expired certifications
- Alert untuk sertifikasi expired
- Color-coded status indicators

**Use Cases:**
- Pemantauan MCU karyawan
- Tracking sertifikasi K3
- Monitoring izin kelaikan kerja
- Compliance reporting
- Reminder perpanjangan sertifikasi

---

### 7. **BpjsAdminManager.tsx** 🏛️
**Module:** HR & Compliance  
**Fungsi:** Rekapitulasi kepesertaan, mutasi keluar/masuk, dan iuran BPJS per klien B2B

**Fitur Utama:**
- Data karyawan dengan BPJS
- Nomor BPJS
- Status kepesertaan (active, inactive)
- Tanggal join dan resign
- Iuran BPJS per karyawan:
  - BPJS Kesehatan
  - BPJS Ketenagakerjaan
  - Total kontribusi
- Filter by client dan status
- Summary cards:
  - Total employees
  - Active participants
  - Inactive participants
  - Monthly contribution
- Summary by client
- Format currency IDR

**Use Cases:**
- Rekapitulasi iuran BPJS
- Tracking kepesertaan BPJS
- Mutasi karyawan keluar/masuk
- Reporting iuran per klien
- Compliance BPJS

---

### 8. **TyreMaintenanceLog.tsx** 🔧
**Module:** Asset & Customs  
**Fungsi:** Log pencatatan pergantian ban, sparepart, dan perawatan berkala armada/alat berat

**Fitur Utama:**
- Data kendaraan (nomor, tipe)
- Jenis maintenance:
  - Tyre Change (pergantian ban)
  - Sparepart Replacement
  - Routine Maintenance (service berkala)
- Detail maintenance:
  - Tanggal
  - Deskripsi pekerjaan
  - Mileage (km)
  - Biaya
  - Dilakukan oleh
  - Tanggal service berikutnya
  - Catatan
- Filter by type
- Summary cards:
  - Total records
  - Tyre changes
  - Sparepart replacements
  - Total cost
- Add new record form
- Table view dengan semua informasi

**Use Cases:**
- Log pergantian ban armada
- Tracking pergantian sparepart
- Jadwal service berkala
- Monitoring biaya maintenance
- Preventive maintenance planning

---

### 9. **CustomsVault.tsx** 📁
**Module:** Asset & Customs  
**Fungsi:** Repository penyimpanan dokumen kepabeanan (PIB, PEB, B/L, AWB) berbasis nomor kontainer/AWB

**Fitur Utama:**
- Jenis dokumen:
  - PIB (Pemberitahuan Impor Barang)
  - PEB (Pemberitahuan Ekspor Barang)
  - BL (Bill of Lading)
  - AWB (Air Waybill)
  - COO (Certificate of Origin)
  - Invoice
  - Packing List
- Data dokumen:
  - Nomor dokumen
  - Nomor kontainer/AWB
  - Nama klien
  - Nama vessel/voyage
  - Tanggal
  - Status (draft, submitted, approved, rejected)
  - Nilai barang
  - Catatan
  - File path
- Search by document number, container, AWB, or client
- Filter by type dan status
- Summary cards:
  - Total documents
  - Approved
  - Pending
  - Total value
- Table view dengan semua informasi
- Color-coded status indicators

**Use Cases:**
- Repository dokumen kepabeanan
- Tracking PIB dan PEB
- Manajemen Bill of Lading
- Tracking Air Waybill
- Compliance documentation
- Audit trail dokumen

---

### 10. **ClientContractManager.tsx** 📄
**Module:** Asset & Customs  
**Fungsi:** Tracker masa berlaku Kontrak Kerja Sama (MoU/SPK) B2B dengan pengingat perpanjangan

**Fitur Utama:**
- Data kontrak:
  - Nomor kontrak
  - Jenis kontrak (MoU, SPK, Contract)
  - Nama klien
  - Nilai kontrak
  - Periode kontrak (start - end date)
  - Status (active, expiring, expired)
  - Hari tersisa
  - Contact person (nama, email, telepon)
  - Catatan
  - Auto-renewal flag
- Filter by status
- Summary cards:
  - Active contracts
  - Expiring soon
  - Expired
  - Total contract value
- Alert untuk kontrak expiring (≤90 hari)
- Alert untuk kontrak expired
- Color-coded status indicators
- Table view dengan semua informasi

**Use Cases:**
- Tracking kontrak B2B
- Monitoring masa berlaku kontrak
- Reminder perpanjangan kontrak
- Contract value reporting
- Client relationship management

---

## 🎯 Fitur Umum Semua Tools

### Consistent UI
- Semua tools menggunakan Tailwind CSS
- Layout yang konsisten
- Color scheme yang sama
- Typography yang seragam

### Print/Save PDF
- Tools dengan dokumen memiliki tombol print
- Format PDF profesional
- Kop surat PT Perdana Adi Yuda
- Layout yang rapi

### Preview Real-time
- Preview dokumen/data secara real-time
- Memudahkan user melihat hasil

### Filter & Search
- Filter by status, type, client
- Search functionality
- Color-coded indicators

### Summary Cards
- Quick overview dengan summary cards
- Key metrics dan statistics

### Workflow Connections
- Setiap tool terhubung dengan tools terkait
- Mudah navigasi antar tools

---

## 📊 Statistik

**Total Tools:** 90 tools (sebelumnya 80, +10 baru)

**Kategori ERP Suite:** 10 tools ⭐ NEW
- Payroll & Finance: 3 tools
- Procurement & Logistics: 2 tools
- HR & Compliance: 2 tools
- Asset & Customs: 3 tools

---

## 📁 Files Created

1. `src/components/PayrollSlipGenerator.tsx`
2. `src/components/SuratJalanMaker.tsx`
3. `src/components/UangJalanCalculator.tsx`
4. `src/components/TaxBillingCalculator.tsx`
5. `src/components/PoBuilder.tsx`
6. `src/components/MedicalCheckupTracker.tsx`
7. `src/components/BpjsAdminManager.tsx`
8. `src/components/TyreMaintenanceLog.tsx`
9. `src/components/CustomsVault.tsx`
10. `src/components/ClientContractManager.tsx`

**Files Updated:**
- `src/components/hierarchicalStructure.tsx` - Added ERP Suite dengan 10 tools

---

## 📊 Build Status

```
✓ 593 modules transformed
✓ Build successful
✓ No TypeScript errors
✓ No React errors
✓ Bundle size: 1,910.48 kB (gzip: 505.94 kB)
```

---

## 🔗 Workflow Connections

Setiap tool baru memiliki workflow connections ke tools terkait:

**Payroll Slip Generator** → BPJS Admin Manager, Tax Billing Calculator  
**Tax Billing Calculator** → Payroll Slip Generator, Client Billing Generator  
**Uang Jalan Calculator** → Surat Jalan Maker  
**PO Builder** → Vendor Database, Surat Jalan Maker  
**Surat Jalan Maker** → PO Builder, Uang Jalan Calculator  
**Medical Checkup Tracker** → BPJS Admin Manager  
**BPJS Admin Manager** → Payroll Slip Generator, Medical Checkup Tracker  
**Tyre Maintenance Log** → Heavy Equipment Inspection  
**Customs Vault** → Bill of Lading Generator, Certificate of Origin Generator  
**Client Contract Manager** → PKWT Contract Builder, Client Billing Generator  

---

## 💡 Use Cases by Module

### Payroll & Finance
**For:** HR, Finance, Operations
- Payroll Slip Generator → Slip gaji bulanan
- Tax Billing Calculator → Perhitungan PPN & PPh 23
- Uang Jalan Calculator → Estimasi uang jalan driver

### Procurement & Logistics
**For:** Procurement, Logistics
- PO Builder → Purchase order pengadaan
- Surat Jalan Maker → Surat jalan pengiriman

### HR & Compliance
**For:** HR, Compliance
- Medical Checkup Tracker → Pemantauan MCU & sertifikasi
- BPJS Admin Manager → Rekapitulasi BPJS

### Asset & Customs
**For:** Asset Management, Customs
- Tyre Maintenance Log → Log perawatan ban & sparepart
- Customs Vault → Repository dokumen kepabeanan
- Client Contract Manager → Tracker kontrak B2B

---

## 🔧 Technical Details

### Technology Stack
- **Framework:** React 18
- **Styling:** Tailwind CSS
- **State Management:** useState (React hooks)
- **Type Safety:** TypeScript
- **Print:** Window.print() API

### Error Prevention
✅ Semua hooks (useState) di top-level  
✅ Tidak ada conditional hooks  
✅ Tidak ada hooks dalam helper functions  
✅ Tidak ada duplicate identifier  
✅ Build berhasil tanpa error  

---

## 📈 Benefits

### For Users
✅ Mudah mengelola payroll & finance  
✅ Efficient procurement & logistics  
✅ Better HR & compliance tracking  
✅ Comprehensive asset & customs management  

### For Organization
✅ Centralized ERP system  
✅ Improved compliance  
✅ Better cost control  
✅ Enhanced documentation  

---

## 📞 Support

Untuk bantuan atau pertanyaan:
- Hubungi IT Support PERADA GROUP
- Check dokumentasi di setiap tool
- Lihat tutorial di menu Help

---

**Dikembangkan oleh:** IT Support PERADA GROUP  
**Versi:** 15.0  
**Tanggal:** 2026-01-09  
**Status:** Production Ready ✅

---

## 🎉 Kesimpulan

10 tools baru ini melengkapi ekosistem PERADA Tools menjadi **90 tools profesional** yang mencakup seluruh aspek operasional PT Perdana Adi Yuda.

**ERP Suite** menyediakan solusi lengkap untuk:
- ✅ Payroll & Finance management
- ✅ Procurement & Logistics
- ✅ HR & Compliance
- ✅ Asset & Customs management

Semua tools sudah **production-ready** dan siap digunakan untuk mempercepat operasional bisnis, administrasi, HR, compliance, dan asset management PERADA GROUP! 🚀

### 10 Tools ERP Suite yang Sekarang Tersedia:
1. ✅ **Payroll Slip Generator** - Generator slip gaji
2. ✅ **Surat Jalan Maker** - Generator surat jalan
3. ✅ **Uang Jalan Calculator** - Kalkulator uang jalan
4. ✅ **Tax Billing Calculator** - Kalkulator PPN & PPh 23
5. ✅ **PO Builder** - Generator Purchase Order
6. ✅ **Medical Checkup Tracker** - Pemantauan MCU & sertifikasi
7. ✅ **BPJS Admin Manager** - Rekapitulasi BPJS
8. ✅ **Tyre Maintenance Log** - Log perawatan ban & sparepart
9. ✅ **Customs Vault** - Repository dokumen kepabeanan
10. ✅ **Client Contract Manager** - Tracker kontrak B2B

**PERADA GROUP sekarang memiliki solusi ERP lengkap untuk semua kebutuhan bisnis!** 🎊
