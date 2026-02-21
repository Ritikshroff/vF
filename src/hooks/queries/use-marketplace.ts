import { useQuery } from '@tanstack/react-query'
import { getListings, getListingById, getMyApplications, getListingApplications } from '@/services/api/marketplace'

export const marketplaceKeys = {
  all: ['marketplace'] as const,
  listings: (params?: Record<string, string>) => [...marketplaceKeys.all, 'listings', params] as const,
  detail: (id: string) => [...marketplaceKeys.all, id] as const,
  myApplications: (params?: Record<string, string>) => [...marketplaceKeys.all, 'my-applications', params] as const,
  listingApplications: (id: string, params?: Record<string, string>) => [...marketplaceKeys.all, id, 'applications', params] as const,
}

export function useListings(params?: Record<string, string>) {
  return useQuery({
    queryKey: marketplaceKeys.listings(params),
    queryFn: () => getListings(params),
  })
}

export function useListingDetail(id: string) {
  return useQuery({
    queryKey: marketplaceKeys.detail(id),
    queryFn: () => getListingById(id),
    enabled: !!id,
  })
}

export function useMyApplications(params?: Record<string, string>) {
  return useQuery({
    queryKey: marketplaceKeys.myApplications(params),
    queryFn: () => getMyApplications(params),
  })
}

export function useListingApplications(listingId: string, params?: Record<string, string>) {
  return useQuery({
    queryKey: marketplaceKeys.listingApplications(listingId, params),
    queryFn: () => getListingApplications(listingId, params),
    enabled: !!listingId,
  })
}
