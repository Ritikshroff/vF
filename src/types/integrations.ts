export interface ConnectAppInput {
  appName: string
  accessToken: string
  refreshToken?: string
  config?: Record<string, unknown>
}

export interface CreateWebhookInput {
  url: string
  events: string[]
  secret: string
}

export interface CreateAPIKeyInput {
  name: string
  scopes: string[]
  expiresAt?: string
}

export interface ConnectedAppSummary {
  id: string
  appName: string
  isActive: boolean
  config: unknown
  connectedAt: Date
}

export interface WebhookSummary {
  id: string
  url: string
  events: string[]
  isActive: boolean
  createdAt: Date
}

export interface WebhookDeliverySummary {
  id: string
  event: string
  statusCode: number | null
  response: string | null
  deliveredAt: Date
}

export interface APIKeySummary {
  id: string
  name: string
  prefix: string
  scopes: string[]
  lastUsedAt: Date | null
  expiresAt: Date | null
  createdAt: Date
}
