import { useMemo, useState } from 'react';

interface OnboardingChecklist {
  id: string;
  employeeName: string;
  employeeId: string;
  division: string;
  client: string;
  startDate: string;
  documents: {
    name: string;
    status: 'pending' | 'submitted' | 'verified' | 'rejected';
    notes: string;
  }[];
  overallStatus: 'in-progress' | 'completed' | 'pending-review';
}

const seedData: OnboardingChecklist[] = [
  {
    id: '1', employeeName: 'Ahmad Fauzi', employeeId: 'EMP001', division: 'Security', client: 'PT ABC Manufacturing', startDate: '2026-01-15', overallStatus: 'completed',
    documents: [
      { name: 'Kontrak Kerja', status: 'verified', notes: 'Signed on 2026-01-10' }, { name: 'KTP', status: 'verified', notes: 'Verified' }, { name: 'NPWP', status: 'verified', notes: 'Verified' },
      { name: 'Sertifikat Gada Pratama', status: 'verified', notes: 'Valid until 2028' }, { name: 'MCU (Medical Check-up)', status: 'verified', notes: 'Fit for duty' }, { name: 'SKCK', status: 'verified', notes: 'Clean record' }, { name: 'Background Check', status: 'verified', notes: 'Passed' },
    ],
  },
  {
    id: '2', employeeName: 'Budi Santoso', employeeId: 'EMP002', division: 'Cleaning Service', client: 'PT XYZ Tower', startDate: '2026-01-20', overallStatus: 'in-progress',
    documents: [
      { name: 'Kontrak Kerja', status: 'submitted', notes: 'Awaiting signature' }, { name: 'KTP', status: 'verified', notes: 'Verified' }, { name: 'NPWP', status: 'pending', notes: 'Not submitted yet' },
      { name: 'Sertifikat Kompetensi', status: 'pending', notes: 'Not submitted yet' }, { name: 'MCU (Medical Check-up)', status: 'submitted', notes: 'In progress' }, { name: 'SKCK', status: 'pending', notes: 'Not submitted yet' }, { name: 'Background Check', status: 'pending', notes: 'Not started' },
    ],
  },
  {
    id: '3', employeeName: 'Cahyo Widodo', employeeId: 'EMP003', division: 'Customer Service', client: 'PT DEF Telecom', startDate: '2026-01-25', overallStatus: 'pending-review',
    documents: [
      { name: 'Kontrak Kerja', status: 'verified', notes: 'Signed' }, { name: 'KTP', status: 'verified', notes: 'Verified' }, { name: 'NPWP', status: 'verified', notes: 'Verified' },
      { name: 'Sertifikat Service Excellence', status: 'verified', notes: 'Valid' }, { name: 'MCU (Medical Check-up)', status: 'verified', notes: 'Fit' }, { name: 'SKCK', status: 'rejected', notes: 'Expired, need renewal' }, { name: 'Background Check', status: 'submitted', notes: 'In review' },
    ],
  },
];

interface OnboardingComplianceChecklistProps {
  onBack?: () => void;
  darkMode?: boolean;
  setDarkMode?: (value: boolean) => void;
}

const statusLabel: Record<string, string> = {
  pending: 'Pending', submitted: 'Submitted', verified: 'Verified', rejected: 'Rejected',
  'in-progress': 'In Progress', completed: 'Completed', 'pending-review': 'Pending Review',
};

const statusClass: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600', submitted: 'bg-blue-100 text-blue-700', verified: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700',
  'in-progress': 'bg-amber-100 text-amber-700', completed: 'bg-green-100 text-green-700', 'pending-review': 'bg-blue-100 text-blue-700',
};

