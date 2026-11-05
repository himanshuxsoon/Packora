import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ClipboardList, FileText, Image as ImageIcon, LayoutDashboard, Package,
  Paperclip, Pencil, Save, User,
} from 'lucide-react'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Button from '../components/Button'
import Input from '../components/forms/Input'
import Loading from '../components/Loading'
import { formatDate, formatINR, statusLabel } from '../utils/format'

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'enquiries', label: 'My enquiries', icon: FileText },
  { id: 'orders', label: 'My orders', icon: Package },
]

const STATUS_STYLES = {
  new: 'bg-blue-100 text-blue-800',
  in_review: 'bg-amber-100 text-amber-800',
  quoted: 'bg-violet-100 text-violet-800',
  closed: 'bg-charcoal/10 text-charcoal/60',
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-violet-100 text-violet-800',
  shipped: 'bg-sky-100 text-sky-800',
  delivered: 'bg-olive/15 text-olive',
  cancelled: 'bg-red-100 text-red-700',
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState('overview')

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Hi, {user?.first_name || user?.username}
        </h1>
        <p className="mt-1 font-body text-sm text-charcoal/60">
          Your PACKORA account dashboard.
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar */}
        <aside className="lg:w-56 lg:shrink-0">
          <nav className="flex gap-1 overflow-x-auto rounded-2xl border border-charcoal/8 bg-white p-2 shadow-card lg:flex-col">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-3 whitespace-nowrap rounded-xl px-4 py-2.5 font-display text-sm font-semibold transition-colors ${
                  tab === id ? 'bg-charcoal text-cream' : 'text-charcoal/70 hover:bg-cream'
                }`}
              >
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {tab === 'overview' && <OverviewTab onNavigate={setTab} />}
          {tab === 'profile' && <ProfileTab />}
          {tab === 'enquiries' && <EnquiriesTab />}
          {tab === 'orders' && <OrdersTab />}
        </div>
      </div>
    </div>
  )
}

/* ── Overview ─────────────────────────────────────────── */
function OverviewTab({ onNavigate }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/enquiries/'),
      api.get('/orders/'),
      api.get('/quotations/'),
    ])
      .then(([enq, ord, quo]) => {
        const orders = ord.data.results || []
        const latestOrder = orders[0]
        setStats({
          enquiries: enq.data.count ?? (enq.data.results || []).length,
          orders: ord.data.count ?? orders.length,
          quotations: quo.data.count ?? (quo.data.results || []).length,
          latestOrder,
          recentEnquiries: (enq.data.results || []).slice(0, 3),
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loading />

  const cards = [
    { label: 'Enquiries', value: stats?.enquiries ?? 0, tab: 'enquiries', icon: FileText },
    { label: 'Orders', value: stats?.orders ?? 0, tab: 'orders', icon: Package },
    { label: 'Quotations', value: stats?.quotations ?? 0, tab: null, icon: ClipboardList },
  ]

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map(({ label, value, tab: target, icon: Icon }) => (
          <button
            key={label}
            onClick={() => target && onNavigate(target)}
            className="rounded-2xl border border-charcoal/8 bg-white p-6 text-left shadow-card transition-shadow hover:shadow-lift"
          >
            <Icon className="h-5 w-5 text-kraft" />
            <p className="mt-3 font-display text-3xl font-extrabold">{value}</p>
            <p className="font-body text-sm text-charcoal/60">{label}</p>
          </button>
        ))}
      </div>

      {stats?.latestOrder && (
        <div className="rounded-2xl border border-charcoal/8 bg-white p-6 shadow-card">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold">Latest order</h3>
            <button onClick={() => onNavigate('orders')} className="font-display text-xs font-bold text-kraft hover:underline">
              View all →
            </button>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-display font-bold">{stats.latestOrder.number}</p>
              <p className="font-body text-sm text-charcoal/60">{formatDate(stats.latestOrder.created_at)}</p>
            </div>
            <div className="text-right">
              <span className={`rounded-full px-3 py-1 font-display text-xs font-bold uppercase ${STATUS_STYLES[stats.latestOrder.status]}`}>
                {statusLabel(stats.latestOrder.status)}
              </span>
              <p className="mt-1 font-display font-extrabold">{formatINR(stats.latestOrder.total)}</p>
            </div>
          </div>
        </div>
      )}

      {stats?.recentEnquiries?.length > 0 && (
        <div className="rounded-2xl border border-charcoal/8 bg-white p-6 shadow-card">
          <h3 className="font-display text-base font-bold">Recent enquiries</h3>
          <ul className="mt-4 divide-y divide-charcoal/8">
            {stats.recentEnquiries.map((e) => (
              <li key={e.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-display text-sm font-semibold">{e.reference}</p>
                  <p className="font-body text-xs text-charcoal/50">{e.subject}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 font-display text-[11px] font-bold uppercase ${STATUS_STYLES[e.status]}`}>
                  {statusLabel(e.status)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Link
        to="/enquire"
        className="flex items-center justify-between rounded-2xl bg-charcoal p-6 text-cream transition-colors hover:bg-charcoal/90"
      >
        <div>
          <p className="font-display font-bold">Need custom packaging?</p>
          <p className="font-body text-sm text-cream/60">Start a new enquiry — takes 2 minutes.</p>
        </div>
        <span className="font-display text-2xl">→</span>
      </Link>
    </div>
  )
}

