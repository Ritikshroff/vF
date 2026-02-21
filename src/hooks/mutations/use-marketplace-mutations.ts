import { useMutation, useQueryClient } from '@tanstack/react-query'
import { applyToListing, reviewApplication } from '@/services/api/marketplace'
import { toast } from 'sonner'
import { marketplaceKeys } from '../queries/use-marketplace'
import { collabKeys } from '../queries/use-collaborations'

export function useApplyToListing() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ listingId, data }: { listingId: string; data: { coverLetter?: string; proposedRate?: number; portfolio?: string[]; availability?: string } }) =>
      applyToListing(listingId, data),
    onSuccess: () => {
      toast.success('Application submitted')
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.all })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit application')
    },
  })
}

export function useReviewApplication() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ applicationId, data }: { applicationId: string; data: { status: string; reviewNotes?: string } }) =>
      reviewApplication(applicationId, data),
    onSuccess: (_data, variables) => {
      const action = variables.data.status === 'ACCEPTED' ? 'accepted' : 'rejected'
      toast.success(`Application ${action}`)
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.all })
      queryClient.invalidateQueries({ queryKey: collabKeys.all })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to review application')
    },
  })
}
