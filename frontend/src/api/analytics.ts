import api from './axios'
import type { ApiResponse, AnalyticsResponse, DashboardResponse } from '../types'

export const analyticsApi = {
  getDashboard: () =>
    api.get<ApiResponse<DashboardResponse>>('/analytics/dashboard'),

  getAnalytics: (months = 6) =>
    api.get<ApiResponse<AnalyticsResponse>>(`/analytics?months=${months}`),
}
