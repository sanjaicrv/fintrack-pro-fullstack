import { useEffect, useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
  AreaChart, Area
} from 'recharts'
import { analyticsApi } from '../api/analytics'
import type { AnalyticsResponse } from '../types'
import { fmt, CATEGORY_COLORS, CATEGORY_LABELS } from '../utils/formatters'
import StatCard from '../components/Cards/StatCard'
import { PageLoader } from '../components/Common/Feedback'
import {
  TrendingUp, TrendingDown, PiggyBank, Percent, Calendar,
  Sparkles, AlertCircle, RefreshCw, Layers, ShieldCheck,
  ArrowUpRight, ArrowDownRight, Wallet, Award
} from 'lucide-react'

import { usePeriod, MonthOption } from '../context/PeriodContext'

interface PeriodOption {
  label: string
  shortLabel: string
  months: number
}

const PERIOD_OPTIONS: PeriodOption[] = [
  { label: 'Last Month', shortLabel: 'Last Month', months: 1 },
  { label: 'Last 2 Months', shortLabel: 'Last 2 Mo', months: 2 },
  { label: 'Last 3 Months', shortLabel: 'Last 3 Mo', months: 3 },
  { label: 'Last 4 Months', shortLabel: 'Last 4 Mo', months: 4 },
  { label: 'Last 5 Months', shortLabel: 'Last 5 Mo', months: 5 },
  { label: 'Last 6 Months', shortLabel: 'Last 6 Mo', months: 6 },
  { label: 'Last 9 Months', shortLabel: 'Last 9 Mo', months: 9 },
  { label: 'Last 12 Months (1 Year)', shortLabel: 'Last 1 Year', months: 12 },
  { label: 'Last 24 Months (2 Years)', shortLabel: 'Last 2 Years', months: 24 },
]

