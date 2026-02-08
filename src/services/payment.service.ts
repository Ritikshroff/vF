/**
 * Payment, Escrow & Invoicing Service
 * Handles all financial operations including wallets, escrow, and invoices
 */

import { prisma } from '@/lib/db/prisma'
import {
  TransactionType,
  WalletType,
  EscrowStatus,
  InvoiceType,
  InvoiceStatus,
  PaymentStatus,
  Prisma,
} from '@prisma/client'
import {
  WalletBalance,
  WalletTransactionSummary,
  DepositInput,
  WithdrawInput,
  CreateEscrowInput,
  EscrowReleaseInput,
  EscrowSummary,
  CreateInvoiceInput,
  InvoiceSummary,
  CreatePayoutMethodInput,
  PayoutMethodSummary,
  FeeCalculation,
} from '@/types/payment'

// Default commission rates
const DEFAULT_PLATFORM_COMMISSION_RATE = 0.10 // 10%

// ==================== WALLET OPERATIONS ====================

/**
 * Get or create a wallet for a user
 */
export async function getOrCreateWallet(
  userId: string,
  type: WalletType
): Promise<{ id: string; balance: number; pendingBalance: number; currency: string }> {
  let wallet = await prisma.wallet.findUnique({
    where: { userId },
  })

  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: {
        userId,
        type,
        balance: new Prisma.Decimal(0),
        pendingBalance: new Prisma.Decimal(0),
        currency: 'USD',
      },
    })
  }

  return {
    id: wallet.id,
    balance: wallet.balance.toNumber(),
    pendingBalance: wallet.pendingBalance.toNumber(),
    currency: wallet.currency,
  }
}

/**
 * Get wallet balance
 */
export async function getWalletBalance(userId: string): Promise<WalletBalance> {
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
  })

  if (!wallet) {
    return { available: 0, pending: 0, currency: 'USD' }
  }

  return {
    available: wallet.balance.toNumber(),
    pending: wallet.pendingBalance.toNumber(),
    currency: wallet.currency,
  }
}

/**
 * Deposit funds to a wallet
 */
export async function depositToWallet(
  userId: string,
  input: DepositInput,
  metadata?: Record<string, unknown>
): Promise<WalletTransactionSummary> {
  const wallet = await getOrCreateWallet(userId, WalletType.BRAND_WALLET)

  const newBalance = wallet.balance + input.amount

  // Create transaction and update balance atomically
  const [transaction] = await prisma.$transaction([
    prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: TransactionType.DEPOSIT,
        amount: new Prisma.Decimal(input.amount),
        balance: new Prisma.Decimal(newBalance),
        currency: input.currency || 'USD',
        description: 'Wallet deposit',
        metadata: metadata as Prisma.InputJsonValue,
      },
    }),
    prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: new Prisma.Decimal(newBalance) },
    }),
  ])

  return {
    id: transaction.id,
    type: transaction.type,
    amount: transaction.amount.toNumber(),
    balance: transaction.balance.toNumber(),
    description: transaction.description,
    createdAt: transaction.createdAt,
  }
}

/**
 * Withdraw funds from a wallet
 */
export async function withdrawFromWallet(
  userId: string,
  input: WithdrawInput
): Promise<WalletTransactionSummary> {
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
  })

  if (!wallet) {
    throw new Error('Wallet not found')
  }

  if (wallet.balance.toNumber() < input.amount) {
    throw new Error('Insufficient balance')
  }

  // Verify payout method
  const payoutMethod = await prisma.payoutMethod.findFirst({
    where: { id: input.payoutMethodId, userId },
  })

  if (!payoutMethod) {
    throw new Error('Invalid payout method')
  }

  if (!payoutMethod.isVerified) {
    throw new Error('Payout method is not verified')
  }

  const newBalance = wallet.balance.toNumber() - input.amount

  // Create transaction and update balance atomically
  const [transaction] = await prisma.$transaction([
    prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: TransactionType.WITHDRAWAL,
        amount: new Prisma.Decimal(-input.amount),
        balance: new Prisma.Decimal(newBalance),
        currency: wallet.currency,
        description: `Withdrawal to ${payoutMethod.type}`,
      },
    }),
    prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: new Prisma.Decimal(newBalance) },
    }),
  ])

  return {
    id: transaction.id,
    type: transaction.type,
    amount: Math.abs(transaction.amount.toNumber()),
    balance: transaction.balance.toNumber(),
    description: transaction.description,
    createdAt: transaction.createdAt,
  }
}

