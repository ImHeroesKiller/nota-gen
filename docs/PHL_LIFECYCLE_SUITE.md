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
- `08` Invoice & Billing
- `09` Monitoring AR

Prev/Next navigation is suite-scoped and must never leave `phl-mining-lifecycle`.

## Lifecycle register number

Every worker in the lifecycle receives one persistent register number automatically. Existing records are backfilled and new lifecycle changes are synchronized automatically.

Format:

`PHL-LC/####/PAY/MM/YYYY`

## Invoice register

Invoice numbers are generated automatically when a PHL invoice is saved or issued.

Format:

`PHL-INV/####/PAY/MM/YYYY`

The Invoice & Billing tool takes its baseline from paid attendance days multiplied by the worker daily rate, grouped by period, project, and site. Management fee, reimbursable charges, other charges, effective tax rate, and payment terms remain configurable before issue.

An invoice can be saved as draft or issued. Only issued invoices enter the active AR population.

## Accounts Receivable monitoring

Monitoring AR tracks:

- total billed, collected, outstanding, and overdue,
- aging buckets: Current, 1–30, 31–60, 61–90, and >90 days,
- invoices due within seven days,
- partial and full payments,
- payment references and payment ledger,
- automatic invoice status transitions based on collections.

The lifecycle register, invoice register, and AR state currently follow the existing client-side persistence model. No server database migration is introduced by this change.
