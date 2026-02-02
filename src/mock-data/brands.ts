/**
 * Mock Brands Database
 */

export interface BrandProfile {
  id: string
  userId: string
  companyName: string
  logo: string
  coverImage: string
  industry: string
  website: string
  description: string
  location: string

  // Company Details
  company_size: '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+'
  founded_year: number

  // Campaign Stats
  total_campaigns: number
  active_campaigns: number
  completed_campaigns: number
  total_spent: number
  avg_campaign_budget: number

  // Performance Metrics
  metrics: {
    avg_campaign_roi: number // percentage
    total_reach: number
    total_engagement: number
    total_conversions: number
    influencer_satisfaction_score: number // 0-100
  }

  // Preferences
  preferences: {
    preferred_platforms: string[]
    preferred_categories: string[]
    typical_budget_range: {
      min: number
      max: number
    }
    campaign_goals: string[]
  }

  // Saved Influencers
  saved_influencers: string[] // influencer IDs
  blocked_influencers: string[] // influencer IDs

  // Metadata
  verified: boolean
  created_at: string
  updated_at: string
  rating: number // 0-5
  total_reviews: number
}

export const mockBrands: BrandProfile[] = [
  {
    id: 'brand_001',
    userId: 'user_brand_001',
    companyName: 'EcoWear',
    logo: 'https://via.placeholder.com/200',
    coverImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8',
    industry: 'Fashion',
    website: 'https://ecowear.com',
    description: 'Sustainable fashion brand committed to eco-friendly materials and ethical manufacturing. We create stylish, comfortable clothing that is good for you and the planet.',
    location: 'Portland, USA',
    company_size: '51-200',
    founded_year: 2018,
    total_campaigns: 24,
    active_campaigns: 2,
    completed_campaigns: 22,
    total_spent: 285000,
    avg_campaign_budget: 11875,
    metrics: {
      avg_campaign_roi: 380,
      total_reach: 45000000,
      total_engagement: 3200000,
      total_conversions: 128000,
      influencer_satisfaction_score: 94,
    },
    preferences: {
      preferred_platforms: ['Instagram', 'TikTok', 'YouTube'],
      preferred_categories: ['Fashion', 'Lifestyle', 'Sustainability'],
      typical_budget_range: {
        min: 5000,
        max: 20000,
      },
      campaign_goals: ['Brand Awareness', 'Sales Conversion', 'Community Building'],
    },
    saved_influencers: ['inf_001', 'inf_003', 'inf_007'],
    blocked_influencers: [],
    verified: true,
    created_at: '2024-01-15',
    updated_at: '2026-01-30',
    rating: 4.8,
    total_reviews: 42,
  },
  {
    id: 'brand_002',
    userId: 'user_brand_002',
    companyName: 'TechPro',
    logo: 'https://via.placeholder.com/200',
    coverImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f',
    industry: 'Technology',
    website: 'https://techpro.com',
    description: 'Innovative consumer electronics company specializing in audio products. We blend cutting-edge technology with beautiful design.',
    location: 'San Francisco, USA',
    company_size: '201-500',
    founded_year: 2015,
    total_campaigns: 38,
    active_campaigns: 3,
    completed_campaigns: 35,
    total_spent: 720000,
    avg_campaign_budget: 18947,
    metrics: {
      avg_campaign_roi: 420,
      total_reach: 82000000,
      total_engagement: 6500000,
      total_conversions: 245000,
      influencer_satisfaction_score: 96,
    },
    preferences: {
      preferred_platforms: ['YouTube', 'Instagram', 'TikTok'],
      preferred_categories: ['Technology', 'Gaming', 'Lifestyle'],
      typical_budget_range: {
        min: 10000,
        max: 30000,
      },
      campaign_goals: ['Product Reviews', 'Brand Awareness', 'Sales'],
    },
    saved_influencers: ['inf_002', 'inf_010'],
    blocked_influencers: [],
    verified: true,
    created_at: '2023-08-20',
    updated_at: '2026-01-29',
    rating: 4.9,
    total_reviews: 58,
  },
  {
    id: 'brand_003',
    userId: 'user_brand_003',
    companyName: 'FitLife',
    logo: 'https://via.placeholder.com/200',
    coverImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48',
    industry: 'Fitness & Wellness',
    website: 'https://fitlife.app',
    description: 'All-in-one fitness and wellness app offering personalized workout plans, nutrition tracking, and wellness coaching.',
    location: 'Los Angeles, USA',
    company_size: '11-50',
    founded_year: 2020,
    total_campaigns: 16,
    active_campaigns: 1,
    completed_campaigns: 15,
    total_spent: 180000,
    avg_campaign_budget: 11250,
    metrics: {
      avg_campaign_roi: 510,
      total_reach: 28000000,
      total_engagement: 2800000,
      total_conversions: 85000,
      influencer_satisfaction_score: 92,
    },
    preferences: {
      preferred_platforms: ['Instagram', 'TikTok', 'YouTube'],
      preferred_categories: ['Fitness', 'Health & Wellness', 'Lifestyle'],
      typical_budget_range: {
        min: 8000,
        max: 15000,
      },
      campaign_goals: ['App Downloads', 'Subscriptions', 'Community Engagement'],
    },
    saved_influencers: ['inf_003'],
    blocked_influencers: [],
    verified: true,
    created_at: '2024-03-10',
    updated_at: '2026-01-31',
    rating: 4.7,
    total_reviews: 28,
  },
  {
    id: 'brand_004',
    userId: 'user_brand_004',
    companyName: 'GlowCosmetics',
    logo: 'https://via.placeholder.com/200',
    coverImage: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348',
    industry: 'Beauty & Cosmetics',
    website: 'https://glowcosmetics.com',
    description: 'Cruelty-free, vegan beauty brand creating vibrant, high-quality makeup for everyone. Express yourself with confidence.',
    location: 'New York, USA',
    company_size: '51-200',
    founded_year: 2017,
    total_campaigns: 32,
    active_campaigns: 2,
    completed_campaigns: 30,
    total_spent: 420000,
    avg_campaign_budget: 13125,
    metrics: {
      avg_campaign_roi: 450,
      total_reach: 62000000,
      total_engagement: 5200000,
      total_conversions: 185000,
      influencer_satisfaction_score: 95,
    },
    preferences: {
      preferred_platforms: ['Instagram', 'TikTok', 'YouTube'],
      preferred_categories: ['Beauty', 'Fashion', 'Lifestyle'],
      typical_budget_range: {
        min: 6000,
        max: 18000,
      },
      campaign_goals: ['Product Launch', 'Brand Awareness', 'Sales'],
    },
    saved_influencers: ['inf_006', 'inf_009'],
    blocked_influencers: [],
    verified: true,
    created_at: '2023-11-05',
    updated_at: '2026-01-30',
    rating: 4.8,
    total_reviews: 46,
  },
];

export const getAllBrands = (): BrandProfile[] => {
  return mockBrands;
};

export const getBrandById = (id: string): BrandProfile | undefined => {
  return mockBrands.find((brand) => brand.id === id);
};

export const getBrandByUserId = (userId: string): BrandProfile | undefined => {
  return mockBrands.find((brand) => brand.userId === userId);
};
