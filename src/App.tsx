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
        // skip invalid files
      }
    }

    newImages.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    setImages(prev => [...prev, ...newImages]);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

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

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
      {/* Header */}
      <header className={`flex items-center justify-between px-4 py-2 border-b shrink-0 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-2">
          <span className="text-xl">🧾</span>
          <h1 className="text-lg font-bold">Nota ke PDF</h1>
          <span className={`text-xs px-2 py-0.5 rounded ${darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-700'}`}>
            {images.length} gambar
          </span>
        </div>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
          title={darkMode ? 'Mode Terang' : 'Mode Gelap'}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`w-80 flex flex-col border-r overflow-hidden shrink-0 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          {/* Controls */}
          <div className={`p-4 border-b overflow-y-auto ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className="font-semibold mb-3 text-sm uppercase tracking-wide opacity-70">Pengaturan Layout</h2>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium opacity-70 block mb-1">Kolom</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={settings.columns}
                    onChange={e => setSettings(s => ({ ...s, columns: Math.min(5, Math.max(1, Number(e.target.value))) }))}
                    className={`w-full px-2 py-1.5 rounded text-sm border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium opacity-70 block mb-1">Baris</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={settings.rows}
                    onChange={e => setSettings(s => ({ ...s, rows: Math.min(5, Math.max(1, Number(e.target.value))) }))}
                    className={`w-full px-2 py-1.5 rounded text-sm border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'}`}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium opacity-70 block mb-1">Padding (mm)</label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={settings.padding}
                  onChange={e => setSettings(s => ({ ...s, padding: Math.max(0, Number(e.target.value)) }))}
                  className={`w-full px-2 py-1.5 rounded text-sm border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium opacity-70 block mb-1">Ukuran Kertas</label>
                  <select
                    value={settings.paperSize}
                    onChange={e => setSettings(s => ({ ...s, paperSize: e.target.value as PaperSize }))}
                    className={`w-full px-2 py-1.5 rounded text-sm border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'}`}
                  >
                    <option value="A4">A4</option>
                    <option value="Letter">Letter</option>
                    <option value="Legal">Legal</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium opacity-70 block mb-1">Orientasi</label>
                  <select
                    value={settings.orientation}
                    onChange={e => setSettings(s => ({ ...s, orientation: e.target.value as Orientation }))}
                    className={`w-full px-2 py-1.5 rounded text-sm border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'}`}
                  >
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </div>
              </div>

              <div className={`text-xs p-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <span className="opacity-70">Total halaman: </span>
                <span className="font-bold">{totalPages}</span>
                <span className="opacity-70"> ({settings.columns}×{settings.rows} = {settings.columns * settings.rows}/halaman)</span>
              </div>
            </div>
          </div>

          {/* File Upload Area */}
          <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${
                isDragging
                  ? 'border-blue-400 bg-blue-500/10'
                  : darkMode
                  ? 'border-gray-600 hover:border-gray-500'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="text-2xl mb-1">📁</div>
              <p className="text-xs opacity-70">Drag & drop gambar di sini</p>
              <p className="text-xs opacity-50 mt-1">atau klik untuk pilih file</p>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`flex-1 text-xs py-1.5 rounded font-medium transition-colors ${
                  darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                Pilih File
              </button>
              <button
                onClick={() => folderInputRef.current?.click()}
                className={`flex-1 text-xs py-1.5 rounded font-medium transition-colors ${
                  darkMode ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
              >
                Pilih Folder
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={e => e.target.files && handleFiles(e.target.files)}
            />
            <input
              ref={folderInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              {...({ webkitdirectory: '', directory: '' } as any)}
              onChange={e => e.target.files && handleFiles(e.target.files)}
            />
          </div>

          {/* File List */}
          <div className="flex-1 overflow-y-auto p-2">
            {images.length === 0 ? (
              <div className="text-center py-8 opacity-50">
                <div className="text-3xl mb-2">📋</div>
                <p className="text-sm">Belum ada gambar</p>
                <p className="text-xs mt-1">Upload gambar untuk memulai</p>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex items-center justify-between px-2 py-1">
                  <span className="text-xs font-medium opacity-70">{images.length} file</span>
                  <button
                    onClick={clearAll}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Hapus Semua
                  </button>
                </div>
                {images.map((img, idx) => (
                  <div
                    key={img.id}
                    className={`flex items-center gap-2 p-1.5 rounded text-xs group ${
                      darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-[10px] opacity-50 w-5 text-right shrink-0">{idx + 1}</span>
                    <img
                      src={img.url}
                      alt={img.name}
                      className="w-8 h-8 object-cover rounded border border-gray-600 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{img.name}</p>
                      <p className="opacity-50 text-[10px]">{img.width}×{img.height}px</p>
                    </div>
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      {idx > 0 && (
                        <button
                          onClick={() => moveImage(idx, idx - 1)}
                          className="p-0.5 hover:bg-gray-600 rounded"
                          title="Pindah ke atas"
                        >
                          ↑
                        </button>
                      )}
                      {idx < images.length - 1 && (
                        <button
                          onClick={() => moveImage(idx, idx + 1)}
                          className="p-0.5 hover:bg-gray-600 rounded"
                          title="Pindah ke bawah"
                        >
                          ↓
                        </button>
                      )}
                      <button
                        onClick={() => removeImage(img.id)}
                        className="p-0.5 hover:bg-red-600 rounded text-red-400"
                        title="Hapus"
                      >
                        ✕
                      </button>
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
          <div className={`flex items-center justify-between px-4 py-2 border-b shrink-0 ${darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className={`px-2 py-1 rounded text-sm ${
                  currentPage === 0
                    ? 'opacity-30 cursor-not-allowed'
                    : darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                }`}
              >
                ◀
              </button>
              <span className="text-sm font-medium">
                Halaman {totalPages > 0 ? currentPage + 1 : 0} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage >= totalPages - 1}
                className={`px-2 py-1 rounded text-sm ${
                  currentPage >= totalPages - 1
                    ? 'opacity-30 cursor-not-allowed'
                    : darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                }`}
              >
                ▶
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoom(z => Math.max(0.2, z - 0.1))}
                className={`px-2 py-1 rounded text-sm ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
              >
                −
              </button>
              <span className="text-xs font-medium w-12 text-center">{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => setZoom(z => Math.min(2, z + 0.1))}
                className={`px-2 py-1 rounded text-sm ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
              >
                +
              </button>
              <button
                onClick={() => setZoom(0.5)}
                className={`px-2 py-1 rounded text-xs ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
              >
                Reset
              </button>
            </div>

            <button
              onClick={handleExport}
              disabled={images.length === 0 || isGenerating}
              className={`px-4 py-1.5 rounded font-medium text-sm transition-colors ${
                images.length === 0 || isGenerating
                  ? 'opacity-50 cursor-not-allowed bg-gray-500 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isGenerating ? `⏳ ${progress.current}/${progress.total}` : '📄 Export PDF'}
            </button>
          </div>

          {/* Messages */}
          {error && (
            <div className="mx-4 mt-2 p-3 bg-red-900/50 border border-red-700 rounded text-sm text-red-200 flex items-center justify-between">
              <span>⚠️ {error}</span>
              <button onClick={() => setError(null)} className="text-red-300 hover:text-red-100">✕</button>
            </div>
          )}
          {successMsg && (
            <div className="mx-4 mt-2 p-3 bg-green-900/50 border border-green-700 rounded text-sm text-green-200 flex items-center justify-between">
              <span>✅ {successMsg}</span>
              <button onClick={() => setSuccessMsg(null)} className="text-green-300 hover:text-green-100">✕</button>
            </div>
          )}

          {/* Progress Bar */}
          {isGenerating && (
            <div className="mx-4 mt-2">
              <div className={`h-2 rounded-full overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
                />
              </div>
              <p className="text-xs mt-1 opacity-70">
                Memproses gambar {progress.current} dari {progress.total}...
              </p>
            </div>
          )}

          {/* Preview Canvas */}
          <div className="flex-1 overflow-auto p-4 flex items-start justify-center">
            {images.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full opacity-50">
                <div className="text-6xl mb-4">🧾</div>
                <h3 className="text-lg font-medium mb-2">Belum Ada Gambar</h3>
                <p className="text-sm text-center max-w-sm">
                  Upload gambar nota menggunakan tombol di sidebar kiri, atau drag & drop file ke area tersebut.
                </p>
                <p className="text-xs mt-3 opacity-70">
                  Format yang didukung: JPG, PNG, WEBP
                </p>
              </div>
            ) : (
              <PreviewPage
                images={images}
                settings={settings}
                currentPage={currentPage}
                zoom={zoom}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// Preview Page Component
function PreviewPage({
  images,
  settings,
  currentPage,
  zoom,
}: {
  images: ImageFile[];
  settings: LayoutSettings;
  currentPage: number;
  zoom: number;
}) {
  const dims = PAPER_DIMENSIONS[settings.paperSize][settings.orientation];
  const pageImages = getImagesForPage(images, settings, currentPage);
  const cells = getCellPositions(settings);
  
  // Scale: 1 point = 1/72 inch. For screen preview, use a reasonable scale
  const scale = zoom;
  const displayWidth = dims.width * scale;
  const displayHeight = dims.height * scale;

  return (
    <div
      className="shadow-2xl bg-white"
      style={{
        width: `${displayWidth}px`,
        height: `${displayHeight}px`,
        position: 'relative',
        flexShrink: 0,
      }}
    >
      {/* Grid lines (subtle) */}
      {cells.map((cell, idx) => (
        <div
          key={idx}
          className="absolute border border-gray-200"
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
      
      {/* Page number indicator */}
      <div className="absolute bottom-1 right-2 text-[10px] text-gray-400">
        {currentPage + 1}/{getPagesCount(images, settings)}
      </div>
    </div>
  );
}
