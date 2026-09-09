import { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';

export default function BarcodeGenerator({ onBack, darkMode, setDarkMode }: any) {
  const [text, setText] = useState('');
  const [barcodeType, setBarcodeType] = useState<'qrcode' | 'code128' | 'ean13'>('qrcode');
  const [size, setSize] = useState(200);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const bg = darkMode ? 'bg-[#0f1419]' : 'bg-[#f8f9fb]';
  const sidebarBg = darkMode ? 'bg-[#161b22]' : 'bg-white';
  const borderColor = darkMode ? 'border-[#21262d]' : 'border-[#e2e5e9]';
  const cardBg = darkMode ? 'bg-[#1c2128]' : 'bg-[#f3f4f6]';
  const textPrimary = darkMode ? 'text-[#e6edf3]' : 'text-[#1a1a2e]';
  const textSecondary = darkMode ? 'text-[#8b949e]' : 'text-[#57606a]';
  const inputBg = darkMode ? 'bg-[#0d1117] border-[#30363d]' : 'bg-white border-[#d0d7de]';
  const hoverBg = darkMode ? 'hover:bg-[#21262d]' : 'hover:bg-[#f0f1f3]';

  const generateQR = async () => {
    if (!text) return;
    
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      await QRCode.toCanvas(canvas, text, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });

      const dataUrl = canvas.toDataURL('image/png');
      setGeneratedImage(dataUrl);
    } catch (err) {
      console.error('Error generating QR code:', err);
    }
  };

  const generateBarcode = () => {
    if (!text) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = size * 2;
    canvas.height = size;

    // Simple Code 128 simulation
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#000000';
    const barWidth = canvas.width / (text.length * 11 + 35);
    const startX = 10;
    const startY = 10;
    const barHeight = canvas.height - 40;

    // Start pattern
    for (let i = 0; i < 11; i++) {
      if (i % 2 === 0) {
        ctx.fillRect(startX + i * barWidth, startY, barWidth, barHeight);
      }
    }

    // Data bars
    let x = startX + 11 * barWidth;
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      for (let bit = 0; bit < 8; bit++) {
        if ((charCode >> bit) & 1) {
          ctx.fillRect(x, startY, barWidth, barHeight);
        }
        x += barWidth;
      }
      // Gap
      x += barWidth * 3;
    }

    // Stop pattern
    for (let i = 0; i < 11; i++) {
      if (i % 2 === 0) {
        ctx.fillRect(x + i * barWidth, startY, barWidth, barHeight);
      }
    }

    // Text below
    ctx.fillStyle = '#000000';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(text, canvas.width / 2, canvas.height - 10);

    const dataUrl = canvas.toDataURL('image/png');
    setGeneratedImage(dataUrl);
  };

  const generate = () => {
    if (barcodeType === 'qrcode') {
      generateQR();
    } else {
      generateBarcode();
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;

    const a = document.createElement('a');
    a.href = generatedImage;
    a.download = `${barcodeType}_${text.substring(0, 20)}.png`;
    a.click();
  };

  useEffect(() => {
    if (text && barcodeType === 'qrcode') {
      generateQR();
    }
  }, [text, size]);

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${bg} ${textPrimary}`}>
      <header className={`flex items-center justify-between px-4 py-2.5 border-b shrink-0 ${sidebarBg} ${borderColor}`}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className={`w-7 h-7 rounded-lg flex items-center justify-center ${hoverBg}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight">Barcode & QR Generator</h1>
            <p className={`text-[10px] ${textSecondary}`}>Generate barcode & QR code</p>
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

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className={`w-80 flex flex-col border-r overflow-hidden shrink-0 ${sidebarBg} ${borderColor}`}>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Type Selection */}
            <div>
              <label className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} block mb-2`}>Barcode Type</label>
              <div className="space-y-1.5">
                {[
                  { key: 'qrcode', label: 'QR Code', desc: '2D barcode, high capacity' },
                  { key: 'code128', label: 'Code 128', desc: 'Linear barcode, alphanumeric' },
                ].map((type) => (
                  <button
                    key={type.key}
                    onClick={() => setBarcodeType(type.key as any)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      barcodeType === type.key
                        ? 'border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10'
                        : `${borderColor} ${hoverBg}`
                    }`}
                  >
                    <p className={`text-xs font-medium ${barcodeType === type.key ? 'text-indigo-600 dark:text-indigo-400' : textPrimary}`}>
                      {type.label}
                    </p>
                    <p className={`text-[10px] mt-0.5 ${textSecondary}`}>{type.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Text Input */}
            <div>
              <label className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} block mb-1`}>
                {barcodeType === 'qrcode' ? 'Text / URL' : 'Barcode Text'}
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary} resize-none`}
                placeholder={barcodeType === 'qrcode' ? 'https://example.com' : 'ABC123456'}
              />
            </div>

            {/* Size */}
            <div>
              <label className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} block mb-1`}>
                Size: {size}px
              </label>
              <input
                type="range"
                min={100}
                max={500}
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={generate}
              disabled={!text}
              className="w-full py-2.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generate
            </button>

            {/* Download Button */}
            {generatedImage && (
              <button
                onClick={downloadImage}
                className={`w-full py-2.5 rounded-lg text-xs font-medium border ${borderColor} ${hoverBg} ${textPrimary}`}
              >
                Download PNG
              </button>
            )}
          </div>
        </aside>

        {/* Preview */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-6 flex items-center justify-center">
            {!generatedImage ? (
              <div className="text-center">
                <div className={`w-20 h-20 mx-auto mb-4 rounded-3xl ${cardBg} flex items-center justify-center`}>
                  <svg className={`w-8 h-8 ${textSecondary} opacity-50`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold mb-1">Masukkan Text</h3>
                <p className={`text-sm max-w-xs ${textSecondary}`}>
                  Masukkan text atau URL untuk generate {barcodeType === 'qrcode' ? 'QR Code' : 'Barcode'}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className={`p-6 rounded-xl ${cardBg} shadow-lg`}>
                  {barcodeType === 'qrcode' ? (
                    <canvas ref={canvasRef} className="block" />
                  ) : (
                    <canvas ref={canvasRef} className="block" />
                  )}
                </div>
                <p className={`text-xs ${textSecondary}`}>
                  {barcodeType === 'qrcode' ? 'QR Code' : 'Barcode'}: {text}
                </p>
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
