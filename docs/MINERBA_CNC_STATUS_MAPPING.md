# MinerbaOne CnC Status Mapping

This note documents the interpretation used by the MinerbaOne Business Checker UI. The raw `status_cnc` value from MinerbaOne remains the source value; the application only adds an explanatory category and visual treatment.

## Research basis

1. Ditjen Minerba's official MODI Self Service User Guide v1.1 (2021) instructs new Mineral Bukan Logam, Batuan, and Mineral Bukan Logam Jenis Tertentu records to select status `CNC`.
   - https://modi.esdm.go.id/uploads/contoh/User_Manual_MODI_2021.pdf
2. Permen ESDM No. 26 Tahun 2018, Pasal 54, describes the IUP/IUPK list after IUP arrangement: no same-commodity overlap, PNBP obligations fulfilled, and technical/environmental obligations fulfilled. It also covers inclusion after a court or competent-authority decision where a dispute was being resolved.
   - https://jdih.esdm.go.id/?id=241
3. Ditjen Minerba CnC announcements show historical CnC batches/angkatan such as `CNC I`, `CNC IX`, etc.
   - https://www.minerba.esdm.go.id/upload/file_menu/20190221140207.pdf
4. A later Ditjen Minerba MODI registration presentation (publicly mirrored) explains the operational Angkatan CNC mapping used by MODI:
   - `CNC` for the applicable non-metal/rock registration flow;
   - `I.T` for Mineral Logam/Batubara IUP registered based on a court or competent-authority decision;
   - `CNC-XX` for IUP previously announced CnC in a CnC announcement.

## UI mapping

| Raw value | UI category | Color | Meaning shown to user |
|---|---|---|---|
| `CNC` | Clean & Clear | Green | CnC status from the IUP arrangement/evaluation process |
| `CNC-XX`, `CNC IX`, etc. | CnC Announcement | Green | Previously announced CnC; suffix indicates announcement/batch |
| `I.T` or a value containing `I.T` | IUP Terdaftar | Amber | Registered category; **not** automatically Non-CnC |
| `NON-CNC`, `NON CNC`, equivalent explicit text | Non-CnC | Red | Explicitly not/belum CnC |
| empty/unrecognized | Unknown | Gray | Do not infer CnC or Non-CnC |

## Important interpretation rule

CnC status is not the same as a complete current legal/commercial due-diligence conclusion. The UI must keep permit validity dates visible and remind users that current RKAB, PNBP, technical/environmental obligations, sanctions, revocation/termination history, and other current requirements may need separate verification.
