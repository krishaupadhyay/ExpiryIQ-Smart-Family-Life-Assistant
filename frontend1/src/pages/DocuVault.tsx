import { useState, useEffect } from 'react'
import { FileText, Search, Grid3X3, List, Plus, Trash2, X, Camera, Upload, Loader2, Sparkles } from 'lucide-react'
import { apiRequest } from '../services/api'
import { useAuth } from '../context/AuthContext'

const OCR_SERVICE_URL = 'http://localhost:5001'

const categories = ['All', 'Identity', 'Financial', 'Medical', 'Property', 'Vehicle', 'Insurance', 'Education', 'Other']

// Visual style per category — since we no longer store an emoji/color per document,
// it's derived automatically from the category instead.
const categoryStyle: Record<string, { emoji: string; color: string }> = {
  Identity: { emoji: '🪪', color: 'from-indigo-500 to-blue-600' },
  Financial: { emoji: '💰', color: 'from-blue-500 to-cyan-600' },
  Medical: { emoji: '🏥', color: 'from-red-500 to-rose-600' },
  Property: { emoji: '🏠', color: 'from-green-500 to-emerald-600' },
  Vehicle: { emoji: '🚗', color: 'from-amber-500 to-orange-600' },
  Insurance: { emoji: '🛡️', color: 'from-purple-500 to-violet-600' },
  Education: { emoji: '🎓', color: 'from-pink-500 to-rose-600' },
  Other: { emoji: '📄', color: 'from-slate-500 to-slate-600' },
}

type Doc = {
  _id: string
  familyMemberId: string
  memberName: string
  name: string
  category: string
  documentNumber: string
  issueDate?: string | null
  expiry?: string | null
  alertDaysBefore?: number
  source?: 'manual' | 'scan'
}

function toFullDate(value: string | null | undefined): string {
  if (!value) return ''
  if (value.length === 7) return `${value}-01`
  return value.slice(0, 10)
}

const emptyForm = {
  familyMemberId: '',
  name: '',
  category: '',
  documentNumber: '',
  issueDate: '',
  expiry: '',
  alertDaysBefore: '30',
  source: 'manual' as 'manual' | 'scan'
}

