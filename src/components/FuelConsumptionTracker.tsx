import { useState } from 'react';

interface FuelConsumptionTrackerProps {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

interface Equipment {
  id: string;
  unitNumber: string;
  type: string;
  brand: string;
  model: string;
  site: string;
  fuelType: 'solar' | 'bensin' | 'heavy-oil';
  tankCapacity: number; // in liters
}

interface FuelRecord {
  id: string;
  equipmentId: string;
  date: string;
  time: string;
  fuelType: string;
  quantity: number; // in liters
  hourMeterStart: number;
  hourMeterEnd: number;
  operatingHours: number;
  consumptionRate: number; // liters per hour
  operator: string;
  notes: string;
  status: 'normal' | 'high' | 'low';
}

interface DailySummary {
  date: string;
  equipmentId: string;
  totalFuel: number;
  totalHours: number;
  averageRate: number;
  status: 'normal' | 'high' | 'low';
}

export default function FuelConsumptionTracker() {
  const [equipment] = useState<Equipment[]>([
    { id: '1', unitNumber: 'DT-001', type: 'Dump Truck', brand: 'Komatsu', model: 'HD785-7', site: 'Site A - Kalimantan', fuelType: 'solar', tankCapacity: 800 },
    { id: '2', unitNumber: 'EX-001', type: 'Excavator', brand: 'CAT', model: '336D', site: 'Site A - Kalimantan', fuelType: 'solar', tankCapacity: 600 },
    { id: '3', unitNumber: 'BD-001', type: 'Bulldozer', brand: 'Komatsu', model: 'D65EX-18', site: 'Site B - Sulawesi', fuelType: 'solar', tankCapacity: 400 },
    { id: '4', unitNumber: 'GS-001', type: 'Genset', brand: 'Cummins', model: '500 KVA', site: 'Site A - Kalimantan', fuelType: 'heavy-oil', tankCapacity: 1000 },
  ]);

  const [fuelRecords, setFuelRecords] = useState<FuelRecord[]>([
    {
      id: '1',
      equipmentId: '1',
      date: '2026-01-15',
      time: '06:00',
      fuelType: 'Solar',
      quantity: 150,
      hourMeterStart: 12450,
      hourMeterEnd: 12462,
      operatingHours: 12,
      consumptionRate: 12.5,
      operator: 'Ahmad Fauzi',
      notes: 'Normal operation',
      status: 'normal',
    },
    {
      id: '2',
      equipmentId: '2',
      date: '2026-01-15',
      time: '06:00',
      fuelType: 'Solar',
      quantity: 180,
      hourMeterStart: 8920,
      hourMeterEnd: 8932,
      operatingHours: 12,
      consumptionRate: 15.0,
      operator: 'Cahyo Widodo',
      notes: 'Heavy digging operation',
      status: 'normal',
    },
    {
      id: '3',
      equipmentId: '4',
      date: '2026-01-15',
      time: '00:00',
      fuelType: 'Heavy Oil',
      quantity: 250,
      hourMeterStart: 5600,
      hourMeterEnd: 5624,
      operatingHours: 24,
      consumptionRate: 10.4,
      operator: 'Maintenance Team',
      notes: '24-hour operation',
      status: 'normal',
    },
    {
      id: '4',
      equipmentId: '1',
      date: '2026-01-14',
      time: '06:00',
      fuelType: 'Solar',
      quantity: 200,
      hourMeterStart: 12438,
      hourMeterEnd: 12450,
      operatingHours: 12,
      consumptionRate: 16.7,
      operator: 'Ahmad Fauzi',
      notes: 'High consumption - check engine',
      status: 'high',
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [filterDate, setFilterDate] = useState<string>('2026-01-15');
  const [filterEquipment, setFilterEquipment] = useState<string>('all');
  const [filterFuelType, setFilterFuelType] = useState<string>('all');

  const [formData, setFormData] = useState({
    equipmentId: '',
    date: '',
    time: '',
    fuelType: '',
    quantity: 0,
    hourMeterStart: 0,
    hourMeterEnd: 0,
    operator: '',
    notes: '',
  });

  const fuelTypes = ['Solar', 'Bensin', 'Heavy Oil'];

  const filteredRecords = fuelRecords.filter(r => {
    const matchDate = r.date === filterDate;
    const matchEquipment = filterEquipment === 'all' || r.equipmentId === filterEquipment;
    const matchFuelType = filterFuelType === 'all' || r.fuelType === filterFuelType;
    return matchDate && matchEquipment && matchFuelType;
  });

  const handleSubmit = () => {
    if (!formData.equipmentId || !formData.date || !formData.time || !formData.quantity) return;

    const eq = equipment.find(e => e.id === formData.equipmentId);
    if (!eq) return;

    const operatingHours = formData.hourMeterEnd - formData.hourMeterStart;
    const consumptionRate = operatingHours > 0 ? formData.quantity / operatingHours : 0;

    // Determine status based on consumption rate
    let status: 'normal' | 'high' | 'low' = 'normal';
    if (eq.type === 'Dump Truck' && consumptionRate > 15) status = 'high';
    else if (eq.type === 'Excavator' && consumptionRate > 18) status = 'high';
    else if (eq.type === 'Bulldozer' && consumptionRate > 20) status = 'high';
    else if (eq.type === 'Genset' && consumptionRate > 12) status = 'high';

    const newRecord: FuelRecord = {
      id: Date.now().toString(),
      equipmentId: formData.equipmentId,
      date: formData.date,
      time: formData.time,
      fuelType: eq.fuelType === 'solar' ? 'Solar' : eq.fuelType === 'bensin' ? 'Bensin' : 'Heavy Oil',
      quantity: formData.quantity,
      hourMeterStart: formData.hourMeterStart,
      hourMeterEnd: formData.hourMeterEnd,
      operatingHours,
      consumptionRate,
      operator: formData.operator,
      notes: formData.notes,
      status,
    };

    setFuelRecords([newRecord, ...fuelRecords]);
    setShowForm(false);
    setFormData({
      equipmentId: '',
      date: '',
      time: '',
      fuelType: '',
      quantity: 0,
      hourMeterStart: 0,
      hourMeterEnd: 0,
      operator: '',
      notes: '',
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      normal: 'bg-green-100 text-green-800',
      high: 'bg-red-100 text-red-800',
      low: 'bg-yellow-100 text-yellow-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const totalFuel = filteredRecords.reduce((sum, r) => sum + r.quantity, 0);
  const totalHours = filteredRecords.reduce((sum, r) => sum + r.operatingHours, 0);
  const avgConsumption = totalHours > 0 ? (totalFuel / totalHours).toFixed(2) : '0';
  const highConsumptionCount = filteredRecords.filter(r => r.status === 'high').length;

  // Calculate daily summaries
  const dailySummaries: DailySummary[] = [];
  const dateEquipmentMap = new Map<string, FuelRecord[]>();
  
  filteredRecords.forEach(record => {
    const key = `${record.date}-${record.equipmentId}`;
    if (!dateEquipmentMap.has(key)) {
      dateEquipmentMap.set(key, []);
    }
    dateEquipmentMap.get(key)!.push(record);
  });

  dateEquipmentMap.forEach((records, key) => {
    const totalFuel = records.reduce((sum, r) => sum + r.quantity, 0);
    const totalHours = records.reduce((sum, r) => sum + r.operatingHours, 0);
    const avgRate = totalHours > 0 ? totalFuel / totalHours : 0;
    
    let status: 'normal' | 'high' | 'low' = 'normal';
    if (avgRate > 15) status = 'high';
    
    dailySummaries.push({
      date: records[0].date,
      equipmentId: records[0].equipmentId,
      totalFuel,
      totalHours,
      averageRate: avgRate,
      status,
    });
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0A2540] to-[#1E3A5F] flex items-center justify-center">
            <span className="text-white text-xs font-bold">PA</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">Fuel & Heavy Oil Consumption Tracker</h1>
            <p className="text-sm text-gray-600">PT Perdana Adi Yuda - Tracking Konsumsi BBM Alat Berat & Genset</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Total Fuel (Liters)</div>
          <div className="text-3xl font-bold text-blue-600">{totalFuel.toFixed(1)}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Total Operating Hours</div>
          <div className="text-3xl font-bold text-green-600">{totalHours}h</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Avg Consumption (L/h)</div>
          <div className="text-3xl font-bold text-purple-600">{avgConsumption}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">High Consumption Alerts</div>
          <div className="text-3xl font-bold text-red-600">{highConsumptionCount}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Date</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Equipment</label>
            <select
              value={filterEquipment}
              onChange={(e) => setFilterEquipment(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Equipment</option>
              {equipment.map(eq => (
                <option key={eq.id} value={eq.id}>{eq.unitNumber} - {eq.type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Fuel Type</label>
            <select
              value={filterFuelType}
              onChange={(e) => setFilterFuelType(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Fuel Types</option>
              {fuelTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setShowForm(!showForm)}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
            >
              {showForm ? 'Cancel' : '+ Record Fuel'}
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Record Fuel Consumption</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Equipment *</label>
              <select
                value={formData.equipmentId}
                onChange={(e) => {
                  const eq = equipment.find(e2 => e2.id === e.target.value);
                  setFormData({ 
                    ...formData, 
                    equipmentId: e.target.value,
                    fuelType: eq ? (eq.fuelType === 'solar' ? 'Solar' : eq.fuelType === 'bensin' ? 'Bensin' : 'Heavy Oil') : ''
                  });
                }}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select Equipment --</option>
                {equipment.map(eq => (
                  <option key={eq.id} value={eq.id}>{eq.unitNumber} - {eq.type} ({eq.brand} {eq.model})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Fuel Type</label>
              <input
                type="text"
                value={formData.fuelType}
                readOnly
                className="w-full px-4 py-2 border rounded-lg bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Time *</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Quantity (Liters) *</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Operator</label>
              <input
                type="text"
                value={formData.operator}
                onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Operator name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Hour Meter Start</label>
              <input
                type="number"
                min="0"
                value={formData.hourMeterStart}
                onChange={(e) => setFormData({ ...formData, hourMeterStart: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Hour Meter End</label>
              <input
                type="number"
                min="0"
                value={formData.hourMeterEnd}
                onChange={(e) => setFormData({ ...formData, hourMeterEnd: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Additional notes..."
              />
            </div>
          </div>
          <div className="mt-4 flex gap-4">
            <button
              onClick={handleSubmit}
              disabled={!formData.equipmentId || !formData.date || !formData.time || !formData.quantity}
              className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
            >
              Save Record
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

      {/* Fuel Records Table */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Fuel Consumption Records - {filterDate}</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipment</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fuel Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity (L)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate (L/h)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Operator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRecords.map(record => {
                const eq = equipment.find(e => e.id === record.equipmentId);
                return (
                  <tr key={record.id} className={`hover:bg-gray-50 ${record.status === 'high' ? 'bg-red-50' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{eq?.unitNumber}</div>
                      <div className="text-xs text-gray-500">{eq?.type}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{record.time}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{record.fuelType}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{record.quantity}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{record.operatingHours}h</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{record.consumptionRate.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(record.status)}`}>
                        {record.status === 'normal' ? 'Normal' : record.status === 'high' ? 'High' : 'Low'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{record.operator}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredRecords.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No fuel records for selected filters
          </div>
        )}
      </div>

      {/* Daily Summary */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Daily Summary by Equipment</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipment</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Fuel (L)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Hours</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Rate (L/h)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {dailySummaries.map((summary, index) => {
                const eq = equipment.find(e => e.id === summary.equipmentId);
                return (
                  <tr key={index} className={`hover:bg-gray-50 ${summary.status === 'high' ? 'bg-red-50' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{eq?.unitNumber}</div>
                      <div className="text-xs text-gray-500">{eq?.type}</div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{summary.totalFuel.toFixed(1)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{summary.totalHours}h</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{summary.averageRate.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(summary.status)}`}>
                        {summary.status === 'normal' ? 'Normal' : summary.status === 'high' ? 'High' : 'Low'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {dailySummaries.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No summary data available
          </div>
        )}
      </div>
    </div>
  );
}
