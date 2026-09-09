import { useState, useRef } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';

type PDFOperation = 'compress' | 'merge' | 'add-page' | 'rotate' | 'delete' | 'extract' | 'reorder';

export default function PDFProcessor({ onBack, darkMode, setDarkMode }: any) {
  const [operation, setOperation] = useState<PDFOperation>('compress');
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [pdfInfo, setPdfInfo] = useState<{ name: string; pages: number; size: number }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Operation-specific states
  const [compressQuality, setCompressQuality] = useState(70);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [rotationAngle, setRotationAngle] = useState(90);
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bg = darkMode ? 'bg-[#0f1419]' : 'bg-[#f8f9fb]';
  const sidebarBg = darkMode ? 'bg-[#161b22]' : 'bg-white';
  const borderColor = darkMode ? 'border-[#21262d]' : 'border-[#e2e5e9]';
  const cardBg = darkMode ? 'bg-[#1c2128]' : 'bg-[#f3f4f6]';
  const textPrimary = darkMode ? 'text-[#e6edf3]' : 'text-[#1a1a2e]';
  const textSecondary = darkMode ? 'text-[#8b949e]' : 'text-[#57606a]';
  const inputBg = darkMode ? 'bg-[#0d1117] border-[#30363d]' : 'bg-white border-[#d0d7de]';
  const hoverBg = darkMode ? 'hover:bg-[#21262d]' : 'hover:bg-[#f0f1f3]';

  const handleFileSelect = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter(f => f.type === 'application/pdf');
    if (fileArray.length === 0) {
      setError('Hanya file PDF yang didukung');
      return;
    }

    setPdfFiles(fileArray);
    setError(null);

    // Get PDF info
    const info = await Promise.all(
      fileArray.map(async (file) => {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await PDFDocument.load(arrayBuffer);
          return {
            name: file.name,
            pages: pdf.getPageCount(),
            size: file.size,
          };
        } catch {
          return { name: file.name, pages: 0, size: file.size };
        }
      })
    );
    setPdfInfo(info);

    // Initialize page order for reorder operation
    if (info.length > 0 && info[0].pages > 0) {
      setPageOrder(Array.from({ length: info[0].pages }, (_, i) => i + 1));
    }
  };

  const compressPDF = async () => {
    if (pdfFiles.length === 0) return;
    setIsProcessing(true);
    setError(null);

    try {
      const file = pdfFiles[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      
      // Compress by re-saving with optimization
      const compressedPdf = await PDFDocument.create();
      const copiedPages = await compressedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach(page => compressedPdf.addPage(page));

      const pdfBytes = await compressedPdf.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });

      downloadBlob(new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' }), 
        `${file.name.replace('.pdf', '')}_compressed.pdf`);
      
      const originalSize = (file.size / 1024 / 1024).toFixed(2);
      const compressedSize = (pdfBytes.length / 1024 / 1024).toFixed(2);
      setSuccessMsg(`PDF berhasil dikompres!\nUkuran asli: ${originalSize} MB\nUkuran baru: ${compressedSize} MB`);
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      setError(`Gagal mengompres PDF: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const mergePDFs = async () => {
    if (pdfFiles.length < 2) {
      setError('Pilih minimal 2 file PDF untuk digabungkan');
      return;
    }
    setIsProcessing(true);
    setError(null);
    setProgress({ current: 0, total: pdfFiles.length });

    try {
      const mergedPdf = await PDFDocument.create();

      for (let i = 0; i < pdfFiles.length; i++) {
        const arrayBuffer = await pdfFiles[i].arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach(page => mergedPdf.addPage(page));
        setProgress({ current: i + 1, total: pdfFiles.length });
      }

      const pdfBytes = await mergedPdf.save();
      downloadBlob(new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' }), 
        `merged_${new Date().toISOString().slice(0, 10)}.pdf`);
      
      setSuccessMsg(`${pdfFiles.length} PDF berhasil digabungkan!`);
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      setError(`Gagal menggabungkan PDF: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const addBlankPage = async () => {
    if (pdfFiles.length === 0) return;
    setIsProcessing(true);
    setError(null);

    try {
      const file = pdfFiles[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      
      // Add blank page at the end
      pdf.addPage();

      const pdfBytes = await pdf.save();
      downloadBlob(new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' }), 
        `${file.name.replace('.pdf', '')}_with_blank_page.pdf`);
      
      setSuccessMsg('Halaman kosong berhasil ditambahkan!');
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      setError(`Gagal menambahkan halaman: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const rotatePages = async () => {
    if (pdfFiles.length === 0 || selectedPages.size === 0) {
      setError('Pilih minimal 1 halaman untuk dirotasi');
      return;
    }
    setIsProcessing(true);
    setError(null);

    try {
      const file = pdfFiles[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      
      const pages = pdf.getPages();
      selectedPages.forEach(pageNum => {
        if (pageNum <= pages.length) {
          const page = pages[pageNum - 1];
          const currentRotation = page.getRotation().angle;
          page.setRotation(degrees(currentRotation + rotationAngle));
        }
      });

      const pdfBytes = await pdf.save();
      downloadBlob(new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' }), 
        `${file.name.replace('.pdf', '')}_rotated.pdf`);
      
      setSuccessMsg(`${selectedPages.size} halaman berhasil dirotasi ${rotationAngle}°!`);
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      setError(`Gagal merotasi halaman: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const deletePages = async () => {
    if (pdfFiles.length === 0 || selectedPages.size === 0) {
      setError('Pilih minimal 1 halaman untuk dihapus');
      return;
    }
    setIsProcessing(true);
    setError(null);

    try {
      const file = pdfFiles[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      
      const pagesToKeep = Array.from({ length: pdf.getPageCount() }, (_, i) => i)
        .filter(i => !selectedPages.has(i + 1));
      
      const newPdf = await PDFDocument.create();
      const copiedPages = await newPdf.copyPages(pdf, pagesToKeep);
      copiedPages.forEach(page => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();
      downloadBlob(new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' }), 
        `${file.name.replace('.pdf', '')}_pages_removed.pdf`);
      
      setSuccessMsg(`${selectedPages.size} halaman berhasil dihapus!`);
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      setError(`Gagal menghapus halaman: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const extractPages = async () => {
    if (pdfFiles.length === 0 || selectedPages.size === 0) {
      setError('Pilih minimal 1 halaman untuk diekstrak');
      return;
    }
    setIsProcessing(true);
    setError(null);

    try {
      const file = pdfFiles[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      
      const pagesToExtract = Array.from(selectedPages).sort((a, b) => a - b);
      const newPdf = await PDFDocument.create();
      const copiedPages = await newPdf.copyPages(pdf, pagesToExtract.map(p => p - 1));
      copiedPages.forEach(page => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();
      downloadBlob(new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' }), 
        `${file.name.replace('.pdf', '')}_extracted.pdf`);
      
      setSuccessMsg(`${selectedPages.size} halaman berhasil diekstrak!`);
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      setError(`Gagal mengekstrak halaman: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const reorderPages = async () => {
    if (pdfFiles.length === 0) return;
    setIsProcessing(true);
    setError(null);

    try {
      const file = pdfFiles[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      
      const newPdf = await PDFDocument.create();
      const copiedPages = await newPdf.copyPages(pdf, pageOrder.map(p => p - 1));
      copiedPages.forEach(page => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();
      downloadBlob(new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' }), 
        `${file.name.replace('.pdf', '')}_reordered.pdf`);
      
      setSuccessMsg('Urutan halaman berhasil diubah!');
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      setError(`Gagal mengubah urutan halaman: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const togglePageSelection = (page: number) => {
    setSelectedPages(prev => {
      const next = new Set(prev);
      if (next.has(page)) next.delete(page);
      else next.add(page);
      return next;
    });
  };

  const selectAllPages = () => {
    if (pdfInfo.length > 0) {
      setSelectedPages(new Set(Array.from({ length: pdfInfo[0].pages }, (_, i) => i + 1)));
    }
  };

  const deselectAllPages = () => {
    setSelectedPages(new Set());
  };

  const movePageUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...pageOrder];
    [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
    setPageOrder(newOrder);
  };

  const movePageDown = (index: number) => {
    if (index === pageOrder.length - 1) return;
    const newOrder = [...pageOrder];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    setPageOrder(newOrder);
  };

  const operations = [
    { key: 'compress', label: 'Compress PDF', icon: '🗜️', desc: 'Kurangi ukuran file PDF' },
    { key: 'merge', label: 'Merge PDF', icon: '📑', desc: 'Gabungkan beberapa PDF' },
    { key: 'add-page', label: 'Add Page', icon: '➕', desc: 'Tambah halaman kosong' },
    { key: 'rotate', label: 'Rotate Pages', icon: '🔄', desc: 'Rotasi halaman tertentu' },
    { key: 'delete', label: 'Delete Pages', icon: '🗑️', desc: 'Hapus halaman tertentu' },
    { key: 'extract', label: 'Extract Pages', icon: '📤', desc: 'Ekstrak halaman tertentu' },
    { key: 'reorder', label: 'Reorder Pages', icon: '🔀', desc: 'Ubah urutan halaman' },
  ];

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${bg} ${textPrimary}`}>
      {/* Header */}
      <header className={`flex items-center justify-between px-4 py-2.5 border-b shrink-0 ${sidebarBg} ${borderColor}`}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className={`w-7 h-7 rounded-lg flex items-center justify-center ${hoverBg}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="w-8 h-8 rounded-lg bg-pink-600 flex items-center justify-center shadow-sm">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight">PDF Processor</h1>
            <p className={`text-[10px] ${textSecondary}`}>Compress, merge, edit PDF</p>
          </div>
        </div>
        <button onClick={() => setDarkMode(!darkMode)} className={`w-8 h-8 rounded-lg flex items-center justify-center ${hoverBg}`}>
          {darkMode ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          )}
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`w-80 flex flex-col border-r overflow-hidden shrink-0 ${sidebarBg} ${borderColor}`}>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Operation Selection */}
            <div>
              <h3 className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} mb-2`}>Operasi</h3>
              <div className="space-y-1.5">
                {operations.map(op => (
                  <button
                    key={op.key}
                    onClick={() => {
                      setOperation(op.key as PDFOperation);
                      setSelectedPages(new Set());
                    }}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                      operation === op.key
                        ? 'border-pink-500 bg-pink-500/5 dark:bg-pink-500/10'
                        : `${borderColor} ${hoverBg}`
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{op.icon}</span>
                      <div>
                        <p className={`text-xs font-medium ${operation === op.key ? 'text-pink-600 dark:text-pink-400' : textPrimary}`}>
                          {op.label}
                        </p>
                        <p className={`text-[10px] ${textSecondary}`}>{op.desc}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* File Upload */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                darkMode ? 'border-[#30363d] hover:border-pink-500/50' : 'border-[#d0d7de] hover:border-pink-500/50'
              }`}
            >
              <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-pink-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707L14.293 4.293A1 1 0 0013.586 4H7a2 2 0 00-2 2v13a2 2 0 002 2z" /></svg>
              </div>
              <p className="text-xs font-medium">{pdfFiles.length > 0 ? `${pdfFiles.length} file dipilih` : 'Pilih file PDF'}</p>
              <p className={`text-[10px] mt-0.5 ${textSecondary}`}>
                {operation === 'merge' ? 'Pilih beberapa file' : 'Klik untuk upload'}
              </p>
            </div>
            <input ref={fileInputRef} type="file" accept="application/pdf" multiple className="hidden" onChange={e => e.target.files && handleFileSelect(e.target.files)} />

            {/* File Info */}
            {pdfInfo.length > 0 && (
              <div className={`p-3 rounded-lg ${cardBg} space-y-2`}>
                <h4 className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary}`}>File Info</h4>
                {pdfInfo.map((info, idx) => (
                  <div key={idx} className={`text-xs ${textPrimary}`}>
                    <p className="font-medium truncate">{info.name}</p>
                    <p className={`text-[10px] ${textSecondary}`}>
                      {info.pages} halaman • {(info.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Operation-specific options */}
            {operation === 'compress' && (
              <div>
                <label className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} block mb-1`}>
                  Quality: {compressQuality}%
                </label>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={compressQuality}
                  onChange={e => setCompressQuality(Number(e.target.value))}
                  className="w-full accent-pink-500"
                />
                <p className={`text-[10px] ${textSecondary} mt-1`}>
                  Lower = smaller file, higher = better quality
                </p>
              </div>
            )}

            {(operation === 'rotate' || operation === 'delete' || operation === 'extract') && pdfInfo.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary}`}>
                    Pilih Halaman ({selectedPages.size} dipilih)
                  </h4>
                  <div className="flex gap-1">
                    <button onClick={selectAllPages} className="text-[10px] text-pink-500 hover:underline">Semua</button>
                    <button onClick={deselectAllPages} className="text-[10px] text-pink-500 hover:underline">Batal</button>
                  </div>
                </div>
                <div className="grid grid-cols-8 gap-1 max-h-[200px] overflow-y-auto">
                  {Array.from({ length: pdfInfo[0].pages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => togglePageSelection(page)}
                      className={`w-full aspect-square rounded text-[10px] font-medium transition-all ${
                        selectedPages.has(page)
                          ? 'bg-pink-500 text-white'
                          : `${cardBg} ${textSecondary} hover:bg-pink-500/20`
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                {operation === 'rotate' && (
                  <div className="mt-3">
                    <label className={`text-[10px] ${textSecondary} block mb-1`}>Rotation Angle</label>
                    <select
                      value={rotationAngle}
                      onChange={e => setRotationAngle(Number(e.target.value))}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`}
                    >
                      <option value={90}>90° Clockwise</option>
                      <option value={180}>180°</option>
                      <option value={270}>270° Clockwise</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            {operation === 'reorder' && pdfInfo.length > 0 && (
              <div>
                <h4 className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} mb-2`}>
                  Urutan Halaman
                </h4>
                <div className="space-y-1 max-h-[300px] overflow-y-auto">
                  {pageOrder.map((page, idx) => (
                    <div key={page} className={`flex items-center gap-2 p-2 rounded ${cardBg}`}>
                      <span className={`text-xs font-medium ${textPrimary} w-8`}>{idx + 1}.</span>
                      <span className={`text-xs ${textSecondary} flex-1`}>Page {page}</span>
                      <button
                        onClick={() => movePageUp(idx)}
                        disabled={idx === 0}
                        className={`w-5 h-5 rounded flex items-center justify-center ${idx === 0 ? 'opacity-30' : hoverBg}`}
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => movePageDown(idx)}
                        disabled={idx === pageOrder.length - 1}
                        className={`w-5 h-5 rounded flex items-center justify-center ${idx === pageOrder.length - 1 ? 'opacity-30' : hoverBg}`}
                      >
                        ↓
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className={`p-3 border-t ${borderColor}`}>
            <button
              onClick={() => {
                switch (operation) {
                  case 'compress': compressPDF(); break;
                  case 'merge': mergePDFs(); break;
                  case 'add-page': addBlankPage(); break;
                  case 'rotate': rotatePages(); break;
                  case 'delete': deletePages(); break;
                  case 'extract': extractPages(); break;
                  case 'reorder': reorderPages(); break;
                }
              }}
              disabled={pdfFiles.length === 0 || isProcessing}
              className={`w-full py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                pdfFiles.length === 0 || isProcessing
                  ? 'opacity-40 cursor-not-allowed bg-pink-500 text-white'
                  : 'bg-pink-500 hover:bg-pink-600 text-white shadow-sm'
              }`}
            >
              {isProcessing ? (
                <><span className="pulse-dot">●</span> Processing...</>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  {operations.find(o => o.key === operation)?.label}
                </>
              )}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Progress */}
          {isProcessing && (
            <div className="mx-4 mt-4 fade-in">
              <div className={`h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-[#21262d]' : 'bg-[#e2e5e9]'}`}>
                <div className="h-full bg-pink-500 rounded-full progress-bar" style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }} />
              </div>
              <p className={`text-[10px] mt-1 ${textSecondary}`}>Memproses {progress.current} dari {progress.total}...</p>
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
              <span style={{ whiteSpace: 'pre-line' }}>{successMsg}</span>
              <button onClick={() => setSuccessMsg(null)} className="hover:text-emerald-300">✕</button>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-auto p-6 flex items-center justify-center">
            {pdfFiles.length === 0 ? (
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-pink-500/5 flex items-center justify-center">
                  <svg className="w-8 h-8 text-pink-500 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <h3 className="text-base font-semibold mb-1">Upload PDF</h3>
                <p className={`text-sm max-w-xs ${textSecondary}`}>
                  Pilih file PDF dari sidebar untuk mulai memproses
                </p>
                <div className={`mt-4 grid grid-cols-3 gap-3 text-center ${textSecondary}`}>
                  <div className={`p-3 rounded-xl ${cardBg}`}>
                    <p className="text-xs font-medium mb-0.5">Compress</p>
                    <p className="text-[10px] opacity-60">Kurangi ukuran</p>
                  </div>
                  <div className={`p-3 rounded-xl ${cardBg}`}>
                    <p className="text-xs font-medium mb-0.5">Merge</p>
                    <p className="text-[10px] opacity-60">Gabungkan PDF</p>
                  </div>
                  <div className={`p-3 rounded-xl ${cardBg}`}>
                    <p className="text-xs font-medium mb-0.5">Edit</p>
                    <p className="text-[10px] opacity-60">Rotasi, hapus, dll</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-2xl">
                <div className={`rounded-2xl border p-6 ${darkMode ? 'border-[#30363d]' : 'border-[#e2e5e9]'}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center">
                      <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{pdfFiles[0].name}</p>
                      <p className={`text-xs ${textSecondary}`}>{pdfInfo[0]?.pages} halaman • {(pdfFiles[0].size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>

                  {/* Operation Info */}
                  <div className={`p-4 rounded-xl ${cardBg}`}>
                    <h4 className={`text-xs font-semibold mb-2 ${textPrimary}`}>
                      {operations.find(o => o.key === operation)?.icon} {operations.find(o => o.key === operation)?.label}
                    </h4>
                    <p className={`text-xs ${textSecondary}`}>
                      {operation === 'compress' && 'Mengompres PDF untuk mengurangi ukuran file. File akan di-save ulang dengan optimasi.'}
                      {operation === 'merge' && `Menggabungkan ${pdfFiles.length} file PDF menjadi satu file.`}
                      {operation === 'add-page' && 'Menambahkan satu halaman kosong di akhir dokumen.'}
                      {operation === 'rotate' && `Merotasi ${selectedPages.size} halaman sebesar ${rotationAngle}°.`}
                      {operation === 'delete' && `Menghapus ${selectedPages.size} halaman dari dokumen.`}
                      {operation === 'extract' && `Mengekstrak ${selectedPages.size} halaman menjadi PDF baru.`}
                      {operation === 'reorder' && 'Mengubah urutan halaman sesuai yang ditentukan.'}
                    </p>
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
