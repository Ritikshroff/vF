import { vi } from 'vitest';

// ─── Mock Prisma (hoisted for vi.mock) ──────────────────────────────────────

const {
  mockWallet,
  mockWalletTransaction,
  mockEscrowAccount,
  mockEscrowRelease,
  mockInvoice,
  mockPayoutMethod,
  mockMilestone,
  mockMilestonePayment,
} = vi.hoisted(() => {
  const fn = () => vi.fn();
  return {
    mockWallet: { findUnique: fn(), create: fn(), update: fn() },
    mockWalletTransaction: { findMany: fn(), create: fn(), count: fn() },
    mockEscrowAccount: { findUnique: fn(), create: fn(), update: fn() },
    mockEscrowRelease: { create: fn() },
    mockInvoice: { findUnique: fn(), findMany: fn(), create: fn(), update: fn(), count: fn() },
    mockPayoutMethod: { findFirst: fn(), findMany: fn(), create: fn(), update: fn(), updateMany: fn(), delete: fn(), count: fn() },
    mockMilestone: { findUnique: fn(), update: fn() },
    mockMilestonePayment: { create: fn() },
  };
});

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    wallet: mockWallet,
    walletTransaction: mockWalletTransaction,
    escrowAccount: mockEscrowAccount,
    escrowRelease: mockEscrowRelease,
    invoice: mockInvoice,
    payoutMethod: mockPayoutMethod,
    milestone: mockMilestone,
    milestonePayment: mockMilestonePayment,
    $transaction: vi.fn((ops: unknown[]) => Promise.resolve(ops)),
  },
}));

import {
  calculateFees,
  getOrCreateWallet,
  getWalletBalance,
  depositToWallet,
  withdrawFromWallet,
  createEscrowAccount,
  fundEscrow,
  releaseEscrow,
  refundEscrow,
  createInvoice,
  getInvoiceById,
  listInvoices,
  sendInvoice,
  markInvoicePaid,
  addPayoutMethod,
  getPayoutMethods,
  setDefaultPayoutMethod,
  deletePayoutMethod,
} from '@/services/payment.service';

// Helper to create Decimal-like objects
function decimal(val: number) {
  return { toNumber: () => val, toString: () => val.toString() };
}

// ─── calculateFees ──────────────────────────────────────────────────────────

describe('calculateFees', () => {
  it('should calculate 10% platform fee by default', () => {
    const result = calculateFees(1000);
    expect(result.amount).toBe(1000);
    expect(result.platformFee).toBe(100);
    expect(result.netAmount).toBe(900);
    expect(result.commissionRate).toBe(0.10);
  });

  it('should use custom commission rate', () => {
    const result = calculateFees(1000, 0.15);
    expect(result.platformFee).toBe(150);
    expect(result.netAmount).toBe(850);
    expect(result.commissionRate).toBe(0.15);
  });

  it('should handle zero amount', () => {
    const result = calculateFees(0);
    expect(result.platformFee).toBe(0);
    expect(result.netAmount).toBe(0);
  });

  it('should handle small amounts with precision', () => {
    const result = calculateFees(1);
    expect(result.platformFee).toBeCloseTo(0.1, 10);
    expect(result.netAmount).toBeCloseTo(0.9, 10);
  });

  it('should handle zero commission rate', () => {
    const result = calculateFees(1000, 0);
    expect(result.platformFee).toBe(0);
    expect(result.netAmount).toBe(1000);
  });
});

// ─── getOrCreateWallet ──────────────────────────────────────────────────────

