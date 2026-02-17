import type { MetadataRoute } from 'next'

const APP_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://viralfluencer.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/brand/',
          '/influencer/',
          '/onboarding/',
          '/feed/',
          '/subscriptions/',
          '/api/',
          '/login/',
          '/sign-up/',
          '/forgot-password/',
          '/verify-email/',
        ],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  }
}
