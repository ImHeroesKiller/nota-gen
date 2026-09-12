import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Search,
  ShieldCheck,
  Users,
} from 'lucide-react';

type SearchItem = {
  kode_badan_usaha: string;
  nama: string;
  jenis: string;
};

type Detail = {
  informasi: {
    nama_badan_usaha: string;
    kode_badan_usaha: string;
    jenis_badan_usaha: string;
    alamat: string;
    npwp?: string;
  };
  direksi: Array<{
    nama: string;
    jabatan: string;
    mulai_menjabat: string;
    akhir_menjabat: string;
  }>;
  saham: Array<{
    jenis_kepemilikan?: string;
    nama: string;
    kewarganegaraan?: string;
    persentase_saham: string;
  }>;
  perizinan: Array<{
    nomor_izin: string;
    jenis_izin: string;
    tahap_kegiatan: string;
    golongan?: string;
    komoditas: string;
    luas_ha: string;
    tanggal_berlaku: string;
    tanggal_berakhir: string;
    status_cnc: string;
    status_cnc_badge?: { color: 'green' | 'amber' | 'red' | 'gray'; label: string; description?: string };
    lokasi: string;
    kode_wiup: string;
  }>;
};

type CncCategory = 'cnc' | 'cnc-batch' | 'registered' | 'non-cnc' | 'unknown';

type CncStatusMeta = {
  category: CncCategory;
  label: string;
  shortLabel: string;
  description: string;
  badgeClass: string;
  dotClass: string;
};

const SOURCE_URL = 'https://minerbaone.esdm.go.id/publik/badan-usaha';
const emptyText = (value: string | undefined) => value?.trim() || '-';

const CNC_LEGEND: Array<{ code: string; title: string; description: string; badgeClass: string; dotClass: string }> = [
  {
    code: 'CNC',
    title: 'Clean & Clear',
    description: 'Status hasil penataan/evaluasi CnC. Tetap cek masa berlaku izin dan kewajiban terkini.',
    badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300',
    dotClass: 'bg-emerald-500',
  },
  {
    code: 'CNC-XX',
    title: 'CnC Pengumuman',
    description: 'IUP yang sebelumnya diumumkan CnC; angka/romawi menunjukkan angkatan atau pengumuman.',
    badgeClass: 'border-green-200 bg-green-50 text-green-700 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-300',
    dotClass: 'bg-green-500',
  },
  {
    code: 'I.T',
    title: 'IUP Terdaftar',
    description: 'Kategori registrasi untuk IUP Mineral Logam/Batubara berdasarkan putusan pengadilan atau lembaga berwenang terkait. Bukan Non-CnC.',
    badgeClass: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300',
    dotClass: 'bg-amber-500',
  },
  {
    code: 'NON-CNC',
    title: 'Belum / Non-CnC',
    description: 'Belum atau tidak memperoleh status CnC. Alasan spesifik harus dilihat pada evaluasi dan riwayat izin.',
    badgeClass: 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300',
    dotClass: 'bg-red-500',
  },
];

const classifyCncStatus = (rawStatus: string | undefined): CncStatusMeta => {
  const raw = rawStatus?.trim() || '';
  const upper = raw.toUpperCase().replace(/\s+/g, ' ').trim();
  const compact = upper.replace(/\s+/g, '');

  if (!raw) {
    return {
      category: 'unknown',
      label: 'Status tidak tersedia',
      shortLabel: 'Tidak tersedia',
      description: 'Status CnC tidak tersedia pada data publik. Jangan diasumsikan CnC maupun Non-CnC.',
      badgeClass: 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
      dotClass: 'bg-slate-400',
    };
  }

  if (/\bI\.?\s*T\.?\b/i.test(raw) || compact === 'IT' || compact.includes('I.T')) {
    return {
      category: 'registered',
      label: `${raw} · IUP Terdaftar`,
      shortLabel: 'I.T Terdaftar',
      description: 'I.T adalah kategori registrasi MODI untuk IUP Mineral Logam/Batubara yang masuk daftar berdasarkan putusan pengadilan atau lembaga berwenang terkait. Status ini tidak tepat ditampilkan sebagai Non-CnC.',
      badgeClass: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300',
      dotClass: 'bg-amber-500',
    };
  }

  if (/^CNC(?:[-\s]+)(?:\d+|[IVXLCDM]+)$/i.test(raw)) {
    return {
      category: 'cnc-batch',
      label: `${raw} · CnC Pengumuman`,
      shortLabel: raw,
      description: 'IUP pernah diumumkan Clean & Clear pada salah satu pengumuman/angkatan CnC. Nomor atau angka romawi menunjukkan angkatan/pengumuman tersebut.',
      badgeClass: 'border-green-200 bg-green-50 text-green-700 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-300',
      dotClass: 'bg-green-500',
    };
  }

  if (upper === 'CNC' || upper === 'C&C' || upper === 'CNC VALID') {
    return {
      category: 'cnc',
      label: 'CNC · Clean & Clear',
      shortLabel: 'CNC',
      description: 'Clean & Clear menunjukkan status hasil penataan/evaluasi IUP. Kriteria CnC historis mencakup administrasi/kewilayahan, teknis-lingkungan, dan kewajiban keuangan. Tetap cek masa berlaku izin dan kewajiban terkini.',
      badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300',
      dotClass: 'bg-emerald-500',
    };
  }

  if (/NON\s*-?\s*CNC|NONCNC|BELUM.*CNC|TIDAK.*CNC/i.test(upper)) {
    return {
      category: 'non-cnc',
      label: raw,
      shortLabel: 'Non-CnC',
      description: 'IUP belum atau tidak memperoleh status CnC. Penyebab spesifik dapat berkaitan dengan hasil evaluasi administrasi, kewilayahan, teknis/lingkungan, atau kewajiban keuangan dan harus diverifikasi pada dokumen sumber.',
      badgeClass: 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300',
      dotClass: 'bg-red-500',
    };
  }

  return {
    category: 'unknown',
    label: raw,
    shortLabel: raw,
    description: 'Nilai status tersedia di sumber publik, tetapi kategorinya tidak dikenali oleh mapping CnC saat ini. Perlu verifikasi manual sebelum menyimpulkan status izin.',
    badgeClass: 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
    dotClass: 'bg-slate-400',
  };
};

