import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, Paperclip } from 'lucide-react'
import { api } from '../../services/api'
import Loading from '../../components/Loading'
import { formatDate, statusLabel } from '../../utils/format'

const STATUSES = ['new', 'in_review', 'quoted', 'closed']
const STYLES = {
  new: 'bg-blue-100 text-blue-800', in_review: 'bg-amber-100 text-amber-800',
  quoted: 'bg-violet-100 text-violet-800', closed: 'bg-charcoal/10 text-charcoal/60',
}

export default function EnquiriesAdmin() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  const load = () => {
    setLoading(true)
    api.get('/enquiries/', { params: { page_size: 100 } })
      .then(({ data }) => setItems(data.results || []))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const setStatus = async (e, status) => {
    await api.patch(`/enquiries/${e.id}/`, { status })
    setItems((prev) => prev.map((i) => (i.id === e.id ? { ...i, status } : i)))
  }

  if (loading) return <Loading />

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold tracking-tight">Enquiries</h1>
      <p className="mt-1 font-body text-sm text-charcoal/60">{items.length} submissions</p>

      <div className="mt-6 space-y-3">
        {items.map((e) => (
          <div key={e.id} className="rounded-2xl border border-charcoal/8 bg-white shadow-card">
            <button
              onClick={() => setExpanded(expanded === e.id ? null : e.id)}
              className="flex w-full flex-wrap items-center justify-between gap-3 px-5 py-4 text-left"
            >
              <div>
                <p className="font-display font-bold">{e.reference} — {e.subject}</p>
                <p className="font-body text-xs text-charcoal/50">
                  {e.name} · {e.email} · {formatDate(e.created_at)}
                  {e.quantity ? ` · Qty ${e.quantity}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-3 py-1 font-display text-xs font-bold uppercase ${STYLES[e.status]}`}>
                  {statusLabel(e.status)}
                </span>
                {expanded === e.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </button>

            {expanded === e.id && (
              <div className="border-t border-charcoal/8 px-5 py-4">
                <dl className="grid gap-x-8 gap-y-2 font-body text-sm sm:grid-cols-2">
                  {[
                    ['Business', e.company_name], ['Phone', e.phone],
                    ['Category', e.category_name], ['Dimensions', e.dimensions],
                    ['Material', e.material_preference], ['Delivery', e.delivery_location],
                  ].filter(([, v]) => v).map(([k, v]) => (
                    <div key={k} className="flex gap-2">
                      <dt className="w-28 shrink-0 font-semibold text-charcoal/50">{k}</dt>
                      <dd className="text-charcoal/80">{v}</dd>
                    </div>
                  ))}
                </dl>
                {e.printing_requirements && (
                  <p className="mt-3 font-body text-sm"><span className="font-semibold text-charcoal/50">Printing: </span>{e.printing_requirements}</p>
                )}
                <p className="mt-3 whitespace-pre-wrap rounded-xl bg-cream/60 p-4 font-body text-sm text-charcoal/80">{e.message}</p>

                {e.attachments?.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-2 font-display text-xs font-bold uppercase tracking-wider text-charcoal/50">Files</p>
                    <div className="flex flex-wrap gap-2">
                      {e.attachments.map((a) => (
                        <a key={a.id} href={a.file_url || a.file} target="_blank" rel="noreferrer"
                          className="flex items-center gap-2 rounded-lg bg-cream/70 px-3 py-1.5 font-body text-xs font-medium hover:bg-cream">
                          <Paperclip className="h-3.5 w-3.5" /> {a.kind}: {a.original_name || 'file'}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 flex items-center gap-3">
                  <label className="font-body text-sm font-semibold text-charcoal/60">Status:</label>
                  <select
                    value={e.status}
                    onChange={(ev) => setStatus(e, ev.target.value)}
                    className="rounded-lg border border-charcoal/15 bg-white px-3 py-1.5 font-body text-sm"
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
                  </select>
                </div>
              </div>
            )}
          </div>
        ))}
        {!items.length && (
          <div className="rounded-2xl border border-dashed border-charcoal/15 bg-white/60 py-16 text-center font-body text-charcoal/50">
            No enquiries yet.
          </div>
        )}
      </div>
    </div>
  )
}
