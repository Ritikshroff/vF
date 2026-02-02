'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  Download,
  CreditCard,
  Plus,
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { staggerContainer, staggerItem } from '@/lib/animations'

// Mock payment data
const mockPayments = [
  {
    id: 'pay_001',
    campaign: 'Spring Fashion Launch',
    brand: 'EcoWear',
    amount: 4500,
    status: 'completed',
    date: '2026-01-15',
    invoice: 'INV-2026-001',
  },
  {
    id: 'pay_002',
    campaign: 'Wireless Earbuds Review',
    brand: 'TechPro',
    amount: 8000,
    status: 'pending',
    date: '2026-02-01',
    invoice: 'INV-2026-002',
  },
  {
    id: 'pay_003',
    campaign: 'Holiday Gift Guide',
    brand: 'EcoWear',
    amount: 6200,
    status: 'completed',
    date: '2025-12-20',
    invoice: 'INV-2025-045',
  },
  {
    id: 'pay_004',
    campaign: 'Summer Glow Collection',
    brand: 'GlowCosmetics',
    amount: 5500,
    status: 'completed',
    date: '2025-12-05',
    invoice: 'INV-2025-038',
  },
  {
    id: 'pay_005',
    campaign: '30-Day Fitness Challenge',
    brand: 'FitLife',
    amount: 10000,
    status: 'processing',
    date: '2026-01-28',
    invoice: 'INV-2026-003',
  },
]

const mockPaymentMethods = [
  {
    id: '1',
    type: 'Bank Account',
    details: '••••4532',
    primary: true,
  },
  {
    id: '2',
    type: 'PayPal',
    details: 'sarah@example.com',
    primary: false,
  },
]

