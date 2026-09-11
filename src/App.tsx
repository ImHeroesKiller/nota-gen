import { Routes, Route, Navigate } from 'react-router-dom';
import ToolHub from './components/ToolHub';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ToolHub />} />
      <Route path="/browse" element={<ToolHub />} />
      <Route path="/:suitePrefix/:toolSlug" element={<ToolHub />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
