import { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';

interface PdfPageOrganizerProps {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

export default function PdfPageOrganizer({ onBack, darkMode, setDarkMode }: PdfPageOrganizerProps) {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bg = darkMode ? 'bg-[#0f1419]' : 'bg-[#f8f9fb]';
  const sidebarBg = darkMode ? 'bg-[#161b22]' : 'bg-white';
  const borderColor = darkMode ? 'border-[#21262d]' : 'border-[#e2e5e9]';
  const cardBg = darkMode ? 'bg-[#1c2128]' : 'bg-[#f3f4f6]';
  const textPrimary = darkMode ? 'text-[#e6edf3]' : 'text-[#1a1a2e]';
  const textSecondary = darkMode ? 'text-[#8b949e]' : 'text-[#57606a]';
  const hoverBg = darkMode ? 'hover:bg-[#21262d]' : 'hover:bg-[#f0f1f3]';

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.type !== 'application/pdf') {
      setError('Hanya file PDF yang didukung');
      return;
    }
    
    setPdfFile(file);
    setError(null);
    setSuccessMsg(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const pageCount = pdf.getPageCount();
      setPageOrder(Array.from({ length: pageCount }, (_, i) => i + 1));
    } catch (err) {
      setError(`Gagal memuat PDF: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
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

  const removePage = (index: number) => {
    const newOrder = pageOrder.filter((_, i) => i !== index);
    setPageOrder(newOrder);
  };

  const duplicatePage = (index: number) => {
    const newOrder = [...pageOrder];
    newOrder.splice(index + 1, 0, pageOrder[index]);
    setPageOrder(newOrder);
  };

  const resetOrder = () => {
    if (pageOrder.length > 0) {
      const maxPage = Math.max(...pageOrder);
      setPageOrder(Array.from({ length: maxPage }, (_, i) => i + 1));
    }
  };

  const reverseOrder = () => {
    setPageOrder([...pageOrder].reverse());
  };

  const organizePages = async () => {
    if (!pdfFile || pageOrder.length === 0) return;
    
    setIsProcessing(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();
      
      const copiedPages = await newPdf.copyPages(pdf, pageOrder.map(p => p - 1));
      copiedPages.forEach(page => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${pdfFile.name.replace('.pdf', '')}_organized.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSuccessMsg(`Berhasil mengorganisasi ${pageOrder.length} halaman!`);
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      setError(`Gagal mengorganisasi halaman: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${bg} ${textPrimary}`}>
      <header className={`flex items-center justify-between px-4 py-2.5 border-b shrink-0 ${sidebarBg} ${borderColor}`}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className={`w-7 h-7 rounded-lg flex items-center justify-center ${hoverBg}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center shadow-sm">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight">PDF Page Organizer</h1>
            <p className={`text-[10px] ${textSecondary}`}>Atur urutan halaman PDF</p>
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
        <aside className={`w-80 flex flex-col border-r overflow-hidden shrink-0 ${sidebarBg} ${borderColor}`}>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                darkMode ? 'border-[#30363d] hover:border-amber-500/50' : 'border-[#d0d7de] hover:border-amber-500/50'
              }`}
            >
              <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707L14.293 4.293A1 1 0 0013.586 4H7a2 2 0 00-2 2v13a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-xs font-medium">{pdfFile ? pdfFile.name : 'Pilih file PDF'}</p>
              <p className={`text-[10px] mt-0.5 ${textSecondary}`}>Klik untuk upload</p>
            </div>
            <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={e => handleFileSelect(e.target.files)} />

            {pageOrder.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={resetOrder}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium border ${borderColor} ${hoverBg} ${textSecondary}`}
                >
                  Reset
                </button>
                <button
                  onClick={reverseOrder}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium border ${borderColor} ${hoverBg} ${textSecondary}`}
                >
                  Reverse
                </button>
              </div>
            )}
          </div>

          <div className={`p-3 border-t ${borderColor}`}>
            <button
              onClick={organizePages}
              disabled={!pdfFile || isProcessing || pageOrder.length === 0}
              className={`w-full py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                !pdfFile || isProcessing || pageOrder.length === 0
                  ? 'opacity-40 cursor-not-allowed bg-amber-500 text-white'
                  : 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm'
              }`}
            >
              {isProcessing ? (
                <><span className="pulse-dot">●</span> Processing...</>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Organize Pages
                </>
              )}
            </button>
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          {error && (
            <div className="mx-4 mt-4 p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="hover:text-red-300">✕</button>
            </div>
          )}

          {successMsg && (
            <div className="mx-4 mt-4 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-400 flex items-center justify-between">
              <span>{successMsg}</span>
              <button onClick={() => setSuccessMsg(null)} className="hover:text-emerald-300">✕</button>
            </div>
          )}

          <div className="flex-1 overflow-auto p-6">
            {pageOrder.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className={`w-20 h-20 mx-auto mb-4 rounded-3xl ${cardBg} flex items-center justify-center`}>
                    <svg className={`w-8 h-8 ${textSecondary} opacity-50`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-base font-semibold mb-1">Upload PDF</h3>
                  <p className={`text-sm max-w-xs ${textSecondary}`}>Pilih file PDF dari sidebar untuk mengatur halaman</p>
                </div>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto">
                <h3 className={`text-sm font-semibold mb-4 ${textPrimary}`}>
                  Urutan Halaman ({pageOrder.length} halaman)
                </h3>
                <div className="space-y-2">
                  {pageOrder.map((page, idx) => (
                    <div key={idx} className={`flex items-center gap-2 p-3 rounded-lg ${cardBg}`}>
                      <span className={`text-xs font-medium ${textPrimary} w-8`}>{idx + 1}.</span>
                      <span className={`text-xs ${textSecondary} flex-1`}>Page {page}</span>
                      <button
                        onClick={() => movePageUp(idx)}
                        disabled={idx === 0}
                        className={`w-6 h-6 rounded flex items-center justify-center ${idx === 0 ? 'opacity-30' : hoverBg}`}
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => movePageDown(idx)}
                        disabled={idx === pageOrder.length - 1}
                        className={`w-6 h-6 rounded flex items-center justify-center ${idx === pageOrder.length - 1 ? 'opacity-30' : hoverBg}`}
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => duplicatePage(idx)}
                        className={`w-6 h-6 rounded flex items-center justify-center ${hoverBg}`}
                        title="Duplicate"
                      >
                        📋
                      </button>
                      <button
                        onClick={() => removePage(idx)}
                        className="w-6 h-6 rounded flex items-center justify-center text-red-400 hover:bg-red-500/10"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

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
