import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { familyAPI, emergencyAPI } from '../api/client';
import { useWebSocket } from '../hooks/useWebSocket';
import { ErrorBoundary, LoadingSpinner, Modal } from '../components/common';
import { PriorityBadge, StatusBadge } from '../components/common/Badge';
import clsx from 'clsx';

const DEFAULT_CENTER = { lat: 40.7128, lng: -74.0060 };
const DEFAULT_ZOOM = 14;

function TimelineEvent({ event, isLast }) {
  const iconMap = {
    CREATED: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    ),
    DISPATCHED: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    EN_ROUTE: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      </svg>
    ),
    ON_SCENE: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    TRANSPORTING: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
    ARRIVED: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    COMPLETED: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  };

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={clsx(
          'w-8 h-8 rounded-full flex items-center justify-center',
          event.current ? 'bg-blue-500 text-white animate-pulse' : 'bg-gray-700 text-gray-400'
        )}>
          {iconMap[event.type] || iconMap.CREATED}
        </div>
        {!isLast && <div className="w-0.5 h-full bg-gray-700 mt-2" />}
      </div>
      <div className="pb-6">
        <p className={clsx(
          'font-medium',
          event.current ? 'text-white' : 'text-gray-400'
        )}>
          {event.title}
        </p>
        {event.description && (
          <p className="text-sm text-gray-500 mt-1">{event.description}</p>
        )}
        <p className="text-xs text-gray-600 mt-1">
          {event.timestamp ? new Date(event.timestamp).toLocaleString() : 'Pending'}
        </p>
      </div>
    </div>
  );
}

function NotificationPreferences({ emergencyId }) {
  const [preferences, setPreferences] = useState({
    sms: true,
    email: true,
    push: false,
  });

  const updateMutation = useMutation({
    mutationFn: (prefs) => familyAPI.updateNotifications(emergencyId, prefs),
  });

  const handleChange = (key, value) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    updateMutation.mutate(updated);
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-400">NOTIFICATION PREFERENCES</h4>
      {[
        { key: 'sms', label: 'SMS Notifications', icon: '📱' },
        { key: 'email', label: 'Email Updates', icon: '📧' },
        { key: 'push', label: 'Push Notifications', icon: '🔔' },
      ].map(({ key, label, icon }) => (
        <label 
          key={key}
          className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg cursor-pointer"
        >
          <span className="flex items-center gap-2 text-sm text-gray-300">
            <span>{icon}</span>
            {label}
          </span>
          <input
            type="checkbox"
            checked={preferences[key]}
            onChange={(e) => handleChange(key, e.target.checked)}
            className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
          />
        </label>
      ))}
    </div>
  );
}

