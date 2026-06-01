import api from './axios'
import type { ApiResponse, UserResponse, UserUpdateRequest } from '../types'

export const userApi = {
  getMe: () =>
    api.get<ApiResponse<UserResponse>>('/users/me'),

  update: (data: UserUpdateRequest) =>
    api.put<ApiResponse<UserResponse>>('/users/me', data),

  toggleTheme: () =>
    api.patch<ApiResponse<UserResponse>>('/users/me/theme'),

  changePassword: (currentPassword: string, newPassword: string, confirmPassword: string) =>
    api.patch<ApiResponse<void>>('/users/me/password', { currentPassword, newPassword, confirmPassword }),
}
