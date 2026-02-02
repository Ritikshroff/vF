/**
 * Main types export file
 */

// Re-export all types from submodules
export * from './influencer'
export * from './brand'
export * from './campaign'
export * from './analytics'

// Common types
export type UserRole = 'brand' | 'influencer' | null

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  verified: boolean
  createdAt: string
}

export interface Message {
  id: string
  senderId: string
  senderName: string
  senderAvatar?: string
  recipientId: string
  content: string
  timestamp: string
  read: boolean
  attachments?: MessageAttachment[]
}

export interface MessageAttachment {
  id: string
  type: 'image' | 'video' | 'document'
  url: string
  filename: string
  size: number
}

export interface Conversation {
  id: string
  participantId: string
  participantName: string
  participantAvatar?: string
  participantRole: UserRole
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  campaignId?: string
  campaignTitle?: string
}

export interface Notification {
  id: string
  type: 'campaign' | 'message' | 'payment' | 'application' | 'system'
  title: string
  message: string
  timestamp: string
  read: boolean
  link?: string
  icon?: string
}

export interface Testimonial {
  id: string
  author: string
  role: string
  company: string
  avatar: string
  rating: number
  content: string
  date: string
  featured?: boolean
}

export interface CaseStudy {
  id: string
  title: string
  client: string
  clientLogo: string
  industry: string
  image: string
  summary: string
  challenge: string
  solution: string
  results: {
    metric: string
    value: string
    change: string
  }[]
  testimonial?: {
    quote: string
    author: string
    role: string
  }
  createdAt: string
  featured?: boolean
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  author: {
    name: string
    avatar: string
    role: string
  }
  category: string
  tags: string[]
  image: string
  publishedAt: string
  readTime: number
  featured?: boolean
}

export interface FAQ {
  id: string
  question: string
  answer: string
  category: string
}

export interface PricingTier {
  id: string
  name: string
  price: number | null
  period: string
  description: string
  features: string[]
  highlighted?: boolean
  cta?: string
}

export interface NavLink {
  label: string
  href: string
  icon?: string
  children?: NavLink[]
}

export interface SocialLink {
  platform: string
  url: string
  icon: string
}

// Form types
export interface ContactFormData {
  name: string
  email: string
  company?: string
  phone?: string
  message: string
  type: 'brand' | 'influencer' | 'general'
}

export interface SearchFormData {
  query: string
  filters?: Record<string, unknown>
}

// API Response types
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export interface FilterOption {
  label: string
  value: string
  count?: number
}

export interface SortOption {
  label: string
  value: string
  order: 'asc' | 'desc'
}

// UI Component types
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl'

export type CardVariant = 'default' | 'bordered' | 'elevated' | 'flat'

export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'

export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date'

// State types
export interface AppState {
  user: User | null
  userRole: UserRole
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  notifications: Notification[]
}

export interface FilterState {
  [key: string]: unknown
}

export interface SortState {
  field: string
  order: 'asc' | 'desc'
}

// Error types
export interface AppError {
  code: string
  message: string
  details?: unknown
}
