import { useQuery } from '@tanstack/react-query'
import { getCampaignAnalytics, getInfluencerAnalytics } from '@/services/api/analytics'

export const analyticsKeys = {
  all: ['analytics'] as const,
  campaign: (campaignId: string) => [...analyticsKeys.all, 'campaign', campaignId] as const,
  influencer: (influencerId: string) => [...analyticsKeys.all, 'influencer', influencerId] as const,
}

export function useCampaignAnalytics(campaignId: string) {
  return useQuery({
    queryKey: analyticsKeys.campaign(campaignId),
    queryFn: () => getCampaignAnalytics(campaignId),
    enabled: !!campaignId,
  })
}

export function useInfluencerAnalytics(influencerId: string) {
  return useQuery({
    queryKey: analyticsKeys.influencer(influencerId),
    queryFn: () => getInfluencerAnalytics(influencerId),
    enabled: !!influencerId,
  })
}
