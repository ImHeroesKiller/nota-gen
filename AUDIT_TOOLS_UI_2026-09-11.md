# Audit Tools UI — 11 Sep 2026

## Scope
Audit frontend tool workspace pada PERADA Tools dengan sampling lintas kategori: recruitment/workforce, fleet/site, finance/document generator, PDF processing, dan document utilities. Audit juga mencakup app shell, dark mode, responsive behavior, error isolation, dan production runtime.

## Temuan utama

### P0 — Workspace / rendering
1. Banyak tool memakai `h-screen` di dalam ERP shell yang sudah memiliki topbar 68px. Dampak: nested viewport, clipping, double scroll, dan panel bawah sulit dijangkau.
2. ErrorBoundary tersedia tetapi tidak dipasang pada root app. Satu render error pada tool berpotensi menjatuhkan seluruh workspace.
3. Banyak tool lama memakai warna light-mode hardcoded (`bg-white`, `text-gray-*`, `border-gray-*`) walau menerima state dark mode. Dampak: kontras dan surface tidak konsisten ketika dark mode aktif.

### P1 — UI consistency
1. Tool memakai kombinasi card/shadow/radius yang berbeda-beda (`shadow-lg`, `shadow-2xl`, rounded 8–24px).
2. Form field, table, modal, upload area, local toolbar, dan scrollbar belum mengikuti design token ERP utama.
3. Beberapa tool desktop menggunakan sidebar internal fixed width (`w-80`/`w-72`) sehingga tidak proper pada mobile.
4. Summary/KPI card di dalam tool terlalu berat secara visual dibanding dashboard ERP baru.
5. Focus state keyboard tidak konsisten pada button/input/tool controls.

### P1 — Functional/UX findings untuk iterasi berikutnya
1. `PDFProcessor`: kontrol `compressQuality` saat ini hanya mengubah UI dan tidak mengubah proses kompresi `pdf-lib`; ini perlu direvisi agar tidak memberi ekspektasi kualitas yang palsu.
2. `PDFProcessor`: single-file operation masih dapat menerima beberapa file; flow harus dibatasi per operation.
3. `PDFProcessor`: delete-pages perlu guard agar seluruh halaman tidak terhapus sekaligus tanpa validasi.
4. `VehicleChecklist`: inspeksi dengan item berstatus `na` masih berpotensi diproses sebagai hasil pass; submit sebaiknya hanya aktif saat checklist lengkap.
5. `NotaToPdf`: perubahan class theme pada `document.documentElement` sebaiknya memakai `classList` agar tidak menimpa class global lain.

## Fix yang diimplementasikan pada fase ini
- Root ErrorBoundary diaktifkan dengan recovery UI yang lebih aman dan tidak menampilkan stack trace ke user.
- Unified Tool Workspace stylesheet diterapkan ke seluruh tool melalui `.erp-tool-stage`.
- Nested `100vh` dinormalisasi ke tinggi workspace setelah topbar.
- Legacy hardcoded surfaces diperbaiki agar kompatibel dengan dark ERP shell.
- Typography, cards, border, shadow, form controls, focus state, tables, modal, upload zones, dan local headers dinormalisasi ke ERP design tokens.
- Internal fixed sidebar di tool kompleks dibuat stack pada mobile.
- Paper/document preview tetap dipertahankan putih agar hasil dokumen tidak ikut berubah oleh dark mode.
- Print mode menghilangkan ERP chrome dan mengembalikan tool ke layout printable.

## Verification
- Vercel preview build: READY.
- Production runtime audit sebelum perubahan: tidak ditemukan runtime error pada window 7 hari.
- Tidak ada perubahan database/backend/business logic pada fase UI system ini.

## Rekomendasi lanjutan
Setelah shared UI layer stabil, lakukan hardening logic per tool secara bertahap untuk temuan functional P1 di atas, dimulai dari PDF Processor dan inspection tools.
