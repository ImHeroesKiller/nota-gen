import { useMemo, useState } from 'react';

interface ContractData {
  employeeName: string;
  employeeId: string;
  position: string;
  clientName: string;
  clientAddress: string;
  startDate: string;
  endDate: string;
  salary: string;
  workHours: string;
  workDays: string;
  location: string;
}

const initialData: ContractData = {
  employeeName: '',
  employeeId: '',
  position: '',
  clientName: '',
  clientAddress: '',
  startDate: '',
  endDate: '',
  salary: '',
  workHours: '08:00 - 17:00',
  workDays: 'Senin - Jumat',
  location: '',
};

export default function PkwtContractBuilder() {
  const [formData, setFormData] = useState<ContractData>(initialData);
  const [showPreview, setShowPreview] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const dateError = useMemo(() => {
    if (!formData.startDate || !formData.endDate) return '';
    return new Date(formData.endDate).getTime() < new Date(formData.startDate).getTime()
      ? 'Tanggal berakhir tidak boleh lebih awal dari tanggal mulai.'
      : '';
  }, [formData.endDate, formData.startDate]);

  const salaryNumber = Number(formData.salary);
  const requiredComplete = Boolean(
    formData.employeeName.trim() &&
    formData.employeeId.trim() &&
    formData.position.trim() &&
    formData.clientName.trim() &&
    formData.startDate &&
    formData.endDate &&
    formData.location.trim() &&
    Number.isFinite(salaryNumber) && salaryNumber > 0
  );
  const canGenerate = requiredComplete && !dateError;

  const duration = useMemo(() => {
    if (!formData.startDate || !formData.endDate || dateError) return '-';
    const start = new Date(`${formData.startDate}T00:00:00`);
    const end = new Date(`${formData.endDate}T00:00:00`);
    const days = Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;
    const months = Math.floor(days / 30);
    return months > 0 ? `${months} bulan (${days} hari kalender)` : `${days} hari kalender`;
  }, [dateError, formData.endDate, formData.startDate]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const formatCurrency = (value: string) => {
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

  return (
    <div className="max-w-7xl mx-auto">
      {!showPreview ? (
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-5 items-start">
          <section className="bg-white border rounded-xl p-5">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h2 className="text-lg font-semibold">Data Kontrak</h2>
                <p className="text-xs text-gray-500 mt-1">Lengkapi data wajib sebelum draf PKWT dapat dibuat.</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${canGenerate ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                {canGenerate ? 'Siap dibuat' : 'Belum lengkap'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label>Nama Karyawan *
                <input name="employeeName" value={formData.employeeName} onChange={handleChange} placeholder="Nama lengkap" />
              </label>
              <label>NIK / Employee ID *
                <input name="employeeId" value={formData.employeeId} onChange={handleChange} placeholder="EMP001" />
              </label>
              <label>Posisi / Jabatan *
                <input name="position" value={formData.position} onChange={handleChange} placeholder="Staff Admin" />
              </label>
              <label>Nama Klien *
                <input name="clientName" value={formData.clientName} onChange={handleChange} placeholder="PT ABC Manufacturing" />
              </label>
              <label className="md:col-span-2">Alamat Klien
                <textarea name="clientAddress" value={formData.clientAddress} onChange={handleChange} rows={2} placeholder="Alamat lengkap klien" />
              </label>
              <label>Tanggal Mulai *
                <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} />
              </label>
              <label>Tanggal Berakhir *
                <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} min={formData.startDate || undefined} />
                {dateError && <span className="block mt-1 text-[10px] text-red-600">{dateError}</span>}
              </label>
              <label>Gaji Pokok / Bulan *
                <input type="number" min={1} name="salary" value={formData.salary} onChange={handleChange} placeholder="5000000" />
              </label>
              <label>Lokasi Penempatan *
                <input name="location" value={formData.location} onChange={handleChange} placeholder="Jakarta" />
              </label>
              <label>Jam Kerja
                <input name="workHours" value={formData.workHours} onChange={handleChange} />
              </label>
              <label>Hari Kerja
                <input name="workDays" value={formData.workDays} onChange={handleChange} />
              </label>
            </div>

            {submitted && !canGenerate && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
                Periksa kembali field wajib, nominal gaji, dan periode kontrak.
              </div>
            )}

            <div className="mt-5 flex justify-end">
              <button type="button" onClick={generateContract} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold">
                Generate Draf Kontrak
              </button>
            </div>
          </section>

          <aside className="bg-white border rounded-xl p-5 xl:sticky xl:top-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500">Contract readiness</p>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-3"><span className="text-gray-500">Karyawan</span><strong className="text-right">{formData.employeeName || '-'}</strong></div>
              <div className="flex justify-between gap-3"><span className="text-gray-500">Klien</span><strong className="text-right">{formData.clientName || '-'}</strong></div>
              <div className="flex justify-between gap-3"><span className="text-gray-500">Durasi</span><strong className="text-right">{duration}</strong></div>
              <div className="flex justify-between gap-3"><span className="text-gray-500">Gaji</span><strong className="text-right text-blue-600">{formatCurrency(formData.salary)}</strong></div>
            </div>
            <div className="mt-5 rounded-lg bg-gray-50 p-3 text-[11px] leading-5 text-gray-600">
              Draf ini adalah template operasional. Review legal dan kebijakan perusahaan tetap diperlukan sebelum kontrak ditandatangani.
            </div>
          </aside>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_260px] gap-5 items-start">
          <article className="a4-page bg-white border rounded-xl p-8 md:p-10 print:border-0 print:p-0">
            <div className="border-b-2 border-slate-300 pb-4 mb-6 flex justify-between gap-4 items-start">
              <div><h2 className="text-xl font-bold text-[#0A2540]">PT PERDANA ADI YUDA</h2><p className="text-xs text-gray-500">Human Capital & Outsourcing Services</p></div>
              <div className="text-right"><p className="text-[10px] text-gray-500">No. Kontrak</p><strong className="text-xs">PKWT/{formData.employeeId}/{new Date().getFullYear()}</strong></div>
            </div>

            <h3 className="text-center text-lg font-bold underline mb-7">PERJANJIAN KERJA WAKTU TERTENTU (PKWT)</h3>
            <div className="space-y-4 text-[12px] leading-6 text-slate-700">
              <p>Pada hari ini, {formatDate(new Date().toISOString().slice(0, 10))}, para pihak sepakat untuk mengikatkan diri dalam Perjanjian Kerja Waktu Tertentu.</p>
              <div className="pl-4 space-y-1"><p><strong>1. PT PERDANA ADI YUDA</strong>, selanjutnya disebut PIHAK PERTAMA.</p><p><strong>2. {formData.employeeName}</strong> (NIK: {formData.employeeId}), selanjutnya disebut PIHAK KEDUA.</p></div>
              <section><h4 className="font-bold">PASAL 1 — POSISI DAN PENEMPATAN</h4><p>PIHAK KEDUA bekerja sebagai <strong>{formData.position}</strong> dan ditempatkan di <strong>{formData.clientName}</strong>, {formData.clientAddress || '-'}, {formData.location}.</p></section>
              <section><h4 className="font-bold">PASAL 2 — JANGKA WAKTU</h4><p>Perjanjian berlaku selama <strong>{duration}</strong>, mulai <strong>{formatDate(formData.startDate)}</strong> sampai <strong>{formatDate(formData.endDate)}</strong>.</p></section>
              <section><h4 className="font-bold">PASAL 3 — WAKTU KERJA</h4><p>Hari kerja: <strong>{formData.workDays}</strong>. Jam kerja: <strong>{formData.workHours}</strong>.</p></section>
              <section><h4 className="font-bold">PASAL 4 — REMUNERASI</h4><p>Gaji pokok sebesar <strong>{formatCurrency(formData.salary)}</strong> per bulan, dibayarkan sesuai siklus payroll perusahaan.</p></section>
              <section><h4 className="font-bold">PASAL 5 — HAK DAN KEWAJIBAN</h4><p>Hak dan kewajiban para pihak mengikuti ketentuan perusahaan, perjanjian kerja, dan peraturan perundang-undangan yang berlaku.</p></section>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-10 text-center text-xs">
              <div><strong>PIHAK PERTAMA</strong><p className="text-gray-500">PT Perdana Adi Yuda</p><div className="h-20" /><div className="border-t border-slate-400 pt-1">HRD Manager</div></div>
              <div><strong>PIHAK KEDUA</strong><p className="text-gray-500">{formData.employeeName}</p><div className="h-20" /><div className="border-t border-slate-400 pt-1">Karyawan</div></div>
            </div>
          </article>

          <aside className="bg-white border rounded-xl p-4 print:hidden xl:sticky xl:top-3">
            <p className="text-xs font-semibold">Draf siap</p>
            <p className="text-[11px] text-gray-500 mt-1">Review isi sebelum mencetak atau menyimpan sebagai PDF.</p>
            <div className="mt-4 grid gap-2">
              <button type="button" onClick={() => window.print()} className="px-4 py-2.5 bg-blue-600 text-white rounded-lg">Print / Save PDF</button>
              <button type="button" onClick={() => setShowPreview(false)} className="px-4 py-2.5 border rounded-lg">Edit Data</button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
