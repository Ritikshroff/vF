import { GiftingStatus } from '@prisma/client'
export { GiftingStatus }

export interface CreateProductInput {
  name: string
  description?: string
  imageUrl?: string
  value: number
  category?: string
  sku?: string
}

export interface UpdateProductInput {
  name?: string
  description?: string
  imageUrl?: string
  value?: number
  category?: string
  sku?: string
  inStock?: boolean
}

export interface CreateGiftingOrderInput {
  productId: string
  influencerId: string
  shippingAddress?: Record<string, string>
  expectedContentDate?: string
  notes?: string
}

export interface UpdateGiftingStatusInput {
  status: GiftingStatus
  trackingNumber?: string
}

export interface ProductSummary {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  value: number
  category: string | null
  sku: string | null
  inStock: boolean
  orderCount: number
}

export interface GiftingOrderSummary {
  id: string
  product: { id: string; name: string; imageUrl: string | null; value: number }
  influencer: { id: string; fullName: string; username: string; avatar: string | null }
  status: GiftingStatus
  trackingNumber: string | null
  expectedContentDate: Date | null
  notes: string | null
  createdAt: Date
}

export interface GiftingDashboard {
  totalProducts: number
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  totalValue: number
}
