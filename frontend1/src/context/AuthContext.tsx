import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode
} from 'react'
import { apiRequest } from '../services/api'

type User = {
  _id: string
  name: string
  email: string
  familyMembers?: Array<{
    _id: string
    name: string
    relation: string
    age?: number
  }>
}

type AuthContextType = {
  user: User | null
  isAuthenticated: boolean | null
  loading: boolean
  login: (email: string, password: string) => Promise<User>
  logout: () => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<User>
  refreshAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  // ✅ Check if user is authenticated on app load
  const refreshAuth = async () => {
    try {
      setLoading(true)
      const data = await apiRequest('/auth/me', {
        method: 'GET'
      })
      setUser(data.user)
      setIsAuthenticated(true)
      console.log('✅ User authenticated:', data.user.email)
    } catch (error) {
      console.warn('❌ Not authenticated')
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  // ✅ Call refreshAuth on app mount
  useEffect(() => {
    refreshAuth()
  }, [])

  // ✅ Login function
  const login = async (email: string, password: string) => {
    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      })
      setUser(data.user)
      setIsAuthenticated(true)
      return data.user
    } catch (error) {
      setIsAuthenticated(false)
      throw error
    }
  }

  // ✅ Signup function
  const signup = async (name: string, email: string, password: string) => {
    try {
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
      })
      // Note: Registration doesn't auto-login, so don't set authenticated
      return data.user
    } catch (error) {
      throw error
    }
  }

  // ✅ Logout function
  const logout = async () => {
    try {
      await apiRequest('/auth/logout', {
        method: 'POST'
      })
      console.log('✅ Logged out')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setIsAuthenticated(false)
      localStorage.removeItem('selectedProfile')
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    signup,
    refreshAuth
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}