import { randomUUID } from 'crypto';

/**
 * Generate a new unique request ID (UUID v4).
 */
export function generateRequestId(): string {
  return randomUUID();
}

/**
 * Extract the request ID from the incoming request's `x-request-id` header.
 * If no header is present, a new UUID is generated so every request
 * always has a correlation ID for structured logging.
 *
 * @example
 * ```ts
 * import { getRequestId } from '@/lib/request-id';
 * import { logger } from '@/lib/logger';
 *
 * export async function GET(request: Request) {
 *   const requestId = getRequestId(request);
 *   const reqLogger = logger.child({ requestId });
 *   reqLogger.info('Handling request');
 *   // ...
 * }
 * ```
 */
export function getRequestId(request: Request): string {
  return request.headers.get('x-request-id') || generateRequestId();
}
