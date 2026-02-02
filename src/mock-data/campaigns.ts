/**
 * Mock Campaigns Database
 */

export interface Campaign {
  id: string
  brandId: string
  brandName: string
  brandLogo: string
  title: string
  description: string
  category: string

  // Campaign Details
  goals: string[]
  platforms: string[]
  target_audience: {
    age_range: string[]
    gender: string[]
    locations: string[]
  }

  // Requirements
  requirements: {
    min_followers: number
    max_followers: number | null
    min_engagement_rate: number
    content_types: string[]
    deliverables: {
      type: string
      quantity: number
      description: string
    }[]
  }

  // Budget & Compensation
  budget: {
    min: number
    max: number
    currency: string
  }
  compensation_type: 'fixed' | 'performance' | 'product' | 'hybrid'

  // Timeline
  application_deadline: string
  campaign_start_date: string
  campaign_end_date: string
  content_due_date: string

  // Status
  status: 'draft' | 'active' | 'in_progress' | 'completed' | 'cancelled'
  visibility: 'public' | 'private' | 'invite_only'

  // Influencers
  invited_influencers: string[] // influencer IDs
  applied_influencers: string[] // influencer IDs
  accepted_influencers: string[] // influencer IDs
  max_influencers: number

  // Performance (for completed campaigns)
  performance?: {
    total_reach: number
    total_engagement: number
    total_conversions: number
    roi: number // percentage
  }

  // Metadata
  created_at: string
  updated_at: string
}

