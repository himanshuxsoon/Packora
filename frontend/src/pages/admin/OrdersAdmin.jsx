import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import Loading from '../../components/Loading'
import { formatDate, formatINR, statusLabel } from '../../utils/format'

const FLOW = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']
const NEXT = { pending: 'confirmed', confirmed: 'processing', processing: 'shipped', shipped: 'delivered' }
const STYLES = {
  pending: 'bg-amber-100 text-amber-800', confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-violet-100 text-violet-800', shipped: 'bg-sky-100 text-sky-800',
  delivered: 'bg-olive/15 text-olive', cancelled: 'bg-red-100 text-red-700',
}

export default function OrdersAdmin() {
  const [orders, setOrders] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [filter, setFilter] = useState('')

  const load = () => {
    setLoading(true)
    Promise.all([
      api.get('/orders/', { params: { page_size: 100, ...(filter ? { status: filter } : {}) } }),
      api.get('/suppliers/', { params: { page_size: 100 } }),
    ]).then(([o, s]) => {
      setOrders(o.data.results || [])
      setSuppliers(s.data.results || s.data)
    }).finally(() => setLoading(false))
  }
  useEffect(load, [filter])

  const advance = async (o) => {
    const next = NEXT[o.status]
    if (!next) return
    const note = window.prompt(`Move ${o.number} to "${statusLabel(next)}"? Note (optional):`, '')
    if (note === null) return
    await api.post(`/orders/${o.id}/update-status/`, { status: next, note })
    load()
  }

  const cancel = async (o) => {
    if (!window.confirm(`Cancel ${o.number}?`)) return
    await api.post(`/orders/${o.id}/update-status/`, { status: 'cancelled', note: 'Cancelled by admin' })
    load()
  }

  const assignSupplier = async (o, supplierId) => {
    await api.post(`/orders/${o.id}/assign-supplier/`, { supplier: supplierId || null })
    load()
  }

  if (loading) return <Loading />

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight">Orders</h1>
          <p className="mt-1 font-body text-sm text-charcoal/60">{orders.length} orders</p>
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-lg border border-charcoal/15 bg-white px-3 py-2 font-body text-sm">
          <option value="">All statuses</option>
          {FLOW.concat('cancelled').map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
        </select>
      </div>

      <div className="mt-6 space-y-3">
        {orders.map((o) => (
          <div key={o.id} className="rounded-2xl border border-charcoal/8 bg-white shadow-card">
            <button onClick={() => setExpanded(expanded === o.id ? null : o.id)} className="flex w-full flex-wrap items-center justify-between gap-3 px-5 py-4 text-left">
              <div>
                <p className="font-display font-bold">{o.number}</p>
                <p className="font-body text-xs text-charcoal/50">{o.customer_username} · {formatDate(o.created_at)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-display font-extrabold">{formatINR(o.total)}</span>
                <span className={`rounded-full px-3 py-1 font-display text-xs font-bold uppercase ${STYLES[o.status]}`}>{statusLabel(o.status)}</span>
              </div>
            </button>

            {expanded === o.id && (
              <div className="border-t border-charcoal/8 px-5 py-4">
                {/* items */}
                <table className="w-full text-left text-sm">
                  <tbody className="divide-y divide-charcoal/6">
                    {o.items.map((it) => (
                      <tr key={it.id}>
                        <td className="py-2">{it.product_name}</td>
                        <td>× {it.quantity}</td>
                        <td className="text-right">{formatINR(it.line_total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-2 font-body text-sm text-charcoal/60">
                  Ship to: {o.shipping_address}, {o.shipping_city} {o.shipping_postal_code}
                </p>

                {/* status history */}
                <div className="mt-4">
                  <p className="mb-2 font-display text-xs font-bold uppercase tracking-wider text-charcoal/50">Tracking</p>
                  <ol className="space-y-1.5">
                    {(o.status_history || []).map((h) => (
                      <li key={h.status + h.created_at} className="flex items-center gap-3 font-body text-sm">
                        <span className={`h-2 w-2 rounded-full ${FLOW.indexOf(h.status) >= 0 ? 'bg-olive' : 'bg-charcoal/30'}`} />
                        <span className="font-semibold capitalize">{statusLabel(h.status)}</span>
                        <span className="text-charcoal/50">{h.note}</span>
                        <span className="ml-auto text-xs text-charcoal/40">{h.changed_by} · {formatDate(h.created_at)}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* actions */}
                <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-charcoal/8 pt-4">
                  {NEXT[o.status] && (
                    <button onClick={() => advance(o)} className="rounded-full bg-charcoal px-4 py-2 font-display text-sm font-semibold text-cream hover:bg-charcoal/90">
                      → {statusLabel(NEXT[o.status])}
                    </button>
                  )}
                  {o.status !== 'cancelled' && o.status !== 'delivered' && (
                    <button onClick={() => cancel(o)} className="rounded-full border border-red-200 px-4 py-2 font-display text-sm font-semibold text-red-700 hover:bg-red-50">
                      Cancel order
                    </button>
                  )}
                  <div className="ml-auto flex items-center gap-2">
                    <label className="font-body text-sm font-semibold text-charcoal/60">Supplier:</label>
                    <select
                      value={o.supplier || ''}
                      onChange={(e) => assignSupplier(o, e.target.value)}
                      className="rounded-lg border border-charcoal/15 bg-white px-3 py-1.5 font-body text-sm"
                    >
                      <option value="">Unassigned</option>
                      {suppliers.map((s) => <option key={s.id} value={s.id}>{s.company_name}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        {!orders.length && <div className="rounded-2xl border border-dashed border-charcoal/15 bg-white/60 py-16 text-center font-body text-charcoal/50">No orders.</div>}
      </div>
    </div>
  )
}
