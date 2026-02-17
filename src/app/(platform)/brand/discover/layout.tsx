import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Discover Influencers' }

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
