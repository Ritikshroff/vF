import { vi, beforeEach } from 'vitest';

// Mock environment variables for tests
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-key-for-testing-only';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-testing-only';
process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000';
process.env.NEXT_PUBLIC_APP_NAME = 'Viralfluencer Test';

// Reset all mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});
