import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Package } from 'lucide-react'
import { api } from '../services/api'
import Loading from '../components/Loading'
import { formatDate, formatINR, statusLabel } from '../utils/format'

const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-violet-100 text-violet-800',
  shipped: 'bg-sky-100 text-sky-800',
  delivered: 'bg-olive/15 text-olive',
  cancelled: 'bg-red-100 text-red-700',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/orders/')
      .then(({ data }) => setOrders(data.results || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loading className="py-32" />

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-3xl font-extrabold tracking-tight">My orders</h1>
      <p className="mt-1 font-body text-sm text-charcoal/60">Track your PACKORA orders.</p>

      {orders.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-charcoal/15 bg-white/60 py-20 text-center">
          <Package className="mx-auto h-10 w-10 text-charcoal/30" />
          <p className="mt-4 font-display text-lg font-semibold text-charcoal/60">No orders yet</p>
          <Link to="/products" className="mt-2 inline-block font-display text-sm font-semibold text-kraft hover:underline">
            Browse the catalogue →
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {orders.map((o) => (
            <li key={o.id} className="rounded-2xl border border-charcoal/8 bg-white p-6 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-display text-lg font-bold">{o.number}</p>
                  <p className="mt-0.5 font-body text-xs text-charcoal/50">
                    Placed {formatDate(o.created_at)} · {o.items.length} item(s)
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-block rounded-full px-3 py-1 font-display text-xs font-bold uppercase tracking-wide ${STATUS_STYLES[o.status] || 'bg-charcoal/10'}`}>
                    {statusLabel(o.status)}
                  </span>
                  <p className="mt-2 font-display text-lg font-extrabold">{formatINR(o.total)}</p>
                </div>
              </div>

              {/* status timeline */}
              <ol className="mt-5 flex flex-wrap items-center gap-y-2">
                {['pending', 'confirmed', 'processing', 'shipped', 'delivered'].map((s, i) => {
                  const reached = ['pending','confirmed','processing','shipped','delivered'].indexOf(o.status) >= i
                  return (
                    <li key={s} className="flex items-center">
                      <span className={`flex h-6 w-6 items-center justify-center rounded-full font-display text-[10px] font-bold ${reached ? 'bg-olive text-white' : 'bg-charcoal/10 text-charcoal/40'}`}>
                        {i + 1}
                      </span>
                      {i < 4 && <ChevronRight className="mx-1 h-3.5 w-3.5 text-charcoal/25" />}
                    </li>
                  )
                })}
                {o.status === 'cancelled' && (
                  <span className="ml-3 font-display text-xs font-bold uppercase text-red-700">Cancelled</span>
                )}
              </ol>

              <div className="mt-4 border-t border-charcoal/8 pt-4">
                {o.items.map((it) => (
                  <p key={it.id} className="font-body text-sm text-charcoal/70">
                    {it.product_name} × {it.quantity}
                    <span className="ml-2 text-charcoal/40">@ {formatINR(it.unit_price)}</span>
                  </p>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
