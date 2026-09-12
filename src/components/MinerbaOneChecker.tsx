import { useEffect, useMemo, useRef, useState } from 'react';
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
    status_cnc_badge?: { color: 'green' | 'red'; label: string };
    lokasi: string;
    kode_wiup: string;
  }>;
};

const SOURCE_URL = 'https://minerbaone.esdm.go.id/publik/badan-usaha';

const emptyText = (value: string | undefined) => value?.trim() || '-';

export default function MinerbaOneChecker() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchItem[]>([]);
  const [selected, setSelected] = useState<SearchItem | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [searching, setSearching] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setSearching(true);
      setError('');
      try {
        const response = await fetch(`/api/minerba/search?q=${encodeURIComponent(q)}`, { signal: controller.signal });
        const data = await response.json();
        if (!response.ok) throw new Error(data?.error || 'Gagal mencari data MinerbaOne.');
        setResults(Array.isArray(data) ? data : []);
        setOpen(true);
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          setResults([]);
          setError(err?.message || 'Gagal mencari data MinerbaOne.');
        }
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 450);

    return () => window.clearTimeout(timer);
  }, [query]);

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
    if (!detail) return { valid: 0, invalid: 0 };
    return detail.perizinan.reduce((summary, izin) => {
      if (izin.status_cnc?.trim().toUpperCase() === 'CNC') summary.valid += 1;
      else summary.invalid += 1;
      return summary;
    }, { valid: 0, invalid: 0 });
  }, [detail]);

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
                  Cari badan usaha berdasarkan Nama Badan Usaha, Nomor Izin, atau Kode WIUP. Data ditarik hanya dari halaman publik MinerbaOne ESDM.
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

        <div className="relative p-5">
          <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">Search public registry</label>
          <div className="relative mt-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setSelected(null);
                setDetail(null);
                setOpen(true);
              }}
              onFocus={() => results.length > 0 && setOpen(true)}
              placeholder="Nama Badan Usaha / Nomor Izin / Kode WIUP"
              className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-11 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
            {searching && <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-emerald-600" size={18} />}
          </div>

          {open && query.trim().length >= 2 && (
            <div className="absolute left-5 right-5 top-[112px] z-30 max-h-80 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
              {searching ? (
                <div className="flex items-center gap-2 p-3 text-xs text-slate-500"><Loader2 size={14} className="animate-spin" /> Mencari data publik...</div>
              ) : results.length === 0 ? (
                <div className="p-3 text-xs text-slate-500">Tidak ada data.</div>
              ) : results.map((item) => (
                <button
                  key={item.kode_badan_usaha}
                  type="button"
                  onClick={() => loadDetail(item)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"><Building2 size={16} /></span>
                  <span className="min-w-0 flex-1">
                    <strong className="block truncate text-xs">{item.nama}</strong>
                    <span className="mt-0.5 block truncate text-[10px] text-slate-500">Kode {item.kode_badan_usaha}{item.jenis ? ` · ${item.jenis}` : ''}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" /> {error}
        </div>
      )}

      {loadingDetail && (
        <section className="grid min-h-72 place-items-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="text-center"><Loader2 size={28} className="mx-auto animate-spin text-emerald-600" /><p className="mt-3 text-xs text-slate-500">Mengambil detail badan usaha...</p></div>
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
            <article className={`rounded-2xl border p-4 ${cncSummary.invalid > 0 ? 'border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-500/10' : 'border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/10'}`}>
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500">CnC Indicator</p>
              <strong className={`mt-2 block text-xl ${cncSummary.invalid > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{cncSummary.valid} Valid</strong>
              <span className="mt-1 block text-xs text-slate-500">{cncSummary.invalid} non-CnC</span>
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
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full min-w-[1600px] text-left text-[11px]">
                  <thead className="bg-slate-50 text-[9px] uppercase tracking-wide text-slate-500 dark:bg-slate-950/50">
                    <tr>
                      {['No', 'Nomor Izin', 'Jenis Izin', 'Tahap Kegiatan', 'Golongan', 'Komoditas', 'Luas ha', 'Tanggal Berlaku', 'Tanggal Berakhir', 'Status CNC', 'Lokasi', 'Kode WIUP'].map((header) => <th key={header} className="px-3 py-2.5">{header}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {detail.perizinan.map((row, index) => {
                      const valid = row.status_cnc?.trim().toUpperCase() === 'CNC';
                      return (
                        <tr key={`${row.nomor_izin}-${index}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="px-3 py-3 text-slate-500">{index + 1}</td>
                          <td className="px-3 py-3 font-semibold">{emptyText(row.nomor_izin)}</td>
                          <td className="px-3 py-3">{emptyText(row.jenis_izin)}</td>
                          <td className="px-3 py-3">{emptyText(row.tahap_kegiatan)}</td>
                          <td className="px-3 py-3">{emptyText(row.golongan)}</td>
                          <td className="px-3 py-3">{emptyText(row.komoditas)}</td>
                          <td className="px-3 py-3 text-right">{emptyText(row.luas_ha)}</td>
                          <td className="px-3 py-3">{emptyText(row.tanggal_berlaku)}</td>
                          <td className="px-3 py-3">{emptyText(row.tanggal_berakhir)}</td>
                          <td className="px-3 py-3">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-bold ${valid ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300'}`}>
                              {valid ? <CheckCircle2 size={11} /> : <AlertTriangle size={11} />}
                              {valid ? 'CnC Valid' : 'Non-CnC'}
                            </span>
                          </td>
                          <td className="px-3 py-3">{emptyText(row.lokasi)}</td>
                          <td className="px-3 py-3 font-mono text-[10px]">{emptyText(row.kode_wiup)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </DataSection>
        </>
      )}

      {!detail && !loadingDetail && selected === null && query.trim().length < 2 && (
        <section className="grid min-h-72 place-items-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
          <div><Search size={30} className="mx-auto text-slate-300" /><strong className="mt-3 block text-sm">Cari data badan usaha MinerbaOne</strong><p className="mt-1 text-xs text-slate-500">Ketik minimal 2 karakter pada kolom pencarian.</p></div>
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
