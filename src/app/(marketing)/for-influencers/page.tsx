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
      <section className="py-8 sm:py-12 lg:py-16 xl:py-20">
        <div className="container">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div variants={staggerItem}>
              <Badge variant="primary" className="mb-3 sm:mb-4">For Influencers</Badge>
            </motion.div>
            <motion.h1 variants={staggerItem} className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold mb-4 sm:mb-6">
              Turn Your Influence into <span className="gradient-text">Income</span>
            </motion.h1>
            <motion.p variants={staggerItem} className="text-base sm:text-lg lg:text-xl text-[rgb(var(--muted))] mb-6 sm:mb-8">
              Connect with top brands, get paid fairly, and grow your creator business with the tools you need to succeed.
            </motion.p>
            <motion.div variants={staggerItem} className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
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
              Why Creators Love Us
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card hoverable className="h-full">
                  <CardContent className="p-4 sm:p-6 lg:p-8">
                    <benefit.icon className="h-10 w-10 sm:h-12 sm:w-12 text-[rgb(var(--brand-primary))] mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-1.5 sm:mb-2">{benefit.title}</h3>
                    <p className="text-xs sm:text-sm text-[rgb(var(--muted))]">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 sm:py-12 lg:py-16 xl:py-20">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 text-center">
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
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text mb-1 sm:mb-2">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-[rgb(var(--muted))]">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-8 sm:py-12 lg:py-16 xl:py-20 bg-gradient-to-br from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] text-white">
        <div className="container">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.h2 variants={staggerItem} className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 sm:mb-6">
              Start Earning Today
            </motion.h2>
            <motion.p variants={staggerItem} className="text-sm sm:text-base lg:text-lg xl:text-xl mb-6 sm:mb-8 opacity-90">
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
