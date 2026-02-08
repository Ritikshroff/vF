import { prisma } from '@/lib/db/prisma'
import { Prisma, CRMContactStatus } from '@prisma/client'
import {
  CreateCRMContactInput,
  UpdateCRMContactInput,
  CRMContactFilters,
  CreateCRMNoteInput,
  CreateCRMListInput,
  CRMDashboardSummary,
} from '@/types/crm'

// ==================== Contact Operations ====================

/**
 * Add an influencer as a CRM contact
 */
export async function createContact(brandId: string, input: CreateCRMContactInput) {
  return prisma.cRMContact.create({
    data: {
      brandId,
      influencerId: input.influencerId,
      status: input.status || 'LEAD',
      customLabels: input.customLabels || [],
      internalNotes: input.internalNotes,
      source: input.source,
      acquiredAt: new Date(),
    },
    include: {
      influencer: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
          categories: true,
          rating: true,
          totalCampaigns: true,
        },
      },
    },
  })
}

/**
 * Get a CRM contact by ID
 */
export async function getContactById(contactId: string) {
  return prisma.cRMContact.findUnique({
    where: { id: contactId },
    include: {
      influencer: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
          categories: true,
          rating: true,
          totalCampaigns: true,
          platforms: {
            select: { platform: true, followers: true, engagementRate: true },
          },
        },
      },
      notes: {
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        take: 10,
      },
      activities: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  })
}

/**
 * List CRM contacts with filters
 */
export async function listContacts(filters: CRMContactFilters) {
  const { brandId, status, labels, search, page = 1, pageSize = 20 } = filters
  const skip = (page - 1) * pageSize

  const where: Prisma.CRMContactWhereInput = {
    brandId,
    ...(status && { status }),
    ...(labels && labels.length > 0 && { customLabels: { hasSome: labels } }),
    ...(search && {
      influencer: {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
          { username: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
        ],
      },
    }),
  }

  const [data, total] = await Promise.all([
    prisma.cRMContact.findMany({
      where,
      include: {
        influencer: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
            categories: true,
            rating: true,
          },
        },
        _count: { select: { notes: true, activities: true } },
      },
      skip,
      take: pageSize,
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.cRMContact.count({ where }),
  ])

  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
}

/**
 * Update a CRM contact
 */
export async function updateContact(contactId: string, brandId: string, input: UpdateCRMContactInput) {
  // Log status change as activity
  if (input.status) {
    const current = await prisma.cRMContact.findUnique({ where: { id: contactId } })
    if (current && current.status !== input.status) {
      await prisma.cRMActivity.create({
        data: {
          contactId,
          type: 'STATUS_CHANGE',
          title: `Status changed to ${input.status}`,
          details: `Changed from ${current.status} to ${input.status}`,
        },
      })
    }
  }

  return prisma.cRMContact.update({
    where: { id: contactId, brandId },
    data: {
      ...(input.status && { status: input.status }),
      ...(input.customLabels && { customLabels: input.customLabels }),
      ...(input.internalNotes !== undefined && { internalNotes: input.internalNotes }),
      ...(input.nextFollowUpAt && { nextFollowUpAt: new Date(input.nextFollowUpAt) }),
    },
  })
}

/**
 * Delete a CRM contact
 */
export async function deleteContact(contactId: string, brandId: string) {
  return prisma.cRMContact.delete({
    where: { id: contactId, brandId },
  })
}

// ==================== Notes Operations ====================

/**
 * Add a note to a contact
 */
export async function addNote(contactId: string, authorId: string, input: CreateCRMNoteInput) {
  const [note] = await prisma.$transaction([
    prisma.cRMNote.create({
      data: {
        contactId,
        authorId,
        content: input.content,
        isPinned: input.isPinned || false,
      },
    }),
    prisma.cRMActivity.create({
      data: {
        contactId,
        type: 'NOTE_ADDED',
        title: 'Note added',
        details: input.content.substring(0, 100),
      },
    }),
  ])

  return note
}

/**
 * Get notes for a contact
 */
export async function getContactNotes(contactId: string, page = 1, pageSize = 20) {
  const skip = (page - 1) * pageSize

  const [data, total] = await Promise.all([
    prisma.cRMNote.findMany({
      where: { contactId },
      skip,
      take: pageSize,
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    }),
    prisma.cRMNote.count({ where: { contactId } }),
  ])

  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
}

// ==================== List Operations ====================

/**
 * Create a CRM list
 */
export async function createList(brandId: string, input: CreateCRMListInput) {
  return prisma.cRMList.create({
    data: {
      brandId,
      name: input.name,
      description: input.description,
      isSmartList: input.isSmartList || false,
      criteria: input.criteria as Prisma.InputJsonValue || undefined,
    },
  })
}

/**
 * Get lists for a brand
 */
export async function getLists(brandId: string) {
  return prisma.cRMList.findMany({
    where: { brandId },
    include: {
      _count: { select: { members: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Add contacts to a list
 */
export async function addToList(listId: string, contactIds: string[]) {
  const data = contactIds.map((contactId) => ({
    listId,
    contactId,
  }))

  return prisma.cRMListMember.createMany({
    data,
    skipDuplicates: true,
  })
}

/**
 * Remove a contact from a list
 */
export async function removeFromList(listId: string, contactId: string) {
  return prisma.cRMListMember.delete({
    where: { listId_contactId: { listId, contactId } },
  })
}

// ==================== Dashboard ====================

/**
 * Get CRM dashboard summary
 */
export async function getCRMDashboard(brandId: string): Promise<CRMDashboardSummary> {
  const [totalContacts, statusCounts, recentActivityCount, upcomingFollowUps] = await Promise.all([
    prisma.cRMContact.count({ where: { brandId } }),
    prisma.cRMContact.groupBy({
      by: ['status'],
      where: { brandId },
      _count: true,
    }),
    prisma.cRMActivity.count({
      where: {
        contact: { brandId },
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.cRMContact.count({
      where: {
        brandId,
        nextFollowUpAt: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),
  ])

  const byStatus: Record<string, number> = {}
  statusCounts.forEach((s) => {
    byStatus[s.status] = s._count
  })

  return {
    totalContacts,
    byStatus,
    recentActivity: recentActivityCount,
    upcomingFollowUps,
  }
}
