import { useState } from 'react'
import { Menu, Sun, Moon, LogOut, User, ChevronDown, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useNavigate, useLocation } from 'react-router-dom'

interface Props {
  onMenuClick: () => void
}

const routeTitles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Overview & Performance' },
  '/income':    { title: 'Income Streams', subtitle: 'Inflow Management' },
  '/expenses':  { title: 'Expense Tracker', subtitle: 'Outflow & Commitments' },
  '/goals':     { title: 'Savings Goals', subtitle: 'Target Accumulation' },
  '/analytics': { title: 'Analytics & Insights', subtitle: 'Financial Intelligence' },
  '/settings':  { title: 'Account Settings', subtitle: 'Preferences & Security' },
}

export default function Navbar({ onMenuClick }: Props) {
  const { user, logout } = useAuth()
  const { isDark, toggle } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [dropOpen, setDropOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const currentRoute = routeTitles[location.pathname] || {
    title: 'FinTrack Pro',
    subtitle: 'Personal Finance Platform',
  }

  return (
    <header className="h-16 bg-white dark:bg-[#0b0f19] border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between px-4 lg:px-6 flex-shrink-0 z-20">
      {/* Left side: Mobile Menu + Active Context */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 lg:hidden transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <div className="hidden sm:block">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-slate-900 dark:text-white leading-none">
              {currentRoute.title}
            </h1>
            <span className="hidden md:inline-block w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
            <span className="hidden md:inline-block text-xs text-slate-400 dark:text-slate-500">
              {currentRoute.subtitle}
            </span>
          </div>
        </div>
      </div>

      {/* Right side: Status indicator, Theme toggle, Profile Dropdown */}
      <div className="flex items-center gap-2.5">
        {/* Live System Indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Sync</span>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="p-2 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors shadow-sm"
          title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} className="text-slate-600" />}
        </button>

        {/* User dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropOpen(v => !v)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors shadow-sm"
          >
            <div className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center text-white text-xs font-bold shadow-sm shadow-primary-500/30">
              {user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || ''}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate max-w-[120px]">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="text-[10px] text-slate-400 leading-tight">
                Member Account
              </span>
            </div>
            <ChevronDown size={14} className="text-slate-400 ml-0.5" />
          </button>

          {dropOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setDropOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#0f172a] rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 z-40 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <CheckCircle2 size={12} className="text-primary-500 flex-shrink-0" />
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5 font-mono">
                    {user?.email}
                  </p>
                </div>

                <div className="p-1 space-y-0.5">
                  <button
                    onClick={() => { setDropOpen(false); navigate('/settings') }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <User size={14} className="text-slate-400" />
                    <span>Account Profile</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
