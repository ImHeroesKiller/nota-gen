import { useState, useCallback, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';

interface PdfSplitterProps {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

type SplitMode = 'range' | 'every' | 'extract';

export default function PdfSplitter({ onBack, darkMode, setDarkMode }: PdfSplitterProps) {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [splitMode, setSplitMode] = useState<SplitMode>('range');
  const [rangeStart, setRangeStart] = useState(1);
  const [rangeEnd, setRangeEnd] = useState(1);
  const [everyN, setEveryN] = useState(5);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bg = darkMode ? 'bg-[#0f1419]' : 'bg-[#f8f9fb]';
  const sidebarBg = darkMode ? 'bg-[#161b22]' : 'bg-white';
  const borderColor = darkMode ? 'border-[#21262d]' : 'border-[#e2e5e9]';
  const cardBg = darkMode ? 'bg-[#1c2128]' : 'bg-[#f3f4f6]';
  const textPrimary = darkMode ? 'text-[#e6edf3]' : 'text-[#1a1a2e]';
  const textSecondary = darkMode ? 'text-[#8b949e]' : 'text-[#57606a]';
  const inputBg = darkMode ? 'bg-[#0d1117] border-[#30363d]' : 'bg-white border-[#d0d7de]';
  const hoverBg = darkMode ? 'hover:bg-[#21262d]' : 'hover:bg-[#f0f1f3]';

  const handleFileSelect = useCallback(async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('File harus berformat PDF');
      return;
    }
    setError(null);
    setPdfFile(file);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const pages = pdf.getPageCount();
      setTotalPages(pages);
      setRangeEnd(pages);
      setSelectedPages(new Set());
    } catch {
      setError('Gagal membaca file PDF');
    }
  }, []);

  const togglePage = useCallback((page: number) => {
    setSelectedPages(prev => {
      const next = new Set(prev);
      if (next.has(page)) next.delete(page);
      else next.add(page);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedPages(new Set(Array.from({ length: totalPages }, (_, i) => i + 1)));
  }, [totalPages]);

  const deselectAll = useCallback(() => {
    setSelectedPages(new Set());
  }, []);

  const handleSplit = useCallback(async () => {
    if (!pdfFile) {
      setError('Belum ada file PDF');
      return;
    }
    setIsProcessing(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const sourcePdf = await PDFDocument.load(arrayBuffer);
      const baseName = pdfFile.name.replace('.pdf', '');

      if (splitMode === 'range') {
        const newPdf = await PDFDocument.create();
        const startIdx = Math.max(0, rangeStart - 1);
        const endIdx = Math.min(totalPages, rangeEnd);
        const pages = await newPdf.copyPages(sourcePdf, 
          Array.from({ length: endIdx - startIdx }, (_, i) => startIdx + i)
        );
        pages.forEach(p => newPdf.addPage(p));
        const bytes = await newPdf.save();
        downloadBlob(new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' }), `${baseName}_hal_${rangeStart}-${rangeEnd}.pdf`);
        setSuccessMsg(`PDF halaman ${rangeStart}-${rangeEnd} berhasil diunduh!`);
      } else if (splitMode === 'every') {
        let fileCount = 0;
        for (let i = 0; i < totalPages; i += everyN) {
          const newPdf = await PDFDocument.create();
          const end = Math.min(i + everyN, totalPages);
          const pages = await newPdf.copyPages(sourcePdf, 
            Array.from({ length: end - i }, (_, j) => i + j)
          );
          pages.forEach(p => newPdf.addPage(p));
          const bytes = await newPdf.save();
          const partNum = Math.floor(i / everyN) + 1;
          downloadBlob(new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' }), `${baseName}_part${partNum}.pdf`);
          fileCount++;
          setProgress({ current: i + 1, total: totalPages });
          await new Promise(r => setTimeout(r, 100));
        }
        setSuccessMsg(`${fileCount} file PDF berhasil diunduh!`);
      } else if (splitMode === 'extract') {
        if (selectedPages.size === 0) {
          setError('Pilih minimal 1 halaman');
          setIsProcessing(false);
          return;
        }
        const newPdf = await PDFDocument.create();
        const sorted = Array.from(selectedPages).sort((a, b) => a - b);
        const pages = await newPdf.copyPages(sourcePdf, sorted.map(p => p - 1));
        pages.forEach(p => newPdf.addPage(p));
        const bytes = await newPdf.save();
        downloadBlob(new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' }), `${baseName}_extracted.pdf`);
        setSuccessMsg(`${sorted.length} halaman berhasil di-extract!`);
      }

      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      setError(`Gagal memproses: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  }, [pdfFile, splitMode, rangeStart, rangeEnd, everyN, selectedPages, totalPages]);

  function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${bg} ${textPrimary}`}>
      {/* Header */}
      <header className={`flex items-center justify-between px-4 py-2.5 border-b shrink-0 ${sidebarBg} ${borderColor}`}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${hoverBg}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight">PDF Splitter</h1>
            <p className={`text-[10px] ${textSecondary}`}>Pecah & extract halaman PDF</p>
          </div>
          {pdfFile && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-medium">
              {totalPages} halaman
            </span>
          )}
        </div>
        <button onClick={() => setDarkMode(!darkMode)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${hoverBg}`}>
          {darkMode ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          )}
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`w-[340px] flex flex-col border-r overflow-hidden shrink-0 ${sidebarBg} ${borderColor}`}>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Upload */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                darkMode ? 'border-[#30363d] hover:border-purple-500/50' : 'border-[#d0d7de] hover:border-purple-500/50'
              }`}
            >
              <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <p className="text-xs font-medium">{pdfFile ? pdfFile.name : 'Pilih file PDF'}</p>
              <p className={`text-[10px] mt-0.5 ${textSecondary}`}>{pdfFile ? `${totalPages} halaman` : 'Klik untuk upload'}</p>
            </div>
            <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />

            {/* Split Mode */}
            <div>
              <h3 className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} mb-2`}>Mode Split</h3>
              <div className="space-y-1.5">
                {[
                  { key: 'range' as SplitMode, label: 'Range Halaman', desc: 'Extract halaman tertentu' },
                  { key: 'every' as SplitMode, label: 'Setiap N Halaman', desc: 'Pecah jadi beberapa file' },
                  { key: 'extract' as SplitMode, label: 'Pilih Manual', desc: 'Pilih halaman satu per satu' },
                ].map(mode => (
                  <button
                    key={mode.key}
                    onClick={() => setSplitMode(mode.key)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all ${
                      splitMode === mode.key
                        ? 'border-purple-500 bg-purple-500/5 dark:bg-purple-500/10'
                        : `${borderColor} ${hoverBg}`
                    }`}
                  >
                    <p className={`text-xs font-medium ${splitMode === mode.key ? 'text-purple-600 dark:text-purple-400' : textPrimary}`}>{mode.label}</p>
                    <p className={`text-[10px] ${textSecondary} mt-0.5`}>{mode.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Mode Options */}
            {splitMode === 'range' && (
              <div className="space-y-3">
                <h3 className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary}`}>Range Halaman</h3>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className={`text-[10px] ${textSecondary} block mb-1`}>Dari</label>
                    <input type="number" min={1} max={totalPages} value={rangeStart}
                      onChange={e => setRangeStart(Math.max(1, Math.min(totalPages, Number(e.target.value))))}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500/30`}
                    />
                  </div>
                  <div>
                    <label className={`text-[10px] ${textSecondary} block mb-1`}>Sampai</label>
                    <input type="number" min={1} max={totalPages} value={rangeEnd}
                      onChange={e => setRangeEnd(Math.max(1, Math.min(totalPages, Number(e.target.value))))}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500/30`}
                    />
                  </div>
                </div>
                <p className={`text-[10px] ${textSecondary}`}>Akan extract {Math.max(0, rangeEnd - rangeStart + 1)} halaman</p>
              </div>
            )}

            {splitMode === 'every' && (
              <div className="space-y-3">
                <h3 className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary}`}>Pecah Setiap</h3>
                <div>
                  <label className={`text-[10px] ${textSecondary} block mb-1`}>Jumlah halaman per file</label>
                  <input type="number" min={1} max={totalPages} value={everyN}
                    onChange={e => setEveryN(Math.max(1, Number(e.target.value)))}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500/30`}
                  />
                </div>
                <p className={`text-[10px] ${textSecondary}`}>Akan menghasilkan {Math.ceil(totalPages / everyN)} file PDF</p>
              </div>
            )}

            {splitMode === 'extract' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary}`}>Pilih Halaman</h3>
                  <div className="flex gap-2">
                    <button onClick={selectAll} className="text-[10px] text-purple-500 hover:text-purple-400 font-medium">Semua</button>
                    <button onClick={deselectAll} className="text-[10px] text-purple-500 hover:text-purple-400 font-medium">Batal</button>
                  </div>
                </div>
                <p className={`text-[10px] ${textSecondary}`}>{selectedPages.size} halaman dipilih</p>
                <div className="grid grid-cols-8 gap-1 max-h-[200px] overflow-y-auto">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => togglePage(page)}
                      className={`w-full aspect-square rounded text-[10px] font-medium transition-all ${
                        selectedPages.has(page)
                          ? 'bg-purple-500 text-white'
                          : `${cardBg} ${textSecondary} hover:bg-purple-500/20`
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action */}
          <div className={`p-3 border-t ${borderColor}`}>
            <button
              onClick={handleSplit}
              disabled={!pdfFile || isProcessing}
              className={`w-full py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                !pdfFile || isProcessing
                  ? 'opacity-40 cursor-not-allowed bg-purple-500 text-white'
                  : 'bg-purple-500 hover:bg-purple-600 text-white shadow-sm'
              }`}
            >
              {isProcessing ? (
                <><span className="pulse-dot">●</span> Memproses...</>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                  Split PDF
                </>
              )}
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Progress */}
          {isProcessing && (
            <div className="mx-4 mt-4 fade-in">
              <div className={`h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-[#21262d]' : 'bg-[#e2e5e9]'}`}>
                <div className="h-full bg-purple-500 rounded-full progress-bar" style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }} />
              </div>
              <p className={`text-[10px] mt-1 ${textSecondary}`}>Memproses halaman {progress.current} dari {progress.total}...</p>
            </div>
          )}

          {/* Messages */}
          {error && (
            <div className="mx-4 mt-4 p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 flex items-center justify-between fade-in">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="hover:text-red-300">✕</button>
            </div>
          )}
          {successMsg && (
            <div className="mx-4 mt-4 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-400 flex items-center justify-between fade-in">
              <span>{successMsg}</span>
              <button onClick={() => setSuccessMsg(null)} className="hover:text-emerald-300">✕</button>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-auto p-6 flex items-start justify-center">
            {!pdfFile ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-20 h-20 rounded-3xl bg-purple-500/5 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-purple-500 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <h3 className="text-base font-semibold mb-1">Upload File PDF</h3>
                <p className={`text-sm max-w-xs ${textSecondary}`}>Pilih file PDF dari sidebar untuk mulai memecah atau extract halaman</p>
                <div className={`mt-4 grid grid-cols-3 gap-3 text-center ${textSecondary}`}>
                  <div className={`p-3 rounded-xl ${cardBg}`}>
                    <p className="text-xs font-medium mb-0.5">Range</p>
                    <p className="text-[10px] opacity-60">Extract halaman tertentu</p>
                  </div>
                  <div className={`p-3 rounded-xl ${cardBg}`}>
                    <p className="text-xs font-medium mb-0.5">Split</p>
                    <p className="text-[10px] opacity-60">Pecah jadi beberapa file</p>
                  </div>
                  <div className={`p-3 rounded-xl ${cardBg}`}>
                    <p className="text-xs font-medium mb-0.5">Manual</p>
                    <p className="text-[10px] opacity-60">Pilih halaman satu per satu</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-2xl">
                <div className={`rounded-2xl border p-6 ${darkMode ? 'border-[#30363d]' : 'border-[#e2e5e9]'}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{pdfFile.name}</p>
                      <p className={`text-xs ${textSecondary}`}>{totalPages} halaman • {(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  
                  {/* Page Grid Preview */}
                  <div className="grid grid-cols-10 gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                      const isSelected = splitMode === 'extract' ? selectedPages.has(page) : 
                        splitMode === 'range' ? (page >= rangeStart && page <= rangeEnd) : true;
                      return (
                        <div
                          key={page}
                          onClick={() => splitMode === 'extract' && togglePage(page)}
                          className={`aspect-[210/297] rounded flex items-center justify-center text-[8px] font-medium transition-all ${
                            isSelected
                              ? 'bg-purple-500 text-white'
                              : `${cardBg} ${textSecondary}`
                          } ${splitMode === 'extract' ? 'cursor-pointer hover:bg-purple-500/30' : ''}`}
                        >
                          {page}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
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
