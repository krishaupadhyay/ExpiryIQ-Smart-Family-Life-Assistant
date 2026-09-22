import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Bot, Mail, ArrowRight, CheckCircle2, ArrowLeft } from 'lucide-react'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (!email) {
      setError('Please enter your email address.')
      return
    }

    setLoading(true)
    try {
      // TODO: replace with a real API call once the backend is connected
      // const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email })
      // })
      // if (!res.ok) throw new Error('Could not send reset link. Please try again.')

      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
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
          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(13,148,136,0.12)' }}>
                <CheckCircle2 className="w-7 h-7" style={{ color: '#0D9488' }} />
              </div>
              <h1 className="text-xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#0F1A2E' }}>
                Check your email
              </h1>
              <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
                If an account exists for <span className="font-semibold" style={{ color: '#1C1917' }}>{email}</span>, we've sent a link to reset your password.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-semibold"
                style={{ color: '#0D9488' }}
              >
                <ArrowLeft className="w-4 h-4" /> Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#0F1A2E' }}>
                Forgot your password?
              </h1>
              <p className="text-sm mb-7" style={{ color: '#6B7280' }}>
                Enter the email linked to your account and we'll send you a reset link.
              </p>

              <form onSubmit={handleSubmit}>
                <label className="text-sm font-semibold block mb-1.5" style={{ color: '#374151' }}>Email</label>
                <div className="relative mb-2">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                    style={{ background: 'rgba(15,26,46,0.03)', border: '1px solid rgba(15,26,46,0.1)', color: '#1C1917' }}
                    onFocus={e => { e.currentTarget.style.border = '1px solid #0D9488'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(13,148,136,0.12)' }}
                    onBlur={e => { e.currentTarget.style.border = '1px solid rgba(15,26,46,0.1)'; e.currentTarget.style.boxShadow = 'none' }}
                  />
                </div>

                {error && <p className="text-xs mb-3 mt-2" style={{ color: '#EF4444' }}>{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 text-white font-semibold py-3 rounded-xl mt-4 transition-opacity disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #0D9488, #D97706)' }}
                >
                  {loading ? 'Sending…' : 'Send Reset Link'} {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>

              <p className="text-center text-sm mt-6" style={{ color: '#6B7280' }}>
                Remembered it?{' '}
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
