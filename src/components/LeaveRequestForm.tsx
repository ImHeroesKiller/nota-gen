import { useState } from 'react';

interface LeaveRequest {
  id: string;
  employeeName: string;
  department: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approverNotes: string;
}

export default function LeaveRequestForm() {
  const [requests, setRequests] = useState<LeaveRequest[]>([
    {
      id: '1',
      employeeName: 'Ahmad Fauzi',
      department: 'Sales',
      leaveType: 'Cuti Tahunan',
      startDate: '2026-01-15',
      endDate: '2026-01-17',
      days: 3,
      reason: 'Liburan keluarga',
      status: 'approved',
      createdAt: '2026-01-08',
      approverNotes: 'Disetujui',
    },
    {
      id: '2',
      employeeName: 'Siti Rahayu',
      department: 'Marketing',
      leaveType: 'Izin Sakit',
      startDate: '2026-01-10',
      endDate: '2026-01-10',
      days: 1,
      reason: 'Sakit demam',
      status: 'approved',
      createdAt: '2026-01-10',
      approverNotes: 'Semoga lekas sembuh',
    },
    {
      id: '3',
      employeeName: 'Budi Hartono',
      department: 'Warehouse',
      leaveType: 'Cuti Tahunan',
      startDate: '2026-01-20',
      endDate: '2026-01-22',
      days: 3,
      reason: 'Urusan keluarga',
      status: 'pending',
      createdAt: '2026-01-09',
      approverNotes: '',
    },
  ]);

  const [formData, setFormData] = useState({
    employeeName: '',
    department: '',
    leaveType: 'Cuti Tahunan',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const leaveTypes = ['Cuti Tahunan', 'Izin Sakit', 'Izin Pribadi', 'Cuti Melahirkan', 'Cuti Menikah', 'Izin Khusus'];

  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleSubmit = () => {
    if (!formData.employeeName || !formData.department || !formData.startDate || !formData.endDate) return;

    const days = calculateDays(formData.startDate, formData.endDate);

    const newRequest: LeaveRequest = {
      id: Date.now().toString(),
      ...formData,
      days,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
      approverNotes: '',
    };

    setRequests([newRequest, ...requests]);
    setFormData({
      employeeName: '',
      department: '',
      leaveType: 'Cuti Tahunan',
      startDate: '',
      endDate: '',
      reason: '',
    });
    setShowForm(false);
  };

  const handleApprove = (id: string, notes: string) => {
    setRequests(requests.map(r =>
      r.id === id ? { ...r, status: 'approved', approverNotes: notes } : r
    ));
  };

  const handleReject = (id: string, notes: string) => {
    setRequests(requests.map(r =>
      r.id === id ? { ...r, status: 'rejected', approverNotes: notes } : r
    ));
  };

  const handleDelete = (id: string) => {
    setRequests(requests.filter(r => r.id !== id));
  };

  const filteredRequests = requests.filter(r => {
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    const matchesType = filterType === 'all' || r.leaveType === filterType;
    return matchesStatus && matchesType;
  });

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

  const getLeaveTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      'Cuti Tahunan': 'bg-blue-100 text-blue-800',
      'Izin Sakit': 'bg-red-100 text-red-800',
      'Izin Pribadi': 'bg-purple-100 text-purple-800',
      'Cuti Melahirkan': 'bg-pink-100 text-pink-800',
      'Cuti Menikah': 'bg-green-100 text-green-800',
      'Izin Khusus': 'bg-orange-100 text-orange-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const totalDays = requests.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.days, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0A2540] to-[#1E3A5F] flex items-center justify-center">
            <span className="text-white text-xs font-bold">PA</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">Leave Request Form</h1>
            <p className="text-sm text-gray-600">PT Perdana Adi Yuda - Form Pengajuan Cuti/Izin</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Total Pengajuan</div>
          <div className="text-3xl font-bold text-blue-600">{requests.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Menunggu Approval</div>
          <div className="text-3xl font-bold text-yellow-600">{pendingCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Disetujui</div>
          <div className="text-3xl font-bold text-green-600">{approvedCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Total Hari Cuti</div>
          <div className="text-3xl font-bold text-purple-600">{totalDays} hari</div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="mb-6 flex flex-wrap gap-4">
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
        >
          {showForm ? 'Batal' : '+ Ajukan Cuti/Izin'}
        </button>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Semua Status</option>
          <option value="pending">Menunggu</option>
          <option value="approved">Disetujui</option>
          <option value="rejected">Ditolak</option>
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Semua Jenis</option>
          {leaveTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Form Pengajuan Cuti/Izin</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div>
              <label className="block text-sm font-medium mb-2">Jenis Cuti/Izin *</label>
              <select
                value={formData.leaveType}
                onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {leaveTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tanggal Mulai *</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tanggal Selesai *</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Durasi (Hari)</label>
              <div className="px-4 py-2 border rounded-lg bg-gray-50">
                {calculateDays(formData.startDate, formData.endDate)} hari
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Alasan *</label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Alasan pengajuan cuti/izin"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={!formData.employeeName || !formData.department || !formData.startDate || !formData.endDate || !formData.reason}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Submit Pengajuan
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

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.map((request) => (
          <div key={request.id} className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-lg font-bold">{request.employeeName}</div>
                <div className="text-sm text-gray-600">{request.department}</div>
                <div className="text-sm text-gray-600">
                  {formatDate(request.startDate)} - {formatDate(request.endDate)} ({request.days} hari)
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(request.status)}`}>
                  {request.status === 'pending' ? 'Menunggu' : request.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                </span>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getLeaveTypeBadge(request.leaveType)}`}>
                  {request.leaveType}
                </span>
              </div>
            </div>

            <div className="mb-3 p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-600 mb-1">Alasan:</div>
              <div className="text-sm text-gray-900">{request.reason}</div>
            </div>

            {request.approverNotes && (
              <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Catatan Approver:</div>
                <div className="text-sm text-gray-900">{request.approverNotes}</div>
              </div>
            )}

            <div className="text-xs text-gray-500 mb-3">
              Diajukan pada: {formatDate(request.createdAt)}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {request.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleApprove(request.id, 'Disetujui')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(request.id, 'Ditolak')}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                  >
                    Reject
                  </button>
                </>
              )}
              <button
                onClick={() => handleDelete(request.id)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <p className="text-gray-500">Tidak ada pengajuan cuti/izin</p>
        </div>
      )}
    </div>
  );
}
