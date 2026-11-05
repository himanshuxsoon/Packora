import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from 'lucide-react'
import { api } from '../services/api'
import ProductCard from '../components/ProductCard'
import Loading from '../components/Loading'
import Button from '../components/Button'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [count, setCount] = useState(0)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [showFilters, setShowFilters] = useState(false)

  const category = searchParams.get('category')
  const page = parseInt(searchParams.get('page') || '1', 10)
  const PAGE_SIZE = 12

  useEffect(() => {
    api.get('/categories/', { params: { page_size: 50 } })
      .then(({ data }) => setCategories(data.results || data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = { page, page_size: PAGE_SIZE }
    if (category) params.category = category
    if (searchParams.get('search')) params.search = searchParams.get('search')
    api
      .get('/products/', { params })
      .then(({ data }) => {
        setProducts(data.results || [])
        setCount(data.count ?? 0)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [category, page, searchParams])

  const updateParams = (mutate, { resetPage = true } = {}) => {
    const next = new URLSearchParams(searchParams)
    mutate(next)
    if (resetPage) next.delete('page')
    setSearchParams(next)
  }

  const setCategory = (slug) =>
    updateParams((p) => (slug ? p.set('category', slug) : p.delete('category')))

  const setPage = (n) =>
    updateParams((p) => (n > 1 ? p.set('page', n) : p.delete('page')), { resetPage: false })

  const onSearch = (e) => {
    e.preventDefault()
    updateParams((p) => {
      const q = search.trim()
      if (q) p.set('search', q)
      else p.delete('search')
    })
  }

  const totalPages = Math.ceil(count / PAGE_SIZE)
  const activeCategory = categories.find((c) => c.slug === category)

  const filterPanel = (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-charcoal/60">
          Categories
        </h3>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => setCategory(null)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 font-body text-sm transition-colors ${
                !category ? 'bg-charcoal font-semibold text-cream' : 'text-charcoal/70 hover:bg-cream'
              }`}
            >
              All products
              <span className="text-xs opacity-60">{count}</span>
            </button>
          </li>
          {categories.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => setCategory(c.slug)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 font-body text-sm transition-colors ${
                  category === c.slug ? 'bg-charcoal font-semibold text-cream' : 'text-charcoal/70 hover:bg-cream'
                }`}
              >
                {c.name}
                <span className="text-xs opacity-60">{c.product_count ?? ''}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header + search */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">
            {activeCategory ? activeCategory.name : 'All products'}
          </h1>
          <p className="mt-1 font-body text-sm text-charcoal/60">{count} items</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </Button>
          <form onSubmit={onSearch} className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal/40" />
            <input
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-charcoal/15 bg-white py-2.5 pl-10 pr-9 font-body text-sm outline-none transition-colors focus:border-kraft focus:ring-2 focus:ring-kraft/20"
            />
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(''); updateParams((p) => p.delete('search')) }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-charcoal"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </form>
        </div>
      </div>

      <div className="flex gap-10">
        {/* Sidebar — desktop */}
        <aside className="hidden w-56 shrink-0 lg:block">{filterPanel}</aside>

        {/* Mobile filter drawer */}
        {showFilters && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-charcoal/40" onClick={() => setShowFilters(false)} />
            <aside className="absolute left-0 top-0 h-full w-72 overflow-y-auto bg-ivory p-6 shadow-lift">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-lg font-bold">Filters</h3>
                <button onClick={() => setShowFilters(false)}><X className="h-5 w-5" /></button>
              </div>
              {filterPanel}
            </aside>
          </div>
        )}

        {/* Grid */}
        <div className="min-w-0 flex-1">
          {loading ? (
            <Loading />
          ) : products.length ? (
            <>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                    <ChevronLeft className="h-4 w-4" /> Prev
                  </Button>
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const n = i + 1
                    if (totalPages > 7 && Math.abs(n - page) > 2 && n !== 1 && n !== totalPages) {
                      if (n === 2 || n === totalPages - 1) return <span key={n} className="px-1 text-charcoal/40">…</span>
                      return null
                    }
                    return (
                      <button
                        key={n}
                        onClick={() => setPage(n)}
                        className={`h-9 w-9 rounded-full font-display text-sm font-semibold transition-colors ${
                          n === page ? 'bg-charcoal text-cream' : 'text-charcoal/70 hover:bg-cream'
                        }`}
                      >
                        {n}
                      </button>
                    )
                  })}
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                    Next <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-charcoal/15 bg-white/60 py-20 text-center">
              <p className="font-display text-lg font-semibold text-charcoal/60">No products found</p>
              <p className="mt-1 font-body text-sm text-charcoal/40">Try a different search or category.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
