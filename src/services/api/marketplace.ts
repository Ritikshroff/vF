import { api } from '@/lib/api-client'

export async function getListings(params?: Record<string, string>) {
  const res = await api.get<any>('/marketplace/listings', params)
  if (res.error) throw new Error(res.error)
  return res.data
}

export async function getListingById(id: string) {
  const res = await api.get<any>(`/marketplace/listings/${id}`)
  if (res.error) throw new Error(res.error)
  return res.data
}

export async function applyToListing(listingId: string, data: { coverLetter?: string; proposedRate?: number; portfolio?: string[]; availability?: string }) {
  const res = await api.post<any>(`/marketplace/listings/${listingId}/applications`, data)
  if (res.error) throw new Error(res.error)
  return res.data
}

export async function getMyApplications(params?: Record<string, string>) {
  const res = await api.get<any>('/marketplace/my-applications', params)
  if (res.error) throw new Error(res.error)
  return res.data
}

export async function getListingApplications(listingId: string, params?: Record<string, string>) {
  const res = await api.get<any>(`/marketplace/listings/${listingId}/applications`, params)
  if (res.error) throw new Error(res.error)
  return res.data
}
