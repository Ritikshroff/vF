import { api } from '@/lib/api-client'

export async function findMatches(data: { campaignId?: string; filters?: any; limit?: number }) {
  const res = await api.post<any>('/ai/match', data)
  if (res.error) throw new Error(res.error)
  return res.data
}

export async function getContentSuggestions(data: { campaignId: string; influencerId?: string; platform?: string }) {
  const res = await api.post<any>('/ai/content-suggestions', data)
  if (res.error) throw new Error(res.error)
  return res.data
}

export async function getPricingRecommendation(influencerId: string) {
  const res = await api.get<any>(`/ai/pricing/${influencerId}`)
  if (res.error) throw new Error(res.error)
  return res.data
}

export async function getFraudDetection(influencerId: string) {
  const res = await api.get<any>(`/ai/fraud-detection/${influencerId}`)
  if (res.error) throw new Error(res.error)
  return res.data
}
