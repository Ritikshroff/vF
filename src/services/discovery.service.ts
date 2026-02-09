import { prisma } from '@/lib/db/prisma'
import { Prisma } from '@prisma/client'
import { DiscoveryFilters } from '@/types/discovery'

const comparison = () => (prisma as any).influencerComparison
const history = () => (prisma as any).searchHistory

export async function searchInfluencers(filters: DiscoveryFilters) {
  const { query, niches, platforms, minFollowers, maxFollowers, location, verified, page = 1, pageSize = 20 } = filters
  const skip = (page - 1) * pageSize
  const where: Prisma.InfluencerWhereInput = {}
  if (query) {
    where.OR = [
      { fullName: { contains: query, mode: 'insensitive' } },
      { username: { contains: query, mode: 'insensitive' } },
      { bio: { contains: query, mode: 'insensitive' } },
    ]
  }
  if (niches?.length) where.categories = { hasSome: niches }
  if (location) where.location = { contains: location, mode: 'insensitive' }
  if (verified !== undefined) where.verified = verified

  const [data, total] = await Promise.all([
    prisma.influencer.findMany({
      where,
      include: {
        platforms: { select: { platform: true, handle: true, followers: true, engagementRate: true } },
        pricing: true,
      },
      skip, take: pageSize, orderBy: { rating: 'desc' },
    }),
    prisma.influencer.count({ where }),
  ])

  const results = data.map((i: any) => ({
    id: i.id, username: i.username, fullName: i.fullName, avatar: i.avatar, bio: i.bio,
    location: i.location, verified: i.verified, categories: i.categories,
    rating: Number(i.rating), totalReviews: i.totalReviews,
    platforms: i.platforms.map((p: any) => ({
      platform: p.platform, handle: p.handle,
      followers: p.followers, engagementRate: Number(p.engagementRate),
    })),
    pricing: i.pricing ? { currency: i.pricing.currency, negotiable: i.pricing.negotiable } : null,
  }))

  return { data: results, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
}

export async function getInfluencerProfile(id: string) {
  const i = await prisma.influencer.findUnique({
    where: { id },
    include: {
      platforms: true, pricing: true, metrics: true, audience: true, recentPosts: { take: 6 },
    },
  })
  if (!i) throw new Error('Influencer not found')
  return i
}

export async function compareInfluencers(influencerIds: string[]) {
  const influencers = await prisma.influencer.findMany({
    where: { id: { in: influencerIds } },
    include: {
      platforms: { select: { platform: true, handle: true, followers: true, engagementRate: true } },
      pricing: true,
      metrics: true,
    },
  })
  return influencers.map((i: any) => ({
    id: i.id, username: i.username, fullName: i.fullName, avatar: i.avatar, bio: i.bio,
    location: i.location, verified: i.verified, categories: i.categories,
    rating: Number(i.rating), totalReviews: i.totalReviews,
    platforms: i.platforms.map((p: any) => ({
      platform: p.platform, handle: p.handle, followers: p.followers, engagementRate: Number(p.engagementRate),
    })),
    pricing: i.pricing ? { currency: i.pricing.currency, negotiable: i.pricing.negotiable } : null,
  }))
}

export async function getSimilarInfluencers(influencerId: string, limit = 5) {
  const influencer = await prisma.influencer.findUnique({ where: { id: influencerId }, select: { categories: true, location: true } })
  if (!influencer) throw new Error('Influencer not found')
  const similar = await prisma.influencer.findMany({
    where: { id: { not: influencerId }, categories: { hasSome: influencer.categories } },
    include: {
      platforms: { select: { platform: true, handle: true, followers: true, engagementRate: true } },
      pricing: true,
    },
    take: limit, orderBy: { rating: 'desc' },
  })
  return similar.map((i: any) => ({
    id: i.id, username: i.username, fullName: i.fullName, avatar: i.avatar, bio: i.bio,
    location: i.location, verified: i.verified, categories: i.categories,
    rating: Number(i.rating), totalReviews: i.totalReviews,
    platforms: i.platforms.map((p: any) => ({
      platform: p.platform, handle: p.handle, followers: p.followers, engagementRate: Number(p.engagementRate),
    })),
    pricing: i.pricing ? { currency: i.pricing.currency, negotiable: i.pricing.negotiable } : null,
  }))
}

export async function saveComparison(brandId: string, influencerIds: string[], name?: string) {
  return comparison().create({ data: { brandId, influencerIds, name } })
}

export async function saveSearch(userId: string, query: string, filters: Record<string, unknown>, resultCount: number) {
  return history().create({ data: { userId, query, filters, resultCount } })
}

export async function getSearchHistory(userId: string, limit = 10) {
  return history().findMany({
    where: { userId }, orderBy: { createdAt: 'desc' }, take: limit,
  })
}
