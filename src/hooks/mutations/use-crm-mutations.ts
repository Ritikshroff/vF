import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createContact, updateContact, deleteContact } from '@/services/api/crm'
import { toast } from 'sonner'
import { crmKeys } from '../queries/use-crm'

export function useCreateContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { influencerId: string; status?: string; customLabels?: string[]; internalNotes?: string; source?: string }) =>
      createContact(data),
    onSuccess: () => {
      toast.success('Contact added')
      queryClient.invalidateQueries({ queryKey: crmKeys.all })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add contact')
    },
  })
}

export function useUpdateContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateContact(id, data),
    onSuccess: () => {
      toast.success('Contact updated')
      queryClient.invalidateQueries({ queryKey: crmKeys.all })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update contact')
    },
  })
}

export function useDeleteContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteContact(id),
    onSuccess: () => {
      toast.success('Contact removed')
      queryClient.invalidateQueries({ queryKey: crmKeys.all })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove contact')
    },
  })
}
