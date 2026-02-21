import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { hospitalAPI } from '../api/client';
import { useHospitalStore } from '../stores/hospitalStore';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import { ErrorBoundary, LoadingSpinner, Modal } from '../components/common';
import clsx from 'clsx';

const DEFAULT_CENTER = { lat: 40.7128, lng: -74.0060 };
const DEFAULT_ZOOM = 11;
const GOOGLE_MAPS_AVAILABLE = !!import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const capacityUpdateSchema = z.object({
  totalBeds: z.number().min(0),
  availableBeds: z.number().min(0),
  icuTotal: z.number().min(0),
  icuAvailable: z.number().min(0),
  traumaTotal: z.number().min(0),
  traumaAvailable: z.number().min(0),
});

function CapacityBar({ label, available, total }) {
  const percent = total > 0 ? ((total - available) / total) * 100 : 0;
  
  let barColor = 'bg-green-500';
  if (percent > 80) barColor = 'bg-red-500';
  else if (percent > 60) barColor = 'bg-amber-500';

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-medium">{available} / {total}</span>
      </div>
      <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={clsx('h-full rounded-full transition-all duration-500', barColor)}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-xs text-gray-500">
        {Math.round(percent)}% utilized
      </p>
    </div>
  );
}

function HospitalMarker({ hospital, isSelected, onClick }) {
  const capacity = hospital.capacity?.availableBeds || 0;
  const totalBeds = hospital.capacity?.totalBeds || 1;
  const utilizationPercent = ((totalBeds - capacity) / totalBeds) * 100;
  
  let bgColor = '#22c55e';
  if (utilizationPercent > 80) bgColor = '#ef4444';
  else if (utilizationPercent > 60) bgColor = '#f59e0b';

  return (
    <AdvancedMarker
      position={hospital.location}
      onClick={() => onClick(hospital)}
      title={`${hospital.name}: ${capacity} beds available`}
    >
      <div
        className={clsx(
          'flex flex-col items-center justify-center p-2 rounded-lg shadow-lg cursor-pointer transition-transform',
          isSelected ? 'scale-125' : 'hover:scale-110'
        )}
        style={{
          backgroundColor: bgColor,
          minWidth: 80,
        }}
      >
        <span className="text-white text-lg font-bold">{capacity}</span>
        <span className="text-white/80 text-xs">beds</span>
      </div>
    </AdvancedMarker>
  );
}

