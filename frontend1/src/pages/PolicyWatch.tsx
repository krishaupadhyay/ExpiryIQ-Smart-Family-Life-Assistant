import { useState, useEffect } from 'react'
import { Shield, Plus, AlertTriangle, CheckCircle2, Phone, FileText, ChevronDown, ChevronUp, X, Trash2 } from 'lucide-react'
import { apiRequest } from '../services/api'
import { useAuth } from '../context/AuthContext'

type Policy = {
  _id: string
  familyMemberId: string
  memberName: string
  name: string
  type: string
  insurer: string
  policyNo: string
  sumAssured: string
  premium: number
  startDate?: string | null
  renewalDate: string
  contact: string
}

const typeStyle: Record<string, { emoji: string; color: string }> = {
  Life: { emoji: '❤️', color: 'from-red-400 to-rose-500' },
  Health: { emoji: '🏥', color: 'from-emerald-400 to-teal-500' },
  Vehicle: { emoji: '🚗', color: 'from-amber-400 to-orange-500' },
  Property: { emoji: '🏠', color: 'from-blue-400 to-indigo-500' },
  Other: { emoji: '🛡️', color: 'from-purple-400 to-violet-500' },
}

function getStatus(p: Policy): 'critical' | 'warning' | 'good' {
  const daysToRenewal = Math.ceil((new Date(p.renewalDate).getTime() - Date.now()) / 86400000)
  if (daysToRenewal <= 30) return 'critical'
  if (daysToRenewal <= 90) return 'warning'
  return 'good'
}

const statusConfig = {
  critical: { label: 'Renew Urgently', badge: 'bg-red-100 text-red-600', bar: 'bg-red-500' },
  warning: { label: 'Renewing Soon', badge: 'bg-orange-100 text-orange-600', bar: 'bg-orange-400' },
  good: { label: 'Active', badge: 'bg-green-100 text-green-700', bar: 'bg-green-500' },
}

const emptyForm = {
  familyMemberId: '', name: '', type: '', insurer: '', policyNo: '',
  sumAssured: '', premium: '', startDate: '', renewalDate: '', contact: ''
}

