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

const LIFECYCLE_SUITE_ID = 'phl-mining-lifecycle';
const lifecycleToolIds = new Set([
  'recruitment-pipeline',
  'pkwt-contract-builder',
  'onboarding-compliance-checklist',
  'deployment-planner',
  'daily-attendance',
  'timesheet-rekap',
  'payroll-slip-generator',
]);

const tool = (
  id: string,
  name: string,
  description: string,
  icon: string,
  component: Tool['component'],
  workflow: string[],
): Tool => ({ id, name, description, icon, color: 'bg-blue-600', component, workflow });

const lifecycleSuite: Suite = {
  id: LIFECYCLE_SUITE_ID,
  name: 'PHL Mining Workforce Lifecycle',
  description: 'Satu alur berurutan pekerja harian tambang dari recruitment sampai payroll',
  icon: 'FieldOps',
  color: 'from-blue-600 to-cyan-500',
  modules: [
    {
      id: 'phl-00-control-center',
      name: '00 · Lifecycle Control Center',
      description: 'Ringkasan funnel, readiness, bottleneck, attendance, dan exposure payroll',
      icon: 'Dashboard',
      color: 'bg-slate-700',
      tools: [tool(
        'phl-lifecycle-control-center',
        'PHL Lifecycle Control Center',
        'Monitor end-to-end lifecycle pekerja harian tambang',
        'Dashboard',
        PhlLifecycleControlCenter,
        ['recruitment-pipeline'],
      )],
    },
    {
      id: 'phl-01-recruitment',
      name: '01 · Recruitment & Screening',
      description: 'Registrasi kandidat, screening, trade, site, roster, dan rate harian',
      icon: 'Recruitment',
      color: 'bg-blue-600',
      tools: [tool(
        'recruitment-pipeline',
        'Recruitment Pipeline',
        'Registrasi dan screening kandidat PHL tambang',
        'Recruitment',
        RecruitmentPipeline,
        ['pkwt-contract-builder'],
      )],
    },
    {
      id: 'phl-02-contract',
      name: '02 · PHL Contract',
      description: 'Pembuatan perjanjian kerja harian berdasarkan rate per hari dan penugasan site',
      icon: 'Contract',
      color: 'bg-blue-600',
      tools: [tool(
        'pkwt-contract-builder',
        'PHL Contract Builder',
        'Generator Perjanjian Kerja Harian / PHL',
        'Contract',
        PkwtContractBuilder,
        ['onboarding-compliance-checklist'],
      )],
    },
    {
      id: 'phl-03-onboarding',
      name: '03 · Onboarding & Compliance',
      description: 'Admin verifikasi kontrak, identitas, MCU, induction, kompetensi, SIMPER, dan rekening',
      icon: 'Contract',
      color: 'bg-blue-600',
      tools: [tool(
        'onboarding-compliance-checklist',
        'Onboarding & Compliance',
        'Admin-managed compliance gate sebelum mobilisasi',
        'Contract',
        OnboardingComplianceChecklist,
        ['deployment-planner'],
      )],
    },
    {
      id: 'phl-04-mobilization',
      name: '04 · Mobilization & Deployment',
      description: 'Transport, camp, APD, site access, toolbox, dan aktivasi pekerja di site',
      icon: 'FieldOps',
      color: 'bg-blue-600',
      tools: [tool(
        'deployment-planner',
        'Deployment Planner',
        'Readiness mobilisasi dan aktivasi pekerja PHL',
        'FieldOps',
        DeploymentPlanner,
        ['daily-attendance'],
      )],
    },
    {
      id: 'phl-05-attendance',
      name: '05 · Daily Attendance',
      description: 'Kehadiran harian pekerja aktif sebagai sumber hari bayar',
      icon: 'FieldOps',
      color: 'bg-blue-600',
      tools: [tool(
        'daily-attendance',
        'Daily Attendance',
        'Catat hadir, shift, jam kerja, dan overtime pekerja aktif',
        'FieldOps',
        DailyAttendance,
        ['timesheet-rekap'],
      )],
    },
    {
      id: 'phl-06-timesheet',
      name: '06 · Timesheet & Validation',
      description: 'Rekap attendance menjadi paid days dan overtime tervalidasi',
      icon: 'Timesheet',
      color: 'bg-blue-600',
      tools: [tool(
        'timesheet-rekap',
        'Timesheet Rekap',
        'Rekap hari kerja dan overtime dari Daily Attendance',
        'Timesheet',
        TimesheetRekap,
        ['payroll-slip-generator'],
      )],
    },
    {
      id: 'phl-07-payroll',
      name: '07 · Payroll & Settlement',
      description: 'Hitung pembayaran berdasarkan paid days × rate harian ditambah lembur dan dikurangi potongan',
      icon: 'Payroll',
      color: 'bg-blue-600',
      tools: [tool(
        'payroll-slip-generator',
        'PHL Payroll Slip',
        'Payroll pekerja harian berbasis attendance aktual',
        'Payroll',
        PayrollSlipGenerator,
        ['phl-lifecycle-control-center'],
      )],
    },
  ],
};

// Keep the lifecycle tools in exactly one suite. Other suites retain only
// supporting / non-core tools so navigation has one canonical PHL flow.
for (const suite of hierarchicalStructure) {
  if (suite.id === LIFECYCLE_SUITE_ID) continue;
  suite.modules = suite.modules
    .map((module) => ({ ...module, tools: module.tools.filter((item) => !lifecycleToolIds.has(item.id)) }))
    .filter((module) => module.tools.length > 0);
}

if (!hierarchicalStructure.some((suite) => suite.id === LIFECYCLE_SUITE_ID)) {
  hierarchicalStructure.unshift(lifecycleSuite);
}

Object.assign(iconMap, {
  [LIFECYCLE_SUITE_ID]: 'FieldOps',
  'phl-00-control-center': 'Dashboard',
  'phl-01-recruitment': 'Recruitment',
  'phl-02-contract': 'Contract',
  'phl-03-onboarding': 'Contract',
  'phl-04-mobilization': 'FieldOps',
  'phl-05-attendance': 'FieldOps',
  'phl-06-timesheet': 'Timesheet',
  'phl-07-payroll': 'Payroll',
  'phl-lifecycle-control-center': 'Dashboard',
});
