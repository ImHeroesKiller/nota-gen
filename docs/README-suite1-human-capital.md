# Suite 1: Human Capital & Outsourcing - Deliverables

## 📦 Deliverables Overview

Dokumentasi ini menjelaskan semua deliverables yang telah dibuat untuk Suite 1: Human Capital & Outsourcing PERADA Tools.

---

## 📁 File Structure

```
project-root/
├── database/
│   └── schema_suite1_human_capital.sql          # Database schema SQL
├── src/
│   └── types/
│       └── suite1-human-capital.ts              # TypeScript type definitions
└── docs/
    └── workflow-suite1-human-capital.md         # Workflow documentation
```

---

## 📊 Database Schema

### File: `database/schema_suite1_human_capital.sql`

**Total Tables:** 13 tables  
**Total Views:** 5 views  
**Total Triggers:** 5 triggers  
**Total Functions:** 5 functions

### Tables by Module:

#### Module 1.1: Recruitment & Onboarding (HC-REC)
1. **APP-HC-REC-01: recruitment_pipeline**
   - Tracking proses rekrutmen kandidat
   - Fields: id, candidate_name, candidate_email, position, status, dates, etc.
   - Indexes: status, position, client_id, applied_date

2. **APP-HC-REC-02: pkwt_contracts**
   - Kontrak PKWT karyawan
   - Fields: id, candidate_id, contract_number, dates, salary, status, etc.
   - Indexes: candidate_id, status, contract_number, dates

3. **APP-HC-REC-03: onboarding_checklists**
   - Tracking proses onboarding
   - Fields: id, employee_id, contract_id, document_status, uniform_status, training_status, etc.
   - Indexes: employee_id, contract_id, status

#### Module 1.2: Payroll & Benefits (HC-PAY)
4. **APP-HC-PAY-01: payroll_slips**
   - Slip gaji karyawan
   - Fields: id, employee_id, contract_id, payroll_period, salary components, totals, payment info
   - Indexes: employee_id, contract_id, period, date, status

5. **APP-HC-PAY-02: outsourcing_quotations**
   - Quotation outsourcing ke klien
   - Fields: id, quotation_number, client_id, headcount, rates, totals, status
   - Indexes: client_id, quotation_number, status, date

6. **APP-HC-PAY-03: bpjs_admin**
   - Administrasi BPJS karyawan
   - Fields: id, employee_id, bpjs numbers, contributions, status
   - Indexes: employee_id, status, bpjs numbers

#### Module 1.3: Performance & Development (HC-PRF)
7. **APP-HC-PRF-01: performance_appraisals**
   - Penilaian kinerja karyawan
   - Fields: id, employee_id, period, scores, grade, feedback, status
   - Indexes: employee_id, period, date, status

8. **APP-HC-PRF-02: turnover_logs**
   - Tracking keluar-masuk karyawan
   - Fields: id, employee_id, log_type, entry/exit details, replacement status
   - Indexes: employee_id, type, date, exit_category

#### Module 1.4: Workforce Operations (HC-OPE)
9. **APP-HC-OPE-01: timesheets**
   - Absensi dan lembur karyawan
   - Fields: id, employee_id, work_date, shift_type, hours, status
   - Indexes: employee_id, date, status

10. **APP-HC-OPE-02: client_shifts**
    - Penjadwalan shift di client
    - Fields: id, employee_id, client_id, location, shift details, status
    - Indexes: employee_id, client_id, date, status

11. **APP-HC-OPE-03: deployment_planners**
    - Planning deployment ke site
    - Fields: id, employee_id, site, dates, requirements checklist, status
    - Indexes: employee_id, date, status

12. **APP-HC-OPE-04: employee_grievances**
    - Pengaduan karyawan
    - Fields: id, employee_id, grievance_number, category, priority, resolution, status
    - Indexes: employee_id, number, category, priority, status

