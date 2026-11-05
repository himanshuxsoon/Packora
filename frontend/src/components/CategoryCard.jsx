import { Link } from 'react-router-dom'
import { ArrowRight, Package } from 'lucide-react'

export default function CategoryCard({ category }) {
  return (
    <Link
      to={`/products?category=${category.slug}`}
      className="group relative flex flex-col justify-end overflow-hidden rounded-2xl bg-charcoal p-6 text-cream transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
    >
      {category.image ? (
        <img
          src={category.image}
          alt={category.name}
          className="absolute inset-0 h-full w-full object-cover opacity-30 transition-opacity duration-500 group-hover:opacity-40"
        />
      ) : null}
      <div className="relative flex items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-kraft/20 text-kraft">
            <Package className="h-5 w-5" />
          </div>
          <h3 className="font-display text-xl font-bold">{category.name}</h3>
          <p className="mt-1 font-body text-sm text-cream/70">
            {category.product_count ?? 0} products
          </p>
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cream/20 transition-all duration-300 group-hover:border-kraft group-hover:bg-kraft">
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  )
}
