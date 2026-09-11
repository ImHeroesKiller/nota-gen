import { useState } from 'react';

interface ChecklistItem {
  id: string;
  component: string;
  category: string;
  status: 'pass' | 'fail' | 'na';
  notes: string;
}

interface VehicleInspection {
  id: string;
  vehiclePlate: string;
  vehicleType: string;
  driverName: string;
  inspectionDate: string;
  mileage: number;
  items: ChecklistItem[];
  overallStatus: 'pass' | 'fail' | 'conditional';
  inspectorName: string;
  notes: string;
}

interface VehicleChecklistProps {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

export default function VehicleChecklist({ onBack, darkMode, setDarkMode }: VehicleChecklistProps) {
  const [inspections, setInspections] = useState<VehicleInspection[]>([
    {
      id: '1',
      vehiclePlate: 'B 1234 ABC',
      vehicleType: 'Toyota Avanza',
      driverName: 'Ahmad Fauzi',
      inspectionDate: '2026-01-09',
      mileage: 45678,
      items: [
        { id: '1', component: 'Mesin', category: 'Mesin', status: 'pass', notes: 'Normal' },
        { id: '2', component: 'Oli Mesin', category: 'Mesin', status: 'pass', notes: 'Level normal' },
        { id: '3', component: 'Ban Depan Kiri', category: 'Ban', status: 'pass', notes: 'Tekanan normal' },
        { id: '4', component: 'Ban Depan Kanan', category: 'Ban', status: 'pass', notes: 'Tekanan normal' },
        { id: '5', component: 'Ban Belakang Kiri', category: 'Ban', status: 'pass', notes: 'Tekanan normal' },
        { id: '6', component: 'Ban Belakang Kanan', category: 'Ban', status: 'pass', notes: 'Tekanan normal' },
        { id: '7', component: 'Lampu Depan', category: 'Kelengkapan', status: 'pass', notes: 'Fungsi normal' },
        { id: '8', component: 'Lampu Belakang', category: 'Kelengkapan', status: 'pass', notes: 'Fungsi normal' },
        { id: '9', component: 'Klakson', category: 'Kelengkapan', status: 'pass', notes: 'Fungsi normal' },
        { id: '10', component: 'Spion', category: 'Kelengkapan', status: 'pass', notes: 'Kondisi baik' },
      ],
      overallStatus: 'pass',
      inspectorName: 'Budi Hartono',
      notes: 'Kendaraan dalam kondisi baik',
    },
    {
      id: '2',
      vehiclePlate: 'B 5678 DEF',
      vehicleType: 'Mitsubishi L300',
      driverName: 'Siti Rahayu',
      inspectionDate: '2026-01-09',
      mileage: 78901,
      items: [
        { id: '11', component: 'Mesin', category: 'Mesin', status: 'pass', notes: 'Normal' },
        { id: '12', component: 'Oli Mesin', category: 'Mesin', status: 'fail', notes: 'Perlu penggantian' },
        { id: '13', component: 'Ban Depan Kiri', category: 'Ban', status: 'pass', notes: 'Tekanan normal' },
        { id: '14', component: 'Ban Depan Kanan', category: 'Ban', status: 'pass', notes: 'Tekanan normal' },
        { id: '15', component: 'Ban Belakang Kiri', category: 'Ban', status: 'fail', notes: 'Aus, perlu penggantian' },
        { id: '16', component: 'Ban Belakang Kanan', category: 'Ban', status: 'pass', notes: 'Tekanan normal' },
        { id: '17', component: 'Lampu Depan', category: 'Kelengkapan', status: 'pass', notes: 'Fungsi normal' },
        { id: '18', component: 'Lampu Belakang', category: 'Kelengkapan', status: 'pass', notes: 'Fungsi normal' },
      ],
      overallStatus: 'conditional',
      inspectorName: 'Budi Hartono',
      notes: 'Perlu maintenance untuk oli dan ban belakang kiri',
    },
  ]);

  const [formData, setFormData] = useState({
    vehiclePlate: '',
    vehicleType: '',
    driverName: '',
    inspectionDate: new Date().toISOString().split('T')[0],
    mileage: 0,
    inspectorName: '',
    notes: '',
  });

  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [showForm, setShowForm] = useState(false);

  const defaultChecklistItems = [
    { component: 'Mesin', category: 'Mesin' },
    { component: 'Oli Mesin', category: 'Mesin' },
    { component: 'Air Radiator', category: 'Mesin' },
    { component: 'Aki', category: 'Mesin' },
    { component: 'Ban Depan Kiri', category: 'Ban' },
    { component: 'Ban Depan Kanan', category: 'Ban' },
    { component: 'Ban Belakang Kiri', category: 'Ban' },
    { component: 'Ban Belakang Kanan', category: 'Ban' },
    { component: 'Lampu Depan', category: 'Kelengkapan' },
    { component: 'Lampu Belakang', category: 'Kelengkapan' },
    { component: 'Lampu Sein', category: 'Kelengkapan' },
    { component: 'Klakson', category: 'Kelengkapan' },
    { component: 'Spion', category: 'Kelengkapan' },
    { component: 'Wiper', category: 'Kelengkapan' },
    { component: 'Rem Tangan', category: 'Kelengkapan' },
  ];

  const handleStartInspection = () => {
    if (!formData.vehiclePlate || !formData.vehicleType || !formData.driverName) return;

    const newItems: ChecklistItem[] = defaultChecklistItems.map((item, index) => ({
      id: Date.now().toString() + index,
      ...item,
      status: 'na',
      notes: '',
    }));

    setItems(newItems);
  };

  const handleUpdateItem = (id: string, field: 'status' | 'notes', value: string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleSubmit = () => {
    const passCount = items.filter(item => item.status === 'pass').length;
    const failCount = items.filter(item => item.status === 'fail').length;

    let overallStatus: 'pass' | 'fail' | 'conditional' = 'pass';
    if (failCount > 0) {
      overallStatus = failCount >= 3 ? 'fail' : 'conditional';
    }

    const newInspection: VehicleInspection = {
      id: Date.now().toString(),
      ...formData,
      items,
      overallStatus,
    };

    setInspections([newInspection, ...inspections]);
    setFormData({
      vehiclePlate: '',
      vehicleType: '',
      driverName: '',
      inspectionDate: new Date().toISOString().split('T')[0],
      mileage: 0,
      inspectorName: '',
      notes: '',
    });
    setItems([]);
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    setInspections(inspections.filter(i => i.id !== id));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pass: 'bg-green-100 text-green-800',
      fail: 'bg-red-100 text-red-800',
      conditional: 'bg-yellow-100 text-yellow-800',
      na: 'bg-gray-100 text-gray-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const getItemStatusBadge = (status: string) => {
    const styles = {
      pass: 'bg-green-500 text-white',
      fail: 'bg-red-500 text-white',
      na: 'bg-gray-300 text-gray-700',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-300 text-gray-700';
  };

  const passCount = inspections.filter(i => i.overallStatus === 'pass').length;
  const failCount = inspections.filter(i => i.overallStatus === 'fail').length;
  const conditionalCount = inspections.filter(i => i.overallStatus === 'conditional').length;

  const categories = Array.from(new Set(items.map(item => item.category)));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0A2540] to-[#1E3A5F] flex items-center justify-center">
            <span className="text-white text-xs font-bold">PA</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">Vehicle Checklist</h1>
            <p className="text-sm text-gray-600">PT Perdana Adi Yuda - Form Inspeksi Kendaraan Harian</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Total Inspeksi</div>
          <div className="text-3xl font-bold text-blue-600">{inspections.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Lulus (Pass)</div>
          <div className="text-3xl font-bold text-green-600">{passCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Kondisional</div>
          <div className="text-3xl font-bold text-yellow-600">{conditionalCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Gagal (Fail)</div>
          <div className="text-3xl font-bold text-red-600">{failCount}</div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
        >
          {showForm ? 'Batal' : '+ Inspeksi Baru'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Form Inspeksi Kendaraan</h2>
          
          {/* Vehicle Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Plat Nomor *</label>
              <input
                type="text"
                value={formData.vehiclePlate}
                onChange={(e) => setFormData({ ...formData, vehiclePlate: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="B 1234 ABC"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Jenis Kendaraan *</label>
              <input
                type="text"
                value={formData.vehicleType}
                onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Toyota Avanza"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Nama Driver *</label>
              <input
                type="text"
                value={formData.driverName}
                onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Nama driver"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tanggal Inspeksi</label>
              <input
                type="date"
                value={formData.inspectionDate}
                onChange={(e) => setFormData({ ...formData, inspectionDate: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Kilometer</label>
              <input
                type="number"
                value={formData.mileage}
                onChange={(e) => setFormData({ ...formData, mileage: Number(e.target.value) })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Nama Inspector</label>
              <input
                type="text"
                value={formData.inspectorName}
                onChange={(e) => setFormData({ ...formData, inspectorName: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Nama inspector"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Catatan Umum</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Catatan tambahan"
              />
            </div>
          </div>

          <button
            onClick={handleStartInspection}
            disabled={!formData.vehiclePlate || !formData.vehicleType || !formData.driverName}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Mulai Inspeksi
          </button>

          {/* Checklist */}
          {items.length > 0 && (
            <div className="mt-6 border-t pt-4">
              <h3 className="text-lg font-bold mb-4">Checklist Inspeksi</h3>
              
              {categories.map(category => (
                <div key={category} className="mb-6">
                  <h4 className="text-md font-semibold mb-2 text-blue-600">{category}</h4>
                  <div className="space-y-2">
                    {items.filter(item => item.category === category).map(item => (
                      <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{item.component}</div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateItem(item.id, 'status', 'pass')}
                            className={`px-4 py-1 rounded-lg text-sm font-medium ${
                              item.status === 'pass' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-green-100'
                            }`}
                          >
                            Pass
                          </button>
                          <button
                            onClick={() => handleUpdateItem(item.id, 'status', 'fail')}
                            className={`px-4 py-1 rounded-lg text-sm font-medium ${
                              item.status === 'fail' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-red-100'
                            }`}
                          >
                            Fail
                          </button>
                        </div>
                        <input
                          type="text"
                          value={item.notes}
                          onChange={(e) => handleUpdateItem(item.id, 'notes', e.target.value)}
                          className="flex-1 px-3 py-1 border rounded-lg text-sm"
                          placeholder="Catatan"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Submit Button */}
              <div className="mt-6 flex gap-2">
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Submit Inspeksi
                </button>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setItems([]);
                    setFormData({
                      vehiclePlate: '',
                      vehicleType: '',
                      driverName: '',
                      inspectionDate: new Date().toISOString().split('T')[0],
                      mileage: 0,
                      inspectorName: '',
                      notes: '',
                    });
                  }}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Batal
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Inspections List */}
      <div className="space-y-4">
        {inspections.map((inspection) => (
          <div key={inspection.id} className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-lg font-bold">{inspection.vehiclePlate} - {inspection.vehicleType}</div>
                <div className="text-sm text-gray-600">
                  Driver: {inspection.driverName} • {formatDate(inspection.inspectionDate)} • {inspection.mileage.toLocaleString()} km
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(inspection.overallStatus)}`}>
                  {inspection.overallStatus === 'pass' ? 'Lulus' : inspection.overallStatus === 'fail' ? 'Gagal' : 'Kondisional'}
                </span>
              </div>
            </div>

            {/* Items Summary */}
            <div className="border-t pt-4 mb-4">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {inspection.items.filter(i => i.status === 'pass').length}
                  </div>
                  <div className="text-sm text-gray-600">Pass</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {inspection.items.filter(i => i.status === 'fail').length}
                  </div>
                  <div className="text-sm text-gray-600">Fail</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">
                    {inspection.items.filter(i => i.status === 'na').length}
                  </div>
                  <div className="text-sm text-gray-600">N/A</div>
                </div>
              </div>

              {/* Failed Items */}
              {inspection.items.filter(i => i.status === 'fail').length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-red-600 mb-2">Item yang Gagal:</h4>
                  <div className="space-y-1">
                    {inspection.items.filter(i => i.status === 'fail').map(item => (
                      <div key={item.id} className="flex items-center gap-2 text-sm">
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        <span className="font-medium">{item.component}:</span>
                        <span className="text-gray-600">{item.notes || 'No notes'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {inspection.notes && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Catatan Inspector:</div>
                <div className="text-sm text-gray-900">{inspection.notes}</div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => handleDelete(inspection.id)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {inspections.length === 0 && (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <p className="text-gray-500">Belum ada inspeksi kendaraan</p>
        </div>
      )}
    </div>
  );
}
