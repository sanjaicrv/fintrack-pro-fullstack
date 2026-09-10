import api from './axios'
import type { ApiResponse, AnalyticsResponse, DashboardResponse } from '../types'

export const analyticsApi = {
  getDashboard: (year?: number, month?: number) => {
    const params = year !== undefined && month !== undefined ? { year, month } : {}
    return api.get<ApiResponse<DashboardResponse>>('/analytics/dashboard', { params })
  },

  getAnalytics: (months = 6, year?: number, month?: number) => {
    const params: Record<string, number> = { months }
    if (year !== undefined && month !== undefined && year > 0 && month > 0) {
      params.year = year
      params.month = month
    }
    return api.get<ApiResponse<AnalyticsResponse>>('/analytics', { params })
  },
}