function FamilyPortal() {
  const { emergencyId } = useParams();
  const { isConnected, subscribe, unsubscribe } = useWebSocket();
  const [ambulanceLocation, setAmbulanceLocation] = useState(null);

  // Fetch family portal data
  const { data: portalData, isLoading, error } = useQuery({
    queryKey: ['family-portal', emergencyId],
    queryFn: async () => {
      const response = await familyAPI.getPortal(emergencyId);
      return response.data;
    },
    refetchInterval: 30000,
  });

  // Mock data for demo
  const mockData = {
    emergency: {
      id: emergencyId,
      status: 'TRANSPORTING',
      priority: 'P2',
      location: { lat: 40.7128, lng: -74.0060 },
      createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
    },
    patient: {
      name: 'John Smith',
      age: 45,
    },
    ambulance: {
      id: 'AMB-101',
      callSign: 'Medic 7',
      location: { lat: 40.7150, lng: -74.0080 },
      crew: ['Paramedic Johnson', 'EMT Williams'],
    },
    hospital: {
      name: 'City General Hospital',
      address: '100 Medical Center Dr',
      estimatedArrival: new Date(Date.now() + 8 * 60000).toISOString(),
    },
    timeline: [
      {
        type: 'CREATED',
        title: 'Emergency Reported',
        description: 'Call received from 911 dispatch',
        timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
      },
      {
        type: 'DISPATCHED',
        title: 'Ambulance Dispatched',
        description: 'Medic 7 en route to location',
        timestamp: new Date(Date.now() - 40 * 60000).toISOString(),
      },
      {
        type: 'ON_SCENE',
        title: 'Arrived on Scene',
        description: 'Paramedics treating patient',
        timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
      },
      {
        type: 'TRANSPORTING',
        title: 'Transporting to Hospital',
        description: 'En route to City General Hospital',
        timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
        current: true,
      },
      {
        type: 'ARRIVED',
        title: 'Arrived at Hospital',
        timestamp: null,
      },
      {
        type: 'COMPLETED',
        title: 'Patient Transferred',
        timestamp: null,
      },
    ],
    meetingUrl: 'https://meet.google.com/abc-defg-hij',
  };

  const displayData = portalData || mockData;
  const { emergency, patient, ambulance, hospital, timeline, meetingUrl } = displayData;

  // Subscribe to ambulance location updates
  useEffect(() => {
    if (isConnected && ambulance?.id) {
      const sub = subscribe(`/topic/ambulance/${ambulance.id}/location`, (data) => {
        setAmbulanceLocation(data.location);
      });
      
      return () => {
        if (sub) unsubscribe(sub);
      };
    }
  }, [isConnected, ambulance?.id]);

  const currentAmbulanceLocation = ambulanceLocation || ambulance?.location;
  const mapCenter = currentAmbulanceLocation || emergency?.location || DEFAULT_CENTER;

  // Calculate ETA
  const eta = hospital?.estimatedArrival 
    ? Math.max(0, Math.round((new Date(hospital.estimatedArrival) - new Date()) / 60000))
    : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md text-center">
          <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-lg font-semibold text-white mb-2">Unable to Load Information</h2>
          <p className="text-gray-400">The emergency information could not be found or you may not have permission to view it.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">PULSE Family Portal</h1>
                <p className="text-xs text-gray-400">Emergency ID: {emergencyId}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={emergency?.status || 'ACTIVE'} />
              <PriorityBadge priority={emergency?.priority || 'P2'} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Patient Summary */}
        <section className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Patient</p>
              <p className="text-xl font-semibold text-white">{patient?.name}</p>
              <p className="text-sm text-gray-500">{patient?.age} years old</p>
            </div>
            {eta !== null && (
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-400">{eta}</p>
                <p className="text-sm text-gray-400">min ETA</p>
              </div>
            )}
          </div>
        </section>

        {/* Map - Read Only */}
        <section className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <h3 className="font-semibold text-white">Live Location</h3>
            <p className="text-sm text-gray-400">
              {ambulance?.callSign || 'Ambulance'} en route to {hospital?.name || 'hospital'}
            </p>
          </div>
          <ErrorBoundary
            title="Map Error"
            message="Unable to display the map."
          >
            <div className="h-64">
              <Map
                defaultCenter={mapCenter}
                defaultZoom={DEFAULT_ZOOM}
                mapId="pulse-family-map"
                gestureHandling="greedy"
                disableDefaultUI={true}
                style={{ width: '100%', height: '100%' }}
                colorScheme="DARK"
              >
                {/* Ambulance Marker */}
                {currentAmbulanceLocation && (
                  <AdvancedMarker
                    position={currentAmbulanceLocation}
                    title={ambulance?.callSign || 'Ambulance'}
                  >
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                      <span className="text-white text-lg">🚑</span>
                    </div>
                  </AdvancedMarker>
                )}

                {/* Hospital Marker */}
                {hospital && (
                  <AdvancedMarker
                    position={hospital.location || { lat: 40.7200, lng: -74.0030 }}
                    title={hospital.name}
                  >
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-lg">🏥</span>
                    </div>
                  </AdvancedMarker>
                )}
              </Map>
            </div>
          </ErrorBoundary>
        </section>

        {/* Ambulance Info */}
        <section className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <h3 className="font-semibold text-white mb-3">Response Team</h3>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🚑</span>
            </div>
            <div>
              <p className="text-white font-medium">{ambulance?.callSign || 'Medic Unit'}</p>
              <p className="text-sm text-gray-400">
                {ambulance?.crew?.join(', ') || 'Paramedic Team'}
              </p>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <h3 className="font-semibold text-white mb-4">Progress Timeline</h3>
          <div className="space-y-0">
            {timeline?.map((event, idx) => (
              <TimelineEvent
                key={idx}
                event={event}
                isLast={idx === timeline.length - 1}
              />
            ))}
          </div>
        </section>

        {/* Hospital Destination */}
        <section className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <h3 className="font-semibold text-white mb-3">Destination Hospital</h3>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🏥</span>
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">{hospital?.name || 'City General Hospital'}</p>
              <p className="text-sm text-gray-400">{hospital?.address || '100 Medical Center Dr'}</p>
            </div>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(hospital?.address || '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Directions
            </a>
          </div>
        </section>

        {/* Video Call Link */}
        {meetingUrl && (
          <section className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-medium">Video Consultation Available</p>
                  <p className="text-sm text-gray-400">Connect with the medical team</p>
                </div>
              </div>
              <a
                href={meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Join Call
              </a>
            </div>
          </section>
        )}

        {/* Notification Preferences */}
        <section className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <NotificationPreferences emergencyId={emergencyId} />
        </section>

        {/* Help/Emergency Contact */}
        <section className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-400 mb-3">NEED HELP?</h4>
          <div className="flex gap-3">
            <a
              href="tel:911"
              className="flex-1 btn bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call 911
            </a>
            <a
              href="tel:555-123-4567"
              className="flex-1 btn-secondary flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Dispatch Center
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-gray-600">
        <p>PULSE Emergency Response System</p>
        <p>For emergencies, always call 911</p>
      </footer>
    </div>
  );
}

export default FamilyPortal;
