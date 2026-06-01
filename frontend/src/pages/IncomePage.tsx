import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, RefreshCw, TrendingUp } from 'lucide-react'
import { incomeApi } from '../api/income'
import type { IncomeRequest, IncomeResponse } from '../types'
import { fmt, FREQUENCY_LABELS } from '../utils/formatters'
import Modal from '../components/Common/Modal'
import IncomeForm from '../components/Forms/IncomeForm'
import { PageLoader, EmptyState } from '../components/Common/Feedback'
import toast from 'react-hot-toast'

export default function IncomePage() {
  const [incomes, setIncomes] = useState<IncomeResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<IncomeResponse | undefined>()

  const load = () => {
    setLoading(true)
    incomeApi.getAll()
      .then(r => setIncomes(r.data.data ?? []))
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
        toast.success('Income updated!')
      } else {
        const res = await incomeApi.create(data)
        setIncomes(prev => [res.data.data!, ...prev])
        toast.success('Income added!')
      }
      closeModal()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this income record?')) return
    await incomeApi.delete(id)
    setIncomes(prev => prev.filter(i => i.id !== id))
    toast.success('Income deleted')
  }

  const total = incomes.reduce((s, i) => s + i.amount, 0)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Income</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {incomes.length} records · Total: <span className="font-medium text-emerald-600">{fmt.currency(total)}</span>
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={15} /> Add Income
        </button>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><PageLoader /></div>
        ) : incomes.length === 0 ? (
          <EmptyState icon={<TrendingUp size={24} />} title="No income records yet" description="Add your first income source to get started" action={<button onClick={openCreate} className="btn-primary">Add Income</button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                  {['Source', 'Amount', 'Date', 'Recurring', 'Frequency', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {incomes.map(i => (
                  <tr key={i.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-900 dark:text-white">{i.source}</td>
                    <td className="px-5 py-3 font-semibold text-emerald-600 dark:text-emerald-400">{fmt.currency(i.amount)}</td>
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400">{fmt.date(i.date)}</td>
                    <td className="px-5 py-3">
                      {i.recurring
                        ? <span className="badge-green flex items-center gap-1 w-fit"><RefreshCw size={10} /> Yes</span>
                        : <span className="text-gray-400 text-xs">One-time</span>}
                    </td>
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs">
                      {i.frequency ? FREQUENCY_LABELS[i.frequency] : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(i)} className="p-1.5 rounded-lg btn-secondary !px-2 !py-1.5"><Pencil size={13} /></button>
                        <button onClick={() => handleDelete(i.id)} className="p-1.5 rounded-lg btn-danger !px-2 !py-1.5"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={closeModal} title={editing ? 'Edit Income' : 'Add Income'}>
        <IncomeForm onSubmit={handleSubmit} initial={editing} loading={saving} />
      </Modal>
    </div>
  )
}