export default function AnalyticsPage() {
  const { selectedPeriod, setSelectedPeriod, monthsList } = usePeriod()
  const [viewMode, setViewMode] = useState<'MONTH' | 'TREND'>('MONTH')
  const [selectedMonth, setSelectedMonth] = useState<MonthOption>(() => {
    return (selectedPeriod.year === 0 && selectedPeriod.month === 0) ? monthsList[0] : selectedPeriod
  })
  const [months, setMonths] = useState<number>(6)
  const [data, setData] = useState<AnalyticsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (selectedPeriod.year > 0 && selectedPeriod.month > 0) {
      setSelectedMonth(selectedPeriod)
    }
  }, [selectedPeriod])

  const loadAnalytics = () => {
    setLoading(true)
    setError(null)
    const promise = viewMode === 'MONTH'
      ? analyticsApi.getAnalytics(6, selectedMonth.year, selectedMonth.month)
      : analyticsApi.getAnalytics(months)

    promise
      .then(r => {
        if (r?.data?.data) {
          setData(r.data.data)
        }
      })
      .catch(err => {
        console.error('Failed to load analytics', err)
        setError(err?.response?.data?.message || 'Failed to load analytics data')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadAnalytics()
  }, [viewMode, selectedMonth, months])

  const currentOption = useMemo(() => {
    return PERIOD_OPTIONS.find(p => p.months === months) || PERIOD_OPTIONS[5]
  }, [months])

  if (loading && !data) return <PageLoader />

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4 my-8">
        <AlertCircle className="w-12 h-12 text-rose-500 animate-pulse" />
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Unable to Load Analytics</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
          {error || 'We could not fetch your financial insights. Please verify backend connectivity.'}
        </p>
        <button
          onClick={loadAnalytics}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm rounded-xl transition-all shadow"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry Loading</span>
        </button>
      </div>
    )
  }

  const d = data
  const incomeVsExpense = d.incomeVsExpense || []
  const expenseByCategory = d.expenseByCategory || []
  const savingsProgress = d.savingsProgress || []

  // Top category computation
  const topCategory = expenseByCategory.length > 0 ? expenseByCategory[0] : null
  const dailyBurnRate = d.totalExpense
    ? d.totalExpense / (viewMode === 'MONTH' ? 30 : Math.max(1, months * 30))
    : 0

  // Financial health tier
  const getSavingsHealthTier = (rate: number) => {
    if (rate >= 30) return { label: 'Excellent', color: 'emerald', bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' }
    if (rate >= 20) return { label: 'Healthy (Target)', color: 'blue', bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30' }
    if (rate >= 10) return { label: 'Moderate', color: 'amber', bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' }
    if (rate > 0)  return { label: 'Low Savings', color: 'orange', bg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30' }
    return { label: 'Deficit / Overspending', color: 'rose', bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30' }
  }

  const healthTier = getSavingsHealthTier(d.savingsRate ?? 0)

  return (
    <div className="space-y-6">
      {/* ── HEADER & TIMEFRAME SELECTOR ─────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Financial Analytics & Trends</h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300">
              {viewMode === 'MONTH' ? selectedMonth.label : currentOption.label}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {viewMode === 'MONTH'
              ? `Category burn rate and cashflow breakdown for ${selectedMonth.label}`
              : `Cashflow distribution and wealth accumulation over ${currentOption.label.toLowerCase()}`}
          </p>
        </div>

        {/* Dual Dropdowns: Month-Wise Breakdown AND Multi-Month Trend */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* 1. Month-Wise Selector Dropdown */}
          <div className={`flex items-center gap-2 rounded-xl px-3 py-1.5 border shadow-sm transition-all ${
            viewMode === 'MONTH'
              ? 'bg-primary-50 dark:bg-primary-950/40 border-primary-500/40 ring-1 ring-primary-500/20'
              : 'bg-gray-50 dark:bg-gray-700/60 border-gray-200 dark:border-gray-600'
          }`}>
            <Calendar className="w-4 h-4 text-primary-500 flex-shrink-0" />
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider hidden sm:inline">Month:</span>
            <select
              value={`${selectedMonth.year}-${selectedMonth.month}`}
              onChange={(e) => {
                const [y, m] = e.target.value.split('-').map(Number)
                const found = monthsList.find(opt => opt.year === y && opt.month === m)
                if (found) {
                  setSelectedMonth(found)
                  setSelectedPeriod(found)
                  setViewMode('MONTH')
                }
              }}
              className="bg-transparent text-gray-900 dark:text-white text-xs font-semibold focus:outline-none cursor-pointer pr-1"
            >
              <optgroup label="Month-Wise Breakdown">
                {monthsList.map(m => (
                  <option key={`${m.year}-${m.month}`} value={`${m.year}-${m.month}`} className="text-gray-900 dark:text-gray-900">
                    {m.label}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* 2. Multi-Month Trend Dropdown */}
          <div className={`flex items-center gap-2 rounded-xl px-3 py-1.5 border shadow-sm transition-all ${
            viewMode === 'TREND'
              ? 'bg-primary-50 dark:bg-primary-950/40 border-primary-500/40 ring-1 ring-primary-500/20'
              : 'bg-gray-50 dark:bg-gray-700/60 border-gray-200 dark:border-gray-600'
          }`}>
            <BarChart className="w-4 h-4 text-violet-500 flex-shrink-0" />
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider hidden sm:inline">Trend:</span>
            <select
              value={months}
              onChange={(e) => {
                setMonths(Number(e.target.value))
                setViewMode('TREND')
              }}
              className="bg-transparent text-gray-900 dark:text-white text-xs font-semibold focus:outline-none cursor-pointer pr-1"
            >
              <optgroup label="Multi-Month Trend">
                {PERIOD_OPTIONS.map(opt => (
                  <option key={opt.months} value={opt.months} className="text-gray-900 dark:text-gray-900">
                    {opt.label}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>
      </div>

      {/* ── KPI STAT CARDS ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Inflow"
          value={fmt.currency(d.totalIncome ?? 0)}
          icon={TrendingUp}
          color="green"
          subtext={`Avg ${fmt.currency(d.averageMonthlyIncome ?? 0)}/mo`}
        />
        <StatCard
          label="Total Outflow"
          value={fmt.currency(d.totalExpense ?? 0)}
          icon={TrendingDown}
          color="red"
          subtext={`Avg ${fmt.currency(d.averageMonthlyExpense ?? 0)}/mo`}
        />
        <StatCard
          label="Net Savings"
          value={fmt.currency(d.totalSavings ?? 0)}
          icon={PiggyBank}
          color="blue"
          subtext={
            (d.totalSavings ?? 0) >= 0
              ? `Surplus (${d.totalIncome ? ((d.totalSavings / d.totalIncome) * 100).toFixed(0) : 0}% retained)`
              : 'Deficit in selected period'
          }
        />
        <StatCard
          label="Savings Rate"
          value={fmt.percent(d.savingsRate ?? 0)}
          icon={Percent}
          color="purple"
          subtext={`Health: ${healthTier.label}`}
        />
      </div>

      {/* ── FINANCIAL INSIGHT BANNER ────────────────────────────────────────── */}
      <div className="card bg-gradient-to-r from-primary-500/5 via-blue-500/5 to-purple-500/5 border border-primary-100 dark:border-primary-900/40 p-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center flex-shrink-0 text-primary-600 dark:text-primary-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Period Takeaways & Health Assessment
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${healthTier.bg}`}>
                  {healthTier.label}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                Over the <strong>{currentOption.label.toLowerCase()}</strong>, you retained{' '}
                <strong className="text-primary-600 dark:text-primary-400">{fmt.percent(d.savingsRate ?? 0)}</strong> of all incoming earnings.
                {topCategory && (
                  <span>
                    {' '}Your highest expenditure category was <strong>{topCategory.categoryLabel}</strong> at{' '}
                    <strong>{fmt.currency(topCategory.amount)}</strong> ({fmt.percent(topCategory.percentage)} of outflow).
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-200 dark:border-gray-700">
            <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm text-center">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Avg Daily Burn</span>
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400">{fmt.currency(dailyBurnRate)}/day</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm text-center">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Monthly Run Rate</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                +{fmt.currency(Math.max(0, (d.averageMonthlyIncome ?? 0) - (d.averageMonthlyExpense ?? 0)))}/mo
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── INCOME VS EXPENSES BAR CHART ────────────────────────────────────── */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Cashflow Inflow vs Outflow</h2>
            <p className="text-xs text-gray-400">Monthly breakdown of gross income vs total expenditures</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
              <span className="w-3 h-3 rounded bg-primary-500" /> Income
            </span>
            <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
              <span className="w-3 h-3 rounded bg-rose-500" /> Expenses
            </span>
          </div>
        </div>

        {incomeVsExpense.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-12">No records found for the selected timeframe</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={incomeVsExpense} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.25} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }}
                formatter={(v: number, name: string) => [fmt.currency(v), name === 'income' ? 'Income' : 'Expense']}
                contentStyle={{
                  backgroundColor: 'rgba(17, 24, 39, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)'
                }}
              />
              <Bar dataKey="income"  fill="#6366f1" radius={[6, 6, 0, 0]} name="income" maxBarSize={45} />
              <Bar dataKey="expense" fill="#f43f5e" radius={[6, 6, 0, 0]} name="expense" maxBarSize={45} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── CATEGORY BREAKDOWN & WEALTH ACCUMULATION GRID ───────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Expense Category Breakdown */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Expense Category Distribution</h2>
              <p className="text-xs text-gray-400">Where your money went over {currentOption.label.toLowerCase()}</p>
            </div>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
              Total: {fmt.currency(d.totalExpense ?? 0)}
            </span>
          </div>

          {expenseByCategory.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-12">No expense entries found</p>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Donut Chart with central metric */}
              <div className="relative w-[190px] h-[190px] flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={88}
                      paddingAngle={2}
                      dataKey="amount"
                      nameKey="categoryLabel"
                    >
                      {expenseByCategory.map((e) => (
                        <Cell key={e.category} fill={CATEGORY_COLORS[e.category] ?? '#6b7280'} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: number) => [fmt.currency(v), 'Spent']}
                      contentStyle={{
                        backgroundColor: 'rgba(17, 24, 39, 0.95)',
                        border: 'none',
                        borderRadius: '10px',
                        color: '#fff',
                        fontSize: '11px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text in donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">Total Outflow</span>
                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                    {fmt.currency(d.totalExpense ?? 0)}
                  </span>
                </div>
              </div>

              {/* Ranked Category List with Progress Bars */}
              <div className="flex-1 space-y-2.5 w-full">
                {expenseByCategory.slice(0, 6).map(c => (
                  <div key={c.category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 truncate">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ background: CATEGORY_COLORS[c.category] ?? '#6b7280' }}
                        />
                        <span className="font-medium text-gray-700 dark:text-gray-300 truncate">
                          {CATEGORY_LABELS[c.category] ?? c.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="font-bold text-gray-900 dark:text-white">{fmt.currency(c.amount)}</span>
                        <span className="text-gray-400 w-10 text-right">{fmt.percent(c.percentage)}</span>
                      </div>
                    </div>
                    {/* Micro bar */}
                    <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, c.percentage)}%`,
                          background: CATEGORY_COLORS[c.category] ?? '#6b7280'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Wealth & Savings Progress Area Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Cumulative Wealth & Savings Progression</h2>
              <p className="text-xs text-gray-400">Monthly additions vs cumulative capital retained</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Cumulative
              </span>
              <span className="flex items-center gap-1 text-primary-500 font-semibold">
                <span className="w-2.5 h-2.5 rounded bg-primary-500" /> Monthly
              </span>
            </div>
          </div>

          {savingsProgress.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-12">No savings progression data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={savingsProgress} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="cumul" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="month" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.25} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(v: number, name: string) => [
                    fmt.currency(v),
                    name === 'cumulativeSavings' ? 'Cumulative Wealth' : 'Monthly Savings'
                  ]}
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="cumulativeSavings"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="url(#cumul)"
                  name="cumulativeSavings"
                />
                <Area
                  type="monotone"
                  dataKey="monthlySavings"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#month)"
                  name="monthlySavings"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
