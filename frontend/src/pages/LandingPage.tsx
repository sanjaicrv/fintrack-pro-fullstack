import { useState, useEffect, useRef } from "react";
import {
  TrendingUp, Shield, Target, BarChart3, Wallet, Cloud,
  ChevronDown, ChevronUp, Star, Menu, X, ArrowRight,
  Play, Check, Twitter, Github, Linkedin, Instagram,
  Zap, Users, Activity, Award, DollarSign, PieChart,
  Lock, Globe, Smartphone, Bell
} from "lucide-react";

// ─── Animated Counter ──────────────────────────────────────────────────────
function useCounter(end: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, start]);
  return count;
}

// ─── Floating Orb Background ───────────────────────────────────────────────
function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-violet-600/20 blur-[120px] animate-pulse" />
      <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-indigo-500/15 blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="absolute bottom-[10%] left-[20%] w-[350px] h-[350px] rounded-full bg-purple-700/20 blur-[90px] animate-pulse" style={{ animationDelay: "2s" }} />
    </div>
  );
}

// ─── Navbar ────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = ["Home", "Features", "Pricing", "Testimonials", "Contact"];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-[#0a0a1a]/90 backdrop-blur-xl border-b border-violet-500/10 shadow-lg shadow-violet-900/10" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="relative w-9 h-9">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl rotate-3 group-hover:rotate-6 transition-transform duration-300" />
            <div className="absolute inset-0 flex items-center justify-center">
              <BarChart3 size={18} className="text-white" />
            </div>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">
            Fin<span className="text-violet-400">Track</span>
            <span className="text-xs align-super text-violet-300 font-semibold ml-0.5">PRO</span>
          </span>
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map(link => (
            <a key={link} href={`#${link.toLowerCase()}`}
              className="text-gray-400 hover:text-white text-sm font-medium transition-colors duration-200 relative group">
              {link}
              <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-violet-400 group-hover:w-full transition-all duration-300 rounded-full" />
            </a>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <a href="/login" className="text-gray-300 hover:text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/5 transition-all duration-200">
            Login
          </a>
          <a href="/register" className="group relative px-5 py-2.5 text-sm font-semibold text-white rounded-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 transition-all duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative flex items-center gap-1.5">Get Started <ArrowRight size={14} /></span>
          </a>
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-gray-400 hover:text-white p-2">
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0d0d20]/95 backdrop-blur-xl border-t border-violet-500/10 px-6 py-4 flex flex-col gap-4">
          {links.map(link => (
            <a key={link} href={`#${link.toLowerCase()}`} onClick={() => setMobileOpen(false)}
              className="text-gray-300 hover:text-white text-sm font-medium py-2 border-b border-white/5">
              {link}
            </a>
          ))}
          <div className="flex gap-3 pt-2">
            <a href="/login" className="flex-1 text-center py-2.5 text-sm text-gray-300 border border-violet-500/30 rounded-xl hover:border-violet-400/60 transition-colors">Login</a>
            <a href="/register" className="flex-1 text-center py-2.5 text-sm text-white bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl font-semibold">Get Started</a>
          </div>
        </div>
      )}
    </nav>
  );
}

