export default function PlatformLoading() {
  return (
    <div className="container py-4 sm:py-6 lg:py-8 animate-fade-in">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 lg:mb-8">
        <div>
          <div className="h-7 sm:h-8 w-48 bg-[rgb(var(--surface-elevated))] rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-64 bg-[rgb(var(--surface-elevated))] rounded-md animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-[rgb(var(--surface-elevated))] rounded-xl animate-pulse" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-[rgb(var(--surface-elevated))] rounded-xl border border-[rgb(var(--border))] p-4 sm:p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="h-4 w-24 bg-[rgb(var(--surface-hover))] rounded-md animate-pulse" />
              <div className="h-8 w-8 bg-[rgb(var(--surface-hover))] rounded-lg animate-pulse" />
            </div>
            <div className="h-7 w-20 bg-[rgb(var(--surface-hover))] rounded-md animate-pulse mb-1" />
            <div className="h-3 w-28 bg-[rgb(var(--surface-hover))] rounded-md animate-pulse" />
          </div>
        ))}
      </div>

      {/* Content Cards Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="bg-[rgb(var(--surface-elevated))] rounded-xl border border-[rgb(var(--border))] p-4 sm:p-6"
          >
            <div className="h-5 w-36 bg-[rgb(var(--surface-hover))] rounded-md animate-pulse mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-[rgb(var(--surface-hover))] rounded-lg animate-pulse shrink-0" />
                  <div className="flex-1">
                    <div className="h-4 w-full max-w-[200px] bg-[rgb(var(--surface-hover))] rounded-md animate-pulse mb-1.5" />
                    <div className="h-3 w-full max-w-[140px] bg-[rgb(var(--surface-hover))] rounded-md animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
