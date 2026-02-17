import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing Plans',
  description:
    'Choose the perfect ViralFluencer plan for your business. Free, Pro, and Enterprise tiers with transparent pricing for brands and influencers.',
  openGraph: {
    title: 'Pricing Plans | ViralFluencer',
    description: 'Transparent pricing for brands and influencers. Start free, scale as you grow.',
  },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
