import { useState } from 'react';

interface InventoryItem {
  id: string;
  itemName: string;
  category: string;
  totalStock: number;
  distributed: number;
  available: number;
  unit: string;
  condition: 'good' | 'fair' | 'poor';
}

interface Distribution {
  id: string;
  employeeName: string;
  employeeId: string;
  division: string;
  client: string;
  items: { itemName: string; quantity: number; date: string; returnDate: string }[];
  status: 'active' | 'returned';
}

export default function UniformInventoryManager() {
  const [inventory] = useState<InventoryItem[]>([
    {
      id: '1',
      itemName: 'Seragam Security - Size L',
      category: 'Seragam',
      totalStock: 50,
      distributed: 35,
      available: 15,
      unit: 'pcs',
      condition: 'good',
    },
    {
      id: '2',
      itemName: 'Helm Safety',
      category: 'APD',
      totalStock: 30,
      distributed: 28,
      available: 2,
      unit: 'pcs',
      condition: 'good',
    },
    {
      id: '3',
      itemName: 'Sepatu Safety - Size 42',
      category: 'APD',
      totalStock: 20,
      distributed: 18,
      available: 2,
      unit: 'pairs',
      condition: 'fair',
    },
    {
      id: '4',
      itemName: 'Rompi Reflektif',
      category: 'APD',
      totalStock: 40,
      distributed: 30,
      available: 10,
      unit: 'pcs',
      condition: 'good',
    },
    {
      id: '5',
      itemName: 'HT (Handy Talky)',
      category: 'Perangkat Kerja',
      totalStock: 15,
      distributed: 12,
      available: 3,
      unit: 'units',
      condition: 'good',
    },
  ]);

  const [distributions] = useState<Distribution[]>([
    {
      id: '1',
      employeeName: 'Ahmad Fauzi',
      employeeId: 'EMP001',
      division: 'Security',
      client: 'PT ABC Manufacturing',
      items: [
        { itemName: 'Seragam Security - Size L', quantity: 2, date: '2026-01-05', returnDate: '' },
        { itemName: 'Sepatu Safety - Size 42', quantity: 1, date: '2026-01-05', returnDate: '' },
        { itemName: 'HT (Handy Talky)', quantity: 1, date: '2026-01-05', returnDate: '' },
      ],
      status: 'active',
    },
    {
      id: '2',
      employeeName: 'Budi Santoso',
      employeeId: 'EMP002',
      division: 'Cleaning Service',
      client: 'PT XYZ Tower',
      items: [
        { itemName: 'Seragam CS - Size M', quantity: 2, date: '2026-01-03', returnDate: '' },
        { itemName: 'Rompi Reflektif', quantity: 1, date: '2026-01-03', returnDate: '' },
      ],
      status: 'active',
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const categories = Array.from(new Set(inventory.map(i => i.category)));

  const filteredInventory = filterCategory === 'all'
    ? inventory
    : inventory.filter(i => i.category === filterCategory);

  const filteredDistributions = distributions.filter(d => {
    const matchStatus = filterStatus === 'all' || d.status === filterStatus;
    return matchStatus;
  });

  const getConditionBadge = (condition: string) => {
    const styles = {
      good: 'bg-green-100 text-green-800',
      fair: 'bg-yellow-100 text-yellow-800',
      poor: 'bg-red-100 text-red-800',
    };
    return styles[condition as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-blue-100 text-blue-800',
      returned: 'bg-gray-100 text-gray-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const totalStock = inventory.reduce((sum, i) => sum + i.totalStock, 0);
  const totalDistributed = inventory.reduce((sum, i) => sum + i.distributed, 0);
  const totalAvailable = inventory.reduce((sum, i) => sum + i.available, 0);
  const lowStockItems = inventory.filter(i => i.available <= 5).length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0A2540] to-[#1E3A5F] flex items-center justify-center">
            <span className="text-white text-xs font-bold">PA</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">Uniform & Inventory Asset Manager</h1>
            <p className="text-sm text-gray-600">PT Perdana Adi Yuda - Tracking Inventaris Perlengkapan Kerja</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Total Stock</div>
          <div className="text-3xl font-bold text-blue-600">{totalStock}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Distributed</div>
          <div className="text-3xl font-bold text-orange-600">{totalDistributed}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Available</div>
          <div className="text-3xl font-bold text-green-600">{totalAvailable}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Low Stock Items</div>
          <div className="text-3xl font-bold text-red-600">{lowStockItems}</div>
        </div>
      </div>

      {/* Inventory Section */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Inventory Stock</h2>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Stock</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Distributed</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Available</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Condition</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInventory.map((item) => (
                <tr key={item.id} className={`hover:bg-gray-50 ${item.available <= 5 ? 'bg-red-50' : ''}`}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.itemName}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.totalStock} {item.unit}</td>
                  <td className="px-4 py-3 text-sm text-orange-600 font-semibold">{item.distributed} {item.unit}</td>
                  <td className="px-4 py-3 text-sm text-green-600 font-semibold">{item.available} {item.unit}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getConditionBadge(item.condition)}`}>
                      {item.condition === 'good' ? 'Good' : item.condition === 'fair' ? 'Fair' : 'Poor'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {item.available <= 5 ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        Low Stock
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        In Stock
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredInventory.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Tidak ada item inventory
          </div>
        )}
      </div>

      {/* Distribution Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Asset Distribution</h2>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="returned">Returned</option>
            </select>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {showForm ? 'Batal' : '+ Distribusi Baru'}
            </button>
          </div>
        </div>

        {showForm && (
          <div className="mb-4 p-4 border rounded-lg bg-gray-50">
            <h3 className="font-semibold mb-3">Form Distribusi Aset</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nama Karyawan</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg" placeholder="Nama karyawan" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Employee ID</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg" placeholder="EMP001" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Division</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg" placeholder="Security" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Client</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg" placeholder="PT ABC" />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Simpan
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Batal
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {filteredDistributions.map((dist) => (
            <div key={dist.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-semibold text-lg">{dist.employeeName}</div>
                  <div className="text-sm text-gray-600">
                    {dist.employeeId} • {dist.division} • {dist.client}
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(dist.status)}`}>
                  {dist.status === 'active' ? 'Active' : 'Returned'}
                </span>
              </div>
              <div className="border-t pt-3">
                <div className="text-sm font-medium mb-2">Items Distributed:</div>
                <div className="space-y-2">
                  {dist.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                      <span>{item.itemName}</span>
                      <div className="flex gap-4">
                        <span className="text-gray-600">Qty: {item.quantity}</span>
                        <span className="text-gray-600">Date: {item.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                {dist.status === 'active' && (
                  <button className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700">
                    Mark as Returned
                  </button>
                )}
                <button className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
        {filteredDistributions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Tidak ada data distribusi
          </div>
        )}
      </div>
    </div>
  );
}
