import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  Command,
  Grid2X2,
  Layers3,
  List,
  Menu,
  Moon,
  Search,
  Sun,
  Wrench,
} from 'lucide-react';
import {
  hierarchicalStructure,
  getToolById,
  iconMap,
  type Module as SuiteModule,
  type Suite,
  type Tool,
} from './newHierarchicalStructure';
import { Sidebar } from './Sidebar';
import { Icons } from './IconLibrary';

type ViewLevel = 'dashboard' | 'suites' | 'suite' | 'modules' | 'module' | 'tools' | 'tool';
type DirectoryView = 'dashboard' | 'suites' | 'modules' | 'tools';
type SuiteViewMode = 'grid' | 'list';

interface NavigationState {
  level: ViewLevel;
  selectedSuiteId?: string;
  selectedModuleId?: string;
  selectedTool?: Tool;
}

interface ModuleContext {
  suite: Suite;
  module: SuiteModule;
}

interface ToolContext extends ModuleContext {
  tool: Tool;
}

interface SearchResult {
  id: string;
  type: 'Suite' | 'Modul' | 'Tool';
  title: string;
  description: string;
  context?: string;
  iconName: string;
  suiteId?: string;
  moduleId?: string;
  toolId?: string;
}

const suiteAccents: Record<string, string> = {
  'human-capital': '#2563EB',
  'logistics-fleet': '#10B981',
  'customs-trade': '#7C3AED',
  'finance-legal': '#F97316',
  'field-operations': '#059669',
  'document-management': '#E11D48',
  'outsourcing-documents': '#8B5CF6',
};

const getSuiteStyle = (suiteId?: string): CSSProperties => ({
  '--suite-accent': suiteAccents[suiteId || ''] || '#2563EB',
} as CSSProperties);

