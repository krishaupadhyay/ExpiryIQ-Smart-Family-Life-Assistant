import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Pill, ShoppingBasket, FileText, Shield, Zap,
  Wrench, CalendarHeart, Bot, Bell, Search, Menu, X, ChevronRight,
  LogOut, Settings, Sparkles
} from 'lucide-react'

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', iconBg: 'bg-teal-500/20', iconColor: 'text-teal-300' },
  { path: '/meditrack', icon: Pill, label: 'MediTrack', iconBg: 'bg-rose-500/20', iconColor: 'text-rose-300' },
  { path: '/pantryiq', icon: ShoppingBasket, label: 'PantryIQ', iconBg: 'bg-emerald-500/20', iconColor: 'text-emerald-300' },
  { path: '/docuvault', icon: FileText, label: 'DocuVault', iconBg: 'bg-indigo-500/20', iconColor: 'text-indigo-300' },
  { path: '/policywatch', icon: Shield, label: 'PolicyWatch', iconBg: 'bg-violet-500/20', iconColor: 'text-violet-300' },
  { path: '/utilitydesk', icon: Zap, label: 'UtilityDesk', iconBg: 'bg-amber-500/20', iconColor: 'text-amber-300' },
  { path: '/homecare', icon: Wrench, label: 'HomeCare', iconBg: 'bg-orange-500/20', iconColor: 'text-orange-300' },
  { path: '/familypulse', icon: CalendarHeart, label: 'FamilyPulse', iconBg: 'bg-pink-500/20', iconColor: 'text-pink-300' },
  { path: '/ai-assistant', icon: Bot, label: 'AI Assistant', iconBg: 'bg-purple-500/20', iconColor: 'text-purple-300' },
]

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const navigate = useNavigate()

  const notifications: { id: number; text: string; time: string; urgent: boolean }[] = []

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#FFFDF7' }}>
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── SIDEBAR ── lighter navy */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ background: '#22334E' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #0D9488, #D97706)' }}>
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-white text-base leading-tight block" style={{ fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: '-0.01em' }}>
              ExpiryIQ
            </span>
            <span className="text-[10px] font-medium tracking-widest uppercase" style={{ color: '#0D9488' }}>Smart Family Life</span>
          </div>
          <button className="ml-auto lg:hidden" style={{ color: 'rgba(255,255,255,0.4)' }} onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5 sidebar-nav">
          {navItems.map(({ path, icon: Icon, label, iconBg, iconColor }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'text-white'
                    : 'text-white/50 hover:text-white/80'
                }`
              }
              style={({ isActive }) => isActive
                ? { background: 'rgba(13,148,136,0.18)', borderLeft: '2px solid #0D9488' }
                : { borderLeft: '2px solid transparent' }
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    isActive ? iconBg : 'bg-white/5 group-hover:bg-white/10'
                  }`}>
                    <Icon className={`w-4 h-4 ${isActive ? iconColor : 'text-white/40 group-hover:text-white/60'}`} />
                  </span>
                  <span className="font-medium">{label}</span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto" style={{ color: '#0D9488' }} />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* AI Badge */}
        <div className="mx-3 mb-3 rounded-xl p-3 flex items-center gap-2.5" style={{ background: 'linear-gradient(135deg, rgba(13,148,136,0.25), rgba(217,119,6,0.2))', border: '1px solid rgba(13,148,136,0.3)' }}>
          <Sparkles className="w-4 h-4 shrink-0" style={{ color: '#D97706' }} />
          <div>
            <p className="text-white text-xs font-semibold">AI Active</p>
            <p className="text-white/40 text-[10px]">Ready to help</p>
          </div>
        </div>

        {/* User Footer */}
        <div className="px-3 pb-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '12px' }}>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: 'linear-gradient(135deg, #D97706, #EF4444)' }}>
              {/* TODO: replace with logged-in user's initials */}
              --
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{/* TODO: logged-in user's name */}Your Name</p>
              <p className="text-[10px] truncate" style={{ color: '#0D9488' }}>Family Admin</p>
            </div>
            <button onClick={() => navigate('/logout')} className="transition-colors" style={{ color: 'rgba(255,255,255,0.25)' }} title="Sign out">
              <LogOut className="w-4 h-4 hover:text-white" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="px-4 lg:px-6 py-3 flex items-center gap-3 shrink-0" style={{ background: '#FFFDF7', borderBottom: '1px solid rgba(15,26,46,0.08)' }}>
          <button className="lg:hidden transition-colors" style={{ color: '#0F1A2E' }} onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>

          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
            <input
              type="text"
              placeholder="Search medicines, documents, bills..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl transition-all outline-none"
              style={{ background: 'rgba(15,26,46,0.04)', border: '1px solid rgba(15,26,46,0.1)', color: '#1C1917' }}
              onFocus={e => { e.currentTarget.style.border = '1px solid #0D9488'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(13,148,136,0.12)' }}
              onBlur={e => { e.currentTarget.style.border = '1px solid rgba(15,26,46,0.1)'; e.currentTarget.style.boxShadow = 'none' }}
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                style={{ background: 'rgba(15,26,46,0.04)', border: '1px solid rgba(15,26,46,0.1)', color: '#6B7280' }}
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-12 w-80 rounded-2xl shadow-2xl z-50 overflow-hidden" style={{ background: 'white', border: '1px solid rgba(15,26,46,0.1)' }}>
                  <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(15,26,46,0.07)' }}>
                    <h3 className="text-sm font-semibold" style={{ color: '#0F1A2E' }}>Notifications</h3>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: '#FEE2E2', color: '#EF4444' }}>
                      {notifications.filter(n => n.urgent).length} urgent
                    </span>
                  </div>
                  <div className="divide-y max-h-72 overflow-y-auto" style={{ borderColor: 'rgba(15,26,46,0.04)' }}>
                    {notifications.length === 0 && (
                      <p className="text-sm text-center py-6" style={{ color: '#9CA3AF' }}>No notifications yet</p>
                    )}
                    {notifications.map(n => (
                      <div key={n.id} className="px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors" style={n.urgent ? { borderLeft: '3px solid #EF4444' } : {}}>
                        <p className="text-sm" style={{ color: '#374151' }}>{n.text}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{n.time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 text-center" style={{ borderTop: '1px solid rgba(15,26,46,0.07)' }}>
                    <button className="text-xs font-medium" style={{ color: '#0D9488' }}>View all notifications</button>
                  </div>
                </div>
              )}
            </div>

            <button className="w-9 h-9 rounded-xl flex items-center justify-center transition-all" style={{ background: 'rgba(15,26,46,0.04)', border: '1px solid rgba(15,26,46,0.1)', color: '#6B7280' }}>
              <Settings className="w-4 h-4" />
            </button>

            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold cursor-pointer" style={{ background: 'linear-gradient(135deg, #D97706, #EF4444)' }}>
              {/* TODO: replace with logged-in user's initials */}
              --
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto" style={{ background: '#FFFDF7' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
