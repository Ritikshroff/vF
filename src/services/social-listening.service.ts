import { prisma } from '@/lib/db/prisma'
import { Prisma } from '@prisma/client'
import { AddKeywordInput, MentionFilters } from '@/types/social-listening'

export async function getMentions(brandId: string, filters: MentionFilters) {
  const { platform, sentiment, dateFrom, dateTo, page = 1, pageSize = 20 } = filters
  const skip = (page - 1) * pageSize
  const where: Prisma.BrandMentionWhereInput = { brandId }
  if (platform) where.platform = platform
  if (sentiment) where.sentiment = sentiment
  if (dateFrom || dateTo) {
    where.detectedAt = {}
    if (dateFrom) where.detectedAt.gte = new Date(dateFrom)
    if (dateTo) where.detectedAt.lte = new Date(dateTo)
  }
  const [data, total] = await Promise.all([
    prisma.brandMention.findMany({ where, skip, take: pageSize, orderBy: { detectedAt: 'desc' } }),
    prisma.brandMention.count({ where }),
  ])
  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
}

export async function addKeywordTracker(brandId: string, input: AddKeywordInput) {
  return prisma.keywordTracker.create({
    data: { brandId, keyword: input.keyword, platforms: input.platforms },
  })
}

export async function listKeywordTrackers(brandId: string) {
  return prisma.keywordTracker.findMany({ where: { brandId }, orderBy: { createdAt: 'desc' } })
}

export async function toggleKeywordTracker(trackerId: string, brandId: string) {
  const tracker = await prisma.keywordTracker.findFirst({ where: { id: trackerId, brandId } })
  if (!tracker) throw new Error('Tracker not found')
  return prisma.keywordTracker.update({ where: { id: trackerId }, data: { isActive: !tracker.isActive } })
}

export async function deleteKeywordTracker(trackerId: string, brandId: string) {
  const tracker = await prisma.keywordTracker.findFirst({ where: { id: trackerId, brandId } })
  if (!tracker) throw new Error('Tracker not found')
  await prisma.keywordTracker.delete({ where: { id: trackerId } })
  return { success: true }
}

export async function getSentimentReport(brandId: string, period: string) {
  return prisma.sentimentReport.findFirst({
    where: { brandId, period },
    orderBy: { periodStart: 'desc' },
  })
}

export async function getMentionStats(brandId: string) {
  const [total, positive, neutral, negative] = await Promise.all([
    prisma.brandMention.count({ where: { brandId } }),
    prisma.brandMention.count({ where: { brandId, sentiment: 'POSITIVE' } }),
    prisma.brandMention.count({ where: { brandId, sentiment: 'NEUTRAL' } }),
    prisma.brandMention.count({ where: { brandId, sentiment: 'NEGATIVE' } }),
  ])
  return { total, positive, neutral, negative }
}
