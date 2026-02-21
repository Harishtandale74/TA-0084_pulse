import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { emergencyAPI, ambulanceAPI, hospitalAPI } from '../api/client';
import { useEmergencyStore } from '../stores/emergencyStore';
import { useAmbulanceStore } from '../stores/ambulanceStore';
import { useHospitalStore } from '../stores/hospitalStore';
import { useUIStore } from '../stores/uiStore';
import { ErrorBoundary, LoadingSpinner } from '../components/common';
import StatsRow from '../components/dashboard/StatsRow';
import CommandMap from '../components/dashboard/CommandMap';
import RightPanel from '../components/dashboard/RightPanel';
import HospitalSidebar from '../components/dashboard/HospitalSidebar';
import SOSButton from '../components/dashboard/SOSButton';
import EmergencyDetailModal from '../components/dashboard/EmergencyDetailModal';

// Mock data for demo mode (when backend is unavailable)
const MOCK_EMERGENCIES = [
  { id: '1', priority: 'P1', status: 'EN_ROUTE', description: 'Chest pain, difficulty breathing', location: { lat: 40.7128, lng: -74.0060 }, createdAt: new Date(Date.now() - 15 * 60000).toISOString(), patient: { name: 'John Doe', age: 65 } },
  { id: '2', priority: 'P2', status: 'ON_SCENE', description: 'Fall with head injury', location: { lat: 40.7180, lng: -74.0100 }, createdAt: new Date(Date.now() - 30 * 60000).toISOString(), patient: { name: 'Jane Smith', age: 42 } },
  { id: '3', priority: 'P3', status: 'DISPATCHED', description: 'Minor vehicle collision', location: { lat: 40.7200, lng: -74.0030 }, createdAt: new Date(Date.now() - 5 * 60000).toISOString(), patient: { name: 'Bob Wilson', age: 28 } },
];

const MOCK_AMBULANCES = [
  { id: '1', callSign: 'Medic 7', status: 'EN_ROUTE', location: { lat: 40.7150, lng: -74.0080 }, heading: 45, crew: ['Johnson', 'Williams'] },
  { id: '2', callSign: 'Medic 12', status: 'ON_SCENE', location: { lat: 40.7180, lng: -74.0100 }, heading: 90, crew: ['Garcia', 'Lee'] },
  { id: '3', callSign: 'Medic 3', status: 'AVAILABLE', location: { lat: 40.7100, lng: -74.0050 }, heading: 180, crew: ['Chen', 'Patel'] },
];

const MOCK_HOSPITALS = [
  { id: '1', name: 'City General Hospital', location: { lat: 40.7128, lng: -74.0160 }, capacity: { totalBeds: 500, availableBeds: 42, icuTotal: 50, icuAvailable: 8 } },
  { id: '2', name: 'Memorial Medical Center', location: { lat: 40.7250, lng: -74.0020 }, capacity: { totalBeds: 350, availableBeds: 78, icuTotal: 35, icuAvailable: 12 } },
];

function DispatcherDashboard() {
  const { setEmergencies, selectedEmergencyId, selectEmergency, clearSelection } = useEmergencyStore();
  const { setAmbulances } = useAmbulanceStore();
  const { setHospitals } = useHospitalStore();
  const { activeModal, modalData, closeModal } = useUIStore();
  const [showHospitalSidebar, setShowHospitalSidebar] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);

  // Fetch emergencies (fallback to mock data if API unavailable)
  const { isLoading: loadingEmergencies } = useQuery({
    queryKey: ['emergencies'],
    queryFn: async () => {
      try {
        const response = await emergencyAPI.getAll({ status: 'ACTIVE' });
        setEmergencies(response.data);
        return response.data;
      } catch (error) {
        console.log('Using mock emergency data (backend unavailable)');
        setEmergencies(MOCK_EMERGENCIES);
        setUsingMockData(true);
        return MOCK_EMERGENCIES;
      }
    },
    refetchInterval: usingMockData ? false : 30000,
    retry: 1,
  });

  // Fetch ambulances (fallback to mock data if API unavailable)
  const { isLoading: loadingAmbulances } = useQuery({
    queryKey: ['ambulances'],
    queryFn: async () => {
      try {
        const response = await ambulanceAPI.getAll();
        setAmbulances(response.data);
        return response.data;
      } catch (error) {
        console.log('Using mock ambulance data (backend unavailable)');
        setAmbulances(MOCK_AMBULANCES);
        setUsingMockData(true);
        return MOCK_AMBULANCES;
      }
    },
    refetchInterval: usingMockData ? false : 10000,
    retry: 1,
  });

  // Fetch hospitals (fallback to mock data if API unavailable)
  const { isLoading: loadingHospitals } = useQuery({
    queryKey: ['hospitals'],
    queryFn: async () => {
      try {
        const response = await hospitalAPI.getAll();
        setHospitals(response.data);
        return response.data;
      } catch (error) {
        console.log('Using mock hospital data (backend unavailable)');
        setHospitals(MOCK_HOSPITALS);
        setUsingMockData(true);
        return MOCK_HOSPITALS;
      }
    },
    refetchInterval: usingMockData ? false : 60000,
    retry: 1,
  });

  const isLoading = loadingEmergencies || loadingAmbulances || loadingHospitals;

  const handleEmergencySelect = (emergencyId) => {
    selectEmergency(emergencyId);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Stats Row */}
      <div className="flex-shrink-0 p-4 border-b border-gray-700">
        <StatsRow />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Hospital Sidebar (collapsible) */}
        {showHospitalSidebar && (
          <div className="w-80 flex-shrink-0 border-r border-gray-700 overflow-hidden">
            <HospitalSidebar onClose={() => setShowHospitalSidebar(false)} />
          </div>
        )}

        {/* Center: Map */}
        <div className="flex-1 relative">
          <ErrorBoundary
            title="Map Error"
            message="The map component failed to load. Please check your connection."
          >
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <CommandMap onEmergencySelect={handleEmergencySelect} />
            )}
          </ErrorBoundary>

          {/* SOS Button */}
          <div className="absolute bottom-6 left-6 z-10">
            <SOSButton />
          </div>

          {/* Toggle Hospital Sidebar */}
          {!showHospitalSidebar && (
            <button
              onClick={() => setShowHospitalSidebar(true)}
              className="absolute top-4 left-4 z-10 btn-secondary"
              aria-label="Show hospital sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Hospitals
            </button>
          )}
        </div>

        {/* Right: Alert Panel */}
        <div className="w-96 flex-shrink-0 border-l border-gray-700 overflow-hidden">
          <RightPanel />
        </div>
      </div>

      {/* Emergency Detail Modal */}
      {selectedEmergencyId && (
        <EmergencyDetailModal
          emergencyId={selectedEmergencyId}
          isOpen={!!selectedEmergencyId}
          onClose={clearSelection}
        />
      )}

      {/* SOS Confirmation Modal */}
      {activeModal === 'sos-confirm' && (
        <EmergencyDetailModal
          isOpen={true}
          onClose={closeModal}
          data={modalData}
        />
      )}
    </div>
  );
}

export default DispatcherDashboard;
