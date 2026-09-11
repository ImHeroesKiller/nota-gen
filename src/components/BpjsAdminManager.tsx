import { useMemo, useState } from 'react';

interface Employee {
  id: string;
  name: string;
  employeeId: string;
  clientName: string;
  bpjsNumber: string;
  status: 'active' | 'inactive';
  joinDate: string;
  resignDate: string;
  bpjsHealth: number;
  bpjsEmployment: number;
}

const seedEmployees: Employee[] = [
  { id: '1', name: 'Ahmad Fauzi', employeeId: 'EMP001', clientName: 'PT ABC Manufacturing', bpjsNumber: '0001234567890', status: 'active', joinDate: '2025-01-15', resignDate: '', bpjsHealth: 150000, bpjsEmployment: 200000 },
  { id: '2', name: 'Budi Santoso', employeeId: 'EMP002', clientName: 'PT ABC Manufacturing', bpjsNumber: '0001234567891', status: 'active', joinDate: '2025-02-01', resignDate: '', bpjsHealth: 150000, bpjsEmployment: 200000 },
  { id: '3', name: 'Cahyo Widodo', employeeId: 'EMP003', clientName: 'PT XYZ Logistics', bpjsNumber: '0001234567892', status: 'inactive', joinDate: '2024-06-01', resignDate: '2025-12-31', bpjsHealth: 150000, bpjsEmployment: 200000 },
];

interface BpjsAdminManagerProps {
  onBack?: () => void;
  darkMode?: boolean;
  setDarkMode?: (value: boolean) => void;
}

export default function BpjsAdminManager(_: BpjsAdminManagerProps) {
  const [filterClient, setFilterClient] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [query, setQuery] = useState('');

  const clients = useMemo(() => Array.from(new Set(seedEmployees.map((employee) => employee.clientName))), []);

  const filteredEmployees = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return seedEmployees.filter((employee) => {
      const matchesClient = filterClient === 'all' || employee.clientName === filterClient;
      const matchesStatus = filterStatus === 'all' || employee.status === filterStatus;
      const matchesQuery = !normalizedQuery || `${employee.name} ${employee.employeeId} ${employee.bpjsNumber} ${employee.clientName}`.toLowerCase().includes(normalizedQuery);
      return matchesClient && matchesStatus && matchesQuery;
    });
  }, [filterClient, filterStatus, query]);

  const activeEmployees = seedEmployees.filter((employee) => employee.status === 'active');
  const inactiveEmployees = seedEmployees.filter((employee) => employee.status === 'inactive');
  const totalContribution = activeEmployees.reduce((sum, employee) => sum + employee.bpjsHealth + employee.bpjsEmployment, 0);

  const byClient = useMemo(() => clients.map((client) => {
    const employees = seedEmployees.filter((employee) => employee.clientName === client && employee.status === 'active');
    return {
      client,
      employees: employees.length,
      contribution: employees.reduce((sum, employee) => sum + employee.bpjsHealth + employee.bpjsEmployment, 0),
    };
  }), [clients]);

  const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', maximumFractionDigits: 0,
  }).format(amount);

  const formatDate = (value: string) => value
    ? new Date(`${value}T00:00:00`).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
    : '-';

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border rounded-xl p-4"><p className="text-[10px] uppercase tracking-wide text-gray-500">Total peserta</p><strong className="block mt-1 text-xl">{seedEmployees.length}</strong></div>
        <div className="bg-white border rounded-xl p-4"><p className="text-[10px] uppercase tracking-wide text-gray-500">Aktif</p><strong className="block mt-1 text-xl text-green-600">{activeEmployees.length}</strong></div>
        <div className="bg-white border rounded-xl p-4"><p className="text-[10px] uppercase tracking-wide text-gray-500">Nonaktif</p><strong className="block mt-1 text-xl text-gray-500">{inactiveEmployees.length}</strong></div>
        <div className="bg-white border rounded-xl p-4"><p className="text-[10px] uppercase tracking-wide text-gray-500">Iuran aktif / bulan</p><strong className="block mt-1 text-lg text-blue-600">{formatCurrency(totalContribution)}</strong></div>
      </section>

      <section className="bg-white border rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr] gap-3">
          <label>Cari peserta
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nama, employee ID, BPJS, atau klien" />
          </label>
          <label>Klien
            <select value={filterClient} onChange={(event) => setFilterClient(event.target.value)}>
              <option value="all">Semua klien</option>
              {clients.map((client) => <option key={client} value={client}>{client}</option>)}
            </select>
          </label>
          <label>Status
            <select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)}>
              <option value="all">Semua status</option><option value="active">Aktif</option><option value="inactive">Nonaktif</option>
            </select>
          </label>
        </div>
      </section>

      <section className="bg-white border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b">
          <div><h2 className="text-sm font-semibold">Kepesertaan BPJS</h2><p className="text-[11px] text-gray-500 mt-0.5">{filteredEmployees.length} data sesuai filter</p></div>
          <span className="text-[10px] text-gray-500">Total iuran dihitung langsung dari BPJS Kesehatan + Ketenagakerjaan</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr><th>Employee</th><th>Client</th><th>BPJS Number</th><th>Status</th><th>Join / Resign</th><th>Kesehatan</th><th>Ketenagakerjaan</th><th>Total</th></tr></thead>
            <tbody>
              {filteredEmployees.map((employee) => {
                const contribution = employee.bpjsHealth + employee.bpjsEmployment;
                const validBpjs = /^\d{11,16}$/.test(employee.bpjsNumber);
                return (
                  <tr key={employee.id}>
                    <td><strong>{employee.name}</strong><div className="text-[10px] text-gray-500 mt-0.5">{employee.employeeId}</div></td>
                    <td>{employee.clientName}</td>
                    <td><span className="font-mono">{employee.bpjsNumber}</span>{!validBpjs && <div className="text-[9px] text-red-600">Format perlu dicek</div>}</td>
                    <td><span className={`rounded-full px-2 py-1 text-[9px] font-semibold ${employee.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{employee.status === 'active' ? 'Aktif' : 'Nonaktif'}</span></td>
                    <td>{formatDate(employee.joinDate)}{employee.resignDate && <div className="text-[10px] text-gray-500">s.d. {formatDate(employee.resignDate)}</div>}</td>
                    <td>{formatCurrency(employee.bpjsHealth)}</td>
                    <td>{formatCurrency(employee.bpjsEmployment)}</td>
                    <td><strong className="text-blue-600">{formatCurrency(contribution)}</strong></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredEmployees.length === 0 && <div className="p-10 text-center text-sm text-gray-500">Tidak ada peserta yang cocok dengan filter.</div>}
      </section>

      <section className="bg-white border rounded-xl p-4">
        <div className="mb-3"><h2 className="text-sm font-semibold">Ringkasan per Klien</h2><p className="text-[11px] text-gray-500">Hanya peserta aktif yang masuk ke proyeksi iuran.</p></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {byClient.map((summary) => (
            <div key={summary.client} className="rounded-lg bg-gray-50 border p-3 flex items-center justify-between gap-4">
              <div><strong className="text-sm">{summary.client}</strong><div className="text-[10px] text-gray-500 mt-1">{summary.employees} peserta aktif</div></div>
              <strong className="text-sm text-blue-600 text-right">{formatCurrency(summary.contribution)}</strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
