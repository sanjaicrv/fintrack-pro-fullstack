import api from './axios'
import type { ApiResponse, GoalRequest, GoalResponse, PagedResponse } from '../types'

export const goalApi = {
  getAll: () =>
    api.get<ApiResponse<GoalResponse[]>>('/goals'),

  getPaged: (page = 0, size = 20, sortBy = 'deadline', sortDir = 'asc') =>
    api.get<ApiResponse<PagedResponse<GoalResponse>>>(`/goals/paged?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`),

  getById: (id: number) =>
    api.get<ApiResponse<GoalResponse>>(`/goals/${id}`),

  create: (data: GoalRequest) =>
    api.post<ApiResponse<GoalResponse>>('/goals', data),

  update: (id: number, data: GoalRequest) =>
    api.put<ApiResponse<GoalResponse>>(`/goals/${id}`, data),

  contribute: (id: number, amount: number) =>
    api.patch<ApiResponse<GoalResponse>>(`/goals/${id}/contribute`, { amount }),

  delete: (id: number) =>
    api.delete<ApiResponse<void>>(`/goals/${id}`),
}
