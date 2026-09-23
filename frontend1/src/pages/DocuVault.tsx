import { useState } from 'react'
import { FileText, Search, Lock, Grid3X3, List, Upload, Shield, Eye, Download } from 'lucide-react'

const categories = ['All', 'Identity', 'Financial', 'Medical', 'Property', 'Vehicle', 'Insurance', 'Education']

const documents: any[] = []

export default function DocuVault() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = documents.filter(d => {
    const matchCat = category === 'All' || d.category === category
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.member.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const stats = [
    { label: 'Total Documents', value: documents.length, bg: 'bg-indigo-50', color: 'text-indigo-600' },
    { label: 'Expiring This Year', value: documents.filter(d => d.expiry && new Date(d.expiry).getFullYear() <= 2026).length, bg: 'bg-orange-50', color: 'text-orange-600' },
    { label: 'Total Size', value: '43 MB', bg: 'bg-blue-50', color: 'text-blue-600' },
    { label: 'Members Covered', value: 6, bg: 'bg-green-50', color: 'text-green-600' },
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
              <p className="text-indigo-100 text-sm mt-1">Secure family document storage — Aadhaar, PAN, passports and more</p>
            </div>
            <button className="shrink-0 flex items-center gap-2 bg-white text-indigo-700 hover:bg-indigo-50 text-sm font-bold px-4 py-2.5 rounded-xl shadow-lg transition-colors">
              <Upload className="w-4 h-4" /> Upload
            </button>
          </div>
        </div>
      </div>

      {/* Security Banner */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-indigo-800 text-sm">256-bit AES Encryption Active</p>
          <p className="text-indigo-600 text-xs mt-0.5">All documents are encrypted and stored securely. Only you and your family can access them.</p>
        </div>
        <Lock className="w-5 h-5 text-indigo-400 ml-auto shrink-0" />
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

      {/* Documents */}
      {viewMode === 'grid' ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(doc => {
            const expiring = doc.expiry && Math.ceil((new Date(doc.expiry).getTime() - Date.now()) / 86400000) <= 180
            return (
              <div key={doc.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-md transition-shadow group cursor-pointer">
                <div className={`h-24 bg-gradient-to-br ${doc.color} flex items-center justify-center`}>
                  <span className="text-4xl">{doc.emoji}</span>
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-slate-800 text-xs leading-snug mb-1 line-clamp-2">{doc.name}</h3>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                    <span>{doc.member}</span>
                    <span>{doc.type} · {doc.size}</span>
                  </div>
                  {expiring && (
                    <span className="mt-1.5 inline-block text-[10px] bg-orange-100 text-orange-600 font-semibold px-2 py-0.5 rounded-full">
                      Expires soon
                    </span>
                  )}
                  <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="flex-1 text-[10px] font-semibold text-indigo-600 bg-indigo-50 py-1.5 rounded-lg hover:bg-indigo-100 flex items-center justify-center gap-1">
                      <Eye className="w-3 h-3" /> View
                    </button>
                    <button className="flex-1 text-[10px] font-semibold text-slate-600 bg-slate-100 py-1.5 rounded-lg hover:bg-slate-200 flex items-center justify-center gap-1">
                      <Download className="w-3 h-3" /> Save
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          {filtered.map((doc, i) => {
            const expiring = doc.expiry && Math.ceil((new Date(doc.expiry).getTime() - Date.now()) / 86400000) <= 180
            return (
              <div key={doc.id} className={`flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer ${i > 0 ? 'border-t border-slate-50' : ''}`}>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${doc.color} flex items-center justify-center text-xl shrink-0`}>
                  {doc.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm truncate">{doc.name}</p>
                  <p className="text-xs text-slate-400">{doc.member} · {doc.category} · {doc.type} · {doc.size}</p>
                </div>
                {expiring && <span className="text-[10px] bg-orange-100 text-orange-600 font-semibold px-2 py-0.5 rounded-full shrink-0">Expires soon</span>}
                <div className="flex items-center gap-2 shrink-0">
                  <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Eye className="w-4 h-4" /></button>
                  <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"><Download className="w-4 h-4" /></button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