export const mockCampaigns: Campaign[] = [
  {
    id: 'camp_001',
    brandId: 'brand_001',
    brandName: 'EcoWear',
    brandLogo: 'https://via.placeholder.com/100',
    title: 'Spring Sustainable Fashion Launch',
    description: 'We are launching our new sustainable spring collection and looking for fashion-forward creators who share our values of environmental responsibility. Join us in promoting eco-friendly fashion that doesn\'t compromise on style.',
    category: 'Fashion',
    goals: ['Brand Awareness', 'Product Launch', 'Sales Conversion'],
    platforms: ['Instagram', 'TikTok'],
    target_audience: {
      age_range: ['18-24', '25-34'],
      gender: ['Female', 'All Genders'],
      locations: ['United States', 'United Kingdom', 'Canada', 'Australia'],
    },
    requirements: {
      min_followers: 50000,
      max_followers: 500000,
      min_engagement_rate: 3.5,
      content_types: ['Photos', 'Reels/Shorts', 'Stories'],
      deliverables: [
        {
          type: 'Instagram Reel',
          quantity: 2,
          description: '60-second Reels showcasing our spring collection',
        },
        {
          type: 'Instagram Story',
          quantity: 5,
          description: 'Behind-the-scenes and styling tips',
        },
        {
          type: 'Instagram Post',
          quantity: 1,
          description: 'Professional photo post with caption',
        },
      ],
    },
    budget: {
      min: 3000,
      max: 6000,
      currency: 'USD',
    },
    compensation_type: 'hybrid',
    application_deadline: '2026-02-20',
    campaign_start_date: '2026-03-01',
    campaign_end_date: '2026-03-31',
    content_due_date: '2026-03-15',
    status: 'active',
    visibility: 'public',
    invited_influencers: ['inf_001', 'inf_003'],
    applied_influencers: ['inf_001', 'inf_005', 'inf_008'],
    accepted_influencers: ['inf_001'],
    max_influencers: 10,
    created_at: '2026-01-15',
    updated_at: '2026-01-30',
  },
  {
    id: 'camp_002',
    brandId: 'brand_002',
    brandName: 'TechPro',
    brandLogo: 'https://via.placeholder.com/100',
    title: 'Wireless Earbuds Review Campaign',
    description: 'Looking for tech reviewers to create honest, detailed reviews of our new flagship wireless earbuds. Perfect for creators focused on tech, audio, and lifestyle content.',
    category: 'Technology',
    goals: ['Product Reviews', 'Brand Awareness', 'Sales'],
    platforms: ['YouTube', 'Instagram'],
    target_audience: {
      age_range: ['18-24', '25-34', '35-44'],
      gender: ['Male', 'All Genders'],
      locations: ['United States', 'Canada', 'United Kingdom'],
    },
    requirements: {
      min_followers: 100000,
      max_followers: null,
      min_engagement_rate: 4.0,
      content_types: ['Videos', 'Reels/Shorts', 'Reviews'],
      deliverables: [
        {
          type: 'YouTube Video',
          quantity: 1,
          description: '8-12 minute detailed review video',
        },
        {
          type: 'Instagram Reel',
          quantity: 2,
          description: 'Short-form review content',
        },
      ],
    },
    budget: {
      min: 5000,
      max: 15000,
      currency: 'USD',
    },
    compensation_type: 'fixed',
    application_deadline: '2026-02-15',
    campaign_start_date: '2026-02-20',
    campaign_end_date: '2026-03-20',
    content_due_date: '2026-03-05',
    status: 'active',
    visibility: 'public',
    invited_influencers: ['inf_002'],
    applied_influencers: ['inf_002', 'inf_010'],
    accepted_influencers: ['inf_002'],
    max_influencers: 5,
    created_at: '2026-01-20',
    updated_at: '2026-01-28',
  },
  {
    id: 'camp_003',
    brandId: 'brand_003',
    brandName: 'FitLife',
    brandLogo: 'https://via.placeholder.com/100',
    title: '30-Day Fitness Challenge',
    description: 'Join our 30-day fitness transformation challenge! We are looking for fitness creators to lead and inspire their communities with our workout programs and nutrition plans.',
    category: 'Fitness',
    goals: ['Community Engagement', 'App Downloads', 'Subscriptions'],
    platforms: ['Instagram', 'TikTok', 'YouTube'],
    target_audience: {
      age_range: ['18-24', '25-34', '35-44'],
      gender: ['All Genders'],
      locations: ['United States', 'Canada', 'Australia', 'United Kingdom'],
    },
    requirements: {
      min_followers: 150000,
      max_followers: null,
      min_engagement_rate: 5.0,
      content_types: ['Videos', 'Reels/Shorts', 'Stories'],
      deliverables: [
        {
          type: 'Daily Instagram Stories',
          quantity: 30,
          description: 'Daily workout and motivation updates',
        },
        {
          type: 'Instagram Reels',
          quantity: 10,
          description: 'Workout tutorials and progress updates',
        },
        {
          type: 'YouTube Videos',
          quantity: 4,
          description: 'Weekly check-ins and detailed workouts',
        },
      ],
    },
    budget: {
      min: 8000,
      max: 12000,
      currency: 'USD',
    },
    compensation_type: 'performance',
    application_deadline: '2026-02-25',
    campaign_start_date: '2026-03-01',
    campaign_end_date: '2026-03-31',
    content_due_date: '2026-04-05',
    status: 'active',
    visibility: 'invite_only',
    invited_influencers: ['inf_003'],
    applied_influencers: [],
    accepted_influencers: [],
    max_influencers: 3,
    created_at: '2026-01-25',
    updated_at: '2026-01-29',
  },
  {
    id: 'camp_004',
    brandId: 'brand_004',
    brandName: 'GlowCosmetics',
    brandLogo: 'https://via.placeholder.com/100',
    title: 'Summer Glow Collection Launch',
    description: 'Introducing our vibrant summer makeup collection! Seeking beauty creators for product reviews, tutorials, and creative makeup looks.',
    category: 'Beauty',
    goals: ['Product Launch', 'Brand Awareness', 'Sales'],
    platforms: ['Instagram', 'TikTok', 'YouTube'],
    target_audience: {
      age_range: ['16-24', '25-34'],
      gender: ['Female', 'All Genders'],
      locations: ['United States', 'United Kingdom', 'Canada'],
    },
    requirements: {
      min_followers: 75000,
      max_followers: 800000,
      min_engagement_rate: 4.5,
      content_types: ['Videos', 'Reels/Shorts', 'Photos'],
      deliverables: [
        {
          type: 'Makeup Tutorial',
          quantity: 2,
          description: 'Full tutorials using our summer collection',
        },
        {
          type: 'Instagram Reels',
          quantity: 4,
          description: 'Quick makeup looks and product showcases',
        },
      ],
    },
    budget: {
      min: 4000,
      max: 8000,
      currency: 'USD',
    },
    compensation_type: 'hybrid',
    application_deadline: '2026-03-01',
    campaign_start_date: '2026-03-15',
    campaign_end_date: '2026-04-30',
    content_due_date: '2026-04-15',
    status: 'active',
    visibility: 'public',
    invited_influencers: [],
    applied_influencers: ['inf_006', 'inf_009'],
    accepted_influencers: [],
    max_influencers: 15,
    created_at: '2026-01-28',
    updated_at: '2026-01-30',
  },
  {
    id: 'camp_005',
    brandId: 'brand_001',
    brandName: 'EcoWear',
    brandLogo: 'https://via.placeholder.com/100',
    title: 'Holiday Season Sustainable Gift Guide',
    description: 'COMPLETED: Our holiday campaign featuring sustainable fashion as perfect gifts. Amazing results from our creator partnerships!',
    category: 'Fashion',
    goals: ['Holiday Sales', 'Brand Awareness', 'Gift Guide Features'],
    platforms: ['Instagram', 'TikTok', 'YouTube'],
    target_audience: {
      age_range: ['18-24', '25-34', '35-44'],
      gender: ['All Genders'],
      locations: ['United States', 'Canada', 'United Kingdom'],
    },
    requirements: {
      min_followers: 80000,
      max_followers: 600000,
      min_engagement_rate: 3.8,
      content_types: ['Photos', 'Videos', 'Reels/Shorts'],
      deliverables: [
        {
          type: 'Gift Guide Video',
          quantity: 1,
          description: 'Holiday gift guide featuring our products',
        },
        {
          type: 'Instagram Posts',
          quantity: 3,
          description: 'Individual product features',
        },
      ],
    },
    budget: {
      min: 5000,
      max: 10000,
      currency: 'USD',
    },
    compensation_type: 'hybrid',
    application_deadline: '2025-11-01',
    campaign_start_date: '2025-11-15',
    campaign_end_date: '2025-12-25',
    content_due_date: '2025-12-10',
    status: 'completed',
    visibility: 'public',
    invited_influencers: ['inf_001', 'inf_007'],
    applied_influencers: ['inf_001', 'inf_007', 'inf_011'],
    accepted_influencers: ['inf_001', 'inf_007'],
    max_influencers: 8,
    performance: {
      total_reach: 2400000,
      total_engagement: 186000,
      total_conversions: 4200,
      roi: 420,
    },
    created_at: '2025-10-15',
    updated_at: '2025-12-30',
  },
];

export const getAllCampaigns = (): Campaign[] => {
  return mockCampaigns;
};

export const getCampaignById = (id: string): Campaign | undefined => {
  return mockCampaigns.find((campaign) => campaign.id === id);
};

export const getActiveCampaigns = (): Campaign[] => {
  return mockCampaigns.filter((campaign) => campaign.status === 'active');
};

export const getCampaignsByBrand = (brandId: string): Campaign[] => {
  return mockCampaigns.filter((campaign) => campaign.brandId === brandId);
};

export const getInfluencerCampaigns = (influencerId: string): {
  invited: Campaign[]
  applied: Campaign[]
  accepted: Campaign[]
} => {
  return {
    invited: mockCampaigns.filter((c) => c.invited_influencers.includes(influencerId)),
    applied: mockCampaigns.filter((c) => c.applied_influencers.includes(influencerId)),
    accepted: mockCampaigns.filter((c) => c.accepted_influencers.includes(influencerId)),
  };
};
