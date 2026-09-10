import { useState } from 'react';

interface HeavyEquipmentInspectionProps {
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
  status: 'operational' | 'maintenance' | 'breakdown';
}

interface InspectionItem {
  id: string;
  category: string;
  item: string;
  status: 'good' | 'fair' | 'poor' | 'na';
  notes: string;
}

interface InspectionRecord {
  id: string;
  equipmentId: string;
  date: string;
  time: string;
  operator: string;
  hourMeter: number;
  items: InspectionItem[];
  overallStatus: 'pass' | 'fail' | 'conditional';
  inspectorName: string;
  notes: string;
}

export default function HeavyEquipmentInspection() {
  const [equipment] = useState<Equipment[]>([
    { id: '1', unitNumber: 'DT-001', type: 'Dump Truck', brand: 'Komatsu', model: 'HD785-7', site: 'Site A - Kalimantan', status: 'operational' },
    { id: '2', unitNumber: 'EX-001', type: 'Excavator', brand: 'CAT', model: '336D', site: 'Site A - Kalimantan', status: 'operational' },
    { id: '3', unitNumber: 'BD-001', type: 'Bulldozer', brand: 'Komatsu', model: 'D65EX-18', site: 'Site B - Sulawesi', status: 'maintenance' },
    { id: '4', unitNumber: 'DT-002', type: 'Dump Truck', brand: 'Hitachi', model: 'EH5000', site: 'Site A - Kalimantan', status: 'operational' },
  ]);

  const [inspections, setInspections] = useState<InspectionRecord[]>([
    {
      id: '1',
      equipmentId: 'DT-001',
      date: '2026-01-15',
      time: '05:30',
      operator: 'Ahmad Fauzi',
      hourMeter: 12450,
      items: [
        { id: '1', category: 'Engine', item: 'Engine Oil Level', status: 'good', notes: '' },
        { id: '2', category: 'Engine', item: 'Coolant Level', status: 'good', notes: '' },
        { id: '3', category: 'Engine', item: 'Battery Condition', status: 'good', notes: '' },
        { id: '4', category: 'Tires', item: 'Front Left Tire', status: 'good', notes: 'Pressure 8.5 bar' },
        { id: '5', category: 'Tires', item: 'Front Right Tire', status: 'good', notes: 'Pressure 8.5 bar' },
        { id: '6', category: 'Tires', item: 'Rear Left Tire (Dual)', status: 'good', notes: '' },
        { id: '7', category: 'Tires', item: 'Rear Right Tire (Dual)', status: 'good', notes: '' },
        { id: '8', category: 'Brakes', item: 'Service Brake', status: 'good', notes: '' },
        { id: '9', category: 'Brakes', item: 'Parking Brake', status: 'good', notes: '' },
        { id: '10', category: 'Lights', item: 'Headlights', status: 'good', notes: '' },
        { id: '11', category: 'Lights', item: 'Tail Lights', status: 'good', notes: '' },
        { id: '12', category: 'Safety', item: 'Horn', status: 'good', notes: '' },
        { id: '13', category: 'Safety', item: 'Reverse Alarm', status: 'good', notes: '' },
        { id: '14', category: 'Safety', item: 'Fire Extinguisher', status: 'good', notes: 'Valid until 2026-06' },
      ],
      overallStatus: 'pass',
      inspectorName: 'Budi Santoso',
      notes: 'Unit in good condition',
    },
  ]);

  const [selectedEquipment, setSelectedEquipment] = useState<string>('');
  const [filterDate, setFilterDate] = useState<string>('2026-01-15');
  const [showForm, setShowForm] = useState(false);

  const defaultChecklistItems: Omit<InspectionItem, 'id' | 'status' | 'notes'>[] = [
    { category: 'Engine', item: 'Engine Oil Level' },
    { category: 'Engine', item: 'Coolant Level' },
    { category: 'Engine', item: 'Battery Condition' },
    { category: 'Engine', item: 'Air Filter' },
    { category: 'Tires', item: 'Front Left Tire' },
    { category: 'Tires', item: 'Front Right Tire' },
    { category: 'Tires', item: 'Rear Left Tire (Dual)' },
    { category: 'Tires', item: 'Rear Right Tire (Dual)' },
    { category: 'Brakes', item: 'Service Brake' },
    { category: 'Brakes', item: 'Parking Brake' },
    { category: 'Lights', item: 'Headlights' },
    { category: 'Lights', item: 'Tail Lights' },
    { category: 'Lights', item: 'Signal Lights' },
    { category: 'Safety', item: 'Horn' },
    { category: 'Safety', item: 'Reverse Alarm' },
    { category: 'Safety', item: 'Fire Extinguisher' },
    { category: 'Safety', item: 'First Aid Kit' },
    { category: 'Hydraulic', item: 'Hydraulic Oil Level' },
    { category: 'Hydraulic', item: 'Hydraulic Hoses' },
    { category: 'Body', item: 'Dump Body Condition' },
  ];

  const [inspectionItems, setInspectionItems] = useState<InspectionItem[]>([]);
  const [operator, setOperator] = useState('');
  const [hourMeter, setHourMeter] = useState(0);
  const [inspectorName, setInspectorName] = useState('');
  const [notes, setNotes] = useState('');

  const handleStartInspection = () => {
    if (!selectedEquipment || !operator || !inspectorName) return;

    const newItems: InspectionItem[] = defaultChecklistItems.map((item, index) => ({
      id: Date.now().toString() + index,
      ...item,
      status: 'na',
      notes: '',
    }));

    setInspectionItems(newItems);
  };

  const handleUpdateItem = (id: string, field: 'status' | 'notes', value: string) => {
    setInspectionItems(items => items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleSubmit = () => {
    const passCount = inspectionItems.filter(item => item.status === 'good').length;
    const failCount = inspectionItems.filter(item => item.status === 'poor').length;

    let overallStatus: 'pass' | 'fail' | 'conditional' = 'pass';
    if (failCount > 0) {
      overallStatus = failCount >= 3 ? 'fail' : 'conditional';
    }

    const newInspection: InspectionRecord = {
      id: Date.now().toString(),
      equipmentId: selectedEquipment,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      operator,
      hourMeter,
      items: inspectionItems,
      overallStatus,
      inspectorName,
      notes,
    };

    setInspections([newInspection, ...inspections]);
    setShowForm(false);
    setInspectionItems([]);
    setOperator('');
    setHourMeter(0);
    setInspectorName('');
    setNotes('');
  };

  const filteredInspections = inspections.filter(i => {
    const matchEquipment = selectedEquipment === '' || i.equipmentId === selectedEquipment;
    const matchDate = i.date === filterDate;
    return matchEquipment && matchDate;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      good: 'bg-green-100 text-green-800',
      fair: 'bg-yellow-100 text-yellow-800',
      poor: 'bg-red-100 text-red-800',
      na: 'bg-gray-100 text-gray-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const getOverallStatusBadge = (status: string) => {
    const styles = {
      pass: 'bg-green-100 text-green-800',
      fail: 'bg-red-100 text-red-800',
      conditional: 'bg-yellow-100 text-yellow-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const getEquipmentStatusBadge = (status: string) => {
    const styles = {
      operational: 'bg-green-100 text-green-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      breakdown: 'bg-red-100 text-red-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const passCount = inspections.filter(i => i.overallStatus === 'pass').length;
  const failCount = inspections.filter(i => i.overallStatus === 'fail').length;
  const conditionalCount = inspections.filter(i => i.overallStatus === 'conditional').length;

  const categories = Array.from(new Set(inspectionItems.map(item => item.category)));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0A2540] to-[#1E3A5F] flex items-center justify-center">
            <span className="text-white text-xs font-bold">PA</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">Heavy Equipment & Fleet Daily Inspection (P2H)</h1>
            <p className="text-sm text-gray-600">PT Perdana Adi Yuda - Pre-Start Inspection Alat Berat</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Total Units</div>
          <div className="text-3xl font-bold text-blue-600">{equipment.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Inspections Passed</div>
          <div className="text-3xl font-bold text-green-600">{passCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Conditional</div>
          <div className="text-3xl font-bold text-yellow-600">{conditionalCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Failed</div>
          <div className="text-3xl font-bold text-red-600">{failCount}</div>
        </div>
      </div>

      {/* Equipment List */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Fleet Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {equipment.map(eq => (
            <div key={eq.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-bold text-lg">{eq.unitNumber}</div>
                  <div className="text-sm text-gray-600">{eq.type}</div>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getEquipmentStatusBadge(eq.status)}`}>
                  {eq.status === 'operational' ? 'Operational' : eq.status === 'maintenance' ? 'Maintenance' : 'Breakdown'}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {eq.brand} {eq.model}
              </div>
              <div className="text-xs text-gray-500 mt-1">{eq.site}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Equipment</label>
            <select
              value={selectedEquipment}
              onChange={(e) => setSelectedEquipment(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Equipment</option>
              {equipment.map(eq => (
                <option key={eq.id} value={eq.id}>{eq.unitNumber} - {eq.type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Date</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setShowForm(!showForm)}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
            >
              {showForm ? 'Cancel' : '+ New Inspection'}
            </button>
          </div>
        </div>
      </div>

      {/* Inspection Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Pre-Start Inspection Form</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Equipment *</label>
              <select
                value={selectedEquipment}
                onChange={(e) => setSelectedEquipment(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select Equipment --</option>
                {equipment.map(eq => (
                  <option key={eq.id} value={eq.id}>{eq.unitNumber} - {eq.type} ({eq.brand} {eq.model})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Operator *</label>
              <input
                type="text"
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Operator name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Hour Meter *</label>
              <input
                type="number"
                value={hourMeter}
                onChange={(e) => setHourMeter(Number(e.target.value))}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Current hour meter"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Inspector *</label>
              <input
                type="text"
                value={inspectorName}
                onChange={(e) => setInspectorName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Inspector name"
              />
            </div>
          </div>

          <button
            onClick={handleStartInspection}
            disabled={!selectedEquipment || !operator || !inspectorName}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Start Inspection
          </button>

          {/* Checklist */}
          {inspectionItems.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-bold mb-4">Inspection Checklist</h3>
              
              {categories.map(category => (
                <div key={category} className="mb-6">
                  <h4 className="text-md font-semibold mb-2 text-blue-600">{category}</h4>
                  <div className="space-y-2">
                    {inspectionItems.filter(item => item.category === category).map(item => (
                      <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{item.item}</div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateItem(item.id, 'status', 'good')}
                            className={`px-4 py-1 rounded-lg text-sm font-medium ${
                              item.status === 'good' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-green-100'
                            }`}
                          >
                            Good
                          </button>
                          <button
                            onClick={() => handleUpdateItem(item.id, 'status', 'fair')}
                            className={`px-4 py-1 rounded-lg text-sm font-medium ${
                              item.status === 'fair' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-yellow-100'
                            }`}
                          >
                            Fair
                          </button>
                          <button
                            onClick={() => handleUpdateItem(item.id, 'status', 'poor')}
                            className={`px-4 py-1 rounded-lg text-sm font-medium ${
                              item.status === 'poor' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-red-100'
                            }`}
                          >
                            Poor
                          </button>
                        </div>
                        <input
                          type="text"
                          value={item.notes}
                          onChange={(e) => handleUpdateItem(item.id, 'notes', e.target.value)}
                          className="flex-1 px-3 py-1 border rounded-lg text-sm"
                          placeholder="Notes"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="mt-6">
                <label className="block text-sm font-medium mb-2">Overall Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Additional notes..."
                />
              </div>

              <div className="mt-4 flex gap-4">
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Submit Inspection
                </button>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setInspectionItems([]);
                  }}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Inspection Records */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Inspection Records</h2>
        <div className="space-y-4">
          {filteredInspections.map(inspection => {
            const eq = equipment.find(e => e.id === inspection.equipmentId);
            return (
              <div key={inspection.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-bold text-lg">{eq?.unitNumber} - {eq?.type}</div>
                    <div className="text-sm text-gray-600">
                      {inspection.date} at {inspection.time} • Hour Meter: {inspection.hourMeter}h
                    </div>
                    <div className="text-sm text-gray-600">
                      Operator: {inspection.operator} • Inspector: {inspection.inspectorName}
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getOverallStatusBadge(inspection.overallStatus)}`}>
                    {inspection.overallStatus === 'pass' ? 'PASS' : inspection.overallStatus === 'fail' ? 'FAIL' : 'CONDITIONAL'}
                  </span>
                </div>

                <div className="border-t pt-3">
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {inspection.items.filter(i => i.status === 'good').length}
                      </div>
                      <div className="text-sm text-gray-600">Good</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {inspection.items.filter(i => i.status === 'fair').length}
                      </div>
                      <div className="text-sm text-gray-600">Fair</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {inspection.items.filter(i => i.status === 'poor').length}
                      </div>
                      <div className="text-sm text-gray-600">Poor</div>
                    </div>
                  </div>

                  {inspection.items.filter(i => i.status === 'poor').length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-sm font-semibold text-red-600 mb-2">Items Requiring Attention:</h4>
                      <div className="space-y-1">
                        {inspection.items.filter(i => i.status === 'poor').map(item => (
                          <div key={item.id} className="flex items-center gap-2 text-sm">
                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                            <span className="font-medium">{item.category} - {item.item}:</span>
                            <span className="text-gray-600">{item.notes || 'No notes'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {inspection.notes && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">Notes:</div>
                      <div className="text-sm text-gray-900">{inspection.notes}</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {filteredInspections.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No inspection records for selected date and equipment
          </div>
        )}
      </div>
    </div>
  );
}