describe('getOrCreateWallet', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should return existing wallet when found', async () => {
    const existingWallet = {
      id: 'wallet-1',
      balance: decimal(5000),
      pendingBalance: decimal(200),
      currency: 'USD',
    };
    mockWallet.findUnique.mockResolvedValue(existingWallet);

    const result = await getOrCreateWallet('user-1', 'BRAND_WALLET' as any);

    expect(result.id).toBe('wallet-1');
    expect(result.balance).toBe(5000);
    expect(result.pendingBalance).toBe(200);
    expect(result.currency).toBe('USD');
    expect(mockWallet.create).not.toHaveBeenCalled();
  });

  it('should create new wallet when not found', async () => {
    mockWallet.findUnique.mockResolvedValue(null);
    mockWallet.create.mockResolvedValue({
      id: 'wallet-new',
      balance: decimal(0),
      pendingBalance: decimal(0),
      currency: 'USD',
    });

    const result = await getOrCreateWallet('user-2', 'INFLUENCER_WALLET' as any);

    expect(result.id).toBe('wallet-new');
    expect(result.balance).toBe(0);
    expect(mockWallet.create).toHaveBeenCalledOnce();
  });
});

// ─── getWalletBalance ───────────────────────────────────────────────────────

describe('getWalletBalance', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should return zero balance when wallet not found', async () => {
    mockWallet.findUnique.mockResolvedValue(null);

    const result = await getWalletBalance('user-no-wallet');

    expect(result.available).toBe(0);
    expect(result.pending).toBe(0);
    expect(result.currency).toBe('USD');
  });

  it('should return wallet balance when found', async () => {
    mockWallet.findUnique.mockResolvedValue({
      balance: decimal(1500),
      pendingBalance: decimal(300),
      currency: 'USD',
    });

    const result = await getWalletBalance('user-1');

    expect(result.available).toBe(1500);
    expect(result.pending).toBe(300);
  });
});

// ─── withdrawFromWallet ─────────────────────────────────────────────────────

describe('withdrawFromWallet', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should throw when wallet not found', async () => {
    mockWallet.findUnique.mockResolvedValue(null);

    await expect(
      withdrawFromWallet('user-1', { amount: 100, payoutMethodId: 'pm-1' })
    ).rejects.toThrow('Wallet not found');
  });

  it('should throw on insufficient balance', async () => {
    mockWallet.findUnique.mockResolvedValue({
      id: 'w1',
      balance: decimal(50),
      currency: 'USD',
    });

    await expect(
      withdrawFromWallet('user-1', { amount: 100, payoutMethodId: 'pm-1' })
    ).rejects.toThrow('Insufficient balance');
  });

  it('should throw when payout method not found', async () => {
    mockWallet.findUnique.mockResolvedValue({
      id: 'w1',
      balance: decimal(500),
      currency: 'USD',
    });
    mockPayoutMethod.findFirst.mockResolvedValue(null);

    await expect(
      withdrawFromWallet('user-1', { amount: 100, payoutMethodId: 'pm-bad' })
    ).rejects.toThrow('Invalid payout method');
  });

  it('should throw when payout method is not verified', async () => {
    mockWallet.findUnique.mockResolvedValue({
      id: 'w1',
      balance: decimal(500),
      currency: 'USD',
    });
    mockPayoutMethod.findFirst.mockResolvedValue({
      id: 'pm-1',
      isVerified: false,
      type: 'BANK',
    });

    await expect(
      withdrawFromWallet('user-1', { amount: 100, payoutMethodId: 'pm-1' })
    ).rejects.toThrow('Payout method is not verified');
  });
});

// ─── Escrow Operations ──────────────────────────────────────────────────────

describe('createEscrowAccount', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should create escrow with calculated platform fee', async () => {
    const mockEscrow = {
      id: 'esc-1',
      collaborationId: 'collab-1',
      totalAmount: decimal(5000),
      heldAmount: decimal(0),
      releasedAmount: decimal(0),
      platformFee: decimal(500),
      status: 'PENDING',
      currency: 'USD',
      fundedAt: null,
      releasedAt: null,
    };
    mockEscrowAccount.create.mockResolvedValue(mockEscrow);

    const result = await createEscrowAccount({
      collaborationId: 'collab-1',
      brandId: 'brand-1',
      influencerId: 'inf-1',
      amount: 5000,
    });

    expect(result.totalAmount).toBe(5000);
    expect(result.platformFee).toBe(500);
    expect(result.status).toBe('PENDING');
  });
});

