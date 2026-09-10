import { Pencil, Trash2, PlusCircle, CheckCircle2, Clock, AlertTriangle, Sparkles } from 'lucide-react'
import type { GoalResponse } from '../../types'
import { fmt } from '../../utils/formatters'

interface Props {
  goal: GoalResponse
  onEdit: (g: GoalResponse) => void
  onDelete: (id: number) => void
  onContribute: (g: GoalResponse) => void
}

const statusConfig = {
  COMPLETED: {
    label: 'Completed',
    badgeCls: 'badge-green',
    Icon: CheckCircle2,
    barColor: 'from-emerald-500 to-teal-400',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    badgeCls: 'badge-blue',
    Icon: Clock,
    barColor: 'from-primary-600 to-indigo-500',
  },
  URGENT: {
    label: 'Urgent Target',
    badgeCls: 'badge-amber',
    Icon: AlertTriangle,
    barColor: 'from-amber-500 to-orange-500',
  },
  OVERDUE: {
    label: 'Overdue',
    badgeCls: 'badge-red',
    Icon: AlertTriangle,
    barColor: 'from-rose-600 to-red-500',
  },
}

export default function GoalCard({ goal, onEdit, onDelete, onContribute }: Props) {
  const cfg = statusConfig[goal.status] ?? statusConfig.IN_PROGRESS
  const pct = Math.min(100, Math.max(0, goal.progressPercentage ?? 0))
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount)

  return (
    <div className="card flex flex-col justify-between group hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200">
      <div>
        {/* Header: Title, Status Badge, Due Date */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <h3 className="font-bold text-slate-900 dark:text-white text-base truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {goal.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
              <span>Target: {fmt.date(goal.deadline)}</span>
              <span>·</span>
              <span className={goal.daysRemaining < 0 ? 'text-rose-500 font-semibold' : 'text-slate-500'}>
                {goal.daysRemaining >= 0
                  ? `${goal.daysRemaining} days left`
                  : `${Math.abs(goal.daysRemaining)} days overdue`}
              </span>
            </p>
          </div>
          <span className={`${cfg.badgeCls} flex-shrink-0`}>
            {cfg.label}
          </span>
        </div>

        {/* Financial Progress Section */}
        <div className="space-y-2 my-3">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-numeric">
                {fmt.currency(goal.currentAmount)}
              </span>
              <span className="text-xs text-slate-400 ml-1.5 font-medium">
                of {fmt.currency(goal.targetAmount)}
              </span>
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-numeric">
              {pct.toFixed(0)}%
            </span>
          </div>

          {/* Gradient Progress Bar */}
          <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${cfg.barColor} transition-all duration-700 shadow-sm`}
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
            <span>
              {goal.status === 'COMPLETED' ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <Sparkles size={11} /> Goal Achieved!
                </span>
              ) : (
                <span>Remaining: <strong className="text-slate-800 dark:text-slate-200">{fmt.currency(remaining)}</strong></span>
              )}
            </span>
            <span>Target: {fmt.currency(goal.targetAmount)}</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80 mt-2">
        <button
          onClick={() => onContribute(goal)}
          disabled={goal.status === 'COMPLETED'}
          className="flex-1 btn-primary py-1.5 text-xs font-semibold disabled:opacity-40"
        >
          <PlusCircle size={14} />
          <span>Add Funds</span>
        </button>
        <button
          onClick={() => onEdit(goal)}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          title="Edit goal parameters"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={() => onDelete(goal.id)}
          className="p-2 rounded-xl border border-rose-200/80 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition-colors"
          title="Delete goal"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}
