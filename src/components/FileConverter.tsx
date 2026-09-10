import { useState, useRef } from 'react';

interface ConvertedFile {
  id: string;
  originalName: string;
  originalSize: number;
  convertedBlob: Blob;
  convertedName: string;
  convertedSize: number;
  format: string;
}

interface FileConverterProps {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

export default function FileConverter({ onBack, darkMode, setDarkMode }: FileConverterProps) {
  const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([]);
  const [targetFormat, setTargetFormat] = useState<string>('png');
  const [quality, setQuality] = useState<number>(90);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`);
        continue;
      }

      try {
        const convertedBlob = await convertImage(file, targetFormat, quality / 100);
        const convertedName = file.name.replace(/\.[^/.]+$/, '') + '.' + targetFormat;
        
        const newFile: ConvertedFile = {
          id: Date.now().toString() + i,
          originalName: file.name,
          originalSize: file.size,
          convertedBlob,
          convertedName,
          convertedSize: convertedBlob.size,
          format: targetFormat,
        };

        setConvertedFiles(prev => [newFile, ...prev]);
      } catch (error) {
        console.error('Error converting file:', error);
        alert(`Error converting ${file.name}`);
      }
    }

    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const convertImage = (file: File, format: string, quality: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0);

        let mimeType = 'image/png';
        if (format === 'jpeg' || format === 'jpg') {
          mimeType = 'image/jpeg';
        } else if (format === 'webp') {
          mimeType = 'image/webp';
        }

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Conversion failed'));
            }
          },
          mimeType,
          quality
        );

        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const downloadFile = (file: ConvertedFile) => {
    const url = URL.createObjectURL(file.convertedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.convertedName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAll = () => {
    convertedFiles.forEach((file, index) => {
      setTimeout(() => {
        downloadFile(file);
      }, index * 200);
    });
  };

  const deleteFile = (id: string) => {
    setConvertedFiles(prev => prev.filter(f => f.id !== id));
  };

  const clearAll = () => {
    if (confirm('Are you sure you want to clear all converted files?')) {
      setConvertedFiles([]);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">File Converter</h1>
        <p className="text-gray-600">Convert images between different formats</p>
      </div>

      {/* Settings */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-xl font-bold mb-4">Conversion Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Target Format</label>
            <select
              value={targetFormat}
              onChange={(e) => setTargetFormat(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="png">PNG (Lossless)</option>
              <option value="jpeg">JPEG (Lossy)</option>
              <option value="webp">WebP (Modern)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Quality: {quality}%</label>
            <input
              type="range"
              min="10"
              max="100"
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              {targetFormat === 'png' ? 'Quality setting has no effect on PNG' : 'Higher quality = larger file size'}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
          >
            {isProcessing ? 'Converting...' : 'Select Images'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>

      {/* Converted Files */}
      {convertedFiles.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Converted Files ({convertedFiles.length})</h3>
            <div className="flex gap-2">
              <button
                onClick={downloadAll}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Download All
              </button>
              <button
                onClick={clearAll}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {convertedFiles.map((file) => (
              <div key={file.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold">{file.convertedName}</h4>
                    <p className="text-sm text-gray-500">From: {file.originalName}</p>
                  </div>
                  <button
                    onClick={() => deleteFile(file.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex gap-4">
                    <span className="text-gray-600">
                      Original: <strong>{formatBytes(file.originalSize)}</strong>
                    </span>
                    <span className="text-gray-600">
                      Converted: <strong>{formatBytes(file.convertedSize)}</strong>
                    </span>
                    <span className={`font-medium ${file.convertedSize < file.originalSize ? 'text-green-600' : 'text-red-600'}`}>
                      {file.convertedSize < file.originalSize ? '↓' : '↑'}{' '}
                      {Math.abs(Math.round(((file.convertedSize - file.originalSize) / file.originalSize) * 100))}%
                    </span>
                  </div>
                  <button
                    onClick={() => downloadFile(file)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {convertedFiles.length === 0 && !isProcessing && (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <p className="text-gray-500">No converted files yet. Select images to start converting.</p>
        </div>
      )}
    </div>
  );
}
