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
  ArrowUp,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'
import { getWallet } from '@/services/api/wallet'
import { fetchBrandCampaigns } from '@/services/api/campaigns'
import { getCollaborations } from '@/services/api/collaborations'
import { formatCurrency, formatCompactNumber } from '@/lib/utils'
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
  Legend,
  ResponsiveContainer,
} from 'recharts'

const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899']

export default function BrandAnalyticsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [listings, setListings] = useState<any[]>([])
  const [collaborations, setCollaborations] = useState<any[]>([])
  const [walletData, setWalletData] = useState<any>(null)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  useEffect(() => {
    loadAnalytics()
  }, [user])

  const loadAnalytics = async () => {
    if (!user) return

    try {
      const [walletRes, listingsRes, collabRes] = await Promise.allSettled([
        getWallet(),
        fetchBrandCampaigns(),
        getCollaborations(),
      ])

      if (walletRes.status === 'fulfilled') setWalletData(walletRes.value)
      if (listingsRes.status === 'fulfilled') setListings(listingsRes.value ?? [])
      if (collabRes.status === 'fulfilled') setCollaborations(collabRes.value?.data ?? [])
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--brand-primary))]" />
        </div>
      </div>
    )
  }

  // Compute stats from real data
  const activeListings = listings.filter((l: any) => l.status === 'ACTIVE')
  const totalBudget = listings.reduce((sum: number, l: any) => sum + Number(l.budgetMax || 0), 0)
  const totalCollabs = collaborations.length
  const completedCollabs = collaborations.filter((c: any) => c.status === 'COMPLETED')
  const totalSpent = completedCollabs.reduce((sum: number, c: any) => sum + Number(c.agreedAmount || 0), 0)
  const walletBalance = Number(walletData?.balance ?? 0)

  const stats = [
    {
      title: 'Total Spent',
      value: formatCurrency(totalSpent),
      change: `${formatCurrency(walletBalance)} balance`,
      trend: 'up' as const,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Total Budget',
      value: formatCurrency(totalBudget),
      change: `${listings.length} listings`,
      trend: 'up' as const,
      icon: Eye,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Active Listings',
      value: String(activeListings.length),
      change: `${listings.length} total`,
      trend: 'up' as const,
      icon: Target,
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Collaborations',
      value: String(totalCollabs),
      change: `${completedCollabs.length} completed`,
      trend: 'up' as const,
      icon: TrendingUp,
      color: 'from-orange-500 to-red-500',
    },
  ]

  // Build spending trend from collaborations (group by month)
  const spendingByMonth: Record<string, { spend: number; count: number }> = {}
  collaborations.forEach((c: any) => {
    const date = new Date(c.createdAt)
    const key = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    if (!spendingByMonth[key]) spendingByMonth[key] = { spend: 0, count: 0 }
    spendingByMonth[key].spend += Number(c.agreedAmount || 0)
    spendingByMonth[key].count += 1
  })
  const spendingTrend = Object.entries(spendingByMonth).map(([month, data]) => ({
    month,
    spend: Math.round(data.spend),
    collaborations: data.count,
  }))

  // Campaign performance from listings (with application counts)
  const campaignPerformance = listings.slice(0, 6).map((l: any) => ({
    name: l.title?.length > 20 ? l.title.substring(0, 20) + '...' : l.title,
    applications: l._count?.applications ?? 0,
    budget: Number(l.budgetMax || 0),
    slots: l.totalSlots || 1,
  }))

  // Category distribution from listing niches
  const nicheCounts: Record<string, number> = {}
  listings.forEach((l: any) => {
    const niches = l.targetNiches || []
    niches.forEach((n: string) => {
      nicheCounts[n] = (nicheCounts[n] || 0) + 1
    })
  })
  const categorySpend = Object.entries(nicheCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value]) => ({ name, value }))

  // Collaboration status breakdown
  const statusCounts: Record<string, number> = {}
  collaborations.forEach((c: any) => {
    const status = c.status || 'UNKNOWN'
    statusCounts[status] = (statusCounts[status] || 0) + 1
  })

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

          {/* Time Range Selector */}
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

          {/* Stats Grid */}
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8"
          >
            {stats.map((stat) => (
              <motion.div key={stat.title} variants={staggerItem}>
                <Card className="border-2 hover:border-[rgb(var(--brand-primary))]/40 transition-all">
                  <CardContent className="p-3 sm:p-4 lg:p-6">
                    <div className="flex items-start justify-between mb-2 sm:mb-3 lg:mb-4">
                      <div
                        className={`p-1.5 sm:p-2 lg:p-3 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-10`}
                      >
                        <stat.icon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                      </div>
                      <div className="flex items-center gap-1 text-xs text-green-500">
                        <ArrowUp className="h-3 w-3" />
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

          {/* Spending Trend Chart */}
          {spendingTrend.length > 0 && (
            <motion.div variants={staggerItem} className="mb-4 sm:mb-6 lg:mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
                    <TrendingUp className="h-5 w-5 text-[rgb(var(--brand-primary))]" />
                    Spending Trend
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
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-4 sm:mb-6 lg:mb-8">
            {/* Campaign Performance Chart */}
            {campaignPerformance.length > 0 && (
              <motion.div variants={staggerItem}>
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
                      <BarChart3 className="h-5 w-5 text-[rgb(var(--brand-primary))]" />
                      Listing Performance
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
                            dataKey="applications"
                            fill="#8B5CF6"
                            radius={[8, 8, 0, 0]}
                            name="Applications"
                          />
                          <Bar
                            dataKey="budget"
                            fill="#10B981"
                            radius={[8, 8, 0, 0]}
                            name="Budget ($)"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Category Distribution */}
            {categorySpend.length > 0 && (
              <motion.div variants={staggerItem}>
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
                      <PieChart className="h-5 w-5 text-[rgb(var(--brand-primary))]" />
                      Listings by Niche
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
                            label={({ name, value }) => `${name}: ${value}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {categorySpend.map((_, index) => (
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
            )}
          </div>

          {/* Collaboration Overview */}
          <motion.div variants={staggerItem}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
                  <Users className="h-5 w-5 text-[rgb(var(--brand-primary))]" />
                  Collaboration Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {collaborations.length === 0 ? (
                  <p className="text-center py-8 text-[rgb(var(--muted))]">
                    No collaborations yet. Create a campaign to get started!
                  </p>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {/* Status Summary */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {Object.entries(statusCounts).map(([status, count]) => (
                        <Badge key={status} variant="outline" className="text-sm">
                          {status.replace(/_/g, ' ')}: {count}
                        </Badge>
                      ))}
                    </div>

                    {/* Recent Collaborations */}
                    {collaborations.slice(0, 5).map((collab: any, index: number) => (
                      <div
                        key={collab.id}
                        className="flex flex-col md:flex-row md:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-[rgb(var(--surface))] hover:bg-[rgb(var(--surface-hover))] transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] flex items-center justify-center text-white font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">
                              {collab.influencer?.fullName || collab.influencer?.username || 'Influencer'}
                            </h4>
                            <div className="flex flex-wrap gap-2 text-xs text-[rgb(var(--muted))]">
                              <span>{collab.campaign?.title || 'Campaign'}</span>
                              <span>•</span>
                              <span>{collab.campaign?.category || 'General'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 md:gap-6">
                          <div className="text-center">
                            <div className="text-xs text-[rgb(var(--muted))] mb-1">Amount</div>
                            <div className="font-bold text-sm md:text-base">
                              {formatCurrency(Number(collab.agreedAmount || 0))}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-[rgb(var(--muted))] mb-1">Status</div>
                            <Badge
                              variant={
                                collab.status === 'COMPLETED' ? 'success' :
                                collab.status === 'IN_PROGRESS' || collab.status === 'CONTENT_CREATION' ? 'warning' :
                                'default'
                              }
                              className="text-xs"
                            >
                              {collab.status?.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-[rgb(var(--muted))] mb-1">Date</div>
                            <div className="font-bold text-sm md:text-base">
                              {new Date(collab.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
