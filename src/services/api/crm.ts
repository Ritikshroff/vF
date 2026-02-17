import { api } from '@/lib/api-client'

export async function getCRMContacts(params?: Record<string, string>) {
  const res = await api.get<any>('/crm/contacts', params)
  if (res.error) throw new Error(res.error)
  return res.data
}

export async function getCRMDashboard() {
  const res = await api.get<any>('/crm/dashboard')
  if (res.error) throw new Error(res.error)
  return res.data
}

export async function createContact(data: { influencerId: string; status?: string; customLabels?: string[]; internalNotes?: string; source?: string }) {
  const res = await api.post<any>('/crm/contacts', data)
  if (res.error) throw new Error(res.error)
  return res.data
}

export async function updateContact(id: string, data: any) {
  const res = await api.put<any>(`/crm/contacts/${id}`, data)
  if (res.error) throw new Error(res.error)
  return res.data
}

export async function deleteContact(id: string) {
  const res = await api.delete<any>(`/crm/contacts/${id}`)
  if (res.error) throw new Error(res.error)
  return res.data
}

export async function getContactById(id: string) {
  const res = await api.get<any>(`/crm/contacts/${id}`)
  if (res.error) throw new Error(res.error)
  return res.data
}
