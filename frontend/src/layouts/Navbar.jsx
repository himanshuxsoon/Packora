import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, Package, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Button from '../components/Button'

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Products' },
  { to: '/enquire', label: 'Get a Quote' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    setOpen(false)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-charcoal/8 bg-ivory/85 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-charcoal text-cream">
            <Package className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-extrabold tracking-tight text-charcoal">
            PACKORA
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `font-display text-sm font-semibold transition-colors ${
                  isActive ? 'text-kraft' : 'text-charcoal/70 hover:text-charcoal'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate(isAdmin ? '/admin' : '/dashboard')}>
                {isAdmin ? 'Admin' : 'Dashboard'}
              </Button>
              <span className="font-body text-sm text-charcoal/70">
                Hi, {user.first_name || user.username}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                Log in
              </Button>
              <Button size="sm" onClick={() => navigate('/register')}>
                Get started
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="rounded-lg p-2 text-charcoal md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-charcoal/8 bg-ivory px-4 pb-6 pt-4 md:hidden">
          <div className="flex flex-col gap-1">
            {LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 font-display text-base font-semibold text-charcoal hover:bg-cream"
              >
                {label}
              </NavLink>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-charcoal/8 pt-4">
              {isAuthenticated ? (
                <>
                  <Button variant="outline" onClick={() => { setOpen(false); navigate(isAdmin ? '/admin' : '/dashboard') }}>
                    {isAdmin ? 'Admin Dashboard' : 'My Dashboard'}
                  </Button>
                  <Button variant="outline" onClick={handleLogout}>
                    Log out ({user.username})
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={() => { setOpen(false); navigate('/login') }}>
                    Log in
                  </Button>
                  <Button variant="outline" onClick={() => { setOpen(false); navigate('/register') }}>
                    Create account
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
