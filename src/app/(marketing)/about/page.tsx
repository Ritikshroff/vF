'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Mail, Phone, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { CONTACT_EMAIL, PHONE_NUMBER } from '@/lib/constants'
import { staggerContainer, staggerItem } from '@/lib/animations'

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="py-8 sm:py-12 lg:py-16 xl:py-20">
        <div className="container">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.div variants={staggerItem}>
              <Badge variant="primary" className="mb-3 sm:mb-4">About Us</Badge>
            </motion.div>
            <motion.h1 variants={staggerItem} className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6">
              We're Building the Future of <span className="gradient-text">Influencer Marketing</span>
            </motion.h1>
            <motion.p variants={staggerItem} className="text-base sm:text-lg lg:text-xl text-[rgb(var(--muted))]">
              ViralFluencer is on a mission to make authentic brand-creator partnerships accessible to everyone.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-8 sm:py-12 lg:py-16 xl:py-20 bg-[rgb(var(--surface))]">
        <div className="container max-w-4xl">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 variants={staggerItem} className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 text-center">
              Our Mission
            </motion.h2>
            <motion.p variants={staggerItem} className="text-base sm:text-lg text-[rgb(var(--muted))] text-center mb-6 sm:mb-8">
              We believe in the power of authentic connections. Our platform empowers brands to find
              creators who truly resonate with their values, and helps influencers build sustainable
              businesses doing what they love.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mt-8 sm:mt-12">
            {[
              { value: '2019', label: 'Founded' },
              { value: '100+', label: 'Team Members' },
              { value: '$50M+', label: 'Funding Raised' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl sm:text-4xl font-bold gradient-text mb-1 sm:mb-2">{stat.value}</div>
                <div className="text-sm sm:text-base text-[rgb(var(--muted))]">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-8 sm:py-12 lg:py-16 xl:py-20">
        <div className="container max-w-4xl">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-8 sm:mb-12"
          >
            <motion.h2 variants={staggerItem} className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
              Get in Touch
            </motion.h2>
            <motion.p variants={staggerItem} className="text-base sm:text-lg text-[rgb(var(--muted))]">
              Have questions? We'd love to hear from you.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <Mail className="h-6 w-6 sm:h-8 sm:w-8 text-[rgb(var(--brand-primary))] mb-3 sm:mb-4" />
                <h3 className="font-semibold text-sm sm:text-base mb-1.5 sm:mb-2">Email Us</h3>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-xs sm:text-sm text-[rgb(var(--muted))] hover:text-[rgb(var(--brand-primary))]"
                >
                  {CONTACT_EMAIL}
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <Phone className="h-6 w-6 sm:h-8 sm:w-8 text-[rgb(var(--brand-primary))] mb-3 sm:mb-4" />
                <h3 className="font-semibold text-sm sm:text-base mb-1.5 sm:mb-2">Call Us</h3>
                <a
                  href={`tel:${PHONE_NUMBER}`}
                  className="text-xs sm:text-sm text-[rgb(var(--muted))] hover:text-[rgb(var(--brand-primary))]"
                >
                  {PHONE_NUMBER}
                </a>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card>
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <h3 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Send us a message</h3>
              <form className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <Input placeholder="Your Name" />
                  <Input type="email" placeholder="Your Email" />
                </div>
                <Input placeholder="Subject" className="text-sm sm:text-base" />
                <textarea
                  className="w-full min-h-[120px] sm:min-h-[150px] rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--surface-elevated))] px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--brand-primary))] focus-visible:ring-offset-2"
                  placeholder="Your Message"
                />
                <Button variant="gradient" className="w-full sm:w-auto text-sm sm:text-base">
                  Send Message <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
