'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  DollarSign,
  Users,
  Calendar,
  Clock,
  MapPin,
  Target,
  CheckCircle2,
  Star,
  Share2,
  Bookmark,
  Send,
  Shield,
  TrendingUp,
  Zap,
  FileText,
  MessageCircle,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { useAuth } from '@/contexts/auth-context'
import { formatCurrency, formatCompactNumber, formatDate, getInitials } from '@/lib/utils'
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations'

// Mock listing detail
const MOCK_LISTING = {
  id: '1',
  title: 'Summer Fashion Collection Launch',
  brand: {
    id: 'b1',
    name: 'Luxe Fashion',
    logo: null,
    verified: true,
    description: 'Premium fashion brand specializing in sustainable luxury wear.',
    campaigns: 24,
    avgRating: 4.8,
    totalSpend: 250000,
  },
  description: `We're launching our exciting new Summer 2026 collection and looking for passionate fashion and lifestyle influencers to help us share it with the world!

**What we're looking for:**
- Fashion-forward influencers with an engaged audience
- Strong visual storytelling skills
- Experience with product photography
- Authentic content that aligns with our brand values

**Campaign Details:**
This is a product seeding + paid collaboration. You'll receive our full summer collection (valued at $2,000+) plus compensation for your content creation.

**Timeline:**
- Content creation period: 2 weeks
- Posting schedule: Flexible within campaign window
- Review period: 3 business days`,
  category: 'Fashion',
  budget: { min: 2000, max: 5000 },
  platforms: ['Instagram', 'TikTok'],
  requirements: {
    minFollowers: 50000,
    minEngagement: 3.5,
    categories: ['Fashion', 'Lifestyle', 'Beauty'],
    locations: ['United States', 'Canada', 'United Kingdom'],
    ageRange: '18-35',
    languages: ['English'],
  },
  deliverables: [
    { type: 'Instagram Post', quantity: 3, description: 'High-quality product photos with brand tags' },
    { type: 'Instagram Reel', quantity: 2, description: 'Try-on haul or styling video (30-60s)' },
    { type: 'TikTok Video', quantity: 1, description: 'Unboxing or GRWM content' },
    { type: 'Instagram Stories', quantity: 5, description: 'Behind-the-scenes and polls' },
  ],
  deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  applicants: 23,
  maxInfluencers: 5,
  status: 'open' as const,
  featured: true,
  perks: ['Free product collection ($2,000+ value)', 'Early access to future drops', 'Exclusive discount code for audience', 'Feature on brand channels'],
  createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
}

