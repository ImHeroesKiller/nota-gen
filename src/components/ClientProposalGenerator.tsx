import { useState } from 'react';
import { jsPDF } from 'jspdf';
import { ClientProposal, CreateClientProposalDTO } from '../types/suite1-human-capital';

export default function ClientProposalGenerator() {
  const [formData, setFormData] = useState<CreateClientProposalDTO>({
    proposal_number: `PROP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
    client_name: '',
    proposal_date: new Date().toISOString().split('T')[0],
    valid_until: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
    proposal_title: '',
    proposal_description: '',
    service_type: '',
    total_manpower: 1,
    manpower_cost: 0,
    operational_cost: 0,
    management_fee: 0,
    total_cost: 0,
    notes: '',
  });

  const [proposals, setProposals] = useState<ClientProposal[]>([]);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const now = new Date().toISOString();
    const newProposal: ClientProposal = {
      id: proposals.length + 1,
      proposal_number: formData.proposal_number,
      client_name: formData.client_name,
      proposal_date: formData.proposal_date,
      valid_until: formData.valid_until,
      proposal_title: formData.proposal_title,
      proposal_description: formData.proposal_description,
      service_type: formData.service_type,
      total_manpower: formData.total_manpower,
      manpower_cost: formData.manpower_cost,
      operational_cost: formData.operational_cost,
      management_fee: formData.management_fee,
      total_cost: formData.total_cost,
      status: 'draft',
      notes: formData.notes,
      created_at: now,
      updated_at: now,
    };

    setProposals([...proposals, newProposal]);
    setShowForm(false);
    
    // Reset form
    setFormData({
      proposal_number: `PROP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      client_name: '',
      proposal_date: new Date().toISOString().split('T')[0],
      valid_until: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
      proposal_title: '',
      proposal_description: '',
      service_type: '',
      total_manpower: 1,
      manpower_cost: 0,
      operational_cost: 0,
      management_fee: 0,
      total_cost: 0,
      notes: '',
    });
  };

  const generatePDF = (proposal: ClientProposal) => {
    const pdf = new jsPDF();
    
    // Header
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PROPOSAL OUTSOURCING', 105, 20, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Nomor: ${proposal.proposal_number}`, 105, 30, { align: 'center' });
    
    // Client Info
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Informasi Klien', 20, 50);
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Nama Klien: ${proposal.client_name}`, 20, 60);
    pdf.text(`Tanggal Proposal: ${new Date(proposal.proposal_date).toLocaleDateString('id-ID')}`, 20, 70);
    pdf.text(`Berlaku Hingga: ${new Date(proposal.valid_until).toLocaleDateString('id-ID')}`, 20, 80);
    
    // Proposal Details
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Detail Proposal', 20, 100);
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Judul: ${proposal.proposal_title}`, 20, 110);
    
    const splitDescription = pdf.splitTextToSize(proposal.proposal_description, 170);
    pdf.text(splitDescription, 20, 120);
    
    let yPos = 120 + (splitDescription.length * 6) + 10;
    
    if (proposal.service_type) {
      pdf.text(`Jenis Layanan: ${proposal.service_type}`, 20, yPos);
      yPos += 10;
    }
    
    // Manpower
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Kebutuhan Tenaga Kerja', 20, yPos);
    yPos += 10;
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Total Tenaga Kerja: ${proposal.total_manpower} orang`, 20, yPos);
    yPos += 15;
    
    // Cost Breakdown
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Rincian Biaya', 20, yPos);
    yPos += 10;
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Biaya Tenaga Kerja: Rp ${proposal.manpower_cost.toLocaleString('id-ID')}`, 20, yPos);
    yPos += 7;
    pdf.text(`Biaya Operasional: Rp ${proposal.operational_cost.toLocaleString('id-ID')}`, 20, yPos);
    yPos += 7;
    pdf.text(`Management Fee: Rp ${proposal.management_fee.toLocaleString('id-ID')}`, 20, yPos);
    yPos += 10;
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Total Biaya: Rp ${proposal.total_cost.toLocaleString('id-ID')}`, 20, yPos);
    yPos += 15;
    
    // Notes
    if (proposal.notes) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Catatan', 20, yPos);
      yPos += 10;
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      const splitNotes = pdf.splitTextToSize(proposal.notes, 170);
      pdf.text(splitNotes, 20, yPos);
    }
    
    // Footer
    pdf.setFontSize(9);
    pdf.text(`Dokumen ini dibuat pada ${new Date().toLocaleDateString('id-ID')}`, 105, 280, { align: 'center' });
    pdf.text('PT Perdana Adi Yuda - PERADA GROUP', 105, 285, { align: 'center' });
    
    // Save PDF
    pdf.save(`${proposal.proposal_number}.pdf`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Client Proposal Generator</h1>
        <p className="text-gray-600">Generator proposal outsourcing untuk klien</p>
      </div>

      <div className="mb-4">
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showForm ? 'Batal' : '+ Buat Proposal Baru'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Form Proposal</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nomor Proposal</label>
                <input
                  type="text"
                  value={formData.proposal_number}
                  onChange={(e) => setFormData({ ...formData, proposal_number: e.target.value })}
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tanggal Proposal</label>
                <input
                  type="date"
                  value={formData.proposal_date}
                  onChange={(e) => setFormData({ ...formData, proposal_date: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Berlaku Hingga</label>
                <input
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Judul Proposal</label>
              <input
                type="text"
                value={formData.proposal_title}
                onChange={(e) => setFormData({ ...formData, proposal_title: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Deskripsi Proposal</label>
              <textarea
                value={formData.proposal_description}
                onChange={(e) => setFormData({ ...formData, proposal_description: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Jenis Layanan</label>
              <select
                value={formData.service_type}
                onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
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
              <label className="block text-sm font-medium mb-2">Total Tenaga Kerja</label>
              <input
                type="number"
                value={formData.total_manpower}
                onChange={(e) => setFormData({ ...formData, total_manpower: Number(e.target.value) })}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Biaya Tenaga Kerja (Rp)</label>
                <input
                  type="number"
                  value={formData.manpower_cost}
                  onChange={(e) => setFormData({ ...formData, manpower_cost: Number(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Biaya Operasional (Rp)</label>
                <input
                  type="number"
                  value={formData.operational_cost}
                  onChange={(e) => setFormData({ ...formData, operational_cost: Number(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Management Fee (Rp)</label>
                <input
                  type="number"
                  value={formData.management_fee}
                  onChange={(e) => setFormData({ ...formData, management_fee: Number(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Total Biaya (Rp)</label>
              <input
                type="number"
                value={formData.total_cost}
                onChange={(e) => setFormData({ ...formData, total_cost: Number(e.target.value) })}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
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
                Simpan Proposal
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
        <h2 className="text-xl font-bold mb-4">Daftar Proposal</h2>
        {proposals.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Belum ada proposal</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Nomor</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Klien</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Judul</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Total Biaya</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {proposals.map((proposal) => (
                  <tr key={proposal.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{proposal.proposal_number}</td>
                    <td className="px-4 py-3 text-sm">{proposal.client_name}</td>
                    <td className="px-4 py-3 text-sm">{proposal.proposal_title}</td>
                    <td className="px-4 py-3 text-sm">Rp {proposal.total_cost.toLocaleString('id-ID')}</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        proposal.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        proposal.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                        proposal.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                        proposal.status === 'negotiated' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {proposal.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => generatePDF(proposal)}
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