export default function ToolHub() {
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [navigation, setNavigation] = useState<NavigationState>({ level: 'dashboard' });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [suiteViewMode, setSuiteViewMode] = useState<SuiteViewMode>('grid');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const modules = useMemo<ModuleContext[]>(
    () => hierarchicalStructure.flatMap((suite) => suite.modules.map((module) => ({ suite, module }))),
    []
  );

  const tools = useMemo<ToolContext[]>(
    () => modules.flatMap(({ suite, module }) => module.tools.map((tool) => ({ suite, module, tool }))),
    [modules]
  );

  const selectedSuite = navigation.selectedSuiteId
    ? hierarchicalStructure.find((suite) => suite.id === navigation.selectedSuiteId)
    : undefined;

  const selectedModuleContext = navigation.selectedModuleId
    ? modules.find(({ module }) => module.id === navigation.selectedModuleId)
    : undefined;

  const selectedToolContext = navigation.selectedTool
    ? tools.find(({ tool }) => tool.id === navigation.selectedTool?.id)
    : undefined;

  const searchResults = useMemo<SearchResult[]>(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    const suiteResults: SearchResult[] = hierarchicalStructure
      .filter((suite) => `${suite.name} ${suite.description}`.toLowerCase().includes(query))
      .map((suite) => ({
        id: suite.id,
        type: 'Suite',
        title: suite.name,
        description: suite.description,
        iconName: iconMap[suite.id] || 'Dashboard',
        suiteId: suite.id,
      }));

    const moduleResults: SearchResult[] = modules
      .filter(({ suite, module }) => `${suite.name} ${module.name} ${module.description}`.toLowerCase().includes(query))
      .map(({ suite, module }) => ({
        id: module.id,
        type: 'Modul',
        title: module.name,
        description: module.description,
        context: suite.name,
        iconName: iconMap[module.id] || 'Document',
        suiteId: suite.id,
        moduleId: module.id,
      }));

    const toolResults: SearchResult[] = tools
      .filter(({ suite, module, tool }) => `${suite.name} ${module.name} ${tool.name} ${tool.description}`.toLowerCase().includes(query))
      .map(({ suite, module, tool }) => ({
        id: tool.id,
        type: 'Tool',
        title: tool.name,
        description: tool.description,
        context: `${suite.name} / ${module.name}`,
        iconName: iconMap[tool.id] || 'Document',
        suiteId: suite.id,
        moduleId: module.id,
        toolId: tool.id,
      }));

    return [...suiteResults, ...moduleResults, ...toolResults].slice(0, 40);
  }, [modules, searchQuery, tools]);

  const getIconComponent = (iconName: string, size = 22) => {
    const IconComponent = (Icons as any)[iconName] || Icons.Document;
    return <IconComponent size={size} />;
  };

  const activeDirectoryView: DirectoryView =
    navigation.level === 'dashboard'
      ? 'dashboard'
      : navigation.level === 'modules' || navigation.level === 'module'
        ? 'modules'
        : navigation.level === 'tools' || navigation.level === 'tool'
          ? 'tools'
          : 'suites';

  const handleNavigate = (view: DirectoryView) => {
    setNavigation({ level: view });
    setSearchQuery('');
  };

  const handleSuiteSelect = (suiteId: string) => {
    setNavigation({ level: 'suite', selectedSuiteId: suiteId });
    setSearchQuery('');
  };

  const handleModuleSelect = (suiteId: string, moduleId: string) => {
    setNavigation({ level: 'module', selectedSuiteId: suiteId, selectedModuleId: moduleId });
    setSearchQuery('');
  };

  const handleToolSelect = (toolId: string) => {
    const tool = getToolById(toolId);
    const context = tools.find(({ tool: item }) => item.id === toolId);
    if (!tool || !context) return;

    setNavigation({
      level: 'tool',
      selectedSuiteId: context.suite.id,
      selectedModuleId: context.module.id,
      selectedTool: tool,
    });
    setSearchQuery('');
  };

  const handleBackFromTool = () => {
    if (navigation.selectedSuiteId && navigation.selectedModuleId) {
      setNavigation({
        level: 'module',
        selectedSuiteId: navigation.selectedSuiteId,
        selectedModuleId: navigation.selectedModuleId,
      });
      return;
    }
    setNavigation({ level: 'tools' });
  };

  const handleSearchResult = (result: SearchResult) => {
    if (result.toolId) return handleToolSelect(result.toolId);
    if (result.suiteId && result.moduleId) return handleModuleSelect(result.suiteId, result.moduleId);
    if (result.suiteId) handleSuiteSelect(result.suiteId);
  };

  const SuiteCard = ({ suite }: { suite: Suite }) => {
    const toolCount = suite.modules.reduce((total, module) => total + module.tools.length, 0);

    if (suiteViewMode === 'list') {
      return (
        <article className="erp-suite-list-row" style={getSuiteStyle(suite.id)}>
          <button type="button" className="erp-suite-list-main" onClick={() => handleSuiteSelect(suite.id)}>
            <span className="erp-suite-icon">{getIconComponent(iconMap[suite.id] || 'Dashboard', 24)}</span>
            <span className="erp-suite-list-copy">
              <strong>{suite.name}</strong>
              <small>{suite.description}</small>
            </span>
          </button>
          <span className="erp-list-meta">{suite.modules.length} modul</span>
          <span className="erp-list-meta">{toolCount} tools</span>
          <ChevronRight size={18} className="erp-chevron" />
        </article>
      );
    }

    return (
      <article className="erp-suite-card" style={getSuiteStyle(suite.id)}>
        <button type="button" className="erp-suite-card-header" onClick={() => handleSuiteSelect(suite.id)}>
          <span className="erp-suite-icon">{getIconComponent(iconMap[suite.id] || 'Dashboard', 26)}</span>
          <span className="erp-suite-heading">
            <strong>{suite.name}</strong>
            <small>{suite.description}</small>
          </span>
          <span className="erp-suite-tool-total">{toolCount} tools</span>
        </button>
        <div className="erp-module-rows">
          {suite.modules.map((module) => (
            <button
              type="button"
              key={module.id}
              className="erp-module-row"
              onClick={() => handleModuleSelect(suite.id, module.id)}
            >
              <span className="erp-module-row-icon">{getIconComponent(iconMap[module.id] || 'Document', 16)}</span>
              <span className="erp-module-row-name">{module.name}</span>
              <span className="erp-module-row-count">{module.tools.length} tools</span>
              <ChevronRight size={16} className="erp-chevron" />
            </button>
          ))}
        </div>
      </article>
    );
  };

  const ToolCard = ({ context }: { context: ToolContext }) => (
    <button
      type="button"
      className="erp-tool-card"
      style={getSuiteStyle(context.suite.id)}
      onClick={() => handleToolSelect(context.tool.id)}
    >
      <span className="erp-tool-icon">{getIconComponent(iconMap[context.tool.id] || 'Document', 20)}</span>
      <span className="erp-tool-card-copy">
        <strong>{context.tool.name}</strong>
        <small>{context.tool.description}</small>
        <em>{context.suite.name} / {context.module.name}</em>
      </span>
      <ChevronRight size={17} className="erp-chevron" />
    </button>
  );

  const SuiteSection = () => (
    <section className="erp-section">
      <div className="erp-section-head">
        <div>
          <h2>Suite Bisnis</h2>
          <p>Pilih suite untuk mengakses modul dan tools yang tersedia.</p>
        </div>
        <div className="erp-view-toggle" aria-label="Mode tampilan suite">
          <button type="button" className={suiteViewMode === 'grid' ? 'is-active' : ''} onClick={() => setSuiteViewMode('grid')}>
            <Grid2X2 size={16} /><span>Grid</span>
          </button>
          <button type="button" className={suiteViewMode === 'list' ? 'is-active' : ''} onClick={() => setSuiteViewMode('list')}>
            <List size={16} /><span>List</span>
          </button>
        </div>
      </div>
      <div className={suiteViewMode === 'grid' ? 'erp-suite-grid' : 'erp-suite-list'}>
        {hierarchicalStructure.map((suite) => <SuiteCard key={suite.id} suite={suite} />)}
      </div>
    </section>
  );

  const renderSearchResults = () => (
    <div className="erp-page">
      <div className="erp-page-heading"><div><span className="erp-eyebrow">Global Search</span><h1>Hasil pencarian</h1><p>{searchResults.length} hasil untuk “{searchQuery.trim()}”</p></div></div>
      {searchResults.length === 0 ? (
        <div className="erp-empty-state"><Search size={28} /><strong>Tidak ada hasil ditemukan</strong><p>Coba nama suite, modul, atau tool yang berbeda.</p></div>
      ) : (
        <div className="erp-search-results">
          {searchResults.map((result) => (
            <button type="button" key={`${result.type}-${result.id}`} className="erp-search-result" onClick={() => handleSearchResult(result)}>
              <span className="erp-search-result-icon">{getIconComponent(result.iconName, 20)}</span>
              <span className="erp-search-result-copy"><span className="erp-result-type">{result.type}</span><strong>{result.title}</strong><small>{result.context || result.description}</small></span>
              <ChevronRight size={17} className="erp-chevron" />
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const renderDashboard = () => (
    <div className="erp-page">
      <section className="erp-hero">
        <div className="erp-hero-content">
          <span className="erp-eyebrow">Enterprise Resource Planning</span>
          <h1>PERADA Tools</h1>
          <p>Kelola seluruh operasi bisnis dalam satu workspace yang modular, terintegrasi, dan siap berkembang.</p>
          <div className="erp-hero-badges"><span>Modular</span><span>Terintegrasi</span><span>Siap Berkembang</span></div>
        </div>
        <div className="erp-hero-visual" aria-hidden="true">
          <span className="erp-hero-grid" /><span className="erp-hero-orb erp-hero-orb-one" /><span className="erp-hero-orb erp-hero-orb-two" />
          <div className="erp-hero-stack"><span><Layers3 size={17} /> Suite</span><span><Grid2X2 size={17} /> Modul</span><span><Wrench size={17} /> Tools</span></div>
        </div>
      </section>
      <SuiteSection />
    </div>
  );

  const renderSuitesDirectory = () => (
    <div className="erp-page"><div className="erp-page-heading"><div><span className="erp-eyebrow">ERP Directory</span><h1>Semua Suites</h1><p>Struktur bisnis utama PERADA Tools dalam satu tampilan.</p></div></div><SuiteSection /></div>
  );

  const renderModulesDirectory = () => (
    <div className="erp-page">
      <div className="erp-page-heading"><div><span className="erp-eyebrow">ERP Directory</span><h1>Semua Modul</h1><p>Temukan modul lintas suite dan buka tools di dalamnya.</p></div></div>
      <div className="erp-module-grid">
        {modules.map(({ suite, module }) => (
          <button type="button" key={module.id} className="erp-module-card" style={getSuiteStyle(suite.id)} onClick={() => handleModuleSelect(suite.id, module.id)}>
            <span className="erp-module-card-icon">{getIconComponent(iconMap[module.id] || 'Document', 21)}</span>
            <span className="erp-module-card-copy"><em>{suite.name}</em><strong>{module.name}</strong><small>{module.description}</small><span>{module.tools.length} tools</span></span>
            <ChevronRight size={17} className="erp-chevron" />
          </button>
        ))}
      </div>
    </div>
  );

  const renderToolsDirectory = () => (
    <div className="erp-page"><div className="erp-page-heading"><div><span className="erp-eyebrow">ERP Directory</span><h1>Semua Tools</h1><p>Akses seluruh tools operasional dari semua suite dan modul.</p></div></div><div className="erp-tool-grid">{tools.map((context) => <ToolCard key={context.tool.id} context={context} />)}</div></div>
  );

  const renderSuiteDetail = () => {
    if (!selectedSuite) return renderSuitesDirectory();
    return (
      <div className="erp-page">
        <button type="button" className="erp-back-link" onClick={() => handleNavigate('suites')}><ArrowLeft size={16} /> Semua Suites</button>
        <section className="erp-detail-head" style={getSuiteStyle(selectedSuite.id)}>
          <span className="erp-suite-icon erp-detail-icon">{getIconComponent(iconMap[selectedSuite.id] || 'Dashboard', 28)}</span>
          <div><span className="erp-eyebrow">Suite</span><h1>{selectedSuite.name}</h1><p>{selectedSuite.description}</p></div>
        </section>
        <div className="erp-module-grid">
          {selectedSuite.modules.map((module) => (
            <button type="button" key={module.id} className="erp-module-card" style={getSuiteStyle(selectedSuite.id)} onClick={() => handleModuleSelect(selectedSuite.id, module.id)}>
              <span className="erp-module-card-icon">{getIconComponent(iconMap[module.id] || 'Document', 21)}</span>
              <span className="erp-module-card-copy"><strong>{module.name}</strong><small>{module.description}</small><span>{module.tools.length} tools</span></span>
              <ChevronRight size={17} className="erp-chevron" />
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderModuleDetail = () => {
    if (!selectedModuleContext) return renderModulesDirectory();
    const { suite, module } = selectedModuleContext;
    const moduleTools = module.tools.map((tool) => ({ suite, module, tool }));
    return (
      <div className="erp-page">
        <div className="erp-breadcrumbs"><button type="button" onClick={() => handleSuiteSelect(suite.id)}>{suite.name}</button><ChevronRight size={14} /><span>{module.name}</span></div>
        <section className="erp-detail-head" style={getSuiteStyle(suite.id)}>
          <span className="erp-suite-icon erp-detail-icon">{getIconComponent(iconMap[module.id] || 'Document', 28)}</span>
          <div><span className="erp-eyebrow">Modul</span><h1>{module.name}</h1><p>{module.description}</p></div>
        </section>
        <div className="erp-section-head erp-tools-heading"><div><h2>Tools</h2><p>{module.tools.length} tools tersedia di modul ini.</p></div></div>
        <div className="erp-tool-grid">{moduleTools.map((context) => <ToolCard key={context.tool.id} context={context} />)}</div>
      </div>
    );
  };

  const renderToolWorkspace = () => {
    if (!navigation.selectedTool || !selectedToolContext) return renderToolsDirectory();
    const ToolComponent = navigation.selectedTool.component;
    const { suite, module, tool } = selectedToolContext;

    return (
      <div className="erp-tool-workspace-frame" style={getSuiteStyle(suite.id)} data-tool-id={tool.id}>
        <header className="erp-tool-shellbar">
          <div className="erp-tool-shellbar-main">
            <button type="button" className="erp-tool-shell-back" onClick={handleBackFromTool} aria-label="Kembali ke modul"><ArrowLeft size={18} /></button>
            <span className="erp-tool-shell-icon">{getIconComponent(iconMap[tool.id] || 'Document', 22)}</span>
            <div className="erp-tool-shell-copy">
              <div className="erp-tool-shell-breadcrumbs">
                <button type="button" onClick={() => handleSuiteSelect(suite.id)}>{suite.name}</button><ChevronRight size={12} />
                <button type="button" onClick={() => handleModuleSelect(suite.id, module.id)}>{module.name}</button>
              </div>
              <h1>{tool.name}</h1>
              <p>{tool.description}</p>
            </div>
          </div>
          <div className="erp-tool-shell-actions">
            <span className="erp-tool-shell-module">{module.name}</span>
            <button type="button" className="erp-tool-shell-theme" onClick={() => setDarkMode((value) => !value)} aria-label="Ubah tema">{darkMode ? <Sun size={17} /> : <Moon size={17} />}</button>
          </div>
        </header>

        <div className="erp-tool-body">
          <div className="erp-tool-stage">
            <ToolComponent onBack={handleBackFromTool} darkMode={darkMode} setDarkMode={setDarkMode} />
          </div>
        </div>
      </div>
    );
  };

  const renderMainContent = () => {
    if (navigation.level === 'tool') return renderToolWorkspace();
    if (searchQuery.trim()) return renderSearchResults();
    switch (navigation.level) {
      case 'suites': return renderSuitesDirectory();
      case 'suite': return renderSuiteDetail();
      case 'modules': return renderModulesDirectory();
      case 'module': return renderModuleDetail();
      case 'tools': return renderToolsDirectory();
      default: return renderDashboard();
    }
  };

  return (
    <div className={`erp-shell ${darkMode ? 'is-dark' : ''}`}>
      <Sidebar collapsed={sidebarCollapsed} activeView={activeDirectoryView} onNavigate={handleNavigate} onToggleCollapse={() => setSidebarCollapsed((value) => !value)} />
      <div className="erp-workspace">
        <header className="erp-topbar">
          <button type="button" className="erp-icon-button erp-mobile-menu" onClick={() => setSidebarCollapsed((value) => !value)} aria-label="Toggle navigation"><Menu size={20} /></button>
          <div className="erp-global-search">
            <Search size={18} />
            <input type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Cari tools, modul, atau fitur..." aria-label="Cari tools, modul, atau fitur" />
            <span className="erp-search-shortcut"><Command size={13} /> K</span>
          </div>
          <div className="erp-topbar-actions">
            <button type="button" className="erp-icon-button" aria-label="Notifikasi" title="Notifikasi"><Bell size={19} /></button>
            <button type="button" className="erp-icon-button" onClick={() => setDarkMode((value) => !value)} aria-label={darkMode ? 'Aktifkan light mode' : 'Aktifkan dark mode'} title={darkMode ? 'Light mode' : 'Dark mode'}>{darkMode ? <Sun size={19} /> : <Moon size={19} />}</button>
            <span className="erp-topbar-divider" />
            <div className="erp-user-menu"><span className="erp-avatar">PA</span><span className="erp-user-copy"><strong>Administrator</strong><small>PERADA Tools</small></span></div>
          </div>
        </header>
        <main className={`erp-main-content ${navigation.level === 'tool' ? 'erp-main-content-tool' : ''}`}>{renderMainContent()}</main>
      </div>
    </div>
  );
}
