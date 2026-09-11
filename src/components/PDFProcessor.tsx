import { useRef, useState } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  FilePlus2,
  FileText,
  Files,
  Layers,
  Moon,
  Plus,
  RotateCw,
  Scissors,
  Sun,
  Trash2,
  Upload,
} from 'lucide-react';

type PDFOperation = 'compress' | 'merge' | 'add-page' | 'rotate' | 'delete' | 'extract' | 'reorder';

type Props = {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
};

type PdfInfo = {
  name: string;
  pages: number;
  size: number;
};

const operations: Array<{
  key: PDFOperation;
  label: string;
  description: string;
  icon: typeof FileText;
}> = [
  { key: 'compress', label: 'Optimize PDF', description: 'Optimasi struktur file tanpa mengubah isi', icon: FileText },
  { key: 'merge', label: 'Merge PDF', description: 'Gabungkan beberapa PDF menjadi satu', icon: Files },
  { key: 'add-page', label: 'Add Blank Page', description: 'Tambahkan halaman kosong di bagian akhir', icon: FilePlus2 },
  { key: 'rotate', label: 'Rotate Pages', description: 'Rotasi halaman yang dipilih', icon: RotateCw },
  { key: 'delete', label: 'Delete Pages', description: 'Hapus halaman tertentu dengan guard', icon: Trash2 },
  { key: 'extract', label: 'Extract Pages', description: 'Ekstrak halaman terpilih ke PDF baru', icon: Scissors },
  { key: 'reorder', label: 'Reorder Pages', description: 'Atur ulang urutan halaman', icon: Layers },
];

const formatMb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

