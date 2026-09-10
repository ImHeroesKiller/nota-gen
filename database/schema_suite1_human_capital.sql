-- ============================================================================
-- PERADA Tools - Database Schema
-- Suite 1: Human Capital & Outsourcing
-- Version: 1.0
-- Date: 2026-01-09
-- ============================================================================

-- ============================================================================
-- MODULE 1.1: RECRUITMENT & ONBOARDING (HC-REC)
-- ============================================================================

-- APP-HC-REC-01: recruitment_pipeline
-- Tabel untuk tracking proses rekrutmen kandidat
CREATE TABLE IF NOT EXISTS recruitment_pipeline (
    id SERIAL PRIMARY KEY,
    candidate_name VARCHAR(255) NOT NULL,
    candidate_email VARCHAR(255) NOT NULL,
    candidate_phone VARCHAR(20),
    position VARCHAR(255) NOT NULL,
    client_id INTEGER,
    status VARCHAR(50) NOT NULL DEFAULT 'applied',
    -- Status values: applied, screening, interview, test, offered, hired, rejected
    applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    screening_date TIMESTAMP,
    interview_date TIMESTAMP,
    test_date TIMESTAMP,
    offered_date TIMESTAMP,
    hired_date TIMESTAMP,
    rejected_date TIMESTAMP,
    rejection_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_recruitment_status CHECK (
        status IN ('applied', 'screening', 'interview', 'test', 'offered', 'hired', 'rejected')
    ),
    CONSTRAINT uk_candidate_email UNIQUE (candidate_email)
);

-- Indexes for recruitment_pipeline
CREATE INDEX IF NOT EXISTS idx_recruitment_status ON recruitment_pipeline(status);
CREATE INDEX IF NOT EXISTS idx_recruitment_position ON recruitment_pipeline(position);
CREATE INDEX IF NOT EXISTS idx_recruitment_client ON recruitment_pipeline(client_id);
CREATE INDEX IF NOT EXISTS idx_recruitment_applied_date ON recruitment_pipeline(applied_date);

-- APP-HC-REC-02: pkwt_contracts
-- Tabel untuk kontrak PKWT karyawan
CREATE TABLE IF NOT EXISTS pkwt_contracts (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER NOT NULL,
    contract_number VARCHAR(100) NOT NULL UNIQUE,
    contract_type VARCHAR(50) NOT NULL DEFAULT 'PKWT',
    position VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    client_id INTEGER,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    salary DECIMAL(15, 2) NOT NULL,
    salary_type VARCHAR(50) DEFAULT 'monthly',
    -- salary_type values: monthly, daily, hourly
    working_hours INTEGER DEFAULT 40,
    working_days INTEGER DEFAULT 5,
    overtime_rate DECIMAL(10, 2),
    allowance DECIMAL(15, 2) DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    -- Status values: draft, active, expired, terminated
    signed_date DATE,
    termination_date DATE,
    termination_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_pkwt_candidate FOREIGN KEY (candidate_id) 
        REFERENCES recruitment_pipeline(id) ON DELETE CASCADE,
    
    -- Constraints
    CONSTRAINT chk_contract_status CHECK (
        status IN ('draft', 'active', 'expired', 'terminated')
    ),
    CONSTRAINT chk_contract_dates CHECK (end_date > start_date),
    CONSTRAINT chk_contract_salary CHECK (salary > 0)
);

-- Indexes for pkwt_contracts
CREATE INDEX IF NOT EXISTS idx_pkwt_candidate ON pkwt_contracts(candidate_id);
CREATE INDEX IF NOT EXISTS idx_pkwt_status ON pkwt_contracts(status);
CREATE INDEX IF NOT EXISTS idx_pkwt_contract_number ON pkwt_contracts(contract_number);
CREATE INDEX IF NOT EXISTS idx_pkwt_dates ON pkwt_contracts(start_date, end_date);

-- APP-HC-REC-03: onboarding_checklists
-- Tabel untuk tracking proses onboarding karyawan
CREATE TABLE IF NOT EXISTS onboarding_checklists (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    contract_id INTEGER NOT NULL,
    -- Document Status
    ktp_status VARCHAR(20) DEFAULT 'pending',
    npwp_status VARCHAR(20) DEFAULT 'pending',
    kk_status VARCHAR(20) DEFAULT 'pending',
    ijazah_status VARCHAR(20) DEFAULT 'pending',
    skck_status VARCHAR(20) DEFAULT 'pending',
    -- Uniform & Equipment Status
    uniform_status VARCHAR(20) DEFAULT 'pending',
    apd_status VARCHAR(20) DEFAULT 'pending',
    equipment_status VARCHAR(20) DEFAULT 'pending',
    -- Training Status
    k3_training_status VARCHAR(20) DEFAULT 'pending',
    company_orientation_status VARCHAR(20) DEFAULT 'pending',
    -- Overall Status
    status VARCHAR(50) NOT NULL DEFAULT 'in_progress',
    -- Status values: in_progress, completed, pending_review
    completion_percentage INTEGER DEFAULT 0,
    completed_date TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_onboarding_employee FOREIGN KEY (employee_id) 
        REFERENCES recruitment_pipeline(id) ON DELETE CASCADE,
    CONSTRAINT fk_onboarding_contract FOREIGN KEY (contract_id) 
        REFERENCES pkwt_contracts(id) ON DELETE CASCADE,
    
    -- Constraints
    CONSTRAINT chk_onboarding_status CHECK (
        status IN ('in_progress', 'completed', 'pending_review')
    ),
    CONSTRAINT chk_document_status CHECK (
        ktp_status IN ('pending', 'submitted', 'verified', 'rejected') AND
        npwp_status IN ('pending', 'submitted', 'verified', 'rejected') AND
        kk_status IN ('pending', 'submitted', 'verified', 'rejected') AND
        ijazah_status IN ('pending', 'submitted', 'verified', 'rejected') AND
        skck_status IN ('pending', 'submitted', 'verified', 'rejected')
    ),
    CONSTRAINT chk_uniform_status CHECK (
        uniform_status IN ('pending', 'distributed', 'returned') AND
        apd_status IN ('pending', 'distributed', 'returned') AND
        equipment_status IN ('pending', 'distributed', 'returned')
    ),
    CONSTRAINT chk_training_status CHECK (
        k3_training_status IN ('pending', 'scheduled', 'completed') AND
        company_orientation_status IN ('pending', 'scheduled', 'completed')
    ),
    CONSTRAINT chk_completion_percentage CHECK (
        completion_percentage >= 0 AND completion_percentage <= 100
    )
);

