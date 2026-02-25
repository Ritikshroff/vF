'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  DollarSign,
  Eye,
  Users,
  Target,
  BarChart3,
  PieChart,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useWallet } from '@/hooks/queries/use-wallet'
import { useBrandCampaigns } from '@/hooks/queries/use-campaigns'
import { useCollaborations } from '@/hooks/queries/use-collaborations'
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

// Theme-aligned gold palette for charts
const CHART_COLORS = ['#D4AF37', '#B8860B', '#CD7F32', '#FFD700', '#92600B', '#E6C066']

// Custom tooltip that respects theme
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--surface-elevated))] px-3 py-2">
      <p className="text-xs font-medium text-[rgb(var(--foreground))] mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-xs text-[rgb(var(--muted))]">
          <span style={{ color: entry.color }}>{entry.name}</span>:{' '}
          <span className="font-semibold text-[rgb(var(--foreground))]">
            {typeof entry.value === 'number' && entry.name?.includes('$')
              ? formatCurrency(entry.value)
              : formatCompactNumber(entry.value)}
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
      {`${name} (${(percent * 100).toFixed(0)}%)`}
    </text>
  )
}

export default function BrandAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  const { data: walletData, isLoading: walletLoading } = useWallet()
  const { data: listings = [], isLoading: listingsLoading } = useBrandCampaigns()
  const { data: collabsRaw, isLoading: collabsLoading } = useCollaborations()

  const isLoading = walletLoading || listingsLoading || collabsLoading
  const collaborations = collabsRaw?.data ?? []

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

  // Compute stats from real data
  const activeListings = listings.filter((l: any) => l.status === 'ACTIVE')
  const totalBudget = listings.reduce((sum: number, l: any) => sum + Number(l.budgetMax || 0), 0)
  const totalCollabs = collaborations.length
  const completedCollabs = collaborations.filter((c: any) => c.status === 'COMPLETED')
  const totalSpent = completedCollabs.reduce((sum: number, c: any) => sum + Number(c.agreedAmount || 0), 0)
  const walletBalance = Number((walletData as any)?.balance ?? 0)

  const stats = [
    {
      title: 'Total Spent',
      value: formatCurrency(totalSpent),
      sub: `${formatCurrency(walletBalance)} balance`,
      icon: DollarSign,
    },
    {
      title: 'Total Budget',
      value: formatCurrency(totalBudget),
      sub: `${listings.length} listings`,
      icon: Eye,
    },
    {
      title: 'Active Listings',
      value: String(activeListings.length),
      sub: `${listings.length} total`,
      icon: Target,
    },
    {
      title: 'Collaborations',
      value: String(totalCollabs),
      sub: `${completedCollabs.length} completed`,
      icon: TrendingUp,
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

  // Campaign performance from listings
  const campaignPerformance = listings.slice(0, 6).map((l: any) => ({
    name: l.title?.length > 15 ? l.title.substring(0, 15) + '…' : l.title,
    applications: l._count?.applications ?? 0,
    budget: Number(l.budgetMax || 0),
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
      <div className="container py-4 sm:py-6 lg:py-8">
        <motion.div initial="initial" animate="animate" variants={staggerContainer}>
          {/* Header */}
          <motion.div variants={staggerItem} className="mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 gradient-text">
              Analytics Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-[rgb(var(--muted))]">
              Track campaign performance and ROI
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
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold mb-0.5 text-[rgb(var(--foreground))]">
                      {stat.value}
                    </div>
                    <div className="text-[10px] sm:text-xs text-[rgb(var(--muted))]">
                      {stat.sub}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Spending Trend Chart */}
          {spendingTrend.length > 0 && (
            <motion.div variants={staggerItem} className="mb-4 sm:mb-6">
              <Card className="border border-[rgb(var(--border))]">
                <CardHeader className="p-3 sm:p-4 lg:p-5 pb-0">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base font-semibold">
                    <TrendingUp className="h-4 w-4 text-[rgb(var(--brand-primary))]" />
                    Spending Trend
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 sm:p-4 lg:p-5 pt-2">
                  <div className="h-48 sm:h-56 lg:h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={spendingTrend} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
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
                          tickFormatter={(v) => `$${formatCompactNumber(v)}`}
                        />
                        <Tooltip content={<ChartTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="spend"
                          stroke="#D4AF37"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorSpend)"
                          name="Spend ($)"
                          dot={false}
                          activeDot={{ r: 4, fill: '#D4AF37', stroke: '#fff', strokeWidth: 2 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Two-Column: Bar + Pie */}
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
            {/* Campaign Performance Chart */}
            {campaignPerformance.length > 0 && (
              <motion.div variants={staggerItem}>
                <Card className="h-full border border-[rgb(var(--border))]">
                  <CardHeader className="p-3 sm:p-4 lg:p-5 pb-0">
                    <CardTitle className="flex items-center gap-2 text-sm sm:text-base font-semibold">
                      <BarChart3 className="h-4 w-4 text-[rgb(var(--brand-primary))]" />
                      Listing Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 sm:p-4 lg:p-5 pt-2">
                    <div className="h-48 sm:h-56 lg:h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={campaignPerformance} margin={{ top: 8, right: 8, left: -12, bottom: 40 }}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgb(var(--border))"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="name"
                            stroke="rgb(var(--muted))"
                            tick={{ fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                            angle={-35}
                            textAnchor="end"
                            height={50}
                          />
                          <YAxis
                            stroke="rgb(var(--muted))"
                            tick={{ fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip content={<ChartTooltip />} />
                          <Legend
                            wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                            iconType="circle"
                            iconSize={8}
                          />
                          <Bar
                            dataKey="applications"
                            fill="#D4AF37"
                            radius={[4, 4, 0, 0]}
                            name="Applications"
                            maxBarSize={32}
                          />
                          <Bar
                            dataKey="budget"
                            fill="#B8860B"
                            radius={[4, 4, 0, 0]}
                            name="Budget ($)"
                            maxBarSize={32}
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
                <Card className="h-full border border-[rgb(var(--border))]">
                  <CardHeader className="p-3 sm:p-4 lg:p-5 pb-0">
                    <CardTitle className="flex items-center gap-2 text-sm sm:text-base font-semibold">
                      <PieChart className="h-4 w-4 text-[rgb(var(--brand-primary))]" />
                      Listings by Niche
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 sm:p-4 lg:p-5 pt-2">
                    <div className="h-48 sm:h-56 lg:h-64 flex items-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPie>
                          <Pie
                            data={categorySpend}
                            cx="50%"
                            cy="50%"
                            innerRadius="40%"
                            outerRadius="70%"
                            paddingAngle={3}
                            dataKey="value"
                            label={renderPieLabel}
                            labelLine={{ stroke: 'rgb(var(--muted))', strokeWidth: 1 }}
                            stroke="rgb(var(--surface))"
                            strokeWidth={2}
                          >
                            {categorySpend.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={<ChartTooltip />} />
                        </RechartsPie>
                      </ResponsiveContainer>
                    </div>
                    {/* Mobile legend for pie chart */}
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 sm:hidden">
                      {categorySpend.map((item, i) => (
                        <div key={item.name} className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                          />
                          <span className="text-[10px] text-[rgb(var(--muted))]">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Collaboration Overview */}
          <motion.div variants={staggerItem}>
            <Card className="border border-[rgb(var(--border))]">
              <CardHeader className="p-3 sm:p-4 lg:p-5 pb-0">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base font-semibold">
                  <Users className="h-4 w-4 text-[rgb(var(--brand-primary))]" />
                  Collaboration Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 lg:p-5">
                {collaborations.length === 0 ? (
                  <p className="text-center py-8 text-sm text-[rgb(var(--muted))]">
                    No collaborations yet. Create a campaign to get started!
                  </p>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                    {/* Status Summary */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {Object.entries(statusCounts).map(([status, count]) => (
                        <Badge key={status} variant="outline" className="text-xs border-[rgb(var(--border))]">
                          {status.replace(/_/g, ' ')}: {count}
                        </Badge>
                      ))}
                    </div>

                    {/* Recent Collaborations */}
                    {collaborations.slice(0, 5).map((collab: any, index: number) => (
                      <div
                        key={collab.id}
                        className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 rounded-lg bg-[rgb(var(--surface))] hover:bg-[rgb(var(--surface-hover))] transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[rgb(var(--brand-primary))]/15 flex items-center justify-center text-[rgb(var(--brand-primary))] text-xs font-bold">
                            {index + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium text-sm truncate">
                              {collab.influencer?.fullName || collab.influencer?.username || 'Influencer'}
                            </h4>
                            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-[rgb(var(--muted))] truncate">
                              <span className="truncate">{collab.campaign?.title || 'Campaign'}</span>
                              <span className="shrink-0">·</span>
                              <span className="shrink-0">{collab.campaign?.category || 'General'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-5 pl-10 sm:pl-0">
                          <div className="text-right">
                            <div className="font-semibold text-sm">
                              {formatCurrency(Number(collab.agreedAmount || 0))}
                            </div>
                          </div>
                          <Badge
                            variant={
                              collab.status === 'COMPLETED' ? 'success' :
                              collab.status === 'IN_PROGRESS' || collab.status === 'CONTENT_CREATION' ? 'warning' :
                              'default'
                            }
                            className="text-[10px] sm:text-xs shrink-0"
                          >
                            {collab.status?.replace(/_/g, ' ')}
                          </Badge>
                          <div className="text-xs text-[rgb(var(--muted))] shrink-0">
                            {new Date(collab.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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
