import { useState, useEffect } from "react";
import {
  Eye, EyeOff, Mail, Lock, User, ArrowRight,
  Shield, BarChart3, CheckCircle, XCircle, Check
} from "lucide-react";

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

// Password strength logic
function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  if (pw.length >= 12) score++;

  if (score <= 1) return { score, label: "Weak", color: "bg-red-500" };
  if (score <= 2) return { score, label: "Fair", color: "bg-orange-400" };
  if (score <= 3) return { score, label: "Good", color: "bg-yellow-400" };
  if (score <= 4) return { score, label: "Strong", color: "bg-emerald-400" };
  return { score, label: "Excellent", color: "bg-violet-400" };
}

// Input field component
function FormInput({
  icon: Icon, label, type, value, onChange, placeholder, error, success, extra
}: {
  icon: any; label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder: string;
  error?: string; success?: boolean; extra?: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-gray-400 text-xs font-medium uppercase tracking-wider">{label}</label>
        {extra}
      </div>
      <div className="relative">
        <Icon size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 z-10" />
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-white/5 border text-white placeholder-gray-600 rounded-xl pl-11 pr-10 py-3.5 text-sm outline-none transition-all duration-300 ${
            error ? "border-red-500/50 focus:border-red-500/70" :
            success && value ? "border-emerald-500/50 focus:border-emerald-500/70" :
            "border-white/10 focus:border-violet-500/60 focus:bg-white/[0.07]"
          }`}
        />
        {value && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {error
              ? <XCircle size={15} className="text-red-400" />
              : success
              ? <CheckCircle size={15} className="text-emerald-400" />
              : null
            }
          </div>
        )}
      </div>
      {error && <p className="mt-1.5 text-red-400 text-xs">{error}</p>}
    </div>
  );
}

export default function RegisterPage() {
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "", confirmPassword: ""
  });
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const strength = getPasswordStrength(form.password);

  const validate = (field: string, value: string) => {
    const errs: Record<string, string> = { ...errors };
    switch (field) {
      case "firstName":
        errs.firstName = value.trim().length < 2 ? "At least 2 characters required" : "";
        break;
      case "lastName":
        errs.lastName = value.trim().length < 2 ? "At least 2 characters required" : "";
        break;
      case "email":
        errs.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "" : "Enter a valid email address";
        break;
      case "password":
        errs.password = value.length < 8 ? "At least 8 characters required" : "";
        if (form.confirmPassword) {
          errs.confirmPassword = form.confirmPassword !== value ? "Passwords do not match" : "";
        }
        break;
      case "confirmPassword":
        errs.confirmPassword = value !== form.password ? "Passwords do not match" : "";
        break;
    }
    setErrors(errs);
  };

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (touched[field]) validate(field, value);
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validate(field, form[field as keyof typeof form]);
  };

  const handleSubmit = async () => {
    // Touch all fields
    const allFields = ["firstName", "lastName", "email", "password", "confirmPassword"];
    const newTouched: Record<string, boolean> = {};
    allFields.forEach(f => { newTouched[f] = true; validate(f, form[f as keyof typeof form]); });
    setTouched(newTouched);
    if (!terms) { alert("Please accept the terms and conditions."); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1800));
    setLoading(false);
    // navigate("/dashboard");
  };

  const isValid = (field: string) => touched[field] && !errors[field] && form[field as keyof typeof form];
  const hasError = (field: string) => touched[field] && !!errors[field];

  const pwChecks = [
    { label: "At least 8 characters", pass: form.password.length >= 8 },
    { label: "One uppercase letter", pass: /[A-Z]/.test(form.password) },
    { label: "One number", pass: /[0-9]/.test(form.password) },
    { label: "One special character", pass: /[^a-zA-Z0-9]/.test(form.password) },
  ];

  return (
    <div className="min-h-screen flex bg-[#050510]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800;900&display=swap');
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* ── Left Panel ──────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] relative overflow-hidden p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-violet-900 to-purple-900" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute top-[-20%] right-[-10%] w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-80 h-80 rounded-full bg-violet-600/20 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

        {/* Logo */}
        <div className="relative z-10">
          <a href="/" className="flex items-center gap-2.5">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 bg-white/20 rounded-xl" />
              <div className="absolute inset-0 flex items-center justify-center">
                <BarChart3 size={20} className="text-white" />
              </div>
            </div>
            <span className="text-white font-black text-2xl tracking-tight">
              Fin<span className="text-indigo-300">Track</span>
              <span className="text-xs align-super text-indigo-200 font-semibold ml-0.5">PRO</span>
            </span>
          </a>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <h2 className="text-4xl font-black text-white leading-tight mb-4">
            Start Your
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-violet-300">
              Financial Journey
            </span>
          </h2>
          <p className="text-indigo-200/70 text-base mb-10 leading-relaxed">
            Join thousands of smart savers and investors. Free forever — upgrade when you're ready.
          </p>

          {/* Feature checklist */}
          <div className="space-y-3">
            {[
              "Free plan — no credit card required",
              "Set up in under 2 minutes",
              "Unlimited transactions on Pro",
              "Smart AI-powered insights",
              "Secure & private by design",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3"
                style={{ animation: `fadeInUp 0.5s ease forwards`, animationDelay: `${i * 0.1 + 0.2}s`, opacity: 0 }}>
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                  <Check size={11} className="text-emerald-400" />
                </div>
                <span className="text-indigo-100/80 text-sm">{item}</span>
              </div>
            ))}
          </div>  

          {/* Visual card preview */}
          <div className="mt-10 rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-indigo-400 flex items-center justify-center text-white text-xs font-bold">S</div>
              <div>
                <div className="text-white text-sm font-semibold">Sanjai's Dashboard</div>
                <div className="text-indigo-300/60 text-xs">Savings Rate: 99.9%</div>
              </div>
              <div className="ml-auto text-emerald-400 text-sm font-bold">+₹10.29L</div>
            </div>
            <div className="space-y-2">
              {[
                { label: "Income", val: 100, color: "bg-violet-500" },
                { label: "Savings", val: 99, color: "bg-emerald-500" },
                { label: "Expenses", val: 1, color: "bg-red-500" },
              ].map(bar => (
                <div key={bar.label} className="flex items-center gap-3">
                  <span className="text-indigo-300/60 text-xs w-14">{bar.label}</span>
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full ${bar.color} rounded-full`} style={{ width: `${bar.val}%` }} />
                  </div>
                  <span className="text-indigo-300/60 text-xs w-6 text-right">{bar.val}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 text-indigo-300/40 text-xs">
          © 2026 FinTrack Pro · Made with ♥ in India
        </div>
      </div>

      {/* ── Right Panel ─────────────────────────────────────────── */}
      <div className="flex-1 flex items-start justify-center p-6 lg:p-10 overflow-y-auto">
        <div className="w-full max-w-md py-8">

          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
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
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

            <div className="mb-7">
              <h1 className="text-2xl font-black text-white mb-2">Create your account 🚀</h1>
              <p className="text-gray-500 text-sm">Start tracking your finances today. Free forever.</p>
            </div>

            {/* Google */}
            <button className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white text-sm font-medium transition-all duration-300 mb-5">
              <GoogleIcon />
              Sign up with Google
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-gray-600 text-xs">or with email</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <div className="space-y-4">
              {/* Name row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">First Name</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      value={form.firstName}
                      onChange={e => handleChange("firstName", e.target.value)}
                      onBlur={() => handleBlur("firstName")}
                      placeholder="John"
                      className={`w-full bg-white/5 border text-white placeholder-gray-600 rounded-xl pl-9 pr-3 py-3 text-sm outline-none transition-all duration-300 ${
                        hasError("firstName") ? "border-red-500/50" : isValid("firstName") ? "border-emerald-500/40" : "border-white/10 focus:border-violet-500/60"
                      }`}
                    />
                  </div>
                  {hasError("firstName") && <p className="mt-1 text-red-400 text-xs">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">Last Name</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      value={form.lastName}
                      onChange={e => handleChange("lastName", e.target.value)}
                      onBlur={() => handleBlur("lastName")}
                      placeholder="Doe"
                      className={`w-full bg-white/5 border text-white placeholder-gray-600 rounded-xl pl-9 pr-3 py-3 text-sm outline-none transition-all duration-300 ${
                        hasError("lastName") ? "border-red-500/50" : isValid("lastName") ? "border-emerald-500/40" : "border-white/10 focus:border-violet-500/60"
                      }`}
                    />
                  </div>
                  {hasError("lastName") && <p className="mt-1 text-red-400 text-xs">{errors.lastName}</p>}
                </div>
              </div>

              {/* Email */}
              <FormInput
                icon={Mail} label="Email" type="email"
                value={form.email} onChange={v => handleChange("email", v)}
                placeholder="you@example.com"
                error={hasError("email") ? errors.email : ""}
                success={!!isValid("email")}
              />
              {/* onBlur hack for FormInput */}
              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-gray-400 text-xs font-medium uppercase tracking-wider">Password</label>
                  {form.password && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      strength.score <= 1 ? "bg-red-500/10 text-red-400" :
                      strength.score <= 2 ? "bg-orange-500/10 text-orange-400" :
                      strength.score <= 3 ? "bg-yellow-500/10 text-yellow-400" :
                      strength.score <= 4 ? "bg-emerald-500/10 text-emerald-400" :
                      "bg-violet-500/10 text-violet-400"
                    }`}>
                      {strength.label}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type={showPw ? "text" : "password"}
                    value={form.password}
                    onChange={e => handleChange("password", e.target.value)}
                    onBlur={() => handleBlur("password")}
                    placeholder="••••••••"
                    className={`w-full bg-white/5 border text-white placeholder-gray-600 rounded-xl pl-11 pr-12 py-3.5 text-sm outline-none transition-all duration-300 ${
                      hasError("password") ? "border-red-500/50" : isValid("password") ? "border-emerald-500/40" : "border-white/10 focus:border-violet-500/60"
                    }`}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                {/* Strength Bar */}
                {form.password && (
                  <div className="mt-2 space-y-2">
                    <div className="flex gap-1 h-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className={`flex-1 rounded-full transition-all duration-300 ${
                          i <= strength.score ? strength.color : "bg-white/10"
                        }`} />
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {pwChecks.map((c, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          {c.pass
                            ? <CheckCircle size={11} className="text-emerald-400 flex-shrink-0" />
                            : <XCircle size={11} className="text-gray-600 flex-shrink-0" />
                          }
                          <span className={`text-xs ${c.pass ? "text-emerald-400/80" : "text-gray-600"}`}>{c.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {hasError("password") && <p className="mt-1 text-red-400 text-xs">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={e => handleChange("confirmPassword", e.target.value)}
                    onBlur={() => handleBlur("confirmPassword")}
                    placeholder="••••••••"
                    className={`w-full bg-white/5 border text-white placeholder-gray-600 rounded-xl pl-11 pr-12 py-3.5 text-sm outline-none transition-all duration-300 ${
                      hasError("confirmPassword") ? "border-red-500/50" : isValid("confirmPassword") ? "border-emerald-500/40" : "border-white/10 focus:border-violet-500/60"
                    }`}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {hasError("confirmPassword") && <p className="mt-1 text-red-400 text-xs">{errors.confirmPassword}</p>}
                {isValid("confirmPassword") && form.confirmPassword && (
                  <p className="mt-1 text-emerald-400 text-xs flex items-center gap-1"><CheckCircle size={11} /> Passwords match!</p>
                )}
              </div>

              {/* Terms */}
              <div className="flex items-start gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setTerms(!terms)}
                  className={`w-5 h-5 mt-0.5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                    terms ? "bg-violet-600 border-violet-600" : "border-white/20 hover:border-violet-500/50"
                  }`}
                >
                  {terms && <Check size={11} className="text-white" />}
                </button>
                <p className="text-gray-500 text-sm leading-relaxed">
                  I agree to the{" "}
                  <a href="#" className="text-violet-400 hover:text-violet-300 transition-colors">Terms of Service</a>
                  {" "}and{" "}
                  <a href="#" className="text-violet-400 hover:text-violet-300 transition-colors">Privacy Policy</a>
                </p>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full relative py-3.5 rounded-xl font-bold text-white text-sm overflow-hidden group mt-2 disabled:opacity-70"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 group-hover:from-indigo-500 group-hover:to-violet-500 transition-all duration-300" />
                <span className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Creating account...
                    </>
                  ) : (
                    <>Create Account <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" /></>
                  )}
                </span>
              </button>
            </div>

            <p className="text-center text-gray-600 text-sm mt-6">
              Already have an account?{" "}
              <a href="/login" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
                Sign in →
              </a>
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 mt-5 text-gray-600 text-xs">
            <Shield size={12} />
            <span>256-bit SSL encryption · GDPR compliant · Your data is safe</span>
          </div>
        </div>
      </div>
    </div>
  );
}