export default function OnboardingComplianceChecklist(_: OnboardingComplianceChecklistProps) {
  const [checklists, setChecklists] = useState(seedData);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDivision, setFilterDivision] = useState('all');
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const divisions = useMemo(() => Array.from(new Set(checklists.map((item) => item.division))), [checklists]);

  const filteredChecklists = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return checklists.filter((item) => {
      const matchesStatus = filterStatus === 'all' || item.overallStatus === filterStatus;
      const matchesDivision = filterDivision === 'all' || item.division === filterDivision;
      const matchesQuery = !normalizedQuery || `${item.employeeName} ${item.employeeId} ${item.client} ${item.division}`.toLowerCase().includes(normalizedQuery);
      return matchesStatus && matchesDivision && matchesQuery;
    });
  }, [checklists, filterDivision, filterStatus, query]);

  const completion = (item: OnboardingChecklist) => {
    if (!item.documents.length) return 0;
    return Math.round((item.documents.filter((document) => document.status === 'verified').length / item.documents.length) * 100);
  };

  const approveChecklist = (id: string) => {
    setChecklists((current) => current.map((item) => {
      if (item.id !== id) return item;
      const allVerified = item.documents.every((document) => document.status === 'verified');
      return allVerified ? { ...item, overallStatus: 'completed' } : item;
    }));
  };

  const completedCount = checklists.filter((item) => item.overallStatus === 'completed').length;
  const attentionCount = checklists.filter((item) => item.documents.some((document) => document.status === 'rejected')).length;

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border rounded-xl p-4"><p className="text-[10px] uppercase tracking-wide text-gray-500">Total onboarding</p><strong className="block mt-1 text-xl">{checklists.length}</strong></div>
        <div className="bg-white border rounded-xl p-4"><p className="text-[10px] uppercase tracking-wide text-gray-500">Completed</p><strong className="block mt-1 text-xl text-green-600">{completedCount}</strong></div>
        <div className="bg-white border rounded-xl p-4"><p className="text-[10px] uppercase tracking-wide text-gray-500">Open items</p><strong className="block mt-1 text-xl text-blue-600">{checklists.length - completedCount}</strong></div>
        <div className="bg-white border rounded-xl p-4"><p className="text-[10px] uppercase tracking-wide text-gray-500">Need attention</p><strong className="block mt-1 text-xl text-red-600">{attentionCount}</strong></div>
      </section>

      <section className="bg-white border rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr] gap-3">
          <label>Cari karyawan
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nama, employee ID, klien" />
          </label>
          <label>Status
            <select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)}>
              <option value="all">Semua status</option><option value="in-progress">In Progress</option><option value="pending-review">Pending Review</option><option value="completed">Completed</option>
            </select>
          </label>
          <label>Divisi
            <select value={filterDivision} onChange={(event) => setFilterDivision(event.target.value)}>
              <option value="all">Semua divisi</option>{divisions.map((division) => <option key={division} value={division}>{division}</option>)}
            </select>
          </label>
        </div>
      </section>

      <div className="space-y-3">
        {filteredChecklists.map((item) => {
          const percentage = completion(item);
          const rejected = item.documents.filter((document) => document.status === 'rejected').length;
          const pending = item.documents.filter((document) => document.status === 'pending' || document.status === 'submitted').length;
          const allVerified = item.documents.every((document) => document.status === 'verified');
          const expanded = expandedId === item.id;

          return (
            <article key={item.id} className="bg-white border rounded-xl overflow-hidden">
              <div className="p-4 flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap"><strong className="text-sm">{item.employeeName}</strong><span className={`rounded-full px-2 py-1 text-[9px] font-semibold ${statusClass[item.overallStatus]}`}>{statusLabel[item.overallStatus]}</span></div>
                  <p className="text-[11px] text-gray-500 mt-1">{item.employeeId} · {item.division} · {item.client}</p>
                  <p className="text-[10px] text-gray-400 mt-1">Start {new Date(`${item.startDate}T00:00:00`).toLocaleDateString('id-ID')}</p>
                </div>

                <div className="w-full lg:w-64">
                  <div className="flex justify-between text-[10px] mb-1"><span className="text-gray-500">Document readiness</span><strong>{percentage}%</strong></div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${percentage === 100 ? 'bg-green-500' : rejected ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${percentage}%` }} /></div>
                  <div className="flex gap-3 mt-1.5 text-[9px] text-gray-500"><span>{item.documents.length} docs</span><span>{pending} open</span>{rejected > 0 && <span className="text-red-600">{rejected} rejected</span>}</div>
                </div>

                <div className="flex items-center gap-2 lg:justify-end">
                  {item.overallStatus === 'pending-review' && (
                    <button type="button" disabled={!allVerified} onClick={() => approveChecklist(item.id)} className="px-3 py-2 bg-green-600 text-white rounded-lg" title={!allVerified ? 'Semua dokumen harus Verified sebelum approval' : 'Approve onboarding'}>
                      Approve
                    </button>
                  )}
                  <button type="button" onClick={() => setExpandedId(expanded ? null : item.id)} className="px-3 py-2 border rounded-lg">{expanded ? 'Tutup' : 'Detail'}</button>
                </div>
              </div>

              {expanded && (
                <div className="border-t p-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                    {item.documents.map((document) => (
                      <div key={document.name} className="bg-white border rounded-lg p-3 flex items-start justify-between gap-3">
                        <div className="min-w-0"><strong className="text-xs">{document.name}</strong><p className="text-[10px] text-gray-500 mt-1">{document.notes || '-'}</p></div>
                        <span className={`rounded-full px-2 py-1 text-[9px] font-semibold shrink-0 ${statusClass[document.status]}`}>{statusLabel[document.status]}</span>
                      </div>
                    ))}
                  </div>
                  {item.overallStatus === 'pending-review' && !allVerified && (
                    <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-800">Approval diblokir sampai semua dokumen berstatus Verified. Ini mencegah approval onboarding yang masih memiliki dokumen rejected/pending.</div>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>

      {filteredChecklists.length === 0 && <div className="bg-white border rounded-xl p-10 text-center text-sm text-gray-500">Tidak ada onboarding yang cocok dengan filter.</div>}
    </div>
  );
}
