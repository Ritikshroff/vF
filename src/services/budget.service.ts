import { prisma } from '@/lib/db/prisma'
import { Prisma } from '@prisma/client'
import { CreateBudgetPlanInput, CalculateROIInput, IndustryBenchmark } from '@/types/budget'

export async function createBudgetPlan(brandId: string, input: CreateBudgetPlanInput) {
  return prisma.budgetPlan.create({
    data: {
      brandId, campaignId: input.campaignId, name: input.name,
      totalBudget: new Prisma.Decimal(input.totalBudget), allocations: input.allocations,
    },
  })
}

export async function listBudgetPlans(brandId: string) {
  const plans = await prisma.budgetPlan.findMany({ where: { brandId }, orderBy: { createdAt: 'desc' } })
  return plans.map((p) => ({
    id: p.id, name: p.name, campaignId: p.campaignId,
    totalBudget: Number(p.totalBudget), allocations: p.allocations, createdAt: p.createdAt,
  }))
}

export async function getBudgetPlan(planId: string, brandId: string) {
  const plan = await prisma.budgetPlan.findFirst({ where: { id: planId, brandId } })
  if (!plan) throw new Error('Budget plan not found')
  return { ...plan, totalBudget: Number(plan.totalBudget) }
}

export async function calculateROI(brandId: string, input: CalculateROIInput) {
  const estimatedROI = input.estimatedConversions > 0 ? ((input.estimatedConversions * 50 - input.budget) / input.budget) * 100 : 0
  return prisma.rOIProjection.create({
    data: {
      brandId, campaignId: input.campaignId,
      budget: new Prisma.Decimal(input.budget),
      estimatedReach: input.estimatedReach, estimatedEngagement: input.estimatedEngagement,
      estimatedConversions: input.estimatedConversions,
      estimatedROI: new Prisma.Decimal(estimatedROI), assumptions: input.assumptions,
    },
  })
}

export async function listROIProjections(brandId: string) {
  const projections = await prisma.rOIProjection.findMany({ where: { brandId }, orderBy: { createdAt: 'desc' } })
  return projections.map((p) => ({
    id: p.id, budget: Number(p.budget), estimatedReach: p.estimatedReach,
    estimatedEngagement: p.estimatedEngagement, estimatedConversions: p.estimatedConversions,
    estimatedROI: Number(p.estimatedROI), assumptions: p.assumptions, createdAt: p.createdAt,
  }))
}

export async function getIndustryBenchmarks(niche?: string): Promise<IndustryBenchmark[]> {
  const benchmarks: IndustryBenchmark[] = [
    { niche: 'Fashion', avgCPE: 0.15, avgCPM: 8.50, avgROI: 5.2, avgEngagementRate: 3.8 },
    { niche: 'Beauty', avgCPE: 0.12, avgCPM: 7.80, avgROI: 6.1, avgEngagementRate: 4.2 },
    { niche: 'Tech', avgCPE: 0.25, avgCPM: 12.00, avgROI: 4.5, avgEngagementRate: 2.8 },
    { niche: 'Fitness', avgCPE: 0.18, avgCPM: 9.20, avgROI: 5.8, avgEngagementRate: 4.0 },
    { niche: 'Food', avgCPE: 0.10, avgCPM: 6.50, avgROI: 4.8, avgEngagementRate: 5.1 },
    { niche: 'Travel', avgCPE: 0.20, avgCPM: 10.50, avgROI: 3.9, avgEngagementRate: 3.5 },
    { niche: 'Gaming', avgCPE: 0.22, avgCPM: 11.00, avgROI: 4.2, avgEngagementRate: 3.2 },
    { niche: 'Lifestyle', avgCPE: 0.14, avgCPM: 8.00, avgROI: 5.0, avgEngagementRate: 3.6 },
  ]
  if (niche) return benchmarks.filter((b) => b.niche.toLowerCase() === niche.toLowerCase())
  return benchmarks
}
