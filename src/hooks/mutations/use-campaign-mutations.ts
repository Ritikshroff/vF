import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createCampaign, updateCampaign } from '@/services/api/campaigns'
import { toast } from 'sonner'
import { campaignKeys } from '../queries/use-campaigns'

export function useCreateCampaign() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => createCampaign(data),
    onSuccess: () => {
      toast.success('Campaign created')
      queryClient.invalidateQueries({ queryKey: campaignKeys.all })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create campaign')
    },
  })
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateCampaign(id, data),
    onSuccess: () => {
      toast.success('Campaign updated')
      queryClient.invalidateQueries({ queryKey: campaignKeys.all })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update campaign')
    },
  })
}
