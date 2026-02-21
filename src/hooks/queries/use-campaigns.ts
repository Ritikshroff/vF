import { useQuery } from '@tanstack/react-query'
import { fetchBrandCampaigns, fetchCampaignById, fetchInfluencerCampaigns } from '@/services/api/campaigns'

export const campaignKeys = {
  all: ['campaigns'] as const,
  brand: (params?: Record<string, string>) => [...campaignKeys.all, 'brand', params] as const,
  detail: (id: string) => [...campaignKeys.all, id] as const,
  influencer: () => [...campaignKeys.all, 'influencer'] as const,
}

export function useBrandCampaigns(params?: Record<string, string>) {
  return useQuery({
    queryKey: campaignKeys.brand(params),
    queryFn: () => fetchBrandCampaigns(params),
  })
}

export function useCampaignDetail(id: string) {
  return useQuery({
    queryKey: campaignKeys.detail(id),
    queryFn: () => fetchCampaignById(id),
    enabled: !!id,
  })
}

export function useInfluencerCampaigns() {
  return useQuery({
    queryKey: campaignKeys.influencer(),
    queryFn: fetchInfluencerCampaigns,
  })
}
