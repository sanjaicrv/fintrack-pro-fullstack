import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
  LineChart, Line
} from 'recharts'
import { analyticsApi } from '../api/analytics'
import type { AnalyticsResponse } from '../types'
import { fmt, CATEGORY_COLORS, CATEGORY_LABELS } from '../utils/formatters'
import StatCard from '../components/Cards/StatCard'
import { PageLoader } from '../components/Common/Feedback'
import { TrendingUp, TrendingDown, PiggyBank, Percent } from 'lucide-react'

const MONTHS_OPTIONS = [3, 6, 12]

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [months, setMonths] = useState(6)

  useEffect(() => {
    setLoading(true)
    analyticsApi.getAnalytics(months)
      .then(r => setData(r.data.data!))
      .finally(() => setLoading(false))
  }, [months])

  if (loading) return <PageLoader />
  const d = data!

  return (
    <div className="space-y-6">
      {/* Header with period picker */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Financial insights and trends</p>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          {MONTHS_OPTIONS.map(m => (
            <button
              key={m}
              onClick={() => setMonths(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                months === m
                  ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-300 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {m}M
            </button>
          ))}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Income"   value={fmt.currency(d.totalIncome)}           icon={TrendingUp}  color="green"  subtext={`Avg ${fmt.currency(d.averageMonthlyIncome)}/mo`}  />
        <StatCard label="Total Expenses" value={fmt.currency(d.totalExpense)}          icon={TrendingDown} color="red"    subtext={`Avg ${fmt.currency(d.averageMonthlyExpense)}/mo`} />
        <StatCard label="Net Savings"    value={fmt.currency(d.totalSavings)}          icon={PiggyBank}    color="blue"   subtext={d.totalSavings >= 0 ? 'Positive cashflow' : 'Overspending'} />
        <StatCard label="Savings Rate"   value={fmt.percent(d.savingsRate)}            icon={Percent}      color="purple" subtext="Of total income" />
      </div>

      {/* Income vs Expense bar chart */}
      <div className="card">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Income vs Expenses</h2>
        {d.incomeVsExpense.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">No data for this period</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={d.incomeVsExpense} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => fmt.currency(v)} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="income"  fill="#6366f1" radius={[4, 4, 0, 0]} name="Income"   />
              <Bar dataKey="expense" fill="#f87171" radius={[4, 4, 0, 0]} name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Category pie + savings line */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Expense category breakdown */}
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Expense Breakdown</h2>
          {d.expenseByCategory.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">No expense data</p>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie data={d.expenseByCategory} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                    dataKey="amount" nameKey="categoryLabel">
                    {d.expenseByCategory.map((e, i) => (
                      <Cell key={i} fill={CATEGORY_COLORS[e.category] ?? '#6b7280'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => fmt.currency(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1.5 w-full">
                {d.expenseByCategory.slice(0, 8).map(c => (
                  <div key={c.category} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: CATEGORY_COLORS[c.category] ?? '#6b7280' }} />
                    <span className="text-xs text-gray-600 dark:text-gray-400 flex-1 truncate">{CATEGORY_LABELS[c.category] ?? c.category}</span>
                    <span className="text-xs font-medium text-gray-900 dark:text-white">{fmt.percent(c.percentage)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Savings progress line chart */}
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Savings Progress</h2>
          {d.savingsProgress.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">No data</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={d.savingsProgress} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => fmt.currency(v)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="monthlySavings"    stroke="#6366f1" strokeWidth={2} dot={false} name="Monthly"    />
                <Line type="monotone" dataKey="cumulativeSavings" stroke="#10b981" strokeWidth={2} dot={false} name="Cumulative" strokeDasharray="5 3" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
