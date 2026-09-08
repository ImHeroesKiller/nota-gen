import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import {
  ImageFile,
  LayoutSettings,
  PAPER_DIMENSIONS,
  MM_TO_POINTS,
  COMPRESSION_TARGETS,
} from '../types';

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

// ============ COMPRESSION ============

async function compressImage(file: File, targetDpi: number): Promise<{ bytes: Uint8Array; type: 'png' | 'jpg' }> {
  if (targetDpi >= 300 && file.type !== 'image/webp') {
    // No compression needed for original/high quality non-webp
    const buf = await file.arrayBuffer();
    return {
      bytes: new Uint8Array(buf),
      type: file.type === 'image/png' ? 'png' : 'jpg',
    };
  }

  const bitmap = await createImageBitmap(file);
  const scaleFactor = targetDpi / 300; // Assume source is ~300 DPI equivalent
  const newWidth = Math.max(1, Math.round(bitmap.width * scaleFactor));
  const newHeight = Math.max(1, Math.round(bitmap.height * scaleFactor));

  const canvas = document.createElement('canvas');
  canvas.width = newWidth;
  canvas.height = newHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, 0, 0, newWidth, newHeight);
  bitmap.close();

  // Use JPEG for compression (smaller file), PNG for transparency
  const isPng = file.type === 'image/png';
  const mimeType = isPng ? 'image/png' : 'image/jpeg';
  const quality = targetDpi >= 300 ? 0.95 : targetDpi >= 150 ? 0.8 : 0.6;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to compress image'));
          return;
        }
        blob.arrayBuffer().then(buf => {
          resolve({
            bytes: new Uint8Array(buf),
            type: isPng ? 'png' : 'jpg',
          });
        });
      },
      mimeType,
      quality
    );
  });
}

// ============ WATERMARK ============

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  return {
    r: parseInt(clean.substring(0, 2), 16) / 255,
    g: parseInt(clean.substring(2, 4), 16) / 255,
    b: parseInt(clean.substring(4, 6), 16) / 255,
  };
}

async function drawWatermark(
  page: any,
  settings: LayoutSettings,
  pdfDoc: PDFDocument
) {
  if (!settings.watermark.enabled || !settings.watermark.text) return;

  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const dims = PAPER_DIMENSIONS[settings.paperSize][settings.orientation];
  const { text, position, opacity, fontSize, color } = settings.watermark;
  const rgbColor = hexToRgb(color);

  const textWidth = font.widthOfTextAtSize(text, fontSize);
  const centerX = dims.width / 2;
  const centerY = dims.height / 2;

  let rotation = degrees(0);
  let x = centerX - textWidth / 2;
  let y = centerY - fontSize / 2;

  if (position === 'diagonal') {
    rotation = degrees(45);
    // For diagonal, center the text
    x = centerX - textWidth / 2;
    y = centerY - fontSize / 2;
  } else if (position === 'vertical') {
    rotation = degrees(90);
    x = centerX - fontSize / 2;
    y = centerY - textWidth / 2;
  }

  page.drawText(text, {
    x,
    y,
    size: fontSize,
    font,
    color: rgb(rgbColor.r, rgbColor.g, rgbColor.b),
    opacity,
    rotate: rotation,
  });
}

// ============ COVER PAGE ============

