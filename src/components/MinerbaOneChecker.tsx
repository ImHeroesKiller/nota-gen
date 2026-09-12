import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ChevronRight,
  Database,
  ExternalLink,
  FileText,
  Loader2,
  MapPin,
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

const formatArea = (value: string | undefined) => {
  const parsed = Number(value);
  if (!value || Number.isNaN(parsed)) return emptyText(value);
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(parsed);
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
    ? 'border-red-400/20 bg-red-500/10 text-red-200'
    : cncSummary.registered > 0 && cncSummary.cnc === 0
      ? 'border-amber-400/20 bg-amber-500/10 text-amber-200'
      : cncSummary.unknown > 0 && cncSummary.cnc === 0
        ? 'border-slate-500/30 bg-slate-500/10 text-slate-200'
        : 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200';

  const cncSummaryHeadline = cncSummary.nonCnc > 0
    ? `${cncSummary.nonCnc} Non-CnC`
    : cncSummary.registered > 0 && cncSummary.cnc === 0
      ? `${cncSummary.registered} I.T Terdaftar`
      : `${cncSummary.cnc} CnC`;

  return (
    <div className="mx-auto max-w-[1580px] space-y-5 p-3 text-slate-900 dark:text-slate-100 sm:p-5 lg:p-6">
      <section className="relative overflow-visible rounded-[26px] border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0b111a] dark:shadow-[0_24px_80px_rgba(0,0,0,.28)]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[26px]">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute left-1/3 top-0 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
        </div>

        <div className="relative grid gap-5 border-b border-slate-200 p-5 dark:border-white/8 lg:grid-cols-[minmax(0,1fr)_auto] lg:p-7">
          <div className="flex min-w-0 items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500 to-cyan-600 text-white shadow-lg shadow-emerald-500/15">
              <ShieldCheck size={22} />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">Public Mining Registry</p>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/30 bg-emerald-500/8 px-2 py-1 text-[9px] font-bold text-emerald-700 dark:text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Public Data
                </span>
              </div>
              <h2 className="mt-1.5 text-2xl font-extrabold tracking-[-0.04em] text-slate-950 dark:text-white sm:text-3xl">MinerbaOne Business Checker</h2>
              <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-500 dark:text-slate-400 sm:text-sm sm:leading-6">
                Cek profil badan usaha, direksi, pemegang saham, izin tambang, WIUP, dan interpretasi status CnC dari data publik MinerbaOne.
              </p>
            </div>
          </div>

          <a
            href={SOURCE_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-[10px] font-bold text-slate-600 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:text-emerald-700 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:border-emerald-400/30 dark:hover:text-emerald-300"
          >
            Buka sumber resmi <ExternalLink size={13} />
          </a>
        </div>

        <form
          className="relative p-5 lg:p-7"
          onSubmit={(event) => {
            event.preventDefault();
            void runSearch();
          }}
        >
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Pencarian badan usaha</label>
              <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">Fetch hanya dijalankan setelah klik Cari atau Enter.</p>
            </div>
            {hasSearched && !searching && (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[9px] font-bold text-slate-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400">
                {results.length} hasil
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
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
                className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 dark:border-white/10 dark:bg-white/[0.035] dark:text-white dark:placeholder:text-slate-600 dark:focus:border-emerald-400/50 dark:focus:bg-white/[0.05]"
              />
            </div>
            <button
              type="submit"
              disabled={query.trim().length < 2 || searching}
              className="inline-flex h-14 shrink-0 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-600 px-6 text-xs font-extrabold text-white shadow-lg shadow-emerald-500/15 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0 sm:min-w-[120px]"
            >
              {searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              {searching ? 'Mencari...' : 'Cari Data'}
            </button>
          </div>

          {open && hasSearched && (
            <div className="absolute left-5 right-5 top-[132px] z-30 max-h-[420px] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-950/15 dark:border-white/10 dark:bg-[#0f1722] dark:shadow-black/40 lg:left-7 lg:right-7 lg:top-[144px] scrollbar-thin">
              <div className="flex items-center justify-between px-2.5 py-2">
                <span className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-slate-400">Search Results</span>
                {!searching && <span className="text-[9px] font-bold text-slate-400">Klik satu badan usaha untuk membuka detail</span>}
              </div>
              {searching ? (
                <div className="flex items-center gap-2 rounded-xl p-4 text-xs text-slate-500 dark:text-slate-400"><Loader2 size={14} className="animate-spin" /> Mencari data publik MinerbaOne...</div>
              ) : results.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-5 text-center text-xs text-slate-500 dark:border-white/10 dark:text-slate-400">Tidak ada data yang cocok.</div>
              ) : results.map((item) => (
                <button
                  key={item.kode_badan_usaha}
                  type="button"
                  onClick={() => void loadDetail(item)}
                  className="group flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-left transition hover:border-emerald-200 hover:bg-emerald-50/70 dark:hover:border-emerald-400/15 dark:hover:bg-emerald-500/[0.06]"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/15 dark:bg-emerald-500/10 dark:text-emerald-300"><Building2 size={17} /></span>
                  <span className="min-w-0 flex-1">
                    <strong className="block truncate text-xs font-bold text-slate-900 dark:text-slate-100">{item.nama}</strong>
                    <span className="mt-1 block truncate text-[10px] text-slate-500 dark:text-slate-400">Kode {item.kode_badan_usaha}{item.jenis ? ` · ${item.jenis}` : ''}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[9px] font-bold text-slate-400 transition group-hover:text-emerald-700 dark:group-hover:text-emerald-300">Detail <ChevronRight size={12} /></span>
                </button>
              ))}
            </div>
          )}
        </form>
      </section>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-500/8 p-4 text-xs text-red-700 dark:text-red-300">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-red-500/10"><AlertTriangle size={16} /></span>
          <div><strong className="block font-bold">Data tidak dapat dimuat</strong><span className="mt-1 block leading-5 opacity-85">{error}</span></div>
        </div>
      )}

      {loadingDetail && (
        <section className="grid min-h-[340px] place-items-center overflow-hidden rounded-[26px] border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0b111a]">
          <div className="text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-emerald-400/20 bg-emerald-500/10 text-emerald-500"><Loader2 size={24} className="animate-spin" /></span>
            <strong className="mt-4 block text-sm">Mengambil detail badan usaha</strong>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Request detail dijalankan hanya untuk hasil yang Anda pilih.</p>
          </div>
        </section>
      )}

      {detail && !loadingDetail && (
        <>
          <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0b111a]">
            <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,.65fr)] lg:p-6">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.1em] text-slate-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400">Selected Business</span>
                  <span className="rounded-full border border-emerald-300/30 bg-emerald-500/8 px-2.5 py-1 text-[9px] font-bold text-emerald-700 dark:text-emerald-300">Kode {emptyText(detail.informasi.kode_badan_usaha)}</span>
                </div>
                <h3 className="mt-3 truncate text-xl font-extrabold tracking-[-0.035em] text-slate-950 dark:text-white sm:text-2xl">{emptyText(detail.informasi.nama_badan_usaha)}</h3>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1.5"><Building2 size={13} /> {emptyText(detail.informasi.jenis_badan_usaha)}</span>
                  <span className="inline-flex items-center gap-1.5"><MapPin size={13} /> {emptyText(detail.informasi.alamat)}</span>
                </div>
              </div>

              <div className={`rounded-2xl border p-4 ${cncSummaryStyle}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] opacity-70">Primary CnC Indicator</p>
                    <strong className="mt-1.5 block text-lg font-extrabold">{cncSummaryHeadline}</strong>
                  </div>
                  <CheckCircle2 size={20} className="opacity-80" />
                </div>
                <p className="mt-2 text-[10px] leading-4 opacity-75">CnC {cncSummary.cnc} · I.T {cncSummary.registered} · Non-CnC {cncSummary.nonCnc} · Verifikasi {cncSummary.unknown}</p>
              </div>
            </div>
          </section>

          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard icon={<FileText size={17} />} label="Perizinan" value={String(detail.perizinan.length)} helper="izin terdaftar" tone="emerald" />
            <MetricCard icon={<Users size={17} />} label="Direksi & Komisaris" value={String(detail.direksi.length)} helper="pengurus tercatat" tone="blue" />
            <MetricCard icon={<Users size={17} />} label="Pemegang Saham" value={String(detail.saham.length)} helper="pemilik tercatat" tone="violet" />
            <MetricCard icon={<ShieldCheck size={17} />} label="CnC Valid" value={String(cncSummary.cnc)} helper="izin berstatus CnC" tone="cyan" />
          </section>

          <DataSection number="01" title="Informasi Badan Usaha" subtitle="Identitas dasar badan usaha pada data publik MinerbaOne" icon={<Building2 size={17} />}>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <InfoCard label="Nama Badan Usaha" value={detail.informasi.nama_badan_usaha} />
              <InfoCard label="Kode Badan Usaha" value={detail.informasi.kode_badan_usaha} mono />
              <InfoCard label="Jenis Badan Usaha" value={detail.informasi.jenis_badan_usaha} />
              {detail.informasi.npwp && <InfoCard label="NPWP" value={detail.informasi.npwp} mono />}
              <div className="md:col-span-2 xl:col-span-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/8 dark:bg-white/[0.025]">
                <span className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-slate-400">Alamat</span>
                <p className="mt-2 text-xs font-medium leading-5 text-slate-700 dark:text-slate-300">{emptyText(detail.informasi.alamat)}</p>
              </div>
            </div>
          </DataSection>

          <DataSection number="02" title="Susunan Direksi & Komisaris" subtitle="Pengurus yang tercatat pada badan usaha" icon={<Users size={17} />} count={detail.direksi.length}>
            <SimpleTable
              headers={['No', 'Nama Direksi', 'Mulai Menjabat', 'Akhir Menjabat', 'Jabatan']}
              rows={detail.direksi.map((row, index) => [index + 1, row.nama, row.mulai_menjabat, row.akhir_menjabat, row.jabatan])}
            />
          </DataSection>

          <DataSection number="03" title="Pemegang Kepemilikan Saham" subtitle="Komposisi kepemilikan yang tersedia pada data publik" icon={<Users size={17} />} count={detail.saham.length}>
            <SimpleTable
              headers={['No', 'Jenis Kepemilikan', 'Nama', 'Kewarganegaraan', 'Persentase Saham']}
              rows={detail.saham.map((row, index) => [index + 1, row.jenis_kepemilikan || '-', row.nama, row.kewarganegaraan || '-', row.persentase_saham])}
            />
          </DataSection>

          <DataSection number="04" title="Daftar Perizinan" subtitle="Izin, lokasi, WIUP, periode berlaku, dan interpretasi status CnC" icon={<ShieldCheck size={17} />} count={detail.perizinan.length}>
            {detail.perizinan.length === 0 ? <Empty /> : (
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-white/8 dark:bg-white/[0.025]">
                  <div className="flex items-start gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-cyan-300/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300"><Database size={14} /></span>
                    <div>
                      <strong className="text-[11px]">Kategori status CnC</strong>
                      <p className="mt-1 max-w-5xl text-[10px] leading-4 text-slate-500 dark:text-slate-400">Status CnC membantu membaca hasil penataan izin, tetapi bukan kesimpulan due diligence final. Tetap cek masa berlaku, RKAB, PNBP, sanksi, pencabutan, serta kewajiban teknis-lingkungan terkini.</p>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                    {CNC_LEGEND.map((item) => (
                      <div key={item.code} className="rounded-xl border border-slate-200 bg-white p-3 dark:border-white/8 dark:bg-[#0e151f]">
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 shrink-0 rounded-full ${item.dotClass}`} />
                          <span className={`rounded-full border px-2 py-0.5 text-[9px] font-extrabold ${item.badgeClass}`}>{item.code}</span>
                          <strong className="truncate text-[10px]">{item.title}</strong>
                        </div>
                        <p className="mt-2 text-[9px] leading-4 text-slate-500 dark:text-slate-400">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/8 scrollbar-thin">
                  <table className="w-full min-w-[1750px] text-left text-[11px]">
                    <thead className="sticky top-0 z-10 bg-slate-100/95 text-[9px] font-extrabold uppercase tracking-[0.08em] text-slate-500 backdrop-blur dark:bg-[#101822]/95 dark:text-slate-400">
                      <tr>
                        {['No', 'Nomor Izin', 'Jenis Izin', 'Tahap Kegiatan', 'Golongan', 'Komoditas', 'Luas ha', 'Tanggal Berlaku', 'Tanggal Berakhir', 'Status CNC', 'Lokasi', 'Kode WIUP'].map((header) => <th key={header} className="whitespace-nowrap px-3 py-3">{header}</th>)}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/6">
                      {detail.perizinan.map((row, index) => {
                        const cnc = classifyCncStatus(row.status_cnc);
                        return (
                          <tr key={`${row.nomor_izin}-${index}`} className="align-top transition hover:bg-slate-50 dark:hover:bg-white/[0.025]">
                            <td className="px-3 py-3.5 text-slate-400">{String(index + 1).padStart(2, '0')}</td>
                            <td className="px-3 py-3.5 font-bold text-slate-900 dark:text-white">{emptyText(row.nomor_izin)}</td>
                            <td className="px-3 py-3.5">{emptyText(row.jenis_izin)}</td>
                            <td className="px-3 py-3.5">{emptyText(row.tahap_kegiatan)}</td>
                            <td className="px-3 py-3.5">{emptyText(row.golongan)}</td>
                            <td className="px-3 py-3.5 font-semibold">{emptyText(row.komoditas)}</td>
                            <td className="px-3 py-3.5 text-right font-mono text-[10px]">{formatArea(row.luas_ha)}</td>
                            <td className="px-3 py-3.5 whitespace-nowrap">{emptyText(row.tanggal_berlaku)}</td>
                            <td className="px-3 py-3.5 whitespace-nowrap">{emptyText(row.tanggal_berakhir)}</td>
                            <td className="w-[320px] px-3 py-3.5">
                              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-extrabold ${cnc.badgeClass}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${cnc.dotClass}`} />
                                {cnc.label}
                              </span>
                              <p className="mt-2 max-w-[300px] text-[9px] leading-4 text-slate-500 dark:text-slate-400">{cnc.description}</p>
                            </td>
                            <td className="px-3 py-3.5">{emptyText(row.lokasi)}</td>
                            <td className="px-3 py-3.5 font-mono text-[10px] text-cyan-700 dark:text-cyan-300">{emptyText(row.kode_wiup)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </DataSection>

          <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-[10px] text-slate-500 dark:border-white/8 dark:bg-white/[0.025] dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <span>Data bersumber dari halaman publik MinerbaOne dan ditampilkan untuk membantu pemeriksaan awal.</span>
            <a href={SOURCE_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-bold text-emerald-700 hover:underline dark:text-emerald-300">Verifikasi di sumber resmi <ExternalLink size={11} /></a>
          </div>
        </>
      )}

      {!detail && !loadingDetail && selected === null && !hasSearched && (
        <section className="relative grid min-h-[360px] place-items-center overflow-hidden rounded-[26px] border border-dashed border-slate-300 bg-white p-8 text-center dark:border-white/10 dark:bg-[#0b111a]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,.07),transparent_48%)]" />
          <div className="relative max-w-md">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-400 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-500"><Search size={24} /></span>
            <strong className="mt-4 block text-sm font-bold text-slate-900 dark:text-white">Mulai pemeriksaan badan usaha</strong>
            <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">Masukkan nama perusahaan, nomor izin, atau kode WIUP. Sistem tidak melakukan fetch apa pun sebelum Anda menekan Cari.</p>
          </div>
        </section>
      )}
    </div>
  );
}

function MetricCard({ icon, label, value, helper, tone }: { icon: React.ReactNode; label: string; value: string; helper: string; tone: 'emerald' | 'blue' | 'violet' | 'cyan' }) {
  const tones = {
    emerald: 'border-emerald-300/20 bg-emerald-500/8 text-emerald-600 dark:text-emerald-300',
    blue: 'border-blue-300/20 bg-blue-500/8 text-blue-600 dark:text-blue-300',
    violet: 'border-violet-300/20 bg-violet-500/8 text-violet-600 dark:text-violet-300',
    cyan: 'border-cyan-300/20 bg-cyan-500/8 text-cyan-600 dark:text-cyan-300',
  } as const;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/8 dark:bg-[#0b111a]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-slate-400">{label}</p>
          <strong className="mt-2 block text-2xl font-extrabold tracking-[-0.04em] text-slate-950 dark:text-white">{value}</strong>
          <span className="mt-1 block text-[10px] text-slate-500 dark:text-slate-400">{helper}</span>
        </div>
        <span className={`grid h-9 w-9 place-items-center rounded-xl border ${tones[tone]}`}>{icon}</span>
      </div>
    </article>
  );
}

function InfoCard({ label, value, mono = false }: { label: string; value: string | undefined; mono?: boolean }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/8 dark:bg-white/[0.025]">
      <span className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-slate-400">{label}</span>
      <strong className={`mt-2 block text-xs font-bold text-slate-900 dark:text-slate-100 ${mono ? 'font-mono' : ''}`}>{emptyText(value)}</strong>
    </div>
  );
}

function DataSection({ number, title, subtitle, icon, count, children }: { number: string; title: string; subtitle: string; icon: React.ReactNode; count?: number; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0b111a]">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 dark:border-white/8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-emerald-300/20 bg-emerald-500/8 text-emerald-700 dark:text-emerald-300">{icon}</span>
          <div>
            <div className="flex items-center gap-2"><span className="text-[9px] font-extrabold tracking-[0.14em] text-slate-400">{number}</span><h3 className="text-sm font-extrabold tracking-[-0.02em] text-slate-900 dark:text-white">{title}</h3></div>
            <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">{subtitle}</p>
          </div>
        </div>
        {typeof count === 'number' && <span className="self-start rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[9px] font-bold text-slate-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400 sm:self-auto">{count} record</span>}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

function SimpleTable({ headers, rows }: { headers: string[]; rows: Array<Array<string | number>> }) {
  if (rows.length === 0) return <Empty />;
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/8 scrollbar-thin">
      <table className="w-full min-w-[820px] text-left text-[11px]">
        <thead className="bg-slate-100/95 text-[9px] font-extrabold uppercase tracking-[0.08em] text-slate-500 dark:bg-[#101822]/95 dark:text-slate-400">
          <tr>{headers.map((header) => <th key={header} className="whitespace-nowrap px-3 py-3">{header}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-white/6">
          {rows.map((row, index) => <tr key={index} className="transition hover:bg-slate-50 dark:hover:bg-white/[0.025]">{row.map((cell, cellIndex) => <td key={cellIndex} className={`px-3 py-3.5 ${cellIndex === 1 ? 'font-semibold text-slate-900 dark:text-white' : ''}`}>{emptyText(String(cell ?? ''))}</td>)}</tr>)}
        </tbody>
      </table>
    </div>
  );
}

function Empty() {
  return (
    <div className="grid min-h-28 place-items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center dark:border-white/10 dark:bg-white/[0.025]">
      <div><Database size={18} className="mx-auto text-slate-300 dark:text-slate-600" /><p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">Tidak ada data.</p></div>
    </div>
  );
}
