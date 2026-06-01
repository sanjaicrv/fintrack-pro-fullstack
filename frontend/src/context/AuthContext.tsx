import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { authApi } from '../api/auth'
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types'
import toast from 'react-hot-toast'

interface AuthUser {
  id: number
  firstName: string
  lastName: string
  email: string
  theme: 'LIGHT' | 'DARK'
}

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (data: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => void
  updateUser: (updates: Partial<AuthUser>) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    const token = localStorage.getItem('accessToken')
    if (stored && token) {
      try { setUser(JSON.parse(stored)) } catch { clearAuth() }
    }
    setIsLoading(false)
  }, [])

  const storeAuth = (res: AuthResponse) => {
    localStorage.setItem('accessToken', res.accessToken)
    localStorage.setItem('refreshToken', res.refreshToken)
    const u: AuthUser = {
      id: res.userId, firstName: res.firstName, lastName: res.lastName,
      email: res.email, theme: res.theme,
    }
    localStorage.setItem('user', JSON.stringify(u))
    setUser(u)
  }

  const clearAuth = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setUser(null)
  }

  const login = async (data: LoginRequest) => {
    const res = await authApi.login(data)
    storeAuth(res.data.data!)
    toast.success(`Welcome back, ${res.data.data!.firstName}!`)
  }

  const register = async (data: RegisterRequest) => {
    const res = await authApi.register(data)
    storeAuth(res.data.data!)
    toast.success('Account created successfully!')
  }

  const logout = () => {
    clearAuth()
    toast.success('Logged out successfully')
  }

  const updateUser = (updates: Partial<AuthUser>) => {
    setUser(prev => {
      if (!prev) return prev
      const updated = { ...prev, ...updates }
      localStorage.setItem('user', JSON.stringify(updated))
      return updated
    })
  }

  return (
    <AuthContext.Provider value={{
      user, isLoading, isAuthenticated: !!user,
      login, register, logout, updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
