'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Send,
  Paperclip,
  MoreVertical,
  ArrowLeft,
  CheckCheck,
  Circle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { staggerContainer, staggerItem } from '@/lib/animations'

// Mock conversations
const mockConversations = [
  {
    id: '1',
    name: 'EcoWear Brand',
    avatar: 'https://via.placeholder.com/100',
    lastMessage: 'Thanks for applying! We\'d love to discuss the campaign details.',
    timestamp: '2m ago',
    unread: 2,
    online: true,
    campaign: 'Spring Fashion Launch',
  },
  {
    id: '2',
    name: 'TechPro Marketing',
    avatar: 'https://via.placeholder.com/100',
    lastMessage: 'The content looks great! Just a few minor edits.',
    timestamp: '1h ago',
    unread: 0,
    online: false,
    campaign: 'Wireless Earbuds Review',
  },
  {
    id: '3',
    name: 'FitLife Team',
    avatar: 'https://via.placeholder.com/100',
    lastMessage: 'When can you start the 30-day challenge?',
    timestamp: '3h ago',
    unread: 1,
    online: true,
    campaign: '30-Day Fitness Challenge',
  },
  {
    id: '4',
    name: 'GlowCosmetics',
    avatar: 'https://via.placeholder.com/100',
    lastMessage: 'Payment has been processed. Check your account!',
    timestamp: '1d ago',
    unread: 0,
    online: false,
    campaign: 'Summer Glow Collection',
  },
]

// Mock messages for active conversation
const mockMessages = [
  {
    id: '1',
    sender: 'them',
    message: 'Hi! Thanks for applying to our Spring Fashion Launch campaign.',
    timestamp: '10:30 AM',
    read: true,
  },
  {
    id: '2',
    sender: 'me',
    message: 'Thank you! I\'m really excited about this opportunity.',
    timestamp: '10:32 AM',
    read: true,
  },
  {
    id: '3',
    sender: 'them',
    message: 'We love your content style. Would you be available for a quick call tomorrow?',
    timestamp: '10:35 AM',
    read: true,
  },
  {
    id: '4',
    sender: 'me',
    message: 'Absolutely! I\'m free anytime after 2 PM. What time works best for you?',
    timestamp: '10:36 AM',
    read: true,
  },
  {
    id: '5',
    sender: 'them',
    message: 'Perfect! Let\'s schedule for 3 PM. I\'ll send you a calendar invite.',
    timestamp: '10:38 AM',
    read: true,
  },
  {
    id: '6',
    sender: 'them',
    message: 'Also, could you share some of your recent fashion collaborations?',
    timestamp: '10:39 AM',
    read: false,
  },
]

