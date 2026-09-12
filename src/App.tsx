import { useLayoutEffect } from 'react';
import ToolHub from './components/ToolHub';
import ErrorBoundary from './components/ErrorBoundary';
import DocumentTemplateSettingsModal from './components/DocumentTemplateSettingsModal';

const THEME_STORAGE_KEY = 'perada.theme';

function ThemeBootstrap() {
  useLayoutEffect(() => {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    const shouldStartDark = savedTheme !== 'light';

    if (shouldStartDark) {
      const darkToggle = document.querySelector<HTMLButtonElement>('button[aria-label="Aktifkan dark mode"]');
      darkToggle?.click();
    }

    const persistTheme = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const toggle = target?.closest<HTMLButtonElement>('button[aria-label="Aktifkan dark mode"], button[aria-label="Aktifkan light mode"]');
      if (!toggle) return;

      window.requestAnimationFrame(() => {
        window.localStorage.setItem(
          THEME_STORAGE_KEY,
          document.documentElement.classList.contains('dark') ? 'dark' : 'light',
        );
      });
    };

    document.addEventListener('click', persistTheme);
    return () => document.removeEventListener('click', persistTheme);
  }, []);

  return null;
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToolHub />
      <ThemeBootstrap />
      <DocumentTemplateSettingsModal />
    </ErrorBoundary>
  );
}
