'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Search,
  Target,
  TrendingUp,
  Users,
  BarChart3,
  Brain,
  Zap,
  ChevronRight,
  Star,
  DollarSign,
  Shield,
  CheckCircle2,
  ArrowRight,
  Lightbulb,
  MessageCircle,
  Bookmark,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { formatCompactNumber, formatCurrency, getInitials } from '@/lib/utils'
import { staggerContainer, staggerItem } from '@/lib/animations'

interface AIMatch {
  id: string
  influencer: {
    id: string
    name: string
    username: string
    avatar?: string
    verified: boolean
    categories: string[]
    platforms: { name: string; followers: number; engagement: number }[]
    totalFollowers: number
    avgEngagement: number
    location: string
  }
  matchScore: number
  matchReasons: { factor: string; score: number; description: string }[]
  estimatedROI: number
  suggestedRate: { min: number; max: number }
  audienceOverlap: number
  brandSafety: number
  contentQuality: number
}

interface ContentSuggestion {
  id: string
  title: string
  description: string
  platform: string
  format: string
  estimatedReach: number
  confidence: number
  tags: string[]
}

const MOCK_MATCHES: AIMatch[] = [
  {
    id: '1',
    influencer: {
      id: 'i1', name: 'Sarah Chen', username: 'sarahcreates', verified: true,
      categories: ['Fashion', 'Lifestyle'],
      platforms: [{ name: 'Instagram', followers: 245000, engagement: 4.8 }, { name: 'TikTok', followers: 180000, engagement: 6.2 }],
      totalFollowers: 425000, avgEngagement: 5.5, location: 'Los Angeles, CA',
    },
    matchScore: 96,
    matchReasons: [
      { factor: 'Audience Fit', score: 98, description: 'High overlap with your target demographic (18-35, US)' },
      { factor: 'Content Style', score: 95, description: 'Visual storytelling aligns with brand aesthetic' },
      { factor: 'Engagement', score: 94, description: 'Above-average engagement across all platforms' },
      { factor: 'Brand Safety', score: 97, description: 'Clean content history, professional communication' },
    ],
    estimatedROI: 340,
    suggestedRate: { min: 2500, max: 4000 },
    audienceOverlap: 72,
    brandSafety: 97,
    contentQuality: 95,
  },
  {
    id: '2',
    influencer: {
      id: 'i2', name: 'Emma Davis', username: 'emmafoodie', verified: false,
      categories: ['Food', 'Lifestyle'],
      platforms: [{ name: 'Instagram', followers: 67000, engagement: 8.3 }, { name: 'TikTok', followers: 145000, engagement: 9.1 }],
      totalFollowers: 212000, avgEngagement: 8.7, location: 'New York, NY',
    },
    matchScore: 91,
    matchReasons: [
      { factor: 'Engagement', score: 97, description: 'Exceptional engagement rates across platforms' },
      { factor: 'Audience Fit', score: 89, description: 'Strong overlap with food & lifestyle audience' },
      { factor: 'Content Style', score: 90, description: 'High-quality visual content with authentic feel' },
      { factor: 'Value', score: 88, description: 'Great ROI potential for budget range' },
    ],
    estimatedROI: 420,
    suggestedRate: { min: 1200, max: 2000 },
    audienceOverlap: 65,
    brandSafety: 92,
    contentQuality: 90,
  },
  {
    id: '3',
    influencer: {
      id: 'i3', name: 'Mia Johnson', username: 'miastyle', verified: true,
      categories: ['Beauty', 'Fashion'],
      platforms: [{ name: 'Instagram', followers: 520000, engagement: 3.9 }, { name: 'TikTok', followers: 890000, engagement: 5.8 }],
      totalFollowers: 1410000, avgEngagement: 4.85, location: 'Miami, FL',
    },
    matchScore: 88,
    matchReasons: [
      { factor: 'Reach', score: 96, description: 'Massive audience reach across key platforms' },
      { factor: 'Brand Alignment', score: 91, description: 'Strong beauty and fashion brand affinity' },
      { factor: 'Audience Fit', score: 85, description: 'Good demographic overlap' },
      { factor: 'Content Quality', score: 88, description: 'Professional production quality' },
    ],
    estimatedROI: 280,
    suggestedRate: { min: 5000, max: 8000 },
    audienceOverlap: 58,
    brandSafety: 94,
    contentQuality: 88,
  },
]

