'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  MapPin,
  Users,
  TrendingUp,
  Heart,
  Eye,
  MessageCircle,
  CheckCircle2,
  Star,
  Instagram,
  Youtube,
  Share2,
  Flag,
  Calendar,
  DollarSign,
  Award,
  Sparkles,
  BarChart3,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api-client'
import { formatCompactNumber, formatCurrency } from '@/lib/utils'
import { staggerContainer, staggerItem } from '@/lib/animations'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const COLORS = ['#8B5CF6', '#3B82F6', '#10B981']

async function fetchInfluencerProfile(id: string) {
  const res = await api.get<any>(`/discovery/influencers/${id}`)
  if (res.error) throw new Error(res.error)
  return res.data
}

/** Map of pricing field keys to human-readable labels */
const PRICING_FIELDS: { key: string; label: string }[] = [
  { key: 'instagramPost', label: 'Instagram Post' },
  { key: 'instagramStory', label: 'Instagram Story' },
  { key: 'instagramReel', label: 'Instagram Reel' },
  { key: 'tiktokVideo', label: 'TikTok Video' },
  { key: 'youtubeVideo', label: 'YouTube Video' },
  { key: 'youtubeShort', label: 'YouTube Short' },
  { key: 'twitterPost', label: 'Twitter Post' },
  { key: 'facebookPost', label: 'Facebook Post' },
]

function getPlatformIcon(platform: string) {
  switch (platform) {
    case 'INSTAGRAM':
      return <Instagram className="h-6 w-6" />
    case 'YOUTUBE':
      return <Youtube className="h-6 w-6" />
    case 'TIKTOK':
      return <BarChart3 className="h-6 w-6" />
    case 'TWITTER':
      return <Share2 className="h-6 w-6" />
    case 'FACEBOOK':
      return <Users className="h-6 w-6" />
    default:
      return <Sparkles className="h-6 w-6" />
  }
}

function formatPlatformName(platform: string) {
  const names: Record<string, string> = {
    INSTAGRAM: 'Instagram',
    YOUTUBE: 'YouTube',
    TIKTOK: 'TikTok',
    TWITTER: 'Twitter',
    FACEBOOK: 'Facebook',
  }
  return names[platform] || platform
}

function formatAvailability(availability: string) {
  const map: Record<string, string> = {
    AVAILABLE: 'Available',
    BUSY: 'Busy',
    NOT_AVAILABLE: 'Not Available',
  }
  return map[availability] || availability
}

