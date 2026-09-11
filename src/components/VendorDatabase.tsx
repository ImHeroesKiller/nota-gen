import { useState } from 'react';

interface Vendor {
  id: string;
  vendorName: string;
  category: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  status: 'active' | 'blacklisted';
  rating: number;
  notes: string;
}

interface VendorDatabaseProps {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

export default function VendorDatabase({ onBack, darkMode, setDarkMode }: VendorDatabaseProps) {
  const [vendors, setVendors] = useState<Vendor[]>([
    {
      id: '1',
      vendorName: 'PT Katering Nusantara',
      category: 'Katering',
      contactPerson: 'Ibu Sari',
      phone: '021-5551234',
      email: 'info@kateringnusantara.com',
      address: 'Jl. Sudirman No. 123, Jakarta',
      status: 'active',
      rating: 5,
      notes: 'Katering untuk event besar',
    },
    {
      id: '2',
      vendorName: 'CV Transport Cepat',
      category: 'Transportasi',
      contactPerson: 'Pak Budi',
      phone: '021-5555678',
      email: 'budi@transportcepat.com',
      address: 'Jl. Gatot Subroto No. 45, Jakarta',
      status: 'active',
      rating: 4,
      notes: 'Transportasi karyawan dan logistik',
    },
    {
      id: '3',
      vendorName: 'PT Office Supplies',
      category: 'Perlengkapan Kantor',
      contactPerson: 'Pak Ahmad',
      phone: '021-5559012',
      email: 'sales@officesupplies.com',
      address: 'Jl. Thamrin No. 67, Jakarta',
      status: 'blacklisted',
      rating: 2,
      notes: 'Sering terlambat pengiriman',
    },
  ]);

  const [formData, setFormData] = useState({
    vendorName: '',
    category: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    status: 'active' as 'active' | 'blacklisted',
    rating: 3,
    notes: '',
  });

  const [showForm, setShowForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const categories = Array.from(new Set(vendors.map(v => v.category)));

  const handleSubmit = () => {
    if (!formData.vendorName || !formData.category) return;

    const newVendor: Vendor = {
      id: Date.now().toString(),
      ...formData,
    };

    setVendors([newVendor, ...vendors]);
    setFormData({
      vendorName: '',
      category: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      status: 'active',
      rating: 3,
      notes: '',
    });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    setVendors(vendors.filter(v => v.id !== id));
  };

  const toggleStatus = (id: string) => {
    setVendors(vendors.map(v =>
      v.id === id ? { ...v, status: v.status === 'active' ? 'blacklisted' : 'active' } : v
    ));
  };

  const filteredVendors = vendors.filter(v => {
    const matchesCategory = filterCategory === 'all' || v.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || v.status === filterStatus;
    return matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    return status === 'active'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
        ★
      </span>
    ));
  };

  const activeCount = vendors.filter(v => v.status === 'active').length;
  const blacklistedCount = vendors.filter(v => v.status === 'blacklisted').length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0A2540] to-[#1E3A5F] flex items-center justify-center">
            <span className="text-white text-xs font-bold">PA</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">Vendor Database</h1>
            <p className="text-sm text-gray-600">PT Perdana Adi Yuda - Database Vendor & Supplier</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Total Vendor</div>
          <div className="text-3xl font-bold text-blue-600">{vendors.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Vendor Aktif</div>
          <div className="text-3xl font-bold text-green-600">{activeCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Blacklisted</div>
          <div className="text-3xl font-bold text-red-600">{blacklistedCount}</div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="mb-6 flex flex-wrap gap-4">
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
        >
          {showForm ? 'Batal' : '+ Tambah Vendor'}
        </button>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Semua Kategori</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Semua Status</option>
          <option value="active">Aktif</option>
          <option value="blacklisted">Blacklisted</option>
        </select>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Tambah Vendor Baru</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nama Vendor *</label>
              <input
                type="text"
                value={formData.vendorName}
                onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Nama vendor/perusahaan"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Kategori *</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Katering, Transportasi, dll"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Contact Person</label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Nama contact person"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Telepon</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="021-xxx"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="email@vendor.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Rating</label>
              <select
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>1 Bintang</option>
                <option value={2}>2 Bintang</option>
                <option value={3}>3 Bintang</option>
                <option value={4}>4 Bintang</option>
                <option value={5}>5 Bintang</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Alamat</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Alamat lengkap"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Catatan</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Catatan tambahan"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={!formData.vendorName || !formData.category}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Simpan
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Vendor Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Vendor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telepon</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredVendors.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">{vendor.vendorName}</div>
                    <div className="text-xs text-gray-500">{vendor.address}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {vendor.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">{vendor.contactPerson || '-'}</div>
                    <div className="text-xs text-gray-500">{vendor.email || '-'}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{vendor.phone || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="text-lg">{renderStars(vendor.rating)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(vendor.status)}`}>
                      {vendor.status === 'active' ? 'Aktif' : 'Blacklisted'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleStatus(vendor.id)}
                        className={`text-sm ${vendor.status === 'active' ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}`}
                      >
                        {vendor.status === 'active' ? 'Blacklist' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDelete(vendor.id)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredVendors.length === 0 && (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center mt-6">
          <p className="text-gray-500">Tidak ada vendor yang ditemukan</p>
        </div>
      )}
    </div>
  );
}
