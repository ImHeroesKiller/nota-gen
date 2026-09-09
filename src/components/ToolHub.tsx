import { useState, useMemo } from 'react';
import NotaToPdf from './NotaToPdf';
import BatchRenamer from './BatchRenamer';
import PdfSplitter from './PdfSplitter';
import LabelGenerator from './LabelGenerator';
import DocumentRegistry from './DocumentRegistry';
import InvoiceGenerator from './InvoiceGenerator';
import ClientDatabase from './ClientDatabase';
import BarcodeGenerator from './BarcodeGenerator';
import DeliveryOrderGenerator from './DeliveryOrderGenerator';
import PDFProcessor from './PDFProcessor';
import TestTool from './TestTool';

type ToolId = 'nota-to-pdf' | 'batch-renamer' | 'pdf-splitter' | 'label-generator' | 'document-registry' | 'invoice-generator' | 'client-database' | 'barcode-generator' | 'delivery-order-generator' | 'pdf-processor' | 'test-tool';

interface Tool {
  id: ToolId;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  category: string;
  popular?: boolean;
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const categories: Category[] = [
  {
    id: 'pdf-processing',
    name: 'PDF Processing',
    description: 'Tools untuk mengolah dan memanipulasi file PDF',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'document-generation',
    name: 'Document Generation',
    description: 'Generate dokumen bisnis profesional',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'data-management',
    name: 'Data Management',
    description: 'Kelola data dan dokumen dengan efisien',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>
    ),
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'utilities',
    name: 'Utilities',
    description: 'Tools pendukung untuk berbagai kebutuhan',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    color: 'from-orange-500 to-red-500',
  },
];

const tools: Tool[] = [
  // PDF Processing
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
    category: 'pdf-processing',
    popular: true,
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
    color: 'bg-cyan-500',
    category: 'pdf-processing',
  },
  {
    id: 'pdf-processor',
    name: 'PDF Processor',
    description: 'Compress, merge, rotate, delete, extract, dan reorder halaman PDF',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    color: 'bg-indigo-500',
    category: 'pdf-processing',
    popular: true,
  },

  // Document Generation
  {
    id: 'invoice-generator',
    name: 'Invoice Generator',
    description: 'Buat invoice profesional dengan auto-calculate dan export PDF',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    color: 'bg-green-500',
    category: 'document-generation',
    popular: true,
  },
  {
    id: 'delivery-order-generator',
    name: 'Delivery Order Generator',
    description: 'Buat dokumen delivery order profesional untuk pengiriman',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
    color: 'bg-emerald-500',
    category: 'document-generation',
  },
  {
    id: 'label-generator',
    name: 'Label Generator',
    description: 'Generate label pengiriman standar Indonesia dengan barcode dan QR code',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
    color: 'bg-teal-500',
    category: 'document-generation',
  },

  // Data Management
  {
    id: 'document-registry',
    name: 'Document Registry',
    description: 'Register dan kelola nomor dokumen/surat dengan Cloudflare D1',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    color: 'bg-purple-500',
    category: 'data-management',
    popular: true,
  },
  {
    id: 'client-database',
    name: 'Client Database',
    description: 'Kelola database klien dengan fitur search dan export',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    color: 'bg-pink-500',
    category: 'data-management',
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
    color: 'bg-rose-500',
    category: 'data-management',
  },

  // Utilities
  {
    id: 'barcode-generator',
    name: 'Barcode & QR Generator',
    description: 'Generate barcode dan QR code untuk tracking dan labeling',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
      </svg>
    ),
    color: 'bg-orange-500',
    category: 'utilities',
  },
  // Test Tool
  {
    id: 'test-tool',
    name: '🧪 Test Tool',
    description: 'Tool untuk testing routing - klik ini untuk test apakah navigasi bekerja',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'bg-green-500',
    category: 'utilities',
    popular: true,
  },
];