export default function PaymentsPage() {
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'processing'>('all')

  const totalEarnings = mockPayments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0)

  const pendingAmount = mockPayments
    .filter((p) => p.status === 'pending' || p.status === 'processing')
    .reduce((sum, p) => sum + p.amount, 0)

  const thisMonthEarnings = mockPayments
    .filter(
      (p) =>
        p.status === 'completed' &&
        new Date(p.date).getMonth() === new Date().getMonth() &&
        new Date(p.date).getFullYear() === new Date().getFullYear()
    )
    .reduce((sum, p) => sum + p.amount, 0)

  const filteredPayments =
    filter === 'all'
      ? mockPayments
      : mockPayments.filter((p) => p.status === filter)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'pending':
        return 'warning'
      case 'processing':
        return 'primary'
      default:
        return 'default'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return CheckCircle2
      case 'pending':
        return Clock
      case 'processing':
        return TrendingUp
      default:
        return Clock
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[rgb(var(--background))] to-[rgb(var(--surface))]">
      <div className="container py-4 md:py-8">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          {/* Header */}
          <motion.div variants={staggerItem} className="mb-6 md:mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-5xl font-bold mb-2 gradient-text">
                  Payments
                </h1>
                <p className="text-sm md:text-lg text-[rgb(var(--muted))]">
                  Track your earnings and payment history
                </p>
              </div>
              <Button variant="outline" size="lg" className="w-full md:w-auto">
                <Download className="h-5 w-5 mr-2" />
                Export Statement
              </Button>
            </div>
          </motion.div>

          {/* Stats Cards - Mobile 1 col, Desktop 3 cols */}
          <motion.div
            variants={staggerItem}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8"
          >
            <Card className="border-2 border-green-500/20 bg-green-500/5">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex items-center gap-1 text-xs text-green-500">
                    <ArrowUpRight className="h-3 w-3" />
                    +12.5%
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-bold gradient-text mb-2">
                  {formatCurrency(totalEarnings)}
                </div>
                <div className="text-sm text-[rgb(var(--muted))]">Total Earnings</div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant="warning">Pending</Badge>
                </div>
                <div className="text-2xl md:text-3xl font-bold gradient-text mb-2">
                  {formatCurrency(pendingAmount)}
                </div>
                <div className="text-sm text-[rgb(var(--muted))]">Pending Payments</div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex items-center gap-1 text-xs text-blue-500">
                    <ArrowUpRight className="h-3 w-3" />
                    +28%
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-bold gradient-text mb-2">
                  {formatCurrency(thisMonthEarnings)}
                </div>
                <div className="text-sm text-[rgb(var(--muted))]">This Month</div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
            {/* Payment History */}
            <div className="lg:col-span-2 space-y-6">
              {/* Filters */}
              <motion.div variants={staggerItem}>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: 'all' as const, label: 'All Payments' },
                        { value: 'completed' as const, label: 'Completed' },
                        { value: 'pending' as const, label: 'Pending' },
                        { value: 'processing' as const, label: 'Processing' },
                      ].map((tab) => (
                        <button
                          key={tab.value}
                          onClick={() => setFilter(tab.value)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                            filter === tab.value
                              ? 'bg-gradient-to-r from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] text-white shadow-lg'
                              : 'bg-[rgb(var(--surface))] text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Payment List */}
              <motion.div variants={staggerItem}>
                <Card>
                  <CardHeader>
                    <CardTitle>Payment History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {filteredPayments.map((payment) => {
                        const StatusIcon = getStatusIcon(payment.status)
                        return (
                          <div
                            key={payment.id}
                            className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-lg bg-[rgb(var(--surface))] hover:bg-[rgb(var(--surface-hover))] transition-colors"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <div className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] flex items-center justify-center">
                                <DollarSign className="h-5 w-5 text-white" />
                              </div>

                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm md:text-base mb-1 truncate">
                                  {payment.campaign}
                                </h4>
                                <div className="flex flex-wrap gap-2 text-xs text-[rgb(var(--muted))]">
                                  <span>{payment.brand}</span>
                                  <span>•</span>
                                  <span>{payment.invoice}</span>
                                  <span>•</span>
                                  <span>
                                    {new Date(payment.date).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between md:justify-end gap-4">
                              <div className="text-right">
                                <div className="text-lg md:text-xl font-bold gradient-text">
                                  {formatCurrency(payment.amount)}
                                </div>
                                <Badge
                                  variant={getStatusColor(payment.status) as any}
                                  className="mt-1"
                                >
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {payment.status}
                                </Badge>
                              </div>

                              {payment.status === 'completed' && (
                                <Button variant="ghost" size="sm">
                                  <Download className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Payment Methods */}
              <motion.div variants={staggerItem}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Payment Methods</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {mockPaymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          method.primary
                            ? 'border-[rgb(var(--brand-primary))]/40 bg-[rgb(var(--brand-primary))]/5'
                            : 'border-[rgb(var(--border))]'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-[rgb(var(--surface))]">
                            <CreditCard className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm mb-1">{method.type}</div>
                            <div className="text-xs text-[rgb(var(--muted))]">
                              {method.details}
                            </div>
                            {method.primary && (
                              <Badge variant="primary" className="mt-2 text-xs">
                                Primary
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    <Button variant="outline" className="w-full" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Payment Method
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Payout Settings */}
              <motion.div variants={staggerItem}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Payout Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm font-medium mb-2">Payout Schedule</div>
                      <div className="p-3 rounded-lg bg-[rgb(var(--surface))]">
                        <div className="font-semibold text-sm">Weekly</div>
                        <div className="text-xs text-[rgb(var(--muted))]">
                          Every Friday
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium mb-2">Minimum Payout</div>
                      <div className="p-3 rounded-lg bg-[rgb(var(--surface))]">
                        <div className="font-semibold text-sm">{formatCurrency(100)}</div>
                        <div className="text-xs text-[rgb(var(--muted))]">
                          Threshold amount
                        </div>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full" size="sm">
                      Edit Settings
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Next Payout */}
              <motion.div variants={staggerItem}>
                <Card className="border-2 border-[rgb(var(--brand-primary))]/20 bg-[rgb(var(--brand-primary))]/5">
                  <CardHeader>
                    <CardTitle className="text-lg">Next Payout</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-3xl font-bold gradient-text mb-2">
                        {formatCurrency(2150)}
                      </div>
                      <div className="text-sm text-[rgb(var(--muted))] mb-4">
                        Scheduled for Feb 7, 2026
                      </div>
                      <div className="text-xs text-[rgb(var(--muted))]">
                        Funds will be deposited to your primary payment method
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
