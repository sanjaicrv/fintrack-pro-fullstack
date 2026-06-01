export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }[size]
  return (
    <div className={`${s} border-2 border-primary-600 border-t-transparent rounded-full animate-spin`} />
  )
}

export function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>
  )
}

export function EmptyState({ icon, title, description, action }: {
  icon: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-600 mb-4">
        {icon}
      </div>
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</p>
      {description && <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 rounded-xl p-4 text-sm text-red-600 dark:text-red-400">
      {message}
    </div>
  )
}
