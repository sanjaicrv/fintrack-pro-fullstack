import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, PiggyBank, Percent } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { analyticsApi } from '../api/analytics'
import type { DashboardResponse } from '../types'
import { fmt } from '../utils/formatters'
import { CATEGORY_LABELS } from '../utils/formatters'
import StatCard from '../components/Cards/StatCard'
import { PageLoader } from '../components/Common/Feedback'
import { useAuth } from '../context/AuthContext'

export default function DashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    analyticsApi.getDashboard()
      .then(r => setData(r.data.data!))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader />

  const d = data!

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Good {getGreeting()}, {user?.firstName}! 👋
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Here's your financial overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Income"   value={fmt.currency(d.totalIncome)}  icon={TrendingUp}   color="green"  subtext="All time" />
        <StatCard label="Total Expenses" value={fmt.currency(d.totalExpense)} icon={TrendingDown}  color="red"    subtext="All time" />
<StatCard
  label="Net Savings"
  value={fmt.currency(d.savings)}
  icon={PiggyBank}
  color="blue"
  subtext={d.savings >= 0 ? "You're saving!" : "Deficit"}
/>
        <StatCard label="Savings Rate"   value={fmt.percent(d.savingsRate)}   icon={Percent}       color="purple" subtext="Of income" />
      </div>

      {/* Chart + recent */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Monthly chart */}
        <div className="xl:col-span-2 card">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Monthly Overview</h2>
          {d.monthlySummaries.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={d.monthlySummaries} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="inc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => fmt.currency(v)} />
                <Area type="monotone" dataKey="totalIncome"  stroke="#6366f1" fill="url(#inc)" strokeWidth={2} name="Income"  />
                <Area type="monotone" dataKey="totalExpense" stroke="#ef4444" fill="url(#exp)" strokeWidth={2} name="Expense" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Goals summary */}
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Goals Progress</h2>
          {d.goals.length === 0
            ? <p className="text-sm text-gray-400 text-center py-8">No goals yet</p>
            : (
              <div className="space-y-3">
                {d.goals.slice(0, 4).map(g => (
                  <div key={g.id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-gray-700 dark:text-gray-300 truncate">{g.name}</span>
                      <span className="text-gray-400 ml-2 flex-shrink-0">{(g.progressPercentage ?? 0).toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                      <div className="h-full rounded-full bg-primary-500" style={{ width: `${Math.min(100, g.progressPercentage ?? 0)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>

      {/* Recent transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentTable title="Recent Income" rows={d.recentIncomes} type="income" />
        <RecentTable title="Recent Expenses" rows={d.recentExpenses} type="expense" />
      </div>
    </div>
  )
}

function RecentTable({ title, rows, type }: { title: string; rows: any[]; type: 'income' | 'expense' }) {
  const color = type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
  const sign  = type === 'income' ? '+' : '−'
  return (
    <div className="card">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{title}</h2>
      {rows.length === 0
        ? <p className="text-sm text-gray-400 text-center py-6">No records yet</p>
        : (
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {rows.map((r: any) => (
              <div key={r.id} className="flex items-center justify-between py-2.5 gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                    {type === 'income' ? r.source : CATEGORY_LABELS[r.category] ?? r.category}
                  </p>
                  {type === 'expense' && <p className="text-xs text-gray-400 truncate">{r.description}</p>}
                  <p className="text-xs text-gray-400">{fmt.date(r.date)}</p>
                </div>
                <span className={`text-sm font-semibold flex-shrink-0 ${color}`}>
                  {sign}{fmt.currency(r.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
