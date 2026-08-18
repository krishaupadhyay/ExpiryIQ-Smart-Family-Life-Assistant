import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  ArrowRight,
  Bot,
  CalendarHeart,
  Clock,
  FileText,
  Pill,
  Shield,
  ShoppingBasket,
  TrendingUp,
  Users,
  Wrench,
  Zap,
  Activity
} from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

// ✅ Import auth hook
import { useAuth } from "D:/Documents/ExpiryIQ/frontend1/src/context/AuthContext.tsx";

const spendingData: any[] = []

const modules = [
  {
    path: '/meditrack',
    icon: Pill,
    label: 'MediTrack',
    desc: 'No medicines yet',
    bg: 'bg-red-50',
    iconColor: 'text-red-500',
    border: 'border-red-100',
    badge: 'Add first',
    badgeColor: 'bg-red-100 text-red-600'
  },
  {
    path: '/pantryiq',
    icon: ShoppingBasket,
    label: 'PantryIQ',
    desc: 'No items yet',
    bg: 'bg-green-50',
    iconColor: 'text-green-600',
    border: 'border-green-100',
    badge: 'Add first',
    badgeColor: 'bg-green-100 text-green-700'
  },
  {
    path: '/docuvault',
    icon: FileText,
    label: 'DocuVault',
    desc: 'No documents yet',
    bg: 'bg-indigo-50',
    iconColor: 'text-indigo-500',
    border: 'border-indigo-100',
    badge: 'Add first',
    badgeColor: 'bg-indigo-100 text-indigo-700'
  },
  {
    path: '/policywatch',
    icon: Shield,
    label: 'PolicyWatch',
    desc: 'No policies yet',
    bg: 'bg-purple-50',
    iconColor: 'text-purple-500',
    border: 'border-purple-100',
    badge: 'Add first',
    badgeColor: 'bg-purple-100 text-purple-700'
  },
  {
    path: '/utilitydesk',
    icon: Zap,
    label: 'UtilityDesk',
    desc: 'No bills yet',
    bg: 'bg-yellow-50',
    iconColor: 'text-yellow-600',
    border: 'border-yellow-100',
    badge: 'Add first',
    badgeColor: 'bg-yellow-100 text-yellow-700'
  },
  {
    path: '/homecare',
    icon: Wrench,
    label: 'HomeCare',
    desc: 'No appliances yet',
    bg: 'bg-orange-50',
    iconColor: 'text-orange-500',
    border: 'border-orange-100',
    badge: 'Add first',
    badgeColor: 'bg-orange-100 text-orange-700'
  },
  {
    path: '/familypulse',
    icon: CalendarHeart,
    label: 'FamilyPulse',
    desc: 'No events yet',
    bg: 'bg-pink-50',
    iconColor: 'text-pink-500',
    border: 'border-pink-100',
    badge: 'Add first',
    badgeColor: 'bg-pink-100 text-pink-700'
  },
  {
    path: '/ai-assistant',
    icon: Bot,
    label: 'AI Assistant',
    desc: 'Ask anything',
    bg: 'bg-violet-50',
    iconColor: 'text-violet-600',
    border: 'border-violet-100',
    badge: 'Try it',
    badgeColor: 'bg-violet-100 text-violet-700'
  }
]

const reminders: any[] = []
const familyMembers: any[] = []
const recentActivity: any[] = []

