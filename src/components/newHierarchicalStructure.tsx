// New Hierarchical Structure with Premium Vector Icons

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

// Icon mapping for suites and modules
export const iconMap: Record<string, string> = {
  // Suites
  'human-capital': 'HumanCapital',
  'logistics-fleet': 'Logistics',
  'customs-trade': 'Customs',
  'finance-legal': 'Finance',
  'field-operations': 'FieldOps',
  'document-management': 'Document',
  'outsourcing-documents': 'Outsourcing',
  
  // Modules
  'recruitment-onboarding': 'Recruitment',
  'payroll-benefits': 'Payroll',
  'performance-management': 'Performance',
  'workforce-operations': 'Timesheet',
  'fleet-management': 'Vehicle',
  'logistics-operations': 'Logistics',
  'facility-management': 'Document',
  'vendor-procurement': 'Invoice',
  'customs-documentation': 'Document',
  'customs-shipping-documents': 'Document',
  'trade-operations': 'Customs',
  'billing-invoicing': 'Invoice',
  'procurement-finance': 'Invoice',
  'corporate-legal': 'Contract',
  'site-operations': 'FieldOps',
  'equipment-maintenance': 'Vehicle',
  'safety-compliance': 'FieldOps',
  'performance-monitoring': 'Performance',
  'pdf-processing': 'PDF',
  'pdf-enhancement': 'PDF',
  'pdf-metadata': 'PDF',
  'service-agreements': 'Contract',
  'client-proposals': 'Proposal',
  
  // Tools
  'recruitment-pipeline': 'Recruitment',
  'pkwt-contract-builder': 'Contract',
  'onboarding-compliance-checklist': 'Contract',
  'payroll-slip-generator': 'Payroll',
  'outsourcing-quotation': 'Invoice',
  'bpjs-admin-manager': 'Payroll',
  'performance-appraisal': 'Performance',
  'turnover-dashboard': 'Performance',
  'timesheet-rekap': 'Timesheet',
  'client-shift-scheduler': 'Timesheet',
  'deployment-planner': 'FieldOps',
  'employee-grievance-portal': 'Document',
  'medical-checkup-tracker': 'Performance',
  'vehicle-checklist': 'Vehicle',
  'tyre-maintenance-log': 'Vehicle',
  'uang-jalan-calculator': 'Vehicle',
  'surat-jalan-maker': 'Document',
  'cbm-calculator': 'Logistics',
  'freight-rate-calculator': 'Logistics',
  'visitor-management': 'Document',
  'asset-tracker': 'Document',
  'event-rundown': 'Document',
  'vendor-database': 'Invoice',
  'petty-cash-form': 'Invoice',
  'customs-vault': 'Document',
  'hs-code-estimator': 'Customs',
  'bill-of-lading-generator': 'Document',
  'certificate-of-origin-generator': 'Document',
  'shipping-doc-formatter': 'Document',
  'incoterms-visualizer': 'Customs',
  'invoice-generator': 'Invoice',
  'dynamic-invoice-generator': 'Invoice',
  'client-billing-generator': 'Invoice',
  'tax-billing-calculator': 'Invoice',
  'po-builder': 'Invoice',
  'vendor-payment-tracker': 'Invoice',
  'reimbursement-form': 'Invoice',
  'client-contract-manager': 'Contract',
  'contract-generator': 'Contract',
  'official-letter-maker': 'Document',
  'report-pdf-generator': 'PDF',
  'document-registry': 'Document',
  'daily-attendance': 'FieldOps',
  'camp-accommodation-manager': 'FieldOps',
  'heavy-equipment-inspection': 'Vehicle',
  'fuel-consumption-tracker': 'Vehicle',
  'toolbox-meeting-log': 'FieldOps',
  'safety-incident-log': 'FieldOps',
  'sla-kpi-dashboard': 'Performance',
  'nota-to-pdf': 'PDF',
  'pdf-splitter': 'PDF',
  'pdf-processor': 'PDF',
  'pdf-to-image': 'PDF',
  'pdf-watermark': 'PDF',
  'pdf-page-organizer': 'PDF',
  'pdf-metadata-editor': 'PDF',
  'pdf-page-numberer': 'PDF',
  'sla-document-generator': 'Contract',
  'work-order-generator': 'Contract',
  'client-proposal-generator': 'Proposal',
};

