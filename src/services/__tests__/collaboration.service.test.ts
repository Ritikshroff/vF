import { vi } from 'vitest';

// ─── Mock Prisma (hoisted for vi.mock) ──────────────────────────────────────

const {
  mockCollaboration,
  mockStatusHistory,
  mockContract,
  mockTemplate,
  mockMilestone,
  mockDeliverable,
  mockVersion,
  mockMessage,
} = vi.hoisted(() => {
  const fn = () => vi.fn();
  return {
    mockCollaboration: { findUnique: fn(), findMany: fn(), create: fn(), update: fn(), count: fn() },
    mockStatusHistory: { findMany: fn(), create: fn() },
    mockContract: { findUnique: fn(), create: fn(), update: fn() },
    mockTemplate: { findUnique: fn() },
    mockMilestone: { findUnique: fn(), create: fn(), update: fn() },
    mockDeliverable: { findUnique: fn(), create: fn(), update: fn() },
    mockVersion: { findMany: fn(), create: fn(), updateMany: fn() },
    mockMessage: { findMany: fn(), create: fn(), count: fn() },
  };
});

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    collaboration: mockCollaboration,
    collaborationStatusHistory: mockStatusHistory,
    collaborationContract: mockContract,
    contractTemplate: mockTemplate,
    milestone: mockMilestone,
    collaborationDeliverable: mockDeliverable,
    deliverableVersion: mockVersion,
    collaborationMessage: mockMessage,
    $transaction: vi.fn((fn: any) => fn({
      collaboration: mockCollaboration,
      milestone: mockMilestone,
      collaborationDeliverable: mockDeliverable,
      deliverableVersion: mockVersion,
    })),
  },
}));

import {
  createCollaboration,
  getCollaborationById,
  listCollaborations,
  transitionCollaboration,
  getAvailableActions,
  generateContract,
  signContract,
  createMilestones,
  updateMilestoneStatus,
  createDeliverables,
  submitDeliverable,
  reviewDeliverable,
  getDeliverableVersions,
  sendCollaborationMessage,
  getCollaborationMessages,
  getCollaborationHistory,
} from '@/services/collaboration.service';

import { COLLABORATION_TRANSITIONS } from '@/types/collaboration';

// Helper to create Decimal-like objects
function decimal(val: number) {
  return { toNumber: () => val, toString: () => val.toString() };
}

// Helper for a mock collaboration row
function mockCollabRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'collab-1',
    campaignId: 'camp-1',
    influencerId: 'inf-1',
    brandId: 'brand-1',
    status: 'PROPOSAL_SENT',
    agreedAmount: decimal(5000),
    platformFee: decimal(500),
    influencerPayout: decimal(4500),
    currency: 'USD',
    startDate: new Date(),
    endDate: new Date(),
    contentDueDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    completedAt: null,
    cancelledAt: null,
    campaign: { id: 'camp-1', title: 'Test Campaign', category: 'Tech' },
    influencer: { id: 'inf-1', username: 'creator1', fullName: 'Test Creator', avatar: null },
    brand: { id: 'brand-1', companyName: 'Test Brand', logo: null },
    contract: null,
    milestones: [
      { id: 'ms-1', title: 'Draft', amount: decimal(2500), status: 'PENDING', order: 1, dueDate: null },
      { id: 'ms-2', title: 'Final', amount: decimal(2500), status: 'PENDING', order: 2, dueDate: null },
    ],
    deliverables: [],
    ...overrides,
  };
}

// ─── State Machine (COLLABORATION_TRANSITIONS) ─────────────────────────────

