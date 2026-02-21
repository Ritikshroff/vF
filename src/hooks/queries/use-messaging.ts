import { useQuery } from '@tanstack/react-query'
import { getConversations, getConversation, getMessages } from '@/services/api/messaging'

export const messagingKeys = {
  all: ['messaging'] as const,
  conversations: (params?: Record<string, string>) => [...messagingKeys.all, 'conversations', params] as const,
  conversation: (id: string) => [...messagingKeys.all, 'conversation', id] as const,
  messages: (conversationId: string, params?: Record<string, string>) => [...messagingKeys.all, conversationId, 'messages', params] as const,
}

export function useConversations(params?: Record<string, string>) {
  return useQuery({
    queryKey: messagingKeys.conversations(params),
    queryFn: () => getConversations(params),
  })
}

export function useConversation(id: string) {
  return useQuery({
    queryKey: messagingKeys.conversation(id),
    queryFn: () => getConversation(id),
    enabled: !!id,
  })
}

export function useMessages(conversationId: string, params?: Record<string, string>) {
  return useQuery({
    queryKey: messagingKeys.messages(conversationId, params),
    queryFn: () => getMessages(conversationId, params),
    enabled: !!conversationId,
  })
}
