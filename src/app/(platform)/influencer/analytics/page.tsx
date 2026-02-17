'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  Users,
  Eye,
  Heart,
  BarChart3,
  PieChart,
  Globe,
  Instagram,
  Youtube,
  Calendar,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import { getInfluencerAnalytics } from '@/services/api/analytics'
import { api } from '@/lib/api-client'
import { formatCompactNumber } from '@/lib/utils'
import { staggerContainer, staggerItem } from '@/lib/animations'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899']

function getPlatformIcon(platform: string) {
  switch (platform) {
    case 'INSTAGRAM':
      return <Instagram className="h-4 w-4" />
    case 'YOUTUBE':
      return <Youtube className="h-4 w-4" />
    case 'TIKTOK':
      return <Globe className="h-4 w-4" />
    case 'TWITTER':
      return <Globe className="h-4 w-4" />
    default:
      return <Globe className="h-4 w-4" />
  }
}

function formatPlatformName(platform: string): string {
  switch (platform) {
    case 'INSTAGRAM':
      return 'Instagram'
    case 'YOUTUBE':
      return 'YouTube'
    case 'TIKTOK':
      return 'TikTok'
    case 'TWITTER':
      return 'Twitter'
    case 'FACEBOOK':
      return 'Facebook'
    case 'LINKEDIN':
      return 'LinkedIn'
    default:
      return platform.charAt(0) + platform.slice(1).toLowerCase()
  }
}

