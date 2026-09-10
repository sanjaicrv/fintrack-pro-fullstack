import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { authApi } from '../api/auth'
import toast from 'react-hot-toast'
import {
  Mail, Lock, KeyRound, ArrowRight, ArrowLeft,
  Shield, CheckCircle, XCircle, Eye, EyeOff, ShieldCheck, Sparkles, RefreshCw
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
    setValue: setValueReset,
    formState: { errors: resetErrors },
    setError: setResetError,
  } = useForm<ResetFormValues>({ mode: 'onChange' })

  const newPasswordValue = watchReset('newPassword', '')

  const pwChecks = [
    { label: 'At least 8 characters', pass: newPasswordValue.length >= 8 },
    { label: 'One uppercase letter (A-Z)', pass: /[A-Z]/.test(newPasswordValue) },
    { label: 'One lowercase letter (a-z)', pass: /[a-z]/.test(newPasswordValue) },
    { label: 'One number (0-9)', pass: /[0-9]/.test(newPasswordValue) },
    { label: 'One special character (!@#$...)', pass: /[^a-zA-Z0-9\s]/.test(newPasswordValue) },
  ]

  const onRequestOtp = async (data: ForgotFormValues) => {
    setLoading(true)
    try {
      await authApi.forgotPassword(data.email)
      setEmail(data.email)
      toast.success('6-digit OTP dispatched to your email! Please check your inbox.')
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
        otpCode: data.otpCode.trim(),
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      })
      toast.success('Password reset successfully! Please sign in with your new password.')
      navigate('/login')
    } catch (err: any) {
      const fieldErrors = err?.response?.data?.errors
      if (fieldErrors && typeof fieldErrors === 'object') {
        if (fieldErrors.newPassword) setResetError('newPassword', { message: fieldErrors.newPassword })
        if (fieldErrors.otpCode) setResetError('otpCode', { message: fieldErrors.otpCode })
        if (fieldErrors.confirmPassword) setResetError('confirmPassword', { message: fieldErrors.confirmPassword })
      }
      const msg = err?.response?.data?.message || 'Password reset failed. Please check the OTP code.'
      if (!fieldErrors?.newPassword && !fieldErrors?.confirmPassword) {
        setResetError('otpCode', { message: msg })
      }
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070b14] text-slate-100 p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background accents */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        
        {/* Back navigation */}
        <div className="mb-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-xs font-semibold transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to Sign In</span>
          </Link>
        </div>

        {/* Card wrapper */}
        <div className="relative rounded-3xl border border-slate-800 bg-[#0e1424]/90 backdrop-blur-2xl p-7 sm:p-9 shadow-2xl shadow-black/50">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-primary-500 to-transparent" />

          {step === 'REQUEST' ? (
            <div>
              <div className="mb-6 space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-[11px] font-bold uppercase tracking-wider mb-1">
                  <KeyRound size={12} />
                  <span>Security Vault</span>
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Forgot Password</h1>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Enter your registered email address. We'll issue a secure 6-digit OTP code to verify and reset your credentials.
                </p>
              </div>

              {requestErrors.email?.message && (
                <div className="mb-5 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                  {requestErrors.email.message}
                </div>
              )}

              <form onSubmit={handleRequestSubmit(onRequestOtp)} className="space-y-4" noValidate>
                {/* Email Address */}
                <div>
                  <label className="label">
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-3 text-slate-500 pointer-events-none" />
                    <input
                      type="email"
                      {...registerRequest('email', {
                        required: 'Email address is required',
                        pattern: { value: /\S+@\S+\.\S+/, message: 'Please enter a valid email address' }
                      })}
                      placeholder="e.g. name@example.com"
                      autoFocus
                      className={`input pl-10 ${
                        requestErrors.email ? 'border-rose-500/60 focus:border-rose-500' : ''
                      }`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3 justify-center text-sm mt-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Generating OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Send 6-Digit OTP</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div>
              <div className="mb-5 space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold uppercase tracking-wider mb-1">
                  <ShieldCheck size={12} />
                  <span>Verification Step</span>
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Set New Password</h1>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Enter the 6-digit OTP code for <strong className="text-white font-medium">{email}</strong> and choose your new password.
                </p>
              </div>

              {/* Security Delivery Notice */}
              <div className="mb-5 p-3.5 rounded-2xl bg-primary-500/10 border border-primary-500/30 text-xs text-slate-300 flex items-start gap-3">
                <Mail className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  A confidential 6-digit verification code was sent to <strong className="text-white">{email}</strong>. Please check your inbox (and spam folder) and enter it below.
                </p>
              </div>

              {resetErrors.otpCode?.message && (
                <div className="mb-5 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                  {resetErrors.otpCode.message}
                </div>
              )}

              <form onSubmit={handleResetSubmit(onResetPassword)} className="space-y-4" noValidate>
                {/* OTP Code */}
                <div>
                  <label className="label">
                    6-Digit OTP Code
                  </label>
                  <div className="relative">
                    <KeyRound size={15} className="absolute left-3.5 top-3 text-slate-500 pointer-events-none" />
                    <input
                      type="text"
                      maxLength={6}
                      {...registerReset('otpCode', {
                        required: 'OTP code is required',
                        pattern: { value: /^\d{6}$/, message: 'OTP must be exactly 6 digits' }
                      })}
                      placeholder="••••••"
                      autoFocus
                      className={`input pl-10 tracking-widest text-center font-mono text-base ${
                        resetErrors.otpCode ? 'border-rose-500/60 focus:border-rose-500' : ''
                      }`}
                    />
                  </div>
                  {resetErrors.otpCode?.message && resetErrors.otpCode.type === 'pattern' && (
                    <p className="mt-1 text-rose-400 text-xs">{resetErrors.otpCode.message}</p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label className="label">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-3 text-slate-500 pointer-events-none" />
                    <input
                      type={showPw ? 'text' : 'password'}
                      {...registerReset('newPassword', {
                        required: 'Password is required',
                        validate: {
                          minLength: (v) => v.length >= 8 || 'Password must be at least 8 characters',
                          uppercase: (v) => /[A-Z]/.test(v) || 'Must contain at least one uppercase letter (A-Z)',
                          lowercase: (v) => /[a-z]/.test(v) || 'Must contain at least one lowercase letter (a-z)',
                          number: (v) => /[0-9]/.test(v) || 'Must contain at least one number (0-9)',
                          special: (v) => /[^a-zA-Z0-9\s]/.test(v) || 'Must contain at least one special character (!@#$%...)',
                        },
                      })}
                      placeholder="Minimum 8 characters"
                      className={`input pl-10 pr-10 ${
                        resetErrors.newPassword ? 'border-rose-500/60 focus:border-rose-500' : ''
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-white transition-colors"
                    >
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>

                  {/* Password requirements checklist */}
                  {newPasswordValue && (
                    <div className="mt-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                      <div className="text-[11px] text-slate-400 font-medium mb-1">
                        Password Requirements
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                        {pwChecks.map((c, i) => (
                          <div key={i} className="flex items-center gap-1.5">
                            {c.pass
                              ? <CheckCircle size={11} className="text-emerald-400 flex-shrink-0" />
                              : <XCircle    size={11} className="text-slate-600 flex-shrink-0" />
                            }
                            <span className={`text-[11px] ${c.pass ? 'text-emerald-400 font-medium' : 'text-slate-500'}`}>
                              {c.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {resetErrors.newPassword && (
                    <p className="mt-1 text-rose-400 text-xs">{resetErrors.newPassword.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="label">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-3 text-slate-500 pointer-events-none" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      {...registerReset('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: val => val === newPasswordValue || 'Passwords do not match'
                      })}
                      placeholder="Re-enter new password"
                      className={`input pl-10 pr-10 ${
                        resetErrors.confirmPassword ? 'border-rose-500/60 focus:border-rose-500' : ''
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-white transition-colors"
                    >
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {resetErrors.confirmPassword && (
                    <p className="mt-1 text-rose-400 text-xs">{resetErrors.confirmPassword.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3 justify-center text-sm mt-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Resetting Password...</span>
                    </>
                  ) : (
                    <>
                      <span>Reset Password & Update Vault</span>
                      <CheckCircle size={15} />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStep('REQUEST')}
                  className="btn-secondary w-full py-2.5 justify-center text-xs mt-1"
                >
                  Request a New OTP Code
                </button>
              </form>
            </div>
          )}

        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 mt-5 text-slate-500 text-xs">
          <Shield size={13} className="text-emerald-500" />
          <span>256-Bit Encrypted Credential Reset</span>
        </div>

      </div>
    </div>
  )
}
