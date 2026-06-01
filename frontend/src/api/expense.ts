import api from './axios'
import type { ApiResponse, ExpenseRequest, ExpenseResponse, PagedResponse } from '../types'

export const expenseApi = {
  getAll: () =>
    api.get<ApiResponse<ExpenseResponse[]>>('/expenses'),

  getPaged: (page = 0, size = 20, sortBy = 'date', sortDir = 'desc') =>
    api.get<ApiResponse<PagedResponse<ExpenseResponse>>>(`/expenses/paged?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`),

  getById: (id: number) =>
    api.get<ApiResponse<ExpenseResponse>>(`/expenses/${id}`),

  create: (data: ExpenseRequest) =>
    api.post<ApiResponse<ExpenseResponse>>('/expenses', data),

  update: (id: number, data: ExpenseRequest) =>
    api.put<ApiResponse<ExpenseResponse>>(`/expenses/${id}`, data),

  delete: (id: number) =>
    api.delete<ApiResponse<void>>(`/expenses/${id}`),
}