export default function InfluencerProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [influencer, setInfluencer] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSaved, setIsSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'content'>('overview')

  useEffect(() => {
    loadInfluencer()
  }, [params.id])

  const loadInfluencer = async () => {
    try {
      const data = await fetchInfluencerProfile(params.id as string)
      setInfluencer(data)
    } catch (error) {
      console.error('Error loading influencer:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-4 sm:py-6 lg:py-8">
        <div className="animate-pulse space-y-4 sm:space-y-6">
          <div className="h-64 bg-[rgb(var(--surface))] rounded-xl" />
          <div className="h-96 bg-[rgb(var(--surface))] rounded-xl" />
        </div>
      </div>
    )
  }

  if (!influencer) {
    return (
      <div className="container py-4 sm:py-6 lg:py-8">
        <Card className="text-center py-16">
          <CardContent>
            <h2 className="text-2xl font-bold mb-4">Influencer Not Found</h2>
            <Link href="/brand/discover">
              <Button variant="gradient">Back to Discovery</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const primaryPlatform = influencer.platforms?.[0]
  const ageRanges = influencer.audience?.ageRanges || {}
  const ageData = Object.entries(ageRanges).map(([range, percentage]) => ({
    range,
    percentage: Number(percentage),
  }))

  const genderSplit = (influencer.audience?.genderSplit as any) || {}
  const genderData = [
    { name: 'Male', value: Number(genderSplit.male || 0) },
    { name: 'Female', value: Number(genderSplit.female || 0) },
    { name: 'Other', value: Number(genderSplit.other || 0) },
  ]

  const topCountries = (influencer.audience?.topCountries as any[]) || []

  const growthTrend = (influencer.growthTrend || []).map((entry: any) => ({
    month: new Date(entry.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    followers: entry.followers,
    engagementRate: Number(entry.engagementRate),
  }))

  const recentPosts = influencer.recentPosts || []

  const engagementRate = Number(influencer.metrics?.avgEngagementRate || 0)
  const totalReach = Number(influencer.metrics?.totalReach || 0)
  const authenticityScore = influencer.metrics?.authenticityScore || 0
  const brandSafetyScore = influencer.metrics?.brandSafetyScore || 0
  const rating = Number(influencer.rating || 0)
  const totalReviews = influencer.totalReviews || 0
  const totalCampaigns = influencer.totalCampaigns || 0
  const campaignSuccessRate = Number(influencer.campaignSuccessRate || 0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-[rgb(var(--background))] to-[rgb(var(--surface))]">
      <div className="container py-4 sm:py-6 lg:py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-4 sm:mb-6"
        >
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Discovery
          </Button>
        </motion.div>

        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          {/* Header Section */}
          <motion.div variants={staggerItem}>
            <Card className="overflow-hidden border-2 mb-4 sm:mb-6 lg:mb-8">
              <div className="relative h-48 bg-gradient-to-br from-[rgb(var(--brand-primary))]/20 to-[rgb(var(--brand-secondary))]/20">
                {influencer.coverImage && (
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${influencer.coverImage})`,
                      opacity: 0.3,
                    }}
                  />
                )}
              </div>

              <CardContent className="p-3 sm:p-4 lg:p-6 xl:p-8">
                <div className="flex flex-col md:flex-row gap-4 sm:gap-6 -mt-16 sm:-mt-20 relative">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-[rgb(var(--background))] bg-[rgb(var(--surface))] overflow-hidden">
                      <img
                        src={influencer.avatar}
                        alt={influencer.fullName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {influencer.verified && (
                      <div className="absolute bottom-0 right-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center border-4 border-[rgb(var(--background))]">
                        <CheckCircle2 className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3 sm:mb-4">
                      <div>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">
                          {influencer.fullName}
                        </h1>
                        <p className="text-base sm:text-lg text-[rgb(var(--brand-primary))] font-medium mb-2">
                          {influencer.username}
                        </p>
                        <div className="flex items-center gap-2 text-[rgb(var(--muted))] mb-3">
                          <MapPin className="h-4 w-4" />
                          {influencer.location}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setIsSaved(!isSaved)}
                          className="min-h-[44px] min-w-[44px]"
                        >
                          <Heart
                            className={`h-5 w-5 ${
                              isSaved ? 'fill-red-500 text-red-500' : ''
                            }`}
                          />
                        </Button>
                        <Button variant="outline" size="icon" className="min-h-[44px] min-w-[44px]">
                          <Share2 className="h-5 w-5" />
                        </Button>
                        <Button variant="outline" size="icon" className="min-h-[44px] min-w-[44px]">
                          <Flag className="h-5 w-5" />
                        </Button>
                        <Button variant="gradient" className="px-6 sm:px-8 min-h-[44px]">
                          Invite to Campaign
                        </Button>
                      </div>
                    </div>

                    <p className="text-[rgb(var(--muted))] mb-3 sm:mb-4">{influencer.bio}</p>

                    {/* Categories */}
                    <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
                      {(influencer.categories || []).map((cat: string) => (
                        <Badge key={cat} variant="outline">
                          {cat}
                        </Badge>
                      ))}
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                      <div className="text-center p-2 sm:p-3 rounded-lg bg-[rgb(var(--surface))]">
                        <div className="text-lg sm:text-xl lg:text-2xl font-bold gradient-text">
                          {primaryPlatform ? formatCompactNumber(primaryPlatform.followers) : '0'}
                        </div>
                        <div className="text-xs text-[rgb(var(--muted))]">
                          Followers
                        </div>
                      </div>
                      <div className="text-center p-2 sm:p-3 rounded-lg bg-[rgb(var(--surface))]">
                        <div className="text-lg sm:text-xl lg:text-2xl font-bold gradient-text">
                          {engagementRate.toFixed(1)}%
                        </div>
                        <div className="text-xs text-[rgb(var(--muted))]">
                          Engagement
                        </div>
                      </div>
                      <div className="text-center p-2 sm:p-3 rounded-lg bg-[rgb(var(--surface))]">
                        <div className="text-lg sm:text-xl lg:text-2xl font-bold gradient-text">
                          {formatCompactNumber(totalReach)}
                        </div>
                        <div className="text-xs text-[rgb(var(--muted))]">
                          Total Reach
                        </div>
                      </div>
                      <div className="text-center p-2 sm:p-3 rounded-lg bg-[rgb(var(--surface))]">
                        <div className="flex items-center justify-center gap-1 text-lg sm:text-xl lg:text-2xl font-bold">
                          {rating.toFixed(1)}
                          <Star className="h-5 w-5 fill-[rgb(var(--warning))] text-[rgb(var(--warning))]" />
                        </div>
                        <div className="text-xs text-[rgb(var(--muted))]">
                          Rating ({totalReviews})
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tabs */}
          <motion.div variants={staggerItem} className="mb-8">
            <div className="flex gap-2 border-b border-[rgb(var(--border))]">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'analytics', label: 'Analytics' },
                { id: 'content', label: 'Recent Content' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-3 font-medium transition-all ${
                    activeTab === tab.id
                      ? 'border-b-2 border-[rgb(var(--brand-primary))] text-[rgb(var(--brand-primary))]'
                      : 'text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* Platforms */}
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(influencer.platforms || []).map((platform: any) => (
                      <div
                        key={platform.platform}
                        className="p-4 rounded-lg bg-[rgb(var(--surface))] space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getPlatformIcon(platform.platform)}
                            <div>
                              <div className="font-semibold">
                                {formatPlatformName(platform.platform)}
                              </div>
                              <div className="text-sm text-[rgb(var(--muted))]">
                                {platform.handle}
                              </div>
                            </div>
                          </div>
                          {platform.verified && (
                            <Badge variant="primary">Verified</Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div>
                            <div className="text-lg font-bold">
                              {formatCompactNumber(platform.followers)}
                            </div>
                            <div className="text-xs text-[rgb(var(--muted))]">
                              Followers
                            </div>
                          </div>
                          <div>
                            <div className="text-lg font-bold">
                              {Number(platform.engagementRate).toFixed(1)}%
                            </div>
                            <div className="text-xs text-[rgb(var(--muted))]">
                              Engagement
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Campaign Stats (replaces Past Collaborations) */}
                <Card>
                  <CardHeader>
                    <CardTitle>Campaign Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-8">
                      <div>
                        <div className="text-2xl font-bold">
                          {totalCampaigns}
                        </div>
                        <div className="text-sm text-[rgb(var(--muted))]">
                          Total Campaigns
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-500">
                          {campaignSuccessRate.toFixed(0)}%
                        </div>
                        <div className="text-sm text-[rgb(var(--muted))]">
                          Success Rate
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-8">
                {/* Pricing */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-[rgb(var(--brand-primary))]" />
                      Pricing
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {influencer.pricing ? (
                      <>
                        {PRICING_FIELDS.map(({ key, label }) => {
                          const price = Number(influencer.pricing?.[key] || 0)
                          if (price === 0) return null
                          return (
                            <div
                              key={key}
                              className="flex items-center justify-between p-3 rounded-lg bg-[rgb(var(--surface))]"
                            >
                              <span className="text-sm">
                                {label}
                              </span>
                              <span className="font-bold gradient-text">
                                {formatCurrency(price, influencer.pricing?.currency || 'USD')}
                              </span>
                            </div>
                          )
                        })}
                        {influencer.pricing.negotiable && (
                          <p className="text-sm text-[rgb(var(--muted))] mt-2">
                            Prices are negotiable
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-[rgb(var(--muted))]">
                        Pricing not available
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Availability */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-[rgb(var(--brand-primary))]" />
                      Availability
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge
                      variant={
                        influencer.availability === 'AVAILABLE' ? 'success' : 'warning'
                      }
                      className="mb-3"
                    >
                      {formatAvailability(influencer.availability)}
                    </Badge>
                    {influencer.nextAvailableDate && (
                      <p className="text-sm text-[rgb(var(--muted))]">
                        Next available:{' '}
                        {new Date(influencer.nextAvailableDate).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Authenticity Score */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-[rgb(var(--brand-primary))]" />
                      Trust & Safety
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Authenticity Score</span>
                        <span className="font-bold">
                          {authenticityScore}/100
                        </span>
                      </div>
                      <div className="h-2 bg-[rgb(var(--surface))] rounded-full">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                          style={{
                            width: `${authenticityScore}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Brand Safety Score</span>
                        <span className="font-bold">
                          {brandSafetyScore}/100
                        </span>
                      </div>
                      <div className="h-2 bg-[rgb(var(--surface))] rounded-full">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                          style={{
                            width: `${brandSafetyScore}%`,
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="grid lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Growth Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  {growthTrend.length > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={growthTrend}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="followers"
                            stroke="#8B5CF6"
                            strokeWidth={3}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-[rgb(var(--muted))] text-center py-8">
                      No growth trend data available
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Age Demographics</CardTitle>
                </CardHeader>
                <CardContent>
                  {ageData.length > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={ageData}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis dataKey="range" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="percentage" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-[rgb(var(--muted))] text-center py-8">
                      No demographic data available
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Gender Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  {genderData.some((d) => d.value > 0) ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={genderData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}%`}
                            outerRadius={80}
                            dataKey="value"
                          >
                            {genderData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-[rgb(var(--muted))] text-center py-8">
                      No gender data available
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Countries</CardTitle>
                </CardHeader>
                <CardContent>
                  {topCountries.length > 0 ? (
                    <div className="space-y-4">
                      {topCountries.map((country: any) => (
                        <div key={country.country} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{country.country}</span>
                            <span className="text-sm text-[rgb(var(--muted))]">
                              {country.percentage}%
                            </span>
                          </div>
                          <div className="h-2 bg-[rgb(var(--surface))] rounded-full">
                            <div
                              className="h-full bg-gradient-to-r from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] rounded-full"
                              style={{ width: `${country.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[rgb(var(--muted))] text-center py-8">
                      No country data available
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Recent Content Tab */}
          {activeTab === 'content' && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentPosts.length > 0 ? (
                recentPosts.map((post: any) => (
                  <Card key={post.id} className="overflow-hidden group">
                    <div className="aspect-square bg-[rgb(var(--surface))] relative">
                      {post.thumbnail ? (
                        <img
                          src={post.thumbnail}
                          alt="Content"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[rgb(var(--muted))]">
                          <Eye className="h-12 w-12" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white">
                        <div className="flex items-center gap-2">
                          <Heart className="h-5 w-5" />
                          {formatCompactNumber(post.likes)}
                        </div>
                        <div className="flex items-center gap-2">
                          <MessageCircle className="h-5 w-5" />
                          {formatCompactNumber(post.comments)}
                        </div>
                        {post.views > 0 && (
                          <div className="flex items-center gap-2">
                            <Eye className="h-5 w-5" />
                            {formatCompactNumber(post.views)}
                          </div>
                        )}
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{post.type}</Badge>
                          <Badge variant="outline">{formatPlatformName(post.platform)}</Badge>
                        </div>
                        <span className="text-sm text-[rgb(var(--muted))]">
                          {Number(post.engagementRate).toFixed(1)}% eng.
                        </span>
                      </div>
                      {post.postedAt && (
                        <p className="text-xs text-[rgb(var(--muted))] mt-2">
                          {new Date(post.postedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="col-span-full text-center py-16">
                  <CardContent>
                    <p className="text-[rgb(var(--muted))]">
                      No recent content available
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
