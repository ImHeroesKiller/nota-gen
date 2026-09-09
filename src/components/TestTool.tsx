export default function TestTool({ onBack, darkMode }: any) {
  return (
    <div className={`h-screen flex flex-col ${darkMode ? 'bg-[#0f1419] text-white' : 'bg-white text-black'}`}>
      <header className="p-4 border-b">
        <button onClick={onBack} className="px-4 py-2 bg-blue-500 text-white rounded">
          ← Back
        </button>
        <span className="ml-4">Test Tool</span>
      </header>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Test Tool Berhasil!</h1>
          <p className="text-lg">Jika Anda melihat halaman ini, routing bekerja dengan baik.</p>
        </div>
      </div>
    </div>
  );
}