export default function ToolHub() {
  // ALL HOOKS MUST BE AT TOP LEVEL - NO EARLY RETURNS BEFORE THIS
  const [activeTool, setActiveTool] = useState<ToolId | 'hub'>('hub');
  const [darkMode, setDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter tools - MUST be called before any early returns
  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  // Group tools by category - MUST be called before any early returns
  const groupedTools = useMemo(() => {
    const groups: Record<string, Tool[]> = {};
    filteredTools.forEach(tool => {
      if (!groups[tool.category]) {
        groups[tool.category] = [];
      }
      groups[tool.category].push(tool);
    });
    return groups;
  }, [filteredTools]);

  // NOW we can have conditional logic after all hooks
  if (activeTool !== 'hub') {
    const toolProps = {
      onBack: () => setActiveTool('hub'),
      darkMode,
      setDarkMode
    };

    const toolMap: Record<ToolId, React.ComponentType<any>> = {
      'nota-to-pdf': NotaToPdf,
      'batch-renamer': BatchRenamer,
      'pdf-splitter': PdfSplitter,
      'label-generator': LabelGenerator,
      'document-registry': DocumentRegistry,
      'invoice-generator': InvoiceGenerator,
      'client-database': ClientDatabase,
      'barcode-generator': BarcodeGenerator,
      'delivery-order-generator': DeliveryOrderGenerator,
      'pdf-processor': PDFProcessor,
      'test-tool': TestTool,
    };

    const ToolComponent = toolMap[activeTool as ToolId];
    if (ToolComponent) {
      return <ToolComponent {...toolProps} />;
    }
    return <div className="p-8 text-center text-red-500">Tool not found: {activeTool}</div>;
  }

  // Theme variables - after all hooks and conditional returns
  const bg = darkMode ? 'bg-[#0f1419]' : 'bg-[#f8f9fb]';
  const sidebarBg = darkMode ? 'bg-[#161b22]' : 'bg-white';
  const borderColor = darkMode ? 'border-[#21262d]' : 'border-[#e2e5e9]';
  const cardBg = darkMode ? 'bg-[#1c2128]' : 'bg-[#f3f4f6]';
  const textPrimary = darkMode ? 'text-[#e6edf3]' : 'text-[#1a1a2e]';
  const textSecondary = darkMode ? 'text-[#8b949e]' : 'text-[#57606a]';
  const hoverBg = darkMode ? 'hover:bg-[#21262d]' : 'hover:bg-[#f0f1f3]';

  // Helper function to safely render tool icon
  const renderToolIcon = (tool: Tool) => {
    return (
      <div className={`${tool.color} w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform shadow-lg`}>
        {tool.icon}
      </div>
    );
  };

  // Helper function to safely render category icon
  const renderCategoryIcon = (category: Category) => {
    return (
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center text-white shadow-lg`}>
        {category.icon}
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${bg} ${textPrimary}`}>
      {/* Header */}
      <header className={`sticky top-0 z-40 border-b backdrop-blur-xl ${darkMode ? 'border-[#21262d] bg-[#161b22]/80' : 'border-[#e2e5e9] bg-white/80'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0A2540] to-[#1E3A5F] flex items-center justify-center shadow-lg">
                <span className="text-white text-sm font-bold">PA</span>
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">PERADA Tools</h1>
                <p className={`text-xs ${textSecondary}`}>Productivity Suite</p>
              </div>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${hoverBg}`}
              aria-label="Toggle theme"
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
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[#0A2540] to-[#58a6ff] bg-clip-text text-transparent">
            PERADA Productivity Suite
          </h2>
          <p className={`text-lg ${textSecondary} max-w-2xl mx-auto`}>
            10 tools profesional untuk mempercepat operasional logistik dan administrasi dokumen
          </p>
        </div>

        {/* Search & Filter */}
        <div className="max-w-3xl mx-auto mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <svg className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${textSecondary}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Cari tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-12 pr-4 py-3 rounded-xl border ${
                darkMode ? 'bg-[#161b22] border-[#30363d] text-[#e6edf3]' : 'bg-white border-[#e2e5e9] text-[#1a1a2e]'
              } focus:outline-none focus:ring-2 focus:ring-[#0A2540]/30`}
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-[#0A2540] text-white shadow-lg'
                  : `${cardBg} ${textSecondary} ${hoverBg}`
              }`}
            >
              Semua ({tools.length})
            </button>
            {categories.map(cat => {
              const count = tools.filter(t => t.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    selectedCategory === cat.id
                      ? 'bg-[#0A2540] text-white shadow-lg'
                      : `${cardBg} ${textSecondary} ${hoverBg}`
                  }`}
                >
                  {cat.icon}
                  <span>{cat.name}</span>
                  <span className="text-xs opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tools by Category */}
        {Object.keys(groupedTools).length === 0 ? (
          <div className="text-center py-12">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${cardBg} flex items-center justify-center`}>
              <svg className={`w-8 h-8 ${textSecondary}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className={`text-sm ${textSecondary}`}>Tidak ada tools yang ditemukan</p>
          </div>
        ) : (
          <div className="space-y-12">
            {categories.map(category => {
              const categoryTools = groupedTools[category.id];
              if (!categoryTools || categoryTools.length === 0) {
                return null;
              }

              return (
                <div key={category.id}>
                  {/* Category Header */}
                  <div className="flex items-center gap-3 mb-6">
                    {renderCategoryIcon(category)}
                    <div>
                      <h3 className="text-xl font-bold">{category.name}</h3>
                      <p className={`text-sm ${textSecondary}`}>{category.description}</p>
                    </div>
                  </div>

                  {/* Tools Grid */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryTools.map(tool => (
                      <button
                        key={tool.id}
                        onClick={() => {
                          console.log('Card clicked:', tool.id);
                          setActiveTool(tool.id);
                          console.log('State updated to:', tool.id);
                        }}
                        className={`group relative text-left p-5 rounded-xl border transition-all hover:scale-[1.02] hover:shadow-xl ${
                          darkMode
                            ? 'bg-[#161b22] border-[#30363d] hover:border-[#484f58]'
                            : 'bg-white border-[#e2e5e9] hover:border-[#0A2540]/30'
                        }`}
                      >
                        {tool.popular && (
                          <div className="absolute top-3 right-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                              POPULER
                            </span>
                          </div>
                        )}
                        <div className="flex items-start gap-4">
                          {renderToolIcon(tool)}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-base mb-1 truncate">{tool.name}</h4>
                            <p className={`text-sm ${textSecondary} leading-relaxed line-clamp-2`}>{tool.description}</p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <span className={`text-xs ${textSecondary}`}>Klik untuk membuka</span>
                          <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <footer className={`mt-16 pt-8 border-t ${borderColor}`}>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-[#0A2540] to-[#1E3A5F] flex items-center justify-center">
                <span className="text-white text-[8px] font-bold">PA</span>
              </div>
              <span className="text-sm font-semibold text-[#0A2540] dark:text-[#58a6ff]">PT Perdana Adi Yuda</span>
              <span className={`text-sm ${textSecondary}`}>— PERADA GROUP</span>
            </div>
            <p className={`text-xs ${textSecondary}`}>© 2026 • Internal Productivity Tools • All Rights Reserved</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
