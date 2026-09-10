// ============================================================================
// PERADA Tools - TypeScript Type Definitions
// Suite 1: Human Capital & Outsourcing
// Version: 1.0
// Date: 2026-01-09
// ============================================================================

// ============================================================================
// MODULE 1.1: RECRUITMENT & ONBOARDING (HC-REC)
// ============================================================================

// APP-HC-REC-01: recruitment_pipeline
export type RecruitmentStatus = 
  | 'applied' 
  | 'screening' 
  | 'interview' 
  | 'test' 
  | 'offered' 
  | 'hired' 
  | 'rejected';

export interface RecruitmentPipeline {
  id: number;
  candidate_name: string;
  candidate_email: string;
  candidate_phone?: string;
  position: string;
  client_id?: number;
  status: RecruitmentStatus;
  applied_date: Date;
  screening_date?: Date;
  interview_date?: Date;
  test_date?: Date;
  offered_date?: Date;
  hired_date?: Date;
  rejected_date?: Date;
  rejection_reason?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateRecruitmentPipelineDTO {
  candidate_name: string;
  candidate_email: string;
  candidate_phone?: string;
  position: string;
  client_id?: number;
  notes?: string;
}

export interface UpdateRecruitmentPipelineDTO {
  status?: RecruitmentStatus;
  screening_date?: Date;
  interview_date?: Date;
  test_date?: Date;
  offered_date?: Date;
  hired_date?: Date;
  rejected_date?: Date;
  rejection_reason?: string;
  notes?: string;
}

// APP-HC-REC-02: pkwt_contracts
export type ContractType = 'PKWT' | 'PKWTT';
export type SalaryType = 'monthly' | 'daily' | 'hourly';
export type ContractStatus = 'draft' | 'active' | 'expired' | 'terminated';

export interface PKWTContract {
  id: number;
  candidate_id: number;
  contract_number: string;
  contract_type: ContractType;
  position: string;
  department?: string;
  client_id?: number;
  start_date: Date;
  end_date: Date;
  salary: number;
  salary_type: SalaryType;
  working_hours: number;
  working_days: number;
  overtime_rate?: number;
  allowance: number;
  status: ContractStatus;
  signed_date?: Date;
  termination_date?: Date;
  termination_reason?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePKWTContractDTO {
  candidate_id: number;
  contract_number: string;
  contract_type?: ContractType;
  position: string;
  department?: string;
  client_id?: number;
  start_date: Date;
  end_date: Date;
  salary: number;
  salary_type?: SalaryType;
  working_hours?: number;
  working_days?: number;
  overtime_rate?: number;
  allowance?: number;
  notes?: string;
}

export interface UpdatePKWTContractDTO {
  status?: ContractStatus;
  signed_date?: Date;
  termination_date?: Date;
  termination_reason?: string;
  notes?: string;
}

// APP-HC-REC-03: onboarding_checklists
export type DocumentStatus = 'pending' | 'submitted' | 'verified' | 'rejected';
export type UniformStatus = 'pending' | 'distributed' | 'returned';
export type TrainingStatus = 'pending' | 'scheduled' | 'completed';
export type OnboardingStatus = 'in_progress' | 'completed' | 'pending_review';

export interface OnboardingChecklist {
  id: number;
  employee_id: number;
  contract_id: number;
  // Document Status
  ktp_status: DocumentStatus;
  npwp_status: DocumentStatus;
  kk_status: DocumentStatus;
  ijazah_status: DocumentStatus;
  skck_status: DocumentStatus;
  // Uniform & Equipment Status
  uniform_status: UniformStatus;
  apd_status: UniformStatus;
  equipment_status: UniformStatus;
  // Training Status
  k3_training_status: TrainingStatus;
  company_orientation_status: TrainingStatus;
  // Overall Status
  status: OnboardingStatus;
  completion_percentage: number;
  completed_date?: Date;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface UpdateOnboardingChecklistDTO {
  ktp_status?: DocumentStatus;
  npwp_status?: DocumentStatus;
  kk_status?: DocumentStatus;
  ijazah_status?: DocumentStatus;
  skck_status?: DocumentStatus;
  uniform_status?: UniformStatus;
  apd_status?: UniformStatus;
  equipment_status?: UniformStatus;
  k3_training_status?: TrainingStatus;
  company_orientation_status?: TrainingStatus;
  notes?: string;
}

// ============================================================================
// MODULE 1.2: PAYROLL & BENEFITS (HC-PAY)
// ============================================================================

// APP-HC-PAY-01: payroll_slips
export type PaymentMethod = 'transfer' | 'cash' | 'check';
export type PaymentStatus = 'pending' | 'processed' | 'paid';

export interface PayrollSlip {
  id: number;
  employee_id: number;
  contract_id: number;
  payroll_period: string; // Format: YYYY-MM
  payroll_date: Date;
  // Income Components
  base_salary: number;
  overtime_hours: number;
  overtime_rate: number;
  overtime_pay: number;
  allowance: number;
  bonus: number;
  // Deduction Components
  bpjs_health: number;
  bpjs_employment: number;
  pph21: number;
  other_deductions: number;
  // Totals
  gross_salary: number;
  total_deductions: number;
  net_salary: number;
  // Payment Info
  payment_method: PaymentMethod;
  payment_date?: Date;
  payment_status: PaymentStatus;
  bank_name?: string;
  account_number?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePayrollSlipDTO {
  employee_id: number;
  contract_id: number;
  payroll_period: string;
  payroll_date: Date;
  base_salary: number;
  overtime_hours?: number;
  overtime_rate?: number;
  allowance?: number;
  bonus?: number;
  bpjs_health?: number;
  bpjs_employment?: number;
  pph21?: number;
  other_deductions?: number;
  payment_method?: PaymentMethod;
  bank_name?: string;
  account_number?: string;
  notes?: string;
}

export interface UpdatePayrollSlipDTO {
  payment_status?: PaymentStatus;
  payment_date?: Date;
  notes?: string;
}

// APP-HC-PAY-02: outsourcing_quotations
export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';

export interface OutsourcingQuotation {
  id: number;
  quotation_number: string;
  client_id: number;
  client_name: string;
  quotation_date: Date;
  valid_until: Date;
  // Quotation Details
  headcount: number;
  umk_rate: number;
  bpjs_rate: number;
  management_fee: number;
  // Calculations
  total_salary: number;
  total_bpjs: number;
  total_management_fee: number;
  total_billing: number;
  // Status
  status: QuotationStatus;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateOutsourcingQuotationDTO {
  quotation_number: string;
  client_id: number;
  client_name: string;
  quotation_date: Date;
  valid_until: Date;
  headcount: number;
  umk_rate: number;
  bpjs_rate?: number;
  management_fee: number;
  notes?: string;
}

export interface UpdateOutsourcingQuotationDTO {
  status?: QuotationStatus;
  notes?: string;
}

// APP-HC-PAY-03: bpjs_admin
export type BPJSStatus = 'active' | 'inactive' | 'terminated';

export interface BPJSAdmin {
  id: number;
  employee_id: number;
  // BPJS Ketenagakerjaan
  bpjs_tk_no?: string;
  bpjs_tk_status: BPJSStatus;
  bpjs_tk_registered_date?: Date;
  // BPJS Kesehatan
  bpjs_kes_no?: string;
  bpjs_kes_status: BPJSStatus;
  bpjs_kes_registered_date?: Date;
  // Monthly Contributions
  bpjs_tk_employee: number;
  bpjs_tk_employer: number;
  bpjs_kes_employee: number;
  bpjs_kes_employer: number;
  // Status
  status: BPJSStatus;
  termination_date?: Date;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateBPJSAdminDTO {
  employee_id: number;
  bpjs_tk_no?: string;
  bpjs_tk_registered_date?: Date;
  bpjs_kes_no?: string;
  bpjs_kes_registered_date?: Date;
  bpjs_tk_employee?: number;
  bpjs_tk_employer?: number;
  bpjs_kes_employee?: number;
  bpjs_kes_employer?: number;
  notes?: string;
}

export interface UpdateBPJSAdminDTO {
  bpjs_tk_status?: BPJSStatus;
  bpjs_kes_status?: BPJSStatus;
  status?: BPJSStatus;
  termination_date?: Date;
  notes?: string;
}

// ============================================================================
// MODULE 1.3: PERFORMANCE & DEVELOPMENT (HC-PRF)
// ============================================================================

// APP-HC-PRF-01: performance_appraisals
export type AppraisalStatus = 'draft' | 'submitted' | 'reviewed' | 'approved';
export type PerformanceGrade = 'A' | 'B' | 'C' | 'D' | 'E';

export interface PerformanceAppraisal {
  id: number;
  employee_id: number;
  appraisal_period: string; // Format: YYYY-Q1, YYYY-Q2, etc.
  evaluation_date: Date;
  evaluator_name: string;
  evaluator_position?: string;
  // Performance Metrics (0-100)
  quality_score: number;
  productivity_score: number;
  attendance_score: number;
  teamwork_score: number;
  initiative_score: number;
  communication_score: number;
  // Overall Score
  overall_score: number;
  grade: PerformanceGrade;
  // Feedback
  strengths?: string;
  improvements?: string;
  goals_next_period?: string;
  // Status
  status: AppraisalStatus;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePerformanceAppraisalDTO {
  employee_id: number;
  appraisal_period: string;
  evaluation_date: Date;
  evaluator_name: string;
  evaluator_position?: string;
  quality_score: number;
  productivity_score: number;
  attendance_score: number;
  teamwork_score: number;
  initiative_score: number;
  communication_score: number;
  strengths?: string;
  improvements?: string;
  goals_next_period?: string;
  notes?: string;
}

export interface UpdatePerformanceAppraisalDTO {
  status?: AppraisalStatus;
  notes?: string;
}

// APP-HC-PRF-02: turnover_logs
export type TurnoverLogType = 'entry' | 'exit';
export type ExitCategory = 'resignation' | 'termination' | 'contract_expired' | 'other';
export type ReplacementStatus = 'not_started' | 'in_progress' | 'completed' | 'not_required';

export interface TurnoverLog {
  id: number;
  employee_id: number;
  log_type: TurnoverLogType;
  log_date: Date;
  // Entry Details
  entry_position?: string;
  entry_client?: string;
  entry_contract_id?: number;
  // Exit Details
  exit_date?: Date;
  exit_reason?: string;
  exit_category?: ExitCategory;
  replacement_status: ReplacementStatus;
  replacement_employee_id?: number;
  exit_interview_done: boolean;
  exit_interview_notes?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTurnoverLogDTO {
  employee_id: number;
  log_type: TurnoverLogType;
  log_date: Date;
  entry_position?: string;
  entry_client?: string;
  entry_contract_id?: number;
  exit_date?: Date;
  exit_reason?: string;
  exit_category?: ExitCategory;
  replacement_employee_id?: number;
  exit_interview_done?: boolean;
  exit_interview_notes?: string;
  notes?: string;
}

export interface UpdateTurnoverLogDTO {
  replacement_status?: ReplacementStatus;
  exit_interview_done?: boolean;
  exit_interview_notes?: string;
  notes?: string;
}

// ============================================================================
// MODULE 1.4: WORKFORCE OPERATIONS (HC-OPE)
// ============================================================================

// APP-HC-OPE-01: timesheets
export type ShiftType = 'day' | 'night' | 'overtime';
export type TimesheetStatus = 'pending' | 'approved' | 'rejected';

export interface Timesheet {
  id: number;
  employee_id: number;
  work_date: Date;
  shift_type: ShiftType;
  check_in?: string; // Time format: HH:MM
  check_out?: string; // Time format: HH:MM
  work_hours: number;
  overtime_hours: number;
  break_hours: number;
  status: TimesheetStatus;
  approved_by?: number;
  approved_date?: Date;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTimesheetDTO {
  employee_id: number;
  work_date: Date;
  shift_type: ShiftType;
  check_in?: string;
  check_out?: string;
  work_hours?: number;
  overtime_hours?: number;
  break_hours?: number;
  notes?: string;
}

export interface UpdateTimesheetDTO {
  status?: TimesheetStatus;
  approved_by?: number;
  approved_date?: Date;
  notes?: string;
}

// APP-HC-OPE-02: client_shifts
export type ClientShiftType = 'day' | 'night' | 'rotating';
export type ClientShiftStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show';

export interface ClientShift {
  id: number;
  employee_id: number;
  client_id: number;
  client_location: string;
  shift_date: Date;
  shift_type: ClientShiftType;
  shift_start: string; // Time format: HH:MM
  shift_end: string; // Time format: HH:MM
  break_start?: string;
  break_end?: string;
  status: ClientShiftStatus;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateClientShiftDTO {
  employee_id: number;
  client_id: number;
  client_location: string;
  shift_date: Date;
  shift_type: ClientShiftType;
  shift_start: string;
  shift_end: string;
  break_start?: string;
  break_end?: string;
  notes?: string;
}

export interface UpdateClientShiftDTO {
  status?: ClientShiftStatus;
  notes?: string;
}

// APP-HC-OPE-03: deployment_planners
export type DeploymentType = 'permanent' | 'temporary' | 'project_based';
export type DeploymentStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';

export interface DeploymentPlanner {
  id: number;
  employee_id: number;
  site_location: string;
  client_id?: number;
  deployment_date: Date;
  return_date?: Date;
  deployment_type: DeploymentType;
  position?: string;
  status: DeploymentStatus;
  // Requirements Checklist
  mcu_completed: boolean;
  k3_certified: boolean;
  uniform_distributed: boolean;
  equipment_distributed: boolean;
  travel_arranged: boolean;
  accommodation_arranged: boolean;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateDeploymentPlannerDTO {
  employee_id: number;
  site_location: string;
  client_id?: number;
  deployment_date: Date;
  return_date?: Date;
  deployment_type: DeploymentType;
  position?: string;
  notes?: string;
}

export interface UpdateDeploymentPlannerDTO {
  status?: DeploymentStatus;
  mcu_completed?: boolean;
  k3_certified?: boolean;
  uniform_distributed?: boolean;
  equipment_distributed?: boolean;
  travel_arranged?: boolean;
  accommodation_arranged?: boolean;
  notes?: string;
}

// APP-HC-OPE-04: employee_grievances
export type GrievanceCategory = 'salary' | 'working_conditions' | 'supervision' | 'benefits' | 'other';
export type GrievancePriority = 'low' | 'medium' | 'high' | 'critical';
export type GrievanceStatus = 'open' | 'in_progress' | 'resolved' | 'closed' | 'rejected';

export interface EmployeeGrievance {
  id: number;
  employee_id: number;
  grievance_number: string;
  grievance_date: Date;
  category: GrievanceCategory;
  priority: GrievancePriority;
  description: string;
  expected_resolution?: string;
  // Resolution
  assigned_to?: number;
  resolution_date?: Date;
  resolution?: string;
  status: GrievanceStatus;
  satisfaction_rating?: number; // 1-5
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateEmployeeGrievanceDTO {
  employee_id: number;
  grievance_number: string;
  grievance_date: Date;
  category: GrievanceCategory;
  priority?: GrievancePriority;
  description: string;
  expected_resolution?: string;
  notes?: string;
}

export interface UpdateEmployeeGrievanceDTO {
  assigned_to?: number;
  resolution_date?: Date;
  resolution?: string;
  status?: GrievanceStatus;
  satisfaction_rating?: number;
  notes?: string;
}

// APP-HC-OPE-05: medical_checkups
export type CheckupType = 'mcu' | 'k3_certification' | 'work_permit' | 'other';
export type CheckupResult = 'fit' | 'unfit' | 'conditional' | 'pending';
export type CheckupStatus = 'scheduled' | 'completed' | 'expired' | 'cancelled';

export interface MedicalCheckup {
  id: number;
  employee_id: number;
  checkup_type: CheckupType;
  checkup_date: Date;
  provider?: string;
  // Results
  result: CheckupResult;
  fit_status: CheckupResult;
  certificate_number?: string;
  expiry_date?: Date;
  // Follow-up
  next_checkup_date?: Date;
  recommendations?: string;
  notes?: string;
  status: CheckupStatus;
  created_at: Date;
  updated_at: Date;
}

export interface CreateMedicalCheckupDTO {
  employee_id: number;
  checkup_type: CheckupType;
  checkup_date: Date;
  provider?: string;
  next_checkup_date?: Date;
  notes?: string;
}

export interface UpdateMedicalCheckupDTO {
  result?: CheckupResult;
  fit_status?: CheckupResult;
  certificate_number?: string;
  expiry_date?: Date;
  recommendations?: string;
  status?: CheckupStatus;
  notes?: string;
}

// ============================================================================
// VIEW TYPES FOR REPORTING
// ============================================================================

export interface EmployeeSummary {
  employee_id: number;
  candidate_name: string;
  candidate_email: string;
  position: string;
  contract_number?: string;
  contract_status?: ContractStatus;
  contract_start?: Date;
  contract_end?: Date;
  onboarding_status?: OnboardingStatus;
  completion_percentage?: number;
  bpjs_status?: BPJSStatus;
  total_timesheets: number;
  total_work_hours: number;
  total_overtime_hours: number;
  avg_performance_score?: number;
}

export interface MonthlyPayrollSummary {
  payroll_period: string;
  total_employees: number;
  total_base_salary: number;
  total_overtime_pay: number;
  total_allowance: number;
  total_gross_salary: number;
  total_bpjs_health: number;
  total_bpjs_employment: number;
  total_pph21: number;
  total_deductions: number;
  total_net_salary: number;
}

export interface RecruitmentPipelineStatus {
  status: RecruitmentStatus;
  total_candidates: number;
  percentage: number;
}

export interface TurnoverAnalysis {
  year: number;
  month: number;
  log_type: TurnoverLogType;
  exit_category?: ExitCategory;
  total_count: number;
}

export interface GrievanceSummary {
  category: GrievanceCategory;
  priority: GrievancePriority;
  status: GrievanceStatus;
  total_grievances: number;
  avg_satisfaction?: number;
  avg_resolution_days?: number;
}

// ============================================================================
// MODULE 1.5: DOCUMENT GENERATION FOR OUTSOURCING (HC-DOC)
// ============================================================================

// APP-HC-DOC-01: sla_documents
export type SLAStatus = 'draft' | 'sent' | 'accepted' | 'active' | 'expired' | 'terminated';

export interface SLADocument {
  id: number;
  sla_number: string;
  client_id?: number;
  client_name: string;
  service_type: string;
  // Service Details
  service_description: string;
  service_period_start: string;
  service_period_end: string;
  // SLA Metrics
  response_time: number; // in minutes
  resolution_time: number; // in hours
  availability_percentage: number;
  // Penalties
  penalty_clause?: string;
  penalty_amount: number;
  // Status
  status: SLAStatus;
  signed_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSLADocumentDTO {
  sla_number: string;
  client_id?: number;
  client_name: string;
  service_type: string;
  service_description: string;
  service_period_start: string;
  service_period_end: string;
  response_time: number;
  resolution_time: number;
  availability_percentage: number;
  penalty_clause?: string;
  penalty_amount: number;
  notes?: string;
}

export interface UpdateSLADocumentDTO {
  status?: SLAStatus;
  signed_date?: Date;
  notes?: string;
}

// APP-HC-DOC-02: work_orders
export type WorkOrderStatus = 'pending' | 'approved' | 'in_progress' | 'completed' | 'cancelled';

export interface WorkOrder {
  id: number;
  wo_number: string;
  client_id?: number;
  client_name: string;
  wo_date: string;
  // Work Details
  work_title: string;
  work_description: string;
  work_type?: string;
  // Resource Requirements
  required_manpower: number;
  required_skills?: string;
  // Timeline
  start_date?: string;
  end_date?: string;
  estimated_hours?: number;
  // Cost
  hourly_rate: number;
  total_cost: number;
  // Status
  status: WorkOrderStatus;
  approved_date?: string;
  completed_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateWorkOrderDTO {
  wo_number: string;
  client_id?: number;
  client_name: string;
  wo_date: string;
  work_title: string;
  work_description: string;
  work_type?: string;
  required_manpower: number;
  required_skills?: string;
  start_date?: string;
  end_date?: string;
  estimated_hours: number;
  hourly_rate: number;
  total_cost: number;
  notes?: string;
}

export interface UpdateWorkOrderDTO {
  status?: WorkOrderStatus;
  notes?: string;
}

// APP-HC-DOC-03: client_proposals
export type ProposalStatus = 'draft' | 'sent' | 'negotiated' | 'accepted' | 'rejected' | 'expired';

export interface ClientProposal {
  id: number;
  proposal_number: string;
  client_id?: number;
  client_name: string;
  proposal_date: string;
  valid_until: string;
  // Proposal Details
  proposal_title: string;
  proposal_description: string;
  service_type?: string;
  // Manpower
  total_manpower: number;
  // Cost Breakdown
  manpower_cost: number;
  operational_cost: number;
  management_fee: number;
  total_cost: number;
  // Status
  status: ProposalStatus;
  sent_date?: string;
  negotiated_date?: string;
  accepted_date?: string;
  rejection_reason?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateClientProposalDTO {
  proposal_number: string;
  client_id?: number;
  client_name: string;
  proposal_date: string;
  valid_until: string;
  proposal_title: string;
  proposal_description: string;
  service_type?: string;
  total_manpower: number;
  manpower_cost: number;
  operational_cost: number;
  management_fee: number;
  total_cost: number;
  notes?: string;
}

export interface UpdateClientProposalDTO {
  status?: ProposalStatus;
  rejection_reason?: string;
  notes?: string;
}
