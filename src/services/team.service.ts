import { prisma } from '@/lib/db/prisma'
import { Prisma } from '@prisma/client'
import { CreateOrganizationInput, InviteMemberInput, UpdateMemberRoleInput } from '@/types/team'
import crypto from 'crypto'

export async function createOrganization(brandId: string, input: CreateOrganizationInput) {
  const brand = await prisma.brand.findUnique({ where: { id: brandId }, select: { userId: true } })
  if (!brand) throw new Error('Brand not found')
  return prisma.$transaction(async (tx) => {
    const org = await tx.organization.create({
      data: { brandId, name: input.name },
    })
    // Add the brand owner as OWNER
    await tx.teamMember.create({
      data: { organizationId: org.id, userId: brand.userId, role: 'OWNER', permissions: ['*'] },
    })
    return org
  })
}

export async function getOrganization(brandId: string) {
  const org = await prisma.organization.findUnique({
    where: { brandId },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
        orderBy: { joinedAt: 'asc' },
      },
      invites: { where: { acceptedAt: null, expiresAt: { gt: new Date() } }, orderBy: { createdAt: 'desc' } },
    },
  })
  if (!org) throw new Error('Organization not found')
  return org
}

export async function inviteMember(orgId: string, input: InviteMemberInput) {
  const token = crypto.randomUUID()
  const invite = await prisma.teamInvite.create({
    data: {
      organizationId: orgId, email: input.email,
      role: input.role || 'MEMBER', token, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  })
  await logActivity(orgId, 'system', 'member.invited', 'invite', invite.id, { email: input.email })
  return invite
}

export async function acceptInvite(token: string, userId: string) {
  const invite = await prisma.teamInvite.findUnique({ where: { token } })
  if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) throw new Error('Invalid or expired invite')
  return prisma.$transaction(async (tx) => {
    await tx.teamInvite.update({ where: { id: invite.id }, data: { acceptedAt: new Date() } })
    const member = await tx.teamMember.create({
      data: { organizationId: invite.organizationId, userId, role: invite.role, permissions: [] },
      include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
    })
    await tx.teamActivityLog.create({
      data: { organizationId: invite.organizationId, userId, action: 'member.joined', entityType: 'member', entityId: member.id },
    })
    return member
  })
}

export async function updateMemberRole(orgId: string, memberId: string, input: UpdateMemberRoleInput) {
  const member = await prisma.teamMember.findFirst({ where: { id: memberId, organizationId: orgId } })
  if (!member) throw new Error('Member not found')
  return prisma.teamMember.update({
    where: { id: memberId },
    data: { role: input.role, permissions: input.permissions || [] },
    include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
  })
}

export async function removeMember(orgId: string, memberId: string) {
  const member = await prisma.teamMember.findFirst({ where: { id: memberId, organizationId: orgId } })
  if (!member) throw new Error('Member not found')
  if (member.role === 'OWNER') throw new Error('Cannot remove the owner')
  await prisma.teamMember.delete({ where: { id: memberId } })
  await logActivity(orgId, member.userId, 'member.removed', 'member', memberId)
  return { success: true }
}

export async function getActivityLog(orgId: string, page = 1, pageSize = 50) {
  const skip = (page - 1) * pageSize
  const [data, total] = await Promise.all([
    prisma.teamActivityLog.findMany({ where: { organizationId: orgId }, skip, take: pageSize, orderBy: { createdAt: 'desc' } }),
    prisma.teamActivityLog.count({ where: { organizationId: orgId } }),
  ])
  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
}

export async function logActivity(orgId: string, userId: string, action: string, entityType?: string, entityId?: string, metadata?: Record<string, unknown>) {
  return prisma.teamActivityLog.create({
    data: { organizationId: orgId, userId, action, entityType, entityId, metadata: metadata as any },
  })
}
