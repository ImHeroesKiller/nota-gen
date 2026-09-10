import { useState } from 'react';

interface IncidentReport {
  id: string;
  incidentDate: string;
  incidentTime: string;
  location: string;
  severity: 'low' | 'medium' | 'high';
  category: string;
  reporterName: string;
  department: string;
  description: string;
  chronology: string;
  actions: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  createdAt: string;
}

interface IncidentReportProps {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

export default function IncidentReport({ onBack, darkMode, setDarkMode }: IncidentReportProps) {
  const [reports, setReports] = useState<IncidentReport[]>([
    {
      id: '1',
      incidentDate: '2026-01-08',
      incidentTime: '14:30',
      location: 'Gudang Utama',
      severity: 'medium',
      category: 'Kecelakaan Kerja',
      reporterName: 'Ahmad Fauzi',
      department: 'Warehouse',
      description: 'Karyawan terpejat di lantai basah',
      chronology: '1. Karyawan sedang membawa barang\n2. Lantai basah karena tumpahan air\n3. Karyawan terpejat dan jatuh\n4. Karyawan mengalami luka ringan',
      actions: '1. Pertolongan pertama diberikan\n2. Lantai dibersihkan\n4. Warning sign dipasang',
      status: 'resolved',
      createdAt: '2026-01-08',
    },
    {
      id: '2',
      incidentDate: '2026-01-09',
      incidentTime: '09:15',
      location: 'Parkir Kendaraan',
      severity: 'low',
      category: 'Kerusakan Aset',
      reporterName: 'Siti Rahayu',
      department: 'GA',
      description: 'Spion kendaraan patah',
      chronology: '1. Kendaraan diparkir di area parkir\n2. Ditemukan spion dalam kondisi patah\n3. Diduga tertabrak kendaraan lain',
      actions: '1. Foto dokumentasi\n2. Laporan ke asuransi',
      status: 'investigating',
      createdAt: '2026-01-09',
    },
  ]);

  const [formData, setFormData] = useState({
    incidentDate: '',
    incidentTime: '',
    location: '',
    severity: 'low' as 'low' | 'medium' | 'high',
    category: '',
    reporterName: '',
    department: '',
    description: '',
    chronology: '',
    actions: '',
  });

  const [showForm, setShowForm] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const categories = ['Kecelakaan Kerja', 'Kerusakan Aset', 'Kebakaran', 'Kesehatan', 'Keamanan', 'Lainnya'];

  const handleSubmit = () => {
    if (!formData.incidentDate || !formData.location || !formData.description || !formData.reporterName) return;

    const newReport: IncidentReport = {
      id: Date.now().toString(),
      ...formData,
      status: 'open',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setReports([newReport, ...reports]);
    setFormData({
      incidentDate: '',
      incidentTime: '',
      location: '',
      severity: 'low',
      category: '',
      reporterName: '',
      department: '',
      description: '',
      chronology: '',
      actions: '',
    });
    setShowForm(false);
  };

  const handleUpdateStatus = (id: string, status: IncidentReport['status']) => {
    setReports(reports.map(r =>
      r.id === id ? { ...r, status } : r
    ));
  };

  const handleDelete = (id: string) => {
    setReports(reports.filter(r => r.id !== id));
  };

  const filteredReports = reports.filter(r => {
    const matchesSeverity = filterSeverity === 'all' || r.severity === filterSeverity;
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchesSeverity && matchesStatus;
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getSeverityBadge = (severity: string) => {
    const styles = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
    };
    return styles[severity as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      open: 'bg-red-100 text-red-800',
      investigating: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-blue-100 text-blue-800',
      closed: 'bg-gray-100 text-gray-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const openCount = reports.filter(r => r.status === 'open').length;
  const investigatingCount = reports.filter(r => r.status === 'investigating').length;
  const resolvedCount = reports.filter(r => r.status === 'resolved' || r.status === 'closed').length;
  const highSeverityCount = reports.filter(r => r.severity === 'high').length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0A2540] to-[#1E3A5F] flex items-center justify-center">
            <span className="text-white text-xs font-bold">PA</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">Incident Report</h1>
            <p className="text-sm text-gray-600">PT Perdana Adi Yuda - Form Pelaporan Insiden Lapangan</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Total Insiden</div>
          <div className="text-3xl font-bold text-blue-600">{reports.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Open / Investigating</div>
          <div className="text-3xl font-bold text-yellow-600">{openCount + investigatingCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Resolved / Closed</div>
          <div className="text-3xl font-bold text-green-600">{resolvedCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">High Severity</div>
          <div className="text-3xl font-bold text-red-600">{highSeverityCount}</div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="mb-6 flex flex-wrap gap-4">
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
        >
          {showForm ? 'Batal' : '+ Lapor Insiden'}
        </button>
        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Semua Severity</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Semua Status</option>
          <option value="open">Open</option>
          <option value="investigating">Investigating</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Form Laporan Insiden</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tanggal Insiden *</label>
              <input
                type="date"
                value={formData.incidentDate}
                onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Waktu Insiden</label>
              <input
                type="time"
                value={formData.incidentTime}
                onChange={(e) => setFormData({ ...formData, incidentTime: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Lokasi *</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Lokasi kejadian"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tingkat Keparahan *</label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low - Ringan</option>
                <option value="medium">Medium - Sedang</option>
                <option value="high">High - Berat</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Kategori</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Pilih kategori</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Nama Pelapor *</label>
              <input
                type="text"
                value={formData.reporterName}
                onChange={(e) => setFormData({ ...formData, reporterName: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Nama pelapor"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Departemen</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Nama departemen"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Deskripsi Insiden *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Deskripsi singkat insiden"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Kronologi Kejadian</label>
              <textarea
                value={formData.chronology}
                onChange={(e) => setFormData({ ...formData, chronology: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Kronologi kejadian secara detail"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Tindakan yang Diambil</label>
              <textarea
                value={formData.actions}
                onChange={(e) => setFormData({ ...formData, actions: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Tindakan yang sudah diambil"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={!formData.incidentDate || !formData.location || !formData.description || !formData.reporterName}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Submit Laporan
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

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map((report) => (
          <div key={report.id} className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-lg font-bold">{report.description}</div>
                <div className="text-sm text-gray-600">
                  {formatDate(report.incidentDate)} {report.incidentTime} • {report.location}
                </div>
                <div className="text-sm text-gray-600">
                  Pelapor: {report.reporterName} {report.department && `• ${report.department}`}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getSeverityBadge(report.severity)}`}>
                  {report.severity === 'low' ? 'Low' : report.severity === 'medium' ? 'Medium' : 'High'}
                </span>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(report.status)}`}>
                  {report.status === 'open' ? 'Open' : report.status === 'investigating' ? 'Investigating' : report.status === 'resolved' ? 'Resolved' : 'Closed'}
                </span>
              </div>
            </div>

            {report.category && (
              <div className="mb-3">
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  {report.category}
                </span>
              </div>
            )}

            {report.chronology && (
              <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Kronologi:</div>
                <div className="text-sm text-gray-900 whitespace-pre-line">{report.chronology}</div>
              </div>
            )}

            {report.actions && (
              <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Tindakan:</div>
                <div className="text-sm text-gray-900 whitespace-pre-line">{report.actions}</div>
              </div>
            )}

            {/* Status Update Buttons */}
            <div className="flex gap-2 flex-wrap">
              {report.status === 'open' && (
                <button
                  onClick={() => handleUpdateStatus(report.id, 'investigating')}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm"
                >
                  Start Investigation
                </button>
              )}
              {(report.status === 'open' || report.status === 'investigating') && (
                <button
                  onClick={() => handleUpdateStatus(report.id, 'resolved')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  Mark Resolved
                </button>
              )}
              {report.status === 'resolved' && (
                <button
                  onClick={() => handleUpdateStatus(report.id, 'closed')}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                >
                  Close
                </button>
              )}
              <button
                onClick={() => handleDelete(report.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <p className="text-gray-500">Tidak ada laporan insiden</p>
        </div>
      )}
    </div>
  );
}
