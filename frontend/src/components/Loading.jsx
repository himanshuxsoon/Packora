export default function Loading({ label = 'Loading…', className = '' }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-16 text-olive ${className}`}
      role="status"
    >
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-olive/20 border-t-kraft" />
      <p className="font-body text-sm">{label}</p>
    </div>
  )
}
