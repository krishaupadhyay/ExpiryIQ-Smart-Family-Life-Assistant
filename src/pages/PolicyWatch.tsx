import { useState } from 'react'
import { Shield, Plus, AlertTriangle, CheckCircle2, Phone, FileText, ChevronDown, ChevronUp } from 'lucide-react'

const policies: any[] = []

const statusConfig = {
  critical: { label: 'Renew Urgently', badge: 'bg-red-100 text-red-600', dot: 'bg-red-500', bar: 'bg-red-500' },
  warning: { label: 'Renewing Soon', badge: 'bg-orange-100 text-orange-600', dot: 'bg-orange-500', bar: 'bg-orange-400' },
  good: { label: 'Active', badge: 'bg-green-100 text-green-700', dot: 'bg-green-500', bar: 'bg-green-500' },
}

export default function PolicyWatch() {
  const [expanded, setExpanded] = useState<number | null>(null)

  const stats = [
    { label: 'Total Policies', value: policies.length, bg: 'bg-purple-50', color: 'text-purple-600' },
    { label: 'Urgent Renewals', value: policies.filter(p => p.status === 'critical').length, bg: 'bg-red-50', color: 'text-red-600' },
    { label: 'Annual Premium', value: '₹1.19L', bg: 'bg-blue-50', color: 'text-blue-600' },
    { label: 'Total Coverage', value: '₹108L', bg: 'bg-green-50', color: 'text-green-600' },
  ]

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Hero Banner */}
      <div className="-mx-4 lg:-mx-6 -mt-4 lg:-mt-6 relative h-48 sm:h-56 overflow-hidden bg-purple-900">
        <img
          src="https://images.unsplash.com/photo-1758227365187-016878604d94?w=1200&h=400&fit=crop&auto=format"
          alt="Family insurance protection"
          className="w-full h-full object-cover opacity-55"
        />
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
            <button className="shrink-0 flex items-center gap-2 bg-white text-purple-700 hover:bg-purple-50 text-sm font-bold px-4 py-2.5 rounded-xl shadow-lg transition-colors">
              <Plus className="w-4 h-4" /> Add Policy
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

      {/* Urgent Alert */}
      {policies.filter(p => p.status === 'critical').length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-700 text-sm">Renewal Urgently Required</p>
            <p className="text-red-600 text-xs mt-1">
              {policies.filter(p => p.status === 'critical').map(p => p.name).join(' and ')} — renew now to avoid coverage lapse.
            </p>
          </div>
        </div>
      )}

      {/* Policy Cards */}
      <div className="space-y-3">
        {policies.map(policy => {
          const cfg = statusConfig[policy.status as keyof typeof statusConfig]
          const daysToRenewal = Math.ceil((new Date(policy.renewalDate).getTime() - Date.now()) / 86400000)
          const yearsSinceStart = new Date().getFullYear() - new Date(policy.startDate).getFullYear()
          const isExpanded = expanded === policy.id

          return (
            <div key={policy.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
              <div
                className="flex items-center gap-4 p-4 cursor-pointer"
                onClick={() => setExpanded(isExpanded ? null : policy.id)}
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${policy.color} flex items-center justify-center text-2xl shrink-0`}>
                  {policy.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">{policy.name}</h3>
                      <p className="text-xs text-slate-400">{policy.type} · {policy.insurer}</p>
                    </div>
                    <span className={`shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full ${cfg.badge}`}>{cfg.label}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">{policy.sumAssured}</span>
                    <span>Premium: ₹{policy.premium.toLocaleString('en-IN')}/yr</span>
                    <span className={daysToRenewal <= 30 ? 'text-red-500 font-semibold' : ''}>
                      {daysToRenewal > 0 ? `Renews in ${daysToRenewal} days` : 'Renewal overdue'}
                    </span>
                  </div>
                  {/* Renewal progress */}
                  <div className="mt-2.5 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${cfg.bar}`}
                      style={{ width: `${Math.max(5, Math.min(100, (daysToRenewal / 365) * 100))}%` }}
                    />
                  </div>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-slate-50 pt-3">
                  <div className="grid sm:grid-cols-3 gap-3 mb-3">
                    {[
                      { label: 'Policy No.', value: policy.policyNo },
                      { label: 'Start Date', value: new Date(policy.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
                      { label: 'Policy Age', value: `${yearsSinceStart} years` },
                      { label: 'Renewal Date', value: new Date(policy.renewalDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
                      { label: 'Sum Assured', value: policy.sumAssured },
                      { label: 'Members Covered', value: policy.members.join(', ') },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-slate-50 rounded-xl p-3">
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">{label}</p>
                        <p className="text-sm font-semibold text-slate-800 mt-0.5">{value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
                      <CheckCircle2 className="w-4 h-4" /> Renew Now
                    </button>
                    <button className="flex items-center gap-2 border border-slate-200 text-slate-600 text-sm font-semibold py-2.5 px-4 rounded-xl hover:bg-slate-50 transition-colors">
                      <Phone className="w-4 h-4" /> Call {policy.contact}
                    </button>
                    <button className="flex items-center gap-2 border border-slate-200 text-slate-600 text-sm font-semibold py-2.5 px-4 rounded-xl hover:bg-slate-50 transition-colors">
                      <FileText className="w-4 h-4" /> View Policy
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
