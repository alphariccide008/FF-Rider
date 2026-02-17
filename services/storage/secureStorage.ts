import * as SecureStore from 'expo-secure-store';
import { User } from '../../types/user';
import { STORAGE_KEYS } from '../../utils/constants';
import { devLog, devError } from '../../utils/debug';

/**
 * Save access token securely
 */
export async function saveAccessToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, token);
    devLog('Access token saved');
  } catch (error) {
    devError('Failed to save access token', error);
    throw error;
  }
}

/**
 * Get access token
 */
export async function getAccessToken(): Promise<string | null> {
  try {
    const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
    return token;
  } catch (error) {
    devError('Failed to get access token', error);
    return null;
  }
}

/**
 * Save refresh token securely
 */
export async function saveRefreshToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, token);
    devLog('Refresh token saved');
  } catch (error) {
    devError('Failed to save refresh token', error);
    throw error;
  }
}

/**
 * Get refresh token
 */
export async function getRefreshToken(): Promise<string | null> {
  try {
    const token = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    return token;
  } catch (error) {
    devError('Failed to get refresh token', error);
    return null;
  }
}

/**
 * Save user data
 */
export async function saveUser(user: User): Promise<void> {
  try {
    await SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(user));
    devLog('User data saved');
  } catch (error) {
    devError('Failed to save user data', error);
    throw error;
  }
}

/**
 * Get user data
 */
export async function getUser(): Promise<User | null> {
  try {
    const userJson = await SecureStore.getItemAsync(STORAGE_KEYS.USER);
    if (!userJson) return null;
    return JSON.parse(userJson) as User;
  } catch (error) {
    devError('Failed to get user data', error);
    return null;
  }
}

/**
 * Clear all stored authentication data
 */
export async function clearAuthStorage(): Promise<void> {
  try {
    await Promise.all([
      SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
      SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
      SecureStore.deleteItemAsync(STORAGE_KEYS.USER),
    ]);
    devLog('Auth storage cleared');
  } catch (error) {
    devError('Failed to clear auth storage', error);
    throw error;
  }
}

/**
 * Check if onboarding is complete
 */
export async function isOnboardingComplete(): Promise<boolean> {
  try {
    const value = await SecureStore.getItemAsync(STORAGE_KEYS.ONBOARDING_COMPLETE);
    return value === 'true';
  } catch (error) {
    devError('Failed to check onboarding status', error);
    return false;
  }
}

/**
 * Mark onboarding as complete
 */
export async function setOnboardingComplete(): Promise<void> {
  try {
    await SecureStore.setItemAsync(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');
    devLog('Onboarding marked as complete');
  } catch (error) {
    devError('Failed to set onboarding complete', error);
    throw error;
  }
}
