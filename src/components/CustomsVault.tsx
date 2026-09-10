import { useState } from 'react';

interface CustomsDocument {
  id: string;
  documentType: 'PIB' | 'PEB' | 'BL' | 'AWB' | 'COO' | 'Invoice' | 'Packing List';
  documentNumber: string;
  containerNumber: string;
  awbNumber: string;
  clientName: string;
  vesselName: string;
  voyageNumber: string;
  date: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  value: number;
  notes: string;
  filePath: string;
}

export default function CustomsVault() {
  const [documents, setDocuments] = useState<CustomsDocument[]>([
    {
      id: '1',
      documentType: 'PIB',
      documentNumber: 'PIB-2026-001',
      containerNumber: 'CONT1234567',
      awbNumber: '',
      clientName: 'PT ABC Manufacturing',
      vesselName: 'MV Singapore Express',
      voyageNumber: 'V.2601S',
      date: '2026-01-10',
      status: 'approved',
      value: 150000000,
      notes: 'Import mesin produksi',
      filePath: '/documents/pib-2026-001.pdf',
    },
    {
      id: '2',
      documentType: 'PEB',
      documentNumber: 'PEB-2026-001',
      containerNumber: 'CONT7654321',
      awbNumber: '',
      clientName: 'PT XYZ Logistics',
      vesselName: 'MV Jakarta Spirit',
      voyageNumber: 'V.2601E',
      date: '2026-01-12',
      status: 'submitted',
      value: 85000000,
      notes: 'Export produk tekstil',
      filePath: '/documents/peb-2026-001.pdf',
    },
    {
      id: '3',
      documentType: 'AWB',
      documentNumber: 'AWB-123-45678901',
      containerNumber: '',
      awbNumber: '123-45678901',
      clientName: 'PT DEF Trading',
      vesselName: '',
      voyageNumber: '',
      date: '2026-01-15',
      status: 'approved',
      value: 25000000,
      notes: 'Air freight sparepart elektronik',
      filePath: '/documents/awb-123-45678901.pdf',
    },
  ]);

  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredDocuments = documents.filter(doc => {
    const matchType = filterType === 'all' || doc.documentType === filterType;
    const matchStatus = filterStatus === 'all' || doc.status === filterStatus;
    const matchSearch = searchQuery === '' || 
      doc.documentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.containerNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.awbNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchStatus && matchSearch;
  });

  const getTypeBadge = (type: string) => {
    const styles = {
      'PIB': 'bg-blue-100 text-blue-800',
      'PEB': 'bg-green-100 text-green-800',
      'BL': 'bg-purple-100 text-purple-800',
      'AWB': 'bg-orange-100 text-orange-800',
      'COO': 'bg-pink-100 text-pink-800',
      'Invoice': 'bg-yellow-100 text-yellow-800',
      'Packing List': 'bg-gray-100 text-gray-800',
    };
    return styles[type as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      'draft': 'bg-gray-100 text-gray-800',
      'submitted': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const approvedCount = documents.filter(d => d.status === 'approved').length;
  const pendingCount = documents.filter(d => d.status === 'submitted').length;
  const totalValue = documents.filter(d => d.status === 'approved').reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0A2540] to-[#1E3A5F] flex items-center justify-center">
          <span className="text-white text-xs font-bold">PA</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold">Customs Vault</h1>
          <p className="text-sm text-gray-600">PT Perdana Adi Yuda - Repository Dokumen Kepabeanan (PIB, PEB, B/L, AWB)</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Total Documents</div>
          <div className="text-3xl font-bold text-blue-600">{documents.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Approved</div>
          <div className="text-3xl font-bold text-green-600">{approvedCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Pending</div>
          <div className="text-3xl font-bold text-yellow-600">{pendingCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Total Value</div>
          <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalValue)}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Search by document number, container, AWB, or client..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Document Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="PIB">PIB</option>
              <option value="PEB">PEB</option>
              <option value="BL">Bill of Lading</option>
              <option value="AWB">Air Waybill</option>
              <option value="COO">Certificate of Origin</option>
              <option value="Invoice">Invoice</option>
              <option value="Packing List">Packing List</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Document No</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Container/AWB</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vessel/Voyage</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDocuments.map(doc => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{doc.date}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(doc.documentType)}`}>
                      {doc.documentType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-900">{doc.documentNumber}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {doc.containerNumber || doc.awbNumber || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{doc.clientName}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {doc.vesselName && (
                      <div>
                        <div>{doc.vesselName}</div>
                        <div className="text-xs text-gray-500">{doc.voyageNumber}</div>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatCurrency(doc.value)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(doc.status)}`}>
                      {doc.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredDocuments.length === 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-lg p-12 text-center">
          <p className="text-gray-500">No documents found</p>
        </div>
      )}
    </div>
  );
}
