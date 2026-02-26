'use client'

import { useState } from 'react'
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
import { useInfluencerAnalytics } from '@/hooks/queries/use-analytics'
import { useInfluencerProfile } from '@/hooks/queries/use-discovery'
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

// Theme-aligned blue/purple palette for charts
const CHART_COLORS = ['#2563EB', '#7C3AED', '#6366F1', '#3B82F6', '#8B5CF6', '#60A5FA']

// Custom tooltip that respects theme
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--surface-elevated))] px-3 py-2">
      <p className="text-xs font-medium text-[rgb(var(--foreground))] mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-xs text-[rgb(var(--muted))]">
          <span style={{ color: entry.color }}>{entry.name || entry.dataKey}</span>:{' '}
          <span className="font-semibold text-[rgb(var(--foreground))]">
            {formatCompactNumber(entry.value)}
          </span>
        </p>
      ))}
    </div>
  )
}

// Responsive pie label — hides on small screens
function renderPieLabel({ name, percent, cx, x }: any) {
  const anchor = x > cx ? 'start' : 'end'
  return (
    <text
      x={x}
      y={undefined}
      fill="rgb(var(--muted))"
      textAnchor={anchor}
      dominantBaseline="central"
      className="text-[10px] sm:text-xs hidden sm:block"
    >
      {`${name} ${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

function getPlatformIcon(platform: string) {
  switch (platform) {
    case 'INSTAGRAM':
      return <Instagram className="h-4 w-4" />
    case 'YOUTUBE':
      return <Youtube className="h-4 w-4" />
    default:
      return <Globe className="h-4 w-4" />
  }
}

function formatPlatformName(platform: string): string {
  switch (platform) {
    case 'INSTAGRAM': return 'Instagram'
    case 'YOUTUBE': return 'YouTube'
    case 'TIKTOK': return 'TikTok'
    case 'TWITTER': return 'Twitter'
    case 'FACEBOOK': return 'Facebook'
    case 'LINKEDIN': return 'LinkedIn'
    default: return platform.charAt(0) + platform.slice(1).toLowerCase()
  }
}

export default function InfluencerAnalyticsPage() {
  const { user } = useAuth()
  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useInfluencerAnalytics(user?.influencerId || '')
  const { data: profile, isLoading: profileLoading, error: profileError } = useInfluencerProfile(user?.influencerId || '')
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  const isLoading = analyticsLoading || profileLoading
  const error = analyticsError && profileError ? 'Failed to load analytics data. Please try again later.' : null

  // No influencer ID available
  if (!user?.influencerId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[rgb(var(--background))] to-[rgb(var(--surface))]">
        <div className="container py-4 sm:py-6 lg:py-8">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="h-10 w-10 text-[rgb(var(--muted))] mb-4" />
            <h2 className="text-lg sm:text-xl font-semibold mb-2">Influencer Profile Required</h2>
            <p className="text-sm text-[rgb(var(--muted))] max-w-md">
              Your account does not have an influencer profile linked. Please complete your onboarding to access analytics.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[rgb(var(--background))] to-[rgb(var(--surface))]">
        <div className="container py-4 sm:py-6 lg:py-8">
          <div className="animate-pulse space-y-4 sm:space-y-6">
            <div className="h-8 bg-[rgb(var(--surface))] rounded w-1/3" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-28 sm:h-32 bg-[rgb(var(--surface))] rounded-xl" />
              ))}
            </div>
            <div className="h-56 sm:h-72 bg-[rgb(var(--surface))] rounded-xl" />
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="h-56 bg-[rgb(var(--surface))] rounded-xl" />
              <div className="h-56 bg-[rgb(var(--surface))] rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !analytics && !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[rgb(var(--background))] to-[rgb(var(--surface))]">
        <div className="container py-4 sm:py-6 lg:py-8">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="h-10 w-10 text-[rgb(var(--error))] mb-4" />
            <h2 className="text-lg sm:text-xl font-semibold mb-2">Unable to Load Analytics</h2>
            <p className="text-sm text-[rgb(var(--muted))] max-w-md mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2 min-h-[40px] rounded-lg bg-gradient-to-r from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Try Again
            </button>
          </div>
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
    },
    {
      title: 'Avg Engagement',
      value: `${(analytics?.avgEngagementRate || 0).toFixed(1)}%`,
      icon: Heart,
    },
    {
      title: 'Total Reach',
      value: formatCompactNumber(Number(profile?.metrics?.totalReach || 0)),
      icon: Eye,
    },
    {
      title: 'Authenticity',
      value: `${profile?.metrics?.authenticityScore || 0}/100`,
      icon: BarChart3,
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
      <div className="container py-4 sm:py-6 lg:py-8">
        <motion.div initial="initial" animate="animate" variants={staggerContainer}>
          {/* Header */}
          <motion.div variants={staggerItem} className="mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 gradient-text">
              Analytics Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-[rgb(var(--muted))]">
              Track your performance and audience insights
            </p>
          </motion.div>

          {/* Time Range Selector */}
          <motion.div variants={staggerItem} className="mb-4 sm:mb-6">
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
              {[
                { value: '7d', label: '7D' },
                { value: '30d', label: '30D' },
                { value: '90d', label: '90D' },
                { value: '1y', label: '1Y' },
              ].map((range) => (
                <button
                  key={range.value}
                  onClick={() => setTimeRange(range.value as any)}
                  className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all min-h-[36px] sm:min-h-[40px] ${
                    timeRange === range.value
                      ? 'bg-gradient-to-r from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] text-white'
                      : 'bg-[rgb(var(--surface))] text-[rgb(var(--muted))] hover:bg-[rgb(var(--surface-hover))] border border-[rgb(var(--border))]'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6"
          >
            {stats.map((stat) => (
              <motion.div key={stat.title} variants={staggerItem}>
                <Card className="border border-[rgb(var(--border))] hover:border-[rgb(var(--brand-primary))]/30 transition-colors">
                  <CardContent className="p-3 sm:p-4 lg:p-5">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <div className="p-1.5 sm:p-2 rounded-lg bg-[rgb(var(--brand-primary))]/10">
                        <stat.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[rgb(var(--brand-primary))]" />
                      </div>
                      <span className="text-[10px] sm:text-xs text-[rgb(var(--muted))] truncate">
                        {stat.title}
                      </span>
                    </div>
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-[rgb(var(--foreground))]">
                      {stat.value}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Growth Trend Chart */}
          {growthTrend.length > 0 && (
            <motion.div variants={staggerItem} className="mb-4 sm:mb-6">
              <Card className="border border-[rgb(var(--border))]">
                <CardHeader className="p-3 sm:p-4 lg:p-5 pb-0">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base font-semibold">
                    <TrendingUp className="h-4 w-4 text-[rgb(var(--brand-primary))]" />
                    Growth Trend
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 sm:p-4 lg:p-5 pt-2">
                  <div className="h-48 sm:h-56 lg:h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={growthTrend} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgb(var(--border))"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="month"
                          stroke="rgb(var(--muted))"
                          tick={{ fontSize: 11 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="rgb(var(--muted))"
                          tick={{ fontSize: 11 }}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(v) => formatCompactNumber(v)}
                        />
                        <Tooltip content={<ChartTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="followers"
                          stroke="#2563EB"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorFollowers)"
                          name="Followers"
                          dot={false}
                          activeDot={{ r: 4, fill: '#2563EB', stroke: '#fff', strokeWidth: 2 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Platform Breakdown + Gender Distribution */}
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
            {/* Platform Breakdown */}
            <motion.div variants={staggerItem}>
              <Card className="h-full border border-[rgb(var(--border))]">
                <CardHeader className="p-3 sm:p-4 lg:p-5 pb-0">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base font-semibold">
                    <PieChart className="h-4 w-4 text-[rgb(var(--brand-primary))]" />
                    Platform Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 lg:p-5">
                  {platforms.length > 0 ? (
                    <div className="space-y-3">
                      {platforms.map((platform: any) => {
                        const engagementRate = Number(platform.engagementRate) || 0
                        return (
                          <div key={platform.platform} className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-[rgb(var(--brand-primary))]">
                                  {getPlatformIcon(platform.platform)}
                                </span>
                                <span className="text-sm font-medium">
                                  {formatPlatformName(platform.platform)}
                                </span>
                              </div>
                              <span className="text-xs text-[rgb(var(--muted))]">
                                {formatCompactNumber(platform.followers)} followers
                              </span>
                            </div>
                            <div className="flex items-center gap-2.5">
                              <div className="flex-1 h-1.5 bg-[rgb(var(--surface))] rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] rounded-full transition-all"
                                  style={{
                                    width: `${Math.min(engagementRate * 10, 100)}%`,
                                  }}
                                />
                              </div>
                              <span className="text-xs font-medium text-[rgb(var(--brand-primary))] w-10 text-right">
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
              <Card className="h-full border border-[rgb(var(--border))]">
                <CardHeader className="p-3 sm:p-4 lg:p-5 pb-0">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base font-semibold">
                    <Users className="h-4 w-4 text-[rgb(var(--brand-primary))]" />
                    Gender Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 sm:p-4 lg:p-5 pt-2">
                  {genderData.length > 0 ? (
                    <>
                      <div className="h-44 sm:h-52 lg:h-56">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPie>
                            <Pie
                              data={genderData}
                              cx="50%"
                              cy="50%"
                              innerRadius="38%"
                              outerRadius="68%"
                              paddingAngle={3}
                              dataKey="value"
                              label={renderPieLabel}
                              labelLine={{ stroke: 'rgb(var(--muted))', strokeWidth: 1 }}
                              stroke="rgb(var(--surface))"
                              strokeWidth={2}
                            >
                              {genderData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip content={<ChartTooltip />} />
                          </RechartsPie>
                        </ResponsiveContainer>
                      </div>
                      {/* Mobile legend */}
                      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2 sm:hidden">
                        {genderData.map((item, i) => (
                          <div key={item.name} className="flex items-center gap-1.5">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                            />
                            <span className="text-[10px] text-[rgb(var(--muted))]">
                              {item.name}: {String(item.value)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-[rgb(var(--muted))] text-center py-8">
                      No gender data available
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Age Demographics + Top Locations */}
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Age Demographics */}
            <motion.div variants={staggerItem}>
              <Card className="border border-[rgb(var(--border))]">
                <CardHeader className="p-3 sm:p-4 lg:p-5 pb-0">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base font-semibold">
                    <Calendar className="h-4 w-4 text-[rgb(var(--brand-primary))]" />
                    Age Demographics
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 sm:p-4 lg:p-5 pt-2">
                  {ageData.length > 0 ? (
                    <div className="h-44 sm:h-52 lg:h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={ageData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgb(var(--border))"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="range"
                            stroke="rgb(var(--muted))"
                            tick={{ fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            stroke="rgb(var(--muted))"
                            tick={{ fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(v) => `${v}%`}
                          />
                          <Tooltip content={<ChartTooltip />} />
                          <Bar
                            dataKey="percentage"
                            fill="#2563EB"
                            radius={[4, 4, 0, 0]}
                            name="Percentage"
                            maxBarSize={36}
                          />
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
              <Card className="border border-[rgb(var(--border))]">
                <CardHeader className="p-3 sm:p-4 lg:p-5 pb-0">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base font-semibold">
                    <Globe className="h-4 w-4 text-[rgb(var(--brand-primary))]" />
                    Top Locations
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 lg:p-5">
                  {locationData.length > 0 ? (
                    <div className="space-y-3">
                      {locationData.map((location: any, index: number) => (
                        <div key={location.country || index} className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{location.country}</span>
                            <span className="text-xs font-medium text-[rgb(var(--brand-primary))]">
                              {location.percentage}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-[rgb(var(--surface))] rounded-full overflow-hidden">
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
