import { useState } from 'react'
import { Zap, Plus, CheckCircle2, Clock, AlertTriangle, Bot, TrendingDown } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const bills: any[] = []

const monthlyData: any[] = []

const statusConfig = {
  overdue: { label: 'Overdue', badge: 'bg-red-100 text-red-600', border: 'border-red-200' },
  'due-soon': { label: 'Due Soon', badge: 'bg-orange-100 text-orange-600', border: 'border-orange-200' },
  upcoming: { label: 'Upcoming', badge: 'bg-blue-100 text-blue-600', border: 'border-blue-200' },
  paid: { label: 'Paid', badge: 'bg-green-100 text-green-700', border: 'border-green-100' },
}

export default function UtilityDesk() {
  const [paidIds, setPaidIds] = useState<number[]>([])

  const totalDue = bills.filter(b => !paidIds.includes(b.id)).reduce((sum, b) => sum + b.amount, 0)
  const totalMonthly = bills.reduce((sum, b) => sum + b.amount, 0)

  const getStatus = (bill: typeof bills[0]) => paidIds.includes(bill.id) ? 'paid' : bill.status

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Hero Banner */}
      <div className="-mx-4 lg:-mx-6 -mt-4 lg:-mt-6 relative h-48 sm:h-56 overflow-hidden bg-amber-900">
        <img
          src="https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=1200&h=400&fit=crop&auto=format"
          alt="Smart home thermostat technology"
          className="w-full h-full object-cover opacity-65"
        />
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
              <p className="text-amber-100 text-sm mt-1">Manage electricity, water, gas &amp; internet bills in one place</p>
            </div>
            <button className="shrink-0 flex items-center gap-2 bg-white text-amber-700 hover:bg-amber-50 text-sm font-bold px-4 py-2.5 rounded-xl shadow-lg transition-colors">
              <Plus className="w-4 h-4" /> Add Bill
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Pending Amount', value: `₹${totalDue.toLocaleString('en-IN')}`, bg: 'bg-red-50', color: 'text-red-600' },
          { label: 'Monthly Total', value: `₹${totalMonthly.toLocaleString('en-IN')}`, bg: 'bg-blue-50', color: 'text-blue-600' },
          { label: 'Overdue Bills', value: bills.filter(b => b.status === 'overdue' && !paidIds.includes(b.id)).length, bg: 'bg-orange-50', color: 'text-orange-600' },
          { label: 'Paid This Month', value: paidIds.length, bg: 'bg-green-50', color: 'text-green-600' },
        ].map(({ label, value, bg, color }) => (
          <div key={label} className={`${bg} rounded-2xl p-4`}>
            <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
            <p className="text-slate-600 text-xs font-medium mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Overdue Alert */}
      {bills.some(b => b.status === 'overdue' && !paidIds.includes(b.id)) && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-700 text-sm">Overdue Bill Alert</p>
            <p className="text-red-600 text-xs mt-1">
              BESCOM electricity bill of ₹1,240 is overdue. Pay now to avoid late payment charges.
            </p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-5">
        {/* Bill Cards */}
        <div className="lg:col-span-3 space-y-3">
          {bills.map(bill => {
            const status = getStatus(bill)
            const cfg = statusConfig[status as keyof typeof statusConfig]
            const isPaid = paidIds.includes(bill.id)
            const daysUntil = Math.ceil((new Date(bill.dueDate).getTime() - Date.now()) / 86400000)

            return (
              <div key={bill.id} className={`bg-white rounded-2xl border ${cfg.border} p-4 hover:shadow-md transition-shadow`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${bill.color} flex items-center justify-center text-2xl shrink-0`}>
                    {bill.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm">{bill.name}</h3>
                        <p className="text-xs text-slate-400">{bill.provider} · {bill.accountNo}</p>
                      </div>
                      <span className={`shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full ${cfg.badge}`}>{cfg.label}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xl font-extrabold text-slate-800">₹{bill.amount.toLocaleString('en-IN')}</span>
                      <span className="text-xs text-slate-500">{bill.units}</span>
                      <span className={`text-xs ml-auto ${daysUntil < 0 ? 'text-red-500 font-semibold' : daysUntil <= 3 ? 'text-orange-500 font-semibold' : 'text-slate-400'}`}>
                        {daysUntil < 0 ? `${Math.abs(daysUntil)}d overdue` : `Due ${daysUntil === 0 ? 'today' : `in ${daysUntil}d`}`}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <button
                    onClick={() => setPaidIds(prev => isPaid ? prev.filter(id => id !== bill.id) : [...prev, bill.id])}
                    className={`flex-1 flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-xl transition-colors ${
                      isPaid
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-sm shadow-yellow-200'
                    }`}
                  >
                    {isPaid ? <><CheckCircle2 className="w-4 h-4" /> Paid</> : '⚡ Pay Now'}
                  </button>
                  <button className="border border-slate-200 text-slate-500 text-sm font-medium py-2.5 px-4 rounded-xl hover:bg-slate-50 flex items-center gap-1.5 transition-colors">
                    <Clock className="w-3.5 h-3.5" /> History
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Right: Chart + AI Tip */}
        <div className="lg:col-span-2 space-y-5">
          {/* AI Tip */}
          <div className="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Bot className="w-4 h-4" />
              <span className="font-bold text-sm">AI Energy Insight</span>
            </div>
            <p className="text-sm leading-relaxed">
              Your electricity bill is ₹260 higher than last month. Consider switching off ACs for an hour before bedtime to save ₹150–200/month.
            </p>
            <div className="mt-3 flex items-center gap-2 bg-white/20 rounded-xl p-2.5">
              <TrendingDown className="w-4 h-4 shrink-0" />
              <p className="text-xs font-medium">Estimated monthly saving: ₹150–200</p>
            </div>
          </div>

          {/* Spending Chart */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4">
            <h3 className="font-bold text-slate-800 text-sm mb-4">Monthly Utility Spend (₹)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '11px' }} />
                <Bar dataKey="electricity" fill="#F59E0B" name="Electricity" radius={[3, 3, 0, 0]} />
                <Bar dataKey="water" fill="#3B82F6" name="Water" radius={[3, 3, 0, 0]} />
                <Bar dataKey="gas" fill="#F97316" name="Gas" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
