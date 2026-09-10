import { useState, useRef } from 'react';

interface LetterData {
  letterNumber: string;
  letterDate: string;
  letterType: 'tugas' | 'keterangan' | 'undangan' | 'lainnya';
  recipientName: string;
  recipientPosition: string;
  recipientCompany: string;
  recipientAddress: string;
  subject: string;
  body: string;
  closing: string;
  signatoryName: string;
  signatoryPosition: string;
  attachments: string;
  cc: string;
}

export default function OfficialLetterMaker() {
  const printRef = useRef<HTMLDivElement>(null);
  const [letterData, setLetterData] = useState<LetterData>({
    letterNumber: `LTR-${Date.now()}`,
    letterDate: new Date().toISOString().split('T')[0],
    letterType: 'tugas',
    recipientName: '',
    recipientPosition: '',
    recipientCompany: '',
    recipientAddress: '',
    subject: '',
    body: '',
    closing: 'Demikian surat ini kami sampaikan. Atas perhatian dan kerjasamanya, kami ucapkan terima kasih.',
    signatoryName: '',
    signatoryPosition: '',
    attachments: '',
    cc: '',
  });

  const getLetterTypeTitle = () => {
    switch (letterData.letterType) {
      case 'tugas': return 'SURAT TUGAS';
      case 'keterangan': return 'SURAT KETERANGAN';
      case 'undangan': return 'SURAT UNDANGAN';
      case 'lainnya': return 'SURAT RESMI';
      default: return 'SURAT RESMI';
    }
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Surat ${letterData.letterNumber}</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 40px; line-height: 1.6; }
            .kop-surat { text-align: center; border-bottom: 3px double #0A2540; padding-bottom: 15px; margin-bottom: 30px; }
            .company-name { font-size: 18px; font-weight: bold; color: #0A2540; }
            .company-address { font-size: 11px; color: #666; margin-top: 5px; }
            .letter-info { margin-bottom: 20px; }
            .letter-info-row { display: flex; margin-bottom: 5px; }
            .letter-info-label { width: 120px; font-weight: bold; }
            .letter-title { text-align: center; font-size: 14px; font-weight: bold; margin: 20px 0; text-decoration: underline; }
            .recipient { margin-bottom: 20px; }
            .body { text-align: justify; margin-bottom: 30px; }
            .closing { text-align: justify; margin-bottom: 40px; }
            .signature { text-align: right; margin-top: 50px; }
            .signature-line { margin-top: 60px; }
            .signature-name { font-weight: bold; margin-top: 5px; }
            .attachments { margin-top: 20px; font-size: 12px; }
            .cc { margin-top: 10px; font-size: 12px; }
            .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #ddd; padding-top: 10px; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0A2540] to-[#1E3A5F] flex items-center justify-center">
            <span className="text-white text-xs font-bold">PA</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">Official Letter Maker</h1>
            <p className="text-sm text-gray-600">PT Perdana Adi Yuda - Generator Surat Resmi</p>
          </div>
        </div>
        <button
          onClick={handlePrint}
          disabled={!letterData.subject || !letterData.body}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
        >
          🖨️ Print / Save PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Letter Details</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Letter Number</label>
                <input
                  type="text"
                  value={letterData.letterNumber}
                  onChange={(e) => setLetterData({ ...letterData, letterNumber: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Letter Date</label>
                <input
                  type="date"
                  value={letterData.letterDate}
                  onChange={(e) => setLetterData({ ...letterData, letterDate: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Letter Type</label>
              <select
                value={letterData.letterType}
                onChange={(e) => setLetterData({ ...letterData, letterType: e.target.value as any })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="tugas">Surat Tugas</option>
                <option value="keterangan">Surat Keterangan</option>
                <option value="undangan">Surat Undangan</option>
                <option value="lainnya">Surat Resmi Lainnya</option>
              </select>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Recipient Information</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Recipient Name"
                  value={letterData.recipientName}
                  onChange={(e) => setLetterData({ ...letterData, recipientName: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Recipient Position"
                  value={letterData.recipientPosition}
                  onChange={(e) => setLetterData({ ...letterData, recipientPosition: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Company/Organization"
                  value={letterData.recipientCompany}
                  onChange={(e) => setLetterData({ ...letterData, recipientCompany: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  placeholder="Recipient Address"
                  value={letterData.recipientAddress}
                  onChange={(e) => setLetterData({ ...letterData, recipientAddress: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Letter Content</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Subject"
                  value={letterData.subject}
                  onChange={(e) => setLetterData({ ...letterData, subject: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  placeholder="Body content..."
                  value={letterData.body}
                  onChange={(e) => setLetterData({ ...letterData, body: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={8}
                />
                <textarea
                  placeholder="Closing statement"
                  value={letterData.closing}
                  onChange={(e) => setLetterData({ ...letterData, closing: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Signatory</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Signatory Name"
                  value={letterData.signatoryName}
                  onChange={(e) => setLetterData({ ...letterData, signatoryName: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Signatory Position"
                  value={letterData.signatoryPosition}
                  onChange={(e) => setLetterData({ ...letterData, signatoryPosition: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Additional Information</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Attachments (if any)"
                  value={letterData.attachments}
                  onChange={(e) => setLetterData({ ...letterData, attachments: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="CC (Carbon Copy)"
                  value={letterData.cc}
                  onChange={(e) => setLetterData({ ...letterData, cc: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Preview</h2>
          <div ref={printRef} className="border rounded-lg p-8 bg-gray-50 font-serif text-sm">
            {/* Kop Surat */}
            <div className="kop-surat text-center border-b-4 border-double border-[#0A2540] pb-4 mb-6">
              <div className="text-lg font-bold text-[#0A2540]">PT PERDANA ADI YUDA</div>
              <div className="text-xs text-gray-600 mt-1">
                Jl. Contoh Alamat No. 123, Jakarta 12345<br />
                Telp: (021) 1234-5678 | Email: info@perada.net | Website: www.perada.net
              </div>
            </div>

            {/* Letter Info */}
            <div className="letter-info mb-6">
              <div className="letter-info-row">
                <div className="letter-info-label">Nomor</div>
                <div>: {letterData.letterNumber}</div>
              </div>
              <div className="letter-info-row">
                <div className="letter-info-label">Tanggal</div>
                <div>: {formatDate(letterData.letterDate)}</div>
              </div>
              <div className="letter-info-row">
                <div className="letter-info-label">Perihal</div>
                <div className="font-semibold">: {letterData.subject || '[Perihal Surat]'}</div>
              </div>
            </div>

            {/* Recipient */}
            <div className="recipient mb-6">
              <div>Kepada Yth.</div>
              <div className="font-semibold">{letterData.recipientName || '[Nama Penerima]'}</div>
              {letterData.recipientPosition && <div>{letterData.recipientPosition}</div>}
              {letterData.recipientCompany && <div>{letterData.recipientCompany}</div>}
              {letterData.recipientAddress && (
                <div className="whitespace-pre-line">{letterData.recipientAddress}</div>
              )}
            </div>

            {/* Letter Title */}
            <div className="letter-title text-center my-6 font-bold underline">
              {getLetterTypeTitle()}
            </div>

            {/* Body */}
            <div className="body mb-6 text-justify whitespace-pre-line">
              {letterData.body || '[Isi surat akan muncul di sini...]'}
            </div>

            {/* Closing */}
            <div className="closing mb-8 text-justify">
              {letterData.closing}
            </div>

            {/* Signature */}
            <div className="signature text-right">
              <div>Jakarta, {formatDate(letterData.letterDate)}</div>
              <div className="font-semibold mt-1">{letterData.signatoryName || '[Nama Penandatangan]'}</div>
              <div>{letterData.signatoryPosition || '[Jabatan]'}</div>
            </div>

            {/* Attachments */}
            {letterData.attachments && (
              <div className="attachments mt-8">
                <div className="font-semibold">Lampiran: {letterData.attachments}</div>
              </div>
            )}

            {/* CC */}
            {letterData.cc && (
              <div className="cc mt-4">
                <div className="font-semibold">CC: {letterData.cc}</div>
              </div>
            )}

            {/* Footer */}
            <div className="footer mt-12 text-center text-xs text-gray-500 border-t border-gray-300 pt-3">
              Dokumen ini dicetak secara elektronik oleh PT Perdana Adi Yuda
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
