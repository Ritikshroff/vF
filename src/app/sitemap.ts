import type { MetadataRoute } from 'next'

const APP_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://viralfluencer.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  // Static marketing pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: APP_URL, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${APP_URL}/pricing`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${APP_URL}/how-it-works`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${APP_URL}/for-brands`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${APP_URL}/for-influencers`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${APP_URL}/case-studies`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${APP_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${APP_URL}/marketplace`, lastModified: now, changeFrequency: 'daily', priority: 0.7 },
  ]

  return staticPages
}