export default function DocuVault() {
  const { user } = useAuth()
  const familyMembers = user?.familyMembers || []

  const [documents, setDocuments] = useState<Doc[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  const [scanMode, setScanMode] = useState(false)
  const [scanPreview, setScanPreview] = useState<string | null>(null)
  const [scanLoading, setScanLoading] = useState(false)
  const [scanError, setScanError] = useState('')

  useEffect(() => {
    loadDocuments()
  }, [])

  async function loadDocuments() {
    try {
      setLoading(true)
      setError('')
      const data = await apiRequest('/documents', { method: 'GET' })
      setDocuments(data.documents || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents.')
    } finally {
      setLoading(false)
    }
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
      const res = await fetch(`${OCR_SERVICE_URL}/api/scan`, { method: 'POST', body: formData })
      const data = await res.json()

      if (data.error && !data.item_name) {
        setScanError(data.error)
        return
      }

      setForm(prev => ({
        ...prev,
        name: data.item_name || prev.name,
        expiry: toFullDate(data.expiry_date) || prev.expiry,
        issueDate: toFullDate(data.mfg_date) || prev.issueDate,
        source: 'scan'
      }))
      setScanMode(false)
    } catch (err) {
      setScanError('Could not reach the scanning service. Is it running on port 5001?')
    } finally {
      setScanLoading(false)
    }
  }

  async function handleAddDocument(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')

    if (!form.familyMemberId || !form.name.trim() || !form.category) {
      setFormError('Please fill in family member, document name and category.')
      return
    }

    setFormLoading(true)
    try {
      await apiRequest('/documents', {
        method: 'POST',
        body: JSON.stringify({
          familyMemberId: form.familyMemberId,
          name: form.name.trim(),
          category: form.category,
          documentNumber: form.documentNumber.trim(),
          issueDate: form.issueDate || null,
          expiry: form.expiry || null,
          alertDaysBefore: form.alertDaysBefore === '' ? 30 : Number(form.alertDaysBefore),
          source: form.source
        })
      })

      await loadDocuments()
      setForm(emptyForm)
      setShowModal(false)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to add document.')
    } finally {
      setFormLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this document?')) return
    try {
      await apiRequest(`/documents/${id}`, { method: 'DELETE' })
      setDocuments(prev => prev.filter(d => d._id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete document.')
    }
  }

  const filtered = documents.filter(d => {
    const matchCat = category === 'All' || d.category === category
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.memberName.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const isExpiringSoon = (d: Doc) => d.expiry && Math.ceil((new Date(d.expiry).getTime() - Date.now()) / 86400000) <= (d.alertDaysBefore ?? 30)

  const stats = [
    { label: 'Total Documents', value: documents.length, bg: 'bg-indigo-50', color: 'text-indigo-600' },
    { label: 'Expiring Soon', value: documents.filter(isExpiringSoon).length, bg: 'bg-orange-50', color: 'text-orange-600' },
    { label: 'Categories Used', value: new Set(documents.map(d => d.category)).size, bg: 'bg-blue-50', color: 'text-blue-600' },
    { label: 'Members Covered', value: new Set(documents.map(d => d.memberName)).size, bg: 'bg-green-50', color: 'text-green-600' },
  ]

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Hero Banner */}
      <div className="-mx-4 lg:-mx-6 -mt-4 lg:-mt-6 relative h-48 sm:h-56 overflow-hidden bg-indigo-900">
        <img
          src="https://images.unsplash.com/photo-1468779036391-52341f60b55d?w=1200&h=400&fit=crop&auto=format"
          alt="Organized documents and folders"
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 via-indigo-800/60 to-transparent" />
        <div className="absolute inset-0 flex items-end p-5 lg:p-7">
          <div className="flex items-end justify-between w-full gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <span className="text-white/70 text-sm font-semibold tracking-wide uppercase">ExpiryIQ Module</span>
              </div>
              <h1 className="text-3xl font-extrabold text-white drop-shadow">DocuVault</h1>
              <p className="text-indigo-100 text-sm mt-1">Track document renewal dates for Aadhaar, PAN, passports and more</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              disabled={familyMembers.length === 0}
              className="shrink-0 flex items-center gap-2 bg-white text-indigo-700 hover:bg-indigo-50 text-sm font-bold px-4 py-2.5 rounded-xl shadow-lg transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" /> Add Document
            </button>
          </div>
        </div>
      </div>

      {familyMembers.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-700">
          Add a family member on the profile selection screen first — documents need to be assigned to someone.
        </div>
      )}

      {error && <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-600">{error}</div>}

      {/* Privacy note — replaces the old encryption banner since we no longer store files at all */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-indigo-800 text-sm">We only store expiry details — not your document images</p>
          <p className="text-indigo-600 text-xs mt-0.5">DocuVault tracks renewal dates only. No Aadhaar/PAN photo or file is ever uploaded or saved.</p>
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

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search documents..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-1">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                category === c ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-slate-400 text-sm py-12">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-slate-400 text-sm py-12">No documents yet — click "Add Document" to get started.</p>
      ) : viewMode === 'grid' ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(doc => {
            const style = categoryStyle[doc.category] || categoryStyle.Other
            const expiring = isExpiringSoon(doc)
            return (
              <div key={doc._id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-md transition-shadow group">
                <div className={`h-24 bg-gradient-to-br ${style.color} flex items-center justify-center`}>
                  <span className="text-4xl">{style.emoji}</span>
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-slate-800 text-xs leading-snug mb-1 line-clamp-2">{doc.name}</h3>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                    <span>{doc.memberName}</span>
                    <span>{doc.category}</span>
                  </div>
                  {doc.expiry && (
                    <p className="text-[10px] text-slate-400 mt-1">
                      Expires: {new Date(doc.expiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  )}
                  {expiring && (
                    <span className="mt-1.5 inline-block text-[10px] bg-orange-100 text-orange-600 font-semibold px-2 py-0.5 rounded-full">
                      Expires soon
                    </span>
                  )}
                  <button
                    onClick={() => handleDelete(doc._id)}
                    className="mt-2 w-full text-[10px] font-semibold text-red-500 bg-red-50 py-1.5 rounded-lg hover:bg-red-100 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" /> Remove
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          {filtered.map((doc, i) => {
            const style = categoryStyle[doc.category] || categoryStyle.Other
            const expiring = isExpiringSoon(doc)
            return (
              <div key={doc._id} className={`flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors ${i > 0 ? 'border-t border-slate-50' : ''}`}>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${style.color} flex items-center justify-center text-xl shrink-0`}>
                  {style.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm truncate">{doc.name}</p>
                  <p className="text-xs text-slate-400">
                    {doc.memberName} · {doc.category}
                    {doc.expiry && ` · Expires ${new Date(doc.expiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                  </p>
                </div>
                {expiring && <span className="text-[10px] bg-orange-100 text-orange-600 font-semibold px-2 py-0.5 rounded-full shrink-0">Expires soon</span>}
                <button onClick={() => handleDelete(doc._id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Document Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-extrabold text-slate-800">Add Document</h3>
              <button onClick={() => { setShowModal(false); setForm(emptyForm); setFormError(''); setScanMode(false); setScanPreview(null); setScanError('') }} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-2 bg-slate-100 p-1 rounded-xl mb-5">
              <button type="button" onClick={() => setScanMode(false)} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${!scanMode ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>
                Manual Entry
              </button>
              <button type="button" onClick={() => setScanMode(true)} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all ${scanMode ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>
                <Sparkles className="w-3.5 h-3.5" /> Scan Photo
              </button>
            </div>

            {scanMode ? (
              <div className="space-y-4">
                {!scanPreview ? (
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center">
                    <Camera className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-500 mb-4">
                      Take a photo or upload an image of the document — we'll try to read the name and expiry date automatically. The photo itself is never saved.
                    </p>
                    <label className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm cursor-pointer">
                      <Upload className="w-4 h-4" /> Choose Image
                      <input type="file" accept="image/*" capture="environment" onChange={handleScanImage} className="hidden" />
                    </label>
                  </div>
                ) : (
                  <img src={scanPreview} alt="Scanned document preview" className="w-full max-h-52 object-contain rounded-xl border border-slate-100" />
                )}

                {scanLoading && (
                  <div className="flex items-center justify-center gap-2 py-4 text-sm text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin" /> Reading document…
                  </div>
                )}

                {scanError && <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-sm text-rose-600">{scanError}</div>}

                {scanPreview && !scanLoading && (
                  <button type="button" onClick={() => { setScanPreview(null); setScanError('') }} className="w-full border border-slate-200 font-semibold py-2.5 rounded-xl text-sm text-slate-600">
                    Try a different photo
                  </button>
                )}
              </div>
            ) : (
            <>
            {form.source === 'scan' && (form.name || form.expiry) && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-start gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-700">Filled in from your scan — please check the details below and fill in the rest.</p>
              </div>
            )}

            <form onSubmit={handleAddDocument} className="space-y-3.5">
              <div>
                <label className="text-sm font-semibold text-slate-700">For (family member) *</label>
                <select value={form.familyMemberId} onChange={e => setForm({ ...form, familyMemberId: e.target.value })} className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm">
                  <option value="">Select family member</option>
                  {familyMembers.map(m => (
                    <option key={m._id} value={m._id}>{m.name} ({m.relation})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">Document name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Aadhaar Card" className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm" />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">Category *</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm">
                  <option value="">Select category</option>
                  {categories.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">Document number</label>
                <input value={form.documentNumber} onChange={e => setForm({ ...form, documentNumber: e.target.value })} placeholder="Optional" className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Issue date</label>
                  <input type="date" value={form.issueDate} onChange={e => setForm({ ...form, issueDate: e.target.value })} className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Expiry date</label>
                  <input type="date" value={form.expiry} onChange={e => setForm({ ...form, expiry: e.target.value })} className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm" />
                  <p className="text-[10px] text-slate-400 mt-1">Leave blank if this document doesn't expire</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">Remind me before expiry</label>
                <div className="flex items-center gap-2 mt-1.5">
                  <input type="number" min="0" value={form.alertDaysBefore} onChange={e => setForm({ ...form, alertDaysBefore: e.target.value })} className="w-24 px-4 py-2.5 border border-slate-200 rounded-xl text-sm" />
                  <span className="text-sm text-slate-500">day(s) before expiry</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Only used if the document has an expiry date</p>
              </div>

              {formError && <p className="text-xs text-red-500">{formError}</p>}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowModal(false); setForm(emptyForm); setFormError(''); setScanMode(false); setScanPreview(null) }} className="flex-1 border border-slate-200 font-semibold py-2.5 rounded-xl text-sm text-slate-600">
                  Cancel
                </button>
                <button type="submit" disabled={formLoading} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60">
                  {formLoading ? 'Saving…' : 'Save Document'}
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
