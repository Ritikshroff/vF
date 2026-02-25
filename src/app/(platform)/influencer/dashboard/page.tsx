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
      <div className="min-h-screen bg-gradient-to-b from-[rgb(var(--background))] to-[rgb(var(--surface))]">
        <div className="container py-6 sm:py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-7 bg-[rgb(var(--surface))] rounded w-1/3" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 sm:h-28 bg-[rgb(var(--surface))] rounded-xl" />
              ))}
            </div>
            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="h-48 bg-[rgb(var(--surface))] rounded-xl" />
              <div className="h-48 bg-[rgb(var(--surface))] rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const wallet = walletData as any
  const totalEarnings = Number(wallet?.balance ?? 0) + Number(wallet?.pendingBalance ?? 0)
  const activeCampaigns = collaborations.filter((c: any) =>
    ['PROPOSAL_SENT', 'NEGOTIATION', 'CONTRACT_SIGNED', 'IN_PRODUCTION', 'IN_REVIEW'].includes(c.status)
  )
  const pendingInvites = collaborations.filter((c: any) => c.status === 'PROPOSAL_SENT')
  const completedCampaigns = collaborations.filter((c: any) => c.status === 'COMPLETED')

  const stats = [
    {
      title: 'Total Earnings',
      value: formatCurrency(totalEarnings),
      sub: `${formatCurrency(Number(wallet?.pendingBalance ?? 0))} pending`,
      icon: DollarSign,
    },
    {
      title: 'Active Campaigns',
      value: String(activeCampaigns.length),
      sub: `${pendingInvites.length} pending invites`,
      icon: Megaphone,
    },
    {
      title: 'Applications',
      value: String(applications.length),
      sub: `${applications.filter((a: any) => a.status === 'PENDING').length} pending`,
      icon: Users,
    },
    {
      title: 'Completed',
      value: String(completedCampaigns.length),
      sub: 'Total campaigns',
      icon: Star,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-[rgb(var(--background))] to-[rgb(var(--surface))]">
      <div className="container py-4 sm:py-6 lg:py-8">
        <motion.div initial="initial" animate="animate" variants={fadeInUp}>
          <EmailVerificationBanner />

          {/* Header */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-0.5 gradient-text">Influencer Dashboard</h1>
              <p className="text-xs sm:text-sm text-[rgb(var(--muted))]">Track your campaigns and earnings</p>
            </div>
            <Link href="/influencer/profile">
              <Button variant="outline" size="sm" className="w-full sm:w-auto min-h-[36px] sm:min-h-[40px] text-xs sm:text-sm">
                Edit Profile
              </Button>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border border-[rgb(var(--border))] hover:border-[rgb(var(--brand-primary))]/30 transition-colors">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 sm:p-2 rounded-lg bg-[rgb(var(--brand-primary))]/10">
                        <stat.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[rgb(var(--brand-primary))]" />
                      </div>
                      <span className="text-[10px] sm:text-xs text-[rgb(var(--muted))] truncate">{stat.title}</span>
                    </div>
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold mb-0.5 text-[rgb(var(--foreground))]">{stat.value}</div>
                    <div className="text-[10px] sm:text-xs text-[rgb(var(--muted))]">{stat.sub}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Active Campaigns + Invitations */}
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Active Campaigns */}
            <Card className="border border-[rgb(var(--border))]">
              <CardHeader className="p-3 sm:p-4 pb-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm sm:text-base font-semibold">Active Campaigns</CardTitle>
                  <Link href="/influencer/campaigns">
                    <Button variant="ghost" size="sm" className="text-xs h-7 sm:h-8">View All</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-4">
                {activeCampaigns.length === 0 ? (
                  <div className="text-center py-6 text-[rgb(var(--muted))] text-xs sm:text-sm">No active campaigns yet.</div>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                    {activeCampaigns.slice(0, 5).map((collab: any) => (
                      <div
                        key={collab.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-[rgb(var(--surface))] hover:bg-[rgb(var(--surface-hover))] transition-colors"
                      >
                        <div className="min-w-0">
                          <h4 className="font-medium text-sm truncate">{collab.campaign?.title || 'Campaign'}</h4>
                          <div className="flex items-center gap-2 text-[10px] sm:text-xs text-[rgb(var(--muted))]">
                            <span className="truncate">{collab.brand?.companyName || 'Brand'}</span>
                            {collab.agreedRate && (
                              <>
                                <span>·</span>
                                <span className="shrink-0">{formatCurrency(Number(collab.agreedRate))}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <Badge
                          variant={
                            collab.status === 'IN_PRODUCTION' || collab.status === 'IN_REVIEW' ? 'primary' :
                            collab.status === 'PROPOSAL_SENT' ? 'warning' : 'default'
                          }
                          className="text-[10px] sm:text-xs shrink-0 self-start sm:self-center"
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
            <Card className="border border-[rgb(var(--border))]">
              <CardHeader className="p-3 sm:p-4 pb-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm sm:text-base font-semibold">New Invitations</CardTitle>
                  <Badge variant="primary" className="text-[10px] sm:text-xs">{pendingInvites.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-4">
                {pendingInvites.length === 0 ? (
                  <div className="text-center py-6 text-[rgb(var(--muted))] text-xs sm:text-sm">No new invitations.</div>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                    {pendingInvites.slice(0, 5).map((invite: any) => (
                      <div
                        key={invite.id}
                        className="p-2.5 sm:p-3 rounded-lg bg-[rgb(var(--surface))] hover:bg-[rgb(var(--surface-hover))] transition-colors"
                      >
                        <h4 className="font-medium text-sm mb-0.5">{invite.campaign?.title || 'Campaign Invite'}</h4>
                        <div className="flex items-center gap-2 text-[10px] sm:text-xs text-[rgb(var(--muted))] mb-2.5">
                          <span>{invite.brand?.companyName || 'Brand'}</span>
                          {invite.agreedRate && (
                            <>
                              <span>·</span>
                              <span className="text-[rgb(var(--success))]">{formatCurrency(Number(invite.agreedRate))}</span>
                            </>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="primary" className="flex-1 h-8 sm:h-9 text-xs">Accept</Button>
                          <Button size="sm" variant="outline" className="flex-1 h-8 sm:h-9 text-xs">Decline</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
            <Card className="border border-[rgb(var(--border))] hover:border-[rgb(var(--brand-primary))]/30 transition-colors">
              <CardContent className="p-3 sm:p-4">
                <h3 className="font-semibold text-sm mb-1">View Campaigns</h3>
                <p className="text-[10px] sm:text-xs text-[rgb(var(--muted))] mb-3">
                  Browse campaign opportunities
                </p>
                <Link href="/influencer/campaigns">
                  <Button variant="outline" size="sm" className="w-full text-xs h-8 sm:h-9">Browse</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border border-[rgb(var(--border))] hover:border-[rgb(var(--brand-primary))]/30 transition-colors">
              <CardContent className="p-3 sm:p-4">
                <h3 className="font-semibold text-sm mb-1">Messages</h3>
                <p className="text-[10px] sm:text-xs text-[rgb(var(--muted))] mb-3">
                  Chat with brands
                </p>
                <Link href="/influencer/messages">
                  <Button variant="outline" size="sm" className="w-full text-xs h-8 sm:h-9">Open</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border border-[rgb(var(--border))] hover:border-[rgb(var(--brand-primary))]/30 transition-colors col-span-2 lg:col-span-1">
              <CardContent className="p-3 sm:p-4">
                <h3 className="font-semibold text-sm mb-1">Payments</h3>
                <p className="text-[10px] sm:text-xs text-[rgb(var(--muted))] mb-3">
                  View earnings and history
                </p>
                <Link href="/influencer/payments">
                  <Button variant="outline" size="sm" className="w-full text-xs h-8 sm:h-9">View</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
