import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  LogOut,
  Users,
  Plus,
  ChevronRight,
  X,
  User,
  Gift
} from 'lucide-react'
import { apiRequest } from '../services/api'

export default function ProfileSelection() {
  const navigate = useNavigate()

  const [familyMembers, setFamilyMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    relation: '',
    age: ''
  })
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  // Fetch family members on mount
  useEffect(() => {
    fetchFamilyMembers()
  }, [])

  async function fetchFamilyMembers() {
    try {
      setLoading(true)
      setError('')

      const data = await apiRequest('/auth/family-members', {
        method: 'GET'
      })

      console.log('✅ Family members:', data.familyMembers)
      setFamilyMembers(data.familyMembers || [])

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load family members'
      )
      console.error('Fetch family members error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Handle add family member
  async function handleAddFamilyMember(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')

    // Validation
    if (!formData.name.trim()) {
      setFormError('Name is required')
      return
    }

    if (formData.name.trim().length < 2) {
      setFormError('Name must be at least 2 characters')
      return
    }

    if (!formData.relation.trim()) {
      setFormError('Relation is required')
      return
    }

    if (formData.age && isNaN(Number(formData.age))) {
      setFormError('Age must be a number')
      return
    }

    setFormLoading(true)

    try {
      // ✅ CORRECTED ENDPOINT: /auth/family-members (POST method)
      // Matches your backend route: router.post('/family-members', requireAuth, addFamilyMember)
      const data = await apiRequest('/auth/family-members', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name.trim(),
          relation: formData.relation.trim(),
          age: formData.age ? Number(formData.age) : undefined
        })
      })

   console.log('✅ Family member added:', data)

// Fetch the updated list from backend
await fetchFamilyMembers()

// Reset form and close modal
setFormData({ name: '', relation: '', age: '' })
setShowModal(false)
setFormError('')
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : 'Failed to add family member'
      )
      console.error('Add family member error:', err)
    } finally {
      setFormLoading(false)
    }
  }

  // Select profile and navigate to dashboard
  function selectProfile(member: any) {
    localStorage.setItem('selectedProfile', JSON.stringify(member))
    navigate('/dashboard')
  }

  // Logout
  function handleLogout() {
    localStorage.removeItem('selectedProfile')
    navigate('/logout')
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
      style={{ background: '#FFFDF7' }}
    >
      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className="text-3xl lg:text-4xl font-bold mb-2"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                color: '#0F1A2E'
              }}
            >
              Select Your Profile
            </h1>
            <p
              className="text-base text-gray-600"
              style={{ color: '#6B7280' }}
            >
              Choose which family member you are
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all"
            style={{
              background: 'rgba(239, 68, 68, 0.08)',
              color: '#EF4444'
            }}
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-semibold">Logout</span>
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block">
              <div
                className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-teal-500 animate-spin"
              />
            </div>
            <p
              className="text-base mt-4"
              style={{ color: '#6B7280' }}
            >
              Loading profiles...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div
            className="rounded-2xl p-6 mb-6 text-center"
            style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}
          >
            <p
              className="text-base font-medium"
              style={{ color: '#DC2626' }}
            >
              {error}
            </p>
            <button
              onClick={fetchFamilyMembers}
              className="mt-3 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#EF4444'
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Family Members Grid */}
        {!loading && familyMembers.length > 0 && (
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {familyMembers.map((member) => {
                const initials = member.name
                  .split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .toUpperCase()

                const colors = [
                  'from-teal-500 to-orange-500',
                  'from-blue-500 to-purple-500',
                  'from-pink-500 to-red-500',
                  'from-green-500 to-cyan-500',
                  'from-purple-500 to-pink-500'
                ]

                const colorIndex = familyMembers.indexOf(member) % colors.length

                return (
                  <button
                    key={member._id || member.name}
                    onClick={() => selectProfile(member)}
                    className="rounded-2xl p-6 text-left transition-all hover:shadow-lg hover:-translate-y-1"
                    style={{
                      background: 'white',
                      border: '1px solid rgba(15,26,46,0.08)',
                      boxShadow: '0 4px 24px rgba(15,26,46,0.06)'
                    }}
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div
                        className={`w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-xl bg-gradient-to-br ${colors[colorIndex]} shrink-0`}
                      >
                        {initials}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3
                          className="text-lg font-bold mb-1 truncate"
                          style={{ color: '#0F1A2E' }}
                        >
                          {member.name}
                        </h3>

                        <p
                          className="text-sm"
                          style={{ color: '#6B7280' }}
                        >
                          {member.relation || 'Family Member'}
                        </p>

                        {member.age && (
                          <p
                            className="text-xs mt-1"
                            style={{ color: '#9CA3AF' }}
                          >
                            Age: {member.age}
                          </p>
                        )}
                      </div>

                      {/* Arrow */}
                      <ChevronRight
                        className="w-5 h-5 shrink-0"
                        style={{ color: '#0D9488' }}
                      />
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Add Family Member Card */}
            <button
              onClick={() => setShowModal(true)}
              className="w-full rounded-2xl p-6 transition-all hover:shadow-lg hover:-translate-y-1"
              style={{
                background: 'linear-gradient(135deg, rgba(13,148,136,0.08), rgba(217,119,6,0.08))',
                border: '2px dashed rgba(13,148,136,0.3)'
              }}
            >
              <div className="flex items-center justify-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(13,148,136,0.15)' }}
                >
                  <Plus className="w-6 h-6" style={{ color: '#0D9488' }} />
                </div>
                <div className="text-left">
                  <h3
                    className="font-bold"
                    style={{ color: '#0D9488' }}
                  >
                    Add Family Member
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: '#6B7280' }}
                  >
                    Invite another family member
                  </p>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && familyMembers.length === 0 && !error && (
          <div
            className="rounded-2xl p-12 text-center"
            style={{
              background: 'white',
              border: '1px solid rgba(15,26,46,0.08)'
            }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4" style={{ background: 'rgba(13,148,136,0.1)' }}>
              <Users className="w-8 h-8" style={{ color: '#0D9488' }} />
            </div>

            <h3
              className="text-lg font-bold mb-2"
              style={{ color: '#0F1A2E' }}
            >
              No family members yet
            </h3>

            <p
              className="text-base mb-6"
              style={{ color: '#6B7280' }}
            >
              Create your first family member profile to get started.
            </p>

            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold transition-opacity hover:opacity-90"
              style={{
                background: 'linear-gradient(135deg, #0D9488, #D97706)'
              }}
            >
              <Plus className="w-4 h-4" />
              Create First Member
            </button>
          </div>
        )}

      </div>

      {/* Modal - Add Family Member */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div
            className="rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
            style={{
              background: 'white',
              boxShadow: '0 20px 60px rgba(15,26,46,0.15)'
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => {
                setShowModal(false)
                setFormError('')
                setFormData({ name: '', relation: '', age: '' })
              }}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" style={{ color: '#6B7280' }} />
            </button>

            {/* Header */}
            <div className="mb-6">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: 'linear-gradient(135deg, #0D9488, #D97706)' }}
              >
                <Gift className="w-6 h-6 text-white" />
              </div>

              <h2
                className="text-2xl font-bold mb-1"
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  color: '#0F1A2E'
                }}
              >
                Add Family Member
              </h2>

              <p
                className="text-sm"
                style={{ color: '#6B7280' }}
              >
                Create a new profile for a family member
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleAddFamilyMember}>
              {/* Name */}
              <label
                className="text-sm font-semibold block mb-1.5"
                style={{ color: '#374151' }}
              >
                Full Name *
              </label>

              <div className="relative mb-4">
                <User
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: '#9CA3AF' }}
                />

                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., John Doe"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: 'rgba(15,26,46,0.03)',
                    border: '1px solid rgba(15,26,46,0.1)',
                    color: '#1C1917'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.border = '1px solid #0D9488'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(13,148,136,0.12)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = '1px solid rgba(15,26,46,0.1)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
              </div>

              {/* Relation */}
              <label
                className="text-sm font-semibold block mb-1.5"
                style={{ color: '#374151' }}
              >
                Relation *
              </label>

              <select
                required
                value={formData.relation}
                onChange={(e) =>
                  setFormData({ ...formData, relation: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all mb-4"
                style={{
                  background: 'rgba(15,26,46,0.03)',
                  border: '1px solid rgba(15,26,46,0.1)',
                  color: '#1C1917'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border = '1px solid #0D9488'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(13,148,136,0.12)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = '1px solid rgba(15,26,46,0.1)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <option value="">Select a relation</option>
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Son">Son</option>
                <option value="Daughter">Daughter</option>
                <option value="Brother">Brother</option>
                <option value="Sister">Sister</option>
                <option value="Grandfather">Grandfather</option>
                <option value="Grandmother">Grandmother</option>
                <option value="Aunt">Aunt</option>
                <option value="Uncle">Uncle</option>
                <option value="Cousin">Cousin</option>
                <option value="Other">Other</option>
              </select>

              {/* Age */}
              <label
                className="text-sm font-semibold block mb-1.5"
                style={{ color: '#374151' }}
              >
                Age (Optional)
              </label>

              <input
                type="number"
                min="0"
                max="120"
                value={formData.age}
                onChange={(e) =>
                  setFormData({ ...formData, age: e.target.value })
                }
                placeholder="e.g., 35"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all mb-2"
                style={{
                  background: 'rgba(15,26,46,0.03)',
                  border: '1px solid rgba(15,26,46,0.1)',
                  color: '#1C1917'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border = '1px solid #0D9488'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(13,148,136,0.12)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = '1px solid rgba(15,26,46,0.1)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />

              {/* Error */}
              {formError && (
                <p
                  className="text-xs mb-4"
                  style={{ color: '#EF4444' }}
                >
                  {formError}
                </p>
              )}

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setFormError('')
                    setFormData({ name: '', relation: '', age: '' })
                  }}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold transition-all"
                  style={{
                    background: 'rgba(15,26,46,0.08)',
                    color: '#374151'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 px-4 py-3 rounded-xl text-white font-semibold transition-opacity disabled:opacity-60"
                  style={{
                    background: 'linear-gradient(135deg, #0D9488, #D97706)'
                  }}
                >
                  {formLoading ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}