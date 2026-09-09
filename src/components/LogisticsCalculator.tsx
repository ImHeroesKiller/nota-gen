import React, { useState } from 'react';

type CalculatorMode = 'volume' | 'weight' | 'cost' | 'distance' | 'fuel';

interface LogisticsCalculatorProps {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

export default function LogisticsCalculator({ onBack, darkMode, setDarkMode }: LogisticsCalculatorProps) {
  const [mode, setMode] = useState<CalculatorMode>('volume');
  
  // Volume Calculator State
  const [length, setLength] = useState<string>('');
  const [width, setWidth] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [volumeUnit, setVolumeUnit] = useState<string>('cm');
  
  // Weight Calculator State
  const [quantity, setQuantity] = useState<string>('');
  const [weightPerItem, setWeightPerItem] = useState<string>('');
  const [weightUnit, setWeightUnit] = useState<string>('kg');
  
  // Cost Calculator State
  const [baseCost, setBaseCost] = useState<string>('');
  const [taxRate, setTaxRate] = useState<string>('11');
  const [discount, setDiscount] = useState<string>('0');
  
  // Distance Calculator State
  const [speed, setSpeed] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [distanceUnit, setDistanceUnit] = useState<string>('km');
  
  // Fuel Calculator State
  const [distance, setDistance] = useState<string>('');
  const [fuelConsumption, setFuelConsumption] = useState<string>('');
  const [fuelPrice, setFuelPrice] = useState<string>('');

  // Volume Calculation
  const calculateVolume = () => {
    const l = parseFloat(length) || 0;
    const w = parseFloat(width) || 0;
    const h = parseFloat(height) || 0;
    
    let volume = l * w * h;
    let unit = 'cm³';
    
    if (volumeUnit === 'm') {
      unit = 'm³';
    } else if (volumeUnit === 'inch') {
      unit = 'in³';
      volume = volume; // already in inches
    }
    
    // Convert to CBM (Cubic Meter) for logistics
    let cbm = 0;
    if (volumeUnit === 'cm') {
      cbm = volume / 1000000;
    } else if (volumeUnit === 'm') {
      cbm = volume;
    } else if (volumeUnit === 'inch') {
      cbm = volume / 61023.7;
    }
    
    return { volume: volume.toFixed(2), unit, cbm: cbm.toFixed(6) };
  };

  // Weight Calculation
  const calculateWeight = () => {
    const qty = parseFloat(quantity) || 0;
    const weight = parseFloat(weightPerItem) || 0;
    const totalWeight = qty * weight;
    
    let unit = 'kg';
    let tons = 0;
    
    if (weightUnit === 'kg') {
      unit = 'kg';
      tons = totalWeight / 1000;
    } else if (weightUnit === 'gram') {
      unit = 'g';
      tons = totalWeight / 1000000;
    } else if (weightUnit === 'ton') {
      unit = 'ton';
      tons = totalWeight;
    } else if (weightUnit === 'lb') {
      unit = 'lb';
      tons = (totalWeight * 0.453592) / 1000;
    }
    
    return { totalWeight: totalWeight.toFixed(2), unit, tons: tons.toFixed(4) };
  };

  // Cost Calculation
  const calculateCost = () => {
    const base = parseFloat(baseCost) || 0;
    const tax = parseFloat(taxRate) || 0;
    const disc = parseFloat(discount) || 0;
    
    const discountedAmount = base - (base * disc / 100);
    const taxAmount = discountedAmount * tax / 100;
    const totalAmount = discountedAmount + taxAmount;
    
    return {
      discountedAmount: discountedAmount.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
    };
  };

  // Distance Calculation
  const calculateDistance = () => {
    const s = parseFloat(speed) || 0;
    const t = parseFloat(time) || 0;
    const distance = s * t;
    
    return { distance: distance.toFixed(2), unit: distanceUnit };
  };

  // Fuel Calculation
  const calculateFuel = () => {
    const dist = parseFloat(distance) || 0;
    const consumption = parseFloat(fuelConsumption) || 0;
    const price = parseFloat(fuelPrice) || 0;
    
    const fuelNeeded = (dist * consumption) / 100;
    const totalCost = fuelNeeded * price;
    
    return {
      fuelNeeded: fuelNeeded.toFixed(2),
      totalCost: totalCost.toFixed(2),
    };
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(parseFloat(amount) || 0);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Logistics Calculator</h1>
        <p className="text-gray-600">Calculate volume, weight, cost, distance, and fuel consumption</p>
      </div>

      {/* Mode Selection */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-xl font-bold mb-4">Calculator Mode</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <button
            onClick={() => setMode('volume')}
            className={`px-4 py-2 rounded-lg font-medium ${
              mode === 'volume' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Volume
          </button>
          <button
            onClick={() => setMode('weight')}
            className={`px-4 py-2 rounded-lg font-medium ${
              mode === 'weight' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Weight
          </button>
          <button
            onClick={() => setMode('cost')}
            className={`px-4 py-2 rounded-lg font-medium ${
              mode === 'cost' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Cost
          </button>
          <button
            onClick={() => setMode('distance')}
            className={`px-4 py-2 rounded-lg font-medium ${
              mode === 'distance' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Distance
          </button>
          <button
            onClick={() => setMode('fuel')}
            className={`px-4 py-2 rounded-lg font-medium ${
              mode === 'fuel' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Fuel
          </button>
        </div>
      </div>

      {/* Calculator Interface */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Volume Calculator */}
        {mode === 'volume' && (
          <div>
            <h3 className="text-xl font-bold mb-4">Volume Calculator</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Length</label>
                <input
                  type="number"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Enter length"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Width</label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Enter width"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Height</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Enter height"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Unit</label>
                <select
                  value={volumeUnit}
                  onChange={(e) => setVolumeUnit(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="cm">Centimeters (cm)</option>
                  <option value="m">Meters (m)</option>
                  <option value="inch">Inches (in)</option>
                </select>
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Volume:</div>
              <div className="text-2xl font-bold text-blue-600">
                {calculateVolume().volume} {calculateVolume().unit}
              </div>
              <div className="text-sm text-gray-600 mt-2">CBM (Cubic Meter):</div>
              <div className="text-xl font-bold text-blue-600">
                {calculateVolume().cbm} m³
              </div>
            </div>
          </div>
        )}

        {/* Weight Calculator */}
        {mode === 'weight' && (
          <div>
            <h3 className="text-xl font-bold mb-4">Weight Calculator</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Enter quantity"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Weight per Item</label>
                <input
                  type="number"
                  value={weightPerItem}
                  onChange={(e) => setWeightPerItem(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Enter weight per item"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Unit</label>
                <select
                  value={weightUnit}
                  onChange={(e) => setWeightUnit(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="kg">Kilograms (kg)</option>
                  <option value="gram">Grams (g)</option>
                  <option value="ton">Tons (t)</option>
                  <option value="lb">Pounds (lb)</option>
                </select>
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Total Weight:</div>
              <div className="text-2xl font-bold text-blue-600">
                {calculateWeight().totalWeight} {calculateWeight().unit}
              </div>
              <div className="text-sm text-gray-600 mt-2">In Tons:</div>
              <div className="text-xl font-bold text-blue-600">
                {calculateWeight().tons} tons
              </div>
            </div>
          </div>
        )}

        {/* Cost Calculator */}
        {mode === 'cost' && (
          <div>
            <h3 className="text-xl font-bold mb-4">Cost Calculator</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Base Cost (IDR)</label>
                <input
                  type="number"
                  value={baseCost}
                  onChange={(e) => setBaseCost(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Enter base cost"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tax Rate (%)</label>
                <input
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Enter tax rate"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Discount (%)</label>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Enter discount"
                />
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">After Discount:</span>
                <span className="font-bold">{formatCurrency(calculateCost().discountedAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax Amount:</span>
                <span className="font-bold">{formatCurrency(calculateCost().taxAmount)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-gray-600 font-semibold">Total Amount:</span>
                <span className="text-2xl font-bold text-blue-600">{formatCurrency(calculateCost().totalAmount)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Distance Calculator */}
        {mode === 'distance' && (
          <div>
            <h3 className="text-xl font-bold mb-4">Distance Calculator</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Speed</label>
                <input
                  type="number"
                  value={speed}
                  onChange={(e) => setSpeed(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Enter speed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Time (hours)</label>
                <input
                  type="number"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Enter time"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Unit</label>
                <select
                  value={distanceUnit}
                  onChange={(e) => setDistanceUnit(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="km">Kilometers (km)</option>
                  <option value="miles">Miles (mi)</option>
                </select>
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Distance:</div>
              <div className="text-2xl font-bold text-blue-600">
                {calculateDistance().distance} {calculateDistance().unit}
              </div>
            </div>
          </div>
        )}

        {/* Fuel Calculator */}
        {mode === 'fuel' && (
          <div>
            <h3 className="text-xl font-bold mb-4">Fuel Consumption Calculator</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Distance ({distanceUnit})</label>
                <input
                  type="number"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Enter distance"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Fuel Consumption (L/100km)</label>
                <input
                  type="number"
                  value={fuelConsumption}
                  onChange={(e) => setFuelConsumption(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Enter consumption"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Fuel Price (IDR/Liter)</label>
                <input
                  type="number"
                  value={fuelPrice}
                  onChange={(e) => setFuelPrice(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Enter fuel price"
                />
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Fuel Needed:</span>
                <span className="text-xl font-bold text-blue-600">{calculateFuel().fuelNeeded} liters</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-gray-600 font-semibold">Total Cost:</span>
                <span className="text-2xl font-bold text-blue-600">{formatCurrency(calculateFuel().totalCost)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
