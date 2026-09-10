// New Hierarchical Structure: 5 Main Suites

export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  component: React.ComponentType<any>;
  workflow?: string[];
}

export interface Module {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  tools: Tool[];
}

export interface Suite {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  modules: Module[];
}

// Import all components
import PayrollSlipGenerator from './PayrollSlipGenerator';
import OutsourcingQuotation from './OutsourcingQuotation';
import TimesheetRekap from './TimesheetRekap';
import PkwtContractBuilder from './PkwtContractBuilder';
import RecruitmentPipeline from './RecruitmentPipeline';
import PerformanceAppraisal from './PerformanceAppraisal';
import BpjsAdminManager from './BpjsAdminManager';
import EmployeeGrievancePortal from './EmployeeGrievancePortal';
import TurnoverDashboard from './TurnoverDashboard';
import DeploymentPlanner from './DeploymentPlanner';
import ClientShiftScheduler from './ClientShiftScheduler';
import OnboardingComplianceChecklist from './OnboardingComplianceChecklist';
import MedicalCheckupTracker from './MedicalCheckupTracker';

import SuratJalanMaker from './SuratJalanMaker';
import UangJalanCalculator from './UangJalanCalculator';
import VehicleChecklist from './VehicleChecklist';
import TyreMaintenanceLog from './TyreMaintenanceLog';
import CbmCalculator from './CbmCalculator';
import FreightRateCalculator from './FreightRateCalculator';
import VisitorManagement from './VisitorManagement';
import AssetTracker from './AssetTracker';
import VendorDatabase from './VendorDatabase';
import PettyCashForm from './PettyCashForm';
import EventRundown from './EventRundown';

import HsCodeEstimator from './HsCodeEstimator';
import CustomsVault from './CustomsVault';
import IncotermsVisualizer from './IncotermsVisualizer';
import ShippingDocFormatter from './ShippingDocFormatter';
import BillOfLadingGenerator from './BillOfLadingGenerator';
import CertificateOfOriginGenerator from './CertificateOfOriginGenerator';

import InvoiceGenerator from './InvoiceGenerator';
import DynamicInvoiceGenerator from './DynamicInvoiceGenerator';
import ClientBillingGenerator from './ClientBillingGenerator';
import TaxBillingCalculator from './TaxBillingCalculator';
import ReimbursementForm from './ReimbursementForm';
import PoBuilder from './PoBuilder';
import VendorPaymentTracker from './VendorPaymentTracker';
import ClientContractManager from './ClientContractManager';
import OfficialLetterMaker from './OfficialLetterMaker';
import ReportPdfGenerator from './ReportPdfGenerator';
import ContractGenerator from './ContractGenerator';

import DailyAttendance from './DailyAttendance';
import CampAccommodationManager from './CampAccommodationManager';
import HeavyEquipmentInspection from './HeavyEquipmentInspection';
import FuelConsumptionTracker from './FuelConsumptionTracker';
import ToolboxMeetingLog from './ToolboxMeetingLog';
import SafetyIncidentLog from './SafetyIncidentLog';
import SlaKpiDashboard from './SlaKpiDashboard';

