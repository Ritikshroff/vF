export default function AuthLoading() {
  return (
    <div className="flex items-center justify-center px-4 py-24 sm:py-32">
      <div className="text-center">
        {/* Spinner */}
        <div className="relative w-10 h-10 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full border-2 border-[rgb(var(--border))]" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[rgb(var(--brand-primary))] animate-spin" />
        </div>

        {/* Loading Text */}
        <p className="text-sm text-[rgb(var(--muted))] animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  )
}
