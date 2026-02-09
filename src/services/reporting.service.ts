import { prisma } from '@/lib/db/prisma'
import { Prisma } from '@prisma/client'
import { CreateReportTemplateInput, GenerateReportInput, ScheduleReportInput } from '@/types/reporting'

export async function createTemplate(brandId: string, input: CreateReportTemplateInput) {
  return prisma.reportTemplate.create({
    data: { brandId, name: input.name, sections: input.sections, format: input.format || 'PDF' },
  })
}

export async function listTemplates(brandId: string) {
  return prisma.reportTemplate.findMany({ where: { brandId }, orderBy: { createdAt: 'desc' } })
}

export async function generateReport(brandId: string, input: GenerateReportInput) {
  // Generate report data (aggregated from campaigns/collaborations)
  const reportData: Record<string, unknown> = { generatedAt: new Date().toISOString(), brandId }
  if (input.campaignId) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: input.campaignId },
      include: { _count: { select: { applications: true, contents: true } } },
    })
    reportData.campaign = campaign
  }
  return prisma.generatedReport.create({
    data: {
      brandId, templateId: input.templateId, campaignId: input.campaignId,
      reportType: input.reportType, dateRange: input.dateRange as any, data: reportData as any,
    },
  })
}

export async function listReports(brandId: string, page = 1, pageSize = 20) {
  const skip = (page - 1) * pageSize
  const [data, total] = await Promise.all([
    prisma.generatedReport.findMany({ where: { brandId }, skip, take: pageSize, orderBy: { generatedAt: 'desc' } }),
    prisma.generatedReport.count({ where: { brandId } }),
  ])
  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
}

export async function getReport(reportId: string, brandId: string) {
  const report = await prisma.generatedReport.findFirst({ where: { id: reportId, brandId } })
  if (!report) throw new Error('Report not found')
  return report
}

export async function scheduleReport(brandId: string, input: ScheduleReportInput) {
  const nextRunAt = new Date()
  if (input.frequency === 'DAILY') nextRunAt.setDate(nextRunAt.getDate() + 1)
  else if (input.frequency === 'WEEKLY') nextRunAt.setDate(nextRunAt.getDate() + 7)
  else nextRunAt.setMonth(nextRunAt.getMonth() + 1)
  return prisma.scheduledReport.create({
    data: { brandId, templateId: input.templateId, frequency: input.frequency, recipients: input.recipients, nextRunAt },
  })
}

export async function listScheduledReports(brandId: string) {
  return prisma.scheduledReport.findMany({ where: { brandId }, orderBy: { createdAt: 'desc' } })
}

export async function toggleScheduledReport(reportId: string, brandId: string) {
  const report = await prisma.scheduledReport.findFirst({ where: { id: reportId, brandId } })
  if (!report) throw new Error('Scheduled report not found')
  return prisma.scheduledReport.update({ where: { id: reportId }, data: { isActive: !report.isActive } })
}
