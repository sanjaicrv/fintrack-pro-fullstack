import api from './axios'
import type { ApiResponse, IncomeRequest, IncomeResponse, PagedResponse } from '../types'

export const incomeApi = {
  getAll: () =>
    api.get<ApiResponse<IncomeResponse[]>>('/incomes'),

  getPaged: (page = 0, size = 20, sortBy = 'date', sortDir = 'desc') =>
    api.get<ApiResponse<PagedResponse<IncomeResponse>>>(`/incomes/paged?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`),

  getById: (id: number) =>
    api.get<ApiResponse<IncomeResponse>>(`/incomes/${id}`),

  create: (data: IncomeRequest) =>
    api.post<ApiResponse<IncomeResponse>>('/incomes', data),

  update: (id: number, data: IncomeRequest) =>
    api.put<ApiResponse<IncomeResponse>>(`/incomes/${id}`, data),

  delete: (id: number) =>
    api.delete<ApiResponse<void>>(`/incomes/${id}`),
}
