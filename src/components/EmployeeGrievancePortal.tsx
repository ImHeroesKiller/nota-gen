import { useState } from 'react';

interface EmployeeGrievancePortalProps {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

interface Grievance {
  id: string;
  ticketNumber: string;
  employeeName: string;
  employeeId: string;
  division: string;
  clientSite: string;
  category: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  submittedDate: string;
  assignedTo: string;
  resolution?: string;
  resolvedDate?: string;
}

export default function EmployeeGrievancePortal({ onBack, darkMode, setDarkMode }: EmployeeGrievancePortalProps) {
  const [grievances, setGrievances] = useState<Grievance[]>([
    {
      id: '1',
      ticketNumber: 'GRV-2026-001',
      employeeName: 'Ahmad Fauzi',
      employeeId: 'EMP001',
      division: 'Security',
      clientSite: 'PT ABC Manufacturing',
      category: 'Salary',
      subject: 'Keterlambatan pembayaran gaji',
      description: 'Gaji bulan Desember belum diterima hingga tanggal 10 Januari',
      priority: 'high',
      status: 'resolved',
      submittedDate: '2026-01-10',
      assignedTo: 'HRD Team',
      resolution: 'Gaji telah ditransfer pada tanggal 11 Januari 2026',
      resolvedDate: '2026-01-11',
    },
    {
      id: '2',
      ticketNumber: 'GRV-2026-002',
      employeeName: 'Siti Rahayu',
      employeeId: 'EMP002',
      division: 'Cleaning Service',
      clientSite: 'PT XYZ Tower',
      category: 'Work Equipment',
      subject: 'Permintaan perlengkapan kerja',
      description: 'Mohon disediakan sarung tangan dan masker tambahan',
      priority: 'medium',
      status: 'in-progress',
      submittedDate: '2026-01-12',
      assignedTo: 'GA Team',
    },
    {
      id: '3',
      ticketNumber: 'GRV-2026-003',
      employeeName: 'Budi Santoso',
      employeeId: 'EMP003',
      division: 'Security',
      clientSite: 'PT DEF Telecom',
      category: 'Schedule',
      subject: 'Permintaan perubahan jadwal shift',
      description: 'Ingin tukar shift dengan rekan kerja pada tanggal 20 Januari',
      priority: 'low',
      status: 'open',
      submittedDate: '2026-01-13',
      assignedTo: '',
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const [formData, setFormData] = useState({
    employeeName: '',
    employeeId: '',
    division: '',
    clientSite: '',
    category: '',
    subject: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
  });

  const categories = [
    'Salary',
    'Work Equipment',
    'Schedule',
    'Workload',
    'Workplace Environment',
    'Training',
    'Benefits',
    'Other',
  ];

  const handleSubmit = () => {
    const newGrievance: Grievance = {
      id: Date.now().toString(),
      ticketNumber: `GRV-2026-${String(grievances.length + 1).padStart(3, '0')}`,
      ...formData,
      status: 'open',
      submittedDate: new Date().toISOString().split('T')[0],
      assignedTo: '',
    };
    setGrievances([newGrievance, ...grievances]);
    setShowForm(false);
    setFormData({
      employeeName: '',
      employeeId: '',
      division: '',
      clientSite: '',
      category: '',
      subject: '',
      description: '',
      priority: 'medium',
    });
  };

  const updateStatus = (id: string, status: Grievance['status']) => {
    setGrievances(grievances.map(g =>
      g.id === id ? { ...g, status, resolvedDate: status === 'resolved' ? new Date().toISOString().split('T')[0] : g.resolvedDate } : g
    ));
  };

  const assignTicket = (id: string, assignedTo: string) => {
    setGrievances(grievances.map(g =>
      g.id === id ? { ...g, assignedTo, status: 'in-progress' } : g
    ));
  };

  const addResolution = (id: string, resolution: string) => {
    setGrievances(grievances.map(g =>
      g.id === id ? { ...g, resolution, status: 'resolved', resolvedDate: new Date().toISOString().split('T')[0] } : g
    ));
  };

  const filteredGrievances = grievances.filter(g => {
    const matchStatus = filterStatus === 'all' || g.status === filterStatus;
    const matchCategory = filterCategory === 'all' || g.category === filterCategory;
    return matchStatus && matchCategory;
  });

  const getPriorityBadge = (priority: string) => {
    const styles = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
    };
    return styles[priority as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      open: 'bg-red-100 text-red-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const openCount = grievances.filter(g => g.status === 'open').length;
  const inProgressCount = grievances.filter(g => g.status === 'in-progress').length;
  const resolvedCount = grievances.filter(g => g.status === 'resolved' || g.status === 'closed').length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0A2540] to-[#1E3A5F] flex items-center justify-center">
            <span className="text-white text-xs font-bold">PA</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">Employee Grievance Portal</h1>
            <p className="text-sm text-gray-600">PT Perdana Adi Yuda - Portal Pengaduan Karyawan Outsourcing</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Open Tickets</div>
          <div className="text-3xl font-bold text-red-600">{openCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">In Progress</div>
          <div className="text-3xl font-bold text-yellow-600">{inProgressCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Resolved/Closed</div>
          <div className="text-3xl font-bold text-green-600">{resolvedCount}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Filter by Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setShowForm(!showForm)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              {showForm ? 'Cancel' : '+ Submit Grievance'}
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Submit New Grievance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Employee Name *</label>
              <input
                type="text"
                value={formData.employeeName}
                onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Employee ID *</label>
              <input
                type="text"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="EMP001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Division *</label>
              <input
                type="text"
                value={formData.division}
                onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Security"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Client Site *</label>
              <input
                type="text"
                value={formData.clientSite}
                onChange={(e) => setFormData({ ...formData, clientSite: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="PT ABC Manufacturing"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select Category --</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Priority *</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Subject *</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Brief subject"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Detailed description of your grievance..."
              />
            </div>
          </div>
          <div className="mt-4 flex gap-4">
            <button
              onClick={handleSubmit}
              disabled={!formData.employeeName || !formData.employeeId || !formData.division || !formData.clientSite || !formData.category || !formData.subject || !formData.description}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
            >
              Submit Grievance
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Grievances List */}
      <div className="space-y-4">
        {filteredGrievances.map(grievance => (
          <div key={grievance.id} className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-mono text-gray-500">{grievance.ticketNumber}</span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityBadge(grievance.priority)}`}>
                    {grievance.priority.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(grievance.status)}`}>
                    {grievance.status === 'open' ? 'Open' : grievance.status === 'in-progress' ? 'In Progress' : grievance.status === 'resolved' ? 'Resolved' : 'Closed'}
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-1">{grievance.subject}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {grievance.employeeName} ({grievance.employeeId}) • {grievance.division} • {grievance.clientSite}
                </p>
                <p className="text-sm text-gray-700 mb-2">{grievance.description}</p>
                <p className="text-sm text-gray-600">
                  Category: <span className="font-medium">{grievance.category}</span> • 
                  Submitted: <span className="font-medium">{grievance.submittedDate}</span>
                </p>
                {grievance.assignedTo && (
                  <p className="text-sm text-gray-600">
                    Assigned to: <span className="font-medium">{grievance.assignedTo}</span>
                  </p>
                )}
              </div>
            </div>

            {grievance.resolution && (
              <div className="mt-3 p-3 bg-green-50 rounded">
                <div className="text-xs text-gray-600 mb-1">Resolution:</div>
                <div className="text-sm text-gray-900">{grievance.resolution}</div>
                {grievance.resolvedDate && (
                  <div className="text-xs text-gray-600 mt-1">Resolved on: {grievance.resolvedDate}</div>
                )}
              </div>
            )}

            <div className="mt-4 flex gap-2 flex-wrap">
              {grievance.status === 'open' && (
                <>
                  <button
                    onClick={() => {
                      const assignee = prompt('Assign to:');
                      if (assignee) assignTicket(grievance.id, assignee);
                    }}
                    className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                  >
                    Assign
                  </button>
                </>
              )}
              {grievance.status === 'in-progress' && (
                <>
                  <button
                    onClick={() => {
                      const resolution = prompt('Resolution:');
                      if (resolution) addResolution(grievance.id, resolution);
                    }}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    Mark Resolved
                  </button>
                </>
              )}
              {grievance.status === 'resolved' && (
                <button
                  onClick={() => updateStatus(grievance.id, 'closed')}
                  className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                >
                  Close Ticket
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredGrievances.length === 0 && (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <p className="text-gray-500">No grievances found</p>
        </div>
      )}
    </div>
  );
}
