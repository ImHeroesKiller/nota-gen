import { useState } from 'react';

export default function PkwtContractBuilder() {
  const [formData, setFormData] = useState({
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
  });

  const [showPreview, setShowPreview] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateDuration = () => {
    if (!formData.startDate || !formData.endDate) return '';
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const months = Math.floor(diffDays / 30);
    return `${months} bulan (${diffDays} hari)`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatCurrency = (amount: string) => {
    const num = parseInt(amount);
    if (isNaN(num)) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num);
  };

  const generateContract = () => {
    setShowPreview(true);
  };

  const printContract = () => {
    window.print();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0A2540] to-[#1E3A5F] flex items-center justify-center">
            <span className="text-white text-xs font-bold">PA</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">PKWT Contract Builder</h1>
            <p className="text-sm text-gray-600">PT Perdana Adi Yuda - Generator Draf Kontrak PKWT</p>
          </div>
        </div>
      </div>

      {!showPreview ? (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Form Input Data Kontrak</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nama Karyawan *</label>
              <input
                type="text"
                name="employeeName"
                value={formData.employeeName}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Nama lengkap karyawan"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">NIK / Employee ID *</label>
              <input
                type="text"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="EMP001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Posisi / Jabatan *</label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Staff Admin"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Nama Klien *</label>
              <input
                type="text"
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="PT ABC Manufacturing"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Alamat Klien</label>
              <textarea
                name="clientAddress"
                value={formData.clientAddress}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Alamat lengkap klien"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tanggal Mulai *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tanggal Berakhir *</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Gaji Pokok per Bulan *</label>
              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="5000000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Lokasi Penempatan *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Jakarta"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Jam Kerja</label>
              <input
                type="text"
                name="workHours"
                value={formData.workHours}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Hari Kerja</label>
              <input
                type="text"
                name="workDays"
                value={formData.workDays}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <button
              onClick={generateContract}
              disabled={!formData.employeeName || !formData.position || !formData.clientName || !formData.startDate || !formData.endDate}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
            >
              Generate Draf Kontrak
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-8 print:shadow-none">
          {/* Contract Header */}
          <div className="border-b-2 border-gray-300 pb-4 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-[#0A2540]">PT PERDANA ADI YUDA</h2>
                <p className="text-sm text-gray-600">Human Capital & Outsourcing Services</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">No. Kontrak:</p>
                <p className="text-sm font-semibold">PKWT/{formData.employeeId}/{new Date().getFullYear()}</p>
              </div>
            </div>
          </div>

          {/* Contract Title */}
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold underline">PERJANJIAN KERJA WAKTU TERTENTU (PKWT)</h3>
          </div>

          {/* Contract Content */}
          <div className="space-y-4 text-sm">
            <p>
              Pada hari ini, {formatDate(new Date().toISOString().split('T')[0])}, yang bertanda tangan di bawah ini:
            </p>

            <div className="pl-4">
              <p><strong>1. PT PERDANA ADI YUDA</strong>, selanjutnya disebut sebagai <strong>"PIHAK PERTAMA"</strong></p>
              <p className="mt-2"><strong>2. {formData.employeeName}</strong> (NIK: {formData.employeeId}), selanjutnya disebut sebagai <strong>"PIHAK KEDUA"</strong></p>
            </div>

            <p className="mt-4">
              Kedua belah pihak sepakat untuk mengikatkan diri dalam Perjanjian Kerja Waktu Tertentu (PKWT) dengan ketentuan sebagai berikut:
            </p>

            <div className="mt-4">
              <h4 className="font-bold mb-2">PASAL 1 - POSISI DAN PENEMPATAN</h4>
              <p>PIHAK KEDUA akan bekerja sebagai <strong>{formData.position}</strong> dan ditempatkan di <strong>{formData.clientName}</strong> yang beralamat di {formData.clientAddress || '-'}, {formData.location || '-'}.</p>
            </div>

            <div className="mt-4">
              <h4 className="font-bold mb-2">PASAL 2 - JANGKA WAKTU</h4>
              <p>Perjanjian ini berlaku untuk jangka waktu <strong>{calculateDuration()}</strong>, terhitung mulai tanggal <strong>{formatDate(formData.startDate)}</strong> sampai dengan <strong>{formatDate(formData.endDate)}</strong>.</p>
            </div>

            <div className="mt-4">
              <h4 className="font-bold mb-2">PASAL 3 - WAKTU KERJA</h4>
              <p>Waktu kerja PIHAK KEDUA adalah <strong>{formData.workDays}</strong>, pukul <strong>{formData.workHours}</strong>, dengan waktu istirahat sesuai ketentuan yang berlaku di lokasi penempatan.</p>
            </div>

            <div className="mt-4">
              <h4 className="font-bold mb-2">PASAL 4 - REMUNERASI</h4>
              <p>PIHAK PERTAMA akan membayar gaji pokok kepada PIHAK KEDUA sebesar <strong>{formatCurrency(formData.salary)}</strong> per bulan, yang akan dibayarkan setiap akhir bulan.</p>
            </div>

            <div className="mt-4">
              <h4 className="font-bold mb-2">PASAL 5 - HAK DAN KEWAJIBAN</h4>
              <p>Kedua belah pihak memiliki hak dan kewajiban sesuai dengan ketentuan peraturan perundang-undangan yang berlaku serta ketentuan yang disepakati dalam perjanjian ini.</p>
            </div>
          </div>

          {/* Signature Section */}
          <div className="mt-12 grid grid-cols-2 gap-8">
            <div className="text-center">
              <p className="font-semibold">PIHAK PERTAMA</p>
              <p className="text-sm text-gray-600">PT PERDANA ADI YUDA</p>
              <div className="h-20"></div>
              <p className="border-t border-gray-400 inline-block px-8">___________________</p>
              <p className="text-xs text-gray-600 mt-1">HRD Manager</p>
            </div>
            <div className="text-center">
              <p className="font-semibold">PIHAK KEDUA</p>
              <p className="text-sm text-gray-600">{formData.employeeName}</p>
              <div className="h-20"></div>
              <p className="border-t border-gray-400 inline-block px-8">___________________</p>
              <p className="text-xs text-gray-600 mt-1">Karyawan</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4 print:hidden">
            <button
              onClick={printContract}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
            >
              Print / Save as PDF
            </button>
            <button
              onClick={() => setShowPreview(false)}
              className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold"
            >
              Edit Kembali
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
