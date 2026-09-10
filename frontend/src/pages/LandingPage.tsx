import { useState, useEffect, useRef } from "react";
import {
  TrendingUp, Shield, Target, BarChart3, Wallet, Cloud,
  ChevronDown, ChevronUp, Star, Menu, X, ArrowRight,
  Play, Check, Twitter, Github, Linkedin, Instagram,
  Zap, Users, Activity, Award, DollarSign, PieChart,
  Lock, Globe, Smartphone, Bell,
  Upload, FileSpreadsheet, FileText, Layers, AlertTriangle,
  ShieldCheck, Sparkles, RefreshCw, Calendar, ArrowUpRight,
  CheckCircle2, Sliders, Database, CreditCard
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

  const links = ["Home", "Features", "Pricing", "Testimonials"];

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
          Trusted by 50+ Users 
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
                  { label: "Total Inflow", value: "₹85,000", color: "text-emerald-400", bg: "bg-emerald-500/10", icon: TrendingUp },
                  { label: "Total Outflow", value: "₹34,200", color: "text-rose-400", bg: "bg-rose-500/10", icon: Wallet },
                  { label: "Net Savings", value: "₹50,800", color: "text-violet-400", bg: "bg-violet-500/10", icon: Target },
                  { label: "Safe-to-Spend", value: "₹1,693/day", color: "text-amber-400", bg: "bg-amber-500/10", icon: Sparkles },
                ].map((stat) => (
                  <div key={stat.label} className={`${stat.bg} border border-white/5 rounded-xl p-3`}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-gray-500 text-xs">{stat.label}</p>
                      <stat.icon size={13} className={stat.color} />
                    </div>
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
    { value: `${users} hundreds+`, label: "Active Users", icon: Users, color: "from-violet-500 to-purple-600" },
    { value: `₹${expenses}k+`, label: "Expenses Tracked", icon: Activity, color: "from-indigo-500 to-blue-600" },
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
    {
      badge: "EASY IMPORT",
      badgeColor: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
      icon: Upload,
      title: "Bank Statement Import",
      desc: "Upload your bank statement and we'll automatically add your income and expenses. No typing by hand, and duplicate transactions are never added twice.",
      color: "from-emerald-500 to-teal-600",
      highlights: ["Upload statement in seconds", "Zero manual typing needed", "Never adds duplicate charges"]
    },
    {
      badge: "DAILY BUDGET",
      badgeColor: "text-violet-400 border-violet-500/30 bg-violet-500/10",
      icon: Wallet,
      title: "Daily Spending Limit",
      desc: "Know exactly how much you can safely spend today without running out of money before your next paycheck. Updates automatically every morning.",
      color: "from-violet-500 to-indigo-600",
      highlights: ["Tells you your safe daily limit", "Updates every morning", "Avoids end-of-month panic"]
    },
    {
      badge: "BUDGET LIMITS",
      badgeColor: "text-amber-400 border-amber-500/30 bg-amber-500/10",
      icon: Layers,
      title: "Category Budgets",
      desc: "Set spending caps for Food, Travel, Shopping, and Bills. Clear visual progress bars show your spending, with friendly warnings before you go over.",
      color: "from-amber-500 to-orange-600",
      highlights: ["Limits for Food, Travel & Bills", "Warning alert at 80% spent", "Clean color progress bars"]
    },
    {
      badge: "REPORTS",
      badgeColor: "text-blue-400 border-blue-500/30 bg-blue-500/10",
      icon: FileSpreadsheet,
      title: "Monthly PDF & Excel Reports",
      desc: "Download clean, official monthly financial statements with one click in PDF or Excel. Ready for tax filing, accountant reviews, or personal records.",
      color: "from-blue-500 to-cyan-600",
      highlights: ["1-click PDF and Excel download", "Official summary & full list", "Ready for taxes and records"]
    },
    {
      badge: "HISTORY",
      badgeColor: "text-purple-400 border-purple-500/30 bg-purple-500/10",
      icon: Calendar,
      title: "Past Months History",
      desc: "Easily switch back to any past month from the last 2 years. Compare your spending, see if you saved more than last month, and track your progress.",
      color: "from-purple-500 to-pink-600",
      highlights: ["Look back up to 2 years", "Compare with previous month", "See your savings improve"]
    },
    {
      badge: "EASY CHARTS",
      badgeColor: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
      icon: BarChart3,
      title: "Visual Spending Charts",
      desc: "See where your money comes from and where it goes with colorful, simple charts. Spot your biggest spending habits at a single glance.",
      color: "from-cyan-500 to-blue-600",
      highlights: ["Simple income vs expense chart", "Category pie breakdown", "Spot your biggest expenses"]
    },
    {
      badge: "SAVINGS",
      badgeColor: "text-pink-400 border-pink-500/30 bg-pink-500/10",
      icon: Target,
      title: "Savings Goals",
      desc: "Set targets for an emergency fund, vacation, or new gadget. Add savings over time and watch your progress bar fill up until you reach 100%.",
      color: "from-pink-500 to-rose-600",
      highlights: ["Set target amounts & dates", "Live progress tracking", "Stay motivated to save"]
    },
    {
      badge: "EARLY ALERTS",
      badgeColor: "text-rose-400 border-rose-500/30 bg-rose-500/10",
      icon: AlertTriangle,
      title: "Overspending Alerts",
      desc: "Get an immediate alert when you've used 80% of your monthly budget or go over limit, so you can make quick changes before running out of cash.",
      color: "from-rose-500 to-red-600",
      highlights: ["Early warning banners", "Change your budget anytime", "No surprise overdrafts"]
    },
    {
      badge: "PRIVACY",
      badgeColor: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
      icon: ShieldCheck,
      title: "100% Safe & Private",
      desc: "Sign in quickly with Google. Your financial information is securely locked with bank-level protection and is never sold or shared with anyone.",
      color: "from-emerald-600 to-green-600",
      highlights: ["Quick 1-click Google sign-in", "Bank-level protection", "Your data stays 100% private"]
    },
  ];

  const workflowSteps = [
    {
      step: "01",
      title: "Add Your Money In & Out",
      desc: "Upload your bank statement file or type your expenses in seconds. Incomes and spending are organized automatically without manual headache.",
      badge: "Fast & Automatic",
      icon: Upload,
      preview: [
        { name: "Swiggy Food Order", type: "EXPENSE", cat: "Food", amt: "-₹480", color: "text-rose-400" },
        { name: "Salary / Client Payment", type: "INCOME", cat: "Income", amt: "+₹85,000", color: "text-emerald-400" },
        { name: "Uber Ride", type: "EXPENSE", cat: "Travel", amt: "-₹240", color: "text-rose-400" },
      ]
    },
    {
      step: "02",
      title: "See Your Daily Spending Limit",
      desc: "Check your dashboard every day to see how much you can spend today. Helpful alerts warn you before you go over your budget limits.",
      badge: "Stress-Free Days",
      icon: Wallet,
      preview: [
        { name: "Safe to Spend Today", val: "₹1,693/day", sub: "18 days left this month", color: "text-amber-400" },
        { name: "Food Budget (₹8,000)", val: "62% spent", sub: "₹3,040 left to spend", color: "text-emerald-400" },
      ]
    },
    {
      step: "03",
      title: "Save More & Download Reports",
      desc: "Track your savings goals step-by-step and download clean monthly statements in PDF or Excel whenever you need them.",
      badge: "Real Savings",
      icon: FileSpreadsheet,
      preview: [
        { name: "Emergency Fund Goal", val: "78% Complete", sub: "₹39,000 of ₹50,000 saved", color: "text-emerald-400" },
        { name: "Monthly Statement", val: "PDF & Excel Ready", sub: "Download with 1 click", color: "text-blue-400" },
      ]
    },
  ];

  return (
    <section id="features" className="relative py-32 bg-[#050510]">
      <FloatingOrbs />
      <div className="relative max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-semibold mb-5">
            <Zap size={13} className="fill-current text-violet-400" />
            <span>SIMPLE & POWERFUL</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-5 tracking-tight leading-tight">
            Everything You Need to
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Take Control of Your Money
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto leading-relaxed">
            No complicated finance terms. No spreadsheet headaches. Just simple, smart tools to help you save more, spend wisely, and stress less.
          </p>
        </div>

        {/* 3x3 Customer-Friendly Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] p-7 hover:border-violet-500/30 transition-all duration-500 flex flex-col justify-between overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-violet-900/20"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-violet-900/10 via-transparent to-transparent pointer-events-none" />

              <div>
                {/* Header row: Badge + Icon */}
                <div className="flex items-center justify-between gap-3 mb-5">
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border ${f.badgeColor}`}>
                    {f.badge}
                  </span>
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${f.color} shadow-md group-hover:scale-110 transition-transform duration-300 flex items-center justify-center text-white`}>
                    <f.icon size={20} />
                  </div>
                </div>

                {/* Title & Desc */}
                <h3 className="text-white font-bold text-lg mb-2.5 group-hover:text-violet-200 transition-colors">
                  {f.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-5">
                  {f.desc}
                </p>
              </div>

              {/* Technical highlight pills */}
              <div className="space-y-1.5 pt-4 border-t border-white/5">
                {f.highlights.map((h, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-gray-400">
                    <CheckCircle2 size={13} className="text-violet-400 flex-shrink-0" />
                    <span className="truncate">{h}</span>
                  </div>
                ))}
              </div>

              {/* Bottom glowing accent bar */}
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-violet-500 to-indigo-500 group-hover:w-full transition-all duration-500 rounded-full" />
            </div>
          ))}
        </div>

        {/* ── WORKFLOW SPOTLIGHT BANNER: 3 Simple Steps ────────────────── */}
        <div className="relative rounded-3xl border border-violet-500/20 bg-gradient-to-b from-[#0e0e26] to-[#070716] p-8 md:p-12 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-2 block">
              HOW IT WORKS IN 3 SIMPLE STEPS
            </span>
            <h3 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
              Taking Control of Your Money is Simple
            </h3>
            <p className="text-gray-400 text-sm mt-2">
              Say goodbye to manual typing and guessing if you can afford to dine out tonight.
            </p>
          </div>

          {/* 3 Step Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {workflowSteps.map((w, idx) => (
              <div
                key={w.step}
                className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 hover:bg-white/[0.04] hover:border-violet-500/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl font-black text-violet-500/60 font-numeric">{w.step}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20">
                      {w.badge}
                    </span>
                  </div>
                  <h4 className="text-white font-bold text-base mb-2">{w.title}</h4>
                  <p className="text-gray-400 text-xs leading-relaxed mb-6">{w.desc}</p>
                </div>

                {/* Mini Preview Box */}
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2">
                  {w.preview.map((p: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="truncate mr-2">
                        <p className="text-gray-300 font-medium truncate">{p.name}</p>
                        {p.sub && <p className="text-[10px] text-gray-500">{p.sub}</p>}
                      </div>
                      <span className={`font-bold font-numeric flex-shrink-0 ${p.color}`}>
                        {p.amt || p.val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Quick CTA inside feature showcase */}
          <div className="mt-10 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-gray-300 text-sm text-center sm:text-left">
              <Sparkles size={18} className="text-amber-400 flex-shrink-0" />
              <span>Ready to transform how you track, budget, and save money?</span>
            </div>
            <a
              href="/register"
              className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-900/40 flex items-center gap-2 flex-shrink-0"
            >
              <span>Get Started Free</span>
              <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ──────────────────────────────────────────────────────────
function Testimonials() {
  const testimonials = [
      {
      name: "Sania S", role: "Influencer, Coimbatore",
      avatar: "RM", rating: 5, color: "from-indigo-500 to-blue-600",
      text: "As a Influencer, tracking Collabs and personal finances used to be a nightmare. FinTrack Pro made it effortless. The goal tracking feature is a game-changer."
    },
    {
      name: "Swetha", role: "Software Engineer, Bangalore",
      avatar: "PS", rating: 5, color: "from-violet-500 to-purple-600",
      text: "FinTrack Pro completely transformed how I manage money. The analytics are incredible — I saved ₹2 lakhs in just 6 months by following the insights!"
    },
    {
      name: "Reventh A", role: "Data Scientist, Coimbatore",
      avatar: "AR", rating: 5, color: "from-emerald-500 to-teal-600",
      text: "The financial analytics are at a whole different level. Beautiful charts, smart categorization, and the interface is so clean. Absolutely love it!"
    }
  ];

  return (
    <section id="testimonials" className="relative py-32 bg-[#050510]">
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-semibold mb-5">
            <Star size={11} className="fill-current" /> Loved by Hundereds of Users
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
  const allFeatures = [
    "Automated Bank Statement CSV Ingestion with Deduplication",
    "Dynamic Daily Safe-To-Spend Burn Rate Calculator",
    "Category Spending Envelopes with 80% & Exceeded Alerts",
    "Official Certified Monthly Audit Reports (PDF & CSV)",
    "24-Month Period Engine & Historical Time Machine",
    "Interactive Cashflow Run-Rate & Category Doughnut Analytics",
    "Savings Goal Deadlines & Milestone Progress Tracking",
    "Google OAuth2 Single Sign-On & Stateless JWT Security",
    "Zero Advertisements · Complete Data Privacy"
  ];

  return (
    <section id="pricing" className="relative py-32 bg-[#050510]">
      <FloatingOrbs />
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-semibold mb-5">
            <DollarSign size={13} /> Free Forever · No Hidden Fees
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-5 tracking-tight">
            Enterprise Power, <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">Zero Cost</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            All advanced financial features are unlocked for every user. Built for students, engineers, and modern finance enthusiasts.
          </p>
        </div>

        <div className="max-w-xl mx-auto">
          <div className="relative rounded-3xl border border-violet-500/30 bg-gradient-to-b from-violet-950/40 via-[#0c0c24] to-[#070716] p-8 sm:p-10 flex flex-col shadow-2xl shadow-violet-900/30">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full text-white text-xs font-bold uppercase tracking-wider shadow-md">
              Full Suite Unlocked
            </div>

            <div className="mb-6 text-center sm:text-left">
              <h3 className="text-white font-black text-2xl mb-1">FinTrack Pro Complete</h3>
              <p className="text-gray-400 text-xs">Everything you need to master cashflow, envelopes, and bank statements.</p>
              <div className="flex items-baseline justify-center sm:justify-start gap-1.5 mt-4">
                <span className="text-5xl font-black text-white font-numeric">₹0</span>
                <span className="text-gray-400 text-sm font-semibold">/ lifetime free</span>
              </div>
            </div>

            <ul className="space-y-3.5 flex-1 mb-8">
              {allFeatures.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-300 text-sm">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <a
              href="/register"
              className="w-full text-center py-4 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all shadow-xl shadow-violet-900/50 flex items-center justify-center gap-2"
            >
              <span>Get Started Now</span>
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ───────────────────────────────────────────────────────────────────
function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  const faqs = [
    { q: "Is FinTrack Pro free to use?", a: "Yes. All features are available for free, with no hidden fees." },
    { q: "How secure is my financial data?", a: "We use bank-level AES-256 encryption, SSL/TLS for all data transfers, and never share your data with third parties. Your privacy is our top priority." },
    { q: "Can I export my financial reports?", a: "Pro and Family plan users can export reports in PDF, CSV, and Excel formats for any time period." },
    { q: "Does it support multiple currencies?", a: "Currently we support INR (₹) with multi-currency support coming in our next major update." },
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
              <Zap size={11} className="fill-current" /> Free
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-5 tracking-tight leading-tight">
              Start Managing Money
              <br /><span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">Smarter Today</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10">
              Join 50+ users who've transformed their financial lives. No credit card required.
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
            <h4 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
              <span>Product</span>
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500"></span>
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "Features Overview", href: "#features" },
                { label: "Bank Statement Sync", href: "#features" },
                { label: "Safe-to-Spend Pacing", href: "#features" },
                { label: "Category Envelopes", href: "#features" },
                { label: "Audit Reports & PDF", href: "#features" },
                { label: "Pricing & Plans", href: "#pricing" },
              ].map(item => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-slate-300 hover:text-violet-300 text-sm font-medium transition-all duration-200 hover:translate-x-1 inline-flex items-center gap-1.5 group"
                  >
                    <span className="text-violet-500/60 group-hover:text-violet-400 text-xs">›</span>
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
              <span>Platform</span>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "Live Dashboard", href: "/dashboard" },
                { label: "Create Account", href: "/register" },
                { label: "User Sign In", href: "/login" },
                { label: "Security & Encryption", href: "#features" },
                { label: "User Reviews", href: "#testimonials" },
                { label: "Frequently Asked Questions", href: "#faq" },
              ].map(item => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-slate-300 hover:text-indigo-300 text-sm font-medium transition-all duration-200 hover:translate-x-1 inline-flex items-center gap-1.5 group"
                  >
                    <span className="text-indigo-500/60 group-hover:text-indigo-400 text-xs">›</span>
                    <span>{item.label}</span>
                  </a>
                </li>
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