export default function MarketplaceListingPage() {
  const { user } = useAuth()
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [showApplication, setShowApplication] = useState(false)
  const [applicationNote, setApplicationNote] = useState('')

  const isInfluencer = user?.role === 'INFLUENCER'
  const listing = MOCK_LISTING
  const daysLeft = Math.ceil((new Date(listing.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-surface">
      <div className="container max-w-5xl py-4 sm:py-6 lg:py-8">
        <motion.div initial="initial" animate="animate" variants={staggerContainer}>
          {/* Back Navigation */}
          <motion.div variants={staggerItem} className="mb-4 sm:mb-6">
            <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Marketplace
            </Link>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Header Card */}
              <motion.div variants={staggerItem}>
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className="flex-1">
                        {listing.featured && (
                          <Badge variant="warning" className="mb-2">
                            <Zap className="h-3 w-3 mr-1" />
                            Featured Campaign
                          </Badge>
                        )}
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">{listing.title}</h1>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] flex items-center justify-center text-white text-xs font-bold">
                              {listing.brand.name[0]}
                            </div>
                            <span className="font-medium">{listing.brand.name}</span>
                            {listing.brand.verified && (
                              <svg className="h-4 w-4 text-[rgb(var(--brand-primary))]" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <Badge variant="outline">{listing.category}</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setIsBookmarked(!isBookmarked)}
                          className={`p-2 rounded-lg transition-all ${isBookmarked ? 'text-[rgb(var(--brand-primary))] bg-[rgb(var(--brand-primary))]/10' : 'text-[rgb(var(--muted))] hover:bg-[rgb(var(--surface))]'}`}
                        >
                          <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
                        </button>
                        <button className="p-2 rounded-lg text-[rgb(var(--muted))] hover:bg-[rgb(var(--surface))] transition-all">
                          <Share2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {/* Key Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-[rgb(var(--surface))]">
                      <div className="text-center">
                        <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-1 text-[rgb(var(--success))]" />
                        <div className="text-base sm:text-lg font-bold">{formatCurrency(listing.budget.min)}-{formatCurrency(listing.budget.max)}</div>
                        <div className="text-xs text-[rgb(var(--muted))]">Budget</div>
                      </div>
                      <div className="text-center">
                        <Users className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-1 text-[rgb(var(--info))]" />
                        <div className="text-base sm:text-lg font-bold">{listing.applicants}/{listing.maxInfluencers}</div>
                        <div className="text-xs text-[rgb(var(--muted))]">Applied/Spots</div>
                      </div>
                      <div className="text-center">
                        <Clock className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-1 text-[rgb(var(--warning))]" />
                        <div className="text-base sm:text-lg font-bold">{daysLeft}d</div>
                        <div className="text-xs text-[rgb(var(--muted))]">Days Left</div>
                      </div>
                      <div className="text-center">
                        <Target className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-1 text-[rgb(var(--brand-primary))]" />
                        <div className="text-base sm:text-lg font-bold">{formatCompactNumber(listing.requirements.minFollowers)}+</div>
                        <div className="text-xs text-[rgb(var(--muted))]">Min Followers</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Description */}
              <motion.div variants={staggerItem}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-[rgb(var(--brand-primary))]" />
                      Campaign Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm prose-invert max-w-none">
                      {listing.description.split('\n').map((line, i) => {
                        if (line.startsWith('**') && line.endsWith('**')) {
                          return <h4 key={i} className="font-semibold text-[rgb(var(--foreground))] mt-4 mb-2">{line.replace(/\*\*/g, '')}</h4>
                        }
                        if (line.startsWith('- ')) {
                          return (
                            <div key={i} className="flex items-start gap-2 ml-2 mb-1">
                              <CheckCircle2 className="h-4 w-4 text-[rgb(var(--success))] mt-0.5 shrink-0" />
                              <span className="text-sm text-[rgb(var(--muted))]">{line.slice(2)}</span>
                            </div>
                          )
                        }
                        if (line.trim()) {
                          return <p key={i} className="text-sm text-[rgb(var(--muted))] mb-2">{line}</p>
                        }
                        return null
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Deliverables */}
              <motion.div variants={staggerItem}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-[rgb(var(--brand-primary))]" />
                      Required Deliverables
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 sm:space-y-3">
                      {listing.deliverables.map((del, i) => (
                        <div key={i} className="flex items-start gap-3 sm:gap-4 p-3 rounded-lg bg-[rgb(var(--surface))]">
                          <div className="w-8 h-8 rounded-full bg-[rgb(var(--brand-primary))]/10 flex items-center justify-center text-[rgb(var(--brand-primary))] font-bold text-sm shrink-0">
                            {del.quantity}x
                          </div>
                          <div>
                            <div className="font-medium text-sm">{del.type}</div>
                            <div className="text-xs text-[rgb(var(--muted))]">{del.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Perks */}
              <motion.div variants={staggerItem}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-[rgb(var(--brand-primary))]" />
                      Perks & Benefits
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 gap-2 sm:gap-3">
                      {listing.perks.map((perk, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-[rgb(var(--surface))]">
                          <CheckCircle2 className="h-4 w-4 text-[rgb(var(--success))] shrink-0" />
                          <span className="text-sm">{perk}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4 sm:space-y-6">
              {/* Apply Card */}
              {isInfluencer && (
                <motion.div variants={staggerItem}>
                  <Card className="border-[rgb(var(--brand-primary))]/30">
                    <CardContent className="p-4 sm:p-6">
                      {!showApplication ? (
                        <>
                          <Button variant="gradient" className="w-full mb-3" onClick={() => setShowApplication(true)}>
                            <Send className="h-4 w-4 mr-2" />
                            Apply to Campaign
                          </Button>
                          <p className="text-xs text-center text-[rgb(var(--muted))]">
                            {listing.maxInfluencers - listing.applicants > 0
                              ? `${listing.maxInfluencers - listing.applicants} spots remaining`
                              : 'Accepting waitlist applications'}
                          </p>
                        </>
                      ) : (
                        <div className="space-y-3">
                          <h3 className="font-semibold">Your Application</h3>
                          <textarea
                            value={applicationNote}
                            onChange={e => setApplicationNote(e.target.value)}
                            placeholder="Tell the brand why you're a great fit for this campaign..."
                            className="w-full bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-xl p-3 text-sm text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted))] outline-none resize-none min-h-[120px]"
                            rows={4}
                          />
                          <Button variant="gradient" className="w-full">
                            <Send className="h-4 w-4 mr-2" />
                            Submit Application
                          </Button>
                          <Button variant="ghost" className="w-full" onClick={() => setShowApplication(false)}>
                            Cancel
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Requirements */}
              <motion.div variants={staggerItem}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Requirements</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    <div>
                      <div className="text-xs text-[rgb(var(--muted))] mb-1">Min Followers</div>
                      <div className="font-semibold">{formatCompactNumber(listing.requirements.minFollowers)}+</div>
                    </div>
                    <div>
                      <div className="text-xs text-[rgb(var(--muted))] mb-1">Min Engagement</div>
                      <div className="font-semibold">{listing.requirements.minEngagement}%+</div>
                    </div>
                    <div>
                      <div className="text-xs text-[rgb(var(--muted))] mb-1">Categories</div>
                      <div className="flex flex-wrap gap-1">
                        {listing.requirements.categories.map(c => (
                          <Badge key={c} variant="outline" className="text-[10px]">{c}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-[rgb(var(--muted))] mb-1">Platforms</div>
                      <div className="flex flex-wrap gap-1">
                        {listing.platforms.map(p => (
                          <Badge key={p} variant="outline" className="text-[10px]">{p}</Badge>
                        ))}
                      </div>
                    </div>
                    {listing.requirements.locations && (
                      <div>
                        <div className="text-xs text-[rgb(var(--muted))] mb-1">Locations</div>
                        <div className="flex flex-wrap gap-1">
                          {listing.requirements.locations.map(l => (
                            <Badge key={l} variant="outline" className="text-[10px]">{l}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="text-xs text-[rgb(var(--muted))] mb-1">Timeline</div>
                      <div className="text-sm">
                        <p>Starts: {formatDate(listing.startDate)}</p>
                        <p>Deadline: {formatDate(listing.deadline)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Brand Info */}
              <motion.div variants={staggerItem}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">About the Brand</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] flex items-center justify-center text-white font-bold">
                        {listing.brand.name[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold">{listing.brand.name}</span>
                          {listing.brand.verified && (
                            <svg className="h-4 w-4 text-[rgb(var(--brand-primary))]" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-[rgb(var(--muted))]">
                          <Star className="h-3 w-3 text-[rgb(var(--brand-primary))]" />
                          <span>{listing.brand.avgRating}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-[rgb(var(--muted))] mb-4">{listing.brand.description}</p>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <div className="text-center p-2 sm:p-3 rounded-lg bg-[rgb(var(--surface))]">
                        <div className="text-sm sm:text-base font-bold">{listing.brand.campaigns}</div>
                        <div className="text-xs text-[rgb(var(--muted))]">Campaigns</div>
                      </div>
                      <div className="text-center p-2 sm:p-3 rounded-lg bg-[rgb(var(--surface))]">
                        <div className="text-sm sm:text-base font-bold">{formatCurrency(listing.brand.totalSpend)}</div>
                        <div className="text-xs text-[rgb(var(--muted))]">Total Spend</div>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full mt-4" size="sm">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message Brand
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Safety */}
              <motion.div variants={staggerItem}>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-[rgb(var(--success))]" />
                      <div>
                        <div className="text-sm font-medium">Secure Payment</div>
                        <div className="text-xs text-[rgb(var(--muted))]">Funds held in escrow until delivery</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
