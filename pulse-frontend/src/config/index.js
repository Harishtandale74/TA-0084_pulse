/**
 * PULSE Frontend Configuration
 * Centralized environment configuration with defaults and validation
 */

// Helper to get env variable with fallback
const getEnv = (key, defaultValue = '') => {
  const value = import.meta.env[key];
  return value !== undefined ? value : defaultValue;
};

// Helper to parse boolean env variables
const getBoolEnv = (key, defaultValue = false) => {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  return value === 'true' || value === '1';
};

// Helper to parse number env variables
const getNumberEnv = (key, defaultValue = 0) => {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Application Configuration
 */
const config = {
  // Environment
  env: getEnv('VITE_ENV', 'development'),
  isDevelopment: getEnv('VITE_ENV', 'development') === 'development',
  isProduction: getEnv('VITE_ENV', 'development') === 'production',
  isStaging: getEnv('VITE_ENV', 'development') === 'staging',

  // API Configuration
  api: {
    baseUrl: getEnv('VITE_API_BASE_URL', 'http://localhost:8080/api'),
    timeout: getNumberEnv('VITE_API_TIMEOUT', 30000),
    retryEnabled: getBoolEnv('VITE_API_RETRY_ENABLED', true),
    retryCount: getNumberEnv('VITE_API_RETRY_COUNT', 3),
    retryDelay: 1000, // Base delay in ms (exponential backoff)
  },

  // WebSocket Configuration
  websocket: {
    url: getEnv('VITE_WS_URL', 'http://localhost:8080/ws'),
    enabled: getBoolEnv('VITE_ENABLE_WEBSOCKET', true),
    maxReconnectAttempts: getNumberEnv('VITE_WS_MAX_RECONNECT_ATTEMPTS', 5),
    reconnectDelay: 3000, // Base delay in ms
    heartbeatIncoming: 20000,
    heartbeatOutgoing: 20000,
  },

  // Google Maps Configuration
  maps: {
    apiKey: getEnv('VITE_GOOGLE_MAPS_API_KEY', ''),
    mapId: getEnv('VITE_GOOGLE_MAPS_MAP_ID', ''),
    defaultCenter: { lat: 40.7128, lng: -74.006 }, // New York City
    defaultZoom: 12,
    get enabled() {
      return Boolean(this.apiKey);
    },
  },

  // Authentication Configuration
  auth: {
    tokenKey: getEnv('VITE_AUTH_TOKEN_KEY', 'pulse_auth_token'),
    sessionTimeout: getNumberEnv('VITE_SESSION_TIMEOUT', 60), // minutes
    demoMode: getBoolEnv('VITE_DEMO_MODE', true),
    refreshThreshold: 5, // Refresh token 5 minutes before expiry
  },

  // Feature Flags
  features: {
    aiTriage: getBoolEnv('VITE_FEATURE_AI_TRIAGE', true),
    familyPortal: getBoolEnv('VITE_FEATURE_FAMILY_PORTAL', true),
    chat: getBoolEnv('VITE_FEATURE_CHAT', true),
    videoCalls: getBoolEnv('VITE_FEATURE_VIDEO_CALLS', true),
  },

  // Logging Configuration
  logging: {
    level: getEnv('VITE_LOG_LEVEL', 'debug'),
    performanceMonitoring: getBoolEnv('VITE_ENABLE_PERFORMANCE_MONITORING', false),
    get isDebug() {
      return this.level === 'debug';
    },
  },

  // Third-Party Integrations
  integrations: {
    sentryDsn: getEnv('VITE_SENTRY_DSN', ''),
    analyticsId: getEnv('VITE_ANALYTICS_ID', ''),
    get sentryEnabled() {
      return Boolean(this.sentryDsn);
    },
    get analyticsEnabled() {
      return Boolean(this.analyticsId);
    },
  },

  // UI Configuration
  ui: {
    toastDuration: 5000,
    animationsEnabled: true,
    maxNotifications: 50,
    refreshInterval: 30000, // Auto-refresh data interval
  },

  // Emergency Priority Colors (for consistency)
  priorities: {
    CRITICAL: { color: '#ef4444', bg: '#fef2f2', label: 'Critical' },
    URGENT: { color: '#f97316', bg: '#fff7ed', label: 'Urgent' },
    DELAYED: { color: '#eab308', bg: '#fefce8', label: 'Delayed' },
    MINOR: { color: '#22c55e', bg: '#f0fdf4', label: 'Minor' },
  },
};

/**
 * Validate configuration at startup
 */
export const validateConfig = () => {
  const warnings = [];
  const errors = [];

  // API URL validation
  if (!config.api.baseUrl) {
    errors.push('API base URL is not configured');
  }

  // WebSocket URL validation
  if (config.websocket.enabled && !config.websocket.url) {
    warnings.push('WebSocket enabled but URL not configured');
  }

  // Google Maps validation
  if (!config.maps.apiKey) {
    warnings.push('Google Maps API key not configured - using fallback map');
  }

  // Demo mode warning
  if (config.auth.demoMode && config.isProduction) {
    warnings.push('Demo mode is enabled in production');
  }

  // Log warnings and errors
  if (warnings.length > 0 && config.logging.isDebug) {
    console.warn('[Config] Warnings:', warnings);
  }

  if (errors.length > 0) {
    console.error('[Config] Errors:', errors);
    if (config.isProduction) {
      throw new Error(`Configuration errors: ${errors.join(', ')}`);
    }
  }

  return { warnings, errors, valid: errors.length === 0 };
};

/**
 * Get API headers with authentication
 */
export const getApiHeaders = (token = null) => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Build full API URL
 */
export const buildApiUrl = (endpoint) => {
  const baseUrl = config.api.baseUrl.replace(/\/+$/, '');
  const path = endpoint.replace(/^\/+/, '');
  return `${baseUrl}/${path}`;
};

/**
 * Logger utility based on config
 */
export const logger = {
  debug: (...args) => {
    if (config.logging.level === 'debug') {
      console.log('[DEBUG]', ...args);
    }
  },
  info: (...args) => {
    if (['debug', 'info'].includes(config.logging.level)) {
      console.info('[INFO]', ...args);
    }
  },
  warn: (...args) => {
    if (['debug', 'info', 'warn'].includes(config.logging.level)) {
      console.warn('[WARN]', ...args);
    }
  },
  error: (...args) => {
    console.error('[ERROR]', ...args);
  },
};

export default config;
