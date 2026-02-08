export interface SendMessageInput {
  content: string
  attachments?: { type: string; url: string; filename: string; size: number }[]
}

export interface ConversationListItem {
  id: string
  participants: { id: string; name: string; avatar: string | null; role: string }[]
  lastMessage: { content: string; senderId: string; createdAt: Date } | null
  unreadCount: number
  campaignTitle: string | null
  updatedAt: Date
}

export interface MessageDetail {
  id: string
  conversationId: string
  senderId: string
  sender: { id: string; name: string; avatar: string | null }
  content: string
  status: string
  readAt: Date | null
  attachments: { id: string; type: string; url: string; filename: string; size: number }[]
  reactions: { emoji: string; userId: string; userName: string }[]
  createdAt: Date
}

export interface ConversationFilters {
  search?: string
  page?: number
  pageSize?: number
}
