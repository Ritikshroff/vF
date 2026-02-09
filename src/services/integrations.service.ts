import { prisma } from '@/lib/db/prisma'
import { ConnectAppInput, CreateWebhookInput, CreateAPIKeyInput } from '@/types/integrations'
import crypto from 'crypto'

export async function connectApp(userId: string, input: ConnectAppInput) {
  return prisma.connectedApp.create({
    data: { userId, appName: input.appName, accessToken: input.accessToken, refreshToken: input.refreshToken, config: input.config },
  })
}

export async function listConnectedApps(userId: string) {
  return prisma.connectedApp.findMany({
    where: { userId },
    select: { id: true, appName: true, isActive: true, config: true, connectedAt: true },
    orderBy: { connectedAt: 'desc' },
  })
}

export async function disconnectApp(appId: string, userId: string) {
  const app = await prisma.connectedApp.findFirst({ where: { id: appId, userId } })
  if (!app) throw new Error('App not found')
  await prisma.connectedApp.delete({ where: { id: appId } })
  return { success: true }
}

export async function createWebhook(userId: string, input: CreateWebhookInput) {
  return prisma.webhook.create({
    data: { userId, url: input.url, events: input.events, secret: input.secret },
  })
}

export async function listWebhooks(userId: string) {
  return prisma.webhook.findMany({
    where: { userId },
    select: { id: true, url: true, events: true, isActive: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })
}

export async function deleteWebhook(webhookId: string, userId: string) {
  const webhook = await prisma.webhook.findFirst({ where: { id: webhookId, userId } })
  if (!webhook) throw new Error('Webhook not found')
  await prisma.webhook.delete({ where: { id: webhookId } })
  return { success: true }
}

export async function getWebhookDeliveries(webhookId: string, userId: string, page = 1, pageSize = 20) {
  const webhook = await prisma.webhook.findFirst({ where: { id: webhookId, userId } })
  if (!webhook) throw new Error('Webhook not found')
  const skip = (page - 1) * pageSize
  const [data, total] = await Promise.all([
    prisma.webhookDelivery.findMany({ where: { webhookId }, skip, take: pageSize, orderBy: { deliveredAt: 'desc' } }),
    prisma.webhookDelivery.count({ where: { webhookId } }),
  ])
  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
}

export async function createAPIKey(userId: string, input: CreateAPIKeyInput) {
  const rawKey = `vf_${crypto.randomUUID().replace(/-/g, '')}`
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex')
  const prefix = rawKey.substring(0, 10)
  const apiKey = await prisma.aPIKey.create({
    data: {
      userId, name: input.name, keyHash, prefix, scopes: input.scopes,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
    },
  })
  // Return the raw key only once
  return { ...apiKey, rawKey }
}

export async function listAPIKeys(userId: string) {
  return prisma.aPIKey.findMany({
    where: { userId },
    select: { id: true, name: true, prefix: true, scopes: true, lastUsedAt: true, expiresAt: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })
}

export async function deleteAPIKey(keyId: string, userId: string) {
  const key = await prisma.aPIKey.findFirst({ where: { id: keyId, userId } })
  if (!key) throw new Error('API key not found')
  await prisma.aPIKey.delete({ where: { id: keyId } })
  return { success: true }
}
