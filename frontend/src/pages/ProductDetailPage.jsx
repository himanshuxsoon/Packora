import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft, ChevronRight, MessageSquareQuote, Minus, Package, Plus,
} from 'lucide-react'
import { api } from '../services/api'
import ProductVisual from '../components/ProductVisual'
import Loading from '../components/Loading'
import Button from '../components/Button'
import { formatINR } from '../utils/format'

export default function ProductDetailPage() {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [activeImg, setActiveImg] = useState(0)

  useEffect(() => {
    setLoading(true)
    api
      .get(`/products/${slug}/`)
      .then(({ data }) => {
        setProduct(data)
        setQty(Math.max(1, data.min_order_quantity))
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <Loading className="py-32" />
  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-32 text-center">
        <h1 className="font-display text-2xl font-bold">Product not found</h1>
        <Link to="/products" className="mt-4 inline-block font-display text-sm font-semibold text-kraft hover:underline">
          ← Back to catalogue
        </Link>
      </div>
    )
  }

  const images = product.images?.length ? product.images : [null]
  const enquireUrl = `/enquire?product=${product.slug}&qty=${qty}`

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-1.5 font-body text-sm text-charcoal/50">
        <Link to="/" className="hover:text-charcoal">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to="/products" className="hover:text-charcoal">Products</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-charcoal">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-charcoal/8 bg-cream">
            {images[activeImg]?.image ? (
              <img src={images[activeImg].image} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <ProductVisual seed={product.id} className="h-full w-full" />
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`h-20 w-24 overflow-hidden rounded-lg border-2 transition-colors ${
                    i === activeImg ? 'border-kraft' : 'border-transparent'
                  }`}
                >
                  {img?.image ? (
                    <img src={img.image} className="h-full w-full object-cover" alt="" />
                  ) : (
                    <ProductVisual seed={product.id + i + 1} className="h-full w-full" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="font-display text-xs font-bold uppercase tracking-widest text-kraft">
            {product.category_name}
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            {product.name}
          </h1>
          {product.is_featured && (
            <span className="mt-3 inline-block rounded-full bg-kraft/15 px-3 py-1 font-display text-xs font-bold uppercase tracking-wider text-kraft">
              Featured
            </span>
          )}

          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-display text-4xl font-extrabold">{formatINR(product.price)}</span>
            <span className="font-body text-sm text-charcoal/50">per {product.unit}</span>
          </div>
          <p className="mt-1 font-body text-sm text-charcoal/50">
            Minimum order: {product.min_order_quantity} {product.unit}
          </p>

          {product.description && (
            <p className="mt-6 font-body leading-relaxed text-charcoal/70">{product.description}</p>
          )}

          {/* Specs */}
          <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-charcoal/10 bg-charcoal/10">
            {[
              ['Material', product.material],
              ['Dimensions', product.dimensions],
              ['Unit', product.unit],
              ['MOQ', `${product.min_order_quantity} ${product.unit}`],
            ].map(([k, v]) => (
              <div key={k} className="bg-white px-4 py-3">
                <dt className="font-body text-xs uppercase tracking-wider text-charcoal/45">{k}</dt>
                <dd className="mt-0.5 font-display text-sm font-bold capitalize">{v || '—'}</dd>
              </div>
            ))}
          </dl>

          {/* Quantity + CTA */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="flex items-center rounded-full border border-charcoal/15">
              <button
                onClick={() => setQty((q) => Math.max(product.min_order_quantity, q - 1))}
                className="p-3 text-charcoal/60 hover:text-charcoal"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-16 text-center font-display text-sm font-bold">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="p-3 text-charcoal/60 hover:text-charcoal"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <span className="font-display text-sm font-semibold text-charcoal/70">
              Est. {formatINR(qty * product.price)}
            </span>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to={enquireUrl} className="flex-1 sm:flex-none">
              <Button size="lg" className="w-full sm:w-auto">
                <MessageSquareQuote className="h-4 w-4" /> Request this item
              </Button>
            </Link>
            <Link to="/products">
              <Button size="lg" variant="outline">
                <ArrowLeft className="h-4 w-4" /> More products
              </Button>
            </Link>
          </div>
          <p className="mt-4 flex items-center gap-2 font-body text-xs text-charcoal/45">
            <Package className="h-3.5 w-3.5" /> Custom sizes, prints and finishes available —
            <Link to="/enquire" className="font-semibold text-kraft hover:underline">enquire for a custom quote</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
