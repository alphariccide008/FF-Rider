import { create } from 'zustand';
import { User, RiderProfile } from '../types/user';
import * as authApi from '../services/api/auth.api';
import * as storage from '../services/storage/secureStorage';
import { devLog, devError } from '../utils/debug';

interface AuthState {
  // State
  user: RiderProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  loginWithPhone: (emailOrPhone: string) => Promise<void>;
  verifyOTP: (emailOrPhone: string, code: string) => Promise<void>;
  completeSignup: (fullName: string, email: string, phoneNumber: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  /**
   * Login with email or phone number (sends OTP)
   */
  loginWithPhone: async (emailOrPhone: string) => {
    try {
      set({ isLoading: true, error: null });

      // Check if input is email or phone
      const isEmail = emailOrPhone.includes('@');

      if (isEmail) {
        await authApi.sendEmailOTP(emailOrPhone);
      } else {
        await authApi.loginWithPhone(emailOrPhone);
      }

      set({ isLoading: false });
      devLog('OTP sent successfully');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to send OTP';
      set({ isLoading: false, error: errorMessage });
      devError('Login failed', error);
      throw error;
    }
  },

  /**
   * Verify OTP and complete login
   */
  verifyOTP: async (emailOrPhone: string, code: string) => {
    try {
      set({ isLoading: true, error: null });

      // Check if input is email or phone
      const isEmail = emailOrPhone.includes('@');

      let response;

      if (isEmail) {
        // Step 1: Verify email OTP
        await authApi.verifyEmailOTP(emailOrPhone, code);

        // Step 2: Login with password to get user and tokens
        response = await authApi.loginWithPassword(emailOrPhone);
      } else {
        // Phone OTP returns user and tokens directly
        response = await authApi.verifyOTP(emailOrPhone, code);
      }

      // Verify user is a rider
      if (response.user.role !== 'rider') {
        throw new Error('Access denied. This app is for riders only.');
      }

      // Save tokens to secure storage
      await Promise.all([
        storage.saveAccessToken(response.accessToken),
        storage.saveRefreshToken(response.refreshToken),
        storage.saveUser(response.user),
      ]);

      set({
        user: response.user as RiderProfile,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      devLog('Login successful');
    } catch (error: any) {
      const errorMessage = error.message || 'Invalid OTP code';
      set({ isLoading: false, error: errorMessage });
      devError('OTP verification failed', error);
      throw error;
    }
  },

  /**
   * Complete signup after email OTP verification
   */
  completeSignup: async (fullName: string, email: string, phoneNumber: string, code: string) => {
    try {
      set({ isLoading: true, error: null });

      // Step 1: Verify email OTP
      await authApi.verifyEmailOTP(email, code);

      // Step 2: Register user and get tokens
      const registerResponse = await authApi.completeRegistration(fullName, email, phoneNumber);

      // Check if user is a rider
      if (registerResponse.user.role !== 'rider') {
        throw new Error('Access denied. This app is for riders only.');
      }

      // Save tokens to secure storage
      await Promise.all([
        storage.saveAccessToken(registerResponse.accessToken),
        storage.saveRefreshToken(registerResponse.refreshToken),
        storage.saveUser(registerResponse.user),
      ]);

      set({
        user: registerResponse.user as RiderProfile,
        accessToken: registerResponse.accessToken,
        refreshToken: registerResponse.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      devLog('Signup successful');
    } catch (error: any) {
      const errorMessage = error.message || 'Signup failed';
      set({ isLoading: false, error: errorMessage });
      devError('Signup failed', error);
      throw error;
    }
  },

  /**
   * Logout user
   */
  logout: async () => {
    try {
      set({ isLoading: true });

      // Call logout API
      try {
        await authApi.logout();
      } catch (error) {
        // Continue with logout even if API call fails
        devError('Logout API call failed', error);
      }

      // Clear storage
      await storage.clearAuthStorage();

      // Reset state
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });

      devLog('Logout successful');
    } catch (error: any) {
      set({ isLoading: false, error: 'Logout failed' });
      devError('Logout failed', error);
      throw error;
    }
  },

  /**
   * Load stored authentication on app start
   */
  loadStoredAuth: async () => {
    try {
      set({ isLoading: true });

      const [accessToken, refreshToken, user] = await Promise.all([
        storage.getAccessToken(),
        storage.getRefreshToken(),
        storage.getUser(),
      ]);

      if (accessToken && refreshToken && user) {
        // Verify user is a rider
        if (user.role === 'rider') {
          set({
            user: user as RiderProfile,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
          devLog('Auth restored from storage');
          return;
        }
      }

      // No valid auth found
      set({ isLoading: false });
    } catch (error) {
      devError('Failed to load stored auth', error);
      set({ isLoading: false });
    }
  },

  /**
   * Clear error
   */
  clearError: () => {
    set({ error: null });
  },
}));
