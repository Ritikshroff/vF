import { prisma } from '@/lib/db/prisma'
import { Prisma } from '@prisma/client'
import { CreateOutreachTemplateInput, CreateOutreachCampaignInput } from '@/types/outreach'

export async function createTemplate(brandId: string, input: CreateOutreachTemplateInput) {
  return prisma.outreachTemplate.create({
    data: { brandId, name: input.name, subject: input.subject, body: input.body, type: input.type || 'EMAIL' },
  })
}

export async function listTemplates(brandId: string) {
  return prisma.outreachTemplate.findMany({ where: { brandId }, orderBy: { createdAt: 'desc' } })
}

export async function createCampaign(brandId: string, input: CreateOutreachCampaignInput) {
  // Get influencer emails
  const influencers = await prisma.influencer.findMany({
    where: { id: { in: input.influencerIds } },
    include: { user: { select: { email: true } } },
  })
  return prisma.outreachCampaign.create({
    data: {
      brandId, templateId: input.templateId, name: input.name,
      emails: {
        create: influencers.map((inf) => ({
          influencerId: inf.id, email: inf.user.email,
        })),
      },
    },
    include: { emails: true },
  })
}

export async function listCampaigns(brandId: string, page = 1, pageSize = 20) {
  const skip = (page - 1) * pageSize
  const [data, total] = await Promise.all([
    prisma.outreachCampaign.findMany({
      where: { brandId },
      include: { _count: { select: { emails: true } } },
      skip, take: pageSize, orderBy: { createdAt: 'desc' },
    }),
    prisma.outreachCampaign.count({ where: { brandId } }),
  ])
  const results = await Promise.all(data.map(async (c) => {
    const [sentCount, openedCount, repliedCount] = await Promise.all([
      prisma.outreachEmail.count({ where: { campaignId: c.id, status: { not: 'PENDING' } } }),
      prisma.outreachEmail.count({ where: { campaignId: c.id, openedAt: { not: null } } }),
      prisma.outreachEmail.count({ where: { campaignId: c.id, repliedAt: { not: null } } }),
    ])
    return {
      id: c.id, name: c.name, templateId: c.templateId, status: c.status,
      totalEmails: c._count.emails, sentCount, openedCount, repliedCount, createdAt: c.createdAt,
    }
  }))
  return { data: results, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
}

export async function getCampaign(campaignId: string, brandId: string) {
  const campaign = await prisma.outreachCampaign.findFirst({
    where: { id: campaignId, brandId },
    include: { emails: true },
  })
  if (!campaign) throw new Error('Campaign not found')
  return campaign
}

export async function sendCampaign(campaignId: string, brandId: string) {
  const campaign = await prisma.outreachCampaign.findFirst({ where: { id: campaignId, brandId } })
  if (!campaign) throw new Error('Campaign not found')
  return prisma.$transaction([
    prisma.outreachCampaign.update({ where: { id: campaignId }, data: { status: 'SENDING' } }),
    prisma.outreachEmail.updateMany({ where: { campaignId, status: 'PENDING' }, data: { status: 'SENT', sentAt: new Date() } }),
    prisma.outreachCampaign.update({ where: { id: campaignId }, data: { status: 'COMPLETED' } }),
  ])
}

export async function trackOpen(emailId: string) {
  return prisma.outreachEmail.update({ where: { id: emailId }, data: { openedAt: new Date() } })
}

export async function trackReply(emailId: string) {
  return prisma.outreachEmail.update({ where: { id: emailId }, data: { repliedAt: new Date() } })
}

export async function getOutreachStats(brandId: string) {
  const [totalCampaigns, totalSent, totalOpened, totalReplied] = await Promise.all([
    prisma.outreachCampaign.count({ where: { brandId } }),
    prisma.outreachEmail.count({ where: { campaign: { brandId }, status: { not: 'PENDING' } } }),
    prisma.outreachEmail.count({ where: { campaign: { brandId }, openedAt: { not: null } } }),
    prisma.outreachEmail.count({ where: { campaign: { brandId }, repliedAt: { not: null } } }),
  ])
  return {
    totalCampaigns, totalSent, totalOpened, totalReplied,
    openRate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
    replyRate: totalSent > 0 ? (totalReplied / totalSent) * 100 : 0,
  }
}
