import { useState, useEffect } from 'react'
import { Zap, Plus, CheckCircle2, Clock, AlertTriangle, X, Trash2 } from 'lucide-react'
import { apiRequest } from '../services/api'

type Bill = {
  _id: string
  name: string
  category: string
  provider: string
  accountNo: string
  amount: number
  units: string
  dueDate: string
  alertDaysBefore: number
  paid: boolean
}

const categoryStyle: Record<string, { emoji: string; color: string }> = {
  Electricity: { emoji: '⚡', color: 'from-amber-400 to-orange-500' },
  Water: { emoji: '💧', color: 'from-blue-400 to-cyan-500' },
  Gas: { emoji: '🔥', color: 'from-orange-400 to-red-500' },
  Internet: { emoji: '📶', color: 'from-indigo-400 to-blue-500' },
  LPG: { emoji: '🛢️', color: 'from-red-400 to-orange-500' },
  Society: { emoji: '🏢', color: 'from-slate-400 to-slate-600' },
  Other: { emoji: '📄', color: 'from-gray-400 to-gray-600' },
}

function getStatus(bill: Bill): 'overdue' | 'due-soon' | 'upcoming' | 'paid' {
  if (bill.paid) return 'paid'
  const daysUntil = Math.ceil((new Date(bill.dueDate).getTime() - Date.now()) / 86400000)
  const alertDays = typeof bill.alertDaysBefore === 'number' ? bill.alertDaysBefore : 3
  if (daysUntil < 0) return 'overdue'
  if (daysUntil <= alertDays) return 'due-soon'
  return 'upcoming'
}

const statusConfig = {
  overdue: { label: 'Overdue', badge: 'bg-red-100 text-red-600', border: 'border-red-200' },
  'due-soon': { label: 'Due Soon', badge: 'bg-orange-100 text-orange-600', border: 'border-orange-200' },
  upcoming: { label: 'Upcoming', badge: 'bg-blue-100 text-blue-600', border: 'border-blue-200' },
  paid: { label: 'Paid', badge: 'bg-green-100 text-green-700', border: 'border-green-100' },
}

const emptyForm = { name: '', category: '', provider: '', accountNo: '', amount: '', units: '', dueDate: '', alertDaysBefore: '3' }

