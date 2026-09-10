import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { userApi } from '../api/user'
import toast from 'react-hot-toast'
import { Sun, Moon, User, Lock, ShieldCheck, KeyRound, CheckCircle2, Shield } from 'lucide-react'
import StatementExportCard from '../components/Export/StatementExportCard'

export default function SettingsPage() {
  const { user, updateUser } = useAuth()
  const { isDark, toggle } = useTheme()
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPw, setSavingPw] = useState(false)

  const profileForm = useForm({
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
    },
  })

  const pwForm = useForm<{
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }>()

  const handleProfile = async (data: { firstName: string; lastName: string }) => {
    setSavingProfile(true)
    try {
      const res = await userApi.update({ ...data, theme: user?.theme ?? 'LIGHT' })
      updateUser({ firstName: res.data.data!.firstName, lastName: res.data.data!.lastName })
      toast.success('Account profile updated successfully!')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePassword = async (data: {
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }) => {
    if (data.newPassword !== data.confirmPassword) {
      pwForm.setError('confirmPassword', { message: 'New passwords do not match' })
      return
    }
    if (data.newPassword.length < 8) {
      pwForm.setError('newPassword', { message: 'Password must be at least 8 characters' })
      return
    }
    setSavingPw(true)
    try {
      await userApi.changePassword(data.currentPassword, data.newPassword, data.confirmPassword)
      pwForm.reset()
      toast.success('Security password changed successfully!')
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to change password'
      pwForm.setError('currentPassword', { message: msg })
      toast.error(msg)
    } finally {
      setSavingPw(false)
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* ── HEADER ───────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Account Settings</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your personal profile, authentication credentials, and platform appearance
        </p>
      </div>

      {/* ── PROFILE INFORMATION ──────────────────────────────────────────── */}
      <div className="card space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center">
              <User size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Profile Details</h2>
              <p className="text-xs text-slate-400">Personal identification data on FinTrack Pro</p>
            </div>
          </div>
          <span className="badge-blue font-mono text-[10px]">
            ACTIVE VAULT
          </span>
        </div>

        {/* User Avatar Banner */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60">
          <div className="w-14 h-14 rounded-2xl bg-primary-600 flex items-center justify-center text-white text-xl font-extrabold shadow-md shadow-primary-500/20 flex-shrink-0">
            {user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || ''}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-bold text-slate-900 dark:text-white text-base truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 font-mono">
              {user?.email}
            </p>
          </div>
        </div>

        <form onSubmit={profileForm.handleSubmit(handleProfile)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">First Name</label>
              <input
                {...profileForm.register('firstName', { required: 'First name is required' })}
                placeholder="First name"
                className="input"
              />
              {profileForm.formState.errors.firstName && (
                <p className="text-xs text-rose-500 mt-1">{profileForm.formState.errors.firstName.message}</p>
              )}
            </div>
            <div>
              <label className="label">Last Name</label>
              <input
                {...profileForm.register('lastName', { required: 'Last name is required' })}
                placeholder="Last name"
                className="input"
              />
              {profileForm.formState.errors.lastName && (
                <p className="text-xs text-rose-500 mt-1">{profileForm.formState.errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="label">Registered Email Address</label>
            <input
              value={user?.email ?? ''}
              disabled
              className="input bg-slate-100 dark:bg-slate-800/60 text-slate-500 cursor-not-allowed border-dashed"
            />
            <p className="hint">Primary authentication identifier cannot be changed directly.</p>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={savingProfile} className="btn-primary">
              {savingProfile ? 'Saving Changes...' : 'Save Profile Details'}
            </button>
          </div>
        </form>
      </div>

      {/* ── THEME & APPEARANCE ───────────────────────────────────────────── */}
      <div className="card">
        <div className="flex items-center gap-2.5 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            {isDark ? <Moon size={16} /> : <Sun size={16} />}
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Appearance & Theme</h2>
            <p className="text-xs text-slate-400">Choose between light interface and high-contrast dark mode</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60">
          <div>
            <span className="text-sm font-bold text-slate-900 dark:text-white block">
              {isDark ? 'Dark Interface Active' : 'Light Interface Active'}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
              {isDark
                ? 'Optimized for high-contrast viewing and low-light environments'
                : 'Clean high-readability daylight workspace'}
            </span>
          </div>

          <button
            type="button"
            onClick={toggle}
            className="btn-secondary self-start sm:self-auto flex items-center gap-2"
          >
            {isDark ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-slate-600" />}
            <span>Switch to {isDark ? 'Light' : 'Dark'} Mode</span>
          </button>
        </div>
      </div>

      {/* ── DATA EXPORT & STATEMENTS ─────────────────────────────────────── */}
      <StatementExportCard />

      {/* ── SECURITY & PASSWORD ─────────────────────────────────────────── */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <KeyRound size={16} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Security & Password</h2>
            <p className="text-xs text-slate-400">Update your account authentication credentials</p>
          </div>
        </div>

        <form onSubmit={pwForm.handleSubmit(handlePassword)} className="space-y-4">
          <div>
            <label className="label">Current Password</label>
            <input
              type="password"
              {...pwForm.register('currentPassword', { required: 'Current password is required' })}
              placeholder="Enter current password"
              className="input"
            />
            {pwForm.formState.errors.currentPassword && (
              <p className="text-xs text-rose-500 mt-1">{pwForm.formState.errors.currentPassword.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">New Password</label>
              <input
                type="password"
                {...pwForm.register('newPassword', {
                  required: 'New password is required',
                  minLength: { value: 8, message: 'Minimum 8 characters' }
                })}
                placeholder="At least 8 characters"
                className="input"
              />
              {pwForm.formState.errors.newPassword && (
                <p className="text-xs text-rose-500 mt-1">{pwForm.formState.errors.newPassword.message}</p>
              )}
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input
                type="password"
                {...pwForm.register('confirmPassword', { required: 'Please confirm password' })}
                placeholder="Repeat new password"
                className="input"
              />
              {pwForm.formState.errors.confirmPassword && (
                <p className="text-xs text-rose-500 mt-1">{pwForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={savingPw} className="btn-primary">
              {savingPw ? 'Updating Password...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      {/* ── SECURITY COMPLIANCE FOOTER ───────────────────────────────────── */}
      <div className="p-4 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            Enterprise Security Standards
          </p>
          <p className="leading-relaxed text-[11px]">
            Your session is secured via stateless JSON Web Tokens (JWT) signed with HMAC-SHA256. Passwords are salted and hashed using BCrypt prior to database persistence.
          </p>
        </div>
      </div>
    </div>
  )
}
