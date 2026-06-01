import { Pencil, Trash2, PlusCircle, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'
import type { GoalResponse } from '../../types'
import { fmt } from '../../utils/formatters'

interface Props {
  goal: GoalResponse
  onEdit: (g: GoalResponse) => void
  onDelete: (id: number) => void
  onContribute: (g: GoalResponse) => void
}

const statusConfig = {
  COMPLETED:   { label: 'Completed',   cls: 'badge-green',  Icon: CheckCircle2  },
  IN_PROGRESS: { label: 'In Progress', cls: 'badge-blue',   Icon: Clock         },
  URGENT:      { label: 'Urgent',      cls: 'badge-amber',  Icon: AlertTriangle },
  OVERDUE:     { label: 'Overdue',     cls: 'badge-red',    Icon: AlertTriangle },
}

export default function GoalCard({ goal, onEdit, onDelete, onContribute }: Props) {
  const cfg = statusConfig[goal.status] ?? statusConfig.IN_PROGRESS
  const pct = Math.min(100, goal.progressPercentage ?? 0)

  return (
    <div className="card flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">{goal.name}</h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            Due {fmt.date(goal.deadline)}
            {goal.daysRemaining >= 0
              ? ` · ${goal.daysRemaining} days left`
              : ` · ${Math.abs(goal.daysRemaining)} days overdue`}
          </p>
        </div>
        <span className={`${cfg.cls} flex-shrink-0`}>{cfg.label}</span>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-gray-500 dark:text-gray-400">Progress</span>
          <span className="font-medium text-gray-900 dark:text-white">{pct.toFixed(1)}%</span>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: pct >= 100 ? '#10b981' : pct >= 75 ? '#6366f1' : pct >= 50 ? '#f59e0b' : '#ef4444',
            }}
          />
        </div>
        <div className="flex justify-between text-xs mt-1.5">
          <span className="text-gray-500">{fmt.currency(goal.currentAmount)}</span>
          <span className="text-gray-500">{fmt.currency(goal.targetAmount)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onContribute(goal)}
          disabled={goal.status === 'COMPLETED'}
          className="flex-1 flex items-center justify-center gap-1.5 btn-primary py-1.5 text-xs disabled:opacity-40"
        >
          <PlusCircle size={13} /> Add Funds
        </button>
        <button
          onClick={() => onEdit(goal)}
          className="p-1.5 rounded-lg btn-secondary"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => onDelete(goal.id)}
          className="p-1.5 rounded-lg btn-danger"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}
