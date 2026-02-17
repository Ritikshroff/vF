'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Send,
  Paperclip,
  MoreVertical,
  ArrowLeft,
  CheckCheck,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'
import { formatRelativeTime, getInitials } from '@/lib/utils'
import { staggerContainer, staggerItem } from '@/lib/animations'
import { getConversations, getMessages, sendMessage, markAsRead } from '@/services/api/messaging'

export default function BrandMessagesPage() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<any[]>([])
  const [activeConversation, setActiveConversation] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showMobileList, setShowMobileList] = useState(true)
  const [loading, setLoading] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadConversations = async () => {
    try {
      setLoading(true)
      const data = await getConversations()
      const convs = Array.isArray(data) ? data : data?.data ?? []
      setConversations(convs)
      if (convs.length > 0 && !activeConversation) {
        selectConversation(convs[0])
      }
    } catch (err) {
      console.error('Failed to load conversations:', err)
    } finally {
      setLoading(false)
    }
  }

  const selectConversation = async (conversation: any) => {
    setActiveConversation(conversation)
    setShowMobileList(false)
    setLoadingMessages(true)
    try {
      const data = await getMessages(conversation.id)
      const msgs = Array.isArray(data) ? data : data?.data ?? []
      setMessages(msgs)
      await markAsRead(conversation.id).catch(() => {})
    } catch (err) {
      console.error('Failed to load messages:', err)
    } finally {
      setLoadingMessages(false)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation || sending) return
    setSending(true)
    try {
      const sent = await sendMessage(activeConversation.id, newMessage)
      setMessages(prev => [...prev, sent])
      setNewMessage('')
      setConversations(prev => prev.map(c =>
        c.id === activeConversation.id
          ? { ...c, lastMessage: { content: newMessage, senderId: user?.id, createdAt: new Date().toISOString() } }
          : c
      ))
    } catch (err) {
      console.error('Failed to send message:', err)
    } finally {
      setSending(false)
    }
  }

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true
    const participantNames = (conv.participants || []).map((p: any) => p.name || '').join(' ')
    return participantNames.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (conv.campaignTitle || '').toLowerCase().includes(searchQuery.toLowerCase())
  })

  const getConversationName = (conv: any) => {
    return (conv.participants || []).map((p: any) => p.name).join(', ') || 'Conversation'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--muted))]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[rgb(var(--background))] to-[rgb(var(--surface))]">
      <div className="container py-4 md:py-8">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="h-[calc(100vh-8rem)] md:h-[calc(100vh-12rem)]"
        >
          {/* Header - Mobile Only */}
          <motion.div variants={staggerItem} className="mb-4 md:hidden">
            <h1 className="text-xl sm:text-2xl font-bold gradient-text">Messages</h1>
          </motion.div>

          {/* Desktop Header */}
          <motion.div variants={staggerItem} className="hidden md:block mb-4 lg:mb-6">
            <h1 className="text-3xl lg:text-5xl font-bold mb-2 gradient-text">Messages</h1>
            <p className="text-base lg:text-lg text-[rgb(var(--muted))]">
              Chat with influencers about your campaigns
            </p>
          </motion.div>

          {/* Messages Container */}
          <motion.div variants={staggerItem} className="h-full">
            <Card className="h-full border-2">
              <CardContent className="p-0 h-full flex">
                {/* Conversations List */}
                <div
                  className={`${
                    showMobileList ? 'flex' : 'hidden'
                  } md:flex flex-col w-full md:w-80 lg:w-96 border-r border-[rgb(var(--border))]`}
                >
                  {/* Search */}
                  <div className="p-4 border-b border-[rgb(var(--border))]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--muted))]" />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search conversations..."
                        className="pl-10 h-10"
                      />
                    </div>
                  </div>

                  {/* Conversations */}
                  <div className="flex-1 overflow-y-auto">
                    {filteredConversations.length === 0 ? (
                      <div className="text-center py-8 text-sm text-[rgb(var(--muted))]">No conversations yet.</div>
                    ) : (
                      filteredConversations.map((conversation) => (
                        <button
                          key={conversation.id}
                          onClick={() => selectConversation(conversation)}
                          className={`w-full p-4 flex gap-3 hover:bg-[rgb(var(--surface))] transition-colors border-b border-[rgb(var(--border))] ${
                            activeConversation?.id === conversation.id
                              ? 'bg-[rgb(var(--surface))]'
                              : ''
                          }`}
                        >
                          <div className="relative shrink-0">
                            <Avatar
                              className="h-12 w-12"
                              src={conversation.participants?.[0]?.avatar}
                              fallback={getInitials(getConversationName(conversation))}
                            />
                          </div>

                          <div className="flex-1 min-w-0 text-left">
                            <div className="flex items-start justify-between mb-1">
                              <h3 className="font-semibold text-sm truncate">
                                {getConversationName(conversation)}
                              </h3>
                              {conversation.lastMessage?.createdAt && (
                                <span className="text-xs text-[rgb(var(--muted))] shrink-0 ml-2">
                                  {formatRelativeTime(conversation.lastMessage.createdAt)}
                                </span>
                              )}
                            </div>

                            {conversation.campaignTitle && (
                              <div className="text-xs text-[rgb(var(--muted))] mb-1 truncate">
                                {conversation.campaignTitle}
                              </div>
                            )}

                            <div className="flex items-center justify-between">
                              <p className="text-sm text-[rgb(var(--muted))] truncate">
                                {conversation.lastMessage?.content || 'No messages yet'}
                              </p>
                              {conversation.unreadCount > 0 && (
                                <Badge
                                  variant="primary"
                                  className="ml-2 shrink-0 h-5 min-w-[20px] p-0 flex items-center justify-center text-xs"
                                >
                                  {conversation.unreadCount}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Active Conversation */}
                <div
                  className={`${
                    showMobileList ? 'hidden' : 'flex'
                  } md:flex flex-col flex-1`}
                >
                  {activeConversation ? (
                    <>
                      {/* Chat Header */}
                      <div className="p-4 border-b border-[rgb(var(--border))] flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="md:hidden"
                          onClick={() => setShowMobileList(true)}
                        >
                          <ArrowLeft className="h-5 w-5" />
                        </Button>

                        <Avatar
                          className="h-10 w-10"
                          src={activeConversation.participants?.[0]?.avatar}
                          fallback={getInitials(getConversationName(activeConversation))}
                        />

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{getConversationName(activeConversation)}</h3>
                          {activeConversation.campaignTitle && (
                            <div className="text-xs text-[rgb(var(--muted))] truncate">
                              {activeConversation.campaignTitle}
                            </div>
                          )}
                        </div>

                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </div>

                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {loadingMessages ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-[rgb(var(--muted))]" />
                          </div>
                        ) : messages.length === 0 ? (
                          <div className="text-center py-8 text-sm text-[rgb(var(--muted))]">No messages yet. Start the conversation!</div>
                        ) : (
                          messages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex ${
                                message.senderId === user?.id ? 'justify-end' : 'justify-start'
                              }`}
                            >
                              <div
                                className={`max-w-[80%] md:max-w-[70%] ${
                                  message.senderId === user?.id
                                    ? 'bg-gradient-to-r from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] text-white'
                                    : 'bg-[rgb(var(--surface))]'
                                } rounded-2xl px-4 py-2`}
                              >
                                <p className="text-sm mb-1">{message.content}</p>
                                <div
                                  className={`flex items-center gap-1 text-xs ${
                                    message.senderId === user?.id ? 'text-white/70' : 'text-[rgb(var(--muted))]'
                                  }`}
                                >
                                  <span>{formatRelativeTime(message.createdAt)}</span>
                                  {message.senderId === user?.id && (
                                    <CheckCheck className="h-3 w-3" />
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Message Input */}
                      <div className="p-4 border-t border-[rgb(var(--border))]">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" className="shrink-0">
                            <Paperclip className="h-5 w-5" />
                          </Button>

                          <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Type a message..."
                            className="flex-1 h-10"
                          />

                          <Button
                            variant="gradient"
                            size="sm"
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim() || sending}
                            className="shrink-0"
                          >
                            <Send className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full text-[rgb(var(--muted))]">
                      Select a conversation to start chatting
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
