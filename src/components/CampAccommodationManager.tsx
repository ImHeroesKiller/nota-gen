import { useState } from 'react';

interface CampAccommodationManagerProps {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

interface Room {
  id: string;
  roomNumber: string;
  block: string;
  capacity: number;
  occupied: number;
  status: 'available' | 'full' | 'maintenance';
  facilities: string[];
  lastCleaning: string;
  nextCleaning: string;
}

interface Occupant {
  id: string;
  roomId: string;
  name: string;
  employeeId: string;
  position: string;
  site: string;
  checkInDate: string;
  checkOutDate: string;
  status: 'active' | 'checked-out';
}

interface CleaningSchedule {
  id: string;
  roomId: string;
  date: string;
  assignedTo: string;
  status: 'scheduled' | 'completed' | 'missed';
  notes: string;
}

export default function CampAccommodationManager() {
  const [rooms] = useState<Room[]>([
    {
      id: '1',
      roomNumber: 'A-101',
      block: 'Block A',
      capacity: 4,
      occupied: 4,
      status: 'full',
      facilities: ['AC', 'Shared Bathroom', 'Locker'],
      lastCleaning: '2026-01-14',
      nextCleaning: '2026-01-17',
    },
    {
      id: '2',
      roomNumber: 'A-102',
      block: 'Block A',
      capacity: 4,
      occupied: 2,
      status: 'available',
      facilities: ['AC', 'Shared Bathroom', 'Locker'],
      lastCleaning: '2026-01-15',
      nextCleaning: '2026-01-18',
    },
    {
      id: '3',
      roomNumber: 'B-201',
      block: 'Block B',
      capacity: 2,
      occupied: 2,
      status: 'full',
      facilities: ['AC', 'Private Bathroom', 'Locker', 'TV'],
      lastCleaning: '2026-01-13',
      nextCleaning: '2026-01-16',
    },
    {
      id: '4',
      roomNumber: 'B-202',
      block: 'Block B',
      capacity: 2,
      occupied: 0,
      status: 'maintenance',
      facilities: ['AC', 'Private Bathroom', 'Locker', 'TV'],
      lastCleaning: '2026-01-10',
      nextCleaning: '2026-01-20',
    },
  ]);

  const [occupants] = useState<Occupant[]>([
    {
      id: '1',
      roomId: '1',
      name: 'Ahmad Fauzi',
      employeeId: 'EMP001',
      position: 'Heavy Equipment Operator',
      site: 'Site A - Kalimantan',
      checkInDate: '2026-01-10',
      checkOutDate: '2026-01-18',
      status: 'active',
    },
    {
      id: '2',
      roomId: '1',
      name: 'Budi Santoso',
      employeeId: 'EMP002',
      position: 'Dump Truck Driver',
      site: 'Site A - Kalimantan',
      checkInDate: '2026-01-10',
      checkOutDate: '2026-01-18',
      status: 'active',
    },
    {
      id: '3',
      roomId: '1',
      name: 'Cahyo Widodo',
      employeeId: 'EMP003',
      position: 'Excavator Operator',
      site: 'Site A - Kalimantan',
      checkInDate: '2026-01-10',
      checkOutDate: '2026-01-18',
      status: 'active',
    },
    {
      id: '4',
      roomId: '1',
      name: 'Dedi Kurniawan',
      employeeId: 'EMP004',
      position: 'Maintenance Mechanic',
      site: 'Site A - Kalimantan',
      checkInDate: '2026-01-10',
      checkOutDate: '2026-01-18',
      status: 'active',
    },
    {
      id: '5',
      roomId: '2',
      name: 'Eko Prasetyo',
      employeeId: 'EMP005',
      position: 'Safety Officer',
      site: 'Site A - Kalimantan',
      checkInDate: '2026-01-12',
      checkOutDate: '2026-01-20',
      status: 'active',
    },
    {
      id: '6',
      roomId: '2',
      name: 'Fajar Nugroho',
      employeeId: 'EMP006',
      position: 'Geologist',
      site: 'Site A - Kalimantan',
      checkInDate: '2026-01-12',
      checkOutDate: '2026-01-20',
      status: 'active',
    },
  ]);

  const [cleaningSchedules] = useState<CleaningSchedule[]>([
    {
      id: '1',
      roomId: '1',
      date: '2026-01-17',
      assignedTo: 'Cleaning Team A',
      status: 'scheduled',
      notes: 'Regular cleaning',
    },
    {
      id: '2',
      roomId: '2',
      date: '2026-01-18',
      assignedTo: 'Cleaning Team B',
      status: 'scheduled',
      notes: 'Regular cleaning',
    },
  ]);

  const [filterBlock, setFilterBlock] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const blocks = Array.from(new Set(rooms.map(r => r.block)));

  const filteredRooms = rooms.filter(r => {
    const matchBlock = filterBlock === 'all' || r.block === filterBlock;
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchBlock && matchStatus;
  });

  const getRoomStatusBadge = (status: string) => {
    const styles = {
      available: 'bg-green-100 text-green-800',
      full: 'bg-red-100 text-red-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const getCleaningStatusBadge = (status: string) => {
    const styles = {
      scheduled: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      missed: 'bg-red-100 text-red-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const totalCapacity = rooms.reduce((sum, r) => sum + r.capacity, 0);
  const totalOccupied = rooms.reduce((sum, r) => sum + r.occupied, 0);
  const availableRooms = rooms.filter(r => r.status === 'available').length;
  const occupancyRate = ((totalOccupied / totalCapacity) * 100).toFixed(1);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0A2540] to-[#1E3A5F] flex items-center justify-center">
            <span className="text-white text-xs font-bold">PA</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">Camp & Mess Accommodation Manager</h1>
            <p className="text-sm text-gray-600">PT Perdana Adi Yuda - Manajemen Asrama & Mess Karyawan</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Total Rooms</div>
          <div className="text-3xl font-bold text-blue-600">{rooms.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Total Capacity</div>
          <div className="text-3xl font-bold text-purple-600">{totalCapacity}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Occupied</div>
          <div className="text-3xl font-bold text-orange-600">{totalOccupied}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Occupancy Rate</div>
          <div className="text-3xl font-bold text-green-600">{occupancyRate}%</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Block</label>
            <select
              value={filterBlock}
              onChange={(e) => setFilterBlock(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Blocks</option>
              {blocks.map(block => (
                <option key={block} value={block}>{block}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="full">Full</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          <div className="flex items-end">
            <div className="w-full text-right">
              <span className="text-sm text-gray-600">Available Rooms: </span>
              <span className="text-lg font-bold text-green-600">{availableRooms}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Room Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRooms.map(room => {
            const roomOccupants = occupants.filter(o => o.roomId === room.id && o.status === 'active');
            return (
              <div key={room.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-bold text-xl">{room.roomNumber}</div>
                    <div className="text-sm text-gray-600">{room.block}</div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoomStatusBadge(room.status)}`}>
                    {room.status === 'available' ? 'Available' : room.status === 'full' ? 'Full' : 'Maintenance'}
                  </span>
                </div>

                <div className="mb-3">
                  <div className="text-sm text-gray-600 mb-1">Occupancy</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          room.occupied === room.capacity ? 'bg-red-500' :
                          room.occupied > 0 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${(room.occupied / room.capacity) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold">{room.occupied}/{room.capacity}</span>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="text-sm text-gray-600 mb-1">Facilities</div>
                  <div className="flex flex-wrap gap-1">
                    {room.facilities.map((facility, index) => (
                      <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        {facility}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-gray-600 space-y-1">
                  <div>Last Cleaning: {room.lastCleaning}</div>
                  <div>Next Cleaning: {room.nextCleaning}</div>
                </div>

                {roomOccupants.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="text-sm font-semibold mb-2">Occupants:</div>
                    <div className="space-y-1">
                      {roomOccupants.map(occ => (
                        <div key={occ.id} className="text-xs text-gray-600">
                          {occ.name} ({occ.employeeId})
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {filteredRooms.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No rooms found for selected filters
          </div>
        )}
      </div>

      {/* Cleaning Schedule */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Cleaning Schedule</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {cleaningSchedules.map(schedule => {
                const room = rooms.find(r => r.id === schedule.roomId);
                return (
                  <tr key={schedule.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{room?.roomNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{schedule.date}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{schedule.assignedTo}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCleaningStatusBadge(schedule.status)}`}>
                        {schedule.status === 'scheduled' ? 'Scheduled' : schedule.status === 'completed' ? 'Completed' : 'Missed'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{schedule.notes}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {cleaningSchedules.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No cleaning schedules
          </div>
        )}
      </div>
    </div>
  );
}
