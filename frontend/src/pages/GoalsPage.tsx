import { useEffect, useState, useMemo } from 'react'
import { Plus, Target, CheckCircle2, DollarSign, Sparkles } from 'lucide-react'
import { goalApi } from '../api/goal'
import type { GoalRequest, GoalResponse } from '../types'
import { fmt } from '../utils/formatters'
import Modal from '../components/Common/Modal'
import ConfirmModal from '../components/Common/ConfirmModal'
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
  const [deleteTarget, setDeleteTarget] = useState<GoalResponse | null>(null)

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<{ amount: number }>()

  const load = () => {
    setLoading(true)
    goalApi.getAll()
      .then(r => setGoals(r.data.data ?? []))
      .catch(err => {
        console.error('Failed to load goals', err)
        toast.error('Could not load savings goals')
      })
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
        toast.success('Savings goal updated!')
      } else {
        const res = await goalApi.create(data)
        setGoals(prev => [...prev, res.data.data!])
        toast.success('New goal established!')
      }
      setGoalModal(false)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save goal')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteConfirmed = async () => {
    if (!deleteTarget) return
    try {
      await goalApi.delete(deleteTarget.id)
      setGoals(prev => prev.filter(g => g.id !== deleteTarget.id))
      toast.success('Goal removed')
    } catch (err: any) {
      toast.error('Failed to delete goal')
    } finally {
      setDeleteTarget(null)
    }
  }

  const handleContribute = async ({ amount }: { amount: number }) => {
    if (!contributing) return
    if (!amount || amount <= 0) {
      toast.error('Please specify a positive contribution amount')
      return
    }
    setSaving(true)
    try {
      const res = await goalApi.contribute(contributing.id, amount)
      setGoals(prev => prev.map(g => g.id === contributing.id ? res.data.data! : g))
      toast.success(`Allocated ${fmt.currency(amount)} toward ${contributing.name}!`)
      setContribModal(false)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Contribution failed')
    } finally {
      setSaving(false)
    }
  }

  // Summary KPIs
  const totalSaved = useMemo(() => goals.reduce((s, g) => s + g.currentAmount, 0), [goals])
  const totalTarget = useMemo(() => goals.reduce((s, g) => s + g.targetAmount, 0), [goals])
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0
  const completedCount = goals.filter(g => g.status === 'COMPLETED').length

  const quickPillAmounts = [1000, 2500, 5000, 10000]

  return (
    <div className="space-y-6">
      {/* ── HEADER ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Savings Goals</h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20">
              {goals.length} {goals.length === 1 ? 'goal' : 'goals'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Set long-term targets, allocate surplus capital, and track your milestone timelines
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary flex-shrink-0 self-start sm:self-auto">
          <Plus size={16} />
          <span>New Goal</span>
        </button>
      </div>

      {/* ── SUMMARY KPIS ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="card-flat">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Capital Saved</span>
          <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 block font-numeric">
            {fmt.currency(totalSaved)}
          </span>
        </div>
        <div className="card-flat">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Target</span>
          <span className="text-xl font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 block font-numeric">
            {fmt.currency(totalTarget)}
          </span>
        </div>
        <div className="card-flat">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Completion Rate</span>
          <span className="text-xl font-extrabold text-primary-600 dark:text-primary-400 mt-0.5 block font-numeric">
            {overallProgress.toFixed(0)}%
          </span>
        </div>
        <div className="card-flat">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Milestones Reached</span>
          <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 block font-numeric">
            {completedCount} <span className="text-xs font-semibold text-slate-400 font-sans">goals</span>
          </span>
        </div>
      </div>

      {/* ── GOALS GRID ───────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex justify-center py-24"><PageLoader /></div>
      ) : goals.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<Target size={32} className="text-primary-500" />}
            title="No savings goals established yet"
            description="Create your first financial target (e.g. Emergency Fund, New Car, House Deposit) to start tracking contributions."
            action={
              <button onClick={openCreate} className="btn-primary">
                <Plus size={14} /> Establish First Goal
              </button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {goals.map(g => (
            <GoalCard
              key={g.id}
              goal={g}
              onEdit={openEdit}
              onDelete={() => setDeleteTarget(g)}
              onContribute={openContribute}
            />
          ))}
        </div>
      )}

      {/* ── CREATE / EDIT MODAL ──────────────────────────────────────────── */}
      <Modal
        isOpen={goalModal}
        onClose={() => setGoalModal(false)}
        title={editing ? 'Edit Savings Target' : 'Establish New Savings Target'}
        subtitle="Define the target capital amount and expected completion deadline"
      >
        <GoalForm onSubmit={handleGoalSubmit} initial={editing} loading={saving} />
      </Modal>

      {/* ── ADD FUNDS CONTRIBUTE MODAL ───────────────────────────────────── */}
      <Modal
        isOpen={contribModal}
        onClose={() => setContribModal(false)}
        title={`Add Funds: ${contributing?.name || 'Goal'}`}
        subtitle={`Current balance: ${fmt.currency(contributing?.currentAmount ?? 0)} of ${fmt.currency(contributing?.targetAmount ?? 0)}`}
        size="sm"
      >
        <form onSubmit={handleSubmit(handleContribute)} className="space-y-4">
          <div>
            <label className="label">Contribution Amount (₹)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-bold">₹</span>
              <input
                type="number"
                min="1"
                step="100"
                {...register('amount', {
                  required: 'Amount is required',
                  min: { value: 1, message: 'Must be greater than 0' }
                })}
                placeholder="e.g. 5000"
                className="input pl-8"
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-rose-500 mt-1">{errors.amount.message}</p>
            )}
          </div>

          {/* Quick Preset Chips */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Quick Add Presets
            </span>
            <div className="flex flex-wrap gap-2">
              {quickPillAmounts.map(val => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setValue('amount', val, { shouldValidate: true })}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-950/40 text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  +{fmt.currency(val)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setContribModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
            >
              {saving ? 'Allocating...' : 'Confirm Contribution'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── ACCESSIBLE CONFIRM DELETE MODAL ──────────────────────────────── */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirmed}
        title="Delete Savings Goal"
        message={`Are you sure you want to remove the goal "${deleteTarget?.name}"? Any past contributions recorded under this goal will be removed from your goal milestones.`}
        confirmText="Yes, Delete Goal"
        variant="danger"
      />
    </div>
  )
}
