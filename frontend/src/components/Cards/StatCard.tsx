import { LucideIcon } from 'lucide-react'

interface Props {
  label: string
  value: string
  subtext?: string
  icon: LucideIcon
  color: 'green' | 'red' | 'blue' | 'purple'
  trend?: { value: number; label: string }
}

const colors = {
  green:  { bg: 'bg-emerald-50  dark:bg-emerald-900/20', icon: 'bg-emerald-500',  text: 'text-emerald-700  dark:text-emerald-300' },
  red:    { bg: 'bg-red-50      dark:bg-red-900/20',     icon: 'bg-red-500',      text: 'text-red-700      dark:text-red-300'     },
  blue:   { bg: 'bg-blue-50     dark:bg-blue-900/20',    icon: 'bg-blue-500',     text: 'text-blue-700     dark:text-blue-300'    },
  purple: { bg: 'bg-purple-50   dark:bg-purple-900/20',  icon: 'bg-purple-500',   text: 'text-purple-700   dark:text-purple-300'  },
}

export default function StatCard({ label, value, subtext, icon: Icon, color, trend }: Props) {
  const c = colors[color]
  return (
    <div className="card flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl ${c.icon} flex items-center justify-center flex-shrink-0`}>
        <Icon size={20} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5 truncate">{value}</p>
        {subtext && <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">{subtext}</p>}
        {trend && (
          <p className={`text-xs font-medium mt-1 ${c.text}`}>
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value).toFixed(1)}% {trend.label}
          </p>
        )}
      </div>
    </div>
  )
}
