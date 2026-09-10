// Hierarchical structure: Suite -> Module -> Tools

export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  component: React.ComponentType<any>;
  workflow?: string[]; // IDs of related tools
}

export interface Module {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  tools: Tool[];
}

export interface Suite {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  modules: Module[];
}

// Import all components
import NotaToPdf from './NotaToPdf';
import BatchRenamer from './BatchRenamer';
import PdfSplitter from './PdfSplitter';
import LabelGenerator from './LabelGenerator';
import DocumentRegistry from './DocumentRegistry';
import InvoiceGenerator from './InvoiceGenerator';
import DynamicInvoiceGenerator from './DynamicInvoiceGenerator';
import ContractGenerator from './ContractGenerator';
import OfficialLetterMaker from './OfficialLetterMaker';
import ReportPdfGenerator from './ReportPdfGenerator';
import ShippingDocFormatter from './ShippingDocFormatter';
import ClientDatabase from './ClientDatabase';
import BarcodeGenerator from './BarcodeGenerator';
import DeliveryOrderGenerator from './DeliveryOrderGenerator';
import PDFProcessor from './PDFProcessor';
import PdfToImage from './PdfToImage';
import PdfWatermark from './PdfWatermark';
import PdfPageOrganizer from './PdfPageOrganizer';
import PdfMetadataEditor from './PdfMetadataEditor';
import PdfPageNumberer from './PdfPageNumberer';
import PurchaseOrderGenerator from './PurchaseOrderGenerator';
import PackingListGenerator from './PackingListGenerator';
import BillOfLadingGenerator from './BillOfLadingGenerator';
import CertificateOfOriginGenerator from './CertificateOfOriginGenerator';
import FreightQuotationGenerator from './FreightQuotationGenerator';
import ShipmentTracker from './ShipmentTracker';
import DataAnalyticsDashboard from './DataAnalyticsDashboard';
import DocumentWorkflowManager from './DocumentWorkflowManager';
import ImportExportDataManager from './ImportExportDataManager';
import BusinessIntelligenceReports from './BusinessIntelligenceReports';
import TimeTracker from './TimeTracker';
import TaskManager from './TaskManager';
import UnitConverter from './UnitConverter';
import FileConverter from './FileConverter';
import LogisticsCalculator from './LogisticsCalculator';
import FreightRateCalculator from './FreightRateCalculator';
import HsCodeEstimator from './HsCodeEstimator';
import CbmCalculator from './CbmCalculator';
import IncotermsVisualizer from './IncotermsVisualizer';
import SlaScorecard from './SlaScorecard';
import OutsourcingQuotation from './OutsourcingQuotation';
import TimesheetRekap from './TimesheetRekap';
import PkwtContractBuilder from './PkwtContractBuilder';
import TurnoverDashboard from './TurnoverDashboard';
import DeploymentPlanner from './DeploymentPlanner';
import VisitorManagement from './VisitorManagement';
import AssetTracker from './AssetTracker';
import EventRundown from './EventRundown';
import VendorDatabase from './VendorDatabase';
import PettyCashForm from './PettyCashForm';
import ReimbursementForm from './ReimbursementForm';
import VehicleChecklist from './VehicleChecklist';
import IncidentReport from './IncidentReport';
import LeaveRequestForm from './LeaveRequestForm';
import VendorPaymentTracker from './VendorPaymentTracker';
import SlaKpiDashboard from './SlaKpiDashboard';
import UniformInventoryManager from './UniformInventoryManager';
import ClientShiftScheduler from './ClientShiftScheduler';
import OnboardingComplianceChecklist from './OnboardingComplianceChecklist';
import IncidentClientFeedbackLog from './IncidentClientFeedbackLog';
import PerformanceAppraisal from './PerformanceAppraisal';
import SafetyIncidentLog from './SafetyIncidentLog';
import RecruitmentPipeline from './RecruitmentPipeline';
import ClientBillingGenerator from './ClientBillingGenerator';
import EmployeeGrievancePortal from './EmployeeGrievancePortal';
import DailyAttendance from './DailyAttendance';
import HeavyEquipmentInspection from './HeavyEquipmentInspection';
import ToolboxMeetingLog from './ToolboxMeetingLog';
import CampAccommodationManager from './CampAccommodationManager';
import PayrollSlipGenerator from './PayrollSlipGenerator';
import SuratJalanMaker from './SuratJalanMaker';
import UangJalanCalculator from './UangJalanCalculator';
import TaxBillingCalculator from './TaxBillingCalculator';
import PoBuilder from './PoBuilder';
import MedicalCheckupTracker from './MedicalCheckupTracker';
import BpjsAdminManager from './BpjsAdminManager';
import TyreMaintenanceLog from './TyreMaintenanceLog';
import CustomsVault from './CustomsVault';
import ClientContractManager from './ClientContractManager';
import FuelConsumptionTracker from './FuelConsumptionTracker';

