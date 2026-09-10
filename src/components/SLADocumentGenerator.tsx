import { useState } from 'react';
import { jsPDF } from 'jspdf';
import { SLADocument, CreateSLADocumentDTO } from '../types/suite1-human-capital';

export default function SLADocumentGenerator() {
  const [formData, setFormData] = useState<CreateSLADocumentDTO>({
    sla_number: `SLA-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
    client_name: '',
    service_type: '',
    service_description: '',
    service_period_start: new Date().toISOString().split('T')[0],
    service_period_end: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    response_time: 15,
    resolution_time: 24,
    availability_percentage: 99.00,
    penalty_clause: '',
    penalty_amount: 0,
    notes: '',
  });

  const [documents, setDocuments] = useState<SLADocument[]>([]);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const now = new Date().toISOString();
    const newDoc: SLADocument = {
      id: documents.length + 1,
      sla_number: formData.sla_number,
      client_name: formData.client_name,
      service_type: formData.service_type,
      service_description: formData.service_description,
      service_period_start: formData.service_period_start,
      service_period_end: formData.service_period_end,
      response_time: formData.response_time,
      resolution_time: formData.resolution_time,
      availability_percentage: formData.availability_percentage,
      penalty_clause: formData.penalty_clause,
      penalty_amount: formData.penalty_amount,
      status: 'draft',
      notes: formData.notes,
      created_at: now,
      updated_at: now,
    };

    setDocuments([...documents, newDoc]);
    setShowForm(false);
    
    // Reset form
    const today = new Date();
    const nextYear = new Date();
    nextYear.setFullYear(today.getFullYear() + 1);
    setFormData({
      sla_number: `SLA-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      client_name: '',
      service_type: '',
      service_description: '',
      service_period_start: today.toISOString().split('T')[0],
      service_period_end: nextYear.toISOString().split('T')[0],
      response_time: 15,
      resolution_time: 24,
      availability_percentage: 99.00,
      penalty_clause: '',
      penalty_amount: 0,
      notes: '',
    });
  };

  const generatePDF = (doc: SLADocument) => {
    const pdf = new jsPDF();
    
    // Header
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('SERVICE LEVEL AGREEMENT (SLA)', 105, 20, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Nomor: ${doc.sla_number}`, 105, 30, { align: 'center' });
    
    // Client Info
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Informasi Klien', 20, 50);
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Nama Klien: ${doc.client_name}`, 20, 60);
    pdf.text(`Jenis Layanan: ${doc.service_type}`, 20, 70);
    
    // Service Details
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Detail Layanan', 20, 90);
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    const splitDescription = pdf.splitTextToSize(doc.service_description, 170);
    pdf.text(splitDescription, 20, 100);
    
    let yPos = 100 + (splitDescription.length * 6) + 10;
    
    pdf.text(`Periode Layanan: ${new Date(doc.service_period_start).toLocaleDateString('id-ID')} - ${new Date(doc.service_period_end).toLocaleDateString('id-ID')}`, 20, yPos);
    yPos += 10;
    
    // SLA Metrics
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Indikator SLA', 20, yPos);
    yPos += 10;
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Waktu Respons: ${doc.response_time} menit`, 20, yPos);
    yPos += 7;
    pdf.text(`Waktu Resolusi: ${doc.resolution_time} jam`, 20, yPos);
    yPos += 7;
    pdf.text(`Ketersediaan: ${doc.availability_percentage}%`, 20, yPos);
    yPos += 15;
    
    // Penalties
    if (doc.penalty_clause) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Klausul Penalti', 20, yPos);
      yPos += 10;
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      const splitPenalty = pdf.splitTextToSize(doc.penalty_clause, 170);
      pdf.text(splitPenalty, 20, yPos);
      yPos += (splitPenalty.length * 6) + 5;
      
      if (doc.penalty_amount && doc.penalty_amount > 0) {
        pdf.text(`Jumlah Penalti: Rp ${doc.penalty_amount.toLocaleString('id-ID')}`, 20, yPos);
        yPos += 10;
      }
    }
    
    // Notes
    if (doc.notes) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Catatan', 20, yPos);
      yPos += 10;
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      const splitNotes = pdf.splitTextToSize(doc.notes, 170);
      pdf.text(splitNotes, 20, yPos);
    }
    
    // Footer
    pdf.setFontSize(9);
    pdf.text(`Dokumen ini dibuat pada ${new Date().toLocaleDateString('id-ID')}`, 105, 280, { align: 'center' });
    pdf.text('PT Perdana Adi Yuda - PERADA GROUP', 105, 285, { align: 'center' });
    
    // Save PDF
    pdf.save(`${doc.sla_number}.pdf`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">SLA Document Generator</h1>
        <p className="text-gray-600">Generator dokumen Service Level Agreement untuk klien outsourcing</p>
      </div>

      <div className="mb-4">
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showForm ? 'Batal' : '+ Buat SLA Baru'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Form SLA Document</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nomor SLA</label>
                <input
                  type="text"
                  value={formData.sla_number}
                  onChange={(e) => setFormData({ ...formData, sla_number: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Nama Klien</label>
                <input
                  type="text"
                  value={formData.client_name}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Jenis Layanan</label>
              <select
                value={formData.service_type}
                onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required
              >
                <option value="">Pilih Jenis Layanan</option>
                <option value="Security Services">Security Services</option>
                <option value="Cleaning Services">Cleaning Services</option>
                <option value="Driver Services">Driver Services</option>
                <option value="IT Services">IT Services</option>
                <option value="Administrative Services">Administrative Services</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Deskripsi Layanan</label>
              <textarea
                value={formData.service_description}
                onChange={(e) => setFormData({ ...formData, service_description: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Periode Mulai</label>
                <input
                  type="date"
                  value={formData.service_period_start}
                  onChange={(e) => setFormData({ ...formData, service_period_start: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Periode Selesai</label>
                <input
                  type="date"
                  value={formData.service_period_end}
                  onChange={(e) => setFormData({ ...formData, service_period_end: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Waktu Respons (menit)</label>
                <input
                  type="number"
                  value={formData.response_time}
                  onChange={(e) => setFormData({ ...formData, response_time: Number(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Waktu Resolusi (jam)</label>
                <input
                  type="number"
                  value={formData.resolution_time}
                  onChange={(e) => setFormData({ ...formData, resolution_time: Number(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Ketersediaan (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.availability_percentage}
                  onChange={(e) => setFormData({ ...formData, availability_percentage: Number(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Klausul Penalti</label>
              <textarea
                value={formData.penalty_clause}
                onChange={(e) => setFormData({ ...formData, penalty_clause: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Jumlah Penalti (Rp)</label>
                <input
                  type="number"
                  value={formData.penalty_amount}
                  onChange={(e) => setFormData({ ...formData, penalty_amount: Number(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Catatan</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                rows={2}
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Simpan SLA
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Daftar Dokumen SLA</h2>
        {documents.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Belum ada dokumen SLA</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Nomor SLA</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Klien</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Jenis Layanan</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Periode</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{doc.sla_number}</td>
                    <td className="px-4 py-3 text-sm">{doc.client_name}</td>
                    <td className="px-4 py-3 text-sm">{doc.service_type}</td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(doc.service_period_start).toLocaleDateString('id-ID')} - {new Date(doc.service_period_end).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        doc.status === 'active' ? 'bg-green-100 text-green-800' :
                        doc.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                        doc.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => generatePDF(doc)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                      >
                        Generate PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
