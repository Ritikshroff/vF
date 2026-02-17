import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'For Brands',
  description:
    'Scale your influencer marketing with ViralFluencer. AI-powered matching, campaign management, escrow payments, and detailed analytics for brands.',
  openGraph: {
    title: 'For Brands | ViralFluencer',
    description: 'AI-powered influencer discovery, campaign management, and secure payments for brands.',
  },
}

export default function ForBrandsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
