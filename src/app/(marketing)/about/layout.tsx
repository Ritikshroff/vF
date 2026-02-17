import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'ViralFluencer is the premier influencer marketing platform connecting brands with creators. Learn about our mission, team, and vision.',
  openGraph: {
    title: 'About Us | ViralFluencer',
    description: 'Our mission is to make influencer marketing transparent, secure, and effective for everyone.',
  },
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
