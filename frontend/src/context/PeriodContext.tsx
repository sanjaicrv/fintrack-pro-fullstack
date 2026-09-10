import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react'

export interface MonthOption {
  label: string
  year: number
  month: number
  isCurrent: boolean
  isAllTime?: boolean
}

export function getAvailableMonths(): MonthOption[] {
  const options: MonthOption[] = []
  const now = new Date()

  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const year = d.getFullYear()
    const month = d.getMonth() + 1
    const monthName = d.toLocaleString('default', { month: 'short', year: 'numeric' })
    options.push({
      label: i === 0 ? `This Month (${monthName})` : monthName,
      year,
      month,
      isCurrent: i === 0,
      isAllTime: false,
    })
  }
  return options
}

interface PeriodContextType {
  selectedPeriod: MonthOption
  setSelectedPeriod: (p: MonthOption) => void
  monthsList: MonthOption[]
  filterByPeriod: (dateStr?: string) => boolean
}

const PeriodContext = createContext<PeriodContextType | null>(null)

export function PeriodProvider({ children }: { children: ReactNode }) {
  const monthsList = useMemo(() => getAvailableMonths(), [])

  const [selectedPeriod, setSelectedPeriodState] = useState<MonthOption>(() => {
    const saved = localStorage.getItem('fintrack_selected_period')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.isAllTime || (parsed.year === 0 && parsed.month === 0)) {
          return { label: 'All Time', year: 0, month: 0, isCurrent: false, isAllTime: true }
        }
        const match = monthsList.find(m => m.year === parsed.year && m.month === parsed.month)
        if (match) return match
      } catch (e) {
        console.warn('Failed to parse saved period', e)
      }
    }
    return monthsList[0] // Defaults to "This Month"
  })

  const setSelectedPeriod = (p: MonthOption) => {
    setSelectedPeriodState(p)
    localStorage.setItem('fintrack_selected_period', JSON.stringify({
      year: p.year,
      month: p.month,
      isAllTime: p.isAllTime || (p.year === 0 && p.month === 0),
      label: p.label
    }))
  }

  const filterByPeriod = (dateStr?: string): boolean => {
    if (!dateStr) return true
    if (selectedPeriod.isAllTime || (selectedPeriod.year === 0 && selectedPeriod.month === 0)) {
      return true
    }
    const parts = dateStr.split('-')
    if (parts.length >= 2) {
      const y = parseInt(parts[0], 10)
      const m = parseInt(parts[1], 10)
      return y === selectedPeriod.year && m === selectedPeriod.month
    }
    const d = new Date(dateStr)
    return d.getFullYear() === selectedPeriod.year && (d.getMonth() + 1) === selectedPeriod.month
  }

  return (
    <PeriodContext.Provider value={{ selectedPeriod, setSelectedPeriod, monthsList, filterByPeriod }}>
      {children}
    </PeriodContext.Provider>
  )
}

export function usePeriod() {
  const ctx = useContext(PeriodContext)
  if (!ctx) throw new Error('usePeriod must be used within PeriodProvider')
  return ctx
}