export default function Dashboard() {

  const navigate = useNavigate()

  // ✅ Use global auth context
  const { isAuthenticated, loading: authLoading } = useAuth()

  // Currently selected family member
  const [selectedProfile, setSelectedProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // ✅ Read selected family member from localStorage
  useEffect(() => {

    const storedProfile = localStorage.getItem('selectedProfile')

    if (storedProfile) {

      try {

        const profile = JSON.parse(storedProfile)
        setSelectedProfile(profile)

      } catch (error) {

        console.error('Invalid selected profile:', error)
        localStorage.removeItem('selectedProfile')

      }

    }

    setLoading(false)

  }, [])

  // ✅ Redirect if no profile selected
  useEffect(() => {

    if (!loading && !selectedProfile) {

      const storedProfile = localStorage.getItem('selectedProfile')

      if (!storedProfile) {
        console.warn('No profile selected, redirecting to profiles page')
        navigate('/profiles', {
          replace: true
        })
      }

    }

  }, [selectedProfile, loading, navigate])

  // ⏳ Show loading if auth is still checking
  if (authLoading || loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FFFDF7'
        }}
      >
        <div style={{ textAlign: 'center', color: '#6B7280' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '4px solid #E5E7EB',
              borderTop: '4px solid #0D9488',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }}
          />
          <p>Loading dashboard...</p>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    )
  }

  const profileName = selectedProfile?.name || 'User'

  function switchProfile() {
    localStorage.removeItem('selectedProfile')
    navigate('/profiles')
  }


  return (

    <div className="p-4 lg:p-6 space-y-6">

      {/* =========================
          WELCOME BANNER
      ========================= */}

      <div
        className="rounded-2xl p-5 lg:p-6 text-white relative overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, #0F1A2E 0%, #162035 60%, #1a2d1a 100%)'
        }}
      >

        <div
          className="absolute top-0 right-1/3 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: '#0D9488' }}
        />

        <div
          className="absolute bottom-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-10 pointer-events-none"
          style={{ background: '#D97706' }}
        />

        <div className="absolute right-0 top-0 w-64 h-full overflow-hidden hidden sm:block">

          <img
            src="https://images.unsplash.com/photo-1659352787906-f809a3b9e86e?w=320&h=200&fit=crop&auto=format&crop=faces"
            alt="Family"
            className="w-full h-full object-cover opacity-15"
          />

          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to right, #0F1A2E, transparent)'
            }}
          />

        </div>


        <div className="relative z-10 flex items-start justify-between gap-4">

          <div>

            <h1 className="text-xl lg:text-2xl font-extrabold mb-1">

              Good Morning, {profileName}! 🌟

            </h1>

            <p className="text-blue-100 text-sm">

              Welcome to your family dashboard — add your first item to get started

            </p>

          </div>


          <div
            className="hidden sm:flex items-center gap-2 rounded-xl px-4 py-2 shrink-0"
            style={{
              background: 'rgba(13,148,136,0.25)',
              border:
                '1px solid rgba(13,148,136,0.4)'
            }}
          >

            <Activity
              className="w-4 h-4"
              style={{ color: '#0D9488' }}
            />

            <span className="text-sm font-semibold">

              Family Health: Good

            </span>

          </div>

        </div>


        {/* Statistics */}

        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">

          {[
            {
              label: 'Medicines',
              value: '0',
              icon: Pill
            },
            {
              label: 'Grocery Items',
              value: '0',
              icon: ShoppingBasket
            },
            {
              label: 'Documents',
              value: '0',
              icon: FileText
            },
            {
              label: 'Bills Due',
              value: '0',
              icon: Zap
            }
          ].map(({ label, value, icon: Icon }) => (

            <div
              key={label}
              className="bg-white/15 rounded-xl p-3 flex items-center gap-3"
            >

              <Icon className="w-5 h-5 text-white/80" />

              <div>

                <p className="text-lg font-bold">
                  {value}
                </p>

                <p className="text-xs text-white/60">
                  {label}
                </p>

              </div>

            </div>

          ))}

        </div>

      </div>


      {/* Main Grid */}

      <div className="grid lg:grid-cols-3 gap-6">

        {/* LEFT COLUMN (2/3) */}

        <div className="lg:col-span-2 space-y-6">

          {/* Features Grid */}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {modules.map(module => {

              const Icon = module.icon

              return (

                <button
                  key={module.path}
                  onClick={() => navigate(module.path)}
                  className={`rounded-2xl p-5 text-left transition-all hover:shadow-lg hover:-translate-y-1 border ${module.border}`}
                  style={{
                    background: 'white'
                  }}
                >

                  <div className="flex items-start justify-between mb-3">

                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${module.bg}`}
                    >

                      <Icon className={`w-5 h-5 ${module.iconColor}`} />

                    </div>

                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${module.badgeColor}`}
                    >

                      {module.badge}

                    </span>

                  </div>

                  <h3 className="font-bold text-slate-800 mb-1">

                    {module.label}

                  </h3>

                  <p className="text-sm text-slate-500">

                    {module.desc}

                  </p>

                </button>

              )

            })}

          </div>


          {/* Spending Chart */}

          <div
            className="rounded-2xl p-5 bg-white border border-slate-100"
          >

            <div className="flex items-center justify-between mb-5">

              <div>

                <h2 className="font-bold text-slate-800">

                  Spending Overview

                </h2>

                <p className="text-xs text-slate-400 mt-0.5">

                  Bills · Groceries · Medicines

                </p>

              </div>

              <TrendingUp className="w-5 h-5 text-green-500" />

            </div>


            <ResponsiveContainer width="100%" height={180}>

              <AreaChart
                data={spendingData}
                margin={{
                  top: 5,
                  right: 10,
                  left: -20,
                  bottom: 0
                }}
              >

                <defs>

                  <linearGradient
                    id="colorBills"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >

                    <stop
                      offset="5%"
                      stopColor="#2563EB"
                      stopOpacity={0.2}
                    />

                    <stop
                      offset="95%"
                      stopColor="#2563EB"
                      stopOpacity={0}
                    />

                  </linearGradient>

                  <linearGradient
                    id="colorGroceries"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >

                    <stop
                      offset="5%"
                      stopColor="#22C55E"
                      stopOpacity={0.2}
                    />

                    <stop
                      offset="95%"
                      stopColor="#22C55E"
                      stopOpacity={0}
                    />

                  </linearGradient>

                  <linearGradient
                    id="colorMedicines"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >

                    <stop
                      offset="5%"
                      stopColor="#F59E0B"
                      stopOpacity={0.2}
                    />

                    <stop
                      offset="95%"
                      stopColor="#F59E0B"
                      stopOpacity={0}
                    />

                  </linearGradient>

                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#F1F5F9"
                />

                <XAxis
                  dataKey="month"
                  tick={{
                    fontSize: 11,
                    fill: '#94A3B8'
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  tick={{
                    fontSize: 11,
                    fill: '#94A3B8'
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px'
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="bills"
                  stroke="#2563EB"
                  strokeWidth={2}
                  fill="url(#colorBills)"
                  name="Bills (₹)"
                />

                <Area
                  type="monotone"
                  dataKey="groceries"
                  stroke="#22C55E"
                  strokeWidth={2}
                  fill="url(#colorGroceries)"
                  name="Groceries (₹)"
                />

                <Area
                  type="monotone"
                  dataKey="medicines"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  fill="url(#colorMedicines)"
                  name="Medicines (₹)"
                />

              </AreaChart>

            </ResponsiveContainer>

          </div>

        </div>


        {/* RIGHT COLUMN (1/3) */}

        <div className="space-y-6">


          {/* AI */}

          <div
            className="rounded-2xl p-5 text-white relative overflow-hidden"
            style={{
              background:
                'linear-gradient(135deg, #0F1A2E, #162035)'
            }}
          >

            <div className="flex items-center gap-2 mb-4">

              <Bot className="w-5 h-5" />

              <h2 className="font-bold">
                AI Insights
              </h2>

            </div>

            <p className="text-white/50 text-sm">
              AI insights will appear here once you start adding data.
            </p>


            <button
              onClick={() => navigate('/ai-assistant')}
              className="mt-4 w-full rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-2"
              style={{
                background: 'rgba(13,148,136,0.3)',
                border:
                  '1px solid rgba(13,148,136,0.4)'
              }}
            >

              Ask AI Assistant

              <ArrowRight className="w-3.5 h-3.5" />

            </button>

          </div>


          {/* CURRENT FAMILY MEMBER */}

          <div className="bg-white rounded-2xl border border-slate-100 p-5">

            <div className="flex items-center gap-2 mb-4">

              <Users className="w-4 h-4 text-blue-500" />

              <h2 className="font-bold text-slate-800">
                Current Profile
              </h2>

            </div>


            <div className="flex items-center gap-3">

              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                style={{
                  background:
                    'linear-gradient(135deg, #0D9488, #D97706)'
                }}
              >
                {profileName
                  .charAt(0)
                  .toUpperCase()}
              </div>


              <div className="flex-1">

                <p className="text-sm font-semibold text-slate-800">
                  {profileName}
                </p>

                <p className="text-xs text-slate-400">
                  Family member
                </p>

              </div>

            </div>


            <button
              onClick={switchProfile}
              className="mt-4 w-full text-sm font-semibold py-2.5 rounded-xl"
              style={{
                background: 'rgba(13,148,136,0.08)',
                color: '#0D9488'
              }}
            >
              Switch Profile
            </button>

          </div>


          {/* Family Members */}

          <div className="bg-white rounded-2xl border border-slate-100 p-5">

            <div className="flex items-center justify-between mb-4">

              <div className="flex items-center gap-2">

                <Users className="w-4 h-4 text-blue-500" />

                <h2 className="font-bold text-slate-800">
                  Family Members
                </h2>

              </div>

              <span className="text-xs text-slate-400">
                {familyMembers.length} members
              </span>

            </div>


            {familyMembers.length === 0 && (

              <p className="text-sm text-slate-400 text-center py-4">
                No family members added yet.
              </p>

            )}

          </div>


          {/* Recent Activity */}

          <div className="bg-white rounded-2xl border border-slate-100 p-5">

            <div className="flex items-center gap-2 mb-4">

              <Clock className="w-4 h-4 text-slate-400" />

              <h2 className="font-bold text-slate-800">
                Recent Activity
              </h2>

            </div>


            {recentActivity.length === 0 && (

              <p className="text-sm text-slate-400 text-center py-4">
                No activity yet.
              </p>

            )}

          </div>

        </div>

      </div>

    </div>
  )
}