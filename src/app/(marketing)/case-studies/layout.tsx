import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Case Studies',
  description:
    'See how brands and influencers achieve real results with ViralFluencer. Success stories, ROI metrics, and campaign breakdowns.',
  openGraph: {
    title: 'Case Studies | ViralFluencer',
    description: 'Real success stories from brands and influencers using ViralFluencer.',
  },
}

export default function CaseStudiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
