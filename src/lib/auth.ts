import { User, Brand, Influencer, SignUpData, LoginData } from '@/types/auth'

const AUTH_STORAGE_KEY = 'viralfluencer_auth'

// --- User persistence (tokens live in httpOnly cookies only) ---

interface StoredAuth {
  user: User | Brand | Influencer
}

export const getStoredAuth = (): StoredAuth | null => {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem(AUTH_STORAGE_KEY)
  if (!stored) return null
  try {
    return JSON.parse(stored)
  } catch {
    return null
  }
}

export const getCurrentUser = (): (User | Brand | Influencer) | null => {
  return getStoredAuth()?.user ?? null
}

const setStoredUser = (user: User | Brand | Influencer): void => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user }))
}

export const clearStoredAuth = (): void => {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}

/**
 * Validate session against the server and return the current user.
 * Uses httpOnly cookies (sent automatically via credentials: 'include').
 */
export const fetchCurrentUser = async (): Promise<(User | Brand | Influencer) | null> => {
  try {
    const res = await fetch('/api/auth/me', { credentials: 'include' })
    if (!res.ok) return null
    const data = await res.json()
    const user = data.user ?? null
    if (user) setStoredUser(user)
    else clearStoredAuth()
    return user
  } catch {
    return null
  }
}

// --- API helpers ---

async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    credentials: 'include', // send cookies
    ...options,
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error || data.message || `Request failed (${res.status})`)
  }
  return data
}

// --- Auth functions ---

export const signUp = async (data: SignUpData): Promise<User> => {
  const res = await apiRequest<{
    user: User
    accessToken: string
    expiresAt: string
    verificationToken?: string
  }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword || data.password,
      role: data.role || 'BRAND',
    }),
  })

  // Tokens are set as httpOnly cookies by the server — only store user locally
  setStoredUser(res.user)
  return res.user
}

export const login = async (data: LoginData): Promise<User | Brand | Influencer> => {
  const res = await apiRequest<{
    user: User
    accessToken: string
    expiresAt: string
  }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: data.email,
      password: data.password,
      rememberMe: data.rememberMe,
    }),
  })

  // Tokens are set as httpOnly cookies by the server — only store user locally
  setStoredUser(res.user)
  return res.user
}

export const logout = async (): Promise<void> => {
  try {
    await apiRequest('/api/auth/logout', { method: 'POST' })
  } catch {
    // Ignore logout API errors — always clear local state
  }
  clearStoredAuth()
}

export const sendVerificationEmail = async (email: string): Promise<void> => {
  await apiRequest('/api/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export const verifyEmail = async (token: string): Promise<void> => {
  await apiRequest('/api/auth/verify-email', {
    method: 'PUT',
    body: JSON.stringify({ token }),
  })

  // Update stored user
  const auth = getStoredAuth()
  if (auth) {
    auth.user.emailVerified = true
    setStoredUser(auth.user)
  }
}

export const sendPasswordResetEmail = async (email: string): Promise<void> => {
  await apiRequest('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  await apiRequest('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password: newPassword }),
  })
}

export const updateUser = async (updates: Partial<User | Brand | Influencer>): Promise<User | Brand | Influencer> => {
  const auth = getStoredAuth()
  if (!auth?.user) throw new Error('Not authenticated')

  const updatedUser = { ...auth.user, ...updates }
  setStoredUser(updatedUser)
  return updatedUser
}

export const completeBrandOnboarding = async (data: Partial<Brand>): Promise<Brand> => {
  const auth = getStoredAuth()
  if (!auth?.user) throw new Error('Not authenticated')

  const res = await apiRequest<{ brand: Brand }>('/api/onboarding/brand', {
    method: 'POST',
    body: JSON.stringify(data),
  })

  const brandUser: Brand = {
    ...auth.user,
    ...res.brand,
    role: 'BRAND',
    onboardingCompleted: true,
  }
  setStoredUser(brandUser)
  return brandUser
}

export const completeInfluencerOnboarding = async (data: Partial<Influencer>): Promise<Influencer> => {
  const auth = getStoredAuth()
  if (!auth?.user) throw new Error('Not authenticated')

  const res = await apiRequest<{ influencer: Influencer }>('/api/onboarding/influencer', {
    method: 'POST',
    body: JSON.stringify(data),
  })

  const influencerUser: Influencer = {
    ...auth.user,
    ...res.influencer,
    role: 'INFLUENCER',
    onboardingCompleted: true,
  }
  setStoredUser(influencerUser)
  return influencerUser
}
