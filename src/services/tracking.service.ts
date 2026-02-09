import { prisma } from '@/lib/db/prisma'
import { Prisma } from '@prisma/client'
import { CreateTrackingLinkInput, CreatePromoCodeInput } from '@/types/tracking'

function generateShortCode(): string {
  return Math.random().toString(36).substring(2, 8)
}

export async function createTrackingLink(influencerId: string, input: CreateTrackingLinkInput) {
  const link = await prisma.trackingLink.create({
    data: {
      influencerId,
      originalUrl: input.originalUrl,
      shortCode: generateShortCode(),
      campaignId: input.campaignId,
      collaborationId: input.collaborationId,
      utmSource: input.utmSource,
      utmMedium: input.utmMedium,
      utmCampaign: input.utmCampaign,
    },
  })
  return link
}

export async function createPromoCode(influencerId: string, input: CreatePromoCodeInput) {
  return prisma.promoCode.create({
    data: {
      influencerId,
      campaignId: input.campaignId,
      code: input.code.toUpperCase(),
      discountType: input.discountType,
      discountValue: new Prisma.Decimal(input.discountValue),
      maxUses: input.maxUses,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
    },
  })
}

export async function recordClick(shortCode: string, metadata: { ipHash: string; userAgent?: string; referrer?: string; country?: string; device?: string }) {
  const link = await prisma.trackingLink.findUnique({ where: { shortCode } })
  if (!link || !link.isActive) throw new Error('Link not found or inactive')
  await prisma.trackingLinkClick.create({ data: { linkId: link.id, ...metadata } })
  return { originalUrl: link.originalUrl }
}

export async function recordConversion(linkId: string, data: { promoCodeId?: string; orderValue?: number; commission?: number; metadata?: Record<string, unknown> }) {
  return prisma.trackingLinkConversion.create({
    data: {
      linkId,
      promoCodeId: data.promoCodeId,
      orderValue: data.orderValue ? new Prisma.Decimal(data.orderValue) : null,
      commission: data.commission ? new Prisma.Decimal(data.commission) : null,
      metadata: (data.metadata as any) || undefined,
    },
  })
}

export async function getTrackingDashboard(influencerId: string) {
  const [links, clicks, conversions] = await Promise.all([
    prisma.trackingLink.count({ where: { influencerId } }),
    prisma.trackingLinkClick.count({ where: { link: { influencerId } } }),
    prisma.trackingLinkConversion.findMany({ where: { link: { influencerId } }, select: { orderValue: true } }),
  ])
  const totalRevenue = conversions.reduce((sum, c) => sum + (c.orderValue ? Number(c.orderValue) : 0), 0)
  return {
    totalLinks: links, totalClicks: clicks, totalConversions: conversions.length,
    totalRevenue, conversionRate: clicks > 0 ? (conversions.length / clicks) * 100 : 0,
    recentClicks: [],
  }
}

export async function listTrackingLinks(influencerId: string, page = 1, pageSize = 20) {
  const skip = (page - 1) * pageSize
  const [data, total] = await Promise.all([
    prisma.trackingLink.findMany({
      where: { influencerId },
      include: { _count: { select: { clicks: true, conversions: true } } },
      skip, take: pageSize, orderBy: { createdAt: 'desc' },
    }),
    prisma.trackingLink.count({ where: { influencerId } }),
  ])
  return {
    data: data.map((l) => ({
      id: l.id, shortCode: l.shortCode, originalUrl: l.originalUrl, utmSource: l.utmSource,
      totalClicks: l._count.clicks, totalConversions: l._count.conversions,
      totalRevenue: 0, isActive: l.isActive, createdAt: l.createdAt,
    })),
    total, page, pageSize, totalPages: Math.ceil(total / pageSize),
  }
}

export async function listPromoCodes(influencerId: string, page = 1, pageSize = 20) {
  const skip = (page - 1) * pageSize
  const [data, total] = await Promise.all([
    prisma.promoCode.findMany({ where: { influencerId }, skip, take: pageSize, orderBy: { createdAt: 'desc' } }),
    prisma.promoCode.count({ where: { influencerId } }),
  ])
  return {
    data: data.map((c) => ({
      id: c.id, code: c.code, discountType: c.discountType,
      discountValue: Number(c.discountValue), maxUses: c.maxUses,
      usedCount: c.usedCount, isActive: c.isActive, expiresAt: c.expiresAt,
    })),
    total, page, pageSize, totalPages: Math.ceil(total / pageSize),
  }
}

export async function toggleLinkStatus(linkId: string, influencerId: string) {
  const link = await prisma.trackingLink.findFirst({ where: { id: linkId, influencerId } })
  if (!link) throw new Error('Link not found')
  return prisma.trackingLink.update({ where: { id: linkId }, data: { isActive: !link.isActive } })
}

export async function togglePromoCodeStatus(codeId: string, influencerId: string) {
  const code = await prisma.promoCode.findFirst({ where: { id: codeId, influencerId } })
  if (!code) throw new Error('Promo code not found')
  return prisma.promoCode.update({ where: { id: codeId }, data: { isActive: !code.isActive } })
}
