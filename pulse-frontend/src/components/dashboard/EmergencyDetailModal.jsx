import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { emergencyAPI, ambulanceAPI, triageAPI } from '../../api/client';
import { useAmbulanceStore } from '../../stores/ambulanceStore';
import { useHospitalStore } from '../../stores/hospitalStore';
import { useUIStore } from '../../stores/uiStore';
import { Modal, ConfirmDialog, LoadingSpinner, PriorityBadge, StatusBadge } from '../common';
import clsx from 'clsx';

function TimelineItem({ event }) {
  const typeColors = {
    CREATED: 'bg-blue-500',
    DISPATCHED: 'bg-amber-500',
    EN_ROUTE: 'bg-amber-500',
    ON_SCENE: 'bg-purple-500',
    TRANSPORTING: 'bg-blue-500',
    ARRIVED: 'bg-green-500',
    RESOLVED: 'bg-green-500',
    TRIAGE: 'bg-cyan-500',
    NOTE: 'bg-gray-500',
  };

  return (
    <div className="timeline-item">
      <div className={clsx('timeline-dot', typeColors[event.type] || 'bg-gray-500')} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-white">{event.title}</p>
          <p className="text-xs text-gray-400">{event.description}</p>
        </div>
        <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
          {new Date(event.timestamp).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}

function DispatchControls({ emergency, onDispatch }) {
  const { getAvailableAmbulances } = useAmbulanceStore();
  const { getHospitalsSortedByCapacity } = useHospitalStore();
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);

  const availableAmbulances = getAvailableAmbulances();
  const hospitals = getHospitalsSortedByCapacity();

  // Mock data for demo
  const mockAmbulances = [
    { id: 1, unit: 'A-12', status: 'AVAILABLE', eta: '5 min' },
    { id: 2, unit: 'A-07', status: 'AVAILABLE', eta: '8 min' },
    { id: 3, unit: 'A-15', status: 'AVAILABLE', eta: '12 min' },
  ];

  const displayAmbulances = availableAmbulances.length > 0 ? availableAmbulances : mockAmbulances;

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-gray-400 uppercase">Dispatch Controls</h4>
      
      {/* Ambulance Selection */}
      <div>
        <label className="label">Select Ambulance</label>
        <div className="space-y-2">
          {displayAmbulances.map((amb) => (
            <label
              key={amb.id}
              className={clsx(
                'flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all',
                selectedAmbulance === amb.id
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-700 hover:border-gray-600'
              )}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="ambulance"
                  value={amb.id}
                  checked={selectedAmbulance === amb.id}
                  onChange={() => setSelectedAmbulance(amb.id)}
                  className="text-blue-500"
                />
                <span className="font-medium text-white">{amb.unit}</span>
                <StatusBadge status={amb.status} size="sm" />
              </div>
              <span className="text-sm text-gray-400">ETA: {amb.eta}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Hospital Selection */}
      <div>
        <label className="label">Target Hospital (Optional)</label>
        <select
          value={selectedHospital || ''}
          onChange={(e) => setSelectedHospital(e.target.value)}
          className="input"
        >
          <option value="">Select hospital...</option>
          {hospitals.slice(0, 5).map((h) => (
            <option key={h.id} value={h.id}>
              {h.name} ({h.capacity?.availableBeds || 0} beds)
            </option>
          ))}
        </select>
      </div>

      {/* Dispatch Button */}
      <button
        onClick={() => onDispatch({ ambulanceId: selectedAmbulance, hospitalId: selectedHospital })}
        disabled={!selectedAmbulance}
        className="btn-warning w-full"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Dispatch Ambulance
      </button>
    </div>
  );
}

function EmergencyDetailModal({ emergencyId, isOpen, onClose }) {
  const [showDispatchConfirm, setShowDispatchConfirm] = useState(false);
  const [pendingDispatch, setPendingDispatch] = useState(null);
  const [activeTab, setActiveTab] = useState('timeline');
  const { showSuccess, showError } = useUIStore();
  const queryClient = useQueryClient();

  // Fetch emergency details
  const { data: emergency, isLoading } = useQuery({
    queryKey: ['emergency', emergencyId],
    queryFn: async () => {
      const response = await emergencyAPI.getById(emergencyId);
      return response.data;
    },
    enabled: !!emergencyId && isOpen,
  });

  // Fetch timeline
  const { data: timeline } = useQuery({
    queryKey: ['emergency-timeline', emergencyId],
    queryFn: async () => {
      const response = await emergencyAPI.getTimeline(emergencyId);
      return response.data;
    },
    enabled: !!emergencyId && isOpen,
  });

  // Fetch triage history
  const { data: triageHistory } = useQuery({
    queryKey: ['triage-history', emergencyId],
    queryFn: async () => {
      const response = await triageAPI.getHistory(emergencyId);
      return response.data;
    },
    enabled: !!emergencyId && isOpen,
  });

  // Dispatch mutation
  const dispatchMutation = useMutation({
    mutationFn: (data) => emergencyAPI.dispatch(emergencyId, data.ambulanceId),
    onSuccess: () => {
      showSuccess('Ambulance dispatched successfully');
      queryClient.invalidateQueries({ queryKey: ['emergencies'] });
      queryClient.invalidateQueries({ queryKey: ['ambulances'] });
      setShowDispatchConfirm(false);
      setPendingDispatch(null);
    },
    onError: (error) => {
      showError(error.response?.data?.message || 'Failed to dispatch ambulance');
    },
  });

  // Resolve mutation
  const resolveMutation = useMutation({
    mutationFn: (data) => emergencyAPI.resolve(emergencyId, data),
    onSuccess: () => {
      showSuccess('Emergency resolved');
      queryClient.invalidateQueries({ queryKey: ['emergencies'] });
      onClose();
    },
  });

  const handleDispatch = (data) => {
    setPendingDispatch(data);
    setShowDispatchConfirm(true);
  };

  const confirmDispatch = () => {
    if (pendingDispatch) {
      dispatchMutation.mutate(pendingDispatch);
    }
  };

  // Mock data
  const mockEmergency = {
    id: emergencyId,
    priority: 'P1',
    status: 'ACTIVE',
    description: 'Cardiac arrest - patient unresponsive',
    location: { lat: 40.7128, lng: -74.0060 },
    address: '123 Main Street, New York, NY 10001',
    patientInfo: {
      name: 'John Doe',
      age: 65,
      gender: 'Male',
    },
    createdAt: new Date(Date.now() - 900000).toISOString(),
    assignedAmbulance: null,
    assignedHospital: null,
  };

  const mockTimeline = [
    { type: 'CREATED', title: 'Emergency Created', description: 'SOS triggered by bystander', timestamp: new Date(Date.now() - 900000).toISOString() },
    { type: 'TRIAGE', title: 'AI Triage Complete', description: 'P1 Critical - Cardiac emergency suspected', timestamp: new Date(Date.now() - 840000).toISOString() },
    { type: 'DISPATCHED', title: 'Ambulance Dispatched', description: 'A-12 dispatched to scene', timestamp: new Date(Date.now() - 780000).toISOString() },
    { type: 'EN_ROUTE', title: 'Ambulance En Route', description: 'ETA 5 minutes', timestamp: new Date(Date.now() - 720000).toISOString() },
  ];

  const mockTriageResult = {
    level: 'P1',
    confidence: 92,
    assessment: 'Suspected cardiac arrest based on symptoms. Patient unresponsive.',
    immediateActions: [
      'Begin CPR immediately if not breathing',
      'Request AED if available',
      'Keep airway clear',
      'Monitor pulse continuously',
    ],
    contraindications: ['Do not move patient unless breathing is obstructed'],
    confirmedBy: null,
    timestamp: new Date(Date.now() - 840000).toISOString(),
  };

  const displayEmergency = emergency || mockEmergency;
  const displayTimeline = timeline || mockTimeline;

  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </Modal>
    );
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={
          <div className="flex items-center gap-3">
            <span>Emergency #{displayEmergency.id}</span>
            <PriorityBadge priority={displayEmergency.priority} />
            <StatusBadge status={displayEmergency.status} />
          </div>
        }
        size="lg"
      >
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Location</h4>
              <p className="text-sm text-white">{displayEmergency.address}</p>
              <p className="text-xs text-gray-400 mt-1">
                {displayEmergency.location.lat.toFixed(4)}, {displayEmergency.location.lng.toFixed(4)}
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Patient</h4>
              {displayEmergency.patientInfo ? (
                <div className="text-sm text-white">
                  <p>{displayEmergency.patientInfo.name || 'Unknown'}</p>
                  <p className="text-gray-400">
                    {displayEmergency.patientInfo.age && `${displayEmergency.patientInfo.age} years, `}
                    {displayEmergency.patientInfo.gender}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-400">No patient info</p>
              )}
            </div>
          </div>

          <div className="p-3 bg-gray-700/50 rounded-lg">
            <p className="text-sm text-white">{displayEmergency.description}</p>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-700">
            <div className="flex gap-4">
              {['timeline', 'triage', 'dispatch'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={clsx(
                    'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
                    activeTab === tab
                      ? 'text-blue-400 border-blue-400'
                      : 'text-gray-400 border-transparent hover:text-white'
                  )}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="min-h-[200px]">
            {activeTab === 'timeline' && (
              <div className="space-y-0">
                {displayTimeline.map((event, idx) => (
                  <TimelineItem key={idx} event={event} />
                ))}
              </div>
            )}

            {activeTab === 'triage' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <PriorityBadge priority={mockTriageResult.level} size="lg" />
                    <div>
                      <p className="text-sm font-medium text-white">AI Triage Assessment</p>
                      <p className="text-xs text-gray-400">
                        {new Date(mockTriageResult.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Confidence</p>
                    <p className="text-lg font-bold text-green-400">{mockTriageResult.confidence}%</p>
                  </div>
                </div>

                <div className="p-3 bg-gray-700/50 rounded-lg">
                  <p className="text-sm text-white">{mockTriageResult.assessment}</p>
                </div>

                <div>
                  <h5 className="text-xs font-semibold text-gray-400 uppercase mb-2">Immediate Actions</h5>
                  <ul className="space-y-2">
                    {mockTriageResult.immediateActions.map((action, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-white">
                        <span className="text-green-400">•</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>

                {mockTriageResult.contraindications.length > 0 && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <h5 className="text-xs font-semibold text-red-400 uppercase mb-2">Contraindications</h5>
                    <ul className="space-y-1">
                      {mockTriageResult.contraindications.map((item, idx) => (
                        <li key={idx} className="text-sm text-red-300">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {!mockTriageResult.confirmedBy && (
                  <button className="btn-primary w-full">
                    Confirm Triage Assessment
                  </button>
                )}
              </div>
            )}

            {activeTab === 'dispatch' && (
              <DispatchControls emergency={displayEmergency} onDispatch={handleDispatch} />
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <button onClick={onClose} className="btn-secondary flex-1">
              Close
            </button>
            {displayEmergency.status !== 'RESOLVED' && (
              <button
                onClick={() => resolveMutation.mutate({ resolution: 'completed' })}
                className="btn-primary flex-1"
                disabled={resolveMutation.isPending}
              >
                Mark Resolved
              </button>
            )}
          </div>
        </div>
      </Modal>

      {/* Dispatch Confirmation */}
      <ConfirmDialog
        isOpen={showDispatchConfirm}
        onClose={() => setShowDispatchConfirm(false)}
        onConfirm={confirmDispatch}
        title="Confirm Ambulance Dispatch"
        message="You are about to dispatch an ambulance to this emergency. This action will notify the ambulance crew and update case status."
        confirmText="Dispatch Now"
        cancelText="Cancel"
        variant="warning"
        isLoading={dispatchMutation.isPending}
      />
    </>
  );
}

export default EmergencyDetailModal;
