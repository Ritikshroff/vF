import { api } from '@/lib/api-client'

export async function getFeed(params?: Record<string, string>) {
  const res = await api.get<any>('/feed', params)
  if (res.error) throw new Error(res.error)
  return res.data
}

export async function createPost(data: { type: string; content: string; visibility?: string; hashtags?: string[]; mentions?: string[]; mediaUrls?: string[] }) {
  const res = await api.post<any>('/feed', data)
  if (res.error) throw new Error(res.error)
  return res.data
}

export async function toggleLike(postId: string) {
  const res = await api.post<{ liked: boolean }>(`/feed/${postId}/like`)
  if (res.error) throw new Error(res.error)
  return res.data
}

export async function getComments(postId: string, params?: Record<string, string>) {
  const res = await api.get<any>(`/feed/${postId}/comments`, params)
  if (res.error) throw new Error(res.error)
  return res.data
}

export async function addComment(postId: string, content: string, parentId?: string) {
  const res = await api.post<any>(`/feed/${postId}/comments`, { content, parentId })
  if (res.error) throw new Error(res.error)
  return res.data
}

export async function sharePost(postId: string) {
  const res = await api.post<any>(`/feed/${postId}/share`)
  if (res.error) throw new Error(res.error)
  return res.data
}
