import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import config, { logger } from '../config';

/**
 * Create Axios instance with configuration
 */
export const apiClient = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * Retry logic with exponential backoff
 */
const retryRequest = async (error) => {
  const { config: requestConfig } = error;
  
  // Initialize retry count
  requestConfig.__retryCount = requestConfig.__retryCount || 0;
  
  // Check if we should retry
  if (
    !config.api.retryEnabled ||
    requestConfig.__retryCount >= config.api.retryCount ||
    !shouldRetry(error)
  ) {
    return Promise.reject(error);
  }
  
  requestConfig.__retryCount += 1;
  
  // Exponential backoff delay
  const delay = config.api.retryDelay * Math.pow(2, requestConfig.__retryCount - 1);
  
  logger.debug(`Retrying request (${requestConfig.__retryCount}/${config.api.retryCount}) after ${delay}ms`);
  
  await new Promise(resolve => setTimeout(resolve, delay));
  
  return apiClient(requestConfig);
};

/**
 * Determine if error is retryable
 */
const shouldRetry = (error) => {
  // Network errors
  if (!error.response) return true;
  
  // Server errors (5xx) are retryable
  const status = error.response.status;
  return status >= 500 && status <= 599;
};

/**
 * Request interceptor - add auth token and request ID
 */
apiClient.interceptors.request.use(
  (requestConfig) => {
    // Add auth token
    const token = useAuthStore.getState().token;
    if (token) {
      requestConfig.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request ID for tracing
    requestConfig.headers['X-Request-ID'] = generateRequestId();
    
    // Log in debug mode
    logger.debug(`API Request: ${requestConfig.method?.toUpperCase()} ${requestConfig.url}`);
    
    return requestConfig;
  },
  (error) => {
    logger.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - handle errors and retry
 */
apiClient.interceptors.response.use(
  (response) => {
    logger.debug(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest.__isRetryAuth) {
      originalRequest.__isRetryAuth = true;
      
      // Try to refresh token
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        // Retry original request with new token
        const token = useAuthStore.getState().token;
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      }
      
      // Refresh failed, logout and redirect
      useAuthStore.getState().logout();
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      logger.warn('Access forbidden:', originalRequest.url);
    }
    
    // Handle 404 Not Found
    if (error.response?.status === 404) {
      logger.warn('Resource not found:', originalRequest.url);
    }
    
    // Retry on server errors
    if (error.response?.status >= 500) {
      return retryRequest(error);
    }
    
    return Promise.reject(error);
  }
);

/**
 * Try to refresh the auth token
 */
const tryRefreshToken = async () => {
  try {
    const response = await axios.post(
      `${config.api.baseUrl}/auth/refresh`,
      {},
      { withCredentials: true }
    );
    
    if (response.data?.token) {
      useAuthStore.getState().setToken(response.data.token);
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

/**
 * Generate unique request ID
 */
const generateRequestId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Auth API
export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (data) => apiClient.post('/auth/register', data),
  logout: () => apiClient.post('/auth/logout'),
  refreshToken: () => apiClient.post('/auth/refresh'),
  getCurrentUser: () => apiClient.get('/auth/me'),
  verifyEmail: (token) => apiClient.post('/auth/verify-email', { token }),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => apiClient.post('/auth/reset-password', { token, password }),
};

// Emergency API
export const emergencyAPI = {
  getAll: (params) => apiClient.get('/emergencies', { params }),
  getById: (id) => apiClient.get(`/emergencies/${id}`),
  create: (data) => apiClient.post('/emergencies', data),
  update: (id, data) => apiClient.put(`/emergencies/${id}`, data),
  updateStatus: (id, status) => apiClient.patch(`/emergencies/${id}/status`, { status }),
  dispatch: (id, ambulanceId) => apiClient.post(`/emergencies/${id}/dispatch`, { ambulanceId }),
  resolve: (id, data) => apiClient.post(`/emergencies/${id}/resolve`, data),
  getTimeline: (id) => apiClient.get(`/emergencies/${id}/timeline`),
  triggerSOS: (data) => apiClient.post('/emergencies/sos', data),
};

// Ambulance API
export const ambulanceAPI = {
  getAll: (params) => apiClient.get('/ambulances', { params }),
  getById: (id) => apiClient.get(`/ambulances/${id}`),
  updateStatus: (id, status) => apiClient.patch(`/ambulances/${id}/status`, { status }),
  updateLocation: (id, location) => apiClient.patch(`/ambulances/${id}/location`, location),
  getAvailable: () => apiClient.get('/ambulances/available'),
  assign: (ambulanceId, emergencyId) => 
    apiClient.post(`/ambulances/${ambulanceId}/assign`, { emergencyId }),
};

// Hospital API
export const hospitalAPI = {
  getAll: (params) => apiClient.get('/hospitals', { params }),
  getById: (id) => apiClient.get(`/hospitals/${id}`),
  updateCapacity: (id, capacity) => apiClient.put(`/hospitals/${id}/capacity`, capacity),
  getCapacity: (id) => apiClient.get(`/hospitals/${id}/capacity`),
  getNearby: (lat, lng, radius) => 
    apiClient.get('/hospitals/nearby', { params: { lat, lng, radius } }),
};

// Patient API
export const patientAPI = {
  getById: (id) => apiClient.get(`/patients/${id}`),
  update: (id, data) => apiClient.put(`/patients/${id}`, data),
  getMedicalHistory: (id) => apiClient.get(`/patients/${id}/medical-history`),
  getEmergencyHistory: (id) => apiClient.get(`/patients/${id}/emergency-history`),
  addContact: (id, contact) => apiClient.post(`/patients/${id}/contacts`, contact),
  removeContact: (id, contactId) => apiClient.delete(`/patients/${id}/contacts/${contactId}`),
};

// AI Triage API
export const triageAPI = {
  analyze: (data) => apiClient.post('/triage/analyze', data),
  confirm: (triageId, doctorId) => apiClient.post(`/triage/${triageId}/confirm`, { doctorId }),
  getHistory: (emergencyId) => apiClient.get(`/triage/history/${emergencyId}`),
  getById: (id) => apiClient.get(`/triage/${id}`),
};

// Alert API
export const alertAPI = {
  getAll: (params) => apiClient.get('/alerts', { params }),
  markRead: (id) => apiClient.patch(`/alerts/${id}/read`),
  markAllRead: () => apiClient.patch('/alerts/read-all'),
};

// Family Portal API
export const familyAPI = {
  getEmergencyStatus: (emergencyId) => apiClient.get(`/family/emergency/${emergencyId}`),
  getTimeline: (emergencyId) => apiClient.get(`/family/emergency/${emergencyId}/timeline`),
  updateNotificationPreferences: (preferences) => 
    apiClient.put('/family/notification-preferences', preferences),
  getConsultationLink: (emergencyId) => 
    apiClient.get(`/family/emergency/${emergencyId}/consultation`),
};

export default apiClient;
