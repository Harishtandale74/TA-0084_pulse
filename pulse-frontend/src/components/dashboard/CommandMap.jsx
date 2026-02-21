import { useCallback, useEffect, useState, useMemo } from 'react';
import { Map, AdvancedMarker, Pin, useMap, useApiIsLoaded } from '@vis.gl/react-google-maps';
import { useEmergencyStore } from '../../stores/emergencyStore';
import { useAmbulanceStore } from '../../stores/ambulanceStore';
import { useHospitalStore } from '../../stores/hospitalStore';
import clsx from 'clsx';

const DEFAULT_CENTER = { lat: 40.7128, lng: -74.0060 }; // NYC default
const DEFAULT_ZOOM = 12;

const priorityColors = {
  P1: '#ef4444', // red
  P2: '#f59e0b', // amber
  P3: '#3b82f6', // blue
  P4: '#6b7280', // gray
};

function EmergencyMarker({ emergency, onClick }) {
  const isP1 = emergency.priority === 'P1';
  
  return (
    <AdvancedMarker
      position={emergency.location}
      onClick={() => onClick(emergency.id)}
      title={`${emergency.priority}: ${emergency.description}`}
    >
      <div
        className={clsx(
          'relative flex items-center justify-center w-10 h-10 rounded-full cursor-pointer transition-transform hover:scale-110',
          isP1 && 'animate-pulse'
        )}
        style={{ backgroundColor: priorityColors[emergency.priority] + '33' }}
      >
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
          style={{ backgroundColor: priorityColors[emergency.priority] }}
        >
          {emergency.priority}
        </div>
        {isP1 && (
          <div
            className="absolute inset-0 rounded-full animate-ping opacity-50"
            style={{ backgroundColor: priorityColors[emergency.priority] + '66' }}
          />
        )}
      </div>
    </AdvancedMarker>
  );
}

function AmbulanceMarker({ ambulance }) {
  const statusColors = {
    AVAILABLE: '#22c55e',
    EN_ROUTE: '#f59e0b',
    DISPATCHED: '#f59e0b',
    ON_SCENE: '#3b82f6',
    OFF_DUTY: '#6b7280',
  };

  return (
    <AdvancedMarker
      position={ambulance.location}
      title={`Ambulance ${ambulance.unit}: ${ambulance.status}`}
    >
      <div
        className="flex items-center justify-center w-8 h-8 rounded-lg shadow-lg transition-transform"
        style={{
          backgroundColor: statusColors[ambulance.status] || '#6b7280',
          transform: `rotate(${ambulance.heading || 0}deg)`,
        }}
      >
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 18v-6a9 9 0 0118 0v6"></path>
          <circle cx="12" cy="18" r="3"></circle>
        </svg>
      </div>
    </AdvancedMarker>
  );
}

function HospitalMarker({ hospital, onClick }) {
  const capacity = hospital.capacity?.availableBeds || 0;
  const totalBeds = hospital.capacity?.totalBeds || 1;
  const utilizationPercent = ((totalBeds - capacity) / totalBeds) * 100;
  
  // Size based on capacity
  const size = Math.min(Math.max(capacity / 10, 1), 3);
  const baseSize = 24 + (size * 8);
  
  // Color based on utilization
  let bgColor = '#22c55e'; // green - good capacity
  if (utilizationPercent > 80) bgColor = '#ef4444'; // red - critical
  else if (utilizationPercent > 60) bgColor = '#f59e0b'; // amber - moderate

  return (
    <AdvancedMarker
      position={hospital.location}
      onClick={() => onClick(hospital.id)}
      title={`${hospital.name}: ${capacity} beds available`}
    >
      <div
        className="flex items-center justify-center rounded-lg shadow-lg cursor-pointer transition-transform hover:scale-110"
        style={{
          width: baseSize,
          height: baseSize,
          backgroundColor: bgColor + '33',
          border: `2px solid ${bgColor}`,
        }}
      >
        <svg
          className="text-white"
          style={{ width: baseSize * 0.6, height: baseSize * 0.6, color: bgColor }}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z" />
        </svg>
      </div>
    </AdvancedMarker>
  );
}

function MapControls({ onZoomIn, onZoomOut, onRecenter }) {
  return (
    <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
      <button
        onClick={onZoomIn}
        className="w-10 h-10 bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center text-white hover:bg-gray-700 transition-colors"
        aria-label="Zoom in"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
      <button
        onClick={onZoomOut}
        className="w-10 h-10 bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center text-white hover:bg-gray-700 transition-colors"
        aria-label="Zoom out"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </button>
      <button
        onClick={onRecenter}
        className="w-10 h-10 bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center text-white hover:bg-gray-700 transition-colors"
        aria-label="Recenter map"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    </div>
  );
}

function MapLegend() {
  return (
    <div className="absolute bottom-6 right-6 z-10 bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-lg p-3">
      <h4 className="text-xs font-semibold text-gray-400 mb-2">LEGEND</h4>
      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-gray-300">P1 Critical</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-gray-300">P2 Urgent</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-gray-300">P3 Delayed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-500" />
          <span className="text-gray-300">P4 Minor</span>
        </div>
        <div className="border-t border-gray-700 my-2" />
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-amber-500" />
          <span className="text-gray-300">Ambulance</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-500 border-2 border-blue-400" />
          <span className="text-gray-300">Hospital</span>
        </div>
      </div>
    </div>
  );
}