describe('COLLABORATION_TRANSITIONS', () => {
  it('should have transitions for all defined statuses', () => {
    const statuses = [
      'PROPOSAL_SENT', 'PROPOSAL_ACCEPTED', 'NEGOTIATING', 'CONTRACT_PENDING',
      'CONTRACT_SIGNED', 'IN_PRODUCTION', 'CONTENT_SUBMITTED', 'REVISION_REQUESTED',
      'CONTENT_APPROVED', 'PUBLISHED', 'PAYMENT_PENDING', 'COMPLETED', 'CANCELLED', 'DISPUTED',
    ];
    for (const status of statuses) {
      expect(COLLABORATION_TRANSITIONS).toHaveProperty(status);
    }
  });

  it('should have no transitions from terminal states', () => {
    expect(COLLABORATION_TRANSITIONS.COMPLETED).toEqual([]);
    expect(COLLABORATION_TRANSITIONS.CANCELLED).toEqual([]);
  });

  it('PROPOSAL_SENT allows ACCEPT, REJECT, COUNTER', () => {
    const actions = COLLABORATION_TRANSITIONS.PROPOSAL_SENT.map((t) => t.action);
    expect(actions).toContain('ACCEPT');
    expect(actions).toContain('REJECT');
    expect(actions).toContain('COUNTER');
  });

  it('DISPUTED allows RESOLVE and REFUND', () => {
    const actions = COLLABORATION_TRANSITIONS.DISPUTED.map((t) => t.action);
    expect(actions).toContain('RESOLVE');
    expect(actions).toContain('REFUND');
  });
});

// ─── getAvailableActions ────────────────────────────────────────────────────

describe('getAvailableActions', () => {
  it('should return brand-specific actions for CONTENT_SUBMITTED', () => {
    const actions = getAvailableActions('CONTENT_SUBMITTED' as any, 'brand');
    expect(actions).toContain('APPROVE');
    expect(actions).toContain('REQUEST_REVISION');
    expect(actions).toContain('REJECT');
  });

  it('should return influencer actions for IN_PRODUCTION', () => {
    const actions = getAvailableActions('IN_PRODUCTION' as any, 'influencer');
    expect(actions).toContain('SUBMIT_CONTENT');
  });

  it('should return all actions for admin', () => {
    const adminActions = getAvailableActions('PROPOSAL_SENT' as any, 'admin');
    const allActions = COLLABORATION_TRANSITIONS.PROPOSAL_SENT.map((t) => t.action);
    expect(adminActions).toEqual(allActions);
  });

  it('should return empty for terminal states', () => {
    expect(getAvailableActions('COMPLETED' as any, 'brand')).toEqual([]);
    expect(getAvailableActions('CANCELLED' as any, 'influencer')).toEqual([]);
  });
});

// ─── createCollaboration ────────────────────────────────────────────────────

describe('createCollaboration', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should create collaboration with 10% platform fee', async () => {
    mockCollaboration.create.mockResolvedValue(mockCollabRow());

    const result = await createCollaboration({
      campaignId: 'camp-1',
      influencerId: 'inf-1',
      brandId: 'brand-1',
      agreedAmount: 5000,
    });

    expect(result.agreedAmount).toBe(5000);
    expect(result.platformFee).toBe(500);
    expect(result.influencerPayout).toBe(4500);

    const createCall = mockCollaboration.create.mock.calls[0][0];
    expect(createCall.data.status).toBe('PROPOSAL_SENT');
  });
});

// ─── getCollaborationById ───────────────────────────────────────────────────

describe('getCollaborationById', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should return null when not found', async () => {
    mockCollaboration.findUnique.mockResolvedValue(null);
    const result = await getCollaborationById('bad-id');
    expect(result).toBeNull();
  });

  it('should return formatted collaboration when found', async () => {
    mockCollaboration.findUnique.mockResolvedValue(mockCollabRow());
    const result = await getCollaborationById('collab-1');
    expect(result!.id).toBe('collab-1');
    expect(result!.agreedAmount).toBe(5000);
    expect(result!.milestones[0].amount).toBe(2500);
  });
});

// ─── transitionCollaboration ────────────────────────────────────────────────

describe('transitionCollaboration', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should throw when collaboration not found', async () => {
    mockCollaboration.findUnique.mockResolvedValue(null);

    await expect(
      transitionCollaboration('bad-id', 'user-1', { action: 'ACCEPT' })
    ).rejects.toThrow('Collaboration not found');
  });

  it('should throw on invalid transition action', async () => {
    mockCollaboration.findUnique.mockResolvedValue({
      id: 'collab-1',
      status: 'PROPOSAL_SENT',
      contract: null,
    });

    await expect(
      transitionCollaboration('collab-1', 'user-1', { action: 'PUBLISH' })
    ).rejects.toThrow('Invalid transition');
  });

  it('should allow valid ACCEPT transition from PROPOSAL_SENT', async () => {
    mockCollaboration.findUnique.mockResolvedValue({
      id: 'collab-1',
      status: 'PROPOSAL_SENT',
      contract: null,
    });
    mockCollaboration.update.mockResolvedValue(
      mockCollabRow({ status: 'PROPOSAL_ACCEPTED' })
    );

    const result = await transitionCollaboration('collab-1', 'inf-1', {
      action: 'ACCEPT',
      reason: 'Looks good',
    });

    expect(result.status).toBe('PROPOSAL_ACCEPTED');
    expect(mockCollaboration.update).toHaveBeenCalledOnce();
  });

  it('should throw when CONTRACT_SIGNED transition but contract not fully signed', async () => {
    mockCollaboration.findUnique.mockResolvedValue({
      id: 'collab-1',
      status: 'CONTRACT_PENDING',
      contract: { isFullySigned: false },
    });

    await expect(
      transitionCollaboration('collab-1', 'user-1', { action: 'SIGN' })
    ).rejects.toThrow('Both parties must sign');
  });
});

