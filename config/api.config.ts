import Constants from 'expo-constants';

/**
 * API Configuration with Auto-Detection
 *
 * This will automatically detect your development machine's IP address
 * from the Expo dev server URL, so you don't need to manually configure it.
 */

const PORT = '3002'; // Your backend port (matches backend .env)

// MANUAL IP OVERRIDE - Set this to your computer's IP if auto-detection fails
// Find your IP: Run 'ipconfig' in terminal and look for "IPv4 Address"
// Leave empty to use auto-detection (recommended for multi-device support)
const MANUAL_IP_OVERRIDE = ''; // e.g., '192.168.1.59'

/**
 * Get the local IP address from Expo's dev server
 */
function getLocalIP(): string {
  // If manual override is set, use it
  if (MANUAL_IP_OVERRIDE) {
    console.log(`[API Config] Using manual IP override: ${MANUAL_IP_OVERRIDE}`);
    return MANUAL_IP_OVERRIDE;
  }

  try {
    // Get the Expo dev server URL (e.g., exp://192.168.0.155:8081)
    const debuggerHost = Constants.expoConfig?.hostUri;

    if (debuggerHost) {
      // Extract IP address from the URL (remove protocol and port)
      let ip = debuggerHost.split(':')[0].replace(/^(exp|http|https):\/\//, '');

      // If we got a valid IP address, use it
      if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
        console.log(`[API Config] ✅ Auto-detected IP: ${ip}`);
        return ip;
      }
    }
  } catch (error) {
    console.warn('[API Config] Could not auto-detect IP:', error);
  }

  // If auto-detection failed, show a helpful error
  console.error('⚠️ [API Config] Could not detect IP address!');
  console.error('🔧 To fix: Set MANUAL_IP_OVERRIDE in config/api.config.ts');
  console.error('💡 Run "ipconfig" in your terminal to find your IPv4 Address');

  // Return localhost as last resort (won't work on physical devices)
  return 'localhost';
}

/**
 * Get the base URL for development
 * Automatically uses your computer's IP address
 */
function getDevBaseURL(): string {
  const ip = getLocalIP();
  return `http://${ip}:${PORT}/api/v1`;
}

// Base URL for production - Render deployment
const PROD_BASE_URL = 'https://ff-backend-1.onrender.com/api/v1';

export const API_CONFIG = {
  /**
   * Get the base URL based on environment
   */
  getBaseURL: (): string => {
    // Using Render production URL for tunnel testing
    return PROD_BASE_URL;
  },

  /**
   * Check if in development mode
   */
  isDevelopment: (): boolean => {
    return __DEV__;
  },

  /**
   * Get local IP (for debugging)
   */
  getLocalIP: (): string => {
    return getLocalIP();
  },

  /**
   * Get backend port
   */
  getPort: (): string => {
    return PORT;
  },
};

// Export individual URLs for convenience
export const BASE_URL = API_CONFIG.getBaseURL();
