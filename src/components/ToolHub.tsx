import { useState, useMemo } from 'react';
import { hierarchicalStructure, getRelatedTools, getTotalToolsCount, getSuiteById, getModuleById, type Suite, type Module, type Tool } from './newHierarchicalStructure';
import Dashboard from './Dashboard';

type ViewLevel = 'dashboard' | 'suite' | 'module' | 'tool';

interface NavigationState {
  level: ViewLevel;
  selectedSuite?: Suite;
  selectedModule?: Module;
  selectedTool?: Tool;
}

export default function ToolHub() {
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [navigation, setNavigation] = useState<NavigationState>({ level: 'dashboard' });
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // PERADA Brand Colors
  const peradaRed = '#E31B23';
  const peradaBlue = '#0072CE';

  const bg = darkMode ? 'bg-[#0f1419]' : 'bg-[#F8FAFC]';
  const sidebarBg = darkMode ? 'bg-[#161b22]' : 'bg-white';
  const borderColor = darkMode ? 'border-[#21262d]' : 'border-[#E2E8F0]';
  const textPrimary = darkMode ? 'text-[#e6edf3]' : 'text-[#0F172A]';
  const textSecondary = darkMode ? 'text-[#8b949e]' : 'text-[#64748B]';
  const hoverBg = darkMode ? 'hover:bg-[#21262d]' : 'hover:bg-[#F1F5F9]';

  const totalTools = getTotalToolsCount();

  // Search across all tools
  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    return hierarchicalStructure
      .flatMap(suite => suite.modules)
      .flatMap(module => module.tools)
      .filter(tool =>
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [searchQuery]);

  const handleSuiteSelect = (suiteId: string) => {
    const suite = getSuiteById(suiteId);
    if (suite) {
      setNavigation({ level: 'suite', selectedSuite: suite });
      setSearchQuery('');
    }
  };

  const handleModuleSelect = (moduleId: string) => {
    const module = getModuleById(moduleId);
    if (module) {
      setNavigation({ ...navigation, level: 'module', selectedModule: module });
      setSearchQuery('');
    }
  };

  const handleToolSelect = (tool: Tool) => {
    setNavigation({ ...navigation, level: 'tool', selectedTool: tool });
  };

  const handleBack = () => {
    if (navigation.level === 'tool') {
      setNavigation({ level: 'module', selectedModule: navigation.selectedModule, selectedSuite: navigation.selectedSuite });
    } else if (navigation.level === 'module') {
      setNavigation({ level: 'suite', selectedSuite: navigation.selectedSuite });
    } else if (navigation.level === 'suite') {
      setNavigation({ level: 'dashboard' });
    }
    setSearchQuery('');
  };

  // If a tool is selected, render it
  if (navigation.level === 'tool' && navigation.selectedTool) {
    const ToolComponent = navigation.selectedTool.component;
    return (
      <div className={darkMode ? 'dark' : ''}>
        <div className={`min-h-screen ${bg} ${textPrimary}`}>
          <ToolComponent onBack={handleBack} darkMode={darkMode} setDarkMode={setDarkMode} />
        </div>
      </div>
    );
  }

  // If dashboard, render Dashboard
  if (navigation.level === 'dashboard') {
    return (
      <div className={darkMode ? 'dark' : ''}>
        <Dashboard onSuiteSelect={handleSuiteSelect} darkMode={darkMode} />
      </div>
    );
  }

  // Otherwise render Suite or Module view with sidebar
  return (
    <div className={`min-h-screen ${bg} ${textPrimary}`}>
      {/* Top Header with Breadcrumb */}
      <header className={`sticky top-0 z-40 border-b backdrop-blur-xl ${darkMode ? 'border-[#21262d] bg-[#161b22]/80' : 'border-[#e2e5e9] bg-white/80'}`}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${hoverBg}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E31B23] to-[#0072CE] flex items-center justify-center shadow-lg">
                <span className="text-white text-sm font-bold">PA</span>
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-[#0F172A] dark:text-[#e6edf3]">PERADA Tools</h1>
                <p className={`text-xs ${textSecondary}`}>Enterprise Resource Planning Suite</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setNavigation({ level: 'dashboard' })}
                className={`px-4 py-2 rounded-lg transition-all ${hoverBg}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${hoverBg}`}
              >
                {darkMode ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => setNavigation({ level: 'dashboard' })}
              className={`${textSecondary} hover:text-[#0072CE] transition-colors`}
            >
              Home
            </button>
            {navigation.selectedSuite && (
              <>
                <span className={textSecondary}>›</span>
                <button
                  onClick={() => setNavigation({ level: 'suite', selectedSuite: navigation.selectedSuite })}
                  className={`${textSecondary} hover:text-[#0072CE] transition-colors`}
                >
                  {navigation.selectedSuite.name}
                </button>
              </>
            )}
            {navigation.selectedModule && (
              <>
                <span className={textSecondary}>›</span>
                <span className="font-medium text-[#0F172A] dark:text-[#e6edf3]">{navigation.selectedModule.name}</span>
              </>
            )}
          </div>

          {/* Global Search */}
          <div className="mt-3 relative">
            <svg className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${textSecondary}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Cari tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-12 pr-4 py-3 rounded-xl border ${
                darkMode ? 'bg-[#161b22] border-[#30363d] text-[#e6edf3]' : 'bg-white border-[#E2E8F0] text-[#0F172A]'
              } focus:outline-none focus:ring-2 focus:ring-[#0072CE]/30`}
            />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Collapsible Sidebar */}
        {sidebarOpen && navigation.selectedSuite && (
          <aside className={`w-80 border-r ${sidebarBg} ${borderColor} min-h-[calc(100vh-180px)]`}>
            <div className="p-4">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">{navigation.selectedSuite.icon}</span>
                {navigation.selectedSuite.name}
              </h3>
              <p className={`text-xs ${textSecondary} mb-4`}>{navigation.selectedSuite.description}</p>
              
              <div className="space-y-2">
                {navigation.selectedSuite.modules.map((module) => (
                  <div key={module.id} className="mb-4">
                    <button
                      onClick={() => handleModuleSelect(module.id)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        navigation.selectedModule?.id === module.id
                          ? 'bg-[#0072CE] text-white'
                          : hoverBg
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{module.icon}</span>
                        <div>
                          <div className="font-semibold text-sm">{module.name}</div>
                          <div className={`text-xs ${navigation.selectedModule?.id === module.id ? 'text-white/80' : textSecondary}`}>
                            {module.tools.length} tools
                          </div>
                        </div>
                      </div>
                    </button>
                    
                    {navigation.selectedModule?.id === module.id && (
                      <div className="mt-2 ml-4 space-y-1">
                        {module.tools.map((tool) => (
                          <button
                            key={tool.id}
                            onClick={() => handleToolSelect(tool)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${hoverBg}`}
                          >
                            <div className="flex items-center gap-2">
                              <span>{tool.icon}</span>
                              <span>{tool.name}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Search Results */}
          {searchQuery && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Hasil Pencarian: "{searchQuery}"</h2>
              {searchResults.length === 0 ? (
                <div className="text-center py-12">
                  <p className={textSecondary}>Tidak ada tools yang ditemukan</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchResults.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => handleToolSelect(tool)}
                      className={`text-left p-4 rounded-xl border transition-all hover:shadow-lg ${
                        darkMode ? 'bg-[#161b22] border-[#30363d] hover:border-[#0072CE]/50' : 'bg-white border-[#E2E8F0] hover:border-[#0072CE]/50 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`${tool.color} w-12 h-12 rounded-xl flex items-center justify-center text-white text-2xl shrink-0`}>
                          {tool.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{tool.name}</h3>
                          <p className={`text-sm ${textSecondary}`}>{tool.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Suite View */}
          {!searchQuery && navigation.level === 'suite' && navigation.selectedSuite && (
            <div>
              <div className="mb-6">
                <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                  <span className="text-4xl">{navigation.selectedSuite.icon}</span>
                  {navigation.selectedSuite.name}
                </h2>
                <p className={`text-lg ${textSecondary}`}>{navigation.selectedSuite.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {navigation.selectedSuite.modules.map((module) => (
                  <button
                    key={module.id}
                    onClick={() => handleModuleSelect(module.id)}
                    className={`text-left p-6 rounded-2xl border transition-all hover:shadow-xl ${
                      darkMode ? 'bg-[#161b22] border-[#30363d] hover:border-[#0072CE]/50' : 'bg-white border-[#E2E8F0] hover:border-[#0072CE]/50 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`${module.color} w-16 h-16 rounded-2xl flex items-center justify-center text-white text-3xl`}>
                        {module.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">{module.name}</h3>
                        <p className={`text-sm ${textSecondary}`}>{module.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-[#21262d] dark:border-[#30363d]">
                      <span className={`text-sm ${textSecondary}`}>{module.tools.length} tools tersedia</span>
                      <span className="text-sm font-semibold text-[#0072CE]">Buka →</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Module View */}
          {!searchQuery && navigation.level === 'module' && navigation.selectedModule && (
            <div>
              <div className="mb-6">
                <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                  <span className="text-4xl">{navigation.selectedModule.icon}</span>
                  {navigation.selectedModule.name}
                </h2>
                <p className={`text-lg ${textSecondary}`}>{navigation.selectedModule.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {navigation.selectedModule.tools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => handleToolSelect(tool)}
                    className={`text-left p-5 rounded-xl border transition-all hover:shadow-lg ${
                      darkMode ? 'bg-[#161b22] border-[#30363d] hover:border-[#0072CE]/50' : 'bg-white border-[#E2E8F0] hover:border-[#0072CE]/50 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`${tool.color} w-12 h-12 rounded-xl flex items-center justify-center text-white text-2xl shrink-0`}>
                        {tool.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{tool.name}</h3>
                        <p className={`text-sm ${textSecondary}`}>{tool.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
