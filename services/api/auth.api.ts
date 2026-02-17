import apiClient from './client';
import { ApiResponse } from '../../types/api';
import { User } from '../../types/user';

interface SendOTPResponse {
  message: string;
  phoneNumber?: string;
  email?: string;
}

interface VerifyOTPResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface VerifyEmailOTPResponse {
  email: string;
  verified: boolean;
  message?: string;
}

interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

/**
 * Send OTP to phone number
 */
export async function sendOTP(phoneNumber: string): Promise<SendOTPResponse> {
  const response = await apiClient.post<ApiResponse<SendOTPResponse>>('/auth/send-otp', {
    phoneNumber,
  });
  return response.data.data!;
}

/**
 * Verify OTP code
 */
export async function verifyOTP(
  phoneNumber: string,
  code: string
): Promise<VerifyOTPResponse> {
  const response = await apiClient.post<ApiResponse<VerifyOTPResponse>>('/auth/verify-otp', {
    phoneNumber,
    code,
  });
  return response.data.data!;
}

/**
 * Login with phone number and OTP
 */
export async function loginWithPhone(phoneNumber: string): Promise<SendOTPResponse> {
  const response = await apiClient.post<ApiResponse<SendOTPResponse>>('/auth/login', {
    phoneNumber,
  });
  return response.data.data!;
}

/**
 * Send OTP to email
 */
export async function sendEmailOTP(email: string): Promise<SendOTPResponse> {
  const response = await apiClient.post<ApiResponse<SendOTPResponse>>('/auth/send-email-otp', {
    email,
    purpose: 'registration'
  });
  return response.data.data!;
}

/**
 * Verify email OTP code (only verifies, doesn't login)
 */
export async function verifyEmailOTP(
  email: string,
  code: string
): Promise<VerifyEmailOTPResponse> {
  const response = await apiClient.post<ApiResponse<VerifyEmailOTPResponse>>('/auth/verify-email-otp', {
    email,
    code,
  });
  return response.data.data!;
}

/**
 * Signup new rider with email (sends OTP)
 */
export async function signupWithEmail(
  email: string
): Promise<SendOTPResponse> {
  const response = await apiClient.post<ApiResponse<SendOTPResponse>>('/auth/send-email-otp', {
    email,
    purpose: 'registration'
  });
  return response.data.data!;
}

/**
 * Complete registration after email OTP verification
 */
export async function completeRegistration(
  fullName: string,
  email: string,
  phoneNumber: string
): Promise<VerifyOTPResponse> {
  // Using register-with-password since we verified email OTP (not phone OTP)
  // Generate a default password for email-based registration
  const defaultPassword = 'TempPass123!';

  const response = await apiClient.post<ApiResponse<VerifyOTPResponse>>('/auth/register-with-password', {
    fullName,
    email,
    phoneNumber,
    password: defaultPassword,
    role: 'rider'
  });
  return response.data.data!;
}

/**
 * Login with email and password
 */
export async function loginWithPassword(
  email: string,
  password: string = 'TempPass123!'
): Promise<LoginResponse> {
  const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login-with-password', {
    email,
    password,
  });
  return response.data.data!;
}

/**
 * Logout
 */
export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}

/**
 * Refresh access token
 */
export async function refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
  const response = await apiClient.post<ApiResponse<{ accessToken: string }>>('/auth/refresh', {
    refreshToken,
  });
  return response.data.data!;
}
