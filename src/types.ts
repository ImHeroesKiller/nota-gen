export interface ImageFile {
  id: string;
  file: File;
  name: string;
  url: string;
  width: number;
  height: number;
}

export type PaperSize = 'A4' | 'Letter' | 'Legal';
export type Orientation = 'portrait' | 'landscape';
export type CompressionLevel = 'original' | 'high' | 'medium' | 'low';
export type WatermarkPosition = 'diagonal' | 'horizontal' | 'vertical';

export interface WatermarkSettings {
  enabled: boolean;
  text: string;
  position: WatermarkPosition;
  opacity: number; // 0-1
  fontSize: number; // in points
  color: string; // hex
}

export interface CoverPageSettings {
  enabled: boolean;
  clientName: string;
  referenceNumber: string;
  description: string;
  date: string; // ISO date string
}

export interface LayoutSettings {
  columns: number;
  rows: number;
  padding: number; // in mm
  paperSize: PaperSize;
  orientation: Orientation;
  compression: CompressionLevel;
  watermark: WatermarkSettings;
  coverPage: CoverPageSettings;
}

export interface PaperDimensions {
  width: number; // in points (1/72 inch)
  height: number; // in points
}

export const PAPER_DIMENSIONS: Record<PaperSize, { portrait: PaperDimensions; landscape: PaperDimensions }> = {
  A4: {
    portrait: { width: 595.28, height: 841.89 },
    landscape: { width: 841.89, height: 595.28 },
  },
  Letter: {
    portrait: { width: 612, height: 792 },
    landscape: { width: 792, height: 612 },
  },
  Legal: {
    portrait: { width: 612, height: 1008 },
    landscape: { width: 1008, height: 612 },
  },
};

export const MM_TO_POINTS = 2.83465; // 1mm = 2.83465 points

export const COMPRESSION_TARGETS: Record<CompressionLevel, { dpi: number; label: string; desc: string }> = {
  original: { dpi: 300, label: 'Original', desc: 'Kualitas cetak maksimal' },
  high: { dpi: 300, label: 'Tinggi (300 DPI)', desc: 'Cetak tajam, file besar' },
  medium: { dpi: 150, label: 'Sedang (150 DPI)', desc: 'Seimbang kualitas & ukuran' },
  low: { dpi: 72, label: 'Rendah (72 DPI)', desc: 'Untuk email, file kecil' },
};

export const DEFAULT_WATERMARK: WatermarkSettings = {
  enabled: false,
  text: 'CONFIDENTIAL',
  position: 'diagonal',
  opacity: 0.3,
  fontSize: 48,
  color: '#999999',
};

export const DEFAULT_COVER_PAGE: CoverPageSettings = {
  enabled: false,
  clientName: '',
  referenceNumber: '',
  description: '',
  date: new Date().toISOString().split('T')[0],
};