export default function InfluencerAnalyticsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  const loadAnalytics = useCallback(async () => {
    if (!user?.influencerId) return

    setLoading(true)
    setError(null)

    try {
      const [profileResult, analyticsResult] = await Promise.allSettled([
        api.get<any>(`/discovery/influencers/${user.influencerId}`),
        getInfluencerAnalytics(user.influencerId),
      ])

      if (profileResult.status === 'fulfilled' && profileResult.value.data) {
        setProfile(profileResult.value.data)
      } else if (profileResult.status === 'rejected') {
        console.error('Failed to load profile:', profileResult.reason)
      }

      if (analyticsResult.status === 'fulfilled') {
        setAnalytics(analyticsResult.value)
      } else if (analyticsResult.status === 'rejected') {
        console.error('Failed to load analytics:', analyticsResult.reason)
      }

      // If both failed, show error
      if (
        profileResult.status === 'rejected' &&
        analyticsResult.status === 'rejected'
      ) {
        setError('Failed to load analytics data. Please try again later.')
      }
    } catch (err) {
      console.error('Error loading analytics:', err)
      setError('An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }, [user?.influencerId])

  useEffect(() => {
    loadAnalytics()
  }, [loadAnalytics])

  // No influencer ID available
  if (!user?.influencerId) {
    return (
      <div className="container py-4 sm:py-6 lg:py-8">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="h-12 w-12 text-[rgb(var(--muted))] mb-4" />
          <h2 className="text-xl font-semibold mb-2">Influencer Profile Required</h2>
          <p className="text-[rgb(var(--muted))] max-w-md">
            Your account does not have an influencer profile linked. Please complete your onboarding to access analytics.
          </p>
        </div>
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="container py-4 sm:py-6 lg:py-8">
        <div className="animate-pulse space-y-4 sm:space-y-6">
          <div className="h-8 bg-[rgb(var(--surface))] rounded w-1/3" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-[rgb(var(--surface))] rounded" />
            ))}
          </div>
          <div className="h-80 bg-[rgb(var(--surface))] rounded" />
          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="h-64 bg-[rgb(var(--surface))] rounded" />
            <div className="h-64 bg-[rgb(var(--surface))] rounded" />
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !analytics && !profile) {
    return (
      <div className="container py-4 sm:py-6 lg:py-8">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Unable to Load Analytics</h2>
          <p className="text-[rgb(var(--muted))] max-w-md mb-4">{error}</p>
          <button
            onClick={loadAnalytics}
            className="px-6 py-2 min-h-[44px] rounded-lg bg-gradient-to-r from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] text-white font-medium hover:opacity-90 transition-opacity"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Build stats from analytics data
  const stats = [
    {
      title: 'Total Followers',
      value: formatCompactNumber(analytics?.totalFollowers || 0),
      icon: Users,
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Avg Engagement',
      value: `${(analytics?.avgEngagementRate || 0).toFixed(1)}%`,
      icon: Heart,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Total Reach',
      value: formatCompactNumber(Number(profile?.metrics?.totalReach || 0)),
      icon: Eye,
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Authenticity',
      value: `${profile?.metrics?.authenticityScore || 0}/100`,
      icon: BarChart3,
      color: 'from-orange-500 to-red-500',
    },
  ]

  // Prepare platform breakdown from profile
  const platforms = profile?.platforms || []

  // Prepare audience age data
  const ageRanges = profile?.audience?.ageRanges || {}
  const ageData = Object.entries(ageRanges).map(([range, percentage]) => ({
    range,
    percentage,
  }))

  // Prepare gender data
  const genderSplit = profile?.audience?.genderSplit || {}
  const genderData = Object.entries(genderSplit).map(([gender, percentage]) => ({
    name: gender.charAt(0).toUpperCase() + gender.slice(1),
    value: percentage,
  }))

  // Prepare location data
  const topCountries: any[] = profile?.audience?.topCountries || []
  const locationData = topCountries.slice(0, 5)

  // Prepare growth trend data
  const growthTrend = (profile?.growthTrend || []).map((entry: any) => ({
    month: new Date(entry.month).toLocaleDateString('en-US', { month: 'short' }),
    followers: entry.followers,
    engagementRate: Number(entry.engagementRate),
  }))

  return (
    <div className="min-h-screen bg-gradient-to-b from-[rgb(var(--background))] to-[rgb(var(--surface))]">
      <div className="container py-8">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          {/* Header */}
          <motion.div variants={staggerItem} className="mb-4 sm:mb-6 lg:mb-8">
            <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold mb-2 sm:mb-3 gradient-text">
              Analytics Dashboard
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-[rgb(var(--muted))]">
              Track your performance and audience insights
            </p>
          </motion.div>

          {/* Time Range Selector */}
          <motion.div variants={staggerItem} className="flex gap-2 mb-4 sm:mb-6 lg:mb-8 overflow-x-auto pb-2">
            {[
              { value: '7d', label: 'Last 7 Days' },
              { value: '30d', label: 'Last 30 Days' },
              { value: '90d', label: 'Last 90 Days' },
              { value: '1y', label: 'Last Year' },
            ].map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value as any)}
                className={`px-4 py-2 min-h-[44px] rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  timeRange === range.value
                    ? 'bg-gradient-to-r from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] text-white'
                    : 'bg-[rgb(var(--surface))] text-[rgb(var(--muted))] hover:bg-[rgb(var(--surface-hover))]'
                }`}
              >
                {range.label}
              </button>
            ))}
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8"
          >
            {stats.map((stat) => (
              <motion.div key={stat.title} variants={staggerItem}>
                <Card className="border-2 hover:border-[rgb(var(--brand-primary))]/40 transition-all">
                  <CardContent className="p-3 sm:p-4 lg:p-6">
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div
                        className={`p-2 sm:p-3 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-10`}
                      >
                        <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                    </div>
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 gradient-text">
                      {stat.value}
                    </div>
                    <div className="text-xs sm:text-sm text-[rgb(var(--muted))]">
                      {stat.title}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Growth Trend Chart */}
          {growthTrend.length > 0 && (
            <motion.div variants={staggerItem} className="mb-4 sm:mb-6 lg:mb-8">
              <Card>
                <CardHeader className="p-3 sm:p-4 lg:p-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <TrendingUp className="h-5 w-5 text-[rgb(var(--brand-primary))]" />
                    Growth Trend
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <div className="h-64 sm:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={growthTrend}>
                        <defs>
                          <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.3} />
                        <XAxis dataKey="month" stroke="#6B7280" />
                        <YAxis stroke="#6B7280" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgb(var(--surface-elevated))',
                            border: '1px solid rgb(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="followers"
                          stroke="#8B5CF6"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorFollowers)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-4 sm:mb-6 lg:mb-8">
            {/* Platform Breakdown */}
            <motion.div variants={staggerItem}>
              <Card className="h-full">
                <CardHeader className="p-3 sm:p-4 lg:p-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <PieChart className="h-5 w-5 text-[rgb(var(--brand-primary))]" />
                    Platform Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  {platforms.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                      {platforms.map((platform: any) => {
                        const engagementRate = Number(platform.engagementRate) || 0
                        return (
                          <div key={platform.platform} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {getPlatformIcon(platform.platform)}
                                <span className="font-medium">
                                  {formatPlatformName(platform.platform)}
                                </span>
                              </div>
                              <span className="text-sm text-[rgb(var(--muted))]">
                                {formatCompactNumber(platform.followers)} followers
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-2 bg-[rgb(var(--surface))] rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] rounded-full"
                                  style={{
                                    width: `${Math.min(engagementRate * 10, 100)}%`,
                                  }}
                                />
                              </div>
                              <span className="text-sm font-medium">
                                {engagementRate.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-[rgb(var(--muted))] text-center py-8">
                      No platform data available
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Audience Gender Distribution */}
            <motion.div variants={staggerItem}>
              <Card className="h-full">
                <CardHeader className="p-3 sm:p-4 lg:p-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Users className="h-5 w-5 text-[rgb(var(--brand-primary))]" />
                    Gender Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  {genderData.length > 0 ? (
                    <div className="h-48 sm:h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPie>
                          <Pie
                            data={genderData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {genderData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </RechartsPie>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-sm text-[rgb(var(--muted))] text-center py-8">
                      No gender data available
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* Age Demographics */}
            <motion.div variants={staggerItem}>
              <Card>
                <CardHeader className="p-3 sm:p-4 lg:p-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Calendar className="h-5 w-5 text-[rgb(var(--brand-primary))]" />
                    Age Demographics
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  {ageData.length > 0 ? (
                    <div className="h-48 sm:h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={ageData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.3} />
                          <XAxis dataKey="range" stroke="#6B7280" />
                          <YAxis stroke="#6B7280" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgb(var(--surface-elevated))',
                              border: '1px solid rgb(var(--border))',
                              borderRadius: '8px',
                            }}
                          />
                          <Bar dataKey="percentage" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-sm text-[rgb(var(--muted))] text-center py-8">
                      No age demographic data available
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Top Locations */}
            <motion.div variants={staggerItem}>
              <Card>
                <CardHeader className="p-3 sm:p-4 lg:p-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Globe className="h-5 w-5 text-[rgb(var(--brand-primary))]" />
                    Top Locations
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  {locationData.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                      {locationData.map((location: any, index: number) => (
                        <div key={location.country || index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{location.country}</span>
                            <span className="text-sm text-[rgb(var(--muted))]">
                              {location.percentage}%
                            </span>
                          </div>
                          <div className="h-2 bg-[rgb(var(--surface))] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] rounded-full transition-all"
                              style={{ width: `${location.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[rgb(var(--muted))] text-center py-8">
                      No location data available
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
