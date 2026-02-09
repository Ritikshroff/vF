export interface CreateAlertRuleInput {
  name: string
  eventType: string
  conditions?: Record<string, unknown>
  channels: string[]
}

export interface UpdatePreferencesInput {
  emailEnabled?: boolean
  pushEnabled?: boolean
  digestFrequency?: 'INSTANT' | 'DAILY' | 'WEEKLY'
  mutedCategories?: string[]
  quietHoursStart?: string
  quietHoursEnd?: string
}

export interface NotificationItem {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  read: boolean
  readAt: Date | null
  metadata: unknown
  createdAt: Date
}

export interface AlertRuleSummary {
  id: string
  name: string
  eventType: string
  conditions: unknown
  channels: string[]
  isActive: boolean
  createdAt: Date
}

export interface NotificationPreferenceSummary {
  emailEnabled: boolean
  pushEnabled: boolean
  digestFrequency: string
  mutedCategories: string[]
  quietHoursStart: string | null
  quietHoursEnd: string | null
}

export interface NotificationFilters {
  type?: string
  read?: boolean
  page?: number
  pageSize?: number
}
