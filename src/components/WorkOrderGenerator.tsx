import { useState } from 'react';
import { jsPDF } from 'jspdf';
import { WorkOrder, CreateWorkOrderDTO } from '../types/suite1-human-capital';

export default function WorkOrderGenerator() {
  const [formData, setFormData] = useState<CreateWorkOrderDTO>({
    wo_number: `WO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
    client_name: '',
    wo_date: new Date().toISOString().split('T')[0],
    work_title: '',
    work_description: '',
    work_type: '',
    required_manpower: 1,
    required_skills: '',
    start_date: '',
    end_date: '',
    estimated_hours: 0,
    hourly_rate: 0,
    total_cost: 0,
    notes: '',
  });

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const now = new Date().toISOString();
    const newWO: WorkOrder = {
      id: workOrders.length + 1,
      wo_number: formData.wo_number,
      client_name: formData.client_name,
      wo_date: formData.wo_date,
      work_title: formData.work_title,
      work_description: formData.work_description,
      work_type: formData.work_type,
      required_manpower: formData.required_manpower,
      required_skills: formData.required_skills,
      start_date: formData.start_date,
      end_date: formData.end_date,
      estimated_hours: formData.estimated_hours,
      hourly_rate: formData.hourly_rate,
      total_cost: formData.total_cost,
      status: 'pending',
      notes: formData.notes,
      created_at: now,
      updated_at: now,
    };

    setWorkOrders([...workOrders, newWO]);
    setShowForm(false);
    
    // Reset form
    setFormData({
      wo_number: `WO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      client_name: '',
      wo_date: new Date().toISOString().split('T')[0],
      work_title: '',
      work_description: '',
      work_type: '',
      required_manpower: 1,
      required_skills: '',
      start_date: '',
      end_date: '',
      estimated_hours: 0,
      hourly_rate: 0,
      total_cost: 0,
      notes: '',
    });
  };

  const generatePDF = (wo: WorkOrder) => {
    const pdf = new jsPDF();
    
    // Header
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('WORK ORDER', 105, 20, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Nomor: ${wo.wo_number}`, 105, 30, { align: 'center' });
    
    // Client Info
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Informasi Klien', 20, 50);
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Nama Klien: ${wo.client_name}`, 20, 60);
    pdf.text(`Tanggal WO: ${new Date(wo.wo_date).toLocaleDateString('id-ID')}`, 20, 70);
    
    // Work Details
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Detail Pekerjaan', 20, 90);
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Judul: ${wo.work_title}`, 20, 100);
    
    const splitDescription = pdf.splitTextToSize(wo.work_description, 170);
    pdf.text(splitDescription, 20, 110);
    
    let yPos = 110 + (splitDescription.length * 6) + 10;
    
    if (wo.work_type) {
      pdf.text(`Jenis Pekerjaan: ${wo.work_type}`, 20, yPos);
      yPos += 10;
    }
    
    // Resource Requirements
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Kebutuhan Sumber Daya', 20, yPos);
    yPos += 10;
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Jumlah Tenaga Kerja: ${wo.required_manpower} orang`, 20, yPos);
    yPos += 7;
    
    if (wo.required_skills) {
      const splitSkills = pdf.splitTextToSize(`Keahlian yang Dibutuhkan: ${wo.required_skills}`, 170);
      pdf.text(splitSkills, 20, yPos);
      yPos += (splitSkills.length * 6) + 5;
    }
    
    // Timeline
    if (wo.start_date || wo.end_date || wo.estimated_hours) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Timeline', 20, yPos);
      yPos += 10;
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      if (wo.start_date) {
        pdf.text(`Tanggal Mulai: ${new Date(wo.start_date).toLocaleDateString('id-ID')}`, 20, yPos);
        yPos += 7;
      }
      if (wo.end_date) {
        pdf.text(`Tanggal Selesai: ${new Date(wo.end_date).toLocaleDateString('id-ID')}`, 20, yPos);
        yPos += 7;
      }
      if (wo.estimated_hours) {
        pdf.text(`Estimasi Jam Kerja: ${wo.estimated_hours} jam`, 20, yPos);
        yPos += 10;
      }
    }
    
    // Cost
    if (wo.hourly_rate || wo.total_cost) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Biaya', 20, yPos);
      yPos += 10;
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      if (wo.hourly_rate) {
        pdf.text(`Tarif per Jam: Rp ${wo.hourly_rate.toLocaleString('id-ID')}`, 20, yPos);
        yPos += 7;
      }
      if (wo.total_cost) {
        pdf.text(`Total Biaya: Rp ${wo.total_cost.toLocaleString('id-ID')}`, 20, yPos);
        yPos += 10;
      }
    }
    
    // Notes
    if (wo.notes) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Catatan', 20, yPos);
      yPos += 10;
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      const splitNotes = pdf.splitTextToSize(wo.notes, 170);
      pdf.text(splitNotes, 20, yPos);
    }
    
    // Footer
    pdf.setFontSize(9);
    pdf.text(`Dokumen ini dibuat pada ${new Date().toLocaleDateString('id-ID')}`, 105, 280, { align: 'center' });
    pdf.text('PT Perdana Adi Yuda - PERADA GROUP', 105, 285, { align: 'center' });
    
    // Save PDF
    pdf.save(`${wo.wo_number}.pdf`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Work Order Generator</h1>
        <p className="text-gray-600">Generator work order untuk klien outsourcing</p>
      </div>

      <div className="mb-4">
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showForm ? 'Batal' : '+ Buat Work Order Baru'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Form Work Order</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nomor WO</label>
                <input
                  type="text"
                  value={formData.wo_number}
                  onChange={(e) => setFormData({ ...formData, wo_number: e.target.value })}
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
              <label className="block text-sm font-medium mb-2">Tanggal WO</label>
              <input
                type="date"
                value={formData.wo_date}
                onChange={(e) => setFormData({ ...formData, wo_date: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Judul Pekerjaan</label>
              <input
                type="text"
                value={formData.work_title}
                onChange={(e) => setFormData({ ...formData, work_title: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Deskripsi Pekerjaan</label>
              <textarea
                value={formData.work_description}
                onChange={(e) => setFormData({ ...formData, work_description: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Jenis Pekerjaan</label>
                <select
                  value={formData.work_type}
                  onChange={(e) => setFormData({ ...formData, work_type: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">Pilih Jenis</option>
                  <option value="event">Event</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="security">Security</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="other">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Jumlah Tenaga Kerja</label>
                <input
                  type="number"
                  value={formData.required_manpower}
                  onChange={(e) => setFormData({ ...formData, required_manpower: Number(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Keahlian yang Dibutuhkan</label>
              <textarea
                value={formData.required_skills}
                onChange={(e) => setFormData({ ...formData, required_skills: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tanggal Mulai</label>
                <input
                  type="date"
                  value={formData.start_date || ''}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tanggal Selesai</label>
                <input
                  type="date"
                  value={formData.end_date || ''}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Estimasi Jam</label>
                <input
                  type="number"
                  value={formData.estimated_hours}
                  onChange={(e) => setFormData({ ...formData, estimated_hours: Number(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tarif per Jam (Rp)</label>
                <input
                  type="number"
                  value={formData.hourly_rate}
                  onChange={(e) => setFormData({ ...formData, hourly_rate: Number(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Total Biaya (Rp)</label>
                <input
                  type="number"
                  value={formData.total_cost}
                  onChange={(e) => setFormData({ ...formData, total_cost: Number(e.target.value) })}
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
                Simpan Work Order
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
        <h2 className="text-xl font-bold mb-4">Daftar Work Order</h2>
        {workOrders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Belum ada work order</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Nomor WO</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Klien</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Judul</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Tanggal</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {workOrders.map((wo) => (
                  <tr key={wo.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{wo.wo_number}</td>
                    <td className="px-4 py-3 text-sm">{wo.client_name}</td>
                    <td className="px-4 py-3 text-sm">{wo.work_title}</td>
                    <td className="px-4 py-3 text-sm">{new Date(wo.wo_date).toLocaleDateString('id-ID')}</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        wo.status === 'approved' ? 'bg-green-100 text-green-800' :
                        wo.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        wo.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        wo.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {wo.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => generatePDF(wo)}
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
