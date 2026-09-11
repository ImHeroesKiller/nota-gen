import ToolHub from './components/ToolHub';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <ToolHub />
    </ErrorBoundary>
  );
}
