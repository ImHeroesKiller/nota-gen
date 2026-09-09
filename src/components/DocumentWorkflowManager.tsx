import { useState } from 'react';

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'in-review' | 'approved' | 'rejected';
  createdBy: string;
  createdAt: string;
  currentStep: number;
  totalSteps: number;
}

export default function DocumentWorkflowManager() {
  const [workflows, setWorkflows] = useState<Workflow[]>([
    {
      id: '1',
      name: 'Invoice Approval - PT ABC',
      description: 'Invoice for January 2026 shipments',
      status: 'in-review',
      createdBy: 'John Doe',
      createdAt: '2026-01-05',
      currentStep: 2,
      totalSteps: 3,
    },
    {
      id: '2',
      name: 'Contract Renewal - PT XYZ',
      description: 'Annual contract renewal for 2026',
      status: 'approved',
      createdBy: 'Jane Smith',
      createdAt: '2026-01-03',
      currentStep: 3,
      totalSteps: 3,
    },
    {
      id: '3',
      name: 'Purchase Order - Office Supplies',
      description: 'Monthly office supplies purchase',
      status: 'draft',
      createdBy: 'Bob Johnson',
      createdAt: '2026-01-07',
      currentStep: 1,
      totalSteps: 4,
    },
  ]);

  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredWorkflows = workflows.filter(workflow => 
    filterStatus === 'all' || workflow.status === filterStatus
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'in-review': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressPercentage = (current: number, total: number) => {
    return (current / total) * 100;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Document Workflow Manager</h1>
        <p className="text-gray-600">Manage document approval workflows and track progress</p>
      </div>

      <div className="mb-6 flex gap-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="in-review">In Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="space-y-4">
        {filteredWorkflows.map((workflow) => (
          <div key={workflow.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">{workflow.name}</h3>
                <p className="text-sm text-gray-600">{workflow.description}</p>
              </div>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(workflow.status)}`}>
                {workflow.status}
              </span>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>Step {workflow.currentStep} of {workflow.totalSteps}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${getProgressPercentage(workflow.currentStep, workflow.totalSteps)}%` }}
                ></div>
              </div>
            </div>

            <div className="flex justify-between items-center text-sm text-gray-600">
              <div>
                <span className="font-medium">Created by:</span> {workflow.createdBy}
              </div>
              <div>
                <span className="font-medium">Created at:</span> {workflow.createdAt}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
