import { useState } from 'react';

interface FeedbackTicket {
  id: string;
  ticketNumber: string;
  type: 'complaint' | 'feedback' | 'suggestion';
  priority: 'low' | 'medium' | 'high' | 'critical';
  client: string;
  submittedBy: string;
  submittedDate: string;
  subject: string;
  description: string;
  division: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  assignedTo: string;
  resolution?: string;
  resolvedDate?: string;
}

export default function IncidentClientFeedbackLog() {
  const [tickets] = useState<FeedbackTicket[]>([
    {
      id: '1',
      ticketNumber: 'TKT-2026-001',
      type: 'complaint',
      priority: 'high',
      client: 'PT ABC Manufacturing',
      submittedBy: 'John Doe (Manager)',
      submittedDate: '2026-01-08',
      subject: 'Security guard terlambat datang',
      description: 'Security guard yang dijadwalkan shift pagi datang terlambat 30 menit pada tanggal 7 Januari 2026.',
      division: 'Security',
      status: 'resolved',
      assignedTo: 'Ahmad Supervisor',
      resolution: 'Security guard telah diberi surat peringatan dan dijadwalkan ulang.',
      resolvedDate: '2026-01-09',
    },
    {
      id: '2',
      ticketNumber: 'TKT-2026-002',
      type: 'feedback',
      priority: 'medium',
      client: 'PT XYZ Tower',
      submittedBy: 'Jane Smith (Building Manager)',
      submittedDate: '2026-01-09',
      subject: 'Kualitas cleaning service sangat baik',
      description: 'Kami ingin memberikan apresiasi kepada tim cleaning service yang sangat profesional dan rajin.',
      division: 'Cleaning Service',
      status: 'closed',
      assignedTo: 'Budi Supervisor',
      resolution: 'Apresiasi telah disampaikan kepada tim. Tim akan dipertahankan.',
      resolvedDate: '2026-01-10',
    },
    {
      id: '3',
      ticketNumber: 'TKT-2026-003',
      type: 'suggestion',
      priority: 'low',
      client: 'PT DEF Telecom',
      submittedBy: 'Ahmad Rahman (HR Manager)',
      submittedDate: '2026-01-10',
      subject: 'Saran untuk training tambahan',
      description: 'Kami menyarankan agar customer service agent diberikan training tambahan tentang produk terbaru kami.',
      division: 'Customer Service',
      status: 'in-progress',
      assignedTo: 'Cahyo Supervisor',
    },
    {
      id: '4',
      ticketNumber: 'TKT-2026-004',
      type: 'complaint',
      priority: 'critical',
      client: 'PT GHI Logistics',
      submittedBy: 'Siti Nurhaliza (Operations Manager)',
      submittedDate: '2026-01-10',
      subject: 'Barang hilang di gudang',
      description: 'Ada barang senilai Rp 5.000.000 yang hilang dari gudang pada shift malam tanggal 9 Januari 2026.',
      division: 'Security',
      status: 'open',
      assignedTo: 'Dedi Supervisor',
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const filteredTickets = tickets.filter(t => {
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    const matchType = filterType === 'all' || t.type === filterType;
    const matchPriority = filterPriority === 'all' || t.priority === filterPriority;
    return matchStatus && matchType && matchPriority;
  });

  const getTypeBadge = (type: string) => {
    const styles = {
      complaint: 'bg-red-100 text-red-800',
      feedback: 'bg-green-100 text-green-800',
      suggestion: 'bg-blue-100 text-blue-800',
    };
    return styles[type as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

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
      'in-progress': 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const openCount = tickets.filter(t => t.status === 'open').length;
  const inProgressCount = tickets.filter(t => t.status === 'in-progress').length;
  const resolvedCount = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;
  const criticalCount = tickets.filter(t => t.priority === 'critical' && t.status !== 'closed').length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0A2540] to-[#1E3A5F] flex items-center justify-center">
            <span className="text-white text-xs font-bold">PA</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">Incident & Client Feedback Log</h1>
            <p className="text-sm text-gray-600">PT Perdana Adi Yuda - Sistem Tiket Keluhan & Masukan Klien</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Critical Issues</div>
          <div className="text-3xl font-bold text-red-600">{criticalCount}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
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
            <label className="block text-sm font-medium mb-2">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="complaint">Complaint</option>
              <option value="feedback">Feedback</option>
              <option value="suggestion">Suggestion</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Priority</label>
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
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {showForm ? 'Batal' : '+ New Ticket'}
            </button>
          </div>
        </div>
      </div>

      {/* New Ticket Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-bold mb-4">Create New Ticket</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Type *</label>
              <select className="w-full px-3 py-2 border rounded-lg">
                <option value="complaint">Complaint</option>
                <option value="feedback">Feedback</option>
                <option value="suggestion">Suggestion</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Priority *</label>
              <select className="w-full px-3 py-2 border rounded-lg">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Client *</label>
              <input type="text" className="w-full px-3 py-2 border rounded-lg" placeholder="Client name" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Submitted By *</label>
              <input type="text" className="w-full px-3 py-2 border rounded-lg" placeholder="Contact person" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Division *</label>
              <input type="text" className="w-full px-3 py-2 border rounded-lg" placeholder="Division" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Assigned To</label>
              <input type="text" className="w-full px-3 py-2 border rounded-lg" placeholder="Supervisor name" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Subject *</label>
              <input type="text" className="w-full px-3 py-2 border rounded-lg" placeholder="Brief subject" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Description *</label>
              <textarea className="w-full px-3 py-2 border rounded-lg" rows={4} placeholder="Detailed description"></textarea>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Create Ticket
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.map((ticket) => (
          <div key={ticket.id} className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-mono text-gray-500">{ticket.ticketNumber}</span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(ticket.type)}`}>
                    {ticket.type === 'complaint' ? 'Complaint' : ticket.type === 'feedback' ? 'Feedback' : 'Suggestion'}
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityBadge(ticket.priority)}`}>
                    {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(ticket.status)}`}>
                    {ticket.status === 'open' ? 'Open' : ticket.status === 'in-progress' ? 'In Progress' : ticket.status === 'resolved' ? 'Resolved' : 'Closed'}
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-1">{ticket.subject}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Client: {ticket.client} • Submitted by: {ticket.submittedBy} • Date: {ticket.submittedDate}
                </p>
                <p className="text-sm text-gray-700 mb-2">{ticket.description}</p>
                {ticket.resolution && (
                  <div className="mt-3 p-3 bg-green-50 rounded">
                    <div className="text-xs text-gray-600 mb-1">Resolution:</div>
                    <div className="text-sm text-gray-900">{ticket.resolution}</div>
                    {ticket.resolvedDate && (
                      <div className="text-xs text-gray-600 mt-1">Resolved on: {ticket.resolvedDate}</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="border-t pt-3 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Division: <span className="font-medium">{ticket.division}</span> • 
                Assigned to: <span className="font-medium">{ticket.assignedTo}</span>
              </div>
              <div className="flex gap-2">
                {ticket.status === 'open' && (
                  <button className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700">
                    Start Working
                  </button>
                )}
                {ticket.status === 'in-progress' && (
                  <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                    Mark Resolved
                  </button>
                )}
                {ticket.status === 'resolved' && (
                  <button className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700">
                    Close Ticket
                  </button>
                )}
                <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTickets.length === 0 && (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <p className="text-gray-500">Tidak ada tiket untuk filter yang dipilih</p>
        </div>
      )}
    </div>
  );
}
