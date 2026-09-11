import { useMemo, useState } from 'react';

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

const seedDeployments: Deployment[] = [
  {
    id: '1', employeeName: 'Ahmad Fauzi', employeeId: 'EMP001', clientName: 'PT ABC Manufacturing', position: 'Staff Admin', deploymentDate: '2026-01-15',
    checklist: [
      { id: '1', category: 'Dokumen', item: 'KTP (Fotokopi)', completed: true, notes: '' }, { id: '2', category: 'Dokumen', item: 'NPWP (Fotokopi)', completed: true, notes: '' },
      { id: '3', category: 'Dokumen', item: 'KK (Fotokopi)', completed: true, notes: '' }, { id: '4', category: 'Dokumen', item: 'Ijazah Terakhir', completed: true, notes: '' },
      { id: '5', category: 'Dokumen', item: 'Pas Foto 3x4 (4 lembar)', completed: false, notes: '' }, { id: '6', category: 'Dokumen', item: 'SKCK', completed: true, notes: '' },
      { id: '7', category: 'Dokumen', item: 'Surat Keterangan Sehat', completed: true, notes: '' }, { id: '8', category: 'Dokumen', item: 'BPJS Kesehatan', completed: false, notes: 'Dalam proses' },
      { id: '9', category: 'Perlengkapan', item: 'Seragam Kerja', completed: true, notes: 'Size L' }, { id: '10', category: 'Perlengkapan', item: 'Safety Shoes', completed: true, notes: 'Size 42' },
      { id: '11', category: 'Perlengkapan', item: 'Helmet', completed: false, notes: '' }, { id: '12', category: 'Perlengkapan', item: 'ID Card Karyawan', completed: true, notes: '' },
      { id: '13', category: 'Perlengkapan', item: 'ID Card Client', completed: false, notes: 'Menunggu dari klien' }, { id: '14', category: 'Training', item: 'Induction Training', completed: true, notes: '' },
      { id: '15', category: 'Training', item: 'Safety Training', completed: true, notes: '' }, { id: '16', category: 'Training', item: 'SOP Client', completed: false, notes: 'Jadwal: 10 Jan 2026' },
    ],
  },
  {
    id: '2', employeeName: 'Siti Nurhaliza', employeeId: 'EMP002', clientName: 'PT XYZ Logistics', position: 'Operator', deploymentDate: '2026-01-20',
    checklist: [
      { id: '1', category: 'Dokumen', item: 'KTP (Fotokopi)', completed: true, notes: '' }, { id: '2', category: 'Dokumen', item: 'NPWP (Fotokopi)', completed: true, notes: '' },
      { id: '3', category: 'Dokumen', item: 'KK (Fotokopi)', completed: true, notes: '' }, { id: '4', category: 'Dokumen', item: 'Ijazah Terakhir', completed: true, notes: '' },
      { id: '5', category: 'Dokumen', item: 'Pas Foto 3x4', completed: true, notes: '' }, { id: '6', category: 'Dokumen', item: 'SKCK', completed: true, notes: '' },
      { id: '7', category: 'Dokumen', item: 'Surat Keterangan Sehat', completed: true, notes: '' }, { id: '8', category: 'Perlengkapan', item: 'Seragam Kerja', completed: true, notes: 'Size M' },
      { id: '9', category: 'Perlengkapan', item: 'Safety Shoes', completed: true, notes: 'Size 38' }, { id: '10', category: 'Perlengkapan', item: 'ID Card Karyawan', completed: true, notes: '' },
      { id: '11', category: 'Perlengkapan', item: 'ID Card Client', completed: true, notes: '' }, { id: '12', category: 'Training', item: 'Induction Training', completed: true, notes: '' },
      { id: '13', category: 'Training', item: 'Safety Training', completed: true, notes: '' }, { id: '14', category: 'Training', item: 'SOP Client', completed: true, notes: '' },
    ],
  },
];

