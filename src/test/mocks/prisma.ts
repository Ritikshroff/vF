import { vi } from 'vitest';

// Create a mock Prisma client with all commonly used models
function createMockModel() {
  return {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    upsert: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
    count: vi.fn(),
    aggregate: vi.fn(),
    groupBy: vi.fn(),
  };
}

export const prismaMock = {
  // Auth & Users
  user: createMockModel(),
  brand: createMockModel(),
  influencer: createMockModel(),
  session: createMockModel(),

  // Collaboration
  collaboration: createMockModel(),
  collaborationMilestone: createMockModel(),
  collaborationDeliverable: createMockModel(),
  collaborationMessage: createMockModel(),
  contract: createMockModel(),

  // Payments
  wallet: createMockModel(),
  walletTransaction: createMockModel(),
  escrow: createMockModel(),
  escrowRelease: createMockModel(),
  invoice: createMockModel(),
  payoutMethod: createMockModel(),
  platformCommission: createMockModel(),

  // Social
  post: createMockModel(),
  postLike: createMockModel(),
  comment: createMockModel(),
  follow: createMockModel(),

  // Marketplace
  campaignListing: createMockModel(),
  listingApplication: createMockModel(),

  // CRM
  crmContact: createMockModel(),
  crmNote: createMockModel(),
  crmActivity: createMockModel(),
  crmList: createMockModel(),

  // Analytics
  campaignAnalyticsSnapshot: createMockModel(),
  influencerAnalyticsSnapshot: createMockModel(),
  platformAnalyticsSnapshot: createMockModel(),

  // Subscriptions
  subscriptionPlan: createMockModel(),
  subscription: createMockModel(),
  usageRecord: createMockModel(),

  // Reputation
  brandReview: createMockModel(),
  influencerReview: createMockModel(),
  verificationBadge: createMockModel(),
  dispute: createMockModel(),

  // AI
  aiMatchResult: createMockModel(),
  aiContentSuggestion: createMockModel(),
  aiPricingSuggestion: createMockModel(),
  aiFraudFlag: createMockModel(),

  // Notifications
  notification: createMockModel(),
  notificationPreference: createMockModel(),

  // Transaction support
  $transaction: vi.fn((fn: (tx: unknown) => Promise<unknown>) => fn(prismaMock)),
  $queryRaw: vi.fn(),
  $executeRaw: vi.fn(),
  $connect: vi.fn(),
  $disconnect: vi.fn(),
};

// Mock the prisma import
vi.mock('@/lib/db/prisma', () => ({
  prisma: prismaMock,
}));

export default prismaMock;
