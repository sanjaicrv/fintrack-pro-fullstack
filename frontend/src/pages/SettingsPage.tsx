import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { userApi } from '../api/user'
import toast from 'react-hot-toast'
import { Sun, Moon, User, Lock, Shield } from 'lucide-react'

export default function SettingsPage() {
  const { user, updateUser } = useAuth()
  const { isDark, toggle } = useTheme()
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPw, setSavingPw] = useState(false)

  const profileForm = useForm({
    defaultValues: { firstName: user?.firstName ?? '', lastName: user?.lastName ?? '' },
  })
  const pwForm = useForm<{ currentPassword: string; newPassword: string; confirmPassword: string }>()

  const handleProfile = async (data: { firstName: string; lastName: string }) => {
    setSavingProfile(true)
    try {
      const res = await userApi.update({ ...data, theme: user?.theme ?? 'LIGHT' })
      updateUser({ firstName: res.data.data!.firstName, lastName: res.data.data!.lastName })
      toast.success('Profile updated!')
    } finally { setSavingProfile(false) }
  }

  const handlePassword = async (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    if (data.newPassword !== data.confirmPassword) {
      pwForm.setError('confirmPassword', { message: 'Passwords do not match' })
      return
    }
    setSavingPw(true)
    try {
      await userApi.changePassword(data.currentPassword, data.newPassword, data.confirmPassword)
      pwForm.reset()
      toast.success('Password changed!')
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to change password'
      pwForm.setError('currentPassword', { message: msg })
    } finally { setSavingPw(false) }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage your account preferences</p>
      </div>

      {/* Profile */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <User size={16} className="text-primary-600" />
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Profile Information</h2>
        </div>

        <div className="flex items-center gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="w-14 h-14 rounded-2xl bg-primary-600 flex items-center justify-center text-white text-xl font-bold">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">{user?.firstName} {user?.lastName}</p>
            <p className="text-sm text-gray-400">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={profileForm.handleSubmit(handleProfile)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">First Name</label>
              <input {...profileForm.register('firstName', { required: 'Required' })} className="input" />
              {profileForm.formState.errors.firstName && <p className="text-xs text-red-500 mt-1">{profileForm.formState.errors.firstName.message}</p>}
            </div>
            <div>
              <label className="label">Last Name</label>
              <input {...profileForm.register('lastName', { required: 'Required' })} className="input" />
              {profileForm.formState.errors.lastName && <p className="text-xs text-red-500 mt-1">{profileForm.formState.errors.lastName.message}</p>}
            </div>
          </div>
          <div>
            <label className="label">Email</label>
            <input value={user?.email ?? ''} disabled className="input opacity-60 cursor-not-allowed" />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>
          <button type="submit" disabled={savingProfile} className="btn-primary">
            {savingProfile ? 'Saving…' : 'Save Profile'}
          </button>
        </form>
      </div>

      {/* Theme */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          {isDark ? <Moon size={16} className="text-primary-600" /> : <Sun size={16} className="text-primary-600" />}
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Appearance</h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Currently using <span className="font-medium">{isDark ? 'Dark' : 'Light'}</span> mode
            </p>
          </div>
          <button
            onClick={toggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isDark ? 'bg-primary-600' : 'bg-gray-200'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${isDark ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>

      {/* Password */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Lock size={16} className="text-primary-600" />
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Change Password</h2>
        </div>
        <form onSubmit={pwForm.handleSubmit(handlePassword)} className="space-y-4">
          <div>
            <label className="label">Current Password</label>
            <input type="password" {...pwForm.register('currentPassword', { required: 'Required' })} className="input" placeholder="••••••••" />
            {pwForm.formState.errors.currentPassword && <p className="text-xs text-red-500 mt-1">{pwForm.formState.errors.currentPassword.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">New Password</label>
              <input type="password" {...pwForm.register('newPassword', { required: 'Required', minLength: { value: 8, message: 'Min 8 chars' } })} className="input" placeholder="••••••••" />
              {pwForm.formState.errors.newPassword && <p className="text-xs text-red-500 mt-1">{pwForm.formState.errors.newPassword.message}</p>}
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <input type="password" {...pwForm.register('confirmPassword', { required: 'Required' })} className="input" placeholder="••••••••" />
              {pwForm.formState.errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{pwForm.formState.errors.confirmPassword.message}</p>}
            </div>
          </div>
          <button type="submit" disabled={savingPw} className="btn-primary">
            {savingPw ? 'Changing…' : 'Change Password'}
          </button>
        </form>
      </div>

      {/* Account info */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <Shield size={16} className="text-primary-600" />
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Account</h2>
        </div>
        <p className="text-xs text-gray-400">User ID: <span className="font-mono text-gray-600 dark:text-gray-300">{user?.id}</span></p>
        <p className="text-xs text-gray-400 mt-1">All data is securely stored and encrypted.</p>
      </div>
    </div>
  )
}
