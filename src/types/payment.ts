/**
 * Payment, Escrow & Invoicing Types
 */

import {
  TransactionType,
  WalletType,
  EscrowStatus,
  InvoiceType,
  InvoiceStatus,
  PaymentStatus,
} from '@prisma/client'

export {
  TransactionType,
  WalletType,
  EscrowStatus,
  InvoiceType,
  InvoiceStatus,
  PaymentStatus,
}

// Wallet Types
export interface WalletBalance {
  available: number
  pending: number
  currency: string
}

export interface WalletTransactionSummary {
  id: string
  type: TransactionType
  amount: number
  balance: number
  description: string | null
  createdAt: Date
}

export interface DepositInput {
  amount: number
  paymentMethodId?: string
  currency?: string
}

export interface WithdrawInput {
  amount: number
  payoutMethodId: string
}

// Escrow Types
export interface CreateEscrowInput {
  collaborationId: string
  brandId: string
  influencerId: string
  amount: number
  platformFeePercentage?: number
}

export interface EscrowReleaseInput {
  milestoneId?: string
  amount?: number
  reason: string
}

export interface EscrowSummary {
  id: string
  collaborationId: string
  totalAmount: number
  heldAmount: number
  releasedAmount: number
  platformFee: number
  status: EscrowStatus
  currency: string
  fundedAt: Date | null
  releasedAt: Date | null
}

// Invoice Types
export interface InvoiceLineItem {
  description: string
  quantity: number
  unitPrice: number
  amount: number
}

export interface CreateInvoiceInput {
  brandId?: string
  influencerId?: string
  collaborationId?: string
  type: InvoiceType
  lineItems: InvoiceLineItem[]
  taxRate?: number
  gstNumber?: string
  taxType?: string
  dueDate?: Date
}

export interface InvoiceSummary {
  id: string
  invoiceNumber: string
  type: InvoiceType
  status: InvoiceStatus
  subtotal: number
  taxAmount: number | null
  platformFee: number | null
  total: number
  currency: string
  issueDate: Date
  dueDate: Date | null
  paidAt: Date | null
  pdfUrl: string | null
}

// Payout Method Types
export interface CreatePayoutMethodInput {
  type: 'BANK_TRANSFER' | 'PAYPAL' | 'STRIPE_CONNECT'
  bankName?: string
  accountNumberLast4?: string
  routingNumber?: string
  accountHolderName?: string
  paypalEmail?: string
  swiftCode?: string
  iban?: string
  country?: string
  currency?: string
}

export interface PayoutMethodSummary {
  id: string
  type: string
  isDefault: boolean
  isVerified: boolean
  bankName: string | null
  accountNumberLast4: string | null
  paypalEmail: string | null
  country: string | null
  currency: string
}

// Commission Types
export interface CommissionTier {
  id: string
  name: string
  percentage: number
  minAmount: number | null
  maxAmount: number | null
  tierMin: number | null
  tierMax: number | null
}

// Calculation Results
export interface FeeCalculation {
  amount: number
  platformFee: number
  netAmount: number
  commissionRate: number
}