// ─── Hero ──────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-[#050510]">
      <FloatingOrbs />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="relative max-w-7xl mx-auto px-6 py-24 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-semibold mb-8 backdrop-blur-sm">
          <Zap size={11} className="fill-current" />
          Trusted by 50,000+ Users Worldwide
          <Zap size={11} className="fill-current" />
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.95] tracking-tight mb-6">
          Take Control of Your
          <br />
          <span className="relative">
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Financial Future
            </span>
            <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 400 12" fill="none">
              <path d="M0 6 Q100 0 200 6 Q300 12 400 6" stroke="url(#grad)" strokeWidth="2" fill="none" strokeLinecap="round"/>
              <defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#8b5cf6"/><stop offset="100%" stopColor="#6366f1"/></linearGradient></defs>
            </svg>
          </span>
        </h1>

        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
          FinTrack Pro gives you intelligent insights, real-time tracking, and powerful analytics to master your money — all in one beautiful dashboard.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <a href="/register" className="group relative px-8 py-4 text-base font-bold text-white rounded-2xl overflow-hidden shadow-2xl shadow-violet-900/50 hover:shadow-violet-800/60 transition-shadow duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600" />
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative flex items-center gap-2">Get Started Free <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></span>
          </a>
          <button className="group flex items-center gap-3 px-8 py-4 text-base font-semibold text-gray-300 hover:text-white border border-white/10 hover:border-violet-500/40 rounded-2xl bg-white/5 hover:bg-white/10 backdrop-blur-sm transition-all duration-300">
            <div className="w-9 h-9 rounded-full bg-white/10 group-hover:bg-violet-500/20 flex items-center justify-center transition-colors duration-300">
              <Play size={14} className="fill-current ml-0.5" />
            </div>
            Watch Demo
          </button>
        </div>

        {/* Dashboard Mockup */}
        <div className="relative max-w-5xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-900/5 to-[#050510] z-10 pointer-events-none rounded-3xl" />
          <div className="relative rounded-3xl border border-violet-500/20 bg-gradient-to-b from-[#0d0d25] to-[#080818] p-1 shadow-2xl shadow-violet-900/30">
            {/* Browser Bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
              </div>
              <div className="flex-1 mx-4 bg-white/5 rounded-lg px-3 py-1 text-xs text-gray-500 text-left">
                fintrack-pro.app/dashboard
              </div>
            </div>
            {/* Mock Dashboard */}
            <div className="p-6 space-y-4">
              {/* Stats row */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Total Income", value: "₹10,30,000", color: "text-emerald-400", bg: "bg-emerald-500/10", icon: TrendingUp },
                  { label: "Total Expenses", value: "₹1,000", color: "text-red-400", bg: "bg-red-500/10", icon: Wallet },
                  { label: "Net Savings", value: "₹10,29,000", color: "text-violet-400", bg: "bg-violet-500/10", icon: Target },
                  { label: "Savings Rate", value: "99.9%", color: "text-blue-400", bg: "bg-blue-500/10", icon: BarChart3 },
                ].map((stat) => (
                  <div key={stat.label} className={`${stat.bg} border border-white/5 rounded-xl p-3`}>
                    <p className="text-gray-500 text-xs mb-1">{stat.label}</p>
                    <p className={`${stat.color} font-bold text-sm`}>{stat.value}</p>
                  </div>
                ))}
              </div>
              {/* Chart area */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 bg-white/[0.02] border border-white/5 rounded-xl p-4 h-36">
                  <p className="text-gray-500 text-xs mb-3">Monthly Overview</p>
                  <div className="flex items-end gap-2 h-20">
                    {[20, 45, 30, 65, 50, 80, 95].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t-sm" style={{
                        height: `${h}%`,
                        background: i === 6 ? "linear-gradient(to top, #7c3aed, #6366f1)" : "rgba(139,92,246,0.2)"
                      }} />
                    ))}
                  </div>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 h-36">
                  <p className="text-gray-500 text-xs mb-3">Expense Breakdown</p>
                  <div className="relative w-20 h-20 mx-auto">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                      <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="#7c3aed" strokeWidth="3" strokeDasharray="70 30" />
                      <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="#6366f1" strokeWidth="3" strokeDasharray="30 70" strokeDashoffset="-70" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Glow */}
          <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-violet-600/20 blur-3xl rounded-full" />
        </div>
      </div>
    </section>
  );
}

