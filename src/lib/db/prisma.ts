import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Declare global type for prisma in development
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// PrismaClient singleton to prevent multiple instances in development
// In production, this will create a single instance
// In development with hot-reloading, this prevents creating multiple instances

const prismaClientSingleton = () => {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });
};

// Use global variable in development to preserve instance across hot reloads
export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// Export the PrismaClient type for use in other files
export type { PrismaClient };
