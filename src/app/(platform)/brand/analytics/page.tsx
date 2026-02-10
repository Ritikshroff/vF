'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  DollarSign,
  Eye,
  Users,
  Target,
  BarChart3,
  PieChart,
  Calendar,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'
import { fetchBrandAnalytics } from '@/services/brands'
import { getBrandByUserId, getAllBrands } from '@/mock-data/brands'
import { formatCurrency, formatCompactNumber } from '@/lib/utils'
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

export default function BrandAnalyticsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<any>(null)
  const [brand, setBrand] = useState<any>(null)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  useEffect(() => {
    loadAnalytics()
  }, [user])

  const loadAnalytics = async () => {
    if (!user) return

    try {
      let br = getBrandByUserId(user.id)

      // Fallback: If no brand found for this user, use the first brand (for testing)
      if (!br) {
        console.warn(`No brand found for user ID: ${user.id}, using fallback brand for demo`)
        const allBrands = getAllBrands()
        br = allBrands[0]
      }

      if (br) {
        setBrand(br)
        const data = await fetchBrandAnalytics(br.id)
        setAnalytics(data)
      } else {
        console.error('No brand data available')
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !analytics || !brand) {
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
      title: 'Total Spend',
      value: formatCurrency(analytics.overview.total_spend),
      change: '+12.5%',
      trend: 'up' as const,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Total Reach',
      value: formatCompactNumber(analytics.overview.total_reach),
      change: '+18.2%',
      trend: 'up' as const,
      icon: Eye,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Active Campaigns',
      value: analytics.overview.active_campaigns,
      change: '+3',
      trend: 'up' as const,
      icon: Target,
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Avg ROI',
      value: `${analytics.overview.avg_roi}%`,
      change: '+5.3%',
      trend: 'up' as const,
      icon: TrendingUp,
      color: 'from-orange-500 to-red-500',
    },
  ]

  // Mock spending trend data
  const spendingTrend = [
    { month: 'Jan', spend: 45000, roi: 320 },
    { month: 'Feb', spend: 52000, roi: 385 },
    { month: 'Mar', spend: 48000, roi: 410 },
    { month: 'Apr', spend: 61000, roi: 445 },
    { month: 'May', spend: 55000, roi: 425 },
    { month: 'Jun', spend: 67000, roi: 480 },
  ]

  // Campaign performance data
  const campaignPerformance = [
    { name: 'Fashion Launch', reach: 850000, engagement: 68000, conversions: 3200, spend: 12000 },
    { name: 'Tech Review', reach: 620000, engagement: 52000, conversions: 2800, spend: 8000 },
    { name: 'Fitness Challenge', reach: 1200000, engagement: 96000, conversions: 5400, spend: 15000 },
    { name: 'Beauty Collab', reach: 540000, engagement: 43000, conversions: 2100, spend: 7000 },
  ]

  // Category spend distribution
  const categorySpend = [
    { name: 'Fashion', value: 35 },
    { name: 'Technology', value: 25 },
    { name: 'Fitness', value: 20 },
    { name: 'Beauty', value: 15 },
    { name: 'Other', value: 5 },
  ]

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
            <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-5xl font-bold mb-2 gradient-text">
              Analytics Dashboard
            </h1>
            <p className="text-sm lg:text-base xl:text-lg text-[rgb(var(--muted))]">
              Track campaign performance and ROI
            </p>
          </motion.div>

          {/* Time Range Selector - Mobile Scrollable */}
          <motion.div variants={staggerItem} className="mb-4 sm:mb-6 lg:mb-8">
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
              {[
                { value: '7d', label: 'Last 7 Days' },
                { value: '30d', label: 'Last 30 Days' },
                { value: '90d', label: 'Last 90 Days' },
                { value: '1y', label: 'Last Year' },
              ].map((range) => (
                <button
                  key={range.value}
                  onClick={() => setTimeRange(range.value as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    timeRange === range.value
                      ? 'bg-gradient-to-r from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] text-white shadow-lg'
                      : 'bg-[rgb(var(--surface))] text-[rgb(var(--muted))] hover:bg-[rgb(var(--surface-hover))]'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Stats Grid - Mobile 2 cols */}
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8"
          >
            {stats.map((stat, index) => (
              <motion.div key={stat.title} variants={staggerItem}>
                <Card className="border-2 hover:border-[rgb(var(--brand-primary))]/40 transition-all">
                  <CardContent className="p-3 sm:p-4 lg:p-6">
                    <div className="flex items-start justify-between mb-2 sm:mb-3 lg:mb-4">
                      <div
                        className={`p-1.5 sm:p-2 lg:p-3 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-10`}
                      >
                        <stat.icon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                      </div>
                      <div
                        className={`flex items-center gap-1 text-xs ${
                          stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                        }`}
                      >
                        {stat.trend === 'up' ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        )}
                        {stat.change}
                      </div>
                    </div>
                    <div className="text-base sm:text-lg lg:text-2xl xl:text-3xl font-bold mb-1 gradient-text">
                      {stat.value}
                    </div>
                    <div className="text-[10px] sm:text-xs lg:text-sm text-[rgb(var(--muted))]">
                      {stat.title}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Spending Trend Chart - Full Width */}
          <motion.div variants={staggerItem} className="mb-4 sm:mb-6 lg:mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
                  <TrendingUp className="h-5 w-5 text-[rgb(var(--brand-primary))]" />
                  Spending & ROI Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 sm:h-64 lg:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={spendingTrend}>
                      <defs>
                        <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorROI" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
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
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="spend"
                        stroke="#8B5CF6"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorSpend)"
                        name="Spend ($)"
                      />
                      <Area
                        type="monotone"
                        dataKey="roi"
                        stroke="#10B981"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorROI)"
                        name="ROI (%)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-4 sm:mb-6 lg:mb-8">
            {/* Campaign Performance Chart */}
            <motion.div variants={staggerItem}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
                    <BarChart3 className="h-5 w-5 text-[rgb(var(--brand-primary))]" />
                    Campaign Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 sm:h-64 lg:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={campaignPerformance}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.3} />
                        <XAxis
                          dataKey="name"
                          stroke="#6B7280"
                          tick={{ fontSize: 12 }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis stroke="#6B7280" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgb(var(--surface-elevated))',
                            border: '1px solid rgb(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Bar
                          dataKey="conversions"
                          fill="#8B5CF6"
                          radius={[8, 8, 0, 0]}
                          name="Conversions"
                        />
                        <Bar
                          dataKey="spend"
                          fill="#10B981"
                          radius={[8, 8, 0, 0]}
                          name="Spend ($)"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Category Spend Distribution */}
            <motion.div variants={staggerItem}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
                    <PieChart className="h-5 w-5 text-[rgb(var(--brand-primary))]" />
                    Spend by Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 sm:h-64 lg:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPie>
                        <Pie
                          data={categorySpend}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}%`}
                          outerRadius={window.innerWidth < 768 ? 60 : 80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categorySpend.map((entry, index) => (
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

          {/* Top Performing Influencers */}
          <motion.div variants={staggerItem}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
                  <Users className="h-5 w-5 text-[rgb(var(--brand-primary))]" />
                  Top Performing Influencers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {analytics.top_influencers.map((influencer: any, index: number) => (
                    <div
                      key={index}
                      className="flex flex-col md:flex-row md:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-[rgb(var(--surface))] hover:bg-[rgb(var(--surface-hover))] transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{influencer.name}</h4>
                          <div className="flex flex-wrap gap-2 text-xs text-[rgb(var(--muted))]">
                            <span>{influencer.campaigns_completed} campaigns</span>
                            <span>•</span>
                            <span>{formatCompactNumber(influencer.total_reach)} reach</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 md:gap-6">
                        <div className="text-center">
                          <div className="text-xs text-[rgb(var(--muted))] mb-1">
                            Engagement
                          </div>
                          <div className="font-bold text-sm md:text-base">
                            {formatCompactNumber(influencer.total_engagement)}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-[rgb(var(--muted))] mb-1">
                            Conversions
                          </div>
                          <div className="font-bold text-sm md:text-base">
                            {formatCompactNumber(influencer.conversions)}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-[rgb(var(--muted))] mb-1">ROI</div>
                          <div className="font-bold text-green-500 text-sm md:text-base">
                            {influencer.avg_roi}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
