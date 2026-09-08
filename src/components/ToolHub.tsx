import { useState } from 'react';
import NotaToPdf from './NotaToPdf';
import BatchRenamer from './BatchRenamer';
import PdfSplitter from './PdfSplitter';
import LabelGenerator from './LabelGenerator';

type Tool = 'hub' | 'nota-to-pdf' | 'batch-renamer' | 'pdf-splitter' | 'label-generator';

interface ToolInfo {
  id: Tool;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const tools: ToolInfo[] = [
  {
    id: 'nota-to-pdf',
    name: 'Nota ke PDF',
    description: 'Gabungkan banyak gambar nota ke dalam PDF multi-halaman dengan layout grid',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    color: 'bg-blue-500',
  },
  {
    id: 'batch-renamer',
    name: 'Batch Renamer',
    description: 'Ganti nama ratusan file sekaligus dengan pola otomatis',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    color: 'bg-emerald-500',
  },
  {
    id: 'pdf-splitter',
    name: 'PDF Splitter',
    description: 'Pecah PDF besar menjadi beberapa file kecil atau extract halaman tertentu',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
    color: 'bg-purple-500',
  },
  {
    id: 'label-generator',
    name: 'Label Generator',
    description: 'Generate label pengiriman, barcode, dan QR code untuk paket',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
    color: 'bg-orange-500',
  },
];

export default function ToolHub() {
  const [activeTool, setActiveTool] = useState<Tool>('hub');
  const [darkMode, setDarkMode] = useState(true);

  if (activeTool === 'nota-to-pdf') {
    return <NotaToPdf onBack={() => setActiveTool('hub')} darkMode={darkMode} setDarkMode={setDarkMode} />;
  }
  if (activeTool === 'batch-renamer') {
    return <BatchRenamer onBack={() => setActiveTool('hub')} darkMode={darkMode} setDarkMode={setDarkMode} />;
  }
  if (activeTool === 'pdf-splitter') {
    return <PdfSplitter onBack={() => setActiveTool('hub')} darkMode={darkMode} setDarkMode={setDarkMode} />;
  }
  if (activeTool === 'label-generator') {
    return <LabelGenerator onBack={() => setActiveTool('hub')} darkMode={darkMode} setDarkMode={setDarkMode} />;
  }

  const bg = darkMode ? 'bg-[#0f1419]' : 'bg-[#f8f9fb]';
  const textPrimary = darkMode ? 'text-[#e6edf3]' : 'text-[#1a1a2e]';
  const textSecondary = darkMode ? 'text-[#8b949e]' : 'text-[#57606a]';

  return (
    <div className={`min-h-screen ${bg} ${textPrimary}`}>
      {/* Header */}
      <header className={`border-b ${darkMode ? 'border-[#21262d] bg-[#161b22]' : 'border-[#e2e5e9] bg-white'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0A2540] flex items-center justify-center">
              <span className="text-white text-sm font-bold">PA</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">PERADA Tools</h1>
              <p className={`text-xs ${textSecondary}`}>Productivity Suite</p>
            </div>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
              darkMode ? 'hover:bg-[#21262d]' : 'hover:bg-[#f0f1f3]'
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
      </header>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Pilih Tool Produktivitas</h2>
          <p className={`text-base ${textSecondary} max-w-2xl mx-auto`}>
            Suite tools internal PERADA GROUP untuk mempercepat operasional logistik dan administrasi dokumen
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`group text-left p-6 rounded-2xl border transition-all hover:scale-[1.02] hover:shadow-xl ${
                darkMode
                  ? 'bg-[#161b22] border-[#30363d] hover:border-[#484f58]'
                  : 'bg-white border-[#e2e5e9] hover:border-[#0A2540]/30'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`${tool.color} w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform`}>
                  {tool.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{tool.name}</h3>
                  <p className={`text-sm ${textSecondary} leading-relaxed`}>{tool.description}</p>
                </div>
                <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>

        {/* Footer Info */}
        <div className={`mt-16 text-center ${textSecondary}`}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-5 h-5 rounded bg-[#0A2540] flex items-center justify-center">
              <span className="text-white text-[7px] font-bold">PA</span>
            </div>
            <span className="text-sm font-medium text-[#0A2540] dark:text-[#58a6ff]">PT Perdana Adi Yuda</span>
            <span>— PERADA GROUP</span>
          </div>
          <p className="text-xs">© 2026 • Internal Productivity Tools</p>
        </div>
      </div>
    </div>
  );
}
