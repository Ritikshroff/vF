'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Users, Megaphone, DollarSign, Plus, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatCompactNumber } from '@/lib/utils'
import { fadeInUp } from '@/lib/animations'
import { getWallet } from '@/services/api/wallet'
import { fetchBrandCampaigns } from '@/services/api/campaigns'
import { getCollaborations } from '@/services/api/collaborations'

export default function BrandDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [walletBalance, setWalletBalance] = useState(0)
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [collaborationCount, setCollaborationCount] = useState(0)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const [walletData, campaignsData, collabData] = await Promise.allSettled([
        getWallet(),
        fetchBrandCampaigns(),
        getCollaborations(),
      ])

      if (walletData.status === 'fulfilled') {
        setWalletBalance(Number(walletData.value?.balance ?? 0))
      }
      if (campaignsData.status === 'fulfilled') {
        setCampaigns(campaignsData.value ?? [])
      }
      if (collabData.status === 'fulfilled') {
        setCollaborationCount(collabData.value?.data?.length ?? 0)
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  const activeCampaigns = campaigns.filter((c: any) => c.status === 'ACTIVE')
  const totalSpent = campaigns.reduce((sum: number, c: any) => sum + Number(c.budgetMax || 0), 0)

  const stats = [
    {
      title: 'Active Campaigns',
      value: loading ? '...' : String(activeCampaigns.length),
      change: `${campaigns.length} total campaigns`,
      icon: Megaphone,
      color: 'text-[rgb(var(--brand-primary))]',
    },
    {
      title: 'Wallet Balance',
      value: loading ? '...' : formatCurrency(walletBalance),
      change: totalSpent > 0 ? `${formatCurrency(totalSpent)} total spent` : 'No spending yet',
      icon: DollarSign,
      color: 'text-[rgb(var(--success))]',
    },
    {
      title: 'Campaigns Created',
      value: loading ? '...' : String(campaigns.length),
      change: `${activeCampaigns.length} currently active`,
      icon: TrendingUp,
      color: 'text-[rgb(var(--info))]',
    },
    {
      title: 'Collaborations',
      value: loading ? '...' : String(collaborationCount),
      change: 'Total collaborations',
      icon: Users,
      color: 'text-[rgb(var(--warning))]',
    },
  ]

  const recentCampaigns = campaigns.slice(0, 5)

  return (
    <div className="container py-4 sm:py-6 lg:py-8">
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
      >
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 lg:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">Brand Dashboard</h1>
            <p className="text-sm sm:text-base text-[rgb(var(--muted))]">Welcome back! Here's your campaign overview.</p>
          </div>
          <Link href="/brand/campaigns/new" className="w-full sm:w-auto">
            <Button variant="gradient" className="w-full sm:w-auto min-h-[44px]">
              <Plus className="h-4 w-4 mr-2" />
              New Campaign
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className={`p-2 rounded-lg bg-[rgb(var(--surface))]`}>
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="text-lg sm:text-2xl font-bold mb-1">{stat.value}</div>
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
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-[rgb(var(--muted))]" />
              </div>
            ) : recentCampaigns.length === 0 ? (
              <div className="text-center py-8 text-[rgb(var(--muted))]">
                <p>No campaigns yet. Create your first campaign to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentCampaigns.map((campaign: any) => (
                  <Link key={campaign.id} href={`/brand/campaigns/${campaign.id}`}>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 rounded-lg bg-[rgb(var(--surface))] hover:bg-[rgb(var(--surface-hover))] transition-colors">
                      <div>
                        <h4 className="font-semibold mb-1">{campaign.title}</h4>
                        <div className="flex items-center gap-2 sm:gap-4 text-sm text-[rgb(var(--muted))]">
                          <span>{campaign.totalSlots || 1} slots</span>
                          <span>{formatCurrency(Number(campaign.budgetMax || 0))} budget</span>
                        </div>
                      </div>
                      <Badge
                        variant={campaign.status === 'ACTIVE' ? 'success' : campaign.status === 'DRAFT' ? 'secondary' : 'default'}
                      >
                        {campaign.status}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mt-4 sm:mt-6 lg:mt-8">
          <Card hoverable>
            <CardContent className="p-4 sm:p-6">
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
            <CardContent className="p-4 sm:p-6">
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
            <CardContent className="p-4 sm:p-6">
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
