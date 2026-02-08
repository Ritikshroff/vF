export interface CreateOutreachTemplateInput {
  name: string
  subject: string
  body: string
  type?: string
}

export interface CreateOutreachCampaignInput {
  templateId: string
  name: string
  influencerIds: string[]
}

export interface OutreachTemplateSummary {
  id: string
  name: string
  subject: string
  body: string
  type: string
  createdAt: Date
}

export interface OutreachCampaignSummary {
  id: string
  name: string
  templateId: string
  status: string
  totalEmails: number
  sentCount: number
  openedCount: number
  repliedCount: number
  createdAt: Date
}

export interface OutreachEmailSummary {
  id: string
  influencerId: string
  email: string
  status: string
  sentAt: Date | null
  openedAt: Date | null
  repliedAt: Date | null
}

export interface OutreachStats {
  totalCampaigns: number
  totalSent: number
  totalOpened: number
  totalReplied: number
  openRate: number
  replyRate: number
}
