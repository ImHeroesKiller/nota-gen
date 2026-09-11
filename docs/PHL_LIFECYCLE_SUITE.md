# PHL Mining Workforce Lifecycle

This custom suite uses a **direct-tool** navigation model. The internal module is only a technical container and must not be exposed as a navigation step.

## Ordered tools

Numbering is derived from array order at runtime and starts at `00`.

- `00` PHL Lifecycle Control Center
- `01` Recruitment & Screening
- `02` PHL Contract
- `03` Onboarding & Compliance
- `04` Mobilization & Deployment
- `05` Daily Attendance
- `06` Timesheet & Validation
- `07` Payroll & Settlement

Prev/Next navigation is suite-scoped and must never leave `phl-mining-lifecycle`.

## Lifecycle register number

Every worker in the lifecycle receives one persistent register number automatically. Existing records are backfilled and new lifecycle changes are synchronized automatically.

Format:

`PHL-LC/####/PAY/MM/YYYY`

The register is currently stored with the existing client-side lifecycle persistence model. No database migration is introduced by this change.
