'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Filter,
  DollarSign,
  Users,
  Calendar,
  MapPin,
  Clock,
  TrendingUp,
  Briefcase,
  Star,
  ChevronDown,
  Eye,
  Send,
  Zap,
  Target,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'
import { formatCurrency, formatCompactNumber, formatRelativeTime } from '@/lib/utils'
import { staggerContainer, staggerItem } from '@/lib/animations'

interface MarketplaceListing {
  id: string
  title: string
  brand: { id: string; name: string; logo?: string; verified: boolean }
  description: string
  category: string
  budget: { min: number; max: number }
  platforms: string[]
  requirements: {
    minFollowers: number
    minEngagement: number
    categories: string[]
    locations?: string[]
  }
  deliverables: string[]
  deadline: string
  applicants: number
  maxInfluencers: number
  status: 'open' | 'closing_soon' | 'filled'
  featured: boolean
  createdAt: string
}

const MOCK_LISTINGS: MarketplaceListing[] = [
  {
    id: '1',
    title: 'Summer Fashion Collection Launch',
    brand: { id: 'b1', name: 'Luxe Fashion', verified: true },
    description: 'Looking for fashion and lifestyle influencers to showcase our new summer collection. Must have strong Instagram and TikTok presence with engaged audience in the 18-35 age range.',
    category: 'Fashion',
    budget: { min: 2000, max: 5000 },
    platforms: ['Instagram', 'TikTok'],
    requirements: { minFollowers: 50000, minEngagement: 3.5, categories: ['Fashion', 'Lifestyle'] },
    deliverables: ['3 Instagram Posts', '2 Instagram Reels', '1 TikTok Video'],
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    applicants: 23,
    maxInfluencers: 5,
    status: 'open',
    featured: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    title: 'Tech Product Review Campaign',
    brand: { id: 'b2', name: 'TechVibe', verified: true },
    description: 'Seeking tech reviewers and gadget enthusiasts for our latest smart home device launch. Honest, detailed reviews preferred.',
    category: 'Technology',
    budget: { min: 3000, max: 8000 },
    platforms: ['YouTube', 'Instagram'],
    requirements: { minFollowers: 100000, minEngagement: 4.0, categories: ['Tech', 'Gadgets'] },
    deliverables: ['1 YouTube Review (10+ min)', '2 Instagram Posts', '3 Stories'],
    deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    applicants: 45,
    maxInfluencers: 10,
    status: 'open',
    featured: true,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    title: 'Organic Skincare Brand Ambassador',
    brand: { id: 'b3', name: 'GreenLeaf Beauty', verified: false },
    description: 'Long-term partnership opportunity for beauty and wellness influencers who are passionate about organic, sustainable skincare products.',
    category: 'Beauty',
    budget: { min: 1500, max: 3000 },
    platforms: ['Instagram', 'TikTok', 'YouTube'],
    requirements: { minFollowers: 25000, minEngagement: 5.0, categories: ['Beauty', 'Wellness'] },
    deliverables: ['2 Posts/month', '4 Stories/month', '1 Reel/month'],
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    applicants: 67,
    maxInfluencers: 3,
    status: 'closing_soon',
    featured: false,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    title: 'Fitness Challenge Campaign',
    brand: { id: 'b4', name: 'FitPro Supplements', verified: true },
    description: 'Join our 30-day fitness challenge campaign! Looking for fitness influencers to document their journey using our new pre-workout supplement.',
    category: 'Fitness',
    budget: { min: 1000, max: 2500 },
    platforms: ['Instagram', 'TikTok', 'YouTube'],
    requirements: { minFollowers: 10000, minEngagement: 6.0, categories: ['Fitness', 'Health'] },
    deliverables: ['Daily Stories for 30 days', '4 Feed Posts', '2 Reels', '1 YouTube Video'],
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    applicants: 89,
    maxInfluencers: 8,
    status: 'open',
    featured: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    title: 'Food & Restaurant Review Series',
    brand: { id: 'b5', name: 'FoodieApp', verified: true },
    description: 'We\'re launching in 5 new cities and need local food influencers to review top restaurants using our app. Great exposure and competitive pay!',
    category: 'Food',
    budget: { min: 500, max: 1500 },
    platforms: ['Instagram', 'TikTok'],
    requirements: { minFollowers: 5000, minEngagement: 4.5, categories: ['Food', 'Lifestyle'], locations: ['New York', 'LA', 'Chicago', 'Miami', 'Austin'] },
    deliverables: ['5 Restaurant Reviews', '10 Stories', '3 Reels'],
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    applicants: 156,
    maxInfluencers: 25,
    status: 'open',
    featured: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    title: 'Gaming Peripherals Showcase',
    brand: { id: 'b6', name: 'EliteGear', verified: true },
    description: 'Looking for gaming content creators to showcase our new line of mechanical keyboards and gaming mice. Must be able to produce high-quality gameplay content.',
    category: 'Gaming',
    budget: { min: 2500, max: 6000 },
    platforms: ['YouTube', 'Twitch'],
    requirements: { minFollowers: 75000, minEngagement: 3.0, categories: ['Gaming', 'Tech'] },
    deliverables: ['1 Dedicated YouTube Video', '3 Twitch Stream Mentions', '2 Social Posts'],
    deadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
    applicants: 34,
    maxInfluencers: 6,
    status: 'open',
    featured: true,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

const CATEGORIES = ['All', 'Fashion', 'Technology', 'Beauty', 'Fitness', 'Food', 'Gaming', 'Travel', 'Lifestyle']

export default function MarketplacePage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState<'newest' | 'budget' | 'deadline'>('newest')
  const [showFilters, setShowFilters] = useState(false)

  const isInfluencer = user?.role === 'influencer'

  const filteredListings = MOCK_LISTINGS
    .filter(l => {
      const matchesSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.brand.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'All' || l.category === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'budget': return b.budget.max - a.budget.max
        case 'deadline': return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

  const featuredListings = filteredListings.filter(l => l.featured)
  const regularListings = filteredListings.filter(l => !l.featured)

  const getDaysLeft = (deadline: string) => {
    const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return days
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-surface">
      <div className="container py-4 md:py-8">
        <motion.div initial="initial" animate="animate" variants={staggerContainer}>
          {/* Header */}
          <motion.div variants={staggerItem} className="mb-6 md:mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-5xl font-bold gradient-text">Campaign Marketplace</h1>
                <p className="text-sm md:text-lg text-[rgb(var(--muted))]">
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
          <motion.div variants={staggerItem} className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6">
            {[
              { label: 'Open Campaigns', value: MOCK_LISTINGS.filter(l => l.status === 'open').length, icon: Briefcase, color: 'text-[rgb(var(--brand-primary))]' },
              { label: 'Total Budget', value: formatCurrency(MOCK_LISTINGS.reduce((sum, l) => sum + l.budget.max, 0)), icon: DollarSign, color: 'text-[rgb(var(--success))]' },
              { label: 'Applications', value: MOCK_LISTINGS.reduce((sum, l) => sum + l.applicants, 0), icon: Users, color: 'text-[rgb(var(--info))]' },
              { label: 'Featured', value: featuredListings.length, icon: Star, color: 'text-[rgb(var(--warning))]' },
            ].map(stat => (
              <Card key={stat.label}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[rgb(var(--surface))]">
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                    <div>
                      <div className="text-lg font-bold">{stat.value}</div>
                      <div className="text-xs text-[rgb(var(--muted))]">{stat.label}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Search & Filters */}
          <motion.div variants={staggerItem} className="mb-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
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
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
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
            <motion.div variants={staggerItem} className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-5 w-5 text-[rgb(var(--brand-primary))]" />
                <h2 className="text-xl font-bold">Featured Campaigns</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredListings.map(listing => (
                  <ListingCard key={listing.id} listing={listing} isInfluencer={isInfluencer} getDaysLeft={getDaysLeft} />
                ))}
              </div>
            </motion.div>
          )}

          {/* All Listings */}
          <motion.div variants={staggerItem}>
            <h2 className="text-xl font-bold mb-4">
              {selectedCategory === 'All' ? 'All Campaigns' : `${selectedCategory} Campaigns`}
              <span className="text-sm font-normal text-[rgb(var(--muted))] ml-2">({filteredListings.length})</span>
            </h2>

            {filteredListings.length === 0 ? (
              <Card className="text-center py-16">
                <CardContent>
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[rgb(var(--surface))] mb-4">
                    <Search className="h-10 w-10 text-[rgb(var(--muted))]" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No campaigns found</h3>
                  <p className="text-[rgb(var(--muted))]">Try adjusting your search or filters</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {regularListings.map(listing => (
                  <ListingCard key={listing.id} listing={listing} isInfluencer={isInfluencer} getDaysLeft={getDaysLeft} />
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
}: {
  listing: MarketplaceListing
  isInfluencer: boolean
  getDaysLeft: (d: string) => number
}) {
  const daysLeft = getDaysLeft(listing.deadline)

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Card className="border-2 hover:border-[rgb(var(--brand-primary))]/40 transition-all h-full flex flex-col">
        <CardContent className="p-4 md:p-6 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1">
              {listing.featured && (
                <Badge variant="warning" className="mb-2 text-[10px]">
                  <Zap className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
              <h3 className="text-lg font-bold line-clamp-2">{listing.title}</h3>
            </div>
            {listing.status === 'closing_soon' && (
              <Badge variant="error" className="shrink-0 text-[10px]">Closing Soon</Badge>
            )}
          </div>

          {/* Brand */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] flex items-center justify-center text-white text-[10px] font-bold">
              {listing.brand.name[0]}
            </div>
            <span className="text-sm text-[rgb(var(--muted))]">{listing.brand.name}</span>
            {listing.brand.verified && (
              <svg className="h-3.5 w-3.5 text-[rgb(var(--brand-primary))]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-[rgb(var(--muted))] line-clamp-2 mb-4">{listing.description}</p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-[rgb(var(--success))]" />
              <span>{formatCurrency(listing.budget.min)}-{formatCurrency(listing.budget.max)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-[rgb(var(--info))]" />
              <span>{listing.applicants} applied</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-[rgb(var(--warning))]" />
              <span>{daysLeft}d left</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-[rgb(var(--muted))]" />
              <span>{formatCompactNumber(listing.requirements.minFollowers)}+ followers</span>
            </div>
          </div>

          {/* Platforms */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {listing.platforms.map(p => (
              <Badge key={p} variant="outline" className="text-[10px]">{p}</Badge>
            ))}
            <Badge variant="outline" className="text-[10px]">{listing.category}</Badge>
          </div>

          {/* Deliverables */}
          <div className="mb-4 pb-4 border-b border-[rgb(var(--border))]">
            <div className="text-xs text-[rgb(var(--muted))] mb-1.5 font-medium">Deliverables:</div>
            <div className="flex flex-wrap gap-1">
              {listing.deliverables.slice(0, 3).map((d, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 bg-[rgb(var(--surface))] rounded">{d}</span>
              ))}
              {listing.deliverables.length > 3 && (
                <span className="text-[10px] px-2 py-0.5 bg-[rgb(var(--surface))] rounded">+{listing.deliverables.length - 3}</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-auto flex gap-2">
            <Link href={`/marketplace/${listing.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                <Eye className="h-4 w-4 mr-1" />
                Details
              </Button>
            </Link>
            {isInfluencer && (
              <Button variant="gradient" size="sm" className="flex-1">
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
