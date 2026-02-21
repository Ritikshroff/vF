import { useMutation, useQueryClient } from '@tanstack/react-query'
import { applyToListing } from '@/services/api/marketplace'
import { toast } from 'sonner'
import { marketplaceKeys } from '../queries/use-marketplace'

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
