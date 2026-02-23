'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { User, Brand, Influencer, AuthState, SignUpData, LoginData } from '@/types/auth'
import * as authLib from '@/lib/auth'

interface AuthContextType extends AuthState {
  signUp: (data: SignUpData) => Promise<User>
  login: (data: LoginData) => Promise<User | Brand | Influencer>
  loginWithOAuth: (provider: string) => void
  logout: () => Promise<void>
  updateUser: (updates: Partial<User | Brand | Influencer>) => Promise<User | Brand | Influencer>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  })

  // Load user on mount — instant hydration from localStorage, then validate with server
  useEffect(() => {
    const loadUser = async () => {
      // Instant hydration from localStorage (avoids flash)
      const cachedUser = authLib.getCurrentUser()
      if (cachedUser) {
        setState({ user: cachedUser, isAuthenticated: true, isLoading: true })
      }

      // Validate session against server (uses httpOnly cookie)
      const serverUser = await authLib.fetchCurrentUser()
      setState({
        user: serverUser,
        isAuthenticated: !!serverUser,
        isLoading: false,
      })
    }

    loadUser()
  }, [])

  const signUp = async (data: SignUpData): Promise<User> => {
    const user = await authLib.signUp(data)
    setState({ user, isAuthenticated: true, isLoading: false })
    return user
  }

  const login = async (data: LoginData): Promise<User | Brand | Influencer> => {
    const user = await authLib.login(data)
    setState({ user, isAuthenticated: true, isLoading: false })
    return user
  }

  const logout = async (): Promise<void> => {
    await authLib.logout()
    setState({ user: null, isAuthenticated: false, isLoading: false })
  }

  const updateUser = async (updates: Partial<User | Brand | Influencer>): Promise<User | Brand | Influencer> => {
    const updatedUser = await authLib.updateUser(updates)
    setState(prev => ({ ...prev, user: updatedUser }))
    return updatedUser
  }

  const loginWithOAuth = (provider: string): void => {
    authLib.loginWithOAuth(provider)
  }

  const refreshUser = async (): Promise<void> => {
    const user = await authLib.fetchCurrentUser()
    setState(prev => ({ ...prev, user, isAuthenticated: !!user }))
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signUp,
        login,
        loginWithOAuth,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
