'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  Users,
  Eye,
  Heart,
  MessageCircle,
  DollarSign,
  BarChart3,
  PieChart,
  Globe,
  Instagram,
  Youtube,
  Calendar,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'
import { fetchInfluencerAnalytics } from '@/services/influencers'
import { getInfluencerByUserId, getAllInfluencers } from '@/mock-data/influencers'
import { formatCompactNumber, formatCurrency } from '@/lib/utils'
import { staggerContainer, staggerItem } from '@/lib/animations'
import {
  LineChart,
  Line,
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
  Legend,
  ResponsiveContainer,
} from 'recharts'

const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899']

export default function InfluencerAnalyticsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<any>(null)
  const [influencer, setInfluencer] = useState<any>(null)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  useEffect(() => {
    loadAnalytics()
  }, [user])

  const loadAnalytics = async () => {
    if (!user) return

    try {
      let inf = getInfluencerByUserId(user.id)

      // Fallback: use first influencer for demo
      if (!inf) {
        console.warn(`No influencer found for user ID: ${user.id}, using fallback influencer`)
        inf = getAllInfluencers()[0]
      }

      if (inf) {
        setInfluencer(inf)
        const data = await fetchInfluencerAnalytics(inf.id)
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !analytics || !influencer) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-[rgb(var(--surface))] rounded w-1/3" />
          <div className="grid md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-[rgb(var(--surface))] rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const stats = [
    {
      title: 'Total Followers',
      value: formatCompactNumber(analytics.overview.total_followers),
      icon: Users,
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Avg Engagement',
      value: `${analytics.overview.avg_engagement_rate.toFixed(1)}%`,
      icon: Heart,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Total Reach',
      value: formatCompactNumber(analytics.overview.total_reach),
      icon: Eye,
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Authenticity',
      value: `${analytics.overview.authenticity_score}/100`,
      icon: BarChart3,
      color: 'from-orange-500 to-red-500',
    },
  ]

  // Prepare audience age data
  const ageData = Object.entries(influencer.audience.age_ranges).map(
    ([range, percentage]) => ({
      range,
      percentage,
    })
  )

  // Prepare gender data
  const genderData = Object.entries(influencer.audience.gender).map(([gender, percentage]) => ({
    name: gender.charAt(0).toUpperCase() + gender.slice(1),
    value: percentage,
  }))

  // Prepare location data
  const locationData = influencer.audience.top_countries.slice(0, 5)

  return (
    <div className="min-h-screen bg-gradient-to-b from-[rgb(var(--background))] to-[rgb(var(--surface))]">
      <div className="container py-8">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          {/* Header */}
          <motion.div variants={staggerItem} className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-3 gradient-text">
              Analytics Dashboard
            </h1>
            <p className="text-lg text-[rgb(var(--muted))]">
              Track your performance and audience insights
            </p>
          </motion.div>

          {/* Time Range Selector */}
          <motion.div variants={staggerItem} className="flex gap-2 mb-8">
            {[
              { value: '7d', label: 'Last 7 Days' },
              { value: '30d', label: 'Last 30 Days' },
              { value: '90d', label: 'Last 90 Days' },
              { value: '1y', label: 'Last Year' },
            ].map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
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
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {stats.map((stat, index) => (
              <motion.div key={stat.title} variants={staggerItem}>
                <Card className="border-2 hover:border-[rgb(var(--brand-primary))]/40 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-10`}
                      >
                        <stat.icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold mb-2 gradient-text">
                      {stat.value}
                    </div>
                    <div className="text-sm text-[rgb(var(--muted))]">
                      {stat.title}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Growth Trend Chart */}
          <motion.div variants={staggerItem} className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[rgb(var(--brand-primary))]" />
                  Growth Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={influencer.growth_trend}>
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

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Platform Breakdown */}
            <motion.div variants={staggerItem}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-[rgb(var(--brand-primary))]" />
                    Platform Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.platform_breakdown.map((platform: any, index: number) => (
                      <div key={platform.platform} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {platform.platform === 'Instagram' && (
                              <Instagram className="h-4 w-4" />
                            )}
                            {platform.platform === 'YouTube' && (
                              <Youtube className="h-4 w-4" />
                            )}
                            <span className="font-medium">{platform.platform}</span>
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
                                width: `${platform.engagement_rate * 10}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium">
                            {platform.engagement_rate.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Audience Gender Distribution */}
            <motion.div variants={staggerItem}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-[rgb(var(--brand-primary))]" />
                    Gender Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
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
                          {genderData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Age Demographics */}
            <motion.div variants={staggerItem}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-[rgb(var(--brand-primary))]" />
                    Age Demographics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
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
                </CardContent>
              </Card>
            </motion.div>

            {/* Top Locations */}
            <motion.div variants={staggerItem}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-[rgb(var(--brand-primary))]" />
                    Top Locations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {locationData.map((location: any, index: number) => (
                      <div key={location.country} className="space-y-2">
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
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
