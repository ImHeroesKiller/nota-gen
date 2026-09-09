import React, { useState } from 'react';

interface SlaScorecardProps {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

interface KpiMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

interface Incident {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'resolved';
  date: string;
}

export default function SlaScorecard({ onBack, darkMode, setDarkMode }: SlaScorecardProps) {
  const [metrics] = useState<KpiMetric[]>([
    { id: '1', name: 'On-Time Delivery', value: 94.5, target: 95, unit: '%', status: 'good', trend: 'up' },
    { id: '2', name: 'Document Processing Time', value: 2.3, target: 2, unit: 'hours', status: 'warning', trend: 'down' },
    { id: '3', name: 'Customer Satisfaction', value: 4.6, target: 4.5, unit: '/5', status: 'excellent', trend: 'up' },
    { id: '4', name: 'Customs Clearance Rate', value: 98.2, target: 98, unit: '%', status: 'excellent', trend: 'stable' },
    { id: '5', name: 'Damage Rate', value: 0.8, target: 1, unit: '%', status: 'excellent', trend: 'down' },
    { id: '6', name: 'Cost per Shipment', value: 450, target: 500, unit: 'USD', status: 'excellent', trend: 'down' },
  ]);

  const [incidents] = useState<Incident[]>([
    { id: '1', title: 'Delayed shipment - PO#12345', severity: 'medium', status: 'resolved', date: '2026-01-05' },
    { id: '2', title: 'Documentation error - INV#67890', severity: 'low', status: 'resolved', date: '2026-01-07' },
    { id: '3', title: 'Customs hold - Container#ABC123', severity: 'high', status: 'in-progress', date: '2026-01-08' },
    { id: '4', title: 'Damaged goods - Shipment#XYZ789', severity: 'high', status: 'open', date: '2026-01-09' },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↑';
      case 'down': return '↓';
      case 'stable': return '→';
      default: return '';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getIncidentStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressPercentage = (value: number, target: number, metricName: string) => {
    // For metrics where lower is better (like Damage Rate, Document Processing Time)
    if (metricName.includes('Damage') || metricName.includes('Processing Time')) {
      return Math.min((target / value) * 100, 100);
    }
    // For metrics where higher is better
    return Math.min((value / target) * 100, 100);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">SLA Scorecard</h1>
        <p className="text-gray-600">Client SLA & Performance Scorecard Dashboard</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Total KPIs</div>
          <div className="text-3xl font-bold text-blue-600">{metrics.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">On Target</div>
          <div className="text-3xl font-bold text-green-600">
            {metrics.filter(m => m.value >= m.target || (m.name.includes('Damage') || m.name.includes('Processing Time')) && m.value <= m.target).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Open Incidents</div>
          <div className="text-3xl font-bold text-red-600">
            {incidents.filter(i => i.status === 'open' || i.status === 'in-progress').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Overall Score</div>
          <div className="text-3xl font-bold text-purple-600">A-</div>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-xl font-bold mb-4">Key Performance Indicators</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((metric) => (
            <div key={metric.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="text-sm text-gray-600">{metric.name}</div>
                  <div className="text-2xl font-bold mt-1">
                    {metric.value} {metric.unit}
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(metric.status)}`}>
                  {metric.status}
                </span>
              </div>
              
              <div className="mb-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Target: {metric.target} {metric.unit}</span>
                  <span>{getTrendIcon(metric.trend)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      metric.status === 'excellent' ? 'bg-green-500' :
                      metric.status === 'good' ? 'bg-blue-500' :
                      metric.status === 'warning' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${getProgressPercentage(metric.value, metric.target, metric.name)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Incidents */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">Recent Incidents</h3>
        <div className="space-y-3">
          {incidents.map((incident) => (
            <div key={incident.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="font-semibold">{incident.title}</div>
                  <div className="text-sm text-gray-500 mt-1">{incident.date}</div>
                </div>
                <div className="flex gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(incident.severity)}`}>
                    {incident.severity}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getIncidentStatusColor(incident.status)}`}>
                    {incident.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
