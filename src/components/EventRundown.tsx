import { useState } from 'react';

interface EventSession {
  id: string;
  title: string;
  speaker: string;
  duration: number; // in minutes
  startTime: string;
  endTime: string;
  location: string;
  notes: string;
}

export default function EventRundown() {
  const [sessions, setSessions] = useState<EventSession[]>([
    {
      id: '1',
      title: 'Registrasi Peserta',
      speaker: '-',
      duration: 30,
      startTime: '08:00',
      endTime: '08:30',
      location: 'Lobby',
      notes: 'Pembagian name tag',
    },
    {
      id: '2',
      title: 'Opening Ceremony',
      speaker: 'CEO PT Perdana Adi Yuda',
      duration: 15,
      startTime: '08:30',
      endTime: '08:45',
      location: 'Main Hall',
      notes: 'Sambutan dan pembukaan',
    },
    {
      id: '3',
      title: 'Keynote Speech',
      speaker: 'Industry Expert',
      duration: 45,
      startTime: '08:45',
      endTime: '09:30',
      location: 'Main Hall',
      notes: 'Tema: Digital Logistics',
    },
  ]);

  const [eventDate, setEventDate] = useState<string>('2026-01-15');
  const [eventName, setEventName] = useState<string>('Annual Client Gathering 2026');
  const [formData, setFormData] = useState({
    title: '',
    speaker: '',
    duration: 30,
    location: '',
    notes: '',
  });

  const [showForm, setShowForm] = useState(false);

  const handleSubmit = () => {
    if (!formData.title || !formData.duration) return;

    // Calculate start and end time based on last session
    let startTime = '08:00';
    if (sessions.length > 0) {
      const lastSession = sessions[sessions.length - 1];
      startTime = lastSession.endTime;
    }

    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + formData.duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;

    const newSession: EventSession = {
      id: Date.now().toString(),
      ...formData,
      startTime,
      endTime,
    };

    setSessions([...sessions, newSession]);
    setFormData({
      title: '',
      speaker: '',
      duration: 30,
      location: '',
      notes: '',
    });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    setSessions(sessions.filter(s => s.id !== id));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newSessions = [...sessions];
    [newSessions[index], newSessions[index - 1]] = [newSessions[index - 1], newSessions[index]];
    setSessions(newSessions);
  };

  const moveDown = (index: number) => {
    if (index === sessions.length - 1) return;
    const newSessions = [...sessions];
    [newSessions[index], newSessions[index + 1]] = [newSessions[index + 1], newSessions[index]];
    setSessions(newSessions);
  };

  const formatEventDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);
  const totalHours = Math.floor(totalDuration / 60);
  const totalMinutes = totalDuration % 60;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0A2540] to-[#1E3A5F] flex items-center justify-center">
            <span className="text-white text-xs font-bold">PA</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">Event Rundown</h1>
            <p className="text-sm text-gray-600">PT Perdana Adi Yuda - Tabel Rundown Acara</p>
          </div>
        </div>
      </div>

      {/* Event Info */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nama Acara</label>
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Tanggal Acara</label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="text-sm text-gray-600">{formatEventDate(eventDate)}</div>
          <div className="text-xl font-bold text-blue-600 mt-1">{eventName}</div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Total Sesi</div>
          <div className="text-3xl font-bold text-blue-600">{sessions.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Total Durasi</div>
          <div className="text-3xl font-bold text-purple-600">
            {totalHours > 0 && `${totalHours}h `}{totalMinutes}m
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Waktu Mulai - Selesai</div>
          <div className="text-2xl font-bold text-green-600">
            {sessions.length > 0 ? `${sessions[0].startTime} - ${sessions[sessions.length - 1].endTime}` : '-'}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
        >
          {showForm ? 'Batal' : '+ Tambah Sesi'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Tambah Sesi Baru</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Judul Sesi *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Judul sesi"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Pembicara/Narasumber</label>
              <input
                type="text"
                value={formData.speaker}
                onChange={(e) => setFormData({ ...formData, speaker: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Nama pembicara"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Durasi (menit) *</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Lokasi</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Lokasi sesi"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Catatan</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Catatan tambahan"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={!formData.title || !formData.duration}
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

      {/* Rundown Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waktu</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durasi</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sesi</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pembicara</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lokasi</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catatan</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sessions.map((session, index) => (
                <tr key={session.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{index + 1}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <div className="font-semibold">{session.startTime} - {session.endTime}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{session.duration} menit</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{session.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{session.speaker || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{session.location || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{session.notes || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                        className="text-blue-600 hover:text-blue-700 text-sm disabled:text-gray-300 disabled:cursor-not-allowed"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveDown(index)}
                        disabled={index === sessions.length - 1}
                        className="text-blue-600 hover:text-blue-700 text-sm disabled:text-gray-300 disabled:cursor-not-allowed"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => handleDelete(session.id)}
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

      {sessions.length === 0 && (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center mt-6">
          <p className="text-gray-500">Belum ada sesi acara</p>
        </div>
      )}
    </div>
  );
}
