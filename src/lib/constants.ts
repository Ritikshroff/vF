/**
 * App-wide constants and configuration
 */

export const APP_NAME = 'ViralFluencer'
export const APP_DESCRIPTION = 'The premier influencer marketing platform connecting brands with top creators'
export const APP_URL = 'https://viralfluencer.com'

// Navigation Links
export const MARKETING_NAV_LINKS = [
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'For Brands', href: '/for-brands' },
  { label: 'For Influencers', href: '/for-influencers' },
  { label: 'Case Studies', href: '/case-studies' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Blog', href: '/blog' },
] as const

export const PLATFORM_NAV_LINKS = {
  influencer: [
    { label: 'Dashboard', href: '/influencer/dashboard', icon: 'LayoutDashboard' },
    { label: 'Profile', href: '/influencer/profile', icon: 'User' },
    { label: 'Campaigns', href: '/influencer/campaigns', icon: 'Megaphone' },
    { label: 'Marketplace', href: '/marketplace', icon: 'Store' },
    { label: 'Feed', href: '/feed', icon: 'Rss' },
    { label: 'Messages', href: '/influencer/messages', icon: 'MessageSquare' },
    { label: 'Payments', href: '/influencer/payments', icon: 'DollarSign' },
    { label: 'Reputation', href: '/influencer/reputation', icon: 'Award' },
    { label: 'Analytics', href: '/influencer/analytics', icon: 'BarChart3' },
    { label: 'Subscription', href: '/subscriptions', icon: 'Crown' },
  ],
  brand: [
    { label: 'Dashboard', href: '/brand/dashboard', icon: 'LayoutDashboard' },
    { label: 'Discover', href: '/brand/discover', icon: 'Search' },
    { label: 'Campaigns', href: '/brand/campaigns', icon: 'Megaphone' },
    { label: 'Marketplace', href: '/marketplace', icon: 'Store' },
    { label: 'Feed', href: '/feed', icon: 'Rss' },
    { label: 'CRM', href: '/brand/crm', icon: 'Users' },
    { label: 'AI Intelligence', href: '/brand/ai-matching', icon: 'Sparkles' },
    { label: 'Messages', href: '/brand/messages', icon: 'MessageSquare' },
    { label: 'Analytics', href: '/brand/analytics', icon: 'BarChart3' },
    { label: 'Wallet', href: '/brand/wallet', icon: 'Wallet' },
    { label: 'Subscription', href: '/subscriptions', icon: 'Crown' },
  ],
} as const

// Social Platforms
export const SOCIAL_PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: 'Instagram' },
  { id: 'tiktok', name: 'TikTok', icon: 'Music' },
  { id: 'youtube', name: 'YouTube', icon: 'Youtube' },
  { id: 'twitter', name: 'Twitter', icon: 'Twitter' },
  { id: 'facebook', name: 'Facebook', icon: 'Facebook' },
] as const

// Influencer Categories
export const INFLUENCER_CATEGORIES = [
  'Fashion',
  'Beauty',
  'Fitness',
  'Lifestyle',
  'Travel',
  'Food',
  'Tech',
  'Gaming',
  'Business',
  'Finance',
  'Health',
  'Parenting',
  'Education',
  'Entertainment',
  'Sports',
  'Music',
  'Art',
  'Photography',
  'DIY',
  'Pets',
] as const

// Follower Ranges
export const FOLLOWER_RANGES = [
  { label: 'Nano (1K - 10K)', min: 1000, max: 10000 },
  { label: 'Micro (10K - 100K)', min: 10000, max: 100000 },
  { label: 'Mid-tier (100K - 500K)', min: 100000, max: 500000 },
  { label: 'Macro (500K - 1M)', min: 500000, max: 1000000 },
  { label: 'Mega (1M+)', min: 1000000, max: 100000000 },
] as const

// Engagement Rate Ranges
export const ENGAGEMENT_RANGES = [
  { label: 'Low (0-2%)', min: 0, max: 2 },
  { label: 'Average (2-5%)', min: 2, max: 5 },
  { label: 'Good (5-10%)', min: 5, max: 10 },
  { label: 'Excellent (10%+)', min: 10, max: 100 },
] as const

// Campaign Types
export const CAMPAIGN_TYPES = [
  'Sponsored Post',
  'Product Review',
  'Brand Ambassador',
  'Giveaway',
  'Event Coverage',
  'Affiliate Marketing',
  'Content Collaboration',
  'Takeover',
] as const

