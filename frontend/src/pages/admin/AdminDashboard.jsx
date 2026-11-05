import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, Banknote, FileText, MessageSquareQuote, Package,
  ShoppingCart, TrendingUp, Users,
} from 'lucide-react'
import { api } from '../../services/api'
import Loading from '../../components/Loading'
import { formatINR, statusLabel } from '../../utils/format'

const KPI = [
  { key: 'enquiries', label: 'Total enquiries', icon: MessageSquareQuote, tint: 'bg-sky-50 text-sky-700' },
  { key: 'new_enquiries', label: 'New enquiries', icon: FileText, tint: 'bg-amber-50 text-amber-700' },
  { key: 'confirmed', label: 'Confirmed orders', icon: ShoppingCart, tint: 'bg-blue-50 text-blue-700' },
  { key: 'customers', label: 'Customers', icon: Users, tint: 'bg-violet-50 text-violet-700' },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/stats/')
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loading />
  if (!stats) return <p className="text-charcoal/60">Could not load stats.</p>

  const kpiValues = {
    enquiries: stats.enquiries.total,
    new_enquiries: stats.enquiries.new,
    confirmed: stats.orders.by_status?.confirmed ?? 0,
    customers: stats.customers,
  }
  const orderStatuses = Object.entries(stats.orders.by_status || {})
  const maxOrder = Math.max(1, ...orderStatuses.map(([, c]) => c))

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-charcoal">Overview</h1>
          <p className="mt-1 font-body text-sm text-charcoal/60">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Link
          to="/admin/enquiries"
          className="inline-flex items-center gap-2 rounded-full bg-charcoal px-4 py-2 font-display text-sm font-semibold text-cream hover:bg-charcoal/90"
        >
          Review enquiries <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPI.map(({ key, label, icon: Icon, tint }) => (
          <div key={key} className="group rounded-2xl border border-charcoal/8 bg-white p-5 shadow-card transition-shadow hover:shadow-lift">
            <div className="flex items-center justify-between">
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tint}`}>
                <Icon className="h-5 w-5" />
              </span>
              <TrendingUp className="h-4 w-4 text-charcoal/20 transition-colors group-hover:text-kraft" />
            </div>
            <p className="mt-4 font-display text-3xl font-extrabold text-charcoal">{kpiValues[key]}</p>
            <p className="mt-0.5 font-body text-xs font-semibold uppercase tracking-wider text-charcoal/50">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Revenue hero card */}
        <div className="relative overflow-hidden rounded-2xl bg-charcoal p-6 text-cream shadow-card lg:col-span-2">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-kraft/20 blur-2xl" />
          <div className="flex items-center gap-2">
            <Banknote className="h-4 w-4 text-kraft" />
            <p className="font-display text-xs font-bold uppercase tracking-widest text-kraft">Revenue</p>
          </div>
          <p className="mt-3 font-display text-4xl font-extrabold">{formatINR(stats.orders.revenue)}</p>
          <p className="mt-1 font-body text-sm text-cream/60">from {stats.orders.total} order(s), excl. cancelled</p>
          <div className="mt-5 flex gap-6 border-t border-cream/10 pt-4">
            <div>
              <p className="font-display text-xl font-extrabold text-kraft">{stats.products.active}</p>
              <p className="font-body text-[11px] text-cream/50">active products</p>
            </div>
            <div>
              <p className="font-display text-xl font-extrabold text-kraft">{stats.suppliers.active}</p>
              <p className="font-body text-[11px] text-cream/50">active suppliers</p>
            </div>
          </div>
        </div>

        {/* Orders by status */}
        <div className="rounded-2xl border border-charcoal/8 bg-white p-6 shadow-card lg:col-span-3">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-base font-bold">Orders by status</h2>
            <Package className="h-4 w-4 text-charcoal/30" />
          </div>
          {orderStatuses.length ? (
            <div className="space-y-3.5">
              {orderStatuses.map(([s, c]) => (
                <div key={s}>
                  <div className="mb-1 flex items-center justify-between font-body text-sm">
                    <span className="font-medium capitalize text-charcoal/70">{statusLabel(s)}</span>
                    <span className="font-display font-bold text-charcoal">{c}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-cream">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-olive to-kraft transition-all"
                      style={{ width: `${(c / maxOrder) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center font-body text-sm text-charcoal/40">No orders yet.</p>
          )}
        </div>
      </div>

      {/* Quotations snapshot */}
      <div className="rounded-2xl border border-charcoal/8 bg-white p-6 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-bold">Quotations</h2>
          <Link to="/admin/quotations" className="font-display text-xs font-bold text-kraft hover:underline">
            Manage →
          </Link>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          {Object.entries(stats.quotations.by_status || {}).length ? (
            Object.entries(stats.quotations.by_status).map(([s, c]) => (
              <div key={s} className="flex items-center gap-2 rounded-xl bg-cream/70 px-4 py-2.5">
                <span className="font-body text-sm capitalize text-charcoal/70">{statusLabel(s)}</span>
                <span className="font-display text-lg font-extrabold">{c}</span>
              </div>
            ))
          ) : (
            <p className="font-body text-sm text-charcoal/40">No quotations yet — create one from an enquiry.</p>
          )}
        </div>
      </div>
    </div>
  )
}
