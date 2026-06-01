import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type { IncomeRequest, IncomeResponse } from '../../types'

interface Props {
  onSubmit: (data: IncomeRequest) => Promise<void>
  initial?: IncomeResponse
  loading?: boolean
}

export default function IncomeForm({ onSubmit, initial, loading }: Props) {
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<IncomeRequest>({
    defaultValues: { recurring: false },
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="label">Source *</label>
        <input
          {...register('source', { required: 'Source is required', maxLength: { value: 255, message: 'Too long' } })}
          placeholder="e.g. Salary, Freelance, Dividends"
          className="input"
        />
        {errors.source && <p className="text-xs text-red-500 mt-1">{errors.source.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Amount (₹) *</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            {...register('amount', { required: 'Amount is required', valueAsNumber: true, min: { value: 0.01, message: 'Must be > 0' } })}
            placeholder="0.00"
            className="input"
          />
          {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>}
        </div>
        <div>
          <label className="label">Date *</label>
          <input
            type="date"
            {...register('date', { required: 'Date is required' })}
            className="input"
          />
          {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date.message}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="recurring" {...register('recurring')} className="w-4 h-4 rounded text-primary-600" />
        <label htmlFor="recurring" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
          Recurring income
        </label>
      </div>

      {recurring && (
        <div>
          <label className="label">Frequency *</label>
          <select
            {...register('frequency', { required: recurring ? 'Frequency is required' : false })}
            className="input"
          >
            <option value="">Select frequency</option>
            <option value="WEEKLY">Weekly</option>
            <option value="BIWEEKLY">Bi-weekly</option>
            <option value="MONTHLY">Monthly</option>
            <option value="YEARLY">Yearly</option>
          </select>
          {errors.frequency && <p className="text-xs text-red-500 mt-1">{errors.frequency.message}</p>}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? 'Saving…' : initial ? 'Update Income' : 'Add Income'}
        </button>
      </div>
    </form>
  )
}
