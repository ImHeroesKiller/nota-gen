export type MinerbaCncCategory = 'cnc' | 'cnc-batch' | 'registered' | 'non-cnc' | 'unknown';
export type MinerbaCncTone = 'green' | 'amber' | 'red' | 'gray';

export interface MinerbaCncMeta {
  raw: string;
  category: MinerbaCncCategory;
  label: string;
  short_label: string;
  description: string;
  tone: MinerbaCncTone;
  is_cnc: boolean | null;
  requires_verification: boolean;
}

const clean = (value: unknown) => String(value ?? '').replace(/\s+/g, ' ').trim();

export const classifyMinerbaCncStatus = (value: unknown): MinerbaCncMeta => {
  const raw = clean(value);
  const upper = raw.toUpperCase();
  const compact = upper.replace(/\s+/g, '');

  if (!raw) {
    return {
      raw,
      category: 'unknown',
      label: 'Status tidak tersedia',
      short_label: 'Perlu Verifikasi',
      description: 'Status CnC tidak tersedia pada data publik. Jangan diasumsikan CnC maupun Non-CnC.',
      tone: 'gray',
      is_cnc: null,
      requires_verification: true,
    };
  }

  if (/\bI\.?\s*T\.?\b/i.test(raw) || compact === 'IT' || compact.includes('I.T')) {
    return {
      raw,
      category: 'registered',
      label: `${raw} · IUP Terdaftar`,
      short_label: 'IUP Terdaftar',
      description: 'I.T merupakan kategori registrasi untuk IUP Mineral Logam/Batubara yang tercatat berdasarkan putusan pengadilan atau lembaga berwenang terkait. Status ini tidak tepat disamakan dengan Non-CnC.',
      tone: 'amber',
      is_cnc: null,
      requires_verification: true,
    };
  }

  if (/^CNC(?:[-\s]+)(?:\d+|[IVXLCDM]+)$/i.test(raw)) {
    return {
      raw,
      category: 'cnc-batch',
      label: `${raw} · CnC Pengumuman`,
      short_label: 'CnC Pengumuman',
      description: 'IUP pernah diumumkan Clean & Clear pada salah satu pengumuman/angkatan CnC. Nomor atau angka romawi menunjukkan angkatan/pengumuman tersebut.',
      tone: 'green',
      is_cnc: true,
      requires_verification: false,
    };
  }

  if (upper === 'CNC' || upper === 'C&C' || upper === 'CNC VALID') {
    return {
      raw,
      category: 'cnc',
      label: 'CNC · Clean & Clear',
      short_label: 'Clean & Clear',
      description: 'Clean & Clear menunjukkan status hasil penataan/evaluasi IUP. Tetap verifikasi masa berlaku izin serta kewajiban terkini seperti RKAB, PNBP, sanksi, teknis, dan lingkungan.',
      tone: 'green',
      is_cnc: true,
      requires_verification: false,
    };
  }

  if (/NON\s*-?\s*CNC|NONCNC|BELUM.*CNC|TIDAK.*CNC/i.test(upper)) {
    return {
      raw,
      category: 'non-cnc',
      label: `${raw} · Non-CnC`,
      short_label: 'Non-CnC',
      description: 'IUP belum atau tidak memperoleh status CnC. Penyebab spesifik perlu diverifikasi pada evaluasi dan riwayat izin.',
      tone: 'red',
      is_cnc: false,
      requires_verification: true,
    };
  }

  return {
    raw,
    category: 'unknown',
    label: raw,
    short_label: 'Perlu Verifikasi',
    description: 'Nilai status tersedia di sumber publik, tetapi belum dikenali oleh mapping CnC saat ini. Perlu verifikasi manual sebelum menyimpulkan status izin.',
    tone: 'gray',
    is_cnc: null,
    requires_verification: true,
  };
};