export default function UtilityDesk() {
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => { loadBills() }, [])

  async function loadBills() {
    try {
      setLoading(true)
      setError('')
      const data = await apiRequest('/bills', { method: 'GET' })
      setBills(data.bills || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bills.')
    } finally {
      setLoading(false)
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')

    if (!form.name.trim() || !form.category || !form.amount || !form.dueDate) {
      setFormError('Please fill in name, category, amount and due date.')
      return
    }

    setFormLoading(true)
    try {
      await apiRequest('/bills', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name.trim(),
          category: form.category,
          provider: form.provider.trim(),
          accountNo: form.accountNo.trim(),
          amount: Number(form.amount),
          units: form.units.trim(),
          dueDate: form.dueDate,
          alertDaysBefore: form.alertDaysBefore === '' ? 3 : Number(form.alertDaysBefore)
        })
      })
      await loadBills()
      setForm(emptyForm)
      setShowModal(false)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to add bill.')
    } finally {
      setFormLoading(false)
    }
  }

  async function togglePaid(bill: Bill) {
    try {
      await apiRequest(`/bills/${bill._id}`, { method: 'PUT', body: JSON.stringify({ paid: !bill.paid }) })
      setBills(prev => prev.map(b => b._id === bill._id ? { ...b, paid: !b.paid } : b))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update bill.')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this bill?')) return
    try {
      await apiRequest(`/bills/${id}`, { method: 'DELETE' })
      setBills(prev => prev.filter(b => b._id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete bill.')
    }
  }

  const totalDue = bills.filter(b => !b.paid).reduce((sum, b) => sum + b.amount, 0)
  const totalMonthly = bills.reduce((sum, b) => sum + b.amount, 0)
  const overdueCount = bills.filter(b => getStatus(b) === 'overdue').length
  const paidCount = bills.filter(b => b.paid).length

  const overdueBills = bills.filter(b => getStatus(b) === 'overdue')

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="-mx-4 lg:-mx-6 -mt-4 lg:-mt-6 relative h-48 sm:h-56 overflow-hidden bg-amber-900">
        <img src="https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=1200&h=400&fit=crop&auto=format" alt="Smart home thermostat technology" className="w-full h-full object-cover opacity-65" />
        <div className="absolute inset-0 bg-gradient-to-r from-amber-900/90 via-amber-800/50 to-transparent" />
        <div className="absolute inset-0 flex items-end p-5 lg:p-7">
          <div className="flex items-end justify-between w-full gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="text-white/70 text-sm font-semibold tracking-wide uppercase">ExpiryIQ Module</span>
              </div>
              <h1 className="text-3xl font-extrabold text-white drop-shadow">UtilityDesk</h1>
              <p className="text-amber-100 text-sm mt-1">Manage electricity, water, gas, LPG &amp; internet bills in one place</p>
            </div>
            <button onClick={() => setShowModal(true)} className="shrink-0 flex items-center gap-2 bg-white text-amber-700 hover:bg-amber-50 text-sm font-bold px-4 py-2.5 rounded-xl shadow-lg transition-colors">
              <Plus className="w-4 h-4" /> Add Bill
            </button>
          </div>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-600">{error}</div>}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Pending Amount', value: `₹${totalDue.toLocaleString('en-IN')}`, bg: 'bg-red-50', color: 'text-red-600' },
          { label: 'Monthly Total', value: `₹${totalMonthly.toLocaleString('en-IN')}`, bg: 'bg-blue-50', color: 'text-blue-600' },
          { label: 'Overdue Bills', value: overdueCount, bg: 'bg-orange-50', color: 'text-orange-600' },
          { label: 'Paid', value: paidCount, bg: 'bg-green-50', color: 'text-green-600' },
        ].map(({ label, value, bg, color }) => (
          <div key={label} className={`${bg} rounded-2xl p-4`}>
            <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
            <p className="text-slate-600 text-xs font-medium mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {overdueBills.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-700 text-sm">Overdue Bill Alert</p>
            <p className="text-red-600 text-xs mt-1">{overdueBills.map(b => b.name).join(', ')} — pay now to avoid late payment charges.</p>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-center text-slate-400 text-sm py-12">Loading…</p>
      ) : bills.length === 0 ? (
        <p className="text-center text-slate-400 text-sm py-12">No bills yet — click "Add Bill" to get started.</p>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          {bills.map(bill => {
            const status = getStatus(bill)
            const cfg = statusConfig[status]
            const style = categoryStyle[bill.category] || categoryStyle.Other
            const daysUntil = Math.ceil((new Date(bill.dueDate).getTime() - Date.now()) / 86400000)

            return (
              <div key={bill._id} className={`bg-white rounded-2xl border ${cfg.border} p-4 hover:shadow-md transition-shadow`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${style.color} flex items-center justify-center text-2xl shrink-0`}>
                    {style.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm">{bill.name}</h3>
                        <p className="text-xs text-slate-400">{bill.provider || bill.category}{bill.accountNo && ` · ${bill.accountNo}`}</p>
                      </div>
                      <span className={`shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full ${cfg.badge}`}>{cfg.label}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xl font-extrabold text-slate-800">₹{bill.amount.toLocaleString('en-IN')}</span>
                      {bill.units && <span className="text-xs text-slate-500">{bill.units}</span>}
                      <span className={`text-xs ml-auto ${daysUntil < 0 ? 'text-red-500 font-semibold' : daysUntil <= (bill.alertDaysBefore ?? 3) ? 'text-orange-500 font-semibold' : 'text-slate-400'}`}>
                        {daysUntil < 0 ? `${Math.abs(daysUntil)}d overdue` : `Due ${daysUntil === 0 ? 'today' : `in ${daysUntil}d`}`}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <button
                    onClick={() => togglePaid(bill)}
                    className={`flex-1 flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-xl transition-colors ${
                      bill.paid ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-sm shadow-yellow-200'
                    }`}
                  >
                    {bill.paid ? <><CheckCircle2 className="w-4 h-4" /> Paid</> : '⚡ Mark as Paid'}
                  </button>
                  <button onClick={() => handleDelete(bill._id)} className="border border-slate-200 text-slate-500 text-sm font-medium py-2.5 px-4 rounded-xl hover:bg-red-50 hover:text-red-500 hover:border-red-200 flex items-center gap-1.5 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-extrabold text-slate-800">Add Bill</h3>
              <button onClick={() => { setShowModal(false); setForm(emptyForm); setFormError('') }} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-3.5">
              <div>
                <label className="text-sm font-semibold text-slate-700">Bill name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. BESCOM Electricity" className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Category *</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm">
                  <option value="">Select category</option>
                  {['Electricity', 'Water', 'Gas', 'Internet', 'LPG', 'Society', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Provider</label>
                <input value={form.provider} onChange={e => setForm({ ...form, provider: e.target.value })} placeholder="e.g. BESCOM" className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Account number</label>
                <input value={form.accountNo} onChange={e => setForm({ ...form, accountNo: e.target.value })} className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Amount (₹) *</label>
                  <input type="number" min="0" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Units</label>
                  <input value={form.units} onChange={e => setForm({ ...form, units: e.target.value })} placeholder="e.g. 240 kWh" className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm" />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Due date *</label>
                <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Remind me before due date</label>
                <div className="flex items-center gap-2 mt-1.5">
                  <input type="number" min="0" value={form.alertDaysBefore} onChange={e => setForm({ ...form, alertDaysBefore: e.target.value })} className="w-24 px-4 py-2.5 border border-slate-200 rounded-xl text-sm" />
                  <span className="text-sm text-slate-500">day(s) before due date</span>
                </div>
              </div>

              {formError && <p className="text-xs text-red-500">{formError}</p>}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowModal(false); setForm(emptyForm); setFormError('') }} className="flex-1 border border-slate-200 font-semibold py-2.5 rounded-xl text-sm text-slate-600">Cancel</button>
                <button type="submit" disabled={formLoading} className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60">
                  {formLoading ? 'Saving…' : 'Save Bill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
