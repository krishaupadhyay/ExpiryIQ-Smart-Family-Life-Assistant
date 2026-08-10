import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bot, CheckCircle2 } from 'lucide-react'

export default function Logout() {
  const navigate = useNavigate()

  useEffect(() => {
    // TODO: clear real auth session here once backend is connected
    // localStorage.removeItem('expiryiq_token')
    // localStorage.removeItem('expiryiq_user')
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#FFFDF7' }}>
      <div className="w-full max-w-md text-center">
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow" style={{ background: 'linear-gradient(135deg, #0D9488, #D97706)' }}>
            <Bot className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#0F1A2E' }}>
            ExpiryIQ
          </span>
        </Link>

        <div className="rounded-2xl p-8" style={{ background: 'white', border: '1px solid rgba(15,26,46,0.08)', boxShadow: '0 4px 24px rgba(15,26,46,0.06)' }}>
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(13,148,136,0.12)' }}>
            <CheckCircle2 className="w-7 h-7" style={{ color: '#0D9488' }} />
          </div>
          <h1 className="text-xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#0F1A2E' }}>
            You've been signed out
          </h1>
          <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
            Thanks for using ExpiryIQ. Come back anytime to keep your family on track.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full text-white font-semibold py-3 rounded-xl transition-opacity"
            style={{ background: 'linear-gradient(135deg, #0D9488, #D97706)' }}
          >
            Sign In Again
          </button>
        </div>
      </div>
    </div>
  )
}
