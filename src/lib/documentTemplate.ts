import { useEffect, useState } from 'react';

export type LetterheadAlignment = 'left' | 'center';

export interface DocumentTemplateSettings {
  companyName: string;
  businessUnit: string;
  companyAddress: string;
  phone: string;
  email: string;
  website: string;
  logoDataUrl: string;
  accentColor: string;
  headerAlignment: LetterheadAlignment;
  showHeaderLine: boolean;
  showFooter: boolean;
  footerText: string;
  signatoryName: string;
  signatoryTitle: string;
}

export const defaultDocumentTemplateSettings: DocumentTemplateSettings = {
  companyName: 'PT PERDANA ADI YUDA',
  businessUnit: 'Human Capital & Outsourcing Services',
  companyAddress: '',
  phone: '',
  email: '',
  website: '',
  logoDataUrl: '',
  accentColor: '#0A2540',
  headerAlignment: 'left',
  showHeaderLine: true,
  showFooter: true,
  footerText: 'Dokumen ini dibuat melalui PERADA Tools.',
  signatoryName: '',
  signatoryTitle: 'HRD Manager',
};

const STORAGE_KEY = 'perada.document-template.v1';
const CHANGE_EVENT = 'perada:document-template-changed';

export function loadDocumentTemplateSettings(): DocumentTemplateSettings {
  if (typeof window === 'undefined') return defaultDocumentTemplateSettings;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultDocumentTemplateSettings;
    return { ...defaultDocumentTemplateSettings, ...JSON.parse(raw) };
  } catch {
    return defaultDocumentTemplateSettings;
  }
}

export function saveDocumentTemplateSettings(settings: DocumentTemplateSettings) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: settings }));
}

export function resetDocumentTemplateSettings() {
  saveDocumentTemplateSettings(defaultDocumentTemplateSettings);
}

export function useDocumentTemplateSettings() {
  const [settings, setSettings] = useState<DocumentTemplateSettings>(() => loadDocumentTemplateSettings());

  useEffect(() => {
    const sync = () => setSettings(loadDocumentTemplateSettings());
    const handleCustom = (event: Event) => {
      const custom = event as CustomEvent<DocumentTemplateSettings>;
      setSettings(custom.detail || loadDocumentTemplateSettings());
    };
    window.addEventListener('storage', sync);
    window.addEventListener(CHANGE_EVENT, handleCustom as EventListener);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(CHANGE_EVENT, handleCustom as EventListener);
    };
  }, []);

  return settings;
}

export const documentTemplateEvents = {
  openSettings: 'perada:open-document-template-settings',
  changed: CHANGE_EVENT,
};
