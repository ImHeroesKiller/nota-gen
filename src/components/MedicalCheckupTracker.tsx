import { useState } from 'react';

interface Employee {
  id: string;
  name: string;
  employeeId: string;
  position: string;
  department: string;
  lastMCU: string;
  nextMCU: string;
  mcuStatus: 'valid' | 'expired' | 'upcoming';
  k3Certification: string;
  k3Expiry: string;
  k3Status: 'valid' | 'expired' | 'upcoming';
  workPermit: string;
  workPermitExpiry: string;
  workPermitStatus: 'valid' | 'expired' | 'upcoming';
  notes: string;
}

export default function MedicalCheckupTracker() {
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: '1',
      name: 'Ahmad Fauzi',
      employeeId: 'EMP001',
      position: 'Heavy Equipment Operator',
      department: 'Operations',
      lastMCU: '2025-06-15',
      nextMCU: '2026-06-15',
      mcuStatus: 'valid',
      k3Certification: 'K3 Operator Alat Berat',
      k3Expiry: '2027-03-20',
      k3Status: 'valid',
      workPermit: 'SIO Operator',
      workPermitExpiry: '2026-12-31',
      workPermitStatus: 'valid',
      notes: 'Fit for duty',
    },
    {
      id: '2',
      name: 'Budi Santoso',
      employeeId: 'EMP002',
      position: 'Dump Truck Driver',
      department: 'Operations',
      lastMCU: '2025-01-10',
      nextMCU: '2026-01-10',
      mcuStatus: 'upcoming',
      k3Certification: 'K3 Driver',
      k3Expiry: '2026-08-15',
      k3Status: 'valid',
      workPermit: 'SIM B2 Umum',
      workPermitExpiry: '2026-05-20',
      workPermitStatus: 'upcoming',
      notes: 'MCU scheduled for January',
    },
    {
      id: '3',
      name: 'Cahyo Widodo',
      employeeId: 'EMP003',
      position: 'Excavator Operator',
      department: 'Operations',
      lastMCU: '2024-08-20',
      nextMCU: '2025-08-20',
      mcuStatus: 'expired',
      k3Certification: 'K3 Operator Excavator',
      k3Expiry: '2025-11-10',
      k3Status: 'expired',
      workPermit: 'SIO Operator',
      workPermitExpiry: '2025-12-31',
      workPermitStatus: 'expired',
      notes: 'URGENT: All certifications expired',
    },
  ]);

  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredEmployees = filterStatus === 'all'
    ? employees
    : employees.filter(emp => 
        emp.mcuStatus === filterStatus || 
        emp.k3Status === filterStatus || 
        emp.workPermitStatus === filterStatus
      );

  const getStatusBadge = (status: string) => {
    const styles = {
      valid: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      upcoming: 'bg-yellow-100 text-yellow-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const validCount = employees.filter(e => e.mcuStatus === 'valid' && e.k3Status === 'valid' && e.workPermitStatus === 'valid').length;
  const expiredCount = employees.filter(e => e.mcuStatus === 'expired' || e.k3Status === 'expired' || e.workPermitStatus === 'expired').length;
  const upcomingCount = employees.filter(e => e.mcuStatus === 'upcoming' || e.k3Status === 'upcoming' || e.workPermitStatus === 'upcoming').length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0A2540] to-[#1E3A5F] flex items-center justify-center">
          <span className="text-white text-xs font-bold">PA</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold">Medical Checkup Tracker</h1>
          <p className="text-sm text-gray-600">PT Perdana Adi Yuda - Pemantauan MCU, Sertifikasi K3, dan Izin Kelaikan Kerja</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Valid Certifications</div>
          <div className="text-3xl font-bold text-green-600">{validCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Upcoming Renewal</div>
          <div className="text-3xl font-bold text-yellow-600">{upcomingCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Expired Certifications</div>
          <div className="text-3xl font-bold text-red-600">{expiredCount}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
        <div className="flex gap-3">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg font-semibold ${
              filterStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterStatus('valid')}
            className={`px-4 py-2 rounded-lg font-semibold ${
              filterStatus === 'valid' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Valid
          </button>
          <button
            onClick={() => setFilterStatus('upcoming')}
            className={`px-4 py-2 rounded-lg font-semibold ${
              filterStatus === 'upcoming' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilterStatus('expired')}
            className={`px-4 py-2 rounded-lg font-semibold ${
              filterStatus === 'expired' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Expired
          </button>
        </div>
      </div>

      {/* Employee Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">MCU</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">K3 Cert</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Work Permit</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEmployees.map(emp => {
                const hasExpired = emp.mcuStatus === 'expired' || emp.k3Status === 'expired' || emp.workPermitStatus === 'expired';
                const hasUpcoming = emp.mcuStatus === 'upcoming' || emp.k3Status === 'upcoming' || emp.workPermitStatus === 'upcoming';
                
                return (
                  <tr key={emp.id} className={`hover:bg-gray-50 ${hasExpired ? 'bg-red-50' : hasUpcoming ? 'bg-yellow-50' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{emp.name}</div>
                      <div className="text-xs text-gray-500">{emp.employeeId}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{emp.position}</div>
                      <div className="text-xs text-gray-500">{emp.department}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-gray-900">Next: {emp.nextMCU}</div>
                      <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold rounded-full ${getStatusBadge(emp.mcuStatus)}`}>
                        {emp.mcuStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-gray-900">{emp.k3Certification}</div>
                      <div className="text-xs text-gray-500">Exp: {emp.k3Expiry}</div>
                      <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold rounded-full ${getStatusBadge(emp.k3Status)}`}>
                        {emp.k3Status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-gray-900">{emp.workPermit}</div>
                      <div className="text-xs text-gray-500">Exp: {emp.workPermitExpiry}</div>
                      <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold rounded-full ${getStatusBadge(emp.workPermitStatus)}`}>
                        {emp.workPermitStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {hasExpired ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          ⚠️ Expired
                        </span>
                      ) : hasUpcoming ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          ⏰ Upcoming
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          ✓ Valid
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alert for Expired */}
      {expiredCount > 0 && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-sm font-semibold text-red-900 mb-2">⚠️ Peringatan: Sertifikasi Kadaluarsa</div>
          <p className="text-xs text-red-800">
            Terdapat {expiredCount} karyawan dengan sertifikasi yang sudah kadaluarsa. Segera lakukan perpanjangan untuk memastikan kepatuhan terhadap regulasi K3.
          </p>
        </div>
      )}
    </div>
  );
}
