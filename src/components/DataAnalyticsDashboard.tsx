import { useState } from 'react';

interface AnalyticsData {
  totalShipments: number;
  deliveredShipments: number;
  inTransitShipments: number;
  delayedShipments: number;
  averageDeliveryTime: number;
  totalRevenue: number;
  topClients: { name: string; shipments: number }[];
  monthlyData: { month: string; shipments: number; revenue: number }[];
}

export default function DataAnalyticsDashboard() {
  const [data] = useState<AnalyticsData>({
    totalShipments: 1250,
    deliveredShipments: 1100,
    inTransitShipments: 120,
    delayedShipments: 30,
    averageDeliveryTime: 3.5,
    totalRevenue: 2500000000,
    topClients: [
      { name: 'PT ABC', shipments: 150 },
      { name: 'PT XYZ', shipments: 120 },
      { name: 'PT DEF', shipments: 95 },
      { name: 'PT GHI', shipments: 80 },
      { name: 'PT JKL', shipments: 65 },
    ],
    monthlyData: [
      { month: 'Jan', shipments: 95, revenue: 190000000 },
      { month: 'Feb', shipments: 110, revenue: 220000000 },
      { month: 'Mar', shipments: 105, revenue: 210000000 },
      { month: 'Apr', shipments: 120, revenue: 240000000 },
      { month: 'May', shipments: 115, revenue: 230000000 },
      { month: 'Jun', shipments: 130, revenue: 260000000 },
    ],
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const maxShipments = Math.max(...data.monthlyData.map(d => d.shipments));
  const maxRevenue = Math.max(...data.monthlyData.map(d => d.revenue));

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Data Analytics Dashboard</h1>
        <p className="text-gray-600">Comprehensive analytics and insights for logistics operations</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Total Shipments</div>
          <div className="text-3xl font-bold text-gray-900">{data.totalShipments}</div>
          <div className="text-xs text-green-600 mt-2">↑ 12% from last month</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Delivered</div>
          <div className="text-3xl font-bold text-green-600">{data.deliveredShipments}</div>
          <div className="text-xs text-gray-500 mt-2">
            {((data.deliveredShipments / data.totalShipments) * 100).toFixed(1)}% success rate
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">In Transit</div>
          <div className="text-3xl font-bold text-blue-600">{data.inTransitShipments}</div>
          <div className="text-xs text-gray-500 mt-2">Active shipments</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(data.totalRevenue)}</div>
          <div className="text-xs text-green-600 mt-2">↑ 8% from last month</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Shipments Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Monthly Shipments</h3>
          <div className="space-y-3">
            {data.monthlyData.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-12 text-sm text-gray-600">{item.month}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-8 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full flex items-center justify-end pr-2 text-white text-xs font-semibold"
                    style={{ width: `${(item.shipments / maxShipments) * 100}%` }}
                  >
                    {item.shipments}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Monthly Revenue</h3>
          <div className="space-y-3">
            {data.monthlyData.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-12 text-sm text-gray-600">{item.month}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-8 overflow-hidden">
                  <div
                    className="bg-green-500 h-full flex items-center justify-end pr-2 text-white text-xs font-semibold"
                    style={{ width: `${(item.revenue / maxRevenue) * 100}%` }}
                  >
                    {formatCurrency(item.revenue)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Clients */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Top Clients</h3>
        <div className="space-y-3">
          {data.topClients.map((client, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div className="font-medium">{client.name}</div>
              </div>
              <div className="text-sm text-gray-600">
                {client.shipments} shipments
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