// ─── Contract Management ────────────────────────────────────────────────────

describe('generateContract', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should throw when collaboration not found', async () => {
    mockCollaboration.findUnique.mockResolvedValue(null);

    await expect(generateContract('bad-id')).rejects.toThrow('Collaboration not found');
  });

  it('should create contract and transition to CONTRACT_PENDING', async () => {
    mockCollaboration.findUnique.mockResolvedValue({
      id: 'collab-1',
      status: 'PROPOSAL_ACCEPTED',
      brandId: 'brand-1',
      agreedAmount: decimal(5000),
      platformFee: decimal(500),
      influencerPayout: decimal(4500),
      currency: 'USD',
      campaign: { title: 'Test' },
      influencer: { fullName: 'Creator', user: { id: 'u1' } },
      brand: { companyName: 'Brand Co', user: { id: 'u2' } },
      deliverables: [],
    });
    mockContract.create.mockResolvedValue({ id: 'contract-1' });
    mockCollaboration.update.mockResolvedValue({});

    const result = await generateContract('collab-1', undefined, 'Custom terms here');

    expect(result.id).toBe('contract-1');
    expect(mockCollaboration.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'collab-1' },
        data: expect.objectContaining({ status: 'CONTRACT_PENDING' }),
      })
    );
  });
});

describe('signContract', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should throw when contract not found', async () => {
    mockContract.findUnique.mockResolvedValue(null);

    await expect(
      signContract('collab-1', 'user-1', 'brand', { signature: 'sig-data' })
    ).rejects.toThrow('Contract not found');
  });

  it('should throw when brand already signed', async () => {
    mockContract.findUnique.mockResolvedValue({
      id: 'c-1',
      brandSignedAt: new Date(),
      influencerSignedAt: null,
      collaboration: {},
    });

    await expect(
      signContract('collab-1', 'user-1', 'brand', { signature: 'sig' })
    ).rejects.toThrow('Brand has already signed');
  });

  it('should throw when influencer already signed', async () => {
    mockContract.findUnique.mockResolvedValue({
      id: 'c-1',
      brandSignedAt: null,
      influencerSignedAt: new Date(),
      collaboration: {},
    });

    await expect(
      signContract('collab-1', 'user-1', 'influencer', { signature: 'sig' })
    ).rejects.toThrow('Influencer has already signed');
  });

  it('should set isFullySigned when both parties sign', async () => {
    mockContract.findUnique.mockResolvedValue({
      id: 'c-1',
      brandSignedAt: new Date(), // brand already signed
      influencerSignedAt: null,
      collaboration: { id: 'collab-1' },
    });
    mockContract.update.mockResolvedValue({
      id: 'c-1',
      isFullySigned: true,
      influencerSignedAt: new Date(),
      brandSignedAt: new Date(),
    });
    mockCollaboration.update.mockResolvedValue({});

    const result = await signContract('collab-1', 'inf-1', 'influencer', {
      signature: 'inf-sig',
      ipAddress: '1.2.3.4',
    });

    expect(result.isFullySigned).toBe(true);
    // Should transition to CONTRACT_SIGNED
    expect(mockCollaboration.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'CONTRACT_SIGNED' }),
      })
    );
  });
});

// ─── Milestone Management ───────────────────────────────────────────────────

