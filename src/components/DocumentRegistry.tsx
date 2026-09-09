import { useState, useEffect, useCallback } from 'react';
import { cloudflareConnector, DocumentRecord, WORKER_CODE_TEMPLATE, D1_SCHEMA } from '../utils/cloudflareConnector';

interface DocumentRegistryProps {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

const DOC_TYPES = [
  { value: 'surat', label: 'Surat', prefix: 'SURAT' },
  { value: 'invoice', label: 'Invoice', prefix: 'INV' },
  { value: 'po', label: 'Purchase Order', prefix: 'PO' },
  { value: 'do', label: 'Delivery Order', prefix: 'DO' },
  { value: 'bl', label: 'Bill of Lading', prefix: 'B/L' },
  { value: 'kwitansi', label: 'Kwitansi', prefix: 'KWT' },
  { value: 'kontrak', label: 'Kontrak', prefix: 'KTR' },
  { value: 'berita_acara', label: 'Berita Acara', prefix: 'BA' },
  { value: 'lainnya', label: 'Lainnya', prefix: 'DOC' },
];

export default function DocumentRegistry({ onBack, darkMode, setDarkMode }: DocumentRegistryProps) {
  const [config, setConfig] = useState({ workerUrl: '', apiKey: '' });
  const [isConfigured, setIsConfigured] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentRecord | null>(null);
  const [viewingDoc, setViewingDoc] = useState<DocumentRecord | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showWorkerCode, setShowWorkerCode] = useState(false);
  const [showWorkerCodeModal, setShowWorkerCodeModal] = useState(false);
  const [formData, setFormData] = useState({
    doc_number: '',
    doc_type: 'surat',
    title: '',
    description: '',
    reference: '',
  });

  const bg = darkMode ? 'bg-[#0f1419]' : 'bg-[#f8f9fb]';
  const sidebarBg = darkMode ? 'bg-[#161b22]' : 'bg-white';
  const borderColor = darkMode ? 'border-[#21262d]' : 'border-[#e2e5e9]';
  const cardBg = darkMode ? 'bg-[#1c2128]' : 'bg-[#f3f4f6]';
  const textPrimary = darkMode ? 'text-[#e6edf3]' : 'text-[#1a1a2e]';
  const textSecondary = darkMode ? 'text-[#8b949e]' : 'text-[#57606a]';
  const inputBg = darkMode ? 'bg-[#0d1117] border-[#30363d]' : 'bg-white border-[#d0d7de]';
  const hoverBg = darkMode ? 'hover:bg-[#21262d]' : 'hover:bg-[#f0f1f3]';

  useEffect(() => {
    const savedConfig = cloudflareConnector.getConfig();
    if (savedConfig) {
      setConfig(savedConfig);
      setIsConfigured(true);
    }
  }, []);

  useEffect(() => {
    if (isConfigured) {
      loadDocuments();
    }
  }, [isConfigured]);

  const loadDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const docs = await cloudflareConnector.getDocuments();
      setDocuments(docs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat dokumen');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSaveConfig = () => {
    if (!config.workerUrl || !config.apiKey) {
      setError('Worker URL dan API Key wajib diisi');
      return;
    }
    
    // Bersihkan dan validasi URL
    let cleanUrl = config.workerUrl.trim().replace(/\/+$/, '');
    
    // Auto-add https:// jika tidak ada protocol
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }
    
    const cleanConfig = {
      workerUrl: cleanUrl,
      apiKey: config.apiKey.trim(),
    };
    
    cloudflareConnector.saveConfig(cleanConfig);
    setIsConfigured(true);
    setShowSetup(false);
    setError(null);
    setSuccessMsg(`✓ Konfigurasi berhasil disimpan!\nWorker URL: ${cleanConfig.workerUrl}`);
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  const handleSetup = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await cloudflareConnector.setup();
      setSuccessMsg('Database berhasil diinisialisasi!');
      setTimeout(() => setSuccessMsg(null), 3000);
      loadDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal setup database');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const config = cloudflareConnector.getConfig();
      if (!config) {
        throw new Error('Konfigurasi belum disimpan');
      }
      
      // Bersihkan URL - hapus trailing slash dan spasi
      const cleanUrl = config.workerUrl.trim().replace(/\/+$/, '');
      
      // Test endpoint tidak perlu API key
      const testUrl = `${cleanUrl}/test`;
      
      console.log('Testing URL:', testUrl);
      
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      const responseText = await response.text();
      
