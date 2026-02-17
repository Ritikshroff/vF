import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'How It Works',
  description:
    'Learn how ViralFluencer connects brands with influencers. From discovery to payment — a seamless collaboration workflow with escrow protection.',
  openGraph: {
    title: 'How It Works | ViralFluencer',
    description: 'Discover, collaborate, and grow. See how ViralFluencer streamlines influencer marketing.',
  },
}

export default function HowItWorksLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
