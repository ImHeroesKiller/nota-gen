import { useState, useCallback, useRef } from 'react';

interface RenamerFile {
  id: string;
  file: File;
  originalName: string;
  newName: string;
}

interface BatchRenamerProps {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

export default function BatchRenamer({ onBack, darkMode, setDarkMode }: BatchRenamerProps) {
  const [files, setFiles] = useState<RenamerFile[]>([]);
  const [pattern, setPattern] = useState('{name}_{index}');
  const [startIndex, setStartIndex] = useState(1);
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');
  const [dateFormat, setDateFormat] = useState('YYYY-MM-DD');
  const [isRenaming, setIsRenaming] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const bg = darkMode ? 'bg-[#0f1419]' : 'bg-[#f8f9fb]';
  const sidebarBg = darkMode ? 'bg-[#161b22]' : 'bg-white';
  const borderColor = darkMode ? 'border-[#21262d]' : 'border-[#e2e5e9]';
  const cardBg = darkMode ? 'bg-[#1c2128]' : 'bg-[#f3f4f6]';
  const textPrimary = darkMode ? 'text-[#e6edf3]' : 'text-[#1a1a2e]';
  const textSecondary = darkMode ? 'text-[#8b949e]' : 'text-[#57606a]';
  const inputBg = darkMode ? 'bg-[#0d1117] border-[#30363d]' : 'bg-white border-[#d0d7de]';
  const hoverBg = darkMode ? 'hover:bg-[#21262d]' : 'hover:bg-[#f0f1f3]';

  const handleFiles = useCallback((fileList: FileList | File[]) => {
    setError(null);
    const newFiles: RenamerFile[] = Array.from(fileList).map((file, idx) => {
      const ext = file.name.includes('.') ? '.' + file.name.split('.').pop() : '';
      const baseName = file.name.includes('.') ? file.name.slice(0, file.name.lastIndexOf('.')) : file.name;
      return {
        id: Math.random().toString(36).substring(2, 11),
        file,
        originalName: file.name,
        newName: `${baseName}_${idx + 1}${ext}`,
      };
    });
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const updateNewName = useCallback((id: string, newName: string) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, newName } : f));
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const clearAll = useCallback(() => setFiles([]), []);

  const applyPattern = useCallback(() => {
    const today = new Date();
    const dateStr = dateFormat
      .replace('YYYY', today.getFullYear().toString())
      .replace('MM', String(today.getMonth() + 1).padStart(2, '0'))
      .replace('DD', String(today.getDate()).padStart(2, '0'));

    setFiles(prev => prev.map((f, idx) => {
      const ext = f.file.name.includes('.') ? '.' + f.file.name.split('.').pop() : '';
      const baseName = f.file.name.includes('.') ? f.file.name.slice(0, f.file.name.lastIndexOf('.')) : f.file.name;
      
      let newName = pattern
        .replace('{name}', baseName)
        .replace('{index}', String(startIndex + idx).padStart(3, '0'))
        .replace('{date}', dateStr)
        .replace('{original}', f.file.name);
      
      if (prefix) newName = prefix + newName;
      if (suffix) newName = newName.replace(ext, '') + suffix + ext;
      
      return { ...f, newName };
    }));
  }, [pattern, startIndex, prefix, suffix, dateFormat]);

  const handleExport = useCallback(async () => {
    if (files.length === 0) {
      setError('Belum ada file untuk di-rename');
      return;
    }
    setIsRenaming(true);
    setError(null);

    try {
      // Create a zip-like download (since we can't actually rename files in browser,
      // we download them with new names)
      for (const f of files) {
        const url = URL.createObjectURL(f.file);
        const a = document.createElement('a');
        a.href = url;
        a.download = f.newName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        // Small delay to prevent browser blocking
        await new Promise(r => setTimeout(r, 100));
      }
      setSuccessMsg(`${files.length} file berhasil di-download dengan nama baru!`);
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      setError(`Gagal: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsRenaming(false);
    }
  }, [files]);

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${bg} ${textPrimary}`}>
      {/* Header */}
      <header className={`flex items-center justify-between px-4 py-2.5 border-b shrink-0 ${sidebarBg} ${borderColor}`}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${hoverBg}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight">Batch Renamer</h1>
            <p className={`text-[10px] ${textSecondary}`}>Ganti nama file massal</p>
          </div>
          {files.length > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
              {files.length} file
            </span>
          )}
        </div>
        <button onClick={() => setDarkMode(!darkMode)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${hoverBg}`}>
          {darkMode ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          )}
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Settings */}
        <aside className={`w-[340px] flex flex-col border-r overflow-hidden shrink-0 ${sidebarBg} ${borderColor}`}>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Pattern */}
            <div>
              <h3 className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} mb-2`}>Pola Penamaan</h3>
              <input
                type="text"
                value={pattern}
                onChange={e => setPattern(e.target.value)}
                placeholder="{name}_{index}"
                className={`w-full px-2.5 py-1.5 rounded-lg text-sm border font-mono ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-emerald-500/30`}
              />
              <div className={`mt-2 space-y-1 text-[10px] ${textSecondary}`}>
                <p><code className="px-1 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">{'{name}'}</code> — nama asli tanpa ekstensi</p>
                <p><code className="px-1 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">{'{index}'}</code> — nomor urut</p>
                <p><code className="px-1 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">{'{date}'}</code> — tanggal hari ini</p>
                <p><code className="px-1 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">{'{original}'}</code> — nama file lengkap</p>
              </div>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Mulai dari</label>
                <input type="number" min={0} value={startIndex}
                  onChange={e => setStartIndex(Number(e.target.value))}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-emerald-500/30`}
                />
              </div>
              <div>
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Format Tanggal</label>
                <select value={dateFormat}
                  onChange={e => setDateFormat(e.target.value)}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-emerald-500/30`}
                >
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  <option value="DD-MM-YYYY">DD-MM-YYYY</option>
                  <option value="YYYYMMDD">YYYYMMDD</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Prefix</label>
                <input type="text" value={prefix} onChange={e => setPrefix(e.target.value)}
                  placeholder="INV_"
                  className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-emerald-500/30`}
                />
              </div>
              <div>
                <label className={`text-[10px] ${textSecondary} block mb-1`}>Suffix</label>
                <input type="text" value={suffix} onChange={e => setSuffix(e.target.value)}
                  placeholder="_final"
                  className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-emerald-500/30`}
                />
              </div>
            </div>

            <button onClick={applyPattern} className="w-full py-2 rounded-lg text-xs font-medium bg-emerald-500 hover:bg-emerald-600 text-white transition-colors">
              Terapkan Pola
            </button>

            {/* Upload */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                darkMode ? 'border-[#30363d] hover:border-emerald-500/50' : 'border-[#d0d7de] hover:border-emerald-500/50'
              }`}
            >
              <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              </div>
              <p className="text-xs font-medium">Pilih file untuk di-rename</p>
              <p className={`text-[10px] mt-0.5 ${textSecondary}`}>Support semua format file</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => fileInputRef.current?.click()} className="flex-1 text-xs py-2 rounded-lg font-medium bg-emerald-500 hover:bg-emerald-600 text-white transition-colors">
                Pilih File
              </button>
              <button onClick={() => folderInputRef.current?.click()} className={`flex-1 text-xs py-2 rounded-lg font-medium border transition-colors ${darkMode ? 'border-[#30363d] hover:border-[#484f58] text-[#8b949e]' : 'border-[#d0d7de] hover:border-emerald-500/40 text-[#57606a]'}`}>
                Pilih Folder
              </button>
            </div>
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={e => e.target.files && handleFiles(e.target.files)} />
            <input ref={folderInputRef} type="file" multiple className="hidden" {...({ webkitdirectory: '', directory: '' } as any)} onChange={e => e.target.files && handleFiles(e.target.files)} />
          </div>

          {/* Export Button */}
          <div className={`p-3 border-t ${borderColor}`}>
            <button
              onClick={handleExport}
              disabled={files.length === 0 || isRenaming}
              className={`w-full py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                files.length === 0 || isRenaming
                  ? 'opacity-40 cursor-not-allowed bg-emerald-500 text-white'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm'
              }`}
            >
              {isRenaming ? (
                <><span className="pulse-dot">●</span> Memproses...</>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Download dengan Nama Baru
                </>
              )}
            </button>
          </div>
        </aside>

        {/* Main - File List */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className={`flex items-center justify-between px-4 py-2 border-b shrink-0 ${sidebarBg} ${borderColor}`}>
            <span className={`text-xs ${textSecondary}`}>
              {files.length > 0 ? `${files.length} file siap di-rename` : 'Belum ada file'}
            </span>
            {files.length > 0 && (
              <button onClick={clearAll} className="text-xs text-red-400 hover:text-red-300 font-medium">Hapus Semua</button>
            )}
          </div>

          {/* Messages */}
          {error && (
            <div className="mx-4 mt-2 p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 flex items-center justify-between fade-in">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="hover:text-red-300">✕</button>
            </div>
          )}
          {successMsg && (
            <div className="mx-4 mt-2 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-400 flex items-center justify-between fade-in">
              <span>{successMsg}</span>
              <button onClick={() => setSuccessMsg(null)} className="hover:text-emerald-300">✕</button>
            </div>
          )}

          {/* File List */}
          <div className="flex-1 overflow-y-auto p-4">
            {files.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-20 h-20 rounded-3xl bg-emerald-500/5 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-emerald-500 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </div>
                <h3 className="text-base font-semibold mb-1">Belum Ada File</h3>
                <p className={`text-sm max-w-xs ${textSecondary}`}>Pilih file dari sidebar untuk mulai mengganti nama secara massal</p>
              </div>
            ) : (
              <div className="space-y-2">
                {files.map((f, idx) => (
                  <div key={f.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${darkMode ? 'border-[#30363d] hover:border-[#484f58]' : 'border-[#e2e5e9] hover:border-emerald-500/30'}`}>
                    <span className={`text-xs w-8 text-center font-mono ${textSecondary}`}>{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs ${textSecondary} line-through`}>{f.originalName}</span>
                        <svg className="w-3 h-3 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                      </div>
                      <input
                        type="text"
                        value={f.newName}
                        onChange={e => updateNewName(f.id, e.target.value)}
                        className={`w-full px-2 py-1 rounded text-sm font-medium border ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-emerald-500/30`}
                      />
                    </div>
                    <button onClick={() => removeFile(f.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/10 transition-colors shrink-0">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

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
        </main>
      </div>
    </div>
  );
}
