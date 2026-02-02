import { User, Brand, Influencer, SignUpData, LoginData } from '@/types/auth'
import { delay, generateId } from './utils'

const AUTH_STORAGE_KEY = 'viralfluencer_auth'
const USERS_STORAGE_KEY = 'viralfluencer_users'

// Mock user database (in localStorage)
export const getStoredUsers = (): Record<string, User | Brand | Influencer> => {
  if (typeof window === 'undefined') return {}
  const stored = localStorage.getItem(USERS_STORAGE_KEY)
  return stored ? JSON.parse(stored) : {}
}

export const saveUser = (user: User | Brand | Influencer): void => {
  const users = getStoredUsers()
  users[user.id] = user
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
}

export const getCurrentUser = (): (User | Brand | Influencer) | null => {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem(AUTH_STORAGE_KEY)
  if (!stored) return null

  try {
    const { userId } = JSON.parse(stored)
    const users = getStoredUsers()
    return users[userId] || null
  } catch {
    return null
  }
}

export const setCurrentUser = (user: User | Brand | Influencer): void => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ userId: user.id }))
  saveUser(user)
}

export const clearCurrentUser = (): void => {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}

// Mock authentication functions
export const signUp = async (data: SignUpData): Promise<User> => {
  await delay(800) // Simulate network delay

  // Check if user already exists
  const users = getStoredUsers()
  const existingUser = Object.values(users).find(u => u.email === data.email)

  if (existingUser) {
    throw new Error('An account with this email already exists')
  }

  // Validate password match
  if (data.password !== data.confirmPassword) {
    throw new Error('Passwords do not match')
  }

  // Validate password strength
  if (data.password.length < 8) {
    throw new Error('Password must be at least 8 characters long')
  }

  // Create new user
  const user: User = {
    id: generateId(),
    email: data.email,
    name: data.name,
    role: null,
    emailVerified: false,
    onboardingCompleted: false,
    createdAt: new Date().toISOString(),
  }

  saveUser(user)
  setCurrentUser(user)

  return user
}

export const login = async (data: LoginData): Promise<User | Brand | Influencer> => {
  await delay(800) // Simulate network delay

  const users = getStoredUsers()
  const user = Object.values(users).find(u => u.email === data.email)

  if (!user) {
    throw new Error('Invalid email or password')
  }

  // In a real app, we'd verify the password hash
  // For now, we just simulate successful login

  setCurrentUser(user)

  return user
}

export const logout = async (): Promise<void> => {
  await delay(300)
  clearCurrentUser()
}

export const sendVerificationEmail = async (email: string): Promise<void> => {
  await delay(1000)
  console.log(`Verification email sent to ${email}`)
}

export const verifyEmail = async (token: string): Promise<void> => {
  await delay(800)

  const user = getCurrentUser()
  if (!user) throw new Error('User not found')

  user.emailVerified = true
  saveUser(user)
  setCurrentUser(user)
}

export const sendPasswordResetEmail = async (email: string): Promise<void> => {
  await delay(1000)

  const users = getStoredUsers()
  const user = Object.values(users).find(u => u.email === email)

  if (!user) {
    throw new Error('No account found with this email address')
  }

  console.log(`Password reset email sent to ${email}`)
}

export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  await delay(800)

  if (newPassword.length < 8) {
    throw new Error('Password must be at least 8 characters long')
  }

  // In a real app, we'd verify the token and update the password
  console.log('Password reset successful')
}

export const updateUser = async (updates: Partial<User | Brand | Influencer>): Promise<User | Brand | Influencer> => {
  await delay(500)

  const user = getCurrentUser()
  if (!user) throw new Error('User not found')

  const updatedUser = { ...user, ...updates }
  saveUser(updatedUser)
  setCurrentUser(updatedUser)

  return updatedUser
}

export const completeBrandOnboarding = async (data: Partial<Brand>): Promise<Brand> => {
  await delay(800)

  const user = getCurrentUser()
  if (!user) throw new Error('User not found')

  const brandUser: Brand = {
    ...user,
    role: 'brand',
    companyName: data.companyName || '',
    industry: data.industry || '',
    companySize: data.companySize || '',
    website: data.website,
    goals: data.goals || [],
    budget: data.budget,
    onboardingCompleted: true,
  }

  saveUser(brandUser)
  setCurrentUser(brandUser)

  return brandUser
}

export const completeInfluencerOnboarding = async (data: Partial<Influencer>): Promise<Influencer> => {
  await delay(800)

  const user = getCurrentUser()
  if (!user) throw new Error('User not found')

  const influencerUser: Influencer = {
    ...user,
    role: 'influencer',
    username: data.username || '',
    bio: data.bio || '',
    categories: data.categories || [],
    platforms: data.platforms || [],
    contentTypes: data.contentTypes || [],
    location: data.location,
    onboardingCompleted: true,
  }

  saveUser(influencerUser)
  setCurrentUser(influencerUser)

  return influencerUser
}
