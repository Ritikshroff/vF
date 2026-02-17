'use client'

import { useState, useEffect } from 'react'
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
import { fetchBrandCampaigns } from '@/services/api/campaigns'
import { formatCurrency } from '@/lib/utils'
import { staggerContainer, staggerItem } from '@/lib/animations'

export default function BrandCampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'PAUSED'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadCampaigns()
  }, [])

  const loadCampaigns = async () => {
    try {
      const data = await fetchBrandCampaigns()
      setCampaigns(data)
    } catch (error) {
      console.error('Error loading campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCampaigns = campaigns.filter((listing) => {
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
      <div className="container py-4 md:py-8">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          {/* Header */}
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

          {/* Stats Cards */}
          <motion.div
            variants={staggerItem}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8"
          >
            {[
              { label: 'Total', value: stats.total, color: 'from-purple-500 to-pink-500' },
              { label: 'Active', value: stats.active, color: 'from-green-500 to-emerald-500' },
              { label: 'Draft', value: stats.draft, color: 'from-orange-500 to-yellow-500' },
              { label: 'Closed', value: stats.closed, color: 'from-blue-500 to-cyan-500' },
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

          {/* Search & Filters */}
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

          {/* Campaigns List */}
          {loading ? (
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
            <div className="space-y-4 md:space-y-6">
              {filteredCampaigns.map((listing) => {
                const StatusIcon = getStatusIcon(listing.status)
                return (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="border-2 hover:border-[rgb(var(--brand-primary))]/40 transition-all">
                      <CardContent className="p-4 md:p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg md:text-xl font-bold mb-2 line-clamp-1">
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
