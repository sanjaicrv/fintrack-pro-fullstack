import { useEffect, useState, useMemo } from 'react'
import {
  Plus, Pencil, Trash2, RefreshCw, TrendingUp,
  Search, ArrowUpDown, Calendar, DollarSign
} from 'lucide-react'
import { incomeApi } from '../api/income'
import type { IncomeRequest, IncomeResponse } from '../types'
import { fmt, FREQUENCY_LABELS } from '../utils/formatters'
import Modal from '../components/Common/Modal'
import ConfirmModal from '../components/Common/ConfirmModal'
import IncomeForm from '../components/Forms/IncomeForm'
import MonthSelector from '../components/Common/MonthSelector'
import { usePeriod } from '../context/PeriodContext'
import { PageLoader, EmptyState } from '../components/Common/Feedback'
import toast from 'react-hot-toast'

export default function IncomePage() {
  const { selectedPeriod, filterByPeriod } = usePeriod()
  const [incomes, setIncomes] = useState<IncomeResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<IncomeResponse | undefined>()
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [deleteTarget, setDeleteTarget] = useState<IncomeResponse | null>(null)

  const load = () => {
    setLoading(true)
    incomeApi.getAll()
      .then(r => setIncomes(r.data.data ?? []))
      .catch(err => {
        console.error('Failed to load income records', err)
        toast.error('Could not load income list')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(undefined); setModalOpen(true) }
  const openEdit   = (i: IncomeResponse) => { setEditing(i); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditing(undefined) }

  const handleSubmit = async (data: IncomeRequest) => {
    setSaving(true)
    try {
      if (editing) {
        const res = await incomeApi.update(editing.id, data)
        setIncomes(prev => prev.map(i => i.id === editing.id ? res.data.data! : i))
        toast.success('Income source updated!')
      } else {
        const res = await incomeApi.create(data)
        setIncomes(prev => [res.data.data!, ...prev])
        toast.success('Income source logged!')
      }
      closeModal()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save income')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteConfirmed = async () => {
    if (!deleteTarget) return
    try {
      await incomeApi.delete(deleteTarget.id)
      setIncomes(prev => prev.filter(i => i.id !== deleteTarget.id))
      toast.success('Income stream deleted')
    } catch (err: any) {
      toast.error('Failed to delete income stream')
    } finally {
      setDeleteTarget(null)
    }
  }

  // Filtered income list by selected period and search query
  const filtered = useMemo(() => {
    return incomes.filter(i => {
      const matchPeriod = filterByPeriod(i.date)
      const matchQuery = !searchQuery.trim() || i.source.toLowerCase().includes(searchQuery.toLowerCase())
      return matchPeriod && matchQuery
    })
  }, [incomes, searchQuery, selectedPeriod, filterByPeriod])

  // Summary KPIs for current period
  const totalAmount = useMemo(() => filtered.reduce((s, i) => s + i.amount, 0), [filtered])
  const averageAmount = filtered.length > 0 ? totalAmount / filtered.length : 0
  const recurringCount = filtered.filter(i => i.recurring).length
  const topSource = useMemo(() => {
    if (filtered.length === 0) return null
    return [...filtered].sort((a, b) => b.amount - a.amount)[0]
  }, [filtered])

  return (
    <div className="space-y-6">
      {/* ── HEADER ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Income Streams</h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {filtered.length} {filtered.length === 1 ? 'source' : 'sources'}
            </span>
            <span className="badge-blue font-semibold text-[11px]">
              {selectedPeriod.label}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage incoming cashflows · Showing data for <strong className="text-slate-800 dark:text-slate-200">{selectedPeriod.label}</strong>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0 self-start sm:self-auto">
          <MonthSelector />
          <button onClick={openCreate} className="btn-primary">
            <Plus size={16} />
            <span>Add Income</span>
          </button>
        </div>
      </div>

      {/* ── QUICK SUMMARY BAR ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="card-flat">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Inflow ({selectedPeriod.isCurrent ? 'This Month' : selectedPeriod.label})
          </span>
          <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 block font-numeric">
            {fmt.currency(totalAmount)}
          </span>
        </div>
        <div className="card-flat">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Average Stream</span>
          <span className="text-xl font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 block font-numeric">
            {fmt.currency(averageAmount)}
          </span>
        </div>
        <div className="card-flat">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Primary Inflow</span>
          <span className="text-xl font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 block font-numeric truncate">
            {topSource ? fmt.currency(topSource.amount) : '₹0'}
          </span>
        </div>
        <div className="card-flat">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Recurring Inflows</span>
          <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400 mt-0.5 block font-numeric">
            {recurringCount} <span className="text-xs font-semibold text-slate-400 font-sans">active</span>
          </span>
        </div>
      </div>

      {/* ── SEARCH BAR ───────────────────────────────────────────────────── */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3 text-slate-400 w-4 h-4 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search income sources (e.g. Salary, Consulting)..."
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

      {/* ── TABLE ────────────────────────────────────────────────────────── */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20"><PageLoader /></div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<TrendingUp size={28} className="text-emerald-500" />}
            title={searchQuery ? 'No matching income sources found' : 'No income streams registered'}
            description={
              searchQuery
                ? 'Try searching for a different source keyword.'
                : 'Log your salary or business earnings to start calculating savings growth.'
            }
            action={
              searchQuery ? (
                <button onClick={() => setSearchQuery('')} className="btn-secondary">
                  Reset Search
                </button>
              ) : (
                <button onClick={openCreate} className="btn-primary">
                  <Plus size={14} /> Add First Income Stream
                </button>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/75 dark:bg-slate-900/50">
                  <th className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-3.5">Source / Entity</th>
                  <th className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-3.5">Amount</th>
                  <th className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-3.5">Date</th>
                  <th className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-3.5">Recurring</th>
                  <th className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-3.5">Cadence</th>
                  <th className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filtered.map(i => (
                  <tr key={i.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group">
                    <td className="px-5 py-3.5 whitespace-nowrap font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                      {i.source}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap font-extrabold text-emerald-600 dark:text-emerald-400 font-numeric">
                      +{fmt.currency(i.amount)}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                      {fmt.date(i.date)}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {i.recurring ? (
                        <span className="badge-green">
                          <RefreshCw size={10} className="animate-spin-slow" />
                          <span>Active Recurring</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs font-medium">One-off</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs font-medium text-slate-600 dark:text-slate-300">
                      {i.frequency ? FREQUENCY_LABELS[i.frequency] : '—'}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(i)}
                          className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                          title="Edit income stream"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(i)}
                          className="p-1.5 rounded-xl border border-rose-200/80 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition-colors"
                          title="Delete income stream"
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
        title={editing ? 'Edit Income Stream' : 'Record New Income'}
        subtitle={editing ? `Update stream info for #${editing.id}` : 'Specify recurring or one-time inflow details'}
      >
        <IncomeForm onSubmit={handleSubmit} initial={editing} loading={saving} />
      </Modal>

      {/* ── ACCESSIBLE CONFIRM DELETE MODAL ──────────────────────────────── */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirmed}
        title="Delete Income Stream"
        message={`Are you sure you want to delete the income record "${deleteTarget?.source}" of ${deleteTarget ? fmt.currency(deleteTarget.amount) : ''}? This will remove it from all monthly cashflow analytics.`}
        confirmText="Yes, Delete Stream"
        variant="danger"
      />
    </div>
  )
}
