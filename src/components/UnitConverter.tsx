import { useState } from 'react';

type Category = 'length' | 'weight' | 'volume' | 'temperature' | 'area' | 'speed';

interface UnitInfo {
  name: string;
  toBase: (value: number) => number;
  fromBase: (value: number) => number;
}

const conversionData: Record<Category, { units: Record<string, UnitInfo>; baseUnit: string }> = {
  length: {
    baseUnit: 'meter',
    units: {
      meter: { name: 'Meter (m)', toBase: (v) => v, fromBase: (v) => v },
      kilometer: { name: 'Kilometer (km)', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      centimeter: { name: 'Centimeter (cm)', toBase: (v) => v / 100, fromBase: (v) => v * 100 },
      millimeter: { name: 'Millimeter (mm)', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      mile: { name: 'Mile (mi)', toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
      yard: { name: 'Yard (yd)', toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144 },
      foot: { name: 'Foot (ft)', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
      inch: { name: 'Inch (in)', toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
    }
  },
  weight: {
    baseUnit: 'kilogram',
    units: {
      kilogram: { name: 'Kilogram (kg)', toBase: (v) => v, fromBase: (v) => v },
      gram: { name: 'Gram (g)', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      milligram: { name: 'Milligram (mg)', toBase: (v) => v / 1000000, fromBase: (v) => v * 1000000 },
      ton: { name: 'Ton (t)', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      pound: { name: 'Pound (lb)', toBase: (v) => v * 0.453592, fromBase: (v) => v / 0.453592 },
      ounce: { name: 'Ounce (oz)', toBase: (v) => v * 0.0283495, fromBase: (v) => v / 0.0283495 },
    }
  },
  volume: {
    baseUnit: 'liter',
    units: {
      liter: { name: 'Liter (L)', toBase: (v) => v, fromBase: (v) => v },
      milliliter: { name: 'Milliliter (mL)', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      cubicMeter: { name: 'Cubic Meter (m³)', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      gallon: { name: 'Gallon (gal)', toBase: (v) => v * 3.78541, fromBase: (v) => v / 3.78541 },
      cubicFoot: { name: 'Cubic Foot (ft³)', toBase: (v) => v * 28.3168, fromBase: (v) => v / 28.3168 },
    }
  },
  temperature: {
    baseUnit: 'celsius',
    units: {
      celsius: { name: 'Celsius (°C)', toBase: (v) => v, fromBase: (v) => v },
      fahrenheit: { name: 'Fahrenheit (°F)', toBase: (v) => (v - 32) * 5 / 9, fromBase: (v) => (v * 9 / 5) + 32 },
      kelvin: { name: 'Kelvin (°K)', toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
    }
  },
  area: {
    baseUnit: 'squareMeter',
    units: {
      squareMeter: { name: 'Square Meter (m²)', toBase: (v) => v, fromBase: (v) => v },
      squareKilometer: { name: 'Square Kilometer (km²)', toBase: (v) => v * 1000000, fromBase: (v) => v / 1000000 },
      squareFoot: { name: 'Square Foot (ft²)', toBase: (v) => v * 0.092903, fromBase: (v) => v / 0.092903 },
      acre: { name: 'Acre', toBase: (v) => v * 4046.86, fromBase: (v) => v / 4046.86 },
      hectare: { name: 'Hectare (ha)', toBase: (v) => v * 10000, fromBase: (v) => v / 10000 },
    }
  },
  speed: {
    baseUnit: 'meterPerSecond',
    units: {
      meterPerSecond: { name: 'Meter/second (m/s)', toBase: (v) => v, fromBase: (v) => v },
      kilometerPerHour: { name: 'Kilometer/hour (km/h)', toBase: (v) => v / 3.6, fromBase: (v) => v * 3.6 },
      milePerHour: { name: 'Mile/hour (mph)', toBase: (v) => v * 0.44704, fromBase: (v) => v / 0.44704 },
      knot: { name: 'Knot (kn)', toBase: (v) => v * 0.514444, fromBase: (v) => v / 0.514444 },
    }
  },
};

interface UnitConverterProps {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

export default function UnitConverter({ onBack, darkMode, setDarkMode }: UnitConverterProps) {
  const [category, setCategory] = useState<Category>('length');
  const [fromUnit, setFromUnit] = useState<string>('meter');
  const [toUnit, setToUnit] = useState<string>('kilometer');
  const [inputValue, setInputValue] = useState<string>('1');
  const [result, setResult] = useState<string>('0.001');

  const handleCategoryChange = (newCategory: Category) => {
    setCategory(newCategory);
    const units = Object.keys(conversionData[newCategory].units);
    setFromUnit(units[0]);
    setToUnit(units[1] || units[0]);
    setInputValue('1');
    convert('1', units[0], units[1] || units[0], newCategory);
  };

  const convert = (value: string, from: string, to: string, cat: Category = category) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      setResult('0');
      return;
    }

    const fromUnitInfo = conversionData[cat].units[from];
    const toUnitInfo = conversionData[cat].units[to];

    // Convert to base unit first, then to target unit
    const baseValue = fromUnitInfo.toBase(numValue);
    const convertedValue = toUnitInfo.fromBase(baseValue);

    setResult(convertedValue.toFixed(6).replace(/\.?0+$/, ''));
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    convert(value, fromUnit, toUnit);
  };

  const handleFromUnitChange = (value: string) => {
    setFromUnit(value);
    convert(inputValue, value, toUnit);
  };

  const handleToUnitChange = (value: string) => {
    setToUnit(value);
    convert(inputValue, fromUnit, value);
  };

  const swapUnits = () => {
    const tempFrom = fromUnit;
    setFromUnit(toUnit);
    setToUnit(tempFrom);
    convert(inputValue, toUnit, tempFrom);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Unit Converter</h1>
        <p className="text-gray-600">Convert between different units of measurement</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Category Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Category</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Object.keys(conversionData).map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat as Category)}
                className={`px-4 py-2 rounded-lg font-medium capitalize ${
                  category === cat
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Conversion Interface */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">From</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter value"
              />
              <select
                value={fromUnit}
                onChange={(e) => handleFromUnitChange(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(conversionData[category].units).map(([key, unit]) => (
                  <option key={key} value={key}>{unit.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <button
              onClick={swapUnits}
              className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              ⇅ Swap
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">To</label>
            <div className="flex gap-2">
              <div className="flex-1 px-4 py-2 border rounded-lg bg-gray-50 font-mono text-lg">
                {result}
              </div>
              <select
                value={toUnit}
                onChange={(e) => handleToUnitChange(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(conversionData[category].units).map(([key, unit]) => (
                  <option key={key} value={key}>{unit.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Quick Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Formula:</strong> {inputValue} {conversionData[category].units[fromUnit].name} = {result} {conversionData[category].units[toUnit].name}
          </p>
        </div>
      </div>
    </div>
  );
}
