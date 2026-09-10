import { useState } from 'react';

interface PerformanceAppraisalProps {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

interface Employee {
  id: string;
  name: string;
  position: string;
  client: string;
  division: string;
  joinDate: string;
}

interface AppraisalCriteria {
  id: string;
  name: string;
  weight: number;
  score: number;
  comment: string;
}

export default function PerformanceAppraisal({ onBack, darkMode, setDarkMode }: PerformanceAppraisalProps) {
  const [employees] = useState<Employee[]>([
    { id: '1', name: 'Ahmad Fauzi', position: 'Security Guard', client: 'PT ABC Manufacturing', division: 'Security', joinDate: '2024-01-15' },
    { id: '2', name: 'Siti Rahayu', position: 'Cleaning Service', client: 'PT XYZ Tower', division: 'Cleaning Service', joinDate: '2024-03-20' },
    { id: '3', name: 'Budi Santoso', position: 'Customer Service', client: 'PT DEF Telecom', division: 'Customer Service', joinDate: '2024-02-10' },
  ]);

  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [appraisalPeriod, setAppraisalPeriod] = useState<string>('2026-Q1');
  const [criteria, setCriteria] = useState<AppraisalCriteria[]>([
    { id: '1', name: 'Kualitas Kerja', weight: 25, score: 0, comment: '' },
    { id: '2', name: 'Kehadiran & Kedisiplinan', weight: 20, score: 0, comment: '' },
    { id: '3', name: 'Kerjasama Tim', weight: 15, score: 0, comment: '' },
    { id: '4', name: 'Inisiatif & Kreativitas', weight: 15, score: 0, comment: '' },
    { id: '5', name: 'Komunikasi', weight: 10, score: 0, comment: '' },
    { id: '6', name: 'Kepatuhan SOP', weight: 15, score: 0, comment: '' },
  ]);

  const [overallComment, setOverallComment] = useState<string>('');

  const handleScoreChange = (id: string, score: number) => {
    setCriteria(criteria.map(c => c.id === id ? { ...c, score } : c));
  };

  const handleCommentChange = (id: string, comment: string) => {
    setCriteria(criteria.map(c => c.id === id ? { ...c, comment } : c));
  };

  const calculateWeightedScore = () => {
    const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
    const weightedSum = criteria.reduce((sum, c) => sum + (c.score * c.weight / 100), 0);
    return (weightedSum / (totalWeight / 100)).toFixed(2);
  };

  const getGrade = (score: number) => {
    if (score >= 90) return { grade: 'A', color: 'text-green-600', label: 'Excellent' };
    if (score >= 80) return { grade: 'B', color: 'text-blue-600', label: 'Very Good' };
    if (score >= 70) return { grade: 'C', color: 'text-yellow-600', label: 'Good' };
    if (score >= 60) return { grade: 'D', color: 'text-orange-600', label: 'Fair' };
    return { grade: 'E', color: 'text-red-600', label: 'Poor' };
  };

  const finalScore = parseFloat(calculateWeightedScore());
  const gradeInfo = getGrade(finalScore);

  const handleSubmit = () => {
    alert('Performance appraisal submitted successfully!');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0A2540] to-[#1E3A5F] flex items-center justify-center">
            <span className="text-white text-xs font-bold">PA</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">Performance Appraisal</h1>
            <p className="text-sm text-gray-600">PT Perdana Adi Yuda - Form Penilaian Kinerja Karyawan</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Employee Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select Employee *</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select Employee --</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name} - {emp.position}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Appraisal Period *</label>
            <select
              value={appraisalPeriod}
              onChange={(e) => setAppraisalPeriod(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="2026-Q1">2026 - Q1 (Jan-Mar)</option>
              <option value="2026-Q2">2026 - Q2 (Apr-Jun)</option>
              <option value="2026-Q3">2026 - Q3 (Jul-Sep)</option>
              <option value="2026-Q4">2026 - Q4 (Oct-Dec)</option>
            </select>
          </div>
        </div>

        {selectedEmployee && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            {(() => {
              const emp = employees.find(e => e.id === selectedEmployee);
              return emp ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div><span className="font-semibold">Name:</span> {emp.name}</div>
                  <div><span className="font-semibold">Position:</span> {emp.position}</div>
                  <div><span className="font-semibold">Client:</span> {emp.client}</div>
                  <div><span className="font-semibold">Division:</span> {emp.division}</div>
                </div>
              ) : null;
            })()}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Performance Criteria</h2>
        <div className="space-y-4">
          {criteria.map(criterion => (
            <div key={criterion.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h3 className="font-semibold">{criterion.name}</h3>
                  <p className="text-sm text-gray-600">Weight: {criterion.weight}%</p>
                </div>
                <div className="text-right">
                  <label className="block text-sm font-medium mb-1">Score (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={criterion.score}
                    onChange={(e) => handleScoreChange(criterion.id, parseInt(e.target.value) || 0)}
                    className="w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Comments</label>
                <textarea
                  value={criterion.comment}
                  onChange={(e) => handleCommentChange(criterion.id, e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Enter comments for this criterion..."
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Final Assessment</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-sm text-gray-600 mb-1">Weighted Score</div>
            <div className="text-3xl font-bold text-blue-600">{calculateWeightedScore()}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-sm text-gray-600 mb-1">Grade</div>
            <div className={`text-3xl font-bold ${gradeInfo.color}`}>{gradeInfo.grade}</div>
            <div className="text-sm text-gray-600">{gradeInfo.label}</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-sm text-gray-600 mb-1">Period</div>
            <div className="text-xl font-bold text-purple-600">{appraisalPeriod}</div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Overall Comments & Recommendations</label>
          <textarea
            value={overallComment}
            onChange={(e) => setOverallComment(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="Enter overall comments, strengths, areas for improvement, and recommendations..."
          />
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleSubmit}
          disabled={!selectedEmployee || finalScore === 0}
          className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
        >
          Submit Appraisal
        </button>
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
