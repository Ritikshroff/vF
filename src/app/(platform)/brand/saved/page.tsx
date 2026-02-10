'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Heart,
  Search,
  Filter,
  Users,
  TrendingUp,
  Star,
  Eye,
  MessageCircle,
  X,
  Folder,
  Plus,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { useAuth } from '@/contexts/auth-context'
import { fetchSavedInfluencers } from '@/services/brands'
import { getBrandByUserId, getAllBrands } from '@/mock-data/brands'
import { getAllInfluencers } from '@/mock-data/influencers'
import { formatCompactNumber } from '@/lib/utils'
import { staggerContainer, staggerItem } from '@/lib/animations'

export default function SavedInfluencersPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [savedIds, setSavedIds] = useState<string[]>([])
  const [influencers, setInfluencers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | string>('all')

  useEffect(() => {
    loadSavedInfluencers()
  }, [user])

  const loadSavedInfluencers = async () => {
    if (!user) return

    try {
      let brand = getBrandByUserId(user.id)

      // Fallback: use first brand for demo
      if (!brand) {
        console.warn(`No brand found for user ID: ${user.id}, using fallback brand`)
        brand = getAllBrands()[0]
      }

      if (brand) {
        const ids = await fetchSavedInfluencers(brand.id)
        setSavedIds(ids)

        const allInfs = getAllInfluencers()
        const saved = allInfs.filter((inf) => ids.includes(inf.id))
        setInfluencers(saved)
      }
    } catch (error) {
      console.error('Error loading saved influencers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUnsave = (influencerId: string) => {
    setSavedIds(savedIds.filter((id) => id !== influencerId))
    setInfluencers(influencers.filter((inf) => inf.id !== influencerId))
  }

  const filteredInfluencers = influencers.filter((inf) => {
    const matchesSearch =
      inf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inf.categories.some((cat: string) =>
        cat.toLowerCase().includes(searchQuery.toLowerCase())
      )

    const matchesFilter =
      filter === 'all' || inf.categories.includes(filter)

    return matchesSearch && matchesFilter
  })

  // Get unique categories
  const categories = Array.from(
    new Set(influencers.flatMap((inf) => inf.categories))
  ).slice(0, 6)

  if (loading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-[rgb(var(--surface))] rounded w-1/3" />
          <div className="grid md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-[rgb(var(--surface))] rounded" />
            ))}
          </div>
        </div>
      </div>
    )
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
          <motion.div variants={staggerItem} className="mb-4 sm:mb-6 lg:mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-5xl font-bold mb-2 gradient-text">
                  Saved Influencers
                </h1>
                <p className="text-sm lg:text-base xl:text-lg text-[rgb(var(--muted))]">
                  {influencers.length} influencer{influencers.length !== 1 ? 's' : ''} saved
                </p>
              </div>
              <Button variant="outline" size="lg" className="w-full md:w-auto">
                <Folder className="h-5 w-5 mr-2" />
                Create Collection
              </Button>
            </div>
          </motion.div>

          {/* Search & Filters */}
          <motion.div variants={staggerItem} className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
            <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-[rgb(var(--muted))]" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search saved influencers..."
                  className="pl-10 md:pl-12 h-12 md:h-14"
                />
              </div>
            </div>

            {/* Category Filters - Mobile Scrollable */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 md:px-6 py-2 md:py-3 rounded-full text-sm md:text-base font-medium whitespace-nowrap transition-all ${
                  filter === 'all'
                    ? 'bg-gradient-to-r from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] text-white shadow-lg'
                    : 'bg-[rgb(var(--surface))] text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]'
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setFilter(category)}
                  className={`px-4 md:px-6 py-2 md:py-3 rounded-full text-sm md:text-base font-medium whitespace-nowrap transition-all ${
                    filter === category
                      ? 'bg-gradient-to-r from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] text-white shadow-lg'
                      : 'bg-[rgb(var(--surface))] text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Influencers Grid */}
          {filteredInfluencers.length === 0 ? (
            <Card className="text-center py-12 md:py-16">
              <CardContent>
                <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-[rgb(var(--surface))] mb-4">
                  <Heart className="h-8 w-8 md:h-10 md:w-10 text-[rgb(var(--muted))]" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-2">
                  No saved influencers
                </h3>
                <p className="text-sm md:text-base text-[rgb(var(--muted))] mb-6">
                  {searchQuery
                    ? 'Try adjusting your search'
                    : 'Start saving influencers to build your list'}
                </p>
                <Link href="/brand/discover">
                  <Button variant="gradient">Discover Influencers</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              {filteredInfluencers.map((influencer) => (
                <motion.div
                  key={influencer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Card className="border-2 hover:border-[rgb(var(--brand-primary))]/40 transition-all h-full">
                    <CardContent className="p-3 sm:p-4 lg:p-6">
                      {/* Header with Unsave Button */}
                      <div className="flex items-start justify-between mb-4">
                        <Avatar className="h-16 w-16 md:h-20 md:w-20">
                          <img src={influencer.avatar} alt={influencer.name} />
                        </Avatar>
                        <button
                          onClick={() => handleUnsave(influencer.id)}
                          className="p-2 rounded-full hover:bg-red-500/10 text-red-500 transition-colors"
                          title="Remove from saved"
                        >
                          <Heart className="h-5 w-5 fill-current" />
                        </button>
                      </div>

                      {/* Name & Rating */}
                      <div className="mb-3">
                        <h3 className="text-lg font-bold mb-1 line-clamp-1">
                          {influencer.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                            <span className="text-sm font-medium">{influencer.rating}</span>
                          </div>
                          <span className="text-xs text-[rgb(var(--muted))]">
                            ({influencer.campaigns_completed} campaigns)
                          </span>
                        </div>
                      </div>

                      {/* Location */}
                      <div className="text-sm text-[rgb(var(--muted))] mb-3">
                        {influencer.location}
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-4 p-3 rounded-lg bg-[rgb(var(--surface))]">
                        <div>
                          <div className="text-xs text-[rgb(var(--muted))] mb-1">
                            Total Reach
                          </div>
                          <div className="font-bold text-sm">
                            {formatCompactNumber(
                              influencer.platforms.reduce(
                                (sum: number, p: any) => sum + p.followers,
                                0
                              )
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-[rgb(var(--muted))] mb-1">
                            Avg Engagement
                          </div>
                          <div className="font-bold text-sm">
                            {(
                              influencer.platforms.reduce(
                                (sum: number, p: any) => sum + p.engagement_rate,
                                0
                              ) / influencer.platforms.length
                            ).toFixed(1)}
                            %
                          </div>
                        </div>
                      </div>

                      {/* Categories */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {influencer.categories.slice(0, 2).map((category: string) => (
                          <Badge key={category} variant="outline" className="text-xs">
                            {category}
                          </Badge>
                        ))}
                        {influencer.categories.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{influencer.categories.length - 2}
                          </Badge>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Link href={`/brand/discover/${influencer.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>
                        <Button variant="gradient" size="sm" className="flex-1">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Message
                        </Button>
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
