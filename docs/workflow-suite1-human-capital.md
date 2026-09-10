# Workflow Documentation - Suite 1: Human Capital & Outsourcing
## PERADA Tools - Integration Workflow
## Version: 1.0 | Date: 2026-01-09

---

## 📋 Overview

Dokumentasi ini menjelaskan alur kerja (workflow) dan integrasi antar tool dalam Suite 1: Human Capital & Outsourcing. Setiap tool saling terhubung melalui database dan trigger otomatis untuk memastikan konsistensi data dan efisiensi proses.

---

## 🔄 Workflow Integration Map

```
┌─────────────────────────────────────────────────────────────────┐
│                    RECRUITMENT & ONBOARDING                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  APP-HC-REC-01 ──────► APP-HC-REC-02 ──────► APP-HC-REC-03    │
│  Recruitment            PKWT Contracts        Onboarding         │
│  Pipeline               (Auto-trigger)        Checklist          │
│       │                      │                      │            │
│       │                      │                      │            │
│       ▼                      ▼                      ▼            │
│  [Status: hired]      [Contract Active]     [Onboarding Done]   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PAYROLL & BENEFITS                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  APP-HC-OPE-01 ──────► APP-HC-PAY-01                           │
│  Timesheets             Payroll Slips                            │
│  (Auto-calculate)       (Auto-generate)                          │
│       │                      │                                   │
│       │                      ▼                                   │
│       │              APP-HC-PAY-03                              │
│       │              BPJS Admin                                  │
│       │              (Monthly contribution)                      │
│       │                                                          │
│       ▼                                                          │
│  APP-HC-OPE-02                                                  │
│  Client Shifts                                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  PERFORMANCE & DEVELOPMENT                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  APP-HC-PRF-01 ──────► APP-HC-PRF-02                           │
│  Performance            Turnover Logs                            │
│  Appraisals             (Exit tracking)                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Module 1.1: Recruitment & Onboarding Workflow

### Workflow 1.1.1: Recruitment to Contract

**Trigger:** Kandidat diterima (status = 'hired')

**Alur:**
1. **APP-HC-REC-01** (Recruitment Pipeline)
   - Status berubah menjadi 'hired'
   - Trigger otomatis: `trg_update_recruitment_on_contract`

2. **APP-HC-REC-02** (PKWT Contracts)
   - Sistem membuat draf kontrak otomatis
   - Field yang di-auto-fill:
     - `candidate_id` ← dari recruitment_pipeline.id
     - `position` ← dari recruitment_pipeline.position
     - `client_id` ← dari recruitment_pipeline.client_id
   - Field yang perlu diisi manual:
     - `contract_number` (format: PKWT-YYYY-NNN)
     - `start_date`
     - `end_date`
     - `salary`
     - `working_hours`
     - `working_days`

**Contoh SQL:**
```sql
-- Trigger otomatis update status recruitment
CREATE TRIGGER trg_update_recruitment_on_contract
AFTER INSERT ON pkwt_contracts
FOR EACH ROW
EXECUTE FUNCTION fn_update_recruitment_status_on_contract();

-- Function untuk update status
CREATE OR REPLACE FUNCTION fn_update_recruitment_status_on_contract()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE recruitment_pipeline
    SET status = 'hired', hired_date = CURRENT_TIMESTAMP
    WHERE id = NEW.candidate_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Frontend Implementation:**
```typescript
// Ketika kontrak dibuat
const handleCreateContract = async (contractData: CreatePKWTContractDTO) => {
  // 1. Create contract
  const contract = await api.createPKWTContract(contractData);
  
  // 2. Trigger otomatis akan update recruitment status ke 'hired'
  // Trigger ini berjalan di database level
  
  // 3. Redirect ke onboarding checklist
  navigate(`/onboarding/${contract.candidate_id}`);
};
```

---

### Workflow 1.1.2: Contract to Onboarding

