'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart,
  MessageCircle,
  Share2,
  Send,
  Image,
  BarChart3,
  MoreHorizontal,
  Bookmark,
  Smile,
  TrendingUp,
  Users,
  Flame,
  Plus,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/auth-context'
import { formatRelativeTime, formatCompactNumber, getInitials } from '@/lib/utils'
import { staggerContainer, staggerItem, fadeInUp } from '@/lib/animations'

interface FeedPost {
  id: string
  author: {
    id: string
    name: string
    username: string
    avatar?: string
    verified: boolean
    role: 'brand' | 'influencer'
  }
  content: string
  images?: string[]
  poll?: {
    question: string
    options: { id: string; text: string; votes: number }[]
    totalVotes: number
    endsAt: string
  }
  likes: number
  comments: number
  shares: number
  isLiked: boolean
  isBookmarked: boolean
  tags: string[]
  createdAt: string
}

// Mock feed data
const MOCK_FEED: FeedPost[] = [
  {
    id: '1',
    author: { id: 'u1', name: 'Sarah Chen', username: 'sarahcreates', verified: true, role: 'influencer' },
    content: 'Just wrapped up an amazing campaign with @LuxeBeauty! The new skincare line is incredible. Here are some behind-the-scenes shots from the photoshoot. What do you think? 💄✨ #beauty #skincare #collab',
    images: [],
    likes: 2453,
    comments: 189,
    shares: 67,
    isLiked: false,
    isBookmarked: false,
    tags: ['beauty', 'skincare', 'collab'],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    author: { id: 'u2', name: 'TechVibe Co.', username: 'techvibe', verified: true, role: 'brand' },
    content: 'We\'re looking for tech creators to join our upcoming product launch campaign! If you have 10K+ followers and love reviewing gadgets, drop a comment below or DM us. Exciting compensation packages available! 🚀',
    likes: 891,
    comments: 342,
    shares: 156,
    isLiked: true,
    isBookmarked: true,
    tags: ['opportunity', 'tech', 'creators'],
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    author: { id: 'u3', name: 'Alex Rivera', username: 'alexfitness', verified: false, role: 'influencer' },
    content: 'Quick poll for my fitness fam! Which type of content do you want to see more of?',
    poll: {
      question: 'What content do you want more of?',
      options: [
        { id: 'o1', text: 'Workout routines', votes: 456 },
        { id: 'o2', text: 'Nutrition tips', votes: 312 },
        { id: 'o3', text: 'Brand reviews', votes: 189 },
        { id: 'o4', text: 'Behind the scenes', votes: 267 },
      ],
      totalVotes: 1224,
      endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
    likes: 567,
    comments: 89,
    shares: 23,
    isLiked: false,
    isBookmarked: false,
    tags: ['fitness', 'poll'],
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    author: { id: 'u4', name: 'GreenLeaf Organics', username: 'greenleaf', verified: true, role: 'brand' },
    content: 'Big announcement! Our creator partnership program just hit 500 members. To celebrate, we\'re increasing commission rates by 5% for all existing partners this month. Thank you for being part of our journey! 🌿',
    likes: 1876,
    comments: 267,
    shares: 445,
    isLiked: false,
    isBookmarked: false,
    tags: ['announcement', 'partnership', 'organic'],
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    author: { id: 'u5', name: 'Mia Johnson', username: 'miastyle', verified: true, role: 'influencer' },
    content: 'Campaign performance update: My latest collaboration generated 2.3M impressions and 150K+ engagements! Grateful for the amazing brands I get to work with. Tips for fellow creators: always negotiate your worth and deliver beyond expectations. 📈',
    likes: 3210,
    comments: 456,
    shares: 234,
    isLiked: false,
    isBookmarked: false,
    tags: ['tips', 'performance', 'creatortips'],
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
  },
]

const TRENDING_TAGS = ['#beauty', '#tech', '#fitness', '#collab', '#branddeals', '#creatortips', '#marketing']

export default function FeedPage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<FeedPost[]>(MOCK_FEED)
  const [newPostContent, setNewPostContent] = useState('')
  const [showComposer, setShowComposer] = useState(false)
  const [activeTab, setActiveTab] = useState<'foryou' | 'following' | 'trending'>('foryou')

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
        : p
    ))
  }

  const handleBookmark = (postId: string) => {
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, isBookmarked: !p.isBookmarked } : p
    ))
  }

  const handlePost = () => {
    if (!newPostContent.trim() || !user) return
    const newPost: FeedPost = {
      id: Date.now().toString(),
      author: {
        id: user.id,
        name: user.name,
        username: user.name.toLowerCase().replace(/\s+/g, ''),
        verified: false,
        role: (user.role as 'brand' | 'influencer') || 'influencer',
      },
      content: newPostContent,
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false,
      isBookmarked: false,
      tags: [],
      createdAt: new Date().toISOString(),
    }
    setPosts(prev => [newPost, ...prev])
    setNewPostContent('')
    setShowComposer(false)
  }

  const handleVote = (postId: string, optionId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId || !p.poll) return p
      return {
        ...p,
        poll: {
          ...p.poll,
          totalVotes: p.poll.totalVotes + 1,
          options: p.poll.options.map(o =>
            o.id === optionId ? { ...o, votes: o.votes + 1 } : o
          ),
        },
      }
    }))
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-surface">
      <div className="container max-w-3xl py-4 sm:py-6 lg:py-8 px-4 sm:px-6">
        <motion.div initial="initial" animate="animate" variants={staggerContainer}>
          {/* Header */}
          <motion.div variants={staggerItem} className="mb-4 sm:mb-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold gradient-text">Feed</h1>
                <p className="text-sm text-[rgb(var(--muted))]">Stay connected with your network</p>
              </div>
              <Button variant="gradient" onClick={() => setShowComposer(!showComposer)}>
                <Plus className="h-4 w-4 mr-2" />
                Post
              </Button>
            </div>
          </motion.div>

          {/* Feed Tabs */}
          <motion.div variants={staggerItem} className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2">
            {[
              { value: 'foryou' as const, label: 'For You', icon: Flame },
              { value: 'following' as const, label: 'Following', icon: Users },
              { value: 'trending' as const, label: 'Trending', icon: TrendingUp },
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.value
                    ? 'bg-gradient-to-r from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] text-white shadow-lg'
                    : 'bg-[rgb(var(--surface))] text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </motion.div>

          {/* Post Composer */}
          <AnimatePresence>
            {showComposer && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 sm:mb-6"
              >
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-start gap-3">
                      <Avatar size="md" fallback={user ? getInitials(user.name) : 'U'} />
                      <div className="flex-1">
                        <textarea
                          value={newPostContent}
                          onChange={e => setNewPostContent(e.target.value)}
                          placeholder="Share something with your network..."
                          className="w-full bg-transparent border-none outline-none resize-none text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted))] min-h-[100px]"
                          rows={3}
                        />
                        <div className="flex items-center justify-between pt-3 border-t border-[rgb(var(--border))]">
                          <div className="flex gap-2">
                            <button className="p-2 rounded-lg hover:bg-[rgb(var(--surface))] text-[rgb(var(--muted))] transition-colors">
                              <Image className="h-5 w-5" />
                            </button>
                            <button className="p-2 rounded-lg hover:bg-[rgb(var(--surface))] text-[rgb(var(--muted))] transition-colors">
                              <BarChart3 className="h-5 w-5" />
                            </button>
                            <button className="p-2 rounded-lg hover:bg-[rgb(var(--surface))] text-[rgb(var(--muted))] transition-colors">
                              <Smile className="h-5 w-5" />
                            </button>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setShowComposer(false)}>
                              Cancel
                            </Button>
                            <Button
                              variant="gradient"
                              size="sm"
                              onClick={handlePost}
                              disabled={!newPostContent.trim()}
                            >
                              <Send className="h-4 w-4 mr-1" />
                              Post
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Trending Tags */}
          <motion.div variants={staggerItem} className="mb-4 sm:mb-6">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {TRENDING_TAGS.map(tag => (
                <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-[rgb(var(--surface-hover))] whitespace-nowrap">
                  {tag}
                </Badge>
              ))}
            </div>
          </motion.div>

          {/* Feed Posts */}
          <div className="space-y-3 sm:space-y-4">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:border-[rgb(var(--brand-primary))]/20 transition-all">
                  <CardContent className="p-3 sm:p-4 lg:p-6">
                    {/* Post Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          size="md"
                          fallback={getInitials(post.author.name)}
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold">{post.author.name}</span>
                            {post.author.verified && (
                              <svg className="h-4 w-4 text-[rgb(var(--brand-primary))]" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                            <Badge variant={post.author.role === 'brand' ? 'primary' : 'outline'} className="text-[10px] px-1.5 py-0">
                              {post.author.role}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-[rgb(var(--muted))]">
                            <span>@{post.author.username}</span>
                            <span>·</span>
                            <span>{formatRelativeTime(post.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      <button className="p-1.5 rounded-lg hover:bg-[rgb(var(--surface))] text-[rgb(var(--muted))] transition-colors">
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Post Content */}
                    <div className="mb-4">
                      <p className="text-[rgb(var(--foreground))] whitespace-pre-wrap leading-relaxed">
                        {post.content}
                      </p>
                    </div>

                    {/* Poll */}
                    {post.poll && (
                      <div className="mb-4 p-4 rounded-xl bg-[rgb(var(--surface))]">
                        <h4 className="font-semibold mb-3">{post.poll.question}</h4>
                        <div className="space-y-2">
                          {post.poll.options.map(option => {
                            const percentage = post.poll ? Math.round((option.votes / post.poll.totalVotes) * 100) : 0
                            return (
                              <button
                                key={option.id}
                                onClick={() => handleVote(post.id, option.id)}
                                className="w-full relative overflow-hidden rounded-lg border border-[rgb(var(--border))] p-3 text-left transition-all hover:border-[rgb(var(--brand-primary))]/40"
                              >
                                <div
                                  className="absolute inset-0 bg-[rgb(var(--brand-primary))]/10 transition-all"
                                  style={{ width: `${percentage}%` }}
                                />
                                <div className="relative flex items-center justify-between">
                                  <span className="text-sm font-medium">{option.text}</span>
                                  <span className="text-sm text-[rgb(var(--muted))]">{percentage}%</span>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                        <p className="mt-2 text-xs text-[rgb(var(--muted))]">
                          {formatCompactNumber(post.poll.totalVotes)} votes
                        </p>
                      </div>
                    )}

                    {/* Tags */}
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {post.tags.map(tag => (
                          <span
                            key={tag}
                            className="text-xs text-[rgb(var(--brand-primary))] cursor-pointer hover:underline"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Engagement Stats */}
                    <div className="flex items-center justify-between pt-3 border-t border-[rgb(var(--border))]">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
                            post.isLiked
                              ? 'text-red-500 bg-red-500/10'
                              : 'text-[rgb(var(--muted))] hover:text-red-500 hover:bg-red-500/10'
                          }`}
                        >
                          <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                          <span>{formatCompactNumber(post.likes)}</span>
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-[rgb(var(--muted))] hover:text-[rgb(var(--info))] hover:bg-[rgb(var(--info))]/10 transition-all">
                          <MessageCircle className="h-4 w-4" />
                          <span>{formatCompactNumber(post.comments)}</span>
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-[rgb(var(--muted))] hover:text-[rgb(var(--success))] hover:bg-[rgb(var(--success))]/10 transition-all">
                          <Share2 className="h-4 w-4" />
                          <span>{formatCompactNumber(post.shares)}</span>
                        </button>
                      </div>
                      <button
                        onClick={() => handleBookmark(post.id)}
                        className={`p-1.5 rounded-lg transition-all ${
                          post.isBookmarked
                            ? 'text-[rgb(var(--brand-primary))]'
                            : 'text-[rgb(var(--muted))] hover:text-[rgb(var(--brand-primary))]'
                        }`}
                      >
                        <Bookmark className={`h-5 w-5 ${post.isBookmarked ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Load More */}
          <motion.div variants={staggerItem} className="text-center mt-6 sm:mt-8">
            <Button variant="outline" size="lg">
              Load More Posts
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
