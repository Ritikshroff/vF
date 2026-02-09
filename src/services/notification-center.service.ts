import { prisma } from '@/lib/db/prisma'
import { Prisma } from '@prisma/client'
import { CreateAlertRuleInput, UpdatePreferencesInput, NotificationFilters } from '@/types/notifications'

export async function listNotifications(userId: string, filters: NotificationFilters) {
  const { type, read, page = 1, pageSize = 20 } = filters
  const skip = (page - 1) * pageSize
  const where: Prisma.NotificationWhereInput = { userId }
  if (type) where.type = type as any
  if (read !== undefined) where.read = read
  const [data, total] = await Promise.all([
    prisma.notification.findMany({ where, skip, take: pageSize, orderBy: { createdAt: 'desc' } }),
    prisma.notification.count({ where }),
  ])
  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
}

export async function markAsRead(notificationId: string, userId: string) {
  const notification = await prisma.notification.findFirst({ where: { id: notificationId, userId } })
  if (!notification) throw new Error('Notification not found')
  return prisma.notification.update({ where: { id: notificationId }, data: { read: true, readAt: new Date() } })
}

export async function markAllRead(userId: string) {
  await prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true, readAt: new Date() } })
  return { success: true }
}

export async function getUnreadCount(userId: string) {
  const count = await prisma.notification.count({ where: { userId, read: false } })
  return { count }
}

export async function createAlertRule(userId: string, input: CreateAlertRuleInput) {
  return prisma.alertRule.create({
    data: { userId, name: input.name, eventType: input.eventType, conditions: input.conditions as any, channels: input.channels },
  })
}

export async function listAlertRules(userId: string) {
  return prisma.alertRule.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } })
}

export async function updateAlertRule(ruleId: string, userId: string, input: Partial<CreateAlertRuleInput>) {
  const rule = await prisma.alertRule.findFirst({ where: { id: ruleId, userId } })
  if (!rule) throw new Error('Alert rule not found')
  return prisma.alertRule.update({ where: { id: ruleId }, data: input as any })
}

export async function deleteAlertRule(ruleId: string, userId: string) {
  const rule = await prisma.alertRule.findFirst({ where: { id: ruleId, userId } })
  if (!rule) throw new Error('Alert rule not found')
  await prisma.alertRule.delete({ where: { id: ruleId } })
  return { success: true }
}

export async function toggleAlertRule(ruleId: string, userId: string) {
  const rule = await prisma.alertRule.findFirst({ where: { id: ruleId, userId } })
  if (!rule) throw new Error('Alert rule not found')
  return prisma.alertRule.update({ where: { id: ruleId }, data: { isActive: !rule.isActive } })
}

export async function getPreferences(userId: string) {
  const prefs = await prisma.notificationPreference.findUnique({ where: { userId } })
  if (!prefs) {
    return { emailEnabled: true, pushEnabled: true, digestFrequency: 'INSTANT', mutedCategories: [], quietHoursStart: null, quietHoursEnd: null }
  }
  return prefs
}

export async function updatePreferences(userId: string, input: UpdatePreferencesInput) {
  return prisma.notificationPreference.upsert({
    where: { userId },
    create: { userId, ...input },
    update: input,
  })
}