export default function PolicyWatch() {
  const { user } = useAuth()
  const familyMembers = user?.familyMembers || []

  const [policies, setPolicies] = useState<Policy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => { loadPolicies() }, [])

  async function loadPolicies() {
    try {
      setLoading(true)
      setError('')
      const data = await apiRequest('/policies', { method: 'GET' })
      setPolicies(data.policies || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load policies.')
    } finally {
      setLoading(false)
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')

    if (!form.familyMemberId || !form.name.trim() || !form.type || !form.renewalDate) {
      setFormError('Please fill in family member, name, type and renewal date.')
      return
    }

    setFormLoading(true)
    try {
      await apiRequest('/policies', {
        method: 'POST',
        body: JSON.stringify({
          familyMemberId: form.familyMemberId,
          name: form.name.trim(),
          type: form.type,
          insurer: form.insurer.trim(),
          policyNo: form.policyNo.trim(),
          sumAssured: form.sumAssured.trim(),
          premium: Number(form.premium) || 0,
          startDate: form.startDate || null,
          renewalDate: form.renewalDate,
          contact: form.contact.trim()
        })
      })
      await loadPolicies()
      setForm(emptyForm)
      setShowModal(false)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to add policy.')
    } finally {
      setFormLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this policy?')) return
    try {
      await apiRequest(`/policies/${id}`, { method: 'DELETE' })
      setPolicies(prev => prev.filter(p => p._id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete policy.')
    }
  }

  const totalPremium = policies.reduce((sum, p) => sum + p.premium, 0)
  const criticalPolicies = policies.filter(p => getStatus(p) === 'critical')

  const stats = [
    { label: 'Total Policies', value: policies.length, bg: 'bg-purple-50', color: 'text-purple-600' },
    { label: 'Urgent Renewals', value: criticalPolicies.length, bg: 'bg-red-50', color: 'text-red-600' },
    { label: 'Annual Premium', value: `₹${totalPremium.toLocaleString('en-IN')}`, bg: 'bg-blue-50', color: 'text-blue-600' },
    { label: 'Members Covered', value: new Set(policies.map(p => p.memberName)).size, bg: 'bg-green-50', color: 'text-green-600' },
  ]

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="-mx-4 lg:-mx-6 -mt-4 lg:-mt-6 relative h-48 sm:h-56 overflow-hidden bg-purple-900">
        <img src="https://images.unsplash.com/photo-1758227365187-016878604d94?w=1200&h=400&fit=crop&auto=format" alt="Family insurance protection" className="w-full h-full object-cover opacity-55" />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 via-purple-800/55 to-transparent" />
        <div className="absolute inset-0 flex items-end p-5 lg:p-7">
          <div className="flex items-end justify-between w-full gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="text-white/70 text-sm font-semibold tracking-wide uppercase">ExpiryIQ Module</span>
              </div>
              <h1 className="text-3xl font-extrabold text-white drop-shadow">PolicyWatch</h1>
              <p className="text-purple-100 text-sm mt-1">Track all family insurance policies and never miss a renewal</p>
            </div>
            <button onClick={() => setShowModal(true)} disabled={familyMembers.length === 0} className="shrink-0 flex items-center gap-2 bg-white text-purple-700 hover:bg-purple-50 text-sm font-bold px-4 py-2.5 rounded-xl shadow-lg transition-colors disabled:opacity-50">
              <Plus className="w-4 h-4" /> Add Policy
            </button>
          </div>
        </div>
      </div>

      {familyMembers.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-700">
          Add a family member on the profile selection screen first — policies need to be assigned to someone.
        </div>
      )}
      {error && <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-600">{error}</div>}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(({ label, value, bg, color }) => (
          <div key={label} className={`${bg} rounded-2xl p-4`}>
            <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
            <p className="text-slate-600 text-xs font-medium mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {criticalPolicies.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-700 text-sm">Renewal Urgently Required</p>
            <p className="text-red-600 text-xs mt-1">{criticalPolicies.map(p => p.name).join(', ')} — renew now to avoid coverage lapse.</p>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-center text-slate-400 text-sm py-12">Loading…</p>
      ) : policies.length === 0 ? (
        <p className="text-center text-slate-400 text-sm py-12">No policies yet — click "Add Policy" to get started.</p>
      ) : (
        <div className="space-y-3">
          {policies.map(policy => {
            const status = getStatus(policy)
            const cfg = statusConfig[status]
            const style = typeStyle[policy.type] || typeStyle.Other
            const daysToRenewal = Math.ceil((new Date(policy.renewalDate).getTime() - Date.now()) / 86400000)
            const isExpanded = expanded === policy._id

            return (
              <div key={policy._id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 p-4 cursor-pointer" onClick={() => setExpanded(isExpanded ? null : policy._id)}>
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${style.color} flex items-center justify-center text-2xl shrink-0`}>
                    {style.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm">{policy.name}</h3>
                        <p className="text-xs text-slate-400">{policy.type} · {policy.insurer || 'No insurer set'} · {policy.memberName}</p>
                      </div>
                      <span className={`shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full ${cfg.badge}`}>{cfg.label}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                      {policy.sumAssured && <span className="font-semibold text-slate-700">{policy.sumAssured}</span>}
                      <span>Premium: ₹{policy.premium.toLocaleString('en-IN')}/yr</span>
                      <span className={daysToRenewal <= 30 ? 'text-red-500 font-semibold' : ''}>
                        {daysToRenewal > 0 ? `Renews in ${daysToRenewal} days` : 'Renewal overdue'}
                      </span>
                    </div>
                    <div className="mt-2.5 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${cfg.bar}`} style={{ width: `${Math.max(5, Math.min(100, (daysToRenewal / 365) * 100))}%` }} />
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-slate-50 pt-3">
                    <div className="grid sm:grid-cols-3 gap-3 mb-3">
                      {[
                        { label: 'Policy No.', value: policy.policyNo || '—' },
                        { label: 'Start Date', value: policy.startDate ? new Date(policy.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—' },
                        { label: 'Renewal Date', value: new Date(policy.renewalDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
                        { label: 'Sum Assured', value: policy.sumAssured || '—' },
                        { label: 'Covered Member', value: policy.memberName },
                        { label: 'Contact', value: policy.contact || '—' },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-slate-50 rounded-xl p-3">
                          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">{label}</p>
                          <p className="text-sm font-semibold text-slate-800 mt-0.5">{value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      {policy.contact && (
                        <button className="flex items-center gap-2 border border-slate-200 text-slate-600 text-sm font-semibold py-2.5 px-4 rounded-xl hover:bg-slate-50 transition-colors">
                          <Phone className="w-4 h-4" /> Call {policy.contact}
                        </button>
                      )}
                      <button onClick={() => handleDelete(policy._id)} className="flex items-center gap-2 border border-red-200 text-red-500 text-sm font-semibold py-2.5 px-4 rounded-xl hover:bg-red-50 transition-colors ml-auto">
                        <Trash2 className="w-4 h-4" /> Remove
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
              <h3 className="text-lg font-extrabold text-slate-800">Add Policy</h3>
              <button onClick={() => { setShowModal(false); setForm(emptyForm); setFormError('') }} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-3.5">
              <div>
                <label className="text-sm font-semibold text-slate-700">Covered member *</label>
                <select value={form.familyMemberId} onChange={e => setForm({ ...form, familyMemberId: e.target.value })} className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm">
                  <option value="">Select family member</option>
                  {familyMembers.map(m => <option key={m._id} value={m._id}>{m.name} ({m.relation})</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Policy name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Star Health Family Floater" className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Type *</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm">
                  <option value="">Select type</option>
                  {['Life', 'Health', 'Vehicle', 'Property', 'Other'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Insurer</label>
                <input value={form.insurer} onChange={e => setForm({ ...form, insurer: e.target.value })} placeholder="e.g. HDFC ERGO" className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Policy number</label>
                  <input value={form.policyNo} onChange={e => setForm({ ...form, policyNo: e.target.value })} className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Sum assured</label>
                  <input value={form.sumAssured} onChange={e => setForm({ ...form, sumAssured: e.target.value })} placeholder="e.g. ₹10L" className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm" />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Annual premium (₹)</label>
                <input type="number" min="0" value={form.premium} onChange={e => setForm({ ...form, premium: e.target.value })} className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Start date</label>
                  <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Renewal date *</label>
                  <input type="date" value={form.renewalDate} onChange={e => setForm({ ...form, renewalDate: e.target.value })} className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm" />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Contact number</label>
                <input value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} placeholder="e.g. 1800-266-0700" className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm" />
              </div>

              {formError && <p className="text-xs text-red-500">{formError}</p>}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowModal(false); setForm(emptyForm); setFormError('') }} className="flex-1 border border-slate-200 font-semibold py-2.5 rounded-xl text-sm text-slate-600">Cancel</button>
                <button type="submit" disabled={formLoading} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60">
                  {formLoading ? 'Saving…' : 'Save Policy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}