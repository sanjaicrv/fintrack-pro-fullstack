import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type { GoalRequest, GoalResponse } from '../../types'

interface Props {
  onSubmit: (data: GoalRequest) => Promise<void>
  initial?: GoalResponse
  loading?: boolean
}

export default function GoalForm({ onSubmit, initial, loading }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<GoalRequest>({
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="label">Goal Name *</label>
        <input
          {...register('name', { required: 'Goal name is required', maxLength: { value: 255, message: 'Too long' } })}
          placeholder="e.g. Emergency Fund, Vacation, New Laptop"
          className="input"
        />
        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Target Amount (₹) *</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            {...register('targetAmount', { required: 'Target amount required', valueAsNumber: true, min: { value: 0.01, message: 'Must be > 0' } })}
            placeholder="10000"
            className="input"
          />
          {errors.targetAmount && <p className="text-xs text-red-500 mt-1">{errors.targetAmount.message}</p>}
        </div>
        <div>
          <label className="label">Current Amount (₹)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            {...register('currentAmount', { required: 'Required', valueAsNumber: true, min: { value: 0, message: 'Must be ≥ 0' } })}
            placeholder="0"
            className="input"
          />
          {errors.currentAmount && <p className="text-xs text-red-500 mt-1">{errors.currentAmount.message}</p>}
        </div>
      </div>

      <div>
        <label className="label">Target Deadline *</label>
        <input
          type="date"
          min={new Date().toISOString().split('T')[0]}
          {...register('deadline', { required: 'Deadline is required' })}
          className="input"
        />
        {errors.deadline && <p className="text-xs text-red-500 mt-1">{errors.deadline.message}</p>}
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? 'Saving…' : initial ? 'Update Goal' : 'Create Goal'}
        </button>
      </div>
    </form>
  )
}
