import { useEffect, useState, useMemo } from 'react'
import {
  Plus, Pencil, Trash2, RefreshCw, TrendingDown,
  Search, Filter, ArrowUpDown, Calendar, DollarSign,
  Tag, CreditCard
} from 'lucide-react'
import { expenseApi } from '../api/expense'
import type { ExpenseRequest, ExpenseResponse, ExpenseCategory } from '../types'
import { fmt, CATEGORY_LABELS, CATEGORY_COLORS, FREQUENCY_LABELS } from '../utils/formatters'
import Modal from '../components/Common/Modal'
import ConfirmModal from '../components/Common/ConfirmModal'
import ExpenseForm from '../components/Forms/ExpenseForm'
import MonthSelector from '../components/Common/MonthSelector'
import { usePeriod } from '../context/PeriodContext'
import { PageLoader, EmptyState } from '../components/Common/Feedback'
import toast from 'react-hot-toast'

export default function ExpensesPage() {
  const { selectedPeriod, filterByPeriod } = usePeriod()
  const [expenses, setExpenses] = useState<ExpenseResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<ExpenseResponse | undefined>()
  const [filterCat, setFilterCat] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [deleteTarget, setDeleteTarget] = useState<ExpenseResponse | null>(null)

  const load = () => {
    setLoading(true)
    expenseApi.getAll()
      .then(r => setExpenses(r.data.data ?? []))
      .catch(err => {
        console.error('Failed to load expenses', err)
        toast.error('Could not load expenses list')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(undefined); setModalOpen(true) }
  const openEdit   = (e: ExpenseResponse) => { setEditing(e); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditing(undefined) }

  const handleSubmit = async (data: ExpenseRequest) => {
    setSaving(true)
    try {
      if (editing) {
        const res = await expenseApi.update(editing.id, data)
        setExpenses(prev => prev.map(e => e.id === editing.id ? res.data.data! : e))
        toast.success('Expense record updated!')
      } else {
        const res = await expenseApi.create(data)
        setExpenses(prev => [res.data.data!, ...prev])
        toast.success('Expense recorded successfully!')
      }
      closeModal()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save expense')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteConfirmed = async () => {
    if (!deleteTarget) return
    try {
      await expenseApi.delete(deleteTarget.id)
      setExpenses(prev => prev.filter(e => e.id !== deleteTarget.id))
      toast.success('Expense deleted successfully')
    } catch (err: any) {
      toast.error('Failed to delete expense')
    } finally {
      setDeleteTarget(null)
    }
  }

  // Categories list
  const categories = useMemo(() => {
    return ['ALL', ...Array.from(new Set(expenses.map(e => e.category)))]
  }, [expenses])

  // Filtered & searched data by category, search query, and selected period
  const filtered = useMemo(() => {
    return expenses.filter(e => {
      const matchPeriod = filterByPeriod(e.date)
      const matchCat = filterCat === 'ALL' || e.category === filterCat
      const matchQuery =
        !searchQuery.trim() ||
        (e.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (CATEGORY_LABELS[e.category] ?? e.category).toLowerCase().includes(searchQuery.toLowerCase())
      return matchPeriod && matchCat && matchQuery
    })
  }, [expenses, filterCat, searchQuery, selectedPeriod, filterByPeriod])

  // Summary KPIs for current period
  const totalAmount = useMemo(() => filtered.reduce((s, e) => s + e.amount, 0), [filtered])
  const averageAmount = filtered.length > 0 ? totalAmount / filtered.length : 0
  const highestExpense = filtered.length > 0 ? Math.max(...filtered.map(e => e.amount)) : 0
  const recurringCount = filtered.filter(e => e.recurring).length

  return (
    <div className="space-y-6">
      {/* ── HEADER ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Expense Tracker</h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              {filtered.length} {filtered.length === 1 ? 'record' : 'records'}
            </span>
            <span className="badge-blue font-semibold text-[11px]">
              {selectedPeriod.label}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor transactions & caps · Showing data for <strong className="text-slate-800 dark:text-slate-200">{selectedPeriod.label}</strong>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0 self-start sm:self-auto">
          <MonthSelector />
          <button onClick={openCreate} className="btn-primary">
            <Plus size={16} />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* ── QUICK SUMMARY BAR ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="card-flat">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Outflow ({selectedPeriod.isCurrent ? 'This Month' : selectedPeriod.label})
          </span>
          <span className="text-xl font-extrabold text-rose-600 dark:text-rose-400 mt-0.5 block font-numeric">
            {fmt.currency(totalAmount)}
          </span>
        </div>
        <div className="card-flat">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Average Spend</span>
          <span className="text-xl font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 block font-numeric">
            {fmt.currency(averageAmount)}
          </span>
        </div>
        <div className="card-flat">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Largest Entry</span>
          <span className="text-xl font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 block font-numeric">
            {fmt.currency(highestExpense)}
          </span>
        </div>
        <div className="card-flat">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Active Recurring</span>
          <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-0.5 block font-numeric">
            {recurringCount} <span className="text-xs font-semibold text-slate-400 font-sans">subs</span>
          </span>
        </div>
      </div>

      {/* ── SEARCH & FILTER CONTROLS ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 text-slate-400 w-4 h-4 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by description or category..."
            className="input pl-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-semibold"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Filter Dropdown / Counter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <Filter size={14} /> Category:
          </span>
          <select
            value={filterCat}
            onChange={e => setFilterCat(e.target.value)}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            {categories.map(c => (
              <option key={c} value={c}>
                {c === 'ALL' ? 'All Categories' : CATEGORY_LABELS[c] ?? c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── TRANSACTIONS TABLE ───────────────────────────────────────────── */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20"><PageLoader /></div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<TrendingDown size={28} className="text-rose-500" />}
            title={searchQuery || filterCat !== 'ALL' ? 'No matching expenses found' : 'No expenses recorded yet'}
            description={
              searchQuery || filterCat !== 'ALL'
                ? 'Try adjusting your search terms or category filters.'
                : 'Start tracking your daily outgoings to unlock full budgeting analytics.'
            }
            action={
              searchQuery || filterCat !== 'ALL' ? (
                <button
                  onClick={() => { setSearchQuery(''); setFilterCat('ALL') }}
                  className="btn-secondary"
                >
                  Reset Filters
                </button>
              ) : (
                <button onClick={openCreate} className="btn-primary">
                  <Plus size={14} /> Add First Expense
                </button>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/75 dark:bg-slate-900/50">
                  <th className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-3.5">Category</th>
                  <th className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-3.5">Description</th>
                  <th className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-3.5">Amount</th>
                  <th className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-3.5">Date</th>
                  <th className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-3.5">Cadence</th>
                  <th className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filtered.map(e => (
                  <tr key={e.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="flex items-center gap-2.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm"
                          style={{ background: CATEGORY_COLORS[e.category] ?? '#6b7280' }}
                        />
                        <span className="font-semibold text-slate-900 dark:text-white text-xs">
                          {CATEGORY_LABELS[e.category] ?? e.category}
                        </span>
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300 font-medium max-w-[240px] truncate">
                      {e.description || '—'}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap font-extrabold text-rose-600 dark:text-rose-400 font-numeric">
                      −{fmt.currency(e.amount)}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                      {fmt.date(e.date)}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {e.recurring ? (
                        <span className="badge-amber">
                          <RefreshCw size={10} className="animate-spin-slow" />
                          <span>{FREQUENCY_LABELS[e.frequency!] || 'Recurring'}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs font-medium">One-time</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(e)}
                          className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                          title="Edit transaction"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(e)}
                          className="p-1.5 rounded-xl border border-rose-200/80 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition-colors"
                          title="Delete transaction"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── EDIT / CREATE MODAL ──────────────────────────────────────────── */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editing ? 'Edit Expense Record' : 'Record New Expense'}
        subtitle={editing ? `Modify transaction details for ID #${editing.id}` : 'Enter outflow transaction amount and category'}
      >
        <ExpenseForm onSubmit={handleSubmit} initial={editing} loading={saving} />
      </Modal>

      {/* ── ACCESSIBLE CONFIRM DELETE MODAL ──────────────────────────────── */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirmed}
        title="Delete Expense Record"
        message={`Are you sure you want to permanently delete the expense of ${deleteTarget ? fmt.currency(deleteTarget.amount) : ''} (${deleteTarget?.description || CATEGORY_LABELS[deleteTarget?.category ?? '']})? This action cannot be reversed.`}
        confirmText="Yes, Delete Expense"
        variant="danger"
      />
    </div>
  )
}
