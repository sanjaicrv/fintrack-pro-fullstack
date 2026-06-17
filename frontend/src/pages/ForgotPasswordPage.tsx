import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { authApi } from '../api/auth'
import toast from 'react-hot-toast'
import {
  Mail, Lock, KeyRound, ArrowRight, ArrowLeft,
  Shield, CheckCircle, XCircle
} from 'lucide-react'

interface ForgotFormValues {
  email: string
}

interface ResetFormValues {
  otpCode: string
  newPassword: string
  confirmPassword: string
}

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<'REQUEST' | 'RESET'>('REQUEST')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register: registerRequest,
    handleSubmit: handleRequestSubmit,
    formState: { errors: requestErrors },
    setError: setRequestError,
  } = useForm<ForgotFormValues>()

  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    watch: watchReset,
    formState: { errors: resetErrors },
    setError: setResetError,
  } = useForm<ResetFormValues>()

  const newPasswordValue = watchReset('newPassword', '')

  const onRequestOtp = async (data: ForgotFormValues) => {
    setLoading(true)
    try {
      await authApi.forgotPassword(data.email)
      setEmail(data.email)
      toast.success('6-digit OTP sent to your email!')
      setStep('RESET')
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to send OTP. Please check the email address.'
      setRequestError('email', { message: msg })
    } finally {
      setLoading(false)
    }
  }

  const onResetPassword = async (data: ResetFormValues) => {
    setLoading(true)
    try {
      await authApi.resetPassword({
        email,
        otpCode: data.otpCode,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      })
      toast.success('Password reset successfully! Please sign in.')
      navigate('/login')
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Password reset failed. Please check the OTP code.'
      setResetError('otpCode', { message: msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050510] p-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800;900&display=swap');
      `}</style>

      {/* Decorative background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 via-purple-900/10 to-indigo-900/20 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-violet-500/5 blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-indigo-500/5 blur-3xl animate-pulse pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        
        {/* Logo or back navigation */}
        <div className="mb-6">
          <Link to="/login" className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 text-sm font-semibold transition-colors">
            <ArrowLeft size={16} />
            Back to Sign In
          </Link>
        </div>

        {/* Card wrapper */}
        <div className="relative rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 shadow-2xl">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-violet-500 to-transparent" />

          {step === 'REQUEST' ? (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-black text-white mb-2">Forgot Password? 🔒</h1>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Enter your email address and we'll send you a 6-digit OTP code to reset your password.
                </p>
              </div>

              {requestErrors.email?.message && (
                <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {requestErrors.email.message}
                </div>
              )}

              <form onSubmit={handleRequestSubmit(onRequestOtp)} className="space-y-4" noValidate>
                {/* Email Address */}
                <div>
                  <label className="block text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    <input
                      type="email"
                      {...registerRequest('email', {
                        required: 'Email is required',
                        pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email address' }
                      })}
                      placeholder="you@example.com"
                      autoFocus
                      className={`w-full bg-white/5 border text-white placeholder-gray-600 rounded-xl pl-11 pr-4 py-3.5 text-sm outline-none transition-all duration-300 ${
                        requestErrors.email
                          ? 'border-red-500/50 focus:border-red-500/70'
                          : 'border-white/10 focus:border-violet-500/60 focus:bg-white/[0.07]'
                      }`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full relative py-3.5 rounded-xl font-bold text-white text-sm overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 group-hover:from-violet-500 group-hover:to-indigo-500 transition-all duration-300" />
                  <span className="relative flex items-center justify-center gap-2">
                    {loading ? 'Sending OTP…' : 'Send OTP Code'}
                    {!loading && <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />}
                  </span>
                </button>
              </form>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-black text-white mb-2">Reset Password 🔑</h1>
                <p className="text-gray-400 text-sm leading-relaxed">
                  We sent a 6-digit OTP code to <strong className="text-violet-300">{email}</strong>. Enter the OTP code and set your new password.
                </p>
              </div>

              {resetErrors.otpCode?.message && (
                <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {resetErrors.otpCode.message}
                </div>
              )}

              <form onSubmit={handleResetSubmit(onResetPassword)} className="space-y-4" noValidate>
                {/* OTP Code */}
                <div>
                  <label className="block text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">
                    6-Digit OTP Code
                  </label>
                  <div className="relative">
                    <KeyRound size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    <input
                      type="text"
                      maxLength={6}
                      {...registerReset('otpCode', {
                        required: 'OTP code is required',
                        pattern: { value: /^\d{6}$/, message: 'OTP must be exactly 6 digits' }
                      })}
                      placeholder="000000"
                      autoFocus
                      className={`w-full bg-white/5 border text-white placeholder-gray-600 rounded-xl pl-11 pr-4 py-3.5 text-sm outline-none tracking-widest text-center transition-all duration-300 ${
                        resetErrors.otpCode
                          ? 'border-red-500/50 focus:border-red-500/70'
                          : 'border-white/10 focus:border-violet-500/60 focus:bg-white/[0.07]'
                      }`}
                    />
                  </div>
                  {resetErrors.otpCode?.message && resetErrors.otpCode.type === 'pattern' && (
                    <p className="mt-1.5 text-red-400 text-xs">{resetErrors.otpCode.message}</p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    <input
                      type={showPw ? 'text' : 'password'}
                      {...registerReset('newPassword', {
                        required: 'Password is required',
                        minLength: { value: 8, message: 'Password must be at least 8 characters' }
                      })}
                      placeholder="••••••••"
                      className={`w-full bg-white/5 border text-white placeholder-gray-600 rounded-xl pl-11 pr-4 py-3.5 text-sm outline-none transition-all duration-300 ${
                        resetErrors.newPassword
                          ? 'border-red-500/50 focus:border-red-500/70'
                          : 'border-white/10 focus:border-violet-500/60 focus:bg-white/[0.07]'
                      }`}
                    />
                  </div>
                  {resetErrors.newPassword && (
                    <p className="mt-1.5 text-red-400 text-xs">{resetErrors.newPassword.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      {...registerReset('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: val => val === newPasswordValue || 'Passwords do not match'
                      })}
                      placeholder="••••••••"
                      className={`w-full bg-white/5 border text-white placeholder-gray-600 rounded-xl pl-11 pr-4 py-3.5 text-sm outline-none transition-all duration-300 ${
                        resetErrors.confirmPassword
                          ? 'border-red-500/50 focus:border-red-500/70'
                          : 'border-white/10 focus:border-violet-500/60 focus:bg-white/[0.07]'
                      }`}
                    />
                  </div>
                  {resetErrors.confirmPassword && (
                    <p className="mt-1.5 text-red-400 text-xs">{resetErrors.confirmPassword.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full relative py-3.5 rounded-xl font-bold text-white text-sm overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 group-hover:from-violet-500 group-hover:to-indigo-500 transition-all duration-300" />
                  <span className="relative flex items-center justify-center gap-2">
                    {loading ? 'Resetting Password…' : 'Reset Password'}
                    {!loading && <CheckCircle size={15} />}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep('REQUEST')}
                  className="w-full py-3.5 rounded-xl border border-white/10 bg-transparent hover:bg-white/5 text-gray-300 text-sm font-medium transition-all duration-300 mt-2"
                >
                  Request New OTP Code
                </button>
              </form>
            </div>
          )}

        </div>

        {/* Support details */}
        <div className="flex items-center justify-center gap-2 mt-5 text-gray-600 text-xs">
          <Shield size={12} />
          <span>Secure password reset process</span>
        </div>

      </div>
    </div>
  )
}
