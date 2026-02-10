'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { UserCircle, Building2, Search, Megaphone, TrendingUp, DollarSign, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs } from '@/components/ui/tabs'
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations'

export default function HowItWorksPage() {
  const brandSteps = [
    {
      icon: UserCircle,
      title: 'Create Your Profile',
      description: 'Sign up and tell us about your brand, target audience, and campaign goals.',
    },
    {
      icon: Search,
      title: 'Discover Influencers',
      description: 'Use our AI-powered search to find the perfect creators for your brand.',
    },
    {
      icon: Megaphone,
      title: 'Launch Campaigns',
      description: 'Create campaigns, set deliverables, and invite influencers to collaborate.',
    },
    {
      icon: TrendingUp,
      title: 'Track Performance',
      description: 'Monitor real-time analytics, engagement metrics, and ROI from your dashboard.',
    },
  ]

  const influencerSteps = [
    {
      icon: UserCircle,
      title: 'Build Your Profile',
      description: 'Create a compelling profile showcasing your audience, content style, and rates.',
    },
    {
      icon: Search,
      title: 'Get Discovered',
      description: 'Brands find you based on your niche, audience demographics, and engagement.',
    },
    {
      icon: Megaphone,
      title: 'Accept Campaigns',
      description: 'Review campaign invitations, negotiate terms, and accept collaborations you love.',
    },
    {
      icon: DollarSign,
      title: 'Get Paid',
      description: 'Complete deliverables, get approved, and receive payment directly to your account.',
    },
  ]

  const tabs = [
    {
      id: 'brands',
      label: 'For Brands',
      icon: <Building2 className="h-4 w-4" />,
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mt-6 sm:mt-8">
          {brandSteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hoverable className="h-full">
                <CardContent className="p-4 sm:p-6 lg:p-8">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] flex items-center justify-center mb-3 sm:mb-4">
                    <step.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                    <Badge variant="primary" className="text-xs">{index + 1}</Badge>
                    <h3 className="text-base sm:text-lg lg:text-xl font-semibold">{step.title}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-[rgb(var(--muted))]">{step.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ),
    },
    {
      id: 'influencers',
      label: 'For Influencers',
      icon: <UserCircle className="h-4 w-4" />,
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mt-6 sm:mt-8">
          {influencerSteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hoverable className="h-full">
                <CardContent className="p-4 sm:p-6 lg:p-8">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] flex items-center justify-center mb-3 sm:mb-4">
                    <step.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                    <Badge variant="primary" className="text-xs">{index + 1}</Badge>
                    <h3 className="text-base sm:text-lg lg:text-xl font-semibold">{step.title}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-[rgb(var(--muted))]">{step.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-8 sm:py-12 lg:py-16 xl:py-20">
        <div className="container">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 lg:mb-16"
          >
            <motion.div variants={staggerItem}>
              <Badge variant="primary" className="mb-3 sm:mb-4">How It Works</Badge>
            </motion.div>
            <motion.h1 variants={staggerItem} className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6">
              Get Started in <span className="gradient-text">4 Easy Steps</span>
            </motion.h1>
            <motion.p variants={staggerItem} className="text-base sm:text-lg lg:text-xl text-[rgb(var(--muted))]">
              Whether you're a brand or an influencer, our platform makes collaboration simple and effective.
            </motion.p>
          </motion.div>

          {/* Tabs */}
          <div className="max-w-5xl mx-auto">
            <Tabs tabs={tabs} variant="pills" defaultTab="brands" />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-8 sm:py-12 lg:py-16 xl:py-20 bg-[rgb(var(--surface))]">
        <div className="container">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-8 sm:mb-12 lg:mb-16"
          >
            <motion.h2 variants={staggerItem} className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 sm:mb-4">
              Why Choose <span className="gradient-text">ViralFluencer</span>
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {[
              {
                title: 'AI-Powered Matching',
                description: 'Our algorithm finds the perfect influencer-brand matches based on audience, engagement, and values.',
              },
              {
                title: 'Secure Payments',
                description: 'Built-in escrow system ensures both parties are protected throughout the collaboration.',
              },
              {
                title: 'Real-Time Analytics',
                description: 'Track campaign performance with detailed metrics and insights as they happen.',
              },
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-4 sm:p-6 lg:p-8">
                    <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-2 sm:mb-3">{benefit.title}</h3>
                    <p className="text-xs sm:text-sm text-[rgb(var(--muted))]">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 sm:py-12 lg:py-16 xl:py-20">
        <div className="container">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.h2 variants={staggerItem} className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 sm:mb-6">
              Ready to Get Started?
            </motion.h2>
            <motion.p variants={staggerItem} className="text-sm sm:text-base lg:text-lg text-[rgb(var(--muted))] mb-6 sm:mb-8">
              Join thousands of brands and creators already seeing amazing results.
            </motion.p>
            <motion.div variants={staggerItem} className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link href="/role-selector">
                <Button size="lg" variant="gradient">
                  Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline">
                  View Pricing
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