/**
 * Get wallet transactions
 */
export async function getWalletTransactions(
  userId: string,
  options: { page?: number; pageSize?: number; type?: TransactionType } = {}
): Promise<{ data: WalletTransactionSummary[]; total: number }> {
  const { page = 1, pageSize = 20, type } = options
  const skip = (page - 1) * pageSize

  const wallet = await prisma.wallet.findUnique({
    where: { userId },
  })

  if (!wallet) {
    return { data: [], total: 0 }
  }

  const where: Prisma.WalletTransactionWhereInput = { walletId: wallet.id }
  if (type) where.type = type

  const [transactions, total] = await Promise.all([
    prisma.walletTransaction.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.walletTransaction.count({ where }),
  ])

  return {
    data: transactions.map((t) => ({
      id: t.id,
      type: t.type,
      amount: t.amount.toNumber(),
      balance: t.balance.toNumber(),
      description: t.description,
      createdAt: t.createdAt,
    })),
    total,
  }
}

// ==================== ESCROW OPERATIONS ====================

/**
 * Calculate platform fee and net amount
 */
export function calculateFees(amount: number, commissionRate?: number): FeeCalculation {
  const rate = commissionRate ?? DEFAULT_PLATFORM_COMMISSION_RATE
  const platformFee = amount * rate
  const netAmount = amount - platformFee

  return {
    amount,
    platformFee,
    netAmount,
    commissionRate: rate,
  }
}

/**
 * Create an escrow account for a collaboration
 */
export async function createEscrowAccount(input: CreateEscrowInput): Promise<EscrowSummary> {
  const commissionRate = input.platformFeePercentage ?? DEFAULT_PLATFORM_COMMISSION_RATE
  const platformFee = input.amount * commissionRate

  const escrow = await prisma.escrowAccount.create({
    data: {
      collaborationId: input.collaborationId,
      brandId: input.brandId,
      influencerId: input.influencerId,
      totalAmount: new Prisma.Decimal(input.amount),
      platformFee: new Prisma.Decimal(platformFee),
      status: EscrowStatus.PENDING,
    },
  })

  return formatEscrow(escrow)
}

/**
 * Fund an escrow account (from brand's wallet)
 */
export async function fundEscrow(escrowId: string, brandUserId: string): Promise<EscrowSummary> {
  const escrow = await prisma.escrowAccount.findUnique({
    where: { id: escrowId },
  })

  if (!escrow) {
    throw new Error('Escrow account not found')
  }

  if (escrow.status !== EscrowStatus.PENDING) {
    throw new Error('Escrow account is not in PENDING status')
  }

  const brandWallet = await prisma.wallet.findUnique({
    where: { userId: brandUserId },
  })

  if (!brandWallet) {
    throw new Error('Brand wallet not found')
  }

  const totalAmount = escrow.totalAmount.toNumber()

  if (brandWallet.balance.toNumber() < totalAmount) {
    throw new Error('Insufficient balance to fund escrow')
  }

  // Perform atomic transaction
  const [, updatedEscrow] = await prisma.$transaction([
    // Deduct from brand wallet
    prisma.wallet.update({
      where: { id: brandWallet.id },
      data: {
        balance: { decrement: totalAmount },
      },
    }),
    // Create wallet transaction
    prisma.walletTransaction.create({
      data: {
        walletId: brandWallet.id,
        type: TransactionType.ESCROW_HOLD,
        amount: new Prisma.Decimal(-totalAmount),
        balance: new Prisma.Decimal(brandWallet.balance.toNumber() - totalAmount),
        currency: brandWallet.currency,
        description: 'Funds held in escrow',
        collaborationId: escrow.collaborationId,
      },
    }),
    // Update escrow status
    prisma.escrowAccount.update({
      where: { id: escrowId },
      data: {
        status: EscrowStatus.FUNDED,
        heldAmount: escrow.totalAmount,
        fundedAt: new Date(),
      },
    }),
  ])

  return formatEscrow(updatedEscrow)
}

/**
 * Release escrow funds to influencer (for a milestone or partial release)
 */
