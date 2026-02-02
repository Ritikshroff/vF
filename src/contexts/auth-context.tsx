'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { User, Brand, Influencer, AuthState, SignUpData, LoginData } from '@/types/auth'
import * as authLib from '@/lib/auth'

interface AuthContextType extends AuthState {
  signUp: (data: SignUpData) => Promise<User>
  login: (data: LoginData) => Promise<User | Brand | Influencer>
  logout: () => Promise<void>
  updateUser: (updates: Partial<User | Brand | Influencer>) => Promise<User | Brand | Influencer>
  refreshUser: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  })

  // Load user on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const user = authLib.getCurrentUser()
        setState({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        })
      } catch (error) {
        console.error('Error loading user:', error)
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        })
      }
    }

    loadUser()
  }, [])

  const signUp = async (data: SignUpData): Promise<User> => {
    const user = await authLib.signUp(data)
    setState({
      user,
      isAuthenticated: true,
      isLoading: false,
    })
    return user
  }

  const login = async (data: LoginData): Promise<User | Brand | Influencer> => {
    const user = await authLib.login(data)
    setState({
      user,
      isAuthenticated: true,
      isLoading: false,
    })
    return user
  }

  const logout = async (): Promise<void> => {
    await authLib.logout()
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    })
  }

  const updateUser = async (updates: Partial<User | Brand | Influencer>): Promise<User | Brand | Influencer> => {
    const updatedUser = await authLib.updateUser(updates)
    setState(prev => ({
      ...prev,
      user: updatedUser,
    }))
    return updatedUser
  }

  const refreshUser = () => {
    const user = authLib.getCurrentUser()
    setState(prev => ({
      ...prev,
      user,
      isAuthenticated: !!user,
    }))
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signUp,
        login,
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
