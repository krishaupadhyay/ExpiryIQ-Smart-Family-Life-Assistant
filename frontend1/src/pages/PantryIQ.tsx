import { useState, useEffect } from 'react'
import {
  ShoppingBasket,
  Plus,
  Search,
  Bot,
  RefreshCw,
  Filter,
  TrendingDown,
  X,
  Trash2,
} from 'lucide-react'
import { apiRequest } from '../services/api'

type Item = {
  _id: string
  name: string
  category: string
  quantity: number
  maxQty: number
  unit: string
  expiry: string
  alertDaysBefore: number
}

const categories = [
  'All',
  'Grains & Dal',
  'Dairy',
  'Vegetables',
  'Spices',
  'Oils & Ghee',
  'Snacks',
  'Beverages',
  'Other',
]

function getStatus(item: Item): 'critical' | 'low' | 'good' {
  const ratio = item.maxQty > 0 ? item.quantity / item.maxQty : 1
  const daysToExpiry = Math.ceil(
    (new Date(item.expiry).getTime() - Date.now()) / 86400000
  )
  const alertDays =
    typeof item.alertDaysBefore === 'number' ? item.alertDaysBefore : 7

  if (item.quantity === 0 || daysToExpiry <= 2) return 'critical'
  if (ratio <= 0.3 || daysToExpiry <= alertDays) return 'low'

  return 'good'
}

const statusConfig = {
  critical: {
    label: 'Out / Critical',
    bar: 'bg-red-500',
    badge: 'bg-red-100 text-red-600',
  },
  low: {
    label: 'Low Stock',
    bar: 'bg-orange-400',
    badge: 'bg-orange-100 text-orange-600',
  },
  good: {
    label: 'Sufficient',
    bar: 'bg-green-500',
    badge: 'bg-green-100 text-green-700',
  },
}

const emptyForm = {
  name: '',
  category: '',
  quantity: '',
  maxQty: '',
  unit: 'kg',
  expiry: '',
  alertDaysBefore: '7',
  alertTime: '08:00',
}

