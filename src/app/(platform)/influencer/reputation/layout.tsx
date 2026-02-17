import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Reputation' }

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
