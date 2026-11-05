import { Inbox } from 'lucide-react'
import { statusLabel } from '../../utils/format'

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-charcoal">{title}</h1>
        {subtitle && <p className="mt-1 font-body text-sm text-charcoal/60">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

const PILL = {
  // enquiries
  new: 'bg-sky-100 text-sky-800',
  in_review: 'bg-amber-100 text-amber-800',
  quoted: 'bg-violet-100 text-violet-800',
  closed: 'bg-charcoal/10 text-charcoal/60',
  // quotations
  draft: 'bg-charcoal/10 text-charcoal/60',
  sent: 'bg-blue-100 text-blue-800',
  accepted: 'bg-olive/15 text-olive',
  rejected: 'bg-red-100 text-red-700',
  expired: 'bg-amber-100 text-amber-800',
  // orders
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-violet-100 text-violet-800',
  shipped: 'bg-cyan-100 text-cyan-800',
  delivered: 'bg-olive/15 text-olive',
  cancelled: 'bg-red-100 text-red-700',
}

export function StatusPill({ status }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 font-display text-[11px] font-bold uppercase tracking-wide ${PILL[status] || 'bg-charcoal/10 text-charcoal/60'}`}>
      {statusLabel(status)}
    </span>
  )
}

export function Card({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-charcoal/8 bg-white shadow-card ${className}`}>
      {children}
    </div>
  )
}

export function EmptyState({ title = 'Nothing here yet', hint, action }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-charcoal/15 bg-white/60 px-6 py-14 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-cream text-olive">
        <Inbox className="h-6 w-6" strokeWidth={1.5} />
      </div>
      <p className="font-display text-base font-bold text-charcoal/70">{title}</p>
      {hint && <p className="mt-1 max-w-sm font-body text-sm text-charcoal/45">{hint}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
