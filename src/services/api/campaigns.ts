import { api } from '@/lib/api-client'

export async function fetchBrandCampaigns(params?: Record<string, string>) {
  const res = await api.get<any>('/marketplace/listings', { myListings: 'true', ...params })
  if (res.error) throw new Error(res.error)
  return res.data?.data ?? []
}

export async function fetchCampaignById(id: string) {
  const res = await api.get<any>(`/marketplace/listings/${id}`)
  if (res.error) throw new Error(res.error)
  return res.data
}

export async function createCampaign(data: any) {
  const res = await api.post<any>('/marketplace/listings', data)
  if (res.error) throw new Error(res.error)
  return res.data
}

export async function updateCampaign(id: string, data: any) {
  const res = await api.put<any>(`/marketplace/listings/${id}`, data)
  if (res.error) throw new Error(res.error)
  return res.data
}

export async function fetchInfluencerCampaigns() {
  const res = await api.get<{ data: any[]; total: number }>('/collaborations')
  if (res.error) throw new Error(res.error)
  return res.data?.data ?? []
}
