'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Check, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PRICING_TIERS } from '@/lib/constants'
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations'

export default function PricingPage() {
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
              <Badge variant="primary" className="mb-3 sm:mb-4">Pricing</Badge>
            </motion.div>
            <motion.h1 variants={staggerItem} className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6">
              Simple, <span className="gradient-text">Transparent Pricing</span>
            </motion.h1>
            <motion.p variants={staggerItem} className="text-base sm:text-lg lg:text-xl text-[rgb(var(--muted))]">
              Choose the perfect plan for your business. No hidden fees, no surprises.
            </motion.p>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
            {PRICING_TIERS.map((tier, index) => (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`relative h-full ${
                    tier.highlighted
                      ? 'border-2 border-[rgb(var(--brand-primary))] shadow-xl'
                      : ''
                  }`}
                >
                  {tier.highlighted && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge variant="primary">Most Popular</Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-6 sm:pb-8">
                    <CardTitle className="text-lg sm:text-xl lg:text-2xl mb-1 sm:mb-2">{tier.name}</CardTitle>
                    <p className="text-xs sm:text-sm text-[rgb(var(--muted))] mb-3 sm:mb-4">
                      {tier.description}
                    </p>
                    <div className="mt-3 sm:mt-4">
                      {tier.price === null ? (
                        <div>
                          <div className="text-3xl sm:text-4xl font-bold">Custom</div>
                          <div className="text-xs sm:text-sm text-[rgb(var(--muted))] mt-1">
                            Contact us for pricing
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-baseline justify-center gap-1">
                            <span className="text-3xl sm:text-4xl font-bold">${tier.price}</span>
                            <span className="text-xs sm:text-sm text-[rgb(var(--muted))]">/{tier.period}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 sm:space-y-6">
                    <ul className="space-y-3">
                      {tier.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-[rgb(var(--success))] flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Link href="/role-selector" className="block">
                      <Button
                        variant={tier.highlighted ? 'gradient' : 'outline'}
                        className="w-full"
                      >
                        {tier.price === null ? 'Contact Sales' : 'Get Started'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-8 sm:py-12 lg:py-16 xl:py-20 bg-[rgb(var(--surface))]">
        <div className="container max-w-3xl">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-8 sm:mb-12"
          >
            <motion.h2 variants={staggerItem} className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
              Frequently Asked Questions
            </motion.h2>
          </motion.div>

          <div className="space-y-3 sm:space-y-4 lg:space-y-6">
            {[
              {
                q: 'Can I change plans later?',
                a: 'Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards, PayPal, and wire transfers for enterprise customers.',
              },
              {
                q: 'Is there a free trial?',
                a: 'Yes! All plans come with a 14-day free trial. No credit card required.',
              },
              {
                q: 'What happens when I reach my campaign limit?',
                a: "You can upgrade to a higher plan or contact us for a custom solution that fits your needs.",
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2">{faq.q}</h3>
                    <p className="text-xs sm:text-sm text-[rgb(var(--muted))]">{faq.a}</p>
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
              Still Have Questions?
            </motion.h2>
            <motion.p variants={staggerItem} className="text-sm sm:text-base lg:text-lg text-[rgb(var(--muted))] mb-6 sm:mb-8">
              Our team is here to help you choose the right plan for your business.
            </motion.p>
            <motion.div variants={staggerItem}>
              <Link href="/about">
                <Button size="lg" variant="gradient">
                  Contact Sales <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
