import { useState, useMemo } from 'react';
import { hierarchicalStructure, getToolById, type Tool } from './newHierarchicalStructure';
import { Sidebar } from './Sidebar';
import { Icons } from './IconLibrary';

type ViewLevel = 'dashboard' | 'suite' | 'module' | 'tool';

interface NavigationState {
  level: ViewLevel;
  selectedSuiteId?: string;
  selectedModuleId?: string;
  selectedTool?: Tool;
}

export default function ToolHub() {
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [navigation, setNavigation] = useState<NavigationState>({ level: 'dashboard' });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const bg = darkMode ? 'bg-[#0f1419]' : 'bg-[#F8FAFC]';
  const textPrimary = darkMode ? 'text-[#e6edf3]' : 'text-[#0F172A]';
  const textSecondary = darkMode ? 'text-[#8b949e]' : 'text-[#64748B]';

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

  const handleToolSelect = (toolId: string) => {
    const tool = getToolById(toolId);
    if (tool) {
      setNavigation({ level: 'tool', selectedTool: tool });
    }
  };

  const handleDashboardClick = () => {
    setNavigation({ level: 'dashboard' });
    setSearchQuery('');
  };

  const handleBack = () => {
    if (navigation.level === 'tool') {
      setNavigation({ level: 'dashboard' });
    }
    setSearchQuery('');
  };

  const renderMainContent = () => {
    if (navigation.level === 'tool' && navigation.selectedTool) {
      const ToolComponent = navigation.selectedTool.component;
      return <ToolComponent onBack={handleBack} darkMode={darkMode} setDarkMode={setDarkMode} />;
    }

    if (searchQuery) {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">
            Hasil Pencarian: {searchResults.length} tools ditemukan
          </h2>
          {searchResults.length === 0 ? (
            <div className="text-center py-12">
              <p className={textSecondary}>Tidak ada tools yang ditemukan</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => handleToolSelect(tool.id)}
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
      );
    }

    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Semua Suites</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hierarchicalStructure.map((suite) => (
            <div
              key={suite.id}
              className={`p-6 rounded-xl border transition-all hover:shadow-lg ${
                darkMode ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-[#E2E8F0] shadow-sm'
              }`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`${suite.color} w-16 h-16 rounded-2xl flex items-center justify-center text-white text-3xl`}>
                  {suite.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{suite.name}</h3>
                  <p className={`text-sm ${textSecondary}`}>{suite.description}</p>
                </div>
              </div>
              <div className="space-y-2">
                {suite.modules.map((module) => (
                  <div key={module.id} className="text-sm">
                    <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">{module.name}</div>
                    <div className={`text-xs ${textSecondary} ml-2`}>
                      {module.tools.length} tools
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`flex h-screen ${bg} ${textPrimary}`}>
      {/* Sidebar - Always visible */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToolSelect={handleToolSelect}
        onDashboardClick={handleDashboardClick}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeTool={navigation.selectedTool?.id}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className={`sticky top-0 z-40 border-b backdrop-blur-xl ${darkMode ? 'border-[#21262d] bg-[#161b22]/80' : 'border-[#e2e5e9] bg-white/80'}`}>
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                    darkMode ? 'hover:bg-[#21262d]' : 'hover:bg-[#F1F5F9]'
                  }`}
                >
                  <Icons.Menu size={24} />
                </button>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E31B23] to-[#0072CE] flex items-center justify-center shadow-lg">
                  <span className="text-white text-sm font-bold">PA</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold tracking-tight">PERADA Tools</h1>
                  <p className={`text-xs ${textSecondary}`}>Enterprise Resource Planning Suite</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDashboardClick}
                  className={`p-2 rounded-lg transition-all ${
                    darkMode ? 'hover:bg-[#21262d]' : 'hover:bg-[#F1F5F9]'
                  }`}
                  title="Dashboard"
                >
                  <Icons.Dashboard size={24} className="text-blue-600" />
                </button>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                    darkMode ? 'hover:bg-[#21262d]' : 'hover:bg-[#F1F5F9]'
                  }`}
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

            {/* Global Search */}
            <div className="relative">
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

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
}
