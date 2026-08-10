import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bot, Pill, ShoppingBasket, FileText, Shield, Zap, Wrench,
  CalendarHeart, ArrowRight, Star, CheckCircle2, Menu, X,
  Bell, Brain, Users, TrendingUp, Sparkles, Heart, ChevronDown
} from 'lucide-react'

const features = [
  { icon: Pill, label: 'MediTrack', desc: 'Track medicine expiry, dosage schedules, and get timely reminders for prescriptions.', color: 'from-red-500 to-rose-600', bg: 'bg-red-50', iconColor: 'text-red-500' },
  { icon: ShoppingBasket, label: 'PantryIQ', desc: 'Manage grocery inventory, track expiry dates, and get AI-powered shopping suggestions.', color: 'from-green-500 to-emerald-600', bg: 'bg-green-50', iconColor: 'text-green-500' },
  { icon: FileText, label: 'DocuVault', desc: 'Securely store Aadhaar, PAN, passports, and all family documents in one safe place.', color: 'from-indigo-500 to-blue-600', bg: 'bg-indigo-50', iconColor: 'text-indigo-500' },
  { icon: Shield, label: 'PolicyWatch', desc: 'Never miss an insurance renewal. Track health, life, vehicle, and home policies.', color: 'from-purple-500 to-violet-600', bg: 'bg-purple-50', iconColor: 'text-purple-500' },
  { icon: Zap, label: 'UtilityDesk', desc: 'Monitor electricity, water, gas, and internet bills. Get payment due alerts.', color: 'from-yellow-500 to-amber-600', bg: 'bg-yellow-50', iconColor: 'text-yellow-500' },
  { icon: Wrench, label: 'HomeCare', desc: 'Track appliance warranties, service schedules, and maintenance reminders for your home.', color: 'from-orange-500 to-amber-600', bg: 'bg-orange-50', iconColor: 'text-orange-500' },
  { icon: CalendarHeart, label: 'FamilyPulse', desc: 'Manage birthdays, anniversaries, school events, and important family milestones.', color: 'from-pink-500 to-rose-600', bg: 'bg-pink-50', iconColor: 'text-pink-500' },
  { icon: Bot, label: 'AI Assistant', desc: 'Get smart insights, reminders, and recommendations powered by artificial intelligence.', color: 'from-violet-500 to-purple-600', bg: 'bg-violet-50', iconColor: 'text-violet-500' },
]

const steps = [
  { step: '01', title: 'Create Family Profile', desc: 'Add family members of all ages — from grandparents to kids. Set up once, benefit forever.' },
  { step: '02', title: 'Add Your Items', desc: 'Medicines, groceries, documents, bills — add them easily. Our AI fills details automatically.' },
  { step: '03', title: 'Stay Ahead Always', desc: 'Receive smart alerts, AI insights, and never miss a deadline, expiry, or important event.' },
]

