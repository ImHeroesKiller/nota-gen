import { useState } from 'react';

interface Visitor {
  id: string;
  name: string;
  company: string;
  purpose: string;
  contactPerson: string;
  checkIn: string;
  checkOut: string;
}

interface VisitorManagementProps {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

export default function VisitorManagement({ onBack, darkMode, setDarkMode }: VisitorManagementProps) {
  const [visitors, setVisitors] = useState<Visitor[]>([
    {
      id: '1',
      name: 'Ahmad Wijaya',
      company: 'PT Maju Jaya',
      purpose: 'Meeting bisnis',
      contactPerson: 'Budi Hartono',
      checkIn: '2026-01-09 09:00',
      checkOut: '2026-01-09 11:30',
    },
    {
      id: '2',
      name: 'Siti Rahayu',
      company: 'CV Karya Utama',
      purpose: 'Interview kerja',
      contactPerson: 'HRD Department',
      checkIn: '2026-01-09 10:15',
      checkOut: '',
    },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    purpose: '',
    contactPerson: '',
    checkIn: '',
    checkOut: '',
  });

  const [showForm, setShowForm] = useState(false);

  const handleSubmit = () => {
    if (!formData.name || !formData.checkIn) return;

    const newVisitor: Visitor = {
      id: Date.now().toString(),
      ...formData,
    };

    setVisitors([newVisitor, ...visitors]);
    setFormData({
      name: '',
      company: '',
      purpose: '',
      contactPerson: '',
      checkIn: '',
      checkOut: '',
    });
    setShowForm(false);
  };

  const handleCheckOut = (id: string) => {
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    setVisitors(visitors.map(v => v.id === id ? { ...v, checkOut: now } : v));
  };

  const handleDelete = (id: string) => {
    setVisitors(visitors.filter(v => v.id !== id));
  };

  const formatDateTime = (dateTime: string) => {
    if (!dateTime) return '-';
    const date = new Date(dateTime.replace(' ', 'T'));
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const activeCount = visitors.filter(v => !v.checkOut).length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0A2540] to-[#1E3A5F] flex items-center justify-center">
            <span className="text-white text-xs font-bold">PA</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">Visitor Management</h1>
            <p className="text-sm text-gray-600">PT Perdana Adi Yuda - Buku Tamu Digital</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Total Pengunjung Hari Ini</div>
          <div className="text-3xl font-bold text-blue-600">{visitors.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Sedang Bertamu</div>
          <div className="text-3xl font-bold text-orange-600">{activeCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Sudah Pulang</div>
          <div className="text-3xl font-bold text-green-600">{visitors.length - activeCount}</div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
        >
          {showForm ? 'Batal' : '+ Tambah Visitor Baru'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Form Tamu Baru</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nama Lengkap *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Nama lengkap tamu"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Instansi/Perusahaan</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Nama instansi/perusahaan"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tujuan Kunjungan</label>
              <input
                type="text"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Tujuan kunjungan"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">PIC yang Ditemui</label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Nama PIC yang ditemui"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Waktu Masuk *</label>
              <input
                type="datetime-local"
                value={formData.checkIn}
                onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Waktu Keluar</label>
              <input
                type="datetime-local"
                value={formData.checkOut}
                onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={!formData.name || !formData.checkIn}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Simpan
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Visitor Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Instansi</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tujuan</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">PIC</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waktu Masuk</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waktu Keluar</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {visitors.map((visitor) => (
                <tr key={visitor.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{visitor.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{visitor.company || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{visitor.purpose || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{visitor.contactPerson || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{formatDateTime(visitor.checkIn)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{formatDateTime(visitor.checkOut)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      visitor.checkOut ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {visitor.checkOut ? 'Selesai' : 'Bertamu'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {!visitor.checkOut && (
                        <button
                          onClick={() => handleCheckOut(visitor.id)}
                          className="text-blue-600 hover:text-blue-700 text-sm"
                        >
                          Check Out
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(visitor.id)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {visitors.length === 0 && (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center mt-6">
          <p className="text-gray-500">Belum ada data tamu</p>
        </div>
      )}
    </div>
  );
}
