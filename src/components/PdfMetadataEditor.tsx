import { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';

interface PdfMetadataEditorProps {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

export default function PdfMetadataEditor({ onBack, darkMode, setDarkMode }: PdfMetadataEditorProps) {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState({
    title: '',
    author: '',
    subject: '',
    keywords: '',
    creator: '',
    producer: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bg = darkMode ? 'bg-[#0f1419]' : 'bg-[#f8f9fb]';
  const sidebarBg = darkMode ? 'bg-[#161b22]' : 'bg-white';
  const borderColor = darkMode ? 'border-[#21262d]' : 'border-[#e2e5e9]';
  const cardBg = darkMode ? 'bg-[#1c2128]' : 'bg-[#f3f4f6]';
  const textPrimary = darkMode ? 'text-[#e6edf3]' : 'text-[#1a1a2e]';
  const textSecondary = darkMode ? 'text-[#8b949e]' : 'text-[#57606a]';
  const inputBg = darkMode ? 'bg-[#0d1117] border-[#30363d]' : 'bg-white border-[#d0d7de]';
  const hoverBg = darkMode ? 'hover:bg-[#21262d]' : 'hover:bg-[#f0f1f3]';

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.type !== 'application/pdf') {
      setError('Hanya file PDF yang didukung');
      return;
    }
    
    setPdfFile(file);
    setError(null);
    setSuccessMsg(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const existingMetadata = pdf.getTitle() || '';
      
      setMetadata({
        title: existingMetadata,
        author: pdf.getAuthor() || '',
        subject: pdf.getSubject() || '',
        keywords: pdf.getKeywords() || '',
        creator: pdf.getCreator() || '',
        producer: pdf.getProducer() || '',
      });
    } catch (err) {
      setError(`Gagal memuat PDF: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const saveMetadata = async () => {
    if (!pdfFile) return;
    
    setIsProcessing(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      
      if (metadata.title) pdf.setTitle(metadata.title);
      if (metadata.author) pdf.setAuthor(metadata.author);
      if (metadata.subject) pdf.setSubject(metadata.subject);
      if (metadata.keywords) pdf.setKeywords(metadata.keywords.split(',').map(k => k.trim()));
      if (metadata.creator) pdf.setCreator(metadata.creator);
      if (metadata.producer) pdf.setProducer(metadata.producer);

      const pdfBytes = await pdf.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${pdfFile.name.replace('.pdf', '')}_metadata.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSuccessMsg('Metadata berhasil disimpan!');
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      setError(`Gagal menyimpan metadata: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${bg} ${textPrimary}`}>
      <header className={`flex items-center justify-between px-4 py-2.5 border-b shrink-0 ${sidebarBg} ${borderColor}`}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className={`w-7 h-7 rounded-lg flex items-center justify-center ${hoverBg}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="w-8 h-8 rounded-lg bg-pink-600 flex items-center justify-center shadow-sm">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight">PDF Metadata Editor</h1>
            <p className={`text-[10px] ${textSecondary}`}>Edit metadata PDF</p>
          </div>
        </div>
        <button onClick={() => setDarkMode(!darkMode)} className={`w-8 h-8 rounded-lg flex items-center justify-center ${hoverBg}`}>
          {darkMode ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          )}
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className={`w-80 flex flex-col border-r overflow-hidden shrink-0 ${sidebarBg} ${borderColor}`}>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                darkMode ? 'border-[#30363d] hover:border-pink-500/50' : 'border-[#d0d7de] hover:border-pink-500/50'
              }`}
            >
              <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-pink-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707L14.293 4.293A1 1 0 0013.586 4H7a2 2 0 00-2 2v13a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-xs font-medium">{pdfFile ? pdfFile.name : 'Pilih file PDF'}</p>
              <p className={`text-[10px] mt-0.5 ${textSecondary}`}>Klik untuk upload</p>
            </div>
            <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={e => handleFileSelect(e.target.files)} />
          </div>

          <div className={`p-3 border-t ${borderColor}`}>
            <button
              onClick={saveMetadata}
              disabled={!pdfFile || isProcessing}
              className={`w-full py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                !pdfFile || isProcessing
                  ? 'opacity-40 cursor-not-allowed bg-pink-500 text-white'
                  : 'bg-pink-500 hover:bg-pink-600 text-white shadow-sm'
              }`}
            >
              {isProcessing ? (
                <><span className="pulse-dot">●</span> Saving...</>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Save Metadata
                </>
              )}
            </button>
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          {error && (
            <div className="mx-4 mt-4 p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="hover:text-red-300">✕</button>
            </div>
          )}

          {successMsg && (
            <div className="mx-4 mt-4 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-400 flex items-center justify-between">
              <span>{successMsg}</span>
              <button onClick={() => setSuccessMsg(null)} className="hover:text-emerald-300">✕</button>
            </div>
          )}

          <div className="flex-1 overflow-auto p-6">
            {!pdfFile ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className={`w-20 h-20 mx-auto mb-4 rounded-3xl ${cardBg} flex items-center justify-center`}>
                    <svg className={`w-8 h-8 ${textSecondary} opacity-50`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-semibold mb-1">Upload PDF</h3>
                  <p className={`text-sm max-w-xs ${textSecondary}`}>Pilih file PDF dari sidebar untuk mengedit metadata</p>
                </div>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto space-y-4">
                <h3 className={`text-sm font-semibold ${textPrimary}`}>Edit Metadata</h3>
                
                <div className={`rounded-xl border p-4 ${borderColor} ${sidebarBg} space-y-3`}>
                  <div>
                    <label className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} block mb-1`}>Title</label>
                    <input
                      type="text"
                      value={metadata.title}
                      onChange={e => setMetadata({ ...metadata, title: e.target.value })}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`}
                      placeholder="Document Title"
                    />
                  </div>

                  <div>
                    <label className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} block mb-1`}>Author</label>
                    <input
                      type="text"
                      value={metadata.author}
                      onChange={e => setMetadata({ ...metadata, author: e.target.value })}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`}
                      placeholder="Author Name"
                    />
                  </div>

                  <div>
                    <label className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} block mb-1`}>Subject</label>
                    <input
                      type="text"
                      value={metadata.subject}
                      onChange={e => setMetadata({ ...metadata, subject: e.target.value })}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`}
                      placeholder="Document Subject"
                    />
                  </div>

                  <div>
                    <label className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} block mb-1`}>Keywords (comma separated)</label>
                    <input
                      type="text"
                      value={metadata.keywords}
                      onChange={e => setMetadata({ ...metadata, keywords: e.target.value })}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`}
                      placeholder="keyword1, keyword2, keyword3"
                    />
                  </div>

                  <div>
                    <label className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} block mb-1`}>Creator</label>
                    <input
                      type="text"
                      value={metadata.creator}
                      onChange={e => setMetadata({ ...metadata, creator: e.target.value })}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`}
                      placeholder="Application that created the PDF"
                    />
                  </div>

                  <div>
                    <label className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary} block mb-1`}>Producer</label>
                    <input
                      type="text"
                      value={metadata.producer}
                      onChange={e => setMetadata({ ...metadata, producer: e.target.value })}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-sm border ${inputBg} ${textPrimary}`}
                      placeholder="Application that produced the PDF"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

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
