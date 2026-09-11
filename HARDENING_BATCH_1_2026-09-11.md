# Tool Hardening Batch 1 — 11 Sep 2026

## Scope
Hardening logic, bug fixing, dan redesign ERP untuk 10 tools prioritas:

1. PDF Processor
2. Vehicle Checklist
3. Recruitment Pipeline
4. Invoice Generator
5. Uang Jalan Calculator
6. CBM Calculator
7. Tax Billing Calculator
8. Freight Rate Calculator
9. Outsourcing Quotation
10. Payroll Slip Generator

## Bug fixes utama
- PDF Processor: menghapus fake compression-quality control, validasi file PDF, single/multi-file guard, all-pages delete guard, page selection/reorder validation, dan mencegah output optimasi yang lebih besar dari input.
- Vehicle Checklist: submit hanya jika semua checklist selesai; item Fail wajib memiliki catatan; inspector dan data kendaraan wajib lengkap.
- Recruitment Pipeline: validasi email/telepon dan duplikasi; stage transition dibuat sequential; stage terminal tidak dapat dipindah lagi.
- Invoice Generator: validasi data invoice/item; due date guard; A4 PDF multi-page dengan wrapping dan pagination aman.
- Uang Jalan Calculator: memperbaiki formula konsumsi L/100km dari `distance * consumption` menjadi `(distance / 100) * consumption`.
- CBM Calculator: rekomendasi container mempertimbangkan CBM dan payload sekaligus; unit conversion dan quantity guard diperketat.
- Tax Billing Calculator: memperbaiki PPh 23 dari tax addition menjadi withholding deduction; PPN tetap tax addition.
- Freight Rate Calculator: currency selector benar-benar memengaruhi perhitungan; target profit dihitung sebagai gross margin, bukan markup; margin dibatasi aman.
- Outsourcing Quotation: input/rate guard; fixed allowance dimasukkan ke fixed compensation; cost basis diperjelas.
- Payroll Slip Generator: gross/net/overtime dihitung live, bukan state yang dapat stale; print validation dan popup-block handling ditambahkan.

## UI
Seluruh tools di batch ini diselaraskan ke ERP design system utama: sticky local header, compact surfaces, responsive layout, dark mode, form states, empty/error states, dan mobile behavior.

## Verification
- Vercel preview build terakhir: READY.
- Preview endpoint: HTTP 200.
- Tidak ada perubahan database/backend.
