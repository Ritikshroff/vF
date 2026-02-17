export default function OnboardingLoading() {
  return (
    <div className="container max-w-2xl py-12 animate-pulse">
      {/* Progress bar skeleton */}
      <div className="h-2 bg-[rgb(var(--surface))] rounded-full mb-8" />

      {/* Form card skeleton */}
      <div className="bg-[rgb(var(--surface))] rounded-xl p-8 space-y-6">
        <div className="h-8 bg-[rgb(var(--surface-hover))] rounded w-1/3" />
        <div className="h-4 bg-[rgb(var(--surface-hover))] rounded w-2/3" />
        <div className="space-y-4 pt-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-[rgb(var(--surface-hover))] rounded-lg" />
          ))}
        </div>
        <div className="h-12 bg-[rgb(var(--surface-hover))] rounded-lg w-full" />
      </div>
    </div>
  )
}
