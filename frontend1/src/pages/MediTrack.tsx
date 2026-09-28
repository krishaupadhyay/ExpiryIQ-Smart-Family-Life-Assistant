import { useState, useEffect } from 'react'
import { Pill, Plus, Search, AlertTriangle, CheckCircle2, Filter, Sun, Moon, Sunset, X, Trash2, Camera, Upload, Loader2, Sparkles, Bell } from 'lucide-react'
import { apiRequest } from '../services/api'
import { useAuth } from '../context/AuthContext'

// Point this at wherever the Python OCR microservice is running.
const OCR_SERVICE_URL = 'http://localhost:5001'

type Medicine = {
  _id: string
  familyMemberId: string
  memberName: string
  name: string
  category: string
  dosage: string
  frequency: string
  times: string[]
  doseTimes: string[]
  alertDaysBefore: number
  total: number
  remaining: number
  expiry: string
  mfgDate?: string | null
  source?: 'manual' | 'scan'
}

const statusConfig = {
  critical: { label: 'Expiring Soon', color: 'bg-red-100 text-red-600', dot: 'bg-red-500' },
  warning: { label: 'Low Stock', color: 'bg-orange-100 text-orange-600', dot: 'bg-orange-500' },
  good: { label: 'OK', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
}

// Same status logic your original static data implied: expiry within the item's
// own alert window wins over stock level
function getStatus(med: Medicine): keyof typeof statusConfig {
  const alertDays = typeof med.alertDaysBefore === 'number' ? med.alertDaysBefore : 7
  const daysToExpiry = Math.ceil((new Date(med.expiry).getTime() - Date.now()) / 86400000)
  if (daysToExpiry <= alertDays) return 'critical'
  if (med.total > 0 && med.remaining / med.total <= 0.2) return 'warning'
  return 'good'
}

const emptyForm = {
  familyMemberId: '',
  name: '',
  category: '',
  dosage: '',
  frequency: '',
  times: [] as string[],
  doseTimes: [] as string[],
  alertDaysBefore: '7', alertTime: '08:00',
  total: '',
  remaining: '',
  expiry: '',
  mfgDate: '',
  source: 'manual' as 'manual' | 'scan'
}

// If the OCR/AI pipeline ever returns a partial date (YYYY-MM instead of
// YYYY-MM-DD), pad it so it doesn't silently fail to fill the <input type="date">.
function toFullDate(value: string | null | undefined): string {
  if (!value) return ''
  if (value.length === 7) return `${value}-01` // "2027-08" -> "2027-08-01"
  return value.slice(0, 10)
}

export default function MediTrack() {
  const { user } = useAuth()
  const familyMembers = user?.familyMembers || []

  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [tab, setTab] = useState<'list' | 'schedule'>('list')

  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  // OCR scan panel state — separate from the manual form fields above
  const [scanMode, setScanMode] = useState(false)
  const [scanPreview, setScanPreview] = useState<string | null>(null)
  const [scanLoading, setScanLoading] = useState(false)
  const [scanError, setScanError] = useState('')

  useEffect(() => {
    loadMedicines()
  }, [])

  async function loadMedicines() {
    try {
      setLoading(true)
      setError('')
      const data = await apiRequest('/medicines', { method: 'GET' })
      setMedicines(data.medicines || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load medicines.')
    } finally {
      setLoading(false)
    }
  }

  function toggleTime(t: string) {
    setForm(prev => ({
      ...prev,
      times: prev.times.includes(t) ? prev.times.filter(x => x !== t) : [...prev.times, t]
    }))
  }

  // ===============================
  // DOSE TIME HELPERS — the actual clock times used to fire push reminders
  // ===============================
  function addDoseTime() {
    setForm(prev => ({ ...prev, doseTimes: [...prev.doseTimes, '08:00'] }))
  }

  function updateDoseTime(index: number, value: string) {
    setForm(prev => ({
      ...prev,
      doseTimes: prev.doseTimes.map((t, i) => (i === index ? value : t))
    }))
  }

  function removeDoseTime(index: number) {
    setForm(prev => ({ ...prev, doseTimes: prev.doseTimes.filter((_, i) => i !== index) }))
  }

  async function handleScanImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setScanPreview(URL.createObjectURL(file))
    setScanError('')
    setScanLoading(true)

    const formData = new FormData()
    formData.append('image', file)

    try {
      const res = await fetch(`${OCR_SERVICE_URL}/api/scan`, {
        method: 'POST',
        body: formData
      })
      const data = await res.json()

      if (data.error && !data.item_name) {
        setScanError(data.error)
        return
      }

      // Pre-fill the manual form with whatever OCR + the model found.
      // User still confirms/fills the rest (family member, dosage, stock) manually.
      setForm(prev => ({
        ...prev,
        name: data.item_name || prev.name,
        expiry: toFullDate(data.expiry_date) || prev.expiry,
        mfgDate: toFullDate(data.mfg_date) || prev.mfgDate,
        source: 'scan'
      }))
      setScanMode(false) // back to the normal form, now pre-filled
    } catch (err) {
      setScanError('Could not reach the scanning service. Is it running on port 5001?')
    } finally {
      setScanLoading(false)
    }
  }

  async function handleAddMedicine(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')

    if (!form.familyMemberId || !form.name.trim() || !form.dosage.trim() || !form.total || !form.remaining || !form.expiry) {
      setFormError('Please fill in family member, name, dosage, stock and expiry date.')
      return
    }

    setFormLoading(true)
    try {
      await apiRequest('/medicines', {
        method: 'POST',
        body: JSON.stringify({
          familyMemberId: form.familyMemberId,
          name: form.name.trim(),
          category: form.category.trim() || 'General',
          dosage: form.dosage.trim(),
          frequency: form.frequency.trim(),
          times: form.times,
          doseTimes: form.doseTimes,
          alertDaysBefore: form.alertDaysBefore === '' ? 7 : Number(form.alertDaysBefore), alertTime: form.alertTime || '08:00',
          total: Number(form.total),
          remaining: Number(form.remaining),
          expiry: form.expiry,
          mfgDate: form.mfgDate || null,
          source: form.source
        })
      })

      await loadMedicines()
      setForm(emptyForm)
      setShowModal(false)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to add medicine.')
    } finally {
      setFormLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this medicine?')) return
    try {
      await apiRequest(`/medicines/${id}`, { method: 'DELETE' })
      setMedicines(prev => prev.filter(m => m._id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete medicine.')
    }
  }

  const members = ['All', ...familyMembers.map(m => m.name)]

  const filtered = medicines.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.memberName.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'All' || m.memberName === filter
    return matchSearch && matchFilter
  })

  const schedule = {
    Morning: medicines.filter(m => m.times.includes('Morning')),
    Afternoon: medicines.filter(m => m.times.includes('Afternoon')),
    Night: medicines.filter(m => m.times.includes('Night')),
  }

  const stats = [
    { label: 'Total Medicines', value: medicines.length, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Expiring Soon', value: medicines.filter(m => getStatus(m) === 'critical').length, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Low Stock', value: medicines.filter(m => getStatus(m) === 'warning').length, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'All Good', value: medicines.filter(m => getStatus(m) === 'good').length, color: 'text-green-600', bg: 'bg-green-50' },
  ]

  const criticalMeds = medicines.filter(m => getStatus(m) === 'critical')

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
            <button
              onClick={() => setShowModal(true)}
              disabled={familyMembers.length === 0}
              className="shrink-0 flex items-center gap-2 bg-white text-red-700 hover:bg-red-50 text-sm font-bold px-4 py-2.5 rounded-xl shadow-lg transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" /> Add Medicine
            </button>
          </div>
        </div>
      </div>

      {familyMembers.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-700">
          Add a family member on the profile selection screen first — medicines need to be assigned to someone.
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-600">{error}</div>
      )}

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

      {loading ? (
        <p className="text-center text-slate-400 text-sm py-12">Loading…</p>
      ) : tab === 'list' ? (
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
          {filtered.length === 0 ? (
            <p className="text-center text-slate-400 text-sm py-12">No medicines yet — click "Add Medicine" to get started.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(med => {
                const status = getStatus(med)
                const cfg = statusConfig[status]
                const pct = med.total > 0 ? Math.round((med.remaining / med.total) * 100) : 0
                const daysToExpiry = Math.ceil((new Date(med.expiry).getTime() - Date.now()) / 86400000)
                return (
                  <div key={med._id} className="bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                          <Pill className="w-4 h-4 text-red-500" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-sm">{med.name}</h3>
                          <p className="text-xs text-slate-400">{med.memberName} · {med.category}</p>
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
                        <span className={daysToExpiry <= (med.alertDaysBefore ?? 7) ? 'text-red-500 font-semibold' : ''}>
                          Expires: {new Date(med.expiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} ({daysToExpiry}d)
                        </span>
                      </div>
                    </div>

                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                      <div
                        className={`h-full rounded-full transition-all ${pct > 50 ? 'bg-green-500' : pct > 20 ? 'bg-orange-400' : 'bg-red-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {med.times.map((t: string) => (
                        <span key={t} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">{t}</span>
                      ))}
                      {med.doseTimes && med.doseTimes.length > 0 && (
                        <span className="flex items-center gap-1 text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                          <Bell className="w-2.5 h-2.5" /> {med.doseTimes.join(', ')}
                        </span>
                      )}
                      <button
                        onClick={() => handleDelete(med._id)}
                        className="ml-auto text-slate-300 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
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
                    <div key={m._id} className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-xl">
                      <Pill className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-700 truncate">{m.name}</p>
                        <p className="text-[10px] text-slate-400">
                          {m.memberName} · {m.dosage}{m.doseTimes && m.doseTimes.length > 0 ? ` · ${m.doseTimes.join(', ')}` : ''}
                        </p>
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
      {criticalMeds.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-700 text-sm">Urgent: Medicines expiring soon</p>
            <p className="text-red-600 text-xs mt-1">
              {criticalMeds.map(m => m.name).join(', ')} — please reorder immediately to avoid any treatment gaps.
            </p>
          </div>
        </div>
      )}

      {/* Add Medicine Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-extrabold text-slate-800">Add Medicine</h3>
              <button onClick={() => { setShowModal(false); setForm(emptyForm); setFormError(''); setScanMode(false); setScanPreview(null); setScanError('') }} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Manual / Scan toggle */}
            <div className="flex gap-2 bg-slate-100 p-1 rounded-xl mb-5">
              <button
                type="button"
                onClick={() => setScanMode(false)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${!scanMode ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500'}`}
              >
                Manual Entry
              </button>
              <button
                type="button"
                onClick={() => setScanMode(true)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all ${scanMode ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500'}`}
              >
                <Sparkles className="w-3.5 h-3.5" /> Scan Photo
              </button>
            </div>

            {scanMode ? (
              <div className="space-y-4">
                {!scanPreview ? (
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center">
                    <Camera className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-500 mb-4">
                      Take a photo or upload an image of the medicine strip — we'll try to read the name and expiry date automatically.
                    </p>
                    <label className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm cursor-pointer">
                      <Upload className="w-4 h-4" /> Choose Image
                      <input type="file" accept="image/*" capture="environment" onChange={handleScanImage} className="hidden" />
                    </label>
                  </div>
                ) : (
                  <img src={scanPreview} alt="Scanned label preview" className="w-full max-h-52 object-contain rounded-xl border border-slate-100" />
                )}

                {scanLoading && (
                  <div className="flex items-center justify-center gap-2 py-4 text-sm text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin" /> Reading label…
                  </div>
                )}

                {scanError && (
                  <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-sm text-rose-600">
                    {scanError}
                  </div>
                )}

                {scanPreview && !scanLoading && (
                  <button
                    type="button"
                    onClick={() => { setScanPreview(null); setScanError('') }}
                    className="w-full border border-slate-200 font-semibold py-2.5 rounded-xl text-sm text-slate-600"
                  >
                    Try a different photo
                  </button>
                )}
              </div>
            ) : (
            <>
            {form.source === 'scan' && (form.name || form.expiry) && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-start gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-700">
                  Filled in from your scan — please check the details below and fill in the rest.
                </p>
              </div>
            )}

            <form onSubmit={handleAddMedicine} className="space-y-3.5">
              <div>
                <label className="text-sm font-semibold text-slate-700">For (family member) *</label>
                <select
                  value={form.familyMemberId}
                  onChange={e => setForm({ ...form, familyMemberId: e.target.value })}
                  className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
                >
                  <option value="">Select family member</option>
                  {familyMembers.map(m => (
                    <option key={m._id} value={m._id}>{m.name} ({m.relation})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">Medicine name *</label>
                <input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Metformin 500mg"
                  className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">Category</label>
                <input
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  placeholder="e.g. Diabetes"
                  className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">Dosage *</label>
                <input
                  value={form.dosage}
                  onChange={e => setForm({ ...form, dosage: e.target.value })}
                  placeholder="e.g. 1 tablet"
                  className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">Frequency</label>
                <input
                  value={form.frequency}
                  onChange={e => setForm({ ...form, frequency: e.target.value })}
                  placeholder="e.g. Twice daily"
                  className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">Time of day</label>
                <div className="flex gap-2 mt-1.5">
                  {['Morning', 'Afternoon', 'Night'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleTime(t)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        form.times.includes(t) ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Exact dose reminder times — these drive the actual browser push notifications */}
              <div>
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-blue-500" /> Reminder times
                </label>
                <p className="text-xs text-slate-400 mt-0.5 mb-2">
                  We'll send a browser notification at each time you add below.
                </p>
                <div className="space-y-2">
                  {form.doseTimes.map((time, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="time"
                        value={time}
                        onChange={e => updateDoseTime(i, e.target.value)}
                        className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeDoseTime(i)}
                        className="text-slate-300 hover:text-red-500 transition-colors shrink-0"
                        title="Remove this reminder"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addDoseTime}
                    className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add reminder time
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Total stock *</label>
                  <input
                    type="number"
                    min="0"
                    value={form.total}
                    onChange={e => setForm({ ...form, total: e.target.value })}
                    className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Remaining *</label>
                  <input
                    type="number"
                    min="0"
                    value={form.remaining}
                    onChange={e => setForm({ ...form, remaining: e.target.value })}
                    className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Mfg date</label>
                  <input
                    type="date"
                    value={form.mfgDate}
                    onChange={e => setForm({ ...form, mfgDate: e.target.value })}
                    className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Expiry date *</label>
                  <input
                    type="date"
                    value={form.expiry}
                    onChange={e => setForm({ ...form, expiry: e.target.value })}
                    className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">Remind me before expiry</label>
                <div className="flex items-center gap-2 mt-1.5">
                  <input
                    type="number"
                    min="0"
                    value={form.alertDaysBefore}
                    onChange={e => setForm({ ...form, alertDaysBefore: e.target.value })}
                    className="w-24 px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
                  />
                  <span className="text-sm text-slate-500">day(s) before expiry</span>
                </div>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="text-sm text-slate-500">at</span>
                  <input type="time" value={form.alertTime} onChange={e => setForm({ ...form, alertTime: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-xl text-sm" />
                  {([['Morning', '08:00'], ['Afternoon', '14:00'], ['Night', '20:00']] as const).map(([label, t]) => (
                    <button key={label} type="button" onClick={() => setForm({ ...form, alertTime: t })} className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${form.alertTime === t ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{label}</button>
                  ))}
                </div>
              </div>

              {formError && <p className="text-xs text-red-500">{formError}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setForm(emptyForm); setFormError(''); setScanMode(false); setScanPreview(null) }}
                  className="flex-1 border border-slate-200 font-semibold py-2.5 rounded-xl text-sm text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60"
                >
                  {formLoading ? 'Saving…' : 'Save Medicine'}
                </button>
              </div>
            </form>
            </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
