import React, { useState } from 'react';

interface CbmCalculatorProps {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

interface CargoItem {
  id: string;
  length: string;
  width: string;
  height: string;
  weight: string;
  quantity: string;
}

export default function CbmCalculator({ onBack, darkMode, setDarkMode }: CbmCalculatorProps) {
  const [items, setItems] = useState<CargoItem[]>([
    { id: '1', length: '100', width: '80', height: '120', weight: '50', quantity: '10' },
  ]);
  const [unit, setUnit] = useState<string>('cm');

  const addItem = () => {
    const newItem: CargoItem = {
      id: Date.now().toString(),
      length: '',
      width: '',
      height: '',
      weight: '',
      quantity: '1',
    };
    setItems([...items, newItem]);
  };

  const updateItem = (id: string, field: keyof CargoItem, value: string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const calculateCbm = () => {
    let totalCbm = 0;
    let totalWeight = 0;
    let totalCartons = 0;

    items.forEach(item => {
      const length = parseFloat(item.length) || 0;
      const width = parseFloat(item.width) || 0;
      const height = parseFloat(item.height) || 0;
      const weight = parseFloat(item.weight) || 0;
      const quantity = parseFloat(item.quantity) || 0;

      let volume = 0;
      if (unit === 'cm') {
        volume = (length * width * height) / 1000000; // Convert cm³ to m³
      } else if (unit === 'm') {
        volume = length * width * height;
      } else if (unit === 'inch') {
        volume = (length * width * height) / 61023.7; // Convert in³ to m³
      }

      totalCbm += volume * quantity;
      totalWeight += weight * quantity;
      totalCartons += quantity;
    });

    return { totalCbm, totalWeight, totalCartons };
  };

  const getContainerRecommendation = (cbm: number, weight: number) => {
    // Container specifications (approximate)
    const containers = {
      'LCL': { maxCbm: 15, maxWeight: 15000, description: 'Less than Container Load' },
      '20ft': { maxCbm: 33, maxWeight: 28000, description: '20-foot Container' },
      '40ft': { maxCbm: 67, maxWeight: 26000, description: '40-foot Container' },
      '40HC': { maxCbm: 76, maxWeight: 26500, description: '40-foot High Cube' },
    };

    if (cbm <= 0) return null;

    // Check weight limit first
    if (weight > 26500) {
      return { type: 'OVERWEIGHT', description: 'Weight exceeds maximum container capacity' };
    }

    // Recommend based on CBM
    if (cbm <= containers.LCL.maxCbm) {
      return { type: 'LCL', description: containers.LCL.description, utilization: (cbm / containers.LCL.maxCbm * 100).toFixed(1) };
    } else if (cbm <= containers['20ft'].maxCbm) {
      return { type: '20ft', description: containers['20ft'].description, utilization: (cbm / containers['20ft'].maxCbm * 100).toFixed(1) };
    } else if (cbm <= containers['40ft'].maxCbm) {
      return { type: '40ft', description: containers['40ft'].description, utilization: (cbm / containers['40ft'].maxCbm * 100).toFixed(1) };
    } else if (cbm <= containers['40HC'].maxCbm) {
      return { type: '40HC', description: containers['40HC'].description, utilization: (cbm / containers['40HC'].maxCbm * 100).toFixed(1) };
    } else {
      return { type: 'MULTIPLE', description: 'Multiple containers required' };
    }
  };

  const results = calculateCbm();
  const recommendation = getContainerRecommendation(results.totalCbm, results.totalWeight);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">CBM Calculator</h1>
        <p className="text-gray-600">Calculate container load and CBM for shipping</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Cargo Items</h3>
          <div className="flex gap-2">
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="cm">Centimeters (cm)</option>
              <option value="m">Meters (m)</option>
              <option value="inch">Inches (in)</option>
            </select>
            <button
              onClick={addItem}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              + Add Item
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={item.id} className="grid grid-cols-6 gap-2 p-3 border rounded-lg">
              <div>
                <label className="text-xs text-gray-600">Length</label>
                <input
                  type="number"
                  value={item.length}
                  onChange={(e) => updateItem(item.id, 'length', e.target.value)}
                  className="w-full px-2 py-1 border rounded text-sm"
                  placeholder="L"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Width</label>
                <input
                  type="number"
                  value={item.width}
                  onChange={(e) => updateItem(item.id, 'width', e.target.value)}
                  className="w-full px-2 py-1 border rounded text-sm"
                  placeholder="W"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Height</label>
                <input
                  type="number"
                  value={item.height}
                  onChange={(e) => updateItem(item.id, 'height', e.target.value)}
                  className="w-full px-2 py-1 border rounded text-sm"
                  placeholder="H"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Weight (kg)</label>
                <input
                  type="number"
                  value={item.weight}
                  onChange={(e) => updateItem(item.id, 'weight', e.target.value)}
                  className="w-full px-2 py-1 border rounded text-sm"
                  placeholder="W"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Quantity</label>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                  className="w-full px-2 py-1 border rounded text-sm"
                  placeholder="Qty"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => removeItem(item.id)}
                  disabled={items.length === 1}
                  className="w-full px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Summary */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total CBM:</span>
              <span className="text-2xl font-bold text-blue-600">{results.totalCbm.toFixed(3)} m³</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Weight:</span>
              <span className="text-xl font-bold">{results.totalWeight.toFixed(2)} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Cartons:</span>
              <span className="text-xl font-bold">{results.totalCartons}</span>
            </div>
          </div>
        </div>

        {/* Recommendation */}
        <div className="bg-green-50 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Container Recommendation</h3>
          {recommendation ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Recommended:</span>
                <span className="text-2xl font-bold text-green-600">{recommendation.type}</span>
              </div>
              <div className="text-sm text-gray-600">{recommendation.description}</div>
              {recommendation.utilization && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Container Utilization:</span>
                    <span>{recommendation.utilization}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${Math.min(parseFloat(recommendation.utilization), 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Add cargo items to see recommendation</p>
          )}
        </div>
      </div>
    </div>
  );
}
