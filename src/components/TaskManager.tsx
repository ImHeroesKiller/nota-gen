import React, { useState, useEffect } from 'react';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'done';
  dueDate?: string;
  createdAt: string;
}

interface TaskManagerProps {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

export default function TaskManager({ onBack, darkMode, setDarkMode }: TaskManagerProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    status: 'todo' as 'todo' | 'in-progress' | 'done',
    dueDate: '',
  });

  useEffect(() => {
    const saved = localStorage.getItem('taskManagerTasks');
    if (saved) {
      setTasks(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('taskManagerTasks', JSON.stringify(tasks));
  }, [tasks]);

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    return matchesStatus && matchesPriority;
  });

  const handleSubmit = () => {
    if (!formData.title.trim()) return;

    if (editingTask) {
      setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, ...formData } : t));
      setEditingTask(null);
    } else {
      const newTask: Task = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
      };
      setTasks([newTask, ...tasks]);
    }

    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      status: 'todo',
      dueDate: '',
    });
    setShowForm(false);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate || '',
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      setTasks(tasks.filter(t => t.id !== id));
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'done': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Task Manager</h1>
        <p className="text-gray-600">Manage your tasks and stay productive</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4 flex-wrap">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">All Status</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">All Priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <button
          onClick={() => {
            setEditingTask(null);
            setFormData({
              title: '',
              description: '',
              priority: 'medium',
              status: 'todo',
              dueDate: '',
            });
            setShowForm(true);
          }}
          className="px-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          + Add Task
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingTask ? 'Edit Task' : 'Add New Task'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Task title..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={3}
                  placeholder="Task description..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                {editingTask ? 'Update' : 'Add'} Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <p className="text-gray-500">No tasks found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredTasks.map((task) => (
            <div key={task.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">{task.title}</h3>
                  {task.description && (
                    <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(task)}
                    className="text-blue-500 hover:text-blue-700 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
                {task.dueDate && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">
                    Due: {task.dueDate}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
