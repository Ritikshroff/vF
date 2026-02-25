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
      <div className="container py-4 sm:py-6 lg:py-8">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          {/* Header */}
          <motion.div variants={staggerItem} className="mb-4 sm:mb-6 lg:mb-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 gradient-text">
                  Payments
                </h1>
                <p className="text-xs sm:text-sm text-[rgb(var(--muted))]">
                  Track your earnings and payment history
                </p>
              </div>
              <Button variant="outline" size="sm" className="w-full sm:w-auto min-h-[36px] sm:min-h-[40px] text-xs sm:text-sm">
                <Download className="h-4 w-4 mr-2" />
                Export Statement
              </Button>
            </div>
          </motion.div>

          {/* Stats Cards - Mobile 1 col, Desktop 3 cols */}
          <motion.div
            variants={staggerItem}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8"
          >
            <Card className="border border-[rgb(var(--brand-primary))]/20 hover:border-[rgb(var(--brand-primary))]/40 transition-colors">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-[rgb(var(--brand-primary))]/10">
                    <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[rgb(var(--brand-primary))]" />
                  </div>
                  <span className="text-[10px] sm:text-xs text-[rgb(var(--muted))]">Total Earnings</span>
                </div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-[rgb(var(--foreground))] mb-0.5">
                  {formatCurrency(totalEarnings)}
                </div>
                <div className="text-[10px] sm:text-xs text-[rgb(var(--success))]">+12.5% this month</div>
              </CardContent>
            </Card>

            <Card className="border border-border hover:border-[rgb(var(--brand-primary))]/30 transition-colors">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-[rgb(var(--brand-primary))]/10">
                    <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[rgb(var(--brand-primary))]" />
                  </div>
                  <span className="text-[10px] sm:text-xs text-[rgb(var(--muted))]">Pending</span>
                </div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-[rgb(var(--foreground))] mb-0.5">
                  {formatCurrency(pendingAmount)}
                </div>
                <div className="text-[10px] sm:text-xs text-[rgb(var(--warning))]">Awaiting release</div>
              </CardContent>
            </Card>

            <Card className="border border-border hover:border-[rgb(var(--brand-primary))]/30 transition-colors">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-[rgb(var(--brand-primary))]/10">
                    <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[rgb(var(--brand-primary))]" />
                  </div>
                  <span className="text-[10px] sm:text-xs text-[rgb(var(--muted))]">This Month</span>
                </div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-[rgb(var(--foreground))] mb-0.5">
                  {formatCurrency(thisMonthEarnings)}
                </div>
                <div className="text-[10px] sm:text-xs text-[rgb(var(--success))]">+28% vs last month</div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Payment History */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Filters */}
              <motion.div variants={staggerItem}>
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {[
                        { value: 'all' as const, label: 'All Payments' },
                        { value: 'completed' as const, label: 'Completed' },
                        { value: 'pending' as const, label: 'Pending' },
                        { value: 'processing' as const, label: 'Processing' },
                      ].map((tab) => (
                        <button
                          key={tab.value}
                          onClick={() => setFilter(tab.value)}
                          className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                            filter === tab.value
                              ? 'bg-gradient-to-r from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] text-white'
                              : 'bg-[rgb(var(--surface))] text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] border border-border'
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
                    <div className="space-y-3 sm:space-y-4">
                      {filteredPayments.map((payment) => {
                        const StatusIcon = getStatusIcon(payment.status)
                        return (
                          <div
                            key={payment.id}
                            className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-[rgb(var(--surface))] hover:bg-[rgb(var(--surface-hover))] transition-colors"
                          >
                            <div className="flex items-center gap-2 sm:gap-3 flex-1">
                              <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] flex items-center justify-center">
                                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                              </div>

                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm sm:text-base mb-0.5 sm:mb-1 truncate">
                                  {payment.campaign}
                                </h4>
                                <div className="flex flex-wrap gap-1.5 sm:gap-2 text-xs text-[rgb(var(--muted))]">
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

                            <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                              <div className="text-right">
                                <div className="text-base sm:text-lg lg:text-xl font-bold gradient-text">
                                  {formatCurrency(payment.amount)}
                                </div>
                                <Badge
                                  variant={getStatusColor(payment.status) as any}
                                  className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs"
                                >
                                  <StatusIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                                  {payment.status}
                                </Badge>
                              </div>

                              {payment.status === 'completed' && (
                                <Button variant="ghost" size="sm" className="hidden sm:flex">
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
            <div className="space-y-4 sm:space-y-6">
              {/* Payment Methods */}
              <motion.div variants={staggerItem}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg">Payment Methods</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 sm:space-y-3">
                    {mockPaymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${
                          method.primary
                            ? 'border-[rgb(var(--brand-primary))]/40 bg-[rgb(var(--brand-primary))]/5'
                            : 'border-[rgb(var(--border))]'
                        }`}
                      >
                        <div className="flex items-start gap-2 sm:gap-3">
                          <div className="p-1.5 sm:p-2 rounded-lg bg-[rgb(var(--surface))]">
                            <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-xs sm:text-sm mb-0.5 sm:mb-1">{method.type}</div>
                            <div className="text-[10px] sm:text-xs text-[rgb(var(--muted))]">
                              {method.details}
                            </div>
                            {method.primary && (
                              <Badge variant="primary" className="mt-1 sm:mt-2 text-[10px]">
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
                    <CardTitle className="text-base sm:text-lg">Payout Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    <div>
                      <div className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">Payout Schedule</div>
                      <div className="p-2.5 sm:p-3 rounded-lg bg-[rgb(var(--surface))]">
                        <div className="font-semibold text-xs sm:text-sm">Weekly</div>
                        <div className="text-[10px] sm:text-xs text-[rgb(var(--muted))]">
                          Every Friday
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">Minimum Payout</div>
                      <div className="p-2.5 sm:p-3 rounded-lg bg-[rgb(var(--surface))]">
                        <div className="font-semibold text-xs sm:text-sm">{formatCurrency(100)}</div>
                        <div className="text-[10px] sm:text-xs text-[rgb(var(--muted))]">
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
                    <CardTitle className="text-base sm:text-lg">Next Payout</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-2xl sm:text-3xl font-bold gradient-text mb-1 sm:mb-2">
                        {formatCurrency(2150)}
                      </div>
                      <div className="text-xs sm:text-sm text-[rgb(var(--muted))] mb-3 sm:mb-4">
                        Scheduled for Feb 7, 2026
                      </div>
                      <div className="text-[10px] sm:text-xs text-[rgb(var(--muted))]">
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
