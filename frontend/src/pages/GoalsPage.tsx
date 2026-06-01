import { useEffect, useState } from 'react'
import { Plus, Target } from 'lucide-react'
import { goalApi } from '../api/goal'
import type { GoalRequest, GoalResponse } from '../types'
import Modal from '../components/Common/Modal'
import GoalForm from '../components/Forms/GoalForm'
import GoalCard from '../components/Cards/GoalCard'
import { PageLoader, EmptyState } from '../components/Common/Feedback'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'

export default function GoalsPage() {
  const [goals, setGoals] = useState<GoalResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [goalModal, setGoalModal] = useState(false)
  const [contribModal, setContribModal] = useState(false)
  const [editing, setEditing] = useState<GoalResponse | undefined>()
  const [contributing, setContributing] = useState<GoalResponse | undefined>()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<{ amount: number }>()

  const load = () => {
    setLoading(true)
    goalApi.getAll()
      .then(r => setGoals(r.data.data ?? []))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(undefined); setGoalModal(true) }
  const openEdit   = (g: GoalResponse) => { setEditing(g); setGoalModal(true) }
  const openContribute = (g: GoalResponse) => { setContributing(g); reset({ amount: undefined }); setContribModal(true) }

  const handleGoalSubmit = async (data: GoalRequest) => {
    setSaving(true)
    try {
      if (editing) {
        const res = await goalApi.update(editing.id, data)
        setGoals(prev => prev.map(g => g.id === editing.id ? res.data.data! : g))
        toast.success('Goal updated!')
      } else {
        const res = await goalApi.create(data)
        setGoals(prev => [...prev, res.data.data!])
        toast.success('Goal created!')
      }
      setGoalModal(false)
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this goal?')) return
    await goalApi.delete(id)
    setGoals(prev => prev.filter(g => g.id !== id))
    toast.success('Goal deleted')
  }

  const handleContribute = async ({ amount }: { amount: number }) => {
    if (!contributing) return
    setSaving(true)
    try {
      const res = await goalApi.contribute(contributing.id, amount)
      setGoals(prev => prev.map(g => g.id === contributing.id ? res.data.data! : g))
      toast.success(`Added ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)} to goal!`)
      setContribModal(false)
    } finally { setSaving(false) }
  }

  const completed = goals.filter(g => g.status === 'COMPLETED').length

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Savings Goals</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {goals.length} goals · {completed} completed
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={15} /> New Goal
        </button>
      </div>

      {loading ? (
        <PageLoader />
      ) : goals.length === 0 ? (
        <div className="card">
          <EmptyState icon={<Target size={24} />} title="No goals yet" description="Set a savings target to stay motivated" action={<button onClick={openCreate} className="btn-primary">Create Goal</button>} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {goals.map(g => (
            <GoalCard key={g.id} goal={g} onEdit={openEdit} onDelete={handleDelete} onContribute={openContribute} />
          ))}
        </div>
      )}

      {/* Goal form modal */}
      <Modal isOpen={goalModal} onClose={() => setGoalModal(false)} title={editing ? 'Edit Goal' : 'New Goal'}>
        <GoalForm onSubmit={handleGoalSubmit} initial={editing} loading={saving} />
      </Modal>

      {/* Contribute modal */}
      <Modal isOpen={contribModal} onClose={() => setContribModal(false)} title="Add Funds" size="sm">
        {contributing && (
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Contributing to <strong className="text-gray-900 dark:text-white">{contributing.name}</strong>
              <br />
              <span className="text-xs">Current: ₹{contributing.currentAmount.toLocaleString('en-IN')} / Target: ₹{contributing.targetAmount.toLocaleString('en-IN')}</span>
            </p>
            <form onSubmit={handleSubmit(handleContribute)} className="space-y-4">
              <div>
                <label className="label">Amount to Add (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  autoFocus
                  {...register('amount', { required: 'Amount required', valueAsNumber: true, min: { value: 0.01, message: 'Must be > 0' } })}
                  placeholder="0.00"
                  className="input"
                />
                {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>}
              </div>
              <button type="submit" disabled={saving} className="btn-primary w-full">
                {saving ? 'Adding…' : 'Add Funds'}
              </button>
            </form>
          </div>
        )}
      </Modal>
    </div>
  )
}
