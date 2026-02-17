import { faker } from '@faker-js/faker';

// ─── User Factories ───

export function createMockUser(overrides: Record<string, unknown> = {}) {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    passwordHash: '$2a$12$fakehash',
    role: 'BRAND' as const,
    isActive: true,
    isEmailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createMockBrand(overrides: Record<string, unknown> = {}) {
  return {
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    companyName: faker.company.name(),
    industry: 'Technology',
    website: faker.internet.url(),
    description: faker.lorem.paragraph(),
    logoUrl: faker.image.url(),
    isVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createMockInfluencer(overrides: Record<string, unknown> = {}) {
  return {
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    fullName: faker.person.fullName(),
    bio: faker.lorem.paragraph(),
    niche: ['Technology', 'Lifestyle'],
    followerCount: faker.number.int({ min: 1000, max: 1000000 }),
    profileImageUrl: faker.image.url(),
    isVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// ─── Collaboration Factories ───

export function createMockCollaboration(overrides: Record<string, unknown> = {}) {
  return {
    id: faker.string.uuid(),
    brandId: faker.string.uuid(),
    influencerId: faker.string.uuid(),
    campaignId: faker.string.uuid(),
    status: 'PENDING' as const,
    title: faker.lorem.sentence(),
    description: faker.lorem.paragraph(),
    budget: 5000,
    currency: 'USD',
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createMockMilestone(overrides: Record<string, unknown> = {}) {
  return {
    id: faker.string.uuid(),
    collaborationId: faker.string.uuid(),
    title: faker.lorem.sentence(),
    description: faker.lorem.paragraph(),
    amount: 1000,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    status: 'PENDING' as const,
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// ─── Payment Factories ───

export function createMockWallet(overrides: Record<string, unknown> = {}) {
  return {
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    balance: 10000,
    currency: 'USD',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createMockEscrow(overrides: Record<string, unknown> = {}) {
  return {
    id: faker.string.uuid(),
    collaborationId: faker.string.uuid(),
    amount: 5000,
    currency: 'USD',
    status: 'PENDING' as const,
    fundedBy: faker.string.uuid(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createMockInvoice(overrides: Record<string, unknown> = {}) {
  return {
    id: faker.string.uuid(),
    invoiceNumber: `INV-${faker.string.nanoid(8).toUpperCase()}`,
    type: 'BRAND_DEPOSIT' as const,
    amount: 5000,
    currency: 'USD',
    status: 'PENDING' as const,
    issuedTo: faker.string.uuid(),
    issuedBy: faker.string.uuid(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// ─── Auth Helpers ───

export function createAuthenticatedUser(overrides: Record<string, unknown> = {}) {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    role: 'BRAND' as const,
    brandId: faker.string.uuid(),
    influencerId: undefined,
    ...overrides,
  };
}

// ─── Request/Response Helpers ───

export function createMockNextRequest(
  url: string = 'http://localhost:3000/api/test',
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: unknown;
    cookies?: Record<string, string>;
  } = {}
) {
  const { method = 'GET', headers = {}, body, cookies = {} } = options;

  const request = new Request(url, {
    method,
    headers: new Headers({
      'Content-Type': 'application/json',
      ...headers,
    }),
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  // Add cookie getter
  const cookieStore = cookies;
  Object.defineProperty(request, 'cookies', {
    get() {
      return {
        get: (name: string) => cookieStore[name] ? { value: cookieStore[name] } : undefined,
        has: (name: string) => name in cookieStore,
      };
    },
  });

  return request;
}
