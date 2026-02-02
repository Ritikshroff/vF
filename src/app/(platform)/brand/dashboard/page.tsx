'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Users, Megaphone, DollarSign, Plus } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatCompactNumber } from '@/lib/utils'
import { fadeInUp } from '@/lib/animations'

export default function BrandDashboardPage() {
  const stats = [
    {
      title: 'Active Campaigns',
      value: '12',
      change: '+3 this month',
      icon: Megaphone,
      color: 'text-[rgb(var(--brand-primary))]',
    },
    {
      title: 'Total Spend',
      value: formatCurrency(45000),
      change: '+12% vs last month',
      icon: DollarSign,
      color: 'text-[rgb(var(--success))]',
    },
    {
      title: 'Total Reach',
      value: formatCompactNumber(2500000),
      change: '+25% this month',
      icon: TrendingUp,
      color: 'text-[rgb(var(--info))]',
    },
    {
      title: 'Influencers Worked With',
      value: '48',
      change: '+8 this month',
      icon: Users,
      color: 'text-[rgb(var(--warning))]',
    },
  ]

  const recentCampaigns = [
    { name: 'Summer Collection Launch', status: 'active', influencers: 12, reach: '850K' },
    { name: 'Brand Awareness Q2', status: 'active', influencers: 8, reach: '620K' },
    { name: 'Product Launch', status: 'completed', influencers: 15, reach: '1.2M' },
  ]

  return (
    <div className="container py-8">
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Brand Dashboard</h1>
            <p className="text-[rgb(var(--muted))]">Welcome back! Here's your campaign overview.</p>
          </div>
          <Link href="/brand/campaigns/new">
            <Button variant="gradient">
              <Plus className="h-4 w-4 mr-2" />
              New Campaign
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2 rounded-lg bg-[rgb(var(--surface))]`}>
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-[rgb(var(--muted))] mb-2">{stat.title}</div>
                  <div className="text-xs text-[rgb(var(--success))]">{stat.change}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Recent Campaigns */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Campaigns</CardTitle>
              <Link href="/brand/campaigns">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCampaigns.map((campaign, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg bg-[rgb(var(--surface))] hover:bg-[rgb(var(--surface-hover))] transition-colors"
                >
                  <div>
                    <h4 className="font-semibold mb-1">{campaign.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-[rgb(var(--muted))]">
                      <span>{campaign.influencers} influencers</span>
                      <span>{campaign.reach} reach</span>
                    </div>
                  </div>
                  <Badge
                    variant={campaign.status === 'active' ? 'success' : 'default'}
                  >
                    {campaign.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Card hoverable>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Discover Influencers</h3>
              <p className="text-sm text-[rgb(var(--muted))] mb-4">
                Find the perfect creators for your next campaign
              </p>
              <Link href="/brand/discover">
                <Button variant="outline" className="w-full">Browse</Button>
              </Link>
            </CardContent>
          </Card>

          <Card hoverable>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Campaign Analytics</h3>
              <p className="text-sm text-[rgb(var(--muted))] mb-4">
                View detailed performance metrics and insights
              </p>
              <Link href="/brand/analytics">
                <Button variant="outline" className="w-full">View Analytics</Button>
              </Link>
            </CardContent>
          </Card>

          <Card hoverable>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Messages</h3>
              <p className="text-sm text-[rgb(var(--muted))] mb-4">
                Chat with influencers and manage collaborations
              </p>
              <Link href="/brand/messages">
                <Button variant="outline" className="w-full">Open Messages</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}
