import { api } from '@/lib/api-client'

export async function getCampaignAnalytics(campaignId: string) {
  const res = await api.get<any>(`/analytics/campaign/${campaignId}`)
  if (res.error) throw new Error(res.error)
  return res.data
}

export async function getInfluencerAnalytics(influencerId: string) {
  const res = await api.get<any>(`/analytics/influencer/${influencerId}`)
  if (res.error) throw new Error(res.error)
  return res.data
}

export async function getBrandAnalytics() {
  const res = await api.get<any>('/analytics/brand')
  if (res.error) throw new Error(res.error)
  return res.data
}
