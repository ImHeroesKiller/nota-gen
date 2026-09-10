import { useState, useCallback, useRef, useEffect } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

interface LabelData {
  id: string;
  recipientName: string;
  recipientAddress: string;
  recipientPhone: string;
  senderName: string;
  senderAddress: string;
  senderPhone: string;
  trackingNumber: string;
  weight: string;
  notes: string;
}

interface FontSettings {
  headerSize: number;
  trackingSize: number;
  nameSize: number;
  addressSize: number;
  phoneSize: number;
}

interface LabelGeneratorProps {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

type LabelSizePreset = '100x150' | '100x100' | '78x100' | '100x120' | '50x30' | 'custom';

export default function LabelGenerator({ onBack, darkMode, setDarkMode }: LabelGeneratorProps) {
  const [labels, setLabels] = useState<LabelData[]>([{
    id: '1',
    recipientName: '',
    recipientAddress: '',
    recipientPhone: '',
    senderName: 'PERADA GROUP',
    senderAddress: 'Plaza Summarecon Bekasi Lt. 7, Jl. Boulevard Ahmad Yani, Bekasi 17145',
    senderPhone: '021-12345678',
    trackingNumber: '',
    weight: '',
    notes: '',
  }]);
  const [labelSize, setLabelSize] = useState<LabelSizePreset>('100x150');
  const [customWidth, setCustomWidth] = useState(100);
  const [customHeight, setCustomHeight] = useState(150);
  const [includeQR, setIncludeQR] = useState(true);
  const [fontSettings, setFontSettings] = useState<FontSettings>({
    headerSize: 12,
    trackingSize: 11,
    nameSize: 12,
    addressSize: 9,
    phoneSize: 9,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [activeLabel, setActiveLabel] = useState(0);
  const [sidebarTab, setSidebarTab] = useState<'data' | 'size' | 'font'>('data');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const bg = darkMode ? 'bg-[#0f1419]' : 'bg-[#f8f9fb]';
  const sidebarBg = darkMode ? 'bg-[#161b22]' : 'bg-white';
  const borderColor = darkMode ? 'border-[#21262d]' : 'border-[#e2e5e9]';
  const cardBg = darkMode ? 'bg-[#1c2128]' : 'bg-[#f3f4f6]';
  const textPrimary = darkMode ? 'text-[#e6edf3]' : 'text-[#1a1a2e]';
  const textSecondary = darkMode ? 'text-[#8b949e]' : 'text-[#57606a]';
  const inputBg = darkMode ? 'bg-[#0d1117] border-[#30363d]' : 'bg-white border-[#d0d7de]';
  const hoverBg = darkMode ? 'hover:bg-[#21262d]' : 'hover:bg-[#f0f1f3]';

  const MM = 2.83465;
  const getLabelDimensions = useCallback(() => {
    switch (labelSize) {
      case '100x150': return { widthMM: 150, heightMM: 100, width: 150 * MM, height: 100 * MM };
      case '100x100': return { widthMM: 100, heightMM: 100, width: 100 * MM, height: 100 * MM };
      case '78x100': return { widthMM: 100, heightMM: 78, width: 100 * MM, height: 78 * MM };
      case '100x120': return { widthMM: 120, heightMM: 100, width: 120 * MM, height: 100 * MM };
      case '50x30': return { widthMM: 50, heightMM: 30, width: 50 * MM, height: 30 * MM };
      case 'custom': return { widthMM: customWidth, heightMM: customHeight, width: customWidth * MM, height: customHeight * MM };
    }
  }, [labelSize, customWidth, customHeight]);

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
      senderAddress: 'Plaza Summarecon Bekasi Lt. 7, Jl. Boulevard Ahmad Yani, Bekasi 17145',
      senderPhone: '021-12345678',
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

  const drawQRCode = useCallback((ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number) => {
    ctx.fillStyle = '#000000';
    const cellSize = size / 21;
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
    }
    const drawFinder = (fx: number, fy: number) => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(fx, fy, cellSize * 7, cellSize * 7);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(fx + cellSize, fy + cellSize, cellSize * 5, cellSize * 5);
      ctx.fillStyle = '#000000';
      ctx.fillRect(fx + cellSize * 2, fy + cellSize * 2, cellSize * 3, cellSize * 3);
    };
    drawFinder(x, y);
    drawFinder(x + cellSize * 14, y);
    drawFinder(x, y + cellSize * 14);
    for (let row = 8; row < 20; row++) {
      for (let col = 8; col < 20; col++) {
        const seed = (hash + row * 31 + col * 17) & 0xFF;
        if (seed % 3 === 0) {
          ctx.fillRect(x + col * cellSize, y + row * cellSize, cellSize, cellSize);
        }
      }
    }
  }, []);

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (ctx.measureText(testLine).width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  };

  const drawLabelPreview = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const label = labels[activeLabel];
    if (!label) return;

    const dims = getLabelDimensions();
    const maxW = 400;
    const scale = Math.min(maxW / dims.width, 1);
    canvas.width = dims.width * scale;
    canvas.height = dims.height * scale;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#0A2540';
    ctx.lineWidth = 2;
    ctx.strokeRect(3, 3, canvas.width - 6, canvas.height - 6);

    const headerH = 22 * scale;
    ctx.fillStyle = '#0A2540';
    ctx.fillRect(3, 3, canvas.width - 6, headerH);
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${fontSettings.headerSize * scale}px sans-serif`;
    ctx.fillText(label.senderName || 'PERADA GROUP', 10 * scale, 3 + headerH * 0.65);

    let yPos = headerH + 12 * scale;

    if (label.trackingNumber) {
      ctx.fillStyle = '#0A2540';
      ctx.font = `bold ${fontSettings.trackingSize * scale}px monospace`;
      ctx.fillText(label.trackingNumber, 10 * scale, yPos);
      yPos += 10 * scale;
      drawBarcode(ctx, label.trackingNumber, 10 * scale, yPos, canvas.width - 20 * scale, 20 * scale);
      yPos += 26 * scale;
    }

    ctx.fillStyle = '#0A2540';
    ctx.font = `bold ${7 * scale}px sans-serif`;
    ctx.fillText('TUJUAN:', 10 * scale, yPos);
    yPos += 10 * scale;

    ctx.fillStyle = '#000000';
    ctx.font = `bold ${fontSettings.nameSize * scale}px sans-serif`;
    if (label.recipientName) {
      ctx.fillText(label.recipientName, 10 * scale, yPos);
      yPos += 12 * scale;
    }

    ctx.font = `${fontSettings.addressSize * scale}px sans-serif`;
    if (label.recipientAddress) {
      const lines = wrapText(ctx, label.recipientAddress, canvas.width - 20 * scale);
      lines.slice(0, 3).forEach(line => {
        ctx.fillText(line, 10 * scale, yPos);
        yPos += 10 * scale;
      });
    }

    if (label.recipientPhone) {
      yPos += 2 * scale;
      ctx.font = `${fontSettings.phoneSize * scale}px sans-serif`;
      ctx.fillText(`Telp: ${label.recipientPhone}`, 10 * scale, yPos);
      yPos += 12 * scale;
    }

    const bottomY = canvas.height - 25 * scale;
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(3, bottomY, canvas.width - 6, 22 * scale);
    ctx.strokeStyle = '#e2e5e9';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(3, bottomY, canvas.width - 6, 22 * scale);

    ctx.fillStyle = '#333';
    ctx.font = `${7 * scale}px sans-serif`;
    if (label.weight) ctx.fillText(`Berat: ${label.weight} kg`, 10 * scale, bottomY + 10 * scale);
    if (label.notes) ctx.fillText(label.notes, 10 * scale, bottomY + 18 * scale);

    if (includeQR && label.trackingNumber) {
      const qrSize = 40 * scale;
      drawQRCode(ctx, label.trackingNumber, canvas.width - qrSize - 10 * scale, bottomY - qrSize - 5 * scale, qrSize);
    }
  }, [labels, activeLabel, labelSize, includeQR, fontSettings, getLabelDimensions, drawBarcode, drawQRCode]);

  useEffect(() => {
    drawLabelPreview();
  }, [labels, activeLabel, labelSize, includeQR, fontSettings]);

  const handleExport = useCallback(async () => {
    if (labels.length === 0) {
      setError('Belum ada label untuk diekspor');
      return;
    }
    setIsGenerating(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const monoFont = await pdfDoc.embedFont(StandardFonts.Courier);
      const dims = getLabelDimensions();

      for (const label of labels) {
        const page = pdfDoc.addPage([dims.width, dims.height]);
        page.drawRectangle({ x: 0, y: 0, width: dims.width, height: dims.height, color: rgb(1, 1, 1) });
        page.drawRectangle({ x: 5, y: 5, width: dims.width - 10, height: dims.height - 10, borderColor: rgb(0.04, 0.15, 0.25), borderWidth: 2 });

        const headerH = 30;
        page.drawRectangle({ x: 5, y: dims.height - 5 - headerH, width: dims.width - 10, height: headerH, color: rgb(0.04, 0.15, 0.25) });
        page.drawText(label.senderName || 'PERADA GROUP', { x: 15, y: dims.height - 5 - headerH + 10, size: fontSettings.headerSize, font: boldFont, color: rgb(1, 1, 1) });

        let yPos = dims.height - 5 - headerH - 15;

        if (label.trackingNumber) {
          page.drawText(label.trackingNumber, { x: 15, y: yPos, size: fontSettings.trackingSize, font: monoFont, color: rgb(0.04, 0.15, 0.25) });
          yPos -= 20;
          const chars = label.trackingNumber.split('');
          const barW = (dims.width - 30) / (chars.length * 11);
          chars.forEach((char, i) => {
            const code = char.charCodeAt(0);
            for (let bit = 0; bit < 8; bit++) {
              if ((code >> bit) & 1) {
                page.drawRectangle({ x: 15 + (i * 11 + bit) * barW, y: yPos, width: barW, height: 30, color: rgb(0, 0, 0) });
              }
            }
          });
          yPos -= 40;
        }

        page.drawText('TUJUAN:', { x: 15, y: yPos, size: 8, font: boldFont, color: rgb(0.04, 0.15, 0.25) });
        yPos -= 14;

        if (label.recipientName) {
          page.drawText(label.recipientName, { x: 15, y: yPos, size: fontSettings.nameSize, font: boldFont, color: rgb(0, 0, 0) });
          yPos -= 16;
        }

        if (label.recipientAddress) {
          const lines = label.recipientAddress.split('\n');
          for (const line of lines.slice(0, 4)) {
            page.drawText(line, { x: 15, y: yPos, size: fontSettings.addressSize, font, color: rgb(0.2, 0.2, 0.2) });
            yPos -= 12;
          }
        }

        if (label.recipientPhone) {
          yPos -= 4;
          page.drawText(`Telp: ${label.recipientPhone}`, { x: 15, y: yPos, size: fontSettings.phoneSize, font, color: rgb(0.2, 0.2, 0.2) });
        }

        const bottomH = 28;
        page.drawRectangle({ x: 5, y: 5, width: dims.width - 10, height: bottomH, color: rgb(0.97, 0.97, 0.98) });
        if (label.weight) {
          page.drawText(`Berat: ${label.weight} kg`, { x: 15, y: 15, size: 8, font, color: rgb(0.2, 0.2, 0.2) });
        }
        if (label.notes) {
          page.drawText(label.notes, { x: 15, y: 8, size: 7, font, color: rgb(0.4, 0.4, 0.4) });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `label_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSuccessMsg(`${labels.length} label berhasil diunduh!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setError(`Gagal membuat label: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  }, [labels, getLabelDimensions, fontSettings]);