const CONTENT_SUGGESTIONS: ContentSuggestion[] = [
  {
    id: '1',
    title: 'Summer Style Try-On Haul',
    description: 'Create a try-on video showcasing the summer collection with trending audio. Focus on outfit transitions and styling tips.',
    platform: 'TikTok',
    format: 'Short Video',
    estimatedReach: 500000,
    confidence: 92,
    tags: ['trending', 'try-on', 'summer'],
  },
  {
    id: '2',
    title: 'Behind-the-Scenes Campaign Shoot',
    description: 'Document the creative process behind a campaign shoot. Audiences love authentic, raw content showing the reality of influencer work.',
    platform: 'Instagram',
    format: 'Carousel + Reels',
    estimatedReach: 250000,
    confidence: 87,
    tags: ['BTS', 'authentic', 'storytelling'],
  },
  {
    id: '3',
    title: 'Product Comparison: Before & After',
    description: 'Show real results or transformations using the product. Use split-screen format for maximum impact.',
    platform: 'Instagram',
    format: 'Reels',
    estimatedReach: 350000,
    confidence: 84,
    tags: ['transformation', 'results', 'authentic'],
  },
]

export default function AIMatchingPage() {
  const [activeView, setActiveView] = useState<'matching' | 'content' | 'pricing'>('matching')
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAnalyze = () => {
    setIsAnalyzing(true)
    setTimeout(() => setIsAnalyzing(false), 2000)
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-surface">
      <div className="container py-4 md:py-8">
        <motion.div initial="initial" animate="animate" variants={staggerContainer}>
          {/* Header */}
          <motion.div variants={staggerItem} className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                  <Sparkles className="h-8 w-8 text-[rgb(var(--brand-primary))]" />
                  <span className="gradient-text">AI Intelligence</span>
                </h1>
                <p className="text-sm text-[rgb(var(--muted))] mt-1">AI-powered insights to supercharge your campaigns</p>
              </div>
              <Button variant="gradient" onClick={handleAnalyze}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
                {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
              </Button>
            </div>
          </motion.div>

          {/* View Tabs */}
          <motion.div variants={staggerItem} className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {[
              { value: 'matching' as const, label: 'AI Matching', icon: Target },
              { value: 'content' as const, label: 'Content Ideas', icon: Lightbulb },
              { value: 'pricing' as const, label: 'Pricing Intel', icon: DollarSign },
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() => setActiveView(tab.value)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeView === tab.value
                    ? 'bg-gradient-to-r from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] text-white shadow-lg'
                    : 'bg-[rgb(var(--surface))] text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </motion.div>

          {/* AI Matching View */}
          {activeView === 'matching' && (
            <div className="space-y-6">
              {/* AI Summary */}
              <motion.div variants={staggerItem}>
                <Card className="border-[rgb(var(--brand-primary))]/20 bg-gradient-to-r from-[rgb(var(--brand-primary))]/5 to-transparent">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-[rgb(var(--brand-primary))]/10">
                        <Brain className="h-6 w-6 text-[rgb(var(--brand-primary))]" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">AI Match Summary</h3>
                        <p className="text-sm text-[rgb(var(--muted))]">
                          Based on your campaign goals, target audience, and budget, we&apos;ve identified {MOCK_MATCHES.length} high-potential matches.
                          The top match has a <span className="text-[rgb(var(--brand-primary))] font-semibold">{MOCK_MATCHES[0].matchScore}% compatibility score</span> with
                          an estimated <span className="text-[rgb(var(--success))] font-semibold">{MOCK_MATCHES[0].estimatedROI}% ROI</span>.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Match Cards */}
              <div className="space-y-4">
                {MOCK_MATCHES.map((match, index) => (
                  <motion.div
                    key={match.id}
                    variants={staggerItem}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all ${
                        selectedMatch === match.id
                          ? 'border-[rgb(var(--brand-primary))] ring-1 ring-[rgb(var(--brand-primary))]/20'
                          : 'hover:border-[rgb(var(--brand-primary))]/30'
                      }`}
                      onClick={() => setSelectedMatch(selectedMatch === match.id ? null : match.id)}
                    >
                      <CardContent className="p-4 md:p-6">
                        <div className="flex items-start gap-4">
                          <div className="relative">
                            <Avatar size="xl" fallback={getInitials(match.influencer.name)} />
                            <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] flex items-center justify-center text-white text-xs font-bold">
                              {match.matchScore}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-lg">{match.influencer.name}</span>
                              {match.influencer.verified && (
                                <svg className="h-4 w-4 text-[rgb(var(--brand-primary))]" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              )}
                              <span className="text-sm text-[rgb(var(--muted))]">@{match.influencer.username}</span>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-sm mb-3">
                              <span className="flex items-center gap-1 text-[rgb(var(--muted))]">
                                <Users className="h-3.5 w-3.5" />
                                {formatCompactNumber(match.influencer.totalFollowers)}
                              </span>
                              <span className="flex items-center gap-1 text-[rgb(var(--muted))]">
                                <TrendingUp className="h-3.5 w-3.5" />
                                {match.influencer.avgEngagement}% eng.
                              </span>
                              <span className="flex items-center gap-1 text-[rgb(var(--muted))]">
                                <DollarSign className="h-3.5 w-3.5" />
                                {formatCurrency(match.suggestedRate.min)}-{formatCurrency(match.suggestedRate.max)}
                              </span>
                              <Badge variant="success" className="text-[10px]">
                                {match.estimatedROI}% est. ROI
                              </Badge>
                            </div>

                            {/* Match Score Bars */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {[
                                { label: 'Audience', value: match.audienceOverlap, color: 'bg-[rgb(var(--info))]' },
                                { label: 'Safety', value: match.brandSafety, color: 'bg-[rgb(var(--success))]' },
                                { label: 'Quality', value: match.contentQuality, color: 'bg-[rgb(var(--brand-primary))]' },
                                { label: 'Match', value: match.matchScore, color: 'bg-gradient-to-r from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))]' },
                              ].map(bar => (
                                <div key={bar.label}>
                                  <div className="flex items-center justify-between text-xs mb-1">
                                    <span className="text-[rgb(var(--muted))]">{bar.label}</span>
                                    <span className="font-medium">{bar.value}%</span>
                                  </div>
                                  <div className="h-1.5 rounded-full bg-[rgb(var(--surface))] overflow-hidden">
                                    <motion.div
                                      className={`h-full rounded-full ${bar.color}`}
                                      initial={{ width: 0 }}
                                      animate={{ width: `${bar.value}%` }}
                                      transition={{ duration: 0.8, delay: index * 0.1 }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Expanded Details */}
                            <AnimatePresence>
                              {selectedMatch === match.id && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-4 pt-4 border-t border-[rgb(var(--border))]"
                                >
                                  <h4 className="text-sm font-semibold mb-3">Why this match?</h4>
                                  <div className="space-y-2 mb-4">
                                    {match.matchReasons.map(reason => (
                                      <div key={reason.factor} className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-[rgb(var(--success))] mt-0.5 shrink-0" />
                                        <div>
                                          <span className="text-sm font-medium">{reason.factor} ({reason.score}%)</span>
                                          <p className="text-xs text-[rgb(var(--muted))]">{reason.description}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="flex gap-2">
                                    <Button variant="gradient" size="sm">
                                      <MessageCircle className="h-4 w-4 mr-1" />
                                      Reach Out
                                    </Button>
                                    <Button variant="outline" size="sm">
                                      <Bookmark className="h-4 w-4 mr-1" />
                                      Save
                                    </Button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Content Ideas View */}
          {activeView === 'content' && (
            <div className="space-y-6">
              <motion.div variants={staggerItem}>
                <Card className="border-[rgb(var(--brand-primary))]/20 bg-gradient-to-r from-[rgb(var(--brand-primary))]/5 to-transparent">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-[rgb(var(--brand-primary))]/10">
                        <Lightbulb className="h-6 w-6 text-[rgb(var(--brand-primary))]" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">AI Content Suggestions</h3>
                        <p className="text-sm text-[rgb(var(--muted))]">
                          Based on trending content patterns, your brand identity, and audience preferences, here are our top content recommendations.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {CONTENT_SUGGESTIONS.map((suggestion, index) => (
                  <motion.div
                    key={suggestion.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="h-full flex flex-col hover:border-[rgb(var(--brand-primary))]/30 transition-all">
                      <CardContent className="p-5 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant="outline">{suggestion.platform}</Badge>
                          <Badge variant="success" className="text-[10px]">{suggestion.confidence}% confidence</Badge>
                        </div>
                        <h3 className="font-bold mb-2">{suggestion.title}</h3>
                        <p className="text-sm text-[rgb(var(--muted))] mb-4 flex-1">{suggestion.description}</p>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-[rgb(var(--muted))]">Format</span>
                            <span className="font-medium">{suggestion.format}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-[rgb(var(--muted))]">Est. Reach</span>
                            <span className="font-medium">{formatCompactNumber(suggestion.estimatedReach)}</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {suggestion.tags.map(tag => (
                              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-[rgb(var(--brand-primary))]/10 text-[rgb(var(--brand-primary))]">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="w-full mt-4">
                          Use This Idea
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Pricing Intel View */}
          {activeView === 'pricing' && (
            <div className="space-y-6">
              <motion.div variants={staggerItem}>
                <Card className="border-[rgb(var(--brand-primary))]/20 bg-gradient-to-r from-[rgb(var(--brand-primary))]/5 to-transparent">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-[rgb(var(--brand-primary))]/10">
                        <BarChart3 className="h-6 w-6 text-[rgb(var(--brand-primary))]" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Pricing Intelligence</h3>
                        <p className="text-sm text-[rgb(var(--muted))]">
                          Market-rate pricing data and recommendations based on industry benchmarks, engagement metrics, and content type.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Rate Benchmarks */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Rate Benchmarks by Tier</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { tier: 'Nano (1K-10K)', igPost: '$50-$250', igReel: '$100-$400', ytVideo: '$200-$800', tiktok: '$50-$300' },
                      { tier: 'Micro (10K-100K)', igPost: '$250-$1K', igReel: '$400-$2K', ytVideo: '$800-$3K', tiktok: '$200-$1K' },
                      { tier: 'Mid (100K-500K)', igPost: '$1K-$5K', igReel: '$2K-$8K', ytVideo: '$3K-$10K', tiktok: '$1K-$5K' },
                      { tier: 'Macro (500K-1M)', igPost: '$5K-$15K', igReel: '$8K-$20K', ytVideo: '$10K-$30K', tiktok: '$5K-$15K' },
                    ].map(row => (
                      <div key={row.tier} className="p-3 rounded-lg bg-[rgb(var(--surface))]">
                        <div className="font-medium text-sm mb-2">{row.tier}</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div><span className="text-[rgb(var(--muted))]">IG Post:</span> {row.igPost}</div>
                          <div><span className="text-[rgb(var(--muted))]">IG Reel:</span> {row.igReel}</div>
                          <div><span className="text-[rgb(var(--muted))]">YT Video:</span> {row.ytVideo}</div>
                          <div><span className="text-[rgb(var(--muted))]">TikTok:</span> {row.tiktok}</div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Cost Calculator */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Campaign Cost Estimator</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-xl bg-[rgb(var(--surface))]">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium">Your Campaign Budget</span>
                        <span className="text-2xl font-bold gradient-text">{formatCurrency(15000)}</span>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[rgb(var(--muted))]">Recommended influencers</span>
                          <span className="font-medium">3-5 creators</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[rgb(var(--muted))]">Avg cost per creator</span>
                          <span className="font-medium">{formatCurrency(3000)}-{formatCurrency(5000)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[rgb(var(--muted))]">Estimated total reach</span>
                          <span className="font-medium">{formatCompactNumber(2500000)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[rgb(var(--muted))]">Est. cost per engagement</span>
                          <span className="font-medium">$0.12 - $0.25</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[rgb(var(--muted))]">Estimated ROI</span>
                          <span className="font-medium text-[rgb(var(--success))]">280-400%</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[rgb(var(--brand-primary))]/5 border border-[rgb(var(--brand-primary))]/20">
                      <div className="flex items-start gap-3">
                        <Zap className="h-5 w-5 text-[rgb(var(--brand-primary))] shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-semibold mb-1">AI Recommendation</h4>
                          <p className="text-xs text-[rgb(var(--muted))]">
                            For your budget, we recommend focusing on 3-4 micro-influencers with high engagement rates rather than 1 macro influencer. This typically yields 2.5x higher ROI.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
