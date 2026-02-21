import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createCollaboration, transitionCollaboration } from '@/services/api/collaborations'
import { toast } from 'sonner'
import { collabKeys } from '../queries/use-collaborations'

export function useCreateCollaboration() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => createCollaboration(data),
    onSuccess: () => {
      toast.success('Collaboration created')
      queryClient.invalidateQueries({ queryKey: collabKeys.all })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create collaboration')
    },
  })
}

export function useTransitionCollaboration() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: string }) =>
      transitionCollaboration(id, action),
    onSuccess: () => {
      toast.success('Status updated')
      queryClient.invalidateQueries({ queryKey: collabKeys.all })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update status')
    },
  })
}