export async function releaseEscrow(
  escrowId: string,
  approvedBy: string,
  input: EscrowReleaseInput
): Promise<EscrowSummary> {
  const escrow = await prisma.escrowAccount.findUnique({
    where: { id: escrowId },
    include: { influencer: { include: { user: true } } },
  })

  if (!escrow) {
    throw new Error('Escrow account not found')
  }

  if (escrow.status !== EscrowStatus.FUNDED && escrow.status !== EscrowStatus.PARTIALLY_RELEASED) {
    throw new Error('Escrow is not in a releasable state')
  }

  // Determine release amount
  let releaseAmount: number

  if (input.milestoneId) {
    const milestone = await prisma.milestone.findUnique({
      where: { id: input.milestoneId },
    })
    if (!milestone) {
      throw new Error('Milestone not found')
    }
    releaseAmount = milestone.amount.toNumber()
  } else if (input.amount) {
    releaseAmount = input.amount
  } else {
    throw new Error('Either milestoneId or amount must be provided')
  }

  const heldAmount = escrow.heldAmount.toNumber()
  if (releaseAmount > heldAmount) {
    throw new Error('Release amount exceeds held amount')
  }

  // Calculate fees for this release
  const { platformFee, netAmount } = calculateFees(releaseAmount)

  // Get or create influencer wallet
  const influencerWallet = await getOrCreateWallet(
    escrow.influencer.userId,
    WalletType.INFLUENCER_WALLET
  )

  const newHeldAmount = heldAmount - releaseAmount
  const newReleasedAmount = escrow.releasedAmount.toNumber() + releaseAmount
  const isFullyReleased = newHeldAmount === 0

  // Perform atomic transaction
  await prisma.$transaction([
    // Create escrow release record
    prisma.escrowRelease.create({
      data: {
        escrowAccountId: escrowId,
        milestoneId: input.milestoneId,
        amount: new Prisma.Decimal(releaseAmount),
        platformFee: new Prisma.Decimal(platformFee),
        netAmount: new Prisma.Decimal(netAmount),
        reason: input.reason,
        approvedBy,
      },
    }),
    // Add to influencer wallet
    prisma.wallet.update({
      where: { id: influencerWallet.id },
      data: {
        balance: { increment: netAmount },
      },
    }),
    // Create wallet transaction for influencer
    prisma.walletTransaction.create({
      data: {
        walletId: influencerWallet.id,
        type: TransactionType.ESCROW_RELEASE,
        amount: new Prisma.Decimal(netAmount),
        balance: new Prisma.Decimal(influencerWallet.balance + netAmount),
        currency: escrow.currency,
        description: `Payment released from escrow (${input.reason})`,
        collaborationId: escrow.collaborationId,
        milestoneId: input.milestoneId,
      },
    }),
    // Update escrow
    prisma.escrowAccount.update({
      where: { id: escrowId },
      data: {
        heldAmount: new Prisma.Decimal(newHeldAmount),
        releasedAmount: new Prisma.Decimal(newReleasedAmount),
        status: isFullyReleased ? EscrowStatus.FULLY_RELEASED : EscrowStatus.PARTIALLY_RELEASED,
        releasedAt: isFullyReleased ? new Date() : undefined,
      },
    }),
    // Update milestone if specified
    ...(input.milestoneId
      ? [
          prisma.milestone.update({
            where: { id: input.milestoneId },
            data: {
              status: 'PAID' as const,
              paidAt: new Date(),
            },
          }),
          prisma.milestonePayment.create({
            data: {
              milestoneId: input.milestoneId,
              amount: new Prisma.Decimal(releaseAmount),
              platformFee: new Prisma.Decimal(platformFee),
              netAmount: new Prisma.Decimal(netAmount),
              status: PaymentStatus.COMPLETED,
              paidAt: new Date(),
            },
          }),
        ]
      : []),
  ])

  const updatedEscrow = await prisma.escrowAccount.findUnique({
    where: { id: escrowId },
  })

  return formatEscrow(updatedEscrow!)
}

/**
 * Refund escrow to brand
 */