**Trigger:** Kontrak dibuat (status = 'draft' atau 'active')

**Alur:**
1. **APP-HC-REC-02** (PKWT Contracts)
   - Kontrak dibuat dengan status 'draft'
   - User dapat mengubah status menjadi 'active'

2. **APP-HC-REC-03** (Onboarding Checklists)
   - Sistem membuat checklist onboarding otomatis
   - Field yang di-auto-fill:
     - `employee_id` ← dari pkwt_contracts.candidate_id
     - `contract_id` ← dari pkwt_contracts.id
   - Semua status item di-set ke 'pending'
   - `completion_percentage` di-set ke 0

**Contoh SQL:**
```sql
-- Trigger otomatis create onboarding checklist
CREATE TRIGGER trg_create_onboarding_on_contract
AFTER INSERT ON pkwt_contracts
FOR EACH ROW
EXECUTE FUNCTION fn_create_onboarding_checklist();

-- Function untuk create onboarding checklist
CREATE OR REPLACE FUNCTION fn_create_onboarding_checklist()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO onboarding_checklists (
        employee_id, 
        contract_id, 
        status, 
        completion_percentage
    ) VALUES (
        NEW.candidate_id,
        NEW.id,
        'in_progress',
        0
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Frontend Implementation:**
```typescript
// Ketika kontrak di-activate
const handleActivateContract = async (contractId: number) => {
  // 1. Update contract status
  await api.updatePKWTContract(contractId, { status: 'active' });
  
  // 2. Trigger otomatis akan create onboarding checklist
  // Trigger ini berjalan di database level
  
  // 3. Redirect ke onboarding checklist
  navigate(`/onboarding/${contractId}`);
};
```

---

### Workflow 1.1.3: Onboarding Completion Tracking

**Trigger:** Status item onboarding berubah

**Alur:**
1. **APP-HC-REC-03** (Onboarding Checklists)
   - User update status item (misal: ktp_status = 'verified')
   - Trigger otomatis: `trg_calculate_onboarding_completion`
   - Sistem menghitung `completion_percentage` otomatis
   - Jika completion = 100%, status otomatis berubah menjadi 'completed'

**Contoh SQL:**
```sql
-- Trigger otomatis calculate completion percentage
CREATE TRIGGER trg_calculate_onboarding_completion
BEFORE INSERT OR UPDATE ON onboarding_checklists
FOR EACH ROW
EXECUTE FUNCTION fn_calculate_onboarding_completion();

-- Function untuk calculate completion
CREATE OR REPLACE FUNCTION fn_calculate_onboarding_completion()
RETURNS TRIGGER AS $$
DECLARE
    total_items INTEGER := 10;
    completed_items INTEGER := 0;
BEGIN
    -- Count completed items
    IF NEW.ktp_status = 'verified' THEN completed_items := completed_items + 1; END IF;
    IF NEW.npwp_status = 'verified' THEN completed_items := completed_items + 1; END IF;
    IF NEW.kk_status = 'verified' THEN completed_items := completed_items + 1; END IF;
    IF NEW.ijazah_status = 'verified' THEN completed_items := completed_items + 1; END IF;
    IF NEW.skck_status = 'verified' THEN completed_items := completed_items + 1; END IF;
    IF NEW.uniform_status = 'distributed' THEN completed_items := completed_items + 1; END IF;
    IF NEW.apd_status = 'distributed' THEN completed_items := completed_items + 1; END IF;
    IF NEW.equipment_status = 'distributed' THEN completed_items := completed_items + 1; END IF;
    IF NEW.k3_training_status = 'completed' THEN completed_items := completed_items + 1; END IF;
    IF NEW.company_orientation_status = 'completed' THEN completed_items := completed_items + 1; END IF;
    
    NEW.completion_percentage := (completed_items * 100) / total_items;
    
    IF NEW.completion_percentage = 100 THEN
        NEW.status := 'completed';
        NEW.completed_date := CURRENT_TIMESTAMP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Frontend Implementation:**
