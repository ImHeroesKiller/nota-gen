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

export interface LayoutSettings {
  columns: number;
  rows: number;
  padding: number; // in mm
  paperSize: PaperSize;
  orientation: Orientation;
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
