export default function Select({ label, error, className = '', id, children, ...props }) {
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
      <select
        id={inputId}
        className="w-full appearance-none rounded-xl border border-charcoal/15 bg-white px-4 py-2.5 font-body text-sm text-charcoal outline-none transition-colors focus:border-kraft focus:ring-2 focus:ring-kraft/20"
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
    </div>
  )
}
