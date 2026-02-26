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
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/auth-context'
import { formatRelativeTime, formatCompactNumber, getInitials } from '@/lib/utils'
import { staggerContainer, staggerItem, fadeInUp } from '@/lib/animations'
import { useFeed } from '@/hooks/queries/use-feed'
import { useCreatePost, useToggleLike, useSharePost } from '@/hooks/mutations/use-feed-mutations'
import { EmptyState } from '@/components/shared/empty-state'

export default function FeedPage() {
  const { user } = useAuth()
  const [newPostContent, setNewPostContent] = useState('')
  const [showComposer, setShowComposer] = useState(false)
  const [activeTab, setActiveTab] = useState<'foryou' | 'following' | 'trending'>('foryou')

  const feedParams: Record<string, string> = {}
  if (activeTab === 'following') feedParams.followingOnly = 'true'
  const { data: feedData, isLoading } = useFeed(feedParams)
  const posts: any[] = feedData?.data ?? []

  const createPostMutation = useCreatePost()
  const toggleLikeMutation = useToggleLike()
  const sharePostMutation = useSharePost()

  const handleLike = (postId: string) => {
    toggleLikeMutation.mutate(postId)
  }

  const handleShare = (postId: string) => {
    sharePostMutation.mutate(postId)
  }

  const handlePost = () => {
    if (!newPostContent.trim() || !user) return
    const hashtags = newPostContent.match(/#(\w+)/g)?.map((t: string) => t.slice(1)) ?? []
    createPostMutation.mutate(
      {
        type: 'TEXT',
        content: newPostContent,
        visibility: 'PUBLIC',
        hashtags,
      },
      {
        onSuccess: () => {
          setNewPostContent('')
          setShowComposer(false)
        },
      }
    )
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
                              disabled={!newPostContent.trim() || createPostMutation.isPending}
                            >
                              <Send className="h-4 w-4 mr-1" />
                              {createPostMutation.isPending ? 'Posting...' : 'Post'}
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

          {/* Feed Posts */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--muted))]" />
            </div>
          ) : posts.length === 0 ? (
            <EmptyState
              icon={MessageCircle}
              title="No posts yet"
              description="Be the first to share something!"
              action={{ label: 'Create Post', onClick: () => setShowComposer(true) }}
            />
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {posts.map((post: any, index: number) => (
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
                            src={post.author?.avatar}
                            fallback={getInitials(post.author?.name || 'User')}
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold">{post.author?.name || 'User'}</span>
                              {post.author?.role && (
                                <Badge variant={post.author.role === 'BRAND' ? 'primary' : 'outline'} className="text-[10px] px-1.5 py-0">
                                  {post.author.role.toLowerCase()}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-[rgb(var(--muted))]">
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
                            {(Array.isArray(post.poll.options) ? post.poll.options : []).map((option: any) => {
                              const totalVotes = (post.poll.options as any[]).reduce((s: number, o: any) => s + (o.votes || 0), 0)
                              const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0
                              return (
                                <div
                                  key={option.id}
                                  className="w-full relative overflow-hidden rounded-lg border border-[rgb(var(--border))] p-3 text-left"
                                >
                                  <div
                                    className="absolute inset-0 bg-[rgb(var(--brand-primary))]/10 transition-all"
                                    style={{ width: `${percentage}%` }}
                                  />
                                  <div className="relative flex items-center justify-between">
                                    <span className="text-sm font-medium">{option.text}</span>
                                    <span className="text-sm text-[rgb(var(--muted))]">{percentage}%</span>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      {post.hashtags?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {post.hashtags.map((tag: string) => (
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
                              post._isLiked
                                ? 'text-red-500 bg-red-500/10'
                                : 'text-[rgb(var(--muted))] hover:text-red-500 hover:bg-red-500/10'
                            }`}
                          >
                            <Heart className={`h-4 w-4 ${post._isLiked ? 'fill-current' : ''}`} />
                            <span>{formatCompactNumber(post.likesCount || 0)}</span>
                          </button>
                          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-[rgb(var(--muted))] hover:text-[rgb(var(--info))] hover:bg-[rgb(var(--info))]/10 transition-all">
                            <MessageCircle className="h-4 w-4" />
                            <span>{formatCompactNumber(post.commentsCount || 0)}</span>
                          </button>
                          <button
                            onClick={() => handleShare(post.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-[rgb(var(--muted))] hover:text-[rgb(var(--success))] hover:bg-[rgb(var(--success))]/10 transition-all"
                          >
                            <Share2 className="h-4 w-4" />
                            <span>{formatCompactNumber(post.sharesCount || 0)}</span>
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
