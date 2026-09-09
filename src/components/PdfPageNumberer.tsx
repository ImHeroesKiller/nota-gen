import { useState, useRef } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

interface PdfPageNumbererProps {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

export default function PdfPageNumberer({ onBack, darkMode, setDarkMode }: PdfPageNumbererProps) {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [position, setPosition] = useState<'bottom-center' | 'bottom-right' | 'top-center' | 'top-right'>('bottom-center');
  const [startNumber, setStartNumber] = useState(1);
  const [fontSize, setFontSize] = useState(10);
  const [format, setFormat] = useState<'number' | 'page-x-of-y' | 'roman'>('number');
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
  const inputBg = darkMode ? 'bg-[#0d1117] border-[#30363d]' : 'bg-white border-[#d0d7de]';
  const hoverBg = darkMode ? 'hover:bg-[#21262d]' : 'hover:bg-[#f0f1f3]';

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.type !== 'application/pdf') {
      setError('Hanya file PDF yang didukung');
      return;
    }
    setPdfFile(file);
    setError(null);
    setSuccessMsg(null);
  };

  const toRoman = (num: number): string => {
    const roman: Record<string, number> = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };
    let str = '';
    for (const i of Object.keys(roman)) {
      while (num >= roman[i]) {
        str += i;
        num -= roman[i];
      }
    }
    return str;
  };

  const addPageNumbers = async () => {
    if (!pdfFile) return;
    
    setIsProcessing(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      const pages = pdf.getPages();
      const totalPages = pages.length;

      pages.forEach((page, index) => {
        const { width, height } = page.getSize();
        const pageNum = startNumber + index;
        
        let text = '';
        if (format === 'number') {
          text = pageNum.toString();
        } else if (format === 'page-x-of-y') {
          text = `Page ${pageNum} of ${totalPages + startNumber - 1}`;
        } else if (format === 'roman') {
          text = toRoman(pageNum);
        }

        const textWidth = font.widthOfTextAtSize(text, fontSize);
        let x = 0;
        let y = 0;

        if (position === 'bottom-center') {
          x = (width - textWidth) / 2;
          y = 20;
        } else if (position === 'bottom-right') {
          x = width - textWidth - 20;
          y = 20;
        } else if (position === 'top-center') {
          x = (width - textWidth) / 2;
          y = height - 30;
        } else if (position === 'top-right') {
          x = width - textWidth - 20;
          y = height - 30;
        }

        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        });
      });

      const pdfBytes = await pdf.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${pdfFile.name.replace('.pdf', '')}_numbered.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSuccessMsg(`Berhasil menambahkan nomor halaman ke ${totalPages} halaman!`);
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      setError(`Gagal menambahkan nomor halaman: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center shadow-sm">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight">PDF Page Numberer</h1>
            <p className={`text-[10px] ${textSecondary}`}>Tambahkan nomor halaman</p>
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
                darkMode ? 'border-[#30363d] hover:border-teal-500/50' : 'border-[#d0d7de] hover:border-teal-500/50'
              }`}
            >
              <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-teal-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707L14.293 4.293A1 1 0 0013.586 4H7a2 2 0 00-2 2v13a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-xs font-medium">{pdfFile ? pdfFile.name : 'Pilih file PDF'}</p>
              <p className={`text-[10px] mt-0.5 ${textSecondary}`}>Klik untuk upload</p>
            </div>
            <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={e => handleFileSelect(e.target.files)} />

            <div>
              <label className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} block mb-2`}>Position</label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['bottom-center', 'bottom-right', 'top-center', 'top-right'] as const).map(pos => (
                  <button
                    key={pos}
                    onClick={() => setPosition(pos)}
                    className={`px-2 py-1.5 rounded-lg text-[10px] font-medium border transition-all ${
                      position === pos
                        ? 'border-teal-500 bg-teal-500/5 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400'
                        : `${borderColor} ${hoverBg} ${textSecondary}`
                    }`}
                  >
                    {pos.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} block mb-2`}>Format</label>
              <div className="space-y-1.5">
                {([
                  { key: 'number', label: '1, 2, 3...' },
                  { key: 'page-x-of-y', label: 'Page X of Y' },
                  { key: 'roman', label: 'I, II, III...' },
                ] as const).map(fmt => (
                  <button
                    key={fmt.key}
                    onClick={() => setFormat(fmt.key)}
                    className={`w-full text-left p-2 rounded-lg border transition-all ${
                      format === fmt.key
                        ? 'border-teal-500 bg-teal-500/5 dark:bg-teal-500/10'
                        : `${borderColor} ${hoverBg}`
                    }`}
                  >
                    <p className={`text-xs font-medium ${format === fmt.key ? 'text-teal-600 dark:text-teal-400' : textPrimary}`}>
                      {fmt.label}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} block mb-1`}>Start Number</label>
              <input
                type="number"
                min={1}
                value={startNumber}
                onChange={e => setStartNumber(Number(e.target.value))}
                className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`}
              />
            </div>

            <div>
              <label className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} block mb-1`}>
                Font Size: {fontSize}px
              </label>
              <input
                type="range"
                min={8}
                max={20}
                value={fontSize}
                onChange={e => setFontSize(Number(e.target.value))}
                className="w-full accent-teal-500"
              />
            </div>
          </div>

          <div className={`p-3 border-t ${borderColor}`}>
            <button
              onClick={addPageNumbers}
              disabled={!pdfFile || isProcessing}
              className={`w-full py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                !pdfFile || isProcessing
                  ? 'opacity-40 cursor-not-allowed bg-teal-500 text-white'
                  : 'bg-teal-500 hover:bg-teal-600 text-white shadow-sm'
              }`}
            >
              {isProcessing ? (
                <><span className="pulse-dot">●</span> Processing...</>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Add Page Numbers
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

          <div className="flex-1 overflow-auto p-6 flex items-center justify-center">
            {!pdfFile ? (
              <div className="text-center">
                <div className={`w-20 h-20 mx-auto mb-4 rounded-3xl ${cardBg} flex items-center justify-center`}>
                  <svg className={`w-8 h-8 ${textSecondary} opacity-50`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold mb-1">Upload PDF</h3>
                <p className={`text-sm max-w-xs ${textSecondary}`}>Pilih file PDF dari sidebar untuk menambahkan nomor halaman</p>
              </div>
            ) : (
              <div className="w-full max-w-2xl">
                <div className={`rounded-2xl border p-6 ${darkMode ? 'border-[#30363d]' : 'border-[#e2e5e9]'}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
                      <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707L14.293 4.293A1 1 0 0013.586 4H7a2 2 0 00-2 2v13a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{pdfFile.name}</p>
                      <p className={`text-xs ${textSecondary}`}>{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <div className={`p-4 rounded-xl ${cardBg}`}>
                    <h4 className={`text-xs font-semibold mb-2 ${textPrimary}`}>Konfigurasi</h4>
                    <p className={`text-xs ${textSecondary}`}>Posisi: {position.replace('-', ' ')}</p>
                    <p className={`text-xs ${textSecondary}`}>Format: {format}</p>
                    <p className={`text-xs ${textSecondary}`}>Mulai dari: {startNumber}</p>
                    <p className={`text-xs ${textSecondary}`}>Font size: {fontSize}px</p>
                  </div>
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
