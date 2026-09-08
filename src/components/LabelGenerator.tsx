import { useState, useCallback, useRef, useEffect } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

interface LabelData {
  id: string;
  recipientName: string;
  recipientAddress: string;
  recipientPhone: string;
  senderName: string;
  trackingNumber: string;
  weight: string;
  notes: string;
}

interface LabelGeneratorProps {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

type LabelSize = 'small' | 'medium' | 'large';

export default function LabelGenerator({ onBack, darkMode, setDarkMode }: LabelGeneratorProps) {
  const [labels, setLabels] = useState<LabelData[]>([{
    id: '1',
    recipientName: '',
    recipientAddress: '',
    recipientPhone: '',
    senderName: 'PERADA GROUP',
    trackingNumber: '',
    weight: '',
    notes: '',
  }]);
  const [labelSize, setLabelSize] = useState<LabelSize>('medium');
  const [includeQR, setIncludeQR] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [activeLabel, setActiveLabel] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const bg = darkMode ? 'bg-[#0f1419]' : 'bg-[#f8f9fb]';
  const sidebarBg = darkMode ? 'bg-[#161b22]' : 'bg-white';
  const borderColor = darkMode ? 'border-[#21262d]' : 'border-[#e2e5e9]';
  const cardBg = darkMode ? 'bg-[#1c2128]' : 'bg-[#f3f4f6]';
  const textPrimary = darkMode ? 'text-[#e6edf3]' : 'text-[#1a1a2e]';
  const textSecondary = darkMode ? 'text-[#8b949e]' : 'text-[#57606a]';
  const inputBg = darkMode ? 'bg-[#0d1117] border-[#30363d]' : 'bg-white border-[#d0d7de]';
  const hoverBg = darkMode ? 'hover:bg-[#21262d]' : 'hover:bg-[#f0f1f3]';

  const labelDimensions: Record<LabelSize, { width: number; height: number }> = {
    small: { width: 283, height: 425 }, // 100mm x 150mm
    medium: { width: 425, height: 567 }, // 150mm x 200mm
    large: { width: 567, height: 709 }, // 200mm x 250mm
  };

  const updateLabel = useCallback((field: keyof LabelData, value: string) => {
    setLabels(prev => prev.map((l, i) => i === activeLabel ? { ...l, [field]: value } : l));
  }, [activeLabel]);

  const addLabel = useCallback(() => {
    setLabels(prev => [...prev, {
      id: String(Date.now()),
      recipientName: '',
      recipientAddress: '',
      recipientPhone: '',
      senderName: 'PERADA GROUP',
      trackingNumber: '',
      weight: '',
      notes: '',
    }]);
    setActiveLabel(labels.length);
  }, [labels.length]);

  const removeLabel = useCallback((idx: number) => {
    setLabels(prev => prev.filter((_, i) => i !== idx));
    if (activeLabel >= labels.length - 1) setActiveLabel(Math.max(0, labels.length - 2));
  }, [labels.length, activeLabel]);

  // Generate a simple barcode-like pattern (Code 128 simplified visual)
  const drawBarcode = useCallback((ctx: CanvasRenderingContext2D, text: string, x: number, y: number, width: number, height: number) => {
    ctx.fillStyle = '#000000';
    const chars = text.split('');
    const barWidth = width / (chars.length * 11);
    
    chars.forEach((char, i) => {
      const code = char.charCodeAt(0);
      for (let bit = 0; bit < 8; bit++) {
        if ((code >> bit) & 1) {
          ctx.fillRect(x + (i * 11 + bit) * barWidth, y, barWidth, height);
        }
      }
    });
  }, []);

  // Draw QR-like pattern (simplified visual representation)
  const drawQRCode = useCallback((ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number) => {
    ctx.fillStyle = '#000000';
    const cellSize = size / 21;
    
    // Simple hash-based pattern generation
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
    }
    
    // Draw finder patterns (corners)
    const drawFinder = (fx: number, fy: number) => {
      ctx.fillRect(fx, fy, cellSize * 7, cellSize * 7);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(fx + cellSize, fy + cellSize, cellSize * 5, cellSize * 5);
      ctx.fillStyle = '#000000';
      ctx.fillRect(fx + cellSize * 2, fy + cellSize * 2, cellSize * 3, cellSize * 3);
    };
    
    drawFinder(x, y);
    drawFinder(x + cellSize * 14, y);
    drawFinder(x, y + cellSize * 14);
    
    // Fill data area with pseudo-random pattern based on hash
    for (let row = 8; row < 20; row++) {
      for (let col = 8; col < 20; col++) {
        const seed = (hash + row * 31 + col * 17) & 0xFF;
        if (seed % 3 === 0) {
          ctx.fillRect(x + col * cellSize, y + row * cellSize, cellSize, cellSize);
        }
      }
    }
  }, []);

