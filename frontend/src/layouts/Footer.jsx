import { Link } from 'react-router-dom'
import { AtSign, Globe, Mail, MapPin, Package, Phone } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="mt-auto bg-charcoal text-cream">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-kraft text-white">
              <Package className="h-5 w-5" />
            </span>
            <span className="font-display text-xl font-extrabold">PACKORA</span>
          </div>
          <p className="mt-4 max-w-xs font-body text-sm leading-relaxed text-cream/60">
            Custom packaging engineered for brands that care about the
            unboxing. Boxes, mailers, labels — made in India.
          </p>
        </div>

        <div>
          <h4 className="font-display text-sm font-bold uppercase tracking-wider text-kraft">
            Explore
          </h4>
          <ul className="mt-4 space-y-2.5 font-body text-sm text-cream/70">
            <li><Link to="/products" className="hover:text-cream">Products</Link></li>
            <li><Link to="/enquire" className="hover:text-cream">Request a quote</Link></li>
            <li><Link to="/orders" className="hover:text-cream">Track order</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-bold uppercase tracking-wider text-kraft">
            Company
          </h4>
          <ul className="mt-4 space-y-2.5 font-body text-sm text-cream/70">
            <li><Link to="/about" className="hover:text-cream">About us</Link></li>
            <li><Link to="/contact" className="hover:text-cream">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-bold uppercase tracking-wider text-kraft">
            Reach us
          </h4>
          <ul className="mt-4 space-y-3 font-body text-sm text-cream/70">
            <li className="flex items-center gap-2.5"><Mail className="h-4 w-4 text-kraft" /> hello@packora.in</li>
            <li className="flex items-center gap-2.5"><Phone className="h-4 w-4 text-kraft" /> +91 98765 43210</li>
            <li className="flex items-start gap-2.5"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-kraft" /> Andheri East, Mumbai 400069</li>
          </ul>
          <div className="mt-5 flex gap-3">
            {[AtSign, Globe].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-cream/20 text-cream/70 transition-colors hover:border-kraft hover:text-kraft"
                aria-label="Social link"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-cream/10 py-5 text-center font-body text-xs text-cream/50">
        © {new Date().getFullYear()} PACKORA. All rights reserved.
      </div>
    </footer>
  )
}
