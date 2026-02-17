export interface User {
  id: string
  email: string
  name: string
  role: 'BRAND' | 'INFLUENCER' | 'ADMIN' | null
  avatar?: string | null
  emailVerified: boolean
  onboardingCompleted: boolean
  brandId?: string
  influencerId?: string
  createdAt?: string
}

export interface Brand extends User {
  role: 'BRAND'
  companyName: string
  industry: string
  companySize: string
  website?: string
  goals: string[]
  budget?: string
}

export interface Influencer extends User {
  role: 'INFLUENCER'
  username: string
  bio: string
  categories: string[]
  platforms: {
    platform: string
    handle: string
    followers: number
    verified: boolean
  }[]
  contentTypes: string[]
  location?: string
}

export interface AuthState {
  user: User | Brand | Influencer | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface SignUpData {
  name: string
  email: string
  password: string
  confirmPassword: string
  role?: 'BRAND' | 'INFLUENCER'
}

export interface LoginData {
  email: string
  password: string
  rememberMe?: boolean
}

export interface OnboardingBrandData {
  companyName: string
  industry: string
  companySize: string
  website?: string
  goals: string[]
  budget?: string
}

export interface OnboardingInfluencerData {
  username: string
  bio: string
  categories: string[]
  platforms: {
    platform: string
    handle: string
    followers: number
  }[]
  contentTypes: string[]
  location?: string
}