const testimonials = [
  { name: 'Priya Mehta', city: 'Mumbai', role: 'Working Mother', text: 'ExpiryIQ transformed how I manage our family. No more expired medicines or missed insurance renewals. It is like having a personal assistant!', rating: 5, avatar: 'PM', photo: 'https://images.unsplash.com/photo-1595142062395-98e89b1ad216?w=80&h=80&fit=crop&auto=format' },
  { name: 'Suresh Patel', city: 'Ahmedabad', role: 'Retired Teacher', text: 'Very easy to use even for old people like me. The large text and simple buttons are very helpful. My daughter set it up and now I manage medicines myself!', rating: 5, avatar: 'SP', photo: 'https://images.unsplash.com/photo-1625690988276-0a7b0cdf3d5d?w=80&h=80&fit=crop&auto=format' },
  { name: 'Deepa Krishnan', city: 'Chennai', role: 'Homemaker', text: 'PantryIQ and MediTrack alone saved us thousands of rupees. The grocery suggestions are spot on and the medicine alerts are a lifesaver!', rating: 5, avatar: 'DK', photo: 'https://images.unsplash.com/photo-1704568634381-932144bc4ecb?w=80&h=80&fit=crop&auto=format' },
]

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: '#FFFDF7' }}>
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-md" style={{ background: 'rgba(255,253,247,0.92)', borderBottom: '1px solid rgba(15,26,46,0.08)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center h-16 gap-8">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow" style={{ background: 'linear-gradient(135deg, #0D9488, #D97706)' }}>
              <Bot className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[#0F1A2E] text-lg" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              ExpiryIQ
            </span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-7 ml-4">
            {['Features', 'How It Works', 'Testimonials'].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} className="text-sm font-medium transition-colors" style={{ color: '#6B7280' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#0D9488')}
                onMouseLeave={e => (e.currentTarget.style.color = '#6B7280')}
              >
                {item}
              </a>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button onClick={() => navigate('/login')} className="hidden sm:flex items-center gap-1.5 text-sm font-medium transition-colors" style={{ color: '#6B7280' }}>
              Sign In
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="flex items-center gap-2 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all hover:-translate-y-0.5 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #0D9488, #0F766E)', boxShadow: '0 4px 14px rgba(13,148,136,0.35)' }}
            >
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button className="md:hidden ml-1" style={{ color: '#0F1A2E' }} onClick={() => setMobileMenuOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex flex-col p-6" style={{ background: '#FFFDF7' }}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0D9488, #D97706)' }}>
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-[#0F1A2E] text-lg" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>ExpiryIQ</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} style={{ color: '#6B7280' }}><X className="w-5 h-5" /></button>
            </div>
            <div className="flex flex-col gap-4">
              {['Features', 'How It Works', 'Testimonials'].map(item => (
                <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} className="text-lg font-medium" style={{ color: '#374151' }} onClick={() => setMobileMenuOpen(false)}>
                  {item}
                </a>
              ))}
              <button onClick={() => navigate('/signup')} className="mt-4 text-white font-semibold py-3 rounded-xl" style={{ background: 'linear-gradient(135deg, #0D9488, #0F766E)' }}>
                Get Started Free
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-16 px-4 sm:px-6 relative overflow-hidden">
        {/* Background blobs — teal + amber palette */}
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full blur-3xl opacity-30 pointer-events-none" style={{ background: '#0D9488' }} />
        <div className="absolute -bottom-10 -left-20 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: '#D97706' }} />
        <div className="absolute top-40 left-1/3 w-64 h-64 rounded-full blur-3xl opacity-15 pointer-events-none" style={{ background: '#0F1A2E' }} />

        <div className="max-w-6xl mx-auto">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full" style={{ background: 'rgba(13,148,136,0.1)', border: '1px solid rgba(13,148,136,0.3)', color: '#0F766E' }}>
              <Sparkles className="w-3 h-3" />
              AI-Powered Family Life Assistant — 100% Free
            </span>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left copy */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] mb-6" style={{ color: '#0F1A2E', fontFamily: "'Playfair Display', Georgia, serif" }}>
                Smart Family Life{' '}
                <span style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundImage: 'linear-gradient(135deg, #0D9488, #D97706)', backgroundClip: 'text' }}>
                  Starts Here
                </span>
              </h1>
              <p className="text-lg leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0" style={{ color: '#6B7280', fontFamily: "'DM Sans', sans-serif" }}>
                ExpiryIQ helps Indian families manage medicines, groceries, documents, bills, insurance, appliances, and family events — all from one intelligent AI-powered platform. Completely free.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start mb-10">
                <button
                  onClick={() => navigate('/signup')}
                  className="flex items-center gap-2 text-white font-bold text-base px-7 py-3.5 rounded-2xl transition-all hover:-translate-y-0.5 active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #0D9488, #0F766E)', boxShadow: '0 6px 20px rgba(13,148,136,0.4)' }}
                >
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </button>
                <a href="#how-it-works" className="flex items-center gap-2 font-semibold text-base transition-colors" style={{ color: '#6B7280' }}>
                  Learn More <ChevronDown className="w-4 h-4" />
                </a>
              </div>

              {/* Social proof */}
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <div className="flex -space-x-2">
                  {['RS', 'PM', 'SK', 'DK', 'AV'].map((init, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow"
                      style={{ background: ['#0D9488', '#22C55E', '#D97706', '#8B5CF6', '#EF4444'][i] }}
                    >
                      {init}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />)}
                    <span className="text-sm font-bold ml-1" style={{ color: '#0F1A2E' }}>4.9</span>
                  </div>
                  <p className="text-xs" style={{ color: '#9CA3AF' }}>Trusted by 50,000+ Indian families</p>
                </div>
              </div>
            </div>

            {/* Right — Dashboard Preview */}
            <div className="relative">
              <div className="relative rounded-3xl shadow-2xl overflow-hidden mx-auto max-w-md lg:max-w-none" style={{ background: '#FFFDF7', border: '1px solid rgba(15,26,46,0.1)' }}>
                {/* Family photo */}
                <div className="relative h-44 bg-gradient-to-br from-blue-100 to-violet-100 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1659352790654-058e9077a4f4?w=600&h=240&fit=crop&auto=format"
                    alt="Happy multi-generation Indian family"
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-transparent to-transparent" />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 shadow-md">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-700">AI Active</span>
                  </div>
                </div>

                {/* Mini dashboard preview */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800 text-sm">Good morning, Sharma Family! 🌟</p>
                      <p className="text-xs text-slate-500">3 alerts need your attention</p>
                    </div>
                    <Bell className="w-5 h-5 text-orange-500" />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Medicines', count: '12', color: 'bg-red-50 text-red-600 border-red-100', icon: Pill },
                      { label: 'Groceries', count: '47', color: 'bg-green-50 text-green-600 border-green-100', icon: ShoppingBasket },
                      { label: 'Documents', count: '23', color: 'bg-indigo-50 text-indigo-600 border-indigo-100', icon: FileText },
                      { label: 'Bills Due', count: '2', color: 'bg-orange-50 text-orange-600 border-orange-100', icon: Zap },
                    ].map(({ label, count, color, icon: Icon }) => (
                      <div key={label} className={`flex items-center gap-2 p-2.5 rounded-xl border ${color}`}>
                        <Icon className="w-4 h-4" />
                        <div>
                          <p className="text-xs font-medium opacity-80">{label}</p>
                          <p className="text-sm font-bold">{count} items</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl p-3 flex items-start gap-2" style={{ background: 'rgba(13,148,136,0.08)', border: '1px solid rgba(13,148,136,0.2)' }}>
                    <Bot className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#0D9488' }} />
                    <p className="text-xs font-medium" style={{ color: '#0F766E' }}>AI Tip: Metformin expires in 3 days. Reorder now from your nearest pharmacy.</p>
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -top-3 -right-3 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg" style={{ background: 'linear-gradient(135deg, #0D9488, #D97706)' }}>
                100% Free
              </div>
              <div className="absolute -bottom-3 -left-3 rounded-xl px-3 py-2 shadow-lg flex items-center gap-2" style={{ background: '#FFFDF7', border: '1px solid rgba(15,26,46,0.12)' }}>
                <Heart className="w-4 h-4 fill-current" style={{ color: '#EF4444' }} />
                <span className="text-xs font-semibold" style={{ color: '#0F1A2E' }}>Made for Indian Families</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-10" style={{ background: '#0F1A2E' }}>
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center text-white">
          {[
            { value: '50,000+', label: 'Families' },
            { value: '4.9★', label: 'App Rating' },
            { value: '₹0', label: 'Always Free' },
            { value: '8', label: 'Smart Modules' },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl font-bold mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#0D9488' }}>{value}</p>
              <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 sm:px-6" style={{ background: '#FFFDF7' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-sm font-bold uppercase tracking-widest" style={{ color: '#0D9488' }}>Everything You Need</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-2 mb-4" style={{ color: '#0F1A2E', fontFamily: "'Playfair Display', Georgia, serif" }}>
              8 Modules, One Platform
            </h2>
            <p className="max-w-xl mx-auto" style={{ color: '#9CA3AF' }}>
              From medicines to memories — ExpiryIQ covers every aspect of Indian family life in one beautifully simple app.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map(({ icon: Icon, label, desc, bg, iconColor }) => (
              <div key={label} className="rounded-2xl p-6 border hover:-translate-y-1 transition-all duration-300 cursor-pointer group" style={{ background: 'white', borderColor: 'rgba(15,26,46,0.08)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(13,148,136,0.3)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 30px rgba(13,148,136,0.12)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(15,26,46,0.08)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
              >
                <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
                <h3 className="font-bold mb-2 text-base" style={{ color: '#0F1A2E' }}>{label}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#9CA3AF' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6" style={{ background: 'white' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-sm font-bold uppercase tracking-widest" style={{ color: '#D97706' }}>Simple Setup</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-2 mb-4" style={{ color: '#0F1A2E', fontFamily: "'Playfair Display', Georgia, serif" }}>
              Get Started in 3 Easy Steps
            </h2>
          </div>

          {/* Image collage strip */}
          <div className="grid grid-cols-3 gap-3 mb-14 rounded-3xl overflow-hidden h-40 sm:h-52">
            <div className="relative overflow-hidden" style={{ background: '#D4F5F0' }}>
              <img src="https://images.unsplash.com/photo-1716816211590-c15a328a5ff0?w=400&h=280&fit=crop&auto=format" alt="Indian spices" className="w-full h-full object-cover" />
            </div>
            <div className="relative overflow-hidden" style={{ background: '#FEF3C7' }}>
              <img src="https://images.unsplash.com/photo-1659352790654-058e9077a4f4?w=400&h=280&fit=crop&auto=format" alt="Happy Indian family" className="w-full h-full object-cover object-top" />
            </div>
            <div className="relative overflow-hidden" style={{ background: '#1a2d4a' }}>
              <img src="https://images.unsplash.com/photo-1750365919971-7dd273e7b317?w=400&h=280&fit=crop&auto=format" alt="AI technology" className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            {steps.map(({ step, title, desc }) => (
              <div key={step} className="relative text-center">
                <div className="w-14 h-14 rounded-2xl text-white text-xl font-bold flex items-center justify-center mx-auto mb-5 shadow-lg" style={{ background: 'linear-gradient(135deg, #0D9488, #D97706)', boxShadow: '0 6px 20px rgba(13,148,136,0.35)', fontFamily: "'DM Mono', monospace" }}>
                  {step}
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ color: '#0F1A2E' }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#9CA3AF' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Highlights */}
      <section className="py-20 px-4 sm:px-6" style={{ background: '#0F1A2E' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-sm font-bold uppercase tracking-widest" style={{ color: '#0D9488' }}>Powered by AI</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-2 mb-4 text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Your Intelligent Family Assistant
            </h2>
            <p className="max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.45)' }}>
              ExpiryIQ's AI understands your family's patterns and proactively helps you stay ahead.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Brain, title: 'Smart Predictions', desc: 'AI predicts when you will run out of medicines and groceries before it happens.', iconColor: '#0D9488' },
              { icon: Bell, title: 'Proactive Alerts', desc: 'Timely reminders for medicine doses, bill payments, renewals, and birthdays.', iconColor: '#D97706' },
              { icon: TrendingUp, title: 'Spending Insights', desc: 'Understand your family\'s spending patterns on utilities, groceries, and more.', iconColor: '#22C55E' },
              { icon: Sparkles, title: 'Smart Suggestions', desc: 'Personalized grocery lists, medicine alternatives, and document reminders.', iconColor: '#F59E0B' },
              { icon: Users, title: 'Family-Aware', desc: 'Understands each member\'s needs — from senior citizens\' medicines to kids\' schedules.', iconColor: '#60A5FA' },
              { icon: Shield, title: 'Privacy First', desc: 'All your family data stays secure. No data is sold or shared with third parties.', iconColor: '#F472B6' },
            ].map(({ icon: Icon, title, desc, iconColor }) => (
              <div key={title} className="rounded-2xl p-5 transition-colors cursor-default" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(13,148,136,0.12)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(13,148,136,0.3)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)' }}
              >
                <Icon className="w-6 h-6 mb-3" style={{ color: iconColor }} />
                <h3 className="font-bold text-white mb-1.5 text-sm">{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 sm:px-6" style={{ background: '#FFFDF7' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-sm font-bold uppercase tracking-widest" style={{ color: '#D97706' }}>Real Families</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-2 mb-4" style={{ color: '#0F1A2E', fontFamily: "'Playfair Display', Georgia, serif" }}>
              Loved Across India
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {testimonials.map(({ name, city, role, text, rating, photo }) => (
              <div key={name} className="rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow" style={{ background: 'white', border: '1px solid rgba(15,26,46,0.08)' }}>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" style={{ color: '#D97706' }} />)}
                </div>
                <p className="text-sm leading-relaxed mb-5 italic" style={{ color: '#6B7280' }}>"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full overflow-hidden shrink-0" style={{ background: 'linear-gradient(135deg, #0D9488, #D97706)' }}>
                    <img src={photo} alt={name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: '#0F1A2E' }}>{name}</p>
                    <p className="text-xs" style={{ color: '#9CA3AF' }}>{role} · {city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-4 sm:px-6 relative overflow-hidden" style={{ background: '#0F1A2E' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-80 h-80 rounded-full blur-3xl opacity-20" style={{ background: '#0D9488' }} />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-15" style={{ background: '#D97706' }} />
        </div>
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Start Your Smart Family Life Today
          </h2>
          <p className="text-lg mb-8" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Join 50,000+ Indian families already using ExpiryIQ. Completely free — no credit card needed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/signup')}
              className="font-bold text-base px-8 py-3.5 rounded-2xl transition-all hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #0D9488, #D97706)', color: 'white', boxShadow: '0 6px 20px rgba(13,148,136,0.4)' }}
            >
              Get Started Free
            </button>
            <a href="#features" className="font-semibold text-base px-8 py-3.5 rounded-2xl transition-colors" style={{ border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.8)' }}>
              Explore Features
            </a>
          </div>
          <div className="mt-6 flex items-center justify-center gap-6 text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {['No credit card', 'Always free', 'Works on all devices'].map(f => (
              <span key={f} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" style={{ color: '#0D9488' }} /> {f}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6" style={{ background: '#080F1C', color: 'rgba(255,255,255,0.4)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-4 gap-8 mb-10">
            <div className="sm:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0D9488, #D97706)' }}>
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-white text-lg" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>ExpiryIQ</span>
              </div>
              <p className="text-sm leading-relaxed max-w-xs">
                AI-powered family life assistant for Indian families. Manage everything that matters in one place.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm mb-3">Modules</h4>
              <ul className="space-y-2 text-sm">
                {['MediTrack', 'PantryIQ', 'DocuVault', 'PolicyWatch', 'UtilityDesk', 'HomeCare', 'FamilyPulse'].map(m => (
                  <li key={m}><a href="#" className="transition-colors hover:text-white">{m}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm mb-3">Company</h4>
              <ul className="space-y-2 text-sm">
                {['About Us', 'Privacy Policy', 'Terms of Service', 'Contact', 'Blog'].map(m => (
                  <li key={m}><a href="#" className="transition-colors hover:text-white">{m}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <p>© 2025 ExpiryIQ. Made with ❤️ for Indian families.</p>
            <p style={{ color: '#0D9488' }}>100% Free · No Ads · Privacy First</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
