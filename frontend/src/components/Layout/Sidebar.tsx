import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, TrendingUp, TrendingDown, Target,
  BarChart2, Settings, X, Wallet
} from 'lucide-react'
import FinTrackLogo from '../../pages/FinTrackLogo'
const links = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard'  },
  { to: '/income',    icon: TrendingUp,      label: 'Income'     },
  { to: '/expenses',  icon: TrendingDown,    label: 'Expenses'   },
  { to: '/goals',     icon: Target,          label: 'Goals'      },
  { to: '/analytics', icon: BarChart2,       label: 'Analytics'  },
  { to: '/settings',  icon: Settings,        label: 'Settings'   },
]

interface Props { open: boolean; onClose: () => void }

export default function Sidebar({ open, onClose }: Props) {
  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 z-40 flex flex-col
        bg-white dark:bg-gray-900
        border-r border-gray-100 dark:border-gray-800
        transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
              
        {/* Logo */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-gray-100 dark:border-gray-800">

          <FinTrackLogo size="md" />

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
          >
            <X size={16} className="text-gray-500" />
          </button>

        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Version badge */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs text-gray-400 dark:text-gray-600">v1.0.0 · Personal Finance</p>
        </div>
      </aside>
    </>
  )
}
