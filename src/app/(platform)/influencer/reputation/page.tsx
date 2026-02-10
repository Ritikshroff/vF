'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Star,
  Shield,
  TrendingUp,
  Award,
  ThumbsUp,
  MessageCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  Eye,
  User,
  Briefcase,
  Zap,
  ArrowUpRight,
  Quote,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { useAuth } from '@/contexts/auth-context'
import { formatDate, formatRelativeTime, getInitials } from '@/lib/utils'
import { staggerContainer, staggerItem } from '@/lib/animations'

interface Review {
  id: string
  reviewer: { name: string; company: string; avatar?: string; verified: boolean }
  rating: number
  title: string
  content: string
  campaign: string
  metrics: { communication: number; quality: number; timeliness: number; professionalism: number }
  helpful: number
  response?: string
  date: string
}

interface VerificationBadge {
  id: string
  type: string
  label: string
  description: string
  status: 'verified' | 'pending' | 'not_started'
  verifiedAt?: string
}

const MOCK_REVIEWS: Review[] = [
  {
    id: '1',
    reviewer: { name: 'David Kim', company: 'Luxe Fashion', verified: true },
    rating: 5,
    title: 'Exceptional collaboration partner',
    content: 'Working with Sarah was an absolute pleasure. She delivered all content ahead of schedule, maintained excellent communication throughout the campaign, and the quality of her posts exceeded our expectations. The engagement metrics were well above our benchmarks.',
    campaign: 'Summer Fashion Collection',
    metrics: { communication: 5, quality: 5, timeliness: 5, professionalism: 5 },
    helpful: 24,
    response: 'Thank you so much, David! It was a wonderful experience working with your team. The creative direction was clear and inspiring. Looking forward to our next project together!',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    reviewer: { name: 'Lisa Park', company: 'GreenLeaf Beauty', verified: true },
    rating: 5,
    title: 'Top-tier content quality',
    content: 'Sarah\'s understanding of our brand voice was impressive from the start. She created authentic, beautiful content that resonated deeply with our target audience. We saw a 30% increase in engagement during the campaign period.',
    campaign: 'Organic Skincare Launch',
    metrics: { communication: 5, quality: 5, timeliness: 4, professionalism: 5 },
    helpful: 18,
    date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    reviewer: { name: 'Mark Johnson', company: 'FitPro Supplements', verified: false },
    rating: 4,
    title: 'Great results, slightly delayed',
    content: 'The content quality was excellent and drove significant traffic to our website. There was a minor delay with the final deliverable, but Sarah communicated proactively and the results more than made up for it.',
    campaign: 'Fitness Challenge Campaign',
    metrics: { communication: 4, quality: 5, timeliness: 3, professionalism: 4 },
    helpful: 12,
    response: 'Thank you for the honest feedback, Mark! I apologize for the delay on the final piece. I\'ve improved my workflow to ensure timely delivery on all future projects.',
    date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

const VERIFICATION_BADGES: VerificationBadge[] = [
  { id: '1', type: 'identity', label: 'Identity Verified', description: 'Government ID verified', status: 'verified', verifiedAt: '2025-06-15' },
  { id: '2', type: 'email', label: 'Email Verified', description: 'Email address confirmed', status: 'verified', verifiedAt: '2025-05-01' },
  { id: '3', type: 'social', label: 'Social Verified', description: 'Social media accounts linked', status: 'verified', verifiedAt: '2025-05-10' },
  { id: '4', type: 'top_rated', label: 'Top Rated', description: '4.8+ avg rating with 5+ reviews', status: 'verified', verifiedAt: '2025-09-01' },
  { id: '5', type: 'fast_responder', label: 'Fast Responder', description: 'Responds within 2 hours', status: 'pending' },
  { id: '6', type: 'premium', label: 'Premium Creator', description: 'Completed 10+ campaigns with 4.5+ rating', status: 'not_started' },
]

export default function ReputationPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'badges'>('overview')

  const overallRating = 4.8
  const totalReviews = 12
  const reputationScore = 92
  const responseRate = 98
  const onTimeDelivery = 95
  const repeatRate = 67

  const ratingDistribution = [
    { stars: 5, count: 9, percentage: 75 },
    { stars: 4, count: 2, percentage: 17 },
    { stars: 3, count: 1, percentage: 8 },
    { stars: 2, count: 0, percentage: 0 },
    { stars: 1, count: 0, percentage: 0 },
  ]

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const sizeClass = size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5'
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`${sizeClass} ${star <= rating ? 'text-[rgb(var(--brand-primary))] fill-[rgb(var(--brand-primary))]' : 'text-[rgb(var(--muted))]'}`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-surface">
      <div className="container py-4 sm:py-6 lg:py-8">
        <motion.div initial="initial" animate="animate" variants={staggerContainer}>
          {/* Header */}
          <motion.div variants={staggerItem} className="mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold gradient-text">Reputation & Reviews</h1>
            <p className="text-xs sm:text-sm text-[rgb(var(--muted))]">Build trust and showcase your track record</p>
          </motion.div>

          {/* Reputation Score Card */}
          <motion.div variants={staggerItem} className="mb-4 sm:mb-6">
            <Card className="border-[rgb(var(--brand-primary))]/20 bg-gradient-to-r from-[rgb(var(--brand-primary))]/5 to-transparent">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center bg-gradient-to-br from-[rgb(var(--brand-primary))]/20 to-[rgb(var(--brand-secondary))]/20 border-4 border-[rgb(var(--brand-primary))]/30">
                      <div className="text-center">
                        <div className="text-2xl sm:text-3xl font-bold gradient-text">{reputationScore}</div>
                        <div className="text-[10px] sm:text-xs text-[rgb(var(--muted))]">Score</div>
                      </div>
                    </div>
                    <div className="absolute -top-1 -right-1 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] flex items-center justify-center">
                      <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-0.5 sm:gap-1 mb-0.5 sm:mb-1">
                        {renderStars(Math.round(overallRating), 'sm')}
                      </div>
                      <div className="text-base sm:text-lg font-bold">{overallRating}</div>
                      <div className="text-[10px] sm:text-xs text-[rgb(var(--muted))]">{totalReviews} reviews</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg sm:text-2xl font-bold text-[rgb(var(--success))]">{responseRate}%</div>
                      <div className="text-[10px] sm:text-xs text-[rgb(var(--muted))]">Response Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg sm:text-2xl font-bold text-[rgb(var(--info))]">{onTimeDelivery}%</div>
                      <div className="text-[10px] sm:text-xs text-[rgb(var(--muted))]">On-time Delivery</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg sm:text-2xl font-bold text-[rgb(var(--brand-primary))]">{repeatRate}%</div>
                      <div className="text-[10px] sm:text-xs text-[rgb(var(--muted))]">Repeat Brands</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tab Navigation */}
          <motion.div variants={staggerItem} className="flex gap-1.5 sm:gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            {[
              { value: 'overview' as const, label: 'Overview' },
              { value: 'reviews' as const, label: 'Reviews' },
              { value: 'badges' as const, label: 'Verification Badges' },
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-3 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.value
                    ? 'bg-gradient-to-r from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] text-white shadow-lg'
                    : 'bg-[rgb(var(--surface))] text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </motion.div>

          {/* Overview */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Rating Distribution */}
              <motion.div variants={staggerItem}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm sm:text-base">Rating Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 sm:space-y-3">
                    {ratingDistribution.map(item => (
                      <div key={item.stars} className="flex items-center gap-3">
                        <div className="flex items-center gap-1 w-16 shrink-0">
                          <span className="text-sm">{item.stars}</span>
                          <Star className="h-3.5 w-3.5 text-[rgb(var(--brand-primary))] fill-[rgb(var(--brand-primary))]" />
                        </div>
                        <div className="flex-1 h-2 rounded-full bg-[rgb(var(--surface))] overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))]"
                            initial={{ width: 0 }}
                            animate={{ width: `${item.percentage}%` }}
                            transition={{ duration: 0.8 }}
                          />
                        </div>
                        <span className="text-sm text-[rgb(var(--muted))] w-8 text-right">{item.count}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Performance Metrics */}
              <motion.div variants={staggerItem}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm sm:text-base">Performance Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    {[
                      { label: 'Communication', score: 4.9, icon: MessageCircle },
                      { label: 'Content Quality', score: 4.8, icon: Star },
                      { label: 'Timeliness', score: 4.5, icon: Clock },
                      { label: 'Professionalism', score: 4.9, icon: Briefcase },
                    ].map(metric => (
                      <div key={metric.label}>
                        <div className="flex items-center justify-between text-sm mb-1.5">
                          <div className="flex items-center gap-2">
                            <metric.icon className="h-4 w-4 text-[rgb(var(--muted))]" />
                            <span>{metric.label}</span>
                          </div>
                          <span className="font-semibold">{metric.score}/5.0</span>
                        </div>
                        <div className="h-2 rounded-full bg-[rgb(var(--surface))] overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))]"
                            initial={{ width: 0 }}
                            animate={{ width: `${(metric.score / 5) * 100}%` }}
                            transition={{ duration: 0.8 }}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Stats */}
              <motion.div variants={staggerItem} className="sm:col-span-2">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {[
                    { label: 'Campaigns Completed', value: '12', icon: Briefcase, color: 'text-[rgb(var(--brand-primary))]' },
                    { label: 'Brands Worked With', value: '8', icon: User, color: 'text-[rgb(var(--info))]' },
                    { label: 'Total Earnings', value: '$45K+', icon: TrendingUp, color: 'text-[rgb(var(--success))]' },
                    { label: 'Avg Response Time', value: '1.5h', icon: Zap, color: 'text-[rgb(var(--warning))]' },
                  ].map(stat => (
                    <Card key={stat.label}>
                      <CardContent className="p-3 sm:p-4 text-center">
                        <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-1 sm:mb-2 ${stat.color}`} />
                        <div className="text-lg sm:text-xl font-bold">{stat.value}</div>
                        <div className="text-[10px] sm:text-xs text-[rgb(var(--muted))]">{stat.label}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            </div>
          )}

          {/* Reviews */}
          {activeTab === 'reviews' && (
            <div className="space-y-3 sm:space-y-4">
              {MOCK_REVIEWS.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-3 mb-2 sm:mb-3">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                          <Avatar size="sm" fallback={getInitials(review.reviewer.name)} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1 sm:gap-1.5">
                              <span className="font-semibold text-xs sm:text-sm truncate">{review.reviewer.name}</span>
                              {review.reviewer.verified && (
                                <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[rgb(var(--brand-primary))] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <div className="text-[10px] sm:text-xs text-[rgb(var(--muted))] truncate">{review.reviewer.company} · {review.campaign}</div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          {renderStars(review.rating)}
                          <div className="text-[10px] sm:text-xs text-[rgb(var(--muted))] mt-0.5 sm:mt-1">{formatRelativeTime(review.date)}</div>
                        </div>
                      </div>

                      <h4 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2">{review.title}</h4>
                      <p className="text-xs sm:text-sm text-[rgb(var(--muted))] mb-3 sm:mb-4">{review.content}</p>

                      {/* Metric Badges */}
                      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                        {Object.entries(review.metrics).map(([key, value]) => (
                          <Badge key={key} variant="outline" className="text-[9px] sm:text-[10px]">
                            {key.charAt(0).toUpperCase() + key.slice(1)}: {value}/5
                          </Badge>
                        ))}
                      </div>

                      {/* Response */}
                      {review.response && (
                        <div className="p-2.5 sm:p-3 rounded-lg bg-[rgb(var(--surface))] border-l-2 border-[rgb(var(--brand-primary))]">
                          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                            <Quote className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[rgb(var(--brand-primary))]" />
                            <span className="text-[10px] sm:text-xs font-semibold">Your Response</span>
                          </div>
                          <p className="text-xs sm:text-sm text-[rgb(var(--muted))]">{review.response}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-[rgb(var(--border))]">
                        <button className="flex items-center gap-1.5 text-sm text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] transition-colors">
                          <ThumbsUp className="h-4 w-4" />
                          <span>Helpful ({review.helpful})</span>
                        </button>
                        {!review.response && (
                          <Button variant="ghost" size="sm">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Respond
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Verification Badges */}
          {activeTab === 'badges' && (
            <div className="space-y-4 sm:space-y-6">
              <motion.div variants={staggerItem}>
                <Card className="border-[rgb(var(--success))]/20 bg-[rgb(var(--success))]/5">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-[rgb(var(--success))] shrink-0 mt-0.5" />
                      <p className="text-xs sm:text-sm text-[rgb(var(--muted))]">
                        Verification badges help build trust with brands. Complete all verifications to unlock the &quot;Premium Creator&quot; badge and get priority in search results.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {VERIFICATION_BADGES.map((badge, index) => (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={`h-full ${badge.status === 'verified' ? 'border-[rgb(var(--success))]/30' : ''}`}>
                      <CardContent className="p-4 sm:p-5">
                        <div className="flex items-start justify-between mb-2 sm:mb-3">
                          <div className={`p-2 sm:p-2.5 rounded-xl ${
                            badge.status === 'verified' ? 'bg-[rgb(var(--success))]/10' :
                            badge.status === 'pending' ? 'bg-[rgb(var(--warning))]/10' :
                            'bg-[rgb(var(--surface))]'
                          }`}>
                            {badge.status === 'verified' ? (
                              <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-[rgb(var(--success))]" />
                            ) : badge.status === 'pending' ? (
                              <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-[rgb(var(--warning))]" />
                            ) : (
                              <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-[rgb(var(--muted))]" />
                            )}
                          </div>
                          <Badge
                            variant={badge.status === 'verified' ? 'success' : badge.status === 'pending' ? 'warning' : 'default'}
                            className="text-[9px] sm:text-[10px]"
                          >
                            {badge.status === 'not_started' ? 'Not Started' : badge.status}
                          </Badge>
                        </div>
                        <h3 className="font-bold text-sm sm:text-base mb-0.5 sm:mb-1">{badge.label}</h3>
                        <p className="text-xs sm:text-sm text-[rgb(var(--muted))] mb-2 sm:mb-3">{badge.description}</p>
                        {badge.verifiedAt && (
                          <p className="text-[10px] sm:text-xs text-[rgb(var(--success))]">Verified on {formatDate(badge.verifiedAt)}</p>
                        )}
                        {badge.status === 'not_started' && (
                          <Button variant="outline" size="sm" className="w-full mt-1.5 sm:mt-2 text-xs">
                            Start Verification
                          </Button>
                        )}
                        {badge.status === 'pending' && (
                          <p className="text-[10px] sm:text-xs text-[rgb(var(--warning))]">Under review - usually takes 24-48 hours</p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
