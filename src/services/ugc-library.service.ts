import { prisma } from '@/lib/db/prisma'
import { Prisma } from '@prisma/client'
import { AddUGCContentInput, SetContentRightsInput, TrackUsageInput, UGCFilters } from '@/types/ugc'

export async function addContent(brandId: string, input: AddUGCContentInput) {
  return prisma.uGCContent.create({
    data: {
      brandId, influencerId: input.influencerId, collaborationId: input.collaborationId,
      title: input.title, mediaUrl: input.mediaUrl, mediaType: input.mediaType,
      platform: input.platform, tags: input.tags || [],
    },
    include: {
      influencer: { select: { id: true, fullName: true, avatar: true } },
    },
  })
}

export async function listContent(brandId: string, filters: UGCFilters) {
  const { mediaType, platform, influencerId, tag, page = 1, pageSize = 20 } = filters
  const skip = (page - 1) * pageSize
  const where: Prisma.UGCContentWhereInput = { brandId }
  if (mediaType) where.mediaType = mediaType
  if (platform) where.platform = platform
  if (influencerId) where.influencerId = influencerId
  if (tag) where.tags = { has: tag }
  const [data, total] = await Promise.all([
    prisma.uGCContent.findMany({
      where,
      include: {
        influencer: { select: { id: true, fullName: true, avatar: true } },
        rights: { select: { licenseType: true, usageRights: true, expiresAt: true } },
        _count: { select: { usages: true } },
      },
      skip, take: pageSize, orderBy: { createdAt: 'desc' },
    }),
    prisma.uGCContent.count({ where }),
  ])
  const results = data.map((c) => ({
    id: c.id, title: c.title, mediaUrl: c.mediaUrl, mediaType: c.mediaType,
    platform: c.platform, tags: c.tags, influencer: c.influencer, rights: c.rights,
    usageCount: c._count.usages, createdAt: c.createdAt,
  }))
  return { data: results, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
}

export async function getContent(contentId: string, brandId: string) {
  const content = await prisma.uGCContent.findFirst({
    where: { id: contentId, brandId },
    include: {
      influencer: { select: { id: true, fullName: true, avatar: true } },
      rights: true, usages: { orderBy: { usedAt: 'desc' } },
    },
  })
  if (!content) throw new Error('Content not found')
  return content
}

export async function setContentRights(contentId: string, brandId: string, input: SetContentRightsInput) {
  const content = await prisma.uGCContent.findFirst({ where: { id: contentId, brandId } })
  if (!content) throw new Error('Content not found')
  return prisma.contentRightsRecord.upsert({
    where: { ugcContentId: contentId },
    create: {
      ugcContentId: contentId, licenseType: input.licenseType, usageRights: input.usageRights,
      territory: input.territory, duration: input.duration,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null, agreementUrl: input.agreementUrl,
    },
    update: {
      licenseType: input.licenseType, usageRights: input.usageRights,
      territory: input.territory, duration: input.duration,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null, agreementUrl: input.agreementUrl,
    },
  })
}

export async function trackUsage(contentId: string, brandId: string, input: TrackUsageInput) {
  const content = await prisma.uGCContent.findFirst({ where: { id: contentId, brandId } })
  if (!content) throw new Error('Content not found')
  return prisma.contentUsageRecord.create({
    data: { ugcContentId: contentId, platform: input.platform, usageType: input.usageType, url: input.url },
  })
}

export async function getExpiringRights(brandId: string, daysAhead = 30) {
  const futureDate = new Date()
  futureDate.setDate(futureDate.getDate() + daysAhead)
  const rights = await prisma.contentRightsRecord.findMany({
    where: {
      ugcContent: { brandId },
      expiresAt: { not: null, lte: futureDate, gte: new Date() },
    },
    include: { ugcContent: { select: { id: true, title: true, mediaUrl: true } } },
    orderBy: { expiresAt: 'asc' },
  })
  return rights.map((r) => ({
    contentId: r.ugcContent.id, title: r.ugcContent.title, mediaUrl: r.ugcContent.mediaUrl,
    licenseType: r.licenseType, expiresAt: r.expiresAt!,
    daysRemaining: Math.ceil((r.expiresAt!.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
  }))
}

export async function deleteContent(contentId: string, brandId: string) {
  const content = await prisma.uGCContent.findFirst({ where: { id: contentId, brandId } })
  if (!content) throw new Error('Content not found')
  await prisma.uGCContent.delete({ where: { id: contentId } })
  return { success: true }
}
