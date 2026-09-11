# PERADA Tools — Tool Workspace V4 Audit & Revamp

Date: 11 Sep 2026

## Root cause

Audit menemukan bahwa inkonsistensi tools bukan hanya masalah warna. `ToolHub` sebelumnya hanya me-render komponen lama di dalam `.erp-tool-stage`, sehingga setiap tool tetap membawa header, spacing, card, button, form, table, dan responsive pattern masing-masing. CSS normalization sebelumnya hanya menimpa class tertentu, sehingga control tanpa class atau struktur legacy tertentu masih terlihat seperti native HTML.

## Structural fixes

- Menambahkan canonical tool shell pada `ToolHub`: icon, breadcrumb Suite / Module, title, description, back action, module context, dan theme action seragam untuk setiap tool.
- Menghapus ketergantungan pada local marketing-style header tiap tool; redundant legacy headers/title blocks disembunyikan di workspace.
- Menambahkan `tool-workspace-v4.css` sebagai final override layer setelah seluruh style lama.
- Semua native-looking input/select/textarea/file input/fieldset/button/table sekarang memiliki ERP visual treatment walaupun komponen lama tidak memiliki utility class lengkap.
- Standardisasi card, panel, KPI, table density, status chip, tab, dropzone, modal, scroll, dark mode, responsive, dan print surface.
- Document/PDF/A4 preview tetap paper-white dan tidak ikut berubah menjadi dark card.

## Individual tool revamp + bug fixing

### PKWT Contract Builder
- Full layout revamp menjadi form + readiness panel + paper preview.
- Memperbaiki duration bug yang sebelumnya memakai `Math.abs`, sehingga end date sebelum start date tidak lagi dianggap valid.
- Required fields dan positive salary divalidasi sebelum generate.

### BPJS Admin Manager
- Revamp menjadi compact ERP data workspace.
- Menghapus stored `totalContribution` sebagai duplicate source of truth; total selalu dihitung dari BPJS Kesehatan + Ketenagakerjaan.
- Search/filter dan basic BPJS number format warning ditambahkan.

### Onboarding Compliance Checklist
- Revamp card/detail/filter/readiness.
- Completion dihitung dari status dokumen aktual.
- Approval sekarang benar-benar bekerja dan diblokir apabila masih ada dokumen yang belum `verified`.
- Fake/inert reminder action dihapus agar UI tidak menjanjikan integrasi yang belum ada.

### Client Shift Scheduler
- Revamp filter/form/table/conflict state.
- Add Shift, Confirm, Cancel, Restore sekarang functional.
- Conflict detection dihitung dari shift aktual dan mendukung overnight shift.
- Overlap employee pada tanggal yang sama diblokir saat create.

### Timesheet Rekap
- Revamp menjadi compact filter + KPI + data table.
- Tambah search dan attendance-rate derived metric.
- Empty state dan mobile table behavior diperjelas.

### Deployment Planner
- Revamp selector/readiness/category/checklist.
- State update diganti functional update untuk mencegah stale-closure overwrite.
- Overall/category readiness selalu derived dari checklist aktual.

## Verification

- Latest preview deployment after the revamp: READY.
- Preview endpoint: HTTP 200.
- No backend/database migration.
- Existing Suite → Module → Tool hierarchy tetap dipertahankan.

## Design acceptance target

Setiap tool sekarang harus terasa berada di aplikasi ERP yang sama, bukan halaman HTML standalone: satu header hierarchy, satu surface language, satu form language, satu action language, satu table density, satu responsive behavior, dan satu dark-mode system.
