import { useState, useRef } from 'react';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';

interface PdfWatermarkProps {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

export default function PdfWatermark({ onBack, darkMode, setDarkMode }: PdfWatermarkProps) {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [fontSize, setFontSize] = useState(50);
  const [opacity, setOpacity] = useState(0.3);
  const [rotation, setRotation] = useState(45);
  const [color, setColor] = useState('#999999');
  const [position, setPosition] = useState<'center' | 'top' | 'bottom'>('center');
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

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255
    } : { r: 0.6, g: 0.6, b: 0.6 };
  };

  const addWatermark = async () => {
    if (!pdfFile) return;
    
    setIsProcessing(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const font = await pdf.embedFont(StandardFonts.HelveticaBold);
      const pages = pdf.getPages();
      const rgbColor = hexToRgb(color);

      pages.forEach(page => {
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
        
        let x = (width - textWidth) / 2;
        let y = height / 2;

        if (position === 'top') {
          y = height - fontSize - 50;
        } else if (position === 'bottom') {
          y = 50;
        }

        page.drawText(watermarkText, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(rgbColor.r, rgbColor.g, rgbColor.b),
          opacity,
          rotate: degrees(rotation),
        });
      });

      const pdfBytes = await pdf.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${pdfFile.name.replace('.pdf', '')}_watermarked.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSuccessMsg('Watermark berhasil ditambahkan!');
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      setError(`Gagal menambahkan watermark: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center shadow-sm">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight">PDF Watermark</h1>
            <p className={`text-[10px] ${textSecondary}`}>Tambahkan watermark ke PDF</p>
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
                darkMode ? 'border-[#30363d] hover:border-violet-500/50' : 'border-[#d0d7de] hover:border-violet-500/50'
              }`}
            >
              <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707L14.293 4.293A1 1 0 0013.586 4H7a2 2 0 00-2 2v13a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-xs font-medium">{pdfFile ? pdfFile.name : 'Pilih file PDF'}</p>
              <p className={`text-[10px] mt-0.5 ${textSecondary}`}>Klik untuk upload</p>
            </div>
            <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={e => handleFileSelect(e.target.files)} />

            <div>
              <label className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} block mb-1`}>Watermark Text</label>
              <input
                type="text"
                value={watermarkText}
                onChange={e => setWatermarkText(e.target.value)}
                className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`}
                placeholder="CONFIDENTIAL"
              />
            </div>

            <div>
              <label className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} block mb-1`}>
                Font Size: {fontSize}px
              </label>
              <input
                type="range"
                min={10}
                max={100}
                value={fontSize}
                onChange={e => setFontSize(Number(e.target.value))}
                className="w-full accent-violet-500"
              />
            </div>

            <div>
              <label className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} block mb-1`}>
                Opacity: {Math.round(opacity * 100)}%
              </label>
              <input
                type="range"
                min={0.1}
                max={1}
                step={0.1}
                value={opacity}
                onChange={e => setOpacity(Number(e.target.value))}
                className="w-full accent-violet-500"
              />
            </div>

            <div>
              <label className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} block mb-1`}>
                Rotation: {rotation}°
              </label>
              <input
                type="range"
                min={-90}
                max={90}
                value={rotation}
                onChange={e => setRotation(Number(e.target.value))}
                className="w-full accent-violet-500"
              />
            </div>

            <div>
              <label className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} block mb-1`}>Color</label>
              <input
                type="color"
                value={color}
                onChange={e => setColor(e.target.value)}
                className="w-full h-10 rounded-lg border border-[#30363d] cursor-pointer"
              />
            </div>

            <div>
              <label className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} block mb-2`}>Position</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['top', 'center', 'bottom'] as const).map(pos => (
                  <button
                    key={pos}
                    onClick={() => setPosition(pos)}
                    className={`px-2 py-1.5 rounded-lg text-[10px] font-medium border transition-all capitalize ${
                      position === pos
                        ? 'border-violet-500 bg-violet-500/5 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400'
                        : `${borderColor} ${hoverBg} ${textSecondary}`
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={`p-3 border-t ${borderColor}`}>
            <button
              onClick={addWatermark}
              disabled={!pdfFile || isProcessing}
              className={`w-full py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                !pdfFile || isProcessing
                  ? 'opacity-40 cursor-not-allowed bg-violet-500 text-white'
                  : 'bg-violet-500 hover:bg-violet-600 text-white shadow-sm'
              }`}
            >
              {isProcessing ? (
                <><span className="pulse-dot">●</span> Processing...</>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Add Watermark
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold mb-1">Upload PDF</h3>
                <p className={`text-sm max-w-xs ${textSecondary}`}>Pilih file PDF dari sidebar untuk menambahkan watermark</p>
              </div>
            ) : (
              <div className="w-full max-w-2xl">
                <div className={`rounded-2xl border p-6 ${darkMode ? 'border-[#30363d]' : 'border-[#e2e5e9]'}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                      <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707L14.293 4.293A1 1 0 0013.586 4H7a2 2 0 00-2 2v13a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{pdfFile.name}</p>
                      <p className={`text-xs ${textSecondary}`}>{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <div className={`p-4 rounded-xl ${cardBg}`}>
                    <h4 className={`text-xs font-semibold mb-2 ${textPrimary}`}>Watermark Preview</h4>
                    <div className="relative bg-white rounded-lg p-8 h-64 flex items-center justify-center overflow-hidden">
                      <div
                        className="absolute font-bold pointer-events-none"
                        style={{
                          color: color,
                          opacity: opacity,
                          fontSize: `${fontSize / 2}px`,
                          transform: `rotate(${rotation}deg)`,
                        }}
                      >
                        {watermarkText}
                      </div>
                    </div>
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