export async function refundEscrow(
  escrowId: string,
  reason: string
): Promise<EscrowSummary> {
  const escrow = await prisma.escrowAccount.findUnique({
    where: { id: escrowId },
    include: { brand: { include: { user: true } } },
  })

  if (!escrow) {
    throw new Error('Escrow account not found')
  }

  const heldAmount = escrow.heldAmount.toNumber()
  if (heldAmount === 0) {
    throw new Error('No funds to refund')
  }

  // Get brand wallet
  const brandWallet = await prisma.wallet.findUnique({
    where: { userId: escrow.brand.userId },
  })

  if (!brandWallet) {
    throw new Error('Brand wallet not found')
  }

  // Perform atomic refund
  await prisma.$transaction([
    prisma.wallet.update({
      where: { id: brandWallet.id },
      data: {
        balance: { increment: heldAmount },
      },
    }),
    prisma.walletTransaction.create({
      data: {
        walletId: brandWallet.id,
        type: TransactionType.REFUND,
        amount: new Prisma.Decimal(heldAmount),
        balance: new Prisma.Decimal(brandWallet.balance.toNumber() + heldAmount),
        currency: escrow.currency,
        description: `Escrow refund: ${reason}`,
        collaborationId: escrow.collaborationId,
      },
    }),
    prisma.escrowAccount.update({
      where: { id: escrowId },
      data: {
        status: EscrowStatus.REFUNDED,
        heldAmount: new Prisma.Decimal(0),
      },
    }),
  ])

  const updatedEscrow = await prisma.escrowAccount.findUnique({
    where: { id: escrowId },
  })

  return formatEscrow(updatedEscrow!)
}

/**
 * Get escrow by collaboration ID
 */
export async function getEscrowByCollaboration(collaborationId: string): Promise<EscrowSummary | null> {
  const escrow = await prisma.escrowAccount.findUnique({
    where: { collaborationId },
  })

  if (!escrow) return null
  return formatEscrow(escrow)
}

// ==================== INVOICE OPERATIONS ====================

/**
 * Generate a unique invoice number
 */
function generateInvoiceNumber(): string {
  const prefix = 'INV'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

/**
 * Create an invoice
 */
export async function createInvoice(input: CreateInvoiceInput): Promise<InvoiceSummary> {
  const subtotal = input.lineItems.reduce((sum, item) => sum + item.amount, 0)
  const taxAmount = input.taxRate ? subtotal * (input.taxRate / 100) : 0
  const total = subtotal + taxAmount

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: generateInvoiceNumber(),
      brandId: input.brandId,
      influencerId: input.influencerId,
      collaborationId: input.collaborationId,
      type: input.type,
      status: InvoiceStatus.DRAFT,
      lineItems: input.lineItems as unknown as Prisma.InputJsonValue,
      subtotal: new Prisma.Decimal(subtotal),
      taxRate: input.taxRate ? new Prisma.Decimal(input.taxRate) : null,
      taxAmount: taxAmount ? new Prisma.Decimal(taxAmount) : null,
      total: new Prisma.Decimal(total),
      gstNumber: input.gstNumber,
      taxType: input.taxType,
      dueDate: input.dueDate,
    },
  })

  return formatInvoice(invoice)
}

/**
 * Get invoice by ID
 */
export async function getInvoiceById(id: string): Promise<InvoiceSummary | null> {
  const invoice = await prisma.invoice.findUnique({
    where: { id },
  })

  if (!invoice) return null
  return formatInvoice(invoice)
}

/**
 * List invoices for a user
 */
export async function listInvoices(
  userId: string,
  userType: 'brand' | 'influencer',
  options: { page?: number; pageSize?: number; status?: InvoiceStatus } = {}
): Promise<{ data: InvoiceSummary[]; total: number }> {
  const { page = 1, pageSize = 20, status } = options
  const skip = (page - 1) * pageSize

  const where: Prisma.InvoiceWhereInput = {}

  if (userType === 'brand') {
    where.brand = { userId }
  } else {
    where.influencer = { userId }
  }

  if (status) where.status = status

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { issueDate: 'desc' },
    }),
    prisma.invoice.count({ where }),
  ])

  return {
    data: invoices.map(formatInvoice),
    total,
  }
}

/**
 * Mark invoice as sent
 */
export async function sendInvoice(invoiceId: string): Promise<InvoiceSummary> {
  const invoice = await prisma.invoice.update({
    where: { id: invoiceId },
    data: { status: InvoiceStatus.SENT },
  })

  return formatInvoice(invoice)
}