describe('createMilestones', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should throw when collaboration not found', async () => {
    mockCollaboration.findUnique.mockResolvedValue(null);

    await expect(
      createMilestones('bad-id', [{ title: 'MS1', order: 1, amount: 1000 }])
    ).rejects.toThrow('Collaboration not found');
  });

  it('should throw when milestone amounts dont sum to agreed amount', async () => {
    mockCollaboration.findUnique.mockResolvedValue({
      id: 'collab-1',
      agreedAmount: decimal(5000),
    });

    await expect(
      createMilestones('collab-1', [
        { title: 'MS1', order: 1, amount: 1000 },
        { title: 'MS2', order: 2, amount: 2000 },
      ])
    ).rejects.toThrow('Milestone amounts must sum to the agreed collaboration amount');
  });

  it('should create milestones when sum matches agreed amount', async () => {
    mockCollaboration.findUnique.mockResolvedValue({
      id: 'collab-1',
      agreedAmount: decimal(5000),
    });
    mockMilestone.create
      .mockResolvedValueOnce({ id: 'ms-1', title: 'Draft', order: 1 })
      .mockResolvedValueOnce({ id: 'ms-2', title: 'Final', order: 2 });

    const result = await createMilestones('collab-1', [
      { title: 'Draft', order: 1, amount: 2500 },
      { title: 'Final', order: 2, amount: 2500 },
    ]);

    expect(result).toHaveLength(2);
    expect(mockMilestone.create).toHaveBeenCalledTimes(2);
  });

  it('should allow tiny floating point differences (within 0.01)', async () => {
    mockCollaboration.findUnique.mockResolvedValue({
      id: 'collab-1',
      agreedAmount: decimal(100),
    });
    mockMilestone.create.mockResolvedValue({ id: 'ms-1' });

    // 33.33 + 33.33 + 33.34 = 100.00 exactly, but let's test with rounding
    await expect(
      createMilestones('collab-1', [
        { title: 'A', order: 1, amount: 33.33 },
        { title: 'B', order: 2, amount: 33.33 },
        { title: 'C', order: 3, amount: 33.34 },
      ])
    ).resolves.toBeDefined();
  });
});

describe('updateMilestoneStatus', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should set approvedAt when status is APPROVED', async () => {
    mockMilestone.update.mockResolvedValue({ id: 'ms-1', status: 'APPROVED' });

    await updateMilestoneStatus('ms-1', 'APPROVED' as any);

    const updateCall = mockMilestone.update.mock.calls[0][0];
    expect(updateCall.data.status).toBe('APPROVED');
    expect(updateCall.data.approvedAt).toBeDefined();
  });

  it('should set paidAt when status is PAID', async () => {
    mockMilestone.update.mockResolvedValue({ id: 'ms-1', status: 'PAID' });

    await updateMilestoneStatus('ms-1', 'PAID' as any);

    const updateCall = mockMilestone.update.mock.calls[0][0];
    expect(updateCall.data.paidAt).toBeDefined();
  });

  it('should not set timestamps for PENDING status', async () => {
    mockMilestone.update.mockResolvedValue({ id: 'ms-1', status: 'PENDING' });

    await updateMilestoneStatus('ms-1', 'PENDING' as any);

    const updateCall = mockMilestone.update.mock.calls[0][0];
    expect(updateCall.data.approvedAt).toBeUndefined();
    expect(updateCall.data.paidAt).toBeUndefined();
  });
});

// ─── Deliverable Management ─────────────────────────────────────────────────

describe('submitDeliverable', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should throw when deliverable not found', async () => {
    mockDeliverable.findUnique.mockResolvedValue(null);

    await expect(
      submitDeliverable('bad-id', { mediaUrls: ['https://example.com/img.jpg'] })
    ).rejects.toThrow('Deliverable not found');
  });

  it('should increment version and create version record', async () => {
    mockDeliverable.findUnique.mockResolvedValue({
      id: 'del-1',
      currentVersion: 1,
    });
    mockVersion.create.mockResolvedValue({
      id: 'ver-1',
      version: 2,
      mediaUrls: ['https://cdn.com/video.mp4'],
    });
    mockDeliverable.update.mockResolvedValue({});

    const result = await submitDeliverable('del-1', {
      mediaUrls: ['https://cdn.com/video.mp4'],
      caption: 'Draft v2',
    });

    expect(result.version).toBe(2);
    expect(mockVersion.create.mock.calls[0][0].data.version).toBe(2);
    expect(mockDeliverable.update.mock.calls[0][0].data.currentVersion).toBe(2);
    expect(mockDeliverable.update.mock.calls[0][0].data.status).toBe('SUBMITTED');
  });
});

