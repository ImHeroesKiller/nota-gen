import { useState } from 'react';
import { hierarchicalStructure, getRelatedTools, getTotalToolsCount, type Suite, type Module, type Tool } from './hierarchicalStructure';

type ViewLevel = 'suites' | 'modules' | 'tools';

interface NavigationState {
  level: ViewLevel;
  selectedSuite?: Suite;
  selectedModule?: Module;
}

export default function ToolHub() {
  const [darkMode, setDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [navigation, setNavigation] = useState<NavigationState>({ level: 'suites' });
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const bg = darkMode ? 'bg-[#0f1419]' : 'bg-[#f8f9fb]';
  const sidebarBg = darkMode ? 'bg-[#161b22]' : 'bg-white';
  const borderColor = darkMode ? 'border-[#21262d]' : 'border-[#e2e5e9]';
  const cardBg = darkMode ? 'bg-[#1c2128]' : 'bg-[#f3f4f6]';
  const textPrimary = darkMode ? 'text-[#e6edf3]' : 'text-[#1a1a2e]';
  const textSecondary = darkMode ? 'text-[#8b949e]' : 'text-[#57606a]';
  const hoverBg = darkMode ? 'hover:bg-[#21262d]' : 'hover:bg-[#f0f1f3]';

  const totalTools = getTotalToolsCount();

  // Search across all tools
  const searchResults = searchQuery
    ? hierarchicalStructure
        .flatMap(suite => suite.modules)
        .flatMap(module => module.tools)
        .filter(tool =>
          tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
    : [];

  const handleSuiteClick = (suite: Suite) => {
    setNavigation({ level: 'modules', selectedSuite: suite });
    setSearchQuery('');
  };

  const handleModuleClick = (module: Module) => {
    setNavigation({ ...navigation, level: 'tools', selectedModule: module });
    setSearchQuery('');
  };

  const handleToolClick = (tool: Tool) => {
    setActiveTool(tool.id);
  };

  const handleBack = () => {
    if (navigation.level === 'tools') {
      setNavigation({ level: 'modules', selectedSuite: navigation.selectedSuite });
    } else if (navigation.level === 'modules') {
      setNavigation({ level: 'suites' });
    }
    setSearchQuery('');
  };

  const handleBreadcrumbClick = (level: ViewLevel) => {
    if (level === 'suites') {
      setNavigation({ level: 'suites' });
    } else if (level === 'modules') {
      setNavigation({ level: 'modules', selectedSuite: navigation.selectedSuite });
    }
    setSearchQuery('');
  };

  // If a tool is active, render it
  if (activeTool) {
    const tool = hierarchicalStructure
      .flatMap(s => s.modules)
      .flatMap(m => m.tools)
      .find(t => t.id === activeTool);
    
    if (tool) {
      const ToolComponent = tool.component;
      return (
        <div className={darkMode ? 'dark' : ''}>
          <div className={`min-h-screen ${bg} ${textPrimary}`}>
            <ToolComponent onBack={() => setActiveTool(null)} darkMode={darkMode} setDarkMode={setDarkMode} />
          </div>
        </div>
      );
    }
  }

  return (
    <div className={`min-h-screen ${bg} ${textPrimary}`}>
      {/* Header */}
      <header className={`sticky top-0 z-40 border-b backdrop-blur-xl ${darkMode ? 'border-[#21262d] bg-[#161b22]/80' : 'border-[#e2e5e9] bg-white/80'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0A2540] to-[#1E3A5F] flex items-center justify-center shadow-lg">
                <span className="text-white text-sm font-bold">PA</span>
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">PERADA Tools</h1>
                <p className={`text-xs ${textSecondary}`}>{totalTools} Tools • Productivity Suite</p>
              </div>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${hoverBg}`}
              aria-label="Toggle theme"
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

          {/* Search Bar */}
          <div className="relative">
            <svg className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${textSecondary}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input
              type="text"
              placeholder="Cari tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-12 pr-4 py-3 rounded-xl border ${
                darkMode ? 'bg-[#161b22] border-[#30363d] text-[#e6edf3]' : 'bg-white border-[#e2e5e9] text-[#1a1a2e]'
              } focus:outline-none focus:ring-2 focus:ring-[#0A2540]/30`}
            />
          </div>

          {/* Breadcrumb */}
          {navigation.level !== 'suites' && !searchQuery && (
            <div className="flex items-center gap-2 mt-4 text-sm">
              <button
                onClick={() => handleBreadcrumbClick('suites')}
                className={`${textSecondary} hover:text-[#0A2540] dark:hover:text-[#58a6ff] transition-colors`}
              >
                Suites
              </button>
              {navigation.selectedSuite && (
                <>
                  <span className={textSecondary}>→</span>
                  <button
                    onClick={() => handleBreadcrumbClick('modules')}
                    className={`${textSecondary} hover:text-[#0A2540] dark:hover:text-[#58a6ff] transition-colors`}
                  >
                    {navigation.selectedSuite.name}
                  </button>
                </>
              )}
              {navigation.selectedModule && navigation.level === 'tools' && (
                <>
                  <span className={textSecondary}>→</span>
                  <span className="font-medium">{navigation.selectedModule.name}</span>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Results */}
        {searchQuery && (
          <div>
            <h2 className="text-2xl font-bold mb-6">
              Search Results: "{searchQuery}" ({searchResults.length} tools)
            </h2>
            {searchResults.length === 0 ? (
              <div className="text-center py-12">
                <p className={textSecondary}>No tools found</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map(tool => (
                  <button
                    key={tool.id}
                    onClick={() => handleToolClick(tool)}
                    className={`text-left p-5 rounded-xl border transition-all hover:scale-[1.02] hover:shadow-xl ${
                      darkMode
                        ? 'bg-[#161b22] border-[#30363d] hover:border-[#484f58]'
                        : 'bg-white border-[#e2e5e9] hover:border-[#0A2540]/30'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`${tool.color} w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg`}>
                        <span className="text-2xl">{tool.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base mb-1">{tool.name}</h3>
                        <p className={`text-sm ${textSecondary} leading-relaxed`}>{tool.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Suites View */}
        {!searchQuery && navigation.level === 'suites' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Select a Suite</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hierarchicalStructure.map(suite => (
                <button
                  key={suite.id}
                  onClick={() => handleSuiteClick(suite)}
                  className={`text-left p-6 rounded-xl border transition-all hover:scale-[1.02] hover:shadow-xl ${
                    darkMode
                      ? 'bg-[#161b22] border-[#30363d] hover:border-[#484f58]'
                      : 'bg-white border-[#e2e5e9] hover:border-[#0A2540]/30'
                  }`}
                >
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${suite.color} flex items-center justify-center text-white mb-4 shadow-lg`}>
                    <span className="text-3xl">{suite.icon}</span>
                  </div>
                  <h3 className="font-bold text-lg mb-2">{suite.name}</h3>
                  <p className={`text-sm ${textSecondary} mb-3`}>{suite.description}</p>
                  <div className={`text-xs ${textSecondary}`}>
                    {suite.modules.length} Modules • {suite.modules.reduce((sum, m) => sum + m.tools.length, 0)} Tools
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Modules View */}
        {!searchQuery && navigation.level === 'modules' && navigation.selectedSuite && (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={handleBack}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${hoverBg}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h2 className="text-2xl font-bold">{navigation.selectedSuite.name}</h2>
                <p className={`text-sm ${textSecondary}`}>{navigation.selectedSuite.description}</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {navigation.selectedSuite.modules.map(module => (
                <button
                  key={module.id}
                  onClick={() => handleModuleClick(module)}
                  className={`text-left p-6 rounded-xl border transition-all hover:scale-[1.02] hover:shadow-xl ${
                    darkMode
                      ? 'bg-[#161b22] border-[#30363d] hover:border-[#484f58]'
                      : 'bg-white border-[#e2e5e9] hover:border-[#0A2540]/30'
                  }`}
                >
                  <div className={`${module.color} w-14 h-14 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg`}>
                    <span className="text-2xl">{module.icon}</span>
                  </div>
                  <h3 className="font-bold text-lg mb-2">{module.name}</h3>
                  <p className={`text-sm ${textSecondary} mb-3`}>{module.description}</p>
                  <div className={`text-xs ${textSecondary}`}>
                    {module.tools.length} Tools
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tools View */}
        {!searchQuery && navigation.level === 'tools' && navigation.selectedModule && (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={handleBack}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${hoverBg}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h2 className="text-2xl font-bold">{navigation.selectedModule.name}</h2>
                <p className={`text-sm ${textSecondary}`}>{navigation.selectedModule.description}</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {navigation.selectedModule.tools.map(tool => {
                const relatedTools = getRelatedTools(tool.id);
                return (
                  <button
                    key={tool.id}
                    onClick={() => handleToolClick(tool)}
                    className={`text-left p-5 rounded-xl border transition-all hover:scale-[1.02] hover:shadow-xl ${
                      darkMode
                        ? 'bg-[#161b22] border-[#30363d] hover:border-[#484f58]'
                        : 'bg-white border-[#e2e5e9] hover:border-[#0A2540]/30'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`${tool.color} w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg`}>
                        <span className="text-2xl">{tool.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base mb-1">{tool.name}</h3>
                        <p className={`text-sm ${textSecondary} leading-relaxed mb-2`}>{tool.description}</p>
                        {relatedTools.length > 0 && (
                          <div className={`text-xs ${textSecondary}`}>
                            🔗 {relatedTools.length} related tools
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className={`border-t mt-12 ${darkMode ? 'border-[#21262d]' : 'border-[#e2e5e9]'}`}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <p className={`text-center text-sm ${textSecondary}`}>
            © 2026 PT Perdana Adi Yuda. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
