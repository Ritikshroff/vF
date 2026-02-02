/**
 * Mock Influencer Database
 * 30 realistic influencer profiles for the platform
 */

export interface InfluencerProfile {
  id: string
  userId: string
  username: string
  fullName: string
  bio: string
  avatar: string
  coverImage: string
  location: string
  categories: string[]
  contentTypes: string[]
  verified: boolean

  // Platform Stats
  platforms: {
    platform: string
    handle: string
    followers: number
    verified: boolean
    engagement_rate: number
    avg_likes: number
    avg_comments: number
    avg_views: number
  }[]

  // Audience Demographics
  audience: {
    age_ranges: {
      '13-17': number
      '18-24': number
      '25-34': number
      '35-44': number
      '45-54': number
      '55+': number
    }
    gender: {
      male: number
      female: number
      other: number
    }
    top_countries: {
      country: string
      percentage: number
    }[]
    top_cities: {
      city: string
      percentage: number
    }[]
  }

  // Performance Metrics
  metrics: {
    total_reach: number
    avg_engagement_rate: number
    authenticity_score: number // 0-100
    brand_safety_score: number // 0-100
    response_rate: number // 0-100
    avg_response_time: string // e.g., "2 hours"
  }

  // Pricing
  pricing: {
    instagram_post: number
    instagram_story: number
    instagram_reel: number
    tiktok_video: number
    youtube_video: number
    youtube_short: number
  }

  // Past Collaborations
  past_brands: string[]
  total_campaigns: number
  campaign_success_rate: number // 0-100

  // Availability
  availability: 'available' | 'busy' | 'booked'
  next_available_date: string

  // Growth Trends (last 6 months)
  growth_trend: {
    month: string
    followers: number
    engagement_rate: number
  }[]

  // Content Performance (recent posts)
  recent_posts: {
    id: string
    type: 'post' | 'story' | 'reel' | 'video'
    platform: string
    thumbnail: string
    likes: number
    comments: number
    views: number
    engagement_rate: number
    posted_at: string
  }[]

  // Profile Metadata
  created_at: string
  updated_at: string
  rating: number // 0-5
  total_reviews: number
}