function HospitalDetailPanel({ hospital, onClose }) {
  const { user } = useAuthStore();
  const { showSuccess, showError } = useUIStore();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  
  const canEdit = user?.role === 'HOSPITAL_ADMIN' || user?.role === 'ADMIN';
  const capacity = hospital.capacity || {};

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(capacityUpdateSchema),
    defaultValues: {
      totalBeds: capacity.totalBeds || 0,
      availableBeds: capacity.availableBeds || 0,
      icuTotal: capacity.icuTotal || 0,
      icuAvailable: capacity.icuAvailable || 0,
      traumaTotal: capacity.traumaTotal || 0,
      traumaAvailable: capacity.traumaAvailable || 0,
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => hospitalAPI.updateCapacity(hospital.id, data),
    onSuccess: () => {
      showSuccess('Hospital capacity updated');
      queryClient.invalidateQueries({ queryKey: ['hospitals'] });
      setIsEditing(false);
    },
    onError: (error) => {
      showError(error.response?.data?.message || 'Failed to update capacity');
    },
  });

  const onSubmit = (data) => {
    updateMutation.mutate(data);
  };

  return (
    <div className="w-96 h-full bg-gray-800 border-l border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">{hospital.name}</h2>
            <p className="text-sm text-gray-400">{hospital.address}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white transition-colors"
            aria-label="Close panel"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-gray-700/50 rounded-lg">
            <p className="text-2xl font-bold text-green-400">{capacity.availableBeds || 0}</p>
            <p className="text-xs text-gray-400">Available</p>
          </div>
          <div className="text-center p-3 bg-gray-700/50 rounded-lg">
            <p className="text-2xl font-bold text-amber-400">{capacity.icuAvailable || 0}</p>
            <p className="text-xs text-gray-400">ICU</p>
          </div>
          <div className="text-center p-3 bg-gray-700/50 rounded-lg">
            <p className="text-2xl font-bold text-blue-400">{capacity.traumaAvailable || 0}</p>
            <p className="text-xs text-gray-400">Trauma</p>
          </div>
        </div>

        {/* Edit Toggle (for HOSPITAL_ADMIN) */}
        {canEdit && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="btn-secondary w-full"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Update Capacity
          </button>
        )}

        {/* Capacity Display or Edit Form */}
        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Total Beds</label>
                <input
                  type="number"
                  {...register('totalBeds', { valueAsNumber: true })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Available Beds</label>
                <input
                  type="number"
                  {...register('availableBeds', { valueAsNumber: true })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">ICU Total</label>
                <input
                  type="number"
                  {...register('icuTotal', { valueAsNumber: true })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">ICU Available</label>
                <input
                  type="number"
                  {...register('icuAvailable', { valueAsNumber: true })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Trauma Total</label>
                <input
                  type="number"
                  {...register('traumaTotal', { valueAsNumber: true })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Trauma Available</label>
                <input
                  type="number"
                  {...register('traumaAvailable', { valueAsNumber: true })}
                  className="input"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  reset();
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex-1"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? <LoadingSpinner size="sm" /> : 'Save'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <CapacityBar
              label="General Beds"
              available={capacity.availableBeds || 0}
              total={capacity.totalBeds || 0}
            />
            <CapacityBar
              label="ICU Beds"
              available={capacity.icuAvailable || 0}
              total={capacity.icuTotal || 0}
            />
            <CapacityBar
              label="Trauma Beds"
              available={capacity.traumaAvailable || 0}
              total={capacity.traumaTotal || 0}
            />
          </div>
        )}

        {/* Last Updated */}
        <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-700">
          Last updated: {capacity.lastUpdated 
            ? new Date(capacity.lastUpdated).toLocaleString()
            : 'Unknown'
          }
        </div>

        {/* Contact Info */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-400">Contact</h4>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {hospital.phone || '(555) 123-4567'}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {hospital.email || 'er@hospital.com'}
          </div>
        </div>
      </div>
    </div>
  );
}

function HospitalCapacity() {
  const { setHospitals, hospitals, capacitySummary } = useHospitalStore();
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [filterAvailable, setFilterAvailable] = useState(false);

  // Fetch hospitals
  const { data, isLoading, error } = useQuery({
    queryKey: ['hospitals'],
    queryFn: async () => {
      const response = await hospitalAPI.getAll();
      setHospitals(response.data);
      return response.data;
    },
    refetchInterval: 30000,
  });

  // Mock data for demo
  const mockHospitals = [
    {
      id: 1,
      name: 'City General Hospital',
      address: '100 Medical Center Dr, New York, NY',
      phone: '(212) 555-0100',
      email: 'er@citygeneral.com',
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
      address: '250 Healthcare Blvd, New York, NY',
      phone: '(212) 555-0200',
      email: 'er@memorial.com',
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
      address: '500 Academic Way, New York, NY',
      phone: '(212) 555-0300',
      email: 'er@university.com',
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
    {
      id: 4,
      name: 'St. Mary\'s Hospital',
      address: '789 Faith St, New York, NY',
      phone: '(212) 555-0400',
      email: 'er@stmarys.com',
      location: { lat: 40.7080, lng: -74.0150 },
      capacity: {
        totalBeds: 280,
        availableBeds: 95,
        icuTotal: 25,
        icuAvailable: 15,
        traumaTotal: 15,
        traumaAvailable: 10,
        lastUpdated: new Date().toISOString(),
      },
    },
  ];

  const displayHospitals = Object.values(hospitals).length > 0 
    ? Object.values(hospitals) 
    : mockHospitals;

  const filteredHospitals = filterAvailable
    ? displayHospitals.filter((h) => h.capacity?.availableBeds > 0)
    : displayHospitals;

  const handleHospitalClick = (hospital) => {
    setSelectedHospital(hospital);
  };

  return (
    <div className="h-screen flex">
      {/* Map */}
      <div className="flex-1 relative">
        <ErrorBoundary
          title="Map Error"
          message="The map component failed to load."
        >
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <Map
              defaultCenter={DEFAULT_CENTER}
              defaultZoom={DEFAULT_ZOOM}
              mapId="pulse-hospital-map"
              gestureHandling="greedy"
              disableDefaultUI={true}
              style={{ width: '100%', height: '100%' }}
              colorScheme="DARK"
            >
              {filteredHospitals.map((hospital) => (
                <HospitalMarker
                  key={hospital.id}
                  hospital={hospital}
                  isSelected={selectedHospital?.id === hospital.id}
                  onClick={handleHospitalClick}
                />
              ))}
            </Map>
          )}
        </ErrorBoundary>

        {/* Controls */}
        <div className="absolute top-4 left-4 z-10 space-y-4">
          {/* Summary Card */}
          <div className="bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">TOTAL CAPACITY</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-400">
                  {capacitySummary.availableBeds || filteredHospitals.reduce((sum, h) => sum + (h.capacity?.availableBeds || 0), 0)}
                </p>
                <p className="text-xs text-gray-400">Beds</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-400">
                  {capacitySummary.icuAvailable || filteredHospitals.reduce((sum, h) => sum + (h.capacity?.icuAvailable || 0), 0)}
                </p>
                <p className="text-xs text-gray-400">ICU</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-400">
                  {capacitySummary.traumaAvailable || filteredHospitals.reduce((sum, h) => sum + (h.capacity?.traumaAvailable || 0), 0)}
                </p>
                <p className="text-xs text-gray-400">Trauma</p>
              </div>
            </div>
          </div>

          {/* Filter */}
          <div className="bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-lg p-3">
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={filterAvailable}
                onChange={(e) => setFilterAvailable(e.target.checked)}
                className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
              />
              Show only available
            </label>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-10 bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-lg p-3">
          <h4 className="text-xs font-semibold text-gray-400 mb-2">CAPACITY STATUS</h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500" />
              <span className="text-gray-300">&lt; 60% utilized</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-amber-500" />
              <span className="text-gray-300">60-80% utilized</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-500" />
              <span className="text-gray-300">&gt; 80% utilized</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedHospital && (
        <HospitalDetailPanel
          hospital={selectedHospital}
          onClose={() => setSelectedHospital(null)}
        />
      )}
    </div>
  );
}

export default HospitalCapacity;
