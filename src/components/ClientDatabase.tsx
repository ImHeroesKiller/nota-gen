import { useState, useEffect } from 'react';

interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  npwp: string;
  notes: string;
  createdAt: string;
}

export default function ClientDatabase({ onBack, darkMode, setDarkMode }: any) {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<Omit<Client, 'id' | 'createdAt'>>({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    npwp: '',
    notes: '',
  });

  const bg = darkMode ? 'bg-[#0f1419]' : 'bg-[#f8f9fb]';
  const sidebarBg = darkMode ? 'bg-[#161b22]' : 'bg-white';
  const borderColor = darkMode ? 'border-[#21262d]' : 'border-[#e2e5e9]';
  const cardBg = darkMode ? 'bg-[#1c2128]' : 'bg-[#f3f4f6]';
  const textPrimary = darkMode ? 'text-[#e6edf3]' : 'text-[#1a1a2e]';
  const textSecondary = darkMode ? 'text-[#8b949e]' : 'text-[#57606a]';
  const inputBg = darkMode ? 'bg-[#0d1117] border-[#30363d]' : 'bg-white border-[#d0d7de]';
  const hoverBg = darkMode ? 'hover:bg-[#21262d]' : 'hover:bg-[#f0f1f3]';

  useEffect(() => {
    const saved = localStorage.getItem('perada_clients');
    if (saved) {
      setClients(JSON.parse(saved));
    }
  }, []);

  const saveClients = (newClients: Client[]) => {
    setClients(newClients);
    localStorage.setItem('perada_clients', JSON.stringify(newClients));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.company) {
      alert('Nama dan company wajib diisi');
      return;
    }

    if (editingClient) {
      const updated = clients.map((c) =>
        c.id === editingClient.id ? { ...c, ...formData } : c
      );
      saveClients(updated);
    } else {
      const newClient: Client = {
        ...formData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      saveClients([...clients, newClient]);
    }

    setShowForm(false);
    setEditingClient(null);
    setFormData({
      name: '',
      company: '',
      email: '',
      phone: '',
      address: '',
      npwp: '',
      notes: '',
    });
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      company: client.company,
      email: client.email,
      phone: client.phone,
      address: client.address,
      npwp: client.npwp,
      notes: client.notes,
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Yakin ingin menghapus client ini?')) {
      saveClients(clients.filter((c) => c.id !== id));
    }
  };

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportCSV = () => {
    const headers = ['Name', 'Company', 'Email', 'Phone', 'Address', 'NPWP', 'Notes'];
    const rows = clients.map((c) => [
      c.name,
      c.company,
      c.email,
      c.phone,
      c.address,
      c.npwp,
      c.notes,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clients_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${bg} ${textPrimary}`}>
      <header className={`flex items-center justify-between px-4 py-2.5 border-b shrink-0 ${sidebarBg} ${borderColor}`}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className={`w-7 h-7 rounded-lg flex items-center justify-center ${hoverBg}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center shadow-sm">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight">Client Database</h1>
            <p className={`text-[10px] ${textSecondary}`}>Kelola data klien</p>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${cardBg} ${textSecondary}`}>
            {clients.length} clients
          </span>
        </div>
        <button onClick={() => setDarkMode(!darkMode)} className={`w-8 h-8 rounded-lg flex items-center justify-center ${hoverBg}`}>
          {darkMode ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          )}
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Client List */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className={`flex items-center justify-between px-4 py-2 border-b ${borderColor}`}>
            <div className="flex items-center gap-2">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`px-3 py-1.5 rounded-lg text-xs border ${inputBg} ${textPrimary} w-64`}
                placeholder="Search clients..."
              />
              <button
                onClick={exportCSV}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${borderColor} ${hoverBg} ${textSecondary}`}
              >
                Export CSV
              </button>
            </div>
            <button
              onClick={() => {
                setShowForm(true);
                setEditingClient(null);
                setFormData({
                  name: '',
                  company: '',
                  email: '',
                  phone: '',
                  address: '',
                  npwp: '',
                  notes: '',
                });
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-600 hover:bg-purple-700 text-white"
            >
              + Add Client
            </button>
          </div>

          {/* Client Table */}
          <div className="flex-1 overflow-auto">
            {filteredClients.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className={`w-14 h-14 mx-auto mb-3 rounded-2xl ${cardBg} flex items-center justify-center`}>
                    <svg className={`w-6 h-6 ${textSecondary}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <p className={`text-sm font-medium ${textSecondary}`}>Belum ada client</p>
                  <p className={`text-xs mt-1 ${textSecondary}`}>Klik "Add Client" untuk menambahkan</p>
                </div>
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead className={`sticky top-0 ${cardBg}`}>
                  <tr className={`border-b ${borderColor}`}>
                    <th className={`text-left px-4 py-2 font-semibold ${textSecondary}`}>Name</th>
                    <th className={`text-left px-4 py-2 font-semibold ${textSecondary}`}>Company</th>
                    <th className={`text-left px-4 py-2 font-semibold ${textSecondary}`}>Email</th>
                    <th className={`text-left px-4 py-2 font-semibold ${textSecondary}`}>Phone</th>
                    <th className={`text-right px-4 py-2 font-semibold ${textSecondary}`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client) => (
                    <tr key={client.id} className={`border-b ${borderColor} ${hoverBg}`}>
                      <td className="px-4 py-2.5 font-medium">{client.name}</td>
                      <td className="px-4 py-2.5">{client.company}</td>
                      <td className={`px-4 py-2.5 ${textSecondary}`}>{client.email || '-'}</td>
                      <td className={`px-4 py-2.5 ${textSecondary}`}>{client.phone || '-'}</td>
                      <td className="px-4 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(client)}
                            className={`w-6 h-6 rounded flex items-center justify-center ${hoverBg}`}
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(client.id)}
                            className="w-6 h-6 rounded flex items-center justify-center text-red-400 hover:bg-red-500/10"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className={`w-full max-w-md rounded-2xl p-5 shadow-2xl ${sidebarBg} border ${borderColor}`} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">{editingClient ? 'Edit Client' : 'Add New Client'}</h3>
              <button onClick={() => setShowForm(false)} className={`w-6 h-6 rounded-lg flex items-center justify-center ${hoverBg}`}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} block mb-1`}>Contact Name *</label>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} block mb-1`}>Company *</label>
                <input
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`}
                  placeholder="PT Example"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} block mb-1`}>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`}
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} block mb-1`}>Phone</label>
                  <input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`}
                    placeholder="081234567890"
                  />
                </div>
              </div>

              <div>
                <label className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} block mb-1`}>Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={2}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary} resize-none`}
                  placeholder="Jl. Example No. 123, Jakarta"
                />
              </div>

              <div>
                <label className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} block mb-1`}>NPWP</label>
                <input
                  value={formData.npwp}
                  onChange={(e) => setFormData({ ...formData, npwp: e.target.value })}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`}
                  placeholder="01.234.567.8-901.000"
                />
              </div>

              <div>
                <label className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} block mb-1`}>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary} resize-none`}
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowForm(false)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium border ${borderColor} ${hoverBg} ${textSecondary}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-2 rounded-lg text-xs font-medium bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {editingClient ? 'Update' : 'Add'} Client
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className={`px-4 py-2 border-t shrink-0 flex items-center justify-between ${sidebarBg} ${borderColor}`}>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#0A2540] flex items-center justify-center">
            <span className="text-white text-[6px] font-bold">PA</span>
          </div>
          <span className={`text-[10px] ${textSecondary}`}>
            <span className="font-medium text-[#0A2540] dark:text-[#58a6ff]">PT Perdana Adi Yuda</span> — PERADA GROUP
          </span>
        </div>
        <span className={`text-[10px] ${textSecondary}`}>© 2026</span>
      </footer>
    </div>
  );
}
