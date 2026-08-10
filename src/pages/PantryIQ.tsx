import { useState } from 'react'
import { ShoppingBasket, Plus, Search, Bot, RefreshCw, Filter, TrendingDown } from 'lucide-react'

const categories = ['All', 'Grains & Dal', 'Dairy', 'Vegetables', 'Spices', 'Oils & Ghee', 'Snacks', 'Beverages']

const items: any[] = []

const aiSuggestions: any[] = []

const statusConfig = {
  critical: { label: 'Out / Critical', bar: 'bg-red-500', badge: 'bg-red-100 text-red-600' },
  low: { label: 'Low Stock', bar: 'bg-orange-400', badge: 'bg-orange-100 text-orange-600' },
  good: { label: 'Sufficient', bar: 'bg-green-500', badge: 'bg-green-100 text-green-700' },
}

export default function PantryIQ() {
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = items.filter(item => {
    const matchCat = category === 'All' || item.category === category
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const stats = [
    { label: 'Total Items', value: items.length, bg: 'bg-green-50', color: 'text-green-600' },
    { label: 'Critical / Out', value: items.filter(i => i.status === 'critical').length, bg: 'bg-red-50', color: 'text-red-600' },
    { label: 'Low Stock', value: items.filter(i => i.status === 'low').length, bg: 'bg-orange-50', color: 'text-orange-600' },
    { label: 'Expiring This Week', value: items.filter(i => Math.ceil((new Date(i.expiry).getTime() - Date.now()) / 86400000) <= 7).length, bg: 'bg-yellow-50', color: 'text-yellow-600' },
  ]

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Hero Banner */}
      <div className="-mx-4 lg:-mx-6 -mt-4 lg:-mt-6 relative h-48 sm:h-56 overflow-hidden bg-green-900">
        <img
          src="https://images.unsplash.com/photo-1716816211590-c15a328a5ff0?w=1200&h=400&fit=crop&auto=format"
          alt="Indian spices and groceries"
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/85 via-green-800/50 to-transparent" />
        <div className="absolute inset-0 flex items-end p-5 lg:p-7">
          <div className="flex items-end justify-between w-full gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                  <ShoppingBasket className="w-4 h-4 text-white" />
                </div>
                <span className="text-white/70 text-sm font-semibold tracking-wide uppercase">ExpiryIQ Module</span>
              </div>
              <h1 className="text-3xl font-extrabold text-white drop-shadow">PantryIQ</h1>
              <p className="text-green-100 text-sm mt-1">Smart grocery &amp; pantry inventory tracker for your kitchen</p>
            </div>
            <button className="shrink-0 flex items-center gap-2 bg-white text-green-700 hover:bg-green-50 text-sm font-bold px-4 py-2.5 rounded-xl shadow-lg transition-colors">
              <Plus className="w-4 h-4" /> Add Item
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

      {/* AI Suggestions */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-2 mb-3">
          <Bot className="w-4 h-4" />
          <span className="font-bold text-sm">AI Grocery Suggestions</span>
        </div>
        <div className="space-y-2">
          {aiSuggestions.map((s, i) => (
            <div key={i} className="bg-white/15 rounded-xl px-3 py-2.5 flex items-start gap-2.5">
              <TrendingDown className={`w-4 h-4 mt-0.5 shrink-0 ${s.priority === 'high' ? 'text-red-300' : s.priority === 'medium' ? 'text-yellow-300' : 'text-green-300'}`} />
              <p className="text-sm">{s.text}</p>
            </div>
          ))}
        </div>
        <button className="mt-3 bg-white/20 hover:bg-white/30 transition-colors rounded-xl w-full py-2 text-sm font-semibold flex items-center justify-center gap-2">
          <RefreshCw className="w-3.5 h-3.5" /> Generate Full Shopping List
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search items..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                category === c ? 'bg-green-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-green-300'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(item => {
          const cfg = statusConfig[item.status as keyof typeof statusConfig]
          const pct = typeof item.quantity === 'number' && typeof item.maxQty === 'number'
            ? Math.round((item.quantity / item.maxQty) * 100)
            : 50
          const daysToExpiry = Math.ceil((new Date(item.expiry).getTime() - Date.now()) / 86400000)
          return (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{item.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{item.category}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>{cfg.label}</span>
              </div>

              <div className="flex items-end justify-between mb-2">
                <span className="text-xl font-extrabold text-slate-800">
                  {item.quantity} <span className="text-sm font-normal text-slate-400">{item.unit}</span>
                </span>
                <span className="text-xs text-slate-400">of {item.maxQty} {item.unit}</span>
              </div>

              <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
                <div className={`h-full rounded-full ${cfg.bar}`} style={{ width: `${Math.max(pct, 2)}%` }} />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className={daysToExpiry <= 7 ? 'text-red-500 font-semibold' : ''}>
                  Exp: {new Date(item.expiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                </span>
                {item.status !== 'good' && (
                  <button className="text-green-600 font-semibold hover:underline">+ Reorder</button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