13. **APP-HC-OPE-05: medical_checkups**
    - Tracking MCU dan sertifikasi
    - Fields: id, employee_id, checkup_type, results, expiry, status
    - Indexes: employee_id, type, date, expiry, status

### Views:

1. **v_employee_summary**
   - Summary lengkap employee dengan contract, onboarding, BPJS, timesheets, performance

2. **v_monthly_payroll_summary**
   - Summary payroll bulanan dengan total gaji, deductions, net salary

3. **v_recruitment_pipeline_status**
   - Status recruitment pipeline dengan count dan percentage

4. **v_turnover_analysis**
   - Analisis turnover per bulan dengan exit category

5. **v_grievance_summary**
   - Summary grievance per category, priority, status dengan avg satisfaction

### Triggers & Functions:

1. **trg_update_recruitment_on_contract**
   - Auto-update recruitment status ke 'hired' ketika contract dibuat

2. **trg_calculate_payroll_totals**
   - Auto-calculate payroll totals (overtime_pay, gross_salary, total_deductions, net_salary)

3. **trg_calculate_onboarding_completion**
   - Auto-calculate onboarding completion percentage dan status

4. **trg_calculate_appraisal_grade**
   - Auto-calculate overall_score dan grade dari performance metrics

---

## 📘 TypeScript Type Definitions

### File: `src/types/suite1-human-capital.ts`

**Total Interfaces:** 39 interfaces  
**Total Types:** 13 type aliases

### Structure:

#### Entity Interfaces (13)
- RecruitmentPipeline
- PKWTContract
- OnboardingChecklist
- PayrollSlip
- OutsourcingQuotation
- BPJSAdmin
- PerformanceAppraisal
- TurnoverLog
- Timesheet
- ClientShift
- DeploymentPlanner
- EmployeeGrievance
- MedicalCheckup

#### DTO Interfaces (26)
- Create[Entity]DTO (13 interfaces)
- Update[Entity]DTO (13 interfaces)

#### View Interfaces (5)
- EmployeeSummary
- MonthlyPayrollSummary
- RecruitmentPipelineStatus
- TurnoverAnalysis
- GrievanceSummary

#### Type Aliases (13)
- RecruitmentStatus
- ContractType, SalaryType, ContractStatus
- DocumentStatus, UniformStatus, TrainingStatus, OnboardingStatus
- PaymentMethod, PaymentStatus
- QuotationStatus
- BPJSStatus
- AppraisalStatus, PerformanceGrade
- TurnoverLogType, ExitCategory, ReplacementStatus
- ShiftType, TimesheetStatus
- ClientShiftType, ClientShiftStatus
- DeploymentType, DeploymentStatus
- GrievanceCategory, GrievancePriority, GrievanceStatus
- CheckupType, CheckupResult, CheckupStatus

### Usage Example:

```typescript
import { 
  RecruitmentPipeline, 
  CreateRecruitmentPipelineDTO,
  RecruitmentStatus 
} from './types/suite1-human-capital';

// Create new recruitment
const newRecruitment: CreateRecruitmentPipelineDTO = {
  candidate_name: 'John Doe',
  candidate_email: 'john@example.com',
  position: 'Security Guard',
  client_id: 1,
};

// Update status
const updateData: Partial<RecruitmentPipeline> = {
  status: 'hired',
  hired_date: new Date(),
};
```

---

## 🔄 Workflow Documentation

### File: `docs/workflow-suite1-human-capital.md`

**Total Workflows:** 12 workflows  
**Total Integrations:** 8 cross-module integrations

### Workflows by Module:

#### Module 1.1: Recruitment & Onboarding
1. **Workflow 1.1.1: Recruitment to Contract**
   - Trigger: Kandidat diterima (status = 'hired')
   - Auto-create draf kontrak
   - SQL trigger: `trg_update_recruitment_on_contract`

2. **Workflow 1.1.2: Contract to Onboarding**
   - Trigger: Kontrak dibuat
   - Auto-create onboarding checklist
   - SQL trigger: `trg_create_onboarding_on_contract`