-- Indexes for onboarding_checklists
CREATE INDEX IF NOT EXISTS idx_onboarding_employee ON onboarding_checklists(employee_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_contract ON onboarding_checklists(contract_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_status ON onboarding_checklists(status);

-- ============================================================================
-- MODULE 1.2: PAYROLL & BENEFITS (HC-PAY)
-- ============================================================================

-- APP-HC-PAY-01: payroll_slips
-- Tabel untuk slip gaji karyawan
CREATE TABLE IF NOT EXISTS payroll_slips (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    contract_id INTEGER NOT NULL,
    payroll_period VARCHAR(20) NOT NULL,
    -- Format: YYYY-MM
    payroll_date DATE NOT NULL,
    -- Income Components
    base_salary DECIMAL(15, 2) NOT NULL DEFAULT 0,
    overtime_hours DECIMAL(5, 2) DEFAULT 0,
    overtime_rate DECIMAL(10, 2) DEFAULT 0,
    overtime_pay DECIMAL(15, 2) DEFAULT 0,
    allowance DECIMAL(15, 2) DEFAULT 0,
    bonus DECIMAL(15, 2) DEFAULT 0,
    -- Deduction Components
    bpjs_health DECIMAL(15, 2) DEFAULT 0,
    bpjs_employment DECIMAL(15, 2) DEFAULT 0,
    pph21 DECIMAL(15, 2) DEFAULT 0,
    other_deductions DECIMAL(15, 2) DEFAULT 0,
    -- Totals
    gross_salary DECIMAL(15, 2) NOT NULL,
    total_deductions DECIMAL(15, 2) NOT NULL,
    net_salary DECIMAL(15, 2) NOT NULL,
    -- Payment Info
    payment_method VARCHAR(50) DEFAULT 'transfer',
    payment_date DATE,
    payment_status VARCHAR(50) DEFAULT 'pending',
    -- Status values: pending, processed, paid
    bank_name VARCHAR(100),
    account_number VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_payroll_employee FOREIGN KEY (employee_id) 
        REFERENCES recruitment_pipeline(id) ON DELETE CASCADE,
    CONSTRAINT fk_payroll_contract FOREIGN KEY (contract_id) 
        REFERENCES pkwt_contracts(id) ON DELETE CASCADE,
    
    -- Constraints
    CONSTRAINT chk_payroll_status CHECK (
        payment_status IN ('pending', 'processed', 'paid')
    ),
    CONSTRAINT chk_payroll_totals CHECK (
        net_salary = gross_salary - total_deductions
    )
);

-- Indexes for payroll_slips
CREATE INDEX IF NOT EXISTS idx_payroll_employee ON payroll_slips(employee_id);
CREATE INDEX IF NOT EXISTS idx_payroll_contract ON payroll_slips(contract_id);
CREATE INDEX IF NOT EXISTS idx_payroll_period ON payroll_slips(payroll_period);
CREATE INDEX IF NOT EXISTS idx_payroll_date ON payroll_slips(payroll_date);
CREATE INDEX IF NOT EXISTS idx_payroll_status ON payroll_slips(payment_status);

-- APP-HC-PAY-02: outsourcing_quotations
-- Tabel untuk quotation outsourcing ke klien
CREATE TABLE IF NOT EXISTS outsourcing_quotations (
    id SERIAL PRIMARY KEY,
    quotation_number VARCHAR(100) NOT NULL UNIQUE,
    client_id INTEGER NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    quotation_date DATE NOT NULL,
    valid_until DATE NOT NULL,
    -- Quotation Details
    headcount INTEGER NOT NULL,
    umk_rate DECIMAL(15, 2) NOT NULL,
    bpjs_rate DECIMAL(5, 2) DEFAULT 11.00,
    -- Percentage
    management_fee DECIMAL(5, 2) NOT NULL,
    -- Percentage
    -- Calculations
    total_salary DECIMAL(15, 2) NOT NULL,
    total_bpjs DECIMAL(15, 2) NOT NULL,
    total_management_fee DECIMAL(15, 2) NOT NULL,
    total_billing DECIMAL(15, 2) NOT NULL,
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    -- Status values: draft, sent, accepted, rejected, expired
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_quotation_status CHECK (
        status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')
    ),
    CONSTRAINT chk_quotation_dates CHECK (valid_until > quotation_date),
    CONSTRAINT chk_quotation_headcount CHECK (headcount > 0),
    CONSTRAINT chk_quotation_rates CHECK (
        umk_rate > 0 AND 
        bpjs_rate >= 0 AND 
        management_fee >= 0
    )
);

-- Indexes for outsourcing_quotations
CREATE INDEX IF NOT EXISTS idx_quotation_client ON outsourcing_quotations(client_id);
CREATE INDEX IF NOT EXISTS idx_quotation_number ON outsourcing_quotations(quotation_number);
CREATE INDEX IF NOT EXISTS idx_quotation_status ON outsourcing_quotations(status);
CREATE INDEX IF NOT EXISTS idx_quotation_date ON outsourcing_quotations(quotation_date);

-- APP-HC-PAY-03: bpjs_admin
-- Tabel untuk administrasi BPJS karyawan
CREATE TABLE IF NOT EXISTS bpjs_admin (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    -- BPJS Ketenagakerjaan
    bpjs_tk_no VARCHAR(50),
    bpjs_tk_status VARCHAR(50) DEFAULT 'active',
    bpjs_tk_registered_date DATE,
    -- BPJS Kesehatan
    bpjs_kes_no VARCHAR(50),
    bpjs_kes_status VARCHAR(50) DEFAULT 'active',
    bpjs_kes_registered_date DATE,
    -- Monthly Contributions
    bpjs_tk_employee DECIMAL(15, 2) DEFAULT 0,
    bpjs_tk_employer DECIMAL(15, 2) DEFAULT 0,
    bpjs_kes_employee DECIMAL(15, 2) DEFAULT 0,
    bpjs_kes_employer DECIMAL(15, 2) DEFAULT 0,
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    -- Status values: active, inactive, terminated
    termination_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_bpjs_employee FOREIGN KEY (employee_id) 
        REFERENCES recruitment_pipeline(id) ON DELETE CASCADE,
    
    -- Constraints
    CONSTRAINT chk_bpjs_status CHECK (
        status IN ('active', 'inactive', 'terminated') AND
        bpjs_tk_status IN ('active', 'inactive', 'terminated') AND
        bpjs_kes_status IN ('active', 'inactive', 'terminated')
    )
);

-- Indexes for bpjs_admin
CREATE INDEX IF NOT EXISTS idx_bpjs_employee ON bpjs_admin(employee_id);
CREATE INDEX IF NOT EXISTS idx_bpjs_status ON bpjs_admin(status);
CREATE INDEX IF NOT EXISTS idx_bpjs_tk_no ON bpjs_admin(bpjs_tk_no);
CREATE INDEX IF NOT EXISTS idx_bpjs_kes_no ON bpjs_admin(bpjs_kes_no);

-- ============================================================================
-- MODULE 1.3: PERFORMANCE & DEVELOPMENT (HC-PRF)
-- ============================================================================

-- APP-HC-PRF-01: performance_appraisals
-- Tabel untuk penilaian kinerja karyawan
CREATE TABLE IF NOT EXISTS performance_appraisals (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    appraisal_period VARCHAR(20) NOT NULL,
    -- Format: YYYY-Q1, YYYY-Q2, etc.
    evaluation_date DATE NOT NULL,
    evaluator_name VARCHAR(255) NOT NULL,
    evaluator_position VARCHAR(255),
    -- Performance Metrics
    quality_score DECIMAL(5, 2) DEFAULT 0,
    -- 0-100
    productivity_score DECIMAL(5, 2) DEFAULT 0,
    -- 0-100
    attendance_score DECIMAL(5, 2) DEFAULT 0,
    -- 0-100
    teamwork_score DECIMAL(5, 2) DEFAULT 0,
    -- 0-100
    initiative_score DECIMAL(5, 2) DEFAULT 0,
    -- 0-100
    communication_score DECIMAL(5, 2) DEFAULT 0,
    -- 0-100
    -- Overall Score
    overall_score DECIMAL(5, 2) NOT NULL,
    -- 0-100
    grade VARCHAR(2),
    -- A, B, C, D, E
    -- Feedback
    strengths TEXT,
    improvements TEXT,
    goals_next_period TEXT,
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    -- Status values: draft, submitted, reviewed, approved
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_appraisal_employee FOREIGN KEY (employee_id) 
        REFERENCES recruitment_pipeline(id) ON DELETE CASCADE,
    
    -- Constraints
    CONSTRAINT chk_appraisal_scores CHECK (
        quality_score >= 0 AND quality_score <= 100 AND
        productivity_score >= 0 AND productivity_score <= 100 AND
        attendance_score >= 0 AND attendance_score <= 100 AND
        teamwork_score >= 0 AND teamwork_score <= 100 AND
        initiative_score >= 0 AND initiative_score <= 100 AND
        communication_score >= 0 AND communication_score <= 100 AND
        overall_score >= 0 AND overall_score <= 100
    ),
    CONSTRAINT chk_appraisal_status CHECK (
        status IN ('draft', 'submitted', 'reviewed', 'approved')
    )
);

-- Indexes for performance_appraisals
CREATE INDEX IF NOT EXISTS idx_appraisal_employee ON performance_appraisals(employee_id);
CREATE INDEX IF NOT EXISTS idx_appraisal_period ON performance_appraisals(appraisal_period);
CREATE INDEX IF NOT EXISTS idx_appraisal_date ON performance_appraisals(evaluation_date);
CREATE INDEX IF NOT EXISTS idx_appraisal_status ON performance_appraisals(status);

-- APP-HC-PRF-02: turnover_logs
-- Tabel untuk tracking keluar-masuk karyawan
CREATE TABLE IF NOT EXISTS turnover_logs (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    log_type VARCHAR(50) NOT NULL,
    -- log_type values: entry, exit
    log_date DATE NOT NULL,
    -- Entry Details
    entry_position VARCHAR(255),
    entry_client VARCHAR(255),
    entry_contract_id INTEGER,
    -- Exit Details
    exit_date DATE,
    exit_reason VARCHAR(255),
    exit_category VARCHAR(50),
    -- exit_category values: resignation, termination, contract_expired, other
    replacement_status VARCHAR(50) DEFAULT 'not_started',
    -- replacement_status values: not_started, in_progress, completed, not_required
    replacement_employee_id INTEGER,
    exit_interview_done BOOLEAN DEFAULT FALSE,
    exit_interview_notes TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_turnover_employee FOREIGN KEY (employee_id) 
        REFERENCES recruitment_pipeline(id) ON DELETE CASCADE,
    CONSTRAINT fk_turnover_contract FOREIGN KEY (entry_contract_id) 
        REFERENCES pkwt_contracts(id) ON DELETE SET NULL,
    CONSTRAINT fk_turnover_replacement FOREIGN KEY (replacement_employee_id) 
        REFERENCES recruitment_pipeline(id) ON DELETE SET NULL,
    
    -- Constraints
    CONSTRAINT chk_turnover_type CHECK (log_type IN ('entry', 'exit')),
    CONSTRAINT chk_turnover_exit_category CHECK (
        exit_category IN ('resignation', 'termination', 'contract_expired', 'other') OR
        exit_category IS NULL
    ),
    CONSTRAINT chk_turnover_replacement_status CHECK (
        replacement_status IN ('not_started', 'in_progress', 'completed', 'not_required')
    )
);

-- Indexes for turnover_logs
CREATE INDEX IF NOT EXISTS idx_turnover_employee ON turnover_logs(employee_id);
CREATE INDEX IF NOT EXISTS idx_turnover_type ON turnover_logs(log_type);
CREATE INDEX IF NOT EXISTS idx_turnover_date ON turnover_logs(log_date);
CREATE INDEX IF NOT EXISTS idx_turnover_exit_category ON turnover_logs(exit_category);

-- ============================================================================
-- MODULE 1.4: WORKFORCE OPERATIONS (HC-OPE)
-- ============================================================================

-- APP-HC-OPE-01: timesheets
-- Tabel untuk absensi dan lembur karyawan
CREATE TABLE IF NOT EXISTS timesheets (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    work_date DATE NOT NULL,
    shift_type VARCHAR(50) NOT NULL,
    -- shift_type values: day, night, overtime
    check_in TIME,
    check_out TIME,
    work_hours DECIMAL(4, 2) DEFAULT 0,
    overtime_hours DECIMAL(4, 2) DEFAULT 0,
    break_hours DECIMAL(4, 2) DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    -- status values: pending, approved, rejected
    approved_by INTEGER,
    approved_date TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_timesheet_employee FOREIGN KEY (employee_id) 
        REFERENCES recruitment_pipeline(id) ON DELETE CASCADE,
    CONSTRAINT fk_timesheet_approver FOREIGN KEY (approved_by) 
        REFERENCES recruitment_pipeline(id) ON DELETE SET NULL,
    
    -- Constraints
    CONSTRAINT chk_timesheet_status CHECK (status IN ('pending', 'approved', 'rejected')),
    CONSTRAINT chk_timesheet_hours CHECK (
        work_hours >= 0 AND 
        overtime_hours >= 0 AND 
        break_hours >= 0
    ),
    CONSTRAINT uk_timesheet_date UNIQUE (employee_id, work_date, shift_type)
);

-- Indexes for timesheets
CREATE INDEX IF NOT EXISTS idx_timesheet_employee ON timesheets(employee_id);
CREATE INDEX IF NOT EXISTS idx_timesheet_date ON timesheets(work_date);
CREATE INDEX IF NOT EXISTS idx_timesheet_status ON timesheets(status);

-- APP-HC-OPE-02: client_shifts
-- Tabel untuk penjadwalan shift karyawan di client
CREATE TABLE IF NOT EXISTS client_shifts (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    client_id INTEGER NOT NULL,
    client_location VARCHAR(255) NOT NULL,
    shift_date DATE NOT NULL,
    shift_type VARCHAR(50) NOT NULL,
    -- shift_type values: day, night, rotating
    shift_start TIME NOT NULL,
    shift_end TIME NOT NULL,
    break_start TIME,
    break_end TIME,
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled',
    -- status values: scheduled, completed, cancelled, no_show
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_shift_employee FOREIGN KEY (employee_id) 
        REFERENCES recruitment_pipeline(id) ON DELETE CASCADE,
    
    -- Constraints
    CONSTRAINT chk_shift_status CHECK (
        status IN ('scheduled', 'completed', 'cancelled', 'no_show')
    ),
    CONSTRAINT chk_shift_time CHECK (shift_end > shift_start)
);

-- Indexes for client_shifts
CREATE INDEX IF NOT EXISTS idx_shift_employee ON client_shifts(employee_id);
CREATE INDEX IF NOT EXISTS idx_shift_client ON client_shifts(client_id);
CREATE INDEX IF NOT EXISTS idx_shift_date ON client_shifts(shift_date);
CREATE INDEX IF NOT EXISTS idx_shift_status ON client_shifts(status);

-- APP-HC-OPE-03: deployment_planners
-- Tabel untuk planning deployment karyawan ke site
CREATE TABLE IF NOT EXISTS deployment_planners (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    site_location VARCHAR(255) NOT NULL,
    client_id INTEGER,
    deployment_date DATE NOT NULL,
    return_date DATE,
    deployment_type VARCHAR(50) NOT NULL,
    -- deployment_type values: permanent, temporary, project_based
    position VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'planned',
    -- status values: planned, in_progress, completed, cancelled
    -- Requirements Checklist
    mcu_completed BOOLEAN DEFAULT FALSE,
    k3_certified BOOLEAN DEFAULT FALSE,
    uniform_distributed BOOLEAN DEFAULT FALSE,
    equipment_distributed BOOLEAN DEFAULT FALSE,
    travel_arranged BOOLEAN DEFAULT FALSE,
    accommodation_arranged BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_deployment_employee FOREIGN KEY (employee_id) 
        REFERENCES recruitment_pipeline(id) ON DELETE CASCADE,
    
    -- Constraints
    CONSTRAINT chk_deployment_status CHECK (
        status IN ('planned', 'in_progress', 'completed', 'cancelled')
    ),
    CONSTRAINT chk_deployment_type CHECK (
        deployment_type IN ('permanent', 'temporary', 'project_based')
    )
);

-- Indexes for deployment_planners
CREATE INDEX IF NOT EXISTS idx_deployment_employee ON deployment_planners(employee_id);
CREATE INDEX IF NOT EXISTS idx_deployment_date ON deployment_planners(deployment_date);
CREATE INDEX IF NOT EXISTS idx_deployment_status ON deployment_planners(status);

-- APP-HC-OPE-04: employee_grievances
-- Tabel untuk pengaduan karyawan
CREATE TABLE IF NOT EXISTS employee_grievances (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    grievance_number VARCHAR(100) NOT NULL UNIQUE,
    grievance_date DATE NOT NULL,
    category VARCHAR(100) NOT NULL,
    -- category values: salary, working_conditions, supervision, benefits, other
    priority VARCHAR(50) NOT NULL DEFAULT 'medium',
    -- priority values: low, medium, high, critical
    description TEXT NOT NULL,
    expected_resolution TEXT,
    -- Resolution
    assigned_to INTEGER,
    resolution_date DATE,
    resolution TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'open',
    -- status values: open, in_progress, resolved, closed, rejected
    satisfaction_rating INTEGER,
    -- 1-5
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_grievance_employee FOREIGN KEY (employee_id) 
        REFERENCES recruitment_pipeline(id) ON DELETE CASCADE,
    CONSTRAINT fk_grievance_assignee FOREIGN KEY (assigned_to) 
        REFERENCES recruitment_pipeline(id) ON DELETE SET NULL,
    
    -- Constraints
    CONSTRAINT chk_grievance_category CHECK (
        category IN ('salary', 'working_conditions', 'supervision', 'benefits', 'other')
    ),
    CONSTRAINT chk_grievance_priority CHECK (
        priority IN ('low', 'medium', 'high', 'critical')
    ),
    CONSTRAINT chk_grievance_status CHECK (
        status IN ('open', 'in_progress', 'resolved', 'closed', 'rejected')
    ),
    CONSTRAINT chk_grievance_rating CHECK (
        satisfaction_rating >= 1 AND satisfaction_rating <= 5 OR
        satisfaction_rating IS NULL
    )
);

-- Indexes for employee_grievances
CREATE INDEX IF NOT EXISTS idx_grievance_employee ON employee_grievances(employee_id);
CREATE INDEX IF NOT EXISTS idx_grievance_number ON employee_grievances(grievance_number);
CREATE INDEX IF NOT EXISTS idx_grievance_category ON employee_grievances(category);
CREATE INDEX IF NOT EXISTS idx_grievance_priority ON employee_grievances(priority);
CREATE INDEX IF NOT EXISTS idx_grievance_status ON employee_grievances(status);

-- APP-HC-OPE-05: medical_checkups
-- Tabel untuk tracking MCU dan sertifikasi karyawan
CREATE TABLE IF NOT EXISTS medical_checkups (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    checkup_type VARCHAR(100) NOT NULL,
    -- checkup_type values: mcu, k3_certification, work_permit, other
    checkup_date DATE NOT NULL,
    provider VARCHAR(255),
    -- Results
    result VARCHAR(50) NOT NULL,
    -- result values: fit, unfit, conditional, pending
    fit_status VARCHAR(50) DEFAULT 'pending',
    -- fit_status values: fit, unfit, conditional, pending
    certificate_number VARCHAR(100),
    expiry_date DATE,
    -- Follow-up
    next_checkup_date DATE,
    recommendations TEXT,
    notes TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled',
    -- status values: scheduled, completed, expired, cancelled
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_medical_employee FOREIGN KEY (employee_id) 
        REFERENCES recruitment_pipeline(id) ON DELETE CASCADE,
    
    -- Constraints
    CONSTRAINT chk_medical_type CHECK (
        checkup_type IN ('mcu', 'k3_certification', 'work_permit', 'other')
    ),
    CONSTRAINT chk_medical_result CHECK (
        result IN ('fit', 'unfit', 'conditional', 'pending')
    ),
    CONSTRAINT chk_medical_fit_status CHECK (
        fit_status IN ('fit', 'unfit', 'conditional', 'pending')
    ),
    CONSTRAINT chk_medical_status CHECK (
        status IN ('scheduled', 'completed', 'expired', 'cancelled')
    )
);

-- Indexes for medical_checkups
CREATE INDEX IF NOT EXISTS idx_medical_employee ON medical_checkups(employee_id);
CREATE INDEX IF NOT EXISTS idx_medical_type ON medical_checkups(checkup_type);
CREATE INDEX IF NOT EXISTS idx_medical_date ON medical_checkups(checkup_date);
CREATE INDEX IF NOT EXISTS idx_medical_expiry ON medical_checkups(expiry_date);
CREATE INDEX IF NOT EXISTS idx_medical_status ON medical_checkups(status);

-- ============================================================================
-- VIEWS FOR REPORTING
-- ============================================================================

-- View: Employee Summary
CREATE OR REPLACE VIEW v_employee_summary AS
SELECT 
    rp.id as employee_id,
    rp.candidate_name,
    rp.candidate_email,
    rp.position,
    pc.contract_number,
    pc.status as contract_status,
    pc.start_date as contract_start,
    pc.end_date as contract_end,
    oc.status as onboarding_status,
    oc.completion_percentage,
    ba.status as bpjs_status,
    COUNT(DISTINCT ts.id) as total_timesheets,
    SUM(ts.work_hours) as total_work_hours,
    SUM(ts.overtime_hours) as total_overtime_hours,
    AVG(pa.overall_score) as avg_performance_score
FROM recruitment_pipeline rp
LEFT JOIN pkwt_contracts pc ON rp.id = pc.candidate_id
LEFT JOIN onboarding_checklists oc ON rp.id = oc.employee_id
LEFT JOIN bpjs_admin ba ON rp.id = ba.employee_id
LEFT JOIN timesheets ts ON rp.id = ts.employee_id
LEFT JOIN performance_appraisals pa ON rp.id = pa.employee_id
GROUP BY 
    rp.id, rp.candidate_name, rp.candidate_email, rp.position,
    pc.contract_number, pc.status, pc.start_date, pc.end_date,
    oc.status, oc.completion_percentage, ba.status;

-- View: Monthly Payroll Summary
CREATE OR REPLACE VIEW v_monthly_payroll_summary AS
SELECT 
    ps.payroll_period,
    COUNT(DISTINCT ps.employee_id) as total_employees,
    SUM(ps.base_salary) as total_base_salary,
    SUM(ps.overtime_pay) as total_overtime_pay,
    SUM(ps.allowance) as total_allowance,
    SUM(ps.gross_salary) as total_gross_salary,
    SUM(ps.bpjs_health) as total_bpjs_health,
    SUM(ps.bpjs_employment) as total_bpjs_employment,
    SUM(ps.pph21) as total_pph21,
    SUM(ps.total_deductions) as total_deductions,
    SUM(ps.net_salary) as total_net_salary
FROM payroll_slips ps
GROUP BY ps.payroll_period
ORDER BY ps.payroll_period DESC;

-- View: Recruitment Pipeline Status
CREATE OR REPLACE VIEW v_recruitment_pipeline_status AS
SELECT 
    status,
    COUNT(*) as total_candidates,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM recruitment_pipeline
GROUP BY status
ORDER BY 
    CASE status
        WHEN 'applied' THEN 1
        WHEN 'screening' THEN 2
        WHEN 'interview' THEN 3
        WHEN 'test' THEN 4
        WHEN 'offered' THEN 5
        WHEN 'hired' THEN 6
        WHEN 'rejected' THEN 7
    END;

-- View: Turnover Analysis
CREATE OR REPLACE VIEW v_turnover_analysis AS
SELECT 
    EXTRACT(YEAR FROM log_date) as year,
    EXTRACT(MONTH FROM log_date) as month,
    log_type,
    exit_category,
    COUNT(*) as total_count
FROM turnover_logs
WHERE log_type = 'exit'
GROUP BY 
    EXTRACT(YEAR FROM log_date),
    EXTRACT(MONTH FROM log_date),
    log_type,
    exit_category
ORDER BY year DESC, month DESC;

-- View: Grievance Summary
CREATE OR REPLACE VIEW v_grievance_summary AS
SELECT 
    category,
    priority,
    status,
    COUNT(*) as total_grievances,
    AVG(satisfaction_rating) as avg_satisfaction,
    AVG(EXTRACT(DAY FROM resolution_date - grievance_date)) as avg_resolution_days
FROM employee_grievances
GROUP BY category, priority, status
ORDER BY category, priority;

-- ============================================================================
-- TRIGGERS FOR AUTOMATION
-- ============================================================================

-- Trigger: Auto-update recruitment status when contract is created
CREATE OR REPLACE FUNCTION fn_update_recruitment_status_on_contract()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE recruitment_pipeline
    SET status = 'hired', hired_date = CURRENT_TIMESTAMP
    WHERE id = NEW.candidate_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_recruitment_on_contract
AFTER INSERT ON pkwt_contracts
FOR EACH ROW
EXECUTE FUNCTION fn_update_recruitment_status_on_contract();

-- Trigger: Auto-calculate payroll totals
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

CREATE TRIGGER trg_calculate_payroll_totals
BEFORE INSERT OR UPDATE ON payroll_slips
FOR EACH ROW
EXECUTE FUNCTION fn_calculate_payroll_totals();

-- Trigger: Auto-calculate onboarding completion percentage
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

CREATE TRIGGER trg_calculate_onboarding_completion
BEFORE INSERT OR UPDATE ON onboarding_checklists
FOR EACH ROW
EXECUTE FUNCTION fn_calculate_onboarding_completion();

-- Trigger: Auto-update appraisal grade based on score
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

CREATE TRIGGER trg_calculate_appraisal_grade
BEFORE INSERT OR UPDATE ON performance_appraisals
FOR EACH ROW
EXECUTE FUNCTION fn_calculate_appraisal_grade();

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Insert sample recruitment data
INSERT INTO recruitment_pipeline (candidate_name, candidate_email, position, status)
VALUES 
    ('John Doe', 'john.doe@example.com', 'Security Guard', 'hired'),
    ('Jane Smith', 'jane.smith@example.com', 'Cleaning Service', 'interview'),
    ('Bob Johnson', 'bob.johnson@example.com', 'Driver', 'applied');

-- Insert sample contract data
INSERT INTO pkwt_contracts (candidate_id, contract_number, position, start_date, end_date, salary, status)
VALUES 
    (1, 'PKWT-2026-001', 'Security Guard', '2026-01-01', '2026-12-31', 5000000, 'active');

-- Insert sample onboarding data
INSERT INTO onboarding_checklists (employee_id, contract_id, status)
VALUES 
    (1, 1, 'in_progress');

-- Insert sample timesheet data
INSERT INTO timesheets (employee_id, work_date, shift_type, work_hours, overtime_hours, status)
VALUES 
    (1, '2026-01-09', 'day', 8, 2, 'approved'),
    (1, '2026-01-10', 'day', 8, 0, 'approved');

-- Insert sample payroll data
INSERT INTO payroll_slips (employee_id, contract_id, payroll_period, payroll_date, base_salary, overtime_hours, overtime_rate, allowance, status)
VALUES 
    (1, 1, '2026-01', '2026-01-31', 5000000, 10, 25000, 500000, 'pending');

-- Insert sample BPJS data
INSERT INTO bpjs_admin (employee_id, bpjs_tk_no, bpjs_kes_no, status)
VALUES 
    (1, 'TK-123456789', 'KES-987654321', 'active');

-- ============================================================================
-- MODULE 1.5: DOCUMENT GENERATION FOR OUTSOURCING (HC-DOC)
-- ============================================================================

-- APP-HC-DOC-01: sla_documents
-- Tabel untuk dokumen Service Level Agreement dengan klien
CREATE TABLE IF NOT EXISTS sla_documents (
    id SERIAL PRIMARY KEY,
    sla_number VARCHAR(100) NOT NULL UNIQUE,
    client_id INTEGER,
    client_name VARCHAR(255) NOT NULL,
    service_type VARCHAR(255) NOT NULL,
    -- Service Details
    service_description TEXT NOT NULL,
    service_period_start DATE NOT NULL,
    service_period_end DATE NOT NULL,
    -- SLA Metrics
    response_time INTEGER, -- in minutes
    resolution_time INTEGER, -- in hours
    availability_percentage DECIMAL(5, 2) DEFAULT 99.00,
    -- Penalties
    penalty_clause TEXT,
    penalty_amount DECIMAL(15, 2),
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    -- Status values: draft, sent, accepted, active, expired, terminated
    signed_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_sla_status CHECK (
        status IN ('draft', 'sent', 'accepted', 'active', 'expired', 'terminated')
    ),
    CONSTRAINT chk_sla_dates CHECK (service_period_end > service_period_start),
    CONSTRAINT chk_sla_metrics CHECK (
        response_time > 0 AND
        resolution_time > 0 AND
        availability_percentage >= 0 AND
        availability_percentage <= 100
    )
);

-- Indexes for sla_documents
CREATE INDEX IF NOT EXISTS idx_sla_client ON sla_documents(client_id);
CREATE INDEX IF NOT EXISTS idx_sla_number ON sla_documents(sla_number);
CREATE INDEX IF NOT EXISTS idx_sla_status ON sla_documents(status);
CREATE INDEX IF NOT EXISTS idx_sla_dates ON sla_documents(service_period_start, service_period_end);

-- APP-HC-DOC-02: work_orders
-- Tabel untuk work order dari klien
CREATE TABLE IF NOT EXISTS work_orders (
    id SERIAL PRIMARY KEY,
    wo_number VARCHAR(100) NOT NULL UNIQUE,
    client_id INTEGER,
    client_name VARCHAR(255) NOT NULL,
    wo_date DATE NOT NULL,
    -- Work Details
    work_title VARCHAR(255) NOT NULL,
    work_description TEXT NOT NULL,
    work_type VARCHAR(100),
    -- Resource Requirements
    required_manpower INTEGER DEFAULT 1,
    required_skills TEXT,
    -- Timeline
    start_date DATE,
    end_date DATE,
    estimated_hours INTEGER,
    -- Cost
    hourly_rate DECIMAL(15, 2),
    total_cost DECIMAL(15, 2),
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    -- Status values: pending, approved, in_progress, completed, cancelled
    approved_date DATE,
    completed_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_wo_status CHECK (
        status IN ('pending', 'approved', 'in_progress', 'completed', 'cancelled')
    ),
    CONSTRAINT chk_wo_dates CHECK (end_date >= start_date OR end_date IS NULL),
    CONSTRAINT chk_wo_cost CHECK (total_cost >= 0)
);

-- Indexes for work_orders
CREATE INDEX IF NOT EXISTS idx_wo_client ON work_orders(client_id);
CREATE INDEX IF NOT EXISTS idx_wo_number ON work_orders(wo_number);
CREATE INDEX IF NOT EXISTS idx_wo_status ON work_orders(status);
CREATE INDEX IF NOT EXISTS idx_wo_date ON work_orders(wo_date);

-- APP-HC-DOC-03: client_proposals
-- Tabel untuk proposal ke klien
CREATE TABLE IF NOT EXISTS client_proposals (
    id SERIAL PRIMARY KEY,
    proposal_number VARCHAR(100) NOT NULL UNIQUE,
    client_id INTEGER,
    client_name VARCHAR(255) NOT NULL,
    proposal_date DATE NOT NULL,
    valid_until DATE NOT NULL,
    -- Proposal Details
    proposal_title VARCHAR(255) NOT NULL,
    proposal_description TEXT NOT NULL,
    service_type VARCHAR(100),
    -- Manpower
    total_manpower INTEGER DEFAULT 1,
    -- Cost Breakdown
    manpower_cost DECIMAL(15, 2) DEFAULT 0,
    operational_cost DECIMAL(15, 2) DEFAULT 0,
    management_fee DECIMAL(15, 2) DEFAULT 0,
    total_cost DECIMAL(15, 2) NOT NULL,
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    -- Status values: draft, sent, negotiated, accepted, rejected, expired
    sent_date DATE,
    negotiated_date DATE,
    accepted_date DATE,
    rejection_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_proposal_status CHECK (
        status IN ('draft', 'sent', 'negotiated', 'accepted', 'rejected', 'expired')
    ),
    CONSTRAINT chk_proposal_dates CHECK (valid_until > proposal_date),
    CONSTRAINT chk_proposal_cost CHECK (total_cost >= 0)
);

-- Indexes for client_proposals
CREATE INDEX IF NOT EXISTS idx_proposal_client ON client_proposals(client_id);
CREATE INDEX IF NOT EXISTS idx_proposal_number ON client_proposals(proposal_number);
CREATE INDEX IF NOT EXISTS idx_proposal_status ON client_proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposal_date ON client_proposals(proposal_date);

-- ============================================================================
-- TRIGGERS FOR DOCUMENT GENERATION MODULE
-- ============================================================================

-- Trigger: Auto-update proposal status when accepted
CREATE OR REPLACE FUNCTION fn_update_proposal_on_accept()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
        NEW.accepted_date := CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_proposal_on_accept
BEFORE UPDATE ON client_proposals
FOR EACH ROW
EXECUTE FUNCTION fn_update_proposal_on_accept();

-- Trigger: Auto-update work order status
CREATE OR REPLACE FUNCTION fn_update_wo_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        NEW.approved_date := CURRENT_TIMESTAMP;
    ELSIF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        NEW.completed_date := CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_wo_status
BEFORE UPDATE ON work_orders
FOR EACH ROW
EXECUTE FUNCTION fn_update_wo_status();

-- ============================================================================
-- SAMPLE DATA FOR DOCUMENT GENERATION (Optional - for testing)
-- ============================================================================

-- Insert sample SLA data
INSERT INTO sla_documents (sla_number, client_name, service_type, service_description, service_period_start, service_period_end, response_time, resolution_time, availability_percentage, status)
VALUES 
    ('SLA-2026-001', 'PT ABC Manufacturing', 'Security Services', 'Penyediaan jasa security untuk pabrik', '2026-01-01', '2026-12-31', 15, 24, 99.50, 'active'),
    ('SLA-2026-002', 'PT XYZ Tower', 'Cleaning Services', 'Penyediaan jasa cleaning service untuk gedung perkantoran', '2026-01-01', '2026-12-31', 30, 48, 99.00, 'active');

-- Insert sample work order data
INSERT INTO work_orders (wo_number, client_name, wo_date, work_title, work_description, work_type, required_manpower, start_date, end_date, estimated_hours, hourly_rate, total_cost, status)
VALUES 
    ('WO-2026-001', 'PT ABC Manufacturing', '2026-01-05', 'Event Security', 'Penyediaan security untuk event perusahaan', 'event', 10, '2026-01-15', '2026-01-15', 80, 25000, 2000000, 'approved'),
    ('WO-2026-002', 'PT XYZ Tower', '2026-01-08', 'Deep Cleaning', 'Deep cleaning untuk seluruh lantai', 'cleaning', 5, '2026-01-20', '2026-01-22', 120, 20000, 2400000, 'pending');

-- Insert sample proposal data
INSERT INTO client_proposals (proposal_number, client_name, proposal_date, valid_until, proposal_title, proposal_description, service_type, total_manpower, manpower_cost, operational_cost, management_fee, total_cost, status)
VALUES 
    ('PROP-2026-001', 'PT DEF Corporation', '2026-01-10', '2026-02-10', 'Outsourcing Security Services', 'Proposal penyediaan jasa security untuk 1 tahun', 'security', 20, 1200000000, 120000000, 120000000, 1440000000, 'sent'),
    ('PROP-2026-002', 'PT GHI Building', '2026-01-12', '2026-02-12', 'Outsourcing Cleaning Services', 'Proposal penyediaan jasa cleaning service untuk 1 tahun', 'cleaning', 15, 900000000, 90000000, 90000000, 1080000000, 'draft');

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
