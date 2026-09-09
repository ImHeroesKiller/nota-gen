import { useState } from 'react';

interface Asset {
  id: string;
  assetName: string;
  assetCode: string;
  borrower: string;
  department: string;
  borrowDate: string;
  returnDate: string;
  status: 'borrowed' | 'returned' | 'overdue';
  notes: string;
}

export default function AssetTracker() {
  const [assets, setAssets] = useState<Asset[]>([
    {
      id: '1',
      assetName: 'Laptop Dell XPS 15',
      assetCode: 'AST-001',
      borrower: 'Ahmad Fauzi',
      department: 'IT Department',
      borrowDate: '2026-01-05',
      returnDate: '2026-01-12',
      status: 'borrowed',
      notes: 'Untuk project development',
    },
    {
      id: '2',
      assetName: 'Proyektor Epson',
      assetCode: 'AST-002',
      borrower: 'Siti Rahayu',
      department: 'Marketing',
      borrowDate: '2026-01-08',
      returnDate: '2026-01-08',
      status: 'returned',
      notes: 'Untuk presentasi klien',
    },
    {
      id: '3',
      assetName: 'Kamera Canon EOS',
      assetCode: 'AST-003',
      borrower: 'Budi Hartono',
      department: 'HRD',
      borrowDate: '2025-12-20',
      returnDate: '2026-01-05',
      status: 'overdue',
      notes: 'Untuk dokumentasi event',
    },
  ]);

  const [formData, setFormData] = useState({
    assetName: '',
    assetCode: '',
    borrower: '',
    department: '',
    borrowDate: '',
    returnDate: '',
    notes: '',
  });

  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const handleSubmit = () => {
    if (!formData.assetName || !formData.borrower || !formData.borrowDate) return;

    const newAsset: Asset = {
      id: Date.now().toString(),
      ...formData,
      status: 'borrowed',
    };

    setAssets([newAsset, ...assets]);
    setFormData({
      assetName: '',
      assetCode: '',
      borrower: '',
      department: '',
      borrowDate: '',
      returnDate: '',
      notes: '',
    });
    setShowForm(false);
  };

  const handleReturn = (id: string) => {
    setAssets(assets.map(a => 
      a.id === id ? { ...a, status: 'returned', returnDate: new Date().toISOString().split('T')[0] } : a
    ));
  };

  const handleDelete = (id: string) => {
    setAssets(assets.filter(a => a.id !== id));
  };

  const filteredAssets = filterStatus === 'all' 
    ? assets 
    : assets.filter(a => a.status === filterStatus);

  const getStatusBadge = (status: string) => {
    const styles = {
      borrowed: 'bg-blue-100 text-blue-800',
      returned: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const borrowedCount = assets.filter(a => a.status === 'borrowed').length;
  const returnedCount = assets.filter(a => a.status === 'returned').length;
  const overdueCount = assets.filter(a => a.status === 'overdue').length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0A2540] to-[#1E3A5F] flex items-center justify-center">
            <span className="text-white text-xs font-bold">PA</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">Asset Tracker</h1>
            <p className="text-sm text-gray-600">PT Perdana Adi Yuda - Sistem Peminjaman Aset</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Total Aset</div>
          <div className="text-3xl font-bold text-gray-600">{assets.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Sedang Dipinjam</div>
          <div className="text-3xl font-bold text-blue-600">{borrowedCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Sudah Dikembalikan</div>
          <div className="text-3xl font-bold text-green-600">{returnedCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Terlambat</div>
          <div className="text-3xl font-bold text-red-600">{overdueCount}</div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
        >
          {showForm ? 'Batal' : '+ Pinjam Aset Baru'}
        </button>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Semua Status</option>
          <option value="borrowed">Sedang Dipinjam</option>
          <option value="returned">Sudah Dikembalikan</option>
          <option value="overdue">Terlambat</option>
        </select>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Form Peminjaman Aset</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nama Aset *</label>
              <input
                type="text"
                value={formData.assetName}
                onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Nama aset"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Kode Aset</label>
              <input
                type="text"
                value={formData.assetCode}
                onChange={(e) => setFormData({ ...formData, assetCode: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="AST-XXX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Peminjam *</label>
              <input
                type="text"
                value={formData.borrower}
                onChange={(e) => setFormData({ ...formData, borrower: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Nama peminjam"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Departemen</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Departemen"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tanggal Pinjam *</label>
              <input
                type="date"
                value={formData.borrowDate}
                onChange={(e) => setFormData({ ...formData, borrowDate: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tanggal Kembali</label>
              <input
                type="date"
                value={formData.returnDate}
                onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Catatan</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Catatan tambahan"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={!formData.assetName || !formData.borrower || !formData.borrowDate}
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

      {/* Asset Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Aset</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kode</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Peminjam</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Departemen</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tgl Pinjam</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tgl Kembali</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{asset.assetName}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{asset.assetCode || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{asset.borrower}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{asset.department || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{formatDate(asset.borrowDate)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{formatDate(asset.returnDate)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(asset.status)}`}>
                      {asset.status === 'borrowed' ? 'Dipinjam' : asset.status === 'returned' ? 'Dikembalikan' : 'Terlambat'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {asset.status === 'borrowed' && (
                        <button
                          onClick={() => handleReturn(asset.id)}
                          className="text-green-600 hover:text-green-700 text-sm"
                        >
                          Kembalikan
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(asset.id)}
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

      {filteredAssets.length === 0 && (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center mt-6">
          <p className="text-gray-500">Tidak ada data aset</p>
        </div>
      )}
    </div>
  );
}
