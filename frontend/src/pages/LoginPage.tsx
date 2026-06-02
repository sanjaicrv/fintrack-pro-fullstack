import { useState } from "react";
import {
  Eye, EyeOff, Mail, Lock, ArrowRight, TrendingUp,
  Shield, Target, BarChart3, Zap, CheckCircle
} from "lucide-react";

// Google Icon SVG
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

// Left panel benefits
const benefits = [
  { icon: TrendingUp, text: "Track income & expenses in real-time" },
  { icon: Target, text: "Set and achieve financial goals" },
  { icon: BarChart3, text: "Advanced analytics & insights" },
  { icon: Shield, text: "Bank-level security & encryption" },
];

// Animated stat badge
function StatBadge({ value, label, delay }: { value: string; label: string; delay: string }) {
  return (
    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/20"
      style={{ animation: `fadeInUp 0.6s ease forwards`, animationDelay: delay, opacity: 0 }}>
      <div className="text-white font-black text-lg">{value}</div>
      <div className="text-violet-200 text-xs leading-tight">{label}</div>
    </div>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    // Simulate API call — replace with your actual auth logic
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    // navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex bg-[#050510]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800;900&display=swap');
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
        .animate-float { animation: float 4s ease-in-out infinite; }
      `}</style>

      {/* ── Left Panel ──────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 relative overflow-hidden p-12">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* Orbs */}
        <div className="absolute top-[-20%] right-[-10%] w-96 h-96 rounded-full bg-violet-500/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-80 h-80 rounded-full bg-indigo-600/20 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

        {/* Content */}
        <div className="relative z-10">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors duration-300" />
              <div className="absolute inset-0 flex items-center justify-center">
                <BarChart3 size={20} className="text-white" />
              </div>
            </div>
            <span className="text-white font-black text-2xl tracking-tight">
              Fin<span className="text-violet-300">Track</span>
              <span className="text-xs align-super text-violet-200 font-semibold ml-0.5">PRO</span>
            </span>
          </a>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center">
          {/* Headline */}
          <div className="mb-10">
            <h2 className="text-4xl font-black text-white leading-tight mb-4">
              Your Financial
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-indigo-300">
                Command Center
              </span>
            </h2>
            <p className="text-violet-200/70 text-base leading-relaxed">
              Join 50,000+ users managing their money smarter with FinTrack Pro.
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-3 mb-10">
            {benefits.map((b, i) => (
              <div key={i} className="flex items-center gap-3"
                style={{ animation: `fadeInUp 0.5s ease forwards`, animationDelay: `${i * 0.1 + 0.2}s`, opacity: 0 }}>
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <b.icon size={15} className="text-violet-300" />
                </div>
                <span className="text-violet-100/80 text-sm">{b.text}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <StatBadge value="50K+" label="Active Users" delay="0.6s" />
            <StatBadge value="₹10Cr+" label="Tracked" delay="0.7s" />
            <StatBadge value="99.9%" label="Uptime" delay="0.8s" />
            <StatBadge value="4.9★" label="Rating" delay="0.9s" />
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10 border-t border-white/10 pt-6">
          <p className="text-violet-200/60 text-xs italic leading-relaxed">
            "FinTrack Pro helped me save ₹2 lakhs in 6 months. The analytics are absolutely incredible."
          </p>
          <div className="flex items-center gap-2 mt-3">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-400 to-indigo-400 flex items-center justify-center text-white text-xs font-bold">P</div>
            <span className="text-violet-300/70 text-xs">Priya Sharma · Software Engineer, Bangalore</span>
          </div>
        </div>
      </div>

      {/* ── Right Panel ─────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">

          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="relative w-9 h-9">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl" />
              <div className="absolute inset-0 flex items-center justify-center">
                <BarChart3 size={18} className="text-white" />
              </div>
            </div>
            <span className="text-white font-black text-xl">Fin<span className="text-violet-400">Track</span><span className="text-xs align-super text-violet-300 ml-0.5">PRO</span></span>
          </div>

          {/* Card */}
          <div className="relative rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 shadow-2xl">
            {/* Top accent */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-violet-500 to-transparent" />

            <div className="mb-8">
              <h1 className="text-2xl font-black text-white mb-2">Welcome back 👋</h1>
              <p className="text-gray-500 text-sm">Sign in to your FinTrack Pro account</p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Google Button */}
            <button className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white text-sm font-medium transition-all duration-300 mb-5 group">
              <GoogleIcon />
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-gray-600 text-xs">or continue with email</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Form */}
            <div className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-gray-400 text-xs font-medium mb-2 uppercase tracking-wider">Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-white/5 border border-white/10 focus:border-violet-500/60 focus:bg-white/[0.07] text-white placeholder-gray-600 rounded-xl pl-11 pr-4 py-3.5 text-sm outline-none transition-all duration-300"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-gray-400 text-xs font-medium uppercase tracking-wider">Password</label>
                  <a href="/forgot-password" className="text-violet-400 hover:text-violet-300 text-xs transition-colors">Forgot password?</a>
                </div>
                <div className="relative">
                  <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 focus:border-violet-500/60 focus:bg-white/[0.07] text-white placeholder-gray-600 rounded-xl pl-11 pr-12 py-3.5 text-sm outline-none transition-all duration-300"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setRemember(!remember)}
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-200 ${remember ? "bg-violet-600 border-violet-600" : "border-white/20 hover:border-violet-500/50"}`}
                >
                  {remember && <CheckCircle size={12} className="text-white" />}
                </button>
                <span className="text-gray-500 text-sm">Remember me for 30 days</span>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full relative py-3.5 rounded-xl font-bold text-white text-sm overflow-hidden group mt-2 disabled:opacity-70"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 group-hover:from-violet-500 group-hover:to-indigo-500 transition-all duration-300" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
                <span className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    <>Sign In <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" /></>
                  )}
                </span>
              </button>
            </div>

            {/* Register Link */}
            <p className="text-center text-gray-600 text-sm mt-6">
              Don't have an account?{" "}
              <a href="/register" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
                Create one free →
              </a>
            </p>
          </div>

          {/* Security note */}
          <div className="flex items-center justify-center gap-2 mt-5 text-gray-600 text-xs">
            <Shield size={12} />
            <span>256-bit SSL encryption · Your data is safe</span>
          </div>
        </div>
      </div>
    </div>
  );
}
