import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, BarChart3, FileText, FolderTree, LogOut, MessageSquareQuote,
  Package, ShieldCheck, ShoppingCart, Truck,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { to: '/admin', label: 'Overview', icon: BarChart3, end: true },
  { to: '/admin/enquiries', label: 'Enquiries', icon: MessageSquareQuote, badge: 'action' },
  { to: '/admin/quotations', label: 'Quotations', icon: FileText },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: FolderTree },
  { to: '/admin/suppliers', label: 'Suppliers', icon: Truck },
]

const GROUPS = [
  { title: 'WORKSPACE', items: ['Overview', 'Enquiries', 'Quotations', 'Orders'] },
  { title: 'CATALOG', items: ['Products', 'Categories'] },
  { title: 'OPERATIONS', items: ['Suppliers'] },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="flex min-h-screen bg-ivory">
      {/* ── Sidebar ─────────────────────────────────── */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-charcoal text-cream md:flex">
        {/* Brand */}
        <div className="flex items-center gap-3 border-b border-cream/10 px-5 py-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-kraft text-white">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div>
            <p className="font-display text-sm font-extrabold tracking-wide">PACKORA</p>
            <p className="font-body text-[11px] uppercase tracking-widest text-kraft">Admin console</p>
          </div>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {GROUPS.map((g) => (
            <div key={g.title} className="mb-5">
              <p className="mb-2 px-3 font-display text-[10px] font-bold uppercase tracking-[0.15em] text-cream/35">
                {g.title}
              </p>
              <div className="space-y-0.5">
                {NAV.filter((n) => g.items.includes(n.label)).map(({ to, label, icon: Icon, end, badge }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 rounded-xl px-3 py-2.5 font-display text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-kraft text-white shadow-lg'
                          : 'text-cream/65 hover:bg-cream/10 hover:text-cream'
                      }`
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                    {badge === 'action' && (
                      <span className="ml-auto h-2 w-2 rounded-full bg-kraft" title="New enquiries" />
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User card */}
        <div className="border-t border-cream/10 p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-kraft font-display text-sm font-bold text-white">
              {(user?.first_name || user?.username || 'A')[0].toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-sm font-bold">{user?.first_name || user?.username}</p>
              <p className="truncate font-body text-[11px] text-cream/50">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg p-2 text-cream/50 transition-colors hover:bg-cream/10 hover:text-cream"
              title="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={() => navigate('/')}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-cream/15 py-2 font-display text-xs font-semibold text-cream/70 transition-colors hover:bg-cream/10"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> View storefront
          </button>
        </div>
      </aside>

      {/* ── Mobile top bar ──────────────────────────── */}
      <div className="fixed inset-x-0 top-0 z-40 flex items-center gap-2 overflow-x-auto border-b border-charcoal/10 bg-charcoal px-3 py-2 md:hidden">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 font-display text-xs font-semibold ${
                isActive ? 'bg-kraft text-white' : 'text-cream/60'
              }`
            }
          >
            <Icon className="h-3.5 w-3.5" /> {label}
          </NavLink>
        ))}
      </div>

      {/* ── Content ─────────────────────────────────── */}
      <main className="min-w-0 flex-1 px-4 pb-24 pt-16 sm:px-6 md:ml-64 md:px-8 md:pb-8 md:pt-8 lg:px-10">
        <Outlet />
      </main>
    </div>
  )
}
