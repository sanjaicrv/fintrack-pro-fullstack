import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { userApi } from '../api/user'

interface ThemeContextType {
  isDark: boolean
  toggle: () => Promise<void>
}

const ThemeContext = createContext<ThemeContextType | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user, updateUser } = useAuth()
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const dark = user?.theme === 'DARK'
    setIsDark(dark)
    document.documentElement.classList.toggle('dark', dark)
  }, [user?.theme])

  const toggle = async () => {
    if (!user) return
    try {
      const res = await userApi.toggleTheme()
      const newTheme = res.data.data!.theme
      updateUser({ theme: newTheme })
      const dark = newTheme === 'DARK'
      setIsDark(dark)
      document.documentElement.classList.toggle('dark', dark)
    } catch {}
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
