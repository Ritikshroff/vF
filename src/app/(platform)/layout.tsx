import { Header } from '@/components/layout/header'

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header variant="platform" />
      <main className="flex-1 bg-[rgb(var(--surface))]">{children}</main>
    </div>
  )
}
