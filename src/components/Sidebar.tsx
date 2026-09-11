import {
  Boxes,
  Grid,
  HelpCircle,
  Home,
  Layers3,
  Menu,
  Settings,
  Wrench,
} from 'lucide-react';

type DirectoryView = 'dashboard' | 'suites' | 'modules' | 'tools';

interface SidebarProps {
  collapsed?: boolean;
  activeView: DirectoryView;
  onNavigate: (view: DirectoryView) => void;
  onToggleCollapse?: () => void;
}

const navItems: Array<{
  id: DirectoryView;
  label: string;
  icon: typeof Home;
}> = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'suites', label: 'Semua Suites', icon: Grid },
  { id: 'modules', label: 'Modul', icon: Layers3 },
  { id: 'tools', label: 'Tools', icon: Wrench },
];

export function Sidebar({
  collapsed = false,
  activeView,
  onNavigate,
  onToggleCollapse,
}: SidebarProps) {
  return (
    <aside className={`erp-sidebar ${collapsed ? 'is-collapsed' : ''}`}>
      <div className="erp-sidebar-brand">
        <button
          type="button"
          className="erp-icon-button erp-sidebar-toggle"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Buka sidebar' : 'Tutup sidebar'}
          title={collapsed ? 'Buka sidebar' : 'Tutup sidebar'}
        >
          <Menu size={20} />
        </button>

        <button
          type="button"
          className="erp-brand-lockup"
          onClick={() => onNavigate('dashboard')}
          aria-label="PERADA Tools Dashboard"
        >
          <span className="erp-brand-mark">PA</span>
          <span className="erp-brand-copy">
            <strong>PERADA Tools</strong>
            <small>Enterprise Resource Planning Suite</small>
          </span>
        </button>
      </div>

      <nav className="erp-sidebar-nav" aria-label="Navigasi utama">
        <div className="erp-sidebar-section-label">Workspace</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`erp-nav-item ${active ? 'is-active' : ''}`}
              onClick={() => onNavigate(item.id)}
              aria-current={active ? 'page' : undefined}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="erp-sidebar-spacer" />

      <div className="erp-sidebar-footer">
        <button type="button" className="erp-nav-item erp-nav-muted" title={collapsed ? 'Pengaturan' : undefined}>
          <Settings size={19} />
          <span>Pengaturan</span>
        </button>
        <button type="button" className="erp-nav-item erp-nav-muted" title={collapsed ? 'Bantuan & Dukungan' : undefined}>
          <HelpCircle size={19} />
          <span>Bantuan & Dukungan</span>
        </button>

        <div className="erp-sidebar-company">
          <span className="erp-company-symbol"><Boxes size={17} /></span>
          <span className="erp-company-copy">
            <strong>PERADA</strong>
            <small>People. Process. Possibility.</small>
          </span>
        </div>
      </div>
    </aside>
  );
}
