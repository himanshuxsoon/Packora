import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, BadgeCheck, ChefHat, Factory, Leaf, MessageSquareQuote,
  Package, PenTool, Recycle, Ruler, Shirt, ShoppingBag, Sparkles,
  Star, Truck, UtensilsCrossed,
} from 'lucide-react'
import { api } from '../services/api'
import CategoryCard from '../components/CategoryCard'
import ProductCard from '../components/ProductCard'
import Loading from '../components/Loading'
import Button from '../components/Button'

const WHY_US = [
  { icon: PenTool, title: 'Fully customisable', text: 'Sizes, materials, prints and finishes — your packaging, your rules.' },
  { icon: BadgeCheck, title: 'Premium materials', text: 'Food-grade, recyclable and export-quality substrates, verified every batch.' },
  { icon: Truck, title: 'Pan-India delivery', text: 'Warehoused in Mumbai with tracked logistics to 27,000+ pin codes.' },
  { icon: Leaf, title: 'Sustainable options', text: 'Kraft, corrugated and biodegradable alternatives that still look luxury.' },
]

const STEPS = [
  { n: '01', title: 'Tell us your need', text: 'Share dimensions, quantity and artwork via a quick enquiry.' },
  { n: '02', title: 'Get a quote', text: 'Our team replies with pricing, samples and a production timeline.' },
  { n: '03', title: 'Approve & produce', text: 'Digital proofs, then precision manufacturing with QC checks.' },
  { n: '04', title: 'Delivered', text: 'Packed, shipped and tracked straight to your door or warehouse.' },
]

const INDUSTRIES = [
  { icon: ShoppingBag, name: 'E-commerce' },
  { icon: UtensilsCrossed, name: 'Food & Beverage' },
  { icon: ChefHat, name: 'Bakery & Desserts' },
  { icon: Shirt, name: 'Fashion & Apparel' },
  { icon: Package, name: 'Retail' },
  { icon: Factory, name: 'Industrial' },
]

const TESTIMONIALS = [
  {
    quote: 'PACKORA redesigned our unboxing experience — our repeat purchase rate jumped 22% in one quarter.',
    name: 'Ananya Sharma',
    role: 'Founder, Drape & Co.',
  },
  {
    quote: 'From dieline to doorstep in 12 days. The print quality on our rigid boxes is honestly unreal.',
    name: 'Rohan Mehta',
    role: 'Head of Operations, BrewBox',
  },
  {
    quote: 'They switched us to recyclable mailers without any compromise on strength. Our customers noticed.',
    name: 'Priya Nair',
    role: 'CEO, Wildroot Skincare',
  },
]

