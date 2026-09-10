import React, { useState } from 'react';
import { Icons } from './IconLibrary';
import { hierarchicalStructure } from './newHierarchicalStructure';

interface SidebarProps {
  onToolSelect: (toolId: string) => void;
  onDashboardClick: () => void;
  onToggleCollapse?: () => void;
  activeTool?: string;
  collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  onToolSelect, 
  onDashboardClick, 
  onToggleCollapse,
  activeTool,
  collapsed = false 
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
    // If icon is an emoji, render it directly
    if (icon && icon.length <= 2) {
      return <span className="text-xl">{icon}</span>;
    }
    
    // Otherwise, try to map to premium icon
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
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center gap-2">
        <button
          onClick={onToggleCollapse}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Collapse Sidebar"
        >
          <Icons.Menu size={24} className="text-gray-600" />
        </button>
        <button
          onClick={onDashboardClick}
          className="flex-1 flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Icons.Dashboard size={24} className="text-blue-600" />
          <span className="font-semibold text-gray-800">Dashboard</span>
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-2">
        {hierarchicalStructure.map((suite) => {
          const isSuiteExpanded = expandedSuites.has(suite.id);
          
          return (
            <div key={suite.id} className="mb-1">
              {/* Suite Header */}
              <button
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

              {/* Modules */}
              {isSuiteExpanded && (
                <div className="ml-4">
                  {suite.modules.map((module) => {
                    const isModuleExpanded = expandedModules.has(module.id);
                    
                    return (
                      <div key={module.id} className="mb-1">
                        {/* Module Header */}
                        <button
                          onClick={() => toggleModule(module.id)}
                          className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 transition-colors rounded-lg ${
                            isModuleExpanded ? 'bg-gray-50' : ''
                          }`}
                        >
                          <div className={`transition-transform ${isModuleExpanded ? 'rotate-180' : ''}`}>
                            <Icons.ChevronRight size={14} className="text-gray-400" />
                          </div>
                          <span className="flex-1 text-left text-gray-700 text-sm font-medium">
                            {module.name}
                          </span>
                        </button>

                        {/* Tools */}
                        {isModuleExpanded && (
                          <div className="ml-6 mt-1">
                            {module.tools.map((tool) => (
                              <button
                                key={tool.id}
                                onClick={() => onToolSelect(tool.id)}
                                className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-50 transition-colors rounded-lg mb-0.5 ${
                                  activeTool === tool.id ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
                                }`}
                              >
                                <div className="text-gray-500 text-xs">●</div>
                                <span className="flex-1 text-left text-sm">
                                  {tool.name}
                                </span>
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
