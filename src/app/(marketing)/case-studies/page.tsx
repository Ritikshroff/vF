"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { caseStudies } from "@/data/case-studies";
import { staggerContainer, staggerItem } from "@/lib/animations";

export default function CaseStudiesPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="py-20 md:py-32">
        <div className="container">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <motion.div variants={staggerItem}>
              <Badge variant="primary" className="mb-4">
                Case Studies
              </Badge>
            </motion.div>
            <motion.h1
              variants={staggerItem}
              className="text-4xl md:text-6xl font-bold mb-6"
            >
              Real Results from{" "}
              <span className="gradient-text">Real Brands</span>
            </motion.h1>
            <motion.p
              variants={staggerItem}
              className="text-lg md:text-xl text-[rgb(var(--muted))]"
            >
              See how brands like yours are achieving incredible results with
              influencer marketing.
            </motion.p>
          </motion.div>

          {/* Case Studies Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {caseStudies.map((study, index) => (
              <motion.div
                key={study.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card hoverable className="h-full overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-[rgb(var(--brand-primary)_/_0.1)] to-[rgb(var(--brand-secondary)_/_0.1)]" />
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline">{study.industry}</Badge>
                    </div>
                    <h3 className="text-xl font-semibold mb-3 line-clamp-2">
                      {study.title}
                    </h3>
                    <p className="text-[rgb(var(--muted))] mb-4 line-clamp-2">
                      {study.summary}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {study.results.slice(0, 2).map((result) => (
                        <div key={result.metric}>
                          <div className="text-2xl font-bold text-[rgb(var(--brand-primary))]">
                            {result.value}
                          </div>
                          <div className="text-xs text-[rgb(var(--muted))]">
                            {result.metric}
                          </div>
                        </div>
                      ))}
                    </div>

                    <Link
                      href={`/case-studies/${study.id}`}
                      className="text-[rgb(var(--brand-primary))] hover:underline text-sm font-medium inline-flex items-center"
                    >
                      Read Full Story <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-32 bg-[rgb(var(--surface))]">
        <div className="container">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.h2
              variants={staggerItem}
              className="text-3xl md:text-5xl font-bold mb-6"
            >
              Ready to Write Your Success Story?
            </motion.h2>
            <motion.p
              variants={staggerItem}
              className="text-lg text-[rgb(var(--muted))] mb-8"
            >
              Join these successful brands and start seeing results with
              influencer marketing.
            </motion.p>
            <motion.div variants={staggerItem}>
              <Link href="/role-selector">
                <Button size="lg" variant="gradient">
                  Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

// Raaaaju
