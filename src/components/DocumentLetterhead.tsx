import type { DocumentTemplateSettings } from '../lib/documentTemplate';

interface DocumentLetterheadProps {
  settings: DocumentTemplateSettings;
  documentNumber?: string;
  documentNumberLabel?: string;
}

export default function DocumentLetterhead({
  settings,
  documentNumber,
  documentNumberLabel = 'No. Dokumen',
}: DocumentLetterheadProps) {
  const centered = settings.headerAlignment === 'center';
  return (
    <header
      className={`doc-letterhead ${centered ? 'is-centered' : ''}`}
      style={{ borderColor: settings.showHeaderLine ? settings.accentColor : 'transparent' }}
    >
      <div className="doc-letterhead-main">
        {settings.logoDataUrl ? (
          <img className="doc-letterhead-logo" src={settings.logoDataUrl} alt={`Logo ${settings.companyName}`} />
        ) : (
          <div className="doc-letterhead-logo-fallback" style={{ color: settings.accentColor, borderColor: settings.accentColor }}>
            {settings.companyName.split(/\s+/).filter(Boolean).slice(0, 3).map((word) => word[0]).join('') || 'PA'}
          </div>
        )}
        <div className="doc-letterhead-copy">
          <h2 style={{ color: settings.accentColor }}>{settings.companyName}</h2>
          {settings.businessUnit && <p className="doc-letterhead-unit">{settings.businessUnit}</p>}
          {(settings.companyAddress || settings.phone || settings.email || settings.website) && (
            <p className="doc-letterhead-meta">
              {[settings.companyAddress, settings.phone, settings.email, settings.website].filter(Boolean).join(' • ')}
            </p>
          )}
        </div>
      </div>
      {documentNumber && (
        <div className="doc-letterhead-number">
          <span>{documentNumberLabel}</span>
          <strong>{documentNumber}</strong>
        </div>
      )}
    </header>
  );
}
