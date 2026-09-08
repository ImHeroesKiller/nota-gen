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
  courier: string;
  service: string;
}

interface LabelGeneratorProps {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

// Ukuran label standar Indonesia (landscape)
type LabelSizePreset = '100x150' | '100x100' | '78x100' | '100x120' | '50x30' | 'custom';

// Kurir Indonesia & tarif estimasi per kg
interface CourierRate {
  name: string;
  code: string;
  services: { name: string; code: string; ratePerKg: number; eta: string }[];
}

const COURIERS: CourierRate[] = [
  {
    name: 'JNE',
    code: 'jne',
    services: [
      { name: 'YES (Same Day)', code: 'yes', ratePerKg: 35000, eta: '1 hari' },
      { name: 'REG (Regular)', code: 'reg', ratePerKg: 12000, eta: '2-3 hari' },
      { name: 'OKE (Economy)', code: 'oke', ratePerKg: 9000, eta: '4-5 hari' },
    ],
  },
  {
    name: 'J&T Express',
    code: 'jnt',
    services: [
      { name: 'J&T Express', code: 'express', ratePerKg: 11000, eta: '1-3 hari' },
      { name: 'J&T Super', code: 'super', ratePerKg: 25000, eta: '1 hari' },
      { name: 'J&T Jumbo', code: 'jumbo', ratePerKg: 8000, eta: '3-5 hari' },
    ],
  },
  {
    name: 'SiCepat',
    code: 'sicepat',
    services: [
      { name: 'HALU', code: 'halu', ratePerKg: 8500, eta: '3-5 hari' },
      { name: 'REG', code: 'reg', ratePerKg: 11000, eta: '2-3 hari' },
      { name: 'BEST (Same Day)', code: 'best', ratePerKg: 30000, eta: '1 hari' },
    ],
  },
  {
    name: 'AnterAja',
    code: 'anteraja',
    services: [
      { name: 'Regular', code: 'reg', ratePerKg: 10000, eta: '2-4 hari' },
      { name: 'Instant', code: 'inst', ratePerKg: 28000, eta: '1 hari' },
      { name: 'Hemat', code: 'hemat', ratePerKg: 7500, eta: '4-6 hari' },
    ],
  },
  {
    name: 'POS Indonesia',
    code: 'pos',
    services: [
      { name: 'Express Next Day', code: 'next', ratePerKg: 32000, eta: '1 hari' },
      { name: 'Express', code: 'express', ratePerKg: 18000, eta: '1-2 hari' },
      { name: 'Reguler', code: 'reg', ratePerKg: 12000, eta: '2-5 hari' },
    ],
  },
  {
    name: 'SPX Express',
    code: 'spx',
    services: [
      { name: 'SPX Express', code: 'express', ratePerKg: 9000, eta: '2-3 hari' },
      { name: 'SPX Instant', code: 'instant', ratePerKg: 22000, eta: '1 hari' },
    ],
  },
];

// Multiplier zona (Jakarta sebagai base)
const ZONE_MULTIPLIERS: Record<string, { name: string; multiplier: number }> = {
  jabodetabek: { name: 'Jabodetabek', multiplier: 1.0 },
  jawa: { name: 'Pulau Jawa', multiplier: 1.2 },
  sumatera: { name: 'Sumatera', multiplier: 1.5 },
  kalimantan: { name: 'Kalimantan', multiplier: 1.8 },
  sulawesi: { name: 'Sulawesi', multiplier: 2.0 },
  bali_nusa: { name: 'Bali & Nusa Tenggara', multiplier: 2.0 },
  papua_maluku: { name: 'Papua & Maluku', multiplier: 2.5 },
};

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
    courier: 'jne',
    service: 'reg',
  }]);
  const [labelSize, setLabelSize] = useState<LabelSizePreset>('100x150');
  const [customWidth, setCustomWidth] = useState(100);
  const [customHeight, setCustomHeight] = useState(150);
  const [includeQR, setIncludeQR] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [activeLabel, setActiveLabel] = useState(0);
  const [showOngkir, setShowOngkir] = useState(false);
  const [ongkirZone, setOngkirZone] = useState('jawa');
  const [ongkirWeight, setOngkirWeight] = useState(1);
  const [sidebarTab, setSidebarTab] = useState<'data' | 'size' | 'ongkir'>('data');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const bg = darkMode ? 'bg-[#0f1419]' : 'bg-[#f8f9fb]';
  const sidebarBg = darkMode ? 'bg-[#161b22]' : 'bg-white';
  const borderColor = darkMode ? 'border-[#21262d]' : 'border-[#e2e5e9]';
  const cardBg = darkMode ? 'bg-[#1c2128]' : 'bg-[#f3f4f6]';
  const textPrimary = darkMode ? 'text-[#e6edf3]' : 'text-[#1a1a2e]';
  const textSecondary = darkMode ? 'text-[#8b949e]' : 'text-[#57606a]';
  const inputBg = darkMode ? 'bg-[#0d1117] border-[#30363d]' : 'bg-white border-[#d0d7de]';
  const hoverBg = darkMode ? 'hover:bg-[#21262d]' : 'hover:bg-[#f0f1f3]';

  // Label dimensions in points (1mm = 2.83465pt)
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
      trackingNumber: '',
      weight: '',
      notes: '',
      courier: 'jne',
      service: 'reg',
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
    // Scale to fit canvas (max 400px wide)
    const maxW = 400;
    const scale = Math.min(maxW / dims.width, 1);
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
    ctx.strokeRect(3, 3, canvas.width - 6, canvas.height - 6);

    // Header bar
    const headerH = 22 * scale;
    ctx.fillStyle = '#0A2540';
    ctx.fillRect(3, 3, canvas.width - 6, headerH);
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${10 * scale}px sans-serif`;
    ctx.fillText(label.senderName || 'PERADA GROUP', 10 * scale, 3 + headerH * 0.65);

    // Courier badge
    if (label.courier) {
      const courier = COURIERS.find(c => c.code === label.courier);
      if (courier) {
        const badgeText = courier.name.toUpperCase();
        ctx.font = `bold ${8 * scale}px sans-serif`;
        const badgeW = ctx.measureText(badgeText).width + 12 * scale;
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(canvas.width - badgeW - 8 * scale, 3 + 4 * scale, badgeW, 14 * scale);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(badgeText, canvas.width - badgeW - 2 * scale, 3 + 4 * scale + 10 * scale);
      }
    }

    let yPos = headerH + 12 * scale;

    // Tracking number
    if (label.trackingNumber) {
      ctx.fillStyle = '#0A2540';
      ctx.font = `bold ${9 * scale}px monospace`;
      ctx.fillText(label.trackingNumber, 10 * scale, yPos);
      yPos += 10 * scale;
      drawBarcode(ctx, label.trackingNumber, 10 * scale, yPos, canvas.width - 20 * scale, 20 * scale);
      yPos += 26 * scale;
    }

    // Recipient
    ctx.fillStyle = '#0A2540';
    ctx.font = `bold ${7 * scale}px sans-serif`;
    ctx.fillText('TUJUAN:', 10 * scale, yPos);
    yPos += 10 * scale;

    ctx.fillStyle = '#000000';
    ctx.font = `bold ${10 * scale}px sans-serif`;
    if (label.recipientName) {
      ctx.fillText(label.recipientName, 10 * scale, yPos);
      yPos += 12 * scale;
    }

    ctx.font = `${8 * scale}px sans-serif`;
    if (label.recipientAddress) {
      const lines = wrapText(ctx, label.recipientAddress, canvas.width - 20 * scale);
      lines.slice(0, 3).forEach(line => {
        ctx.fillText(line, 10 * scale, yPos);
        yPos += 10 * scale;
      });
    }

    if (label.recipientPhone) {
      yPos += 2 * scale;
      ctx.fillText(`Telp: ${label.recipientPhone}`, 10 * scale, yPos);
      yPos += 12 * scale;
    }

    // Weight & notes at bottom
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

    // QR code
    if (includeQR && label.trackingNumber) {
      const qrSize = 40 * scale;
      drawQRCode(ctx, label.trackingNumber, canvas.width - qrSize - 10 * scale, bottomY - qrSize - 5 * scale, qrSize);
    }
  }, [labels, activeLabel, labelSize, includeQR, getLabelDimensions, drawBarcode, drawQRCode]);

  useEffect(() => {
    drawLabelPreview();
  }, [drawLabelPreview]);

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

        // White background
        page.drawRectangle({ x: 0, y: 0, width: dims.width, height: dims.height, color: rgb(1, 1, 1) });

        // Border
        page.drawRectangle({
          x: 5, y: 5, width: dims.width - 10, height: dims.height - 10,
          borderColor: rgb(0.04, 0.15, 0.25), borderWidth: 2,
        });

        // Header
        const headerH = 30;
        page.drawRectangle({ x: 5, y: dims.height - 5 - headerH, width: dims.width - 10, height: headerH, color: rgb(0.04, 0.15, 0.25) });
        page.drawText(label.senderName || 'PERADA GROUP', {
          x: 15, y: dims.height - 5 - headerH + 10, size: 12, font: boldFont, color: rgb(1, 1, 1),
        });

        // Courier badge
        if (label.courier) {
          const courier = COURIERS.find(c => c.code === label.courier);
          if (courier) {
            const badgeText = courier.name.toUpperCase();
            const badgeW = boldFont.widthOfTextAtSize(badgeText, 9) + 10;
            page.drawRectangle({
              x: dims.width - 15 - badgeW, y: dims.height - 5 - headerH + 8,
              width: badgeW, height: 16, color: rgb(0.9, 0.3, 0.24),
            });
            page.drawText(badgeText, {
              x: dims.width - 10 - badgeW, y: dims.height - 5 - headerH + 12, size: 9, font: boldFont, color: rgb(1, 1, 1),
            });
          }
        }

        let yPos = dims.height - 5 - headerH - 15;

        // Tracking
        if (label.trackingNumber) {
          page.drawText(label.trackingNumber, { x: 15, y: yPos, size: 11, font: monoFont, color: rgb(0.04, 0.15, 0.25) });
          yPos -= 20;
          // Barcode visual (simplified lines)
          const chars = label.trackingNumber.split('');
          const barW = (dims.width - 30) / (chars.length * 11);
          chars.forEach((char, i) => {
            const code = char.charCodeAt(0);
            for (let bit = 0; bit < 8; bit++) {
              if ((code >> bit) & 1) {
                page.drawRectangle({
                  x: 15 + (i * 11 + bit) * barW, y: yPos,
                  width: barW, height: 30, color: rgb(0, 0, 0),
                });
              }
            }
          });
          yPos -= 40;
        }

        // Recipient
        page.drawText('TUJUAN:', { x: 15, y: yPos, size: 8, font: boldFont, color: rgb(0.04, 0.15, 0.25) });
        yPos -= 14;

        if (label.recipientName) {
          page.drawText(label.recipientName, { x: 15, y: yPos, size: 12, font: boldFont, color: rgb(0, 0, 0) });
          yPos -= 16;
        }

        if (label.recipientAddress) {
          const lines = label.recipientAddress.split('\n');
          for (const line of lines.slice(0, 4)) {
            page.drawText(line, { x: 15, y: yPos, size: 9, font, color: rgb(0.2, 0.2, 0.2) });
            yPos -= 12;
          }
        }

        if (label.recipientPhone) {
          yPos -= 4;
          page.drawText(`Telp: ${label.recipientPhone}`, { x: 15, y: yPos, size: 9, font, color: rgb(0.2, 0.2, 0.2) });
        }

        // Bottom bar
        const bottomH = 28;
        page.drawRectangle({ x: 5, y: 5, width: dims.width - 10, height: bottomH, color: rgb(0.97, 0.97, 0.98) });
        if (label.weight) {
          page.drawText(`Berat: ${label.weight} kg`, { x: 15, y: 15, size: 8, font, color: rgb(0.2, 0.2, 0.2) });
        }
        if (label.notes) {
          page.drawText(label.notes, { x: 15, y: 8, size: 7, font, color: rgb(0.4, 0.4, 0.4) });
        }

        // Service info
        if (label.courier && label.service) {
          const courier = COURIERS.find(c => c.code === label.courier);
          const service = courier?.services.find(s => s.code === label.service);
          if (service) {
            page.drawText(`${service.name} • ETA: ${service.eta}`, {
              x: dims.width - 150, y: 15, size: 7, font, color: rgb(0.3, 0.3, 0.3),
            });
          }
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
  }, [labels, getLabelDimensions]);

  // Ongkir calculation
  const calculateOngkir = (courierCode: string, serviceCode: string, weightKg: number, zone: string) => {
    const courier = COURIERS.find(c => c.code === courierCode);
    const service = courier?.services.find(s => s.code === serviceCode);
    const zoneMultiplier = ZONE_MULTIPLIERS[zone]?.multiplier || 1;
    if (!service) return null;
    const baseCost = service.ratePerKg * Math.max(1, weightKg);
    return Math.round(baseCost * zoneMultiplier);
  };

  const selectedCourier = COURIERS.find(c => c.code === labels[activeLabel]?.courier);
  const currentLabel = labels[activeLabel];

  const tabBtn = (key: 'data' | 'size' | 'ongkir', label: string, icon: React.ReactNode) => (
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
      {/* Header */}
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

      {/* Main */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`w-[360px] flex flex-col border-r overflow-hidden shrink-0 ${sidebarBg} ${borderColor}`}>
          {/* Tabs */}
          <div className={`flex gap-1 p-2 border-b ${borderColor}`}>
            {tabBtn('data', 'Data', <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>)}
            {tabBtn('size', 'Ukuran', <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>)}
            {tabBtn('ongkir', 'Ongkir', <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>)}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {/* DATA TAB */}
            {sidebarTab === 'data' && (
              <div className="p-4 space-y-4">
                {/* Label selector */}
                <div className="flex items-center justify-between">
                  <h3 className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary}`}>Label {activeLabel + 1} / {labels.length}</h3>
                  <div className="flex gap-1">
                    <button onClick={addLabel} className="px-2 py-0.5 rounded text-[10px] bg-[#0A2540] text-white hover:bg-[#1E3A5F]">+ Tambah</button>
                    {labels.length > 1 && <button onClick={() => removeLabel(activeLabel)} className="px-2 py-0.5 rounded text-[10px] text-red-400 hover:bg-red-500/10">Hapus</button>}
                  </div>
                </div>

                {/* Label pills */}
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

                {/* Courier */}
                <div>
                  <label className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} block mb-1`}>Kurir</label>
                  <select value={currentLabel?.courier || 'jne'}
                    onChange={e => { updateLabel('courier', e.target.value); updateLabel('service', COURIERS.find(c => c.code === e.target.value)?.services[0]?.code || 'reg'); }}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-[#0A2540]/30`}>
                    {COURIERS.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                  </select>
                </div>

                {/* Service */}
                <div>
                  <label className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} block mb-1`}>Layanan</label>
                  <select value={currentLabel?.service || 'reg'}
                    onChange={e => updateLabel('service', e.target.value)}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-[#0A2540]/30`}>
                    {selectedCourier?.services.map(s => <option key={s.code} value={s.code}>{s.name} — Rp{s.ratePerKg.toLocaleString('id')}/kg • {s.eta}</option>)}
                  </select>
                </div>

                {/* Sender */}
                <div>
                  <label className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} block mb-1`}>Pengirim</label>
                  <input value={currentLabel?.senderName || ''} onChange={e => updateLabel('senderName', e.target.value)}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-[#0A2540]/30`}
                    placeholder="PERADA GROUP" />
                </div>

                {/* Tracking */}
                <div>
                  <label className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} block mb-1`}>No. Resi / Tracking</label>
                  <input value={currentLabel?.trackingNumber || ''} onChange={e => updateLabel('trackingNumber', e.target.value)}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-sm border font-mono ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-[#0A2540]/30`}
                    placeholder="JT1234567890" />
                </div>

                {/* Recipient */}
                <div>
                  <label className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} block mb-1`}>Nama Penerima</label>
                  <input value={currentLabel?.recipientName || ''} onChange={e => updateLabel('recipientName', e.target.value)}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-[#0A2540]/30`}
                    placeholder="Nama lengkap penerima" />
                </div>

                <div>
                  <label className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} block mb-1`}>Alamat</label>
                  <textarea value={currentLabel?.recipientAddress || ''} onChange={e => updateLabel('recipientAddress', e.target.value)} rows={3}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-sm border resize-none ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-[#0A2540]/30`}
                    placeholder="Alamat lengkap penerima" />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} block mb-1`}>Telepon</label>
                    <input value={currentLabel?.recipientPhone || ''} onChange={e => updateLabel('recipientPhone', e.target.value)}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-[#0A2540]/30`}
                      placeholder="08xxx" />
                  </div>
                  <div>
                    <label className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} block mb-1`}>Berat (kg)</label>
                    <input type="number" step="0.1" min="0" value={currentLabel?.weight || ''} onChange={e => updateLabel('weight', e.target.value)}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-[#0A2540]/30`}
                      placeholder="1.0" />
                  </div>
                </div>

                <div>
                  <label className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} block mb-1`}>Catatan</label>
                  <input value={currentLabel?.notes || ''} onChange={e => updateLabel('notes', e.target.value)}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-[#0A2540]/30`}
                    placeholder="Catatan tambahan" />
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

            {/* SIZE TAB */}
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

                {/* Visual preview of label size */}
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

            {/* ONGKIR TAB */}
            {sidebarTab === 'ongkir' && (
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary}`}>Estimasi Ongkir</h3>
                  <button onClick={() => setShowOngkir(!showOngkir)}
                    className={`w-9 h-5 rounded-full transition-colors relative ${showOngkir ? 'bg-[#0A2540]' : darkMode ? 'bg-[#30363d]' : 'bg-[#d0d7de]'}`}>
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${showOngkir ? 'left-[18px]' : 'left-0.5'}`} />
                  </button>
                </div>

                {showOngkir && (
                  <>
                    <div className={`p-3 rounded-lg text-[10px] ${cardBg} ${textSecondary} leading-relaxed`}>
                      ⚠️ Estimasi berdasarkan tarif rata-rata kurir (base Jakarta). Harga aktual dapat berbeda tergantung origin-destination. Untuk tarif real-time, gunakan API RajaOngkir atau Biteship.
                    </div>

                    <div>
                      <label className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} block mb-1`}>Zona Tujuan</label>
                      <select value={ongkirZone} onChange={e => setOngkirZone(e.target.value)}
                        className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-[#0A2540]/30`}>
                        {Object.entries(ZONE_MULTIPLIERS).map(([key, z]) => (
                          <option key={key} value={key}>{z.name} (×{z.multiplier})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} block mb-1`}>Berat (kg)</label>
                      <input type="number" min={0.1} step={0.1} value={ongkirWeight}
                        onChange={e => setOngkirWeight(Number(e.target.value))}
                        className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-[#0A2540]/30`} />
                    </div>

                    {/* Compare all couriers */}
                    <div className="space-y-2">
                      <h4 className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary}`}>Perbandingan Tarif</h4>
                      {COURIERS.map(courier => (
                        <div key={courier.code} className={`rounded-xl border p-3 ${borderColor}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-bold">{courier.name}</span>
                          </div>
                          <div className="space-y-1.5">
                            {courier.services.map(service => {
                              const cost = calculateOngkir(courier.code, service.code, ongkirWeight, ongkirZone);
                              return (
                                <div key={service.code} className={`flex items-center justify-between text-[10px] py-1 px-2 rounded ${cardBg}`}>
                                  <div>
                                    <span className="font-medium">{service.name}</span>
                                    <span className={`ml-1 ${textSecondary}`}>• {service.eta}</span>
                                  </div>
                                  <span className="font-bold text-[#0A2540] dark:text-[#58a6ff]">
                                    Rp{cost?.toLocaleString('id')}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {!showOngkir && (
                  <div className={`text-center py-8 ${textSecondary}`}>
                    <svg className="w-10 h-10 mx-auto mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p className="text-xs">Aktifkan untuk melihat estimasi ongkir</p>
                    <p className="text-[10px] mt-1 opacity-60">Bandingkan tarif semua kurir Indonesia</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Export button */}
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

        {/* Preview Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
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

          {/* Preview Canvas */}
          <div className="flex-1 overflow-auto p-6 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <canvas ref={canvasRef} className="shadow-2xl rounded-sm border border-gray-200" />
              <div className={`text-[10px] ${textSecondary} text-center`}>
                <p>Label {activeLabel + 1} dari {labels.length} • {getLabelDimensions().widthMM}×{getLabelDimensions().heightMM}mm</p>
                {currentLabel?.courier && (
                  <p className="mt-1">Kurir: {COURIERS.find(c => c.code === currentLabel.courier)?.name} • {selectedCourier?.services.find(s => s.code === currentLabel.service)?.name}</p>
                )}
              </div>
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
