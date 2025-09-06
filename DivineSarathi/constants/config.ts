import { Platform } from 'react-native';

/**
 * API Configuration
 * 
 * Production URL: https://api.divinesarathi.in
 * Development URLs: localhost with platform-specific handling for Android emulator
 */

// Base URLs
const PROD_API_URL = 'https://api.divinesarathi.in';
const DEV_API_URL_ANDROID = 'http://10.0.2.2:3001'; // Android emulator localhost
const DEV_API_URL_IOS = 'http://127.0.0.1:3001'; // iOS simulator localhost
const DEV_API_URL_DEFAULT = 'http://localhost:3001'; // Default localhost

/**
 * Get the appropriate API base URL based on environment and platform
 */
export const getApiBaseUrl = (): string => {
  // Force production API for testing
  // TODO: Remove this line to restore normal environment detection
  return PROD_API_URL;
  
  if (!__DEV__) {
    return PROD_API_URL;
  }
  
  // Development environment - handle platform-specific localhost
  if (Platform.OS === 'android') {
    return DEV_API_URL_ANDROID;
  } else if (Platform.OS === 'ios') {
    return DEV_API_URL_IOS;
  }
  
  return DEV_API_URL_DEFAULT;
};

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    GOOGLE: '/auth/google/app',
    CHECK: '/auth/check',
  },
  
  // Session management
  SESSION: {
    CREATE: '/session/create',
  },
  
  // User management
  USER: {
    INFO: '/user/info',
    PROFILE: '/user/profile',
  },
  
  // Add more endpoints as needed
} as const;

/**
 * Build full API URL
 */
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${endpoint}`;
};

/**
 * Common API configuration
 */
export const API_CONFIG = {
  HEADERS: {
    'Content-Type': 'application/json',
  },
  TIMEOUT: 10000, // 10 seconds
} as const;

// Export constants for backward compatibility
export const API_BASE_URL = getApiBaseUrl();
export const PROD_URL = PROD_API_URL;
