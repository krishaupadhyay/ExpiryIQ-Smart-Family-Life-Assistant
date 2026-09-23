import { useState } from 'react'
import { Pill, Plus, Search, AlertTriangle, CheckCircle2, Filter, Sun, Moon, Sunset } from 'lucide-react'

const medicines: any[] = []

const schedule = {
  Morning: medicines.filter(m => m.times.includes('Morning')),
  Afternoon: medicines.filter(m => m.times.includes('Afternoon')),
  Night: medicines.filter(m => m.times.includes('Night')),
}

const statusConfig = {
  critical: { label: 'Expiring Soon', color: 'bg-red-100 text-red-600', dot: 'bg-red-500' },
  warning: { label: 'Low Stock', color: 'bg-orange-100 text-orange-600', dot: 'bg-orange-500' },
  good: { label: 'OK', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
}

export default function MediTrack() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [tab, setTab] = useState<'list' | 'schedule'>('list')

  const members = ['All', 'Rajesh', 'Sunita', 'Dadaji', 'Dadiji', 'Priya', 'Aditya']

  const filtered = medicines.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.member.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'All' || m.member === filter
    return matchSearch && matchFilter
  })

  const stats = [
    { label: 'Total Medicines', value: medicines.length, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Expiring in 7 days', value: medicines.filter(m => m.status === 'critical').length, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Low Stock', value: medicines.filter(m => m.status === 'warning').length, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'All Good', value: medicines.filter(m => m.status === 'good').length, color: 'text-green-600', bg: 'bg-green-50' },
  ]

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Hero Banner */}
      <div className="-mx-4 lg:-mx-6 -mt-4 lg:-mt-6 relative h-48 sm:h-56 overflow-hidden bg-red-900">
        <img
          src="https://images.unsplash.com/photo-1683520701495-1888fa4633b1?w=1200&h=400&fit=crop&auto=format"
          alt="Pharmacy and medicines"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-red-900/80 via-red-800/60 to-transparent" />
        <div className="absolute inset-0 flex items-end p-5 lg:p-7">
          <div className="flex items-end justify-between w-full gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                  <Pill className="w-4 h-4 text-white" />
                </div>
                <span className="text-white/70 text-sm font-semibold tracking-wide uppercase">ExpiryIQ Module</span>
              </div>
              <h1 className="text-3xl font-extrabold text-white drop-shadow">MediTrack</h1>
              <p className="text-red-100 text-sm mt-1">Medicine expiry tracker &amp; dosage reminder for the whole family</p>
            </div>
            <button className="shrink-0 flex items-center gap-2 bg-white text-red-700 hover:bg-red-50 text-sm font-bold px-4 py-2.5 rounded-xl shadow-lg transition-colors">
              <Plus className="w-4 h-4" /> Add Medicine
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl p-4`}>
            <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
            <p className="text-slate-600 text-xs font-medium mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-fit">
        {(['list', 'schedule'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
              tab === t ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t === 'list' ? 'All Medicines' : 'Daily Schedule'}
          </button>
        ))}
      </div>

      {tab === 'list' ? (
        <>
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search medicines or family member..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              {members.map(m => (
                <button
                  key={m}
                  onClick={() => setFilter(m)}
                  className={`shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    filter === m ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Medicine Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(med => {
              const cfg = statusConfig[med.status as keyof typeof statusConfig]
              const pct = Math.round((med.remaining / med.total) * 100)
              const daysToExpiry = Math.ceil((new Date(med.expiry).getTime() - Date.now()) / 86400000)
              return (
                <div key={med.id} className="bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                        <Pill className="w-4 h-4 text-red-500" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm">{med.name}</h3>
                        <p className="text-xs text-slate-400">{med.member} · {med.category}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-500 mb-3">
                    <div className="flex justify-between">
                      <span>Dosage: {med.dosage}</span>
                      <span>{med.frequency}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Stock: {med.remaining}/{med.total}</span>
                      <span className={daysToExpiry <= 7 ? 'text-red-500 font-semibold' : ''}>
                        Expires: {new Date(med.expiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} ({daysToExpiry}d)
                      </span>
                    </div>
                  </div>

                  {/* Stock bar */}
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full rounded-full transition-all ${pct > 50 ? 'bg-green-500' : pct > 20 ? 'bg-orange-400' : 'bg-red-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    {med.times.map((t: string) => (
                      <span key={t} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">{t}</span>
                    ))}
                    {med.status !== 'good' && (
                      <button className="ml-auto text-xs font-semibold text-blue-600 hover:underline">Reorder</button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      ) : (
        /* Schedule View */
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            { period: 'Morning', icon: Sun, color: 'text-yellow-500 bg-yellow-50', meds: schedule.Morning },
            { period: 'Afternoon', icon: Sunset, color: 'text-orange-500 bg-orange-50', meds: schedule.Afternoon },
            { period: 'Night', icon: Moon, color: 'text-indigo-500 bg-indigo-50', meds: schedule.Night },
          ].map(({ period, icon: Icon, color, meds }) => (
            <div key={period} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className={`px-4 py-3 flex items-center gap-2 ${color.split(' ')[1]}`}>
                <div className={`w-7 h-7 rounded-lg ${color.split(' ')[1]} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${color.split(' ')[0]}`} />
                </div>
                <span className="font-bold text-slate-800">{period}</span>
                <span className="ml-auto text-xs bg-white/80 text-slate-600 px-2 py-0.5 rounded-full font-medium">{meds.length} meds</span>
              </div>
              <div className="p-3 space-y-2">
                {meds.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">No medicines</p>
                ) : (
                  meds.map(m => (
                    <div key={m.id} className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-xl">
                      <Pill className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-700 truncate">{m.name}</p>
                        <p className="text-[10px] text-slate-400">{m.member} · {m.dosage}</p>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-slate-300 shrink-0" />
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Expiry Alert */}
      {medicines.filter(m => m.status === 'critical').length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-700 text-sm">Urgent: Medicines expiring soon</p>
            <p className="text-red-600 text-xs mt-1">
              {medicines.filter(m => m.status === 'critical').map(m => m.name).join(', ')} — please reorder immediately to avoid any treatment gaps.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
