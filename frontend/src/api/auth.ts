import api from './axios'
import type { ApiResponse, AuthResponse, LoginRequest, RegisterRequest } from '../types'

export const authApi = {
  register: (data: RegisterRequest) =>
    api.post<ApiResponse<AuthResponse>>('/auth/register', data),

  login: (data: LoginRequest) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', data),

  refreshToken: (refreshToken: string) =>
    api.post<ApiResponse<AuthResponse>>('/auth/refresh-token', { refreshToken }),

  getMe: () =>
    api.get<ApiResponse<{ id: number; firstName: string; lastName: string; email: string; theme: string }>>('/users/me'),

  forgotPassword: (email: string) =>
    api.post<ApiResponse<void>>('/auth/forgot-password', { email }),

  verifyOtp: (email: string, otpCode: string) =>
    api.post<ApiResponse<void>>('/auth/verify-otp', { email, otpCode }),

  resetPassword: (data: any) =>
    api.post<ApiResponse<void>>('/auth/reset-password', data),
}