export default function DeploymentPlanner() {
  const [deployments, setDeployments] = useState(seedDeployments);
  const [selectedDeployment, setSelectedDeployment] = useState(seedDeployments[0]?.id || '');
  const current = deployments.find((deployment) => deployment.id === selectedDeployment);

  const toggleChecklist = (deploymentId: string, itemId: string) => {
    setDeployments((currentDeployments) => currentDeployments.map((deployment) => deployment.id !== deploymentId ? deployment : {
      ...deployment,
      checklist: deployment.checklist.map((item) => item.id === itemId ? { ...item, completed: !item.completed } : item),
    }));
  };

  const updateNotes = (deploymentId: string, itemId: string, notes: string) => {
    setDeployments((currentDeployments) => currentDeployments.map((deployment) => deployment.id !== deploymentId ? deployment : {
      ...deployment,
      checklist: deployment.checklist.map((item) => item.id === itemId ? { ...item, notes } : item),
    }));
  };

  const stats = useMemo(() => {
    if (!current) return { total: 0, completed: 0, percentage: 0, categories: [] as Array<{ category: string; completed: number; total: number; percentage: number }> };
    const categories = Array.from(new Set(current.checklist.map((item) => item.category))).map((category) => {
      const items = current.checklist.filter((item) => item.category === category);
      const completed = items.filter((item) => item.completed).length;
      return { category, completed, total: items.length, percentage: items.length ? Math.round((completed / items.length) * 100) : 0 };
    });
    const completed = current.checklist.filter((item) => item.completed).length;
    return { total: current.checklist.length, completed, percentage: current.checklist.length ? Math.round((completed / current.checklist.length) * 100) : 0, categories };
  }, [current]);

  if (!current) return <div className="bg-white border rounded-xl p-10 text-center text-sm text-gray-500">Tidak ada data deployment.</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <section className="bg-white border rounded-xl p-4">
        <label>Pilih Deployment
          <select value={selectedDeployment} onChange={(event) => setSelectedDeployment(event.target.value)}>
            {deployments.map((deployment) => <option key={deployment.id} value={deployment.id}>{deployment.employeeName} · {deployment.clientName} · {deployment.position}</option>)}
          </select>
        </label>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        <div className="bg-white border rounded-xl p-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div><p className="text-[10px] uppercase tracking-wide text-gray-500">Karyawan</p><strong className="block mt-1 text-sm">{current.employeeName}</strong><span className="text-[10px] text-gray-500">{current.employeeId}</span></div>
            <div><p className="text-[10px] uppercase tracking-wide text-gray-500">Klien</p><strong className="block mt-1 text-sm">{current.clientName}</strong></div>
            <div><p className="text-[10px] uppercase tracking-wide text-gray-500">Posisi</p><strong className="block mt-1 text-sm">{current.position}</strong></div>
            <div><p className="text-[10px] uppercase tracking-wide text-gray-500">Deployment</p><strong className="block mt-1 text-sm">{new Date(`${current.deploymentDate}T00:00:00`).toLocaleDateString('id-ID')}</strong></div>
          </div>
        </div>

        <aside className="bg-white border rounded-xl p-4">
          <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] uppercase tracking-wide text-gray-500">Readiness</p><strong className="text-xl">{stats.percentage}%</strong></div><span className={`rounded-full px-2 py-1 text-[9px] font-semibold ${stats.percentage === 100 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{stats.completed}/{stats.total}</span></div>
          <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${stats.percentage === 100 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${stats.percentage}%` }} /></div>
        </aside>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {stats.categories.map((stat) => <div key={stat.category} className="bg-white border rounded-xl p-4"><div className="flex items-center justify-between gap-3"><div><p className="text-[10px] uppercase tracking-wide text-gray-500">{stat.category}</p><strong className="block mt-1 text-lg">{stat.completed}/{stat.total}</strong></div><strong className="text-sm text-blue-600">{stat.percentage}%</strong></div><div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: `${stat.percentage}%` }} /></div></div>)}
      </section>

      <div className="space-y-3">
        {stats.categories.map((stat) => {
          const items = current.checklist.filter((item) => item.category === stat.category);
          return (
            <section key={stat.category} className="bg-white border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b flex items-center justify-between gap-3"><div><h2 className="text-sm font-semibold">{stat.category}</h2><p className="text-[10px] text-gray-500 mt-0.5">{stat.completed} dari {stat.total} selesai</p></div><span className="text-[10px] font-semibold text-blue-600">{stat.percentage}%</span></div>
              <div className="divide-y">
                {items.map((item) => (
                  <div key={item.id} className="p-3 grid grid-cols-[auto_minmax(0,1fr)] gap-3 items-start">
                    <input type="checkbox" checked={item.completed} onChange={() => toggleChecklist(current.id, item.id)} className="mt-1" />
                    <div className="min-w-0">
                      <div className="flex items-center justify-between gap-3"><strong className={`text-xs ${item.completed ? 'line-through text-gray-400' : ''}`}>{item.item}</strong>{item.completed && <span className="rounded-full bg-green-100 text-green-700 px-2 py-1 text-[9px] font-semibold">Done</span>}</div>
                      <input value={item.notes} onChange={(event) => updateNotes(current.id, item.id, event.target.value)} placeholder="Tambahkan catatan..." className="mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {stats.percentage < 100 && <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-800">Deployment belum siap: {stats.total - stats.completed} item masih terbuka. Checklist harus selesai sebelum status dianggap 100% ready.</div>}
    </div>
  );
}