```typescript
// Ketika update status item onboarding
const handleUpdateOnboardingItem = async (
  checklistId: number, 
  field: keyof UpdateOnboardingChecklistDTO,
  value: string
) => {
  // 1. Update item status
  await api.updateOnboardingChecklist(checklistId, { [field]: value });
  
  // 2. Trigger otomatis akan calculate completion percentage
  // Trigger ini berjalan di database level
  
  // 3. Refresh data untuk melihat progress
  const checklist = await api.getOnboardingChecklist(checklistId);
  setCompletionPercentage(checklist.completion_percentage);
  
  // 4. Jika completion = 100%, show success message
  if (data.completion_percentage === 100) {
    toast.success('Onboarding completed!');
  }
};
```

---

## 💰 Module 1.2: Payroll & Benefits Workflow

### Workflow 1.2.1: Timesheet to Payroll

**Trigger:** Timesheet di-approve (status = 'approved')

**Alur:**
1. **APP-HC-OPE-01** (Timesheets)
   - User input timesheet harian
   - Supervisor approve timesheet
   - Status berubah menjadi 'approved'

2. **APP-HC-PAY-01** (Payroll Slips)
   - Di akhir periode (misal: akhir bulan), sistem generate payroll slip
   - Field yang di-auto-calculate:
     - `overtime_pay` = `overtime_hours` × `overtime_rate`
     - `gross_salary` = `base_salary` + `overtime_pay` + `allowance` + `bonus`
     - `total_deductions` = `bpjs_health` + `bpjs_employment` + `pph21` + `other_deductions`
     - `net_salary` = `gross_salary` - `total_deductions`

