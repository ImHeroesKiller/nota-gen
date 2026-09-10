import { useState } from 'react';

interface RouteData {
  origin: string;
  destination: string;
  distance: number;
  vehicleType: string;
  fuelConsumption: number;
  fuelPrice: number;
  tollCost: number;
  driverAllowance: number;
  totalFuel: number;
  totalCost: number;
}

export default function UangJalanCalculator() {
  const [data, setData] = useState<RouteData>({
    origin: '',
    destination: '',
    distance: 0,
    vehicleType: 'Truck',
    fuelConsumption: 8,
    fuelPrice: 10000,
    tollCost: 0,
    driverAllowance: 150000,
    totalFuel: 0,
    totalCost: 0,
  });

  const vehicleTypes = [
    { name: 'Motorcycle', consumption: 2 },
    { name: 'Car', consumption: 10 },
    { name: 'Pickup', consumption: 12 },
    { name: 'Truck', consumption: 8 },
    { name: 'Bus', consumption: 15 },
    { name: 'Excavator', consumption: 20 },
    { name: 'Dump Truck', consumption: 25 },
  ];

  const calculate = () => {
    const totalFuel = data.distance * data.fuelConsumption;
    const fuelCost = totalFuel * data.fuelPrice;
    const totalCost = fuelCost + data.tollCost + data.driverAllowance;

    setData({
      ...data,
      totalFuel,
      totalCost,
    });
  };

  const handleVehicleTypeChange = (vehicleType: string) => {
    const vehicle = vehicleTypes.find(v => v.name === vehicleType);
    if (vehicle) {
      setData({ ...data, vehicleType, fuelConsumption: vehicle.consumption });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0A2540] to-[#1E3A5F] flex items-center justify-center">
          <span className="text-white text-xs font-bold">PA</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold">Uang Jalan Calculator</h1>
          <p className="text-sm text-gray-600">PT Perdana Adi Yuda - Kalkulator Estimasi Uang Jalan, Bensin, dan Tol</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Route Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Origin</label>
              <input
                type="text"
                value={data.origin}
                onChange={(e) => setData({ ...data, origin: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Jakarta"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Destination</label>
              <input
                type="text"
                value={data.destination}
                onChange={(e) => setData({ ...data, destination: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Bandung"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Distance (km)</label>
              <input
                type="number"
                value={data.distance}
                onChange={(e) => setData({ ...data, distance: Number(e.target.value) })}
                onBlur={calculate}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Vehicle Type</label>
              <select
                value={data.vehicleType}
                onChange={(e) => handleVehicleTypeChange(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {vehicleTypes.map(vehicle => (
                  <option key={vehicle.name} value={vehicle.name}>
                    {vehicle.name} ({vehicle.consumption} L/100km)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Fuel Consumption (L/100km)</label>
              <input
                type="number"
                value={data.fuelConsumption}
                onChange={(e) => setData({ ...data, fuelConsumption: Number(e.target.value) })}
                onBlur={calculate}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Fuel Price (IDR/Liter)</label>
              <input
                type="number"
                value={data.fuelPrice}
                onChange={(e) => setData({ ...data, fuelPrice: Number(e.target.value) })}
                onBlur={calculate}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Toll Cost (IDR)</label>
              <input
                type="number"
                value={data.tollCost}
                onChange={(e) => setData({ ...data, tollCost: Number(e.target.value) })}
                onBlur={calculate}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Driver Allowance (IDR)</label>
              <input
                type="number"
                value={data.driverAllowance}
                onChange={(e) => setData({ ...data, driverAllowance: Number(e.target.value) })}
                onBlur={calculate}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={calculate}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              Calculate
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Estimation Results</h2>
          
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Route</div>
              <div className="text-lg font-bold">
                {data.origin || '-'} → {data.destination || '-'}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Distance: {data.distance} km
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Vehicle</div>
              <div className="text-lg font-bold">{data.vehicleType}</div>
              <div className="text-sm text-gray-600 mt-1">
                Consumption: {data.fuelConsumption} L/100km
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Cost Breakdown</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Fuel Needed:</span>
                  <span className="font-semibold">{data.totalFuel.toFixed(2)} Liter</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fuel Cost:</span>
                  <span className="font-semibold">{formatCurrency(data.totalFuel * data.fuelPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Toll Cost:</span>
                  <span className="font-semibold">{formatCurrency(data.tollCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Driver Allowance:</span>
                  <span className="font-semibold">{formatCurrency(data.driverAllowance)}</span>
                </div>
              </div>
            </div>

            <div className="border-t-2 border-blue-500 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">Total Uang Jalan:</span>
                <span className="text-2xl font-bold text-blue-600">{formatCurrency(data.totalCost)}</span>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="text-sm font-semibold text-yellow-900 mb-2">💡 Catatan:</div>
              <ul className="text-xs text-yellow-800 space-y-1">
                <li>• Estimasi ini belum termasuk biaya parkir dan makan driver</li>
                <li>• Konsumsi bahan bakar dapat bervariasi tergantung kondisi jalan</li>
                <li>• Harga BBM dapat berubah sewaktu-waktu</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
