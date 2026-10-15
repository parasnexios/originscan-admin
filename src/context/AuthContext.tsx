import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../api'

interface User {
  id: number
  name: string
  email: string
  role_id: number
  is_super_admin: boolean
}

interface Permissions {
  [moduleCode: string]: {
    view: boolean
    create: boolean
    edit: boolean
    delete: boolean
    export: boolean
  }
}

interface AuthContextType {
  user: User | null
  token: string | null
  permissions: Permissions
  loading: boolean
  login: (token: string, user: User, permissions: Permissions) => void
  logout: () => void
  hasPermission: (moduleCode: string, action?: 'view' | 'create' | 'edit' | 'delete' | 'export') => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('originscan_user')
    return saved ? JSON.parse(saved) : null
  })
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('originscan_token'))
  const [permissions, setPermissions] = useState<Permissions>(() => {
    const saved = localStorage.getItem('originscan_permissions')
    return saved ? JSON.parse(saved) : {}
  })
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const res = await api.get('/auth/me')
        if (res.data?.data) {
          const u = res.data.data
          const perms = u.permissions || {}
          setUser(u)
          setPermissions(perms)
          localStorage.setItem('originscan_user', JSON.stringify(u))
          localStorage.setItem('originscan_permissions', JSON.stringify(perms))
        }
      } catch (err) {
        logout()
      } finally {
        setLoading(false)
      }
    }
    fetchMe()
  }, [token])

  const login = (newToken: string, newUser: User, newPermissions: Permissions) => {
    setToken(newToken)
    setUser(newUser)
    setPermissions(newPermissions)
    localStorage.setItem('originscan_token', newToken)
    localStorage.setItem('originscan_user', JSON.stringify(newUser))
    localStorage.setItem('originscan_permissions', JSON.stringify(newPermissions))
  }

  const logout = () => {
    api.post('/auth/logout').catch(() => {})
    setToken(null)
    setUser(null)
    setPermissions({})
    localStorage.removeItem('originscan_token')
    localStorage.removeItem('originscan_user')
    localStorage.removeItem('originscan_permissions')
  }

  const hasPermission = (moduleCode: string, action: 'view' | 'create' | 'edit' | 'delete' | 'export' = 'view'): boolean => {
    if (!user) return false
    if (user.is_super_admin) return true
    return !!permissions[moduleCode]?.[action]
  }

  return (
    <AuthContext.Provider value={{ user, token, permissions, loading, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