describe('fundEscrow', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should throw when escrow not found', async () => {
    mockEscrowAccount.findUnique.mockResolvedValue(null);

    await expect(fundEscrow('esc-bad', 'user-1')).rejects.toThrow('Escrow account not found');
  });

  it('should throw when escrow is not PENDING', async () => {
    mockEscrowAccount.findUnique.mockResolvedValue({
      id: 'esc-1',
      status: 'FUNDED',
      totalAmount: decimal(5000),
    });

    await expect(fundEscrow('esc-1', 'user-1')).rejects.toThrow('not in PENDING status');
  });

  it('should throw when brand wallet not found', async () => {
    mockEscrowAccount.findUnique.mockResolvedValue({
      id: 'esc-1',
      status: 'PENDING',
      totalAmount: decimal(5000),
      collaborationId: 'collab-1',
    });
    mockWallet.findUnique.mockResolvedValue(null);

    await expect(fundEscrow('esc-1', 'user-1')).rejects.toThrow('Brand wallet not found');
  });

  it('should throw on insufficient balance to fund', async () => {
    mockEscrowAccount.findUnique.mockResolvedValue({
      id: 'esc-1',
      status: 'PENDING',
      totalAmount: decimal(5000),
      collaborationId: 'collab-1',
    });
    mockWallet.findUnique.mockResolvedValue({
      id: 'w1',
      balance: decimal(1000),
      currency: 'USD',
    });

    await expect(fundEscrow('esc-1', 'user-1')).rejects.toThrow('Insufficient balance');
  });
});

describe('releaseEscrow', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should throw when escrow not found', async () => {
    mockEscrowAccount.findUnique.mockResolvedValue(null);

    await expect(
      releaseEscrow('esc-bad', 'admin-1', { amount: 1000, reason: 'Milestone done' })
    ).rejects.toThrow('Escrow account not found');
  });

  it('should throw when not in releasable state', async () => {
    mockEscrowAccount.findUnique.mockResolvedValue({
      id: 'esc-1',
      status: 'PENDING',
      totalAmount: decimal(5000),
    });

    await expect(
      releaseEscrow('esc-1', 'admin-1', { amount: 1000, reason: 'test' })
    ).rejects.toThrow('not in a releasable state');
  });

  it('should throw when neither milestoneId nor amount provided', async () => {
    mockEscrowAccount.findUnique.mockResolvedValue({
      id: 'esc-1',
      status: 'FUNDED',
      totalAmount: decimal(5000),
      heldAmount: decimal(5000),
      releasedAmount: decimal(0),
      influencer: { userId: 'inf-user-1' },
      currency: 'USD',
      collaborationId: 'collab-1',
    });

    await expect(
      releaseEscrow('esc-1', 'admin-1', { reason: 'test' } as any)
    ).rejects.toThrow('Either milestoneId or amount must be provided');
  });

  it('should throw when release amount exceeds held amount', async () => {
    mockEscrowAccount.findUnique.mockResolvedValue({
      id: 'esc-1',
      status: 'FUNDED',
      totalAmount: decimal(5000),
      heldAmount: decimal(1000),
      releasedAmount: decimal(4000),
      influencer: { userId: 'inf-user-1' },
      currency: 'USD',
      collaborationId: 'collab-1',
    });

    await expect(
      releaseEscrow('esc-1', 'admin-1', { amount: 2000, reason: 'test' })
    ).rejects.toThrow('Release amount exceeds held amount');
  });
});

describe('refundEscrow', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should throw when escrow not found', async () => {
    mockEscrowAccount.findUnique.mockResolvedValue(null);
    await expect(refundEscrow('esc-bad', 'Cancelled')).rejects.toThrow('Escrow account not found');
  });

  it('should throw when no funds to refund', async () => {
    mockEscrowAccount.findUnique.mockResolvedValue({
      id: 'esc-1',
      heldAmount: decimal(0),
      brand: { userId: 'brand-user-1' },
    });

    await expect(refundEscrow('esc-1', 'Client cancelled')).rejects.toThrow('No funds to refund');
  });
});

// ─── Invoice Operations ─────────────────────────────────────────────────────

