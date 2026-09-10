import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type { IncomeRequest, IncomeResponse } from '../../types'
import { RefreshCw } from 'lucide-react'

interface Props {
  onSubmit: (data: IncomeRequest) => Promise<void>
  initial?: IncomeResponse
  loading?: boolean
}

export default function IncomeForm({ onSubmit, initial, loading }: Props) {
  const todayStr = new Date().toISOString().split('T')[0]

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<IncomeRequest>({
    defaultValues: {
      recurring: false,
      date: todayStr,
    },
  })

  const recurring = watch('recurring')

  useEffect(() => {
    if (initial) {
      reset({
        source: initial.source,
        amount: initial.amount,
        date: initial.date,
        recurring: initial.recurring,
        frequency: initial.frequency,
      })
    }
  }, [initial, reset])

  useEffect(() => {
    if (!recurring) setValue('frequency', undefined)
  }, [recurring, setValue])

  const busy = loading || isSubmitting

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Source Entity */}
      <div>
        <label className="label">Income Source / Employer *</label>
        <input
          {...register('source', {
            required: 'Please state the source entity or employer',
            maxLength: { value: 255, message: 'Source cannot exceed 255 characters' }
          })}
          placeholder="e.g. Primary Tech Salary, Design Retainer, Dividends"
          className="input"
        />
        {errors.source && <p className="text-xs text-rose-500 mt-1">{errors.source.message}</p>}
      </div>

      {/* Amount & Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="label">Amount (₹) *</label>
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-bold">₹</span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              {...register('amount', {
                required: 'Amount is required',
                valueAsNumber: true,
                min: { value: 0.01, message: 'Must be greater than 0' }
              })}
              placeholder="0.00"
              className="input pl-8 font-numeric"
            />
          </div>
          {errors.amount && <p className="text-xs text-rose-500 mt-1">{errors.amount.message}</p>}
        </div>

        <div>
          <label className="label">Date Received *</label>
          <input
            type="date"
            {...register('date', { required: 'Date is required' })}
            className="input cursor-pointer"
          />
          {errors.date && <p className="text-xs text-rose-500 mt-1">{errors.date.message}</p>}
        </div>
      </div>

      {/* Recurring Option */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60 space-y-3">
        <div className="flex items-center gap-2.5">
          <input
            type="checkbox"
            id="rec-inc"
            {...register('recurring')}
            className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 cursor-pointer"
          />
          <label htmlFor="rec-inc" className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
            Mark as Recurring Inflow (e.g. Monthly Salary)
          </label>
        </div>

        {recurring && (
          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
            <label className="label">Payout Cadence *</label>
            <select
              {...register('frequency', { required: recurring ? 'Please specify payment frequency' : false })}
              className="input cursor-pointer"
            >
              <option value="">Select frequency</option>
              <option value="WEEKLY">Weekly</option>
              <option value="BIWEEKLY">Bi-weekly</option>
              <option value="MONTHLY">Monthly</option>
              <option value="YEARLY">Yearly</option>
            </select>
            {errors.frequency && <p className="text-xs text-rose-500 mt-1">{errors.frequency.message}</p>}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
        <button
          type="submit"
          disabled={busy}
          className="btn-primary w-full sm:w-auto"
        >
          {busy ? 'Saving...' : initial ? 'Save Changes' : 'Record Inflow'}
        </button>
      </div>
    </form>
  )
}
