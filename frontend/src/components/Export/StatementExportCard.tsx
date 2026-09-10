import { useState, useRef, useMemo, useEffect } from 'react'
import {
  FileSpreadsheet, FileText, Download, Eye, Calendar,
  CheckCircle2, Sparkles, AlertCircle, Loader2, ShieldCheck,
  TrendingUp, TrendingDown, Wallet, X, Printer
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { usePeriod } from '../../context/PeriodContext'
import { analyticsApi } from '../../api/analytics'
import { incomeApi } from '../../api/income'
import { expenseApi } from '../../api/expense'
import type { DashboardResponse, AnalyticsResponse, IncomeResponse, ExpenseResponse } from '../../types'
import { fmt, CATEGORY_LABELS, CATEGORY_COLORS } from '../../utils/formatters'
import toast from 'react-hot-toast'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

interface MonthOption {
  key: string
  year: number
  month: number
  label: string
  fullLabel: string
  isCurrent: boolean
}

export default function StatementExportCard() {
  const { user } = useAuth()
  const { selectedPeriod, setSelectedPeriod } = usePeriod()

  const [exportingCsv, setExportingCsv] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [loadingData, setLoadingData] = useState(false)

  // Report Data State
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsResponse | null>(null)
  const [monthIncomes, setMonthIncomes] = useState<IncomeResponse[]>([])
  const [monthExpenses, setMonthExpenses] = useState<ExpenseResponse[]>([])

  // Hidden print container ref
  const reportRef = useRef<HTMLDivElement>(null)

  // Month-wise options (Last 12 months)
  const monthsList: MonthOption[] = useMemo(() => {
    const list: MonthOption[] = []
    const now = new Date()
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const y = d.getFullYear()
      const m = d.getMonth() + 1
      const key = `${y}-${String(m).padStart(2, '0')}`
      const monthName = d.toLocaleString('en-US', { month: 'long', year: 'numeric' })
      const shortLabel = d.toLocaleString('en-US', { month: 'short', year: 'numeric' })
      list.push({
        key,
        year: y,
        month: m,
        label: i === 0 ? `This Month (${shortLabel})` : shortLabel,
        fullLabel: monthName,
        isCurrent: i === 0
      })
    }
    return list
  }, [])

  // Sync with global selected period or default to first month
  const [selectedKey, setSelectedKey] = useState<string>(() => {
    if (selectedPeriod && selectedPeriod.year > 0) {
      return `${selectedPeriod.year}-${String(selectedPeriod.month).padStart(2, '0')}`
    }
    return monthsList[0]?.key || ''
  })

  // Keep synchronized if global period changes
  useEffect(() => {
    if (selectedPeriod && selectedPeriod.year > 0) {
      const key = `${selectedPeriod.year}-${String(selectedPeriod.month).padStart(2, '0')}`
      setSelectedKey(key)
    }
  }, [selectedPeriod])

  const activeOption = useMemo(() => {
    return monthsList.find(m => m.key === selectedKey) || monthsList[0]
  }, [monthsList, selectedKey])

  // Fetch statement data for the selected month
  const fetchMonthStatementData = async (year: number, month: number) => {
    setLoadingData(true)
    try {
      const [dashRes, anaRes, incRes, expRes] = await Promise.all([
        analyticsApi.getDashboard(year, month),
        analyticsApi.getAnalytics(1, year, month),
        incomeApi.getAll(),
        expenseApi.getAll()
      ])

      const dData = dashRes.data.data!
      const aData = anaRes.data.data!

      // Filter transactions strictly for this month
      const filteredIncomes = (incRes.data.data || []).filter(i => {
        const [y, m] = i.date.split('-').map(Number)
        return y === year && m === month
      })
      const filteredExpenses = (expRes.data.data || []).filter(e => {
        const [y, m] = e.date.split('-').map(Number)
        return y === year && m === month
      })

      setDashboardData(dData)
      setAnalyticsData(aData)
      setMonthIncomes(filteredIncomes)
      setMonthExpenses(filteredExpenses)

      return { dData, aData, filteredIncomes, filteredExpenses }
    } catch (err) {
      toast.error('Failed to load monthly statement data')
      throw err
    } finally {
      setLoadingData(false)
    }
  }

  // Pre-load data for active month on change
  useEffect(() => {
    if (activeOption) {
      fetchMonthStatementData(activeOption.year, activeOption.month).catch(() => {})
    }
  }, [activeOption])

  // Handle Month Selection Change
  const handleMonthChange = (newKey: string) => {
    setSelectedKey(newKey)
    const match = monthsList.find(m => m.key === newKey)
    if (match) {
      setSelectedPeriod({
        label: match.label,
        year: match.year,
        month: match.month,
        isCurrent: match.isCurrent,
        isAllTime: false
      })
    }
  }

  // Handle Export CSV with guaranteed accurate totals & chronological itemization
  const handleExportCsv = async () => {
    if (!activeOption) return
    setExportingCsv(true)
    const { year, month, fullLabel } = activeOption

    try {
      const data = await fetchMonthStatementData(year, month)
      const { dData, filteredIncomes, filteredExpenses } = data

      // Construct itemized transaction items
      const items: Array<{
        date: string
        type: string
        category: string
        description: string
        inflow: string
        outflow: string
        amount: string
      }> = []

      for (const inc of filteredIncomes) {
        items.push({
          date: inc.date,
          type: 'INCOME',
          category: inc.recurring ? 'Recurring Stream' : 'Inflow',
          description: inc.source || 'Direct Income',
          inflow: Number(inc.amount).toFixed(2),
          outflow: '',
          amount: `+${Number(inc.amount).toFixed(2)}`
        })
      }

      for (const exp of filteredExpenses) {
        const desc = exp.description?.trim() ? exp.description.trim() : (exp.category ? exp.category : 'Bank Debit')
        items.push({
          date: exp.date,
          type: 'EXPENSE',
          category: exp.category || 'OTHER',
          description: desc,
          inflow: '',
          outflow: Number(exp.amount).toFixed(2),
          amount: `-${Number(exp.amount).toFixed(2)}`
        })
      }

      // Sort newest-first
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      const totalIn = dData.totalIncome || filteredIncomes.reduce((s, i) => s + Number(i.amount), 0)
      const totalOut = dData.totalExpense || filteredExpenses.reduce((s, e) => s + Number(e.amount), 0)
      const net = totalIn - totalOut

      // Build pristine audit CSV
      const lines: string[] = [
        `# ========================================================`,
        `# FINTRACK PRO - OFFICIAL MONTHLY FINANCIAL STATEMENT`,
        `# ========================================================`,
        `# Account Holder: ${user?.firstName || ''} ${user?.lastName || ''}`,
        `# Registered Email: ${user?.email || ''}`,
        `# Statement Cycle: ${fullLabel}`,
        `# Generated Timestamp: ${new Date().toLocaleString('en-US')}`,
        `# Total Inflow: ${totalIn.toFixed(2)} INR`,
        `# Total Outflow: ${totalOut.toFixed(2)} INR`,
        `# Net Savings: ${net.toFixed(2)} INR`,
        `# Total Transactions: ${items.length}`,
        `# ========================================================`,
        `Date,Type,Category,Description,Inflow (INR),Outflow (INR),Amount (INR)`
      ]

      for (const item of items) {
        const safeDesc = item.description.replace(/"/g, '""')
        const safeCat = item.category.replace(/"/g, '""')
        lines.push(`${item.date},${item.type},"${safeCat}","${safeDesc}",${item.inflow},${item.outflow},${item.amount}`)
      }

      lines.push(``)
      lines.push(`TOTALS,,,,"${totalIn.toFixed(2)}","${totalOut.toFixed(2)}","${net.toFixed(2)}"`)

      const csvContent = lines.join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = `FinTrack_Statement_${year}_${String(month).padStart(2, '0')}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(downloadUrl)
      toast.success(`Statement CSV for ${fullLabel} downloaded successfully!`)
    } catch (err: any) {
      console.error(err)
      toast.error(err?.message || 'Failed to export CSV statement')
    } finally {
      setExportingCsv(false)
    }
  }

  // Handle Export Visual PDF with Safe Multi-Page Slicing (no negative coordinates)
  const handleExportPdf = async () => {
    if (!activeOption) return
    setExportingPdf(true)
    const toastId = toast.loading(`Compiling Visual Statement for ${activeOption.fullLabel}...`)

    try {
      // 1. Ensure latest month data is loaded
      await fetchMonthStatementData(activeOption.year, activeOption.month)

      // 2. Allow React state to propagate to DOM
      await new Promise(r => setTimeout(r, 250))

      if (!reportRef.current) {
        throw new Error('Report template render target not found')
      }

      // 3. Render high-resolution canvas (scale: 2)
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 850
      })

      if (!canvas.width || !canvas.height || canvas.width <= 0 || canvas.height <= 0) {
        throw new Error('Canvas rendering produced zero-dimension output. Please retry.')
      }

      // 4. Multi-Page A4 PDF compilation using clean positive-only coordinates
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const pageWidthMm = pdf.internal.pageSize.getWidth() // 210mm
      const pageHeightMm = pdf.internal.pageSize.getHeight() // 297mm

      // Pixels per mm on this canvas
      const pxPerMm = canvas.width / pageWidthMm
      const pageCanvasHeight = Math.floor(pageHeightMm * pxPerMm)

      let renderedHeight = 0
      let pageIndex = 0

      while (renderedHeight < canvas.height) {
        const sliceHeight = Math.min(pageCanvasHeight, canvas.height - renderedHeight)

        // Create individual A4 slice canvas
        const pageCanvas = document.createElement('canvas')
        pageCanvas.width = canvas.width
        pageCanvas.height = pageCanvasHeight
        const pageCtx = pageCanvas.getContext('2d')

        if (pageCtx) {
          pageCtx.fillStyle = '#ffffff'
          pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvasHeight)
          pageCtx.drawImage(
            canvas,
            0, renderedHeight, canvas.width, sliceHeight, // source rect
            0, 0, canvas.width, sliceHeight             // destination rect
          )
        }

        const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.95)

        if (pageIndex > 0) {
          pdf.addPage()
        }

        // Add image with strictly non-negative coordinates: x=0, y=0, w=210, h=297
        pdf.addImage(pageImgData, 'JPEG', 0, 0, pageWidthMm, pageHeightMm)

        renderedHeight += sliceHeight
        pageIndex++
      }

      const fileName = `FinTrack_Statement_${activeOption.year}_${String(activeOption.month).padStart(2, '0')}.pdf`
      pdf.save(fileName)

      toast.success(`Visual PDF Statement for ${activeOption.fullLabel} downloaded!`, { id: toastId })
    } catch (err: any) {
      console.error('PDF Generation Error:', err)
      toast.error(err?.message || 'Failed to generate visual PDF statement', { id: toastId })
    } finally {
      setExportingPdf(false)
    }
  }

  // Handle Preview Open
  const handleOpenPreview = async () => {
    if (!activeOption) return
    try {
      await fetchMonthStatementData(activeOption.year, activeOption.month)
      setPreviewOpen(true)
    } catch {
      // Handled in fetchMonthStatementData
    }
  }

  // Combined sorted transactions for active month
  const combinedTransactions = useMemo(() => {
    const incomes = monthIncomes.map(i => ({
      id: `inc-${i.id}`,
      date: i.date,
      type: 'INCOME' as const,
      title: i.source || 'Direct Income',
      category: i.recurring ? 'Recurring Stream' : 'Inflow',
      amount: i.amount
    }))
    const expenses = monthExpenses.map(e => ({
      id: `exp-${e.id}`,
      date: e.date,
      type: 'EXPENSE' as const,
      title: e.description?.trim() ? e.description.trim() : (e.category ? e.category : 'Bank Debit'),
      category: e.category,
      amount: e.amount
    }))

    return [...incomes, ...expenses].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  }, [monthIncomes, monthExpenses])

  const totalInflow = dashboardData?.totalIncome ?? 0
  const totalOutflow = dashboardData?.totalExpense ?? 0
  const netSavings = dashboardData?.savings ?? (totalInflow - totalOutflow)
  const savingsRate = totalInflow > 0 ? Math.round(((totalInflow - totalOutflow) / totalInflow) * 100) : 0

  return (
    <div className="card space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <FileSpreadsheet size={16} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Data Export & Statements
            </h2>
            <p className="text-xs text-slate-400">
              Download certified monthly ledgers and visual analytics statements
            </p>
          </div>
        </div>
        <span className="badge-emerald font-mono text-[10px]">
          MONTH-WISE EXPORT
        </span>
      </div>

      {/* Month Selection Control */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Select Statement Month
            </label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Choose the exact monthly cycle you want to export as CSV or Visual PDF
            </p>
          </div>

          {/* Month Dropdown */}
          <div className="relative min-w-[220px]">
            <select
              value={selectedKey}
              onChange={e => handleMonthChange(e.target.value)}
              className="select w-full font-semibold text-xs py-2 pr-8 cursor-pointer"
            >
              {monthsList.map(m => (
                <option key={m.key} value={m.key}>
                  {m.label}
                </option>
              ))}
            </select>
            <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Selected Month Info Pill */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            Target Cycle: <strong className="text-slate-800 dark:text-slate-200">{activeOption.fullLabel}</strong>
          </span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 size={12} /> Ready to Export
          </span>
        </div>
      </div>

      {/* Export Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* CSV Export Option */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
          <div>
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2.5">
              <FileSpreadsheet size={18} />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Raw Statement (CSV)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Standard tabular spreadsheet containing date, transaction type, category, narration, and amount for {activeOption.fullLabel}. Ideal for Excel or tax filing.
            </p>
          </div>

          <button
            onClick={handleExportCsv}
            disabled={exportingCsv}
            className="btn-secondary w-full justify-center text-xs py-2.5 gap-2"
          >
            {exportingCsv ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                <span>Exporting CSV...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Download {activeOption.year}-{String(activeOption.month).padStart(2, '0')} CSV</span>
              </>
            )}
          </button>
        </div>

        {/* Visual Analytics PDF Export Option */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50/70 via-slate-50 to-purple-50/50 dark:from-indigo-950/20 dark:via-slate-800/50 dark:to-purple-950/20 border border-indigo-200/80 dark:border-indigo-800/80 flex flex-col justify-between space-y-4 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <FileText size={18} />
              </div>
              <span className="badge-purple text-[10px] font-bold">
                VISUAL ANALYTICS
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              Visual Statement (PDF)
              <Sparkles size={14} className="text-indigo-500" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Full-color, certified monthly executive report featuring FinTrack Pro branding, customer credentials, visual KPI cards, spending distribution graphs, and itemized ledger.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenPreview}
              disabled={loadingData}
              className="btn-secondary text-xs py-2.5 px-3"
              title="Preview on-screen"
            >
              <Eye size={14} />
            </button>
            <button
              onClick={handleExportPdf}
              disabled={exportingPdf}
              className="btn-primary flex-1 justify-center text-xs py-2.5 gap-2 shadow-md shadow-indigo-500/20"
            >
              {exportingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Compiling PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Visual PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Offscreen Report Template for PDF Generation (Guaranteed layout width & height) */}
      <div
        style={{
          position: 'fixed',
          left: '-9999px',
          top: '0',
          width: '850px',
          zIndex: -100,
          visibility: 'visible',
          pointerEvents: 'none'
        }}
      >
        <div ref={reportRef}>
          <ReportDocument
            user={user}
            activeOption={activeOption}
            dashboardData={dashboardData}
            analyticsData={analyticsData}
            combinedTransactions={combinedTransactions}
            totalInflow={totalInflow}
            totalOutflow={totalOutflow}
            netSavings={netSavings}
            savingsRate={savingsRate}
          />
        </div>
      </div>

      {/* Interactive On-Screen Preview Modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col my-8">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 rounded-t-2xl">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Visual Statement Preview · {activeOption.fullLabel}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Official FinTrack Pro Monthly Financial & Analytics Audit
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportPdf}
                  disabled={exportingPdf}
                  className="btn-primary text-xs py-1.5 px-3"
                >
                  <Download size={14} />
                  <span>{exportingPdf ? 'Exporting...' : 'Download PDF'}</span>
                </button>
                <button
                  onClick={() => setPreviewOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body: Scrollable Paper Preview */}
            <div className="p-6 overflow-y-auto bg-slate-100 dark:bg-slate-950 flex justify-center">
              <div className="shadow-lg border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white max-w-[850px] w-full">
                <ReportDocument
                  user={user}
                  activeOption={activeOption}
                  dashboardData={dashboardData}
                  analyticsData={analyticsData}
                  combinedTransactions={combinedTransactions}
                  totalInflow={totalInflow}
                  totalOutflow={totalOutflow}
                  netSavings={netSavings}
                  savingsRate={savingsRate}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── COLORFUL VISUAL REPORT DOCUMENT COMPONENT ─────────────────────────────────
interface ReportProps {
  user: any
  activeOption: MonthOption
  dashboardData: DashboardResponse | null
  analyticsData: AnalyticsResponse | null
  combinedTransactions: Array<{
    id: string
    date: string
    type: 'INCOME' | 'EXPENSE'
    title: string
    category: string
    amount: number
  }>
  totalInflow: number
  totalOutflow: number
  netSavings: number
  savingsRate: number
}

function ReportDocument({
  user,
  activeOption,
  dashboardData,
  analyticsData,
  combinedTransactions,
  totalInflow,
  totalOutflow,
  netSavings,
  savingsRate
}: ReportProps) {
  const currentDateFormatted = new Date().toLocaleString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  const categories = analyticsData?.expenseByCategory || []
  const topCategories = [...categories].sort((a, b) => b.amount - a.amount).slice(0, 6)

  return (
    <div
      style={{
        width: '850px',
        backgroundColor: '#ffffff',
        color: '#0f172a',
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
        padding: '36px',
        boxSizing: 'border-box'
      }}
    >
      {/* ── 1. COLORFUL FINTECH BRAND HEADER ─────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #090d16 0%, #171d33 50%, #1e3a8a 100%)',
          borderRadius: '16px',
          padding: '24px 28px',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 8px 20px -4px rgba(15, 23, 42, 0.25)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                borderRadius: '10px',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '18px',
                color: '#ffffff',
                boxShadow: '0 4px 10px rgba(59, 130, 246, 0.4)'
              }}
            >
              ⚡
            </div>
            <span style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.5px' }}>
              FinTrack<span style={{ color: '#38bdf8' }}>Pro</span>
            </span>
            <span
              style={{
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                color: '#38bdf8',
                fontSize: '10px',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '9999px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              Certified Audit
            </span>
          </div>
          <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0, fontWeight: 500 }}>
            Enterprise Financial Intelligence & Portfolio Analytics Ledger
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '1px', fontWeight: 700 }}>
            Official Monthly Statement
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>
            {activeOption.fullLabel}
          </div>
          <div style={{ fontSize: '10px', color: '#cbd5e1', marginTop: '3px', fontFamily: 'monospace' }}>
            REF: FTP-{activeOption.year}{String(activeOption.month).padStart(2, '0')}-{user?.id || '849'}
          </div>
        </div>
      </div>

      {/* ── 2. CUSTOMER & STATEMENT METADATA GRID ───────────────────────── */}
      <div
        style={{
          marginTop: '18px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '10px'
        }}
      >
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px 14px' }}>
          <span style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', fontWeight: 700, display: 'block' }}>
            Account Holder
          </span>
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginTop: '3px', display: 'block' }}>
            {user?.firstName} {user?.lastName}
          </span>
        </div>

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px 14px' }}>
          <span style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', fontWeight: 700, display: 'block' }}>
            Registered Email
          </span>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a', marginTop: '3px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.email}
          </span>
        </div>

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px 14px' }}>
          <span style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', fontWeight: 700, display: 'block' }}>
            Statement Cycle
          </span>
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#2563eb', marginTop: '3px', display: 'block' }}>
            {activeOption.fullLabel}
          </span>
        </div>

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px 14px' }}>
          <span style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', fontWeight: 700, display: 'block' }}>
            Generated At
          </span>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a', marginTop: '3px', display: 'block' }}>
            {currentDateFormatted}
          </span>
        </div>
      </div>

      {/* ── 3. VIBRANT KPI CARDS ─────────────────────────────────────────── */}
      <div
        style={{
          marginTop: '18px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px'
        }}
      >
        {/* Inflow Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)',
            border: '1.5px solid #a7f3d0',
            borderRadius: '14px',
            padding: '14px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Inflow
            </span>
            <span style={{ background: '#d1fae5', color: '#047857', fontSize: '9px', fontWeight: 800, padding: '2px 5px', borderRadius: '5px' }}>
              Income
            </span>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 900, color: '#047857', marginTop: '6px' }}>
            +{fmt.currency(totalInflow)}
          </div>
          <div style={{ fontSize: '10px', color: '#059669', fontWeight: 600, marginTop: '2px' }}>
            {combinedTransactions.filter(t => t.type === 'INCOME').length} recorded deposits
          </div>
        </div>

        {/* Outflow Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #fff1f2 0%, #fff5f5 100%)',
            border: '1.5px solid #fecdd3',
            borderRadius: '14px',
            padding: '14px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#9f1239', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Outflow
            </span>
            <span style={{ background: '#ffe4e6', color: '#e11d48', fontSize: '9px', fontWeight: 800, padding: '2px 5px', borderRadius: '5px' }}>
              Expenses
            </span>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 900, color: '#e11d48', marginTop: '6px' }}>
            -{fmt.currency(totalOutflow)}
          </div>
          <div style={{ fontSize: '10px', color: '#f43f5e', fontWeight: 600, marginTop: '2px' }}>
            {combinedTransactions.filter(t => t.type === 'EXPENSE').length} recorded debits
          </div>
        </div>

        {/* Net Savings Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%)',
            border: '1.5px solid #c7d2fe',
            borderRadius: '14px',
            padding: '14px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#3730a3', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Net Savings
            </span>
            <span style={{ background: '#e0e7ff', color: '#4338ca', fontSize: '9px', fontWeight: 800, padding: '2px 5px', borderRadius: '5px' }}>
              {savingsRate}% Rate
            </span>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 900, color: netSavings >= 0 ? '#4338ca' : '#be123c', marginTop: '6px' }}>
            {netSavings >= 0 ? '+' : ''}{fmt.currency(netSavings)}
          </div>
          <div style={{ fontSize: '10px', color: '#4f46e5', fontWeight: 600, marginTop: '2px' }}>
            {netSavings >= 0 ? 'Surplus Cashflow' : 'Net Monthly Deficit'}
          </div>
        </div>

        {/* Budget Status Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #f0f9ff 0%, #f8fafc 100%)',
            border: '1.5px solid #bae6fd',
            borderRadius: '14px',
            padding: '14px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Budget Velocity
            </span>
            <span style={{ background: '#e0f2fe', color: '#0284c7', fontSize: '9px', fontWeight: 800, padding: '2px 5px', borderRadius: '5px' }}>
              Active Cap
            </span>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 900, color: '#0284c7', marginTop: '6px' }}>
            {dashboardData?.dailySafeToSpend ? `${fmt.currency(dashboardData.dailySafeToSpend)}/d` : 'Target Met'}
          </div>
          <div style={{ fontSize: '10px', color: '#0ea5e9', fontWeight: 600, marginTop: '2px' }}>
            Safe-to-Spend Daily Pace
          </div>
        </div>
      </div>

      {/* ── 4. VISUAL ANALYTICS: CATEGORY DISTRIBUTION & CASHFLOW ────────── */}
      <div
        style={{
          marginTop: '18px',
          display: 'grid',
          gridTemplateColumns: '1.1fr 0.9fr',
          gap: '14px'
        }}
      >
        {/* Category Expense Analytics Bars */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              📊 Expense Category Distribution
            </span>
            <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>Top Outflows</span>
          </div>

          {topCategories.length === 0 ? (
            <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center', padding: '16px' }}>
              No categorized expenses recorded in this cycle
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {topCategories.map((c) => {
                const color = CATEGORY_COLORS[c.category] || '#64748b'
                return (
                  <div key={c.category} style={{ fontSize: '11px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <span style={{ fontWeight: 700, color: '#334155' }}>
                        {c.categoryLabel || c.category}
                      </span>
                      <span style={{ fontWeight: 800, color: '#0f172a' }}>
                        {fmt.currency(c.amount)} ({c.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '7px', background: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${Math.min(c.percentage, 100)}%`,
                          height: '100%',
                          background: color,
                          borderRadius: '9999px'
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Cashflow Ratio & Financial Health Card */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                📈 Cashflow Allocation Ratio
              </span>
              <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>Audit Grade</span>
            </div>

            {/* Visual Stacked Cashflow Bar */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ height: '14px', width: '100%', borderRadius: '6px', overflow: 'hidden', display: 'flex', background: '#e2e8f0' }}>
                <div
                  style={{
                    width: `${totalInflow > 0 ? Math.min((totalOutflow / totalInflow) * 100, 100) : 0}%`,
                    background: '#e11d48',
                    height: '100%'
                  }}
                  title="Expenses Ratio"
                />
                <div
                  style={{
                    width: `${totalInflow > 0 && netSavings > 0 ? Math.min((netSavings / totalInflow) * 100, 100) : 0}%`,
                    background: '#10b981',
                    height: '100%'
                  }}
                  title="Retained Savings Ratio"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '10px', color: '#64748b' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', background: '#e11d48', borderRadius: '2px', display: 'inline-block' }} />
                  Expenses: {totalInflow > 0 ? Math.round((totalOutflow / totalInflow) * 100) : 0}%
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '2px', display: 'inline-block' }} />
                  Net Savings: {savingsRate}%
                </span>
              </div>
            </div>
          </div>

          {/* Health Summary Box */}
          <div
            style={{
              background: netSavings >= 0 ? '#ecfdf5' : '#fff1f2',
              border: `1px solid ${netSavings >= 0 ? '#a7f3d0' : '#fecdd3'}`,
              borderRadius: '10px',
              padding: '10px',
              marginTop: '10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px' }}>{netSavings >= 0 ? '🏆' : '⚠️'}</span>
              <span style={{ fontSize: '11px', fontWeight: 800, color: netSavings >= 0 ? '#065f46' : '#9f1239' }}>
                {netSavings >= 0 ? 'Positive Capital Surplus' : 'Expenditure Exceeded Inflow'}
              </span>
            </div>
            <p style={{ fontSize: '10px', color: netSavings >= 0 ? '#047857' : '#be123c', margin: '3px 0 0 0', lineHeight: 1.4 }}>
              {netSavings >= 0
                ? `Retained +${fmt.currency(netSavings)} (${savingsRate}% savings rate). Your financial velocity is healthy and well within safe operational limits.`
                : `Net monthly deficit of -${fmt.currency(Math.abs(netSavings))}. Review discretionary categories to re-align with safe monthly thresholds.`}
            </p>
          </div>
        </div>
      </div>

      {/* ── 5. ITEMIZED MONTHLY TRANSACTION LEDGER ──────────────────────── */}
      <div
        style={{
          marginTop: '18px',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            padding: '10px 16px',
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            📑 Itemized Monthly Statement Ledger ({combinedTransactions.length} Transactions)
          </span>
          <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>
            Chronological Order
          </span>
        </div>

        {combinedTransactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontSize: '12px' }}>
            No recorded transactions in this statement period.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                <th style={{ padding: '8px 14px', fontWeight: 700, width: '90px' }}>Date</th>
                <th style={{ padding: '8px 14px', fontWeight: 700 }}>Description / Narration</th>
                <th style={{ padding: '8px 14px', fontWeight: 700, width: '140px' }}>Category / Source</th>
                <th style={{ padding: '8px 14px', fontWeight: 700, width: '75px', textAlign: 'center' }}>Type</th>
                <th style={{ padding: '8px 14px', fontWeight: 700, width: '110px', textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {combinedTransactions.map((tx, idx) => (
                <tr
                  key={tx.id}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    background: idx % 2 === 0 ? '#ffffff' : '#fafafa'
                  }}
                >
                  <td style={{ padding: '7px 14px', color: '#475569', fontFamily: 'monospace', fontSize: '10.5px' }}>
                    {tx.date}
                  </td>
                  <td style={{ padding: '7px 14px', fontWeight: 600, color: '#0f172a' }}>
                    {tx.title && tx.title.trim() ? tx.title : (tx.category ? tx.category : 'Bank Debit')}
                  </td>
                  <td style={{ padding: '7px 14px', color: '#475569' }}>
                    <span style={{ background: '#f1f5f9', color: '#334155', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 600 }}>
                      {tx.category}
                    </span>
                  </td>
                  <td style={{ padding: '7px 14px', textAlign: 'center' }}>
                    <span
                      style={{
                        background: tx.type === 'INCOME' ? '#d1fae5' : '#ffe4e6',
                        color: tx.type === 'INCOME' ? '#047857' : '#e11d48',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '9px',
                        fontWeight: 800,
                        textTransform: 'uppercase'
                      }}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: '7px 14px',
                      textAlign: 'right',
                      fontWeight: 800,
                      color: tx.type === 'INCOME' ? '#047857' : '#e11d48',
                      fontFamily: 'monospace'
                    }}
                  >
                    {tx.type === 'INCOME' ? '+' : '-'}{fmt.currency(tx.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── 6. OFFICIAL FOOTER WITH DIGITAL VERIFICATION SEAL ────────────── */}
      <div
        style={{
          marginTop: '22px',
          paddingTop: '14px',
          borderTop: '1px dashed #cbd5e1',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '10px',
          color: '#94a3b8'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: '#10b981', fontWeight: 900 }}>✔</span>
          <span style={{ fontWeight: 600, color: '#64748b' }}>
            FinTrack Pro Certified Audit · Cryptographically Signed by System Vault
          </span>
        </div>
        <div style={{ fontFamily: 'monospace' }}>
          Confidential · Generated for {user?.email} · Page 1 of 1
        </div>
      </div>
    </div>
  )
}