  const currentLabel = labels[activeLabel];

  const tabBtn = (key: 'data' | 'size' | 'font', label: string, icon: React.ReactNode) => (
    <button
      onClick={() => setSidebarTab(key)}
      className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-medium uppercase tracking-wider rounded-lg transition-all ${
        sidebarTab === key ? 'bg-[#0A2540] text-white shadow-sm' : `${textSecondary} ${hoverBg}`
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${bg} ${textPrimary}`}>
      <header className={`flex items-center justify-between px-4 py-2.5 border-b shrink-0 ${sidebarBg} ${borderColor}`}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className={`w-7 h-7 rounded-lg flex items-center justify-center ${hoverBg}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center shadow-sm">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight">Label Generator</h1>
            <p className={`text-[10px] ${textSecondary}`}>Label pengiriman standar Indonesia</p>
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
        <aside className={`w-[360px] flex flex-col border-r overflow-hidden shrink-0 ${sidebarBg} ${borderColor}`}>
          <div className={`flex gap-1 p-2 border-b ${borderColor}`}>
            {tabBtn('data', 'Data', <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>)}
            {tabBtn('size', 'Ukuran', <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>)}
            {tabBtn('font', 'Font', <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>)}
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {sidebarTab === 'data' && (
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary}`}>Label {activeLabel + 1} / {labels.length}</h3>
                  <div className="flex gap-1">
                    <button onClick={addLabel} className="px-2 py-0.5 rounded text-[10px] bg-[#0A2540] text-white hover:bg-[#1E3A5F]">+ Tambah</button>
                    {labels.length > 1 && <button onClick={() => removeLabel(activeLabel)} className="px-2 py-0.5 rounded text-[10px] text-red-400 hover:bg-red-500/10">Hapus</button>}
                  </div>
                </div>

                {labels.length > 1 && (
                  <div className="flex gap-1 flex-wrap">
                    {labels.map((_, idx) => (
                      <button key={idx} onClick={() => setActiveLabel(idx)}
                        className={`w-6 h-6 rounded text-[10px] font-medium transition-colors ${idx === activeLabel ? 'bg-[#0A2540] text-white' : `${cardBg} ${textSecondary}`}`}>
                        {idx + 1}
                      </button>
                    ))}
                  </div>
                )}

                <div className={`p-3 rounded-xl ${cardBg} space-y-3`}>
                  <h4 className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary}`}>Informasi Pengirim</h4>
                  <div>
                    <label className={`text-[10px] ${textSecondary} block mb-1`}>Nama</label>
                    <input value={currentLabel?.senderName || ''} onChange={e => updateLabel('senderName', e.target.value)}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-[#0A2540]/30`}
                      placeholder="PERADA GROUP" />
                  </div>
                  <div>
                    <label className={`text-[10px] ${textSecondary} block mb-1`}>Alamat</label>
                    <textarea value={currentLabel?.senderAddress || ''} onChange={e => updateLabel('senderAddress', e.target.value)} rows={2}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-sm border resize-none ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-[#0A2540]/30`}
                      placeholder="Alamat lengkap pengirim" />
                  </div>
                  <div>
                    <label className={`text-[10px] ${textSecondary} block mb-1`}>Telepon</label>
                    <input value={currentLabel?.senderPhone || ''} onChange={e => updateLabel('senderPhone', e.target.value)}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-[#0A2540]/30`}
                      placeholder="021-12345678" />
                  </div>
                </div>

                <div>
                  <label className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} block mb-1`}>No. Resi / Tracking</label>
                  <input value={currentLabel?.trackingNumber || ''} onChange={e => updateLabel('trackingNumber', e.target.value)}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-sm border font-mono ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-[#0A2540]/30`}
                    placeholder="JT1234567890" />
                </div>

                <div className={`p-3 rounded-xl ${cardBg} space-y-3`}>
                  <h4 className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary}`}>Informasi Penerima</h4>
                  <div>
                    <label className={`text-[10px] ${textSecondary} block mb-1`}>Nama</label>
                    <input value={currentLabel?.recipientName || ''} onChange={e => updateLabel('recipientName', e.target.value)}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-[#0A2540]/30`}
                      placeholder="Nama lengkap penerima" />
                  </div>
                  <div>
                    <label className={`text-[10px] ${textSecondary} block mb-1`}>Alamat</label>
                    <textarea value={currentLabel?.recipientAddress || ''} onChange={e => updateLabel('recipientAddress', e.target.value)} rows={3}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-sm border resize-none ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-[#0A2540]/30`}
                      placeholder="Alamat lengkap penerima" />
                  </div>
                  <div>
                    <label className={`text-[10px] ${textSecondary} block mb-1`}>Telepon</label>
                    <input value={currentLabel?.recipientPhone || ''} onChange={e => updateLabel('recipientPhone', e.target.value)}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-[#0A2540]/30`}
                      placeholder="08xxx" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} block mb-1`}>Berat (kg)</label>
                    <input type="number" step="0.1" min="0" value={currentLabel?.weight || ''} onChange={e => updateLabel('weight', e.target.value)}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-[#0A2540]/30`}
                      placeholder="1.0" />
                  </div>
                  <div>
                    <label className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} block mb-1`}>Catatan</label>
                    <input value={currentLabel?.notes || ''} onChange={e => updateLabel('notes', e.target.value)}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-[#0A2540]/30`}
                      placeholder="Catatan" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`text-xs ${textSecondary}`}>Sertakan QR Code</span>
                  <button onClick={() => setIncludeQR(!includeQR)}
                    className={`w-9 h-5 rounded-full transition-colors relative ${includeQR ? 'bg-[#0A2540]' : darkMode ? 'bg-[#30363d]' : 'bg-[#d0d7de]'}`}>
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${includeQR ? 'left-[18px]' : 'left-0.5'}`} />
                  </button>
                </div>
              </div>
            )}

            {sidebarTab === 'size' && (
              <div className="p-4 space-y-4">
                <h3 className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary}`}>Ukuran Label (Landscape)</h3>
                
                <div className="space-y-1.5">
                  {[
                    { key: '100x150' as LabelSizePreset, label: '100 × 150 mm', desc: 'Standar Shopee/Tokopedia, J&T, JNE', badge: 'POPULER' },
                    { key: '100x100' as LabelSizePreset, label: '100 × 100 mm', desc: 'Paket kecil, square format' },
                    { key: '78x100' as LabelSizePreset, label: '78 × 100 mm', desc: 'Label compact' },
                    { key: '100x120' as LabelSizePreset, label: '100 × 120 mm', desc: 'SPX Express' },
                    { key: '50x30' as LabelSizePreset, label: '30 × 50 mm', desc: 'Label barcode kecil' },
                    { key: 'custom' as LabelSizePreset, label: 'Custom', desc: 'Ukuran sesuai kebutuhan' },
                  ].map(preset => (
                    <button key={preset.key} onClick={() => setLabelSize(preset.key)}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        labelSize === preset.key
                          ? 'border-[#0A2540] bg-[#0A2540]/5 dark:border-[#58a6ff] dark:bg-[#58a6ff]/5'
                          : `${borderColor} ${hoverBg}`
                      }`}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{preset.label}</span>
                        {preset.badge && <span className="text-[8px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-500 font-bold">{preset.badge}</span>}
                        {labelSize === preset.key && <svg className="w-4 h-4 text-[#0A2540] dark:text-[#58a6ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <p className={`text-[10px] mt-0.5 ${textSecondary}`}>{preset.desc}</p>
                    </button>
                  ))}
                </div>

                {labelSize === 'custom' && (
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className={`text-[10px] ${textSecondary} block mb-1`}>Lebar (mm)</label>
                      <input type="number" min={30} max={300} value={customWidth} onChange={e => setCustomWidth(Number(e.target.value))}
                        className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-[#0A2540]/30`} />
                    </div>
                    <div>
                      <label className={`text-[10px] ${textSecondary} block mb-1`}>Tinggi (mm)</label>
                      <input type="number" min={20} max={300} value={customHeight} onChange={e => setCustomHeight(Number(e.target.value))}
                        className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-[#0A2540]/30`} />
                    </div>
                  </div>
                )}

                <div className={`p-4 rounded-xl ${cardBg} flex items-center justify-center`}>
                  <div className="border-2 border-dashed border-[#0A2540]/30 dark:border-[#58a6ff]/30 flex items-center justify-center"
                    style={{
                      width: `${Math.min(getLabelDimensions().widthMM * 1.5, 200)}px`,
                      height: `${Math.min(getLabelDimensions().heightMM * 1.5, 200)}px`,
                    }}>
                    <span className={`text-[10px] ${textSecondary} text-center`}>
                      {getLabelDimensions().widthMM} × {getLabelDimensions().heightMM} mm
                    </span>
                  </div>
                </div>
              </div>
            )}

            {sidebarTab === 'font' && (
              <div className="p-4 space-y-4">
                <h3 className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary}`}>Pengaturan Font</h3>
                
                <div>
                  <label className={`text-[10px] ${textSecondary} block mb-1`}>Header (Nama Pengirim): {fontSettings.headerSize}px</label>
                  <input type="range" min={8} max={20} value={fontSettings.headerSize}
                    onChange={e => setFontSettings(s => ({ ...s, headerSize: Number(e.target.value) }))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[#0A2540]"
                    style={{ background: darkMode ? '#30363d' : '#d0d7de' }} />
                </div>

                <div>
                  <label className={`text-[10px] ${textSecondary} block mb-1`}>No. Tracking: {fontSettings.trackingSize}px</label>
                  <input type="range" min={8} max={18} value={fontSettings.trackingSize}
                    onChange={e => setFontSettings(s => ({ ...s, trackingSize: Number(e.target.value) }))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[#0A2540]"
                    style={{ background: darkMode ? '#30363d' : '#d0d7de' }} />
                </div>

                <div>
                  <label className={`text-[10px] ${textSecondary} block mb-1`}>Nama Penerima: {fontSettings.nameSize}px</label>
                  <input type="range" min={8} max={20} value={fontSettings.nameSize}
                    onChange={e => setFontSettings(s => ({ ...s, nameSize: Number(e.target.value) }))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[#0A2540]"
                    style={{ background: darkMode ? '#30363d' : '#d0d7de' }} />
                </div>

                <div>
                  <label className={`text-[10px] ${textSecondary} block mb-1`}>Alamat: {fontSettings.addressSize}px</label>
                  <input type="range" min={6} max={14} value={fontSettings.addressSize}
                    onChange={e => setFontSettings(s => ({ ...s, addressSize: Number(e.target.value) }))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[#0A2540]"
                    style={{ background: darkMode ? '#30363d' : '#d0d7de' }} />
                </div>

                <div>
                  <label className={`text-[10px] ${textSecondary} block mb-1`}>Telepon: {fontSettings.phoneSize}px</label>
                  <input type="range" min={6} max={14} value={fontSettings.phoneSize}
                    onChange={e => setFontSettings(s => ({ ...s, phoneSize: Number(e.target.value) }))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[#0A2540]"
                    style={{ background: darkMode ? '#30363d' : '#d0d7de' }} />
                </div>

                <button onClick={() => setFontSettings({ headerSize: 12, trackingSize: 11, nameSize: 12, addressSize: 9, phoneSize: 9 })}
                  className={`w-full py-2 rounded-lg text-xs font-medium border transition-colors ${borderColor} ${hoverBg} ${textSecondary}`}>
                  Reset ke Default
                </button>
              </div>
            )}
          </div>

          <div className={`p-3 border-t ${borderColor}`}>
            <button onClick={handleExport} disabled={isGenerating}
              className="w-full py-2.5 rounded-lg font-medium text-sm bg-[#0A2540] hover:bg-[#1E3A5F] text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
              {isGenerating ? (
                <><span className="pulse-dot">●</span> Memproses...</>
              ) : (
                <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> Export {labels.length} Label</>
              )}
            </button>
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          <div className={`flex items-center justify-between px-4 py-2 border-b shrink-0 ${sidebarBg} ${borderColor}`}>
            <div className="flex items-center gap-2">
              <span className={`text-xs ${textSecondary}`}>Preview:</span>
              <span className="text-xs font-medium">{getLabelDimensions().widthMM} × {getLabelDimensions().heightMM} mm</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${cardBg} ${textSecondary}`}>Landscape</span>
            </div>
            {error && (
              <div className="text-xs text-red-400 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" /></svg>
                {error}
              </div>
            )}
            {successMsg && (
              <div className="text-xs text-emerald-400 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {successMsg}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-auto p-6 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <canvas ref={canvasRef} className="shadow-2xl rounded-sm border border-gray-200" />
              <div className={`text-[10px] ${textSecondary} text-center`}>
                <p>Label {activeLabel + 1} dari {labels.length} • {getLabelDimensions().widthMM}×{getLabelDimensions().heightMM}mm</p>
              </div>
            </div>
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
