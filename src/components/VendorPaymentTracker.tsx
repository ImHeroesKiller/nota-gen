import { useState } from 'react';

interface Payment {
  id: string;
  invoiceNumber: string;
  vendorName: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  status: 'pending' | 'processed' | 'paid';
  paymentDate: string;
  paymentMethod: string;
  notes: string;
}

export default function VendorPaymentTracker() {
  const [payments, setPayments] = useState<Payment[]>([
    {
      id: '1',
      invoiceNumber: 'INV-2026-001',
      vendorName: 'PT Katering Nusantara',
      invoiceDate: '2026-01-05',
      dueDate: '2026-02-05',
      amount: 15000000,
      status: 'paid',
      paymentDate: '2026-01-20',
      paymentMethod: 'Transfer Bank',
      notes: 'Pembayaran untuk event Januari',
    },
    {
      id: '2',
      invoiceNumber: 'INV-2026-002',
      vendorName: 'CV Transport Cepat',
      invoiceDate: '2026-01-08',
      dueDate: '2026-02-08',
      amount: 8500000,
      status: 'processed',
      paymentDate: '',
      paymentMethod: 'Transfer Bank',
      notes: 'Transportasi bulan Januari',
    },
    {
      id: '3',
      invoiceNumber: 'INV-2026-003',
      vendorName: 'PT Office Supplies',
      invoiceDate: '2026-01-10',
      dueDate: '2026-02-10',
      amount: 3200000,
      status: 'pending',
      paymentDate: '',
      paymentMethod: '',
      notes: 'Perlengkapan kantor',
    },
  ]);

  const [formData, setFormData] = useState({
    invoiceNumber: '',
    vendorName: '',
    invoiceDate: '',
    dueDate: '',
    amount: 0,
    notes: '',
  });

  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [updateForm, setUpdateForm] = useState<{
    show: boolean;
    id: string;
    paymentDate: string;
    paymentMethod: string;
  }>({
    show: false,
    id: '',
    paymentDate: '',
    paymentMethod: 'Transfer Bank',
  });

  const handleSubmit = () => {
    if (!formData.invoiceNumber || !formData.vendorName || !formData.invoiceDate || !formData.dueDate || !formData.amount) return;

    const newPayment: Payment = {
      id: Date.now().toString(),
      ...formData,
      status: 'pending',
      paymentDate: '',
      paymentMethod: '',
    };

    setPayments([newPayment, ...payments]);
    setFormData({
      invoiceNumber: '',
      vendorName: '',
      invoiceDate: '',
      dueDate: '',
      amount: 0,
      notes: '',
    });
    setShowForm(false);
  };

  const handleUpdateStatus = (id: string, status: Payment['status']) => {
    if (status === 'paid') {
      setUpdateForm({ show: true, id, paymentDate: '', paymentMethod: 'Transfer Bank' });
    } else {
      setPayments(payments.map(p =>
        p.id === id ? { ...p, status } : p
      ));
    }
  };

  const handleConfirmPayment = () => {
    if (!updateForm.paymentDate || !updateForm.paymentMethod) return;

    setPayments(payments.map(p =>
      p.id === updateForm.id ? {
        ...p,
        status: 'paid',
        paymentDate: updateForm.paymentDate,
        paymentMethod: updateForm.paymentMethod,
      } : p
    ));

    setUpdateForm({ show: false, id: '', paymentDate: '', paymentMethod: 'Transfer Bank' });
  };

  const handleDelete = (id: string) => {
    setPayments(payments.filter(p => p.id !== id));
  };

  const filteredPayments = filterStatus === 'all'
    ? payments
    : payments.filter(p => p.status === filterStatus);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
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

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      processed: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'paid') return false;
    const due = new Date(dueDate);
    const today = new Date();
    return today > due;
  };

  const pendingCount = payments.filter(p => p.status === 'pending').length;
  const processedCount = payments.filter(p => p.status === 'processed').length;
  const paidCount = payments.filter(p => p.status === 'paid').length;
  const totalPending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const totalPaid = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0A2540] to-[#1E3A5F] flex items-center justify-center">
            <span className="text-white text-xs font-bold">PA</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">Vendor Payment Tracker</h1>
            <p className="text-sm text-gray-600">PT Perdana Adi Yuda - Tracking Pembayaran Invoice Vendor</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Total Invoice</div>
          <div className="text-3xl font-bold text-blue-600">{payments.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Pending</div>
          <div className="text-3xl font-bold text-yellow-600">{pendingCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Processed</div>
          <div className="text-3xl font-bold text-blue-600">{processedCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Paid</div>
          <div className="text-3xl font-bold text-green-600">{paidCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Total Paid</div>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="mb-6 flex flex-wrap gap-4">
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
        >
          {showForm ? 'Batal' : '+ Tambah Invoice'}
        </button>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Semua Status</option>
          <option value="pending">Pending</option>
          <option value="processed">Processed</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Tambah Invoice Vendor</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nomor Invoice *</label>
              <input
                type="text"
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="INV-2026-XXX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Nama Vendor *</label>
              <input
                type="text"
                value={formData.vendorName}
                onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Nama vendor"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tanggal Invoice *</label>
              <input
                type="date"
                value={formData.invoiceDate}
                onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Jatuh Tempo *</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Jumlah (Rp) *</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Catatan</label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Catatan tambahan"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={!formData.invoiceNumber || !formData.vendorName || !formData.invoiceDate || !formData.dueDate || !formData.amount}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
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

      {/* Payment Update Modal */}
      {updateForm.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Konfirmasi Pembayaran</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tanggal Pembayaran *</label>
                <input
                  type="date"
                  value={updateForm.paymentDate}
                  onChange={(e) => setUpdateForm({ ...updateForm, paymentDate: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Metode Pembayaran *</label>
                <select
                  value={updateForm.paymentMethod}
                  onChange={(e) => setUpdateForm({ ...updateForm, paymentMethod: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Transfer Bank">Transfer Bank</option>
                  <option value="Cek">Cek</option>
                  <option value="Tunai">Tunai</option>
                  <option value="Giro">Giro</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <button
                onClick={handleConfirmPayment}
                disabled={!updateForm.paymentDate || !updateForm.paymentMethod}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Konfirmasi
              </button>
              <button
                onClick={() => setUpdateForm({ show: false, id: '', paymentDate: '', paymentMethod: 'Transfer Bank' })}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No. Invoice</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tgl Invoice</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jatuh Tempo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tgl Bayar</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Metode</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className={`hover:bg-gray-50 ${isOverdue(payment.dueDate, payment.status) ? 'bg-red-50' : ''}`}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{payment.invoiceNumber}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{payment.vendorName}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{formatDate(payment.invoiceDate)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {formatDate(payment.dueDate)}
                    {isOverdue(payment.dueDate, payment.status) && (
                      <span className="ml-2 text-xs text-red-600 font-semibold">OVERDUE</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatCurrency(payment.amount)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(payment.status)}`}>
                      {payment.status === 'pending' ? 'Pending' : payment.status === 'processed' ? 'Processed' : 'Paid'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{formatDate(payment.paymentDate)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{payment.paymentMethod || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {payment.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateStatus(payment.id, 'processed')}
                          className="text-blue-600 hover:text-blue-700 text-sm"
                        >
                          Process
                        </button>
                      )}
                      {(payment.status === 'pending' || payment.status === 'processed') && (
                        <button
                          onClick={() => handleUpdateStatus(payment.id, 'paid')}
                          className="text-green-600 hover:text-green-700 text-sm"
                        >
                          Pay
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(payment.id)}
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

      {filteredPayments.length === 0 && (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center mt-6">
          <p className="text-gray-500">Tidak ada data pembayaran vendor</p>
        </div>
      )}

      {/* Summary Footer */}
      <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold mb-4">Ringkasan Pembayaran</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-yellow-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Total Pending</div>
            <div className="text-xl font-bold text-yellow-600">{formatCurrency(totalPending)}</div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Total Paid</div>
            <div className="text-xl font-bold text-green-600">{formatCurrency(totalPaid)}</div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Grand Total</div>
            <div className="text-xl font-bold text-blue-600">{formatCurrency(totalPending + totalPaid)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