export default function PantryIQ() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    loadItems()
  }, [])

  async function loadItems() {
    try {
      setLoading(true)
      setError('')

      const data = await apiRequest('/pantry', {
        method: 'GET',
      })

      setItems(data.items || [])
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load pantry items.'
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')

    if (
      !form.name.trim() ||
      !form.category ||
      !form.quantity ||
      !form.maxQty ||
      !form.expiry
    ) {
      setFormError(
        'Please fill in name, category, quantity, max quantity and expiry.'
      )
      return
    }

    setFormLoading(true)

    try {
      await apiRequest('/pantry', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name.trim(),
          category: form.category,
          quantity: Number(form.quantity),
          maxQty: Number(form.maxQty),
          unit: form.unit.trim() || 'units',
          expiry: form.expiry,
          alertDaysBefore:
            form.alertDaysBefore === ''
              ? 7
              : Number(form.alertDaysBefore),
          alertTime: form.alertTime || '08:00',
        }),
      })

      await loadItems()

      setForm(emptyForm)
      setShowModal(false)
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Failed to add item.'
      )
    } finally {
      setFormLoading(false)
    }
  }

  async function handleReorder(item: Item) {
    try {
      await apiRequest(`/pantry/${item._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          quantity: item.maxQty,
        }),
      })

      setItems(prev =>
        prev.map(i =>
          i._id === item._id
            ? { ...i, quantity: item.maxQty }
            : i
        )
      )
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : 'Failed to update item.'
      )
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this item?')) return

    try {
      await apiRequest(`/pantry/${id}`, {
        method: 'DELETE',
      })

      setItems(prev => prev.filter(i => i._id !== id))
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : 'Failed to delete item.'
      )
    }
  }

  const filtered = items.filter(item => {
    const matchCat =
      category === 'All' || item.category === category

    const matchSearch = item.name
      .toLowerCase()
      .includes(search.toLowerCase())

    return matchCat && matchSearch
  })

  const stats = [
    {
      label: 'Total Items',
      value: items.length,
      bg: 'bg-green-50',
      color: 'text-green-600',
    },
    {
      label: 'Critical / Out',
      value: items.filter(i => getStatus(i) === 'critical').length,
      bg: 'bg-red-50',
      color: 'text-red-600',
    },
    {
      label: 'Low Stock',
      value: items.filter(i => getStatus(i) === 'low').length,
      bg: 'bg-orange-50',
      color: 'text-orange-600',
    },
    {
      label: 'Expiring This Week',
      value: items.filter(
        i =>
          Math.ceil(
            (new Date(i.expiry).getTime() - Date.now()) /
              86400000
          ) <= 7
      ).length,
      bg: 'bg-yellow-50',
      color: 'text-yellow-600',
    },
  ]

  const aiSuggestions = items
    .filter(item => {
      const status = getStatus(item)
      return status === 'critical' || status === 'low'
    })
    .slice(0, 4)
    .map(item => {
      const status = getStatus(item)

      return {
        text:
          status === 'critical'
            ? `${item.name} is out or critically low. Consider restocking it soon.`
            : `${item.name} is running low. Consider adding it to your shopping list.`,
        priority: status === 'critical' ? 'high' : 'medium',
      }
    })

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

                <span className="text-white/70 text-sm font-semibold tracking-wide uppercase">
                  ExpiryIQ Module
                </span>
              </div>

              <h1 className="text-3xl font-extrabold text-white drop-shadow">
                PantryIQ
              </h1>

              <p className="text-green-100 text-sm mt-1">
                Smart grocery &amp; pantry inventory tracker for your kitchen
              </p>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="shrink-0 flex items-center gap-2 bg-white text-green-700 hover:bg-green-50 text-sm font-bold px-4 py-2.5 rounded-xl shadow-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(({ label, value, bg, color }) => (
          <div
            key={label}
            className={`${bg} rounded-2xl p-4`}
          >
            <p className={`text-2xl font-extrabold ${color}`}>
              {value}
            </p>

            <p className="text-slate-600 text-xs font-medium mt-0.5">
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* AI Suggestions */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-2 mb-3">
          <Bot className="w-4 h-4" />
          <span className="font-bold text-sm">
            AI Grocery Suggestions
          </span>
        </div>

        {aiSuggestions.length === 0 ? (
          <div className="bg-white/15 rounded-xl px-3 py-3 text-sm">
            Your pantry looks good! No urgent restocking suggestions.
          </div>
        ) : (
          <div className="space-y-2">
            {aiSuggestions.map((suggestion, index) => (
              <div
                key={index}
                className="bg-white/15 rounded-xl px-3 py-2.5 flex items-start gap-2.5"
              >
                <TrendingDown
                  className={`w-4 h-4 mt-0.5 shrink-0 ${
                    suggestion.priority === 'high'
                      ? 'text-red-300'
                      : 'text-yellow-300'
                  }`}
                />

                <p className="text-sm">
                  {suggestion.text}
                </p>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          className="mt-3 bg-white/20 hover:bg-white/30 transition-colors rounded-xl w-full py-2 text-sm font-semibold flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Generate Full Shopping List
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
                category === c
                  ? 'bg-green-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-green-300'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      {loading ? (
        <p className="text-center text-slate-400 text-sm py-12">
          Loading…
        </p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-slate-400 text-sm py-12">
          No items yet — click "Add Item" to get started.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(item => {
            const status = getStatus(item)
            const cfg = statusConfig[status]

            const pct =
              item.maxQty > 0
                ? Math.round(
                    (item.quantity / item.maxQty) * 100
                  )
                : 0

            const daysToExpiry = Math.ceil(
              (new Date(item.expiry).getTime() - Date.now()) /
                86400000
            )

            return (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">
                      {item.name}
                    </h3>

                    <p className="text-xs text-slate-400 mt-0.5">
                      {item.category}
                    </p>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}
                  >
                    {cfg.label}
                  </span>
                </div>

                <div className="flex items-end justify-between mb-2">
                  <span className="text-xl font-extrabold text-slate-800">
                    {item.quantity}{' '}
                    <span className="text-sm font-normal text-slate-400">
                      {item.unit}
                    </span>
                  </span>

                  <span className="text-xs text-slate-400">
                    of {item.maxQty} {item.unit}
                  </span>
                </div>

                <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full ${cfg.bar}`}
                    style={{
                      width: `${Math.max(pct, 2)}%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span
                    className={
                      daysToExpiry <=
                      (item.alertDaysBefore ?? 7)
                        ? 'text-red-500 font-semibold'
                        : ''
                    }
                  >
                    Exp:{' '}
                    {new Date(item.expiry).toLocaleDateString(
                      'en-IN',
                      {
                        day: 'numeric',
                        month: 'short',
                        year: '2-digit',
                      }
                    )}
                  </span>

                  <div className="flex items-center gap-2">
                    {status !== 'good' && (
                      <button
                        onClick={() => handleReorder(item)}
                        className="text-green-600 font-semibold hover:underline"
                      >
                        + Restock
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-slate-300 hover:text-red-500 transition-colors"
                      title="Delete item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Item Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-extrabold text-slate-800">
                Add Item
              </h3>

              <button
                onClick={() => {
                  setShowModal(false)
                  setForm(emptyForm)
                  setFormError('')
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleAdd}
              className="space-y-3.5"
            >
              {/* Item Name */}
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Item name *
                </label>

                <input
                  value={form.name}
                  onChange={e =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                  placeholder="e.g. Toor Dal"
                  className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Category *
                </label>

                <select
                  value={form.category}
                  onChange={e =>
                    setForm({
                      ...form,
                      category: e.target.value,
                    })
                  }
                  className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
                >
                  <option value="">
                    Select category
                  </option>

                  {categories
                    .filter(c => c !== 'All')
                    .map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                </select>
              </div>

              {/* Quantity */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Quantity *
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={form.quantity}
                    onChange={e =>
                      setForm({
                        ...form,
                        quantity: e.target.value,
                      })
                    }
                    className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Max *
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={form.maxQty}
                    onChange={e =>
                      setForm({
                        ...form,
                        maxQty: e.target.value,
                      })
                    }
                    className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Unit
                  </label>

                  <input
                    value={form.unit}
                    onChange={e =>
                      setForm({
                        ...form,
                        unit: e.target.value,
                      })
                    }
                    placeholder="kg"
                    className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* Expiry */}
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Expiry date *
                </label>

                <input
                  type="date"
                  value={form.expiry}
                  onChange={e =>
                    setForm({
                      ...form,
                      expiry: e.target.value,
                    })
                  }
                  className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              {/* Expiry Reminder */}
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Remind me before expiry
                </label>

                <div className="flex items-center gap-2 mt-1.5">
                  <input
                    type="number"
                    min="0"
                    value={form.alertDaysBefore}
                    onChange={e =>
                      setForm({
                        ...form,
                        alertDaysBefore: e.target.value,
                      })
                    }
                    className="w-24 px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
                  />

                  <span className="text-sm text-slate-500">
                    day(s) before expiry
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="text-sm text-slate-500">
                    at
                  </span>

                  <input
                    type="time"
                    value={form.alertTime}
                    onChange={e =>
                      setForm({
                        ...form,
                        alertTime: e.target.value,
                      })
                    }
                    className="px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />

                  {(
                    [
                      ['Morning', '08:00'],
                      ['Afternoon', '14:00'],
                      ['Night', '20:00'],
                    ] as const
                  ).map(([label, time]) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          alertTime: time,
                        })
                      }
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        form.alertTime === time
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {formError && (
                <p className="text-xs text-red-500">
                  {formError}
                </p>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setForm(emptyForm)
                    setFormError('')
                  }}
                  className="flex-1 border border-slate-200 font-semibold py-2.5 rounded-xl text-sm text-slate-600"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60"
                >
                  {formLoading
                    ? 'Saving…'
                    : 'Save Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}