export const hierarchicalStructure: Suite[] = [
  {
    id: 'document-management',
    name: 'Document Management Suite',
    description: 'Kelola dokumen, PDF, dan data secara efisien',
    icon: '📄',
    color: 'from-blue-500 to-cyan-500',
    modules: [
      {
        id: 'pdf-processing',
        name: 'PDF Processing',
        description: 'Tools untuk mengolah dan memanipulasi file PDF',
        icon: '📑',
        color: 'bg-blue-500',
        tools: [
          { id: 'nota-to-pdf', name: 'Nota ke PDF', description: 'Gabungkan gambar nota ke PDF multi-halaman', icon: '🖼️', color: 'bg-blue-500', component: NotaToPdf, workflow: ['pdf-processor', 'pdf-watermark'] },
          { id: 'pdf-splitter', name: 'PDF Splitter', description: 'Pecah PDF atau extract halaman', icon: '✂️', color: 'bg-cyan-500', component: PdfSplitter, workflow: ['pdf-processor'] },
          { id: 'pdf-processor', name: 'PDF Processor', description: 'Compress, merge, rotate, delete, extract', icon: '⚙️', color: 'bg-indigo-500', component: PDFProcessor, workflow: ['nota-to-pdf', 'pdf-splitter', 'pdf-watermark'] },
          { id: 'pdf-to-image', name: 'PDF to Image', description: 'Konversi PDF ke format gambar', icon: '🖼️', color: 'bg-purple-500', component: PdfToImage, workflow: ['pdf-processor'] },
          { id: 'pdf-watermark', name: 'PDF Watermark', description: 'Tambahkan watermark ke PDF', icon: '💧', color: 'bg-violet-500', component: PdfWatermark, workflow: ['pdf-processor', 'nota-to-pdf'] },
          { id: 'pdf-page-organizer', name: 'PDF Page Organizer', description: 'Atur ulang urutan halaman PDF', icon: '📋', color: 'bg-pink-500', component: PdfPageOrganizer, workflow: ['pdf-processor'] },
          { id: 'pdf-metadata-editor', name: 'PDF Metadata Editor', description: 'Edit metadata PDF', icon: '🏷️', color: 'bg-rose-500', component: PdfMetadataEditor, workflow: ['pdf-processor'] },
          { id: 'pdf-page-numberer', name: 'PDF Page Numberer', description: 'Tambahkan nomor halaman', icon: '🔢', color: 'bg-red-500', component: PdfPageNumberer, workflow: ['pdf-processor'] },
        ],
      },
      {
        id: 'document-generation',
        name: 'Document Generation',
        description: 'Generate dokumen bisnis profesional',
        icon: '📝',
        color: 'bg-green-500',
        tools: [
          { id: 'invoice-generator', name: 'Invoice Generator', description: 'Buat invoice profesional', icon: '💰', color: 'bg-green-500', component: InvoiceGenerator, workflow: ['client-billing-generator', 'purchase-order-generator'] },
          { id: 'delivery-order-generator', name: 'Delivery Order Generator', description: 'Buat delivery order', icon: '📦', color: 'bg-emerald-500', component: DeliveryOrderGenerator, workflow: ['packing-list-generator', 'shipment-tracker'] },
          { id: 'label-generator', name: 'Label Generator', description: 'Generate label pengiriman', icon: '🏷️', color: 'bg-teal-500', component: LabelGenerator, workflow: ['barcode-generator'] },
          { id: 'purchase-order-generator', name: 'Purchase Order Generator', description: 'Buat purchase order', icon: '📋', color: 'bg-lime-500', component: PurchaseOrderGenerator, workflow: ['invoice-generator', 'vendor-database'] },
          { id: 'packing-list-generator', name: 'Packing List Generator', description: 'Buat packing list', icon: '📦', color: 'bg-green-600', component: PackingListGenerator, workflow: ['delivery-order-generator', 'bill-of-lading-generator'] },
          { id: 'bill-of-lading-generator', name: 'Bill of Lading Generator', description: 'Buat Bill of Lading', icon: '🚢', color: 'bg-emerald-600', component: BillOfLadingGenerator, workflow: ['packing-list-generator', 'certificate-of-origin-generator'] },
          { id: 'certificate-of-origin-generator', name: 'Certificate of Origin', description: 'Buat Certificate of Origin', icon: '📜', color: 'bg-teal-600', component: CertificateOfOriginGenerator, workflow: ['bill-of-lading-generator'] },
          { id: 'freight-quotation-generator', name: 'Freight Quotation', description: 'Buat quotation pengiriman', icon: '💵', color: 'bg-cyan-600', component: FreightQuotationGenerator, workflow: ['freight-rate-calculator'] },
          { id: 'dynamic-invoice-generator', name: 'Dynamic Invoice Generator', description: 'Generator invoice dinamis dengan format PDF/Print', icon: '💳', color: 'bg-green-500', component: DynamicInvoiceGenerator, workflow: ['invoice-generator', 'client-database'] },
          { id: 'contract-generator', name: 'Contract Generator', description: 'Generator kontrak PKWT/SPK otomatis', icon: '📄', color: 'bg-emerald-500', component: ContractGenerator, workflow: ['pkwt-contract-builder', 'vendor-database'] },
          { id: 'official-letter-maker', name: 'Official Letter Maker', description: 'Generator surat resmi dengan kop surat perusahaan', icon: '✉️', color: 'bg-teal-500', component: OfficialLetterMaker, workflow: ['document-registry'] },
          { id: 'report-pdf-generator', name: 'Report PDF Generator', description: 'Generator laporan formal dari data rekap', icon: '📊', color: 'bg-lime-500', component: ReportPdfGenerator, workflow: ['data-analytics-dashboard'] },
          { id: 'shipping-doc-formatter', name: 'Shipping Doc Formatter', description: 'Generator Packing List & Commercial Invoice', icon: '🚢', color: 'bg-green-600', component: ShippingDocFormatter, workflow: ['packing-list-generator', 'bill-of-lading-generator'] },
        ],
      },
      {
        id: 'data-management',
        name: 'Data Management',
        description: 'Kelola data dan dokumen dengan efisien',
        icon: '💾',
        color: 'bg-purple-500',
        tools: [
          { id: 'document-registry', name: 'Document Registry', description: 'Register nomor dokumen', icon: '📚', color: 'bg-purple-500', component: DocumentRegistry, workflow: ['document-workflow-manager'] },
          { id: 'client-database', name: 'Client Database', description: 'Kelola database klien', icon: '👥', color: 'bg-violet-500', component: ClientDatabase, workflow: ['invoice-generator', 'client-billing-generator'] },
          { id: 'vendor-database', name: 'Vendor Database', description: 'Kelola database vendor', icon: '🏢', color: 'bg-indigo-500', component: VendorDatabase, workflow: ['purchase-order-generator', 'vendor-payment-tracker'] },
          { id: 'document-workflow-manager', name: 'Document Workflow', description: 'Kelola workflow dokumen', icon: '🔄', color: 'bg-fuchsia-500', component: DocumentWorkflowManager, workflow: ['document-registry'] },
          { id: 'import-export-data-manager', name: 'Import/Export Data', description: 'Kelola import/export data', icon: '📤', color: 'bg-purple-600', component: ImportExportDataManager, workflow: ['data-analytics-dashboard'] },
          { id: 'business-intelligence-reports', name: 'BI Reports', description: 'Generate laporan bisnis', icon: '📊', color: 'bg-violet-600', component: BusinessIntelligenceReports, workflow: ['data-analytics-dashboard', 'sla-kpi-dashboard'] },
          { id: 'batch-renamer', name: 'Batch Renamer', description: 'Rename file massal', icon: '📝', color: 'bg-indigo-600', component: BatchRenamer, workflow: [] },
        ],
      },
    ],
  },
  {
    id: 'operations-management',
    name: 'Operations Management Suite',
    description: 'Tools untuk operasional dan logistik',
    icon: '🚚',
    color: 'from-orange-500 to-red-500',
    modules: [
      {
        id: 'logistics-customs',
        name: 'Logistics & Customs',
        description: 'Tools untuk freight forwarding dan kepabeanan',
        icon: '🌐',
        color: 'bg-orange-500',
        tools: [
          { id: 'shipment-tracker', name: 'Shipment Tracker', description: 'Track pengiriman', icon: '📍', color: 'bg-orange-500', component: ShipmentTracker, workflow: ['delivery-order-generator'] },
          { id: 'freight-rate-calculator', name: 'Freight Rate Calculator', description: 'Hitung biaya pengiriman', icon: '💲', color: 'bg-red-500', component: FreightRateCalculator, workflow: ['freight-quotation-generator'] },
          { id: 'hs-code-estimator', name: 'HS Code Estimator', description: 'Estimasi HS Code & pajak', icon: '🏷️', color: 'bg-orange-600', component: HsCodeEstimator, workflow: ['certificate-of-origin-generator'] },
          { id: 'cbm-calculator', name: 'CBM Calculator', description: 'Hitung CBM & container', icon: '📦', color: 'bg-red-600', component: CbmCalculator, workflow: ['packing-list-generator'] },
          { id: 'incoterms-visualizer', name: 'Incoterms Visualizer', description: 'Panduan Incoterms 2020', icon: '🌍', color: 'bg-orange-700', component: IncotermsVisualizer, workflow: ['bill-of-lading-generator'] },
        ],
      },
      {
        id: 'business-support',
        name: 'Business Support & Facility',
        description: 'Tools untuk dukungan operasional',
        icon: '🏢',
        color: 'bg-amber-500',
        tools: [
          { id: 'visitor-management', name: 'Visitor Management', description: 'Buku tamu digital', icon: '👤', color: 'bg-amber-500', component: VisitorManagement, workflow: [] },
          { id: 'asset-tracker', name: 'Asset Tracker', description: 'Tracking peminjaman aset', icon: '📦', color: 'bg-yellow-500', component: AssetTracker, workflow: ['uniform-inventory-manager'] },
          { id: 'event-rundown', name: 'Event Rundown', description: 'Perencana jadwal acara', icon: '📅', color: 'bg-amber-600', component: EventRundown, workflow: [] },
          { id: 'petty-cash-form', name: 'Petty Cash Form', description: 'Form kas kecil', icon: '💵', color: 'bg-yellow-600', component: PettyCashForm, workflow: ['reimbursement-form'] },
          { id: 'reimbursement-form', name: 'Reimbursement Form', description: 'Form klaim biaya', icon: '💰', color: 'bg-amber-700', component: ReimbursementForm, workflow: ['petty-cash-form'] },
          { id: 'vendor-payment-tracker', name: 'Vendor Payment Tracker', description: 'Tracking pembayaran vendor', icon: '💳', color: 'bg-yellow-700', component: VendorPaymentTracker, workflow: ['vendor-database'] },
        ],
      },
      {
        id: 'utilities',
        name: 'Utilities',
        description: 'Tools pendukung berbagai kebutuhan',
        icon: '🔧',
        color: 'bg-gray-500',
        tools: [
          { id: 'time-tracker', name: 'Time Tracker', description: 'Track waktu kerja', icon: '⏱️', color: 'bg-gray-500', component: TimeTracker, workflow: ['timesheet-rekap'] },
          { id: 'task-manager', name: 'Task Manager', description: 'Kelola tugas', icon: '✅', color: 'bg-slate-500', component: TaskManager, workflow: [] },
          { id: 'unit-converter', name: 'Unit Converter', description: 'Konversi unit', icon: '🔄', color: 'bg-zinc-500', component: UnitConverter, workflow: ['logistics-calculator'] },
          { id: 'file-converter', name: 'File Converter', description: 'Konversi format file', icon: '📁', color: 'bg-neutral-500', component: FileConverter, workflow: ['pdf-to-image'] },
          { id: 'logistics-calculator', name: 'Logistics Calculator', description: 'Kalkulator logistik', icon: '🧮', color: 'bg-stone-500', component: LogisticsCalculator, workflow: ['cbm-calculator', 'freight-rate-calculator'] },
          { id: 'barcode-generator', name: 'Barcode & QR Generator', description: 'Generate barcode/QR', icon: '📱', color: 'bg-gray-600', component: BarcodeGenerator, workflow: ['label-generator'] },
        ],
      },
    ],
  },
  {
    id: 'human-resources',
    name: 'Human Resources Suite',
    description: 'Tools untuk manajemen SDM dan HR',
    icon: '👥',
    color: 'from-pink-500 to-purple-500',
    modules: [
      {
        id: 'human-capital',
        name: 'Human Capital',
        description: 'Tools untuk manajemen SDM',
        icon: '👔',
        color: 'bg-pink-500',
        tools: [
          { id: 'outsourcing-quotation', name: 'Outsourcing Quotation', description: 'Kalkulator billing rate', icon: '💰', color: 'bg-pink-500', component: OutsourcingQuotation, workflow: ['client-billing-generator'] },
          { id: 'timesheet-rekap', name: 'Timesheet Rekap', description: 'Rekap kehadiran & lembur', icon: '⏰', color: 'bg-rose-500', component: TimesheetRekap, workflow: ['daily-attendance', 'time-tracker'] },
          { id: 'pkwt-contract-builder', name: 'PKWT Contract Builder', description: 'Generator kontrak PKWT', icon: '📝', color: 'bg-pink-600', component: PkwtContractBuilder, workflow: ['recruitment-pipeline', 'onboarding-compliance-checklist'] },
          { id: 'turnover-dashboard', name: 'Turnover Dashboard', description: 'Dashboard keluar-masuk karyawan', icon: '📊', color: 'bg-rose-600', component: TurnoverDashboard, workflow: ['performance-appraisal'] },
          { id: 'deployment-planner', name: 'Deployment Planner', description: 'Checklist deployment', icon: '✅', color: 'bg-pink-700', component: DeploymentPlanner, workflow: ['onboarding-compliance-checklist'] },
          { id: 'leave-request-form', name: 'Leave Request Form', description: 'Form pengajuan cuti', icon: '🏖️', color: 'bg-rose-700', component: LeaveRequestForm, workflow: ['timesheet-rekap'] },
          { id: 'employee-grievance-portal', name: 'Employee Grievance Portal', description: 'Portal pengaduan karyawan', icon: '💬', color: 'bg-pink-800', component: EmployeeGrievancePortal, workflow: ['incident-client-feedback-log'] },
        ],
      },
      {
        id: 'outsourcing-management',
        name: 'Outsourcing Management',
        description: 'Tools untuk manajemen outsourcing',
        icon: '🤝',
        color: 'bg-purple-500',
        tools: [
          { id: 'performance-appraisal', name: 'Performance Appraisal', description: 'Penilaian kinerja', icon: '⭐', color: 'bg-purple-500', component: PerformanceAppraisal, workflow: ['turnover-dashboard'] },
          { id: 'safety-incident-log', name: 'Safety Incident Log', description: 'Pencatatan insiden K3', icon: '⚠️', color: 'bg-violet-500', component: SafetyIncidentLog, workflow: ['toolbox-meeting-log', 'incident-report'] },
          { id: 'recruitment-pipeline', name: 'Recruitment Pipeline', description: 'Applicant Tracking System', icon: '🎯', color: 'bg-purple-600', component: RecruitmentPipeline, workflow: ['pkwt-contract-builder', 'onboarding-compliance-checklist'] },
          { id: 'client-billing-generator', name: 'Client Billing Generator', description: 'Generator tagihan klien', icon: '💵', color: 'bg-violet-600', component: ClientBillingGenerator, workflow: ['outsourcing-quotation', 'invoice-generator'] },
          { id: 'uniform-inventory-manager', name: 'Uniform & Inventory Manager', description: 'Tracking seragam & APD', icon: '👕', color: 'bg-purple-700', component: UniformInventoryManager, workflow: ['asset-tracker', 'deployment-planner'] },
          { id: 'client-shift-scheduler', name: 'Client Shift Scheduler', description: 'Perencana shift 24/7', icon: '📅', color: 'bg-violet-700', component: ClientShiftScheduler, workflow: ['timesheet-rekap', 'daily-attendance'] },
          { id: 'onboarding-compliance-checklist', name: 'Onboarding Checklist', description: 'Checklist kepatuhan', icon: '✅', color: 'bg-purple-800', component: OnboardingComplianceChecklist, workflow: ['recruitment-pipeline', 'deployment-planner'] },
          { id: 'incident-client-feedback-log', name: 'Client Feedback Log', description: 'Log keluhan & feedback', icon: '💬', color: 'bg-violet-800', component: IncidentClientFeedbackLog, workflow: ['employee-grievance-portal'] },
        ],
      },
    ],
  },
  {
    id: 'business-intelligence',
    name: 'Business Intelligence Suite',
    description: 'Tools untuk analytics dan reporting',
    icon: '📊',
    color: 'from-indigo-500 to-blue-500',
    modules: [
      {
        id: 'analytics-reporting',
        name: 'Analytics & Reporting',
        description: 'Dashboard dan laporan analitik',
        icon: '📈',
        color: 'bg-indigo-500',
        tools: [
          { id: 'data-analytics-dashboard', name: 'Data Analytics Dashboard', description: 'Dashboard analitik', icon: '📊', color: 'bg-indigo-500', component: DataAnalyticsDashboard, workflow: ['business-intelligence-reports', 'sla-kpi-dashboard'] },
          { id: 'sla-kpi-dashboard', name: 'SLA & KPI Dashboard', description: 'Tracking SLA & KPI', icon: '🎯', color: 'bg-blue-500', component: SlaKpiDashboard, workflow: ['performance-appraisal', 'data-analytics-dashboard'] },
          { id: 'sla-scorecard', name: 'SLA Scorecard', description: 'Scorecard performa', icon: '📋', color: 'bg-indigo-600', component: SlaScorecard, workflow: ['sla-kpi-dashboard'] },
        ],
      },
    ],
  },
  {
    id: 'mining-operations',
    name: 'Mining Operations Suite',
    description: 'Tools khusus operasional pertambangan',
    icon: '⛏️',
    color: 'from-amber-600 to-orange-600',
    modules: [
      {
        id: 'site-operations',
        name: 'Site Operations',
        description: 'Operasional site tambang',
        icon: '🏗️',
        color: 'bg-amber-500',
        tools: [
          { id: 'daily-attendance', name: 'Daily Attendance & Rosters', description: 'Absensi & shift rotation', icon: '⏰', color: 'bg-amber-500', component: DailyAttendance, workflow: ['timesheet-rekap', 'client-shift-scheduler'] },
          { id: 'heavy-equipment-inspection', name: 'Heavy Equipment Inspection', description: 'P2H alat berat', icon: '🔧', color: 'bg-orange-500', component: HeavyEquipmentInspection, workflow: ['vehicle-checklist', 'asset-tracker'] },
          { id: 'camp-accommodation-manager', name: 'Camp & Mess Manager', description: 'Manajemen asrama', icon: '🏠', color: 'bg-amber-600', component: CampAccommodationManager, workflow: ['deployment-planner'] },
          { id: 'fuel-consumption-tracker', name: 'Fuel Consumption Tracker', description: 'Tracking BBM', icon: '⛽', color: 'bg-orange-600', component: FuelConsumptionTracker, workflow: ['heavy-equipment-inspection'] },
        ],
      },
      {
        id: 'safety-compliance',
        name: 'Safety & Compliance',
        description: 'Keselamatan dan kepatuhan',
        icon: '🛡️',
        color: 'bg-red-500',
        tools: [
          { id: 'toolbox-meeting-log', name: 'Toolbox Meeting Log', description: 'Safety talk harian', icon: '📋', color: 'bg-red-500', component: ToolboxMeetingLog, workflow: ['safety-incident-log', 'incident-report'] },
          { id: 'vehicle-checklist', name: 'Vehicle Checklist', description: 'Inspeksi kendaraan', icon: '🚗', color: 'bg-red-600', component: VehicleChecklist, workflow: ['heavy-equipment-inspection'] },
          { id: 'incident-report', name: 'Incident Report', description: 'Pelaporan insiden', icon: '⚠️', color: 'bg-red-700', component: IncidentReport, workflow: ['safety-incident-log', 'toolbox-meeting-log'] },
        ],
      },
    ],
  },
  {
    id: 'erp-suite',
    name: 'ERP Suite',
    description: 'Tools untuk Enterprise Resource Planning dan administrasi bisnis',
    icon: '🏢',
    color: 'from-slate-500 to-gray-600',
    modules: [
      {
        id: 'payroll-finance',
        name: 'Payroll & Finance',
        description: 'Pengelolaan gaji, pajak, dan keuangan',
        icon: '💰',
        color: 'bg-slate-500',
        tools: [
          { id: 'payroll-slip-generator', name: 'Payroll Slip Generator', description: 'Generator slip gaji karyawan', icon: '💵', color: 'bg-slate-500', component: PayrollSlipGenerator, workflow: ['bpjs-admin-manager', 'tax-billing-calculator'] },
          { id: 'tax-billing-calculator', name: 'Tax Billing Calculator', description: 'Kalkulator PPN & PPh 23', icon: '🧾', color: 'bg-gray-500', component: TaxBillingCalculator, workflow: ['payroll-slip-generator', 'client-billing-generator'] },
          { id: 'uang-jalan-calculator', name: 'Uang Jalan Calculator', description: 'Kalkulator uang jalan driver', icon: '🚛', color: 'bg-slate-600', component: UangJalanCalculator, workflow: ['surat-jalan-maker'] },
        ],
      },
      {
        id: 'procurement-logistics',
        name: 'Procurement & Logistics',
        description: 'Pengadaan barang dan logistik pengiriman',
        icon: '📦',
        color: 'bg-gray-500',
        tools: [
          { id: 'po-builder', name: 'PO Builder', description: 'Generator Purchase Order', icon: '📋', color: 'bg-gray-500', component: PoBuilder, workflow: ['vendor-database', 'surat-jalan-maker'] },
          { id: 'surat-jalan-maker', name: 'Surat Jalan Maker', description: 'Generator surat jalan pengiriman', icon: '🚚', color: 'bg-gray-600', component: SuratJalanMaker, workflow: ['po-builder', 'uang-jalan-calculator'] },
        ],
      },
      {
        id: 'hr-compliance',
        name: 'HR & Compliance',
        description: 'Manajemen SDM dan kepatuhan regulasi',
        icon: '👥',
        color: 'bg-slate-600',
        tools: [
          { id: 'medical-checkup-tracker', name: 'Medical Checkup Tracker', description: 'Pemantauan MCU dan sertifikasi K3', icon: '🏥', color: 'bg-slate-600', component: MedicalCheckupTracker, workflow: ['bpjs-admin-manager'] },
          { id: 'bpjs-admin-manager', name: 'BPJS Admin Manager', description: 'Rekapitulasi kepesertaan BPJS', icon: '🏛️', color: 'bg-gray-600', component: BpjsAdminManager, workflow: ['payroll-slip-generator', 'medical-checkup-tracker'] },
        ],
      },
      {
        id: 'asset-customs',
        name: 'Asset & Customs',
        description: 'Manajemen aset dan kepabeanan',
        icon: '🏭',
        color: 'bg-gray-600',
        tools: [
          { id: 'tyre-maintenance-log', name: 'Tyre Maintenance Log', description: 'Log perawatan ban dan sparepart', icon: '🔧', color: 'bg-gray-600', component: TyreMaintenanceLog, workflow: ['heavy-equipment-inspection'] },
          { id: 'customs-vault', name: 'Customs Vault', description: 'Repository dokumen kepabeanan', icon: '📁', color: 'bg-slate-700', component: CustomsVault, workflow: ['bill-of-lading-generator', 'certificate-of-origin-generator'] },
          { id: 'client-contract-manager', name: 'Client Contract Manager', description: 'Tracker kontrak B2B dengan pengingat', icon: '📄', color: 'bg-gray-700', component: ClientContractManager, workflow: ['pkwt-contract-builder', 'client-billing-generator'] },
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
