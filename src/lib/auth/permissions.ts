import { UserRole } from '@prisma/client';

// Define all available permissions in the system
export type Permission =
  // Campaign permissions
  | 'campaign:create'
  | 'campaign:read'
  | 'campaign:update'
  | 'campaign:delete'
  | 'campaign:publish'
  | 'campaign:apply'
  // Influencer permissions
  | 'influencer:read'
  | 'influencer:update'
  | 'influencer:save'
  | 'influencer:block'
  // Brand permissions
  | 'brand:read'
  | 'brand:update'
  // Content permissions
  | 'content:create'
  | 'content:read'
  | 'content:update'
  | 'content:delete'
  | 'content:review'
  | 'content:approve'
  // Payment permissions
  | 'payment:create'
  | 'payment:read'
  | 'payment:process'
  // Message permissions
  | 'message:send'
  | 'message:read'
  // Analytics permissions
  | 'analytics:read'
  | 'analytics:export'
  // Admin permissions
  | 'admin:users'
  | 'admin:campaigns'
  | 'admin:payments'
  | 'admin:reports'
  | '*'; // Wildcard for all permissions

// Role-based permission mapping
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: ['*'], // Admin has all permissions

  BRAND: [
    // Campaign management
    'campaign:create',
    'campaign:read',
    'campaign:update',
    'campaign:delete',
    'campaign:publish',
    // Influencer discovery
    'influencer:read',
    'influencer:save',
    'influencer:block',
    // Brand profile
    'brand:read',
    'brand:update',
    // Content review
    'content:read',
    'content:review',
    'content:approve',
    // Payments
    'payment:create',
    'payment:read',
    // Messaging
    'message:send',
    'message:read',
    // Analytics
    'analytics:read',
    'analytics:export',
  ],

  INFLUENCER: [
    // Campaign participation
    'campaign:read',
    'campaign:apply',
    // Profile management
    'influencer:read',
    'influencer:update',
    // Content creation
    'content:create',
    'content:read',
    'content:update',
    'content:delete',
    // Payments (view only)
    'payment:read',
    // Messaging
    'message:send',
    'message:read',
    // Analytics (own data)
    'analytics:read',
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];

  // Check for wildcard (admin has all)
  if (permissions.includes('*')) {
    return true;
  }

  return permissions.includes(permission);
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

/**
 * Get all permissions for a role
 */
export function getPermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role];
}

/**
 * Check if user is admin
 */
export function isAdmin(role: UserRole): boolean {
  return role === 'ADMIN';
}

/**
 * Check if user is brand
 */
export function isBrand(role: UserRole): boolean {
  return role === 'BRAND';
}

/**
 * Check if user is influencer
 */
export function isInfluencer(role: UserRole): boolean {
  return role === 'INFLUENCER';
}

// Resource ownership types for access control
export interface ResourceOwnership {
  type: 'brand' | 'influencer' | 'user';
  id: string;
}

/**
 * Check if a user owns a resource or has admin access
 */
export function canAccessResource(
  userRole: UserRole,
  userId: string,
  userBrandId: string | null,
  userInfluencerId: string | null,
  resource: ResourceOwnership
): boolean {
  // Admins can access everything
  if (isAdmin(userRole)) {
    return true;
  }

  // Check ownership based on resource type
  switch (resource.type) {
    case 'user':
      return userId === resource.id;
    case 'brand':
      return userBrandId === resource.id;
    case 'influencer':
      return userInfluencerId === resource.id;
    default:
      return false;
  }
}

/**
 * Permission decorator for API routes (type-safe)
 */
export function requirePermissions(...permissions: Permission[]) {
  return function checkPermissions(role: UserRole): boolean {
    return hasAllPermissions(role, permissions);
  };
}

/**
 * Role guard for API routes
 */
export function requireRoles(...allowedRoles: UserRole[]) {
  return function checkRole(role: UserRole): boolean {
    return allowedRoles.includes(role);
  };
}

// Export role constants for convenience
export const ROLES = {
  ADMIN: 'ADMIN' as UserRole,
  BRAND: 'BRAND' as UserRole,
  INFLUENCER: 'INFLUENCER' as UserRole,
};
