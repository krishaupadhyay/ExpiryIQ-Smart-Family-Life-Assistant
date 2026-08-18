import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { apiRequest } from '../services/api'

export default function PublicOnlyRoute() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // ✅ Try to get current user
        await apiRequest('/auth/me', {
          method: 'GET'
        })
        
        // ✅ If successful, user IS authenticated
        setIsAuthenticated(true)
      } catch (error) {
        // ❌ If fails, user is NOT authenticated
        console.warn('Auth check failed (expected):', error)
        setIsAuthenticated(false)
      }
    }

    checkAuth()
  }, [])

  // ⏳ Show loading while checking auth
  if (isAuthenticated === null) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FFFDF7'
        }}
      >
        <div style={{ textAlign: 'center', color: '#6B7280' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '4px solid #E5E7EB',
              borderTop: '4px solid #0D9488',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }}
          />
          <p>Checking authentication...</p>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    )
  }

  // ❌ User IS authenticated → redirect to profile selection
  if (isAuthenticated) {
    return <Navigate to="/profiles" replace />
  }

  // ✅ User is NOT authenticated → allow access to login/signup
  return <Outlet />
}