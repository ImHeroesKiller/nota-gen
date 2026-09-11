import ToolHub from './components/ToolHub';
import ErrorBoundary from './components/ErrorBoundary';
import DocumentTemplateSettingsModal from './components/DocumentTemplateSettingsModal';

export default function App() {
  return (
    <ErrorBoundary>
      <ToolHub />
      <DocumentTemplateSettingsModal />
    </ErrorBoundary>
  );
}