// Campaign Status
export const CAMPAIGN_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

// Deliverable Types
export const DELIVERABLE_TYPES = [
  { id: 'instagram_post', label: 'Instagram Post', icon: 'Image' },
  { id: 'instagram_story', label: 'Instagram Story', icon: 'Square' },
  { id: 'instagram_reel', label: 'Instagram Reel', icon: 'Video' },
  { id: 'tiktok_video', label: 'TikTok Video', icon: 'Video' },
  { id: 'youtube_video', label: 'YouTube Video', icon: 'Youtube' },
  { id: 'youtube_short', label: 'YouTube Short', icon: 'Video' },
  { id: 'twitter_post', label: 'Twitter Post', icon: 'Twitter' },
  { id: 'blog_post', label: 'Blog Post', icon: 'FileText' },
] as const

// Pricing Tiers
export const PRICING_TIERS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 99,
    period: 'month',
    description: 'Perfect for small businesses and startups',
    features: [
      'Up to 5 active campaigns',
      'Access to 10,000+ influencers',
      'Basic analytics',
      'Email support',
      'Campaign templates',
    ],
    highlighted: false,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 299,
    period: 'month',
    description: 'Ideal for growing brands and agencies',
    features: [
      'Unlimited campaigns',
      'Access to 50,000+ influencers',
      'Advanced analytics',
      'Priority support',
      'Campaign templates',
      'AI-powered matching',
      'Performance tracking',
      'White-label reports',
    ],
    highlighted: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: null,
    period: 'custom',
    description: 'For large-scale marketing operations',
    features: [
      'Everything in Professional',
      'Unlimited team members',
      'Dedicated account manager',
      'Custom integrations',
      'API access',
      'Advanced reporting',
      'Custom contracts',
      'SLA guarantee',
    ],
    highlighted: false,
  },
] as const

// Locations
export const LOCATIONS = [
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'Spain',
  'Italy',
  'Brazil',
  'India',
  'Japan',
  'South Korea',
  'Mexico',
  'Netherlands',
  'Sweden',
] as const

// Languages
export const LANGUAGES = [
  'English',
  'Spanish',
  'French',
  'German',
  'Italian',
  'Portuguese',
  'Japanese',
  'Korean',
  'Chinese',
  'Hindi',
  'Arabic',
] as const

// Stat Display Config
export const STATS_CONFIG = {
  revenue: { prefix: '$', suffix: '', decimals: 0 },
  engagement: { prefix: '', suffix: '%', decimals: 1 },
  followers: { prefix: '', suffix: '', decimals: 0, compact: true },
  campaigns: { prefix: '', suffix: '', decimals: 0 },
  growth: { prefix: '+', suffix: '%', decimals: 1 },
} as const

// Breakpoints (matches Tailwind)
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

// Animation Durations
export const ANIMATION_DURATION = {
  fast: 150,
  normal: 250,
  slow: 350,
} as const

// API Simulation Delay
export const API_DELAY_MS = {
  min: 500,
  max: 800,
} as const

// Pagination
export const DEFAULT_PAGE_SIZE = 12
export const PAGE_SIZE_OPTIONS = [12, 24, 48, 96] as const

// File Upload
export const MAX_FILE_SIZE_MB = 10
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'] as const

// Contact Info
export const CONTACT_EMAIL = 'hello@viralfluencer.com'
export const SUPPORT_EMAIL = 'support@viralfluencer.com'
export const PHONE_NUMBER = '+1 (555) 123-4567'

// Social Links
export const SOCIAL_LINKS = {
  twitter: 'https://twitter.com/viralfluencer',
  instagram: 'https://instagram.com/viralfluencer',
  linkedin: 'https://linkedin.com/company/viralfluencer',
  facebook: 'https://facebook.com/viralfluencer',
  youtube: 'https://youtube.com/@viralfluencer',
} as const

// Footer Links
export const FOOTER_LINKS = {
  product: [
    { label: 'Features', href: '/features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Case Studies', href: '/case-studies' },
    { label: 'Reviews', href: '/reviews' },
  ],
  company: [
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press', href: '/press' },
  ],
  resources: [
    { label: 'Help Center', href: '/help' },
    { label: 'Community', href: '/community' },
    { label: 'Guides', href: '/guides' },
    { label: 'API Docs', href: '/api' },
  ],
  legal: [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
  ],
} as const
