import { prisma } from '@/lib/db/prisma'
import { Prisma } from '@prisma/client'
import { SendMessageInput, ConversationFilters } from '@/types/messaging'

// ==================== Conversation Operations ====================

/**
 * List conversations for a user with last message and unread count
 */
export async function listConversations(userId: string, filters: ConversationFilters) {
  const { search, page = 1, pageSize = 20 } = filters
  const skip = (page - 1) * pageSize

  const where: Prisma.ConversationParticipantWhereInput = {
    userId,
    leftAt: null,
  }

  // If search is provided, filter by campaign title or participant name
  if (search) {
    where.conversation = {
      OR: [
        { campaignTitle: { contains: search, mode: 'insensitive' } },
        {
          participants: {
            some: {
              user: { name: { contains: search, mode: 'insensitive' } },
              userId: { not: userId },
            },
          },
        },
      ],
    }
  }

  const [participantRecords, total] = await Promise.all([
    prisma.conversationParticipant.findMany({
      where,
      include: {
        conversation: {
          include: {
            participants: {
              include: {
                user: {
                  select: { id: true, name: true, avatar: true, role: true },
                },
              },
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              select: {
                content: true,
                senderId: true,
                createdAt: true,
              },
            },
          },
        },
      },
      skip,
      take: pageSize,
      orderBy: { conversation: { lastMessageAt: 'desc' } },
    }),
    prisma.conversationParticipant.count({ where }),
  ])

  const data = participantRecords.map((cp) => {
    const conv = cp.conversation
    const lastMessage = conv.messages[0] || null

    return {
      id: conv.id,
      participants: conv.participants
        .filter((p) => p.userId !== userId)
        .map((p) => ({
          id: p.user.id,
          name: p.user.name,
          avatar: p.user.avatar,
          role: p.user.role,
        })),
      lastMessage: lastMessage
        ? {
            content: lastMessage.content,
            senderId: lastMessage.senderId,
            createdAt: lastMessage.createdAt,
          }
        : null,
      unreadCount: cp.unreadCount,
      campaignTitle: conv.campaignTitle,
      updatedAt: conv.updatedAt,
    }
  })

  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
}

/**
 * Get messages for a conversation, mark as read
 */
export async function getConversationMessages(
  conversationId: string,
  userId: string,
  page = 1,
  pageSize = 50
) {
  const skip = (page - 1) * pageSize

  // Verify user is a participant
  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  })

  if (!participant) {
    throw new Error('Not a participant of this conversation')
  }

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true },
        },
        attachments: {
          select: { id: true, type: true, url: true, filename: true, size: true },
        },
        reactions: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
      },
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.message.count({ where: { conversationId } }),
  ])

  // Mark messages as read
  await markAsRead(conversationId, userId)

  const data = messages.map((msg) => ({
    id: msg.id,
    conversationId: msg.conversationId,
    senderId: msg.senderId,
    sender: msg.sender,
    content: msg.content,
    status: msg.status,
    readAt: msg.readAt,
    attachments: msg.attachments,
    reactions: msg.reactions.map((r) => ({
      emoji: r.emoji,
      userId: r.user.id,
      userName: r.user.name,
    })),
    createdAt: msg.createdAt,
  }))

  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
}

/**
 * Send a message in a conversation
 */
export async function sendMessage(
  conversationId: string,
  userId: string,
  input: SendMessageInput
) {
  // Verify user is a participant
  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  })

  if (!participant) {
    throw new Error('Not a participant of this conversation')
  }

  const result = await prisma.$transaction(async (tx) => {
    // Create the message
    const message = await tx.message.create({
      data: {
        conversationId,
        senderId: userId,
        content: input.content,
        status: 'SENT',
        attachments: input.attachments
          ? {
              create: input.attachments.map((a) => ({
                type: a.type,
                url: a.url,
                filename: a.filename,
                size: a.size,
              })),
            }
          : undefined,
      },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true },
        },
        attachments: {
          select: { id: true, type: true, url: true, filename: true, size: true },
        },
      },
    })

    // Update conversation lastMessageAt
    await tx.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    })

    // Increment unread count for other participants
    await tx.conversationParticipant.updateMany({
      where: {
        conversationId,
        userId: { not: userId },
        leftAt: null,
      },
      data: { unreadCount: { increment: 1 } },
    })

    return message
  })

  return {
    id: result.id,
    conversationId: result.conversationId,
    senderId: result.senderId,
    sender: result.sender,
    content: result.content,
    status: result.status,
    readAt: result.readAt,
    attachments: result.attachments,
    reactions: [],
    createdAt: result.createdAt,
  }
}

/**
 * Start a new conversation
 */
export async function startConversation(
  userId: string,
  participantIds: string[],
  initialMessage: string,
  campaignId?: string
) {
  // Ensure the creator is included in participants
  const allParticipantIds = Array.from(new Set([userId, ...participantIds]))

  // Look up campaign title if provided
  let campaignTitle: string | null = null
  if (campaignId) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { title: true },
    })
    campaignTitle = campaign?.title || null
  }

  const conversation = await prisma.$transaction(async (tx) => {
    // Create conversation
    const conv = await tx.conversation.create({
      data: {
        campaignId,
        campaignTitle,
        lastMessageAt: new Date(),
        participants: {
          create: allParticipantIds.map((pid) => ({
            userId: pid,
            unreadCount: pid === userId ? 0 : 1,
          })),
        },
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, name: true, avatar: true, role: true } },
          },
        },
      },
    })

    // Create initial message
    await tx.message.create({
      data: {
        conversationId: conv.id,
        senderId: userId,
        content: initialMessage,
        status: 'SENT',
      },
    })

    return conv
  })

  return {
    id: conversation.id,
    participants: conversation.participants
      .filter((p) => p.userId !== userId)
      .map((p) => ({
        id: p.user.id,
        name: p.user.name,
        avatar: p.user.avatar,
        role: p.user.role,
      })),
    lastMessage: {
      content: initialMessage,
      senderId: userId,
      createdAt: new Date(),
    },
    unreadCount: 0,
    campaignTitle,
    updatedAt: conversation.updatedAt,
  }
}

/**
 * Mark conversation as read for a user
 */
export async function markAsRead(conversationId: string, userId: string) {
  await prisma.$transaction([
    prisma.conversationParticipant.update({
      where: { conversationId_userId: { conversationId, userId } },
      data: { unreadCount: 0, lastReadAt: new Date() },
    }),
    prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        status: { not: 'READ' },
      },
      data: { status: 'READ', readAt: new Date() },
    }),
  ])

  return { success: true }
}

/**
 * Add a reaction to a message
 */
export async function addReaction(messageId: string, userId: string, emoji: string) {
  const reaction = await prisma.messageReaction.create({
    data: {
      messageId,
      userId,
      emoji,
    },
    include: {
      user: { select: { id: true, name: true } },
    },
  })

  return {
    emoji: reaction.emoji,
    userId: reaction.user.id,
    userName: reaction.user.name,
  }
}

/**
 * Remove a reaction from a message
 */
export async function removeReaction(messageId: string, userId: string, emoji: string) {
  await prisma.messageReaction.delete({
    where: { messageId_userId_emoji: { messageId, userId, emoji } },
  })

  return { success: true }
}
