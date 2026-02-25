'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Search,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Eye,
  Edit,
  CheckCircle2,
  Clock,
  PlayCircle,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useBrandCampaigns } from '@/hooks/queries/use-campaigns'
import { formatCurrency } from '@/lib/utils'
import { staggerContainer, staggerItem } from '@/lib/animations'

export default function BrandCampaignsPage() {
  const { data: campaignsData, isLoading } = useBrandCampaigns()
  const campaigns: any[] = campaignsData ?? []
  const [filter, setFilter] = useState<'all' | 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'PAUSED'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCampaigns = campaigns.filter((listing: any) => {
    const matchesFilter = filter === 'all' || listing.status === filter
    const matchesSearch =
      listing.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const stats = {
    total: campaigns.length,
    active: campaigns.filter((c) => c.status === 'ACTIVE').length,
    draft: campaigns.filter((c) => c.status === 'DRAFT').length,
    closed: campaigns.filter((c) => c.status === 'CLOSED' || c.status === 'FILLED').length,
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return PlayCircle
      case 'CLOSED':
      case 'FILLED':
        return CheckCircle2
      case 'DRAFT':
        return Edit
      case 'PAUSED':
        return Clock
      default:
        return Clock
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success'
      case 'CLOSED':
      case 'FILLED':
        return 'default'
      case 'DRAFT':
        return 'warning'
      default:
        return 'default'
    }
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
          <motion.div variants={staggerItem} className="mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-0.5 gradient-text">
                  My Campaigns
                </h1>
                <p className="text-xs sm:text-sm text-[rgb(var(--muted))]">
                  Manage and track your influencer campaigns
                </p>
              </div>
              <Link href="/brand/campaigns/new" className="w-full sm:w-auto">
                <Button variant="gradient" size="sm" className="w-full sm:w-auto min-h-[44px]">
                  <Plus className="h-4 w-4 mr-2" />
                  New Campaign
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            variants={staggerItem}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6"
          >
            {[
              { label: 'Total', value: stats.total },
              { label: 'Active', value: stats.active },
              { label: 'Draft', value: stats.draft },
              { label: 'Closed', value: stats.closed },
            ].map((stat) => (
              <Card key={stat.label} className="border border-[rgb(var(--border))]">
                <CardContent className="p-3 sm:p-4">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-[rgb(var(--foreground))] mb-0.5">
                    {stat.value}
                  </div>
                  <div className="text-[10px] sm:text-xs text-[rgb(var(--muted))]">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Search & Filters */}
          <motion.div variants={staggerItem} className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
            <div className="flex flex-col md:flex-row gap-3 md:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-[rgb(var(--muted))]" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search campaigns..."
                  className="pl-10 h-9 sm:h-10 text-sm"
                />
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
              {[
                { value: 'all' as const, label: 'All Campaigns' },
                { value: 'ACTIVE' as const, label: 'Active' },
                { value: 'DRAFT' as const, label: 'Drafts' },
                { value: 'CLOSED' as const, label: 'Closed' },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setFilter(tab.value)}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                    filter === tab.value
                      ? 'bg-gradient-to-r from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] text-white'
                      : 'bg-[rgb(var(--surface))] text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] border border-[rgb(var(--border))]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Campaigns List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--brand-primary))]" />
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
            <div className="space-y-3 sm:space-y-4">
              {filteredCampaigns.map((listing) => {
                const StatusIcon = getStatusIcon(listing.status)
                return (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="border border-[rgb(var(--border))] hover:border-[rgb(var(--brand-primary))]/40 transition-all">
                      <CardContent className="p-3 sm:p-4 lg:p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm sm:text-base lg:text-lg font-bold mb-1 sm:mb-2 line-clamp-1">
                                  {listing.title}
                                </h3>
                                <p className="text-sm text-[rgb(var(--muted))] line-clamp-2 mb-3">
                                  {listing.description}
                                </p>
                              </div>
                              <Badge variant={getStatusColor(listing.status) as any}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {listing.status}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4">
                              <div className="flex items-center gap-2 text-sm">
                                <Users className="h-4 w-4 text-[rgb(var(--muted))]" />
                                <span className="text-[rgb(var(--muted))]">
                                  {listing.totalSlots || 1} slots
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <DollarSign className="h-4 w-4 text-[rgb(var(--muted))]" />
                                <span className="text-[rgb(var(--muted))]">
                                  {formatCurrency(Number(listing.budgetMin || 0))}-{formatCurrency(Number(listing.budgetMax || 0))}
                                </span>
                              </div>
                              {listing.campaignStartDate && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Calendar className="h-4 w-4 text-[rgb(var(--muted))]" />
                                  <span className="text-[rgb(var(--muted))]">
                                    {new Date(listing.campaignStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-sm">
                                <TrendingUp className="h-4 w-4 text-[rgb(var(--muted))]" />
                                <span className="text-[rgb(var(--muted))]">
                                  {listing._count?.applications ?? 0} applied
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {listing.compensationType && (
                                <Badge variant="outline">{listing.compensationType}</Badge>
                              )}
                              {(listing.targetPlatforms || []).slice(0, 2).map((platform: string) => (
                                <Badge key={platform} variant="outline">
                                  {platform}
                                </Badge>
                              ))}
                              {(listing.targetPlatforms || []).length > 2 && (
                                <Badge variant="outline">+{listing.targetPlatforms.length - 2}</Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex md:flex-col gap-2 md:gap-3 pt-4 md:pt-0 border-t md:border-t-0 md:border-l md:pl-6 border-[rgb(var(--border))]">
                            <Link href={`/brand/campaigns/${listing.id}`} className="flex-1 md:flex-none">
                              <Button variant="outline" size="sm" className="w-full">
                                <Eye className="h-4 w-4 mr-2" />
                                <span className="hidden md:inline">View</span>
                              </Button>
                            </Link>
                            {listing.status === 'DRAFT' && (
                              <Button variant="ghost" size="sm" className="flex-1 md:flex-none">
                                <Edit className="h-4 w-4 mr-2" />
                                <span className="hidden md:inline">Edit</span>
                              </Button>
                            )}
                          </div>
                        </div>
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
