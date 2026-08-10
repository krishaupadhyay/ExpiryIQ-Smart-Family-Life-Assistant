import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bot, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please enter both email and password.')
      return
    }

    setLoading(true)
    try {
      // TODO: replace with a real API call once the backend is connected
      // const res = await fetch('http://localhost:5000/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password })
      // })
      // const data = await res.json()
      // if (!res.ok) throw new Error(data.message)

      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Incorrect email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#FFFDF7' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow" style={{ background: 'linear-gradient(135deg, #0D9488, #D97706)' }}>
            <Bot className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#0F1A2E' }}>
            ExpiryIQ
          </span>
        </Link>

        <div className="rounded-2xl p-8" style={{ background: 'white', border: '1px solid rgba(15,26,46,0.08)', boxShadow: '0 4px 24px rgba(15,26,46,0.06)' }}>
          <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#0F1A2E' }}>
            Welcome back
          </h1>
          <p className="text-sm mb-7" style={{ color: '#6B7280' }}>Sign in to your family dashboard</p>

          <form onSubmit={handleSubmit}>
            <label className="text-sm font-semibold block mb-1.5" style={{ color: '#374151' }}>Email</label>
            <div className="relative mb-4">
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

            <label className="text-sm font-semibold block mb-1.5" style={{ color: '#374151' }}>Password</label>
            <div className="relative mb-2">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm outline-none transition-all"
                style={{ background: 'rgba(15,26,46,0.03)', border: '1px solid rgba(15,26,46,0.1)', color: '#1C1917' }}
                onFocus={e => { e.currentTarget.style.border = '1px solid #0D9488'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(13,148,136,0.12)' }}
                onBlur={e => { e.currentTarget.style.border = '1px solid rgba(15,26,46,0.1)'; e.currentTarget.style.boxShadow = 'none' }}
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

            {error && <p className="text-xs mb-3" style={{ color: '#EF4444' }}>{error}</p>}

            <div className="text-right mb-6">
              <Link to="/forgot-password" className="text-xs font-medium" style={{ color: '#0D9488' }}>
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 text-white font-semibold py-3 rounded-xl transition-opacity disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #0D9488, #D97706)' }}
            >
              {loading ? 'Signing in…' : 'Sign In'} {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: '#6B7280' }}>
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold" style={{ color: '#0D9488' }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
