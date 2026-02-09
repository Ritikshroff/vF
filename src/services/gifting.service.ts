import { prisma } from '@/lib/db/prisma'
import { Prisma, GiftingStatus } from '@prisma/client'
import { CreateProductInput, CreateGiftingOrderInput, UpdateGiftingStatusInput } from '@/types/gifting'

export async function listProducts(brandId: string, page = 1, pageSize = 20) {
  const skip = (page - 1) * pageSize
  const [data, total] = await Promise.all([
    prisma.productCatalog.findMany({
      where: { brandId },
      include: { _count: { select: { giftingOrders: true } } },
      skip, take: pageSize, orderBy: { createdAt: 'desc' },
    }),
    prisma.productCatalog.count({ where: { brandId } }),
  ])
  return {
    data: data.map((p) => ({
      id: p.id, name: p.name, description: p.description, imageUrl: p.imageUrl,
      value: Number(p.value), category: p.category, sku: p.sku,
      inStock: p.inStock, orderCount: p._count.giftingOrders,
    })),
    total, page, pageSize, totalPages: Math.ceil(total / pageSize),
  }
}

export async function createProduct(brandId: string, input: CreateProductInput) {
  return prisma.productCatalog.create({
    data: { brandId, name: input.name, description: input.description, imageUrl: input.imageUrl, value: new Prisma.Decimal(input.value), category: input.category, sku: input.sku },
  })
}

export async function updateProduct(productId: string, brandId: string, input: Partial<CreateProductInput>) {
  const product = await prisma.productCatalog.findFirst({ where: { id: productId, brandId } })
  if (!product) throw new Error('Product not found')
  return prisma.productCatalog.update({
    where: { id: productId },
    data: { ...input, value: input.value ? new Prisma.Decimal(input.value) : undefined },
  })
}

export async function createGiftingOrder(brandId: string, input: CreateGiftingOrderInput) {
  return prisma.giftingOrder.create({
    data: {
      brandId, productId: input.productId, influencerId: input.influencerId,
      shippingAddress: input.shippingAddress, expectedContentDate: input.expectedContentDate ? new Date(input.expectedContentDate) : null,
      notes: input.notes,
    },
    include: {
      product: { select: { id: true, name: true, imageUrl: true, value: true } },
      influencer: { select: { id: true, fullName: true, username: true, avatar: true } },
    },
  })
}

export async function updateOrderStatus(orderId: string, brandId: string, input: UpdateGiftingStatusInput) {
  const order = await prisma.giftingOrder.findFirst({ where: { id: orderId, brandId } })
  if (!order) throw new Error('Order not found')
  return prisma.giftingOrder.update({
    where: { id: orderId },
    data: { status: input.status, trackingNumber: input.trackingNumber },
    include: {
      product: { select: { id: true, name: true, imageUrl: true, value: true } },
      influencer: { select: { id: true, fullName: true, username: true, avatar: true } },
    },
  })
}

export async function listGiftingOrders(brandId: string, status?: GiftingStatus, page = 1, pageSize = 20) {
  const skip = (page - 1) * pageSize
  const where: Prisma.GiftingOrderWhereInput = { brandId }
  if (status) where.status = status
  const [data, total] = await Promise.all([
    prisma.giftingOrder.findMany({
      where,
      include: {
        product: { select: { id: true, name: true, imageUrl: true, value: true } },
        influencer: { select: { id: true, fullName: true, username: true, avatar: true } },
      },
      skip, take: pageSize, orderBy: { createdAt: 'desc' },
    }),
    prisma.giftingOrder.count({ where }),
  ])
  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
}

export async function getGiftingDashboard(brandId: string) {
  const [totalProducts, totalOrders, pendingOrders, completedOrders, products] = await Promise.all([
    prisma.productCatalog.count({ where: { brandId } }),
    prisma.giftingOrder.count({ where: { brandId } }),
    prisma.giftingOrder.count({ where: { brandId, status: 'GIFTING_PENDING' } }),
    prisma.giftingOrder.count({ where: { brandId, status: 'GIFTING_COMPLETED' } }),
    prisma.productCatalog.findMany({ where: { brandId }, select: { value: true } }),
  ])
  const totalValue = products.reduce((sum, p) => sum + Number(p.value), 0)
  return { totalProducts, totalOrders, pendingOrders, completedOrders, totalValue }
}
