import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, FileText, Settings2 } from 'lucide-react';
import DocumentLetterhead from './DocumentLetterhead';
import { documentTemplateEvents, useDocumentTemplateSettings } from '../lib/documentTemplate';

interface ContractData {
  employeeName: string;
  employeeId: string;
  employeeAddress: string;
  position: string;
  clientName: string;
  clientAddress: string;
  startDate: string;
  endDate: string;
  dailyRate: string;
  expectedDaysPerMonth: string;
  paymentCycle: 'Mingguan' | 'Bulanan';
  workHours: string;
  workDays: string;
  location: string;
}

const initialData: ContractData = {
  employeeName: '',
  employeeId: '',
  employeeAddress: '',
  position: '',
  clientName: '',
  clientAddress: '',
  startDate: '',
  endDate: '',
  dailyRate: '',
  expectedDaysPerMonth: '20',
  paymentCycle: 'Bulanan',
  workHours: '08:00 - 17:00',
  workDays: 'Sesuai kebutuhan operasional / roster',
  location: '',
};

export default function PkwtContractBuilder() {
  const template = useDocumentTemplateSettings();
  const [formData, setFormData] = useState<ContractData>(initialData);
  const [showPreview, setShowPreview] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const dateError = useMemo(() => {
    if (!formData.startDate || !formData.endDate) return '';
    return new Date(formData.endDate).getTime() < new Date(formData.startDate).getTime()
      ? 'Tanggal berakhir tidak boleh lebih awal dari tanggal mulai.'
      : '';
  }, [formData.endDate, formData.startDate]);

  const dailyRateNumber = Number(formData.dailyRate);
  const expectedDays = Number(formData.expectedDaysPerMonth);
  const attendanceError = Number.isFinite(expectedDays) && expectedDays >= 21
    ? 'Perjanjian kerja harian mensyaratkan pekerja bekerja kurang dari 21 hari dalam 1 bulan.'
    : '';
  const companyAddressMissing = !template.companyAddress.trim();

  const requiredComplete = Boolean(
    formData.employeeName.trim() &&
    formData.employeeId.trim() &&
    formData.employeeAddress.trim() &&
    formData.position.trim() &&
    formData.clientName.trim() &&
    formData.startDate &&
    formData.endDate &&
    formData.location.trim() &&
    Number.isFinite(dailyRateNumber) && dailyRateNumber > 0 &&
    Number.isFinite(expectedDays) && expectedDays > 0 && expectedDays < 21 &&
    !companyAddressMissing
  );
  const canGenerate = requiredComplete && !dateError && !attendanceError;

  const duration = useMemo(() => {
    if (!formData.startDate || !formData.endDate || dateError) return '-';
    const start = new Date(`${formData.startDate}T00:00:00`);
    const end = new Date(`${formData.endDate}T00:00:00`);
    const days = Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;
    const months = Math.floor(days / 30);
    return months > 0 ? `${months} bulan (${days} hari kalender)` : `${days} hari kalender`;
  }, [dateError, formData.endDate, formData.startDate]);

  const estimatedMonthly = Number.isFinite(dailyRateNumber) && dailyRateNumber > 0 && Number.isFinite(expectedDays)
    ? dailyRateNumber * expectedDays
    : 0;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    setSubmitted(false);
  };

  const formatDate = (dateValue: string) => {
    if (!dateValue) return '-';
    return new Date(`${dateValue}T00:00:00`).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  };

  const formatCurrency = (value: string | number) => {
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount <= 0) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', maximumFractionDigits: 0,
    }).format(amount);
  };

  const generateContract = () => {
    setSubmitted(true);
    if (canGenerate) setShowPreview(true);
  };

  const openTemplateSettings = () => {
    window.dispatchEvent(new Event(documentTemplateEvents.openSettings));
  };

  const contractNumber = `PHL/${formData.employeeId || 'DRAFT'}/${new Date().getFullYear()}`;

  return (
    <div className="max-w-[1500px] mx-auto px-4 md:px-6 py-5 text-slate-900 dark:text-slate-100">
      {!showPreview ? (
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-5 items-start">
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 md:flex-row md:items-center md:justify-between dark:border-slate-700">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400"><FileText size={15} /> Pekerja Harian Lepas</div>
                <h2 className="mt-1 text-lg font-bold tracking-tight">Data Perjanjian Kerja Harian</h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Upah dihitung per hari berdasarkan kehadiran. Batas operasional template: kurang dari 21 hari kerja per bulan.</p>
              </div>
              <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold ${canGenerate ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'}`}>
                {canGenerate ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                {canGenerate ? 'Siap dibuat' : 'Belum lengkap'}
              </span>
            </div>

            <div className="p-5">
              <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50/70 p-3 text-[11px] leading-5 text-blue-800 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-200">
                Template mengikuti skema perjanjian kerja harian untuk pekerjaan yang waktu/volume kerjanya berubah dan upah dibayar berdasarkan kehadiran. Tetap lakukan review HR/legal sebelum ditandatangani.
              </div>

              <div className="grid grid-cols-1 gap-5">
                <fieldset>
                  <legend className="mb-3 text-xs font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">Identitas Pekerja</legend>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <label className="grid gap-1.5 text-xs font-semibold">Nama Pekerja *
                      <input className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-blue-950" name="employeeName" value={formData.employeeName} onChange={handleChange} placeholder="Nama lengkap" />
                    </label>
                    <label className="grid gap-1.5 text-xs font-semibold">NIK / Employee ID *
                      <input className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-blue-950" name="employeeId" value={formData.employeeId} onChange={handleChange} placeholder="EMP001" />
                    </label>
                    <label className="grid gap-1.5 text-xs font-semibold md:col-span-2">Alamat Pekerja *
                      <textarea className="min-h-20 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-blue-950" name="employeeAddress" value={formData.employeeAddress} onChange={handleChange} placeholder="Alamat sesuai identitas / domisili" />
                    </label>
                  </div>
                </fieldset>

                <fieldset className="border-t border-slate-100 pt-5 dark:border-slate-800">
                  <legend className="mb-3 text-xs font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">Penugasan</legend>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <label className="grid gap-1.5 text-xs font-semibold">Jenis Pekerjaan / Jabatan *
                      <input className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-blue-950" name="position" value={formData.position} onChange={handleChange} placeholder="Operator / Helper / Crew" />
                    </label>
                    <label className="grid gap-1.5 text-xs font-semibold">Nama Klien / Lokasi Project *
                      <input className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-blue-950" name="clientName" value={formData.clientName} onChange={handleChange} placeholder="PT ABC Manufacturing" />
                    </label>
                    <label className="grid gap-1.5 text-xs font-semibold md:col-span-2">Alamat Klien
                      <textarea className="min-h-20 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-blue-950" name="clientAddress" value={formData.clientAddress} onChange={handleChange} placeholder="Alamat lengkap lokasi penugasan" />
                    </label>
                    <label className="grid gap-1.5 text-xs font-semibold">Lokasi Penempatan *
                      <input className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-blue-950" name="location" value={formData.location} onChange={handleChange} placeholder="Morowali / Jakarta / Site A" />
                    </label>
                    <label className="grid gap-1.5 text-xs font-semibold">Hari / Pola Kerja
                      <input className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-blue-950" name="workDays" value={formData.workDays} onChange={handleChange} />
                    </label>
                  </div>
                </fieldset>

                <fieldset className="border-t border-slate-100 pt-5 dark:border-slate-800">
                  <legend className="mb-3 text-xs font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">Periode & Upah Harian</legend>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <label className="grid gap-1.5 text-xs font-semibold">Tanggal Mulai *
                      <input className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950" type="date" name="startDate" value={formData.startDate} onChange={handleChange} />
                    </label>
                    <label className="grid gap-1.5 text-xs font-semibold">Tanggal Berakhir *
                      <input className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950" type="date" name="endDate" value={formData.endDate} onChange={handleChange} min={formData.startDate || undefined} />
                      {dateError && <span className="text-[10px] text-red-600">{dateError}</span>}
                    </label>
                    <label className="grid gap-1.5 text-xs font-semibold">Rate Pekerja / Hari *
                      <input className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950" type="number" min={1} name="dailyRate" value={formData.dailyRate} onChange={handleChange} placeholder="340000" />
                    </label>
                    <label className="grid gap-1.5 text-xs font-semibold">Rencana Hari Kerja / Bulan *
                      <input className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950" type="number" min={1} max={20} name="expectedDaysPerMonth" value={formData.expectedDaysPerMonth} onChange={handleChange} />
                      {attendanceError && <span className="text-[10px] text-red-600">{attendanceError}</span>}
                    </label>
                    <label className="grid gap-1.5 text-xs font-semibold">Siklus Pembayaran
                      <select className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950" name="paymentCycle" value={formData.paymentCycle} onChange={handleChange}>
                        <option>Mingguan</option><option>Bulanan</option>
                      </select>
                    </label>
                    <label className="grid gap-1.5 text-xs font-semibold">Jam Kerja
                      <input className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950" name="workHours" value={formData.workHours} onChange={handleChange} />
                    </label>
                  </div>
                </fieldset>
              </div>

              {submitted && !canGenerate && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-xs text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                  Periksa kembali field wajib, rate harian, batas hari kerja, periode kontrak, serta alamat perusahaan pada Pengaturan Template Dokumen.
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button type="button" onClick={generateContract} className="inline-flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-bold text-white shadow-sm hover:bg-blue-700">
                  <FileText size={17} /> Generate Draf PHL
                </button>
              </div>
            </div>
          </section>

          <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:sticky xl:top-3 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3">
              <div><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Contract readiness</p><h3 className="mt-1 text-sm font-bold">PHL / Daily Worker</h3></div>
              <button type="button" onClick={openTemplateSettings} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800" title="Pengaturan Template Dokumen"><Settings2 size={16} /></button>
            </div>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-3"><span className="text-slate-500">Pekerja</span><strong className="text-right">{formData.employeeName || '-'}</strong></div>
              <div className="flex justify-between gap-3"><span className="text-slate-500">Klien</span><strong className="text-right">{formData.clientName || '-'}</strong></div>
              <div className="flex justify-between gap-3"><span className="text-slate-500">Durasi</span><strong className="text-right">{duration}</strong></div>
              <div className="flex justify-between gap-3"><span className="text-slate-500">Rate / Hari</span><strong className="text-right text-blue-600 dark:text-blue-400">{formatCurrency(formData.dailyRate)}</strong></div>
              <div className="flex justify-between gap-3"><span className="text-slate-500">Estimasi / Bulan</span><strong className="text-right">{estimatedMonthly > 0 ? formatCurrency(estimatedMonthly) : '-'}</strong></div>
              <div className="flex justify-between gap-3"><span className="text-slate-500">Maks. Hari</span><strong className="text-right">{formData.expectedDaysPerMonth || '-'} hari</strong></div>
            </div>

            <div className={`mt-5 rounded-xl border p-3 text-[11px] leading-5 ${companyAddressMissing ? 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200' : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300'}`}>
              {companyAddressMissing ? 'Alamat perusahaan belum diisi. PP 35/2021 mensyaratkan alamat perusahaan/pemberi kerja dicantumkan dalam perjanjian kerja harian.' : `Template dokumen aktif: ${template.companyName}.`}
            </div>
            <button type="button" onClick={openTemplateSettings} className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Atur Logo & Kop Surat</button>
          </aside>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_280px] gap-5 items-start">
          <article className="a4-page mx-auto w-full max-w-[980px] rounded-xl border border-slate-200 bg-white p-8 text-slate-800 shadow-sm md:p-10 print:max-w-none print:border-0 print:p-0 print:shadow-none">
            <DocumentLetterhead settings={template} documentNumber={contractNumber} documentNumberLabel="No. Perjanjian" />

            <div className="mt-7 text-center">
              <h3 className="text-[17px] font-extrabold tracking-wide text-slate-900 underline">PERJANJIAN KERJA HARIAN LEPAS</h3>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Pekerja Harian / Upah Berdasarkan Kehadiran</p>
            </div>

            <div className="mt-7 space-y-5 text-[11px] leading-[1.72] text-slate-700">
              <p>Pada hari ini, <strong>{formatDate(new Date().toISOString().slice(0, 10))}</strong>, para pihak sepakat membuat Perjanjian Kerja Harian Lepas untuk pekerjaan yang sifat waktu dan/atau volume pekerjaannya berubah serta upahnya dibayarkan berdasarkan kehadiran.</p>

              <section>
                <h4 className="mb-1 font-extrabold text-slate-900">PARA PIHAK</h4>
                <ol className="list-decimal space-y-2 pl-5">
                  <li><strong>{template.companyName}</strong>, beralamat di <strong>{template.companyAddress}</strong>, selanjutnya disebut <strong>PIHAK PERTAMA</strong>.</li>
                  <li><strong>{formData.employeeName}</strong>, NIK/ID <strong>{formData.employeeId}</strong>, beralamat di <strong>{formData.employeeAddress}</strong>, selanjutnya disebut <strong>PIHAK KEDUA</strong>.</li>
                </ol>
              </section>

              <section><h4 className="font-extrabold text-slate-900">PASAL 1 — SIFAT HUBUNGAN KERJA</h4><p>PIHAK KEDUA dipekerjakan sebagai <strong>Pekerja Harian Lepas</strong>. Penugasan dilakukan berdasarkan kebutuhan operasional dan kehadiran aktual. Dalam 1 (satu) bulan, pelaksanaan kerja direncanakan kurang dari 21 (dua puluh satu) hari. Apabila PIHAK KEDUA bekerja 21 hari atau lebih selama 3 bulan berturut-turut atau lebih, status hubungan kerja mengikuti konsekuensi hukum yang ditetapkan dalam peraturan ketenagakerjaan yang berlaku.</p></section>

              <section><h4 className="font-extrabold text-slate-900">PASAL 2 — JENIS PEKERJAAN DAN PENEMPATAN</h4><p>PIHAK KEDUA melaksanakan pekerjaan sebagai <strong>{formData.position}</strong> pada penugasan <strong>{formData.clientName}</strong>, berlokasi di <strong>{formData.location}</strong>{formData.clientAddress ? `, ${formData.clientAddress}` : ''}. PIHAK KEDUA wajib melaksanakan pekerjaan sesuai instruksi kerja, SOP, standar mutu, keselamatan, keamanan, dan ketentuan lokasi penugasan.</p></section>

              <section><h4 className="font-extrabold text-slate-900">PASAL 3 — PERIODE PERJANJIAN</h4><p>Perjanjian ini berlaku selama <strong>{duration}</strong>, sejak <strong>{formatDate(formData.startDate)}</strong> sampai dengan <strong>{formatDate(formData.endDate)}</strong>. Periode tersebut tidak menjamin adanya penugasan pada setiap hari; hari kerja ditentukan berdasarkan kebutuhan operasional dan konfirmasi penugasan.</p></section>

              <section><h4 className="font-extrabold text-slate-900">PASAL 4 — UPAH HARIAN DAN PEMBAYARAN</h4><p>Upah PIHAK KEDUA adalah sebesar <strong>{formatCurrency(formData.dailyRate)} per hari kehadiran kerja</strong>. Upah dihitung berdasarkan jumlah hari kerja aktual yang tervalidasi pada timesheet/daftar hadir dan dibayarkan secara <strong>{formData.paymentCycle.toLowerCase()}</strong> sesuai siklus payroll perusahaan. Estimasi {formData.expectedDaysPerMonth} hari kerja adalah <strong>{formatCurrency(estimatedMonthly)}</strong> dan bukan merupakan jaminan pendapatan bulanan.</p></section>

              <section><h4 className="font-extrabold text-slate-900">PASAL 5 — WAKTU KERJA, ISTIRAHAT, DAN LEMBUR</h4><p>Pola kerja: <strong>{formData.workDays}</strong>. Jam kerja normal: <strong>{formData.workHours}</strong>. Waktu istirahat, kerja lembur, dan pembayaran upah lembur mengikuti ketentuan peraturan perundang-undangan, kebijakan perusahaan, serta persetujuan/otorisasi lembur yang berlaku pada lokasi penugasan.</p></section>

              <section><h4 className="font-extrabold text-slate-900">PASAL 6 — KEHADIRAN DAN PENCATATAN WAKTU KERJA</h4><p>PIHAK KEDUA wajib melakukan pencatatan kehadiran sesuai sistem yang ditentukan perusahaan. Hari yang tidak dikerjakan tidak dihitung sebagai hari kerja untuk perhitungan upah harian, kecuali terdapat hak lain yang secara tegas diberikan oleh ketentuan perundang-undangan atau kebijakan perusahaan.</p></section>

              <section><h4 className="font-extrabold text-slate-900">PASAL 7 — HAK NORMATIF DAN JAMINAN SOSIAL</h4><p>PIHAK KEDUA memperoleh hak normatif sesuai ketentuan yang berlaku, termasuk perlindungan keselamatan dan kesehatan kerja, jaminan sosial, THR keagamaan, hak cuti/izin yang relevan, serta uang kompensasi PKWT apabila menurut masa kerja dan ketentuan hukum memenuhi persyaratan.</p></section>

              <section><h4 className="font-extrabold text-slate-900">PASAL 8 — KEWAJIBAN, DISIPLIN, DAN KERAHASIAAN</h4><p>PIHAK KEDUA wajib menjaga disiplin, kerahasiaan informasi perusahaan/klien, menggunakan aset dan alat kerja secara bertanggung jawab, menaati ketentuan K3, tidak menyalahgunakan data atau fasilitas perusahaan, serta segera melaporkan insiden, kehilangan, kecelakaan, atau kondisi tidak aman.</p></section>

              <section><h4 className="font-extrabold text-slate-900">PASAL 9 — BERAKHIRNYA PERJANJIAN</h4><p>Perjanjian berakhir pada tanggal yang ditetapkan, selesainya kebutuhan penugasan sesuai sifat pekerjaan, atau sebab lain yang diperbolehkan oleh peraturan perundang-undangan. Penyelesaian hak dan kewajiban para pihak dilakukan sesuai ketentuan hukum dan administrasi perusahaan.</p></section>

              <section><h4 className="font-extrabold text-slate-900">PASAL 10 — PENYELESAIAN PERSELISIHAN</h4><p>Apabila terjadi perselisihan, para pihak terlebih dahulu menyelesaikannya secara musyawarah/bipartit. Apabila tidak tercapai kesepakatan, penyelesaian dilanjutkan melalui mekanisme hubungan industrial sesuai peraturan perundang-undangan.</p></section>

              <section><h4 className="font-extrabold text-slate-900">PASAL 11 — PENUTUP</h4><p>Perjanjian ini dibuat dalam keadaan sadar, tanpa paksaan, dipahami oleh para pihak, dan menjadi dasar hubungan kerja harian antara PIHAK PERTAMA dan PIHAK KEDUA. Hal yang belum diatur dalam perjanjian ini mengikuti peraturan perusahaan, perjanjian kerja bersama apabila ada, serta peraturan perundang-undangan yang berlaku.</p></section>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-12 text-center text-[10px]">
              <div><strong className="text-slate-900">PIHAK PERTAMA</strong><p className="text-slate-500">{template.companyName}</p><div className="h-20" /><div className="border-t border-slate-400 pt-1 font-semibold">{template.signatoryName || template.signatoryTitle}</div>{template.signatoryName && <div className="text-slate-500">{template.signatoryTitle}</div>}</div>
              <div><strong className="text-slate-900">PIHAK KEDUA</strong><p className="text-slate-500">{formData.employeeName}</p><div className="h-20" /><div className="border-t border-slate-400 pt-1 font-semibold">{formData.employeeName}</div><div className="text-slate-500">Pekerja Harian Lepas</div></div>
            </div>

            {template.showFooter && <footer className="mt-10 border-t border-slate-200 pt-3 text-center text-[8px] text-slate-400">{template.footerText}</footer>}
          </article>

          <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm print:hidden xl:sticky xl:top-3 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400"><CheckCircle2 size={17} /><p className="text-xs font-bold">Draf PHL siap</p></div>
            <p className="mt-2 text-[11px] leading-5 text-slate-500">Review data, ketentuan hukum, dan kebijakan perusahaan sebelum ditandatangani.</p>
            <div className="mt-4 grid gap-2">
              <button type="button" onClick={() => window.print()} className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-bold text-white hover:bg-blue-700">Print / Save PDF</button>
              <button type="button" onClick={() => setShowPreview(false)} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Edit Data</button>
              <button type="button" onClick={openTemplateSettings} className="h-10 rounded-lg border border-slate-200 px-4 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Logo & Kop Surat</button>
            </div>
            <div className="mt-4 rounded-lg bg-slate-50 p-3 text-[10px] leading-5 text-slate-500 dark:bg-slate-800/70 dark:text-slate-400">
              Dasar template: skema perjanjian kerja harian dalam PP 35/2021. Dokumen generator bukan pengganti review legal.
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
