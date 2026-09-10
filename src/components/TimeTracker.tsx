import { useState, useEffect } from 'react';

interface TimeEntry {
  id: string;
  task: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in seconds
  date: string;
}

interface TimeTrackerProps {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

export default function TimeTracker({ onBack, darkMode, setDarkMode }: TimeTrackerProps) {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [currentTask, setCurrentTask] = useState('');
  const [activeTimer, setActiveTimer] = useState<TimeEntry | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('timeTrackerEntries');
    if (saved) {
      setEntries(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('timeTrackerEntries', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTimer) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - activeTimer.startTime.getTime()) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimer]);

  const startTimer = () => {
    if (!currentTask.trim()) return;

    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      task: currentTask,
      startTime: new Date(),
      duration: 0,
      date: new Date().toISOString().split('T')[0],
    };

    setActiveTimer(newEntry);
    setElapsedTime(0);
  };

  const stopTimer = () => {
    if (!activeTimer) return;

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - activeTimer.startTime.getTime()) / 1000);

    const completedEntry: TimeEntry = {
      ...activeTimer,
      endTime,
      duration,
    };

    setEntries([completedEntry, ...entries]);
    setActiveTimer(null);
    setCurrentTask('');
    setElapsedTime(0);
  };

  const deleteEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTotalTimeToday = () => {
    const today = new Date().toISOString().split('T')[0];
    return entries
      .filter(e => e.date === today)
      .reduce((sum, e) => sum + e.duration, 0);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Time Tracker</h1>
        <p className="text-gray-600">Track your work time and productivity</p>
      </div>

      {/* Timer Section */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Task Name</label>
          <input
            type="text"
            value={currentTask}
            onChange={(e) => setCurrentTask(e.target.value)}
            disabled={!!activeTimer}
            placeholder="Enter task name..."
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>

        <div className="text-center mb-4">
          <div className="text-5xl font-mono font-bold mb-2">
            {formatTime(activeTimer ? elapsedTime : 0)}
          </div>
        </div>

        <div className="flex gap-2">
          {!activeTimer ? (
            <button
              onClick={startTimer}
              disabled={!currentTask.trim()}
              className="flex-1 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Start Timer
            </button>
          ) : (
            <button
              onClick={stopTimer}
              className="flex-1 bg-red-500 text-white py-3 rounded-lg hover:bg-red-600"
            >
              Stop Timer
            </button>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <div className="text-sm text-gray-600 mb-1">Total Time Today</div>
        <div className="text-2xl font-bold text-blue-600">
          {formatTime(getTotalTimeToday())}
        </div>
      </div>

      {/* Time Entries */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Time Entries</h2>
        {entries.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No time entries yet</p>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div key={entry.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">{entry.task}</h3>
                    <p className="text-sm text-gray-500">{entry.date}</p>
                  </div>
                  <button
                    onClick={() => deleteEntry(entry.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {new Date(entry.startTime).toLocaleTimeString()} - {entry.endTime ? new Date(entry.endTime).toLocaleTimeString() : 'Running'}
                  </span>
                  <span className="font-mono font-bold">{formatTime(entry.duration)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
