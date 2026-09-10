import { useState } from 'react';
import { hierarchicalStructure, getTotalToolsCount, type Suite } from './newHierarchicalStructure';

interface DashboardProps {
  onSuiteSelect: (suiteId: string) => void;
  darkMode: boolean;
}

export default function Dashboard({ onSuiteSelect, darkMode }: DashboardProps) {
  const [hoveredSuite, setHoveredSuite] = useState<string | null>(null);

  const totalTools = getTotalToolsCount();
  const totalModules = hierarchicalStructure.reduce((sum, suite) => sum + suite.modules.length, 0);

  const bg = darkMode ? 'bg-[#0f1419]' : 'bg-[#f8f9fb]';
  const textPrimary = darkMode ? 'text-[#e6edf3]' : 'text-[#1a1a2e]';
  const textSecondary = darkMode ? 'text-[#8b949e]' : 'text-[#57606a]';
  const cardBg = darkMode ? 'bg-[#161b22]' : 'bg-white';

  return (
    <div className={`min-h-screen ${bg} ${textPrimary}`}>
      {/* Header */}
      <header className={`sticky top-0 z-40 border-b backdrop-blur-xl ${darkMode ? 'border-[#21262d] bg-[#161b22]/80' : 'border-[#e2e5e9] bg-white/80'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0A2540] to-[#1E3A5F] flex items-center justify-center shadow-lg">
                <span className="text-white text-lg font-bold">PA</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">PERADA Tools</h1>
                <p className={`text-sm ${textSecondary}`}>Enterprise Resource Planning Suite</p>
              </div>
            </div>
            <div className={`text-sm ${textSecondary}`}>
              <span className="font-semibold text-[#0A2540] dark:text-[#58a6ff]">{totalTools}</span> Tools • <span className="font-semibold">{totalModules}</span> Modules • <span className="font-semibold">5</span> Suites
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Selamat Datang di PERADA Tools</h2>
          <p className={`text-lg ${textSecondary}`}>
            Sistem ERP modern untuk PT Perdana Adi Yuda - Pilih suite untuk memulai
          </p>
        </div>

        {/* Suite Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {hierarchicalStructure.map((suite) => {
            const moduleCount = suite.modules.length;
            const toolCount = suite.modules.reduce((sum, module) => sum + module.tools.length, 0);
            const isHovered = hoveredSuite === suite.id;

            return (
              <div
                key={suite.id}
                onClick={() => onSuiteSelect(suite.id)}
                onMouseEnter={() => setHoveredSuite(suite.id)}
                onMouseLeave={() => setHoveredSuite(null)}
                className={`cursor-pointer transition-all duration-300 ${
                  isHovered ? 'scale-105 shadow-2xl' : 'shadow-lg'
                }`}
              >
                <div className={`${cardBg} rounded-2xl overflow-hidden h-full`}>
                  {/* Card Header with Gradient */}
                  <div className={`bg-gradient-to-br ${suite.color} p-6`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-5xl">{suite.icon}</div>
                      <div className="text-right text-white">
                        <div className="text-3xl font-bold">{toolCount}</div>
                        <div className="text-sm opacity-90">Tools</div>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{suite.name}</h3>
                    <p className="text-sm text-white/90">{suite.description}</p>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${textSecondary}`}>Modules</span>
                        <span className="text-sm font-semibold">{moduleCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${textSecondary}`}>Total Tools</span>
                        <span className="text-sm font-semibold">{toolCount}</span>
                      </div>
                    </div>

                    {/* Module List Preview */}
                    <div className="mt-4 pt-4 border-t border-[#21262d] dark:border-[#30363d]">
                      <div className={`text-xs ${textSecondary} mb-2`}>Modules:</div>
                      <div className="flex flex-wrap gap-2">
                        {suite.modules.slice(0, 3).map((module) => (
                          <span
                            key={module.id}
                            className={`text-xs px-2 py-1 rounded-lg ${
                              darkMode ? 'bg-[#21262d]' : 'bg-[#f3f4f6]'
                            }`}
                          >
                            {module.icon} {module.name}
                          </span>
                        ))}
                        {suite.modules.length > 3 && (
                          <span className={`text-xs px-2 py-1 rounded-lg ${
                            darkMode ? 'bg-[#21262d]' : 'bg-[#f3f4f6]'
                          }`}>
                            +{suite.modules.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      className={`w-full mt-4 py-2.5 rounded-lg font-semibold transition-all ${
                        isHovered
                          ? 'bg-[#0A2540] text-white'
                          : darkMode ? 'bg-[#21262d] text-gray-300' : 'bg-[#f3f4f6] text-gray-700'
                      }`}
                    >
                      Buka Suite →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className={`${cardBg} rounded-2xl p-6 shadow-lg`}>
          <h3 className="text-xl font-bold mb-4">Statistik Sistem</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#0A2540] dark:text-[#58a6ff]">5</div>
              <div className={`text-sm ${textSecondary}`}>Main Suites</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#0A2540] dark:text-[#58a6ff]">{totalModules}</div>
              <div className={`text-sm ${textSecondary}`}>Modules</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#0A2540] dark:text-[#58a6ff]">{totalTools}</div>
              <div className={`text-sm ${textSecondary}`}>Total Tools</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#0A2540] dark:text-[#58a6ff]">100%</div>
              <div className={`text-sm ${textSecondary}`}>Active</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`border-t mt-12 ${darkMode ? 'border-[#21262d]' : 'border-[#e2e5e9]'}`}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#0A2540] flex items-center justify-center">
                <span className="text-white text-xs font-bold">PA</span>
              </div>
              <div>
                <div className="text-sm font-semibold">PT Perdana Adi Yuda</div>
                <div className={`text-xs ${textSecondary}`}>Plaza Summarecon Bekasi Lt. 7</div>
              </div>
            </div>
            <div className={`text-sm ${textSecondary}`}>
              © 2026 PERADA GROUP. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