export default function MessagesPage() {
  const [activeConversation, setActiveConversation] = useState(mockConversations[0])
  const [messages, setMessages] = useState(mockMessages)
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showMobileList, setShowMobileList] = useState(true)

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const message = {
      id: String(messages.length + 1),
      sender: 'me' as const,
      message: newMessage,
      timestamp: new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }),
      read: false,
    }

    setMessages([...messages, message])
    setNewMessage('')
  }

  const filteredConversations = mockConversations.filter(
    (conv) =>
      conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.campaign.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelectConversation = (conversation: typeof mockConversations[0]) => {
    setActiveConversation(conversation)
    setShowMobileList(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[rgb(var(--background))] to-[rgb(var(--surface))]">
      <div className="container py-4 md:py-8">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="h-[calc(100vh-11rem)] sm:h-[calc(100vh-9rem)] lg:h-[calc(100vh-10rem)]"
        >
          {/* Header - Mobile Only */}
          <motion.div variants={staggerItem} className="mb-4 sm:hidden">
            <h1 className="text-xl font-bold gradient-text">Messages</h1>
          </motion.div>

          {/* Desktop Header */}
          <motion.div variants={staggerItem} className="hidden sm:block mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-0.5 gradient-text">Messages</h1>
            <p className="text-xs sm:text-sm text-[rgb(var(--muted))]">
              Chat with brands and manage collaborations
            </p>
          </motion.div>

          {/* Messages Container */}
          <motion.div variants={staggerItem} className="h-full">
            <Card className="h-full border border-[rgb(var(--border))]">
              <CardContent className="p-0 h-full flex">
                {/* Conversations List - Hidden on mobile when chat is open */}
                <div
                  className={`${
                    showMobileList ? 'flex' : 'hidden'
                  } sm:flex flex-col w-full sm:w-80 lg:w-96 border-r border-[rgb(var(--border))]`}
                >
                  {/* Search */}
                  <div className="p-3 sm:p-4 border-b border-[rgb(var(--border))]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--muted))]" />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search conversations..."
                        className="pl-10 h-10 min-h-[44px]"
                      />
                    </div>
                  </div>

                  {/* Conversations */}
                  <div className="flex-1 overflow-y-auto">
                    {filteredConversations.map((conversation) => (
                      <button
                        key={conversation.id}
                        onClick={() => handleSelectConversation(conversation)}
                        className={`w-full p-3 sm:p-4 flex gap-3 min-h-[44px] hover:bg-[rgb(var(--surface))] transition-colors border-b border-[rgb(var(--border))] ${
                          activeConversation.id === conversation.id
                            ? 'bg-[rgb(var(--surface))]'
                            : ''
                        }`}
                      >
                        <div className="relative shrink-0">
                          <Avatar className="h-12 w-12" src={conversation.avatar} alt={conversation.name} fallback={conversation.name} />
                          {conversation.online && (
                            <Circle className="absolute bottom-0 right-0 h-3 w-3 fill-green-500 text-green-500" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-start justify-between mb-1">
                            <h3 className="font-semibold text-sm truncate">
                              {conversation.name}
                            </h3>
                            <span className="text-xs text-[rgb(var(--muted))] shrink-0 ml-2">
                              {conversation.timestamp}
                            </span>
                          </div>

                          <div className="text-xs text-[rgb(var(--muted))] mb-1 truncate">
                            {conversation.campaign}
                          </div>

                          <div className="flex items-center justify-between">
                            <p className="text-sm text-[rgb(var(--muted))] truncate">
                              {conversation.lastMessage}
                            </p>
                            {conversation.unread > 0 && (
                              <Badge
                                variant="primary"
                                className="ml-2 shrink-0 h-5 min-w-[20px] p-0 flex items-center justify-center text-xs"
                              >
                                {conversation.unread}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Conversation - Full screen on mobile */}
                <div
                  className={`${
                    showMobileList ? 'hidden' : 'flex'
                  } sm:flex flex-col flex-1`}
                >
                  {/* Chat Header */}
                  <div className="p-3 sm:p-4 border-b border-[rgb(var(--border))] flex items-center gap-3">
                    {/* Mobile back button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="sm:hidden min-h-[44px]"
                      onClick={() => setShowMobileList(true)}
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>

                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <img
                          src={activeConversation.avatar}
                          alt={activeConversation.name}
                        />
                      </Avatar>
                      {activeConversation.online && (
                        <Circle className="absolute bottom-0 right-0 h-3 w-3 fill-green-500 text-green-500" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{activeConversation.name}</h3>
                      <div className="text-xs text-[rgb(var(--muted))] truncate">
                        {activeConversation.campaign}
                      </div>
                    </div>

                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender === 'me' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[80%] lg:max-w-[70%] ${
                            message.sender === 'me'
                              ? 'bg-gradient-to-r from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] text-white'
                              : 'bg-[rgb(var(--surface))]'
                          } rounded-2xl px-3 sm:px-4 py-2`}
                        >
                          <p className="text-sm mb-1">{message.message}</p>
                          <div
                            className={`flex items-center gap-1 text-xs ${
                              message.sender === 'me' ? 'text-white/70' : 'text-[rgb(var(--muted))]'
                            }`}
                          >
                            <span>{message.timestamp}</span>
                            {message.sender === 'me' && (
                              <CheckCheck className={`h-3 w-3 ${message.read ? 'text-blue-300' : ''}`} />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="p-3 sm:p-4 border-t border-[rgb(var(--border))]">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="shrink-0 min-h-[44px]">
                        <Paperclip className="h-5 w-5" />
                      </Button>

                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 h-10 min-h-[44px]"
                      />

                      <Button
                        variant="gradient"
                        size="sm"
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="shrink-0 min-h-[44px]"
                      >
                        <Send className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
