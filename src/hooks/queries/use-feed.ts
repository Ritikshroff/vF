import { useQuery } from '@tanstack/react-query'
import { getFeed, getComments } from '@/services/api/feed'

export const feedKeys = {
  all: ['feed'] as const,
  list: (params?: Record<string, string>) => [...feedKeys.all, 'list', params] as const,
  comments: (postId: string, params?: Record<string, string>) => [...feedKeys.all, postId, 'comments', params] as const,
}

export function useFeed(params?: Record<string, string>) {
  return useQuery({
    queryKey: feedKeys.list(params),
    queryFn: () => getFeed(params),
  })
}

export function useComments(postId: string, params?: Record<string, string>) {
  return useQuery({
    queryKey: feedKeys.comments(postId, params),
    queryFn: () => getComments(postId, params),
    enabled: !!postId,
  })
}
