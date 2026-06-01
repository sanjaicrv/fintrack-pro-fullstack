import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, RefreshCw, TrendingDown, Filter } from 'lucide-react'
import { expenseApi } from '../api/expense'
import type { ExpenseRequest, ExpenseResponse, ExpenseCategory } from '../types'
import { fmt, CATEGORY_LABELS, CATEGORY_COLORS, FREQUENCY_LABELS } from '../utils/formatters'
import Modal from '../components/Common/Modal'
import ExpenseForm from '../components/Forms/ExpenseForm'
import { PageLoader, EmptyState } from '../components/Common/Feedback'
import toast from 'react-hot-toast'

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<ExpenseResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<ExpenseResponse | undefined>()
  const [filterCat, setFilterCat] = useState<string>('ALL')

  const load = () => {
    setLoading(true)
    expenseApi.getAll()
      .then(r => setExpenses(r.data.data ?? []))
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
        toast.success('Expense updated!')
      } else {
        const res = await expenseApi.create(data)
        setExpenses(prev => [res.data.data!, ...prev])
        toast.success('Expense added!')
      }
      closeModal()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this expense?')) return
    await expenseApi.delete(id)
    setExpenses(prev => prev.filter(e => e.id !== id))
    toast.success('Expense deleted')
  }

  const categories = ['ALL', ...Array.from(new Set(expenses.map(e => e.category)))]
  const filtered   = filterCat === 'ALL' ? expenses : expenses.filter(e => e.category === filterCat)
  const total      = filtered.reduce((s, e) => s + e.amount, 0)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Expenses</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {filtered.length} records · Total: <span className="font-medium text-red-500">{fmt.currency(total)}</span>
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={15} /> Add Expense
        </button>
      </div>

      {/* Category filter pills */}
      {categories.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} className="text-gray-400 flex-shrink-0" />
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setFilterCat(c)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                filterCat === c
                  ? 'bg-primary-600 border-primary-600 text-white'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-400'
              }`}
            >
              {c === 'ALL' ? 'All' : CATEGORY_LABELS[c] ?? c}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><PageLoader /></div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={<TrendingDown size={24} />} title="No expenses found" action={<button onClick={openCreate} className="btn-primary">Add Expense</button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                  {['Category', 'Description', 'Amount', 'Date', 'Recurring', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {filtered.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: CATEGORY_COLORS[e.category] ?? '#6b7280' }} />
                        <span className="font-medium text-gray-900 dark:text-white text-xs">{CATEGORY_LABELS[e.category] ?? e.category}</span>
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-300 max-w-[200px] truncate">{e.description}</td>
                    <td className="px-5 py-3 font-semibold text-red-500 dark:text-red-400">{fmt.currency(e.amount)}</td>
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400">{fmt.date(e.date)}</td>
                    <td className="px-5 py-3">
                      {e.recurring
                        ? <span className="badge-amber flex items-center gap-1 w-fit"><RefreshCw size={10} /> {FREQUENCY_LABELS[e.frequency!]}</span>
                        : <span className="text-gray-400 text-xs">One-time</span>}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(e)} className="p-1.5 rounded-lg btn-secondary !px-2 !py-1.5"><Pencil size={13} /></button>
                        <button onClick={() => handleDelete(e.id)} className="p-1.5 rounded-lg btn-danger !px-2 !py-1.5"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={closeModal} title={editing ? 'Edit Expense' : 'Add Expense'}>
        <ExpenseForm onSubmit={handleSubmit} initial={editing} loading={saving} />
      </Modal>
    </div>
  )
}
