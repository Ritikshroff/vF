'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Filter,
  MapPin,
  Users,
  TrendingUp,
  Heart,
  Eye,
  CheckCircle2,
  X,
  ChevronDown,
  Star,
  Instagram,
  Youtube,
  Clock,
  DollarSign,
  Sparkles,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  searchInfluencers,
  type InfluencerSearchFilters,
} from '@/services/influencers'
import type { InfluencerProfile } from '@/mock-data/influencers'
import { INFLUENCER_CATEGORIES, SOCIAL_PLATFORMS } from '@/lib/constants'
import { formatCompactNumber, formatCurrency } from '@/lib/utils'
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations'

export default function InfluencerDiscoveryPage() {
  const [influencers, setInfluencers] = useState<InfluencerProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [savedInfluencers, setSavedInfluencers] = useState<Set<string>>(new Set())

  const [filters, setFilters] = useState<InfluencerSearchFilters>({
    categories: [],
    platforms: [],
    min_followers: undefined,
    max_followers: undefined,
    min_engagement: undefined,
    max_engagement: undefined,
    availability: 'all',
    verified_only: false,
    sort_by: 'relevance',
    sort_order: 'desc',
  })

  const [totalResults, setTotalResults] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  // Fetch influencers
  useEffect(() => {
    loadInfluencers()
  }, [filters, currentPage])

  const loadInfluencers = async () => {
    setLoading(true)
    try {
      const result = await searchInfluencers(filters, currentPage, 12)
      setInfluencers(result.influencers)
      setTotalResults(result.total)
    } catch (error) {
      console.error('Error loading influencers:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleSaveInfluencer = (influencerId: string) => {
    setSavedInfluencers((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(influencerId)) {
        newSet.delete(influencerId)
      } else {
        newSet.add(influencerId)
      }
      return newSet
    })
  }

  const toggleCategory = (category: string) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories?.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...(prev.categories || []), category],
    }))
    setCurrentPage(1)
  }

  const togglePlatform = (platform: string) => {
    setFilters((prev) => ({
      ...prev,
      platforms: prev.platforms?.includes(platform)
        ? prev.platforms.filter((p) => p !== platform)
        : [...(prev.platforms || []), platform],
    }))
    setCurrentPage(1)
  }

  const clearAllFilters = () => {
    setFilters({
      categories: [],
      platforms: [],
      availability: 'all',
      verified_only: false,
      sort_by: 'relevance',
      sort_order: 'desc',
    })
    setCurrentPage(1)
  }

  const hasActiveFilters =
    (filters.categories?.length || 0) > 0 ||
    (filters.platforms?.length || 0) > 0 ||
    filters.min_followers ||
    filters.max_followers ||
    filters.min_engagement ||
    filters.verified_only

  return (
    <div className="min-h-screen bg-gradient-to-b from-[rgb(var(--background))] to-[rgb(var(--surface))]">
      <div className="container py-8">
        {/* Header */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="mb-8"
        >
          <motion.div variants={staggerItem} className="mb-6">
            <h1 className="text-4xl md:text-5xl font-bold mb-3 gradient-text">
              Discover Influencers
            </h1>
            <p className="text-lg text-[rgb(var(--muted))] max-w-2xl">
              Find the perfect creators for your campaigns. Browse our curated network
              of verified influencers across all major platforms.
            </p>
          </motion.div>

          {/* Search & Filter Bar */}
          <motion.div
            variants={staggerItem}
            className="flex flex-col md:flex-row gap-4"
          >
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[rgb(var(--muted))]" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, category, or location..."
                className="pl-12 h-14 text-lg border-2"
              />
            </div>

            <Button
              variant={showFilters ? 'gradient' : 'outline'}
              size="lg"
              onClick={() => setShowFilters(!showFilters)}
              className="h-14 px-8"
            >
              <Filter className="h-5 w-5 mr-2" />
              Filters
              {hasActiveFilters && (
                <Badge variant="primary" className="ml-2">
                  {(filters.categories?.length || 0) +
                    (filters.platforms?.length || 0)}
                </Badge>
              )}
            </Button>

            <select
              value={filters.sort_by}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  sort_by: e.target.value as any,
                }))
              }
              className="h-14 px-4 rounded-lg border-2 border-[rgb(var(--border))] bg-[rgb(var(--surface-elevated))] text-base min-w-[180px]"
            >
              <option value="relevance">Most Relevant</option>
              <option value="followers">Most Followers</option>
              <option value="engagement">Best Engagement</option>
              <option value="price">Lowest Price</option>
              <option value="rating">Highest Rated</option>
            </select>
          </motion.div>
        </motion.div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden"
            >
              <Card className="border-2">
                <CardContent className="p-6 space-y-6">
                  {/* Categories */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-[rgb(var(--brand-primary))]" />
                        Categories
                      </h3>
                      {filters.categories && filters.categories.length > 0 && (
                        <button
                          onClick={() =>
                            setFilters((prev) => ({ ...prev, categories: [] }))
                          }
                          className="text-sm text-[rgb(var(--brand-primary))] hover:underline"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {INFLUENCER_CATEGORIES.map((category) => (
                        <Button
                          key={category}
                          variant={
                            filters.categories?.includes(category)
                              ? 'default'
                              : 'outline'
                          }
                          size="sm"
                          onClick={() => toggleCategory(category)}
                          className={
                            filters.categories?.includes(category)
                              ? 'bg-gradient-to-r from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))]'
                              : ''
                          }
                        >
                          {category}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Platforms */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Platforms</h3>
                      {filters.platforms && filters.platforms.length > 0 && (
                        <button
                          onClick={() =>
                            setFilters((prev) => ({ ...prev, platforms: [] }))
                          }
                          className="text-sm text-[rgb(var(--brand-primary))] hover:underline"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {SOCIAL_PLATFORMS.map((platform) => (
                        <Button
                          key={platform.id}
                          variant={
                            filters.platforms?.includes(platform.name)
                              ? 'default'
                              : 'outline'
                          }
                          size="sm"
                          onClick={() => togglePlatform(platform.name)}
                          className={
                            filters.platforms?.includes(platform.name)
                              ? 'bg-gradient-to-r from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))]'
                              : ''
                          }
                        >
                          {platform.name}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Follower Range */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Min Followers
                      </label>
                      <Input
                        type="number"
                        placeholder="e.g., 10000"
                        value={filters.min_followers || ''}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            min_followers: e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Max Followers
                      </label>
                      <Input
                        type="number"
                        placeholder="e.g., 500000"
                        value={filters.max_followers || ''}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            max_followers: e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          }))
                        }
                      />
                    </div>
                  </div>

                  {/* Engagement Rate */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Min Engagement Rate (%)
                      </label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="e.g., 3.5"
                        value={filters.min_engagement || ''}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            min_engagement: e.target.value
                              ? parseFloat(e.target.value)
                              : undefined,
                          }))
                        }
                      />
                    </div>
                  </div>

                  {/* Additional Filters */}
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.verified_only}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            verified_only: e.target.checked,
                          }))
                        }
                        className="w-4 h-4 rounded border-[rgb(var(--border))]"
                      />
                      <span className="text-sm">Verified Only</span>
                    </label>

                    <select
                      value={filters.availability}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          availability: e.target.value as any,
                        }))
                      }
                      className="px-4 py-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--surface-elevated))] text-sm"
                    >
                      <option value="all">All Availability</option>
                      <option value="available">Available Now</option>
                      <option value="busy">Busy</option>
                    </select>
                  </div>

                  {/* Actions */}
                  {hasActiveFilters && (
                    <div className="flex justify-end gap-4 pt-4 border-t border-[rgb(var(--border))]">
                      <Button variant="ghost" onClick={clearAllFilters}>
                        Clear All Filters
                      </Button>
                      <Button variant="gradient" onClick={() => setShowFilters(false)}>
                        Apply Filters
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-[rgb(var(--muted))]">
            Showing <span className="font-semibold text-[rgb(var(--foreground))]">{influencers.length}</span> of{' '}
            <span className="font-semibold text-[rgb(var(--foreground))]">{totalResults}</span> influencers
          </p>
        </div>

        {/* Influencer Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="aspect-square bg-[rgb(var(--surface))] rounded-xl mb-4" />
                  <div className="h-6 bg-[rgb(var(--surface))] rounded mb-2" />
                  <div className="h-4 bg-[rgb(var(--surface))] rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : influencers.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <Users className="h-16 w-16 mx-auto mb-4 text-[rgb(var(--muted))]" />
              <h3 className="text-xl font-semibold mb-2">No influencers found</h3>
              <p className="text-[rgb(var(--muted))] mb-6">
                Try adjusting your filters or search criteria
              </p>
              <Button variant="outline" onClick={clearAllFilters}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {influencers.map((influencer, index) => (
              <motion.div
                key={influencer.id}
                variants={staggerItem}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="h-full overflow-hidden border-2 hover:border-[rgb(var(--brand-primary))]/40 transition-all group">
                  {/* Cover Image */}
                  <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-[rgb(var(--brand-primary))]/10 to-[rgb(var(--brand-secondary))]/10">
                    <div
                      className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                      style={{ backgroundImage: `url(${influencer.avatar})` }}
                    />

                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                        <Link href={`/brand/discover/${influencer.id}`} className="flex-1">
                          <Button variant="outline" className="w-full bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
                            <Eye className="h-4 w-4 mr-2" />
                            View Profile
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {/* Save Button */}
                    <button
                      onClick={() => toggleSaveInfluencer(influencer.id)}
                      className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-transform"
                    >
                      <Heart
                        className={`h-5 w-5 ${
                          savedInfluencers.has(influencer.id)
                            ? 'fill-red-500 text-red-500'
                            : 'text-gray-600'
                        }`}
                      />
                    </button>

                    {/* Verified Badge */}
                    {influencer.verified && (
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-blue-500 text-white">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-6">
                    {/* Profile Info */}
                    <div className="mb-4">
                      <h3 className="text-xl font-bold mb-1 line-clamp-1">
                        {influencer.fullName}
                      </h3>
                      <p className="text-sm text-[rgb(var(--brand-primary))] font-medium mb-2">
                        {influencer.username}
                      </p>
                      <p className="text-sm text-[rgb(var(--muted))] line-clamp-2 mb-3">
                        {influencer.bio}
                      </p>

                      {/* Location */}
                      <div className="flex items-center text-sm text-[rgb(var(--muted))] mb-3">
                        <MapPin className="h-4 w-4 mr-1" />
                        {influencer.location}
                      </div>

                      {/* Categories */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {influencer.categories.slice(0, 3).map((cat) => (
                          <Badge key={cat} variant="outline" className="text-xs">
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4 p-3 rounded-lg bg-[rgb(var(--surface))]">
                      <div>
                        <div className="flex items-center text-xs text-[rgb(var(--muted))] mb-1">
                          <Users className="h-3 w-3 mr-1" />
                          Followers
                        </div>
                        <div className="font-bold">
                          {formatCompactNumber(
                            Math.max(...influencer.platforms.map((p) => p.followers))
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center text-xs text-[rgb(var(--muted))] mb-1">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Engagement
                        </div>
                        <div className="font-bold">
                          {influencer.metrics.avg_engagement_rate.toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    {/* Platform Icons */}
                    <div className="flex items-center gap-2 mb-4">
                      {influencer.platforms.map((platform) => (
                        <div
                          key={platform.platform}
                          className="w-8 h-8 rounded-full bg-[rgb(var(--surface))] flex items-center justify-center"
                          title={`${platform.platform}: ${formatCompactNumber(platform.followers)}`}
                        >
                          {platform.platform === 'Instagram' && (
                            <Instagram className="h-4 w-4" />
                          )}
                          {platform.platform === 'YouTube' && (
                            <Youtube className="h-4 w-4" />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Pricing */}
                    <div className="flex items-center justify-between pt-4 border-t border-[rgb(var(--border))]">
                      <div>
                        <div className="text-xs text-[rgb(var(--muted))] mb-1">
                          Starting from
                        </div>
                        <div className="text-lg font-bold gradient-text">
                          {formatCurrency(influencer.pricing.instagram_post)}
                        </div>
                      </div>
                      <Button
                        variant="gradient"
                        size="sm"
                        className="rounded-full"
                      >
                        Invite
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Pagination */}
        {!loading && influencers.length > 0 && Math.ceil(totalResults / 12) > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {[...Array(Math.min(5, Math.ceil(totalResults / 12)))].map((_, i) => {
              const page = i + 1
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? 'gradient' : 'outline'}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              )
            })}
            <Button
              variant="outline"
              onClick={() =>
                setCurrentPage((p) =>
                  Math.min(Math.ceil(totalResults / 12), p + 1)
                )
              }
              disabled={currentPage === Math.ceil(totalResults / 12)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
