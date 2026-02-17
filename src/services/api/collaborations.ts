import { api } from '@/lib/api-client'

export async function getCollaborations(params?: Record<string, string>) {
  const res = await api.get<any>('/collaborations', params)
  if (res.error) throw new Error(res.error)
  return res.data
}

export async function getCollaborationById(id: string) {
  const res = await api.get<any>(`/collaborations/${id}`)
  if (res.error) throw new Error(res.error)
  return res.data
}

export async function createCollaboration(data: any) {
  const res = await api.post<any>('/collaborations', data)
  if (res.error) throw new Error(res.error)
  return res.data
}

export async function transitionCollaboration(id: string, action: string) {
  const res = await api.post<any>(`/collaborations/${id}/transition`, { action })
  if (res.error) throw new Error(res.error)
  return res.data
}
