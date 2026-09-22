import { Outlet, Link, useNavigate } from 'react-router-dom'
import {
  LogOut,
  Home,
  Pill,
  ShoppingBasket,
  FileText,
  Shield,
  Zap,
  Wrench,
  CalendarHeart,
  Bot,
  Menu,
  X,
  Bell
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { apiRequest } from '../services/api'
import { enableBrowserNotifications, disableBrowserNotifications, getPushPermissionState } from '../services/pushNotifications'

type Notification = {
  _id: string
  message: string
  urgent: boolean
  read: boolean
  createdAt: string
}

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [pushState, setPushState] = useState<NotificationPermission | 'unsupported'>('default')
  const [pushLoading, setPushLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    loadNotifications()
    getPushPermissionState().then(setPushState)
    // Refresh every 60 seconds so new alerts show up without a manual page reload
    const interval = setInterval(loadNotifications, 60000)
    return () => clearInterval(interval)
  }, [])

  async function handleEnablePush() {
    setPushLoading(true)
    try {
      await enableBrowserNotifications()
      setPushState('granted')
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Could not enable browser notifications.')
    } finally {
      setPushLoading(false)
    }
  }

  async function handleDisablePush() {
    setPushLoading(true)
    try {
      await disableBrowserNotifications()
      setPushState('default')
    } catch (error) {
      console.error('Failed to disable push:', error)
    } finally {
      setPushLoading(false)
    }
  }

  async function loadNotifications() {
    try {
      const data = await apiRequest('/notifications', { method: 'GET' })
      setNotifications(data.notifications || [])
    } catch (error) {
      console.warn('Failed to load notifications:', error)
    }
  }

  async function handleMarkAllRead() {
    try {
      await apiRequest('/notifications/read-all', { method: 'PATCH' })
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (error) {
      console.error('Failed to mark notifications as read:', error)
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/meditrack', label: 'MediTrack', icon: Pill },
    { path: '/pantryiq', label: 'PantryIQ', icon: ShoppingBasket },
    { path: '/docuvault', label: 'DocuVault', icon: FileText },
    { path: '/policywatch', label: 'PolicyWatch', icon: Shield },
    { path: '/utilitydesk', label: 'UtilityDesk', icon: Zap },
    { path: '/homecare', label: 'HomeCare', icon: Wrench },
    { path: '/familypulse', label: 'FamilyPulse', icon: CalendarHeart },
    { path: '/ai-assistant', label: 'AI Assistant', icon: Bot }
  ]

  async function handleLogout() {
    try {
      await apiRequest('/auth/logout', {
        method: 'POST'
      })
      navigate('/login', { replace: true })
    } catch (error) {
      console.error('Logout failed:', error)
      navigate('/login', { replace: true })
    }
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#FFFDF7' }}>
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 transform transition-transform z-40 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-slate-200">
          <Link
            to="/dashboard"
            className="flex items-center gap-2"
            onClick={() => setSidebarOpen(false)}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #0D9488, #D97706)'
              }}
            >
              <span className="text-white font-bold">E</span>
            </div>
            <span
              className="font-bold text-lg"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                color: '#0F1A2E'
              }}
            >
              ExpiryIQ
            </span>
          </Link>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors font-medium text-sm"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white border border-slate-200"
      >
        {sidebarOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </button>

      {/* Notification Bell — top right, fixed so it shows on every module page */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setNotifOpen(!notifOpen)}
          className="relative p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors"
        >
          <Bell className="w-5 h-5 text-slate-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {notifOpen && (
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <span className="font-bold text-sm text-slate-800">Notifications</span>
              {unreadCount > 0 && (
                <button onClick={handleMarkAllRead} className="text-xs font-semibold text-teal-600 hover:underline">
                  Mark all read
                </button>
              )}
            </div>

            {pushState !== 'unsupported' && (
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                {pushState === 'granted' ? (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">🔔 Browser alerts are on — you'll get alerts even with the tab closed.</span>
                    <button onClick={handleDisablePush} disabled={pushLoading} className="text-[10px] font-semibold text-red-500 hover:underline shrink-0 ml-2">Turn off</button>
                  </div>
                ) : pushState === 'denied' ? (
                  <p className="text-xs text-slate-500">Browser notifications are blocked. Enable them in your browser's site settings to receive alerts even when this tab is closed.</p>
                ) : (
                  <button onClick={handleEnablePush} disabled={pushLoading} className="w-full text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 py-2 rounded-lg transition-colors">
                    {pushLoading ? 'Enabling…' : '🔔 Enable browser alerts (even when tab is closed)'}
                  </button>
                )}
              </div>
            )}

            {notifications.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No notifications yet.</p>
            ) : (
              <div className="divide-y divide-slate-50">
                {notifications.map(n => (
                  <div key={n._id} className={`px-4 py-3 ${!n.read ? 'bg-teal-50/50' : ''}`}>
                    <p className={`text-sm ${n.urgent ? 'text-red-600 font-medium' : 'text-slate-700'}`}>{n.message}</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
