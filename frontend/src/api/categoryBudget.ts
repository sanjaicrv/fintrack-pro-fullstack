import api from './axios'
import type { ApiResponse, CategoryBudgetResponse, ExpenseCategory } from '../types'

export const categoryBudgetApi = {
  getCategoryBudgets: (year?: number, month?: number) => {
    const params = year !== undefined && month !== undefined ? { year, month } : {}
    return api.get<ApiResponse<CategoryBudgetResponse[]>>('/category-budgets', { params })
  },

  setCategoryBudget: (category: ExpenseCategory, budgetAmount: number, year?: number, month?: number) => {
    const params = year !== undefined && month !== undefined ? { year, month } : {}
    return api.put<ApiResponse<CategoryBudgetResponse>>('/category-budgets', { category, budgetAmount }, { params })
  },

  deleteCategoryBudget: (category: ExpenseCategory) =>
    api.delete<ApiResponse<void>>(`/category-budgets/${category}`),
}
