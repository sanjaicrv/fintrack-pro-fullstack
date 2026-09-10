import { useEffect, useMemo, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp, TrendingDown, PiggyBank, Calendar,
  AlertTriangle, AlertCircle, Wallet, Sliders, X, Check,
  Landmark, Upload, Download, RefreshCw, Layers, ShieldCheck,
  ArrowRight, Sparkles, CheckCircle2, ChevronRight, FileText
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { analyticsApi } from '../api/analytics'
import { userApi } from '../api/user'
import { categoryBudgetApi } from '../api/categoryBudget'
import { bankSyncApi } from '../api/bankSync'
import type { DashboardResponse, CategoryBudgetResponse, ExpenseCategory, BankSyncResultResponse } from '../types'
import { fmt, CATEGORY_LABELS, CATEGORY_COLORS } from '../utils/formatters'
import StatCard from '../components/Cards/StatCard'
import Modal from '../components/Common/Modal'
import { PageLoader } from '../components/Common/Feedback'
import { useAuth } from '../context/AuthContext'
import { usePeriod } from '../context/PeriodContext'
import MonthSelector from '../components/Common/MonthSelector'
import toast from 'react-hot-toast'

const AVAILABLE_CATEGORIES: ExpenseCategory[] = [
  'FOOD', 'TRANSPORTATION', 'HOUSING', 'UTILITIES',
  'ENTERTAINMENT', 'HEALTHCARE', 'CLOTHING', 'EDUCATION',
  'PERSONAL_CARE', 'INSURANCE', 'DEBT_PAYMENTS', 'GIFTS_DONATIONS', 'SAVINGS', 'OTHER'
]

export default function DashboardPage() {
  const { user } = useAuth()
  const { selectedPeriod, setSelectedPeriod, monthsList } = usePeriod()
  const [data, setData] = useState<DashboardResponse | null>(null)
  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudgetResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Overall Budget Modal State
  const [budgetModalOpen, setBudgetModalOpen] = useState(false)
  const [budgetInput, setBudgetInput] = useState('')
  const [savingBudget, setSavingBudget] = useState(false)

  // Category Budget Modal State
  const [catModalOpen, setCatModalOpen] = useState(false)
  const [catCategory, setCatCategory] = useState<ExpenseCategory>('FOOD')
  const [catAmount, setCatAmount] = useState('')
  const [savingCat, setSavingCat] = useState(false)

  // Bank Statement CSV Import Modal State
  const [bankModalOpen, setBankModalOpen] = useState(false)
  const [syncResult, setSyncResult] = useState<BankSyncResultResponse | null>(null)
  const [uploadingCsv, setUploadingCsv] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadData = () => {
    setLoading(true)
    setError(null)
    const p1 = analyticsApi.getDashboard(selectedPeriod.year, selectedPeriod.month)
    const p2 = categoryBudgetApi.getCategoryBudgets(selectedPeriod.year, selectedPeriod.month).catch(err => {
      console.warn('Category budgets load notice:', err)
      return { data: { data: [] } } as any
    })

    Promise.all([p1, p2])
      .then(([r1, r2]) => {
        if (r1?.data?.data) {
          setData(r1.data.data)
        }
        setCategoryBudgets(r2?.data?.data || [])
      })
      .catch(err => {
        console.error('Dashboard loading error', err)
        setError(err?.response?.data?.message || err?.message || 'Failed to load dashboard data')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [selectedPeriod])

  const handleSaveBudget = async () => {
    const num = parseFloat(budgetInput)
    if (isNaN(num) || num < 0) {
      toast.error('Please enter a valid non-negative budget amount')
      return
    }
    setSavingBudget(true)
    try {
      await userApi.updateBudget(num)
      toast.success('Monthly budget updated successfully!')
      setBudgetModalOpen(false)
      loadData()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update budget')
    } finally {
      setSavingBudget(false)
    }
  }

  const handleSaveCategoryBudget = async () => {
    const num = parseFloat(catAmount)
    if (isNaN(num) || num <= 0) {
      toast.error('Please enter a valid positive budget amount')
      return
    }
    setSavingCat(true)
    try {
      await categoryBudgetApi.setCategoryBudget(catCategory, num, selectedPeriod.year, selectedPeriod.month)
      toast.success(`Budget for ${catCategory} saved!`)
      setCatModalOpen(false)
      setCatAmount('')
      loadData()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save category budget')
    } finally {
      setSavingCat(false)
    }
  }

  const handleDeleteCategoryBudget = async (category: ExpenseCategory) => {
    try {
      await categoryBudgetApi.deleteCategoryBudget(category)
      toast.success(`Removed budget limit for ${category}`)
      loadData()
    } catch (err: any) {
      toast.error('Failed to remove category budget')
    }
  }

  const handleDownloadSampleCsv = () => {
    const csvContent =
      `Date,Narration,Withdrawal,Deposit,Balance\n` +
      `2026-09-01,Client Consulting Retainer,,85000.00,85000.00\n` +
      `2026-09-02,Swiggy Food Order,480.00,,84520.00\n` +
      `2026-09-03,Uber Ride City Center,240.00,,84280.00\n` +
      `2026-09-04,Mutual Fund Dividend,,1500.00,85780.00\n` +
      `2026-09-05,Electricity Bill Bescom,1850.00,,83930.00\n` +
      `2026-09-06,Blinkit Grocery Mart,920.00,,83010.00\n` +
      `2026-09-07,Freelance Project Payment,,12000.00,95010.00\n` +
      `2026-09-08,Netflix Monthly Subscription,649.00,,94361.00\n`

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'fintrack_sample_statement.csv'
    document.body.appendChild(a)
    a.click()
    a.remove()
    toast.success('Sample statement template downloaded!')
  }

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingCsv(true)
    try {
      const res = await bankSyncApi.uploadCsv(file)
      setSyncResult(res.data.data!)
      toast.success(res.data.message || 'Bank statement imported successfully!')
      loadData()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to parse CSV file')
    } finally {
      setUploadingCsv(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  if (loading && !data) return <PageLoader />

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4 my-8">
        <AlertCircle className="w-12 h-12 text-rose-500 animate-pulse" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Unable to Load Dashboard</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
          {error || 'Financial metrics are currently unavailable. Please verify your backend server or try refreshing.'}
        </p>
        <button
          onClick={loadData}
          className="btn-primary"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry Loading</span>
        </button>
      </div>
    )
  }

  const d = data

  return (
    <div className="space-y-6">
      {/* ── TOP HEADER & ACTIONS ────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Good {getGreeting()}, {user?.firstName}! 👋
            </h1>
            <span className="badge-blue font-semibold text-[11px]">
              {selectedPeriod.isCurrent ? 'Active Cycle' : selectedPeriod.label}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {selectedPeriod.isCurrent
              ? 'Real-time performance cycle · Automatic reset on the 1st of every month'
              : selectedPeriod.year === 0
                ? 'All-time accumulated financial metrics across your complete account history'
                : `Viewing historical archive for ${selectedPeriod.label}`}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Period Selector Dropdown */}
          <MonthSelector />

          {/* Bank Statement CSV Import Button */}
          <button
            onClick={() => { setSyncResult(null); setBankModalOpen(true) }}
            className="btn-secondary"
            title="Upload Bank Statement (.csv) to auto-segregate incomes & expenses"
          >
            <Upload className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Import Bank CSV</span>
          </button>
        </div>
      </div>

      {/* ── OVERSPENDING ALERT BANNER ───────────────────────────────────────── */}
      {d.budgetAlertLevel === 'EXCEEDED' && (
        <div className="bg-rose-500/10 border-2 border-rose-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-rose-500/20 text-white">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-rose-900 dark:text-rose-200">
                Monthly Spending Limit Exceeded
              </h3>
              <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                You have disbursed <strong>{fmt.currency(d.budgetSpent ?? d.totalExpense)}</strong>, exceeding your budget cap of <strong>{fmt.currency(d.monthlyBudget ?? 0)}</strong> by <span className="font-bold underline">{fmt.currency(Math.abs(d.budgetRemaining ?? 0))}</span> ({d.budgetUsedPercentage?.toFixed(0)}% used).
              </p>
            </div>
          </div>
          <button
            onClick={() => { setBudgetInput((d.monthlyBudget ?? 0).toString()); setBudgetModalOpen(true) }}
            className="btn-danger"
          >
            Adjust Budget
          </button>
        </div>
      )}

      {d.budgetAlertLevel === 'WARNING' && (
        <div className="bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-amber-500/20 text-white">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                Approaching Spending Limit ({d.budgetUsedPercentage?.toFixed(0)}% used)
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                You have spent <strong>{fmt.currency(d.budgetSpent ?? d.totalExpense)}</strong> out of your <strong>{fmt.currency(d.monthlyBudget ?? 0)}</strong> limit. Only <strong>{fmt.currency(d.budgetRemaining ?? 0)}</strong> safe buffer remains.
              </p>
            </div>
          </div>
          <button
            onClick={() => { setBudgetInput((d.monthlyBudget ?? 0).toString()); setBudgetModalOpen(true) }}
            className="bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-all shadow-sm flex-shrink-0"
          >
            Adjust Budget
          </button>
        </div>
      )}

      {/* ── CORE FINANCIAL OVERVIEW KPIS ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Inflow"
          value={fmt.currency(d.totalIncome)}
          icon={TrendingUp}
          color="green"
          subtext={selectedPeriod.year === 0 ? "All-time accumulated" : selectedPeriod.isCurrent ? "This month" : selectedPeriod.label}
        />
        <StatCard
          label="Total Outflow"
          value={fmt.currency(d.totalExpense)}
          icon={TrendingDown}
          color="red"
          subtext={selectedPeriod.year === 0 ? "All-time accumulated" : selectedPeriod.isCurrent ? "This month" : selectedPeriod.label}
        />
        <StatCard
          label="Net Retained Savings"
          value={fmt.currency(d.savings)}
          icon={PiggyBank}
          color="blue"
          subtext={
            selectedPeriod.year === 0
              ? "Lifetime net surplus"
              : d.savingsComparisonMessage
                ? d.savingsComparisonMessage
                : d.savings >= 0 ? "Positive cashflow" : "Deficit position"
          }
          trend={
            selectedPeriod.year !== 0 && d.savingsGrowthRate !== undefined
              ? { value: d.savingsGrowthRate, label: "vs last month" }
              : undefined
          }
        />
        <StatCard
          label="Safe-to-Spend Today"
          value={
            d.dailySafeToSpend && d.dailySafeToSpend > 0
              ? `${fmt.currency(d.dailySafeToSpend)}/day`
              : d.budgetExceeded ? "₹0 / Overspent" : "Set budget"
          }
          icon={Wallet}
          color="purple"
          subtext={
            selectedPeriod.isCurrent && d.daysRemainingInMonth
              ? `${d.daysRemainingInMonth} days remaining in cycle`
              : selectedPeriod.isCurrent ? "Calculated daily burn limit" : selectedPeriod.label
          }
        />
      </div>

      {/* ── MIDDLE GRID: Chart + Monthly Budget & Goals ──────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Monthly Trend Area Chart (2 cols) */}
        <div className="xl:col-span-2 card flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Cashflow Dynamics & Run Rate</h2>
              <p className="text-xs text-slate-400">Inflow vs Outflow trends over the last 6 months</p>
            </div>
            {d.savingsDelta !== undefined && selectedPeriod.year !== 0 && (
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold self-start sm:self-auto ${
                (d.savingsDelta ?? 0) >= 0
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
              }`}>
                {(d.savingsDelta ?? 0) >= 0 ? '↑' : '↓'} {fmt.currency(Math.abs(d.savingsDelta ?? 0))} vs prior month
              </span>
            )}
          </div>

          {(d.monthlySummaries || []).length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-16">No monthly cashflow data recorded yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={d.monthlySummaries || []} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="inc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f43f5e" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.25} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }}
                  formatter={(v: number, name: string) => [fmt.currency(v), name === 'totalIncome' ? 'Income' : 'Expense']}
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)'
                  }}
                />
                <Area type="monotone" dataKey="totalIncome"  stroke="#3b82f6" strokeWidth={2.5} fill="url(#inc)" name="totalIncome"  />
                <Area type="monotone" dataKey="totalExpense" stroke="#f43f5e" strokeWidth={2.5} fill="url(#exp)" name="totalExpense" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Right Column: Monthly Budget Cap & Goals Progress (1 col) */}
        <div className="space-y-4">
          {/* Monthly Budget Card */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-primary-500" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Monthly Budget Cap</h2>
              </div>
              <button
                onClick={() => { setBudgetInput((d.monthlyBudget ?? 0).toString()); setBudgetModalOpen(true) }}
                className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
              >
                <Sliders className="w-3 h-3" />
                <span>{d.monthlyBudget && d.monthlyBudget > 0 ? 'Edit Limit' : 'Set Limit'}</span>
              </button>
            </div>

            {d.monthlyBudget && d.monthlyBudget > 0 ? (
              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="text-xl font-extrabold text-slate-900 dark:text-white font-numeric">
                      {fmt.currency(d.budgetSpent ?? d.totalExpense)}
                    </span>
                    <span className="text-xs text-slate-400 ml-1">/ {fmt.currency(d.monthlyBudget)}</span>
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    d.budgetExceeded
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                      : (d.budgetUsedPercentage ?? 0) >= 80
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {d.budgetUsedPercentage?.toFixed(0)}% consumed
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      d.budgetExceeded
                        ? 'bg-rose-500'
                        : (d.budgetUsedPercentage ?? 0) >= 80
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, d.budgetUsedPercentage ?? 0)}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 pt-0.5">
                  <span>
                    {d.budgetExceeded ? (
                      <strong className="text-rose-600 dark:text-rose-400">Over budget by {fmt.currency(Math.abs(d.budgetRemaining ?? 0))}</strong>
                    ) : (
                      <span>Safe Buffer: <strong className="text-slate-800 dark:text-slate-200">{fmt.currency(d.budgetRemaining ?? 0)}</strong></span>
                    )}
                  </span>
                  <span>Limit: {fmt.currency(d.monthlyBudget)}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-5 px-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No monthly spending cap defined. Set a budget to activate overspending alerts and daily safe-to-spend tracking.
                </p>
                <button
                  onClick={() => { setBudgetInput('25000'); setBudgetModalOpen(true) }}
                  className="btn-primary mt-3 text-xs"
                >
                  Set Monthly Budget Cap
                </button>
              </div>
            )}
          </div>

          {/* Goals Mini Snapshot */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Savings Targets</h2>
              <Link to="/goals" className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-0.5">
                <span>View All</span>
                <ChevronRight size={13} />
              </Link>
            </div>

            {(d.goals || []).length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No active savings targets</p>
            ) : (
              <div className="space-y-3">
                {(d.goals || []).slice(0, 3).map(g => (
                  <div key={g.id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">{g.name}</span>
                      <span className="text-slate-400 font-numeric ml-2 flex-shrink-0">{(g.progressPercentage ?? 0).toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-primary-500" style={{ width: `${Math.min(100, g.progressPercentage ?? 0)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── CATEGORY BUDGET ENVELOPES SECTION ────────────────────────────── */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Category Spending Envelopes ({selectedPeriod.label})
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Set dedicated limits per category to prevent overspending on Food, Travel, or Entertainment
            </p>
          </div>
          <button
            onClick={() => setCatModalOpen(true)}
            className="btn-secondary self-start sm:self-auto text-xs"
          >
            + Set Category Envelope
          </button>
        </div>

        {categoryBudgets.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400">No category envelopes configured for this period.</p>
            <p className="text-xs text-slate-400 mt-0.5">Create your first envelope (e.g. Food: ₹8,000/mo) to track category caps.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {categoryBudgets.map(b => (
              <div key={b.category} className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{b.categoryLabel}</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      b.status === 'EXCEEDED'
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                        : b.status === 'WARNING'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {b.percentageUsed.toFixed(0)}%
                    </span>
                    <button
                      onClick={() => handleDeleteCategoryBudget(b.category)}
                      className="text-slate-400 hover:text-rose-500 transition-colors p-0.5"
                      title="Remove envelope"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      b.status === 'EXCEEDED' ? 'bg-rose-500' : b.status === 'WARNING' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, b.percentageUsed)}%` }}
                  />
                </div>

                <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Spent: <strong className="text-slate-800 dark:text-slate-200">{fmt.currency(b.spentAmount)}</strong></span>
                  <span>Cap: {fmt.currency(b.budgetAmount)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── RECENT TRANSACTIONS GRID ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentTable
          title={`Recent Incomes (${selectedPeriod.label})`}
          rows={d.recentIncomes || []}
          type="income"
          viewAllLink="/income"
        />
        <RecentTable
          title={`Recent Expenses (${selectedPeriod.label})`}
          rows={d.recentExpenses || []}
          type="expense"
          viewAllLink="/expenses"
        />
      </div>

      {/* ── SET OVERALL MONTHLY BUDGET MODAL ──────────────────────────────── */}
      <Modal
        isOpen={budgetModalOpen}
        onClose={() => setBudgetModalOpen(false)}
        title="Set Monthly Budget Cap"
        subtitle="Define maximum spending allowed in a single calendar cycle"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Define the maximum amount you want to spend in a calendar month. You'll receive warning alerts at 80% and when exceeded.
          </p>

          <div>
            <label className="label">Monthly Spending Cap (₹)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-bold">₹</span>
              <input
                type="number"
                min="0"
                step="500"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                placeholder="e.g. 25000"
                className="input pl-8 font-numeric"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setBudgetModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={savingBudget}
              onClick={handleSaveBudget}
              className="btn-primary"
            >
              {savingBudget ? 'Saving...' : 'Confirm Cap'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── SET CATEGORY ENVELOPE MODAL ────────────────────────────────────── */}
      <Modal
        isOpen={catModalOpen}
        onClose={() => setCatModalOpen(false)}
        title="Set Category Envelope"
        subtitle="Assign a dedicated cap to a specific expense category"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="label">Category</label>
            <select
              value={catCategory}
              onChange={(e) => setCatCategory(e.target.value as ExpenseCategory)}
              className="input cursor-pointer"
            >
              {AVAILABLE_CATEGORIES.map(c => (
                <option key={c} value={c}>{CATEGORY_LABELS[c] ?? c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Category Spending Limit (₹)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-bold">₹</span>
              <input
                type="number"
                min="100"
                step="500"
                value={catAmount}
                onChange={(e) => setCatAmount(e.target.value)}
                placeholder="e.g. 8000"
                className="input pl-8 font-numeric"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setCatModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={savingCat}
              onClick={handleSaveCategoryBudget}
              className="btn-primary"
            >
              {savingCat ? 'Saving...' : 'Save Envelope'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── BANK STATEMENT CSV IMPORT MODAL ─────────────────────────────────── */}
      <Modal
        isOpen={bankModalOpen}
        onClose={() => setBankModalOpen(false)}
        title="Import Bank Statement (CSV)"
        subtitle="Upload your bank statement file. Incomes and expenses are automatically segregated and duplicate entries are skipped."
        size="lg"
      >
        <div className="space-y-5">
          {/* Upload Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="group cursor-pointer p-6 sm:p-8 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-500 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-primary-50/10 transition-all text-center space-y-3"
          >
            <div className="w-12 h-12 mx-auto rounded-2xl bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {uploadingCsv ? 'Processing Statement...' : 'Click to browse or drop your bank statement CSV'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Supports standard bank exports (HDFC, SBI, ICICI, Axis, Chase, etc.) with automatic credit/debit segregation.
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleCsvUpload}
              className="hidden"
              id="csv-file-input"
            />

            <button
              type="button"
              disabled={uploadingCsv}
              onClick={(e) => {
                e.stopPropagation()
                fileInputRef.current?.click()
              }}
              className="btn-primary inline-flex text-xs px-4 py-2"
            >
              {uploadingCsv ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Segregating & Checking Duplicates...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Select CSV File</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Guidance & Sample Template Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 text-xs">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span><strong>Duplicate Guard:</strong> Re-uploading statements will never duplicate existing transactions.</span>
            </div>

            <button
              type="button"
              onClick={handleDownloadSampleCsv}
              className="inline-flex items-center gap-1.5 text-primary-600 dark:text-primary-400 font-semibold hover:underline flex-shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Sample CSV</span>
            </button>
          </div>

          {/* Supported Formats Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900/40 space-y-1">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Standard Bank Format (5 cols)
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                Date, Narration, Debit, Credit, Balance
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Debits become <strong>Expenses</strong>; Credits become <strong>Incomes</strong>.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900/40 space-y-1">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                Typed Statement Format (4 cols)
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                Date, Description, Amount, Type
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Type can be <code className="text-emerald-500">CR / INCOME</code> or <code className="text-rose-500">DR / EXPENSE</code>.
              </p>
            </div>
          </div>

          {/* Ingestion & Segregation Result Report */}
          {syncResult && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>{syncResult.message}</span>
              </div>

              {/* Segregated Metrics Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700/80">
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">Incomes Added</span>
                  <div className="text-sm font-bold text-emerald-700 dark:text-emerald-300 font-numeric mt-0.5">
                    +{fmt.currency(syncResult.totalIncomesAdded)}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                  <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 tracking-wider">Expenses Added</span>
                  <div className="text-sm font-bold text-rose-700 dark:text-rose-300 font-numeric mt-0.5">
                    −{fmt.currency(syncResult.totalExpensesAdded)}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 tracking-wider">Total Imported</span>
                  <div className="text-sm font-bold text-blue-700 dark:text-blue-300 font-numeric mt-0.5">
                    {syncResult.importedCount} txns
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider">Duplicates Skipped</span>
                  <div className="text-sm font-bold text-amber-700 dark:text-amber-300 font-numeric mt-0.5">
                    {syncResult.skippedDuplicatesCount} skipped
                  </div>
                </div>
              </div>

              {/* Parsed and Segregated Transactions List */}
              {syncResult.items && syncResult.items.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-700/80 max-h-48 overflow-y-auto pr-1">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Segregated Transactions ({syncResult.items.length})
                  </span>
                  {syncResult.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${item.type === 'INCOME' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[180px] sm:max-w-xs">{item.description}</span>
                        <span className="text-[10px] text-slate-400 font-numeric">{item.date}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium">
                          {item.category}
                        </span>
                        <span className={`font-bold font-numeric ${item.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {item.type === 'INCOME' ? '+' : '−'}{fmt.currency(item.amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setBankModalOpen(false)}
              className="btn-secondary"
            >
              Done
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function RecentTable({
  title,
  rows,
  type,
  viewAllLink,
}: {
  title: string
  rows: any[]
  type: 'income' | 'expense'
  viewAllLink: string
}) {
  const isIncome = type === 'income'
  const color = isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
  const sign  = isIncome ? '+' : '−'
  const safeRows = rows || []

  return (
    <div className="card flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-slate-100 dark:border-slate-800/80">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h2>
          <Link
            to={viewAllLink}
            className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-0.5"
          >
            <span>View All</span>
            <ChevronRight size={13} />
          </Link>
        </div>

        {safeRows.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">No transaction records in this period</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {safeRows.map((r: any) => (
              <div key={r.id} className="flex items-center justify-between py-2.5 gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 px-1.5 rounded-lg transition-colors">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {isIncome ? r.source : CATEGORY_LABELS[r.category] ?? r.category}
                  </p>
                  {!isIncome && r.description && (
                    <p className="text-[11px] text-slate-400 truncate">{r.description}</p>
                  )}
                  <p className="text-[10px] text-slate-400 mt-0.5">{fmt.date(r.date)}</p>
                </div>
                <span className={`text-xs sm:text-sm font-extrabold flex-shrink-0 font-numeric ${color}`}>
                  {sign}{fmt.currency(r.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