      console.log('Response status:', response.status);
      console.log('Response text:', responseText);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${responseText.substring(0, 200)}\n\nURL yang di-request: ${testUrl}\n\nPastikan URL Worker benar dan Worker sudah di-deploy.`);
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(`Response bukan JSON: "${responseText.substring(0, 100)}..."\n\nURL: ${testUrl}`);
      }
      
      // Check status Worker
      const issues = [];
      if (data.hasDB === false) {
        issues.push('D1 database belum di-bind (hasDB: false)');
      }
      if (data.hasR2 === false) {
        issues.push('R2 bucket belum di-bind (hasR2: false) - Upload file tidak akan berfungsi');
      }
      if (data.hasAPIKey === false) {
        issues.push('Environment variable API_KEY belum di-set (hasAPIKey: false)');
      }
      
      if (issues.length > 0) {
        throw new Error(`Worker aktif tapi ada masalah:\n• ${issues.join('\n• ')}`);
      }
      
      setSuccessMsg(`✓ Worker aktif dan terkonfigurasi dengan benar!\nTimestamp: ${data.timestamp}`);
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal test koneksi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDebug = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const config = cloudflareConnector.getConfig();
      if (!config) {
        throw new Error('Konfigurasi belum disimpan');
      }
      
      const cleanUrl = config.workerUrl.trim().replace(/\/+$/, '');
      const debugUrl = `${cleanUrl}/debug`;
      
      const response = await fetch(debugUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      const responseText = await response.text();
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${responseText.substring(0, 300)}\n\nEndpoint /debug tidak ditemukan. Pastikan Worker sudah di-deploy dengan kode terbaru dari tombol "Kode Worker".`);
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(`Response bukan JSON: "${responseText.substring(0, 200)}..."`);
      }
      
      if (!data.success) {
        throw new Error(`Debug gagal: ${data.error || 'Unknown error'}`);
      }
      
      const debugData = data.data;
      const messages = [];
      
      messages.push(`✓ Timestamp: ${debugData.timestamp}`);
      messages.push(`${debugData.hasDB ? '✓' : '✗'} Database: ${debugData.hasDB ? 'OK' : 'NOT CONFIGURED'}`);
      messages.push(`${debugData.hasR2 ? '✓' : '✗'} R2 Storage: ${debugData.hasR2 ? 'OK' : 'NOT CONFIGURED'}`);
      messages.push(`${debugData.hasAPIKey ? '✓' : '✗'} API Key: ${debugData.hasAPIKey ? 'OK' : 'NOT SET'}`);
      
      if (debugData.dbTest) {
        messages.push(`${debugData.dbTest.success ? '✓' : '✗'} DB Test: ${debugData.dbTest.success ? 'Query OK' : debugData.dbTest.error}`);
      }
      
      if (debugData.r2Test) {
        messages.push(`${debugData.r2Test.success ? '✓' : '✗'} R2 Test: ${debugData.r2Test.success ? 'Read/Write OK' : debugData.r2Test.error}`);
      }
      
      setSuccessMsg(messages.join('\n'));
      setTimeout(() => setSuccessMsg(null), 10000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal debug');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateNumber = async () => {
    const typeInfo = DOC_TYPES.find(t => t.value === formData.doc_type);
    if (!typeInfo) return;
    try {
      const num = await cloudflareConnector.generateDocNumber(typeInfo.prefix, formData.doc_type);
      setFormData(f => ({ ...f, doc_number: num }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal generate nomor');
    }
  };

  const handleSubmit = async () => {
    if (!formData.doc_number || !formData.title) {
      setError('Nomor dokumen dan judul wajib diisi');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      if (editingDoc) {
        await cloudflareConnector.updateDocument(editingDoc.id!, formData);
        setSuccessMsg('Dokumen berhasil diupdate');
      } else {
        await cloudflareConnector.createDocument(formData);
        setSuccessMsg('Dokumen berhasil didaftarkan');
      }
      setTimeout(() => setSuccessMsg(null), 3000);
      setShowForm(false);
      setEditingDoc(null);
      setFormData({ doc_number: '', doc_type: 'surat', title: '', description: '', reference: '' });
      loadDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan dokumen');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (doc: DocumentRecord) => {
    setEditingDoc(doc);
    setFormData({
      doc_number: doc.doc_number,
      doc_type: doc.doc_type,
      title: doc.title,
      description: doc.description,
      reference: doc.reference,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus dokumen ini?')) return;
    setIsLoading(true);
    try {
      await cloudflareConnector.deleteDocument(id);
      setSuccessMsg('Dokumen berhasil dihapus');
      setTimeout(() => setSuccessMsg(null), 3000);
      loadDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus dokumen');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (docId: number, file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Hanya file PDF yang didukung');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Ukuran file maksimal 10MB');
      return;
    }
    
    setUploadingFile(true);
    setError(null);
    try {
      await cloudflareConnector.uploadFile(docId, file);
      setSuccessMsg('File berhasil diupload');
      setTimeout(() => setSuccessMsg(null), 3000);
      loadDocuments();
      
      // Update viewing doc if it's the same one
      if (viewingDoc && viewingDoc.id === docId) {
        const updated = await cloudflareConnector.getDocument(docId);
        if (updated) setViewingDoc(updated);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal upload file';
      setError(errorMsg + '\n\n💡 Solusi: Pastikan Worker sudah di-deploy ulang dengan kode terbaru dari tombol "Kode Worker"');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDownload = (doc: DocumentRecord) => {
    if (!doc.file_key) {
      setError('Dokumen ini belum memiliki file');
      return;
    }
    const url = cloudflareConnector.getDownloadUrl(doc.id!);
    window.open(url, '_blank');
  };

  const handleView = async (doc: DocumentRecord) => {
    setViewingDoc(doc);
  };

  const filteredDocs = documents.filter(doc => {
    const matchSearch = searchTerm === '' ||
      doc.doc_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'all' || doc.doc_type === filterType;
    return matchSearch && matchType;
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccessMsg('Berhasil disalin!');
    setTimeout(() => setSuccessMsg(null), 2000);
  };

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${bg} ${textPrimary}`}>
      {/* Header */}
      <header className={`flex items-center justify-between px-4 py-2.5 border-b shrink-0 ${sidebarBg} ${borderColor}`}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className={`w-7 h-7 rounded-lg flex items-center justify-center ${hoverBg}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shadow-sm">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight">Document Registry</h1>
            <p className={`text-[10px] ${textSecondary}`}>Register & kelola nomor dokumen/surat</p>
          </div>
          {isConfigured && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-medium">
              {documents.length} dokumen
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setShowWorkerCodeModal(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${hoverBg} ${textSecondary}`}>
            <svg className="w-3.5 h-3.5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
            Kode Worker
          </button>
          <button onClick={() => setShowSetup(!showSetup)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${hoverBg} ${textSecondary}`}>
            <svg className="w-3.5 h-3.5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Setup
          </button>
          <button onClick={() => setDarkMode(!darkMode)} className={`w-8 h-8 rounded-lg flex items-center justify-center ${hoverBg}`}>
            {darkMode ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            )}
          </button>
        </div>
      </header>

      {/* Messages */}
      {(error || successMsg) && (
        <div className="px-4 pt-2">
          {error && (
            <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="hover:text-red-300">✕</button>
            </div>
          )}
          {successMsg && (
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-400 flex items-center justify-between">
              <span>{successMsg}</span>
              <button onClick={() => setSuccessMsg(null)} className="hover:text-emerald-300">✕</button>
            </div>
          )}
        </div>
      )}

      {/* Setup Panel */}
      {showSetup && (
        <div className={`mx-4 mt-2 p-4 rounded-xl border ${borderColor} ${sidebarBg}`}>
          <h3 className="font-semibold text-sm mb-3">Konfigurasi Cloudflare Worker + D1</h3>
          
          {!isConfigured && (
            <div className={`p-3 rounded-lg mb-3 text-xs ${cardBg} ${textSecondary} space-y-2`}>
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-[#0A2540] dark:text-[#58a6ff]">📋 Cara Setup Cloudflare Worker:</p>
                <a href="https://github.com/your-repo/CLOUDFLARE_SETUP_GUIDE.md" target="_blank" rel="noopener" className="text-[10px] text-blue-500 hover:underline">
                  Panduan Lengkap →
                </a>
              </div>
              
              <div className="space-y-2">
                <div className="p-2 rounded bg-red-500/10 border border-red-500/20">
                  <p className="font-medium text-red-400 mb-1">🔴 Error 404 "The page could not be found":</p>
                  <p className="text-[10px]">Worker belum di-deploy. Ikuti langkah di bawah dengan teliti!</p>
                </div>

                <div className="space-y-1.5">
                  <p className="font-semibold text-[11px]">Langkah-langkah:</p>
                  <ol className="list-decimal list-inside space-y-1 text-[10px]">
                    <li>Buka <a href="https://dash.cloudflare.com" target="_blank" rel="noopener" className="text-blue-400 underline">dash.cloudflare.com</a></li>
                    <li>Klik "Workers & Pages" → Tab "D1 SQL Database" → "Create database"</li>
                    <li>Klik "R2 Object Storage" → "Create bucket" → Nama: <code className="bg-black/20 px-1 rounded font-bold">perada-docs</code></li>
                    <li>Kembali ke "Workers & Pages" → "Create application" → "Create Worker"</li>
                    <li>Deploy Worker dulu (yang default), lalu klik "Edit code"</li>
                    <li><strong className="text-amber-400">HAPUS SEMUA</strong> kode, lalu <strong className="text-amber-400">COPY-PASTE</strong> kode template di bawah</li>
                    <li>Klik "Deploy" di pojok kanan atas</li>
                    <li>Kembali ke Worker → Tab "Settings" → Scroll ke "Bindings"</li>
                    <li>"Add binding" → Type: "D1 Database" → Variable name: <code className="bg-black/20 px-1 rounded font-bold">DB</code></li>
                    <li>"Add binding" → Type: "R2 Bucket" → Variable name: <code className="bg-black/20 px-1 rounded font-bold">DOCS</code> → Pilih bucket <code className="bg-black/20 px-1 rounded">perada-docs</code></li>
                    <li>Scroll ke "Variables" → "Add variable" → Type: "Secret" → Name: <code className="bg-black/20 px-1 rounded font-bold">API_KEY</code></li>
                    <li>Test di browser: <code className="bg-black/20 px-1 rounded">https://your-worker.workers.dev/test</code></li>
                  </ol>
                </div>

                <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20">
                  <p className="font-medium text-amber-400 text-[10px]">⚠️ PENTING:</p>
                  <ul className="text-[10px] space-y-0.5 mt-1">
                    <li>• Variable name D1 HARUS <code className="bg-black/20 px-1 rounded">DB</code> (case-sensitive!)</li>
                    <li>• Variable name R2 HARUS <code className="bg-black/20 px-1 rounded">DOCS</code> (case-sensitive!)</li>
                    <li>• Variable name API Key HARUS <code className="bg-black/20 px-1 rounded">API_KEY</code> (case-sensitive!)</li>
                    <li>• Worker URL di aplikasi <strong>TANPA</strong> trailing slash</li>
                  </ul>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-[#30363d] space-y-2">
                <p className="font-medium text-amber-500">⚠️ Troubleshooting:</p>
                
                <div className="space-y-1.5">
                  <div>
                    <p className="font-medium text-red-400">Error "The page c..." atau HTML response:</p>
                    <ul className="list-disc list-inside ml-2 text-[10px] space-y-0.5">
                      <li>Worker URL salah atau Worker belum aktif</li>
                      <li>Pastikan format: <code className="bg-black/20 px-1 rounded">https://documents-api.indosatmobileagent.workers.dev</code></li>
                      <li>Cek di browser: buka <a href={`https://${config.workerUrl || 'your-worker.workers.dev'}/test`} target="_blank" rel="noopener" className="text-blue-400 underline">https://{config.workerUrl || 'your-worker.workers.dev'}/test</a></li>
                      <li>Jika muncul JSON → Worker aktif ✓</li>
                      <li>Jika muncul HTML error → Worker belum deploy atau ada error di code</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-medium text-red-400">Error "Unauthorized":</p>
                    <ul className="list-disc list-inside ml-2 text-[10px] space-y-0.5">
                      <li>API Key tidak cocok dengan environment variable di Worker</li>
                      <li>Cek di Cloudflare Dashboard → Workers → Your Worker → Settings → Variables</li>
                      <li>Pastikan "API_KEY" sudah di-set dan value-nya sama</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-medium text-red-400">Error "hasDB: false":</p>
                    <ul className="list-disc list-inside ml-2 text-[10px] space-y-0.5">
                      <li>D1 database belum di-bind ke Worker</li>
                      <li>Di Worker Settings → Bindings → Add → D1 Database</li>
                      <li>Variable name harus: <code className="bg-black/20 px-1 rounded">DB</code></li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-medium text-red-400">Error "hasR2: false" atau upload gagal:</p>
                    <ul className="list-disc list-inside ml-2 text-[10px] space-y-0.5">
                      <li>R2 bucket belum di-bind ke Worker</li>
                      <li>Di Worker Settings → Bindings → Add → R2 Bucket</li>
                      <li>Variable name harus: <code className="bg-black/20 px-1 rounded">DOCS</code></li>
                      <li>Pastikan bucket R2 sudah dibuat sebelumnya</li>
                    </ul>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#30363d]">
                  <p className="font-medium text-blue-400 mb-1">🔍 Debug Steps:</p>
                  <ol className="list-decimal list-inside ml-2 text-[10px] space-y-0.5">
                    <li>Buka Worker di browser: <code className="bg-black/20 px-1 rounded">https://{config.workerUrl || 'your-worker.workers.dev'}/test</code></li>
                    <li>Lihat response - harus ada JSON dengan <code className="bg-black/20 px-1 rounded">hasDB</code>, <code className="bg-black/20 px-1 rounded">hasR2</code>, dan <code className="bg-black/20 px-1 rounded">hasAPIKey</code></li>
                    <li>Jika <code className="bg-black/20 px-1 rounded">hasDB: false</code> → bind D1 database</li>
                    <li>Jika <code className="bg-black/20 px-1 rounded">hasR2: false</code> → bind R2 bucket</li>
                    <li>Jika <code className="bg-black/20 px-1 rounded">hasAPIKey: false</code> → set environment variable</li>
                    <li>Gunakan tombol "Test Koneksi" di bawah untuk test dari aplikasi</li>
                  </ol>
                </div>
              </div>
              <button onClick={() => setShowWorkerCode(!showWorkerCode)}
                className="text-xs text-[#0A2540] dark:text-[#58a6ff] font-medium hover:underline">
                {showWorkerCode ? 'Sembunyikan' : 'Lihat'} Kode Worker Template →
              </button>
            </div>
          )}

          {showWorkerCode && (
            <div className={`mb-3 rounded-lg overflow-hidden border ${borderColor}`}>
              <div className={`flex items-center justify-between px-3 py-1.5 ${cardBg}`}>
                <span className={`text-[10px] font-mono ${textSecondary}`}>worker.js</span>
                <button onClick={() => copyToClipboard(WORKER_CODE_TEMPLATE)}
                  className="text-[10px] text-[#0A2540] dark:text-[#58a6ff] font-medium hover:underline">
                  Copy Code
                </button>
              </div>
              <pre className={`p-3 text-[10px] font-mono overflow-x-auto max-h-[300px] overflow-y-auto ${cardBg} ${textSecondary}`}>
                {WORKER_CODE_TEMPLATE}
              </pre>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} block mb-1`}>Worker URL</label>
              <input value={config.workerUrl} onChange={e => setConfig(c => ({ ...c, workerUrl: e.target.value }))}
                className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-[#0A2540]/30`}
                placeholder="https://documents-api.indosatmobileagent.workers.dev" />
              <p className={`text-[9px] mt-1 ${textSecondary}`}>
                ⚠️ Wajib diawali <code className="bg-black/20 px-1 rounded">https://</code> • Tanpa trailing slash
              </p>
            </div>
            <div>
              <label className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} block mb-1`}>API Key</label>
              <input type="password" value={config.apiKey} onChange={e => setConfig(c => ({ ...c, apiKey: e.target.value }))}
                className={`w-full px-2.5 py-1.5 rounded-lg text-sm border font-mono ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-[#0A2540]/30`}
                placeholder="your-secret-api-key" />
            </div>
            <div className="flex gap-2">
              <button onClick={handleSaveConfig}
                className="flex-1 py-2 rounded-lg text-xs font-medium bg-[#0A2540] hover:bg-[#1E3A5F] text-white transition-colors">
                Simpan & Connect
              </button>
              {isConfigured && (
                <>
                  <button onClick={handleTestConnection} disabled={isLoading}
                    className="flex-1 py-2 rounded-lg text-xs font-medium border border-blue-500/30 text-blue-500 hover:bg-blue-500/10 transition-colors disabled:opacity-50">
                    {isLoading ? 'Testing...' : 'Test Koneksi'}
                  </button>
                  <button onClick={handleDebug} disabled={isLoading}
                    className="flex-1 py-2 rounded-lg text-xs font-medium border border-amber-500/30 text-amber-500 hover:bg-amber-500/10 transition-colors disabled:opacity-50">
                    {isLoading ? 'Debugging...' : '🔍 Debug'}
                  </button>
                  <button onClick={handleSetup} disabled={isLoading}
                    className="flex-1 py-2 rounded-lg text-xs font-medium border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 transition-colors disabled:opacity-50">
                    {isLoading ? 'Setting up...' : 'Init Database'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!isConfigured ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-500/5 flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald-500 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <h3 className="text-base font-semibold mb-2">Cloudflare Belum Terhubung</h3>
            <p className={`text-sm ${textSecondary} mb-4`}>
              Setup Cloudflare Worker + D1 untuk menyimpan register dokumen secara cloud. Data tersimpan aman dan bisa diakses dari mana saja.
            </p>
            <button onClick={() => setShowSetup(true)}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-[#0A2540] hover:bg-[#1E3A5F] text-white transition-colors">
              Mulai Setup →
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* Document List */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Toolbar */}
            <div className={`flex items-center justify-between px-4 py-2 border-b ${borderColor}`}>
              <div className="flex items-center gap-2">
                <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs border ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-[#0A2540]/30 w-48`}
                  placeholder="Cari dokumen..." />
                <select value={filterType} onChange={e => setFilterType(e.target.value)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs border ${inputBg} ${textPrimary} focus:outline-none`}>
                  <option value="all">Semua Tipe</option>
                  {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <button onClick={() => { setShowForm(true); setEditingDoc(null); setFormData({ doc_number: '', doc_type: 'surat', title: '', description: '', reference: '' }); }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#0A2540] hover:bg-[#1E3A5F] text-white transition-colors flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Register Baru
              </button>
            </div>

            {/* Document Table */}
            <div className="flex-1 overflow-auto">
              {isLoading && documents.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="pulse-dot text-2xl text-[#0A2540] dark:text-[#58a6ff] mb-2">●</div>
                    <p className={`text-sm ${textSecondary}`}>Memuat dokumen...</p>
                  </div>
                </div>
              ) : filteredDocs.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-emerald-500/5 flex items-center justify-center">
                      <svg className="w-6 h-6 text-emerald-500 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <p className={`text-sm font-medium ${textSecondary}`}>Belum ada dokumen</p>
                    <p className={`text-xs mt-1 ${textSecondary} opacity-70`}>Klik "Register Baru" untuk menambahkan</p>
                  </div>
                </div>
              ) : (
                <table className="w-full text-xs">
                  <thead className={`sticky top-0 ${cardBg}`}>
                    <tr className={`border-b ${borderColor}`}>
                      <th className={`text-left px-4 py-2 font-semibold ${textSecondary}`}>No. Dokumen</th>
                      <th className={`text-left px-4 py-2 font-semibold ${textSecondary}`}>Tipe</th>
                      <th className={`text-left px-4 py-2 font-semibold ${textSecondary}`}>Judul</th>
                      <th className={`text-left px-4 py-2 font-semibold ${textSecondary}`}>Referensi</th>
                      <th className={`text-left px-4 py-2 font-semibold ${textSecondary}`}>Tanggal</th>
                      <th className={`text-right px-4 py-2 font-semibold ${textSecondary}`}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocs.map(doc => (
                      <tr key={doc.id} className={`border-b ${borderColor} ${hoverBg} transition-colors`}>
                        <td className="px-4 py-2.5">
                          <button onClick={() => copyToClipboard(doc.doc_number)}
                            className="font-mono text-[#0A2540] dark:text-[#58a6ff] hover:underline" title="Klik untuk copy">
                            {doc.doc_number}
                          </button>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${cardBg}`}>
                            {DOC_TYPES.find(t => t.value === doc.doc_type)?.label || doc.doc_type}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 font-medium">
                          <div className="flex items-center gap-1.5">
                            {doc.title}
                            {doc.file_key && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 font-medium">
                                PDF
                              </span>
                            )}
                          </div>
                        </td>
                        <td className={`px-4 py-2.5 ${textSecondary}`}>{doc.reference || '-'}</td>
                        <td className={`px-4 py-2.5 ${textSecondary}`}>
                          {doc.created_at ? new Date(doc.created_at).toLocaleDateString('id-ID') : '-'}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => handleView(doc)}
                              className={`w-6 h-6 rounded flex items-center justify-center ${hoverBg}`} title="Lihat Detail">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            </button>
                            <button onClick={() => handleEdit(doc)}
                              className={`w-6 h-6 rounded flex items-center justify-center ${hoverBg}`} title="Edit">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button onClick={() => doc.id && handleDelete(doc.id)}
                              className="w-6 h-6 rounded flex items-center justify-center text-red-400 hover:bg-red-500/10" title="Hapus">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Form Modal */}
          {showForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)}>
              <div className={`w-full max-w-md rounded-2xl p-5 shadow-2xl ${sidebarBg} border ${borderColor}`} onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm">{editingDoc ? 'Edit Dokumen' : 'Register Dokumen Baru'}</h3>
                  <button onClick={() => setShowForm(false)} className={`w-6 h-6 rounded-lg flex items-center justify-center ${hoverBg}`}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} block mb-1`}>Tipe Dokumen</label>
                    <select value={formData.doc_type} onChange={e => setFormData(f => ({ ...f, doc_type: e.target.value }))}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary} focus:outline-none`}>
                      {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} block mb-1`}>Nomor Dokumen</label>
                    <div className="flex gap-1.5">
                      <input value={formData.doc_number} onChange={e => setFormData(f => ({ ...f, doc_number: e.target.value }))}
                        className={`flex-1 px-2.5 py-1.5 rounded-lg text-sm border font-mono ${inputBg} ${textPrimary} focus:outline-none`}
                        placeholder="SURAT/0001/PAY/01/2026" />
                      <button onClick={handleGenerateNumber}
                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium border transition-colors ${borderColor} ${hoverBg} ${textSecondary}`}
                        title="Auto-generate nomor">
                        Auto
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} block mb-1`}>Judul</label>
                    <input value={formData.title} onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary} focus:outline-none`}
                      placeholder="Judul dokumen" />
                  </div>

                  <div>
                    <label className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} block mb-1`}>Deskripsi</label>
                    <textarea value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} rows={2}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-sm border resize-none ${inputBg} ${textPrimary} focus:outline-none`}
                      placeholder="Deskripsi singkat" />
                  </div>

                  <div>
                    <label className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} block mb-1`}>Referensi</label>
                    <input value={formData.reference} onChange={e => setFormData(f => ({ ...f, reference: e.target.value }))}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary} focus:outline-none`}
                      placeholder="No. PO, kontrak, dll" />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button onClick={() => setShowForm(false)}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${borderColor} ${hoverBg} ${textSecondary}`}>
                      Batal
                    </button>
                    <button onClick={handleSubmit} disabled={isLoading}
                      className="flex-1 py-2 rounded-lg text-xs font-medium bg-[#0A2540] hover:bg-[#1E3A5F] text-white transition-colors disabled:opacity-50">
                      {isLoading ? 'Menyimpan...' : editingDoc ? 'Update' : 'Register'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Detail View Modal */}
          {viewingDoc && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setViewingDoc(null)}>
              <div className={`w-full max-w-2xl rounded-2xl shadow-2xl ${sidebarBg} border ${borderColor} max-h-[90vh] flex flex-col`} onClick={e => e.stopPropagation()}>
                <div className={`flex items-center justify-between p-5 border-b ${borderColor}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">Detail Dokumen</h3>
                      <p className={`text-[10px] ${textSecondary}`}>{viewingDoc.doc_number}</p>
                    </div>
                  </div>
                  <button onClick={() => setViewingDoc(null)} className={`w-6 h-6 rounded-lg flex items-center justify-center ${hoverBg}`}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} block mb-1`}>Tipe Dokumen</label>
                      <p className="text-sm">{DOC_TYPES.find(t => t.value === viewingDoc.doc_type)?.label || viewingDoc.doc_type}</p>
                    </div>
                    <div>
                      <label className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} block mb-1`}>Nomor Dokumen</label>
                      <p className="text-sm font-mono">{viewingDoc.doc_number}</p>
                    </div>
                  </div>

                  <div>
                    <label className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} block mb-1`}>Judul</label>
                    <p className="text-sm font-medium">{viewingDoc.title}</p>
                  </div>

                  {viewingDoc.description && (
                    <div>
                      <label className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} block mb-1`}>Deskripsi</label>
                      <p className={`text-sm ${textSecondary}`}>{viewingDoc.description}</p>
                    </div>
                  )}

                  {viewingDoc.reference && (
                    <div>
                      <label className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} block mb-1`}>Referensi</label>
                      <p className="text-sm">{viewingDoc.reference}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} block mb-1`}>Tanggal Dibuat</label>
                      <p className="text-sm">{viewingDoc.created_at ? new Date(viewingDoc.created_at).toLocaleString('id-ID') : '-'}</p>
                    </div>
                    <div>
                      <label className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} block mb-1`}>Terakhir Diupdate</label>
                      <p className="text-sm">{viewingDoc.updated_at ? new Date(viewingDoc.updated_at).toLocaleString('id-ID') : '-'}</p>
                    </div>
                  </div>

                  {/* File Section */}
                  <div className={`p-4 rounded-xl border ${borderColor} ${cardBg}`}>
                    <h4 className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} mb-3`}>File Dokumen</h4>
                    
                    {viewingDoc.file_key ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707L14.293 4.293A1 1 0 0013.586 4H7a2 2 0 00-2 2v13a2 2 0 002 2z" /></svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{viewingDoc.file_name || 'document.pdf'}</p>
                            <p className={`text-[10px] ${textSecondary}`}>
                              {viewingDoc.file_size ? `${(viewingDoc.file_size / 1024).toFixed(1)} KB` : '-'} • {viewingDoc.file_type || 'PDF'}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleDownload(viewingDoc)}
                            className="flex-1 py-2 rounded-lg text-xs font-medium bg-blue-500 hover:bg-blue-600 text-white transition-colors flex items-center justify-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Download PDF
                          </button>
                          <label className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${borderColor} ${hoverBg} ${textSecondary} flex items-center justify-center gap-1.5 cursor-pointer`}>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            {uploadingFile ? 'Uploading...' : 'Ganti File'}
                            <input type="file" accept="application/pdf" className="hidden" disabled={uploadingFile}
                              onChange={e => {
                                const file = e.target.files?.[0];
                                if (file && viewingDoc.id) handleUpload(viewingDoc.id, file);
                              }} />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className={`text-center py-4 ${textSecondary}`}>
                          <svg className="w-8 h-8 mx-auto mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707L14.293 4.293A1 1 0 0013.586 4H7a2 2 0 00-2 2v13a2 2 0 002 2z" /></svg>
                          <p className="text-xs">Belum ada file yang diupload</p>
                        </div>
                        <label className={`w-full py-3 rounded-lg text-xs font-medium border-2 border-dashed transition-colors ${borderColor} ${hoverBg} ${textSecondary} flex items-center justify-center gap-2 cursor-pointer`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                          {uploadingFile ? 'Uploading...' : 'Upload File PDF'}
                          <input type="file" accept="application/pdf" className="hidden" disabled={uploadingFile}
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file && viewingDoc.id) handleUpload(viewingDoc.id, file);
                            }} />
                        </label>
                        <p className={`text-[10px] ${textSecondary} text-center`}>Maksimal 10MB • Format PDF</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className={`flex gap-2 p-5 border-t ${borderColor}`}>
                  <button onClick={() => { handleEdit(viewingDoc); setViewingDoc(null); }}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${borderColor} ${hoverBg}`}>
                    Edit Dokumen
                  </button>
                  <button onClick={() => setViewingDoc(null)}
                    className="flex-1 py-2 rounded-lg text-xs font-medium bg-[#0A2540] hover:bg-[#1E3A5F] text-white transition-colors">
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Worker Code Modal */}
      {showWorkerCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowWorkerCodeModal(false)}>
          <div className={`w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl ${sidebarBg} border ${borderColor} flex flex-col`} onClick={e => e.stopPropagation()}>
            <div className={`flex items-center justify-between p-5 border-b ${borderColor}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Kode Worker Cloudflare</h3>
                  <p className={`text-[10px] ${textSecondary}`}>Copy kode ini ke Cloudflare Worker Anda</p>
                </div>
              </div>
              <button onClick={() => setShowWorkerCodeModal(false)} className={`w-6 h-6 rounded-lg flex items-center justify-center ${hoverBg}`}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-hidden p-5">
              <div className={`rounded-lg overflow-hidden border ${borderColor} h-full flex flex-col`}>
                <div className={`flex items-center justify-between px-3 py-2 ${cardBg} border-b ${borderColor}`}>
                  <span className={`text-[10px] font-mono ${textSecondary}`}>worker.js</span>
                  <button onClick={() => copyToClipboard(WORKER_CODE_TEMPLATE)}
                    className="px-3 py-1 rounded text-[10px] font-medium bg-blue-500 hover:bg-blue-600 text-white transition-colors flex items-center gap-1.5">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    Copy Semua Kode
                  </button>
                </div>
                <pre className={`p-4 text-[11px] font-mono overflow-auto flex-1 ${cardBg} ${textSecondary} leading-relaxed`}>
                  {WORKER_CODE_TEMPLATE}
                </pre>
              </div>
            </div>

            <div className={`flex gap-2 p-5 border-t ${borderColor}`}>
              <div className={`flex-1 p-3 rounded-lg ${cardBg}`}>
                <p className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} mb-2`}>⚠️ Binding yang Diperlukan:</p>
                <ul className="text-[10px] space-y-1">
                  <li>• <code className="bg-black/20 px-1 rounded">DB</code> → D1 Database</li>
                  <li>• <code className="bg-black/20 px-1 rounded">DOCS</code> → R2 Bucket</li>
                  <li>• <code className="bg-black/20 px-1 rounded">API_KEY</code> → Secret</li>
                </ul>
              </div>
              <button onClick={() => setShowWorkerCodeModal(false)}
                className="px-6 py-2 rounded-lg text-xs font-medium bg-[#0A2540] hover:bg-[#1E3A5F] text-white transition-colors">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className={`px-4 py-2 border-t shrink-0 flex items-center justify-between ${sidebarBg} ${borderColor}`}>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#0A2540] flex items-center justify-center">
            <span className="text-white text-[6px] font-bold">PA</span>
          </div>
          <span className={`text-[10px] ${textSecondary}`}>
            <span className="font-medium text-[#0A2540] dark:text-[#58a6ff]">PT Perdana Adi Yuda</span> — PERADA GROUP
          </span>
        </div>
        <span className={`text-[10px] ${textSecondary}`}>© 2026</span>
      </footer>
    </div>
  );
}