**Contoh SQL:**
```sql
-- Trigger otomatis calculate payroll totals
CREATE TRIGGER trg_calculate_payroll_totals
BEFORE INSERT OR UPDATE ON payroll_slips
FOR EACH ROW
EXECUTE FUNCTION fn_calculate_payroll_totals();

-- Function untuk calculate payroll totals
CREATE OR REPLACE FUNCTION fn_calculate_payroll_totals()
RETURNS TRIGGER AS $$
BEGIN
    NEW.overtime_pay := NEW.overtime_hours * NEW.overtime_rate;
    NEW.gross_salary := NEW.base_salary + NEW.overtime_pay + NEW.allowance + NEW.bonus;
    NEW.total_deductions := NEW.bpjs_health + NEW.bpjs_employment + NEW.pph21 + NEW.other_deductions;
    NEW.net_salary := NEW.gross_salary - NEW.total_deductions;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Frontend Implementation:**
```typescript
// Generate payroll slip di akhir bulan
const handleGeneratePayroll = async (period: string) => {
  // 1. Get all approved timesheets for the period
  const timesheets = await api.getTimesheets({ 
    payroll_period: period,
    status: 'approved'
  });
  
  // 2. Group by employee
  const groupedByEmployee = groupBy(timesheets, 'employee_id');
  
  // 3. Create payroll slip for each employee
  for (const [employeeId, employeeTimesheets] of Object.entries(groupedByEmployee)) {
    // Calculate totals from timesheets
    const totalWorkHours = sum(employeeTimesheets, 'work_hours');
    const totalOvertimeHours = sum(employeeTimesheets, 'overtime_hours');
    
    // Get employee contract for base salary
    const contract = await api.getPKWTContract(employeeId);
    
    // Create payroll slip
    const payrollData: CreatePayrollSlipDTO = {
      employee_id: Number(employeeId),
      contract_id: contract.id,
      payroll_period: period,
      payroll_date: new Date(),
      base_salary: contract.salary,
      overtime_hours: totalOvertimeHours,
      overtime_rate: contract.overtime_rate || 0,
      allowance: contract.allowance || 0,
      // BPJS dan PPh21 akan di-calculate oleh trigger
    };
    
    await api.createPayrollSlip(payrollData);
    // Trigger otomatis akan calculate totals
  }
  
  toast.success('Payroll generated successfully!');
};
```

---

### Workflow 1.2.2: Payroll to BPJS

**Trigger:** Payroll slip dibuat (status = 'pending')

**Alur:**
1. **APP-HC-PAY-01** (Payroll Slips)
   - Payroll slip dibuat dengan data BPJS
   - Field: `bpjs_health`, `bpjs_employment`

2. **APP-HC-PAY-03** (BPJS Admin)
   - Sistem update monthly contribution
   - Field yang di-update:
     - `bpjs_tk_employee` ← dari payroll_slips.bpjs_employment
     - `bpjs_kes_employee` ← dari payroll_slips.bpjs_health

**Frontend Implementation:**
```typescript
// Update BPJS contribution dari payroll
const handleUpdateBPJSFromPayroll = async (payrollId: number) => {
  // 1. Get payroll slip
  const payroll = await api.getPayrollSlip(payrollId);
  
  // 2. Get or create BPJS admin record
  let bpjsAdmin = await api.getBPJSAdmin(payroll.employee_id);
  
  if (!bpjsAdmin) {
    // Create new BPJS admin record
    bpjsAdmin = await api.createBPJSAdmin({
      employee_id: payroll.employee_id,
      bpjs_tk_employee: payroll.bpjs_employment,
      bpjs_kes_employee: payroll.bpjs_health,
    });
  } else {
    // Update existing BPJS admin record
    await api.updateBPJSAdmin(bpjsAdmin.id, {
      bpjs_tk_employee: payroll.bpjs_employment,
      bpjs_kes_employee: payroll.bpjs_health,
    });
  }
  
  toast.success('BPJS contribution updated!');
};
```

---

### Workflow 1.2.3: Quotation to Contract

**Trigger:** Quotation accepted (status = 'accepted')

**Alur:**
1. **APP-HC-PAY-02** (Outsourcing Quotations)
   - Quotation di-accept oleh client
   - Status berubah menjadi 'accepted'

2. **APP-HC-REC-01** (Recruitment Pipeline)
   - Sistem create recruitment pipeline untuk setiap headcount
   - Field yang di-auto-fill:
     - `position` ← dari quotation
     - `client_id` ← dari quotation.client_id

**Frontend Implementation:**
```typescript
// Ketika quotation di-accept
const handleAcceptQuotation = async (quotationId: number) => {
  // 1. Update quotation status
  await api.updateOutsourcingQuotation(quotationId, { status: 'accepted' });
  
  // 2. Get quotation details
  const quotation = await api.getOutsourcingQuotation(quotationId);
  
  // 3. Create recruitment pipeline for each headcount
  for (let i = 0; i < quotation.headcount; i++) {
    await api.createRecruitmentPipeline({
      candidate_name: `Position ${i + 1}`, // Placeholder
      candidate_email: `position${i + 1}@example.com`, // Placeholder
      position: quotation.position || 'TBD',
      client_id: quotation.client_id,
      notes: `From quotation ${quotation.quotation_number}`,
    });
  }
  
  toast.success('Recruitment pipelines created!');
  navigate('/recruitment');
};
```

---

## ⭐ Module 1.3: Performance & Development Workflow

### Workflow 1.3.1: Performance Appraisal to Grade

**Trigger:** Performance appraisal dibuat atau di-update

**Alur:**
1. **APP-HC-PRF-01** (Performance Appraisals)
   - User input performance metrics
   - Trigger otomatis: `trg_calculate_appraisal_grade`
   - Sistem calculate `overall_score` dan `grade` otomatis

**Contoh SQL:**
```sql
-- Trigger otomatis calculate appraisal grade
CREATE TRIGGER trg_calculate_appraisal_grade
BEFORE INSERT OR UPDATE ON performance_appraisals
FOR EACH ROW
EXECUTE FUNCTION fn_calculate_appraisal_grade();

