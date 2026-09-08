import { useState, useCallback, useRef, useEffect } from 'react';
import { ImageFile, LayoutSettings, PaperSize, Orientation, PAPER_DIMENSIONS } from './types';
import { getPagesCount, getImagesForPage, getCellPositions, fitImageToCell, generatePDF, loadImageDimensions } from './utils/pdfGenerator';

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function formatDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [settings, setSettings] = useState<LayoutSettings>({
    columns: 2,
    rows: 3,
    padding: 10,
    paperSize: 'A4',
    orientation: 'portrait',
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [zoom, setZoom] = useState(0.5);
  const [isDragging, setIsDragging] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showAbout, setShowAbout] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const totalPages = getPagesCount(images, settings);

  useEffect(() => {
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(totalPages - 1);
    }
  }, [totalPages, currentPage]);

  useEffect(() => {
    document.documentElement.className = darkMode ? 'dark' : 'light';
  }, [darkMode]);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    setError(null);
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const newImages: ImageFile[] = [];
    const fileArray = Array.from(files).filter(f => validTypes.includes(f.type));

    if (fileArray.length === 0) {
      setError('Tidak ada file gambar yang valid (JPG, PNG, WEBP)');
      return;
    }

    for (const file of fileArray) {
      try {
        const dims = await loadImageDimensions(file);
        newImages.push({
          id: generateId(),
          file,
          name: file.name,
          url: URL.createObjectURL(file),
          width: dims.width,
          height: dims.height,
        });
      } catch {
        // skip invalid
      }
    }

    newImages.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    setImages(prev => [...prev, ...newImages]);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const removeImage = useCallback((id: string) => {
    setImages(prev => {
      const img = prev.find(i => i.id === id);
      if (img) URL.revokeObjectURL(img.url);
      return prev.filter(i => i.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    images.forEach(img => URL.revokeObjectURL(img.url));
    setImages([]);
    setCurrentPage(0);
  }, [images]);

  const handleExport = useCallback(async () => {
    if (images.length === 0) {
      setError('Belum ada gambar untuk diekspor');
      return;
    }
    setIsGenerating(true);
    setProgress({ current: 0, total: images.length });
    setError(null);
    setSuccessMsg(null);

    try {
      const pdfBytes = await generatePDF(images, settings, (current, total) => {
        setProgress({ current, total });
      });
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nota_${formatDate()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSuccessMsg('PDF berhasil di-generate dan diunduh!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setError(`Gagal membuat PDF: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  }, [images, settings]);

  const moveImage = useCallback((fromIndex: number, toIndex: number) => {
    setImages(prev => {
      const arr = [...prev];
      const [item] = arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, item);
      return arr;
    });
  }, []);

  // Theme classes
  const bg = darkMode ? 'bg-[#0f1419]' : 'bg-[#f8f9fb]';
  const sidebarBg = darkMode ? 'bg-[#161b22]' : 'bg-white';
  const borderColor = darkMode ? 'border-[#21262d]' : 'border-[#e2e5e9]';
  const cardBg = darkMode ? 'bg-[#1c2128]' : 'bg-[#f3f4f6]';
  const textPrimary = darkMode ? 'text-[#e6edf3]' : 'text-[#1a1a2e]';
  const textSecondary = darkMode ? 'text-[#8b949e]' : 'text-[#57606a]';
  const inputBg = darkMode ? 'bg-[#0d1117] border-[#30363d]' : 'bg-white border-[#d0d7de]';

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${bg} ${textPrimary}`}>
      {/* Header */}
      <header className={`flex items-center justify-between px-5 py-3 border-b shrink-0 ${sidebarBg} ${borderColor}`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0A2540] flex items-center justify-center">
            <span className="text-white text-xs font-bold">PA</span>
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight leading-tight">Nota ke PDF</h1>
            <p className={`text-[10px] ${textSecondary} leading-tight`}>PERADA Group Internal Tool</p>
          </div>
          {images.length > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0A2540]/10 text-[#0A2540] font-medium dark:bg-[#0A2540]/20 dark:text-[#58a6ff]">
              {images.length} gambar
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAbout(!showAbout)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              darkMode ? 'hover:bg-[#21262d] text-[#8b949e]' : 'hover:bg-[#f0f1f3] text-[#57606a]'
            }`}
          >
            Tentang
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
              darkMode ? 'hover:bg-[#21262d]' : 'hover:bg-[#f0f1f3]'
            }`}
          >
            {darkMode ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            )}
          </button>
        </div>
      </header>

      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm fade-in" onClick={() => setShowAbout(false)}>
          <div className={`w-full max-w-lg rounded-2xl p-6 shadow-2xl ${darkMode ? 'bg-[#161b22] border border-[#30363d]' : 'bg-white border border-[#e2e5e9]'}`} onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0A2540] flex items-center justify-center">
                  <span className="text-white text-sm font-bold">PA</span>
                </div>
                <div>
                  <h2 className="font-semibold text-base">PERADA GROUP</h2>
                  <p className={`text-xs ${textSecondary}`}>PT Perdana Adi Yuda</p>
                </div>
              </div>
              <button onClick={() => setShowAbout(false)} className={`w-7 h-7 rounded-lg flex items-center justify-center ${darkMode ? 'hover:bg-[#21262d]' : 'hover:bg-gray-100'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="space-y-4 text-sm leading-relaxed">
              <p className={textSecondary}>
                <strong className={textPrimary}>PERADA GROUP</strong> menghadirkan kekuatan gabungan antara keahlian logistik dan pengelolaan sumber daya manusia serta operasional bisnis. Satu grup dengan dua spesialisasi kuat, diperkuat UVP digital OMS & ARAH.
              </p>

              <div className={`rounded-xl p-4 ${cardBg}`}>
                <h3 className="font-semibold text-xs uppercase tracking-wider mb-2 text-[#0A2540] dark:text-[#58a6ff]">PT Perkasa Adi Yuda</h3>
                <p className={`text-xs ${textSecondary}`}>Spesialis Jasa Pengurusan Transportasi — Freight Forwarding, Customs Clearance, dan pengiriman domestik & internasional.</p>
              </div>

              <div className={`rounded-xl p-4 ${cardBg}`}>
                <h3 className="font-semibold text-xs uppercase tracking-wider mb-2 text-[#059669]">PT Perdana Adi Yuda</h3>
                <p className={`text-xs ${textSecondary}`}>Business Support & Integrated Solutions — Human Capital, Import & Trading (API-U), Event, Facility Management & Konsultasi Bisnis.</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className={`rounded-lg p-3 text-center ${cardBg}`}>
                  <p className="text-[10px] uppercase tracking-wider opacity-60 mb-1">UVP Digital</p>
                  <p className="font-semibold text-xs">OMS & ARAH Fleet</p>
                </div>
                <div className={`rounded-lg p-3 text-center ${cardBg}`}>
                  <p className="text-[10px] uppercase tracking-wider opacity-60 mb-1">Perizinan</p>
                  <p className="font-semibold text-xs">Importir API-U</p>
                </div>
              </div>

              <div className={`pt-3 border-t ${borderColor} flex items-center justify-between`}>
                <p className={`text-xs ${textSecondary}`}>© 2026 PT Perdana Adi Yuda</p>
                <a href="https://perada.net" target="_blank" rel="noopener noreferrer" className="text-xs text-[#0A2540] dark:text-[#58a6ff] font-medium hover:underline">
                  perada.net →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`w-[320px] flex flex-col border-r overflow-hidden shrink-0 ${sidebarBg} ${borderColor}`}>
          {/* Settings */}
          <div className={`p-4 border-b ${borderColor}`}>
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-3.5 h-3.5 text-[#0A2540] dark:text-[#58a6ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <h2 className="font-semibold text-xs uppercase tracking-wider">Pengaturan Layout</h2>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className={`text-[10px] font-medium uppercase tracking-wider ${textSecondary} block mb-1`}>Kolom</label>
                  <input
                    type="number" min={1} max={5}
                    value={settings.columns}
                    onChange={e => setSettings(s => ({ ...s, columns: Math.min(5, Math.max(1, Number(e.target.value))) }))}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-[#0A2540]/30`}
                  />
                </div>
                <div>
                  <label className={`text-[10px] font-medium uppercase tracking-wider ${textSecondary} block mb-1`}>Baris</label>
                  <input
                    type="number" min={1} max={5}
                    value={settings.rows}
                    onChange={e => setSettings(s => ({ ...s, rows: Math.min(5, Math.max(1, Number(e.target.value))) }))}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-[#0A2540]/30`}
                  />
                </div>
              </div>

              <div>
                <label className={`text-[10px] font-medium uppercase tracking-wider ${textSecondary} block mb-1`}>Padding (mm)</label>
                <input
                  type="range" min={0} max={50} value={settings.padding}
                  onChange={e => setSettings(s => ({ ...s, padding: Number(e.target.value) }))}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[#0A2540]"
                  style={{ background: darkMode ? '#30363d' : '#d0d7de' }}
                />
                <div className="flex justify-between mt-0.5">
                  <span className={`text-[10px] ${textSecondary}`}>0mm</span>
                  <span className={`text-[10px] font-medium ${textPrimary}`}>{settings.padding}mm</span>
                  <span className={`text-[10px] ${textSecondary}`}>50mm</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className={`text-[10px] font-medium uppercase tracking-wider ${textSecondary} block mb-1`}>Kertas</label>
                  <select
                    value={settings.paperSize}
                    onChange={e => setSettings(s => ({ ...s, paperSize: e.target.value as PaperSize }))}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-[#0A2540]/30`}
                  >
                    <option value="A4">A4</option>
                    <option value="Letter">Letter</option>
                    <option value="Legal">Legal</option>
                  </select>
                </div>
                <div>
                  <label className={`text-[10px] font-medium uppercase tracking-wider ${textSecondary} block mb-1`}>Orientasi</label>
                  <select
                    value={settings.orientation}
                    onChange={e => setSettings(s => ({ ...s, orientation: e.target.value as Orientation }))}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-[#0A2540]/30`}
                  >
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </div>
              </div>

              <div className={`flex items-center justify-between px-3 py-2 rounded-lg ${cardBg}`}>
                <span className={`text-xs ${textSecondary}`}>Total halaman</span>
                <span className="text-sm font-bold text-[#0A2540] dark:text-[#58a6ff]">{totalPages}</span>
              </div>
            </div>
          </div>

          {/* Upload */}
          <div className={`p-4 border-b ${borderColor}`}>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-[#0A2540] bg-[#0A2540]/5 dark:border-[#58a6ff] dark:bg-[#58a6ff]/5'
                  : darkMode
                  ? 'border-[#30363d] hover:border-[#484f58]'
                  : 'border-[#d0d7de] hover:border-[#0A2540]/40'
              }`}
            >
              <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-[#0A2540]/5 dark:bg-[#58a6ff]/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#0A2540] dark:text-[#58a6ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              </div>
              <p className="text-xs font-medium">Drag & drop gambar</p>
              <p className={`text-[10px] mt-0.5 ${textSecondary}`}>atau klik untuk pilih file</p>
            </div>
            <div className="flex gap-2 mt-2.5">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 text-xs py-2 rounded-lg font-medium bg-[#0A2540] hover:bg-[#1E3A5F] text-white transition-colors"
              >
                Pilih File
              </button>
              <button
                onClick={() => folderInputRef.current?.click()}
                className={`flex-1 text-xs py-2 rounded-lg font-medium border transition-colors ${
                  darkMode ? 'border-[#30363d] hover:border-[#484f58] text-[#8b949e]' : 'border-[#d0d7de] hover:border-[#0A2540]/40 text-[#57606a]'
                }`}
              >
                Pilih Folder
              </button>
            </div>
            <input ref={fileInputRef} type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => e.target.files && handleFiles(e.target.files)} />
            <input ref={folderInputRef} type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden" {...({ webkitdirectory: '', directory: '' } as any)} onChange={e => e.target.files && handleFiles(e.target.files)} />
          </div>

          {/* File List */}
          <div className="flex-1 overflow-y-auto scrollbar-thin p-2">
            {images.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-[#0A2540]/5 dark:bg-[#58a6ff]/5 flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#0A2540] dark:text-[#58a6ff] opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <p className={`text-sm font-medium ${textSecondary}`}>Belum ada gambar</p>
                <p className={`text-xs mt-1 ${textSecondary} opacity-70`}>Upload gambar nota untuk memulai</p>
              </div>
            ) : (
              <div className="space-y-0.5">
                <div className="flex items-center justify-between px-2 py-1.5">
                  <span className={`text-[10px] font-medium uppercase tracking-wider ${textSecondary}`}>{images.length} file</span>
                  <button onClick={clearAll} className="text-[10px] text-red-400 hover:text-red-300 font-medium">Hapus Semua</button>
                </div>
                {images.map((img, idx) => (
                  <div key={img.id} className={`flex items-center gap-2 p-1.5 rounded-lg group transition-colors ${darkMode ? 'hover:bg-[#21262d]' : 'hover:bg-[#f3f4f6]'}`}>
                    <span className={`text-[9px] w-5 text-right shrink-0 font-mono ${textSecondary}`}>{idx + 1}</span>
                    <img src={img.url} alt={img.name} className="w-8 h-8 object-cover rounded-md border border-[#30363d] dark:border-[#30363d] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-xs font-medium">{img.name}</p>
                      <p className={`text-[9px] ${textSecondary}`}>{img.width}×{img.height}px</p>
                    </div>
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      {idx > 0 && (
                        <button onClick={() => moveImage(idx, idx - 1)} className={`w-5 h-5 flex items-center justify-center rounded text-[10px] ${darkMode ? 'hover:bg-[#30363d]' : 'hover:bg-gray-200'}`}>↑</button>
                      )}
                      {idx < images.length - 1 && (
                        <button onClick={() => moveImage(idx, idx + 1)} className={`w-5 h-5 flex items-center justify-center rounded text-[10px] ${darkMode ? 'hover:bg-[#30363d]' : 'hover:bg-gray-200'}`}>↓</button>
                      )}
                      <button onClick={() => removeImage(img.id)} className="w-5 h-5 flex items-center justify-center rounded text-[10px] text-red-400 hover:bg-red-500/10">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Preview Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className={`flex items-center justify-between px-4 py-2 border-b shrink-0 ${sidebarBg} ${borderColor}`}>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-colors ${
                  currentPage === 0 ? 'opacity-20 cursor-not-allowed' : darkMode ? 'hover:bg-[#21262d]' : 'hover:bg-[#f0f1f3]'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <div className={`px-2.5 py-1 rounded-md text-xs font-medium ${cardBg} min-w-[80px] text-center`}>
                {totalPages > 0 ? `${currentPage + 1} / ${totalPages}` : '0 / 0'}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage >= totalPages - 1}
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-colors ${
                  currentPage >= totalPages - 1 ? 'opacity-20 cursor-not-allowed' : darkMode ? 'hover:bg-[#21262d]' : 'hover:bg-[#f0f1f3]'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button onClick={() => setZoom(z => Math.max(0.2, z - 0.1))} className={`w-7 h-7 rounded-lg flex items-center justify-center ${darkMode ? 'hover:bg-[#21262d]' : 'hover:bg-[#f0f1f3]'}`}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
              </button>
              <div className={`px-2 py-1 rounded-md text-[10px] font-mono ${cardBg} min-w-[40px] text-center`}>{Math.round(zoom * 100)}%</div>
              <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className={`w-7 h-7 rounded-lg flex items-center justify-center ${darkMode ? 'hover:bg-[#21262d]' : 'hover:bg-[#f0f1f3]'}`}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              </button>
              <button onClick={() => setZoom(0.5)} className={`px-2 py-1 rounded-lg text-[10px] font-medium ${darkMode ? 'hover:bg-[#21262d] text-[#8b949e]' : 'hover:bg-[#f0f1f3] text-[#57606a]'}`}>Reset</button>
            </div>

            <button
              onClick={handleExport}
              disabled={images.length === 0 || isGenerating}
              className={`px-4 py-1.5 rounded-lg font-medium text-xs transition-all flex items-center gap-2 ${
                images.length === 0 || isGenerating
                  ? 'opacity-40 cursor-not-allowed bg-[#0A2540] text-white'
                  : 'bg-[#0A2540] hover:bg-[#1E3A5F] text-white shadow-sm'
              }`}
            >
              {isGenerating ? (
                <>
                  <span className="pulse-dot">●</span>
                  <span>{progress.current}/{progress.total}</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Export PDF
                </>
              )}
            </button>
          </div>

          {/* Messages */}
          {error && (
            <div className="mx-4 mt-2 p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 flex items-center justify-between fade-in">
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{error}</span>
              </div>
              <button onClick={() => setError(null)} className="hover:text-red-300">✕</button>
            </div>
          )}
          {successMsg && (
            <div className="mx-4 mt-2 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-400 flex items-center justify-between fade-in">
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span>{successMsg}</span>
              </div>
              <button onClick={() => setSuccessMsg(null)} className="hover:text-emerald-300">✕</button>
            </div>
          )}

          {/* Progress Bar */}
          {isGenerating && (
            <div className="mx-4 mt-2 fade-in">
              <div className={`h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-[#21262d]' : 'bg-[#e2e5e9]'}`}>
                <div className="h-full bg-[#0A2540] rounded-full progress-bar" style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }} />
              </div>
              <p className={`text-[10px] mt-1 ${textSecondary}`}>Memproses {progress.current} dari {progress.total} gambar...</p>
            </div>
          )}

          {/* Preview Canvas */}
          <div className="flex-1 overflow-auto preview-scroll p-6 flex items-start justify-center">
            {images.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center slide-up">
                <div className="w-20 h-20 rounded-3xl bg-[#0A2540]/5 dark:bg-[#58a6ff]/5 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-[#0A2540] dark:text-[#58a6ff] opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
                </div>
                <h3 className="text-base font-semibold mb-1">Belum Ada Gambar</h3>
                <p className={`text-sm max-w-xs ${textSecondary}`}>Upload gambar nota menggunakan tombol di sidebar kiri, atau drag & drop file ke area tersebut.</p>
                <p className={`text-xs mt-3 ${textSecondary} opacity-60`}>Format: JPG, PNG, WEBP • Tanpa crop • Grid layout</p>
              </div>
            ) : (
              <PreviewPage images={images} settings={settings} currentPage={currentPage} zoom={zoom} darkMode={darkMode} />
            )}
          </div>

          {/* Footer */}
          <footer className={`px-4 py-2 border-t shrink-0 flex items-center justify-between ${sidebarBg} ${borderColor}`}>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-[#0A2540] flex items-center justify-center">
                <span className="text-white text-[6px] font-bold">PA</span>
              </div>
              <span className={`text-[10px] ${textSecondary}`}>
                <span className="font-medium text-[#0A2540] dark:text-[#58a6ff]">PT Perdana Adi Yuda</span> — PERADA GROUP
              </span>
            </div>
            <span className={`text-[10px] ${textSecondary}`}>© 2026</span>
          </footer>
        </main>
      </div>
    </div>
  );
}

// Preview Page Component
function PreviewPage({
  images, settings, currentPage, zoom, darkMode,
}: {
  images: ImageFile[];
  settings: LayoutSettings;
  currentPage: number;
  zoom: number;
  darkMode: boolean;
}) {
  const dims = PAPER_DIMENSIONS[settings.paperSize][settings.orientation];
  const pageImages = getImagesForPage(images, settings, currentPage);
  const cells = getCellPositions(settings);
  const scale = zoom;
  const displayWidth = dims.width * scale;
  const displayHeight = dims.height * scale;

  return (
    <div
      className="shadow-2xl bg-white rounded-sm relative"
      style={{ width: `${displayWidth}px`, height: `${displayHeight}px`, flexShrink: 0 }}
    >
      {/* Grid cells */}
      {cells.map((cell, idx) => (
        <div
          key={idx}
          className="absolute border border-gray-100"
          style={{
            left: `${cell.x * scale}px`,
            top: `${cell.y * scale}px`,
            width: `${cell.width * scale}px`,
            height: `${cell.height * scale}px`,
          }}
        />
      ))}
      {/* Images */}
      {pageImages.map((img, idx) => {
        const cell = cells[idx];
        const fitted = fitImageToCell(img.width, img.height, cell);
        return (
          <img
            key={img.id}
            src={img.url}
            alt={img.name}
            className="absolute"
            style={{
              left: `${fitted.x * scale}px`,
              top: `${fitted.y * scale}px`,
              width: `${fitted.width * scale}px`,
              height: `${fitted.height * scale}px`,
              objectFit: 'contain',
            }}
          />
        );
      })}
      {/* Page indicator */}
      <div className="absolute bottom-1 right-2 text-[8px] text-gray-300 font-mono">
        {currentPage + 1}/{getPagesCount(images, settings)}
      </div>
    </div>
  );
}