3. **Workflow 1.1.3: Onboarding Completion Tracking**
   - Trigger: Status item onboarding berubah
   - Auto-calculate completion percentage
   - SQL trigger: `trg_calculate_onboarding_completion`

#### Module 1.2: Payroll & Benefits
4. **Workflow 1.2.1: Timesheet to Payroll**
   - Trigger: Timesheet di-approve
   - Auto-calculate payroll totals
   - SQL trigger: `trg_calculate_payroll_totals`

5. **Workflow 1.2.2: Payroll to BPJS**
   - Trigger: Payroll slip dibuat
   - Update BPJS contribution

6. **Workflow 1.2.3: Quotation to Contract**
   - Trigger: Quotation accepted
   - Auto-create recruitment pipelines

#### Module 1.3: Performance & Development
7. **Workflow 1.3.1: Performance Appraisal to Grade**
   - Trigger: Performance appraisal dibuat
   - Auto-calculate overall_score dan grade
   - SQL trigger: `trg_calculate_appraisal_grade`

8. **Workflow 1.3.2: Exit to Turnover Log**
   - Trigger: Employee exit
   - Auto-create turnover log

#### Module 1.4: Workforce Operations
9. **Workflow 1.4.1: Timesheet to Payroll** (Sudah dijelaskan di 1.2.1)

10. **Workflow 1.4.2: Deployment to Medical Checkup**
    - Trigger: Deployment planned
    - Auto-schedule medical checkup

11. **Workflow 1.4.3: Grievance Resolution Tracking**
    - Trigger: Grievance created
    - Track resolution workflow

### Cross-Module Integrations:

1. **Recruitment → Onboarding → Payroll**
   - Complete employee lifecycle

2. **Timesheet → Payroll → BPJS**
   - Monthly payroll processing

3. **Performance → Turnover**
   - Exit tracking

### Reporting Workflows:

1. **Monthly Payroll Report**
   - View: `v_monthly_payroll_summary`

2. **Turnover Analysis Report**
   - View: `v_turnover_analysis`

### Best Practices:

1. **Data Consistency**
   - Foreign key constraints
   - Triggers untuk auto-calculate
   - Transactions untuk multi-step operations

2. **Performance**
   - Indexes untuk frequently queried columns
   - Views untuk complex queries
   - Pagination untuk large datasets

3. **Security**
   - Role-based access control
   - Input validation
   - Parameterized queries

4. **Maintainability**
   - Document all triggers and functions
   - Consistent naming conventions
   - Unit tests untuk triggers

---

## 🚀 Implementation Guide

### Step 1: Setup Database

```bash
# Connect to PostgreSQL
psql -U your_user -d your_database

# Import schema
\i database/schema_suite1_human_capital.sql

# Verify tables
\dt

# Verify views
\dv

# Verify triggers
SELECT * FROM pg_trigger WHERE tgname LIKE 'trg_%';
```

### Step 2: Setup TypeScript Types

```typescript
// Import types in your components
import { 
  RecruitmentPipeline, 
  CreateRecruitmentPipelineDTO,
  // ... other types
} from './types/suite1-human-capital';
```

### Step 3: Implement Workflows

```typescript
// Example: Recruitment to Contract workflow
const handleHireCandidate = async (candidateId: number) => {
  // 1. Update recruitment status
  await api.updateRecruitmentPipeline(candidateId, {
    status: 'hired',
    hired_date: new Date(),
  });
  
  // 2. Create contract (trigger will auto-update recruitment status)
  const contract = await api.createPKWTContract({
    candidate_id: candidateId,
    contract_number: generateContractNumber(),
    // ... other fields
  });
  
  // 3. Onboarding checklist auto-created by trigger
};
```

### Step 4: Test Workflows