// Import all components
import RecruitmentPipeline from './RecruitmentPipeline';
import PkwtContractBuilder from './PkwtContractBuilder';
import OnboardingComplianceChecklist from './OnboardingComplianceChecklist';
import PayrollSlipGenerator from './PayrollSlipGenerator';
import OutsourcingQuotation from './OutsourcingQuotation';
import BpjsAdminManager from './BpjsAdminManager';
import PerformanceAppraisal from './PerformanceAppraisal';
import TurnoverDashboard from './TurnoverDashboard';
import TimesheetRekap from './TimesheetRekap';
import ClientShiftScheduler from './ClientShiftScheduler';
import DeploymentPlanner from './DeploymentPlanner';
import EmployeeGrievancePortal from './EmployeeGrievancePortal';
import MedicalCheckupTracker from './MedicalCheckupTracker';
import VehicleChecklist from './VehicleChecklist';
import TyreMaintenanceLog from './TyreMaintenanceLog';
import UangJalanCalculator from './UangJalanCalculator';
import SuratJalanMaker from './SuratJalanMaker';
import CbmCalculator from './CbmCalculator';
import FreightRateCalculator from './FreightRateCalculator';
import VisitorManagement from './VisitorManagement';
import AssetTracker from './AssetTracker';
import EventRundown from './EventRundown';
import VendorDatabase from './VendorDatabase';
import PettyCashForm from './PettyCashForm';
import CustomsVault from './CustomsVault';
import HsCodeEstimator from './HsCodeEstimator';
import BillOfLadingGenerator from './BillOfLadingGenerator';
import CertificateOfOriginGenerator from './CertificateOfOriginGenerator';
import ShippingDocFormatter from './ShippingDocFormatter';
import IncotermsVisualizer from './IncotermsVisualizer';
import InvoiceGenerator from './InvoiceGenerator';
import DynamicInvoiceGenerator from './DynamicInvoiceGenerator';
import ClientBillingGenerator from './ClientBillingGenerator';
import TaxBillingCalculator from './TaxBillingCalculator';
import PoBuilder from './PoBuilder';
import VendorPaymentTracker from './VendorPaymentTracker';
import ReimbursementForm from './ReimbursementForm';
import ClientContractManager from './ClientContractManager';
import ContractGenerator from './ContractGenerator';
import OfficialLetterMaker from './OfficialLetterMaker';
import ReportPdfGenerator from './ReportPdfGenerator';
import DocumentRegistry from './DocumentRegistry';
import DailyAttendance from './DailyAttendance';
import CampAccommodationManager from './CampAccommodationManager';
import HeavyEquipmentInspection from './HeavyEquipmentInspection';
import FuelConsumptionTracker from './FuelConsumptionTracker';
import ToolboxMeetingLog from './ToolboxMeetingLog';
import SafetyIncidentLog from './SafetyIncidentLog';
import SlaKpiDashboard from './SlaKpiDashboard';
import NotaToPdf from './NotaToPdf';
import PdfSplitter from './PdfSplitter';
import PDFProcessor from './PDFProcessor';
import PdfToImage from './PdfToImage';
import PdfWatermark from './PdfWatermark';
import PdfPageOrganizer from './PdfPageOrganizer';
import PdfMetadataEditor from './PdfMetadataEditor';
import PdfPageNumberer from './PdfPageNumberer';
import SLADocumentGenerator from './SLADocumentGenerator';
import WorkOrderGenerator from './WorkOrderGenerator';
import ClientProposalGenerator from './ClientProposalGenerator';

