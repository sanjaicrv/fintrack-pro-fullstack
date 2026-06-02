import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'
import type { LoginRequest } from '../types'
import { BarChart2, Mail, Lock, Eye, EyeOff, TrendingUp, Target, ShieldCheck, Zap } from 'lucide-react'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors }, setError } = useForm<LoginRequest>()

  const onSubmit = async (data: LoginRequest) => {
    setLoading(true)
    try {
      await login(data)
      navigate('/')
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Invalid email or password'
      setError('email', { message: msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* ── Left purple panel ── */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-10 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #4f1fa2 0%, #7c3aed 50%, #6d28d9 100%)' }}
      >
        {/* Soft radial glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #a78bfa 0%, transparent 70%)' }} />
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
            <BarChart2 size={16} className="text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">
            FinTrack<sup className="text-[10px] font-semibold opacity-80 ml-0.5">PRO</sup>
          </span>
        </div>

        {/* Hero copy */}
        <div className="relative">
          <h2 className="text-4xl font-extrabold text-white leading-tight mb-3">
            Your Financial<br />
            <span className="text-violet-300">Command Center</span>
          </h2>
          <p className="text-violet-200 text-sm mb-8">Join 50,000+ users managing their money smarter with FinTrack Pro.</p>

          <ul className="space-y-3 mb-10">
            {[
              { icon: TrendingUp, text: 'Track income & expenses in real-time' },
              { icon: Target,     text: 'Set and achieve financial goals' },
              { icon: BarChart2,  text: 'Advanced analytics & insights' },
              { icon: ShieldCheck,text: 'Bank-level security & encryption' },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-violet-100">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={12} className="text-violet-200" />
                </div>
                {text}
              </li>
            ))}
          </ul>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {[
              { val: '50K+', label: 'Active Users' },
              { val: '₹10Cr+', label: 'Tracked' },
              { val: '99.9%', label: 'Uptime' },
              { val: '4.9★', label: 'Rating' },
            ].map(({ val, label }) => (
              <div key={label} className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
                <span className="text-white font-bold text-sm">{val}</span>
                <span className="text-violet-300 text-xs ml-2">{label}</span>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <p className="text-violet-200 text-xs italic border-t border-white/10 pt-4">
            "FinTrack Pro helped me save ₹2 lakhs in 6 months. The analytics are absolutely incredible."
          </p>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center text-white text-[10px] font-bold">P</div>
            <span className="text-violet-300 text-xs">Priya Sharma · Software Engineer, Bangalore</span>
          </div>
        </div>
      </div>

      {/* ── Right dark panel ── */}
      <div className="flex-1 bg-[#0d0d0d] flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <BarChart2 size={16} className="text-white" />
            </div>
            <span className="text-white font-bold text-lg">FinTrack<sup className="text-[10px]">PRO</sup></span>
          </div>

          <div className="bg-[#161616] border border-white/5 rounded-2xl p-8 shadow-2xl">
            <h1 className="text-2xl font-bold text-white mb-1">Welcome back 👋</h1>
            <p className="text-gray-400 text-sm mb-6">Sign in to your FinTrack Pro account</p>

            {/* Google SSO */}
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 bg-[#222] hover:bg-[#2a2a2a] border border-white/10 text-white text-sm font-medium py-2.5 rounded-lg transition mb-4"
            >
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-gray-500 text-xs">or continue with email</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-widest mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="email"
                    {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
                    placeholder="you@example.com"
                    autoFocus
                    className="w-full bg-[#1e1e1e] border border-white/8 text-white text-sm rounded-lg pl-9 pr-4 py-2.5 placeholder-gray-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition"
                  />
                </div>
                {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-widest">Password</label>
                  <button type="button" className="text-xs text-violet-400 hover:text-violet-300 transition">Forgot password?</button>
                </div>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    {...register('password', { required: 'Password is required' })}
                    placeholder="••••••••"
                    className="w-full bg-[#1e1e1e] border border-white/8 text-white text-sm rounded-lg pl-9 pr-10 py-2.5 placeholder-gray-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition"
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition">
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
              </div>

              {/* Remember me */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded bg-[#1e1e1e] border border-white/10 accent-violet-500" />
                <span className="text-gray-400 text-sm">Remember me for 30 days</span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white font-semibold text-sm py-3 rounded-lg transition flex items-center justify-center gap-2"
              >
                {loading ? 'Signing in…' : <>Sign In <span>→</span></>}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-5">
              Don't have an account?{' '}
              <Link to="/register" className="text-violet-400 font-medium hover:text-violet-300 transition">Create one free →</Link>
            </p>
          </div>

          <p className="text-center text-xs text-gray-600 mt-4">🔒 256-bit SSL encryption · Your data is safe</p>
        </div>
      </div>
    </div>
  )
}
