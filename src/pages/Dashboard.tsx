import { useNavigate } from 'react-router-dom'
import {
  Pill, ShoppingBasket, FileText, Shield, Zap, Wrench,
  CalendarHeart, Bot, AlertTriangle, CheckCircle2, Clock,
  TrendingUp, ArrowRight, Sparkles, Bell, Users, Activity
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const spendingData: any[] = []

const modules = [
  { path: '/meditrack', icon: Pill, label: 'MediTrack', desc: 'No medicines yet', bg: 'bg-red-50', iconColor: 'text-red-500', border: 'border-red-100', badge: 'Add first', badgeColor: 'bg-red-100 text-red-600' },
  { path: '/pantryiq', icon: ShoppingBasket, label: 'PantryIQ', desc: 'No items yet', bg: 'bg-green-50', iconColor: 'text-green-600', border: 'border-green-100', badge: 'Add first', badgeColor: 'bg-green-100 text-green-700' },
  { path: '/docuvault', icon: FileText, label: 'DocuVault', desc: 'No documents yet', bg: 'bg-indigo-50', iconColor: 'text-indigo-500', border: 'border-indigo-100', badge: 'Add first', badgeColor: 'bg-indigo-100 text-indigo-700' },
  { path: '/policywatch', icon: Shield, label: 'PolicyWatch', desc: 'No policies yet', bg: 'bg-purple-50', iconColor: 'text-purple-500', border: 'border-purple-100', badge: 'Add first', badgeColor: 'bg-purple-100 text-purple-700' },
  { path: '/utilitydesk', icon: Zap, label: 'UtilityDesk', desc: 'No bills yet', bg: 'bg-yellow-50', iconColor: 'text-yellow-600', border: 'border-yellow-100', badge: 'Add first', badgeColor: 'bg-yellow-100 text-yellow-700' },
  { path: '/homecare', icon: Wrench, label: 'HomeCare', desc: 'No appliances yet', bg: 'bg-orange-50', iconColor: 'text-orange-500', border: 'border-orange-100', badge: 'Add first', badgeColor: 'bg-orange-100 text-orange-700' },
  { path: '/familypulse', icon: CalendarHeart, label: 'FamilyPulse', desc: 'No events yet', bg: 'bg-pink-50', iconColor: 'text-pink-500', border: 'border-pink-100', badge: 'Add first', badgeColor: 'bg-pink-100 text-pink-700' },
  { path: '/ai-assistant', icon: Bot, label: 'AI Assistant', desc: 'Ask anything', bg: 'bg-violet-50', iconColor: 'text-violet-600', border: 'border-violet-100', badge: 'Try it', badgeColor: 'bg-violet-100 text-violet-700' },
]

const reminders: any[] = []

const familyMembers: any[] = []

const recentActivity: any[] = []

export default function Dashboard() {
  const navigate = useNavigate()

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl p-5 lg:p-6 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0F1A2E 0%, #162035 60%, #1a2d1a 100%)' }}>
        {/* Teal glow */}
        <div className="absolute top-0 right-1/3 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: '#0D9488' }} />
        <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-10 pointer-events-none" style={{ background: '#D97706' }} />
        {/* Background family photo */}
        <div className="absolute right-0 top-0 w-64 h-full overflow-hidden hidden sm:block">
          <img
            src="https://images.unsplash.com/photo-1659352787906-f809a3b9e86e?w=320&h=200&fit=crop&auto=format&crop=faces"
            alt="Sharma family"
            className="w-full h-full object-cover opacity-15"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, #0F1A2E, transparent)' }} />
        </div>
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl lg:text-2xl font-extrabold mb-1">Good Morning! 🌟</h1>
            <p className="text-blue-100 text-sm">Welcome to your family dashboard — add your first item to get started</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 rounded-xl px-4 py-2 shrink-0" style={{ background: 'rgba(13,148,136,0.25)', border: '1px solid rgba(13,148,136,0.4)' }}>
            <Activity className="w-4 h-4" style={{ color: '#0D9488' }} />
            <span className="text-sm font-semibold">Family Health: Good</span>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          {[
            { label: 'Medicines', value: '0', icon: Pill },
            { label: 'Grocery Items', value: '0', icon: ShoppingBasket },
            { label: 'Documents', value: '0', icon: FileText },
            { label: 'Bills Due', value: '0', icon: Zap },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white/15 rounded-xl p-3 flex items-center gap-3">
              <Icon className="w-5 h-5 text-white/80" />
              <div>
                <p className="text-lg font-bold">{value}</p>
                <p className="text-[11px] text-blue-200">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Reminders + Modules */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Reminders */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-orange-500" />
                <h2 className="font-bold text-slate-800">Today's Reminders</h2>
              </div>
              <span className="text-xs bg-slate-100 text-slate-500 font-semibold px-2.5 py-1 rounded-full">
                {reminders.length} active
              </span>
            </div>
            <div className="divide-y divide-slate-50">
              {reminders.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-8">No reminders yet — they'll show up here as you add medicines, bills and documents.</p>
              )}
              {reminders.map(({ id, text, urgent, time, icon: Icon }) => (
                <div key={id} className={`flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors ${urgent ? 'border-l-4 border-orange-400' : ''}`}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${urgent ? 'bg-orange-100' : 'bg-slate-100'}`}>
                    <Icon className={`w-4 h-4 ${urgent ? 'text-orange-500' : 'text-slate-500'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{text}</p>
                    <p className="text-xs text-slate-400">{time}</p>
                  </div>
                  {urgent && (
                    <span className="shrink-0 flex items-center gap-1 text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                      <AlertTriangle className="w-3 h-3" /> Urgent
                    </span>
                  )}
                  {!urgent && (
                    <CheckCircle2 className="w-4 h-4 text-slate-300 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Access Modules */}
          <div>
            <h2 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-500" /> Quick Access
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {modules.map(({ path, icon: Icon, label, desc, bg, iconColor, border, badge, badgeColor }) => (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className={`bg-white border ${border} rounded-2xl p-4 text-left hover:shadow-md hover:-translate-y-0.5 transition-all group`}
                >
                  <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                  </div>
                  <p className="font-bold text-slate-800 text-sm mb-0.5">{label}</p>
                  <p className="text-xs text-slate-400 mb-2">{desc}</p>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badgeColor}`}>{badge}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Spending Chart */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-bold text-slate-800">Monthly Family Spending</h2>
                <p className="text-xs text-slate-400 mt-0.5">Bills · Groceries · Medicines</p>
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={spendingData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBills" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorGroceries" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorMedicines" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }} />
                <Area type="monotone" dataKey="bills" stroke="#2563EB" strokeWidth={2} fill="url(#colorBills)" name="Bills (₹)" />
                <Area type="monotone" dataKey="groceries" stroke="#22C55E" strokeWidth={2} fill="url(#colorGroceries)" name="Groceries (₹)" />
                <Area type="monotone" dataKey="medicines" stroke="#F59E0B" strokeWidth={2} fill="url(#colorMedicines)" name="Medicines (₹)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* AI Insights */}
          <div className="rounded-2xl p-5 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0F1A2E, #162035)' }}>
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-30 pointer-events-none" style={{ background: '#0D9488' }} />
            <div className="flex items-center gap-2 mb-4">
              <Bot className="w-5 h-5" />
              <h2 className="font-bold">AI Insights</h2>
            </div>
            <div className="space-y-3">
              {[].map((tip: { text: string; icon: string }, i: number) => (
                <div key={i} className="bg-white/15 rounded-xl p-3 text-sm">
                  <span className="text-base mr-2">{tip.icon}</span>
                  {tip.text}
                </div>
              ))}
              <p className="text-white/50 text-sm">AI insights will appear here once you start adding data.</p>
            </div>
            <button
              onClick={() => navigate('/ai-assistant')}
              className="mt-4 w-full transition-colors rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-2 relative z-10"
              style={{ background: 'rgba(13,148,136,0.3)', border: '1px solid rgba(13,148,136,0.4)' }}
            >
              Ask AI Assistant <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Family Members */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                <h2 className="font-bold text-slate-800">Family Members</h2>
              </div>
              <span className="text-xs text-slate-400">{familyMembers.length} members</span>
            </div>
            <div className="space-y-2.5">
              {familyMembers.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">No family members added yet.</p>
              )}
              {familyMembers.map(({ name, role, age, avatar, color, alert }) => (
                <div key={name} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                    {avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{name}</p>
                    <p className="text-xs text-slate-400">{role} · {age} yrs</p>
                  </div>
                  {alert && (
                    <span className="text-[10px] font-semibold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full shrink-0">
                      {alert}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-slate-400" />
              <h2 className="font-bold text-slate-800">Recent Activity</h2>
            </div>
            <div className="space-y-3">
              {recentActivity.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">No activity yet.</p>
              )}
              {recentActivity.map(({ text, time, color, bg }, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${bg}`} style={{ background: undefined }}>
                    <div className={`w-2 h-2 rounded-full ${color.replace('text-', 'bg-')}`} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-700">{text}</p>
                    <p className="text-xs text-slate-400">{time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
