'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wallet,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Send,
  Shield,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  Filter,
  Eye,
  Lock,
  Unlock,
  RefreshCw,
  Plus,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils'
import { staggerContainer, staggerItem } from '@/lib/animations'

interface Transaction {
  id: string
  type: 'deposit' | 'escrow_fund' | 'escrow_release' | 'refund' | 'fee'
  description: string
  amount: number
  status: 'completed' | 'pending' | 'failed'
  date: string
  reference?: string
}

interface EscrowAccount {
  id: string
  campaignName: string
  influencer: string
  amount: number
  funded: number
  released: number
  status: 'pending' | 'funded' | 'partially_released' | 'fully_released' | 'disputed'
  milestones: { name: string; amount: number; status: 'pending' | 'released' }[]
  createdAt: string
}

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', type: 'deposit', description: 'Wallet top-up via Stripe', amount: 10000, status: 'completed', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '2', type: 'escrow_fund', description: 'Escrow funded: Summer Fashion Campaign', amount: -5000, status: 'completed', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '3', type: 'escrow_release', description: 'Milestone released: Content Delivery', amount: -2500, status: 'completed', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '4', type: 'fee', description: 'Platform fee (5%)', amount: -125, status: 'completed', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '5', type: 'escrow_fund', description: 'Escrow funded: Tech Review Campaign', amount: -3000, status: 'pending', date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '6', type: 'deposit', description: 'Wallet top-up via PayPal', amount: 5000, status: 'completed', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '7', type: 'refund', description: 'Campaign cancellation refund', amount: 1500, status: 'completed', date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
]

