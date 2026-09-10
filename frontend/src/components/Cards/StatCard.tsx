import { LucideIcon } from 'lucide-react'

interface Props {
  label: string
  value: string
  subtext?: string
  icon: LucideIcon
  color: 'green' | 'red' | 'blue' | 'purple'
  trend?: { value: number; label: string }
}

const colorThemes = {
  green: {
    iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    trendBg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  },
  red: {
    iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    trendBg: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
  },
  blue: {
    iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    trendBg: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
  },
  purple: {
    iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    trendBg: 'bg-purple-500/10 text-purple-700 dark:text-purple-300',
  },
}

export default function StatCard({ label, value, subtext, icon: Icon, color, trend }: Props) {
  const theme = colorThemes[color] || colorThemes.blue

  return (
    <div className="card group hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 flex flex-col justify-between">
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {label}
        </span>
        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105 ${theme.iconBg}`}>
          <Icon size={18} />
        </div>
      </div>

      <div>
        <div className="text-2xl lg:text-[26px] font-extrabold text-slate-900 dark:text-white tracking-tight font-numeric">
          {value}
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-1.5 min-h-[20px]">
          {trend && (
            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md ${theme.trendBg}`}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value).toFixed(1)}% {trend.label}
            </span>
          )}
          {subtext && (
            <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {subtext}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
