import { api } from '@/lib/api-client'

export async function getConversations(params?: Record<string, string>) {
  const res = await api.get<any>('/messaging/conversations', params)
  if (res.error) throw new Error(res.error)
  return res.data
}

export async function getConversation(id: string) {
  const res = await api.get<any>(`/messaging/conversations/${id}`)
  if (res.error) throw new Error(res.error)
  return res.data
}

export async function getMessages(conversationId: string, params?: Record<string, string>) {
  const res = await api.get<any>(`/messaging/conversations/${conversationId}/messages`, params)
  if (res.error) throw new Error(res.error)
  return res.data
}

export async function sendMessage(conversationId: string, content: string, attachments?: any[]) {
  const res = await api.post<any>(`/messaging/conversations/${conversationId}/messages`, { content, attachments })
  if (res.error) throw new Error(res.error)
  return res.data
}

export async function startConversation(participantIds: string[], initialMessage: string, campaignId?: string) {
  const res = await api.post<any>('/messaging/conversations', { participantIds, initialMessage, campaignId })
  if (res.error) throw new Error(res.error)
  return res.data
}

export async function markAsRead(conversationId: string) {
  const res = await api.post<any>(`/messaging/conversations/${conversationId}/read`)
  if (res.error) throw new Error(res.error)
  return res.data
}
