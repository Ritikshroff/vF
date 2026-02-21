'use client'

import { motion } from 'framer-motion'
import { Users, Megaphone, DollarSign, Star, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { fadeInUp } from '@/lib/animations'
import { useWallet } from '@/hooks/queries/use-wallet'
import { useCollaborations } from '@/hooks/queries/use-collaborations'
import { useMyApplications } from '@/hooks/queries/use-marketplace'
import { EmailVerificationBanner } from '@/components/shared/email-verification-banner'

export default function InfluencerDashboardPage() {
  const { data: walletData, isLoading: walletLoading } = useWallet()
  const { data: collabData, isLoading: collabLoading } = useCollaborations()
  const { data: appsData, isLoading: appsLoading } = useMyApplications()

  const loading = walletLoading || collabLoading || appsLoading
  const collaborations: any[] = collabData ? (Array.isArray(collabData) ? collabData : collabData?.data ?? []) : []
  const applications: any[] = appsData ? (Array.isArray(appsData) ? appsData : appsData?.data ?? []) : []

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--muted))]" />
      </div>
    )
  }

  const totalEarnings = Number(walletData?.balance ?? 0) + Number(walletData?.pendingBalance ?? 0)
  const activeCampaigns = collaborations.filter((c: any) =>
    ['PROPOSAL_SENT', 'NEGOTIATION', 'CONTRACT_SIGNED', 'IN_PRODUCTION', 'IN_REVIEW'].includes(c.status)
  )
  const pendingInvites = collaborations.filter((c: any) => c.status === 'PROPOSAL_SENT')
  const completedCampaigns = collaborations.filter((c: any) => c.status === 'COMPLETED')

  const stats = [
    {
      title: 'Total Earnings',
      value: formatCurrency(totalEarnings),
      change: `${formatCurrency(Number(walletData?.pendingBalance ?? 0))} pending`,
      icon: DollarSign,
      color: 'text-[rgb(var(--success))]',
    },
    {
      title: 'Active Campaigns',
      value: String(activeCampaigns.length),
      change: `${pendingInvites.length} pending invites`,
      icon: Megaphone,
      color: 'text-[rgb(var(--brand-primary))]',
    },
    {
      title: 'Applications',
      value: String(applications.length),
      change: `${applications.filter((a: any) => a.status === 'PENDING').length} pending`,
      icon: Users,
      color: 'text-[rgb(var(--info))]',
    },
    {
      title: 'Completed',
      value: String(completedCampaigns.length),
      change: 'Total campaigns',
      icon: Star,
      color: 'text-[rgb(var(--warning))]',
    },
  ]

  return (
    <div className="container py-4 sm:py-6 lg:py-8">
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
      >
        <EmailVerificationBanner />

        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 lg:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">Influencer Dashboard</h1>
            <p className="text-sm sm:text-base text-[rgb(var(--muted))]">Track your campaigns and earnings.</p>
          </div>
          <Link href="/influencer/profile">
            <Button variant="outline" className="w-full sm:w-auto min-h-[44px]">Edit Profile</Button>
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
                  <div className="text-xl sm:text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-[rgb(var(--muted))] mb-2">{stat.title}</div>
                  <div className="text-xs text-[rgb(var(--success))]">{stat.change}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
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
              {activeCampaigns.length === 0 ? (
                <div className="text-center py-6 text-[rgb(var(--muted))] text-sm">No active campaigns yet.</div>
              ) : (
                <div className="space-y-4">
                  {activeCampaigns.slice(0, 5).map((collab: any) => (
                    <div
                      key={collab.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 p-3 sm:p-4 rounded-lg bg-[rgb(var(--surface))] hover:bg-[rgb(var(--surface-hover))] transition-colors"
                    >
                      <div>
                        <h4 className="font-semibold mb-1">{collab.campaign?.title || 'Campaign'}</h4>
                        <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-[rgb(var(--muted))]">
                          <span>{collab.brand?.companyName || 'Brand'}</span>
                          {collab.agreedRate && <span>{formatCurrency(Number(collab.agreedRate))}</span>}
                        </div>
                      </div>
                      <Badge
                        variant={
                          collab.status === 'IN_PRODUCTION' || collab.status === 'IN_REVIEW'
                            ? 'primary'
                            : collab.status === 'PROPOSAL_SENT'
                            ? 'warning'
                            : 'default'
                        }
                      >
                        {collab.status.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Invitations */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>New Invitations</CardTitle>
                <Badge variant="primary">{pendingInvites.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {pendingInvites.length === 0 ? (
                <div className="text-center py-6 text-[rgb(var(--muted))] text-sm">No new invitations.</div>
              ) : (
                <div className="space-y-4">
                  {pendingInvites.slice(0, 5).map((invite: any) => (
                    <div
                      key={invite.id}
                      className="p-4 rounded-lg bg-[rgb(var(--surface))] hover:bg-[rgb(var(--surface-hover))] transition-colors"
                    >
                      <h4 className="font-semibold mb-1">{invite.campaign?.title || 'Campaign Invite'}</h4>
                      <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-[rgb(var(--muted))] mb-3">
                        <span>{invite.brand?.companyName || 'Brand'}</span>
                        {invite.agreedRate && (
                          <span className="text-[rgb(var(--success))]">{formatCurrency(Number(invite.agreedRate))}</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="primary" className="flex-1 min-h-[44px] sm:min-h-0">Accept</Button>
                        <Button size="sm" variant="outline" className="flex-1 min-h-[44px] sm:min-h-0">Decline</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mt-4 sm:mt-6 lg:mt-8">
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