  const drawLabelPreview = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const label = labels[activeLabel];
    if (!label) return;
    
    const dims = labelDimensions[labelSize];
    const scale = 0.5;
    canvas.width = dims.width * scale;
    canvas.height = dims.height * scale;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Border
    ctx.strokeStyle = '#0A2540';
    ctx.lineWidth = 2;
    ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);
    
    // Header
    ctx.fillStyle = '#0A2540';
    ctx.fillRect(4, 4, canvas.width - 8, 30 * scale);
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${12 * scale}px sans-serif`;
    ctx.fillText(label.senderName || 'PERADA GROUP', 12 * scale, 22 * scale);
    
    // Tracking number
    if (label.trackingNumber) {
      ctx.fillStyle = '#0A2540';
      ctx.font = `bold ${10 * scale}px monospace`;
      ctx.fillText(label.trackingNumber, 12 * scale, 50 * scale);
      
      // Barcode
      drawBarcode(ctx, label.trackingNumber, 12 * scale, 55 * scale, (canvas.width - 24 * scale), 25 * scale);
    }
    
    // Recipient section
    let yPos = label.trackingNumber ? 90 * scale : 50 * scale;
    ctx.fillStyle = '#0A2540';
    ctx.font = `bold ${9 * scale}px sans-serif`;
    ctx.fillText('TUJUAN:', 12 * scale, yPos);
    yPos += 14 * scale;
    
    ctx.fillStyle = '#000000';
    ctx.font = `bold ${11 * scale}px sans-serif`;
    if (label.recipientName) {
      ctx.fillText(label.recipientName, 12 * scale, yPos);
      yPos += 14 * scale;
    }
    
    ctx.font = `${9 * scale}px sans-serif`;
    if (label.recipientAddress) {
      const lines = wrapText(ctx, label.recipientAddress, canvas.width - 24 * scale);
      lines.forEach(line => {
        ctx.fillText(line, 12 * scale, yPos);
        yPos += 12 * scale;
      });
    }
    
    if (label.recipientPhone) {
      yPos += 4 * scale;
      ctx.fillText(`Telp: ${label.recipientPhone}`, 12 * scale, yPos);
      yPos += 14 * scale;
    }
    
    // Weight & Notes
    if (label.weight || label.notes) {
      yPos += 8 * scale;
      ctx.fillStyle = '#666666';
      ctx.font = `${8 * scale}px sans-serif`;
      if (label.weight) ctx.fillText(`Berat: ${label.weight}`, 12 * scale, yPos);
      yPos += 12 * scale;
      if (label.notes) {
        const noteLines = wrapText(ctx, `Catatan: ${label.notes}`, canvas.width - 24 * scale);
        noteLines.forEach(line => {
          ctx.fillText(line, 12 * scale, yPos);
          yPos += 10 * scale;
        });
      }
    }
    
    // QR Code
    if (includeQR && label.trackingNumber) {
      const qrSize = 60 * scale;
      drawQRCode(ctx, label.trackingNumber, canvas.width - qrSize - 12 * scale, canvas.height - qrSize - 12 * scale, qrSize);
    }
    
    // Footer
    ctx.fillStyle = '#999999';
    ctx.font = `${6 * scale}px sans-serif`;
    ctx.fillText('PERADA GROUP • perada.net', 12 * scale, canvas.height - 8 * scale);
  }, [labels, activeLabel, labelSize, includeQR, drawBarcode, drawQRCode, labelDimensions]);

  function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    words.forEach(word => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (ctx.measureText(testLine).width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    if (currentLine) lines.push(currentLine);
    return lines;
  }

  const handleGenerate = useCallback(async () => {
    const validLabels = labels.filter(l => l.recipientName || l.trackingNumber);
    if (validLabels.length === 0) {
      setError('Isi minimal nama penerima atau nomor resi');
      return;
    }
    
    setIsGenerating(true);
    setError(null);

    try {
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      for (const label of validLabels) {
        const dims = labelDimensions[labelSize];
        const page = pdfDoc.addPage([dims.width, dims.height]);
        
        // Border
        page.drawRectangle({
          x: 10, y: 10,
          width: dims.width - 20, height: dims.height - 20,
          borderColor: rgb(0.04, 0.15, 0.25),
          borderWidth: 2,
        });
        
        // Header
        page.drawRectangle({
          x: 10, y: dims.height - 50,
          width: dims.width - 20, height: 40,
          color: rgb(0.04, 0.15, 0.25),
        });
        page.drawText(label.senderName || 'PERADA GROUP', {
          x: 20, y: dims.height - 35,
          size: 14, font: boldFont, color: rgb(1, 1, 1),
        });
        
        let yPos = dims.height - 70;
        
        // Tracking
        if (label.trackingNumber) {
          page.drawText(label.trackingNumber, {
            x: 20, y: yPos, size: 12, font: boldFont, color: rgb(0.04, 0.15, 0.25),
          });
          yPos -= 30;
          
          // Simple barcode representation
          const chars = label.trackingNumber.split('');
          const barWidth = (dims.width - 40) / (chars.length * 11);
          chars.forEach((char, i) => {
            const code = char.charCodeAt(0);
            for (let bit = 0; bit < 8; bit++) {
              if ((code >> bit) & 1) {
                page.drawRectangle({
                  x: 20 + (i * 11 + bit) * barWidth,
                  y: yPos,
                  width: barWidth,
                  height: 20,
                  color: rgb(0, 0, 0),
                });
              }
            }
          });
          yPos -= 30;
        }
        
        // Recipient
        page.drawText('TUJUAN:', {
          x: 20, y: yPos, size: 10, font: boldFont, color: rgb(0.04, 0.15, 0.25),
        });
        yPos -= 16;
        
        if (label.recipientName) {
          page.drawText(label.recipientName, {
            x: 20, y: yPos, size: 13, font: boldFont, color: rgb(0, 0, 0),
          });
          yPos -= 18;
        }
        
        if (label.recipientAddress) {
          const lines = label.recipientAddress.split('\n');
          lines.forEach(line => {
            page.drawText(line, {
              x: 20, y: yPos, size: 10, font, color: rgb(0, 0, 0),
            });
            yPos -= 14;
          });
        }
        
        if (label.recipientPhone) {
          yPos -= 6;
          page.drawText(`Telp: ${label.recipientPhone}`, {
            x: 20, y: yPos, size: 10, font, color: rgb(0.3, 0.3, 0.3),
          });
          yPos -= 16;
        }
        
        // Weight & Notes
        if (label.weight) {
          yPos -= 8;
          page.drawText(`Berat: ${label.weight}`, {
            x: 20, y: yPos, size: 9, font, color: rgb(0.4, 0.4, 0.4),
          });
          yPos -= 14;
        }
        
        if (label.notes) {
          page.drawText(`Catatan: ${label.notes}`, {
            x: 20, y: yPos, size: 9, font, color: rgb(0.4, 0.4, 0.4),
          });
        }
        
        // Footer
        page.drawText('PERADA GROUP • perada.net', {
          x: 20, y: 18, size: 7, font, color: rgb(0.6, 0.6, 0.6),
        });
      }
      
      const bytes = await pdfDoc.save();
      const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `label_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setSuccessMsg(`${validLabels.length} label berhasil di-generate!`);
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      setError(`Gagal: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  }, [labels, labelSize, labelDimensions]);

  // Update preview when data changes
  useEffect(() => {
    drawLabelPreview();
  }, [drawLabelPreview]);

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${bg} ${textPrimary}`}>
      {/* Header */}
      <header className={`flex items-center justify-between px-4 py-2.5 border-b shrink-0 ${sidebarBg} ${borderColor}`}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${hoverBg}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight">Label Generator</h1>
            <p className={`text-[10px] ${textSecondary}`}>Generate label pengiriman</p>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 font-medium">
            {labels.length} label
          </span>
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
            {/* Label Tabs */}
            <div className="flex items-center justify-between">
              <div className="flex gap-1 overflow-x-auto">
                {labels.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveLabel(idx)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-medium whitespace-nowrap transition-all ${
                      activeLabel === idx
                        ? 'bg-orange-500 text-white'
                        : `${cardBg} ${textSecondary} ${hoverBg}`
                    }`}
                  >
                    Label {idx + 1}
                  </button>
                ))}
              </div>
              <button onClick={addLabel} className="w-6 h-6 rounded-lg bg-orange-500 text-white flex items-center justify-center text-xs hover:bg-orange-600">+</button>
            </div>

            {/* Form */}
            <div className="space-y-3">
              <div>
                <label className={`text-[10px] ${textSecondary} block mb-1`}>No. Resi / Tracking *</label>
                <input type="text" value={labels[activeLabel]?.trackingNumber || ''}
                  onChange={e => updateLabel('trackingNumber', e.target.value)}
                  placeholder="TRX-2026-0001"
                  className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-orange-500/30`}
                />
              </div>

              <div>
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Nama Penerima *</label>
                <input type="text" value={labels[activeLabel]?.recipientName || ''}
                  onChange={e => updateLabel('recipientName', e.target.value)}
                  placeholder="Nama lengkap penerima"
                  className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-orange-500/30`}
                />
              </div>

              <div>
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Alamat</label>
                <textarea value={labels[activeLabel]?.recipientAddress || ''}
                  onChange={e => updateLabel('recipientAddress', e.target.value)}
                  placeholder="Alamat lengkap"
                  rows={2}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-sm border resize-none ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-orange-500/30`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className={`text-[10px] ${textSecondary} block mb-1`}>No. Telepon</label>
                  <input type="text" value={labels[activeLabel]?.recipientPhone || ''}
                    onChange={e => updateLabel('recipientPhone', e.target.value)}
                    placeholder="0812..."
                    className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-orange-500/30`}
                  />
                </div>
                <div>
                  <label className={`text-[10px] ${textSecondary} block mb-1`}>Berat</label>
                  <input type="text" value={labels[activeLabel]?.weight || ''}
                    onChange={e => updateLabel('weight', e.target.value)}
                    placeholder="5 kg"
                    className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-orange-500/30`}
                  />
                </div>
              </div>

              <div>
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Nama Pengirim</label>
                <input type="text" value={labels[activeLabel]?.senderName || ''}
                  onChange={e => updateLabel('senderName', e.target.value)}
                  placeholder="PERADA GROUP"
                  className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-orange-500/30`}
                />
              </div>

              <div>
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Catatan</label>
                <input type="text" value={labels[activeLabel]?.notes || ''}
                  onChange={e => updateLabel('notes', e.target.value)}
                  placeholder="Fragile, jangan ditumpuk"
                  className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-orange-500/30`}
                />
              </div>
            </div>

            {/* Options */}
            <div>
              <h3 className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} mb-2`}>Ukuran Label</h3>
              <div className="grid grid-cols-3 gap-1.5">
                {(['small', 'medium', 'large'] as LabelSize[]).map(size => (
                  <button
                    key={size}
                    onClick={() => setLabelSize(size)}
                    className={`px-2 py-2 rounded-lg text-center border transition-all ${
                      labelSize === size
                        ? 'border-orange-500 bg-orange-500/5 dark:bg-orange-500/10'
                        : `${borderColor} ${hoverBg}`
                    }`}
                  >
                    <p className={`text-[10px] font-semibold ${labelSize === size ? 'text-orange-600 dark:text-orange-400' : textPrimary}`}>
                      {size === 'small' ? '10×15cm' : size === 'medium' ? '15×20cm' : '20×25cm'}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className={`text-xs ${textSecondary}`}>Include QR Code</span>
              <button
                onClick={() => setIncludeQR(!includeQR)}
                className={`w-10 h-5 rounded-full transition-colors relative ${includeQR ? 'bg-orange-500' : darkMode ? 'bg-[#30363d]' : 'bg-[#d0d7de]'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${includeQR ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>

            {labels.length > 1 && (
              <button onClick={() => removeLabel(activeLabel)} className="w-full py-1.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors">
                Hapus Label Ini
              </button>
            )}
          </div>

          {/* Generate Button */}
          <div className={`p-3 border-t ${borderColor}`}>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`w-full py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                isGenerating
                  ? 'opacity-40 cursor-not-allowed bg-orange-500 text-white'
                  : 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm'
              }`}
            >
              {isGenerating ? (
                <><span className="pulse-dot">●</span> Generating...</>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Generate PDF ({labels.length} label)
                </>
              )}
            </button>
          </div>
        </aside>

        {/* Main - Preview */}
        <main className="flex-1 flex flex-col overflow-hidden">
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

          {/* Preview */}
          <div className="flex-1 overflow-auto p-6 flex items-center justify-center">
            <div className="text-center">
              <p className={`text-[10px] uppercase tracking-wider ${textSecondary} mb-3 font-medium`}>Preview Label</p>
              <div className="inline-block shadow-2xl rounded-sm overflow-hidden">
                <canvas ref={canvasRef} className="block" />
              </div>
              <p className={`text-[10px] ${textSecondary} mt-3`}>
                Ukuran: {labelSize === 'small' ? '100×150mm' : labelSize === 'medium' ? '150×200mm' : '200×250mm'}
              </p>
            </div>
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
