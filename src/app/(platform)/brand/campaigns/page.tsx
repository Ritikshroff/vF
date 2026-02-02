'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  CheckCircle2,
  Clock,
  XCircle,
  PlayCircle,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { fetchBrandCampaigns } from '@/services/campaigns'
import type { Campaign } from '@/mock-data/campaigns'
import { formatCurrency, formatCompactNumber } from '@/lib/utils'
import { staggerContainer, staggerItem } from '@/lib/animations'

export default function BrandCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'draft' | 'active' | 'completed'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadCampaigns()
  }, [])

  const loadCampaigns = async () => {
    try {
      // In real app, get brandId from auth
      const data = await fetchBrandCampaigns('brand_001')
      setCampaigns(data)
    } catch (error) {
      console.error('Error loading campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesFilter = filter === 'all' || campaign.status === filter
    const matchesSearch =
      campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const stats = {
    total: campaigns.length,
    active: campaigns.filter((c) => c.status === 'active').length,
    draft: campaigns.filter((c) => c.status === 'draft').length,
    completed: campaigns.filter((c) => c.status === 'completed').length,
  }

  const getStatusIcon = (status: Campaign['status']) => {
    switch (status) {
      case 'active':
        return PlayCircle
      case 'completed':
        return CheckCircle2
      case 'draft':
        return Edit
      default:
        return Clock
    }
  }

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'completed':
        return 'default'
      case 'draft':
        return 'warning'
      default:
        return 'default'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[rgb(var(--background))] to-[rgb(var(--surface))]">
      <div className="container py-4 md:py-8">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          {/* Header - Mobile Optimized */}
          <motion.div variants={staggerItem} className="mb-6 md:mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-5xl font-bold mb-2 gradient-text">
                  My Campaigns
                </h1>
                <p className="text-sm md:text-lg text-[rgb(var(--muted))]">
                  Manage and track your influencer campaigns
                </p>
              </div>
              <Link href="/brand/campaigns/new" className="w-full md:w-auto">
                <Button variant="gradient" size="lg" className="w-full md:w-auto">
                  <Plus className="h-5 w-5 mr-2" />
                  New Campaign
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats Cards - Mobile Responsive Grid */}
          <motion.div
            variants={staggerItem}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8"
          >
            {[
              { label: 'Total', value: stats.total, color: 'from-purple-500 to-pink-500' },
              { label: 'Active', value: stats.active, color: 'from-green-500 to-emerald-500' },
              { label: 'Draft', value: stats.draft, color: 'from-orange-500 to-yellow-500' },
              { label: 'Completed', value: stats.completed, color: 'from-blue-500 to-cyan-500' },
            ].map((stat) => (
              <Card key={stat.label} className="border-2">
                <CardContent className="p-4 md:p-6">
                  <div className="text-2xl md:text-3xl font-bold gradient-text mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs md:text-sm text-[rgb(var(--muted))]">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Search & Filters - Mobile Optimized */}
          <motion.div variants={staggerItem} className="mb-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-3 md:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-[rgb(var(--muted))]" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search campaigns..."
                  className="pl-10 md:pl-12 h-12 md:h-14"
                />
              </div>
            </div>

            {/* Filter Tabs - Mobile Scrollable */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
              {[
                { value: 'all' as const, label: 'All Campaigns' },
                { value: 'active' as const, label: 'Active' },
                { value: 'draft' as const, label: 'Drafts' },
                { value: 'completed' as const, label: 'Completed' },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setFilter(tab.value)}
                  className={`px-4 md:px-6 py-2 md:py-3 rounded-full text-sm md:text-base font-medium whitespace-nowrap transition-all ${
                    filter === tab.value
                      ? 'bg-gradient-to-r from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] text-white shadow-lg'
                      : 'bg-[rgb(var(--surface))] text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Campaigns List - Mobile Optimized Cards */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4 md:p-6">
                    <div className="h-6 bg-[rgb(var(--surface))] rounded mb-3" />
                    <div className="h-4 bg-[rgb(var(--surface))] rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <Card className="text-center py-12 md:py-16">
              <CardContent>
                <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-[rgb(var(--surface))] mb-4">
                  <Search className="h-8 w-8 md:h-10 md:w-10 text-[rgb(var(--muted))]" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-2">No campaigns found</h3>
                <p className="text-sm md:text-base text-[rgb(var(--muted))] mb-6">
                  {searchQuery
                    ? 'Try adjusting your search'
                    : 'Create your first campaign to get started'}
                </p>
                <Link href="/brand/campaigns/new">
                  <Button variant="gradient">Create Campaign</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4 md:space-y-6">
              {filteredCampaigns.map((campaign) => {
                const StatusIcon = getStatusIcon(campaign.status)
                return (
                  <motion.div
                    key={campaign.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="border-2 hover:border-[rgb(var(--brand-primary))]/40 transition-all">
                      <CardContent className="p-4 md:p-6">
                        {/* Mobile: Stacked Layout, Desktop: Horizontal */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          {/* Main Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg md:text-xl font-bold mb-2 line-clamp-1">
                                  {campaign.title}
                                </h3>
                                <p className="text-sm text-[rgb(var(--muted))] line-clamp-2 mb-3">
                                  {campaign.description}
                                </p>
                              </div>
                              <Badge variant={getStatusColor(campaign.status) as any}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {campaign.status}
                              </Badge>
                            </div>

                            {/* Stats Grid - Mobile 2 cols, Desktop 4 cols */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4">
                              <div className="flex items-center gap-2 text-sm">
                                <Users className="h-4 w-4 text-[rgb(var(--muted))]" />
                                <span className="text-[rgb(var(--muted))]">
                                  {Array.isArray(campaign.accepted_influencers) ? campaign.accepted_influencers.length : 0}/{campaign.max_influencers} influencers
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <DollarSign className="h-4 w-4 text-[rgb(var(--muted))]" />
                                <span className="text-[rgb(var(--muted))]">
                                  {formatCurrency(campaign.budget.min)}-{formatCurrency(campaign.budget.max)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-[rgb(var(--muted))]" />
                                <span className="text-[rgb(var(--muted))]">
                                  {new Date(campaign.campaign_start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <TrendingUp className="h-4 w-4 text-[rgb(var(--muted))]" />
                                <span className="text-[rgb(var(--muted))]">
                                  {campaign.applied_influencers.length} applied
                                </span>
                              </div>
                            </div>

                            {/* Platforms & Category - Mobile Wrap */}
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline">{campaign.category}</Badge>
                              {campaign.platforms.slice(0, 2).map((platform) => (
                                <Badge key={platform} variant="outline">
                                  {platform}
                                </Badge>
                              ))}
                              {campaign.platforms.length > 2 && (
                                <Badge variant="outline">+{campaign.platforms.length - 2}</Badge>
                              )}
                            </div>
                          </div>

                          {/* Actions - Mobile Full Width, Desktop Auto */}
                          <div className="flex md:flex-col gap-2 md:gap-3 pt-4 md:pt-0 border-t md:border-t-0 md:border-l md:pl-6 border-[rgb(var(--border))]">
                            <Link href={`/brand/campaigns/${campaign.id}`} className="flex-1 md:flex-none">
                              <Button variant="outline" size="sm" className="w-full">
                                <Eye className="h-4 w-4 mr-2" />
                                <span className="hidden md:inline">View</span>
                              </Button>
                            </Link>
                            {campaign.status === 'draft' && (
                              <Button variant="ghost" size="sm" className="flex-1 md:flex-none">
                                <Edit className="h-4 w-4 mr-2" />
                                <span className="hidden md:inline">Edit</span>
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Performance Bar (only for completed campaigns) */}
                        {campaign.performance && (
                          <div className="mt-4 pt-4 border-t border-[rgb(var(--border))]">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                              <div>
                                <div className="text-lg md:text-xl font-bold gradient-text">
                                  {formatCompactNumber(campaign.performance.total_reach)}
                                </div>
                                <div className="text-xs text-[rgb(var(--muted))]">Total Reach</div>
                              </div>
                              <div>
                                <div className="text-lg md:text-xl font-bold gradient-text">
                                  {formatCompactNumber(campaign.performance.total_engagement)}
                                </div>
                                <div className="text-xs text-[rgb(var(--muted))]">Engagement</div>
                              </div>
                              <div>
                                <div className="text-lg md:text-xl font-bold gradient-text">
                                  {formatCompactNumber(campaign.performance.total_conversions)}
                                </div>
                                <div className="text-xs text-[rgb(var(--muted))]">Conversions</div>
                              </div>
                              <div>
                                <div className="text-lg md:text-xl font-bold text-green-500">
                                  {campaign.performance.roi}%
                                </div>
                                <div className="text-xs text-[rgb(var(--muted))]">ROI</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