const MOCK_ESCROWS: EscrowAccount[] = [
  {
    id: 'e1',
    campaignName: 'Summer Fashion Collection',
    influencer: 'Sarah Chen',
    amount: 5000,
    funded: 5000,
    released: 2500,
    status: 'partially_released',
    milestones: [
      { name: 'Content Creation', amount: 2500, status: 'released' },
      { name: 'Final Delivery', amount: 2500, status: 'pending' },
    ],
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'e2',
    campaignName: 'Tech Review Campaign',
    influencer: 'Alex Rivera',
    amount: 3000,
    funded: 3000,
    released: 0,
    status: 'funded',
    milestones: [
      { name: 'Video Production', amount: 2000, status: 'pending' },
      { name: 'Social Posts', amount: 1000, status: 'pending' },
    ],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'e3',
    campaignName: 'Beauty Brand Ambassador',
    influencer: 'Mia Johnson',
    amount: 8000,
    funded: 0,
    released: 0,
    status: 'pending',
    milestones: [
      { name: 'Month 1 Content', amount: 2000, status: 'pending' },
      { name: 'Month 2 Content', amount: 2000, status: 'pending' },
      { name: 'Month 3 Content', amount: 2000, status: 'pending' },
      { name: 'Final Review', amount: 2000, status: 'pending' },
    ],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export default function BrandWalletPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'escrow' | 'invoices'>('overview')
  const [txFilter, setTxFilter] = useState<string>('all')

  const walletBalance = 5875
  const escrowHeld = 8000
  const totalSpent = 42500
  const pendingPayments = 3000

  const filteredTxs = MOCK_TRANSACTIONS.filter(tx => {
    if (txFilter === 'all') return true
    return tx.type === txFilter
  })

  const getEscrowStatusColor = (status: string) => {
    switch (status) {
      case 'funded': return 'info'
      case 'partially_released': return 'warning'
      case 'fully_released': return 'success'
      case 'disputed': return 'error'
      default: return 'default'
    }
  }

  const getEscrowStatusLabel = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-surface">
      <div className="container py-4 md:py-8">
        <motion.div initial="initial" animate="animate" variants={staggerContainer}>
          {/* Header */}
          <motion.div variants={staggerItem} className="mb-4 sm:mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold gradient-text">Wallet & Payments</h1>
                <p className="text-xs sm:text-sm text-[rgb(var(--muted))]">Manage your funds, escrow, and invoices</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="gradient">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Funds
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Balance Cards */}
          <motion.div variants={staggerItem} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            {[
              { label: 'Available Balance', value: formatCurrency(walletBalance), icon: Wallet, color: 'text-[rgb(var(--brand-primary))]', bg: 'bg-[rgb(var(--brand-primary))]/10' },
              { label: 'Held in Escrow', value: formatCurrency(escrowHeld), icon: Lock, color: 'text-[rgb(var(--info))]', bg: 'bg-[rgb(var(--info))]/10' },
              { label: 'Total Spent', value: formatCurrency(totalSpent), icon: TrendingUp, color: 'text-[rgb(var(--success))]', bg: 'bg-[rgb(var(--success))]/10' },
              { label: 'Pending', value: formatCurrency(pendingPayments), icon: Clock, color: 'text-[rgb(var(--warning))]', bg: 'bg-[rgb(var(--warning))]/10' },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className={`p-1.5 sm:p-2 rounded-lg ${stat.bg} w-fit mb-2 sm:mb-3`}>
                      <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
                    </div>
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold">{stat.value}</div>
                    <div className="text-[10px] sm:text-xs text-[rgb(var(--muted))]">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Tab Navigation */}
          <motion.div variants={staggerItem} className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
            {[
              { value: 'overview' as const, label: 'Transactions' },
              { value: 'escrow' as const, label: 'Escrow Accounts' },
              { value: 'invoices' as const, label: 'Invoices' },
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  activeTab === tab.value
                    ? 'bg-gradient-to-r from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] text-white shadow-lg'
                    : 'bg-[rgb(var(--surface))] text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </motion.div>

          {/* Transactions View */}
          {activeTab === 'overview' && (
            <motion.div variants={staggerItem}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Recent Transactions</CardTitle>
                    <select
                      value={txFilter}
                      onChange={e => setTxFilter(e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-[rgb(var(--surface))] border border-[rgb(var(--border))] text-sm text-[rgb(var(--foreground))] outline-none"
                    >
                      <option value="all">All Types</option>
                      <option value="deposit">Deposits</option>
                      <option value="escrow_fund">Escrow Funds</option>
                      <option value="escrow_release">Releases</option>
                      <option value="refund">Refunds</option>
                      <option value="fee">Fees</option>
                    </select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {filteredTxs.map(tx => (
                      <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-[rgb(var(--surface))] transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            tx.amount > 0 ? 'bg-[rgb(var(--success))]/10' : 'bg-[rgb(var(--surface))]'
                          }`}>
                            {tx.amount > 0 ? (
                              <ArrowDownRight className="h-4 w-4 text-[rgb(var(--success))]" />
                            ) : tx.type === 'fee' ? (
                              <DollarSign className="h-4 w-4 text-[rgb(var(--muted))]" />
                            ) : (
                              <ArrowUpRight className="h-4 w-4 text-[rgb(var(--warning))]" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium">{tx.description}</div>
                            <div className="text-xs text-[rgb(var(--muted))]">{formatDate(tx.date)}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-semibold ${tx.amount > 0 ? 'text-[rgb(var(--success))]' : ''}`}>
                            {tx.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(tx.amount))}
                          </div>
                          <Badge
                            variant={tx.status === 'completed' ? 'success' : tx.status === 'pending' ? 'warning' : 'error'}
                            className="text-[10px]"
                          >
                            {tx.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Escrow View */}
          {activeTab === 'escrow' && (
            <div className="space-y-3 sm:space-y-4">
              <motion.div variants={staggerItem}>
                <Card className="border-[rgb(var(--info))]/20 bg-[rgb(var(--info))]/5">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-[rgb(var(--info))]" />
                      <p className="text-sm text-[rgb(var(--muted))]">
                        Escrow accounts protect both brands and influencers. Funds are held securely until campaign milestones are completed and approved.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {MOCK_ESCROWS.map((escrow, index) => (
                <motion.div
                  key={escrow.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-3 sm:p-4 lg:p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-bold">{escrow.campaignName}</h3>
                          <p className="text-sm text-[rgb(var(--muted))]">with {escrow.influencer}</p>
                        </div>
                        <Badge variant={getEscrowStatusColor(escrow.status) as any}>
                          {getEscrowStatusLabel(escrow.status)}
                        </Badge>
                      </div>

                      {/* Escrow Progress */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-[rgb(var(--muted))]">Progress</span>
                          <span className="font-medium">
                            {formatCurrency(escrow.released)} / {formatCurrency(escrow.amount)}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-[rgb(var(--surface))] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))]"
                            style={{ width: `${(escrow.released / escrow.amount) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Milestones */}
                      <div className="space-y-2">
                        {escrow.milestones.map((milestone, i) => (
                          <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-[rgb(var(--surface))]">
                            <div className="flex items-center gap-2">
                              {milestone.status === 'released' ? (
                                <CheckCircle2 className="h-4 w-4 text-[rgb(var(--success))]" />
                              ) : (
                                <Clock className="h-4 w-4 text-[rgb(var(--muted))]" />
                              )}
                              <span className="text-sm">{milestone.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{formatCurrency(milestone.amount)}</span>
                              {milestone.status === 'pending' && escrow.status === 'funded' && (
                                <Button variant="outline" size="xs">Release</Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-[rgb(var(--border))]">
                        <span className="text-xs text-[rgb(var(--muted))]">Created {formatDate(escrow.createdAt)}</span>
                        <div className="flex gap-2">
                          {escrow.status === 'pending' && (
                            <Button variant="gradient" size="sm">
                              <Lock className="h-3 w-3 mr-1" />
                              Fund Escrow
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Invoices View */}
          {activeTab === 'invoices' && (
            <motion.div variants={staggerItem}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Invoices</CardTitle>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      { id: 'INV-001', description: 'Campaign: Summer Fashion Collection', amount: 5000, status: 'paid', date: '2026-01-15', type: 'brand_deposit' },
                      { id: 'INV-002', description: 'Platform Fee - January 2026', amount: 299, status: 'paid', date: '2026-01-01', type: 'platform_fee' },
                      { id: 'INV-003', description: 'Campaign: Tech Review Campaign', amount: 3000, status: 'pending', date: '2026-02-01', type: 'brand_deposit' },
                      { id: 'INV-004', description: 'Platform Fee - February 2026', amount: 299, status: 'due', date: '2026-02-01', type: 'platform_fee' },
                    ].map(invoice => (
                      <div key={invoice.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-[rgb(var(--surface))] transition-colors">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-[rgb(var(--muted))]" />
                          <div>
                            <div className="text-sm font-medium">{invoice.description}</div>
                            <div className="text-xs text-[rgb(var(--muted))]">{invoice.id} · {formatDate(invoice.date)}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold">{formatCurrency(invoice.amount)}</span>
                          <Badge
                            variant={invoice.status === 'paid' ? 'success' : invoice.status === 'pending' ? 'warning' : 'error'}
                            className="text-[10px]"
                          >
                            {invoice.status}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