// Fallback map when Google Maps is unavailable
function MockMap({ emergencies, ambulances, hospitals, onEmergencySelect }) {
  return (
    <div className="w-full h-full relative bg-gray-800 overflow-hidden">
      {/* Grid background */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(55, 65, 81, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(55, 65, 81, 0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      
      {/* Map placeholder content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center p-6">
          <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Map Preview Mode</h3>
          <p className="text-gray-400 text-sm mb-4 max-w-sm">
            Google Maps requires a valid API key. Add VITE_GOOGLE_MAPS_API_KEY to your .env file.
          </p>
        </div>
      </div>

      {/* Mock markers display */}
      <div className="absolute top-4 left-4 space-y-2 max-w-xs">
        {emergencies.slice(0, 5).map((e, idx) => (
          <button
            key={e.id}
            onClick={() => onEmergencySelect(e.id)}
            className={clsx(
              'w-full flex items-center gap-2 p-2 rounded-lg transition-colors hover:bg-gray-700',
              'bg-gray-800/90 backdrop-blur-sm border border-gray-700'
            )}
          >
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: priorityColors[e.priority] }}
            >
              {e.priority}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm text-white truncate">{e.description}</p>
              <p className="text-xs text-gray-400">{e.status}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Stats summary */}
      <div className="absolute bottom-4 left-4 bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-lg p-3">
        <div className="flex gap-6 text-center">
          <div>
            <p className="text-xl font-bold text-red-400">{emergencies.length}</p>
            <p className="text-xs text-gray-400">Active</p>
          </div>
          <div>
            <p className="text-xl font-bold text-amber-400">{ambulances.filter(a => a.status === 'EN_ROUTE' || a.status === 'ON_SCENE').length}</p>
            <p className="text-xs text-gray-400">Responding</p>
          </div>
          <div>
            <p className="text-xl font-bold text-green-400">{ambulances.filter(a => a.status === 'AVAILABLE').length}</p>
            <p className="text-xs text-gray-400">Available</p>
          </div>
        </div>
      </div>

      <MapLegend />
    </div>
  );
}

function CommandMap({ onEmergencySelect }) {
  const { activeEmergencies } = useEmergencyStore();
  const { ambulances } = useAmbulanceStore();
  const { hospitals, selectHospital } = useHospitalStore();
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);
  
  const ambulanceList = useMemo(() => Object.values(ambulances), [ambulances]);
  const hospitalList = useMemo(() => Object.values(hospitals), [hospitals]);

  // Check if we should show the fallback map
  // This happens when Google Maps API isn't loaded or has errors
  useEffect(() => {
    // Check if Google Maps loaded within 3 seconds
    const timeout = setTimeout(() => {
      if (!window.google?.maps) {
        setMapError(true);
      }
    }, 3000);
    return () => clearTimeout(timeout);
  }, []);

  // If Google Maps failed, show mock map
  if (mapError) {
    return (
      <MockMap
        emergencies={activeEmergencies}
        ambulances={ambulanceList}
        hospitals={hospitalList}
        onEmergencySelect={onEmergencySelect}
      />
    );
  }

  return <CommandMapWithGoogle onEmergencySelect={onEmergencySelect} />;
}

function CommandMapWithGoogle({ onEmergencySelect }) {
  const map = useMap();
  const { activeEmergencies } = useEmergencyStore();
  const { ambulances } = useAmbulanceStore();
  const { hospitals, selectHospital } = useHospitalStore();
  const [mapReady, setMapReady] = useState(false);

  const ambulanceList = Object.values(ambulances);
  const hospitalList = Object.values(hospitals);

  const handleZoomIn = useCallback(() => {
    if (map) {
      map.setZoom((map.getZoom() || DEFAULT_ZOOM) + 1);
    }
  }, [map]);

  const handleZoomOut = useCallback(() => {
    if (map) {
      map.setZoom((map.getZoom() || DEFAULT_ZOOM) - 1);
    }
  }, [map]);

  const handleRecenter = useCallback(() => {
    if (map) {
      // If there are emergencies, center on the most recent one
      if (activeEmergencies.length > 0) {
        const latest = activeEmergencies[0];
        map.panTo(latest.location);
      } else {
        map.panTo(DEFAULT_CENTER);
      }
      map.setZoom(DEFAULT_ZOOM);
    }
  }, [map, activeEmergencies]);

  // Auto-fit bounds to show all markers
  useEffect(() => {
    if (map && mapReady && activeEmergencies.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      
      activeEmergencies.forEach((e) => {
        if (e.location) bounds.extend(e.location);
      });
      
      ambulanceList.forEach((a) => {
        if (a.location) bounds.extend(a.location);
      });
      
      hospitalList.forEach((h) => {
        if (h.location) bounds.extend(h.location);
      });

      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, { padding: 50 });
      }
    }
  }, [map, mapReady, activeEmergencies.length]);

  return (
    <div className="w-full h-full relative">
      <Map
        defaultCenter={DEFAULT_CENTER}
        defaultZoom={DEFAULT_ZOOM}
        mapId="pulse-command-map"
        gestureHandling="greedy"
        disableDefaultUI={true}
        onTilesLoaded={() => setMapReady(true)}
        style={{ width: '100%', height: '100%' }}
        colorScheme="DARK"
      >
        {/* Emergency Markers */}
        {activeEmergencies.map((emergency) => (
          <EmergencyMarker
            key={emergency.id}
            emergency={emergency}
            onClick={onEmergencySelect}
          />
        ))}

        {/* Ambulance Markers */}
        {ambulanceList.map((ambulance) => (
          <AmbulanceMarker key={ambulance.id} ambulance={ambulance} />
        ))}

        {/* Hospital Markers */}
        {hospitalList.map((hospital) => (
          <HospitalMarker
            key={hospital.id}
            hospital={hospital}
            onClick={selectHospital}
          />
        ))}
      </Map>

      <MapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onRecenter={handleRecenter}
      />
      
      <MapLegend />
    </div>
  );
}

export default CommandMap;
