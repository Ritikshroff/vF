'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Users, Megaphone, DollarSign, Star } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatCompactNumber } from '@/lib/utils'
import { fadeInUp } from '@/lib/animations'

export default function InfluencerDashboardPage() {
  const stats = [
    {
      title: 'Total Earnings',
      value: formatCurrency(28500),
      change: '+$3,200 this month',
      icon: DollarSign,
      color: 'text-[rgb(var(--success))]',
    },
    {
      title: 'Active Campaigns',
      value: '5',
      change: '2 pending invites',
      icon: Megaphone,
      color: 'text-[rgb(var(--brand-primary))]',
    },
    {
      title: 'Total Reach',
      value: formatCompactNumber(850000),
      change: '+12% this month',
      icon: Users,
      color: 'text-[rgb(var(--info))]',
    },
    {
      title: 'Rating',
      value: '4.9',
      change: 'Based on 24 reviews',
      icon: Star,
      color: 'text-[rgb(var(--warning))]',
    },
  ]

  const activeCampaigns = [
    { name: 'Summer Fashion Collab', brand: 'FashionCo', status: 'in_progress', payout: '$2,500' },
    { name: 'Tech Product Review', brand: 'TechGear', status: 'in_progress', payout: '$1,800' },
    { name: 'Wellness Campaign', brand: 'Wellness Co', status: 'pending', payout: '$3,200' },
  ]

  const recentInvites = [
    { campaign: 'Beauty Product Launch', brand: 'BeautyLuxe', budget: '$4,000' },
    { campaign: 'Food Brand Partnership', brand: 'FoodBrand', budget: '$2,800' },
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
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Influencer Dashboard</h1>
            <p className="text-[rgb(var(--muted))]">Track your campaigns and earnings.</p>
          </div>
          <Link href="/influencer/profile">
            <Button variant="outline">Edit Profile</Button>
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

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Active Campaigns */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Active Campaigns</CardTitle>
                <Link href="/influencer/campaigns">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeCampaigns.map((campaign, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg bg-[rgb(var(--surface))] hover:bg-[rgb(var(--surface-hover))] transition-colors"
                  >
                    <div>
                      <h4 className="font-semibold mb-1">{campaign.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-[rgb(var(--muted))]">
                        <span>{campaign.brand}</span>
                        <span>{campaign.payout}</span>
                      </div>
                    </div>
                    <Badge
                      variant={campaign.status === 'in_progress' ? 'primary' : 'warning'}
                    >
                      {campaign.status.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Campaign Invites */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>New Invitations</CardTitle>
                <Badge variant="primary">{recentInvites.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentInvites.map((invite, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-[rgb(var(--surface))] hover:bg-[rgb(var(--surface-hover))] transition-colors"
                  >
                    <h4 className="font-semibold mb-1">{invite.campaign}</h4>
                    <div className="flex items-center gap-4 text-sm text-[rgb(var(--muted))] mb-3">
                      <span>{invite.brand}</span>
                      <span className="text-[rgb(var(--success))]">{invite.budget}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="primary" className="flex-1">Accept</Button>
                      <Button size="sm" variant="outline" className="flex-1">Decline</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Card hoverable>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">View Campaigns</h3>
              <p className="text-sm text-[rgb(var(--muted))] mb-4">
                Browse all available campaign opportunities
              </p>
              <Link href="/influencer/campaigns">
                <Button variant="outline" className="w-full">Browse</Button>
              </Link>
            </CardContent>
          </Card>

          <Card hoverable>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Messages</h3>
              <p className="text-sm text-[rgb(var(--muted))] mb-4">
                Chat with brands and manage collaborations
              </p>
              <Link href="/influencer/messages">
                <Button variant="outline" className="w-full">Open Messages</Button>
              </Link>
            </CardContent>
          </Card>

          <Card hoverable>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Payments</h3>
              <p className="text-sm text-[rgb(var(--muted))] mb-4">
                View earnings and payment history
              </p>
              <Link href="/influencer/payments">
                <Button variant="outline" className="w-full">View Payments</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}
