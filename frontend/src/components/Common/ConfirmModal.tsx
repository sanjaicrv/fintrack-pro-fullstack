import { useState } from 'react'
import { AlertTriangle, Info, AlertCircle, Trash2, X } from 'lucide-react'
import Modal from './Modal'

interface Props {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void> | void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  isLoading?: boolean
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: Props) {
  const [internalLoading, setInternalLoading] = useState(false)

  const handleConfirm = async () => {
    try {
      setInternalLoading(true)
      await onConfirm()
      onClose()
    } finally {
      setInternalLoading(false)
    }
  }

  const busy = isLoading || internalLoading

  const icons = {
    danger:  <Trash2 className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
    info:    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
  }

  const iconBgs = {
    danger:  'bg-rose-500/10 border-rose-500/20',
    warning: 'bg-amber-500/10 border-amber-500/20',
    info:    'bg-blue-500/10 border-blue-500/20',
  }

  const confirmBtnCls = {
    danger:  'btn-danger',
    warning: 'bg-amber-600 hover:bg-amber-500 text-white rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold shadow-sm transition-all',
    info:    'btn-primary',
  }

  return (
    <Modal isOpen={isOpen} onClose={busy ? () => {} : onClose} title={title} size="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${iconBgs[variant]}`}>
            {icons[variant]}
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="btn-secondary"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={busy}
            className={confirmBtnCls[variant]}
          >
            {busy ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}