/* ── Profile ──────────────────────────────────────────── */
function ProfileTab() {
  const { user, setUser } = useAuth()
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })
  const [biz, setBiz] = useState({
    company_name: user?.profile?.company_name || '',
    address: user?.profile?.address || '',
    city: user?.profile?.city || '',
    state: user?.profile?.state || '',
    postal_code: user?.profile?.postal_code || '',
    country: user?.profile?.country || '',
    gst_number: user?.profile?.gst_number || '',
  })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMsg('')
    try {
      await api.patch('/auth/profile/', biz)
      const { data } = await api.patch('/auth/me/', {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone,
      })
      setUser(data)
      localStorage.setItem('packora_user', JSON.stringify(data))
      setMsg('Profile updated.')
    } catch {
      setMsg('Could not save — please check the fields.')
    } finally {
      setSaving(false)
    }
  }

  const fset = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const bset = (k) => (e) => setBiz((f) => ({ ...f, [k]: e.target.value }))

  return (
    <form onSubmit={save} className="max-w-2xl space-y-8">
      <section className="rounded-2xl border border-charcoal/8 bg-white p-6 shadow-card">
        <h3 className="mb-5 flex items-center gap-2 font-display text-base font-bold">
          <User className="h-4 w-4 text-kraft" /> Personal details
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="First name" value={form.first_name} onChange={fset('first_name')} />
          <Input label="Last name" value={form.last_name} onChange={fset('last_name')} />
          <Input label="Email" type="email" value={form.email} onChange={fset('email')} />
          <Input label="Phone" value={form.phone} onChange={fset('phone')} />
        </div>
        <p className="mt-3 font-body text-xs text-charcoal/45">
          Username: <span className="font-semibold">{user?.username}</span> · Role: {user?.role}
        </p>
      </section>

      <section className="rounded-2xl border border-charcoal/8 bg-white p-6 shadow-card">
        <h3 className="mb-5 flex items-center gap-2 font-display text-base font-bold">
          <Pencil className="h-4 w-4 text-kraft" /> Business profile
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Company name" value={biz.company_name} onChange={bset('company_name')} />
          <Input label="GST number" value={biz.gst_number} onChange={bset('gst_number')} />
          <Input label="Address" value={biz.address} onChange={bset('address')} className="sm:col-span-2" />
          <Input label="City" value={biz.city} onChange={bset('city')} />
          <Input label="State" value={biz.state} onChange={bset('state')} />
          <Input label="Postal code" value={biz.postal_code} onChange={bset('postal_code')} />
          <Input label="Country" value={biz.country} onChange={bset('country')} />
        </div>
      </section>

      <div className="flex items-center gap-4">
        <Button type="submit" loading={saving}><Save className="h-4 w-4" /> Save changes</Button>
        {msg && <p className="font-body text-sm text-olive">{msg}</p>}
      </div>
    </form>
  )
}