describe('reviewDeliverable', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should throw when deliverable not found', async () => {
    mockDeliverable.findUnique.mockResolvedValue(null);

    await expect(
      reviewDeliverable('bad-id', 'reviewer-1', { status: 'APPROVED' })
    ).rejects.toThrow('Deliverable not found');
  });

  it('should set APPROVED status and approvedAt', async () => {
    mockDeliverable.findUnique.mockResolvedValue({
      id: 'del-1',
      currentVersion: 2,
    });
    mockVersion.updateMany.mockResolvedValue({ count: 1 });
    mockDeliverable.update.mockResolvedValue({
      id: 'del-1',
      status: 'APPROVED',
      versions: [],
    });

    await reviewDeliverable('del-1', 'brand-1', { status: 'APPROVED', feedback: 'Perfect!' });

    expect(mockDeliverable.update.mock.calls[0][0].data.status).toBe('APPROVED');
    expect(mockDeliverable.update.mock.calls[0][0].data.approvedAt).toBeDefined();
  });

  it('should map REVISION_NEEDED to REVISION_REQUESTED status', async () => {
    mockDeliverable.findUnique.mockResolvedValue({ id: 'del-1', currentVersion: 1 });
    mockVersion.updateMany.mockResolvedValue({ count: 1 });
    mockDeliverable.update.mockResolvedValue({ id: 'del-1', status: 'REVISION_REQUESTED', versions: [] });

    await reviewDeliverable('del-1', 'brand-1', { status: 'REVISION_NEEDED', feedback: 'Need changes' });

    expect(mockDeliverable.update.mock.calls[0][0].data.status).toBe('REVISION_REQUESTED');
  });
});

describe('getDeliverableVersions', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should query versions ordered by version desc', async () => {
    mockVersion.findMany.mockResolvedValue([
      { id: 'v2', version: 2 },
      { id: 'v1', version: 1 },
    ]);

    const result = await getDeliverableVersions('del-1');

    expect(result).toHaveLength(2);
    expect(mockVersion.findMany).toHaveBeenCalledWith({
      where: { deliverableId: 'del-1' },
      orderBy: { version: 'desc' },
    });
  });
});

// ─── Communication ──────────────────────────────────────────────────────────

describe('sendCollaborationMessage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should create message with correct data', async () => {
    mockMessage.create.mockResolvedValue({
      id: 'msg-1',
      content: 'Hello!',
      senderId: 'user-1',
      isSystemMessage: false,
    });

    const result = await sendCollaborationMessage('collab-1', 'user-1', 'Hello!', ['file.pdf']);

    expect(result.content).toBe('Hello!');
    expect(mockMessage.create.mock.calls[0][0].data).toEqual({
      collaborationId: 'collab-1',
      senderId: 'user-1',
      content: 'Hello!',
      attachments: ['file.pdf'],
      isSystemMessage: false,
    });
  });

  it('should default to empty attachments', async () => {
    mockMessage.create.mockResolvedValue({ id: 'msg-1' });

    await sendCollaborationMessage('collab-1', 'user-1', 'Hi');

    expect(mockMessage.create.mock.calls[0][0].data.attachments).toEqual([]);
  });
});

describe('getCollaborationMessages', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should return paginated messages', async () => {
    mockMessage.findMany.mockResolvedValue([{ id: 'msg-1' }, { id: 'msg-2' }]);
    mockMessage.count.mockResolvedValue(10);

    const result = await getCollaborationMessages('collab-1', { page: 1, pageSize: 2 });

    expect(result.data).toHaveLength(2);
    expect(result.total).toBe(10);
    expect(result.totalPages).toBe(5);
  });
});

describe('getCollaborationHistory', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should return status history ordered by createdAt desc', async () => {
    mockStatusHistory.findMany.mockResolvedValue([
      { fromStatus: 'PROPOSAL_SENT', toStatus: 'PROPOSAL_ACCEPTED' },
    ]);

    const result = await getCollaborationHistory('collab-1');

    expect(result).toHaveLength(1);
    expect(mockStatusHistory.findMany).toHaveBeenCalledWith({
      where: { collaborationId: 'collab-1' },
      orderBy: { createdAt: 'desc' },
    });
  });
});
