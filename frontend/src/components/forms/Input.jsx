export default function Input({ label, error, className = '', id, ...props }) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block font-display text-sm font-semibold text-charcoal"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className="w-full rounded-xl border border-charcoal/15 bg-white px-4 py-2.5 font-body text-sm text-charcoal placeholder:text-charcoal/40 outline-none transition-colors focus:border-kraft focus:ring-2 focus:ring-kraft/20"
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
    </div>
  )
}