export const mockInfluencers: InfluencerProfile[] = [
  {
    id: 'inf_001',
    userId: 'user_001',
    username: '@sophiamiller',
    fullName: 'Sophia Miller',
    bio: 'Fashion & Lifestyle creator | NYC 🗽 | Sustainable fashion advocate | Collaborations: dm@sophiamiller.com',
    avatar: 'https://i.pravatar.cc/300?img=1',
    coverImage: 'https://images.unsplash.com/photo-1483985988355-763728e1935b',
    location: 'New York, USA',
    categories: ['Fashion', 'Lifestyle', 'Sustainability'],
    contentTypes: ['Photos', 'Reels/Shorts', 'Stories'],
    verified: true,
    platforms: [
      {
        platform: 'Instagram',
        handle: '@sophiamiller',
        followers: 285000,
        verified: true,
        engagement_rate: 4.8,
        avg_likes: 13680,
        avg_comments: 842,
        avg_views: 95000,
      },
      {
        platform: 'TikTok',
        handle: '@sophiamiller',
        followers: 420000,
        verified: true,
        engagement_rate: 6.2,
        avg_likes: 26040,
        avg_comments: 1250,
        avg_views: 180000,
      },
    ],
    audience: {
      age_ranges: {
        '13-17': 8,
        '18-24': 45,
        '25-34': 32,
        '35-44': 10,
        '45-54': 3,
        '55+': 2,
      },
      gender: {
        male: 25,
        female: 72,
        other: 3,
      },
      top_countries: [
        { country: 'United States', percentage: 52 },
        { country: 'United Kingdom', percentage: 18 },
        { country: 'Canada', percentage: 12 },
        { country: 'Australia', percentage: 8 },
        { country: 'Germany', percentage: 6 },
      ],
      top_cities: [
        { city: 'New York', percentage: 18 },
        { city: 'Los Angeles', percentage: 14 },
        { city: 'London', percentage: 12 },
        { city: 'Toronto', percentage: 8 },
        { city: 'Sydney', percentage: 6 },
      ],
    },
    metrics: {
      total_reach: 1200000,
      avg_engagement_rate: 5.2,
      authenticity_score: 94,
      brand_safety_score: 98,
      response_rate: 95,
      avg_response_time: '2 hours',
    },
    pricing: {
      instagram_post: 3500,
      instagram_story: 1200,
      instagram_reel: 4500,
      tiktok_video: 5000,
      youtube_video: 0,
      youtube_short: 0,
    },
    past_brands: ['Zara', 'H&M', 'Reformation', 'Everlane', 'Glossier'],
    total_campaigns: 42,
    campaign_success_rate: 96,
    availability: 'available',
    next_available_date: '2026-02-15',
    growth_trend: [
      { month: 'Aug 2025', followers: 245000, engagement_rate: 4.9 },
      { month: 'Sep 2025', followers: 252000, engagement_rate: 5.0 },
      { month: 'Oct 2025', followers: 262000, engagement_rate: 5.1 },
      { month: 'Nov 2025', followers: 271000, engagement_rate: 5.2 },
      { month: 'Dec 2025', followers: 278000, engagement_rate: 5.3 },
      { month: 'Jan 2026', followers: 285000, engagement_rate: 5.2 },
    ],
    recent_posts: [
      {
        id: 'post_001',
        type: 'reel',
        platform: 'Instagram',
        thumbnail: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d',
        likes: 18500,
        comments: 1240,
        views: 125000,
        engagement_rate: 6.5,
        posted_at: '2026-01-28',
      },
      {
        id: 'post_002',
        type: 'post',
        platform: 'Instagram',
        thumbnail: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f',
        likes: 14200,
        comments: 892,
        views: 0,
        engagement_rate: 5.3,
        posted_at: '2026-01-25',
      },
    ],
    created_at: '2024-03-15',
    updated_at: '2026-01-30',
    rating: 4.9,
    total_reviews: 38,
  },
  {
    id: 'inf_002',
    userId: 'user_002',
    username: '@alextech',
    fullName: 'Alex Rodriguez',
    bio: 'Tech Reviewer & Gadget Enthusiast 📱 | Unboxing the future | SF Bay Area | For business: alex@techreviews.co',
    avatar: 'https://i.pravatar.cc/300?img=12',
    coverImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c',
    location: 'San Francisco, USA',
    categories: ['Technology', 'Reviews', 'Gaming'],
    contentTypes: ['Videos', 'Reels/Shorts', 'Reviews'],
    verified: true,
    platforms: [
      {
        platform: 'YouTube',
        handle: '@AlexTechReviews',
        followers: 892000,
        verified: true,
        engagement_rate: 8.4,
        avg_likes: 74928,
        avg_comments: 4580,
        avg_views: 320000,
      },
      {
        platform: 'Instagram',
        handle: '@alextech',
        followers: 156000,
        verified: true,
        engagement_rate: 5.2,
        avg_likes: 8112,
        avg_comments: 420,
        avg_views: 45000,
      },
    ],
    audience: {
      age_ranges: {
        '13-17': 18,
        '18-24': 35,
        '25-34': 28,
        '35-44': 12,
        '45-54': 5,
        '55+': 2,
      },
      gender: {
        male: 82,
        female: 16,
        other: 2,
      },
      top_countries: [
        { country: 'United States', percentage: 48 },
        { country: 'India', percentage: 15 },
        { country: 'United Kingdom', percentage: 12 },
        { country: 'Canada', percentage: 10 },
        { country: 'Germany', percentage: 8 },
      ],
      top_cities: [
        { city: 'San Francisco', percentage: 12 },
        { city: 'Mumbai', percentage: 10 },
        { city: 'New York', percentage: 9 },
        { city: 'London', percentage: 8 },
        { city: 'Toronto', percentage: 7 },
      ],
    },
    metrics: {
      total_reach: 2800000,
      avg_engagement_rate: 7.8,
      authenticity_score: 92,
      brand_safety_score: 96,
      response_rate: 88,
      avg_response_time: '4 hours',
    },
    pricing: {
      instagram_post: 2500,
      instagram_story: 800,
      instagram_reel: 3500,
      tiktok_video: 0,
      youtube_video: 15000,
      youtube_short: 4000,
    },
    past_brands: ['Apple', 'Samsung', 'Sony', 'Anker', 'Razer', 'LG'],
    total_campaigns: 56,
    campaign_success_rate: 94,
    availability: 'available',
    next_available_date: '2026-02-10',
    growth_trend: [
      { month: 'Aug 2025', followers: 820000, engagement_rate: 7.9 },
      { month: 'Sep 2025', followers: 838000, engagement_rate: 8.0 },
      { month: 'Oct 2025', followers: 852000, engagement_rate: 8.1 },
      { month: 'Nov 2025', followers: 868000, engagement_rate: 8.2 },
      { month: 'Dec 2025', followers: 880000, engagement_rate: 8.3 },
      { month: 'Jan 2026', followers: 892000, engagement_rate: 8.4 },
    ],
    recent_posts: [],
    created_at: '2023-08-20',
    updated_at: '2026-01-29',
    rating: 4.8,
    total_reviews: 52,
  },
  {
    id: 'inf_003',
    userId: 'user_003',
    username: '@emmafitness',
    fullName: 'Emma Johnson',
    bio: 'Certified Personal Trainer 💪 | Fitness & Wellness | Helping you live your best life | Miami 🌴',
    avatar: 'https://i.pravatar.cc/300?img=5',
    coverImage: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b',
    location: 'Miami, USA',
    categories: ['Fitness', 'Health & Wellness', 'Lifestyle'],
    contentTypes: ['Videos', 'Reels/Shorts', 'Photos'],
    verified: true,
    platforms: [
      {
        platform: 'Instagram',
        handle: '@emmafitness',
        followers: 524000,
        verified: true,
        engagement_rate: 6.8,
        avg_likes: 35632,
        avg_comments: 1820,
        avg_views: 142000,
      },
      {
        platform: 'TikTok',
        handle: '@emmafitness',
        followers: 1200000,
        verified: true,
        engagement_rate: 9.2,
        avg_likes: 110400,
        avg_comments: 4800,
        avg_views: 580000,
      },
    ],
    audience: {
      age_ranges: {
        '13-17': 5,
        '18-24': 32,
        '25-34': 38,
        '35-44': 18,
        '45-54': 5,
        '55+': 2,
      },
      gender: {
        male: 38,
        female: 60,
        other: 2,
      },
      top_countries: [
        { country: 'United States', percentage: 58 },
        { country: 'Canada', percentage: 15 },
        { country: 'Australia', percentage: 10 },
        { country: 'United Kingdom', percentage: 8 },
        { country: 'Brazil', percentage: 6 },
      ],
      top_cities: [
        { city: 'Miami', percentage: 15 },
        { city: 'Los Angeles', percentage: 12 },
        { city: 'New York', percentage: 10 },
        { city: 'Toronto', percentage: 8 },
        { city: 'Sydney', percentage: 7 },
      ],
    },
    metrics: {
      total_reach: 3500000,
      avg_engagement_rate: 8.5,
      authenticity_score: 96,
      brand_safety_score: 99,
      response_rate: 92,
      avg_response_time: '3 hours',
    },
    pricing: {
      instagram_post: 5000,
      instagram_story: 1800,
      instagram_reel: 6500,
      tiktok_video: 8000,
      youtube_video: 0,
      youtube_short: 0,
    },
    past_brands: ['Nike', 'Gymshark', 'Lululemon', 'MyProtein', 'FitBit'],
    total_campaigns: 64,
    campaign_success_rate: 97,
    availability: 'busy',
    next_available_date: '2026-03-01',
    growth_trend: [
      { month: 'Aug 2025', followers: 480000, engagement_rate: 8.1 },
      { month: 'Sep 2025', followers: 492000, engagement_rate: 8.2 },
      { month: 'Oct 2025', followers: 502000, engagement_rate: 8.3 },
      { month: 'Nov 2025', followers: 512000, engagement_rate: 8.4 },
      { month: 'Dec 2025', followers: 518000, engagement_rate: 8.5 },
      { month: 'Jan 2026', followers: 524000, engagement_rate: 8.5 },
    ],
    recent_posts: [],
    created_at: '2023-05-10',
    updated_at: '2026-01-31',
    rating: 4.9,
    total_reviews: 61,
  },
];