export const hierarchicalStructure: Suite[] = [
  {
    id: 'human-capital',
    name: 'Human Capital & Outsourcing',
    description: 'Manajemen SDM, rekrutmen, payroll, dan outsourcing',
    icon: 'HumanCapital',
    color: 'from-pink-500 to-rose-500',
    modules: [
      {
        id: 'recruitment-onboarding',
        name: 'Recruitment & Onboarding',
        description: 'Rekrutmen dan onboarding karyawan',
        icon: 'Recruitment',
        color: 'bg-pink-500',
        tools: [
          { id: 'recruitment-pipeline', name: 'Recruitment Pipeline', description: 'Applicant Tracking System', icon: 'Recruitment', color: 'bg-pink-500', component: RecruitmentPipeline, workflow: ['pkwt-contract-builder', 'onboarding-compliance-checklist'] },
          { id: 'pkwt-contract-builder', name: 'PKWT Contract Builder', description: 'Generator kontrak PKWT', icon: 'Contract', color: 'bg-pink-600', component: PkwtContractBuilder, workflow: ['recruitment-pipeline', 'onboarding-compliance-checklist'] },
          { id: 'onboarding-compliance-checklist', name: 'Onboarding Checklist', description: 'Checklist kepatuhan onboarding', icon: 'Contract', color: 'bg-pink-700', component: OnboardingComplianceChecklist, workflow: ['recruitment-pipeline', 'deployment-planner'] },
        ],
      },
      {
        id: 'payroll-benefits',
        name: 'Payroll & Benefits',
        description: 'Pengelolaan gaji dan benefits',
        icon: 'Payroll',
        color: 'bg-rose-500',
        tools: [
          { id: 'payroll-slip-generator', name: 'Payroll Slip Generator', description: 'Generator slip gaji', icon: 'Payroll', color: 'bg-rose-500', component: PayrollSlipGenerator, workflow: ['bpjs-admin-manager', 'tax-billing-calculator'] },
          { id: 'outsourcing-quotation', name: 'Outsourcing Quotation', description: 'Kalkulator billing rate outsourcing', icon: 'Invoice', color: 'bg-rose-600', component: OutsourcingQuotation, workflow: ['client-billing-generator'] },
          { id: 'bpjs-admin-manager', name: 'BPJS Admin Manager', description: 'Rekapitulasi kepesertaan BPJS', icon: 'Payroll', color: 'bg-rose-700', component: BpjsAdminManager, workflow: ['payroll-slip-generator', 'medical-checkup-tracker'] },
        ],
      },
      {
        id: 'performance-management',
        name: 'Performance & Development',
        description: 'Penilaian kinerja dan pengembangan karyawan',
        icon: 'Performance',
        color: 'bg-rose-600',
        tools: [
          { id: 'performance-appraisal', name: 'Performance Appraisal', description: 'Penilaian kinerja karyawan', icon: 'Performance', color: 'bg-rose-600', component: PerformanceAppraisal, workflow: ['turnover-dashboard'] },
          { id: 'turnover-dashboard', name: 'Turnover Dashboard', description: 'Dashboard keluar-masuk karyawan', icon: 'Performance', color: 'bg-rose-700', component: TurnoverDashboard, workflow: ['performance-appraisal'] },
        ],
      },
      {
        id: 'workforce-operations',
        name: 'Workforce Operations',
        description: 'Operasional tenaga kerja',
        icon: 'Timesheet',
        color: 'bg-rose-700',
        tools: [
          { id: 'timesheet-rekap', name: 'Timesheet Rekap', description: 'Rekap kehadiran & lembur', icon: 'Timesheet', color: 'bg-rose-700', component: TimesheetRekap, workflow: ['daily-attendance', 'client-shift-scheduler'] },
          { id: 'client-shift-scheduler', name: 'Client Shift Scheduler', description: 'Perencana shift 24/7', icon: 'Timesheet', color: 'bg-rose-800', component: ClientShiftScheduler, workflow: ['timesheet-rekap', 'daily-attendance'] },
          { id: 'deployment-planner', name: 'Deployment Planner', description: 'Checklist deployment karyawan', icon: 'FieldOps', color: 'bg-rose-800', component: DeploymentPlanner, workflow: ['onboarding-compliance-checklist'] },
          { id: 'employee-grievance-portal', name: 'Employee Grievance Portal', description: 'Portal pengaduan karyawan', icon: 'Document', color: 'bg-rose-800', component: EmployeeGrievancePortal, workflow: [] },
          { id: 'medical-checkup-tracker', name: 'Medical Checkup Tracker', description: 'Pemantauan MCU dan sertifikasi', icon: 'Performance', color: 'bg-rose-900', component: MedicalCheckupTracker, workflow: ['bpjs-admin-manager'] },
        ],
      },
    ],
  },
  {
    id: 'logistics-fleet',
    name: 'Logistics, Fleet & Facility',
    description: 'Manajemen logistik, armada, dan fasilitas',
    icon: 'Logistics',
    color: 'from-blue-500 to-cyan-500',
    modules: [
      {
        id: 'fleet-management',
        name: 'Fleet Management',
        description: 'Pengelolaan armada kendaraan',
        icon: 'Vehicle',
        color: 'bg-blue-500',
        tools: [
          { id: 'vehicle-checklist', name: 'Vehicle Checklist', description: 'Inspeksi kendaraan harian', icon: 'Vehicle', color: 'bg-blue-500', component: VehicleChecklist, workflow: ['tyre-maintenance-log'] },
          { id: 'tyre-maintenance-log', name: 'Tyre Maintenance Log', description: 'Log perawatan ban dan sparepart', icon: 'Vehicle', color: 'bg-blue-600', component: TyreMaintenanceLog, workflow: ['vehicle-checklist'] },
          { id: 'uang-jalan-calculator', name: 'Uang Jalan Calculator', description: 'Kalkulator uang jalan driver', icon: 'Vehicle', color: 'bg-blue-700', component: UangJalanCalculator, workflow: ['surat-jalan-maker'] },
        ],
      },
      {
        id: 'logistics-operations',
        name: 'Logistics Operations',
        description: 'Operasional logistik',
        icon: 'Logistics',
        color: 'bg-blue-600',
        tools: [
          { id: 'surat-jalan-maker', name: 'Surat Jalan Maker', description: 'Generator surat jalan', icon: 'Document', color: 'bg-blue-600', component: SuratJalanMaker, workflow: ['po-builder', 'uang-jalan-calculator'] },
          { id: 'cbm-calculator', name: 'CBM Calculator', description: 'Kalkulator CBM & container', icon: 'Logistics', color: 'bg-blue-700', component: CbmCalculator, workflow: ['packing-list-generator'] },
          { id: 'freight-rate-calculator', name: 'Freight Rate Calculator', description: 'Kalkulator biaya pengiriman', icon: 'Logistics', color: 'bg-blue-800', component: FreightRateCalculator, workflow: ['freight-quotation-generator'] },
        ],
      },
      {
        id: 'facility-management',
        name: 'Facility Management',
        description: 'Pengelolaan fasilitas',
        icon: 'Document',
        color: 'bg-blue-700',
        tools: [
          { id: 'visitor-management', name: 'Visitor Management', description: 'Buku tamu digital', icon: 'Document', color: 'bg-blue-700', component: VisitorManagement, workflow: [] },
          { id: 'asset-tracker', name: 'Asset Tracker', description: 'Asset Tracker', icon: 'Document', color: 'bg-blue-800', component: AssetTracker, workflow: [] },
          { id: 'event-rundown', name: 'Event Rundown', description: 'Perencana jadwal acara', icon: 'Document', color: 'bg-blue-800', component: EventRundown, workflow: [] },
        ],
      },
      {
        id: 'vendor-procurement',
        name: 'Vendor & Procurement',
        description: 'Manajemen vendor dan pengadaan',
        icon: 'Invoice',
        color: 'bg-blue-800',
        tools: [
          { id: 'vendor-database', name: 'Vendor Database', description: 'Database vendor', icon: 'Invoice', color: 'bg-blue-800', component: VendorDatabase, workflow: ['po-builder', 'vendor-payment-tracker'] },
          { id: 'petty-cash-form', name: 'Petty Cash Form', description: 'Petty Cash Form', icon: 'Invoice', color: 'bg-blue-900', component: PettyCashForm, workflow: [] },
        ],
      },
    ],
  },
  {
    id: 'customs-trade',
    name: 'Customs, Import & Trade',
    description: 'Kepabeanan, impor, dan perdagangan',
    icon: 'Customs',
    color: 'from-emerald-500 to-teal-500',
    modules: [
      {
        id: 'customs-documentation',
        name: 'Customs Documentation',
        description: 'Dokumentasi kepabeanan',
        icon: 'Document',
        color: 'bg-emerald-500',
        tools: [
          { id: 'customs-vault', name: 'Customs Vault', description: 'Repository dokumen kepabeanan', icon: 'Document', color: 'bg-emerald-500', component: CustomsVault, workflow: ['bill-of-lading-generator', 'certificate-of-origin-generator'] },
          { id: 'hs-code-estimator', name: 'HS Code Estimator', description: 'Estimasi HS Code & pajak', icon: 'Customs', color: 'bg-emerald-600', component: HsCodeEstimator, workflow: ['certificate-of-origin-generator'] },
        ],
      },
      {
        id: 'customs-shipping-documents',
        name: 'Shipping Documents',
        description: 'Dokumen pengiriman',
        icon: 'Document',
        color: 'bg-emerald-600',
        tools: [
          { id: 'bill-of-lading-generator', name: 'Bill of Lading Generator', description: 'Bill of Lading Generator', icon: 'Document', color: 'bg-emerald-600', component: BillOfLadingGenerator, workflow: ['packing-list-generator', 'certificate-of-origin-generator'] },
          { id: 'certificate-of-origin-generator', name: 'Certificate of Origin Generator', description: 'Certificate of Origin Generator', icon: 'Document', color: 'bg-emerald-700', component: CertificateOfOriginGenerator, workflow: ['bill-of-lading-generator'] },
          { id: 'shipping-doc-formatter', name: 'Shipping Doc Formatter', description: 'Shipping Doc Formatter', icon: 'Document', color: 'bg-emerald-700', component: ShippingDocFormatter, workflow: ['packing-list-generator', 'bill-of-lading-generator'] },
        ],
      },
      {
        id: 'trade-operations',
        name: 'Trade Operations',
        description: 'Operasional perdagangan',
        icon: 'Customs',
        color: 'bg-emerald-700',
        tools: [
          { id: 'incoterms-visualizer', name: 'Incoterms Visualizer', description: 'Panduan Incoterms 2020', icon: 'Customs', color: 'bg-emerald-700', component: IncotermsVisualizer, workflow: ['bill-of-lading-generator'] },
        ],
      },
    ],
  },
  {
    id: 'finance-legal',
    name: 'Finance, Billing & Corporate Legal',
    description: 'Keuangan, penagihan, dan legal korporat',
    icon: 'Finance',
    color: 'from-violet-500 to-purple-500',
    modules: [
      {
        id: 'billing-invoicing',
        name: 'Billing & Invoicing',
        description: 'Penagihan dan invoice',
        icon: 'Invoice',
        color: 'bg-violet-500',
        tools: [
          { id: 'invoice-generator', name: 'Invoice Generator', description: 'Generator invoice', icon: 'Invoice', color: 'bg-violet-500', component: InvoiceGenerator, workflow: ['client-billing-generator'] },
          { id: 'dynamic-invoice-generator', name: 'Dynamic Invoice Generator', description: 'Generator invoice dinamis', icon: 'Invoice', color: 'bg-violet-600', component: DynamicInvoiceGenerator, workflow: ['invoice-generator', 'client-database'] },
          { id: 'client-billing-generator', name: 'Client Billing Generator', description: 'Generator tagihan klien', icon: 'Invoice', color: 'bg-violet-600', component: ClientBillingGenerator, workflow: ['invoice-generator'] },
          { id: 'tax-billing-calculator', name: 'Tax Billing Calculator', description: 'Kalkulator PPN & PPh 23', icon: 'Invoice', color: 'bg-violet-700', component: TaxBillingCalculator, workflow: ['payroll-slip-generator'] },
        ],
      },
      {
        id: 'procurement-finance',
        name: 'Procurement & Finance',
        description: 'Pengadaan dan keuangan',
        icon: 'Invoice',
        color: 'bg-violet-600',
        tools: [
          { id: 'po-builder', name: 'PO Builder', description: 'Generator Purchase Order', icon: 'Invoice', color: 'bg-violet-600', component: PoBuilder, workflow: ['vendor-database'] },
          { id: 'vendor-payment-tracker', name: 'Vendor Payment Tracker', description: 'Tracking pembayaran vendor', icon: 'Invoice', color: 'bg-violet-700', component: VendorPaymentTracker, workflow: ['vendor-database'] },
          { id: 'reimbursement-form', name: 'Reimbursement Form', description: 'Form klaim biaya', icon: 'Invoice', color: 'bg-violet-700', component: ReimbursementForm, workflow: [] },
        ],
      },
      {
        id: 'corporate-legal',
        name: 'Corporate Legal',
        description: 'Legal korporat',
        icon: 'Contract',
        color: 'bg-violet-700',
        tools: [
          { id: 'client-contract-manager', name: 'Client Contract Manager', description: 'Tracker kontrak B2B', icon: 'Contract', color: 'bg-violet-700', component: ClientContractManager, workflow: ['pkwt-contract-builder'] },
          { id: 'contract-generator', name: 'Contract Generator', description: 'Generator kontrak', icon: 'Contract', color: 'bg-violet-800', component: ContractGenerator, workflow: ['pkwt-contract-builder'] },
          { id: 'official-letter-maker', name: 'Official Letter Maker', description: 'Generator surat resmi', icon: 'Document', color: 'bg-violet-800', component: OfficialLetterMaker, workflow: [] },
          { id: 'report-pdf-generator', name: 'Report PDF Generator', description: 'Generator laporan PDF', icon: 'PDF', color: 'bg-violet-900', component: ReportPdfGenerator, workflow: [] },
          { id: 'document-registry', name: 'Document Registry', description: 'Register nomor dokumen & surat', icon: 'Document', color: 'bg-violet-900', component: DocumentRegistry, workflow: ['official-letter-maker', 'contract-generator'] },
        ],
      },
    ],
  },
  {
    id: 'field-operations',
    name: 'Field, Mining & Site Operations',
    description: 'Operasional lapangan, tambang, dan site',
    icon: 'FieldOps',
    color: 'from-amber-500 to-orange-500',
    modules: [
      {
        id: 'site-operations',
        name: 'Site Operations',
        description: 'Operasional site',
        icon: 'FieldOps',
        color: 'bg-amber-500',
        tools: [
          { id: 'daily-attendance', name: 'Daily Attendance', description: 'Absensi harian & shift', icon: 'FieldOps', color: 'bg-amber-500', component: DailyAttendance, workflow: ['timesheet-rekap'] },
          { id: 'camp-accommodation-manager', name: 'Camp Accommodation Manager', description: 'Manajemen asrama', icon: 'FieldOps', color: 'bg-amber-600', component: CampAccommodationManager, workflow: [] },
        ],
      },
      {
        id: 'equipment-maintenance',
        name: 'Equipment & Maintenance',
        description: 'Peralatan dan perawatan',
        icon: 'Vehicle',
        color: 'bg-amber-600',
        tools: [
          { id: 'heavy-equipment-inspection', name: 'Heavy Equipment Inspection', description: 'Inspeksi alat berat', icon: 'Vehicle', color: 'bg-amber-600', component: HeavyEquipmentInspection, workflow: ['vehicle-checklist'] },
          { id: 'fuel-consumption-tracker', name: 'Fuel Consumption Tracker', description: 'Tracking konsumsi BBM', icon: 'Vehicle', color: 'bg-amber-700', component: FuelConsumptionTracker, workflow: [] },
        ],
      },
      {
        id: 'safety-compliance',
        name: 'Safety & Compliance',
        description: 'Keselamatan dan kepatuhan',
        icon: 'FieldOps',
        color: 'bg-amber-700',
        tools: [
          { id: 'toolbox-meeting-log', name: 'Toolbox Meeting Log', description: 'Safety talk harian', icon: 'FieldOps', color: 'bg-amber-700', component: ToolboxMeetingLog, workflow: ['safety-incident-log'] },
          { id: 'safety-incident-log', name: 'Safety Incident Log', description: 'Pencatatan insiden K3', icon: 'FieldOps', color: 'bg-amber-800', component: SafetyIncidentLog, workflow: ['toolbox-meeting-log'] },
        ],
      },
      {
        id: 'performance-monitoring',
        name: 'Performance Monitoring',
        description: 'Monitoring performa',
        icon: 'Performance',
        color: 'bg-amber-800',
        tools: [
          { id: 'sla-kpi-dashboard', name: 'SLA & KPI Dashboard', description: 'Dashboard SLA & KPI', icon: 'Performance', color: 'bg-amber-800', component: SlaKpiDashboard, workflow: [] },
        ],
      },
    ],
  },
  {
    id: 'document-management',
    name: 'Document Management & PDF Processing',
    description: 'Manajemen dokumen dan pemrosesan PDF',
    icon: 'Document',
    color: 'from-purple-500 to-indigo-500',
    modules: [
      {
        id: 'pdf-processing',
        name: 'PDF Processing',
        description: 'Pemrosesan dan manipulasi file PDF',
        icon: 'PDF',
        color: 'bg-purple-500',
        tools: [
          { id: 'nota-to-pdf', name: 'Nota to PDF', description: 'Gabungkan gambar nota ke PDF', icon: 'PDF', color: 'bg-purple-500', component: NotaToPdf, workflow: ['pdf-processor'] },
          { id: 'pdf-splitter', name: 'PDF Splitter', description: 'Pecah PDF menjadi beberapa file', icon: 'PDF', color: 'bg-purple-600', component: PdfSplitter, workflow: ['pdf-processor'] },
          { id: 'pdf-processor', name: 'PDF Processor', description: 'Compress, merge, rotate PDF', icon: 'PDF', color: 'bg-purple-700', component: PDFProcessor, workflow: ['nota-to-pdf', 'pdf-splitter'] },
        ],
      },
      {
        id: 'pdf-enhancement',
        name: 'PDF Enhancement',
        description: 'Enhancement dan optimasi PDF',
        icon: 'PDF',
        color: 'bg-purple-600',
        tools: [
          { id: 'pdf-to-image', name: 'PDF to Image', description: 'Konversi PDF ke gambar', icon: 'PDF', color: 'bg-purple-600', component: PdfToImage, workflow: ['pdf-processor'] },
          { id: 'pdf-watermark', name: 'PDF Watermark', description: 'Tambahkan watermark ke PDF', icon: 'PDF', color: 'bg-purple-700', component: PdfWatermark, workflow: ['pdf-processor'] },
          { id: 'pdf-page-organizer', name: 'PDF Page Organizer', description: 'Atur ulang halaman PDF', icon: 'PDF', color: 'bg-purple-800', component: PdfPageOrganizer, workflow: ['pdf-processor'] },
        ],
      },
      {
        id: 'pdf-metadata',
        name: 'PDF Metadata & Numbering',
        description: 'Metadata dan penomoran PDF',
        icon: 'PDF',
        color: 'bg-purple-700',
        tools: [
          { id: 'pdf-metadata-editor', name: 'PDF Metadata Editor', description: 'Edit metadata PDF', icon: 'PDF', color: 'bg-purple-700', component: PdfMetadataEditor, workflow: ['pdf-processor'] },
          { id: 'pdf-page-numberer', name: 'PDF Page Numberer', description: 'Tambahkan nomor halaman', icon: 'PDF', color: 'bg-purple-800', component: PdfPageNumberer, workflow: ['pdf-processor'] },
        ],
      },
    ],
  },
  {
    id: 'outsourcing-documents',
    name: 'Outsourcing Document Generation',
    description: 'Generator dokumen untuk outsourcing company',
    icon: 'Outsourcing',
    color: 'from-green-500 to-teal-500',
    modules: [
      {
        id: 'service-agreements',
        name: 'Service Agreements',
        description: 'Dokumen perjanjian layanan',
        icon: 'Contract',
        color: 'bg-green-500',
        tools: [
          { id: 'sla-document-generator', name: 'SLA Document Generator', description: 'Generator dokumen Service Level Agreement', icon: 'Contract', color: 'bg-green-500', component: SLADocumentGenerator, workflow: ['work-order-generator'] },
          { id: 'work-order-generator', name: 'Work Order Generator', description: 'Generator work order untuk klien', icon: 'Contract', color: 'bg-green-600', component: WorkOrderGenerator, workflow: ['client-proposal-generator'] },
        ],
      },
      {
        id: 'client-proposals',
        name: 'Client Proposals',
        description: 'Proposal untuk klien outsourcing',
        icon: 'Proposal',
        color: 'bg-green-600',
        tools: [
          { id: 'client-proposal-generator', name: 'Client Proposal Generator', description: 'Generator proposal outsourcing', icon: 'Proposal', color: 'bg-green-600', component: ClientProposalGenerator, workflow: [] },
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

export const getModuleById = (moduleId: string): Module | undefined => {
  for (const suite of hierarchicalStructure) {
    const module = suite.modules.find(m => m.id === moduleId);
    if (module) return module;
  }
  return undefined;
};
