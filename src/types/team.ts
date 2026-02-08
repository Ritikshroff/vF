import { TeamRole } from '@prisma/client'
export { TeamRole }

export interface CreateOrganizationInput {
  name: string
}

export interface InviteMemberInput {
  email: string
  role?: TeamRole
}

export interface UpdateMemberRoleInput {
  role: TeamRole
  permissions?: string[]
}

export interface OrganizationDetail {
  id: string
  name: string
  brandId: string
  members: TeamMemberSummary[]
  pendingInvites: TeamInviteSummary[]
  createdAt: Date
}

export interface TeamMemberSummary {
  id: string
  userId: string
  user: { id: string; name: string; email: string; avatar: string | null }
  role: TeamRole
  permissions: string[]
  joinedAt: Date
}

export interface TeamInviteSummary {
  id: string
  email: string
  role: TeamRole
  expiresAt: Date
  createdAt: Date
}

export interface TeamActivityEntry {
  id: string
  userId: string
  action: string
  entityType: string | null
  entityId: string | null
  metadata: unknown
  createdAt: Date
}
