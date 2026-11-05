import { Link } from 'react-router-dom'
import ProductVisual from './ProductVisual'

export default function ProductCard({ product }) {
  return (
    <Link
      to={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-charcoal/8 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-cream">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <ProductVisual
            seed={product.id}
            className="h-full w-full transition-transform duration-500 group-hover:scale-105"
          />
        )}
        {product.is_featured && (
          <span className="absolute left-3 top-3 rounded-full bg-charcoal px-3 py-1 font-display text-[11px] font-bold uppercase tracking-wider text-cream">
            Featured
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="font-body text-xs font-medium uppercase tracking-wider text-olive">
          {product.category_name}
        </p>
        <h3 className="font-display text-base font-bold leading-snug text-charcoal line-clamp-2">
          {product.name}
        </h3>
        <p className="font-body text-xs text-charcoal/60">
          {product.material || product.dimensions}
        </p>
        <div className="mt-auto flex items-end justify-between pt-3">
          <div>
            <p className="font-display text-lg font-extrabold text-charcoal">
              ₹{product.price}
            </p>
            <p className="font-body text-xs text-charcoal/50">
              / {product.unit} · MOQ {product.min_order_quantity}
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}
