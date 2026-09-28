import { useState, useEffect } from 'react'
import { Wrench, Plus, AlertTriangle, Clock, CalendarClock, X, Trash2 } from 'lucide-react'
import { apiRequest } from '../services/api'

type Appliance = {
  _id: string
  name: string
  category: string
  brand: string
  model: string
  warrantyExpiry: string
  alertDaysBefore: number
  lastService?: string | null
  nextService?: string | null
  notes: string
}

const categoryIcon: Record<string, string> = {
  'Air Conditioner': '❄️', 'Washing Machine': '🌀', 'Refrigerator': '🧊', 'Television': '📺',
  'Water Purifier': '💧', 'Microwave': '📦', 'Fan': '🌬️', 'Gas Stove': '🔥', 'Other': '🔧'
}

const categories = ['All', 'Air Conditioner', 'Washing Machine', 'Refrigerator', 'Television', 'Water Purifier', 'Microwave', 'Fan', 'Gas Stove', 'Other']

function getStatus(a: Appliance): 'service-due' | 'warning' | 'good' {
  if (a.nextService) {
    const daysToService = Math.ceil((new Date(a.nextService).getTime() - Date.now()) / 86400000)
    if (daysToService <= 0) return 'service-due'
    if (daysToService <= 14) return 'warning'
  }
  const warrantyDays = Math.ceil((new Date(a.warrantyExpiry).getTime() - Date.now()) / 86400000)
  const alertDays = typeof a.alertDaysBefore === 'number' ? a.alertDaysBefore : 30
  if (warrantyDays <= alertDays && warrantyDays > 0) return 'warning'
  return 'good'
}

const statusConfig = {
  'service-due': { label: 'Service Due', badge: 'bg-red-100 text-red-600' },
  warning: { label: 'Needs Attention', badge: 'bg-orange-100 text-orange-600' },
  good: { label: 'All Good', badge: 'bg-green-100 text-green-700' },
}

const emptyForm = { name: '', category: '', brand: '', model: '', warrantyExpiry: '', alertDaysBefore: '30', lastService: '', nextService: '', notes: '' }

