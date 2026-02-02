/**
 * Mock Notifications Data
 */

export interface Notification {
  id: string
  user_id: string
  type:
    | 'campaign_invite'
    | 'campaign_application'
    | 'campaign_accepted'
    | 'campaign_rejected'
    | 'message'
    | 'payment'
    | 'content_approved'
    | 'content_revision'
    | 'deadline_reminder'
    | 'milestone'
  title: string
  message: string
  link?: string
  read: boolean
  created_at: string
  metadata?: {
    campaign_id?: string
    campaign_name?: string
    brand_name?: string
    influencer_name?: string
    amount?: number
  }
}

export const mockNotifications: Notification[] = [
  {
    id: 'notif_001',
    user_id: 'user_001',
    type: 'campaign_invite',
    title: 'New Campaign Invitation',
    message: 'EcoWear has invited you to their Spring Fashion Launch campaign',
    link: '/influencer/campaigns/camp_001',
    read: false,
    created_at: '2026-02-02T10:30:00Z',
    metadata: {
      campaign_id: 'camp_001',
      campaign_name: 'Spring Fashion Launch',
      brand_name: 'EcoWear',
    },
  },
  {
    id: 'notif_002',
    user_id: 'user_001',
    type: 'payment',
    title: 'Payment Received',
    message: 'You received $4,500 for the Spring Fashion Launch campaign',
    link: '/influencer/payments',
    read: false,
    created_at: '2026-02-01T15:45:00Z',
    metadata: {
      amount: 4500,
      campaign_name: 'Spring Fashion Launch',
    },
  },
  {
    id: 'notif_003',
    user_id: 'user_001',
    type: 'content_approved',
    title: 'Content Approved',
    message: 'Your content for Holiday Gift Guide has been approved by EcoWear',
    link: '/influencer/content',
    read: true,
    created_at: '2026-01-31T09:15:00Z',
    metadata: {
      campaign_name: 'Holiday Gift Guide',
      brand_name: 'EcoWear',
    },
  },
  {
    id: 'notif_004',
    user_id: 'user_001',
    type: 'message',
    title: 'New Message',
    message: 'EcoWear sent you a message about campaign details',
    link: '/influencer/messages',
    read: true,
    created_at: '2026-01-30T14:20:00Z',
    metadata: {
      brand_name: 'EcoWear',
    },
  },
  {
    id: 'notif_005',
    user_id: 'user_001',
    type: 'deadline_reminder',
    title: 'Deadline Approaching',
    message: 'Content for Wireless Earbuds Review is due in 3 days',
    link: '/influencer/campaigns/camp_002',
    read: true,
    created_at: '2026-01-29T08:00:00Z',
    metadata: {
      campaign_id: 'camp_002',
      campaign_name: 'Wireless Earbuds Review',
    },
  },
  // Brand notifications
  {
    id: 'notif_006',
    user_id: 'user_brand_001',
    type: 'campaign_application',
    title: 'New Application',
    message: 'Sarah Anderson applied to your Spring Fashion Launch campaign',
    link: '/brand/campaigns/camp_001',
    read: false,
    created_at: '2026-02-02T11:00:00Z',
    metadata: {
      campaign_id: 'camp_001',
      campaign_name: 'Spring Fashion Launch',
      influencer_name: 'Sarah Anderson',
    },
  },
  {
    id: 'notif_007',
    user_id: 'user_brand_001',
    type: 'milestone',
    title: 'Campaign Milestone',
    message: 'Your Spring Fashion Launch campaign reached 100K impressions',
    link: '/brand/analytics',
    read: false,
    created_at: '2026-02-01T16:30:00Z',
    metadata: {
      campaign_name: 'Spring Fashion Launch',
    },
  },
  {
    id: 'notif_008',
    user_id: 'user_brand_001',
    type: 'message',
    title: 'New Message',
    message: 'Michael Chen sent you a message',
    link: '/brand/messages',
    read: true,
    created_at: '2026-01-31T13:45:00Z',
    metadata: {
      influencer_name: 'Michael Chen',
    },
  },
]

export const getUserNotifications = (userId: string): Notification[] => {
  return mockNotifications
    .filter((n) => n.user_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export const getUnreadCount = (userId: string): number => {
  return mockNotifications.filter((n) => n.user_id === userId && !n.read).length
}

export const markAsRead = (notificationId: string): void => {
  const notification = mockNotifications.find((n) => n.id === notificationId)
  if (notification) {
    notification.read = true
  }
}

export const markAllAsRead = (userId: string): void => {
  mockNotifications.forEach((n) => {
    if (n.user_id === userId) {
      n.read = true
    }
  })
}
