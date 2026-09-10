import { useState } from 'react';

interface ChecklistItem {
  id: string;
  category: string;
  item: string;
  completed: boolean;
  notes: string;
}

interface Deployment {
  id: string;
  employeeName: string;
  employeeId: string;
  clientName: string;
  position: string;
  deploymentDate: string;
  checklist: ChecklistItem[];
}

export default function DeploymentPlanner() {
  const [deployments, setDeployments] = useState<Deployment[]>([
    {
      id: '1',
      employeeName: 'Ahmad Fauzi',
      employeeId: 'EMP001',
      clientName: 'PT ABC Manufacturing',
      position: 'Staff Admin',
      deploymentDate: '2026-01-15',
      checklist: [
        { id: '1', category: 'Dokumen', item: 'KTP (Fotokopi)', completed: true, notes: '' },
        { id: '2', category: 'Dokumen', item: 'NPWP (Fotokopi)', completed: true, notes: '' },
        { id: '3', category: 'Dokumen', item: 'KK (Fotokopi)', completed: true, notes: '' },
        { id: '4', category: 'Dokumen', item: 'Ijazah Terakhir', completed: true, notes: '' },
        { id: '5', category: 'Dokumen', item: 'Pas Foto 3x4 (4 lembar)', completed: false, notes: '' },
        { id: '6', category: 'Dokumen', item: 'SKCK (Surat Keterangan Catatan Kepolisian)', completed: true, notes: '' },
        { id: '7', category: 'Dokumen', item: 'Surat Keterangan Sehat', completed: true, notes: '' },
        { id: '8', category: 'Dokumen', item: 'BPJS Kesehatan (Jika ada)', completed: false, notes: 'Dalam proses' },
        { id: '9', category: 'Perlengkapan', item: 'Seragam Kerja', completed: true, notes: 'Size L' },
        { id: '10', category: 'Perlengkapan', item: 'Safety Shoes', completed: true, notes: 'Size 42' },
        { id: '11', category: 'Perlengkapan', item: 'Helmet (Jika diperlukan)', completed: false, notes: '' },
        { id: '12', category: 'Perlengkapan', item: 'ID Card Karyawan', completed: true, notes: '' },
        { id: '13', category: 'Perlengkapan', item: 'ID Card Client (Akses)', completed: false, notes: 'Menunggu dari klien' },
        { id: '14', category: 'Training', item: 'Induction Training', completed: true, notes: '' },
        { id: '15', category: 'Training', item: 'Safety Training', completed: true, notes: '' },
        { id: '16', category: 'Training', item: 'SOP Client', completed: false, notes: 'Jadwal: 10 Jan 2026' },
      ],
    },
    {
      id: '2',
      employeeName: 'Siti Nurhaliza',
      employeeId: 'EMP002',
      clientName: 'PT XYZ Logistics',
      position: 'Operator',
      deploymentDate: '2026-01-20',
      checklist: [
        { id: '1', category: 'Dokumen', item: 'KTP (Fotokopi)', completed: true, notes: '' },
        { id: '2', category: 'Dokumen', item: 'NPWP (Fotokopi)', completed: true, notes: '' },
        { id: '3', category: 'Dokumen', item: 'KK (Fotokopi)', completed: true, notes: '' },
        { id: '4', category: 'Dokumen', item: 'Ijazah Terakhir', completed: true, notes: '' },
        { id: '5', category: 'Dokumen', item: 'Pas Foto 3x4 (4 lembar)', completed: true, notes: '' },
        { id: '6', category: 'Dokumen', item: 'SKCK', completed: true, notes: '' },
        { id: '7', category: 'Dokumen', item: 'Surat Keterangan Sehat', completed: true, notes: '' },
        { id: '8', category: 'Perlengkapan', item: 'Seragam Kerja', completed: true, notes: 'Size M' },
        { id: '9', category: 'Perlengkapan', item: 'Safety Shoes', completed: true, notes: 'Size 38' },
        { id: '10', category: 'Perlengkapan', item: 'ID Card Karyawan', completed: true, notes: '' },
        { id: '11', category: 'Perlengkapan', item: 'ID Card Client', completed: true, notes: '' },
        { id: '12', category: 'Training', item: 'Induction Training', completed: true, notes: '' },
        { id: '13', category: 'Training', item: 'Safety Training', completed: true, notes: '' },
        { id: '14', category: 'Training', item: 'SOP Client', completed: true, notes: '' },
      ],
    },
  ]);

  const [selectedDeployment, setSelectedDeployment] = useState<string>(deployments[0]?.id || '');

  const currentDeployment = deployments.find(d => d.id === selectedDeployment);

  const toggleChecklist = (deploymentId: string, itemId: string) => {
    setDeployments(deployments.map(d => {
      if (d.id === deploymentId) {
        return {
          ...d,
          checklist: d.checklist.map(item => 
            item.id === itemId ? { ...item, completed: !item.completed } : item
          ),
        };
      }
      return d;
    }));
  };

  const updateNotes = (deploymentId: string, itemId: string, notes: string) => {
    setDeployments(deployments.map(d => {
      if (d.id === deploymentId) {
        return {
          ...d,
          checklist: d.checklist.map(item => 
            item.id === itemId ? { ...item, notes } : item
          ),
        };
      }
      return d;
    }));
  };

  const getCompletionPercentage = (deployment: Deployment) => {
    const completed = deployment.checklist.filter(item => item.completed).length;
    const total = deployment.checklist.length;
    return total > 0 ? ((completed / total) * 100).toFixed(1) : '0';
  };

  const getCategoryStats = (deployment: Deployment) => {
    const categories = Array.from(new Set(deployment.checklist.map(item => item.category)));
    return categories.map(category => {
      const categoryItems = deployment.checklist.filter(item => item.category === category);
      const completed = categoryItems.filter(item => item.completed).length;
      return {
        category,
        completed,
        total: categoryItems.length,
        percentage: ((completed / categoryItems.length) * 100).toFixed(1),
      };
    });
  };

  if (!currentDeployment) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <p className="text-gray-500">Tidak ada data deployment</p>
        </div>
      </div>
    );
  }

  const categoryStats = getCategoryStats(currentDeployment);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0A2540] to-[#1E3A5F] flex items-center justify-center">
            <span className="text-white text-xs font-bold">PA</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">Deployment Planner</h1>
            <p className="text-sm text-gray-600">PT Perdana Adi Yuda - Checklist Pemenuhan Syarat Pekerja Baru</p>
          </div>
        </div>
      </div>

      {/* Deployment Selector */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
        <label className="block text-sm font-medium mb-2">Pilih Deployment</label>
        <select
          value={selectedDeployment}
          onChange={(e) => setSelectedDeployment(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          {deployments.map(d => (
            <option key={d.id} value={d.id}>
              {d.employeeName} - {d.clientName} ({d.position})
            </option>
          ))}
        </select>
      </div>

      {/* Deployment Info */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-600 mb-1">Karyawan</div>
            <div className="text-lg font-semibold">{currentDeployment.employeeName}</div>
            <div className="text-xs text-gray-500">{currentDeployment.employeeId}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Klien</div>
            <div className="text-lg font-semibold">{currentDeployment.clientName}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Posisi</div>
            <div className="text-lg font-semibold">{currentDeployment.position}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Tanggal Deployment</div>
            <div className="text-lg font-semibold">{currentDeployment.deploymentDate}</div>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 mb-6 text-white">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold">Overall Completion</h2>
          <div className="text-3xl font-bold">{getCompletionPercentage(currentDeployment)}%</div>
        </div>
        <div className="w-full bg-white/20 rounded-full h-3">
          <div
            className="bg-white h-3 rounded-full transition-all"
            style={{ width: `${getCompletionPercentage(currentDeployment)}%` }}
          ></div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          {categoryStats.map((stat, index) => (
            <div key={index} className="bg-white/10 rounded-lg p-3">
              <div className="text-sm opacity-90">{stat.category}</div>
              <div className="text-2xl font-bold">{stat.completed}/{stat.total}</div>
              <div className="text-xs opacity-75">{stat.percentage}% complete</div>
            </div>
          ))}
        </div>
      </div>

      {/* Checklist by Category */}
      <div className="space-y-6">
        {categoryStats.map((stat, index) => {
          const categoryItems = currentDeployment.checklist.filter(item => item.category === stat.category);
          
          return (
            <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-4 border-b bg-gray-50">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold">{stat.category}</h3>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-gray-600">{stat.completed}/{stat.total} completed</div>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${stat.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {categoryItems.map((item) => (
                  <div key={item.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => toggleChecklist(currentDeployment.id, item.id)}
                        className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className={`text-sm font-medium ${item.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                          {item.item}
                        </div>
                        <input
                          type="text"
                          value={item.notes}
                          onChange={(e) => updateNotes(currentDeployment.id, item.id, e.target.value)}
                          placeholder="Tambahkan catatan..."
                          className="mt-2 w-full px-3 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      {item.completed && (
                        <span className="text-green-500 text-xl">✓</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