// ─── Stats ──────────────────────────────────────────────────────────────────
function Stats() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const users = useCounter(50, 2000, visible);
  const expenses = useCounter(10, 2000, visible);
  const uptime = useCounter(999, 2000, visible);
  const rating = useCounter(49, 2000, visible);

  const stats = [
    { value: `${users}K+`, label: "Active Users", icon: Users, color: "from-violet-500 to-purple-600" },
    { value: `₹${expenses}Cr+`, label: "Expenses Tracked", icon: Activity, color: "from-indigo-500 to-blue-600" },
    { value: `${(uptime / 10).toFixed(1)}%`, label: "Uptime Guaranteed", icon: Shield, color: "from-emerald-500 to-teal-600" },
    { value: `${(rating / 10).toFixed(1)}★`, label: "User Rating", icon: Award, color: "from-amber-500 to-orange-600" },
  ];

  return (
    <section ref={ref} className="relative py-20 bg-[#050510]">
      <div className="absolute inset-0 bg-gradient-to-b from-[#050510] via-violet-950/10 to-[#050510]" />
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="group relative rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-sm p-6 text-center hover:border-violet-500/20 transition-all duration-500">
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${s.color} mb-4 shadow-lg`}>
                <s.icon size={20} className="text-white" />
              </div>
              <div className="text-3xl md:text-4xl font-black text-white mb-1">{s.value}</div>
              <div className="text-gray-500 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Features ──────────────────────────────────────────────────────────────
function Features() {
  const features = [
    { icon: PieChart, title: "Budget Planning", desc: "Create smart budgets with AI-powered recommendations tailored to your spending patterns and goals.", color: "from-violet-500 to-purple-600", glow: "violet" },
    { icon: Activity, title: "Expense Tracking", desc: "Automatically categorize and track every expense in real-time with beautiful visual breakdowns.", color: "from-indigo-500 to-blue-600", glow: "indigo" },
    { icon: Target, title: "Goal Management", desc: "Set, track, and achieve financial goals with milestone tracking and progress celebrations.", color: "from-emerald-500 to-teal-600", glow: "emerald" },
    { icon: BarChart3, title: "Financial Analytics", desc: "Deep insights and trend analysis with interactive charts that make data easy to understand.", color: "from-amber-500 to-orange-600", glow: "amber" },
    { icon: TrendingUp, title: "Income Tracking", desc: "Monitor multiple income sources, recurring payments, and salary growth over time.", color: "from-pink-500 to-rose-600", glow: "pink" },
    { icon: Cloud, title: "Secure Cloud Sync", desc: "Bank-level encryption with automatic backup and sync across all your devices seamlessly.", color: "from-cyan-500 to-sky-600", glow: "cyan" },
  ];

  return (
    <section id="features" className="relative py-32 bg-[#050510]">
      <FloatingOrbs />
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-semibold mb-5">
            <Zap size={11} className="fill-current" /> Everything You Need
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-5 tracking-tight">
            Powerful Features for
            <br /><span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">Smart Finance</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Every tool you need to take control of your financial life, beautifully crafted and intelligently connected.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={f.title} className="group relative rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] p-8 hover:border-violet-500/20 transition-all duration-500 overflow-hidden cursor-pointer">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-violet-900/10 to-transparent" />
              <div className={`inline-flex p-3.5 rounded-xl bg-gradient-to-br ${f.color} mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <f.icon size={22} className="text-white" />
              </div>
              <h3 className="text-white font-bold text-lg mb-3 group-hover:text-violet-100 transition-colors">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-violet-500 to-indigo-500 group-hover:w-full transition-all duration-500 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ──────────────────────────────────────────────────────────
function Testimonials() {
  const testimonials = [
    {
      name: "Priya Sharma", role: "Software Engineer, Bangalore",
      avatar: "PS", rating: 5, color: "from-violet-500 to-purple-600",
      text: "FinTrack Pro completely transformed how I manage money. The analytics are incredible — I saved ₹2 lakhs in just 6 months by following the insights!"
    },
    {
      name: "Rahul Mehta", role: "Startup Founder, Mumbai",
      avatar: "RM", rating: 5, color: "from-indigo-500 to-blue-600",
      text: "As a founder, tracking business and personal finances used to be a nightmare. FinTrack Pro made it effortless. The goal tracking feature is a game-changer."
    },
    {
      name: "Ananya Reddy", role: "Data Scientist, Hyderabad",
      avatar: "AR", rating: 5, color: "from-emerald-500 to-teal-600",
      text: "The financial analytics are at a whole different level. Beautiful charts, smart categorization, and the interface is so clean. Absolutely love it!"
    }
  ];

  return (
    <section id="testimonials" className="relative py-32 bg-[#050510]">
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-semibold mb-5">
            <Star size={11} className="fill-current" /> Loved by Thousands
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-5 tracking-tight">
            What Our Users
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent"> Say</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="group relative rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] p-8 hover:border-violet-500/20 transition-all duration-500">
              <div className="flex gap-1 mb-5">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-xs font-bold`}>
                  {t.avatar}
                </div>
                <div>
                  <div className="text-white text-sm font-semibold">{t.name}</div>
                  <div className="text-gray-500 text-xs">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ───────────────────────────────────────────────────────────────
function Pricing() {
  const plans = [
    {
      name: "Starter", price: "Free", period: "forever",
      features: ["Up to 50 transactions/month", "Basic analytics", "2 savings goals", "Email support"],
      cta: "Get Started", highlight: false, color: "border-white/10"
    },
    {
      name: "Pro", price: "₹299", period: "/month",
      features: ["Unlimited transactions", "Advanced analytics", "Unlimited goals", "Priority support", "Export reports", "Custom categories"],
      cta: "Start Free Trial", highlight: true, color: "border-violet-500/50"
    },
    {
      name: "Family", price: "₹599", period: "/month",
      features: ["Up to 5 members", "Shared budgets", "Family goals", "Dedicated support", "All Pro features", "Custom reports"],
      cta: "Get Family Plan", highlight: false, color: "border-white/10"
    }
  ];

  return (
    <section id="pricing" className="relative py-32 bg-[#050510]">
      <FloatingOrbs />
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-semibold mb-5">
            <DollarSign size={11} /> Simple Pricing
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-5 tracking-tight">
            Plans for <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">Everyone</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">Start free, upgrade when you're ready. No hidden fees.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div key={plan.name} className={`relative rounded-2xl border ${plan.color} ${plan.highlight ? "bg-gradient-to-b from-violet-900/30 to-[#080818]" : "bg-white/[0.02]"} p-8 flex flex-col`}>
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full text-white text-xs font-bold">
                  Most Popular
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-white font-bold text-lg mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">{plan.price}</span>
                  <span className="text-gray-500 text-sm">{plan.period}</span>
                </div>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-gray-400 text-sm">
                    <Check size={14} className="text-violet-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <a href="/register" className={`w-full text-center py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${plan.highlight
                ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-900/40"
                : "border border-white/10 text-gray-300 hover:border-violet-500/40 hover:text-white hover:bg-white/5"
              }`}>
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ───────────────────────────────────────────────────────────────────
function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  const faqs = [
    { q: "Is FinTrack Pro free to use?", a: "Yes! We offer a free Starter plan with up to 50 transactions per month. You can upgrade to Pro or Family plans for unlimited access and advanced features." },
    { q: "How secure is my financial data?", a: "We use bank-level AES-256 encryption, SSL/TLS for all data transfers, and never share your data with third parties. Your privacy is our top priority." },
    { q: "Can I export my financial reports?", a: "Pro and Family plan users can export reports in PDF, CSV, and Excel formats for any time period." },
    { q: "Does it support multiple currencies?", a: "Currently we support INR (₹) with multi-currency support coming in our next major update." },
    { q: "Can I cancel anytime?", a: "Absolutely. No contracts, no cancellation fees. Cancel anytime from your settings and you'll retain access until the end of your billing period." },
  ];

  return (
    <section className="relative py-32 bg-[#050510]">
      <div className="relative max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-5 tracking-tight">
            Frequently Asked
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent"> Questions</span>
          </h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className={`rounded-2xl border transition-all duration-300 overflow-hidden ${open === i ? "border-violet-500/30 bg-violet-900/10" : "border-white/5 bg-white/[0.02]"}`}>
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between px-6 py-5 text-left">
                <span className={`font-semibold text-sm ${open === i ? "text-white" : "text-gray-300"}`}>{faq.q}</span>
                {open === i ? <ChevronUp size={16} className="text-violet-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-gray-500 flex-shrink-0" />}
              </button>
              {open === i && (
                <div className="px-6 pb-5">
                  <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Final CTA ─────────────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section id="contact" className="relative py-32 bg-[#050510]">
      <div className="relative max-w-5xl mx-auto px-6">
        <div className="relative rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-900/30 via-[#0d0d25] to-indigo-900/20 p-16 text-center overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-1 bg-gradient-to-r from-transparent via-violet-500 to-transparent" />
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-semibold mb-6">
              <Zap size={11} className="fill-current" /> Limited Time — First Month Free
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-5 tracking-tight leading-tight">
              Start Managing Money
              <br /><span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">Smarter Today</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10">
              Join 50,000+ users who've transformed their financial lives. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="/register" className="group relative px-8 py-4 text-base font-bold text-white rounded-2xl overflow-hidden shadow-2xl shadow-violet-900/50">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 transition-all duration-300 group-hover:from-violet-500 group-hover:to-indigo-500" />
                <span className="relative flex items-center gap-2">Get Started Free <ArrowRight size={16} /></span>
              </a>
              <a href="/login" className="px-8 py-4 text-base font-semibold text-gray-300 hover:text-white border border-white/10 hover:border-violet-500/40 rounded-2xl hover:bg-white/5 transition-all duration-300">
                Already have an account?
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="relative bg-[#030308] border-t border-white/5 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="relative w-9 h-9">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <BarChart3 size={18} className="text-white" />
                </div>
              </div>
              <span className="text-white font-bold text-xl">Fin<span className="text-violet-400">Track</span><span className="text-xs align-super text-violet-300 ml-0.5">PRO</span></span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs mb-6">
              The smartest way to track, plan, and grow your finances. Built for modern India.
            </p>
            <div className="flex gap-3">
              {[Twitter, Github, Linkedin, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-white/5 hover:bg-violet-500/20 border border-white/5 hover:border-violet-500/30 flex items-center justify-center text-gray-500 hover:text-violet-400 transition-all duration-300">
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Product</h4>
            <ul className="space-y-3">
              {["Features", "Pricing", "Analytics", "Security", "Changelog"].map(l => (
                <li key={l}><a href="#" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Company</h4>
            <ul className="space-y-3">
              {["About", "Blog", "Careers", "Privacy", "Terms"].map(l => (
                <li key={l}><a href="#" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-sm">© 2026 FinTrack Pro. All rights reserved. Made with ♥ in India.</p>
          <div className="flex items-center gap-2 text-gray-600 text-xs">
            <Lock size={11} /> <span>Bank-level security</span>
            <span className="mx-2">·</span>
            <Globe size={11} /> <span>Available worldwide</span>
            <span className="mx-2">·</span>
            <Smartphone size={11} /> <span>Mobile ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Main Export ────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ fontFamily: "'DM Sans', sans-serif", background: "#050510" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900&display=swap');
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #050510; }
        ::-webkit-scrollbar-thumb { background: #4c1d95; border-radius: 2px; }
      `}</style>
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <Testimonials />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}
