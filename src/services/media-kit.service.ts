import { prisma } from '@/lib/db/prisma'
import { Prisma } from '@prisma/client'
import { CreateMediaKitInput, MediaKitSectionInput, RateCardInput } from '@/types/media-kit'

export async function getMediaKit(influencerId: string) {
  return prisma.mediaKit.findUnique({
    where: { influencerId },
    include: {
      sections: { orderBy: { order: 'asc' } },
      rateCards: true,
      influencer: { select: { fullName: true, username: true, avatar: true, verified: true, categories: true } },
    },
  })
}

export async function getMediaKitBySlug(slug: string) {
  const kit = await prisma.mediaKit.findUnique({
    where: { customSlug: slug },
    include: {
      sections: { where: { isVisible: true }, orderBy: { order: 'asc' } },
      rateCards: true,
      influencer: {
        select: {
          fullName: true, username: true, avatar: true, verified: true, categories: true,
          platforms: { select: { platform: true, handle: true, followerCount: true, engagementRate: true } },
          metrics: true,
        },
      },
    },
  })
  if (!kit || !kit.isPublic) throw new Error('Media kit not found')
  return kit
}

export async function createOrUpdateMediaKit(influencerId: string, input: CreateMediaKitInput) {
  return prisma.mediaKit.upsert({
    where: { influencerId },
    create: { influencerId, ...input },
    update: input,
    include: {
      sections: { orderBy: { order: 'asc' } },
      rateCards: true,
      influencer: { select: { fullName: true, username: true, avatar: true, verified: true, categories: true } },
    },
  })
}

export async function updateSections(mediaKitId: string, sections: MediaKitSectionInput[]) {
  return prisma.$transaction(async (tx) => {
    await tx.mediaKitSection.deleteMany({ where: { mediaKitId } })
    const created = await Promise.all(
      sections.map((s) => tx.mediaKitSection.create({
        data: { mediaKitId, type: s.type, title: s.title, content: s.content, order: s.order, isVisible: s.isVisible ?? true },
      }))
    )
    return created
  })
}

export async function updateRateCards(mediaKitId: string, rateCards: RateCardInput[]) {
  return prisma.$transaction(async (tx) => {
    await tx.rateCard.deleteMany({ where: { mediaKitId } })
    const created = await Promise.all(
      rateCards.map((r) => tx.rateCard.create({
        data: {
          mediaKitId, platform: r.platform, contentType: r.contentType,
          price: new Prisma.Decimal(r.price), description: r.description, deliveryDays: r.deliveryDays,
        },
      }))
    )
    return created
  })
}
