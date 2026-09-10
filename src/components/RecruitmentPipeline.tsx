import { useState } from 'react';

interface RecruitmentPipelineProps {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

interface Applicant {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  division: string;
  appliedDate: string;
  stage: 'applied' | 'screening' | 'interview' | 'test' | 'offered' | 'hired' | 'rejected';
  notes: string;
  rating: number;
}

export default function RecruitmentPipeline({ onBack, darkMode, setDarkMode }: RecruitmentPipelineProps) {
  const [applicants, setApplicants] = useState<Applicant[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '081234567890',
      position: 'Security Guard',
      division: 'Security',
      appliedDate: '2026-01-05',
      stage: 'interview',
      notes: 'Berpengalaman 3 tahun, memiliki sertifikat Gada Pratama',
      rating: 4,
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@email.com',
      phone: '082345678901',
      position: 'Cleaning Service',
      division: 'Cleaning Service',
      appliedDate: '2026-01-07',
      stage: 'screening',
      notes: 'Fresh graduate, motivasi tinggi',
      rating: 3,
    },
    {
      id: '3',
      name: 'Ahmad Wijaya',
      email: 'ahmad.w@email.com',
      phone: '083456789012',
      position: 'Customer Service',
      division: 'Customer Service',
      appliedDate: '2026-01-08',
      stage: 'test',
      notes: 'Lulus screening, sedang menjalani tes psikologi',
      rating: 5,
    },
    {
      id: '4',
      name: 'Siti Nurhaliza',
      email: 'siti.n@email.com',
      phone: '084567890123',
      position: 'Admin Staff',
      division: 'Administration',
      appliedDate: '2026-01-03',
      stage: 'hired',
      notes: 'Diterima, mulai bekerja 15 Januari 2026',
      rating: 5,
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [filterStage, setFilterStage] = useState<string>('all');
  const [filterDivision, setFilterDivision] = useState<string>('all');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    division: '',
    notes: '',
  });

  const stages = [
    { id: 'applied', label: 'Applied', color: 'bg-gray-500' },
    { id: 'screening', label: 'Screening', color: 'bg-blue-500' },
    { id: 'interview', label: 'Interview', color: 'bg-yellow-500' },
    { id: 'test', label: 'Test', color: 'bg-orange-500' },
    { id: 'offered', label: 'Offered', color: 'bg-purple-500' },
    { id: 'hired', label: 'Hired', color: 'bg-green-500' },
    { id: 'rejected', label: 'Rejected', color: 'bg-red-500' },
  ];

  const divisions = Array.from(new Set(applicants.map(a => a.division)));

  const handleSubmit = () => {
    const newApplicant: Applicant = {
      id: Date.now().toString(),
      ...formData,
      appliedDate: new Date().toISOString().split('T')[0],
      stage: 'applied',
      rating: 0,
    };
    setApplicants([newApplicant, ...applicants]);
    setShowForm(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      position: '',
      division: '',
      notes: '',
    });
  };

  const updateStage = (id: string, stage: Applicant['stage']) => {
    setApplicants(applicants.map(app =>
      app.id === id ? { ...app, stage } : app
    ));
  };

  const updateRating = (id: string, rating: number) => {
    setApplicants(applicants.map(app =>
      app.id === id ? { ...app, rating } : app
    ));
  };

  const filteredApplicants = applicants.filter(app => {
    const matchStage = filterStage === 'all' || app.stage === filterStage;
    const matchDivision = filterDivision === 'all' || app.division === filterDivision;
    return matchStage && matchDivision;
  });

  const getStageBadge = (stage: string) => {
    const stageInfo = stages.find(s => s.id === stage);
    return stageInfo ? `${stageInfo.color} text-white` : 'bg-gray-100 text-gray-800';
  };

  const renderStars = (rating: number, applicantId: string) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => updateRating(applicantId, star)}
            className={`text-xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-500`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  const appliedCount = applicants.filter(a => a.stage === 'applied').length;
  const interviewCount = applicants.filter(a => a.stage === 'interview').length;
  const hiredCount = applicants.filter(a => a.stage === 'hired').length;
  const totalApplicants = applicants.length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0A2540] to-[#1E3A5F] flex items-center justify-center">
            <span className="text-white text-xs font-bold">PA</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">Recruitment Pipeline</h1>
            <p className="text-sm text-gray-600">PT Perdana Adi Yuda - Applicant Tracking System</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Total Applicants</div>
          <div className="text-3xl font-bold text-blue-600">{totalApplicants}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">New Applications</div>
          <div className="text-3xl font-bold text-gray-600">{appliedCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">In Interview</div>
          <div className="text-3xl font-bold text-yellow-600">{interviewCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Hired</div>
          <div className="text-3xl font-bold text-green-600">{hiredCount}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Filter by Stage</label>
            <select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Stages</option>
              {stages.map(stage => (
                <option key={stage.id} value={stage.id}>{stage.label}</option>
              ))}
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
          <div className="flex items-end">
            <button
              onClick={() => setShowForm(!showForm)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              {showForm ? 'Cancel' : '+ Add Applicant'}
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Add New Applicant</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Applicant name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="08xxxxxxxxxx"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Position Applied *</label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Security Guard"
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
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Additional notes about the applicant..."
              />
            </div>
          </div>
          <div className="mt-4 flex gap-4">
            <button
              onClick={handleSubmit}
              disabled={!formData.name || !formData.email || !formData.phone || !formData.position || !formData.division}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
            >
              Add Applicant
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

      {/* Pipeline Board */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Applicants</h2>
        <div className="space-y-4">
          {filteredApplicants.map(applicant => (
            <div key={applicant.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold">{applicant.name}</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStageBadge(applicant.stage)}`}>
                      {stages.find(s => s.id === applicant.stage)?.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    {applicant.position} • {applicant.division}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    {applicant.email} • {applicant.phone}
                  </p>
                  <p className="text-sm text-gray-600">
                    Applied: {applicant.appliedDate}
                  </p>
                  {applicant.notes && (
                    <p className="text-sm text-gray-700 mt-2 italic">"{applicant.notes}"</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600 mb-1">Rating</div>
                  {renderStars(applicant.rating, applicant.id)}
                </div>
              </div>

              <div className="mt-3 flex gap-2 flex-wrap">
                {applicant.stage !== 'hired' && applicant.stage !== 'rejected' && (
                  <>
                    {applicant.stage === 'applied' && (
                      <button
                        onClick={() => updateStage(applicant.id, 'screening')}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Move to Screening
                      </button>
                    )}
                    {applicant.stage === 'screening' && (
                      <button
                        onClick={() => updateStage(applicant.id, 'interview')}
                        className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                      >
                        Schedule Interview
                      </button>
                    )}
                    {applicant.stage === 'interview' && (
                      <button
                        onClick={() => updateStage(applicant.id, 'test')}
                        className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700"
                      >
                        Move to Test
                      </button>
                    )}
                    {applicant.stage === 'test' && (
                      <button
                        onClick={() => updateStage(applicant.id, 'offered')}
                        className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                      >
                        Make Offer
                      </button>
                    )}
                    {applicant.stage === 'offered' && (
                      <button
                        onClick={() => updateStage(applicant.id, 'hired')}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                      >
                        Mark as Hired
                      </button>
                    )}
                    <button
                      onClick={() => updateStage(applicant.id, 'rejected')}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredApplicants.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No applicants found
          </div>
        )}
      </div>
    </div>
  );
}