/* ── Enquiries ────────────────────────────────────────── */
function EnquiriesTab() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/enquiries/')
      .then(({ data }) => setItems(data.results || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loading />

  if (!items.length) {
    return (
      <EmptyState
        title="No enquiries yet"
        text="Your packaging enquiries will appear here with live status updates."
        cta={{ to: '/enquire', label: 'New enquiry' }}
      />
    )
  }

  return (
    <ul className="space-y-4">
      {items.map((e) => (
        <li key={e.id} className="rounded-2xl border border-charcoal/8 bg-white p-6 shadow-card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-display font-bold">{e.reference}</p>
              <p className="font-body text-sm text-charcoal/60">{e.subject}</p>
              <p className="mt-1 font-body text-xs text-charcoal/40">
                {formatDate(e.created_at)}
                {e.category_name ? ` · ${e.category_name}` : ''}
                {e.quantity ? ` · Qty ${e.quantity}` : ''}
              </p>
            </div>
            <span className={`rounded-full px-3 py-1 font-display text-xs font-bold uppercase ${STATUS_STYLES[e.status]}`}>
              {statusLabel(e.status)}
            </span>
          </div>

          {/* Uploaded files (logo / reference) */}
          {e.attachments?.length > 0 && (
            <div className="mt-4 border-t border-charcoal/8 pt-4">
              <p className="mb-2 font-display text-xs font-bold uppercase tracking-wider text-charcoal/50">
                Uploaded files
              </p>
              <div className="flex flex-wrap gap-2">
                {e.attachments.map((a) => (
                  <a
                    key={a.id}
                    href={a.file_url || a.file}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-lg bg-cream/70 px-3 py-1.5 font-body text-xs font-medium text-charcoal/80 hover:bg-cream"
                  >
                    {a.kind === 'logo' ? <ImageIcon className="h-3.5 w-3.5" /> : <Paperclip className="h-3.5 w-3.5" />}
                    {a.original_name || 'file'}
                  </a>
                ))}
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}

/* ── Orders ───────────────────────────────────────────── */
function OrdersTab() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/orders/')
      .then(({ data }) => setOrders(data.results || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loading />

  if (!orders.length) {
    return (
      <EmptyState
        title="No orders yet"
        text="Once a quotation is accepted, your order will appear here with live tracking."
        cta={{ to: '/products', label: 'Browse products' }}
      />
    )
  }

  return (
    <ul className="space-y-4">
      {orders.map((o) => (
        <li key={o.id} className="rounded-2xl border border-charcoal/8 bg-white p-6 shadow-card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-display font-bold">{o.number}</p>
              <p className="font-body text-sm text-charcoal/60">
                {formatDate(o.created_at)} · {o.items.length} item(s)
              </p>
            </div>
            <div className="text-right">
              <span className={`rounded-full px-3 py-1 font-display text-xs font-bold uppercase ${STATUS_STYLES[o.status]}`}>
                {statusLabel(o.status)}
              </span>
              <p className="mt-1 font-display font-extrabold">{formatINR(o.total)}</p>
            </div>
          </div>
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
  )
}

function EmptyState({ title, text, cta }) {
  return (
    <div className="rounded-2xl border border-dashed border-charcoal/15 bg-white/60 py-16 text-center">
      <p className="font-display text-lg font-semibold text-charcoal/60">{title}</p>
      <p className="mx-auto mt-1 max-w-sm font-body text-sm text-charcoal/45">{text}</p>
      {cta && (
        <Link
          to={cta.to}
          className="mt-5 inline-block rounded-full bg-charcoal px-5 py-2.5 font-display text-sm font-semibold text-cream hover:bg-charcoal/90"
        >
          {cta.label}
        </Link>
      )}
    </div>
  )
}