describe('createInvoice', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should create invoice with calculated subtotal and total', async () => {
    const mockInv = {
      id: 'inv-1',
      invoiceNumber: 'INV-TEST',
      type: 'BRAND_DEPOSIT',
      status: 'DRAFT',
      subtotal: decimal(5000),
      taxAmount: null,
      platformFee: null,
      total: decimal(5000),
      currency: 'USD',
      issueDate: new Date(),
      dueDate: new Date(),
      paidAt: null,
      pdfUrl: null,
    };
    mockInvoice.create.mockResolvedValue(mockInv);

    const result = await createInvoice({
      brandId: 'brand-1',
      influencerId: 'inf-1',
      collaborationId: 'collab-1',
      type: 'BRAND_DEPOSIT' as any,
      lineItems: [
        { description: 'Campaign fee', amount: 3000 },
        { description: 'Bonus', amount: 2000 },
      ],
      dueDate: new Date(),
    });

    expect(result.id).toBe('inv-1');
    expect(result.total).toBe(5000);
    expect(result.status).toBe('DRAFT');
    expect(mockInvoice.create).toHaveBeenCalledOnce();
  });
});

describe('getInvoiceById', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should return null when not found', async () => {
    mockInvoice.findUnique.mockResolvedValue(null);
    const result = await getInvoiceById('inv-none');
    expect(result).toBeNull();
  });

  it('should return formatted invoice when found', async () => {
    mockInvoice.findUnique.mockResolvedValue({
      id: 'inv-1',
      invoiceNumber: 'INV-001',
      type: 'BRAND_DEPOSIT',
      status: 'SENT',
      subtotal: decimal(5000),
      taxAmount: null,
      platformFee: null,
      total: decimal(5000),
      currency: 'USD',
      issueDate: new Date(),
      dueDate: new Date(),
      paidAt: null,
      pdfUrl: null,
    });

    const result = await getInvoiceById('inv-1');
    expect(result!.id).toBe('inv-1');
    expect(result!.total).toBe(5000);
  });
});

describe('listInvoices', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should filter by brand userType', async () => {
    mockInvoice.findMany.mockResolvedValue([]);
    mockInvoice.count.mockResolvedValue(0);

    await listInvoices('user-1', 'brand');

    const where = mockInvoice.findMany.mock.calls[0][0].where;
    expect(where.brand).toEqual({ userId: 'user-1' });
  });

  it('should filter by influencer userType', async () => {
    mockInvoice.findMany.mockResolvedValue([]);
    mockInvoice.count.mockResolvedValue(0);

    await listInvoices('user-2', 'influencer');

    const where = mockInvoice.findMany.mock.calls[0][0].where;
    expect(where.influencer).toEqual({ userId: 'user-2' });
  });
});

describe('sendInvoice', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should update status to SENT', async () => {
    mockInvoice.update.mockResolvedValue({
      id: 'inv-1',
      invoiceNumber: 'INV-001',
      type: 'BRAND_DEPOSIT',
      status: 'SENT',
      subtotal: decimal(5000),
      taxAmount: null,
      platformFee: null,
      total: decimal(5000),
      currency: 'USD',
      issueDate: new Date(),
      dueDate: new Date(),
      paidAt: null,
      pdfUrl: null,
    });

    const result = await sendInvoice('inv-1');

    expect(result.status).toBe('SENT');
    expect(mockInvoice.update).toHaveBeenCalledWith({
      where: { id: 'inv-1' },
      data: { status: 'SENT' },
    });
  });
});

describe('markInvoicePaid', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should update status to PAID with timestamp', async () => {
    const now = new Date();
    mockInvoice.update.mockResolvedValue({
      id: 'inv-1',
      invoiceNumber: 'INV-001',
      type: 'BRAND_DEPOSIT',
      status: 'PAID',
      subtotal: decimal(5000),
      taxAmount: null,
      platformFee: null,
      total: decimal(5000),
      currency: 'USD',
      issueDate: now,
      dueDate: now,
      paidAt: now,
      pdfUrl: null,
    });

    const result = await markInvoicePaid('inv-1');

    expect(result.status).toBe('PAID');
    expect(result.paidAt).toBeDefined();
  });
});

