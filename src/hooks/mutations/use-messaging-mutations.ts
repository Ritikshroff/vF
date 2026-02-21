import { useMutation, useQueryClient } from '@tanstack/react-query'
import { sendMessage, startConversation, markAsRead } from '@/services/api/messaging'
import { toast } from 'sonner'
import { messagingKeys } from '../queries/use-messaging'

export function useSendMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ conversationId, content, attachments }: { conversationId: string; content: string; attachments?: any[] }) =>
      sendMessage(conversationId, content, attachments),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: messagingKeys.messages(variables.conversationId) })
      queryClient.invalidateQueries({ queryKey: messagingKeys.conversations() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send message')
    },
  })
}

export function useStartConversation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ participantIds, initialMessage, campaignId }: { participantIds: string[]; initialMessage: string; campaignId?: string }) =>
      startConversation(participantIds, initialMessage, campaignId),
    onSuccess: () => {
      toast.success('Conversation started')
      queryClient.invalidateQueries({ queryKey: messagingKeys.conversations() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to start conversation')
    },
  })
}

export function useMarkAsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (conversationId: string) => markAsRead(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messagingKeys.conversations() })
    },
  })
}
