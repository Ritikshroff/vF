'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Filter,
  DollarSign,
  Users,
  Clock,
  TrendingUp,
  Briefcase,
  Star,
  Eye,
  Send,
  Zap,
  Target,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'
import { formatCurrency, formatCompactNumber, formatRelativeTime } from '@/lib/utils'
import { staggerContainer, staggerItem } from '@/lib/animations'
import { useListings } from '@/hooks/queries/use-marketplace'
import { useApplyToListing } from '@/hooks/mutations/use-marketplace-mutations'

const CATEGORIES = ['All', 'Fashion', 'Technology', 'Beauty', 'Fitness', 'Food', 'Gaming', 'Travel', 'Lifestyle']

export default function MarketplacePage() {
  const { user } = useAuth()
  const { data: listingsData, isLoading } = useListings()
  const applyMutation = useApplyToListing()

  const listings: any[] = listingsData?.data ?? []

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState<'newest' | 'budget' | 'deadline'>('newest')
  const [showFilters, setShowFilters] = useState(false)

  const isInfluencer = user?.role === 'INFLUENCER'

  const handleApply = (listingId: string) => {
    applyMutation.mutate({ listingId, data: { coverLetter: 'Interested in this opportunity!' } })
  }

  const filteredListings = listings
    .filter(l => {
      const matchesSearch = !searchQuery ||
        l.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.brand?.companyName?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'All' ||
        (l.targetNiches || []).some((n: string) => n.toLowerCase() === selectedCategory.toLowerCase())
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'budget': return (Number(b.budgetMax) || 0) - (Number(a.budgetMax) || 0)
        case 'deadline': return new Date(a.applicationDeadline || 0).getTime() - new Date(b.applicationDeadline || 0).getTime()
        default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

  const featuredListings = filteredListings.filter(l => l.isFeatured)
  const regularListings = filteredListings.filter(l => !l.isFeatured)

  const getDaysLeft = (deadline: string) => {
    if (!deadline) return 0
    const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return days
  }

  const totalBudget = listings.reduce((sum, l) => sum + (Number(l.budgetMax) || 0), 0)
  const totalApplicants = listings.reduce((sum, l) => sum + (l._count?.applications || 0), 0)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--muted))]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-surface">
      <div className="container py-4 sm:py-6 lg:py-8">
        <motion.div initial="initial" animate="animate" variants={staggerContainer}>
          {/* Header */}
          <motion.div variants={staggerItem} className="mb-4 sm:mb-6 lg:mb-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold gradient-text">Campaign Marketplace</h1>
                <p className="text-sm lg:text-base text-[rgb(var(--muted))]">
                  {isInfluencer ? 'Discover brand collaboration opportunities' : 'Post campaigns and find creators'}
                </p>
              </div>
              {!isInfluencer && (
                <Link href="/brand/campaigns/new">
                  <Button variant="gradient">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Post Campaign
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>

          {/* Stats Bar */}
          <motion.div variants={staggerItem} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
            {[
              { label: 'Open Campaigns', value: listings.length, icon: Briefcase, color: 'text-[rgb(var(--brand-primary))]' },
              { label: 'Total Budget', value: formatCurrency(totalBudget), icon: DollarSign, color: 'text-[rgb(var(--success))]' },
              { label: 'Applications', value: totalApplicants, icon: Users, color: 'text-[rgb(var(--info))]' },
              { label: 'Featured', value: featuredListings.length, icon: Star, color: 'text-[rgb(var(--warning))]' },
            ].map(stat => (
              <Card key={stat.label}>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-[rgb(var(--surface))]">
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                    <div>
                      <div className="text-base sm:text-lg font-bold">{stat.value}</div>
                      <div className="text-xs text-[rgb(var(--muted))]">{stat.label}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Search & Filters */}
          <motion.div variants={staggerItem} className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[rgb(var(--muted))]" />
                <Input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search campaigns, brands, categories..."
                  className="pl-12 h-12"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="h-12"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as typeof sortBy)}
                  className="h-12 px-4 rounded-xl bg-[rgb(var(--surface))] border border-[rgb(var(--border))] text-sm text-[rgb(var(--foreground))] outline-none"
                >
                  <option value="newest">Newest</option>
                  <option value="budget">Highest Budget</option>
                  <option value="deadline">Deadline</option>
                </select>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-gradient-to-r from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] text-white shadow-lg'
                      : 'bg-[rgb(var(--surface))] text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Featured Listings */}
          {featuredListings.length > 0 && (
            <motion.div variants={staggerItem} className="mb-6 sm:mb-8">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Zap className="h-5 w-5 text-[rgb(var(--brand-primary))]" />
                <h2 className="text-lg sm:text-xl font-bold">Featured Campaigns</h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {featuredListings.map(listing => (
                  <ListingCard key={listing.id} listing={listing} isInfluencer={isInfluencer} getDaysLeft={getDaysLeft} onApply={handleApply} />
                ))}
              </div>
            </motion.div>
          )}

          {/* All Listings */}
          <motion.div variants={staggerItem}>
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
              {selectedCategory === 'All' ? 'All Campaigns' : `${selectedCategory} Campaigns`}
              <span className="text-sm font-normal text-[rgb(var(--muted))] ml-2">({filteredListings.length})</span>
            </h2>

            {filteredListings.length === 0 ? (
              <Card className="text-center py-12 sm:py-16">
                <CardContent>
                  <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[rgb(var(--surface))] mb-4">
                    <Search className="h-8 w-8 sm:h-10 sm:w-10 text-[rgb(var(--muted))]" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">No campaigns found</h3>
                  <p className="text-sm sm:text-base text-[rgb(var(--muted))]">Try adjusting your search or filters</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {regularListings.map(listing => (
                  <ListingCard key={listing.id} listing={listing} isInfluencer={isInfluencer} getDaysLeft={getDaysLeft} onApply={handleApply} />
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

function ListingCard({
  listing,
  isInfluencer,
  getDaysLeft,
  onApply,
}: {
  listing: any
  isInfluencer: boolean
  getDaysLeft: (d: string) => number
  onApply: (id: string) => void
}) {
  const daysLeft = listing.applicationDeadline ? getDaysLeft(listing.applicationDeadline) : null
  const applicants = listing._count?.applications || 0

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Card className="border-2 hover:border-[rgb(var(--brand-primary))]/40 transition-all h-full flex flex-col">
        <CardContent className="p-3 sm:p-4 lg:p-6 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
            <div className="flex-1">
              {listing.isFeatured && (
                <Badge variant="warning" className="mb-1.5 sm:mb-2 text-[10px]">
                  <Zap className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
              <h3 className="text-base sm:text-lg font-bold line-clamp-2">{listing.title}</h3>
            </div>
          </div>

          {/* Brand */}
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] flex items-center justify-center text-white text-[10px] font-bold">
              {(listing.brand?.companyName || 'B')[0]}
            </div>
            <span className="text-sm text-[rgb(var(--muted))]">{listing.brand?.companyName || 'Brand'}</span>
            {listing.brand?.verified && (
              <svg className="h-3.5 w-3.5 text-[rgb(var(--brand-primary))]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-[rgb(var(--muted))] line-clamp-2 mb-3 sm:mb-4">{listing.description}</p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
            {(listing.budgetMin || listing.budgetMax) && (
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-[rgb(var(--success))]" />
                <span>
                  {listing.budgetMin && listing.budgetMax
                    ? `${formatCurrency(Number(listing.budgetMin))}-${formatCurrency(Number(listing.budgetMax))}`
                    : formatCurrency(Number(listing.budgetMax || listing.budgetMin || 0))}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-[rgb(var(--info))]" />
              <span>{applicants} applied</span>
            </div>
            {daysLeft !== null && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-[rgb(var(--warning))]" />
                <span>{daysLeft > 0 ? `${daysLeft}d left` : 'Expired'}</span>
              </div>
            )}
            {listing.minFollowers && (
              <div className="flex items-center gap-2 text-sm">
                <Target className="h-4 w-4 text-[rgb(var(--muted))]" />
                <span>{formatCompactNumber(listing.minFollowers)}+ followers</span>
              </div>
            )}
          </div>

          {/* Platforms & Niches */}
          <div className="flex flex-wrap gap-1.5 mb-3 sm:mb-4">
            {(listing.targetPlatforms || []).map((p: string) => (
              <Badge key={p} variant="outline" className="text-[10px]">{p}</Badge>
            ))}
            {(listing.targetNiches || []).slice(0, 2).map((n: string) => (
              <Badge key={n} variant="outline" className="text-[10px]">{n}</Badge>
            ))}
          </div>

          {/* Compensation Type */}
          {listing.compensationType && (
            <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-[rgb(var(--border))]">
              <div className="text-xs text-[rgb(var(--muted))] mb-1.5 font-medium">Compensation:</div>
              <span className="text-[10px] px-2 py-0.5 bg-[rgb(var(--surface))] rounded">
                {listing.compensationType.replace(/_/g, ' ')}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="mt-auto flex gap-2">
            <Link href={`/marketplace/${listing.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                <Eye className="h-4 w-4 mr-1" />
                Details
              </Button>
            </Link>
            {isInfluencer && (
              <Button variant="gradient" size="sm" className="flex-1" onClick={() => onApply(listing.id)}>
                <Send className="h-4 w-4 mr-1" />
                Apply
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
