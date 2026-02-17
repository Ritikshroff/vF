export default function MarketingLoading() {
  return (
    <div className="animate-pulse">
      {/* Hero skeleton */}
      <div className="py-16 sm:py-24">
        <div className="container text-center">
          <div className="h-10 bg-[rgb(var(--surface))] rounded-lg w-2/3 mx-auto mb-4" />
          <div className="h-6 bg-[rgb(var(--surface))] rounded w-1/2 mx-auto mb-8" />
          <div className="flex justify-center gap-4">
            <div className="h-12 w-36 bg-[rgb(var(--surface))] rounded-lg" />
            <div className="h-12 w-36 bg-[rgb(var(--surface))] rounded-lg" />
          </div>
        </div>
      </div>

      {/* Content sections skeleton */}
      <div className="container py-12 space-y-8">
        <div className="grid md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-[rgb(var(--surface))] rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
