import 'dotenv/config';
import {
  PrismaClient,
  UserRole,
  SubscriptionTier,
  CompanySize,
  Platform,
  CampaignStatus,
  CampaignVisibility,
  CompensationType,
  CollaborationStatus,
  FeedPostType,
  FeedPostVisibility,
  MarketplaceListingStatus,
  CRMContactStatus,
  WalletType,
  TransactionType,
  AvailabilityStatus,
  MessageStatus,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter });

const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);
const daysFromNow = (n: number) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Clean up existing seed data (in correct order for FK constraints)
  console.log('🧹 Cleaning up existing data...');
  await prisma.feedLike.deleteMany({});
  await prisma.feedComment.deleteMany({});
  await prisma.feedPoll.deleteMany({});
  await prisma.feedPost.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.conversationParticipant.deleteMany({});
  await prisma.conversation.deleteMany({});
  await prisma.cRMActivity.deleteMany({});
  await prisma.cRMContact.deleteMany({});
  await prisma.marketplaceApplication.deleteMany({});
  await prisma.marketplaceListing.deleteMany({});
  await prisma.escrowAccount.deleteMany({});
  await prisma.influencerReview.deleteMany({});
  await prisma.brandReview.deleteMany({});
  await prisma.collaboration.deleteMany({});
  await prisma.campaignDeliverable.deleteMany({});
  await prisma.campaignGoal.deleteMany({});
  await prisma.campaignPlatform.deleteMany({});
  await prisma.campaign.deleteMany({});
  await prisma.walletTransaction.deleteMany({});
  await prisma.wallet.deleteMany({});
  await prisma.influencerPlatform.deleteMany({});
  await prisma.influencer.deleteMany({});
  await prisma.brand.deleteMany({});
  // Don't delete admin or subscription plans - upserts handle those

  const passwordHash = await bcrypt.hash('Demo@2026!', 12);
  const adminPasswordHash = await bcrypt.hash('Admin@2026!Secure', 12);

  // ========================================
  // 1. Admin User
  // ========================================
  const admin = await prisma.user.upsert({
    where: { email: 'admin@viralfluencer.com' },
    update: {},
    create: {
      email: 'admin@viralfluencer.com',
      passwordHash: adminPasswordHash,
      name: 'Platform Admin',
      role: UserRole.ADMIN,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      onboardingCompleted: true,
      isActive: true,
    },
  });
  console.log(`✅ Admin user: ${admin.email} (id: ${admin.id})`);

  // ========================================
  // 2. Subscription Plans
  // ========================================
  const plans = [
    {
      name: 'Free',
      tier: SubscriptionTier.FREE,
      description: 'Get started with basic features',
      monthlyPrice: 0, yearlyPrice: 0,
      maxCampaigns: 2, maxInfluencers: 5, maxTeamMembers: 1, maxListings: 1, maxAIQueries: 10, storageLimit: 100,
      features: ['Basic influencer discovery', 'Up to 2 active campaigns', 'Basic analytics', 'Email support'],
    },
    {
      name: 'Starter',
      tier: SubscriptionTier.STARTER,
      description: 'Perfect for growing brands',
      monthlyPrice: 49, yearlyPrice: 470,
      maxCampaigns: 10, maxInfluencers: 25, maxTeamMembers: 3, maxListings: 5, maxAIQueries: 100, storageLimit: 1024,
      features: ['Advanced influencer discovery', 'Up to 10 active campaigns', 'AI-powered matching', 'Campaign analytics', 'CRM features', 'Priority email support'],
    },
    {
      name: 'Professional',
      tier: SubscriptionTier.PROFESSIONAL,
      description: 'For established brands scaling their influencer marketing',
      monthlyPrice: 149, yearlyPrice: 1430,
      maxCampaigns: 50, maxInfluencers: 100, maxTeamMembers: 10, maxListings: 25, maxAIQueries: 500, storageLimit: 10240,
      features: ['Unlimited influencer discovery', 'Up to 50 active campaigns', 'Advanced AI matching & fraud detection', 'Deep analytics & reporting', 'Full CRM suite', 'Team collaboration', 'Content approval workflows', 'Social listening', 'API access', 'Priority chat & email support'],
    },
    {
      name: 'Enterprise',
      tier: SubscriptionTier.ENTERPRISE,
      description: 'Custom solutions for large organizations',
      monthlyPrice: 499, yearlyPrice: 4790,
      maxCampaigns: null, maxInfluencers: null, maxTeamMembers: null, maxListings: null, maxAIQueries: null, storageLimit: null,
      features: ['Unlimited everything', 'White-label option', 'Custom integrations', 'Dedicated account manager', 'SLA guarantee', 'Custom AI models', 'Advanced security & compliance', 'Audit logs', 'SSO (SAML/OIDC)', '24/7 phone & chat support'],
    },
  ];

  for (const plan of plans) {
    const created = await prisma.subscriptionPlan.upsert({
      where: { tier: plan.tier },
      update: { name: plan.name, description: plan.description, monthlyPrice: plan.monthlyPrice, yearlyPrice: plan.yearlyPrice, maxCampaigns: plan.maxCampaigns, maxInfluencers: plan.maxInfluencers, maxTeamMembers: plan.maxTeamMembers, maxListings: plan.maxListings, maxAIQueries: plan.maxAIQueries, storageLimit: plan.storageLimit, features: plan.features },
      create: plan,
    });
    console.log(`✅ Subscription plan: ${created.name} (${created.tier}) - $${plan.monthlyPrice}/mo`);
  }

  // ========================================
  // 3. Platform Commission Tiers
  // ========================================
  await prisma.platformCommission.deleteMany({});
  for (const commission of [
    { name: 'Standard Commission', percentage: 10.00, tierMin: null, tierMax: 1000.00, minAmount: null, maxAmount: null },
    { name: 'Mid-Tier Commission', percentage: 8.00, tierMin: 1000.01, tierMax: 10000.00, minAmount: null, maxAmount: null },
    { name: 'High-Value Commission', percentage: 5.00, tierMin: 10000.01, tierMax: null, minAmount: null, maxAmount: null },
  ]) {
    await prisma.platformCommission.create({ data: commission });
    console.log(`✅ Commission tier: ${commission.name} (${commission.percentage}%)`);
  }

  // ========================================
  // 4. Brand Users
  // ========================================
  const brandUser1 = await prisma.user.upsert({
    where: { email: 'brand@demo.com' },
    update: {},
    create: {
      email: 'brand@demo.com',
      passwordHash: passwordHash,
      name: 'Luxe Fashion Co.',
      role: UserRole.BRAND,
      emailVerified: true,
      emailVerifiedAt: daysAgo(30),
      onboardingCompleted: true,
      isActive: true,
    },
  });

  const brand1 = await prisma.brand.upsert({
    where: { userId: brandUser1.id },
    update: {},
    create: {
      userId: brandUser1.id,
      companyName: 'Luxe Fashion Co.',
      industry: 'Fashion & Apparel',
      website: 'https://luxefashion.example.com',
      description: 'Premium fashion brand bringing sustainable luxury to modern consumers. Known for our iconic summer and winter collections.',
      location: 'New York, NY',
      companySize: CompanySize.MEDIUM_51_200,
      foundedYear: 2018,
      verified: true,
      verifiedAt: daysAgo(20),
    },
  });
  console.log(`✅ Brand 1: ${brand1.companyName} (userId: ${brandUser1.id}, brandId: ${brand1.id})`);

  const brandUser2 = await prisma.user.upsert({
    where: { email: 'brand2@demo.com' },
    update: {},
    create: {
      email: 'brand2@demo.com',
      passwordHash: passwordHash,
      name: 'TechVibe Inc.',
      role: UserRole.BRAND,
      emailVerified: true,
      emailVerifiedAt: daysAgo(25),
      onboardingCompleted: true,
      isActive: true,
    },
  });

  const brand2 = await prisma.brand.upsert({
    where: { userId: brandUser2.id },
    update: {},
    create: {
      userId: brandUser2.id,
      companyName: 'TechVibe Inc.',
      industry: 'Technology',
      website: 'https://techvibe.example.com',
      description: 'Innovative tech company creating smart home and wearable devices. Building the future of connected living.',
      location: 'San Francisco, CA',
      companySize: CompanySize.SMALL_11_50,
      foundedYear: 2020,
      verified: true,
      verifiedAt: daysAgo(15),
    },
  });
  console.log(`✅ Brand 2: ${brand2.companyName} (userId: ${brandUser2.id}, brandId: ${brand2.id})`);

  // ========================================
  // 5. Influencer Users
  // ========================================
  const influencerUser1 = await prisma.user.upsert({
    where: { email: 'influencer1@demo.com' },
    update: {},
    create: {
      email: 'influencer1@demo.com',
      passwordHash: passwordHash,
      name: 'Sarah Chen',
      role: UserRole.INFLUENCER,
      emailVerified: true,
      emailVerifiedAt: daysAgo(28),
      onboardingCompleted: true,
      isActive: true,
    },
  });

  const influencer1 = await prisma.influencer.upsert({
    where: { userId: influencerUser1.id },
    update: {},
    create: {
      userId: influencerUser1.id,
      username: 'sarahcreates',
      fullName: 'Sarah Chen',
      bio: 'Fashion & lifestyle creator sharing authentic style tips. 500K+ community of fashion lovers.',
      location: 'Los Angeles, CA',
      languages: ['English', 'Mandarin'],
      categories: ['Fashion', 'Lifestyle', 'Beauty'],
      contentTypes: ['Photos', 'Reels', 'Stories'],
      verified: true,
      verifiedAt: daysAgo(20),
      availability: AvailabilityStatus.AVAILABLE,
      rating: 4.8,
      totalReviews: 24,
      totalCampaigns: 18,
      campaignSuccessRate: 94.5,
    },
  });

  await prisma.influencerPlatform.createMany({
    data: [
      { influencerId: influencer1.id, platform: Platform.INSTAGRAM, handle: '@sarahcreates', followers: 245000, engagementRate: 4.8, avgLikes: 11000, avgComments: 450 },
      { influencerId: influencer1.id, platform: Platform.TIKTOK, handle: '@sarahcreates', followers: 180000, engagementRate: 6.2, avgLikes: 15000, avgComments: 800, avgViews: 120000 },
      { influencerId: influencer1.id, platform: Platform.YOUTUBE, handle: 'Sarah Creates', followers: 95000, engagementRate: 3.5, avgLikes: 3200, avgComments: 280, avgViews: 45000 },
    ],
    skipDuplicates: true,
  });
  console.log(`✅ Influencer 1: ${influencer1.fullName} (@${influencer1.username})`);

  const influencerUser2 = await prisma.user.upsert({
    where: { email: 'influencer2@demo.com' },
    update: {},
    create: {
      email: 'influencer2@demo.com',
      passwordHash: passwordHash,
      name: 'Alex Rivera',
      role: UserRole.INFLUENCER,
      emailVerified: true,
      emailVerifiedAt: daysAgo(22),
      onboardingCompleted: true,
      isActive: true,
    },
  });

  const influencer2 = await prisma.influencer.upsert({
    where: { userId: influencerUser2.id },
    update: {},
    create: {
      userId: influencerUser2.id,
      username: 'alexfitness',
      fullName: 'Alex Rivera',
      bio: 'Fitness enthusiast & tech reviewer. Helping you live a healthier, smarter life.',
      location: 'Miami, FL',
      languages: ['English', 'Spanish'],
      categories: ['Fitness', 'Tech', 'Health'],
      contentTypes: ['Videos', 'Reels', 'Reviews'],
      verified: false,
      availability: AvailabilityStatus.AVAILABLE,
      rating: 4.5,
      totalReviews: 12,
      totalCampaigns: 8,
      campaignSuccessRate: 87.5,
    },
  });

  await prisma.influencerPlatform.createMany({
    data: [
      { influencerId: influencer2.id, platform: Platform.INSTAGRAM, handle: '@alexfitness', followers: 120000, engagementRate: 5.1, avgLikes: 6000, avgComments: 350 },
      { influencerId: influencer2.id, platform: Platform.YOUTUBE, handle: 'Alex Rivera Fitness', followers: 85000, engagementRate: 4.0, avgLikes: 2800, avgComments: 200, avgViews: 35000 },
    ],
    skipDuplicates: true,
  });
  console.log(`✅ Influencer 2: ${influencer2.fullName} (@${influencer2.username})`);

  const influencerUser3 = await prisma.user.upsert({
    where: { email: 'influencer3@demo.com' },
    update: {},
    create: {
      email: 'influencer3@demo.com',
      passwordHash: passwordHash,
      name: 'Mia Johnson',
      role: UserRole.INFLUENCER,
      emailVerified: true,
      emailVerifiedAt: daysAgo(18),
      onboardingCompleted: true,
      isActive: true,
    },
  });

  const influencer3 = await prisma.influencer.upsert({
    where: { userId: influencerUser3.id },
    update: {},
    create: {
      userId: influencerUser3.id,
      username: 'miabeauty',
      fullName: 'Mia Johnson',
      bio: 'Beauty and skincare obsessed. Honest product reviews & tutorials. Collab inquiries welcome!',
      location: 'Chicago, IL',
      languages: ['English'],
      categories: ['Beauty', 'Skincare', 'Wellness'],
      contentTypes: ['Tutorials', 'Reviews', 'Stories'],
      verified: true,
      verifiedAt: daysAgo(10),
      availability: AvailabilityStatus.BUSY,
      rating: 4.9,
      totalReviews: 31,
      totalCampaigns: 22,
      campaignSuccessRate: 96.0,
    },
  });

  await prisma.influencerPlatform.createMany({
    data: [
      { influencerId: influencer3.id, platform: Platform.INSTAGRAM, handle: '@miabeauty', followers: 310000, engagementRate: 5.5, avgLikes: 16000, avgComments: 600 },
      { influencerId: influencer3.id, platform: Platform.TIKTOK, handle: '@miabeauty', followers: 450000, engagementRate: 7.8, avgLikes: 35000, avgComments: 1200, avgViews: 250000 },
    ],
    skipDuplicates: true,
  });
  console.log(`✅ Influencer 3: ${influencer3.fullName} (@${influencer3.username})`);

  // ========================================
  // 6. Wallets
  // ========================================
  const wallet1 = await prisma.wallet.upsert({
    where: { userId: brandUser1.id },
    update: {},
    create: { userId: brandUser1.id, type: WalletType.BRAND_WALLET, balance: 15000, pendingBalance: 5000 },
  });

  await prisma.wallet.upsert({
    where: { userId: brandUser2.id },
    update: {},
    create: { userId: brandUser2.id, type: WalletType.BRAND_WALLET, balance: 8000, pendingBalance: 3000 },
  });

  const infWallet1 = await prisma.wallet.upsert({
    where: { userId: influencerUser1.id },
    update: {},
    create: { userId: influencerUser1.id, type: WalletType.INFLUENCER_WALLET, balance: 4500, pendingBalance: 2500 },
  });

  await prisma.wallet.upsert({
    where: { userId: influencerUser2.id },
    update: {},
    create: { userId: influencerUser2.id, type: WalletType.INFLUENCER_WALLET, balance: 1800, pendingBalance: 0 },
  });

  await prisma.wallet.upsert({
    where: { userId: influencerUser3.id },
    update: {},
    create: { userId: influencerUser3.id, type: WalletType.INFLUENCER_WALLET, balance: 6200, pendingBalance: 3200 },
  });
  console.log('✅ Wallets created for all users');

  // ========================================
  // 7. Wallet Transactions (for brand1)
  // ========================================
  await prisma.walletTransaction.createMany({
    data: [
      { walletId: wallet1.id, type: TransactionType.DEPOSIT, amount: 10000, balance: 10000, description: 'Wallet top-up via Stripe', createdAt: daysAgo(14) },
      { walletId: wallet1.id, type: TransactionType.DEPOSIT, amount: 5000, balance: 15000, description: 'Wallet top-up via PayPal', createdAt: daysAgo(10) },
      { walletId: wallet1.id, type: TransactionType.ESCROW_HOLD, amount: -5000, balance: 10000, description: 'Escrow funded: Summer Fashion Campaign', createdAt: daysAgo(8) },
      { walletId: wallet1.id, type: TransactionType.ESCROW_RELEASE, amount: -2500, balance: 7500, description: 'Milestone released: Content Delivery', createdAt: daysAgo(5) },
      { walletId: wallet1.id, type: TransactionType.PLATFORM_FEE, amount: -125, balance: 7375, description: 'Platform fee (5%)', createdAt: daysAgo(5) },
      { walletId: wallet1.id, type: TransactionType.DEPOSIT, amount: 10000, balance: 17375, description: 'Wallet top-up via Stripe', createdAt: daysAgo(3) },
      { walletId: wallet1.id, type: TransactionType.ESCROW_HOLD, amount: -3000, balance: 14375, description: 'Escrow funded: Tech Review Campaign', createdAt: daysAgo(2) },
    ],
  });

  // Transactions for influencer1
  await prisma.walletTransaction.createMany({
    data: [
      { walletId: infWallet1.id, type: TransactionType.PAYOUT, amount: 2500, balance: 2500, description: 'Payment: Summer Fashion Campaign - Content Delivery', createdAt: daysAgo(5) },
      { walletId: infWallet1.id, type: TransactionType.PAYOUT, amount: 2000, balance: 4500, description: 'Payment: Tech Review Campaign - Video Review', createdAt: daysAgo(2) },
    ],
  });
  console.log('✅ Wallet transactions created');

  // ========================================
  // 8. Campaigns
  // ========================================
  const campaign1 = await prisma.campaign.create({
    data: {
      brandId: brand1.id,
      title: 'Summer Fashion Collection Launch',
      description: 'Showcase our stunning new summer collection with authentic, lifestyle-focused content that resonates with fashion-forward millennials.',
      longDescription: 'We are looking for influencers who embody our brand values of sustainability and modern luxury. The ideal creator will produce high-quality visual content featuring our summer pieces in real-life settings.',
      category: 'Fashion',
      status: CampaignStatus.ACTIVE,
      visibility: CampaignVisibility.PUBLIC,
      compensationType: CompensationType.FIXED,
      budgetMin: 2000,
      budgetMax: 5000,
      startDate: daysAgo(7),
      endDate: daysFromNow(30),
      applicationDeadline: daysFromNow(14),
      maxInfluencers: 5,
      publishedAt: daysAgo(7),
    },
  });

  await prisma.campaignPlatform.createMany({
    data: [
      { campaignId: campaign1.id, platform: Platform.INSTAGRAM },
      { campaignId: campaign1.id, platform: Platform.TIKTOK },
    ],
  });
  await prisma.campaignGoal.createMany({
    data: [
      { campaignId: campaign1.id, goal: 'Brand Awareness' },
      { campaignId: campaign1.id, goal: 'Sales' },
    ],
  });
  await prisma.campaignDeliverable.createMany({
    data: [
      { campaignId: campaign1.id, type: 'Instagram Post', quantity: 3, description: 'High-quality photos featuring summer collection', compensation: 1500 },
      { campaignId: campaign1.id, type: 'Instagram Reel', quantity: 2, description: 'Short-form video showcasing styling tips', compensation: 1000 },
      { campaignId: campaign1.id, type: 'TikTok Video', quantity: 1, description: 'Trending format video with our pieces', compensation: 800 },
    ],
  });
  console.log(`✅ Campaign 1: ${campaign1.title} (${campaign1.status})`);

  const campaign2 = await prisma.campaign.create({
    data: {
      brandId: brand2.id,
      title: 'Smart Home Device Review',
      description: 'Looking for authentic tech reviewers to create in-depth reviews of our new smart home hub. Honest opinions valued.',
      category: 'Technology',
      status: CampaignStatus.ACTIVE,
      visibility: CampaignVisibility.PUBLIC,
      compensationType: CompensationType.FIXED,
      budgetMin: 3000,
      budgetMax: 8000,
      startDate: daysAgo(3),
      endDate: daysFromNow(45),
      applicationDeadline: daysFromNow(21),
      maxInfluencers: 10,
      publishedAt: daysAgo(3),
    },
  });

  await prisma.campaignPlatform.createMany({
    data: [
      { campaignId: campaign2.id, platform: Platform.YOUTUBE },
      { campaignId: campaign2.id, platform: Platform.INSTAGRAM },
    ],
  });
  await prisma.campaignGoal.createMany({
    data: [
      { campaignId: campaign2.id, goal: 'Product Reviews' },
      { campaignId: campaign2.id, goal: 'Brand Awareness' },
    ],
  });
  await prisma.campaignDeliverable.createMany({
    data: [
      { campaignId: campaign2.id, type: 'YouTube Review', quantity: 1, description: 'Detailed 10+ minute review video', compensation: 5000 },
      { campaignId: campaign2.id, type: 'Instagram Post', quantity: 2, description: 'Product showcase photos', compensation: 1500 },
    ],
  });
  console.log(`✅ Campaign 2: ${campaign2.title} (${campaign2.status})`);

  const campaign3 = await prisma.campaign.create({
    data: {
      brandId: brand1.id,
      title: 'Winter Wellness Collection',
      description: 'Promote our cozy winter wellness line including loungewear and self-care products.',
      category: 'Lifestyle',
      status: CampaignStatus.COMPLETED,
      visibility: CampaignVisibility.PUBLIC,
      compensationType: CompensationType.HYBRID,
      budgetMin: 1500,
      budgetMax: 4000,
      startDate: daysAgo(60),
      endDate: daysAgo(10),
      maxInfluencers: 8,
      publishedAt: daysAgo(60),
      completedAt: daysAgo(10),
    },
  });

  await prisma.campaignPlatform.createMany({
    data: [
      { campaignId: campaign3.id, platform: Platform.INSTAGRAM },
    ],
  });
  console.log(`✅ Campaign 3: ${campaign3.title} (${campaign3.status})`);

  const campaign4 = await prisma.campaign.create({
    data: {
      brandId: brand1.id,
      title: 'Spring Beauty Gala Preview',
      description: 'Exclusive preview of our upcoming spring beauty collaboration line. Looking for beauty and skincare creators.',
      category: 'Beauty',
      status: CampaignStatus.DRAFT,
      visibility: CampaignVisibility.PRIVATE,
      compensationType: CompensationType.FIXED,
      budgetMin: 5000,
      budgetMax: 12000,
      startDate: daysFromNow(30),
      endDate: daysFromNow(90),
      maxInfluencers: 3,
    },
  });
  console.log(`✅ Campaign 4: ${campaign4.title} (${campaign4.status})`);

  // ========================================
  // 9. Collaborations
  // ========================================
  const collab1 = await prisma.collaboration.create({
    data: {
      campaignId: campaign1.id,
      influencerId: influencer1.id,
      brandId: brand1.id,
      status: CollaborationStatus.IN_PRODUCTION,
      agreedAmount: 3500,
      platformFee: 350,
      influencerPayout: 3150,
      startDate: daysAgo(5),
      endDate: daysFromNow(25),
      contentDueDate: daysFromNow(15),
    },
  });

  const collab2 = await prisma.collaboration.create({
    data: {
      campaignId: campaign3.id,
      influencerId: influencer3.id,
      brandId: brand1.id,
      status: CollaborationStatus.COMPLETED,
      agreedAmount: 2800,
      platformFee: 280,
      influencerPayout: 2520,
      startDate: daysAgo(55),
      endDate: daysAgo(15),
      completedAt: daysAgo(12),
    },
  });

  await prisma.collaboration.create({
    data: {
      campaignId: campaign2.id,
      influencerId: influencer2.id,
      brandId: brand2.id,
      status: CollaborationStatus.PROPOSAL_SENT,
      agreedAmount: 5000,
      platformFee: 500,
      influencerPayout: 4500,
      startDate: daysFromNow(7),
      endDate: daysFromNow(45),
    },
  });
  console.log('✅ 3 Collaborations created');

  // ========================================
  // 10. Feed Posts
  // ========================================
  const post1 = await prisma.feedPost.create({
    data: {
      authorId: influencerUser1.id,
      type: FeedPostType.TEXT,
      visibility: FeedPostVisibility.PUBLIC,
      content: 'Just wrapped up an amazing campaign with Luxe Fashion! The new summer collection is absolutely stunning. Here are some behind-the-scenes shots from the photoshoot. What do you think? #fashion #summer #collab',
      hashtags: ['fashion', 'summer', 'collab'],
      mentions: [],
      mediaUrls: [],
      thumbnails: [],
      likesCount: 2453,
      commentsCount: 189,
      sharesCount: 67,
      createdAt: daysAgo(1),
    },
  });

  await prisma.feedPost.create({
    data: {
      authorId: brandUser2.id,
      type: FeedPostType.TEXT,
      visibility: FeedPostVisibility.PUBLIC,
      content: "We're looking for tech creators to join our upcoming product launch campaign! If you have 10K+ followers and love reviewing gadgets, drop a comment below or DM us. Exciting compensation packages available!",
      hashtags: ['opportunity', 'tech', 'creators'],
      mentions: [],
      mediaUrls: [],
      thumbnails: [],
      likesCount: 891,
      commentsCount: 342,
      sharesCount: 156,
      createdAt: daysAgo(1),
    },
  });

  const pollPost = await prisma.feedPost.create({
    data: {
      authorId: influencerUser2.id,
      type: FeedPostType.POLL,
      visibility: FeedPostVisibility.PUBLIC,
      content: 'Quick poll for my fitness fam! Which type of content do you want to see more of?',
      hashtags: ['fitness', 'poll'],
      mentions: [],
      mediaUrls: [],
      thumbnails: [],
      likesCount: 567,
      commentsCount: 89,
      sharesCount: 23,
      createdAt: daysAgo(2),
    },
  });

  await prisma.feedPoll.create({
    data: {
      postId: pollPost.id,
      question: 'What content do you want more of?',
      options: [
        { id: 'o1', text: 'Workout routines', votes: 456 },
        { id: 'o2', text: 'Nutrition tips', votes: 312 },
        { id: 'o3', text: 'Brand reviews', votes: 189 },
        { id: 'o4', text: 'Behind the scenes', votes: 267 },
      ],
      endsAt: daysFromNow(2),
    },
  });

  await prisma.feedPost.create({
    data: {
      authorId: brandUser1.id,
      type: FeedPostType.TEXT,
      visibility: FeedPostVisibility.PUBLIC,
      content: "Big announcement! Our creator partnership program just hit 500 members. To celebrate, we're increasing commission rates by 5% for all existing partners this month. Thank you for being part of our journey!",
      hashtags: ['announcement', 'partnership'],
      mentions: [],
      mediaUrls: [],
      thumbnails: [],
      likesCount: 1876,
      commentsCount: 267,
      sharesCount: 445,
      createdAt: daysAgo(3),
    },
  });

  await prisma.feedPost.create({
    data: {
      authorId: influencerUser3.id,
      type: FeedPostType.TEXT,
      visibility: FeedPostVisibility.PUBLIC,
      content: "My honest review of the top 5 skincare products I've tried this month. Spoiler: the new retinol serum from GreenLeaf is a game-changer. Full breakdown in my latest YouTube video! Link in bio.",
      hashtags: ['skincare', 'review', 'beauty'],
      mentions: [],
      mediaUrls: [],
      thumbnails: [],
      likesCount: 3211,
      commentsCount: 412,
      sharesCount: 198,
      createdAt: daysAgo(4),
    },
  });

  await prisma.feedPost.create({
    data: {
      authorId: influencerUser1.id,
      type: FeedPostType.MILESTONE_ACHIEVEMENT,
      visibility: FeedPostVisibility.PUBLIC,
      content: 'Just hit 500K total followers across all platforms! Thank you all for the incredible support. This journey has been amazing and I could not have done it without you.',
      hashtags: ['milestone', 'grateful', '500k'],
      mentions: [],
      mediaUrls: [],
      thumbnails: [],
      likesCount: 5620,
      commentsCount: 834,
      sharesCount: 312,
      createdAt: daysAgo(5),
    },
  });

  // Add some comments on post1
  await prisma.feedComment.createMany({
    data: [
      { postId: post1.id, authorId: influencerUser2.id, content: 'Love the shots! That summer dress is gorgeous 😍', likesCount: 45, createdAt: daysAgo(1) },
      { postId: post1.id, authorId: brandUser2.id, content: 'Great work Sarah! Always delivering quality content.', likesCount: 23, createdAt: daysAgo(1) },
      { postId: post1.id, authorId: influencerUser3.id, content: 'The lighting is perfect! Which camera setup did you use?', likesCount: 18, createdAt: daysAgo(1) },
    ],
  });

  // Add some likes
  await prisma.feedLike.createMany({
    data: [
      { postId: post1.id, userId: influencerUser2.id },
      { postId: post1.id, userId: influencerUser3.id },
      { postId: post1.id, userId: brandUser2.id },
    ],
    skipDuplicates: true,
  });
  console.log('✅ 6 Feed posts with comments and likes created');

  // ========================================
  // 11. Marketplace Listings
  // ========================================
  const listing1 = await prisma.marketplaceListing.create({
    data: {
      campaignId: campaign1.id,
      brandId: brand1.id,
      status: MarketplaceListingStatus.ACTIVE,
      title: 'Summer Fashion Collection Launch',
      description: 'Looking for fashion and lifestyle influencers to showcase our new summer collection. Must have strong Instagram and TikTok presence with engaged audience in the 18-35 age range.',
      requirements: 'Min 50K followers, 3.5%+ engagement rate, fashion/lifestyle niche',
      budgetMin: 2000,
      budgetMax: 5000,
      compensationType: CompensationType.FIXED,
      targetNiches: ['Fashion', 'Lifestyle'],
      targetPlatforms: ['Instagram', 'TikTok'],
      minFollowers: 50000,
      targetLocations: ['United States', 'Canada'],
      targetAgeRange: '18-35',
      totalSlots: 5,
      filledSlots: 1,
      applicantCount: 23,
      applicationDeadline: daysFromNow(14),
      campaignStartDate: daysAgo(7),
      campaignEndDate: daysFromNow(30),
      isFeatured: true,
    },
  });

  const listing2 = await prisma.marketplaceListing.create({
    data: {
      campaignId: campaign2.id,
      brandId: brand2.id,
      status: MarketplaceListingStatus.ACTIVE,
      title: 'Tech Product Review Campaign',
      description: 'Seeking tech reviewers and gadget enthusiasts for our latest smart home device launch. Honest, detailed reviews preferred.',
      requirements: 'Min 100K followers, tech/gadgets niche, YouTube presence required',
      budgetMin: 3000,
      budgetMax: 8000,
      compensationType: CompensationType.FIXED,
      targetNiches: ['Tech', 'Gadgets', 'Smart Home'],
      targetPlatforms: ['YouTube', 'Instagram'],
      minFollowers: 100000,
      totalSlots: 10,
      filledSlots: 0,
      applicantCount: 45,
      applicationDeadline: daysFromNow(21),
      campaignStartDate: daysAgo(3),
      campaignEndDate: daysFromNow(45),
      isFeatured: true,
    },
  });

  await prisma.marketplaceListing.create({
    data: {
      campaignId: campaign1.id,
      brandId: brand1.id,
      status: MarketplaceListingStatus.ACTIVE,
      title: 'Organic Skincare Brand Ambassador',
      description: 'Long-term partnership opportunity for beauty and wellness influencers who are passionate about organic, sustainable skincare products.',
      requirements: 'Min 25K followers, beauty/wellness niche, authentic content style',
      budgetMin: 1500,
      budgetMax: 3000,
      compensationType: CompensationType.HYBRID,
      targetNiches: ['Beauty', 'Wellness', 'Skincare'],
      targetPlatforms: ['Instagram', 'TikTok', 'YouTube'],
      minFollowers: 25000,
      totalSlots: 3,
      filledSlots: 0,
      applicantCount: 67,
      applicationDeadline: daysFromNow(7),
      isFeatured: false,
    },
  });

  await prisma.marketplaceListing.create({
    data: {
      campaignId: campaign2.id,
      brandId: brand2.id,
      status: MarketplaceListingStatus.ACTIVE,
      title: 'Fitness App Launch Campaign',
      description: 'We are launching a new AI-powered fitness tracking app and need fitness influencers to demonstrate key features and share their experience.',
      requirements: 'Fitness niche, 10K+ followers, video content creation skills',
      budgetMin: 1000,
      budgetMax: 2500,
      compensationType: CompensationType.PERFORMANCE,
      targetNiches: ['Fitness', 'Health', 'Wellness'],
      targetPlatforms: ['Instagram', 'TikTok'],
      minFollowers: 10000,
      totalSlots: 15,
      filledSlots: 3,
      applicantCount: 89,
      applicationDeadline: daysFromNow(10),
      isFeatured: false,
    },
  });

  // Add marketplace applications
  await prisma.marketplaceApplication.createMany({
    data: [
      { listingId: listing1.id, influencerId: influencer1.id, coverLetter: 'I love your brand and would love to collaborate on this campaign!', proposedRate: 3500, availability: 'Available immediately' },
      { listingId: listing2.id, influencerId: influencer2.id, coverLetter: 'As a tech reviewer with 200K+ followers, I can provide detailed and honest reviews.', proposedRate: 5000, availability: 'Available next week' },
    ],
    skipDuplicates: true,
  });
  console.log('✅ 4 Marketplace listings with applications created');

  // ========================================
  // 12. CRM Contacts (for brand1)
  // ========================================
  const crmContact1 = await prisma.cRMContact.create({
    data: {
      brandId: brand1.id,
      influencerId: influencer1.id,
      status: CRMContactStatus.ACTIVE_PARTNER,
      customLabels: ['VIP', 'Long-term'],
      lastContactedAt: daysAgo(1),
      nextFollowUpAt: daysFromNow(7),
      totalCollaborations: 5,
      totalSpend: 15000,
      internalNotes: 'Excellent collaborator. Always delivers on time. Consider for all fashion campaigns.',
      source: 'Platform Discovery',
    },
  });

  await prisma.cRMActivity.createMany({
    data: [
      { contactId: crmContact1.id, type: 'campaign_completed', title: 'Completed: Summer Fashion Collection', details: 'Delivered all content on time with excellent quality', createdAt: daysAgo(1) },
      { contactId: crmContact1.id, type: 'message_sent', title: 'Sent campaign brief for Spring collection', createdAt: daysAgo(3) },
      { contactId: crmContact1.id, type: 'note_added', title: 'Added internal note about future collaborations', createdAt: daysAgo(5) },
    ],
  });

  const crmContact2 = await prisma.cRMContact.create({
    data: {
      brandId: brand1.id,
      influencerId: influencer2.id,
      status: CRMContactStatus.CONTACTED,
      customLabels: ['Fitness', 'Potential'],
      lastContactedAt: daysAgo(3),
      totalCollaborations: 0,
      totalSpend: 0,
      internalNotes: 'Good fit for our upcoming athleisure line. Reaching out for collaboration.',
      source: 'Referral',
    },
  });

  await prisma.cRMActivity.createMany({
    data: [
      { contactId: crmContact2.id, type: 'outreach_sent', title: 'Initial outreach email sent', createdAt: daysAgo(3) },
    ],
  });

  await prisma.cRMContact.create({
    data: {
      brandId: brand1.id,
      influencerId: influencer3.id,
      status: CRMContactStatus.PAST_PARTNER,
      customLabels: ['Beauty', 'High-performer'],
      lastContactedAt: daysAgo(12),
      totalCollaborations: 3,
      totalSpend: 8400,
      internalNotes: 'Completed 3 successful campaigns. Excellent content quality.',
      source: 'AI Matching',
    },
  });
  console.log('✅ 3 CRM contacts with activities created');

  // ========================================
  // 13. Conversations & Messages
  // ========================================
  const conv1 = await prisma.conversation.create({
    data: {
      campaignId: campaign1.id,
      campaignTitle: 'Summer Fashion Collection Launch',
      lastMessageAt: daysAgo(0),
    },
  });

  await prisma.conversationParticipant.createMany({
    data: [
      { conversationId: conv1.id, userId: brandUser1.id, unreadCount: 0 },
      { conversationId: conv1.id, userId: influencerUser1.id, unreadCount: 1 },
    ],
  });

  await prisma.message.createMany({
    data: [
      { conversationId: conv1.id, senderId: brandUser1.id, content: 'Hi Sarah! Thanks for applying to our Summer Fashion Launch campaign. We loved your portfolio!', status: MessageStatus.READ, readAt: daysAgo(2), createdAt: daysAgo(3) },
      { conversationId: conv1.id, senderId: influencerUser1.id, content: "Thank you! I'm really excited about this collection. When should we schedule a call to discuss the details?", status: MessageStatus.READ, readAt: daysAgo(2), createdAt: daysAgo(3) },
      { conversationId: conv1.id, senderId: brandUser1.id, content: "How about Thursday at 2pm EST? We can go over the deliverables and timeline.", status: MessageStatus.READ, readAt: daysAgo(1), createdAt: daysAgo(2) },
      { conversationId: conv1.id, senderId: influencerUser1.id, content: "Thursday at 2pm works perfectly! I'll send you a calendar invite. Looking forward to it!", status: MessageStatus.READ, readAt: daysAgo(1), createdAt: daysAgo(2) },
      { conversationId: conv1.id, senderId: brandUser1.id, content: "Great! Also, I'm sending over the product samples today. You should receive them by Monday.", status: MessageStatus.SENT, createdAt: daysAgo(0) },
    ],
  });

  const conv2 = await prisma.conversation.create({
    data: {
      campaignId: campaign2.id,
      campaignTitle: 'Smart Home Device Review',
      lastMessageAt: daysAgo(1),
    },
  });

  await prisma.conversationParticipant.createMany({
    data: [
      { conversationId: conv2.id, userId: brandUser2.id, unreadCount: 1 },
      { conversationId: conv2.id, userId: influencerUser2.id, unreadCount: 0 },
    ],
  });

  await prisma.message.createMany({
    data: [
      { conversationId: conv2.id, senderId: brandUser2.id, content: 'Hey Alex! We saw your tech review channel and think you would be perfect for our smart home device review.', status: MessageStatus.READ, readAt: daysAgo(2), createdAt: daysAgo(3) },
      { conversationId: conv2.id, senderId: influencerUser2.id, content: "I'd love to review it! Can you share more details about the device and what you're looking for?", status: MessageStatus.READ, readAt: daysAgo(1), createdAt: daysAgo(2) },
      { conversationId: conv2.id, senderId: influencerUser2.id, content: "Also, I can do a detailed 15-minute review video plus 2 Instagram posts. My typical rate for this scope is $5,000.", status: MessageStatus.SENT, createdAt: daysAgo(1) },
    ],
  });
  console.log('✅ 2 Conversations with messages created');

  // ========================================
  // 14. Reviews
  // ========================================
  await prisma.influencerReview.createMany({
    data: [
      {
        influencerId: influencer1.id,
        brandId: brand1.id,
        campaignId: campaign3.id,
        rating: 5,
        comment: 'Sarah was amazing to work with! Her content exceeded our expectations and drove incredible engagement.',
        communicationRating: 5,
        contentQualityRating: 5,
        professionalismRating: 5,
        valueForMoneyRating: 4,
        wasOnTime: true,
        createdAt: daysAgo(15),
      },
      {
        influencerId: influencer3.id,
        brandId: brand1.id,
        campaignId: campaign3.id,
        rating: 5,
        comment: 'Mia created stunning beauty content that perfectly captured our brand aesthetic. Highly recommend!',
        communicationRating: 5,
        contentQualityRating: 5,
        professionalismRating: 4,
        valueForMoneyRating: 5,
        wasOnTime: true,
        createdAt: daysAgo(12),
      },
    ],
  });

  await prisma.brandReview.createMany({
    data: [
      {
        brandId: brand1.id,
        influencerId: influencer1.id,
        campaignId: campaign3.id,
        rating: 5,
        comment: 'Luxe Fashion is a dream to work with! Clear briefs, on-time payments, and genuine appreciation for creative work.',
        communicationRating: 5,
        paymentSpeedRating: 5,
        professionalismRating: 5,
        briefClarityRating: 4,
        createdAt: daysAgo(14),
      },
      {
        brandId: brand1.id,
        influencerId: influencer3.id,
        campaignId: campaign3.id,
        rating: 4,
        comment: 'Great experience overall. The team was responsive and the campaign brief was well-structured.',
        communicationRating: 4,
        paymentSpeedRating: 5,
        professionalismRating: 4,
        briefClarityRating: 4,
        createdAt: daysAgo(11),
      },
    ],
  });
  console.log('✅ Reviews created');

  // ========================================
  // 15. Escrow Accounts
  // ========================================
  await prisma.escrowAccount.create({
    data: {
      collaborationId: collab1.id,
      brandId: brand1.id,
      influencerId: influencer1.id,
      totalAmount: 3500,
      heldAmount: 3500,
      releasedAmount: 0,
      platformFee: 350,
      currency: 'USD',
      status: 'FUNDED',
      fundedAt: daysAgo(5),
    },
  });

  await prisma.escrowAccount.create({
    data: {
      collaborationId: collab2.id,
      brandId: brand1.id,
      influencerId: influencer3.id,
      totalAmount: 2800,
      heldAmount: 0,
      releasedAmount: 2800,
      platformFee: 280,
      currency: 'USD',
      status: 'FULLY_RELEASED',
      fundedAt: daysAgo(50),
      releasedAt: daysAgo(12),
    },
  });
  console.log('✅ Escrow accounts created');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📋 Demo Credentials:');
  console.log('  Brand 1:      brand@demo.com / Demo@2026!');
  console.log('  Brand 2:      brand2@demo.com / Demo@2026!');
  console.log('  Influencer 1: influencer1@demo.com / Demo@2026!');
  console.log('  Influencer 2: influencer2@demo.com / Demo@2026!');
  console.log('  Influencer 3: influencer3@demo.com / Demo@2026!');
  console.log('  Admin:        admin@viralfluencer.com / Admin@2026!Secure');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
