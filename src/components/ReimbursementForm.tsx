import { useState } from 'react';

interface ReimbursementItem {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  receipt: string;
}

interface ReimbursementSubmission {
  id: string;
  employeeName: string;
  department: string;
  date: string;
  items: ReimbursementItem[];
  total: number;
  status: 'pending' | 'approved' | 'rejected';
  notes: string;
}

export default function ReimbursementForm() {
  const [submissions, setSubmissions] = useState<ReimbursementSubmission[]>([
    {
      id: '1',
      employeeName: 'Ahmad Fauzi',
      department: 'Sales',
      date: '2026-01-08',
      items: [
        { id: '1', category: 'Bensin', description: 'Perjalanan ke klien', amount: 150000, date: '2026-01-07', receipt: 'struk1.jpg' },
        { id: '2', category: 'Tol', description: 'Tol Jakarta-Bandung', amount: 75000, date: '2026-01-07', receipt: 'struk2.jpg' },
      ],
      total: 225000,
      status: 'approved',
      notes: 'Kunjungan klien di Bandung',
    },
    {
      id: '2',
      employeeName: 'Siti Rahayu',
      department: 'Marketing',
      date: '2026-01-09',
      items: [
        { id: '3', category: 'Makan', description: 'Meeting dengan klien', amount: 200000, date: '2026-01-09', receipt: 'struk4.jpg' },
      ],
      total: 200000,
      status: 'pending',
      notes: 'Meeting lunch dengan klien',
    },
  ]);

  const [formData, setFormData] = useState({
    employeeName: '',
    department: '',
    notes: '',
  });

  const [items, setItems] = useState<ReimbursementItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [itemForm, setItemForm] = useState({
    category: 'Bensin',
    description: '',
    amount: 0,
    date: '',
    receipt: '',
  });

  const categories = ['Bensin', 'Tol', 'Makan', 'Transportasi', 'Akomodasi', 'Lainnya'];

  const handleAddItem = () => {
    if (!itemForm.description || !itemForm.amount || !itemForm.date) return;

    const newItem: ReimbursementItem = {
      id: Date.now().toString(),
      ...itemForm,
    };

    setItems([...items, newItem]);
    setItemForm({
      category: 'Bensin',
      description: '',
      amount: 0,
      date: '',
      receipt: '',
    });
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleSubmit = () => {
    if (!formData.employeeName || !formData.department || items.length === 0) return;

    const total = items.reduce((sum, item) => sum + item.amount, 0);

    const newSubmission: ReimbursementSubmission = {
      id: Date.now().toString(),
      ...formData,
      date: new Date().toISOString().split('T')[0],
      items,
      total,
      status: 'pending',
    };

    setSubmissions([newSubmission, ...submissions]);
    setFormData({
      employeeName: '',
      department: '',
      notes: '',
    });
    setItems([]);
    setShowForm(false);
  };

  const handleApprove = (id: string) => {
    setSubmissions(submissions.map(s =>
      s.id === id ? { ...s, status: 'approved' } : s
    ));
  };

  const handleReject = (id: string) => {
    setSubmissions(submissions.map(s =>
      s.id === id ? { ...s, status: 'rejected' } : s
    ));
  };

  const handleDelete = (id: string) => {
    setSubmissions(submissions.filter(s => s.id !== id));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      'Bensin': 'bg-blue-100 text-blue-800',
      'Tol': 'bg-purple-100 text-purple-800',
      'Makan': 'bg-orange-100 text-orange-800',
      'Transportasi': 'bg-green-100 text-green-800',
      'Akomodasi': 'bg-pink-100 text-pink-800',
      'Lainnya': 'bg-gray-100 text-gray-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const totalItems = items.reduce((sum, item) => sum + item.amount, 0);
  const pendingCount = submissions.filter(s => s.status === 'pending').length;
  const approvedCount = submissions.filter(s => s.status === 'approved').length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0A2540] to-[#1E3A5F] flex items-center justify-center">
            <span className="text-white text-xs font-bold">PA</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">Reimbursement Form</h1>
            <p className="text-sm text-gray-600">PT Perdana Adi Yuda - Form Klaim Biaya</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Total Pengajuan</div>
          <div className="text-3xl font-bold text-blue-600">{submissions.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Menunggu Approval</div>
          <div className="text-3xl font-bold text-yellow-600">{pendingCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Disetujui</div>
          <div className="text-3xl font-bold text-green-600">{approvedCount}</div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
        >
          {showForm ? 'Batal' : '+ Buat Klaim Baru'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Form Klaim Reimbursement</h2>
          
          {/* Submitter Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Nama Karyawan *</label>
              <input
                type="text"
                value={formData.employeeName}
                onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Nama lengkap"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Departemen *</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Nama departemen"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Catatan</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Catatan klaim"
              />
            </div>
          </div>

          {/* Item Form */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-bold mb-4">Rincian Biaya</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Kategori *</label>
                <select
                  value={itemForm.category}
                  onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Deskripsi *</label>
                <input
                  type="text"
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Deskripsi pengeluaran"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Jumlah (Rp) *</label>
                <input
                  type="number"
                  value={itemForm.amount}
                  onChange={(e) => setItemForm({ ...itemForm, amount: Number(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tanggal *</label>
                <input
                  type="date"
                  value={itemForm.date}
                  onChange={(e) => setItemForm({ ...itemForm, date: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              onClick={handleAddItem}
              disabled={!itemForm.description || !itemForm.amount || !itemForm.date}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              + Tambah Item
            </button>
          </div>

          {/* Items List */}
          {items.length > 0 && (
            <div className="mt-6 border-t pt-4">
              <h3 className="text-lg font-bold mb-4">Daftar Item</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deskripsi</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {items.map((item, index) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryBadge(item.category)}`}>
                            {item.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{formatDate(item.date)}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatCurrency(item.amount)}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t-2">
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-right font-bold">Total:</td>
                      <td className="px-4 py-3 text-lg font-bold text-blue-600">{formatCurrency(totalItems)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="mt-6 flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={!formData.employeeName || !formData.department || items.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Submit Klaim
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setItems([]);
                setFormData({ employeeName: '', department: '', notes: '' });
              }}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Submissions List */}
      <div className="space-y-4">
        {submissions.map((submission) => (
          <div key={submission.id} className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-lg font-bold">{submission.employeeName}</div>
                <div className="text-sm text-gray-600">{submission.department} • {formatDate(submission.date)}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(submission.status)}`}>
                  {submission.status === 'pending' ? 'Menunggu' : submission.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                </span>
              </div>
            </div>

            {/* Items */}
            <div className="border-t pt-4 mb-4">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Deskripsi</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {submission.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryBadge(item.category)}`}>
                          {item.category}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-900">{item.description}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{formatDate(item.date)}</td>
                      <td className="px-3 py-2 text-sm font-semibold text-gray-900">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2">
                  <tr>
                    <td colSpan={3} className="px-3 py-2 text-right font-bold">Total:</td>
                    <td className="px-3 py-2 text-lg font-bold text-blue-600">{formatCurrency(submission.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {submission.notes && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Catatan:</div>
                <div className="text-sm text-gray-900">{submission.notes}</div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              {submission.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleApprove(submission.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(submission.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                  >
                    Reject
                  </button>
                </>
              )}
              <button
                onClick={() => handleDelete(submission.id)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {submissions.length === 0 && (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <p className="text-gray-500">Belum ada pengajuan reimbursement</p>
        </div>
      )}
    </div>
  );
}
