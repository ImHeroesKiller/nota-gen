import MinerbaOneChecker from './components/MinerbaOneChecker';
import { hierarchicalStructure, iconMap } from './components/newHierarchicalStructure';

const financeSuite = hierarchicalStructure.find((suite) => suite.id === 'finance-legal');
const legalModule = financeSuite?.modules.find((module) => module.id === 'corporate-legal');

if (legalModule && !legalModule.tools.some((tool) => tool.id === 'minerbaone-checker')) {
  legalModule.tools.unshift({
    id: 'minerbaone-checker',
    name: 'MinerbaOne Business Checker',
    description: 'Cek badan usaha, direksi, saham, perizinan, CNC, dan WIUP dari halaman publik MinerbaOne',
    icon: 'Contract',
    color: 'bg-emerald-600',
    component: MinerbaOneChecker,
    workflow: [],
  });
}

iconMap['minerbaone-checker'] = 'Contract';
