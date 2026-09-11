import { useEffect, useState } from 'react';
import { ImagePlus, RotateCcw, Save, X } from 'lucide-react';
import {
  defaultDocumentTemplateSettings,
  documentTemplateEvents,
  loadDocumentTemplateSettings,
  saveDocumentTemplateSettings,
  type DocumentTemplateSettings,
} from '../lib/documentTemplate';
import DocumentLetterhead from './DocumentLetterhead';

export default function DocumentTemplateSettingsModal() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<DocumentTemplateSettings>(() => loadDocumentTemplateSettings());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const handleOpen = () => {
      setSettings(loadDocumentTemplateSettings());
      setSaved(false);
      setOpen(true);
    };
    window.addEventListener(documentTemplateEvents.openSettings, handleOpen);
    return () => window.removeEventListener(documentTemplateEvents.openSettings, handleOpen);
  }, []);

  if (!open) return null;

  const patch = <K extends keyof DocumentTemplateSettings>(key: K, value: DocumentTemplateSettings[K]) => {
    setSettings((previous) => ({ ...previous, [key]: value }));
    setSaved(false);
  };

  const handleLogo = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    if (file.size > 1_500_000) {
      window.alert('Ukuran logo maksimal 1,5 MB agar template tetap ringan.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => patch('logoDataUrl', String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    saveDocumentTemplateSettings(settings);
    setSaved(true);
  };

  const handleReset = () => {
    setSettings(defaultDocumentTemplateSettings);
    setSaved(false);
  };

  return (
    <div className="doc-settings-overlay" role="dialog" aria-modal="true" aria-label="Pengaturan template dokumen">
      <div className="doc-settings-modal">
        <header className="doc-settings-header">
          <div>
            <span className="erp-eyebrow">Pengaturan Terpusat</span>
            <h2>Template Dokumen</h2>
            <p>Branding, kop surat, logo, penandatangan, dan footer untuk seluruh generator dokumen.</p>
          </div>
          <button type="button" className="erp-icon-button" onClick={() => setOpen(false)} aria-label="Tutup"><X size={19} /></button>
        </header>

        <div className="doc-settings-layout">
          <section className="doc-settings-form">
            <div className="doc-settings-section">
              <h3>Identitas Perusahaan</h3>
              <div className="doc-settings-grid">
                <label>Nama perusahaan<input value={settings.companyName} onChange={(event) => patch('companyName', event.target.value)} /></label>
                <label>Unit / subjudul<input value={settings.businessUnit} onChange={(event) => patch('businessUnit', event.target.value)} /></label>
                <label className="doc-span-2">Alamat<textarea rows={2} value={settings.companyAddress} onChange={(event) => patch('companyAddress', event.target.value)} /></label>
                <label>Telepon<input value={settings.phone} onChange={(event) => patch('phone', event.target.value)} /></label>
                <label>Email<input type="email" value={settings.email} onChange={(event) => patch('email', event.target.value)} /></label>
                <label>Website<input value={settings.website} onChange={(event) => patch('website', event.target.value)} /></label>
                <label>Warna aksen<input type="color" value={settings.accentColor} onChange={(event) => patch('accentColor', event.target.value)} /></label>
              </div>
            </div>

            <div className="doc-settings-section">
              <h3>Logo & Kop Surat</h3>
              <div className="doc-logo-control">
                <div className="doc-logo-preview">
                  {settings.logoDataUrl ? <img src={settings.logoDataUrl} alt="Logo perusahaan" /> : <ImagePlus size={24} />}
                </div>
                <div>
                  <label className="doc-upload-button">Pilih Logo<input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={(event) => handleLogo(event.target.files?.[0])} /></label>
                  {settings.logoDataUrl && <button type="button" className="doc-text-button" onClick={() => patch('logoDataUrl', '')}>Hapus logo</button>}
                  <p>PNG/SVG/WebP disarankan. Maksimal 1,5 MB.</p>
                </div>
              </div>
              <div className="doc-settings-grid doc-settings-options">
                <label>Alignment<select value={settings.headerAlignment} onChange={(event) => patch('headerAlignment', event.target.value as DocumentTemplateSettings['headerAlignment'])}><option value="left">Kiri</option><option value="center">Tengah</option></select></label>
                <label className="doc-check"><input type="checkbox" checked={settings.showHeaderLine} onChange={(event) => patch('showHeaderLine', event.target.checked)} /> Garis bawah kop</label>
              </div>
            </div>

            <div className="doc-settings-section">
              <h3>Penandatangan & Footer</h3>
              <div className="doc-settings-grid">
                <label>Nama penandatangan<input value={settings.signatoryName} onChange={(event) => patch('signatoryName', event.target.value)} placeholder="Opsional" /></label>
                <label>Jabatan<input value={settings.signatoryTitle} onChange={(event) => patch('signatoryTitle', event.target.value)} /></label>
                <label className="doc-span-2">Footer<input value={settings.footerText} onChange={(event) => patch('footerText', event.target.value)} /></label>
                <label className="doc-check"><input type="checkbox" checked={settings.showFooter} onChange={(event) => patch('showFooter', event.target.checked)} /> Tampilkan footer dokumen</label>
              </div>
            </div>
          </section>

          <aside className="doc-settings-preview">
            <div className="doc-preview-label">Preview A4</div>
            <div className="doc-preview-paper">
              <DocumentLetterhead settings={settings} documentNumber="DOC/001/2026" />
              <div className="doc-preview-body">
                <h3>JUDUL DOKUMEN</h3>
                <p>Contoh area isi dokumen. Semua generator yang menggunakan template terpusat akan mengikuti identitas dan kop surat ini.</p>
                <div className="doc-preview-lines"><span /><span /><span /><span /></div>
              </div>
              {settings.showFooter && <footer className="doc-preview-footer">{settings.footerText}</footer>}
            </div>
          </aside>
        </div>

        <footer className="doc-settings-actions">
          <div>{saved && <span className="doc-save-status">Tersimpan dan langsung berlaku.</span>}</div>
          <div className="doc-settings-action-buttons">
            <button type="button" className="doc-secondary-button" onClick={handleReset}><RotateCcw size={16} /> Reset</button>
            <button type="button" className="doc-primary-button" onClick={handleSave}><Save size={16} /> Simpan Template</button>
          </div>
        </footer>
      </div>
    </div>
  );
}
