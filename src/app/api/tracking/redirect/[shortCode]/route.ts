import { NextRequest, NextResponse } from 'next/server'
import { errorHandler } from '@/middleware/error.middleware'
import { recordClick } from '@/services/tracking.service'
import crypto from 'crypto'

export async function GET(request: NextRequest, context: { params: Promise<any> }) {
  try {
    const { shortCode } = await context.params
    const ipHash = crypto.createHash('sha256').update(request.headers.get('x-forwarded-for') || 'unknown').digest('hex')
    const result = await recordClick(shortCode, {
      ipHash,
      userAgent: request.headers.get('user-agent') || undefined,
      referrer: request.headers.get('referer') || undefined,
    })
    return NextResponse.redirect(result.originalUrl)
  } catch (error) {
    return errorHandler(error)
  }
}
