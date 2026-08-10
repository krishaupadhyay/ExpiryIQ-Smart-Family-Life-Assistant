import { useState } from 'react'
import { Wrench, Plus, AlertTriangle, Clock, CalendarClock } from 'lucide-react'

const appliances: any[] = []

const statusConfig = {
  'service-due': { label: 'Service Due', badge: 'bg-red-100 text-red-600', dot: 'bg-red-500' },
  warning: { label: 'Needs Attention', badge: 'bg-orange-100 text-orange-600', dot: 'bg-orange-400' },
  good: { label: 'All Good', badge: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
}

const categories = ['All', 'Air Conditioner', 'Washing Machine', 'Refrigerator', 'Television', 'Water Purifier', 'Microwave', 'Fan', 'Gas Stove']

export default function HomeCare() {
  const [category, setCategory] = useState('All')
  const [selected, setSelected] = useState<number | null>(null)

  const filtered = appliances.filter(a => category === 'All' || a.category === category)

  const stats = [
    { label: 'Total Appliances', value: appliances.length, bg: 'bg-orange-50', color: 'text-orange-600' },
    { label: 'Service Due', value: appliances.filter(a => a.status === 'service-due').length, bg: 'bg-red-50', color: 'text-red-600' },
    { label: 'Need Attention', value: appliances.filter(a => a.status === 'warning').length, bg: 'bg-yellow-50', color: 'text-yellow-600' },
    { label: 'Under Warranty', value: appliances.filter(a => new Date(a.warrantyExpiry) > new Date()).length, bg: 'bg-green-50', color: 'text-green-600' },
  ]

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Hero Banner */}
      <div className="-mx-4 lg:-mx-6 -mt-4 lg:-mt-6 relative h-48 sm:h-56 overflow-hidden bg-orange-900">
        <img
          src="https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?w=1200&h=400&fit=crop&auto=format"
          alt="Home appliances washer and dryer"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-orange-900/90 via-orange-800/55 to-transparent" />
        <div className="absolute inset-0 flex items-end p-5 lg:p-7">
          <div className="flex items-end justify-between w-full gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                  <Wrench className="w-4 h-4 text-white" />
                </div>
                <span className="text-white/70 text-sm font-semibold tracking-wide uppercase">ExpiryIQ Module</span>
              </div>
              <h1 className="text-3xl font-extrabold text-white drop-shadow">HomeCare</h1>
              <p className="text-orange-100 text-sm mt-1">Track appliance warranties, service schedules &amp; maintenance reminders</p>
            </div>
            <button className="shrink-0 flex items-center gap-2 bg-white text-orange-700 hover:bg-orange-50 text-sm font-bold px-4 py-2.5 rounded-xl shadow-lg transition-colors">
              <Plus className="w-4 h-4" /> Add Appliance
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(({ label, value, bg, color }) => (
          <div key={label} className={`${bg} rounded-2xl p-4`}>
            <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
            <p className="text-slate-600 text-xs font-medium mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Alert */}
      {appliances.some(a => a.status === 'service-due') && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-orange-800 text-sm">Appliance Service Required</p>
            <p className="text-orange-700 text-xs mt-1">LG Washing Machine service is overdue. Schedule immediately to avoid machine damage.</p>
          </div>
        </div>
      )}

      {/* Category filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              category === c ? 'bg-orange-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-orange-300'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Appliances Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(appliance => {
          const cfg = statusConfig[appliance.status as keyof typeof statusConfig]
          const warrantyActive = new Date(appliance.warrantyExpiry) > new Date()
          const warrantyDaysLeft = Math.ceil((new Date(appliance.warrantyExpiry).getTime() - Date.now()) / 86400000)
          const isSelected = selected === appliance.id

          return (
            <div
              key={appliance.id}
              className="bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelected(isSelected ? null : appliance.id)}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl border border-slate-100">
                  {appliance.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <h3 className="font-bold text-slate-800 text-sm leading-snug">{appliance.name}</h3>
                    <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>{cfg.label}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{appliance.brand} · {appliance.model}</p>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Warranty:</span>
                  <span className={`font-semibold ${warrantyActive ? 'text-green-600' : 'text-red-500'}`}>
                    {warrantyActive ? `Active · ${warrantyDaysLeft}d left` : 'Expired'}
                  </span>
                </div>
                {appliance.nextService && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Next Service:</span>
                    <span className="text-slate-700 font-medium">
                      {new Date(appliance.nextService).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </span>
                  </div>
                )}
                {appliance.lastService && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Last Service:</span>
                    <span className="text-slate-700 font-medium">
                      {new Date(appliance.lastService).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </span>
                  </div>
                )}
              </div>

              {isSelected && (
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                  <p className="text-xs text-slate-500 italic">{appliance.notes}</p>
                  <div className="flex gap-2 mt-2">
                    <button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors">
                      <CalendarClock className="w-3.5 h-3.5" /> Book Service
                    </button>
                    <button className="flex-1 border border-slate-200 text-slate-600 text-xs font-semibold py-2 rounded-xl flex items-center justify-center gap-1.5 hover:bg-slate-50 transition-colors">
                      <Clock className="w-3.5 h-3.5" /> View History
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
