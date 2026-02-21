import { useState } from 'react';
import { useHospitalStore } from '../../stores/hospitalStore';
import clsx from 'clsx';

function CapacityBar({ available, total, type = 'general' }) {
  const percent = total > 0 ? ((total - available) / total) * 100 : 0;
  
  let barColor = 'bg-green-500'; // Good
  if (percent > 80) barColor = 'bg-red-500'; // Critical
  else if (percent > 60) barColor = 'bg-amber-500'; // Warning

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-16 text-gray-400 capitalize">{type}</span>
      <div className="flex-1 capacity-bar">
        <div
          className={clsx('capacity-fill', barColor)}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="w-12 text-right text-gray-300">{available}/{total}</span>
    </div>
  );
}

function HospitalCard({ hospital, isSelected, onClick }) {
  const capacity = hospital.capacity || {};
  const utilizationPercent = capacity.totalBeds > 0
    ? ((capacity.totalBeds - capacity.availableBeds) / capacity.totalBeds) * 100
    : 0;

  let statusColor = 'text-green-400';
  if (utilizationPercent > 80) statusColor = 'text-red-400';
  else if (utilizationPercent > 60) statusColor = 'text-amber-400';

  return (
    <div
      className={clsx(
        'p-3 rounded-lg border transition-all cursor-pointer',
        isSelected
          ? 'bg-blue-500/10 border-blue-500'
          : 'bg-gray-700/50 border-gray-700 hover:border-gray-600'
      )}
      onClick={() => onClick(hospital.id)}
      role="button"
      tabIndex={0}
      aria-label={`${hospital.name}: ${capacity.availableBeds || 0} beds available`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-white text-sm truncate">{hospital.name}</h4>
          <p className="text-xs text-gray-400 truncate">{hospital.address}</p>
        </div>
        <span className={clsx('text-lg font-bold', statusColor)}>
          {capacity.availableBeds || 0}
        </span>
      </div>

      <div className="space-y-1.5">
        <CapacityBar
          available={capacity.availableBeds || 0}
          total={capacity.totalBeds || 0}
          type="General"
        />
        <CapacityBar
          available={capacity.icuAvailable || 0}
          total={capacity.icuTotal || 0}
          type="ICU"
        />
        <CapacityBar
          available={capacity.traumaAvailable || 0}
          total={capacity.traumaTotal || 0}
          type="Trauma"
        />
      </div>

      {capacity.lastUpdated && (
        <p className="text-xs text-gray-500 mt-2">
          Updated {new Date(capacity.lastUpdated).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}

function HospitalSidebar({ onClose }) {
  const { hospitals, selectedHospitalId, selectHospital, getHospitalsSortedByCapacity, capacitySummary } = useHospitalStore();
  const [filterAvailable, setFilterAvailable] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const sortedHospitals = getHospitalsSortedByCapacity();
  
  const filteredHospitals = sortedHospitals.filter((h) => {
    if (filterAvailable && (!h.capacity || h.capacity.availableBeds <= 0)) {
      return false;
    }
    if (searchQuery && !h.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Mock data for demo
  const mockHospitals = [
    {
      id: 1,
      name: 'City General Hospital',
      address: '100 Medical Center Dr',
      location: { lat: 40.7128, lng: -74.0060 },
      capacity: {
        totalBeds: 500,
        availableBeds: 42,
        icuTotal: 50,
        icuAvailable: 8,
        traumaTotal: 30,
        traumaAvailable: 5,
        lastUpdated: new Date().toISOString(),
      },
    },
    {
      id: 2,
      name: 'Memorial Medical Center',
      address: '250 Healthcare Blvd',
      location: { lat: 40.7180, lng: -74.0100 },
      capacity: {
        totalBeds: 350,
        availableBeds: 78,
        icuTotal: 35,
        icuAvailable: 12,
        traumaTotal: 20,
        traumaAvailable: 8,
        lastUpdated: new Date().toISOString(),
      },
    },
    {
      id: 3,
      name: 'University Hospital',
      address: '500 Academic Way',
      location: { lat: 40.7200, lng: -74.0030 },
      capacity: {
        totalBeds: 600,
        availableBeds: 15,
        icuTotal: 60,
        icuAvailable: 2,
        traumaTotal: 40,
        traumaAvailable: 3,
        lastUpdated: new Date().toISOString(),
      },
    },
  ];

  const displayHospitals = filteredHospitals.length > 0 ? filteredHospitals : mockHospitals;

  return (
    <div className="h-full flex flex-col bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h3 className="font-semibold text-white">Hospital Capacity</h3>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-white transition-colors"
          aria-label="Close sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Summary */}
      <div className="p-4 border-b border-gray-700 bg-gray-700/30">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-bold text-white">
              {capacitySummary.availableBeds || displayHospitals.reduce((sum, h) => sum + (h.capacity?.availableBeds || 0), 0)}
            </p>
            <p className="text-xs text-gray-400">Beds</p>
          </div>
          <div>
            <p className="text-lg font-bold text-amber-400">
              {capacitySummary.icuAvailable || displayHospitals.reduce((sum, h) => sum + (h.capacity?.icuAvailable || 0), 0)}
            </p>
            <p className="text-xs text-gray-400">ICU</p>
          </div>
          <div>
            <p className="text-lg font-bold text-blue-400">
              {capacitySummary.traumaAvailable || displayHospitals.reduce((sum, h) => sum + (h.capacity?.traumaAvailable || 0), 0)}
            </p>
            <p className="text-xs text-gray-400">Trauma</p>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="p-4 border-b border-gray-700 space-y-3">
        <input
          type="search"
          placeholder="Search hospitals..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input text-sm"
          aria-label="Search hospitals"
        />
        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={filterAvailable}
            onChange={(e) => setFilterAvailable(e.target.checked)}
            className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
          />
          Show only available beds
        </label>
      </div>

      {/* Hospital List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
        {displayHospitals.map((hospital) => (
          <HospitalCard
            key={hospital.id}
            hospital={hospital}
            isSelected={selectedHospitalId === hospital.id}
            onClick={selectHospital}
          />
        ))}
      </div>
    </div>
  );
}

export default HospitalSidebar;
