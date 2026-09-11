import {
  hierarchicalStructure,
  iconMap,
  type Suite,
  type Tool,
} from './components/newHierarchicalStructure';
import PhlLifecycleControlCenter from './components/PhlLifecycleControlCenter';
import RecruitmentPipeline from './components/RecruitmentPipeline';
import PkwtContractBuilder from './components/PkwtContractBuilder';
import OnboardingComplianceChecklist from './components/OnboardingComplianceChecklist';
import DeploymentPlanner from './components/DeploymentPlanner';
import DailyAttendance from './components/DailyAttendance';
import TimesheetRekap from './components/TimesheetRekap';
import PayrollSlipGenerator from './components/PayrollSlipGenerator';
import PhlInvoiceBilling from './components/PhlInvoiceBilling';
import PhlArMonitoring from './components/PhlArMonitoring';
import {
  activateLifecycleNumberRegistry,
  PHL_LIFECYCLE_REGISTER_PREFIX,
  PHL_LIFECYCLE_SUITE_ID,
} from './lib/lifecycleNumberRegistry';

const lifecycleToolIds = new Set([
  'recruitment-pipeline',
  'pkwt-contract-builder',
  'onboarding-compliance-checklist',
  'deployment-planner',
  'daily-attendance',
  'timesheet-rekap',
  'payroll-slip-generator',
  'phl-invoice-billing',
  'phl-ar-monitoring',
]);

type DirectLifecycleSuite = Suite & {
  navigationMode: 'direct-tools';
  workflowScope: 'suite';
  sequenceStart: number;
  registerPrefix: string;
};

const tool = (
  id: string,
  name: string,
  description: string,
  icon: string,
  component: Tool['component'],
  workflow: string[],
): Tool => ({ id, name, description, icon, color: 'bg-blue-600', component, workflow });

const lifecycleTools: Tool[] = [
  tool(
    'phl-lifecycle-control-center',
    'PHL Lifecycle Control Center',
    'Monitor end-to-end lifecycle pekerja harian tambang',
    'Dashboard',
    PhlLifecycleControlCenter,
    ['recruitment-pipeline'],
  ),
  tool(
    'recruitment-pipeline',
    'Recruitment & Screening',
    'Registrasi kandidat, screening, trade, site, roster, dan rate harian',
    'Recruitment',
    RecruitmentPipeline,
    ['pkwt-contract-builder'],
  ),
  tool(
    'pkwt-contract-builder',
    'PHL Contract',
    'Generator Perjanjian Kerja Harian berdasarkan rate harian dan penugasan site',
    'Contract',
    PkwtContractBuilder,
    ['onboarding-compliance-checklist'],
  ),
  tool(
    'onboarding-compliance-checklist',
    'Onboarding & Compliance',
    'Admin-managed compliance gate: identitas, kontrak, MCU, induction, kompetensi, SIMPER, dan rekening',
    'Contract',
    OnboardingComplianceChecklist,
    ['deployment-planner'],
  ),
  tool(
    'deployment-planner',
    'Mobilization & Deployment',
    'Transport, camp, APD, site access, toolbox, dan aktivasi pekerja di site',
    'FieldOps',
    DeploymentPlanner,
    ['daily-attendance'],
  ),
  tool(
    'daily-attendance',
    'Daily Attendance',
    'Kehadiran harian pekerja aktif sebagai sumber hari bayar',
    'FieldOps',
    DailyAttendance,
    ['timesheet-rekap'],
  ),
  tool(
    'timesheet-rekap',
    'Timesheet & Validation',
    'Rekap attendance menjadi paid days dan overtime tervalidasi',
    'Timesheet',
    TimesheetRekap,
    ['payroll-slip-generator'],
  ),
  tool(
    'payroll-slip-generator',
    'Payroll & Settlement',
    'Pembayaran PHL berdasarkan paid days × rate harian, lembur, dan potongan',
    'Payroll',
    PayrollSlipGenerator,
    ['phl-invoice-billing'],
  ),
  tool(
    'phl-invoice-billing',
    'Invoice & Billing',
    'Generate invoice PHL dari paid attendance, payroll base, fee, dan komponen billing',
    'Invoice',
    PhlInvoiceBilling,
    ['phl-ar-monitoring'],
  ),
  tool(
    'phl-ar-monitoring',
    'Monitoring AR',
    'Monitor outstanding, aging, overdue, dan pembayaran invoice PHL',
    'Invoice',
    PhlArMonitoring,
    [],
  ),
];

const lifecycleSuite: DirectLifecycleSuite = {
  id: PHL_LIFECYCLE_SUITE_ID,
  name: 'PHL Mining Workforce Lifecycle',
  description: 'Satu alur berurutan pekerja harian tambang dari recruitment sampai invoice dan collection',
  icon: 'FieldOps',
  color: 'from-blue-600 to-cyan-500',
  navigationMode: 'direct-tools',
  workflowScope: 'suite',
  sequenceStart: 0,
  registerPrefix: PHL_LIFECYCLE_REGISTER_PREFIX,
  modules: [
    {
      id: 'phl-lifecycle-flow',
      name: 'Lifecycle Tools',
      description: 'Internal container untuk direct ordered tools; tidak ditampilkan sebagai modul',
      icon: 'FieldOps',
      color: 'bg-blue-600',
      tools: lifecycleTools,
    },
  ],
};

// Keep the core lifecycle tools in exactly one canonical suite. Supporting tools
// remain in their original suites, while the custom lifecycle suite exposes the
// core tools directly without an intermediate module screen.
for (const suite of hierarchicalStructure) {
  if (suite.id === PHL_LIFECYCLE_SUITE_ID) continue;
  suite.modules = suite.modules
    .map((module) => ({ ...module, tools: module.tools.filter((item) => !lifecycleToolIds.has(item.id)) }))
    .filter((module) => module.tools.length > 0);
}

if (!hierarchicalStructure.some((suite) => suite.id === PHL_LIFECYCLE_SUITE_ID)) {
  hierarchicalStructure.unshift(lifecycleSuite);
}

Object.assign(iconMap, {
  [PHL_LIFECYCLE_SUITE_ID]: 'FieldOps',
  'phl-lifecycle-flow': 'FieldOps',
  'phl-lifecycle-control-center': 'Dashboard',
  'phl-invoice-billing': 'Invoice',
  'phl-ar-monitoring': 'Invoice',
});

// Register numbers are assigned automatically to every worker in this lifecycle,
// including existing local records, and stay synchronized on lifecycle changes.
activateLifecycleNumberRegistry();
