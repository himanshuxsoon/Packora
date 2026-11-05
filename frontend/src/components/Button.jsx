import { Loader2 } from 'lucide-react'

const VARIANTS = {
  primary: 'bg-charcoal text-cream hover:bg-charcoal/90',
  kraft: 'bg-kraft text-white hover:bg-kraft/90',
  outline: 'border border-charcoal/20 bg-transparent text-charcoal hover:border-charcoal/50 hover:bg-cream',
  ghost: 'bg-transparent text-charcoal hover:bg-charcoal/5',
  danger: 'bg-red-700 text-white hover:bg-red-800',
}

const SIZES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  children,
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full font-display font-semibold tracking-tight transition-all duration-200 ease-out-expo active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
}