export const hierarchicalStructure: Suite[] = [
  {
    id: 'human-capital',
    name: 'Human Capital & Outsourcing',
    description: 'Manajemen SDM, rekrutmen, payroll, dan outsourcing',
    icon: '👥',
    color: 'from-[#E31B23] to-[#FF6B6B]',
    modules: [
      {
        id: 'recruitment-onboarding',
        name: 'Recruitment & Onboarding',
        description: 'Rekrutmen dan onboarding karyawan',
        icon: '🎯',
        color: 'bg-pink-500',
        tools: [
          { id: 'recruitment-pipeline', name: 'Recruitment Pipeline', description: 'Applicant Tracking System', icon: '🎯', color: 'bg-pink-500', component: RecruitmentPipeline, workflow: ['pkwt-contract-builder', 'onboarding-compliance-checklist'] },
          { id: 'pkwt-contract-builder', name: 'PKWT Contract Builder', description: 'Generator kontrak PKWT', icon: '📝', color: 'bg-pink-600', component: PkwtContractBuilder, workflow: ['recruitment-pipeline', 'onboarding-compliance-checklist'] },
          { id: 'onboarding-compliance-checklist', name: 'Onboarding Checklist', description: 'Checklist kepatuhan onboarding', icon: '✅', color: 'bg-pink-700', component: OnboardingComplianceChecklist, workflow: ['recruitment-pipeline', 'deployment-planner'] },
        ],
      },
      {
        id: 'payroll-benefits',
        name: 'Payroll & Benefits',
        description: 'Pengelolaan gaji dan benefits',
        icon: '💰',
        color: 'bg-rose-500',
        tools: [
          { id: 'payroll-slip-generator', name: 'Payroll Slip Generator', description: 'Generator slip gaji', icon: '💵', color: 'bg-rose-500', component: PayrollSlipGenerator, workflow: ['bpjs-admin-manager', 'tax-billing-calculator'] },
          { id: 'outsourcing-quotation', name: 'Outsourcing Quotation', description: 'Kalkulator billing rate outsourcing', icon: '💰', color: 'bg-rose-600', component: OutsourcingQuotation, workflow: ['client-billing-generator'] },
          { id: 'bpjs-admin-manager', name: 'BPJS Admin Manager', description: 'Rekapitulasi kepesertaan BPJS', icon: '🏛️', color: 'bg-rose-700', component: BpjsAdminManager, workflow: ['payroll-slip-generator', 'medical-checkup-tracker'] },
        ],
      },
      {
        id: 'performance-management',
        name: 'Performance & Development',
        description: 'Penilaian kinerja dan pengembangan karyawan',
        icon: '⭐',
        color: 'bg-rose-600',
        tools: [
          { id: 'performance-appraisal', name: 'Performance Appraisal', description: 'Penilaian kinerja karyawan', icon: '⭐', color: 'bg-rose-600', component: PerformanceAppraisal, workflow: ['turnover-dashboard'] },
          { id: 'turnover-dashboard', name: 'Turnover Dashboard', description: 'Dashboard keluar-masuk karyawan', icon: '📊', color: 'bg-rose-700', component: TurnoverDashboard, workflow: ['performance-appraisal'] },
        ],
      },
      {
        id: 'workforce-operations',
        name: 'Workforce Operations',
        description: 'Operasional tenaga kerja',
        icon: '⏰',
        color: 'bg-rose-700',
        tools: [
          { id: 'timesheet-rekap', name: 'Timesheet Rekap', description: 'Rekap kehadiran & lembur', icon: '⏰', color: 'bg-rose-700', component: TimesheetRekap, workflow: ['daily-attendance', 'client-shift-scheduler'] },
          { id: 'client-shift-scheduler', name: 'Client Shift Scheduler', description: 'Perencana shift 24/7', icon: '📅', color: 'bg-rose-800', component: ClientShiftScheduler, workflow: ['timesheet-rekap', 'daily-attendance'] },
          { id: 'deployment-planner', name: 'Deployment Planner', description: 'Checklist deployment karyawan', icon: '✅', color: 'bg-rose-800', component: DeploymentPlanner, workflow: ['onboarding-compliance-checklist'] },
          { id: 'employee-grievance-portal', name: 'Employee Grievance Portal', description: 'Portal pengaduan karyawan', icon: '💬', color: 'bg-rose-800', component: EmployeeGrievancePortal, workflow: [] },
          { id: 'medical-checkup-tracker', name: 'Medical Checkup Tracker', description: 'Pemantauan MCU dan sertifikasi', icon: '🏥', color: 'bg-rose-900', component: MedicalCheckupTracker, workflow: ['bpjs-admin-manager'] },
        ],
      },
    ],
  },
  {
    id: 'logistics-fleet',
    name: 'Logistics, Fleet & Facility',
    description: 'Manajemen logistik, armada, dan fasilitas',
    icon: '🚚',
    color: 'from-[#0072CE] to-[#4DA8DA]',
    modules: [
      {
        id: 'fleet-management',
        name: 'Fleet Management',
        description: 'Pengelolaan armada kendaraan',
        icon: '🚛',
        color: 'bg-blue-500',
        tools: [
          { id: 'vehicle-checklist', name: 'Vehicle Checklist', description: 'Inspeksi kendaraan harian', icon: '🚗', color: 'bg-blue-500', component: VehicleChecklist, workflow: ['tyre-maintenance-log'] },
          { id: 'tyre-maintenance-log', name: 'Tyre Maintenance Log', description: 'Log perawatan ban dan sparepart', icon: '🔧', color: 'bg-blue-600', component: TyreMaintenanceLog, workflow: ['vehicle-checklist'] },
          { id: 'uang-jalan-calculator', name: 'Uang Jalan Calculator', description: 'Kalkulator uang jalan driver', icon: '💵', color: 'bg-blue-700', component: UangJalanCalculator, workflow: ['surat-jalan-maker'] },
        ],
      },
      {
        id: 'logistics-operations',
        name: 'Logistics Operations',
        description: 'Operasional logistik',
        icon: '📦',
        color: 'bg-blue-600',
        tools: [
          { id: 'surat-jalan-maker', name: 'Surat Jalan Maker', description: 'Generator surat jalan', icon: '🚚', color: 'bg-blue-600', component: SuratJalanMaker, workflow: ['po-builder', 'uang-jalan-calculator'] },
          { id: 'cbm-calculator', name: 'CBM Calculator', description: 'Kalkulator CBM & container', icon: '📦', color: 'bg-blue-700', component: CbmCalculator, workflow: ['packing-list-generator'] },
          { id: 'freight-rate-calculator', name: 'Freight Rate Calculator', description: 'Kalkulator biaya pengiriman', icon: '💲', color: 'bg-blue-800', component: FreightRateCalculator, workflow: ['freight-quotation-generator'] },
        ],
      },
      {
        id: 'facility-management',
        name: 'Facility Management',
        description: 'Pengelolaan fasilitas',
        icon: '🏢',
        color: 'bg-blue-700',
        tools: [
          { id: 'visitor-management', name: 'Visitor Management', description: 'Buku tamu digital', icon: '👤', color: 'bg-blue-700', component: VisitorManagement, workflow: [] },
          { id: 'asset-tracker', name: 'Asset Tracker', description: 'Tracking peminjaman aset', icon: '📦', color: 'bg-blue-800', component: AssetTracker, workflow: [] },
          { id: 'event-rundown', name: 'Event Rundown', description: 'Perencana jadwal acara', icon: '📅', color: 'bg-blue-800', component: EventRundown, workflow: [] },
        ],
      },
      {
        id: 'vendor-procurement',
        name: 'Vendor & Procurement',
        description: 'Manajemen vendor dan pengadaan',
        icon: '🏭',
        color: 'bg-blue-800',
        tools: [
          { id: 'vendor-database', name: 'Vendor Database', description: 'Database vendor', icon: '🏭', color: 'bg-blue-800', component: VendorDatabase, workflow: ['po-builder', 'vendor-payment-tracker'] },
          { id: 'petty-cash-form', name: 'Petty Cash Form', description: 'Form kas kecil', icon: '💵', color: 'bg-blue-900', component: PettyCashForm, workflow: ['reimbursement-form'] },
        ],
      },
    ],
  },
  {
    id: 'customs-trade',
    name: 'Customs, Import & Trade',
    description: 'Kepabeanan, impor, dan perdagangan',
    icon: '🌐',
    color: 'from-[#E31B23] to-[#0072CE]',
    modules: [
      {
        id: 'customs-documentation',
        name: 'Customs Documentation',
        description: 'Dokumentasi kepabeanan',
        icon: '📋',
        color: 'bg-emerald-500',
        tools: [
          { id: 'customs-vault', name: 'Customs Vault', description: 'Repository dokumen kepabeanan', icon: '📁', color: 'bg-emerald-500', component: CustomsVault, workflow: ['bill-of-lading-generator', 'certificate-of-origin-generator'] },
          { id: 'hs-code-estimator', name: 'HS Code Estimator', description: 'Estimasi HS Code & pajak', icon: '🏷️', color: 'bg-emerald-600', component: HsCodeEstimator, workflow: ['certificate-of-origin-generator'] },
        ],
      },
      {
        id: 'shipping-documents',
        name: 'Shipping Documents',
        description: 'Dokumen pengiriman',
        icon: '🚢',
        color: 'bg-emerald-600',
        tools: [
          { id: 'bill-of-lading-generator', name: 'Bill of Lading Generator', description: 'Generator Bill of Lading', icon: '🚢', color: 'bg-emerald-600', component: BillOfLadingGenerator, workflow: ['packing-list-generator', 'certificate-of-origin-generator'] },
          { id: 'certificate-of-origin-generator', name: 'Certificate of Origin', description: 'Generator Certificate of Origin', icon: '📜', color: 'bg-emerald-700', component: CertificateOfOriginGenerator, workflow: ['bill-of-lading-generator'] },
          { id: 'shipping-doc-formatter', name: 'Shipping Doc Formatter', description: 'Generator Packing List & Invoice', icon: '📄', color: 'bg-emerald-700', component: ShippingDocFormatter, workflow: ['packing-list-generator', 'bill-of-lading-generator'] },
        ],
      },
      {
        id: 'trade-operations',
        name: 'Trade Operations',
        description: 'Operasional perdagangan',
        icon: '💼',
        color: 'bg-emerald-700',
        tools: [
          { id: 'incoterms-visualizer', name: 'Incoterms Visualizer', description: 'Panduan Incoterms 2020', icon: '🌍', color: 'bg-emerald-700', component: IncotermsVisualizer, workflow: ['bill-of-lading-generator'] },
        ],
      },
    ],
  },
  {
    id: 'finance-legal',
    name: 'Finance, Billing & Corporate Legal',
    description: 'Keuangan, penagihan, dan legal korporat',
    icon: '💼',
    color: 'from-[#0072CE] to-[#00A3E0]',
    modules: [
      {
        id: 'billing-invoicing',
        name: 'Billing & Invoicing',
        description: 'Penagihan dan invoice',
        icon: '💰',
        color: 'bg-violet-500',
        tools: [
          { id: 'invoice-generator', name: 'Invoice Generator', description: 'Generator invoice', icon: '💰', color: 'bg-violet-500', component: InvoiceGenerator, workflow: ['client-billing-generator'] },
          { id: 'dynamic-invoice-generator', name: 'Dynamic Invoice Generator', description: 'Generator invoice dinamis', icon: '💳', color: 'bg-violet-600', component: DynamicInvoiceGenerator, workflow: ['invoice-generator', 'client-database'] },
          { id: 'client-billing-generator', name: 'Client Billing Generator', description: 'Generator tagihan klien', icon: '💵', color: 'bg-violet-600', component: ClientBillingGenerator, workflow: ['invoice-generator'] },
          { id: 'tax-billing-calculator', name: 'Tax Billing Calculator', description: 'Kalkulator PPN & PPh 23', icon: '🧾', color: 'bg-violet-700', component: TaxBillingCalculator, workflow: ['payroll-slip-generator'] },
        ],
      },
      {
        id: 'procurement-finance',
        name: 'Procurement & Finance',
        description: 'Pengadaan dan keuangan',
        icon: '📋',
        color: 'bg-violet-600',
        tools: [
          { id: 'po-builder', name: 'PO Builder', description: 'Generator Purchase Order', icon: '📋', color: 'bg-violet-600', component: PoBuilder, workflow: ['vendor-database'] },
          { id: 'vendor-payment-tracker', name: 'Vendor Payment Tracker', description: 'Tracking pembayaran vendor', icon: '💳', color: 'bg-violet-700', component: VendorPaymentTracker, workflow: ['vendor-database'] },
          { id: 'reimbursement-form', name: 'Reimbursement Form', description: 'Form klaim biaya', icon: '💰', color: 'bg-violet-700', component: ReimbursementForm, workflow: ['petty-cash-form'] },
        ],
      },
      {
        id: 'corporate-legal',
        name: 'Corporate Legal',
        description: 'Legal korporat',
        icon: '⚖️',
        color: 'bg-violet-700',
        tools: [
          { id: 'client-contract-manager', name: 'Client Contract Manager', description: 'Tracker kontrak B2B', icon: '📄', color: 'bg-violet-700', component: ClientContractManager, workflow: ['pkwt-contract-builder'] },
          { id: 'contract-generator', name: 'Contract Generator', description: 'Generator kontrak', icon: '📝', color: 'bg-violet-800', component: ContractGenerator, workflow: ['pkwt-contract-builder'] },
          { id: 'official-letter-maker', name: 'Official Letter Maker', description: 'Generator surat resmi', icon: '✉️', color: 'bg-violet-800', component: OfficialLetterMaker, workflow: [] },
          { id: 'report-pdf-generator', name: 'Report PDF Generator', description: 'Generator laporan PDF', icon: '📊', color: 'bg-violet-900', component: ReportPdfGenerator, workflow: [] },
        ],
      },
    ],
  },
  {
    id: 'field-operations',
    name: 'Field, Mining & Site Operations',
    description: 'Operasional lapangan, tambang, dan site',
    icon: '⛏️',
    color: 'from-[#E31B23] to-[#FF8C42]',
    modules: [
      {
        id: 'site-operations',
        name: 'Site Operations',
        description: 'Operasional site',
        icon: '🏗️',
        color: 'bg-amber-500',
        tools: [
          { id: 'daily-attendance', name: 'Daily Attendance', description: 'Absensi harian & shift', icon: '⏰', color: 'bg-amber-500', component: DailyAttendance, workflow: ['timesheet-rekap'] },
          { id: 'camp-accommodation-manager', name: 'Camp & Mess Manager', description: 'Manajemen asrama', icon: '🏠', color: 'bg-amber-600', component: CampAccommodationManager, workflow: [] },
        ],
      },
      {
        id: 'equipment-maintenance',
        name: 'Equipment & Maintenance',
        description: 'Peralatan dan perawatan',
        icon: '🔧',
        color: 'bg-amber-600',
        tools: [
          { id: 'heavy-equipment-inspection', name: 'Heavy Equipment Inspection', description: 'Inspeksi alat berat', icon: '🔧', color: 'bg-amber-600', component: HeavyEquipmentInspection, workflow: ['vehicle-checklist'] },
          { id: 'fuel-consumption-tracker', name: 'Fuel Consumption Tracker', description: 'Tracking konsumsi BBM', icon: '⛽', color: 'bg-amber-700', component: FuelConsumptionTracker, workflow: [] },
        ],
      },
      {
        id: 'safety-compliance',
        name: 'Safety & Compliance',
        description: 'Keselamatan dan kepatuhan',
        icon: '🛡️',
        color: 'bg-amber-700',
        tools: [
          { id: 'toolbox-meeting-log', name: 'Toolbox Meeting Log', description: 'Safety talk harian', icon: '📋', color: 'bg-amber-700', component: ToolboxMeetingLog, workflow: ['safety-incident-log'] },
          { id: 'safety-incident-log', name: 'Safety Incident Log', description: 'Pencatatan insiden K3', icon: '⚠️', color: 'bg-amber-800', component: SafetyIncidentLog, workflow: ['toolbox-meeting-log'] },
        ],
      },
      {
        id: 'performance-monitoring',
        name: 'Performance Monitoring',
        description: 'Monitoring performa',
        icon: '📊',
        color: 'bg-amber-800',
        tools: [
          { id: 'sla-kpi-dashboard', name: 'SLA & KPI Dashboard', description: 'Dashboard SLA & KPI', icon: '📊', color: 'bg-amber-800', component: SlaKpiDashboard, workflow: [] },
        ],
      },
    ],
  },
];

// Helper functions
export const getAllTools = (): Tool[] => {
  return hierarchicalStructure.flatMap(suite => 
    suite.modules.flatMap(module => module.tools)
  );
};

export const getToolById = (id: string): Tool | undefined => {
  return getAllTools().find(tool => tool.id === id);
};

export const getRelatedTools = (toolId: string): Tool[] => {
  const tool = getToolById(toolId);
  if (!tool || !tool.workflow) return [];
  return tool.workflow.map(id => getToolById(id)).filter(Boolean) as Tool[];
};

export const getTotalToolsCount = (): number => {
  return getAllTools().length;
};

export const getSuiteById = (id: string): Suite | undefined => {
  return hierarchicalStructure.find(suite => suite.id === id);
};

export const getModuleById = (id: string): Module | undefined => {
  for (const suite of hierarchicalStructure) {
    const module = suite.modules.find(m => m.id === id);
    if (module) return module;
  }
  return undefined;
};
