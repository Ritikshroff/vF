/**
 * Audit Logger for Sensitive Operations
 * Logs security-relevant events for compliance and debugging
 */

import { logger } from '@/lib/logger';

export type AuditAction =
  | 'auth.login'
  | 'auth.logout'
  | 'auth.register'
  | 'auth.password_reset'
  | 'auth.password_change'
  | 'auth.email_verify'
  | 'auth.failed_login'
  | 'user.update'
  | 'user.delete'
  | 'user.role_change'
  | 'payment.deposit'
  | 'payment.withdraw'
  | 'payment.refund'
  | 'escrow.create'
  | 'escrow.fund'
  | 'escrow.release'
  | 'escrow.refund'
  | 'collaboration.create'
  | 'collaboration.transition'
  | 'contract.sign'
  | 'subscription.create'
  | 'subscription.cancel'
  | 'subscription.change_plan'
  | 'admin.user_action'
  | 'admin.dispute_resolve'
  | 'admin.verification_review';

interface AuditEntry {
  action: AuditAction;
  userId?: string;
  targetId?: string;
  targetType?: string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Log an audit event for sensitive operations
 */
export function audit(entry: AuditEntry): void {
  const logEntry = {
    type: 'AUDIT',
    action: entry.action,
    userId: entry.userId || 'anonymous',
    targetId: entry.targetId,
    targetType: entry.targetType,
    ip: entry.ip,
    userAgent: entry.userAgent,
    timestamp: new Date().toISOString(),
    ...entry.metadata,
  };

  // In production, this should also write to a dedicated audit table or external service
  logger.info(`[AUDIT] ${entry.action}`, logEntry);
}

/**
 * Extract client info from a Request for audit logging
 */
export function getClientInfo(request: Request): { ip: string; userAgent: string } {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  return { ip, userAgent };
}
