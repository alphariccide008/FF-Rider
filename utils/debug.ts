import { API_CONFIG } from '../config/api.config';

/**
 * Log API configuration (helps with debugging connection issues)
 */
export function logAPIConfig() {
  if (__DEV__) {
    console.log('=================================');
    console.log('🚀 Flexyfuel Rider App');
    console.log('=================================');
    console.log('📡 API Base URL:', API_CONFIG.getBaseURL());
    console.log('🌐 Auto-detected IP:', API_CONFIG.getLocalIP());
    console.log('🔌 Backend Port:', API_CONFIG.getPort());
    console.log('🔧 Environment:', API_CONFIG.isDevelopment() ? 'Development' : 'Production');
    console.log('=================================');
    console.log('ℹ️  Make sure your backend is running on port', API_CONFIG.getPort());
    console.log('=================================');
  }
}

/**
 * Log function for development
 */
export function devLog(message: string, ...args: any[]) {
  if (__DEV__) {
    console.log(`[Rider App] ${message}`, ...args);
  }
}

/**
 * Log error function
 */
export function devError(message: string, error: any) {
  if (__DEV__) {
    console.error(`[Rider App ERROR] ${message}`, error);
  }
}
