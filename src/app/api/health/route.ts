import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { logger } from '@/lib/logger';

/** Application version from package.json. */
const APP_VERSION = process.env.npm_package_version ?? '0.1.0';

/**
 * Format bytes into a human-readable string (e.g. "45.2 MB").
 */
function formatBytes(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

/**
 * Check database connectivity by running a trivial query and measuring latency.
 */
async function checkDatabase(): Promise<{ status: 'up' | 'down'; latencyMs: number }> {
  const start = performance.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const latencyMs = Math.round(performance.now() - start);
    return { status: 'up', latencyMs };
  } catch {
    const latencyMs = Math.round(performance.now() - start);
    return { status: 'down', latencyMs };
  }
}

/**
 * GET /api/health
 *
 * Public health check endpoint. Returns application status, uptime,
 * database connectivity, and memory usage.
 *
 * - 200 OK when all checks pass (status: "healthy")
 * - 503 Service Unavailable when any check fails (status: "unhealthy")
 */
export async function GET() {
  try {
    const database = await checkDatabase();

    const memoryUsage = process.memoryUsage();
    const memory = {
      heapUsed: formatBytes(memoryUsage.heapUsed),
      heapTotal: formatBytes(memoryUsage.heapTotal),
      rss: formatBytes(memoryUsage.rss),
    };

    const isHealthy = database.status === 'up';
    const status = isHealthy ? 'healthy' : 'unhealthy';

    const body = {
      status,
      timestamp: new Date().toISOString(),
      version: APP_VERSION,
      uptime: Math.round(process.uptime()),
      checks: {
        database,
        memory,
      },
    };

    if (!isHealthy) {
      logger.warn('Health check failed', { checks: body.checks });
    }

    return NextResponse.json(body, {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    logger.error('Health check error', {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        version: APP_VERSION,
        uptime: Math.round(process.uptime()),
        checks: {
          database: { status: 'down', latencyMs: 0 },
          memory: {
            heapUsed: formatBytes(process.memoryUsage().heapUsed),
            heapTotal: formatBytes(process.memoryUsage().heapTotal),
            rss: formatBytes(process.memoryUsage().rss),
          },
        },
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      },
    );
  }
}
