import React, { useState } from 'react';

interface IncotermsVisualizerProps {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

interface Incoterm {
  code: string;
  name: string;
  category: string;
  description: string;
  sellerResponsibilities: string[];
  buyerResponsibilities: string[];
  riskTransfer: string;
  costTransfer: string;
}

const incoterms2020: Incoterm[] = [
  {
    code: 'EXW',
    name: 'Ex Works',
    category: 'Any Mode',
    description: 'Seller makes goods available at their premises. Buyer bears all costs and risks from that point.',
    sellerResponsibilities: ['Package goods', 'Make available at premises', 'Provide commercial invoice'],
    buyerResponsibilities: ['Load goods', 'Transport to destination', 'Export/import clearance', 'Insurance', 'All costs after pickup'],
    riskTransfer: 'At seller\'s premises',
    costTransfer: 'At seller\'s premises',
  },
  {
    code: 'FCA',
    name: 'Free Carrier',
    category: 'Any Mode',
    description: 'Seller delivers goods to carrier nominated by buyer at seller\'s premises or another named place.',
    sellerResponsibilities: ['Package goods', 'Deliver to carrier', 'Export clearance', 'Provide commercial invoice'],
    buyerResponsibilities: ['Main transport', 'Import clearance', 'Insurance', 'All costs after delivery to carrier'],
    riskTransfer: 'When delivered to carrier',
    costTransfer: 'When delivered to carrier',
  },
  {
    code: 'FOB',
    name: 'Free On Board',
    category: 'Sea Freight',
    description: 'Seller delivers goods on board vessel nominated by buyer at named port of shipment.',
    sellerResponsibilities: ['Transport to port', 'Export clearance', 'Load on board vessel', 'Provide commercial invoice'],
    buyerResponsibilities: ['Main transport', 'Insurance', 'Import clearance', 'All costs after loading on vessel'],
    riskTransfer: 'When goods on board vessel',
    costTransfer: 'When goods on board vessel',
  },
  {
    code: 'CFR',
    name: 'Cost and Freight',
    category: 'Sea Freight',
    description: 'Seller delivers goods on board vessel and pays costs to destination port. Risk transfers at loading.',
    sellerResponsibilities: ['Transport to port', 'Export clearance', 'Load on vessel', 'Main freight to destination', 'Provide commercial invoice'],
    buyerResponsibilities: ['Insurance', 'Import clearance', 'Unloading', 'All costs after arrival at destination'],
    riskTransfer: 'When goods on board vessel at origin',
    costTransfer: 'At destination port',
  },
  {
    code: 'CIF',
    name: 'Cost, Insurance and Freight',
    category: 'Sea Freight',
    description: 'Seller delivers goods on board vessel, pays freight and minimum insurance to destination port.',
    sellerResponsibilities: ['Transport to port', 'Export clearance', 'Load on vessel', 'Main freight', 'Insurance', 'Provide commercial invoice'],
    buyerResponsibilities: ['Import clearance', 'Unloading', 'All costs after arrival at destination'],
    riskTransfer: 'When goods on board vessel at origin',
    costTransfer: 'At destination port',
  },
  {
    code: 'DAP',
    name: 'Delivered At Place',
    category: 'Any Mode',
    description: 'Seller delivers goods at named place of destination, ready for unloading. Buyer handles import clearance.',
    sellerResponsibilities: ['All transport to destination', 'Export clearance', 'Provide commercial invoice'],
    buyerResponsibilities: ['Import clearance', 'Unloading', 'All costs after arrival'],
    riskTransfer: 'At named place of destination',
    costTransfer: 'At named place of destination',
  },
  {
    code: 'DPU',
    name: 'Delivered At Place Unloaded',
    category: 'Any Mode',
    description: 'Seller delivers goods unloaded at named place of destination. Seller bears all risks and costs.',
    sellerResponsibilities: ['All transport to destination', 'Export clearance', 'Unloading at destination', 'Provide commercial invoice'],
    buyerResponsibilities: ['Import clearance', 'All costs after unloading'],
    riskTransfer: 'When unloaded at destination',
    costTransfer: 'When unloaded at destination',
  },
  {
    code: 'DDP',
    name: 'Delivered Duty Paid',
    category: 'Any Mode',
    description: 'Seller delivers goods at destination, cleared for import, with all duties paid. Maximum obligation for seller.',
    sellerResponsibilities: ['All transport', 'Export & import clearance', 'All duties and taxes', 'Unloading', 'Provide commercial invoice'],
    buyerResponsibilities: ['Only unloading at final destination'],
    riskTransfer: 'At final destination',
    costTransfer: 'At final destination',
  },
];

export default function IncotermsVisualizer({ onBack, darkMode, setDarkMode }: IncotermsVisualizerProps) {
  const [selectedIncoterm, setSelectedIncoterm] = useState<Incoterm>(incoterms2020[0]);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredIncoterms = filterCategory === 'all'
    ? incoterms2020
    : incoterms2020.filter(term => term.category === filterCategory);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Incoterms 2020 Visualizer</h1>
        <p className="text-gray-600">Interactive guide to Incoterms 2020 with responsibility breakdown</p>
      </div>

      <div className="mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filterCategory === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterCategory('Any Mode')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filterCategory === 'Any Mode' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Any Mode
          </button>
          <button
            onClick={() => setFilterCategory('Sea Freight')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filterCategory === 'Sea Freight' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Sea Freight
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incoterms List */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">Incoterms 2020</h3>
          <div className="space-y-2">
            {filteredIncoterms.map((term) => (
              <button
                key={term.code}
                onClick={() => setSelectedIncoterm(term)}
                className={`w-full text-left p-3 border rounded-lg transition-all ${
                  selectedIncoterm.code === term.code
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-lg">{term.code}</div>
                    <div className="text-sm text-gray-600">{term.name}</div>
                  </div>
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                    {term.category}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold">{selectedIncoterm.code}</h3>
                <p className="text-gray-600">{selectedIncoterm.name}</p>
              </div>
              <span className="text-sm px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                {selectedIncoterm.category}
              </span>
            </div>
            <p className="text-gray-700 mb-4">{selectedIncoterm.description}</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-sm text-gray-600 mb-1">Risk Transfer Point</div>
                <div className="font-semibold">{selectedIncoterm.riskTransfer}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <div className="text-sm text-gray-600 mb-1">Cost Transfer Point</div>
                <div className="font-semibold">{selectedIncoterm.costTransfer}</div>
              </div>
            </div>
          </div>

          {/* Responsibilities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Seller */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-blue-600">Seller Responsibilities</h3>
              <ul className="space-y-2">
                {selectedIncoterm.sellerResponsibilities.map((responsibility, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2">✓</span>
                    <span>{responsibility}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Buyer */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-green-600">Buyer Responsibilities</h3>
              <ul className="space-y-2">
                {selectedIncoterm.buyerResponsibilities.map((responsibility, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>{responsibility}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
