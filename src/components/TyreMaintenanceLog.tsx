import { useState } from 'react';

interface MaintenanceRecord {
  id: string;
  vehicleNumber: string;
  vehicleType: string;
  date: string;
  type: 'tyre-change' | 'sparepart' | 'routine';
  description: string;
  mileage: number;
  cost: number;
  performedBy: string;
  nextService: string;
  notes: string;
}

export default function TyreMaintenanceLog() {
  const [records, setRecords] = useState<MaintenanceRecord[]>([
    {
      id: '1',
      vehicleNumber: 'DT-001',
      vehicleType: 'Dump Truck',
      date: '2026-01-10',
      type: 'tyre-change',
      description: 'Pergantian 4 ban depan',
      mileage: 45000,
      cost: 8000000,
      performedBy: 'Budi Santoso',
      nextService: '2026-07-10',
      notes: 'Ban merk Bridgestone',
    },
    {
      id: '2',
      vehicleNumber: 'EX-001',
      vehicleType: 'Excavator',
      date: '2026-01-08',
      type: 'routine',
      description: 'Service berkala 500 jam',
      mileage: 12500,
      cost: 3500000,
      performedBy: 'Ahmad Fauzi',
      nextService: '2026-04-08',
      notes: 'Ganti oli dan filter',
    },
    {
      id: '3',
      vehicleNumber: 'DT-002',
      vehicleType: 'Dump Truck',
      date: '2026-01-05',
      type: 'sparepart',
      description: 'Penggantian brake pad',
      mileage: 38000,
      cost: 1500000,
      performedBy: 'Cahyo Widodo',
      nextService: '2026-04-05',
      notes: 'Brake pad depan dan belakang',
    },
  ]);

  const [filterType, setFilterType] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [newRecord, setNewRecord] = useState<Omit<MaintenanceRecord, 'id'>>({
    vehicleNumber: '',
    vehicleType: '',
    date: new Date().toISOString().split('T')[0],
    type: 'routine',
    description: '',
    mileage: 0,
    cost: 0,
    performedBy: '',
    nextService: '',
    notes: '',
  });

  const addRecord = () => {
    if (!newRecord.vehicleNumber || !newRecord.description) return;
    const record: MaintenanceRecord = {
      id: Date.now().toString(),
      ...newRecord,
    };
    setRecords([record, ...records]);
    setShowForm(false);
    setNewRecord({
      vehicleNumber: '',
      vehicleType: '',
      date: new Date().toISOString().split('T')[0],
      type: 'routine',
      description: '',
      mileage: 0,
      cost: 0,
      performedBy: '',
      nextService: '',
      notes: '',
    });
  };

  const filteredRecords = filterType === 'all'
    ? records
    : records.filter(r => r.type === filterType);

  const getTypeBadge = (type: string) => {
    const styles = {
      'tyre-change': 'bg-blue-100 text-blue-800',
      'sparepart': 'bg-orange-100 text-orange-800',
      'routine': 'bg-green-100 text-green-800',
    };
    return styles[type as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalCost = records.reduce((sum, r) => sum + r.cost, 0);
  const tyreChangeCount = records.filter(r => r.type === 'tyre-change').length;
  const sparepartCount = records.filter(r => r.type === 'sparepart').length;
  const routineCount = records.filter(r => r.type === 'routine').length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0A2540] to-[#1E3A5F] flex items-center justify-center">
            <span className="text-white text-xs font-bold">PA</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">Tyre & Maintenance Log</h1>
            <p className="text-sm text-gray-600">PT Perdana Adi Yuda - Log Pergantian Ban, Sparepart, dan Perawatan Berkala</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
        >
          + Add Record
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Total Records</div>
          <div className="text-3xl font-bold text-blue-600">{records.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Tyre Changes</div>
          <div className="text-3xl font-bold text-blue-600">{tyreChangeCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Sparepart Replacement</div>
          <div className="text-3xl font-bold text-orange-600">{sparepartCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Total Cost</div>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(totalCost)}</div>
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Add Maintenance Record</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Vehicle Number</label>
              <input
                type="text"
                value={newRecord.vehicleNumber}
                onChange={(e) => setNewRecord({ ...newRecord, vehicleNumber: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="DT-001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Vehicle Type</label>
              <input
                type="text"
                value={newRecord.vehicleType}
                onChange={(e) => setNewRecord({ ...newRecord, vehicleType: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Dump Truck"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <input
                type="date"
                value={newRecord.date}
                onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <select
                value={newRecord.type}
                onChange={(e) => setNewRecord({ ...newRecord, type: e.target.value as any })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="routine">Routine Maintenance</option>
                <option value="tyre-change">Tyre Change</option>
                <option value="sparepart">Sparepart Replacement</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={newRecord.description}
                onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Description of maintenance work"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Mileage (km)</label>
              <input
                type="number"
                value={newRecord.mileage}
                onChange={(e) => setNewRecord({ ...newRecord, mileage: Number(e.target.value) })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Cost (IDR)</label>
              <input
                type="number"
                value={newRecord.cost}
                onChange={(e) => setNewRecord({ ...newRecord, cost: Number(e.target.value) })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Performed By</label>
              <input
                type="text"
                value={newRecord.performedBy}
                onChange={(e) => setNewRecord({ ...newRecord, performedBy: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Next Service Date</label>
              <input
                type="date"
                value={newRecord.nextService}
                onChange={(e) => setNewRecord({ ...newRecord, nextService: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Notes</label>
              <textarea
                value={newRecord.notes}
                onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button
              onClick={addRecord}
              disabled={!newRecord.vehicleNumber || !newRecord.description}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Save Record
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
        <div className="flex gap-3">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-lg font-semibold ${
              filterType === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('routine')}
            className={`px-4 py-2 rounded-lg font-semibold ${
              filterType === 'routine' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Routine
          </button>
          <button
            onClick={() => setFilterType('tyre-change')}
            className={`px-4 py-2 rounded-lg font-semibold ${
              filterType === 'tyre-change' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Tyre Change
          </button>
          <button
            onClick={() => setFilterType('sparepart')}
            className={`px-4 py-2 rounded-lg font-semibold ${
              filterType === 'sparepart' ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Sparepart
          </button>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mileage</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performed By</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Service</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRecords.map(record => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{record.date}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">{record.vehicleNumber}</div>
                    <div className="text-xs text-gray-500">{record.vehicleType}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(record.type)}`}>
                      {record.type === 'tyre-change' ? 'Tyre Change' : record.type === 'sparepart' ? 'Sparepart' : 'Routine'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{record.description}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{record.mileage.toLocaleString()} km</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatCurrency(record.cost)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{record.performedBy}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{record.nextService}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
