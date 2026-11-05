import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import Loading from '../../components/Loading'
import { formatDate, formatINR, statusLabel } from '../../utils/format'

const STATUSES = ['draft', 'sent', 'accepted', 'rejected', 'expired']
const STYLES = {
  draft: 'bg-charcoal/10 text-charcoal/60', sent: 'bg-blue-100 text-blue-800',
  accepted: 'bg-olive/15 text-olive', rejected: 'bg-red-100 text-red-700',
  expired: 'bg-amber-100 text-amber-800',
}

export default function QuotationsAdmin() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  const load = () => {
    setLoading(true)
    api.get('/quotations/', { params: { page_size: 100 } })
      .then(({ data }) => setItems(data.results || []))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const setStatus = async (q, status) => {
    await api.patch(`/quotations/${q.id}/`, { status })
    load()
  }

  if (loading) return <Loading />

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold tracking-tight">Quotations</h1>
      <p className="mt-1 font-body text-sm text-charcoal/60">{items.length} quotes</p>

      <div className="mt-6 space-y-3">
        {items.map((q) => (
          <div key={q.id} className="rounded-2xl border border-charcoal/8 bg-white shadow-card">
            <button onClick={() => setExpanded(expanded === q.id ? null : q.id)} className="flex w-full flex-wrap items-center justify-between gap-3 px-5 py-4 text-left">
              <div>
                <p className="font-display font-bold">{q.number}</p>
                <p className="font-body text-xs text-charcoal/50">
                  {q.customer_username} · {formatDate(q.created_at)}
                  {q.valid_until ? ` · valid till ${formatDate(q.valid_until)}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-display font-extrabold">{formatINR(q.total)}</span>
                <span className={`rounded-full px-3 py-1 font-display text-xs font-bold uppercase ${STYLES[q.status]}`}>{statusLabel(q.status)}</span>
              </div>
            </button>
            {expanded === q.id && (
              <div className="border-t border-charcoal/8 px-5 py-4">
                <table className="w-full text-left text-sm">
                  <thead className="font-display text-xs uppercase tracking-wider text-charcoal/40">
                    <tr><th className="py-1">Item</th><th>Qty</th><th>Unit price</th><th className="text-right">Total</th></tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal/6">
                    {q.items.map((it) => (
                      <tr key={it.id}>
                        <td className="py-2">{it.description}</td>
                        <td>{it.quantity} {it.unit}</td>
                        <td>{formatINR(it.unit_price)}</td>
                        <td className="text-right font-semibold">{formatINR(it.line_total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-4 flex items-center gap-3">
                  <label className="font-body text-sm font-semibold text-charcoal/60">Status:</label>
                  <select value={q.status} onChange={(e) => setStatus(q, e.target.value)} className="rounded-lg border border-charcoal/15 bg-white px-3 py-1.5 font-body text-sm">
                    {STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
                  </select>
                </div>
              </div>
            )}
          </div>
        ))}
        {!items.length && <div className="rounded-2xl border border-dashed border-charcoal/15 bg-white/60 py-16 text-center font-body text-charcoal/50">No quotations yet.</div>}
      </div>
    </div>
  )
}
