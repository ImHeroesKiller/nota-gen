import { useState } from 'react';
import { Icons } from './IconLibrary';
import { hierarchicalStructure } from './newHierarchicalStructure';

interface SidebarProps {
  onToolSelect: (toolId: string) => void;
  onDashboardClick: () => void;
  onBrowseClick?: () => void;
  onToggleCollapse?: () => void;
  activeTool?: string;
  collapsed?: boolean;
  isHome?: boolean;
  isBrowse?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onToolSelect,
  onDashboardClick,
  onBrowseClick,
  onToggleCollapse,
  activeTool,
  collapsed = false,
  isHome = false,
  isBrowse = false,
}) => {
  const [expandedSuites, setExpandedSuites] = useState<Set<string>>(new Set());
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const toggleSuite = (suiteId: string) => {
    const newExpanded = new Set(expandedSuites);
    if (newExpanded.has(suiteId)) {
      newExpanded.delete(suiteId);
    } else {
      newExpanded.add(suiteId);
    }
    setExpandedSuites(newExpanded);
  };

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const getSuiteIcon = (suiteId: string, icon: string) => {
    if (icon && icon.length <= 2) {
      return <span className="text-xl">{icon}</span>;
    }

    const iconMap: Record<string, React.ComponentType<any>> = {
      'human-capital': Icons.HumanCapital,
      'logistics-fleet': Icons.Logistics,
      'customs-trade': Icons.Customs,
      'finance-legal': Icons.Finance,
      'field-operations': Icons.FieldOps,
      'document-management': Icons.Document,
      'outsourcing-documents': Icons.Outsourcing,
    };
    const IconComponent = iconMap[suiteId] || Icons.Dashboard;
    return <IconComponent size={20} />;
  };

  if (collapsed) {
    return (
      <div className="w-16 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Expand Sidebar"
          >
            <Icons.Menu size={24} className="text-gray-600" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {hierarchicalStructure.map((suite) => (
            <button
              key={suite.id}
              type="button"
              onClick={() => {
                if (onToggleCollapse) onToggleCollapse();
              }}
              className={`w-full flex items-center justify-center p-3 hover:bg-gray-100 transition-colors ${
                expandedSuites.has(suite.id) ? 'bg-gray-100' : ''
              }`}
              title={suite.name}
            >
              <div className="text-gray-600">{getSuiteIcon(suite.id, suite.icon)}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Collapse Sidebar"
          >
            <Icons.Menu size={24} className="text-gray-600" />
          </button>
          <button
            type="button"
            onClick={onDashboardClick}
            className={`flex-1 flex items-center gap-3 p-2 rounded-lg transition-colors ${
              isHome ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100'
            }`}
          >
            <Icons.Dashboard size={24} className="text-blue-600" />
            <span className="font-semibold text-gray-800">Home</span>
          </button>
        </div>
        {onBrowseClick && (
          <button
            type="button"
            onClick={onBrowseClick}
            className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-colors text-left ${
              isBrowse ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <Icons.Document size={20} className="text-gray-600" />
            <span className="font-medium text-sm">Browse suites…</span>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {hierarchicalStructure.map((suite) => {
          const isSuiteExpanded = expandedSuites.has(suite.id);

          return (
            <div key={suite.id} className="mb-1">
              <button
                type="button"
                onClick={() => toggleSuite(suite.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors ${
                  isSuiteExpanded ? 'bg-gray-50' : ''
                }`}
              >
                <div className="text-gray-600">{getSuiteIcon(suite.id, suite.icon)}</div>
                <span className="flex-1 text-left font-semibold text-gray-800 text-sm">
                  {suite.name}
                </span>
                <div className={`transition-transform ${isSuiteExpanded ? 'rotate-180' : ''}`}>
                  <Icons.ChevronDown size={16} className="text-gray-400" />
                </div>
              </button>

              {isSuiteExpanded && (
                <div className="ml-4">
                  {suite.modules.map((module) => {
                    const isModuleExpanded = expandedModules.has(module.id);

                    return (
                      <div key={module.id} className="mb-1">
                        <button
                          type="button"
                          onClick={() => toggleModule(module.id)}
                          className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 transition-colors rounded-lg ${
                            isModuleExpanded ? 'bg-gray-50' : ''
                          }`}
                        >
                          <div
                            className={`transition-transform ${isModuleExpanded ? 'rotate-180' : ''}`}
                          >
                            <Icons.ChevronRight size={14} className="text-gray-400" />
                          </div>
                          <span className="flex-1 text-left text-gray-700 text-sm font-medium">
                            {module.name}
                          </span>
                        </button>

                        {isModuleExpanded && (
                          <div className="ml-6 mt-1">
                            {module.tools.map((tool) => (
                              <button
                                key={tool.id}
                                type="button"
                                onClick={() => onToolSelect(tool.id)}
                                className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-50 transition-colors rounded-lg mb-0.5 ${
                                  activeTool === tool.id
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'text-gray-600'
                                }`}
                              >
                                <div className="text-gray-500 text-xs">●</div>
                                <span className="flex-1 text-left text-sm">{tool.name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
