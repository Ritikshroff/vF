'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Upload,
  Search,
  Grid3x3,
  List,
  Image as ImageIcon,
  Video,
  Play,
  Eye,
  Heart,
  MessageCircle,
  MoreVertical,
  Edit,
  ExternalLink,
  TrendingUp,
  Instagram,
  Youtube,
  Globe,
  AlertCircle,
  Music,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'
import { useInfluencerProfile } from '@/hooks/queries/use-discovery'
import { formatCompactNumber } from '@/lib/utils'
import { staggerContainer, staggerItem } from '@/lib/animations'
import { EmptyState } from '@/components/shared/empty-state'

function getPlatformIcon(platform: string) {
  switch (platform) {
    case 'INSTAGRAM':
      return Instagram
    case 'YOUTUBE':
      return Youtube
    case 'TIKTOK':
      return Music
    case 'FACEBOOK':
      return Globe
    default:
      return ImageIcon
  }
}

function formatPlatformName(platform: string): string {
  const names: Record<string, string> = {
    INSTAGRAM: 'Instagram',
    YOUTUBE: 'YouTube',
    TIKTOK: 'TikTok',
    TWITTER: 'Twitter',
    FACEBOOK: 'Facebook',
  }
  return names[platform] || platform
}

function formatContentType(type: string): string {
  const names: Record<string, string> = {
    IMAGE: 'Image',
    VIDEO: 'Video',
    REEL: 'Reel',
    STORY: 'Story',
    CAROUSEL: 'Carousel',
    SHORT: 'Short',
  }
  return names[type] || type
}

