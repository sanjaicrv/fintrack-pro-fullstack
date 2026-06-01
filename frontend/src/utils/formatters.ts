export const fmt = {
  currency: (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n),

  percent: (n: number) => `${n.toFixed(1)}%`,

  date: (d: string) =>
    new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),

  shortDate: (d: string) =>
    new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
}

export const CATEGORY_LABELS: Record<string, string> = {
  HOUSING: 'Housing', TRANSPORTATION: 'Transportation', FOOD: 'Food & Dining',
  UTILITIES: 'Utilities', INSURANCE: 'Insurance', HEALTHCARE: 'Healthcare',
  DEBT_PAYMENTS: 'Debt Payments', ENTERTAINMENT: 'Entertainment',
  PERSONAL_CARE: 'Personal Care', EDUCATION: 'Education', CLOTHING: 'Clothing',
  GIFTS_DONATIONS: 'Gifts & Donations', SAVINGS: 'Savings', OTHER: 'Other',
}

export const CATEGORY_COLORS: Record<string, string> = {
  HOUSING: '#6366f1', TRANSPORTATION: '#8b5cf6', FOOD: '#ec4899',
  UTILITIES: '#f97316', INSURANCE: '#14b8a6', HEALTHCARE: '#06b6d4',
  DEBT_PAYMENTS: '#ef4444', ENTERTAINMENT: '#eab308', PERSONAL_CARE: '#84cc16',
  EDUCATION: '#10b981', CLOTHING: '#f59e0b', GIFTS_DONATIONS: '#a855f7',
  SAVINGS: '#3b82f6', OTHER: '#6b7280',
}

export const FREQUENCY_LABELS: Record<string, string> = {
  WEEKLY: 'Weekly', BIWEEKLY: 'Bi-weekly', MONTHLY: 'Monthly', YEARLY: 'Yearly',
}