export default function HomeCare() {
  const [appliances, setAppliances] = useState<Appliance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [category, setCategory] = useState('All')
  const [selected, setSelected] = useState<string | null>(null)

  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => { loadAppliances() }, [])

  async function loadAppliances() {
    try {
      setLoading(true)
      setError('')
      const data = await apiRequest('/appliances', { method: 'GET' })
      setAppliances(data.appliances || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load appliances.')
    } finally {
      setLoading(false)
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')

    if (!form.name.trim() || !form.category || !form.warrantyExpiry) {
      setFormError('Please fill in name, category and warranty expiry.')
      return
    }

    setFormLoading(true)
    try {
      await apiRequest('/appliances', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name.trim(),
          category: form.category,
          brand: form.brand.trim(),
          model: form.model.trim(),
          warrantyExpiry: form.warrantyExpiry,
          alertDaysBefore: form.alertDaysBefore === '' ? 30 : Number(form.alertDaysBefore),
          lastService: form.lastService || null,
          nextService: form.nextService || null,
          notes: form.notes.trim()
        })
      })
      await loadAppliances()
      setForm(emptyForm)
      setShowModal(false)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to add appliance.')
    } finally {
      setFormLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this appliance?')) return
    try {
      await apiRequest(`/appliances/${id}`, { method: 'DELETE' })
      setAppliances(prev => prev.filter(a => a._id !== id))
      if (selected === id) setSelected(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete appliance.')
    }
  }

  const filtered = appliances.filter(a => category === 'All' || a.category === category)
  const serviceDueList = appliances.filter(a => getStatus(a) === 'service-due')

  const stats = [
    { label: 'Total Appliances', value: appliances.length, bg: 'bg-orange-50', color: 'text-orange-600' },
    { label: 'Service Due', value: serviceDueList.length, bg: 'bg-red-50', color: 'text-red-600' },
    { label: 'Need Attention', value: appliances.filter(a => getStatus(a) === 'warning').length, bg: 'bg-yellow-50', color: 'text-yellow-600' },
    { label: 'Under Warranty', value: appliances.filter(a => new Date(a.warrantyExpiry) > new Date()).length, bg: 'bg-green-50', color: 'text-green-600' },
  ]

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="-mx-4 lg:-mx-6 -mt-4 lg:-mt-6 relative h-48 sm:h-56 overflow-hidden bg-orange-900">
        <img src="https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?w=1200&h=400&fit=crop&auto=format" alt="Home appliances washer and dryer" className="w-full h-full object-cover opacity-60" />
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
            <button onClick={() => setShowModal(true)} className="shrink-0 flex items-center gap-2 bg-white text-orange-700 hover:bg-orange-50 text-sm font-bold px-4 py-2.5 rounded-xl shadow-lg transition-colors">
              <Plus className="w-4 h-4" /> Add Appliance
            </button>
          </div>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-600">{error}</div>}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(({ label, value, bg, color }) => (
          <div key={label} className={`${bg} rounded-2xl p-4`}>
            <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
            <p className="text-slate-600 text-xs font-medium mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {serviceDueList.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-orange-800 text-sm">Appliance Service Required</p>
            <p className="text-orange-700 text-xs mt-1">{serviceDueList.map(a => a.name).join(', ')} — schedule service immediately.</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map(c => (
          <button key={c} onClick={() => setCategory(c)} className={`shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${category === c ? 'bg-orange-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-orange-300'}`}>
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-slate-400 text-sm py-12">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-slate-400 text-sm py-12">No appliances yet — click "Add Appliance" to get started.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(appliance => {
            const status = getStatus(appliance)
            const cfg = statusConfig[status]
            const warrantyActive = new Date(appliance.warrantyExpiry) > new Date()
            const warrantyDaysLeft = Math.ceil((new Date(appliance.warrantyExpiry).getTime() - Date.now()) / 86400000)
            const isSelected = selected === appliance._id

            return (
              <div key={appliance._id} className="bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelected(isSelected ? null : appliance._id)}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl border border-slate-100">
                    {categoryIcon[appliance.category] || '🔧'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="font-bold text-slate-800 text-sm leading-snug">{appliance.name}</h3>
                      <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>{cfg.label}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{appliance.brand}{appliance.model && ` · ${appliance.model}`}</p>
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
                      <span className="text-slate-700 font-medium">{new Date(appliance.nextService).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}</span>
                    </div>
                  )}
                  {appliance.lastService && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Last Service:</span>
                      <span className="text-slate-700 font-medium">{new Date(appliance.lastService).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}</span>
                    </div>
                  )}
                </div>

                {isSelected && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                    {appliance.notes && <p className="text-xs text-slate-500 italic">{appliance.notes}</p>}
                    <div className="flex gap-2 mt-2">
                      <button onClick={(e) => e.stopPropagation()} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors">
                        <CalendarClock className="w-3.5 h-3.5" /> Book Service
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(appliance._id) }} className="flex-1 border border-red-200 text-red-500 text-xs font-semibold py-2 rounded-xl flex items-center justify-center gap-1.5 hover:bg-red-50 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-extrabold text-slate-800">Add Appliance</h3>
              <button onClick={() => { setShowModal(false); setForm(emptyForm); setFormError('') }} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-3.5">
              <div>
                <label className="text-sm font-semibold text-slate-700">Appliance name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. LG Front Load Washing Machine" className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Category *</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm">
                  <option value="">Select category</option>
                  {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Brand</label>
                  <input value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Model</label>
                  <input value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm" />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Warranty expiry *</label>
                <input type="date" value={form.warrantyExpiry} onChange={e => setForm({ ...form, warrantyExpiry: e.target.value })} className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Remind me before warranty expires</label>
                <div className="flex items-center gap-2 mt-1.5">
                  <input type="number" min="0" value={form.alertDaysBefore} onChange={e => setForm({ ...form, alertDaysBefore: e.target.value })} className="w-24 px-4 py-2.5 border border-slate-200 rounded-xl text-sm" />
                  <span className="text-sm text-slate-500">day(s) before expiry</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Last service</label>
                  <input type="date" value={form.lastService} onChange={e => setForm({ ...form, lastService: e.target.value })} className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Next service</label>
                  <input type="date" value={form.nextService} onChange={e => setForm({ ...form, nextService: e.target.value })} className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm" />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Notes</label>
                <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Optional" className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm" />
              </div>

              {formError && <p className="text-xs text-red-500">{formError}</p>}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowModal(false); setForm(emptyForm); setFormError('') }} className="flex-1 border border-slate-200 font-semibold py-2.5 rounded-xl text-sm text-slate-600">Cancel</button>
                <button type="submit" disabled={formLoading} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60">
                  {formLoading ? 'Saving…' : 'Save Appliance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