-- Function untuk calculate appraisal grade
CREATE OR REPLACE FUNCTION fn_calculate_appraisal_grade()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate overall score as average of all metrics
    NEW.overall_score := (
        NEW.quality_score + 
        NEW.productivity_score + 
        NEW.attendance_score + 
        NEW.teamwork_score + 
        NEW.initiative_score + 
        NEW.communication_score
    ) / 6;
    
    -- Assign grade based on overall score
    IF NEW.overall_score >= 90 THEN
        NEW.grade := 'A';
    ELSIF NEW.overall_score >= 80 THEN
        NEW.grade := 'B';
    ELSIF NEW.overall_score >= 70 THEN
        NEW.grade := 'C';
    ELSIF NEW.overall_score >= 60 THEN
        NEW.grade := 'D';
    ELSE
        NEW.grade := 'E';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Frontend Implementation:**
```typescript
// Ketika create/update performance appraisal
const handleSaveAppraisal = async (appraisalData: CreatePerformanceAppraisalDTO) => {
  // 1. Create/update appraisal
  const appraisal = await api.createPerformanceAppraisal(appraisalData);
  
  // 2. Trigger otomatis akan calculate overall_score dan grade
  // Trigger ini berjalan di database level
  
  // 3. Refresh data untuk melihat grade
  const updatedAppraisal = await api.getPerformanceAppraisal(appraisal.id);
  
  // 4. Show grade to user
  toast.success(`Appraisal saved! Grade: ${updatedAppraisal.grade}`);
};
```

---

### Workflow 1.3.2: Exit to Turnover Log

**Trigger:** Employee exit (resignation, termination, contract expired)

**Alur:**
1. **APP-HC-REC-02** (PKWT Contracts)
   - Contract status berubah menjadi 'expired' atau 'terminated'

2. **APP-HC-PRF-02** (Turnover Logs)
   - Sistem create turnover log otomatis
   - Field yang di-auto-fill:
     - `employee_id` ← dari contract.candidate_id
     - `log_type` = 'exit'
     - `log_date` = contract.termination_date atau contract.end_date
     - `exit_category` ← berdasarkan reason

**Frontend Implementation:**
```typescript
// Ketika contract di-terminate atau expired
const handleTerminateContract = async (contractId: number, reason: string) => {
  // 1. Update contract status
  await api.updatePKWTContract(contractId, { 
    status: 'terminated',
    termination_date: new Date(),
    termination_reason: reason,
  });
  
  // 2. Create turnover log
  const contract = await api.getPKWTContract(contractId);
  
  let exitCategory: ExitCategory;
  if (reason.includes('resign')) {
    exitCategory = 'resignation';
  } else if (reason.includes('terminate')) {
    exitCategory = 'termination';
  } else {
    exitCategory = 'other';
  }
  
  await api.createTurnoverLog({
    employee_id: contract.candidate_id,
    log_type: 'exit',
    log_date: new Date(),
    exit_reason: reason,
    exit_category: exitCategory,
  });
  
  toast.success('Exit process completed!');
};
```

---

## 🏭 Module 1.4: Workforce Operations Workflow

### Workflow 1.4.1: Timesheet to Payroll (Sudah dijelaskan di 1.2.1)

### Workflow 1.4.2: Deployment to Medical Checkup

**Trigger:** Deployment planned (status = 'planned')

**Alur:**
1. **APP-HC-OPE-03** (Deployment Planners)
   - Deployment di-plan untuk employee
   - Status = 'planned'

2. **APP-HC-OPE-05** (Medical Checkups)
   - Sistem create medical checkup record
   - Field yang di-auto-fill:
     - `employee_id` ← dari deployment.employee_id
     - `checkup_type` = 'mcu'
     - `checkup_date` ← dari deployment.deployment_date (misal: H-7)

