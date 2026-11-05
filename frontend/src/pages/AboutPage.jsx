import { Link } from 'react-router-dom'
import { Award, Factory, Leaf, Users } from 'lucide-react'
import Button from '../components/Button'

const VALUES = [
  { icon: Award, title: 'Craft over volume', text: 'Every batch is inspected by hand. If a print is even slightly off, it does not ship.' },
  { icon: Users, title: 'A partner, not a vendor', text: 'We assign you a dedicated account manager from first enquiry to final delivery.' },
  { icon: Leaf, title: 'Responsible by default', text: 'Recyclable substrates, water-based inks and minimal-waste production workflows.' },
  { icon: Factory, title: 'Made in India', text: 'Partner facilities across Maharashtra, Gujarat and Tamil Nadu keep costs honest.' },
]

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-charcoal text-cream">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <p className="font-display text-xs font-bold uppercase tracking-widest text-kraft">About us</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            We believe the box is the first product your customer touches.
          </h1>
          <p className="mt-6 max-w-2xl font-body text-lg leading-relaxed text-cream/70">
            PACKORA started in a small print shop in Andheri, Mumbai in 2021 with one
            corrugation machine and a stubborn belief: packaging should feel as
            considered as the product inside it.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight">Five years of unboxings</h2>
            <div className="mt-5 space-y-4 font-body leading-relaxed text-charcoal/70">
              <p>
                What began as custom corrugated boxes for local bakeries grew into a
                full-service packaging studio serving e-commerce brands, fashion
                labels, food businesses and corporates across India.
              </p>
              <p>
                Today we handle everything in-house — structural design, printing,
                lamination, foil stamping and quality control — so your brand gets a
                consistent experience from dieline to doorstep.
              </p>
              <p>
                We still take on small first orders, because the brands we love
                most often start small.
              </p>
            </div>
            <Link to="/enquire" className="mt-7 inline-block">
              <Button>Start a project <span className="ml-1">→</span></Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[['500+', 'Brands'], ['1.2M', 'Units shipped'], ['98%', 'On-time rate'], ['4.9★', 'Client rating']].map(([v, l]) => (
              <div key={l} className="rounded-2xl border border-charcoal/8 bg-white p-8 text-center shadow-card">
                <p className="font-display text-3xl font-extrabold text-kraft">{v}</p>
                <p className="mt-1 font-body text-sm text-charcoal/60">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="border-t border-charcoal/8 bg-cream/60">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-extrabold tracking-tight">What we stand for</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-charcoal/8 bg-white p-6 shadow-card">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-kraft/15 text-kraft">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-base font-bold">{title}</h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-charcoal/60">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
