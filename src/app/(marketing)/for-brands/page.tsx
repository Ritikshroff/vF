'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Search, Megaphone, TrendingUp, Users, Target, Shield, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations'

export default function ForBrandsPage() {
  const features = [
    {
      icon: Search,
      title: 'Smart Influencer Discovery',
      description: 'Find creators that perfectly match your brand values and target audience using our AI-powered search.',
    },
    {
      icon: Megaphone,
      title: 'Campaign Management',
      description: 'Create, manage, and track all your influencer campaigns from one powerful dashboard.',
    },
    {
      icon: TrendingUp,
      title: 'Real-Time Analytics',
      description: 'Monitor campaign performance, engagement metrics, and ROI with comprehensive analytics.',
    },
    {
      icon: Users,
      title: 'Vetted Influencers',
      description: 'Access a network of 50,000+ verified influencers across all major platforms and niches.',
    },
    {
      icon: Target,
      title: 'Audience Insights',
      description: 'Get detailed demographic data and engagement statistics for every influencer.',
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'Protected transactions with built-in escrow system for peace of mind.',
    },
  ]

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="py-20 md:py-32">
        <div className="container">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div variants={staggerItem}>
              <Badge variant="primary" className="mb-4">For Brands</Badge>
            </motion.div>
            <motion.h1 variants={staggerItem} className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              Grow Your Brand with <span className="gradient-text">Authentic Influencers</span>
            </motion.h1>
            <motion.p variants={staggerItem} className="text-lg md:text-xl text-[rgb(var(--muted))] mb-8">
              Connect with the perfect creators to amplify your message, reach new audiences, and drive real results.
            </motion.p>
            <motion.div variants={staggerItem} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/role-selector">
                <Button size="lg" variant="gradient">
                  Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button size="lg" variant="outline">How It Works</Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 md:py-32 bg-[rgb(var(--surface))]">
        <div className="container">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={staggerItem} className="text-3xl md:text-5xl font-bold mb-4">
              Everything You Need to Succeed
            </motion.h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card hoverable className="h-full">
                  <CardContent className="p-8">
                    <feature.icon className="h-12 w-12 text-[rgb(var(--brand-primary))] mb-4" />
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-[rgb(var(--muted))]">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 md:py-32">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { value: '2,500+', label: 'Active Brands' },
              { value: '15,000+', label: 'Campaigns Launched' },
              { value: '500M+', label: 'Total Reach' },
              { value: '12x', label: 'Average ROI' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">
                  {stat.value}
                </div>
                <div className="text-[rgb(var(--muted))]">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] text-white">
        <div className="container">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.h2 variants={staggerItem} className="text-3xl md:text-5xl font-bold mb-6">
              Ready to Scale Your Marketing?
            </motion.h2>
            <motion.p variants={staggerItem} className="text-lg md:text-xl mb-8 opacity-90">
              Join leading brands already seeing incredible results with ViralFluencer.
            </motion.p>
            <motion.div variants={staggerItem}>
              <Link href="/role-selector">
                <Button size="lg" variant="outline" className="bg-white text-[rgb(var(--brand-primary))] hover:bg-white/90 border-none">
                  Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
