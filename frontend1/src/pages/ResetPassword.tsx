import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Bot, Lock, Eye, EyeOff, ArrowRight, CheckCircle2, ArrowLeft } from 'lucide-react'
import { apiRequest } from '../services/api'

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/

const inputStyle = {
  background: 'rgba(15,26,46,0.03)',
  border: '1px solid rgba(15,26,46,0.1)',
  color: '#1C1917'
}

export default function ResetPassword() {
  const { token } = useParams<{ token: string }>()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [linkInvalid, setLinkInvalid] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (!PASSWORD_REGEX.test(password)) {
      setError('Password must be at least 8 characters with one uppercase letter, one lowercase letter and one digit.')
      return
    }

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await apiRequest(`/auth/reset-password/${token}`, {
        method: 'POST',
        body: JSON.stringify({ password })
      })
      setDone(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to reset password.'
      if (message.toLowerCase().includes('invalid or has expired')) {
        setLinkInvalid(true)
      } else {
        setError(message)
      }
    } finally {
      setLoading(false)
    }
  }

  function focusOn(e: React.FocusEvent<HTMLInputElement>) {
    e.currentTarget.style.border = '1px solid #0D9488'
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(13,148,136,0.12)'
  }

  function focusOff(e: React.FocusEvent<HTMLInputElement>) {
    e.currentTarget.style.border = '1px solid rgba(15,26,46,0.1)'
    e.currentTarget.style.boxShadow = 'none'
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#FFFDF7' }}>
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow" style={{ background: 'linear-gradient(135deg, #0D9488, #D97706)' }}>
            <Bot className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#0F1A2E' }}>
            ExpiryIQ
          </span>
        </Link>

        <div className="rounded-2xl p-8" style={{ background: 'white', border: '1px solid rgba(15,26,46,0.08)', boxShadow: '0 4px 24px rgba(15,26,46,0.06)' }}>

          {/* ===== SUCCESS ===== */}
          {done ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(13,148,136,0.12)' }}>
                <CheckCircle2 className="w-7 h-7" style={{ color: '#0D9488' }} />
              </div>
              <h1 className="text-xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#0F1A2E' }}>
                Password updated
              </h1>
              <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
                Your password has been reset. You can now sign in with your new password.
              </p>
              <Link
                to="/login"
                className="w-full flex items-center justify-center gap-2 text-white font-semibold py-3 rounded-xl"
                style={{ background: 'linear-gradient(135deg, #0D9488, #D97706)' }}
              >
                Go to Sign In <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          /* ===== INVALID / EXPIRED LINK ===== */
          ) : linkInvalid ? (
            <div className="text-center py-4">
              <h1 className="text-xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#0F1A2E' }}>
                Link expired
              </h1>
              <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
                This reset link is invalid or has expired. Please request a new one.
              </p>
              <Link
                to="/forgot-password"
                className="w-full flex items-center justify-center gap-2 text-white font-semibold py-3 rounded-xl mb-4"
                style={{ background: 'linear-gradient(135deg, #0D9488, #D97706)' }}
              >
                Request new link <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/login" className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: '#0D9488' }}>
                <ArrowLeft className="w-4 h-4" /> Back to Sign In
              </Link>
            </div>

          /* ===== FORM ===== */
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#0F1A2E' }}>
                Set a new password
              </h1>
              <p className="text-sm mb-7" style={{ color: '#6B7280' }}>
                Use at least 8 characters with an uppercase letter, a lowercase letter and a number.
              </p>

              <form onSubmit={handleSubmit}>
                {/* New password */}
                <label className="text-sm font-semibold block mb-1.5" style={{ color: '#374151' }}>New password</label>
                <div className="relative mb-4">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm outline-none transition-all"
                    style={inputStyle}
                    onFocus={focusOn}
                    onBlur={focusOff}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2"
                    style={{ color: '#9CA3AF' }}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Confirm password */}
                <label className="text-sm font-semibold block mb-1.5" style={{ color: '#374151' }}>Confirm password</label>
                <div className="relative mb-2">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                    style={inputStyle}
                    onFocus={focusOn}
                    onBlur={focusOff}
                  />
                </div>

                {error && <p className="text-xs mb-3 mt-2" style={{ color: '#EF4444' }}>{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 text-white font-semibold py-3 rounded-xl mt-4 transition-opacity disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #0D9488, #D97706)' }}
                >
                  {loading ? 'Resetting…' : 'Reset Password'} {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>

              <p className="text-center text-sm mt-6" style={{ color: '#6B7280' }}>
                <Link to="/login" className="font-semibold" style={{ color: '#0D9488' }}>
                  Back to Sign In
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}