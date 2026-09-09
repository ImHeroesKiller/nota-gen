import { useState } from 'react';

interface KpiMetric {
  id: string;
  division: string;
  client: string;
  metricName: string;
  target: number;
  actual: number;
  unit: string;
  period: string;
  status: 'on-track' | 'at-risk' | 'off-track';
}

interface SlaMetric {
  id: string;
  division: string;
  client: string;
  slaName: string;
  target: number;
  actual: number;
  unit: string;
  period: string;
  status: 'compliant' | 'warning' | 'breach';
}

export default function SlaKpiDashboard() {
  const [kpiMetrics] = useState<KpiMetric[]>([
    {
      id: '1',
      division: 'Security',
      client: 'PT ABC Manufacturing',
      metricName: 'Response Time',
      target: 5,
      actual: 4.2,
      unit: 'menit',
      period: 'Jan 2026',
      status: 'on-track',
    },
    {
      id: '2',
      division: 'Cleaning Service',
      client: 'PT XYZ Tower',
      metricName: 'Cleanliness Score',
      target: 90,
      actual: 87,
      unit: '%',
      period: 'Jan 2026',
      status: 'at-risk',
    },
    {
      id: '3',
      division: 'Customer Service',
      client: 'PT DEF Telecom',
      metricName: 'First Call Resolution',
      target: 85,
      actual: 78,
      unit: '%',
      period: 'Jan 2026',
      status: 'off-track',
    },
  ]);

  const [slaMetrics] = useState<SlaMetric[]>([
    {
      id: '1',
      division: 'Security',
      client: 'PT ABC Manufacturing',
      slaName: 'Patrol Frequency',
      target: 100,
      actual: 100,
      unit: '%',
      period: 'Jan 2026',
      status: 'compliant',
    },
    {
      id: '2',
      division: 'Cleaning Service',
      client: 'PT XYZ Tower',
      slaName: 'Task Completion',
      target: 95,
      actual: 92,
      unit: '%',
      period: 'Jan 2026',
      status: 'warning',
    },
    {
      id: '3',
      division: 'Customer Service',
      client: 'PT DEF Telecom',
      slaName: 'Service Level',
      target: 99,
      actual: 94,
      unit: '%',
      period: 'Jan 2026',
      status: 'breach',
    },
  ]);

  const [filterDivision, setFilterDivision] = useState<string>('all');
  const [filterClient, setFilterClient] = useState<string>('all');

  const divisions = Array.from(new Set([...kpiMetrics.map(k => k.division), ...slaMetrics.map(s => s.division)]));
  const clients = Array.from(new Set([...kpiMetrics.map(k => k.client), ...slaMetrics.map(s => s.client)]));

  const filteredKpi = kpiMetrics.filter(k => {
    const matchDivision = filterDivision === 'all' || k.division === filterDivision;
    const matchClient = filterClient === 'all' || k.client === filterClient;
    return matchDivision && matchClient;
  });

  const filteredSla = slaMetrics.filter(s => {
    const matchDivision = filterDivision === 'all' || s.division === filterDivision;
    const matchClient = filterClient === 'all' || s.client === filterClient;
    return matchDivision && matchClient;
  });

  const getKpiStatusBadge = (status: string) => {
    const styles = {
      'on-track': 'bg-green-100 text-green-800',
      'at-risk': 'bg-yellow-100 text-yellow-800',
      'off-track': 'bg-red-100 text-red-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const getSlaStatusBadge = (status: string) => {
    const styles = {
      'compliant': 'bg-green-100 text-green-800',
      'warning': 'bg-yellow-100 text-yellow-800',
      'breach': 'bg-red-100 text-red-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const calculatePerformance = (actual: number, target: number) => {
    return ((actual / target) * 100).toFixed(1);
  };

  const onTrackCount = kpiMetrics.filter(k => k.status === 'on-track').length;
  const compliantCount = slaMetrics.filter(s => s.status === 'compliant').length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0A2540] to-[#1E3A5F] flex items-center justify-center">
            <span className="text-white text-xs font-bold">PA</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">SLA & KPI Tracking Dashboard</h1>
            <p className="text-sm text-gray-600">PT Perdana Adi Yuda - Dashboard Performa Divisi Outsourcing</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Total KPI Metrics</div>
          <div className="text-3xl font-bold text-blue-600">{kpiMetrics.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">KPI On Track</div>
          <div className="text-3xl font-bold text-green-600">{onTrackCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Total SLA Metrics</div>
          <div className="text-3xl font-bold text-purple-600">{slaMetrics.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">SLA Compliant</div>
          <div className="text-3xl font-bold text-green-600">{compliantCount}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Filter by Division</label>
            <select
              value={filterDivision}
              onChange={(e) => setFilterDivision(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Divisions</option>
              {divisions.map(div => (
                <option key={div} value={div}>{div}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Filter by Client</label>
            <select
              value={filterClient}
              onChange={(e) => setFilterClient(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Clients</option>
              {clients.map(client => (
                <option key={client} value={client}>{client}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPI Section */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Key Performance Indicators (KPI)</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Division</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Metric</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actual</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performance</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredKpi.map((kpi) => (
                <tr key={kpi.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{kpi.division}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{kpi.client}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{kpi.metricName}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{kpi.target} {kpi.unit}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">{kpi.actual} {kpi.unit}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            kpi.status === 'on-track' ? 'bg-green-500' :
                            kpi.status === 'at-risk' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(parseFloat(calculatePerformance(kpi.actual, kpi.target)), 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold">{calculatePerformance(kpi.actual, kpi.target)}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getKpiStatusBadge(kpi.status)}`}>
                      {kpi.status === 'on-track' ? 'On Track' : kpi.status === 'at-risk' ? 'At Risk' : 'Off Track'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredKpi.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Tidak ada data KPI untuk filter yang dipilih
          </div>
        )}
      </div>

      {/* SLA Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Service Level Agreement (SLA)</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Division</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SLA</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actual</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Compliance</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSla.map((sla) => (
                <tr key={sla.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{sla.division}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{sla.client}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{sla.slaName}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{sla.target} {sla.unit}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">{sla.actual} {sla.unit}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            sla.status === 'compliant' ? 'bg-green-500' :
                            sla.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(parseFloat(calculatePerformance(sla.actual, sla.target)), 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold">{calculatePerformance(sla.actual, sla.target)}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getSlaStatusBadge(sla.status)}`}>
                      {sla.status === 'compliant' ? 'Compliant' : sla.status === 'warning' ? 'Warning' : 'Breach'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredSla.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Tidak ada data SLA untuk filter yang dipilih
          </div>
        )}
      </div>
    </div>
  );
}