```typescript
// Test complete employee lifecycle
describe('Employee Lifecycle', () => {
  it('should complete full lifecycle', async () => {
    // 1. Recruitment
    const recruitment = await createRecruitment();
    expect(recruitment.status).toBe('applied');
    
    // 2. Hire
    await hireCandidate(recruitment.id);
    expect(recruitment.status).toBe('hired');
    
    // 3. Contract
    const contract = await getContract(recruitment.id);
    expect(contract).toBeDefined();
    
    // 4. Onboarding
    const onboarding = await getOnboarding(recruitment.id);
    expect(onboarding.completion_percentage).toBe(0);
    
    // 5. Complete onboarding
    await completeOnboarding(onboarding.id);
    expect(onboarding.completion_percentage).toBe(100);
    
    // 6. Payroll
    const payroll = await generatePayroll(recruitment.id);
    expect(payroll.net_salary).toBeGreaterThan(0);
  });
});
```

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    RECRUITMENT & ONBOARDING                      │
├─────────────────────────────────────────────────────────────────┤
│  recruitment_pipeline ──► pkwt_contracts ──► onboarding_        │
│                                              checklists         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PAYROLL & BENEFITS                          │
├─────────────────────────────────────────────────────────────────┤
│  timesheets ──► payroll_slips ──► bpjs_admin                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  PERFORMANCE & DEVELOPMENT                       │
├─────────────────────────────────────────────────────────────────┤
│  performance_appraisals ──► turnover_logs                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📚 API Endpoints (Example)

### Recruitment Pipeline

```typescript
// GET /api/recruitment
GET /api/recruitment?page=1&limit=10&status=hired

// POST /api/recruitment
POST /api/recruitment
{
  "candidate_name": "John Doe",
  "candidate_email": "john@example.com",
  "position": "Security Guard",
  "client_id": 1
}

// PUT /api/recruitment/:id
PUT /api/recruitment/1
{
  "status": "hired",
  "hired_date": "2026-01-09"
}
```

### PKWT Contracts

```typescript
// GET /api/contracts
GET /api/contracts?candidate_id=1&status=active

// POST /api/contracts
POST /api/contracts
{
  "candidate_id": 1,
  "contract_number": "PKWT-2026-001",
  "position": "Security Guard",
  "start_date": "2026-01-01",
  "end_date": "2026-12-31",
  "salary": 5000000
}
```

### Payroll Slips

```typescript
// GET /api/payroll
GET /api/payroll?employee_id=1&period=2026-01

// POST /api/payroll/generate
POST /api/payroll/generate
{
  "period": "2026-01"
}
```

---

## 🎯 Key Features

### Automation
- ✅ Auto-update recruitment status
- ✅ Auto-create onboarding checklist
- ✅ Auto-calculate payroll totals
- ✅ Auto-calculate onboarding completion
- ✅ Auto-calculate performance grade

### Reporting
- ✅ Employee summary view
- ✅ Monthly payroll summary view
- ✅ Recruitment pipeline status view
- ✅ Turnover analysis view
- ✅ Grievance summary view

### Integration
- ✅ Recruitment → Onboarding → Payroll
- ✅ Timesheet → Payroll → BPJS
- ✅ Performance → Turnover
- ✅ Quotation → Recruitment

---

## 📝 Notes

### Database
- PostgreSQL 12+ recommended
- All tables have proper indexes
- All foreign keys have CASCADE delete
- All triggers are documented

### TypeScript
- Strict type checking enabled
- All DTOs are properly typed
- All entities have proper types

### Workflows
- All workflows are documented
- All triggers are explained
- All integrations are mapped

---

## 📞 Support

Untuk pertanyaan atau bantuan:
- Database: Lihat `database/schema_suite1_human_capital.sql`
- Types: Lihat `src/types/suite1-human-capital.ts`
- Workflows: Lihat `docs/workflow-suite1-human-capital.md`

---

**Version:** 1.0  
**Last Updated:** 2026-01-09  
**Author:** PERADA Tools Development Team
