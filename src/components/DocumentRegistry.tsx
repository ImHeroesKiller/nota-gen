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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showWorkerCode, setShowWorkerCode] = useState(false);
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
    cloudflareConnector.saveConfig(config);
    setIsConfigured(true);
    setShowSetup(false);
    setError(null);
    setSuccessMsg('Konfigurasi berhasil disimpan');
    setTimeout(() => setSuccessMsg(null), 3000);
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
      
      // Test endpoint tidak perlu API key
      const url = `${config.workerUrl.replace(/\/$/, '')}/test`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const responseText = await response.text();
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${responseText.substring(0, 200)}`);
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(`Response bukan JSON: "${responseText.substring(0, 100)}..."`);
      }
      
      // Check status Worker
      const issues = [];
      if (data.hasDB === false) {
        issues.push('D1 database belum di-bind (hasDB: false)');
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
              <p className="font-medium text-[#0A2540] dark:text-[#58a6ff]">📋 Cara Setup:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Buat akun di <a href="https://dash.cloudflare.com" target="_blank" rel="noopener" className="underline">dash.cloudflare.com</a></li>
                <li>Buat D1 Database di menu "Workers & Pages" → "D1"</li>
                <li>Buat Worker baru, paste kode template di bawah</li>
                <li>Bind D1 database ke Worker dengan nama "DB"</li>
                <li>Set environment variable "API_KEY" di Worker</li>
                <li>Deploy Worker, masukkan URL-nya di bawah</li>
              </ol>
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
                </div>

                <div className="pt-2 border-t border-[#30363d]">
                  <p className="font-medium text-blue-400 mb-1">🔍 Debug Steps:</p>
                  <ol className="list-decimal list-inside ml-2 text-[10px] space-y-0.5">
                    <li>Buka Worker di browser: <code className="bg-black/20 px-1 rounded">https://{config.workerUrl || 'your-worker.workers.dev'}/test</code></li>
                    <li>Lihat response - harus ada JSON dengan <code className="bg-black/20 px-1 rounded">hasDB</code> dan <code className="bg-black/20 px-1 rounded">hasAPIKey</code></li>
                    <li>Jika <code className="bg-black/20 px-1 rounded">hasDB: false</code> → bind D1 database</li>
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
                placeholder="https://your-worker.your-subdomain.workers.dev" />
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
                        <td className="px-4 py-2.5 font-medium">{doc.title}</td>
                        <td className={`px-4 py-2.5 ${textSecondary}`}>{doc.reference || '-'}</td>
                        <td className={`px-4 py-2.5 ${textSecondary}`}>
                          {doc.created_at ? new Date(doc.created_at).toLocaleDateString('id-ID') : '-'}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1">
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