export default function PDFProcessor({ onBack, darkMode, setDarkMode }: Props) {
  const [operation, setOperation] = useState<PDFOperation>('compress');
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [pdfInfo, setPdfInfo] = useState<PdfInfo[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [rotationAngle, setRotationAngle] = useState(90);
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bg = darkMode ? 'bg-[#0b1220]' : 'bg-[#f6f8fb]';
  const surface = darkMode ? 'bg-[#111827]' : 'bg-white';
  const surfaceMuted = darkMode ? 'bg-[#172033]' : 'bg-[#f8fafc]';
  const border = darkMode ? 'border-[#273449]' : 'border-[#e5eaf1]';
  const text = darkMode ? 'text-[#e5edf8]' : 'text-[#0f172a]';
  const muted = darkMode ? 'text-[#92a3ba]' : 'text-[#64748b]';
  const input = darkMode
    ? 'bg-[#0b1220] border-[#334155] text-[#e5edf8]'
    : 'bg-white border-[#dbe3ee] text-[#0f172a]';
  const hover = darkMode ? 'hover:bg-[#172033]' : 'hover:bg-[#f8fafc]';

  const clearFeedback = () => {
    setError(null);
    setSuccessMsg(null);
    setNotice(null);
  };

  const resetPageState = (pages = 0) => {
    setSelectedPages(new Set());
    setPageOrder(Array.from({ length: pages }, (_, index) => index + 1));
  };

  const changeOperation = (next: PDFOperation) => {
    setOperation(next);
    clearFeedback();

    if (next !== 'merge' && pdfFiles.length > 1) {
      setPdfFiles(pdfFiles.slice(0, 1));
      setPdfInfo(pdfInfo.slice(0, 1));
      resetPageState(pdfInfo[0]?.pages ?? 0);
      setNotice('Operasi ini menggunakan satu file. File pertama dipertahankan.');
      return;
    }

    resetPageState(pdfInfo[0]?.pages ?? 0);
  };

  const handleFileSelect = async (files: FileList | File[]) => {
    clearFeedback();

    const incoming = Array.from(files).filter(
      (file) => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'),
    );

    if (incoming.length === 0) {
      setError('Tidak ada file PDF yang valid.');
      return;
    }

    const candidates = operation === 'merge' ? incoming : incoming.slice(0, 1);
    if (operation !== 'merge' && incoming.length > 1) {
      setNotice('Operasi ini hanya menerima satu PDF. File pertama digunakan.');
    }

    const validFiles: File[] = [];
    const validInfo: PdfInfo[] = [];
    let invalidCount = 0;

    for (const file of candidates) {
      try {
        const buffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(buffer);
        const pages = pdf.getPageCount();
        if (pages < 1) throw new Error('PDF tanpa halaman');
        validFiles.push(file);
        validInfo.push({ name: file.name, pages, size: file.size });
      } catch {
        invalidCount += 1;
      }
    }

    if (validFiles.length === 0) {
      setPdfFiles([]);
      setPdfInfo([]);
      resetPageState();
      setError('PDF tidak dapat dibaca, rusak, atau terenkripsi.');
      return;
    }

    if (invalidCount > 0) {
      setNotice(`${invalidCount} file dilewati karena tidak dapat dibaca.`);
    }

    setPdfFiles(validFiles);
    setPdfInfo(validInfo);
    resetPageState(validInfo[0]?.pages ?? 0);
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const withProcessing = async (task: () => Promise<void>) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await task();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat memproses PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const optimizePdf = () => withProcessing(async () => {
    const file = pdfFiles[0];
    if (!file) throw new Error('Pilih satu file PDF terlebih dahulu.');

    const pdf = await PDFDocument.load(await file.arrayBuffer());
    const bytes = await pdf.save({
      useObjectStreams: true,
      addDefaultPage: false,
      objectsPerTick: 50,
      updateFieldAppearances: false,
    });

    if (bytes.length >= file.size) {
      setSuccessMsg(`PDF sudah cukup optimal. Ukuran hasil ${formatMb(bytes.length)} tidak lebih kecil dari file asli ${formatMb(file.size)}, sehingga file baru tidak dibuat.`);
      return;
    }

    downloadBlob(new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' }), `${file.name.replace(/\.pdf$/i, '')}_optimized.pdf`);
    const reduction = (((file.size - bytes.length) / file.size) * 100).toFixed(1);
    setSuccessMsg(`Optimasi selesai: ${formatMb(file.size)} → ${formatMb(bytes.length)} (${reduction}% lebih kecil).`);
  });

  const mergePdfs = () => withProcessing(async () => {
    if (pdfFiles.length < 2) throw new Error('Pilih minimal dua PDF untuk digabungkan.');
    setProgress({ current: 0, total: pdfFiles.length });

    const merged = await PDFDocument.create();
    for (let index = 0; index < pdfFiles.length; index += 1) {
      const source = await PDFDocument.load(await pdfFiles[index].arrayBuffer());
      const pages = await merged.copyPages(source, source.getPageIndices());
      pages.forEach((page) => merged.addPage(page));
      setProgress({ current: index + 1, total: pdfFiles.length });
    }

    const bytes = await merged.save({ useObjectStreams: true });
    downloadBlob(new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' }), `merged_${new Date().toISOString().slice(0, 10)}.pdf`);
    setSuccessMsg(`${pdfFiles.length} PDF berhasil digabungkan.`);
  });

  const addBlankPage = () => withProcessing(async () => {
    const file = pdfFiles[0];
    if (!file) throw new Error('Pilih satu file PDF terlebih dahulu.');
    const pdf = await PDFDocument.load(await file.arrayBuffer());
    pdf.addPage();
    const bytes = await pdf.save({ useObjectStreams: true });
    downloadBlob(new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' }), `${file.name.replace(/\.pdf$/i, '')}_with_blank_page.pdf`);
    setSuccessMsg('Halaman kosong berhasil ditambahkan di bagian akhir PDF.');
  });

  const validateSelectedPages = () => {
    const totalPages = pdfInfo[0]?.pages ?? 0;
    if (!pdfFiles[0] || totalPages === 0) throw new Error('Pilih satu file PDF terlebih dahulu.');
    if (selectedPages.size === 0) throw new Error('Pilih minimal satu halaman.');
    const pages = Array.from(selectedPages).sort((a, b) => a - b);
    if (pages.some((page) => page < 1 || page > totalPages)) throw new Error('Pilihan halaman tidak valid. Muat ulang file dan coba lagi.');
    return { pages, totalPages };
  };

  const rotatePages = () => withProcessing(async () => {
    const { pages } = validateSelectedPages();
    const file = pdfFiles[0];
    const pdf = await PDFDocument.load(await file.arrayBuffer());
    const sourcePages = pdf.getPages();

    pages.forEach((pageNumber) => {
      const page = sourcePages[pageNumber - 1];
      page.setRotation(degrees((page.getRotation().angle + rotationAngle) % 360));
    });

    const bytes = await pdf.save({ useObjectStreams: true });
    downloadBlob(new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' }), `${file.name.replace(/\.pdf$/i, '')}_rotated.pdf`);
    setSuccessMsg(`${pages.length} halaman berhasil dirotasi ${rotationAngle}°.`);
  });

  const deletePages = () => withProcessing(async () => {
    const { pages, totalPages } = validateSelectedPages();
    if (pages.length >= totalPages) throw new Error('Semua halaman tidak boleh dihapus. Sisakan minimal satu halaman.');

    const file = pdfFiles[0];
    const source = await PDFDocument.load(await file.arrayBuffer());
    const selected = new Set(pages);
    const keepIndexes = source.getPageIndices().filter((index) => !selected.has(index + 1));
    const result = await PDFDocument.create();
    const copied = await result.copyPages(source, keepIndexes);
    copied.forEach((page) => result.addPage(page));

    const bytes = await result.save({ useObjectStreams: true });
    downloadBlob(new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' }), `${file.name.replace(/\.pdf$/i, '')}_pages_removed.pdf`);
    setSuccessMsg(`${pages.length} halaman dihapus. PDF hasil tetap memiliki ${totalPages - pages.length} halaman.`);
  });

  const extractPages = () => withProcessing(async () => {
    const { pages } = validateSelectedPages();
    const file = pdfFiles[0];
    const source = await PDFDocument.load(await file.arrayBuffer());
    const result = await PDFDocument.create();
    const copied = await result.copyPages(source, pages.map((page) => page - 1));
    copied.forEach((page) => result.addPage(page));

    const bytes = await result.save({ useObjectStreams: true });
    downloadBlob(new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' }), `${file.name.replace(/\.pdf$/i, '')}_extracted.pdf`);
    setSuccessMsg(`${pages.length} halaman berhasil diekstrak.`);
  });

  const reorderPages = () => withProcessing(async () => {
    const file = pdfFiles[0];
    const totalPages = pdfInfo[0]?.pages ?? 0;
    if (!file || totalPages === 0) throw new Error('Pilih satu file PDF terlebih dahulu.');

    const unique = new Set(pageOrder);
    if (pageOrder.length !== totalPages || unique.size !== totalPages) {
      throw new Error('Urutan halaman tidak valid. Muat ulang file dan coba lagi.');
    }
    if (pageOrder.some((page) => page < 1 || page > totalPages)) {
      throw new Error('Urutan halaman berada di luar rentang dokumen.');
    }

    const source = await PDFDocument.load(await file.arrayBuffer());
    const result = await PDFDocument.create();
    const copied = await result.copyPages(source, pageOrder.map((page) => page - 1));
    copied.forEach((page) => result.addPage(page));

    const bytes = await result.save({ useObjectStreams: true });
    downloadBlob(new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' }), `${file.name.replace(/\.pdf$/i, '')}_reordered.pdf`);
    setSuccessMsg('Urutan halaman berhasil diperbarui.');
  });

  const togglePageSelection = (page: number) => {
    setSelectedPages((previous) => {
      const next = new Set(previous);
      if (next.has(page)) next.delete(page);
      else next.add(page);
      return next;
    });
  };

  const selectAllPages = () => {
    const total = pdfInfo[0]?.pages ?? 0;
    setSelectedPages(new Set(Array.from({ length: total }, (_, index) => index + 1)));
  };

  const movePage = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= pageOrder.length) return;
    setPageOrder((previous) => {
      const next = [...previous];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const runOperation = () => {
    switch (operation) {
      case 'compress': return optimizePdf();
      case 'merge': return mergePdfs();
      case 'add-page': return addBlankPage();
      case 'rotate': return rotatePages();
      case 'delete': return deletePages();
      case 'extract': return extractPages();
      case 'reorder': return reorderPages();
    }
  };

  const requiresSelection = operation === 'rotate' || operation === 'delete' || operation === 'extract';
  const canProcess = operation === 'merge'
    ? pdfFiles.length >= 2
    : pdfFiles.length === 1 && (!requiresSelection || selectedPages.size > 0);
  const ActiveIcon = operations.find((item) => item.key === operation)?.icon ?? FileText;

  return (
    <div className={`min-h-full flex flex-col ${bg} ${text}`}>
      <header className={`sticky top-0 z-20 flex items-center justify-between gap-3 px-4 py-3 border-b ${surface} ${border}`}>
        <div className="flex items-center gap-3 min-w-0">
          <button type="button" onClick={onBack} className={`w-9 h-9 rounded-lg inline-flex items-center justify-center ${hover}`} aria-label="Kembali">
            <ArrowLeft size={18} />
          </button>
          <div className="w-9 h-9 rounded-lg bg-[#2563eb]/10 text-[#2563eb] inline-flex items-center justify-center shrink-0">
            <FileText size={20} />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold truncate">PDF Processor</h1>
            <p className={`text-[11px] ${muted} truncate`}>Optimasi, merge, rotasi, ekstrak, hapus, dan reorder PDF</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setDarkMode(!darkMode)}
          className={`w-9 h-9 rounded-lg inline-flex items-center justify-center ${hover}`}
          aria-label={darkMode ? 'Aktifkan light mode' : 'Aktifkan dark mode'}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      <div className="flex flex-1 min-h-0 max-lg:flex-col">
        <aside className={`w-[320px] max-lg:w-full shrink-0 border-r max-lg:border-r-0 max-lg:border-b ${surface} ${border}`}>
          <div className="p-4 space-y-5">
            <section>
              <p className={`text-[10px] font-bold tracking-[0.12em] uppercase mb-2 ${muted}`}>Operasi</p>
              <div className="space-y-1.5">
                {operations.map((item) => {
                  const Icon = item.icon;
                  const active = operation === item.key;
                  return (
                    <button
                      type="button"
                      key={item.key}
                      onClick={() => changeOperation(item.key)}
                      className={`w-full flex items-start gap-3 rounded-xl border p-3 text-left transition ${active ? 'border-[#2563eb] bg-[#2563eb]/[0.06]' : `${border} ${hover}`}`}
                    >
                      <span className={`w-8 h-8 rounded-lg inline-flex items-center justify-center shrink-0 ${active ? 'bg-[#2563eb] text-white' : `${surfaceMuted} ${muted}`}`}>
                        <Icon size={17} />
                      </span>
                      <span className="min-w-0">
                        <strong className={`block text-xs ${active ? 'text-[#2563eb]' : text}`}>{item.label}</strong>
                        <small className={`block mt-0.5 text-[10px] leading-4 ${muted}`}>{item.description}</small>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <p className={`text-[10px] font-bold tracking-[0.12em] uppercase mb-2 ${muted}`}>File PDF</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`w-full rounded-xl border-2 border-dashed p-4 text-center transition ${border} ${hover}`}
              >
                <span className="w-10 h-10 mx-auto mb-2 rounded-xl bg-[#2563eb]/10 text-[#2563eb] inline-flex items-center justify-center">
                  <Upload size={19} />
                </span>
                <span className="block text-xs font-semibold">{pdfFiles.length ? `${pdfFiles.length} file dipilih` : 'Pilih file PDF'}</span>
                <span className={`block text-[10px] mt-1 ${muted}`}>{operation === 'merge' ? 'Pilih 2 atau lebih file' : 'Hanya 1 file untuk operasi ini'}</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                multiple={operation === 'merge'}
                className="hidden"
                onChange={(event) => event.target.files && handleFileSelect(event.target.files)}
              />
            </section>

            {pdfInfo.length > 0 && (
              <section className={`rounded-xl border p-3 ${surfaceMuted} ${border}`}>
                <p className={`text-[10px] font-bold tracking-[0.12em] uppercase mb-2 ${muted}`}>File Info</p>
                <div className="space-y-2">
                  {pdfInfo.map((info) => (
                    <div key={`${info.name}-${info.size}`} className="min-w-0">
                      <p className="text-xs font-medium truncate">{info.name}</p>
                      <p className={`text-[10px] ${muted}`}>{info.pages} halaman · {formatMb(info.size)}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {requiresSelection && pdfInfo[0] && (
              <section>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <p className={`text-[10px] font-bold tracking-[0.12em] uppercase ${muted}`}>Pilih Halaman</p>
                  <div className="flex gap-2 text-[10px]">
                    <button type="button" onClick={selectAllPages} className="text-[#2563eb] font-semibold">Semua</button>
                    <button type="button" onClick={() => setSelectedPages(new Set())} className={muted}>Bersihkan</button>
                  </div>
                </div>
                <div className="grid grid-cols-8 gap-1.5 max-h-40 overflow-auto pr-1">
                  {Array.from({ length: pdfInfo[0].pages }, (_, index) => index + 1).map((page) => (
                    <button
                      type="button"
                      key={page}
                      onClick={() => togglePageSelection(page)}
                      className={`aspect-square rounded-md text-[10px] font-semibold border transition ${selectedPages.has(page) ? 'bg-[#2563eb] border-[#2563eb] text-white' : `${surfaceMuted} ${border} ${muted} ${hover}`}`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                {operation === 'delete' && selectedPages.size === pdfInfo[0].pages && (
                  <p className="mt-2 text-[10px] text-amber-600 dark:text-amber-400">Sisakan minimal satu halaman. Semua halaman tidak dapat dihapus sekaligus.</p>
                )}
                {operation === 'rotate' && (
                  <select
                    value={rotationAngle}
                    onChange={(event) => setRotationAngle(Number(event.target.value))}
                    className={`w-full mt-3 px-3 py-2 rounded-lg border text-xs ${input}`}
                  >
                    <option value={90}>90° clockwise</option>
                    <option value={180}>180°</option>
                    <option value={270}>270° clockwise</option>
                  </select>
                )}
              </section>
            )}

            {operation === 'reorder' && pageOrder.length > 0 && (
              <section>
                <p className={`text-[10px] font-bold tracking-[0.12em] uppercase mb-2 ${muted}`}>Urutan Halaman</p>
                <div className="space-y-1 max-h-56 overflow-auto pr-1">
                  {pageOrder.map((page, index) => (
                    <div key={page} className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 ${surfaceMuted} ${border}`}>
                      <span className={`w-5 text-[10px] ${muted}`}>{index + 1}.</span>
                      <span className="flex-1 text-xs">Page {page}</span>
                      <button type="button" disabled={index === 0} onClick={() => movePage(index, -1)} className="w-7 h-7 inline-flex items-center justify-center rounded-md disabled:opacity-25" aria-label="Naikkan halaman"><ChevronUp size={14} /></button>
                      <button type="button" disabled={index === pageOrder.length - 1} onClick={() => movePage(index, 1)} className="w-7 h-7 inline-flex items-center justify-center rounded-md disabled:opacity-25" aria-label="Turunkan halaman"><ChevronDown size={14} /></button>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </aside>

        <main className="flex-1 min-w-0 p-5 md:p-6 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-4">
            <section className={`rounded-2xl border p-5 md:p-6 ${surface} ${border}`}>
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#2563eb]/10 text-[#2563eb] inline-flex items-center justify-center shrink-0">
                  <ActiveIcon size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-[10px] font-bold tracking-[0.12em] uppercase ${muted}`}>PDF Workspace</p>
                  <h2 className="text-xl font-semibold mt-1">{operations.find((item) => item.key === operation)?.label}</h2>
                  <p className={`text-sm mt-1 leading-6 ${muted}`}>{operations.find((item) => item.key === operation)?.description}</p>
                </div>
              </div>

              {operation === 'compress' && (
                <div className={`mt-5 rounded-xl border p-4 ${surfaceMuted} ${border}`}>
                  <p className="text-xs font-semibold">Optimasi aman, bukan recompression gambar</p>
                  <p className={`text-[11px] mt-1 leading-5 ${muted}`}>Tool mengoptimalkan struktur PDF dengan object streams. Jika hasil tidak lebih kecil dari file asli, download dibatalkan agar ukuran file tidak menjadi lebih besar.</p>
                </div>
              )}

              {operation === 'merge' && pdfFiles.length > 0 && (
                <div className={`mt-5 rounded-xl border p-4 ${surfaceMuted} ${border}`}>
                  <p className="text-xs font-semibold">Urutan merge mengikuti urutan file yang dipilih</p>
                  <p className={`text-[11px] mt-1 ${muted}`}>{pdfFiles.map((file) => file.name).join(' → ')}</p>
                </div>
              )}

              {error && (
                <div className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                  <AlertTriangle size={17} className="mt-0.5 shrink-0" />
                  <p className="text-xs leading-5">{error}</p>
                </div>
              )}
              {notice && (
                <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs leading-5 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300">{notice}</div>
              )}
              {successMsg && (
                <div className="mt-5 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
                  <CheckCircle size={17} className="mt-0.5 shrink-0" />
                  <p className="text-xs leading-5">{successMsg}</p>
                </div>
              )}

              {isProcessing && progress.total > 0 && (
                <div className="mt-5">
                  <div className="flex justify-between text-[10px] mb-1.5">
                    <span className={muted}>Processing</span>
                    <span>{progress.current}/{progress.total}</span>
                  </div>
                  <div className={`h-1.5 rounded-full overflow-hidden ${surfaceMuted}`}>
                    <div className="h-full bg-[#2563eb] transition-all" style={{ width: `${Math.min(100, (progress.current / progress.total) * 100)}%` }} />
                  </div>
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={runOperation}
                  disabled={!canProcess || isProcessing}
                  className="min-w-[180px] inline-flex items-center justify-center gap-2 rounded-lg bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Memproses…' : <><Plus size={16} /> Jalankan Proses</>}
                </button>
                {!canProcess && (
                  <span className={`text-[11px] ${muted}`}>
                    {operation === 'merge'
                      ? 'Pilih minimal 2 PDF.'
                      : requiresSelection
                        ? 'Pilih PDF dan minimal 1 halaman.'
                        : 'Pilih 1 PDF untuk melanjutkan.'}
                  </span>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
