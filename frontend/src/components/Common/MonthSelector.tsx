import { Calendar } from 'lucide-react'
import { usePeriod } from '../../context/PeriodContext'

interface MonthSelectorProps {
  className?: string
  includeAllTime?: boolean
}

export default function MonthSelector({ className = '', includeAllTime = true }: MonthSelectorProps) {
  const { selectedPeriod, setSelectedPeriod, monthsList } = usePeriod()

  const currentValue = selectedPeriod.isAllTime || (selectedPeriod.year === 0 && selectedPeriod.month === 0)
    ? '0-0'
    : `${selectedPeriod.year}-${selectedPeriod.month}`

  return (
    <div className={`flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 shadow-sm ${className}`}>
      <Calendar className="w-4 h-4 text-primary-500 flex-shrink-0" />
      <select
        value={currentValue}
        onChange={(e) => {
          const val = e.target.value
          if (val === '0-0') {
            setSelectedPeriod({ label: 'All Time Summary', year: 0, month: 0, isCurrent: false, isAllTime: true })
          } else {
            const [y, m] = val.split('-').map(Number)
            const found = monthsList.find(opt => opt.year === y && opt.month === m)
            if (found) setSelectedPeriod(found)
          }
        }}
        className="bg-transparent text-slate-900 dark:text-white text-xs font-semibold focus:outline-none cursor-pointer pr-1"
      >
        <optgroup label="Monthly Breakdown">
          {monthsList.map(m => (
            <option key={`${m.year}-${m.month}`} value={`${m.year}-${m.month}`} className="text-slate-900 dark:text-slate-900">
              {m.label}
            </option>
          ))}
        </optgroup>
        {includeAllTime && (
          <optgroup label="Lifetime Overview">
            <option value="0-0" className="text-slate-900 dark:text-slate-900">All Time Summary</option>
          </optgroup>
        )}
      </select>
    </div>
  )
}
