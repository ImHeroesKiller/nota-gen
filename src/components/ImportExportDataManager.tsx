import { useState } from 'react';

interface ImportExportRecord {
  id: string;
  type: 'import' | 'export';
  fileName: string;
  format: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  records: number;
  createdBy: string;
  createdAt: string;
  completedAt?: string;
}

export default function ImportExportDataManager() {
  const [records, setRecords] = useState<ImportExportRecord[]>([
    {
      id: '1',
      type: 'export',
      fileName: 'shipments_jan2026.csv',
      format: 'CSV',
      status: 'completed',
      records: 1250,
      createdBy: 'John Doe',
      createdAt: '2026-01-05 10:30',
      completedAt: '2026-01-05 10:32',
    },
    {
      id: '2',
      type: 'import',
      fileName: 'clients_update.xlsx',
      format: 'Excel',
      status: 'completed',
      records: 85,
      createdBy: 'Jane Smith',
      createdAt: '2026-01-06 14:15',
      completedAt: '2026-01-06 14:16',
    },
    {
      id: '3',
      type: 'export',
      fileName: 'invoices_2026.pdf',
      format: 'PDF',
      status: 'processing',
      records: 450,
      createdBy: 'Bob Johnson',
      createdAt: '2026-01-07 09:00',
    },
  ]);

  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredRecords = records.filter(record => {
    const matchesType = filterType === 'all' || record.type === filterType;
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
    return matchesType && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'import' ? 'bg-purple-100 text-purple-800' : 'bg-indigo-100 text-indigo-800';
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Import/Export Data Manager</h1>
        <p className="text-gray-600">Manage data import and export operations</p>
      </div>

      <div className="mb-6 flex gap-4">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">All Types</option>
          <option value="import">Import</option>
          <option value="export">Export</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">File Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Format</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Records</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created By</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed At</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRecords.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(record.type)}`}>
                    {record.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {record.fileName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.format}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(record.status)}`}>
                    {record.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.records.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.createdBy}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.createdAt}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.completedAt || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
