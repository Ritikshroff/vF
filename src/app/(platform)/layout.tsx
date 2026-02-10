import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header variant="platform" />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 bg-[rgb(var(--surface))] overflow-x-hidden pb-18 lg:pb-0">
          {children}
        </main>
      </div>
      <MobileBottomNav />
    </div>
  )
}