async function addCoverPage(
  pdfDoc: PDFDocument,
  settings: LayoutSettings
) {
  const dims = PAPER_DIMENSIONS[settings.paperSize][settings.orientation];
  const page = pdfDoc.insertPage(0, [dims.width, dims.height]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const { coverPage } = settings;

  const navy = rgb(10 / 255, 37 / 255, 64 / 255); // #0A2540
  const gray = rgb(0.4, 0.4, 0.4);
  const lightGray = rgb(0.85, 0.85, 0.85);

  const centerX = dims.width / 2;
  const pageW = dims.width;
  const pageH = dims.height;

  // Top accent bar
  page.drawRectangle({
    x: 0,
    y: pageH - 8,
    width: pageW,
    height: 8,
    color: navy,
  });

  // Company name
  const companyName = 'PERADA GROUP';
  const companyWidth = fontBold.widthOfTextAtSize(companyName, 14);
  page.drawText(companyName, {
    x: centerX - companyWidth / 2,
    y: pageH - 60,
    size: 14,
    font: fontBold,
    color: navy,
  });

  // Subtitle
  const subtitle = 'PT Perdana Adi Yuda';
  const subtitleWidth = font.widthOfTextAtSize(subtitle, 10);
  page.drawText(subtitle, {
    x: centerX - subtitleWidth / 2,
    y: pageH - 80,
    size: 10,
    font,
    color: gray,
  });

  // Divider line
  page.drawLine({
    start: { x: pageW * 0.2, y: pageH - 110 },
    end: { x: pageW * 0.8, y: pageH - 110 },
    thickness: 0.5,
    color: lightGray,
  });

  // Main title
  const title = 'DOKUMEN PENDUKUNG';
  const titleWidth = fontBold.widthOfTextAtSize(title, 28);
  page.drawText(title, {
    x: centerX - titleWidth / 2,
    y: pageH / 2 + 60,
    size: 28,
    font: fontBold,
    color: navy,
  });

  // Info block
  const infoStartY = pageH / 2 - 10;
  const labelX = pageW * 0.25;
  const valueX = pageW * 0.42;
  let currentY = infoStartY;
  const lineHeight = 28;

  const infoItems: { label: string; value: string }[] = [];

  if (coverPage.clientName) {
    infoItems.push({ label: 'Klien', value: coverPage.clientName });
  }
  if (coverPage.referenceNumber) {
    infoItems.push({ label: 'No. Referensi', value: coverPage.referenceNumber });
  }
  if (coverPage.date) {
    const d = new Date(coverPage.date);
    const formatted = d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    infoItems.push({ label: 'Tanggal', value: formatted });
  }
  if (coverPage.description) {
    infoItems.push({ label: 'Keterangan', value: coverPage.description });
  }

  // Total images count
  infoItems.push({
    label: 'Jumlah Gambar',
    value: '—',
  });

  for (const item of infoItems) {
    const labelWidth = font.widthOfTextAtSize(item.label + ':', 11);
    page.drawText(item.label + ':', {
      x: labelX,
      y: currentY,
      size: 11,
      font,
      color: gray,
    });
    page.drawText(item.value, {
      x: valueX,
      y: currentY,
      size: 11,
      font: fontBold,
      color: navy,
    });
    currentY -= lineHeight;
  }

  // Bottom accent bar
  page.drawRectangle({
    x: 0,
    y: 0,
    width: pageW,
    height: 8,
    color: navy,
  });

  // Footer text
  const footerText = `Dicetak pada ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`;
  const footerWidth = font.widthOfTextAtSize(footerText, 8);
  page.drawText(footerText, {
    x: centerX - footerWidth / 2,
    y: 24,
    size: 8,
    font,
    color: gray,
  });
}

// ============ MAIN PDF GENERATOR ============

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
  const targetDpi = COMPRESSION_TARGETS[settings.compression].dpi;

  // Process images
  for (let page = 0; page < totalPages; page++) {
    const pdfPage = pdfDoc.addPage([dims.width, dims.height]);
    const pageImages = getImagesForPage(images, settings, page);

    for (let i = 0; i < pageImages.length; i++) {
      const imgFile = pageImages[i];
      const cell = cells[i];

      // Compress image
      const compressed = await compressImage(imgFile.file, targetDpi);

      let pdfImage;
      if (compressed.type === 'png') {
        pdfImage = await pdfDoc.embedPng(compressed.bytes);
      } else {
        pdfImage = await pdfDoc.embedJpg(compressed.bytes);
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

    // Draw watermark on each page
    await drawWatermark(pdfPage, settings, pdfDoc);
  }

  // Add cover page as first page (if enabled)
  if (settings.coverPage.enabled) {
    await addCoverPage(pdfDoc, settings);
  }

  return await pdfDoc.save();
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
