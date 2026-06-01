// ── Enums ──────────────────────────────────────────────────────────────────
export type Frequency = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'YEARLY'
export type Theme = 'LIGHT' | 'DARK'
export type Role = 'USER' | 'ADMIN'
export type GoalStatus = 'IN_PROGRESS' | 'URGENT' | 'COMPLETED' | 'OVERDUE'

export type ExpenseCategory =
  | 'HOUSING' | 'TRANSPORTATION' | 'FOOD' | 'UTILITIES'
  | 'INSURANCE' | 'HEALTHCARE' | 'DEBT_PAYMENTS' | 'ENTERTAINMENT'
  | 'PERSONAL_CARE' | 'EDUCATION' | 'CLOTHING' | 'GIFTS_DONATIONS'
  | 'SAVINGS' | 'OTHER'

// ── Auth ───────────────────────────────────────────────────────────────────
export interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  password: string
}
export interface LoginRequest {
  email: string
  password: string
}
export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  userId: number
  firstName: string
  lastName: string
  email: string
  theme: Theme
}

// ── User ───────────────────────────────────────────────────────────────────
export interface UserResponse {
  id: number
  firstName: string
  lastName: string
  email: string
  theme: Theme
  createdAt: string
}
export interface UserUpdateRequest {
  firstName: string
  lastName: string
  theme: Theme
}

// ── Income ─────────────────────────────────────────────────────────────────
export interface IncomeRequest {
  source: string
  amount: number
  date: string
  recurring: boolean
  frequency?: Frequency
}
export interface IncomeResponse {
  id: number
  source: string
  amount: number
  date: string
  recurring: boolean
  frequency?: Frequency
  createdAt: string
  updatedAt: string
}

// ── Expense ────────────────────────────────────────────────────────────────
export interface ExpenseRequest {
  category: ExpenseCategory
  description: string
  amount: number
  date: string
  recurring: boolean
  frequency?: Frequency
}
export interface ExpenseResponse {
  id: number
  category: ExpenseCategory
  description: string
  amount: number
  date: string
  recurring: boolean
  frequency?: Frequency
  createdAt: string
  updatedAt: string
}

// ── Goal ───────────────────────────────────────────────────────────────────
export interface GoalRequest {
  name: string
  targetAmount: number
  currentAmount: number
  deadline: string
}
export interface GoalResponse {
  id: number
  name: string
  targetAmount: number
  currentAmount: number
  deadline: string
  progressPercentage: number
  daysRemaining: number
  status: GoalStatus
  createdAt: string
  updatedAt: string
}

// ── Analytics ──────────────────────────────────────────────────────────────
export interface MonthlyData {
  month: string
  income: number
  expense: number
  savings: number
}
export interface CategoryBreakdown {
  category: ExpenseCategory
  categoryLabel: string
  amount: number
  percentage: number
}
export interface SavingsProgress {
  month: string
  monthlySavings: number
  cumulativeSavings: number
}
export interface AnalyticsResponse {
  incomeVsExpense: MonthlyData[]
  expenseByCategory: CategoryBreakdown[]
  savingsProgress: SavingsProgress[]
  totalIncome: number
  totalExpense: number
  totalSavings: number
  savingsRate: number
  averageMonthlyIncome: number
  averageMonthlyExpense: number
}

// ── Dashboard ──────────────────────────────────────────────────────────────
export interface MonthlySummary {
  month: string
  totalIncome: number
  totalExpense: number
  savings: number
}
export interface DashboardResponse {
  totalIncome: number
  totalExpense: number
  savings: number
  savingsRate: number
  recentIncomes: IncomeResponse[]
  recentExpenses: ExpenseResponse[]
  goals: GoalResponse[]
  monthlySummaries: MonthlySummary[]
}

// ── Shared ─────────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  errors?: Record<string, string>
  timestamp: string
}
export interface PagedResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
  first: boolean
}
