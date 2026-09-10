import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type { ExpenseRequest, ExpenseResponse } from '../../types'
import { CATEGORY_LABELS } from '../../utils/formatters'
import { RefreshCw, Calendar } from 'lucide-react'

interface Props {
  onSubmit: (data: ExpenseRequest) => Promise<void>
  initial?: ExpenseResponse
  loading?: boolean
}

const CATEGORIES = Object.keys(CATEGORY_LABELS) as (keyof typeof CATEGORY_LABELS)[]

export default function ExpenseForm({ onSubmit, initial, loading }: Props) {
  const todayStr = new Date().toISOString().split('T')[0]

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ExpenseRequest>({
    defaultValues: {
      recurring: false,
      date: todayStr,
    },
  })

  const recurring = watch('recurring')

  useEffect(() => {
    if (initial) {
      reset({
        category: initial.category,
        description: initial.description,
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
      {/* Category Selection */}
      <div>
        <label className="label">Category *</label>
        <select
          {...register('category', { required: 'Please select a spending category' })}
          className="input cursor-pointer"
        >
          <option value="">Select an expense category</option>
          {CATEGORIES.map(c => (
            <option key={c} value={c} className="text-slate-900 dark:text-slate-100">
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
        {errors.category && <p className="text-xs text-rose-500 mt-1">{errors.category.message}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="label">Description *</label>
        <input
          {...register('description', {
            required: 'A description is required',
            maxLength: { value: 500, message: 'Description cannot exceed 500 characters' }
          })}
          placeholder="e.g. Whole Foods groceries, Electricity bill"
          className="input"
        />
        {errors.description && <p className="text-xs text-rose-500 mt-1">{errors.description.message}</p>}
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
          <label className="label">Date of Transaction *</label>
          <input
            type="date"
            {...register('date', { required: 'Transaction date is required' })}
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
            id="rec-exp"
            {...register('recurring')}
            className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 cursor-pointer"
          />
          <label htmlFor="rec-exp" className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
            Mark as Recurring Subscription or Bill
          </label>
        </div>

        {recurring && (
          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
            <label className="label">Billing Cadence *</label>
            <select
              {...register('frequency', { required: recurring ? 'Please specify billing frequency' : false })}
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
          {busy ? 'Saving...' : initial ? 'Save Changes' : 'Record Expense'}
        </button>
      </div>
    </form>
  )
}
