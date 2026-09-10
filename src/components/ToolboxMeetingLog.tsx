import { useState } from 'react';

interface ToolboxMeetingLogProps {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

interface Meeting {
  id: string;
  date: string;
  time: string;
  site: string;
  supervisor: string;
  topic: string;
  attendees: { name: string; employeeId: string; signature: boolean }[];
  hazards: { description: string; severity: 'low' | 'medium' | 'high'; action: string }[];
  keyPoints: string[];
  notes: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export default function ToolboxMeetingLog() {
  const [meetings, setMeetings] = useState<Meeting[]>([
    {
      id: '1',
      date: '2026-01-15',
      time: '05:30',
      site: 'Site A - Kalimantan',
      supervisor: 'Ahmad Fauzi',
      topic: 'PPE Compliance and Proper Usage',
      attendees: [
        { name: 'Budi Santoso', employeeId: 'EMP001', signature: true },
        { name: 'Cahyo Widodo', employeeId: 'EMP002', signature: true },
        { name: 'Dedi Kurniawan', employeeId: 'EMP003', signature: true },
        { name: 'Eko Prasetyo', employeeId: 'EMP004', signature: true },
      ],
      hazards: [
        { description: 'Beberapa pekerja tidak menggunakan safety glasses di area crushing', severity: 'medium', action: 'Reminder dan briefing ulang tentang mandatory PPE' },
      ],
      keyPoints: [
        'Safety glasses wajib di area crushing dan screening',
        'Helm harus dipakai dengan benar (chin strap terpasang)',
        'Safety shoes harus dalam kondisi baik',
      ],
      notes: 'Meeting berjalan lancar, semua peserta antusias',
      status: 'completed',
    },
    {
      id: '2',
      date: '2026-01-15',
      time: '17:30',
      site: 'Site A - Kalimantan',
      supervisor: 'Budi Santoso',
      topic: 'Night Shift Safety Protocols',
      attendees: [
        { name: 'Fajar Nugroho', employeeId: 'EMP005', signature: true },
        { name: 'Gunawan Wibowo', employeeId: 'EMP006', signature: true },
        { name: 'Hadi Sucipto', employeeId: 'EMP007', signature: false },
      ],
      hazards: [
        { description: 'Pencahayaan di area hauling kurang memadai', severity: 'high', action: 'Koordinasi dengan tim electrical untuk penambahan lighting' },
      ],
      keyPoints: [
        'Lampu kendaraan harus berfungsi dengan baik',
        'Laporan kondisi gelap/pencahayaan kurang segera ke supervisor',
        'Speed limit night shift: 30 km/jam',
      ],
      notes: 'Perlu follow up untuk masalah pencahayaan',
      status: 'completed',
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [filterDate, setFilterDate] = useState<string>('2026-01-15');
  const [filterSite, setFilterSite] = useState<string>('all');

  const [formData, setFormData] = useState({
    date: '',
    time: '',
    site: '',
    supervisor: '',
    topic: '',
    notes: '',
  });

  const [attendees, setAttendees] = useState<{ name: string; employeeId: string; signature: boolean }[]>([]);
  const [hazards, setHazards] = useState<{ description: string; severity: 'low' | 'medium' | 'high'; action: string }[]>([]);
  const [keyPoints, setKeyPoints] = useState<string[]>([]);

  const [newAttendee, setNewAttendee] = useState({ name: '', employeeId: '' });
  const [newHazard, setNewHazard] = useState({ description: '', severity: 'medium' as 'low' | 'medium' | 'high', action: '' });
  const [newKeyPoint, setNewKeyPoint] = useState('');

  const sites = Array.from(new Set(meetings.map(m => m.site)));

  const filteredMeetings = meetings.filter(m => {
    const matchDate = m.date === filterDate;
    const matchSite = filterSite === 'all' || m.site === filterSite;
    return matchDate && matchSite;
  });

  const handleAddAttendee = () => {
    if (!newAttendee.name || !newAttendee.employeeId) return;
    setAttendees([...attendees, { ...newAttendee, signature: false }]);
    setNewAttendee({ name: '', employeeId: '' });
  };

  const handleRemoveAttendee = (index: number) => {
    setAttendees(attendees.filter((_, i) => i !== index));
  };

  const handleToggleSignature = (index: number) => {
    setAttendees(attendees.map((att, i) =>
      i === index ? { ...att, signature: !att.signature } : att
    ));
  };

  const handleAddHazard = () => {
    if (!newHazard.description || !newHazard.action) return;
    setHazards([...hazards, newHazard]);
    setNewHazard({ description: '', severity: 'medium', action: '' });
  };

  const handleRemoveHazard = (index: number) => {
    setHazards(hazards.filter((_, i) => i !== index));
  };

  const handleAddKeyPoint = () => {
    if (!newKeyPoint) return;
    setKeyPoints([...keyPoints, newKeyPoint]);
    setNewKeyPoint('');
  };

  const handleRemoveKeyPoint = (index: number) => {
    setKeyPoints(keyPoints.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!formData.date || !formData.time || !formData.site || !formData.supervisor || !formData.topic) return;

    const newMeeting: Meeting = {
      id: Date.now().toString(),
      ...formData,
      attendees,
      hazards,
      keyPoints,
      status: 'completed',
    };

    setMeetings([newMeeting, ...meetings]);
    setShowForm(false);
    setFormData({ date: '', time: '', site: '', supervisor: '', topic: '', notes: '' });
    setAttendees([]);
    setHazards([]);
    setKeyPoints([]);
  };

  const getSeverityBadge = (severity: string) => {
    const styles = {
      low: 'bg-yellow-100 text-yellow-800',
      medium: 'bg-orange-100 text-orange-800',
      high: 'bg-red-100 text-red-800',
    };
    return styles[severity as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      scheduled: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const completedCount = meetings.filter(m => m.status === 'completed').length;
  const totalAttendees = meetings.reduce((sum, m) => sum + m.attendees.length, 0);
  const totalHazards = meetings.reduce((sum, m) => sum + m.hazards.length, 0);
  const highSeverityHazards = meetings.reduce((sum, m) => sum + m.hazards.filter(h => h.severity === 'high').length, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0A2540] to-[#1E3A5F] flex items-center justify-center">
            <span className="text-white text-xs font-bold">PA</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">Site Safety & Toolbox Meeting Log</h1>
            <p className="text-sm text-gray-600">PT Perdana Adi Yuda - Dokumentasi Safety Talk / Toolbox Meeting</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Meetings Completed</div>
          <div className="text-3xl font-bold text-green-600">{completedCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Total Attendees</div>
          <div className="text-3xl font-bold text-blue-600">{totalAttendees}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Hazards Identified</div>
          <div className="text-3xl font-bold text-orange-600">{totalHazards}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">High Severity</div>
          <div className="text-3xl font-bold text-red-600">{highSeverityHazards}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Date</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Site</label>
            <select
              value={filterSite}
              onChange={(e) => setFilterSite(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Sites</option>
              {sites.map(site => (
                <option key={site} value={site}>{site}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setShowForm(!showForm)}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
            >
              {showForm ? 'Cancel' : '+ New Meeting'}
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">New Toolbox Meeting</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
              <label className="block text-sm font-medium mb-2">Site *</label>
              <input
                type="text"
                value={formData.site}
                onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Site name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Supervisor *</label>
              <input
                type="text"
                value={formData.supervisor}
                onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Supervisor name"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Topic *</label>
              <input
                type="text"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Meeting topic"
              />
            </div>
          </div>

          {/* Attendees */}
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-3">Attendees</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
              <div>
                <input
                  type="text"
                  value={newAttendee.name}
                  onChange={(e) => setNewAttendee({ ...newAttendee, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Name"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={newAttendee.employeeId}
                  onChange={(e) => setNewAttendee({ ...newAttendee, employeeId: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Employee ID"
                />
              </div>
              <div>
                <button
                  onClick={handleAddAttendee}
                  disabled={!newAttendee.name || !newAttendee.employeeId}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Add Attendee
                </button>
              </div>
            </div>
            {attendees.length > 0 && (
              <div className="space-y-2">
                {attendees.map((att, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium">{att.name}</span>
                      <span className="text-sm text-gray-600 ml-2">({att.employeeId})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleSignature(index)}
                        className={`px-3 py-1 rounded text-sm ${
                          att.signature ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'
                        }`}
                      >
                        {att.signature ? '✓ Signed' : 'Sign'}
                      </button>
                      <button
                        onClick={() => handleRemoveAttendee(index)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Hazards */}
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-3">Hazards Identified</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
              <div className="md:col-span-2">
                <input
                  type="text"
                  value={newHazard.description}
                  onChange={(e) => setNewHazard({ ...newHazard, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Hazard description"
                />
              </div>
              <div>
                <select
                  value={newHazard.severity}
                  onChange={(e) => setNewHazard({ ...newHazard, severity: e.target.value as any })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <input
                  type="text"
                  value={newHazard.action}
                  onChange={(e) => setNewHazard({ ...newHazard, action: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Action required"
                />
              </div>
            </div>
            <button
              onClick={handleAddHazard}
              disabled={!newHazard.description || !newHazard.action}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed mb-3"
            >
              Add Hazard
            </button>
            {hazards.length > 0 && (
              <div className="space-y-2">
                {hazards.map((hazard, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getSeverityBadge(hazard.severity)}`}>
                          {hazard.severity.toUpperCase()}
                        </span>
                        <span className="font-medium">{hazard.description}</span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Action: {hazard.action}</div>
                    </div>
                    <button
                      onClick={() => handleRemoveHazard(index)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Key Points */}
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-3">Key Points Discussed</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div>
                <input
                  type="text"
                  value={newKeyPoint}
                  onChange={(e) => setNewKeyPoint(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Key point"
                />
              </div>
              <div>
                <button
                  onClick={handleAddKeyPoint}
                  disabled={!newKeyPoint}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Add Key Point
                </button>
              </div>
            </div>
            {keyPoints.length > 0 && (
              <div className="space-y-2">
                {keyPoints.map((point, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>{point}</span>
                    <button
                      onClick={() => handleRemoveKeyPoint(index)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Additional Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSubmit}
              disabled={!formData.date || !formData.time || !formData.site || !formData.supervisor || !formData.topic}
              className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
            >
              Submit Meeting
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

      {/* Meeting Records */}
      <div className="space-y-4">
        {filteredMeetings.map(meeting => (
          <div key={meeting.id} className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold mb-1">{meeting.topic}</h3>
                <p className="text-sm text-gray-600">
                  {meeting.date} at {meeting.time} • {meeting.site}
                </p>
                <p className="text-sm text-gray-600">
                  Supervisor: <span className="font-medium">{meeting.supervisor}</span>
                </p>
              </div>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(meeting.status)}`}>
                {meeting.status === 'scheduled' ? 'Scheduled' : meeting.status === 'completed' ? 'Completed' : 'Cancelled'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Attendees</div>
                <div className="text-2xl font-bold text-blue-600">{meeting.attendees.length}</div>
                <div className="text-xs text-gray-600">
                  {meeting.attendees.filter(a => a.signature).length} signed
                </div>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Hazards</div>
                <div className="text-2xl font-bold text-orange-600">{meeting.hazards.length}</div>
                <div className="text-xs text-gray-600">
                  {meeting.hazards.filter(h => h.severity === 'high').length} high severity
                </div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Key Points</div>
                <div className="text-2xl font-bold text-green-600">{meeting.keyPoints.length}</div>
              </div>
            </div>

            {meeting.hazards.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Hazards Identified:</h4>
                <div className="space-y-2">
                  {meeting.hazards.map((hazard, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getSeverityBadge(hazard.severity)}`}>
                          {hazard.severity.toUpperCase()}
                        </span>
                        <span className="font-medium">{hazard.description}</span>
                      </div>
                      <div className="text-sm text-gray-600">Action: {hazard.action}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {meeting.keyPoints.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Key Points:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  {meeting.keyPoints.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>
            )}

            {meeting.notes && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Notes:</div>
                <div className="text-sm text-gray-900">{meeting.notes}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredMeetings.length === 0 && (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <p className="text-gray-500">No meetings found for selected date and site</p>
        </div>
      )}
    </div>
  );
}
