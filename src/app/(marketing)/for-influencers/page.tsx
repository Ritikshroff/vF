'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { DollarSign, Briefcase, TrendingUp, Calendar, Star, Shield, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { staggerContainer, staggerItem } from '@/lib/animations'

export default function ForInfluencersPage() {
  const benefits = [
    {
      icon: DollarSign,
      title: 'Earn More',
      description: 'Get paid fairly for your work with transparent pricing and secure payments.',
    },
    {
      icon: Briefcase,
      title: 'Quality Collaborations',
      description: 'Work with verified brands that align with your values and audience.',
    },
    {
      icon: TrendingUp,
      title: 'Grow Your Business',
      description: 'Access tools and insights to grow your audience and increase your rates.',
    },
    {
      icon: Calendar,
      title: 'Flexible Schedule',
      description: 'Choose campaigns that fit your schedule and content style.',
    },
    {
      icon: Star,
      title: 'Build Your Reputation',
      description: 'Collect reviews and showcase successful collaborations on your profile.',
    },
    {
      icon: Shield,
      title: 'Protected Payments',
      description: 'Escrow system ensures you get paid for your work, every time.',
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
              <Badge variant="primary" className="mb-4">For Influencers</Badge>
            </motion.div>
            <motion.h1 variants={staggerItem} className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              Turn Your Influence into <span className="gradient-text">Income</span>
            </motion.h1>
            <motion.p variants={staggerItem} className="text-lg md:text-xl text-[rgb(var(--muted))] mb-8">
              Connect with top brands, get paid fairly, and grow your creator business with the tools you need to succeed.
            </motion.p>
            <motion.div variants={staggerItem} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/role-selector">
                <Button size="lg" variant="gradient">
                  Join as Creator <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button size="lg" variant="outline">How It Works</Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
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
              Why Creators Love Us
            </motion.h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card hoverable className="h-full">
                  <CardContent className="p-8">
                    <benefit.icon className="h-12 w-12 text-[rgb(var(--brand-primary))] mb-4" />
                    <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-[rgb(var(--muted))]">{benefit.description}</p>
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
              { value: '50,000+', label: 'Active Creators' },
              { value: '$50M+', label: 'Paid to Creators' },
              { value: '4.9/5', label: 'Average Rating' },
              { value: '98%', label: 'On-Time Payment' },
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
              Start Earning Today
            </motion.h2>
            <motion.p variants={staggerItem} className="text-lg md:text-xl mb-8 opacity-90">
              Join thousands of creators who are building successful businesses with ViralFluencer.
            </motion.p>
            <motion.div variants={staggerItem}>
              <Link href="/role-selector">
                <Button size="lg" variant="outline" className="bg-white text-[rgb(var(--brand-primary))] hover:bg-white/90 border-none">
                  Create Your Profile <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
