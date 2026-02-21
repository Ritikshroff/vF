import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'

export const discoveryKeys = {
  all: ['discovery'] as const,
  search: (params?: Record<string, string>) => [...discoveryKeys.all, 'search', params] as const,
  profile: (id: string) => [...discoveryKeys.all, 'profile', id] as const,
  similar: (id: string) => [...discoveryKeys.all, 'similar', id] as const,
}

async function searchInfluencers(params?: Record<string, string>) {
  const res = await api.get<any>('/discovery/search', params)
  if (res.error) throw new Error(res.error)
  return res.data
}

async function getInfluencerProfile(id: string) {
  const res = await api.get<any>(`/discovery/influencers/${id}`)
  if (res.error) throw new Error(res.error)
  return res.data
}

async function getSimilarInfluencers(id: string) {
  const res = await api.get<any>(`/discovery/similar/${id}`)
  if (res.error) throw new Error(res.error)
  return res.data
}

export function useDiscoverySearch(params?: Record<string, string>) {
  return useQuery({
    queryKey: discoveryKeys.search(params),
    queryFn: () => searchInfluencers(params),
    enabled: params !== undefined,
  })
}

export function useInfluencerProfile(id: string) {
  return useQuery({
    queryKey: discoveryKeys.profile(id),
    queryFn: () => getInfluencerProfile(id),
    enabled: !!id,
  })
}

export function useSimilarInfluencers(id: string) {
  return useQuery({
    queryKey: discoveryKeys.similar(id),
    queryFn: () => getSimilarInfluencers(id),
    enabled: !!id,
  })
}