/**
 * Mark invoice as paid
 */
export async function markInvoicePaid(invoiceId: string): Promise<InvoiceSummary> {
  const invoice = await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      status: InvoiceStatus.PAID,
      paidAt: new Date(),
    },
  })

  return formatInvoice(invoice)
}

// ==================== PAYOUT METHOD OPERATIONS ====================

/**
 * Add a payout method for a user
 */
export async function addPayoutMethod(
  userId: string,
  input: CreatePayoutMethodInput
): Promise<PayoutMethodSummary> {
  // Check if this is the first payout method (make it default)
  const existingCount = await prisma.payoutMethod.count({
    where: { userId },
  })

  const payoutMethod = await prisma.payoutMethod.create({
    data: {
      userId,
      type: input.type,
      isDefault: existingCount === 0,
      isVerified: false,
      bankName: input.bankName,
      accountNumberLast4: input.accountNumberLast4,
      routingNumber: input.routingNumber,
      accountHolderName: input.accountHolderName,
      paypalEmail: input.paypalEmail,
      swiftCode: input.swiftCode,
      iban: input.iban,
      country: input.country,
      currency: input.currency || 'USD',
    },
  })

  return formatPayoutMethod(payoutMethod)
}

/**
 * Get payout methods for a user
 */
export async function getPayoutMethods(userId: string): Promise<PayoutMethodSummary[]> {
  const methods = await prisma.payoutMethod.findMany({
    where: { userId },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  })

  return methods.map(formatPayoutMethod)
}

/**
 * Set a payout method as default
 */
export async function setDefaultPayoutMethod(
  userId: string,
  payoutMethodId: string
): Promise<PayoutMethodSummary> {
  // Unset current default
  await prisma.payoutMethod.updateMany({
    where: { userId, isDefault: true },
    data: { isDefault: false },
  })

  // Set new default
  const method = await prisma.payoutMethod.update({
    where: { id: payoutMethodId },
    data: { isDefault: true },
  })

  return formatPayoutMethod(method)
}

/**
 * Delete a payout method
 */
export async function deletePayoutMethod(userId: string, payoutMethodId: string): Promise<void> {
  const method = await prisma.payoutMethod.findFirst({
    where: { id: payoutMethodId, userId },
  })

  if (!method) {
    throw new Error('Payout method not found')
  }

  await prisma.payoutMethod.delete({
    where: { id: payoutMethodId },
  })

  // If deleted method was default, set another as default
  if (method.isDefault) {
    const anotherMethod = await prisma.payoutMethod.findFirst({
      where: { userId },
    })

    if (anotherMethod) {
      await prisma.payoutMethod.update({
        where: { id: anotherMethod.id },
        data: { isDefault: true },
      })
    }
  }
}

// ==================== HELPER FUNCTIONS ====================

function formatEscrow(escrow: any): EscrowSummary {
  return {
    id: escrow.id,
    collaborationId: escrow.collaborationId,
    totalAmount: escrow.totalAmount.toNumber(),
    heldAmount: escrow.heldAmount.toNumber(),
    releasedAmount: escrow.releasedAmount.toNumber(),
    platformFee: escrow.platformFee.toNumber(),
    status: escrow.status,
    currency: escrow.currency,
    fundedAt: escrow.fundedAt,
    releasedAt: escrow.releasedAt,
  }
}

function formatInvoice(invoice: any): InvoiceSummary {
  return {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    type: invoice.type,
    status: invoice.status,
    subtotal: invoice.subtotal.toNumber(),
    taxAmount: invoice.taxAmount?.toNumber() ?? null,
    platformFee: invoice.platformFee?.toNumber() ?? null,
    total: invoice.total.toNumber(),
    currency: invoice.currency,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    paidAt: invoice.paidAt,
    pdfUrl: invoice.pdfUrl,
  }
}

function formatPayoutMethod(method: any): PayoutMethodSummary {
  return {
    id: method.id,
    type: method.type,
    isDefault: method.isDefault,
    isVerified: method.isVerified,
    bankName: method.bankName,
    accountNumberLast4: method.accountNumberLast4,
    paypalEmail: method.paypalEmail,
    country: method.country,
    currency: method.currency,
  }
}
