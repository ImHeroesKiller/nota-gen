import {
  hierarchicalStructure,
  getToolById,
  type Suite,
  type Module,
  type Tool,
} from './components/newHierarchicalStructure';

/** Suite id → URL prefix (R1: human-capital → hr, locked /hr/recruitment). */
export const SUITE_PREFIX: Record<string, string> = {
  'human-capital': 'hr',
  'logistics-fleet': 'logistics',
  'customs-trade': 'customs',
  'finance-legal': 'finance',
  'field-operations': 'field',
  'document-management': 'docs',
  'outsourcing-documents': 'outsourcing',
};

/** Explicit path overrides (toolId → full path). Locked R1: recruitment-pipeline → /hr/recruitment */
export const TOOL_PATH_OVERRIDES: Record<string, string> = {
  'recruitment-pipeline': '/hr/recruitment',
};

export interface ToolRouteContext {
  suite: Suite;
  module: Module;
  tool: Tool;
  path: string;
}

function toolSlug(toolId: string): string {
  return toolId;
}

export function getPathForTool(toolId: string): string | undefined {
  if (TOOL_PATH_OVERRIDES[toolId]) return TOOL_PATH_OVERRIDES[toolId];
  for (const suite of hierarchicalStructure) {
    for (const module of suite.modules) {
      const tool = module.tools.find((t) => t.id === toolId);
      if (tool) {
        const prefix = SUITE_PREFIX[suite.id] ?? suite.id;
        return `/${prefix}/${toolSlug(tool.id)}`;
      }
    }
  }
  return undefined;
}

export function findToolContextById(toolId: string): ToolRouteContext | undefined {
  const path = getPathForTool(toolId);
  if (!path) return undefined;
  for (const suite of hierarchicalStructure) {
    for (const module of suite.modules) {
      const tool = module.tools.find((t) => t.id === toolId);
      if (tool) return { suite, module, tool, path };
    }
  }
  return undefined;
}

/** Resolve `/suitePrefix/toolSlug` (and overrides) to tool context. */
export function findToolContextByPath(pathname: string): ToolRouteContext | undefined {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  for (const [toolId, overridePath] of Object.entries(TOOL_PATH_OVERRIDES)) {
    if (overridePath === normalized) {
      return findToolContextById(toolId);
    }
  }
  const parts = normalized.split('/').filter(Boolean);
  if (parts.length !== 2) return undefined;
  const [prefix, slug] = parts;
  const suite = hierarchicalStructure.find((s) => (SUITE_PREFIX[s.id] ?? s.id) === prefix);
  if (!suite) return undefined;
  for (const module of suite.modules) {
    const tool = module.tools.find((t) => toolSlug(t.id) === slug);
    if (tool) {
      return { suite, module, tool, path: `/${prefix}/${slug}` };
    }
  }
  return undefined;
}

export function getToolByPath(pathname: string): Tool | undefined {
  return findToolContextByPath(pathname)?.tool ?? getToolById(
    Object.entries(TOOL_PATH_OVERRIDES).find(([, p]) => p === pathname.replace(/\/+$/, ''))?.[0] ?? ''
  );
}

/** All tool paths for docs / debugging. */
export function getAllToolPaths(): Array<{ toolId: string; path: string; name: string }> {
  return hierarchicalStructure.flatMap((suite) =>
    suite.modules.flatMap((module) =>
      module.tools.map((tool) => ({
        toolId: tool.id,
        path: getPathForTool(tool.id)!,
        name: tool.name,
      }))
    )
  );
}