// Generate 27 more influencers with varied profiles
export const generateMockInfluencers = (): InfluencerProfile[] => {
  const baseInfluencers = [...mockInfluencers];

  const categories = [
    'Beauty', 'Travel', 'Food', 'Photography', 'Art', 'Music', 'Parenting',
    'DIY', 'Home Decor', 'Finance', 'Education', 'Comedy', 'Sports',
    'Business', 'Pets', 'Cars', 'Books', 'Dance', 'Environment'
  ];

  const locations = [
    'Los Angeles, USA', 'London, UK', 'Paris, France', 'Tokyo, Japan',
    'Sydney, Australia', 'Toronto, Canada', 'Dubai, UAE', 'Berlin, Germany',
    'Mumbai, India', 'São Paulo, Brazil', 'Singapore', 'Seoul, South Korea',
    'Barcelona, Spain', 'Amsterdam, Netherlands', 'Mexico City, Mexico'
  ];

  const names = [
    'Marcus Chen', 'Isabella Garcia', 'David Kim', 'Olivia Brown', 'Lucas Silva',
    'Mia Anderson', 'Ethan Williams', 'Ava Martinez', 'Noah Wilson', 'Charlotte Lee',
    'Liam Taylor', 'Amelia Clark', 'James Rodriguez', 'Harper Lewis', 'Benjamin Hall',
    'Evelyn King', 'Mason Scott', 'Abigail Green', 'Logan Adams', 'Emily Turner',
    'Alexander Baker', 'Sofia Mitchell', 'Daniel Campbell', 'Madison Parker', 'Matthew Evans',
    'Ella Collins', 'Henry Stewart'
  ];

  for (let i = 0; i < 27; i++) {
    const id = `inf_${String(i + 4).padStart(3, '0')}`;
    const name = names[i];
    const username = `@${name.toLowerCase().replace(' ', '')}`;
    const category = categories[i % categories.length];
    const location = locations[i % locations.length];
    const followers = Math.floor(Math.random() * 900000) + 50000;
    const engagementRate = (Math.random() * 8 + 2).toFixed(1);

    baseInfluencers.push({
      id,
      userId: `user_${String(i + 4).padStart(3, '0')}`,
      username,
      fullName: name,
      bio: `${category} creator | ${location.split(',')[0]} | Passionate about ${category.toLowerCase()} | DM for collabs`,
      avatar: `https://i.pravatar.cc/300?img=${i + 10}`,
      coverImage: `https://images.unsplash.com/photo-${1500000000000 + i * 1000000}`,
      location,
      categories: [category, 'Lifestyle'],
      contentTypes: ['Photos', 'Reels/Shorts', 'Stories'],
      verified: followers > 500000,
      platforms: [
        {
          platform: 'Instagram',
          handle: username,
          followers,
          verified: followers > 500000,
          engagement_rate: parseFloat(engagementRate),
          avg_likes: Math.floor(followers * parseFloat(engagementRate) / 100),
          avg_comments: Math.floor(followers * parseFloat(engagementRate) / 100 * 0.05),
          avg_views: Math.floor(followers * 0.4),
        },
      ],
      audience: {
        age_ranges: {
          '13-17': Math.floor(Math.random() * 15),
          '18-24': Math.floor(Math.random() * 30) + 20,
          '25-34': Math.floor(Math.random() * 30) + 20,
          '35-44': Math.floor(Math.random() * 20),
          '45-54': Math.floor(Math.random() * 10),
          '55+': Math.floor(Math.random() * 5),
        },
        gender: {
          male: Math.floor(Math.random() * 50) + 20,
          female: Math.floor(Math.random() * 50) + 20,
          other: Math.floor(Math.random() * 5),
        },
        top_countries: [
          { country: 'United States', percentage: Math.floor(Math.random() * 30) + 40 },
          { country: 'United Kingdom', percentage: Math.floor(Math.random() * 15) + 10 },
          { country: 'Canada', percentage: Math.floor(Math.random() * 10) + 5 },
        ],
        top_cities: [
          { city: location.split(',')[0], percentage: Math.floor(Math.random() * 15) + 10 },
        ],
      },
      metrics: {
        total_reach: followers * 2,
        avg_engagement_rate: parseFloat(engagementRate),
        authenticity_score: Math.floor(Math.random() * 20) + 80,
        brand_safety_score: Math.floor(Math.random() * 15) + 85,
        response_rate: Math.floor(Math.random() * 20) + 75,
        avg_response_time: `${Math.floor(Math.random() * 12) + 1} hours`,
      },
      pricing: {
        instagram_post: Math.floor(followers / 100) * (Math.random() * 2 + 1),
        instagram_story: Math.floor(followers / 300) * (Math.random() * 2 + 1),
        instagram_reel: Math.floor(followers / 80) * (Math.random() * 2 + 1),
        tiktok_video: Math.floor(followers / 90) * (Math.random() * 2 + 1),
        youtube_video: 0,
        youtube_short: 0,
      },
      past_brands: [],
      total_campaigns: Math.floor(Math.random() * 40) + 10,
      campaign_success_rate: Math.floor(Math.random() * 15) + 85,
      availability: ['available', 'busy', 'available', 'available'][Math.floor(Math.random() * 4)] as any,
      next_available_date: '2026-02-15',
      growth_trend: [],
      recent_posts: [],
      created_at: '2024-01-01',
      updated_at: '2026-01-30',
      rating: parseFloat((Math.random() * 1 + 4).toFixed(1)),
      total_reviews: Math.floor(Math.random() * 50) + 10,
    });
  }

  return baseInfluencers;
};

export const getAllInfluencers = (): InfluencerProfile[] => {
  return generateMockInfluencers();
};

export const getInfluencerById = (id: string): InfluencerProfile | undefined => {
  return getAllInfluencers().find((inf) => inf.id === id);
};

export const getInfluencerByUserId = (userId: string): InfluencerProfile | undefined => {
  return getAllInfluencers().find((inf) => inf.userId === userId);
};
