import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Get Started',
  description: 'Join ViralFluencer as a brand or influencer. Choose your role and start collaborating today.',
}

export default function RoleSelectorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
