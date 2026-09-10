import { useState } from 'react';

interface SafetyIncidentLogProps {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

interface Incident {
  id: string;
  incidentNumber: string;
  date: string;
  time: string;
  location: string;
  clientSite: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  injuredPersons: number;
  reportedBy: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  correctiveActions: string;
  resolvedDate?: string;
}

export default function SafetyIncidentLog({ onBack, darkMode, setDarkMode }: SafetyIncidentLogProps) {
  const [incidents, setIncidents] = useState<Incident[]>([
    {
      id: '1',
      incidentNumber: 'K3-2026-001',
      date: '2026-01-08',
      time: '14:30',
      location: 'Gudang Utama',
      clientSite: 'PT ABC Manufacturing',
      type: 'Slip and Fall',
      priority: 'medium',
      description: 'Karyawan terpeleset di lantai basah',
      injuredPersons: 1,
      reportedBy: 'Ahmad Fauzi',
      status: 'resolved',
      correctiveActions: 'Pasang rambu peringatan dan pel lantai anti-slip',
      resolvedDate: '2026-01-09',
    },
    {
      id: '2',
      incidentNumber: 'K3-2026-002',
      date: '2026-01-10',
      time: '09:15',
      location: 'Area Parkir',
      clientSite: 'PT XYZ Tower',
      type: 'Property Damage',
      priority: 'low',
      description: 'Kendaraan menabrak barrier parkir',
      injuredPersons: 0,
      reportedBy: 'Siti Rahayu',
      status: 'investigating',
      correctiveActions: '',
    },
    {
      id: '3',
      incidentNumber: 'K3-2026-003',
      date: '2026-01-12',
      time: '16:45',
      location: 'Lantai 5',
      clientSite: 'PT DEF Telecom',
      type: 'Electrical Hazard',
      priority: 'high',
      description: 'Kabel listrik terbuka di area kerja',
      injuredPersons: 0,
      reportedBy: 'Budi Santoso',
      status: 'open',
      correctiveActions: '',
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const [formData, setFormData] = useState({
    date: '',
    time: '',
    location: '',
    clientSite: '',
    type: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    description: '',
    injuredPersons: 0,
    reportedBy: '',
  });

  const incidentTypes = [
    'Slip and Fall',
    'Property Damage',
    'Electrical Hazard',
    'Fire Incident',
    'Chemical Spill',
    'Injury',
    'Near Miss',
    'Other',
  ];

  const handleSubmit = () => {
    const newIncident: Incident = {
      id: Date.now().toString(),
      incidentNumber: `K3-2026-${String(incidents.length + 1).padStart(3, '0')}`,
      ...formData,
      status: 'open',
      correctiveActions: '',
    };
    setIncidents([newIncident, ...incidents]);
    setShowForm(false);
    setFormData({
      date: '',
      time: '',
      location: '',
      clientSite: '',
      type: '',
      priority: 'medium',
      description: '',
      injuredPersons: 0,
      reportedBy: '',
    });
  };

  const updateStatus = (id: string, status: Incident['status']) => {
    setIncidents(incidents.map(inc =>
      inc.id === id ? { ...inc, status, resolvedDate: status === 'resolved' ? new Date().toISOString().split('T')[0] : inc.resolvedDate } : inc
    ));
  };

  const addCorrectiveAction = (id: string, action: string) => {
    setIncidents(incidents.map(inc =>
      inc.id === id ? { ...inc, correctiveActions: action } : inc
    ));
  };

  const filteredIncidents = incidents.filter(inc => {
    const matchStatus = filterStatus === 'all' || inc.status === filterStatus;
    const matchPriority = filterPriority === 'all' || inc.priority === filterPriority;
    return matchStatus && matchPriority;
  });

  const getPriorityBadge = (priority: string) => {
    const styles = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    return styles[priority as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      open: 'bg-red-100 text-red-800',
      investigating: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const openCount = incidents.filter(i => i.status === 'open').length;
  const investigatingCount = incidents.filter(i => i.status === 'investigating').length;
  const resolvedCount = incidents.filter(i => i.status === 'resolved' || i.status === 'closed').length;
  const criticalCount = incidents.filter(i => i.priority === 'critical' && i.status !== 'closed').length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0A2540] to-[#1E3A5F] flex items-center justify-center">
            <span className="text-white text-xs font-bold">PA</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">Safety Incident Log (K3)</h1>
            <p className="text-sm text-gray-600">PT Perdana Adi Yuda - Pencatatan Insiden Keselamatan Kerja</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Open Incidents</div>
          <div className="text-3xl font-bold text-red-600">{openCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Investigating</div>
          <div className="text-3xl font-bold text-yellow-600">{investigatingCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Resolved/Closed</div>
          <div className="text-3xl font-bold text-green-600">{resolvedCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Critical Priority</div>
          <div className="text-3xl font-bold text-red-600">{criticalCount}</div>
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
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Filter by Priority</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setShowForm(!showForm)}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
            >
              {showForm ? 'Cancel' : '+ Report Incident'}
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Report New Incident</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Time *</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Location *</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Specific location"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Client Site *</label>
              <input
                type="text"
                value={formData.clientSite}
                onChange={(e) => setFormData({ ...formData, clientSite: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Client company name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Incident Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select Type --</option>
                {incidentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
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
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Number of Injured Persons</label>
              <input
                type="number"
                min="0"
                value={formData.injuredPersons}
                onChange={(e) => setFormData({ ...formData, injuredPersons: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Reported By *</label>
              <input
                type="text"
                value={formData.reportedBy}
                onChange={(e) => setFormData({ ...formData, reportedBy: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Reporter name"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Detailed description of the incident..."
              />
            </div>
          </div>
          <div className="mt-4 flex gap-4">
            <button
              onClick={handleSubmit}
              disabled={!formData.date || !formData.time || !formData.location || !formData.clientSite || !formData.type || !formData.description || !formData.reportedBy}
              className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
            >
              Submit Incident Report
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

      {/* Incidents List */}
      <div className="space-y-4">
        {filteredIncidents.map(incident => (
          <div key={incident.id} className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-mono text-gray-500">{incident.incidentNumber}</span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityBadge(incident.priority)}`}>
                    {incident.priority.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(incident.status)}`}>
                    {incident.status.toUpperCase()}
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-1">{incident.type}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {incident.date} at {incident.time} • {incident.location} • {incident.clientSite}
                </p>
                <p className="text-sm text-gray-700 mb-2">{incident.description}</p>
                <p className="text-sm text-gray-600">
                  Reported by: <span className="font-medium">{incident.reportedBy}</span> • 
                  Injured: <span className="font-medium">{incident.injuredPersons} person(s)</span>
                </p>
              </div>
            </div>

            {incident.correctiveActions && (
              <div className="mt-3 p-3 bg-green-50 rounded">
                <div className="text-xs text-gray-600 mb-1">Corrective Actions:</div>
                <div className="text-sm text-gray-900">{incident.correctiveActions}</div>
              </div>
            )}

            <div className="mt-4 flex gap-2 flex-wrap">
              {incident.status === 'open' && (
                <>
                  <button
                    onClick={() => updateStatus(incident.id, 'investigating')}
                    className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                  >
                    Start Investigation
                  </button>
                </>
              )}
              {incident.status === 'investigating' && (
                <>
                  <button
                    onClick={() => updateStatus(incident.id, 'resolved')}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    Mark as Resolved
                  </button>
                </>
              )}
              {incident.status === 'resolved' && (
                <button
                  onClick={() => updateStatus(incident.id, 'closed')}
                  className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                >
                  Close Incident
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredIncidents.length === 0 && (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <p className="text-gray-500">No incidents found</p>
        </div>
      )}
    </div>
  );
}
