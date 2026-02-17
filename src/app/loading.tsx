export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-[rgb(var(--background))] flex flex-col items-center justify-center">
      {/* Spinner */}
      <div className="relative w-12 h-12 mb-4">
        <div className="absolute inset-0 rounded-full border-2 border-[rgb(var(--border))]" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[rgb(var(--brand-primary))] animate-spin" />
      </div>

      {/* Loading Text */}
      <p className="text-sm text-[rgb(var(--muted))] animate-pulse">
        Loading...
      </p>
    </div>
  )
}
