'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Crown,
  Check,
  Zap,
  Star,
  Shield,
  BarChart3,
  Users,
  MessageCircle,
  Brain,
  Rocket,
  CreditCard,
  Calendar,
  ArrowRight,
  Sparkles,
  ChevronDown,
  HelpCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'
import { formatCurrency } from '@/lib/utils'
import { staggerContainer, staggerItem } from '@/lib/animations'

interface Plan {
  id: string
  name: string
  tier: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'
  price: number | null
  period: string
  description: string
  features: { text: string; included: boolean }[]
  limits: { campaigns: string; influencers: string; analytics: string; support: string }
  highlighted: boolean
  icon: typeof Crown
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    tier: 'FREE',
    price: 0,
    period: 'forever',
    description: 'Get started with basic features',
    features: [
      { text: 'Up to 2 active campaigns', included: true },
      { text: 'Basic influencer search', included: true },
      { text: 'Standard analytics', included: true },
      { text: 'Email support', included: true },
      { text: 'AI-powered matching', included: false },
      { text: 'Advanced analytics', included: false },
      { text: 'CRM features', included: false },
      { text: 'Custom integrations', included: false },
    ],
    limits: { campaigns: '2', influencers: '100 searches/mo', analytics: 'Basic', support: 'Email' },
    highlighted: false,
    icon: Zap,
  },
  {
    id: 'starter',
    name: 'Starter',
    tier: 'STARTER',
    price: 99,
    period: 'month',
    description: 'Perfect for small businesses',
    features: [
      { text: 'Up to 10 active campaigns', included: true },
      { text: 'Enhanced influencer search', included: true },
      { text: 'Standard analytics + reports', included: true },
      { text: 'Priority email support', included: true },
      { text: 'Basic AI matching', included: true },
      { text: 'Advanced analytics', included: false },
      { text: 'Full CRM features', included: false },
      { text: 'Custom integrations', included: false },
    ],
    limits: { campaigns: '10', influencers: '500 searches/mo', analytics: 'Standard + Reports', support: 'Priority Email' },
    highlighted: false,
    icon: Star,
  },
  {
    id: 'professional',
    name: 'Professional',
    tier: 'PROFESSIONAL',
    price: 299,
    period: 'month',
    description: 'For growing brands & agencies',
    features: [
      { text: 'Unlimited campaigns', included: true },
      { text: 'Full influencer database access', included: true },
      { text: 'Advanced analytics + custom reports', included: true },
      { text: 'Priority support + live chat', included: true },
      { text: 'AI matching + content suggestions', included: true },
      { text: 'Advanced analytics dashboard', included: true },
      { text: 'Full CRM + pipeline management', included: true },
      { text: 'Custom integrations', included: false },
    ],
    limits: { campaigns: 'Unlimited', influencers: 'Unlimited', analytics: 'Advanced + Custom', support: 'Priority + Chat' },
    highlighted: true,
    icon: Crown,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tier: 'ENTERPRISE',
    price: null,
    period: 'custom',
    description: 'For large-scale operations',
    features: [
      { text: 'Everything in Professional', included: true },
      { text: 'Unlimited team members', included: true },
      { text: 'White-label reports', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'Full AI suite + fraud detection', included: true },
      { text: 'Real-time analytics', included: true },
      { text: 'Advanced CRM + automation', included: true },
      { text: 'Custom integrations + API', included: true },
    ],
    limits: { campaigns: 'Unlimited', influencers: 'Unlimited', analytics: 'Real-time + White-label', support: 'Dedicated Manager' },
    highlighted: false,
    icon: Rocket,
  },
]

