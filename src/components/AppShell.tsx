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
  X
} from 'lucide-react'
import { useState } from 'react'
import { apiRequest } from '../services/api'

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

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