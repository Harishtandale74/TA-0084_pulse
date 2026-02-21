import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { useAuthStore } from './stores/authStore';
import { useWebSocket } from './hooks/useWebSocket';
import MainLayout from './layouts/MainLayout';
import LandingPage from './pages/LandingPage';
import DispatcherDashboard from './pages/DispatcherDashboard';
import HospitalCapacity from './pages/HospitalCapacity';
import FamilyPortal from './pages/FamilyPortal';
import PatientProfile from './pages/PatientProfile';
import Login from './pages/Login';
import Register from './pages/Register';
import Pricing from './pages/Pricing';
import Contact from './pages/Contact';
import ErrorBoundary from './components/common/ErrorBoundary';
import ToastContainer from './components/common/ToastContainer';
import ConnectionStatus from './components/common/ConnectionStatus';
import config, { validateConfig, logger } from './config';

// Validate configuration on startup
validateConfig();

// Wrapper that suppresses Google Maps API errors when no key is provided
function MapsProviderWrapper({ children }) {
  if (!config.maps.enabled) {
    // No API key - skip APIProvider to avoid console errors
    logger.debug('Google Maps API key not provided - using fallback map');
    return <>{children}</>;
  }
  return (
    <APIProvider 
      apiKey={config.maps.apiKey}
      onLoad={() => logger.info('Google Maps API loaded')}
    >
      {children}
    </APIProvider>
  );
}

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  const { isAuthenticated, token, initializeAuth } = useAuthStore();
  
  // Initialize auth from localStorage on app load
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Initialize WebSocket connection when authenticated
  useWebSocket(isAuthenticated ? token : null);

  return (
    <ErrorBoundary>
      <MapsProviderWrapper>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['DISPATCHER', 'ADMIN', 'DOCTOR']}>
                <MainLayout>
                  <DispatcherDashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/hospitals"
            element={
              <ProtectedRoute allowedRoles={['DISPATCHER', 'ADMIN', 'HOSPITAL_ADMIN']}>
                <MainLayout>
                  <HospitalCapacity />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/family/:emergencyId"
            element={
              <ProtectedRoute allowedRoles={['FAMILY', 'DISPATCHER', 'ADMIN']}>
                <FamilyPortal />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/patients/:id"
            element={
              <ProtectedRoute allowedRoles={['DOCTOR', 'DISPATCHER', 'ADMIN']}>
                <MainLayout>
                  <PatientProfile />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        <ToastContainer />
        <ConnectionStatus />
      </MapsProviderWrapper>
    </ErrorBoundary>
  );
}

export default App;
