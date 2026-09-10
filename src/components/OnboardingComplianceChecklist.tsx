import { useState } from 'react';

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
  completionPercentage: number;
}

interface OnboardingComplianceChecklistProps {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

export default function OnboardingComplianceChecklist({ onBack, darkMode, setDarkMode }: OnboardingComplianceChecklistProps) {
  const [checklists] = useState<OnboardingChecklist[]>([
    {
      id: '1',
      employeeName: 'Ahmad Fauzi',
      employeeId: 'EMP001',
      division: 'Security',
      client: 'PT ABC Manufacturing',
      startDate: '2026-01-15',
      documents: [
        { name: 'Kontrak Kerja', status: 'verified', notes: 'Signed on 2026-01-10' },
        { name: 'KTP', status: 'verified', notes: 'Verified' },
        { name: 'NPWP', status: 'verified', notes: 'Verified' },
        { name: 'Sertifikat Gada Pratama', status: 'verified', notes: 'Valid until 2028' },
        { name: 'MCU (Medical Check-up)', status: 'verified', notes: 'Fit for duty' },
        { name: 'SKCK', status: 'verified', notes: 'Clean record' },
        { name: 'Background Check', status: 'verified', notes: 'Passed' },
      ],
      overallStatus: 'completed',
      completionPercentage: 100,
    },
    {
      id: '2',
      employeeName: 'Budi Santoso',
      employeeId: 'EMP002',
      division: 'Cleaning Service',
      client: 'PT XYZ Tower',
      startDate: '2026-01-20',
      documents: [
        { name: 'Kontrak Kerja', status: 'submitted', notes: 'Awaiting signature' },
        { name: 'KTP', status: 'verified', notes: 'Verified' },
        { name: 'NPWP', status: 'pending', notes: 'Not submitted yet' },
        { name: 'Sertifikat Kompetensi', status: 'pending', notes: 'Not submitted yet' },
        { name: 'MCU (Medical Check-up)', status: 'submitted', notes: 'In progress' },
        { name: 'SKCK', status: 'pending', notes: 'Not submitted yet' },
        { name: 'Background Check', status: 'pending', notes: 'Not started' },
      ],
      overallStatus: 'in-progress',
      completionPercentage: 43,
    },
    {
      id: '3',
      employeeName: 'Cahyo Widodo',
      employeeId: 'EMP003',
      division: 'Customer Service',
      client: 'PT DEF Telecom',
      startDate: '2026-01-25',
      documents: [
        { name: 'Kontrak Kerja', status: 'verified', notes: 'Signed' },
        { name: 'KTP', status: 'verified', notes: 'Verified' },
        { name: 'NPWP', status: 'verified', notes: 'Verified' },
        { name: 'Sertifikat Service Excellence', status: 'verified', notes: 'Valid' },
        { name: 'MCU (Medical Check-up)', status: 'verified', notes: 'Fit' },
        { name: 'SKCK', status: 'rejected', notes: 'Expired, need renewal' },
        { name: 'Background Check', status: 'submitted', notes: 'In review' },
      ],
      overallStatus: 'pending-review',
      completionPercentage: 86,
    },
  ]);

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDivision, setFilterDivision] = useState<string>('all');

  const divisions = Array.from(new Set(checklists.map(c => c.division)));

  const filteredChecklists = checklists.filter(c => {
    const matchStatus = filterStatus === 'all' || c.overallStatus === filterStatus;
    const matchDivision = filterDivision === 'all' || c.division === filterDivision;
    return matchStatus && matchDivision;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-gray-100 text-gray-800',
      submitted: 'bg-blue-100 text-blue-800',
      verified: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const getOverallStatusBadge = (status: string) => {
    const styles = {
      'in-progress': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'pending-review': 'bg-blue-100 text-blue-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const completedCount = checklists.filter(c => c.overallStatus === 'completed').length;
  const inProgressCount = checklists.filter(c => c.overallStatus === 'in-progress').length;
  const pendingReviewCount = checklists.filter(c => c.overallStatus === 'pending-review').length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0A2540] to-[#1E3A5F] flex items-center justify-center">
            <span className="text-white text-xs font-bold">PA</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">Onboarding & Compliance Checklist</h1>
            <p className="text-sm text-gray-600">PT Perdana Adi Yuda - Manajemen Kepatuhan Berkas Tenaga Kerja</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Total Onboarding</div>
          <div className="text-3xl font-bold text-blue-600">{checklists.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Completed</div>
          <div className="text-3xl font-bold text-green-600">{completedCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">In Progress</div>
          <div className="text-3xl font-bold text-yellow-600">{inProgressCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Pending Review</div>
          <div className="text-3xl font-bold text-blue-600">{pendingReviewCount}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="pending-review">Pending Review</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Filter by Division</label>
            <select
              value={filterDivision}
              onChange={(e) => setFilterDivision(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Divisions</option>
              {divisions.map(div => (
                <option key={div} value={div}>{div}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Checklists */}
      <div className="space-y-6">
        {filteredChecklists.map((checklist) => (
          <div key={checklist.id} className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold">{checklist.employeeName}</h3>
                <p className="text-sm text-gray-600">
                  {checklist.employeeId} • {checklist.division} • {checklist.client}
                </p>
                <p className="text-sm text-gray-600">Start Date: {checklist.startDate}</p>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getOverallStatusBadge(checklist.overallStatus)}`}>
                  {checklist.overallStatus === 'in-progress' ? 'In Progress' : checklist.overallStatus === 'completed' ? 'Completed' : 'Pending Review'}
                </span>
                <div className="mt-2">
                  <div className="text-sm text-gray-600 mb-1">Completion</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 w-32">
                      <div
                        className={`h-2 rounded-full ${
                          checklist.completionPercentage === 100 ? 'bg-green-500' :
                          checklist.completionPercentage >= 70 ? 'bg-blue-500' : 'bg-yellow-500'
                        }`}
                        style={{ width: `${checklist.completionPercentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold">{checklist.completionPercentage}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Checklist */}
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Required Documents</h4>
              <div className="space-y-2">
                {checklist.documents.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        doc.status === 'verified' ? 'bg-green-500' :
                        doc.status === 'submitted' ? 'bg-blue-500' :
                        doc.status === 'rejected' ? 'bg-red-500' : 'bg-gray-400'
                      }`}></div>
                      <div>
                        <div className="font-medium">{doc.name}</div>
                        {doc.notes && <div className="text-xs text-gray-600">{doc.notes}</div>}
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(doc.status)}`}>
                      {doc.status === 'pending' ? 'Pending' : doc.status === 'submitted' ? 'Submitted' : doc.status === 'verified' ? 'Verified' : 'Rejected'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex gap-2">
              {checklist.overallStatus === 'pending-review' && (
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                  Approve
                </button>
              )}
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                View Details
              </button>
              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm">
                Send Reminder
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredChecklists.length === 0 && (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <p className="text-gray-500">Tidak ada data onboarding untuk filter yang dipilih</p>
        </div>
      )}
    </div>
  );
}
