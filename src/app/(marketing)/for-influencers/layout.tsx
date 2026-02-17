import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'For Influencers',
  description:
    'Grow your creator career with ViralFluencer. Find brand collaborations, get paid securely with escrow, build your reputation, and track your analytics.',
  openGraph: {
    title: 'For Influencers | ViralFluencer',
    description: 'Find brand deals, get paid securely, and grow your creator career.',
  },
}

export default function ForInfluencersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
