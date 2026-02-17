'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Wallet,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Clock,
  CheckCircle2,
  FileText,
  Download,
  Eye,
  Lock,
  Plus,
  TrendingUp,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { staggerContainer, staggerItem } from '@/lib/animations'
import { getWallet, getEscrows, getInvoices, depositFunds } from '@/services/api/wallet'

export default function BrandWalletPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'escrow' | 'invoices'>('overview')
  const [txFilter, setTxFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [walletData, setWalletData] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [escrows, setEscrows] = useState<any[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [depositAmount, setDepositAmount] = useState('')
  const [depositing, setDepositing] = useState(false)

  useEffect(() => {
    loadWalletData()
  }, [])

  const loadWalletData = async () => {
    try {
      const [wallet, escrowData, invoiceData] = await Promise.allSettled([
        getWallet(),
        getEscrows(),
        getInvoices(),
      ])

      if (wallet.status === 'fulfilled' && wallet.value) {
        setWalletData(wallet.value)
        setTransactions(wallet.value.transactions ?? [])
      }
      if (escrowData.status === 'fulfilled') {
        const data = escrowData.value
        setEscrows(Array.isArray(data) ? data : data?.data ?? [])
      }
      if (invoiceData.status === 'fulfilled') {
        const data = invoiceData.value
        setInvoices(Array.isArray(data) ? data : data?.data ?? [])
      }
    } catch (err) {
      console.error('Failed to load wallet:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount)
    if (!amount || amount <= 0) return
    setDepositing(true)
    try {
      await depositFunds(amount)
      setDepositAmount('')
      loadWalletData()
    } catch (err) {
      console.error('Deposit failed:', err)
    } finally {
      setDepositing(false)
    }
  }

  const balance = Number(walletData?.balance ?? 0)
  const pendingBalance = Number(walletData?.pendingBalance ?? 0)
  const totalEscrowHeld = escrows.reduce((sum: number, e: any) => sum + Number(e.heldAmount || 0), 0)
  const totalSpent = transactions
    .filter((t: any) => Number(t.amount) < 0)
    .reduce((sum: number, t: any) => sum + Math.abs(Number(t.amount)), 0)

  const filteredTxs = transactions.filter((tx: any) => {
    if (txFilter === 'all') return true
    return tx.type === txFilter.toUpperCase()
  })

  const getEscrowStatusColor = (status: string) => {
    switch (status) {
      case 'FUNDED': return 'info'
      case 'PARTIALLY_RELEASED': return 'warning'
      case 'FULLY_RELEASED': return 'success'
      case 'DISPUTED': return 'error'
      default: return 'default'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--muted))]" />
      </div>
    )
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
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Amount"
                  value={depositAmount}
                  onChange={e => setDepositAmount(e.target.value)}
                  className="w-28 px-3 py-2 rounded-lg bg-[rgb(var(--surface))] border border-[rgb(var(--border))] text-sm outline-none"
                />
                <Button variant="gradient" onClick={handleDeposit} disabled={depositing}>
                  <Plus className="h-4 w-4 mr-2" />
                  {depositing ? 'Adding...' : 'Add Funds'}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Balance Cards */}
          <motion.div variants={staggerItem} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            {[
              { label: 'Available Balance', value: formatCurrency(balance), icon: Wallet, color: 'text-[rgb(var(--brand-primary))]', bg: 'bg-[rgb(var(--brand-primary))]/10' },
              { label: 'Held in Escrow', value: formatCurrency(totalEscrowHeld), icon: Lock, color: 'text-[rgb(var(--info))]', bg: 'bg-[rgb(var(--info))]/10' },
              { label: 'Total Spent', value: formatCurrency(totalSpent), icon: TrendingUp, color: 'text-[rgb(var(--success))]', bg: 'bg-[rgb(var(--success))]/10' },
              { label: 'Pending', value: formatCurrency(pendingBalance), icon: Clock, color: 'text-[rgb(var(--warning))]', bg: 'bg-[rgb(var(--warning))]/10' },
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
                      <option value="escrow_hold">Escrow Holds</option>
                      <option value="escrow_release">Releases</option>
                      <option value="refund">Refunds</option>
                      <option value="platform_fee">Fees</option>
                    </select>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredTxs.length === 0 ? (
                    <div className="text-center py-8 text-[rgb(var(--muted))]">No transactions found.</div>
                  ) : (
                    <div className="space-y-2">
                      {filteredTxs.map((tx: any) => (
                        <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-[rgb(var(--surface))] transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              Number(tx.amount) > 0 ? 'bg-[rgb(var(--success))]/10' : 'bg-[rgb(var(--surface))]'
                            }`}>
                              {Number(tx.amount) > 0 ? (
                                <ArrowDownRight className="h-4 w-4 text-[rgb(var(--success))]" />
                              ) : tx.type === 'PLATFORM_FEE' ? (
                                <DollarSign className="h-4 w-4 text-[rgb(var(--muted))]" />
                              ) : (
                                <ArrowUpRight className="h-4 w-4 text-[rgb(var(--warning))]" />
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium">{tx.description || tx.type}</div>
                              <div className="text-xs text-[rgb(var(--muted))]">{formatDate(tx.createdAt)}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-semibold ${Number(tx.amount) > 0 ? 'text-[rgb(var(--success))]' : ''}`}>
                              {Number(tx.amount) > 0 ? '+' : ''}{formatCurrency(Math.abs(Number(tx.amount)))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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

              {escrows.length === 0 ? (
                <div className="text-center py-12 text-[rgb(var(--muted))]">No escrow accounts yet.</div>
              ) : (
                escrows.map((escrow: any, index: number) => (
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
                            <h3 className="font-bold">{escrow.collaboration?.campaign?.title || 'Escrow Account'}</h3>
                            <p className="text-sm text-[rgb(var(--muted))]">
                              with {escrow.influencer?.fullName || 'Influencer'}
                            </p>
                          </div>
                          <Badge variant={getEscrowStatusColor(escrow.status) as any}>
                            {escrow.status.replace(/_/g, ' ')}
                          </Badge>
                        </div>

                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-[rgb(var(--muted))]">Progress</span>
                            <span className="font-medium">
                              {formatCurrency(Number(escrow.releasedAmount))} / {formatCurrency(Number(escrow.totalAmount))}
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-[rgb(var(--surface))] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))]"
                              style={{ width: `${Number(escrow.totalAmount) > 0 ? (Number(escrow.releasedAmount) / Number(escrow.totalAmount)) * 100 : 0}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[rgb(var(--border))]">
                          <span className="text-xs text-[rgb(var(--muted))]">Created {formatDate(escrow.createdAt)}</span>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
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
                  {invoices.length === 0 ? (
                    <div className="text-center py-8 text-[rgb(var(--muted))]">No invoices yet.</div>
                  ) : (
                    <div className="space-y-2">
                      {invoices.map((invoice: any) => (
                        <div key={invoice.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-[rgb(var(--surface))] transition-colors">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-[rgb(var(--muted))]" />
                            <div>
                              <div className="text-sm font-medium">{invoice.type?.replace(/_/g, ' ') || 'Invoice'}</div>
                              <div className="text-xs text-[rgb(var(--muted))]">{invoice.invoiceNumber} · {formatDate(invoice.createdAt)}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold">{formatCurrency(Number(invoice.totalAmount || 0))}</span>
                            <Badge
                              variant={invoice.status === 'PAID' ? 'success' : invoice.status === 'PENDING' ? 'warning' : 'error'}
                              className="text-[10px]"
                            >
                              {invoice.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