**Frontend Implementation:**
```typescript
// Ketika deployment di-plan
const handlePlanDeployment = async (deploymentData: CreateDeploymentPlannerDTO) => {
  // 1. Create deployment plan
  const deployment = await api.createDeploymentPlanner(deploymentData);
  
  // 2. Schedule medical checkup (H-7 before deployment)
  const checkupDate = new Date(deployment.deployment_date);
  checkupDate.setDate(checkupDate.getDate() - 7);
  
  await api.createMedicalCheckup({
    employee_id: deployment.employee_id,
    checkup_type: 'mcu',
    checkup_date: checkupDate,
    notes: `Pre-deployment MCU for ${deployment.site_location}`,
  });
  
  toast.success('Deployment planned and MCU scheduled!');
};
```

---

### Workflow 1.4.3: Grievance Resolution Tracking

**Trigger:** Grievance created (status = 'open')

**Alur:**
1. **APP-HC-OPE-04** (Employee Grievances)
   - Employee submit grievance
   - Status = 'open'
   - HR assign to handler
   - Status berubah menjadi 'in_progress'
   - Handler resolve grievance
   - Status berubah menjadi 'resolved'
   - Employee rate satisfaction
   - Status berubah menjadi 'closed'

**Frontend Implementation:**
```typescript
// Workflow grievance resolution
const handleGrievanceWorkflow = async (
  grievanceId: number,
  action: 'assign' | 'resolve' | 'rate',
  data?: any
) => {
  switch (action) {
    case 'assign':
      await api.updateEmployeeGrievance(grievanceId, {
        assigned_to: data.handlerId,
        status: 'in_progress',
      });
      toast.success('Grievance assigned!');
      break;
      
    case 'resolve':
      await api.updateEmployeeGrievance(grievanceId, {
        resolution: data.resolution,
        resolution_date: new Date(),
        status: 'resolved',
      });
      toast.success('Grievance resolved!');
      break;
      
    case 'rate':
      await api.updateEmployeeGrievance(grievanceId, {
        satisfaction_rating: data.rating,
        status: 'closed',
      });
      toast.success('Thank you for your feedback!');
      break;
  }
};
```

---

## 📈 Reporting & Analytics Workflow

### Workflow: Monthly Payroll Report

**Trigger:** End of month

**Alur:**
1. **APP-HC-PAY-01** (Payroll Slips)
   - Get all payroll slips for the month
   - Aggregate data

2. **View: v_monthly_payroll_summary**
   - View otomatis aggregate data
   - Return summary report

**SQL Query:**
```sql
-- Get monthly payroll summary
SELECT * FROM v_monthly_payroll_summary
WHERE payroll_period = '2026-01';
```

**Frontend Implementation:**
```typescript
// Generate monthly payroll report
const handleGenerateMonthlyReport = async (period: string) => {
  const summary = await api.getMonthlyPayrollSummary(period);
  
  // Display report
  setReportData({
    period: summary.payroll_period,
    totalEmployees: summary.total_employees,
    totalGrossSalary: summary.total_gross_salary,
    totalDeductions: summary.total_deductions,
    totalNetSalary: summary.total_net_salary,
  });
  
  // Export to PDF/Excel
  await exportReport(summary, 'pdf');
};
```

---

### Workflow: Turnover Analysis Report

**Trigger:** Quarterly review

**Alur:**
1. **APP-HC-PRF-02** (Turnover Logs)
   - Get all turnover logs for the quarter
   - Aggregate data by month and category

2. **View: v_turnover_analysis**
   - View otomatis aggregate data
   - Return turnover analysis

**SQL Query:**
```sql
-- Get turnover analysis for Q1 2026
SELECT * FROM v_turnover_analysis
WHERE year = 2026 AND month BETWEEN 1 AND 3;
```