const FAQS = [
  { q: 'Can I switch plans at any time?', a: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate the difference.' },
  { q: 'Is there a free trial?', a: 'Yes, all paid plans come with a 14-day free trial. No credit card required to start.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, PayPal, and wire transfers for Enterprise plans.' },
  { q: 'Can I cancel anytime?', a: 'Absolutely. There are no long-term contracts. Cancel anytime and your plan will remain active until the end of the billing period.' },
]

export default function SubscriptionsPage() {
  const { user } = useAuth()
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly')
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const currentPlan = 'free'

  const getPrice = (plan: Plan) => {
    if (plan.price === null) return null
    if (billingPeriod === 'annual') return Math.floor(plan.price * 0.8)
    return plan.price
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-surface">
      <div className="container max-w-6xl py-4 sm:py-6 lg:py-8">
        <motion.div initial="initial" animate="animate" variants={staggerContainer}>
          {/* Header */}
          <motion.div variants={staggerItem} className="text-center mb-6 sm:mb-8 lg:mb-12">
            <Badge variant="primary" className="mb-3 sm:mb-4">
              <Sparkles className="h-3 w-3 mr-1" />
              Pricing Plans
            </Badge>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 sm:mb-4">
              Choose Your <span className="gradient-text">Growth Plan</span>
            </h1>
            <p className="text-sm sm:text-base text-[rgb(var(--muted))] max-w-2xl mx-auto mb-4 sm:mb-6">
              Scale your influencer marketing with the right tools. Start free and upgrade as you grow.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-3 p-1.5 rounded-full bg-[rgb(var(--surface))] border border-[rgb(var(--border))]">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  billingPeriod === 'monthly'
                    ? 'bg-gradient-to-r from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] text-white shadow'
                    : 'text-[rgb(var(--muted))]'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('annual')}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                  billingPeriod === 'annual'
                    ? 'bg-gradient-to-r from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] text-white shadow'
                    : 'text-[rgb(var(--muted))]'
                }`}
              >
                Annual
                <Badge variant="success" className="text-[10px] py-0">-20%</Badge>
              </button>
            </div>
          </motion.div>

          {/* Plans Grid */}
          <motion.div variants={staggerItem} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8 sm:mb-12">
            {PLANS.map((plan, index) => {
              const price = getPrice(plan)
              const isCurrent = plan.id === currentPlan

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <Badge variant="primary" className="shadow-lg">
                        <Star className="h-3 w-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <Card className={`h-full flex flex-col ${
                    plan.highlighted
                      ? 'border-[rgb(var(--brand-primary))] ring-1 ring-[rgb(var(--brand-primary))]/20'
                      : ''
                  }`}>
                    <CardContent className="p-4 sm:p-5 lg:p-6 flex flex-col h-full">
                      <div className="flex items-center gap-2 mb-2 sm:mb-3">
                        <div className={`p-1.5 sm:p-2 rounded-lg ${plan.highlighted ? 'bg-[rgb(var(--brand-primary))]/10' : 'bg-[rgb(var(--surface))]'}`}>
                          <plan.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${plan.highlighted ? 'text-[rgb(var(--brand-primary))]' : 'text-[rgb(var(--muted))]'}`} />
                        </div>
                        <h3 className="text-base sm:text-lg font-bold">{plan.name}</h3>
                      </div>

                      <div className="mb-3 sm:mb-4">
                        {price !== null ? (
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl sm:text-3xl font-bold">{formatCurrency(price)}</span>
                            <span className="text-sm text-[rgb(var(--muted))]">/{billingPeriod === 'annual' ? 'mo' : 'mo'}</span>
                          </div>
                        ) : (
                          <div className="text-2xl sm:text-3xl font-bold">Custom</div>
                        )}
                        <p className="text-sm text-[rgb(var(--muted))] mt-1">{plan.description}</p>
                        {billingPeriod === 'annual' && price !== null && price > 0 && (
                          <p className="text-xs text-[rgb(var(--success))] mt-1">
                            Save {formatCurrency(Math.floor(plan.price! * 12 * 0.2))}/year
                          </p>
                        )}
                      </div>

                      <Button
                        variant={isCurrent ? 'outline' : plan.highlighted ? 'gradient' : 'outline'}
                        className="w-full mb-3 sm:mb-4"
                        disabled={isCurrent}
                      >
                        {isCurrent ? 'Current Plan' : price === null ? 'Contact Sales' : 'Get Started'}
                        {!isCurrent && <ArrowRight className="h-4 w-4 ml-1" />}
                      </Button>

                      <div className="space-y-2 sm:space-y-2.5 flex-1">
                        {plan.features.map((feature, i) => (
                          <div key={i} className="flex items-start gap-2">
                            {feature.included ? (
                              <Check className="h-4 w-4 text-[rgb(var(--success))] mt-0.5 shrink-0" />
                            ) : (
                              <div className="w-4 h-4 flex items-center justify-center mt-0.5 shrink-0">
                                <div className="w-1 h-1 rounded-full bg-[rgb(var(--muted))]" />
                              </div>
                            )}
                            <span className={`text-sm ${feature.included ? '' : 'text-[rgb(var(--muted))]'}`}>
                              {feature.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>

          {/* Feature Comparison */}
          <motion.div variants={staggerItem} className="mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">Feature Comparison</h2>
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-[rgb(var(--border))]">
                      <th className="text-left p-4 text-sm font-medium text-[rgb(var(--muted))]">Feature</th>
                      {PLANS.map(p => (
                        <th key={p.id} className="text-center p-4 text-sm font-medium">
                          {p.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { feature: 'Active Campaigns', values: ['2', '10', 'Unlimited', 'Unlimited'] },
                      { feature: 'Influencer Search', values: ['100/mo', '500/mo', 'Unlimited', 'Unlimited'] },
                      { feature: 'Analytics', values: ['Basic', 'Standard', 'Advanced', 'Real-time'] },
                      { feature: 'AI Matching', values: [false, 'Basic', 'Full', 'Full + Custom'] },
                      { feature: 'CRM', values: [false, false, true, 'Advanced'] },
                      { feature: 'Team Members', values: ['1', '3', '10', 'Unlimited'] },
                      { feature: 'API Access', values: [false, false, false, true] },
                      { feature: 'Support', values: ['Email', 'Priority', 'Chat + Priority', 'Dedicated'] },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-[rgb(var(--border))] last:border-0">
                        <td className="p-4 text-sm">{row.feature}</td>
                        {row.values.map((val, j) => (
                          <td key={j} className="text-center p-4">
                            {typeof val === 'boolean' ? (
                              val ? (
                                <Check className="h-4 w-4 text-[rgb(var(--success))] mx-auto" />
                              ) : (
                                <div className="w-1 h-1 rounded-full bg-[rgb(var(--muted))] mx-auto" />
                              )
                            ) : (
                              <span className="text-sm">{val}</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </motion.div>

          {/* FAQs */}
          <motion.div variants={staggerItem}>
            <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto space-y-2 sm:space-y-3">
              {FAQS.map((faq, i) => (
                <Card key={i} className="cursor-pointer" onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <HelpCircle className="h-5 w-5 text-[rgb(var(--brand-primary))] shrink-0" />
                        <span className="font-medium text-sm">{faq.q}</span>
                      </div>
                      <ChevronDown className={`h-4 w-4 text-[rgb(var(--muted))] transition-transform ${expandedFaq === i ? 'rotate-180' : ''}`} />
                    </div>
                    {expandedFaq === i && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-sm text-[rgb(var(--muted))] mt-3 ml-8"
                      >
                        {faq.a}
                      </motion.p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