export default function MinerbaOneChecker() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchItem[]>([]);
  const [selected, setSelected] = useState<SearchItem | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [searching, setSearching] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const runSearch = async () => {
    const q = query.trim();
    if (q.length < 2 || searching) return;

    setSearching(true);
    setHasSearched(true);
    setResults([]);
    setSelected(null);
    setDetail(null);
    setError('');
    setOpen(true);

    try {
      const response = await fetch(`/api/minerba/search?q=${encodeURIComponent(q)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Gagal mencari data MinerbaOne.');
      setResults(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setResults([]);
      setError(err?.message || 'Gagal mencari data MinerbaOne.');
    } finally {
      setSearching(false);
    }
  };

  const loadDetail = async (item: SearchItem) => {
    setSelected(item);
    setQuery(item.nama);
    setOpen(false);
    setLoadingDetail(true);
    setDetail(null);
    setError('');
    try {
      const response = await fetch(`/api/minerba/detail?kode=${encodeURIComponent(item.kode_badan_usaha)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Detail tidak ditemukan.');
      setDetail(data);
    } catch (err: any) {
      setError(err?.message || 'Gagal mengambil detail MinerbaOne.');
    } finally {
      setLoadingDetail(false);
    }
  };

  const cncSummary = useMemo(() => {
    const empty = { cnc: 0, registered: 0, nonCnc: 0, unknown: 0 };
    if (!detail) return empty;
    return detail.perizinan.reduce((summary, izin) => {
      const category = classifyCncStatus(izin.status_cnc).category;
      if (category === 'cnc' || category === 'cnc-batch') summary.cnc += 1;
      else if (category === 'registered') summary.registered += 1;
      else if (category === 'non-cnc') summary.nonCnc += 1;
      else summary.unknown += 1;
      return summary;
    }, empty);
  }, [detail]);

  const cncSummaryStyle = cncSummary.nonCnc > 0
    ? 'border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-500/10'
    : cncSummary.registered > 0 && cncSummary.cnc === 0
      ? 'border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/10'
      : cncSummary.unknown > 0 && cncSummary.cnc === 0
        ? 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800'
        : 'border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/10';

  const cncSummaryHeadline = cncSummary.nonCnc > 0
    ? `${cncSummary.nonCnc} Non-CnC`
    : cncSummary.registered > 0 && cncSummary.cnc === 0
      ? `${cncSummary.registered} I.T Terdaftar`
      : `${cncSummary.cnc} CnC`;

  return (
    <div className="mx-auto max-w-[1500px] space-y-5 p-4 text-slate-900 dark:text-slate-100 md:p-6">
      <section className="overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 p-5 dark:border-slate-800">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white">
                <ShieldCheck size={20} />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-600">Public MinerbaOne Data</p>
                <h2 className="mt-1 text-xl font-bold tracking-tight">MinerbaOne Business Checker</h2>
                <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500 dark:text-slate-400">
                  Isi Nama Badan Usaha, Nomor Izin, atau Kode WIUP lalu klik Cari. Detail baru diambil setelah hasil dipilih.
                </p>
              </div>
            </div>
            <a
              href={SOURCE_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Source MinerbaOne <ExternalLink size={14} />
            </a>
          </div>
        </div>

        <form
          className="relative p-5"
          onSubmit={(event) => {
            event.preventDefault();
            void runSearch();
          }}
        >
          <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">Search public registry</label>
          <div className="mt-2 flex gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setResults([]);
                  setSelected(null);
                  setDetail(null);
                  setError('');
                  setOpen(false);
                  setHasSearched(false);
                }}
                onFocus={() => results.length > 0 && setOpen(true)}
                placeholder="Nama Badan Usaha / Nomor Izin / Kode WIUP"
                className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
            <button
              type="submit"
              disabled={query.trim().length < 2 || searching}
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              {searching ? 'Mencari...' : 'Cari'}
            </button>
          </div>
          <p className="mt-2 text-[10px] text-slate-400">Tidak ada request saat mengetik. Search hanya dijalankan saat tombol Cari ditekan atau Enter.</p>

          {open && hasSearched && (
            <div className="absolute left-5 right-5 top-[142px] z-30 max-h-80 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
              {searching ? (
                <div className="flex items-center gap-2 p-3 text-xs text-slate-500"><Loader2 size={14} className="animate-spin" /> Mencari data publik...</div>
              ) : results.length === 0 ? (
                <div className="p-3 text-xs text-slate-500">Tidak ada data.</div>
              ) : results.map((item) => (
                <button
                  key={item.kode_badan_usaha}
                  type="button"
                  onClick={() => void loadDetail(item)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"><Building2 size={16} /></span>
                  <span className="min-w-0 flex-1">
                    <strong className="block truncate text-xs">{item.nama}</strong>
                    <span className="mt-0.5 block truncate text-[10px] text-slate-500">Kode {item.kode_badan_usaha}{item.jenis ? ` · ${item.jenis}` : ''}</span>
                  </span>
                  <span className="rounded-lg border border-slate-200 px-2 py-1 text-[9px] font-bold text-slate-500 dark:border-slate-700">Lihat Detail</span>
                </button>
              ))}
            </div>
          )}
        </form>
      </section>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" /> {error}
        </div>
      )}

      {loadingDetail && (
        <section className="grid min-h-72 place-items-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="text-center"><Loader2 size={28} className="mx-auto animate-spin text-emerald-600" /><p className="mt-3 text-xs text-slate-500">Mengambil detail badan usaha yang dipilih...</p></div>
        </section>
      )}

      {detail && !loadingDetail && (
        <>
          <section className="grid gap-3 md:grid-cols-3">
            <article className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500">Badan Usaha</p>
              <strong className="mt-2 block text-base">{emptyText(detail.informasi.nama_badan_usaha)}</strong>
              <span className="mt-1 block text-xs text-slate-500">{emptyText(detail.informasi.jenis_badan_usaha)} · Kode {emptyText(detail.informasi.kode_badan_usaha)}</span>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500">Perizinan</p>
              <strong className="mt-2 block text-xl">{detail.perizinan.length}</strong>
              <span className="mt-1 block text-xs text-slate-500">izin terdaftar</span>
            </article>
            <article className={`rounded-2xl border p-4 ${cncSummaryStyle}`}>
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500">Status CnC</p>
              <strong className="mt-2 block text-lg">{cncSummaryHeadline}</strong>
              <span className="mt-1 block text-[10px] leading-4 text-slate-500">CnC {cncSummary.cnc} · I.T {cncSummary.registered} · Non-CnC {cncSummary.nonCnc} · Lainnya {cncSummary.unknown}</span>
            </article>
          </section>

          <DataSection title="Informasi Badan Usaha" icon={<Building2 size={17} />}>
            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {[
                    ['Nama Badan Usaha', detail.informasi.nama_badan_usaha],
                    ['Kode Badan Usaha', detail.informasi.kode_badan_usaha],
                    ['Jenis Badan Usaha', detail.informasi.jenis_badan_usaha],
                    ...(detail.informasi.npwp ? [['NPWP', detail.informasi.npwp]] : []),
                    ['Alamat', detail.informasi.alamat],
                  ].map(([label, value]) => (
                    <tr key={label}><th className="w-[220px] bg-slate-50 px-4 py-3 font-semibold text-slate-500 dark:bg-slate-950/50">{label}</th><td className="px-4 py-3">{emptyText(value)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DataSection>

          <DataSection title="Susunan Direksi dan Komisaris" icon={<Users size={17} />}>
            <SimpleTable
              headers={['No', 'Nama Direksi', 'Mulai Menjabat', 'Akhir Menjabat', 'Jabatan']}
              rows={detail.direksi.map((row, index) => [index + 1, row.nama, row.mulai_menjabat, row.akhir_menjabat, row.jabatan])}
            />
          </DataSection>

          <DataSection title="Pemegang Kepemilikan Saham" icon={<Users size={17} />}>
            <SimpleTable
              headers={['No', 'Jenis Kepemilikan', 'Nama', 'Kewarganegaraan', 'Persentase Saham']}
              rows={detail.saham.map((row, index) => [index + 1, row.jenis_kepemilikan || '-', row.nama, row.kewarganegaraan || '-', row.persentase_saham])}
            />
          </DataSection>

          <DataSection title="Daftar Perizinan" icon={<ShieldCheck size={17} />}>
            {detail.perizinan.length === 0 ? <Empty /> : (
              <div className="space-y-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/40">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <strong className="text-[11px]">Keterangan kategori status CnC</strong>
                      <p className="mt-0.5 text-[10px] leading-4 text-slate-500 dark:text-slate-400">Interpretasi membantu membaca nilai status dari MinerbaOne. Status CnC bukan pengganti pengecekan masa berlaku izin, RKAB, PNBP, dan kewajiban lain yang berlaku saat ini.</p>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                    {CNC_LEGEND.map((item) => (
                      <div key={item.code} className="rounded-lg border border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 shrink-0 rounded-full ${item.dotClass}`} />
                          <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold ${item.badgeClass}`}>{item.code}</span>
                          <strong className="text-[10px]">{item.title}</strong>
                        </div>
                        <p className="mt-2 text-[9px] leading-4 text-slate-500 dark:text-slate-400">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full min-w-[1750px] text-left text-[11px]">
                    <thead className="bg-slate-50 text-[9px] uppercase tracking-wide text-slate-500 dark:bg-slate-950/50">
                      <tr>
                        {['No', 'Nomor Izin', 'Jenis Izin', 'Tahap Kegiatan', 'Golongan', 'Komoditas', 'Luas ha', 'Tanggal Berlaku', 'Tanggal Berakhir', 'Status CNC', 'Lokasi', 'Kode WIUP'].map((header) => <th key={header} className="px-3 py-2.5">{header}</th>)}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {detail.perizinan.map((row, index) => {
                        const cnc = classifyCncStatus(row.status_cnc);
                        return (
                          <tr key={`${row.nomor_izin}-${index}`} className="align-top hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="px-3 py-3 text-slate-500">{index + 1}</td>
                            <td className="px-3 py-3 font-semibold">{emptyText(row.nomor_izin)}</td>
                            <td className="px-3 py-3">{emptyText(row.jenis_izin)}</td>
                            <td className="px-3 py-3">{emptyText(row.tahap_kegiatan)}</td>
                            <td className="px-3 py-3">{emptyText(row.golongan)}</td>
                            <td className="px-3 py-3">{emptyText(row.komoditas)}</td>
                            <td className="px-3 py-3 text-right">{emptyText(row.luas_ha)}</td>
                            <td className="px-3 py-3">{emptyText(row.tanggal_berlaku)}</td>
                            <td className="px-3 py-3">{emptyText(row.tanggal_berakhir)}</td>
                            <td className="w-[300px] px-3 py-3">
                              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[9px] font-bold ${cnc.badgeClass}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${cnc.dotClass}`} />
                                {cnc.label}
                              </span>
                              <p className="mt-1.5 max-w-[290px] text-[9px] leading-4 text-slate-500 dark:text-slate-400">{cnc.description}</p>
                            </td>
                            <td className="px-3 py-3">{emptyText(row.lokasi)}</td>
                            <td className="px-3 py-3 font-mono text-[10px]">{emptyText(row.kode_wiup)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </DataSection>
        </>
      )}

      {!detail && !loadingDetail && selected === null && !hasSearched && (
        <section className="grid min-h-72 place-items-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
          <div><Search size={30} className="mx-auto text-slate-300" /><strong className="mt-3 block text-sm">Cari data badan usaha MinerbaOne</strong><p className="mt-1 text-xs text-slate-500">Isi kata kunci lalu klik Cari. Detail tidak akan diambil sebelum Anda memilih hasil.</p></div>
        </section>
      )}
    </div>
  );
}

function DataSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <span className="text-emerald-600">{icon}</span><h3 className="text-sm font-bold">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function SimpleTable({ headers, rows }: { headers: string[]; rows: Array<Array<string | number>> }) {
  if (rows.length === 0) return <Empty />;
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
      <table className="w-full min-w-[820px] text-left text-[11px]">
        <thead className="bg-slate-50 text-[9px] uppercase tracking-wide text-slate-500 dark:bg-slate-950/50">
          <tr>{headers.map((header) => <th key={header} className="px-3 py-2.5">{header}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {rows.map((row, index) => <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">{row.map((cell, cellIndex) => <td key={cellIndex} className="px-3 py-3">{emptyText(String(cell ?? ''))}</td>)}</tr>)}
        </tbody>
      </table>
    </div>
  );
}

function Empty() {
  return <div className="rounded-xl bg-slate-50 p-4 text-center text-xs text-slate-500 dark:bg-slate-800">Tidak ada data.</div>;
}