**Frontend Implementation:**
```typescript
// Generate turnover analysis report
const handleGenerateTurnoverReport = async (year: number, quarter: number) => {
  const startMonth = (quarter - 1) * 3 + 1;
  const endMonth = startMonth + 2;
  
  const analysis = await api.getTurnoverAnalysis(year, startMonth, endMonth);
  
  // Display chart
  setChartData(analysis);
  
  // Export to PDF
  await exportReport(analysis, 'pdf');
};
```

---

## 🔗 Cross-Module Integration

### Integration 1: Recruitment → Onboarding → Payroll

**Scenario:** New employee hired dan mulai bekerja

**Flow:**
1. Recruitment Pipeline → Status: 'hired'
2. PKWT Contract → Created → Status: 'active'
3. Onboarding Checklist → Created → Completion: 100%
4. Timesheet → Daily input → Status: 'approved'
5. Payroll Slip → Generated → Status: 'paid'

**Implementation:**
```typescript
// Complete employee lifecycle
const handleEmployeeLifecycle = async () => {
  // 1. Hire candidate
  const recruitment = await api.updateRecruitmentPipeline(candidateId, {
    status: 'hired',
    hired_date: new Date(),
  });
  
  // 2. Create contract
  const contract = await api.createPKWTContract({
    candidate_id: candidateId,
    contract_number: generateContractNumber(),
    position: recruitment.position,
    start_date: new Date(),
    end_date: addYears(new Date(), 1),
    salary: 5000000,
  });
  
  // 3. Onboarding checklist auto-created by trigger
  
  // 4. Complete onboarding
  await api.updateOnboardingChecklist(checklistId, {
    ktp_status: 'verified',
    npwp_status: 'verified',
    // ... other items
  });
  
  // 5. Start timesheet
  await api.createTimesheet({
    employee_id: candidateId,
    work_date: new Date(),
    shift_type: 'day',
    work_hours: 8,
  });
  
  // 6. Generate payroll at end of month
  await handleGeneratePayroll('2026-01');
};
```

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         DATABASE LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ recruitment  │  │ pkwt_        │  │ onboarding   │          │
│  │ _pipeline    │─►│ contracts    │─►│ _checklists  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         │                                      │                │
│         │                                      │                │
│         ▼                                      ▼                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ timesheets   │  │ payroll_     │  │ bpjs_admin   │          │
│  │              │─►│ slips        │─►│              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         │                                      │                │
│         │                                      │                │
│         ▼                                      ▼                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ performance  │  │ turnover_    │  │ grievances   │          │
│  │ _appraisals  │  │ logs         │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        TRIGGER LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  • trg_update_recruitment_on_contract                           │
│  • trg_create_onboarding_on_contract                            │
│  • trg_calculate_onboarding_completion                          │
│  • trg_calculate_payroll_totals                                 │
│  • trg_calculate_appraisal_grade                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         VIEW LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  • v_employee_summary                                           │
│  • v_monthly_payroll_summary                                    │
│  • v_recruitment_pipeline_status                                │
│  • v_turnover_analysis                                          │
│  • v_grievance_summary                                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Best Practices

### 1. Data Consistency
- Gunakan foreign key constraints
- Gunakan trigger untuk auto-calculate
- Gunakan transaction untuk multi-step operations

### 2. Performance
- Gunakan index untuk frequently queried columns
- Gunakan view untuk complex queries
- Gunakan pagination untuk large datasets

### 3. Security
- Gunakan role-based access control
- Validate all inputs
- Use parameterized queries

### 4. Maintainability
- Document all triggers and functions
- Use consistent naming conventions
- Write unit tests for triggers

---

## 📚 References

- PostgreSQL Documentation: https://www.postgresql.org/docs/
- TypeScript Documentation: https://www.typescriptlang.org/docs/
- React Documentation: https://react.dev/

---

**Document Version:** 1.0  
**Last Updated:** 2026-01-09  
**Author:** PERADA Tools Development Team
