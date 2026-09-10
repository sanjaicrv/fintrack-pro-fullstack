import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type { GoalRequest, GoalResponse } from '../../types'

interface Props {
  onSubmit: (data: GoalRequest) => Promise<void>
  initial?: GoalResponse
  loading?: boolean
}

export default function GoalForm({ onSubmit, initial, loading }: Props) {
  const minDate = new Date().toISOString().split('T')[0]

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<GoalRequest>({
    defaultValues: { currentAmount: 0 },
  })

  useEffect(() => {
    if (initial) {
      reset({
        name: initial.name,
        targetAmount: initial.targetAmount,
        currentAmount: initial.currentAmount,
        deadline: initial.deadline,
      })
    }
  }, [initial, reset])

  const busy = loading || isSubmitting

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Goal Title */}
      <div>
        <label className="label">Savings Target Name *</label>
        <input
          {...register('name', {
            required: 'Goal name is required',
            maxLength: { value: 255, message: 'Name cannot exceed 255 characters' }
          })}
          placeholder="e.g. Emergency Rainy Day Fund, House Down Payment"
          className="input"
        />
        {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>}
      </div>

      {/* Target & Current Capital */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="label">Target Capital (₹) *</label>
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-bold">₹</span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              {...register('targetAmount', {
                required: 'Target amount required',
                valueAsNumber: true,
                min: { value: 0.01, message: 'Must be greater than 0' }
              })}
              placeholder="50000"
              className="input pl-8 font-numeric"
            />
          </div>
          {errors.targetAmount && <p className="text-xs text-rose-500 mt-1">{errors.targetAmount.message}</p>}
        </div>

        <div>
          <label className="label">Initial Seed / Current (₹)</label>
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-bold">₹</span>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register('currentAmount', {
                required: 'Required',
                valueAsNumber: true,
                min: { value: 0, message: 'Must be non-negative' }
              })}
              placeholder="0"
              className="input pl-8 font-numeric"
            />
          </div>
          {errors.currentAmount && <p className="text-xs text-rose-500 mt-1">{errors.currentAmount.message}</p>}
        </div>
      </div>

      {/* Target Deadline */}
      <div>
        <label className="label">Target Completion Deadline *</label>
        <input
          type="date"
          min={minDate}
          {...register('deadline', { required: 'Target deadline is required' })}
          className="input cursor-pointer"
        />
        {errors.deadline && <p className="text-xs text-rose-500 mt-1">{errors.deadline.message}</p>}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
        <button
          type="submit"
          disabled={busy}
          className="btn-primary w-full sm:w-auto"
        >
          {busy ? 'Saving...' : initial ? 'Save Target Changes' : 'Establish Goal'}
        </button>
      </div>
    </form>
  )
}
