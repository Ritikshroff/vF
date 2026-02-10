'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Upload,
  Search,
  Filter,
  Grid3x3,
  List,
  Image as ImageIcon,
  Video,
  Play,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  MoreVertical,
  Edit,
  Trash2,
  ExternalLink,
  TrendingUp,
  Instagram,
  Youtube,
  Facebook,
  CheckCircle2,
  Clock,
  Archive,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'
import { fetchInfluencerContent, fetchContentStats } from '@/services/content'
import { getInfluencerByUserId, getAllInfluencers } from '@/mock-data/influencers'
import type { ContentItem } from '@/mock-data/content'
import { formatCompactNumber } from '@/lib/utils'
import { staggerContainer, staggerItem } from '@/lib/animations'

export default function ContentLibraryPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState<ContentItem[]>([])
  const [stats, setStats] = useState<any>(null)
  const [influencer, setInfluencer] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterPlatform, setFilterPlatform] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    loadContent()
  }, [user])

  const loadContent = async () => {
    if (!user) return

    try {
      let inf = getInfluencerByUserId(user.id)

      // Fallback: use first influencer for demo
      if (!inf) {
        console.warn(`No influencer found for user ID: ${user.id}, using fallback influencer`)
        inf = getAllInfluencers()[0]
      }

      if (inf) {
        setInfluencer(inf)
        const [contentData, statsData] = await Promise.all([
          fetchInfluencerContent(inf.id),
          fetchContentStats(inf.id),
        ])
        setContent(contentData)
        setStats(statsData)
      }
    } catch (error) {
      console.error('Error loading content:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredContent = content.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesPlatform =
      filterPlatform === 'all' || item.platform === filterPlatform

    const matchesStatus =
      filterStatus === 'all' || item.status === filterStatus

    return matchesSearch && matchesPlatform && matchesStatus
  })

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Instagram':
        return Instagram
      case 'YouTube':
        return Youtube
      case 'Facebook':
        return Facebook
      default:
        return ImageIcon
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'success'
      case 'draft':
        return 'warning'
      case 'archived':
        return 'default'
      default:
        return 'default'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return CheckCircle2
      case 'draft':
        return Clock
      case 'archived':
        return Archive
      default:
        return Clock
    }
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-[rgb(var(--surface))] rounded w-1/3" />
          <div className="grid md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-[rgb(var(--surface))] rounded" />
            ))}
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
                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-1 sm:mb-2 gradient-text">
                  Content Library
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-[rgb(var(--muted))]">
                  Manage your portfolio and showcase your best work
                </p>
              </div>
              <Button variant="gradient" size="lg" className="w-full sm:w-auto">
                <Upload className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Upload Content
              </Button>
            </div>
          </motion.div>

          {/* Stats Grid - Mobile 2 cols */}
          {stats && (
            <motion.div
              variants={staggerItem}
              className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8"
            >
              <Card className="border-2">
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                    <div className="p-1.5 sm:p-2 lg:p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                      <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold gradient-text mb-0.5 sm:mb-1">
                    {stats.total_content}
                  </div>
                  <div className="text-[10px] sm:text-xs lg:text-sm text-[rgb(var(--muted))]">
                    Total Content
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                    <div className="p-1.5 sm:p-2 lg:p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                      <Eye className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold gradient-text mb-0.5 sm:mb-1">
                    {formatCompactNumber(stats.total_views)}
                  </div>
                  <div className="text-[10px] sm:text-xs lg:text-sm text-[rgb(var(--muted))]">
                    Total Views
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                    <div className="p-1.5 sm:p-2 lg:p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
                      <Heart className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold gradient-text mb-0.5 sm:mb-1">
                    {formatCompactNumber(stats.total_likes)}
                  </div>
                  <div className="text-[10px] sm:text-xs lg:text-sm text-[rgb(var(--muted))]">
                    Total Likes
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                    <div className="p-1.5 sm:p-2 lg:p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
                      <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold gradient-text mb-0.5 sm:mb-1">
                    {stats.avg_engagement.toFixed(1)}%
                  </div>
                  <div className="text-[10px] sm:text-xs lg:text-sm text-[rgb(var(--muted))]">
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
                  className="pl-9 sm:pl-10 lg:pl-12 h-10 sm:h-12 lg:h-14 text-sm sm:text-base"
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

            {/* Filter Tabs - Mobile Scrollable */}
            <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
              {/* Platform Filters */}
              {['all', 'Instagram', 'YouTube', 'TikTok', 'Facebook'].map((platform) => (
                <button
                  key={platform}
                  onClick={() => setFilterPlatform(platform)}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                    filterPlatform === platform
                      ? 'bg-gradient-to-r from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] text-white shadow-lg'
                      : 'bg-[rgb(var(--surface))] text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]'
                  }`}
                >
                  {platform === 'all' ? 'All Platforms' : platform}
                </button>
              ))}

              <div className="h-7 sm:h-8 w-px bg-[rgb(var(--border))]" />

              {/* Status Filters */}
              {[
                { value: 'all', label: 'All' },
                { value: 'published', label: 'Published' },
                { value: 'draft', label: 'Drafts' },
                { value: 'archived', label: 'Archived' },
              ].map((status) => (
                <button
                  key={status.value}
                  onClick={() => setFilterStatus(status.value)}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                    filterStatus === status.value
                      ? 'bg-gradient-to-r from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] text-white shadow-lg'
                      : 'bg-[rgb(var(--surface))] text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Content Grid/List */}
          {filteredContent.length === 0 ? (
            <Card className="text-center py-8 sm:py-12 lg:py-16">
              <CardContent>
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full bg-[rgb(var(--surface))] mb-3 sm:mb-4">
                  <ImageIcon className="h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-[rgb(var(--muted))]" />
                </div>
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-1 sm:mb-2">No content found</h3>
                <p className="text-xs sm:text-sm lg:text-base text-[rgb(var(--muted))] mb-4 sm:mb-6">
                  {searchQuery
                    ? 'Try adjusting your search or filters'
                    : 'Upload your first piece of content to get started'}
                </p>
                <Button variant="gradient">
                  <Upload className="h-5 w-5 mr-2" />
                  Upload Content
                </Button>
              </CardContent>
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
                const StatusIcon = getStatusIcon(item.status)

                return viewMode === 'grid' ? (
                  /* Grid View */
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -4 }}
                  >
                    <Card className="border-2 hover:border-[rgb(var(--brand-primary))]/40 transition-all overflow-hidden">
                      {/* Thumbnail */}
                      <div className="relative aspect-square overflow-hidden bg-[rgb(var(--surface))]">
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />

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
                            {item.type === 'video' && <Video className="h-3 w-3 mr-1" />}
                            {item.type === 'reel' && <Play className="h-3 w-3 mr-1" />}
                            {item.type}
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
                        {/* Title & Status */}
                        <div className="flex items-start justify-between gap-2 mb-1.5 sm:mb-2">
                          <h3 className="font-bold text-xs sm:text-sm line-clamp-1 flex-1">
                            {item.title}
                          </h3>
                          <Badge variant={getStatusColor(item.status) as any} className="text-[10px]">
                            <StatusIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                            {item.status}
                          </Badge>
                        </div>

                        {/* Campaign */}
                        {item.campaign_name && (
                          <p className="text-[10px] sm:text-xs text-[rgb(var(--muted))] mb-2 sm:mb-3">
                            {item.campaign_name}
                          </p>
                        )}

                        {/* Metrics */}
                        {item.metrics && (
                          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                            <div className="text-center p-1.5 sm:p-2 rounded bg-[rgb(var(--surface))]">
                              <div className="text-[10px] sm:text-xs font-bold">
                                {formatCompactNumber(item.metrics.views)}
                              </div>
                              <div className="text-[9px] sm:text-[10px] text-[rgb(var(--muted))]">Views</div>
                            </div>
                            <div className="text-center p-1.5 sm:p-2 rounded bg-[rgb(var(--surface))]">
                              <div className="text-[10px] sm:text-xs font-bold">
                                {formatCompactNumber(item.metrics.likes)}
                              </div>
                              <div className="text-[9px] sm:text-[10px] text-[rgb(var(--muted))]">Likes</div>
                            </div>
                            <div className="text-center p-1.5 sm:p-2 rounded bg-[rgb(var(--surface))]">
                              <div className="text-[10px] sm:text-xs font-bold">
                                {item.metrics.engagement_rate.toFixed(1)}%
                              </div>
                              <div className="text-[9px] sm:text-[10px] text-[rgb(var(--muted))]">Eng.</div>
                            </div>
                          </div>
                        )}

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1">
                          {item.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-[10px]">
                              {tag}
                            </Badge>
                          ))}
                          {item.tags.length > 2 && (
                            <Badge variant="outline" className="text-[10px]">
                              +{item.tags.length - 2}
                            </Badge>
                          )}
                        </div>
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
                    <Card className="border-2 hover:border-[rgb(var(--brand-primary))]/40 transition-all">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          {/* Thumbnail */}
                          <div className="relative w-32 h-32 shrink-0 rounded-lg overflow-hidden bg-[rgb(var(--surface))]">
                            <img
                              src={item.thumbnail}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 left-2">
                              <PlatformIcon className="h-4 w-4 text-white drop-shadow" />
                            </div>
                          </div>

                          {/* Content Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-lg mb-1 line-clamp-1">
                                  {item.title}
                                </h3>
                                <p className="text-sm text-[rgb(var(--muted))] line-clamp-2 mb-2">
                                  {item.description}
                                </p>
                                {item.campaign_name && (
                                  <Badge variant="outline" className="text-xs mb-2">
                                    {item.campaign_name}
                                  </Badge>
                                )}
                              </div>

                              <Badge variant={getStatusColor(item.status) as any}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {item.status}
                              </Badge>
                            </div>

                            {/* Metrics */}
                            {item.metrics && (
                              <div className="flex gap-4 mb-3">
                                <div className="flex items-center gap-1 text-sm">
                                  <Eye className="h-4 w-4 text-[rgb(var(--muted))]" />
                                  {formatCompactNumber(item.metrics.views)}
                                </div>
                                <div className="flex items-center gap-1 text-sm">
                                  <Heart className="h-4 w-4 text-[rgb(var(--muted))]" />
                                  {formatCompactNumber(item.metrics.likes)}
                                </div>
                                <div className="flex items-center gap-1 text-sm">
                                  <MessageCircle className="h-4 w-4 text-[rgb(var(--muted))]" />
                                  {formatCompactNumber(item.metrics.comments)}
                                </div>
                                <div className="flex items-center gap-1 text-sm">
                                  <TrendingUp className="h-4 w-4 text-[rgb(var(--muted))]" />
                                  {item.metrics.engagement_rate.toFixed(1)}%
                                </div>
                              </div>
                            )}

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
                              {item.url && (
                                <a
                                  href={item.url}
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
