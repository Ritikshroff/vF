export interface CreateReportTemplateInput {
  name: string
  sections: string[]
  format?: string
}

export interface GenerateReportInput {
  templateId?: string
  campaignId?: string
  reportType: 'CAMPAIGN' | 'INFLUENCER' | 'PLATFORM' | 'CUSTOM'
  dateRange: { from: string; to: string }
}

export interface ScheduleReportInput {
  templateId: string
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY'
  recipients: string[]
}

export interface ReportTemplateSummary {
  id: string
  name: string
  sections: string[]
  format: string
  createdAt: Date
}

export interface GeneratedReportSummary {
  id: string
  reportType: string
  dateRange: { from: string; to: string }
  data: unknown
  fileUrl: string | null
  generatedAt: Date
}

export interface ScheduledReportSummary {
  id: string
  templateId: string
  frequency: string
  recipients: string[]
  nextRunAt: Date
  isActive: boolean
}