export default function HomePage() {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/categories/'),
      api.get('/products/', { params: { is_featured: 'true', page_size: 8 } }),
    ])
      .then(([catRes, prodRes]) => {
        setCategories(catRes.data.results || catRes.data)
        setProducts(prodRes.data.results || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-charcoal text-cream">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-kraft/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-olive/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-28">
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-kraft/40 bg-kraft/10 px-4 py-1.5 font-display text-xs font-bold uppercase tracking-widest text-kraft">
              <Sparkles className="h-3.5 w-3.5" /> Custom packaging, engineered
            </p>
            <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Packaging that makes your brand <span className="text-kraft">unforgettable</span>
            </h1>
            <p className="mt-6 max-w-xl font-body text-lg leading-relaxed text-cream/70">
              Corrugated boxes, rigid boxes, mailers and labels — designed,
              printed and delivered across India.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/enquire">
                <Button size="lg">Request a quote <ArrowRight className="h-4 w-4" /></Button>
              </Link>
              <Link to="/products">
                <Button size="lg" variant="outline" className="border-cream/30 text-cream hover:bg-cream/10">
                  Browse products
                </Button>
              </Link>
            </div>
            <dl className="mt-12 flex gap-10 border-t border-cream/10 pt-8">
              {[['500+', 'Brands served'], ['12k+', 'Orders shipped'], ['27k+', 'Pin codes']].map(([v, l]) => (
                <div key={l}>
                  <dt className="font-display text-2xl font-extrabold text-kraft">{v}</dt>
                  <dd className="mt-1 font-body text-xs text-cream/60">{l}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Hero visual — layered kraft panels */}
          <div className="relative hidden lg:block" aria-hidden="true">
            <div className="absolute -left-6 top-10 h-72 w-56 rotate-[-6deg] rounded-2xl bg-kraft/80 shadow-lift" />
            <div className="absolute right-0 top-0 h-80 w-64 rotate-[4deg] rounded-2xl bg-olive shadow-lift" />
            <div className="relative ml-16 mt-16 h-80 w-64 -rotate-2 rounded-2xl bg-cream p-6 text-charcoal shadow-lift">
              <div className="flex h-full flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="font-display text-sm font-extrabold tracking-widest">PACKORA</span>
                  <Recycle className="h-5 w-5 text-olive" />
                </div>
                <div>
                  <p className="font-display text-2xl font-extrabold leading-tight">
                    The unboxing<br />is the product.
                  </p>
                  <div className="mt-4 h-1.5 w-16 rounded-full bg-kraft" />
                </div>
                <p className="font-body text-xs text-charcoal/50">est. 2021 · Mumbai</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHead eyebrow="Catalog" title="Shop by category" link="/products" />
        {loading ? <Loading /> : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.slice(0, 8).map((c) => <CategoryCard key={c.id} category={c} />)}
          </div>
        )}
      </section>

      {/* ── Why choose us ────────────────────────────────── */}
      <section className="border-y border-charcoal/8 bg-cream/60">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionHead eyebrow="Why PACKORA" title="Built for brands that sweat the details" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_US.map(({ icon: Icon, title, text }) => (
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

      {/* ── How it works ─────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHead eyebrow="Process" title="From brief to box in four steps" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ n, title, text }) => (
            <div key={n} className="relative rounded-2xl border border-charcoal/8 bg-white p-6">
              <span className="font-display text-4xl font-extrabold text-kraft/30">{n}</span>
              <h3 className="mt-3 font-display text-base font-bold">{title}</h3>
              <p className="mt-2 font-body text-sm leading-relaxed text-charcoal/60">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured products ────────────────────────────── */}
      <section className="border-t border-charcoal/8 bg-cream/60">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionHead eyebrow="Bestsellers" title="Featured products" link="/products" />
          {loading ? <Loading /> : products.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <p className="font-body text-charcoal/60">Featured products coming soon.</p>
          )}
        </div>
      </section>

      {/* ── Industries ───────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHead eyebrow="Who we serve" title="Industries we serve" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {INDUSTRIES.map(({ icon: Icon, name }) => (
            <div key={name} className="flex flex-col items-center gap-3 rounded-2xl border border-charcoal/8 bg-white px-4 py-8 text-center transition-colors hover:border-kraft/50">
              <Icon className="h-7 w-7 text-kraft" strokeWidth={1.5} />
              <span className="font-display text-sm font-bold">{name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────── */}
      <section className="bg-charcoal py-20 text-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHead eyebrow="Kind words" title="Loved by brands" dark />
          <div className="grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} className="flex flex-col rounded-2xl border border-cream/10 bg-white/5 p-7">
                <div className="mb-4 flex gap-1 text-kraft">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                </div>
                <blockquote className="flex-1 font-body text-sm leading-relaxed text-cream/80">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-6 border-t border-cream/10 pt-4">
                  <p className="font-display text-sm font-bold">{t.name}</p>
                  <p className="font-body text-xs text-cream/50">{t.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-kraft px-8 py-14 text-center text-white sm:px-14">
          <Ruler className="pointer-events-none absolute -left-8 -top-8 h-40 w-40 text-white/10" strokeWidth={1} />
          <MessageSquareQuote className="pointer-events-none absolute -bottom-8 -right-8 h-40 w-40 text-white/10" strokeWidth={1} />
          <h2 className="mx-auto max-w-xl font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Ready to elevate your packaging?
          </h2>
          <p className="mx-auto mt-4 max-w-md font-body text-white/85">
            Tell us what you're shipping. We'll handle the rest — design, print, deliver.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/enquire">
              <Button size="lg" variant="primary" className="bg-charcoal hover:bg-charcoal/90">
                Start your project <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/10">
                Talk to us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function SectionHead({ eyebrow, title, link, dark = false }) {
  return (
    <div className="mb-10 flex items-end justify-between gap-4">
      <div>
        <p className={`font-display text-xs font-bold uppercase tracking-widest ${dark ? 'text-kraft' : 'text-kraft'}`}>
          {eyebrow}
        </p>
        <h2 className={`mt-1 font-display text-3xl font-extrabold tracking-tight ${dark ? 'text-cream' : ''}`}>
          {title}
        </h2>
      </div>
      {link && (
        <Link to={link} className={`hidden items-center gap-1 font-display text-sm font-semibold hover:underline sm:flex ${dark ? 'text-cream/70' : 'text-charcoal/70'}`}>
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  )
}
