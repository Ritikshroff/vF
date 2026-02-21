import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createPost, toggleLike, addComment, sharePost } from '@/services/api/feed'
import { toast } from 'sonner'
import { feedKeys } from '../queries/use-feed'

export function useCreatePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { type: string; content: string; visibility?: string; hashtags?: string[]; mentions?: string[]; mediaUrls?: string[] }) =>
      createPost(data),
    onSuccess: () => {
      toast.success('Post published')
      queryClient.invalidateQueries({ queryKey: feedKeys.all })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to publish post')
    },
  })
}

export function useToggleLike() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (postId: string) => toggleLike(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedKeys.all })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Action failed')
    },
  })
}

export function useAddComment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ postId, content, parentId }: { postId: string; content: string; parentId?: string }) =>
      addComment(postId, content, parentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: feedKeys.comments(variables.postId) })
      queryClient.invalidateQueries({ queryKey: feedKeys.all })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add comment')
    },
  })
}

export function useSharePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (postId: string) => sharePost(postId),
    onSuccess: () => {
      toast.success('Post shared')
      queryClient.invalidateQueries({ queryKey: feedKeys.all })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to share post')
    },
  })
}