// ─── Payout Method Operations ───────────────────────────────────────────────

describe('addPayoutMethod', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should set first payout method as default', async () => {
    mockPayoutMethod.count.mockResolvedValue(0);
    mockPayoutMethod.create.mockResolvedValue({
      id: 'pm-1',
      type: 'BANK',
      isDefault: true,
      isVerified: false,
      bankName: 'Chase',
      accountNumberLast4: '4567',
      paypalEmail: null,
      country: 'US',
      currency: 'USD',
    });

    const result = await addPayoutMethod('user-1', {
      type: 'BANK',
      bankName: 'Chase',
      accountNumberLast4: '4567',
      country: 'US',
    });

    expect(result.isDefault).toBe(true);
    expect(result.type).toBe('BANK');
    const createCall = mockPayoutMethod.create.mock.calls[0][0];
    expect(createCall.data.isDefault).toBe(true);
  });

  it('should not set as default when other methods exist', async () => {
    mockPayoutMethod.count.mockResolvedValue(2);
    mockPayoutMethod.create.mockResolvedValue({
      id: 'pm-2',
      type: 'PAYPAL',
      isDefault: false,
      isVerified: false,
      bankName: null,
      accountNumberLast4: null,
      paypalEmail: 'test@example.com',
      country: 'US',
      currency: 'USD',
    });

    const result = await addPayoutMethod('user-1', {
      type: 'PAYPAL',
      paypalEmail: 'test@example.com',
      country: 'US',
    });

    expect(result.isDefault).toBe(false);
    const createCall = mockPayoutMethod.create.mock.calls[0][0];
    expect(createCall.data.isDefault).toBe(false);
  });
});

describe('setDefaultPayoutMethod', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should unset existing defaults and set new one', async () => {
    mockPayoutMethod.updateMany.mockResolvedValue({ count: 1 });
    mockPayoutMethod.update.mockResolvedValue({
      id: 'pm-2',
      type: 'BANK',
      isDefault: true,
      isVerified: true,
      bankName: 'BOA',
      accountNumberLast4: '1234',
      paypalEmail: null,
      country: 'US',
      currency: 'USD',
    });

    const result = await setDefaultPayoutMethod('user-1', 'pm-2');

    expect(result.isDefault).toBe(true);
    expect(mockPayoutMethod.updateMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', isDefault: true },
      data: { isDefault: false },
    });
  });
});

describe('deletePayoutMethod', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should throw when method not found', async () => {
    mockPayoutMethod.findFirst.mockResolvedValue(null);

    await expect(deletePayoutMethod('user-1', 'pm-bad')).rejects.toThrow('Payout method not found');
  });

  it('should delete and reassign default when deleting default method', async () => {
    mockPayoutMethod.findFirst
      .mockResolvedValueOnce({ id: 'pm-1', isDefault: true, userId: 'user-1' })
      .mockResolvedValueOnce({ id: 'pm-2', userId: 'user-1' });
    mockPayoutMethod.delete.mockResolvedValue({});
    mockPayoutMethod.update.mockResolvedValue({});

    await deletePayoutMethod('user-1', 'pm-1');

    expect(mockPayoutMethod.delete).toHaveBeenCalledWith({ where: { id: 'pm-1' } });
    expect(mockPayoutMethod.update).toHaveBeenCalledWith({
      where: { id: 'pm-2' },
      data: { isDefault: true },
    });
  });

  it('should delete without reassigning when not default', async () => {
    mockPayoutMethod.findFirst.mockResolvedValue({ id: 'pm-1', isDefault: false, userId: 'user-1' });
    mockPayoutMethod.delete.mockResolvedValue({});

    await deletePayoutMethod('user-1', 'pm-1');

    expect(mockPayoutMethod.delete).toHaveBeenCalled();
    // findFirst should only be called once (to find the method to delete, not to reassign)
    expect(mockPayoutMethod.findFirst).toHaveBeenCalledTimes(1);
  });
});
