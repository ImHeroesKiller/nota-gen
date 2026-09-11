import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Car,
  CheckCircle,
  ClipboardCheck,
  Moon,
  Plus,
  Sun,
  Trash2,
} from 'lucide-react';

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

const makeId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const today = () => new Date().toISOString().split('T')[0];

const emptyForm = () => ({
  vehiclePlate: '',
  vehicleType: '',
  driverName: '',
  inspectionDate: today(),
  mileage: 0,
  inspectorName: '',
  notes: '',
});

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

  const [formData, setFormData] = useState(emptyForm);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bg = darkMode ? 'bg-[#0b1220]' : 'bg-[#f6f8fb]';
  const surface = darkMode ? 'bg-[#111827]' : 'bg-white';
  const surfaceMuted = darkMode ? 'bg-[#172033]' : 'bg-[#f8fafc]';
  const border = darkMode ? 'border-[#273449]' : 'border-[#e5eaf1]';
  const text = darkMode ? 'text-[#e5edf8]' : 'text-[#0f172a]';
  const muted = darkMode ? 'text-[#92a3ba]' : 'text-[#64748b]';
  const input = darkMode
    ? 'bg-[#0b1220] border-[#334155] text-[#e5edf8]'
    : 'bg-white border-[#dbe3ee] text-[#0f172a]';
  const hover = darkMode ? 'hover:bg-[#172033]' : 'hover:bg-[#f8fafc]';

  const categories = useMemo(() => Array.from(new Set(items.map((item) => item.category))), [items]);
  const checklistComplete = items.length > 0 && items.every((item) => item.status !== 'na');
  const failedWithoutNotes = items.some((item) => item.status === 'fail' && !item.notes.trim());
  const formReady = Boolean(
    formData.vehiclePlate.trim()
      && formData.vehicleType.trim()
      && formData.driverName.trim()
      && formData.inspectorName.trim()
      && formData.inspectionDate
      && Number.isFinite(formData.mileage)
      && formData.mileage >= 0,
  );

  const stats = useMemo(() => ({
    total: inspections.length,
    pass: inspections.filter((item) => item.overallStatus === 'pass').length,
    conditional: inspections.filter((item) => item.overallStatus === 'conditional').length,
    fail: inspections.filter((item) => item.overallStatus === 'fail').length,
  }), [inspections]);

  const resetForm = () => {
    setFormData(emptyForm());
    setItems([]);
    setError(null);
    setShowForm(false);
  };

  const handleStartInspection = () => {
    setError(null);
    if (!formReady) {
      setError('Lengkapi data kendaraan, driver, inspector, tanggal, dan kilometer sebelum memulai inspeksi.');
      return;
    }

    setItems(defaultChecklistItems.map((item) => ({
      id: makeId(),
      ...item,
      status: 'na',
      notes: '',
    })));
  };

  const handleUpdateItem = (id: string, field: 'status' | 'notes', value: ChecklistItem['status'] | string) => {
    setItems((previous) => previous.map((item) => {
      if (item.id !== id) return item;
      if (field === 'status') return { ...item, status: value as ChecklistItem['status'] };
      return { ...item, notes: String(value) };
    }));
    setError(null);
  };

  const handleSubmit = () => {
    setError(null);
    if (!formReady) {
      setError('Data inspeksi belum lengkap.');
      return;
    }
    if (!checklistComplete) {
      setError('Semua item checklist harus diberi status Pass atau Fail sebelum disubmit.');
      return;
    }
    if (failedWithoutNotes) {
      setError('Setiap item Fail wajib memiliki catatan temuan.');
      return;
    }

    const failCount = items.filter((item) => item.status === 'fail').length;
    const overallStatus: VehicleInspection['overallStatus'] = failCount === 0
      ? 'pass'
      : failCount >= 3
        ? 'fail'
        : 'conditional';

    const newInspection: VehicleInspection = {
      id: makeId(),
      ...formData,
      vehiclePlate: formData.vehiclePlate.trim().toUpperCase(),
      vehicleType: formData.vehicleType.trim(),
      driverName: formData.driverName.trim(),
      inspectorName: formData.inspectorName.trim(),
      notes: formData.notes.trim(),
      items: items.map((item) => ({ ...item, notes: item.notes.trim() })),
      overallStatus,
    };

    setInspections((previous) => [newInspection, ...previous]);
    resetForm();
  };

  const handleDelete = (id: string) => {
    const inspection = inspections.find((item) => item.id === id);
    if (!inspection) return;
    if (!window.confirm(`Hapus inspeksi ${inspection.vehiclePlate} tanggal ${formatDate(inspection.inspectionDate)}?`)) return;
    setInspections((previous) => previous.filter((item) => item.id !== id));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(`${dateStr}T00:00:00`);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const statusLabel = (status: VehicleInspection['overallStatus']) => {
    if (status === 'pass') return 'Lulus';
    if (status === 'fail') return 'Gagal';
    return 'Kondisional';
  };

  const statusClass = (status: VehicleInspection['overallStatus']) => {
    if (status === 'pass') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300';
    if (status === 'fail') return 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300';
    return 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300';
  };

  return (
    <div className={`min-h-full ${bg} ${text}`}>
      <header className={`sticky top-0 z-20 flex items-center justify-between gap-3 px-4 py-3 border-b ${surface} ${border}`}>
        <div className="flex items-center gap-3 min-w-0">
          <button type="button" onClick={onBack} className={`w-9 h-9 rounded-lg inline-flex items-center justify-center ${hover}`} aria-label="Kembali">
            <ArrowLeft size={18} />
          </button>
          <div className="w-9 h-9 rounded-lg bg-[#2563eb]/10 text-[#2563eb] inline-flex items-center justify-center shrink-0">
            <Car size={20} />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold truncate">Vehicle Checklist</h1>
            <p className={`text-[11px] ${muted} truncate`}>Inspeksi kendaraan harian dengan validasi checklist lengkap</p>
          </div>
        </div>
        <button type="button" onClick={() => setDarkMode(!darkMode)} className={`w-9 h-9 rounded-lg inline-flex items-center justify-center ${hover}`} aria-label="Ubah tema">
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-5">
        <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className={`text-[10px] font-bold tracking-[0.12em] uppercase ${muted}`}>Fleet Management</p>
            <h2 className="text-2xl font-semibold mt-1">Inspeksi Kendaraan</h2>
            <p className={`text-sm mt-1 ${muted}`}>Checklist wajib lengkap sebelum hasil inspeksi dapat disimpan.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (showForm) resetForm();
              else {
                setShowForm(true);
                setError(null);
              }
            }}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1d4ed8]"
          >
            <Plus size={16} /> {showForm ? 'Batal Inspeksi' : 'Inspeksi Baru'}
          </button>
        </section>

        <section className={`grid grid-cols-2 lg:grid-cols-4 gap-2 rounded-xl border p-3 ${surface} ${border}`}>
          {[
            ['Total', stats.total, 'text-[#2563eb]'],
            ['Lulus', stats.pass, 'text-emerald-600'],
            ['Kondisional', stats.conditional, 'text-amber-600'],
            ['Gagal', stats.fail, 'text-red-600'],
          ].map(([label, value, valueClass]) => (
            <div key={String(label)} className={`rounded-lg px-3 py-2.5 ${surfaceMuted}`}>
              <p className={`text-[10px] uppercase tracking-wide ${muted}`}>{label}</p>
              <p className={`text-lg font-semibold mt-0.5 ${valueClass}`}>{value}</p>
            </div>
          ))}
        </section>

        {showForm && (
          <section className={`rounded-2xl border ${surface} ${border} overflow-hidden`}>
            <div className={`px-4 md:px-5 py-4 border-b ${border}`}>
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-lg bg-[#2563eb]/10 text-[#2563eb] inline-flex items-center justify-center"><ClipboardCheck size={18} /></span>
                <div>
                  <h3 className="text-sm font-semibold">Form Inspeksi</h3>
                  <p className={`text-[11px] ${muted}`}>Isi identitas kendaraan lalu mulai checklist.</p>
                </div>
              </div>
            </div>

            <div className="p-4 md:p-5 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <label className="text-xs font-medium">Plat Nomor *
                  <input value={formData.vehiclePlate} onChange={(e) => setFormData({ ...formData, vehiclePlate: e.target.value })} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm ${input}`} placeholder="B 1234 ABC" />
                </label>
                <label className="text-xs font-medium">Jenis Kendaraan *
                  <input value={formData.vehicleType} onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm ${input}`} placeholder="Toyota Avanza" />
                </label>
                <label className="text-xs font-medium">Nama Driver *
                  <input value={formData.driverName} onChange={(e) => setFormData({ ...formData, driverName: e.target.value })} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm ${input}`} placeholder="Nama driver" />
                </label>
                <label className="text-xs font-medium">Tanggal Inspeksi *
                  <input type="date" value={formData.inspectionDate} onChange={(e) => setFormData({ ...formData, inspectionDate: e.target.value })} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm ${input}`} />
                </label>
                <label className="text-xs font-medium">Kilometer *
                  <input type="number" min={0} value={formData.mileage} onChange={(e) => setFormData({ ...formData, mileage: Math.max(0, Number(e.target.value) || 0) })} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm ${input}`} />
                </label>
                <label className="text-xs font-medium">Nama Inspector *
                  <input value={formData.inspectorName} onChange={(e) => setFormData({ ...formData, inspectorName: e.target.value })} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm ${input}`} placeholder="Nama inspector" />
                </label>
                <label className="text-xs font-medium md:col-span-2 lg:col-span-3">Catatan Umum
                  <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm resize-y ${input}`} placeholder="Catatan tambahan" />
                </label>
              </div>

              {items.length === 0 ? (
                <button type="button" onClick={handleStartInspection} disabled={!formReady} className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed">
                  Mulai Checklist
                </button>
              ) : (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-semibold">Checklist Inspeksi</h4>
                      <p className={`text-[11px] mt-0.5 ${muted}`}>{items.filter((item) => item.status !== 'na').length}/{items.length} item sudah diperiksa.</p>
                    </div>
                    <div className="h-2 w-40 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                      <div className="h-full bg-[#2563eb] transition-all" style={{ width: `${(items.filter((item) => item.status !== 'na').length / items.length) * 100}%` }} />
                    </div>
                  </div>

                  {categories.map((category) => (
                    <div key={category}>
                      <p className="text-xs font-semibold text-[#2563eb] mb-2">{category}</p>
                      <div className="space-y-2">
                        {items.filter((item) => item.category === category).map((item) => (
                          <div key={item.id} className={`grid grid-cols-1 lg:grid-cols-[minmax(160px,1fr)_180px_minmax(180px,1.3fr)] gap-3 items-center rounded-xl border p-3 ${border} ${surfaceMuted}`}>
                            <div>
                              <p className="text-xs font-semibold">{item.component}</p>
                              <p className={`text-[10px] mt-0.5 ${muted}`}>{item.status === 'na' ? 'Belum diperiksa' : item.status === 'pass' ? 'Kondisi sesuai' : 'Perlu tindak lanjut'}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-1.5">
                              <button type="button" onClick={() => handleUpdateItem(item.id, 'status', 'pass')} className={`rounded-lg border px-3 py-2 text-xs font-semibold ${item.status === 'pass' ? 'border-emerald-600 bg-emerald-600 text-white' : `${border} ${surface}`}`}>Pass</button>
                              <button type="button" onClick={() => handleUpdateItem(item.id, 'status', 'fail')} className={`rounded-lg border px-3 py-2 text-xs font-semibold ${item.status === 'fail' ? 'border-red-600 bg-red-600 text-white' : `${border} ${surface}`}`}>Fail</button>
                            </div>
                            <input value={item.notes} onChange={(e) => handleUpdateItem(item.id, 'notes', e.target.value)} className={`w-full rounded-lg border px-3 py-2 text-xs ${input} ${item.status === 'fail' && !item.notes.trim() ? 'border-red-400' : ''}`} placeholder={item.status === 'fail' ? 'Catatan wajib untuk item Fail' : 'Catatan opsional'} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button type="button" onClick={handleSubmit} disabled={!checklistComplete || failedWithoutNotes} className="rounded-lg bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-40 disabled:cursor-not-allowed">
                      Submit Inspeksi
                    </button>
                    <span className={`text-[11px] ${muted}`}>
                      {!checklistComplete ? 'Lengkapi semua status checklist.' : failedWithoutNotes ? 'Tambahkan catatan pada seluruh item Fail.' : 'Checklist siap disimpan.'}
                    </span>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                  <AlertTriangle size={17} className="shrink-0 mt-0.5" />
                  <p className="text-xs leading-5">{error}</p>
                </div>
              )}
            </div>
          </section>
        )}

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold">Riwayat Inspeksi</h3>
              <p className={`text-[11px] mt-0.5 ${muted}`}>Hasil inspeksi tersimpan di sesi aplikasi saat ini.</p>
            </div>
          </div>

          {inspections.length === 0 ? (
            <div className={`rounded-xl border border-dashed p-10 text-center ${surface} ${border}`}>
              <Car size={28} className={`mx-auto ${muted}`} />
              <p className="text-sm font-semibold mt-3">Belum ada inspeksi kendaraan</p>
            </div>
          ) : inspections.map((inspection) => {
            const passItems = inspection.items.filter((item) => item.status === 'pass').length;
            const failItems = inspection.items.filter((item) => item.status === 'fail').length;
            const pendingItems = inspection.items.filter((item) => item.status === 'na').length;
            return (
              <article key={inspection.id} className={`rounded-2xl border p-4 md:p-5 ${surface} ${border}`}>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-semibold">{inspection.vehiclePlate} · {inspection.vehicleType}</h4>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${statusClass(inspection.overallStatus)}`}>{statusLabel(inspection.overallStatus)}</span>
                    </div>
                    <p className={`text-xs mt-1 ${muted}`}>Driver {inspection.driverName} · {formatDate(inspection.inspectionDate)} · {inspection.mileage.toLocaleString('id-ID')} km</p>
                    <p className={`text-[11px] mt-1 ${muted}`}>Inspector: {inspection.inspectorName || '-'}</p>
                  </div>
                  <button type="button" onClick={() => handleDelete(inspection.id)} className="w-9 h-9 rounded-lg inline-flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30" aria-label="Hapus inspeksi"><Trash2 size={16} /></button>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className={`rounded-lg px-3 py-2 ${surfaceMuted}`}><p className={`text-[10px] ${muted}`}>Pass</p><p className="text-sm font-semibold text-emerald-600 mt-0.5">{passItems}</p></div>
                  <div className={`rounded-lg px-3 py-2 ${surfaceMuted}`}><p className={`text-[10px] ${muted}`}>Fail</p><p className="text-sm font-semibold text-red-600 mt-0.5">{failItems}</p></div>
                  <div className={`rounded-lg px-3 py-2 ${surfaceMuted}`}><p className={`text-[10px] ${muted}`}>Belum Dinilai</p><p className="text-sm font-semibold mt-0.5">{pendingItems}</p></div>
                </div>

                {failItems > 0 && (
                  <div className="mt-4 space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-red-600">Temuan</p>
                    {inspection.items.filter((item) => item.status === 'fail').map((item) => (
                      <div key={item.id} className={`flex items-start gap-2 rounded-lg px-3 py-2 text-xs ${surfaceMuted}`}>
                        <AlertTriangle size={14} className="text-red-500 shrink-0 mt-0.5" />
                        <span><strong>{item.component}:</strong> {item.notes || 'Tidak ada catatan'}</span>
                      </div>
                    ))}
                  </div>
                )}

                {inspection.notes && (
                  <div className={`mt-4 rounded-lg px-3 py-2.5 ${surfaceMuted}`}>
                    <p className={`text-[10px] uppercase tracking-wide ${muted}`}>Catatan Inspector</p>
                    <p className="text-xs mt-1">{inspection.notes}</p>
                  </div>
                )}

                {inspection.overallStatus === 'pass' && (
                  <div className="mt-4 flex items-center gap-2 text-xs text-emerald-600"><CheckCircle size={15} /> Kendaraan dinyatakan lulus inspeksi.</div>
                )}
              </article>
            );
          })}
        </section>
      </main>
    </div>
  );
}
