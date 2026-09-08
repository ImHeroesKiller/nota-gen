import { PDFDocument } from 'pdf-lib';
import { ImageFile, LayoutSettings, PAPER_DIMENSIONS, MM_TO_POINTS } from '../types';

export function getPagesCount(images: ImageFile[], settings: LayoutSettings): number {
  const itemsPerPage = settings.columns * settings.rows;
  if (images.length === 0) return 1;
  return Math.ceil(images.length / itemsPerPage);
}

export function getImagesForPage(images: ImageFile[], settings: LayoutSettings, pageIndex: number): ImageFile[] {
  const itemsPerPage = settings.columns * settings.rows;
  const start = pageIndex * itemsPerPage;
  const end = start + itemsPerPage;
  return images.slice(start, end);
}

export interface CellPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function getCellPositions(settings: LayoutSettings): CellPosition[] {
  const dims = PAPER_DIMENSIONS[settings.paperSize][settings.orientation];
  const paddingPt = settings.padding * MM_TO_POINTS;
  
  const availableWidth = dims.width - paddingPt * 2;
  const availableHeight = dims.height - paddingPt * 2;
  
  const cellWidth = availableWidth / settings.columns;
  const cellHeight = availableHeight / settings.rows;
  
  const positions: CellPosition[] = [];
  
  for (let row = 0; row < settings.rows; row++) {
    for (let col = 0; col < settings.columns; col++) {
      positions.push({
        x: paddingPt + col * cellWidth,
        y: paddingPt + row * cellHeight,
        width: cellWidth,
        height: cellHeight,
      });
    }
  }
  
  return positions;
}

export interface FittedImage {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function fitImageToCell(
  imgWidth: number,
  imgHeight: number,
  cell: CellPosition
): FittedImage {
  const scale = Math.min(cell.width / imgWidth, cell.height / imgHeight);
  const newWidth = imgWidth * scale;
  const newHeight = imgHeight * scale;
  
  const x = cell.x + (cell.width - newWidth) / 2;
  const y = cell.y + (cell.height - newHeight) / 2;
  
  return { x, y, width: newWidth, height: newHeight };
}

export async function generatePDF(
  images: ImageFile[],
  settings: LayoutSettings,
  onProgress?: (current: number, total: number) => void
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const dims = PAPER_DIMENSIONS[settings.paperSize][settings.orientation];
  const cells = getCellPositions(settings);
  const itemsPerPage = settings.columns * settings.rows;
  const totalPages = getPagesCount(images, settings);
  
  for (let page = 0; page < totalPages; page++) {
    const pdfPage = pdfDoc.addPage([dims.width, dims.height]);
    const pageImages = getImagesForPage(images, settings, page);
    
    for (let i = 0; i < pageImages.length; i++) {
      const imgFile = pageImages[i];
      const cell = cells[i];
      
      let pdfImage;
      
      const type = imgFile.file.type;
      if (type === 'image/webp') {
        // Convert WEBP to PNG via canvas
        const pngBytes = await convertWebpToPng(imgFile.file);
        pdfImage = await pdfDoc.embedPng(pngBytes);
      } else if (type === 'image/png') {
        const arrayBuffer = await imgFile.file.arrayBuffer();
        pdfImage = await pdfDoc.embedPng(arrayBuffer);
      } else {
        const arrayBuffer = await imgFile.file.arrayBuffer();
        pdfImage = await pdfDoc.embedJpg(arrayBuffer);
      }
      
      const fitted = fitImageToCell(pdfImage.width, pdfImage.height, cell);
      
      pdfPage.drawImage(pdfImage, {
        x: fitted.x,
        y: dims.height - fitted.y - fitted.height,
        width: fitted.width,
        height: fitted.height,
      });
      
      if (onProgress) {
        const processed = page * itemsPerPage + i + 1;
        onProgress(processed, images.length);
      }
    }
  }
  
  return await pdfDoc.save();
}

async function convertWebpToPng(file: File): Promise<Uint8Array> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to convert WEBP to PNG'));
          return;
        }
        blob.arrayBuffer().then(buf => resolve(new Uint8Array(buf)));
      },
      'image/png'
    );
  });
}

export async function loadImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error(`Gagal memuat gambar: ${file.name}`));
    };
    img.src = URL.createObjectURL(file);
  });
}