export default function ContentLibraryPage() {
  const { user } = useAuth()
  const { data: profile, isLoading } = useInfluencerProfile(user?.influencerId || '')

  const content: any[] = profile?.recentPosts || []

  const stats = useMemo(() => {
    if (content.length === 0) return null
    return {
      total_content: content.length,
      total_views: content.reduce((sum: number, p: any) => sum + (p.views || 0), 0),
      total_likes: content.reduce((sum: number, p: any) => sum + (p.likes || 0), 0),
      avg_engagement: content.length > 0
        ? content.reduce((sum: number, p: any) => sum + Number(p.engagementRate || 0), 0) / content.length
        : 0,
    }
  }, [content])

  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterPlatform, setFilterPlatform] = useState<string>('all')

  const filteredContent = content.filter((item) => {
    const matchesSearch =
      searchQuery === '' ||
      formatPlatformName(item.platform).toLowerCase().includes(searchQuery.toLowerCase()) ||
      formatContentType(item.type).toLowerCase().includes(searchQuery.toLowerCase())

    const matchesPlatform =
      filterPlatform === 'all' || item.platform === filterPlatform

    return matchesSearch && matchesPlatform
  })

  if (!user?.influencerId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[rgb(var(--background))] to-[rgb(var(--surface))]">
        <div className="container py-4 sm:py-6 lg:py-8">
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
            <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-[rgb(var(--muted))] mb-3 sm:mb-4" />
            <h2 className="text-lg sm:text-xl font-semibold mb-2">Influencer Profile Required</h2>
            <p className="text-xs sm:text-sm text-[rgb(var(--muted))] max-w-md">
              Complete your onboarding to access the content library.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[rgb(var(--background))] to-[rgb(var(--surface))]">
        <div className="container py-4 sm:py-6 lg:py-8">
          <div className="animate-pulse space-y-4 sm:space-y-6">
            <div className="h-7 sm:h-8 bg-[rgb(var(--surface))] rounded w-1/3" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 sm:h-32 bg-[rgb(var(--surface))] rounded-xl" />
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-48 sm:h-56 bg-[rgb(var(--surface))] rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[rgb(var(--background))] to-[rgb(var(--surface))]">
      <div className="container py-4 sm:py-6 lg:py-8">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          {/* Header */}
          <motion.div variants={staggerItem} className="mb-4 sm:mb-6 lg:mb-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 gradient-text">
                  Content Library
                </h1>
                <p className="text-xs sm:text-sm text-[rgb(var(--muted))]">
                  Manage your portfolio and showcase your best work
                </p>
              </div>
              <Button variant="gradient" size="sm" className="w-full sm:w-auto min-h-[36px] sm:min-h-[40px] text-xs sm:text-sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload Content
              </Button>
            </div>
          </motion.div>

          {/* Stats Grid */}
          {stats && (
            <motion.div
              variants={staggerItem}
              className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8"
            >
              <Card className="border border-[rgb(var(--border))]">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-1 sm:mb-2">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-[rgb(var(--brand-primary))]/10">
                      <ImageIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[rgb(var(--brand-primary))]" />
                    </div>
                  </div>
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-[rgb(var(--foreground))] mb-0.5">
                    {stats.total_content}
                  </div>
                  <div className="text-[10px] sm:text-xs text-[rgb(var(--muted))]">
                    Total Content
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-[rgb(var(--border))]">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-1 sm:mb-2">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-[rgb(var(--brand-primary))]/10">
                      <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[rgb(var(--brand-primary))]" />
                    </div>
                  </div>
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-[rgb(var(--foreground))] mb-0.5">
                    {formatCompactNumber(stats.total_views)}
                  </div>
                  <div className="text-[10px] sm:text-xs text-[rgb(var(--muted))]">
                    Total Views
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-[rgb(var(--border))]">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-1 sm:mb-2">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-[rgb(var(--brand-primary))]/10">
                      <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[rgb(var(--brand-primary))]" />
                    </div>
                  </div>
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-[rgb(var(--foreground))] mb-0.5">
                    {formatCompactNumber(stats.total_likes)}
                  </div>
                  <div className="text-[10px] sm:text-xs text-[rgb(var(--muted))]">
                    Total Likes
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-[rgb(var(--border))]">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-1 sm:mb-2">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-[rgb(var(--brand-primary))]/10">
                      <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[rgb(var(--brand-primary))]" />
                    </div>
                  </div>
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-[rgb(var(--foreground))] mb-0.5">
                    {stats.avg_engagement.toFixed(1)}%
                  </div>
                  <div className="text-[10px] sm:text-xs text-[rgb(var(--muted))]">
                    Avg Engagement
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Search & Filters */}
          <motion.div variants={staggerItem} className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-[rgb(var(--muted))]" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search content..."
                  className="pl-9 sm:pl-10 h-9 sm:h-10 text-sm"
                />
              </div>

              {/* View Toggle - Desktop Only */}
              <div className="hidden sm:flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'outline'}
                  size="lg"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3x3 className="h-5 w-5" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'outline'}
                  size="lg"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Platform Filter Tabs */}
            <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
              {['all', 'INSTAGRAM', 'YOUTUBE', 'TIKTOK', 'FACEBOOK'].map((platform) => (
                <button
                  key={platform}
                  onClick={() => setFilterPlatform(platform)}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                    filterPlatform === platform
                      ? 'bg-gradient-to-r from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] text-white'
                      : 'bg-[rgb(var(--surface))] text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] border border-[rgb(var(--border))]'
                  }`}
                >
                  {platform === 'all' ? 'All Platforms' : formatPlatformName(platform)}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Content Grid/List */}
          {filteredContent.length === 0 ? (
            <Card>
              <EmptyState
                icon={ImageIcon}
                title="No content found"
                description={searchQuery ? 'Try adjusting your search or filters' : 'Upload your first piece of content to get started'}
              />
            </Card>
          ) : (
            <motion.div
              variants={staggerItem}
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6'
                  : 'space-y-3 sm:space-y-4'
              }
            >
              {filteredContent.map((item) => {
                const PlatformIcon = getPlatformIcon(item.platform)
                const engagementRate = Number(item.engagementRate || 0)

                return viewMode === 'grid' ? (
                  /* Grid View */
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -4 }}
                  >
                    <Card className="border border-[rgb(var(--border))] hover:border-[rgb(var(--brand-primary))]/40 transition-all overflow-hidden">
                      {/* Thumbnail */}
                      <div className="relative aspect-square overflow-hidden bg-[rgb(var(--surface))]">
                        {item.thumbnail ? (
                          <img
                            src={item.thumbnail}
                            alt={formatContentType(item.type)}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[rgb(var(--muted))]">
                            <ImageIcon className="h-12 w-12" />
                          </div>
                        )}

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity">
                          <div className="absolute bottom-4 left-4 right-4">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="flex-1">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" className="flex-1">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Type Badge */}
                        <div className="absolute top-3 left-3">
                          <Badge variant="default" className="backdrop-blur-sm">
                            {(item.type === 'VIDEO' || item.type === 'SHORT') && <Video className="h-3 w-3 mr-1" />}
                            {item.type === 'REEL' && <Play className="h-3 w-3 mr-1" />}
                            {formatContentType(item.type)}
                          </Badge>
                        </div>

                        {/* Platform Badge */}
                        <div className="absolute top-3 right-3">
                          <div className="p-2 rounded-full backdrop-blur-sm bg-black/40">
                            <PlatformIcon className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      </div>

                      <CardContent className="p-3 sm:p-4">
                        {/* Platform & Type */}
                        <div className="flex items-center justify-between gap-2 mb-1.5 sm:mb-2">
                          <h3 className="font-bold text-xs sm:text-sm line-clamp-1 flex-1">
                            {formatPlatformName(item.platform)} {formatContentType(item.type)}
                          </h3>
                          {item.postedAt && (
                            <span className="text-[10px] text-[rgb(var(--muted))] whitespace-nowrap">
                              {new Date(item.postedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                        </div>

                        {/* Metrics */}
                        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                          <div className="text-center p-1.5 sm:p-2 rounded bg-[rgb(var(--surface))]">
                            <div className="text-[10px] sm:text-xs font-bold">
                              {formatCompactNumber(item.views || 0)}
                            </div>
                            <div className="text-[9px] sm:text-[10px] text-[rgb(var(--muted))]">Views</div>
                          </div>
                          <div className="text-center p-1.5 sm:p-2 rounded bg-[rgb(var(--surface))]">
                            <div className="text-[10px] sm:text-xs font-bold">
                              {formatCompactNumber(item.likes || 0)}
                            </div>
                            <div className="text-[9px] sm:text-[10px] text-[rgb(var(--muted))]">Likes</div>
                          </div>
                          <div className="text-center p-1.5 sm:p-2 rounded bg-[rgb(var(--surface))]">
                            <div className="text-[10px] sm:text-xs font-bold">
                              {engagementRate.toFixed(1)}%
                            </div>
                            <div className="text-[9px] sm:text-[10px] text-[rgb(var(--muted))]">Eng.</div>
                          </div>
                        </div>

                        {/* Platform badge */}
                        <Badge variant="outline" className="text-[10px]">
                          {formatPlatformName(item.platform)}
                        </Badge>
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  /* List View */
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="border border-[rgb(var(--border))] hover:border-[rgb(var(--brand-primary))]/40 transition-all">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex gap-3 sm:gap-4">
                          {/* Thumbnail */}
                          <div className="relative w-24 h-24 sm:w-32 sm:h-32 shrink-0 rounded-lg overflow-hidden bg-[rgb(var(--surface))]">
                            {item.thumbnail ? (
                              <img
                                src={item.thumbnail}
                                alt={formatContentType(item.type)}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[rgb(var(--muted))]">
                                <ImageIcon className="h-8 w-8" />
                              </div>
                            )}
                            <div className="absolute top-2 left-2">
                              <PlatformIcon className="h-4 w-4 text-white drop-shadow" />
                            </div>
                          </div>

                          {/* Content Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-lg mb-1 line-clamp-1">
                                  {formatPlatformName(item.platform)} {formatContentType(item.type)}
                                </h3>
                                {item.postedAt && (
                                  <p className="text-sm text-[rgb(var(--muted))] mb-2">
                                    Posted {new Date(item.postedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                  </p>
                                )}
                              </div>
                              <Badge variant="outline">
                                {formatContentType(item.type)}
                              </Badge>
                            </div>

                            {/* Metrics */}
                            <div className="flex gap-4 mb-3">
                              <div className="flex items-center gap-1 text-sm">
                                <Eye className="h-4 w-4 text-[rgb(var(--muted))]" />
                                {formatCompactNumber(item.views || 0)}
                              </div>
                              <div className="flex items-center gap-1 text-sm">
                                <Heart className="h-4 w-4 text-[rgb(var(--muted))]" />
                                {formatCompactNumber(item.likes || 0)}
                              </div>
                              <div className="flex items-center gap-1 text-sm">
                                <MessageCircle className="h-4 w-4 text-[rgb(var(--muted))]" />
                                {formatCompactNumber(item.comments || 0)}
                              </div>
                              <div className="flex items-center gap-1 text-sm">
                                <TrendingUp className="h-4 w-4 text-[rgb(var(--muted))]" />
                                {engagementRate.toFixed(1)}%
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              {item.postUrl && (
                                <a
                                  href={item.postUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center justify-center h-8 px-3 rounded-md text-sm font-medium hover:bg-[rgb(var(--surface))] transition-colors"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
